import { calculateImpact } from "@/lib/impactScore";
import type {
    RiskLevel,
    SdgProgram,
    SustainabilityLevel,
} from "@/lib/types/sdgProgram";

export type NextPlanType =
    | "complete-assessment"
    | "develop-replicate"
    | "strengthen"
    | "improve"
    | "reevaluate";

export interface NextPlan {
    type: NextPlanType;
    label: string;
    description: string;
}

export interface ProgramRecommendation {
    programId: string;
    programName: string;
    organization: string;

    impactScore: number;
    riskLevel: RiskLevel;
    sustainability: SustainabilityLevel;

    improvements: string[];
    nextPlan: NextPlan;
}

/**
 * Mengubah flag teknis dari calculateImpact()
 * menjadi kalimat saran perbaikan yang actionable.
 */
function flagToImprovement(flag: string): string {
    const normalized = flag.toLowerCase();

    if (normalized.includes("belum terisi: realisasi penerima manfaat")) {
        return "Lengkapi realisasi penerima manfaat agar capaian program dapat dibandingkan dengan target.";
    }

    if (normalized.includes("belum terisi: daftar indikator")) {
        return "Tambahkan indikator keberhasilan yang spesifik dan terukur.";
    }

    if (normalized.includes("belum terisi: realisasi seluruh indikator")) {
        return "Lengkapi nilai realisasi pada seluruh indikator yang sudah ditetapkan.";
    }

    if (normalized.includes("belum terisi: bukti pendukung")) {
        return "Tambahkan bukti pendukung untuk memperkuat validitas capaian program.";
    }

    if (normalized.includes("belum terisi: target sdgs spesifik")) {
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
        return "Perbaiki pemetaan program agar target SDGs konsisten dengan goal utama maupun goal pendukung.";
    }

    if (
        normalized.includes("jauh melampaui target") &&
        normalized.includes("periksa kembali")
    ) {
        return flag;
    }

    return flag;
}

/**
 * Menghasilkan daftar saran perbaikan untuk satu program.
 *
 * Sumber tetap berasal dari flags milik calculateImpact(),
 * jadi tidak membuat mesin scoring kedua.
 */
export function generateImprovementRecommendations(
    program: SdgProgram,
): string[] {
    const result = calculateImpact(program);

    const improvements = result.flags.map(flagToImprovement);

    // Hilangkan kemungkinan rekomendasi duplikat.
    return [...new Set(improvements)];
}

/**
 * Menentukan arah tindak lanjut program.
 *
 * Urutan keputusan:
 * 1. Kelengkapan evaluasi
 * 2. Dampak
 * 3. Risiko akuntabilitas
 * 4. Keberlanjutan
 */
export function generateNextPlan(program: SdgProgram): NextPlan {
    const result = calculateImpact(program);

    const impactScore = result.impactScore;
    const riskLevel = result.riskLevel;

    const sustainabilityIsStrong =
        program.sustainability === "continued" ||
        program.sustainability === "replicated";

    /**
     * DATA BELUM CUKUP
     *
     * Jika >= 40% data kunci belum lengkap,
     * jangan memberikan keputusan strategis terhadap program dulu.
     */
    if (result.riskBreakdown.dataCompleteness >= 0.4) {
        return {
            type: "complete-assessment",
            label: "Lengkapi Evaluasi",
            description:
                "Lengkapi data capaian, indikator, bukti pendukung, dan pemetaan SDGs sebelum menetapkan arah pengembangan program.",
        };
    }

    /**
     * DAMPAK TINGGI + RISIKO RENDAH + BERKELANJUTAN
     */
    if (
        impactScore >= 75 &&
        riskLevel === "low" &&
        sustainabilityIsStrong
    ) {
        if (program.sustainability === "replicated") {
            return {
                type: "develop-replicate",
                label: "Pengembangan / Replikasi",
                description:
                    "Program menunjukkan dampak yang baik, risiko rendah, dan telah direplikasi. Dokumentasikan praktik baik dan pertimbangkan perluasan cakupan.",
            };
        }

        return {
            type: "develop-replicate",
            label: "Pengembangan / Replikasi",
            description:
                "Program menunjukkan dampak yang baik dan berkelanjutan. Pertimbangkan perluasan cakupan atau replikasi praktik baik pada organisasi atau kelompok sasaran lain.",
        };
    }

    /**
     * DAMPAK TINGGI TAPI BELUM KUAT DARI SISI
     * KEBERLANJUTAN / AKUNTABILITAS
     */
    if (impactScore >= 75) {
        if (!sustainabilityIsStrong) {
            return {
                type: "strengthen",
                label: "Penguatan Keberlanjutan",
                description:
                    "Dampak program sudah baik, tetapi keberlanjutannya perlu diperkuat sebelum dilakukan perluasan atau replikasi.",
            };
        }

        return {
            type: "strengthen",
            label: "Penguatan Akuntabilitas",
            description:
                "Dampak program sudah baik, tetapi risiko akuntabilitas masih perlu diturunkan melalui penguatan bukti, validasi data, dan dokumentasi capaian.",
        };
    }

    /**
     * DAMPAK RENDAH + RISIKO TINGGI
     */
    if (impactScore < 50 && riskLevel === "high") {
        return {
            type: "reevaluate",
            label: "Evaluasi Ulang",
            description:
                "Program memerlukan evaluasi ulang terhadap desain, target, indikator, dan pelaksanaannya sebelum dilanjutkan ke periode berikutnya.",
        };
    }

    /**
     * DAMPAK BELUM OPTIMAL TAPI MASIH LAYAK DIPERBAIKI
     */
    return {
        type: "improve",
        label: "Perbaikan Program",
        description:
            "Program dapat dilanjutkan dengan penyempurnaan indikator, strategi pelaksanaan, bukti pendukung, dan pencapaian target untuk meningkatkan dampaknya.",
    };
}

/**
 * Helper utama untuk dashboard.
 */
export function buildProgramRecommendation(
    program: SdgProgram,
): ProgramRecommendation {
    const result = calculateImpact(program);

    return {
        programId: program.id,
        programName: program.programName,
        organization: program.organization,

        impactScore: result.impactScore,
        riskLevel: result.riskLevel,
        sustainability: program.sustainability,

        improvements: generateImprovementRecommendations(program),
        nextPlan: generateNextPlan(program),
    };
}