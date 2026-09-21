"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setAuthCookie, clearAuthCookie } from "@/lib/authCookie";

// Route yang tidak perlu redirect walau user tidak login
const AUTH_ROUTES = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Pastikan cookie selalu sync dengan state Firebase (e.g. setelah refresh)
        setAuthCookie(currentUser.uid);

        // Jika user sudah login tapi masih di halaman auth → redirect ke dashboard
        if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
          router.replace("/dashboard");
        }
      } else {
        // User logout atau sesi berakhir → hapus cookie & redirect ke login
        clearAuthCookie();
        if (!AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
          router.replace("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--sara-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#12A594] border-t-transparent" />
      </div>
    );
  }

  // Kalau belum login dan bukan di halaman auth, jangan render children
  if (!user && !AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return null;
  }

  return <>{children}</>;
}
