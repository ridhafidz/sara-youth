import type { SdgGoal } from "@/lib/types/sdgProgram";

/**
 * Metadata 17 tujuan SDGs.
 * Warna mengikuti palet resmi PBB agar tampilan konsisten dengan
 * materi SDGs pada umumnya.
 */

export interface SdgGoalMeta {
  goal: SdgGoal;
  /** Nama pendek untuk chip dan label chart. */
  shortName: string;
  /** Nama lengkap bahasa Indonesia. */
  name: string;
  color: string;
}

export const SDG_GOALS: Record<SdgGoal, SdgGoalMeta> = {
  1: { goal: 1, shortName: "Tanpa Kemiskinan", name: "Tanpa Kemiskinan", color: "#E5243B" },
  2: { goal: 2, shortName: "Tanpa Kelaparan", name: "Tanpa Kelaparan", color: "#DDA63A" },
  3: { goal: 3, shortName: "Kesehatan", name: "Kehidupan Sehat dan Sejahtera", color: "#4C9F38" },
  4: { goal: 4, shortName: "Pendidikan", name: "Pendidikan Berkualitas", color: "#C5192D" },
  5: { goal: 5, shortName: "Kesetaraan Gender", name: "Kesetaraan Gender", color: "#FF3A21" },
  6: { goal: 6, shortName: "Air Bersih", name: "Air Bersih dan Sanitasi Layak", color: "#26BDE2" },
  7: { goal: 7, shortName: "Energi Bersih", name: "Energi Bersih dan Terjangkau", color: "#FCC30B" },
  8: { goal: 8, shortName: "Pekerjaan Layak", name: "Pekerjaan Layak dan Pertumbuhan Ekonomi", color: "#A21942" },
  9: { goal: 9, shortName: "Industri & Inovasi", name: "Industri, Inovasi, dan Infrastruktur", color: "#FD6925" },
  10: { goal: 10, shortName: "Kesenjangan", name: "Berkurangnya Kesenjangan", color: "#DD1367" },
  11: { goal: 11, shortName: "Kota Berkelanjutan", name: "Kota dan Permukiman Berkelanjutan", color: "#FD9D24" },
  12: { goal: 12, shortName: "Konsumsi Bertanggung Jawab", name: "Konsumsi dan Produksi yang Bertanggung Jawab", color: "#BF8B2E" },
  13: { goal: 13, shortName: "Penanganan Iklim", name: "Penanganan Perubahan Iklim", color: "#3F7E44" },
  14: { goal: 14, shortName: "Ekosistem Laut", name: "Ekosistem Lautan", color: "#0A97D9" },
  15: { goal: 15, shortName: "Ekosistem Darat", name: "Ekosistem Daratan", color: "#56C02B" },
  16: { goal: 16, shortName: "Perdamaian & Keadilan", name: "Perdamaian, Keadilan, dan Kelembagaan yang Tangguh", color: "#00689D" },
  17: { goal: 17, shortName: "Kemitraan", name: "Kemitraan untuk Mencapai Tujuan", color: "#19486A" },
};

/** Daftar goal berurutan, untuk grid dan dropdown. */
export const SDG_GOAL_LIST: SdgGoalMeta[] = Object.values(SDG_GOALS).sort(
  (a, b) => a.goal - b.goal,
);

/** Semua nomor goal, dipakai untuk inisialisasi chart agar goal kosong tetap muncul. */
export const ALL_GOALS: SdgGoal[] = SDG_GOAL_LIST.map((g) => g.goal);

/**
 * Target SDGs per goal.
 *
 * Daftar ini adalah kurasi target yang paling relevan dengan program
 * organisasi mahasiswa, bukan seluruh 169 target resmi. Tujuannya agar
 * dropdown tetap bisa dipakai tanpa membuat pengguna kewalahan.
 * Tambahkan entri baru bila ada program yang membutuhkannya; format kode
 * divalidasi oleh `isValidSdgTarget` di lib/impactScore.ts.
 */
