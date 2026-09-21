"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Info,
    Lightbulb,
} from "lucide-react";

import { calculateImpact } from "@/lib/impactScore";
import { listPrograms } from "@/lib/services/sdgPrograms";
import type {
    RiskLevel,
    SdgProgram,
    SustainabilityLevel,
} from "@/lib/types/sdgProgram";

const riskLabel: Record<RiskLevel, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
};

const riskStyle: Record<RiskLevel, string> = {
    low: "bg-[#D1FAE5] text-[#065F46]",
    medium: "bg-[#FEF3C7] text-[#92400E]",
    high: "bg-[#FEE2E2] text-[#991B1B]",
};

const sustainabilityLabel: Record<SustainabilityLevel, string> = {
    none: "Tidak ada tindak lanjut",
    planned: "Ada rencana lanjutan",
    continued: "Dilanjutkan",
    replicated: "Direplikasi",
};

function convertFlagToRecommendation(flag: string): string {
    const normalized = flag.toLowerCase();

    if (
        normalized.includes(
            "belum terisi: realisasi penerima manfaat",
        )
    ) {
        return "Lengkapi realisasi penerima manfaat agar capaian dapat dibandingkan dengan target.";
    }

    if (normalized.includes("belum terisi: daftar indikator")) {
        return "Tambahkan indikator keberhasilan yang spesifik dan terukur.";
    }

    if (
        normalized.includes(
            "belum terisi: realisasi seluruh indikator",
        )
    ) {
        return "Lengkapi nilai realisasi pada seluruh indikator program.";
    }

    if (normalized.includes("belum terisi: bukti pendukung")) {
        return "Tambahkan bukti pendukung untuk memperkuat validitas capaian program.";
    }

    if (
        normalized.includes(
            "belum terisi: target sdgs spesifik",
        )
    ) {
        return "Petakan program ke target SDGs yang lebih spesifik.";
    }

    if (
        normalized.includes(
            "capaian yang dilaporkan tinggi, tetapi bukti pendukung belum memadai",
        )
    ) {
        return "Perkuat bukti pendukung agar sebanding dengan capaian yang dilaporkan.";
    }

    if (
        normalized.includes(
            "program belum dipetakan ke target sdgs yang spesifik dan konsisten",
        )
    ) {
        return "Perbaiki pemetaan target SDGs agar konsisten dengan goal program.";
    }

    return flag;
}

function getNextPlan(program: SdgProgram) {
    const result = calculateImpact(program);

    const sustainabilityStrong =
        program.sustainability === "continued" ||
        program.sustainability === "replicated";

    /*
     * Data evaluasi belum cukup.
     */
    if (result.riskBreakdown.dataCompleteness >= 0.4) {
        return {
            label: "Lengkapi Evaluasi",
            description:
                "Lengkapi data capaian, indikator, bukti pendukung, dan pemetaan SDGs sebelum menetapkan arah pengembangan program.",
            style: "bg-[#FEF3C7] text-[#92400E]",
        };
    }

    /*
     * Dampak baik + risiko rendah + sustainability kuat.
     */
    if (
        result.impactScore >= 75 &&
        result.riskLevel === "low" &&
        sustainabilityStrong
    ) {
        return {
            label: "Pengembangan / Replikasi",
            description:
                "Program menunjukkan dampak yang baik dan berkelanjutan. Pertimbangkan perluasan cakupan atau replikasi praktik baik pada organisasi atau kelompok sasaran lain.",
            style: "bg-[#D1FAE5] text-[#065F46]",
        };
    }

    /*
     * Dampak baik, tetapi sustainability belum kuat.
     */
    if (result.impactScore >= 75 && !sustainabilityStrong) {
        return {
            label: "Penguatan Keberlanjutan",
            description:
                "Program memiliki dampak yang baik, tetapi keberlanjutannya perlu diperkuat sebelum dilakukan perluasan atau replikasi.",
            style: "bg-[#DBEAFE] text-[#1E40AF]",
        };
    }

    /*
     * Dampak baik tetapi risiko masih tinggi.
     */
    if (result.impactScore >= 75) {
        return {
            label: "Penguatan Akuntabilitas",
            description:
                "Dampak program sudah baik, tetapi bukti, validasi data, atau dokumentasi capaian masih perlu diperkuat.",
            style: "bg-[#DBEAFE] text-[#1E40AF]",
        };
    }

    /*
     * Dampak rendah dan risiko tinggi.
     */
    if (
        result.impactScore < 50 &&
        result.riskLevel === "high"
    ) {
        return {
            label: "Evaluasi Ulang",
            description:
                "Program memerlukan evaluasi terhadap desain, target, indikator, dan pelaksanaannya sebelum dilanjutkan ke periode berikutnya.",
            style: "bg-[#FEE2E2] text-[#991B1B]",
        };
    }

    return {
        label: "Perbaikan Program",
        description:
            "Program dapat dilanjutkan dengan penyempurnaan indikator, strategi pelaksanaan, bukti pendukung, dan pencapaian target.",
        style: "bg-[#F3E8FF] text-[#6B21A8]",
    };
}

