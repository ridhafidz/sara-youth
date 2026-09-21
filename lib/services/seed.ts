import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export async function seedDummyData() {
  const db = getDb();
  
  try {
    // 1. Seed Schedules
    const schedulesRef = collection(db, "schedules");
    await addDoc(schedulesRef, {
      title: "Kunjungan Lapangan Desa A",
      description: "Evaluasi program air bersih",
      date: new Date(Date.now() + 86400000 * 2), // 2 days from now
      month: "Sep",
      year: 2026,
      is_upcoming: true
    });
    await addDoc(schedulesRef, {
      title: "Rapat Koordinasi Bappeda",
      description: "Membahas target SDGs 2027",
      date: new Date(Date.now() + 86400000 * 5), // 5 days from now
      month: "Sep",
      year: 2026,
      is_upcoming: true
    });

    // 2. Seed Activities
    const activitiesRef = collection(db, "activities");
    await addDoc(activitiesRef, {
      title: "Program 'Desa Hijau' ditambahkan",
      status: "active",
      icon: "Map",
      created_at: serverTimestamp()
    });
    await addDoc(activitiesRef, {
      title: "Laporan Q3 SDGs 4 diverifikasi",
      status: "done",
      icon: "FileCheck",
      created_at: new Date(Date.now() - 3600000) // 1 hr ago
    });
    await addDoc(activitiesRef, {
      title: "Menunggu approval Dana CSR",
      status: "pending",
      icon: "Zap",
      created_at: new Date(Date.now() - 86400000) // 1 day ago
    });

    // 3. Seed Notification
    const notifsRef = collection(db, "notifications");
    await addDoc(notifsRef, {
      message: "Target SDGs 6 (Air Bersih) meningkat 15% minggu ini!",
      is_read: false,
      created_at: serverTimestamp()
    });

    console.log("Dummy data successfully seeded!");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}
