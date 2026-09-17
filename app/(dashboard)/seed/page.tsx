"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper function for random dates in the past 6 months
function randomDate() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const DUMMY_PROGRAMS = [
  {
    programName: "Sekolah Alam Pesisir",
    organization: "BEM Vokasi",
    objective: "Meningkatkan literasi anak pesisir",
    targetAudience: "Anak-anak nelayan usia 7-12 tahun",
    primaryGoal: 4,
    supportingGoals: [10],
    sdgTargets: ["4.1", "4.6"],
    beneficiariesTarget: 50,
    beneficiariesActual: 45,
    sustainability: "continued",
    status: "measured",
    impactScore: 82,
    riskLevel: "low",
    indicators: [
      { name: "Siswa bisa membaca", unit: "anak", target: 50, actual: 40 },
    ],
    evidence: [{ type: "photo", url: "https://example.com/photo1" }],
  },
  {
    programName: "Zero Waste Campus",
    organization: "HIMA Lingkungan",
    objective: "Mengurangi sampah plastik di kampus",
    targetAudience: "Mahasiswa",
    primaryGoal: 12,
    supportingGoals: [13],
    sdgTargets: ["12.5"],
    beneficiariesTarget: 1000,
    beneficiariesActual: 800,
    sustainability: "planned",
    status: "measured",
    impactScore: 65,
    riskLevel: "medium",
    indicators: [
      { name: "Pengurangan botol plastik", unit: "kg", target: 500, actual: 200 },
    ],
    evidence: [{ type: "document", url: "https://example.com/doc1" }],
  },
  {
    programName: "Pemberdayaan UMKM Perempuan",
    organization: "Koperasi Mahasiswa",
    objective: "Meningkatkan omzet UMKM",
    targetAudience: "Ibu rumah tangga pelaku UMKM",
    primaryGoal: 5,
    supportingGoals: [8],
    sdgTargets: ["5.a", "8.3"],
    beneficiariesTarget: 20,
    beneficiariesActual: 25,
    sustainability: "replicated",
    status: "reported",
    impactScore: 95,
    riskLevel: "low",
    indicators: [
      { name: "Peningkatan omzet", unit: "%", target: 30, actual: 45 },
    ],
    evidence: [{ type: "survey", url: "https://example.com/survey1" }],
  },
  {
    programName: "Edukasi Gizi Seimbang",
    organization: "Fakultas Kesehatan",
    objective: "Menurunkan angka stunting",
    targetAudience: "Ibu hamil dan balita",
    primaryGoal: 3,
    supportingGoals: [2],
    sdgTargets: ["3.2", "2.2"],
    beneficiariesTarget: 100,
    beneficiariesActual: null,
    sustainability: "none",
    status: "draft",
    impactScore: null,
    riskLevel: null,
    indicators: [],
    evidence: [],
  },
  {
    programName: "Pelatihan Coding Desa",
    organization: "HIMA TI",
    objective: "Meningkatkan literasi digital",
    targetAudience: "Pemuda desa",
    primaryGoal: 8,
    supportingGoals: [4, 9],
    sdgTargets: ["8.6", "4.4"],
    beneficiariesTarget: 30,
    beneficiariesActual: 30,
    sustainability: "planned",
    status: "measured",
    impactScore: 88,
    riskLevel: "low",
    indicators: [
      { name: "Peserta lulus tes", unit: "orang", target: 30, actual: 28 },
    ],
    evidence: [{ type: "photo", url: "https://example.com/photo2" }],
  },
  {
    programName: "Penanaman 1000 Mangrove",
    organization: "UKM Pecinta Alam",
    objective: "Mencegah abrasi pantai",
    targetAudience: "Masyarakat pesisir",
    primaryGoal: 14,
    supportingGoals: [13, 15],
    sdgTargets: ["14.2", "15.1"],
    beneficiariesTarget: 1000,
    beneficiariesActual: 1200,
    sustainability: "continued",
    status: "measured",
    impactScore: 78,
    riskLevel: "medium",
    indicators: [
      { name: "Pohon mangrove tertanam", unit: "pohon", target: 1000, actual: 1000 },
    ],
    evidence: [],
  },
  {
    programName: "Kampanye Anti Bullying",
    organization: "BEM Psikologi",
    objective: "Menciptakan lingkungan sekolah aman",
    targetAudience: "Siswa SMP",
    primaryGoal: 16,
    supportingGoals: [4, 10],
    sdgTargets: ["16.1", "4.a"],
    beneficiariesTarget: 200,
    beneficiariesActual: 50,
    sustainability: "none",
    status: "measured",
    impactScore: 40,
    riskLevel: "high",
    indicators: [
      { name: "Siswa mengikuti seminar", unit: "orang", target: 200, actual: 50 },
    ],
    evidence: [],
  }
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    if (!confirm("Ini akan menambahkan data dummy ke Firestore. Lanjutkan?")) return;
    
    setLoading(true);
    setMessage("Seeding in progress...");
    try {
      let count = 0;
      for (const prog of DUMMY_PROGRAMS) {
        const date = randomDate();
        await addDoc(collection(db, "sdg_programs"), {
          ...prog,
          createdBy: "system_seed",
          createdAt: Timestamp.fromDate(date),
          updatedAt: Timestamp.fromDate(date),
          period: {
            start: Timestamp.fromDate(date),
            end: Timestamp.fromDate(new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)), // +1 month
          }
        });
        count++;
      }
      setMessage(`Seeding success! Added ${count} programs.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Seeding failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Database Seeding</h1>
      <p className="text-gray-600">
        Klik tombol di bawah untuk mengisi koleksi <code>sdg_programs</code> dengan data dummy yang mencakup berbagai fase (draft, measured, reported) dan tingkatan Impact Score.
      </p>
      
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Seed Dummy Data"}
      </button>

      {message && (
        <div className="mt-4 p-4 rounded bg-gray-100 font-mono text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