export const SDG_TARGETS: Record<SdgGoal, Array<{ code: string; label: string }>> = {
  1: [
    { code: "1.2", label: "Mengurangi proporsi penduduk miskin" },
    { code: "1.4", label: "Akses setara ke sumber daya ekonomi dan layanan dasar" },
    { code: "1.5", label: "Membangun ketahanan kelompok rentan" },
  ],
  2: [
    { code: "2.1", label: "Mengakhiri kelaparan dan akses pangan bergizi" },
    { code: "2.2", label: "Mengakhiri segala bentuk malnutrisi" },
    { code: "2.4", label: "Sistem produksi pangan berkelanjutan" },
  ],
  3: [
    { code: "3.4", label: "Mengurangi penyakit tidak menular dan kesehatan mental" },
    { code: "3.7", label: "Akses layanan kesehatan reproduksi" },
    { code: "3.8", label: "Cakupan kesehatan universal" },
    { code: "3.d", label: "Kapasitas peringatan dini dan penanganan risiko kesehatan" },
  ],
  4: [
    { code: "4.1", label: "Pendidikan dasar dan menengah yang berkualitas" },
    { code: "4.4", label: "Keterampilan relevan untuk kerja dan kewirausahaan" },
    { code: "4.5", label: "Menghapus disparitas akses pendidikan" },
    { code: "4.7", label: "Pendidikan untuk pembangunan berkelanjutan" },
  ],
  5: [
    { code: "5.1", label: "Mengakhiri diskriminasi terhadap perempuan" },
    { code: "5.2", label: "Menghapus kekerasan terhadap perempuan" },
    { code: "5.5", label: "Partisipasi penuh perempuan dalam kepemimpinan" },
  ],
  6: [
    { code: "6.1", label: "Akses air minum aman dan terjangkau" },
    { code: "6.2", label: "Akses sanitasi dan higiene layak" },
    { code: "6.3", label: "Memperbaiki kualitas air dan mengurangi pencemaran" },
    { code: "6.b", label: "Partisipasi masyarakat dalam pengelolaan air" },
  ],
  7: [
    { code: "7.2", label: "Meningkatkan porsi energi terbarukan" },
    { code: "7.3", label: "Meningkatkan efisiensi energi" },
    { code: "7.a", label: "Kerja sama riset dan teknologi energi bersih" },
  ],
  8: [
    { code: "8.3", label: "Mendukung kewirausahaan dan UMKM" },
    { code: "8.6", label: "Mengurangi proporsi pemuda tanpa pekerjaan atau pendidikan" },
    { code: "8.9", label: "Pariwisata berkelanjutan" },
  ],
  9: [
    { code: "9.1", label: "Infrastruktur berkualitas dan inklusif" },
    { code: "9.4", label: "Modernisasi industri yang berkelanjutan" },
    { code: "9.5", label: "Memperkuat riset dan inovasi" },
  ],
  10: [
    { code: "10.2", label: "Pemberdayaan dan inklusi sosial seluruh kelompok" },
    { code: "10.3", label: "Menjamin kesempatan yang setara" },
    { code: "10.4", label: "Kebijakan yang mendorong kesetaraan" },
  ],
  11: [
    { code: "11.1", label: "Akses perumahan dan permukiman layak" },
    { code: "11.6", label: "Mengurangi dampak lingkungan perkotaan" },
    { code: "11.7", label: "Akses ruang publik yang aman dan inklusif" },
  ],
  12: [
    { code: "12.3", label: "Mengurangi limbah pangan" },
    { code: "12.5", label: "Mengurangi timbulan limbah melalui daur ulang" },
    { code: "12.8", label: "Kesadaran gaya hidup berkelanjutan" },
  ],
  13: [
    { code: "13.1", label: "Ketahanan terhadap bahaya terkait iklim" },
    { code: "13.3", label: "Edukasi dan kapasitas mitigasi perubahan iklim" },
  ],
  14: [
    { code: "14.1", label: "Mengurangi pencemaran laut" },
    { code: "14.2", label: "Melindungi ekosistem pesisir" },
  ],
  15: [
    { code: "15.1", label: "Melestarikan ekosistem daratan" },
    { code: "15.2", label: "Pengelolaan hutan berkelanjutan dan reboisasi" },
    { code: "15.5", label: "Melindungi keanekaragaman hayati" },
  ],
  16: [
    { code: "16.6", label: "Lembaga yang efektif, akuntabel, dan transparan" },
    { code: "16.7", label: "Pengambilan keputusan yang responsif dan partisipatif" },
    { code: "16.10", label: "Akses publik terhadap informasi" },
  ],
  17: [
    { code: "17.16", label: "Memperkuat kemitraan multipihak" },
    { code: "17.17", label: "Mendorong kemitraan publik, swasta, dan masyarakat sipil" },
    { code: "17.19", label: "Mengembangkan pengukuran kemajuan pembangunan" },
  ],
};

/** Ambil label target berdasarkan kodenya. Mengembalikan null bila tidak dikenal. */
export function findTargetLabel(code: string): string | null {
  const goal = Number(code.split(".")[0]) as SdgGoal;
  const list = SDG_TARGETS[goal];
  if (!list) return null;
  return list.find((t) => t.code === code)?.label ?? null;
}