export default function ImprovementsPage() {
    const [programs, setPrograms] = useState<SdgProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setPrograms(await listPrograms());
            } catch {
                setError(
                    "Data program tidak dapat dimuat. Periksa koneksi lalu coba kembali.",
                );
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, []);

    const recommendations = useMemo(() => {
        return programs
            .filter((program) => program.status !== "draft")
            .map((program) => {
                const result = calculateImpact(program);

                return {
                    program,
                    result,
                    improvements: [
                        ...new Set(
                            result.flags.map(convertFlagToRecommendation),
                        ),
                    ],
                    nextPlan: getNextPlan(program),
                };
            })
            .sort((a, b) => {
                const riskPriority: Record<RiskLevel, number> = {
                    high: 3,
                    medium: 2,
                    low: 1,
                };

                const riskDiff =
                    riskPriority[b.result.riskLevel] -
                    riskPriority[a.result.riskLevel];

                if (riskDiff !== 0) {
                    return riskDiff;
                }

                return a.result.impactScore - b.result.impactScore;
            });
    }, [programs]);

    return (
        <div className="space-y-6">
            <header>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#12A594] transition hover:text-[#0C8377]"
                >
                    <ArrowLeft size={14} />
                    Kembali ke Dashboard
                </Link>

                <div className="mt-3">
                    <h1 className="text-xl font-semibold text-[var(--sara-text-primary)]">
                        Improvement Recommendations
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-[var(--sara-text-secondary)]">
                        Rekomendasi perbaikan dan rencana tindak lanjut
                        berdasarkan hasil Impact Assessment setiap program.
                    </p>
                </div>
            </header>

            {error && (
                <div className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-56 animate-pulse rounded-2xl bg-[var(--sara-muted-card)]"
                        />
                    ))}
                </div>
            ) : recommendations.length === 0 ? (
                <div className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-10 text-center">
                    <Info
                        size={26}
                        className="mx-auto mb-3 text-[var(--sara-text-secondary)] opacity-50"
                    />

                    <p className="text-sm font-medium text-[var(--sara-text-primary)]">
                        Belum ada program yang dapat dievaluasi.
                    </p>

                    <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
                        Selesaikan Impact Assessment terlebih dahulu.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {recommendations.map(
                        ({
                            program,
                            result,
                            improvements,
                            nextPlan,
                        }) => (
                            <article
                                key={program.id}
                                className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-6"
                                style={{
                                    boxShadow: "var(--sara-shadow-card)",
                                }}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">
                                            {program.programName}
                                        </h2>

                                        <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
                                            {program.organization}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${nextPlan.style}`}
                                    >
                                        {nextPlan.label}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <div className="rounded-lg bg-[var(--sara-muted-card)] px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-[var(--sara-text-secondary)]">
                                            Impact Score
                                        </p>

                                        <p className="mt-0.5 text-sm font-semibold text-[var(--sara-text-primary)]">
                                            {result.impactScore}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-[var(--sara-muted-card)] px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-[var(--sara-text-secondary)]">
                                            Risk
                                        </p>

                                        <span
                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskStyle[result.riskLevel]}`}
                                        >
                                            {riskLabel[result.riskLevel]}
                                        </span>
                                    </div>

                                    <div className="rounded-lg bg-[var(--sara-muted-card)] px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-wide text-[var(--sara-text-secondary)]">
                                            Sustainability
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-[var(--sara-text-primary)]">
                                            {sustainabilityLabel[program.sustainability]}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle
                                                size={15}
                                                className="text-[#B45309]"
                                            />

                                            <h3 className="text-sm font-semibold text-[var(--sara-text-primary)]">
                                                Saran Perbaikan
                                            </h3>
                                        </div>

                                        {improvements.length > 0 ? (
                                            <ul className="mt-3 space-y-2">
                                                {improvements.map(
                                                    (improvement, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-start gap-2 text-xs leading-relaxed text-[var(--sara-text-secondary)]"
                                                        >
                                                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#B45309]" />

                                                            <span>{improvement}</span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="mt-3 flex items-start gap-2 text-xs text-[#0C8377]">
                                                <CheckCircle2
                                                    size={14}
                                                    className="mt-0.5 shrink-0"
                                                />

                                                Tidak ada isu utama yang perlu diperbaiki.
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-xl bg-[var(--sara-muted-card)] p-4">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb
                                                size={15}
                                                className="text-[#12A594]"
                                            />

                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12A594]">
                                                Next Plan
                                            </p>
                                        </div>

                                        <h3 className="mt-3 text-sm font-semibold text-[var(--sara-text-primary)]">
                                            {nextPlan.label}
                                        </h3>

                                        <p className="mt-2 text-xs leading-relaxed text-[var(--sara-text-secondary)]">
                                            {nextPlan.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-[var(--sara-border)] pt-4">
                                    <Link
                                        href={`/impact-assessment/${program.id}`}
                                        className="text-xs font-medium text-[#12A594] hover:text-[#0C8377]"
                                    >
                                        Lihat Impact Assessment →
                                    </Link>
                                </div>
                            </article>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}