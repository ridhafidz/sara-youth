"use client";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

/**
 * Menyediakan UID pengguna yang sedang login.
 *
 * Security Rules mensyaratkan `request.auth` ada untuk setiap operasi tulis,
 * padahal halaman login baru dibangun pada Langkah 7. Sebagai jembatan,
 * hook ini bisa masuk secara anonim selama pengembangan.
 *
 * Aktifkan lewat env: NEXT_PUBLIC_ALLOW_ANON_AUTH=true
 * (dan aktifkan Anonymous di Firebase Console > Authentication > Sign-in method)
 *
 * Setelah Langkah 7 selesai, hapus env tersebut agar hanya pengguna
 * terautentikasi sungguhan yang bisa menulis data.
 */
export function useAuthUid(): { uid: string | null; loading: boolean } {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setLoading(false);
        return;
      }

      if (process.env.NEXT_PUBLIC_ALLOW_ANON_AUTH === "true") {
        signInAnonymously(auth).catch(() => {
          setUid(null);
          setLoading(false);
        });
        return;
      }

      setUid(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { uid, loading };
}
