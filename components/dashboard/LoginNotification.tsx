"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function LoginNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      setShow(true);
      // Remove the query param from URL without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-[var(--sara-radius-md)] shadow-lg animate-in fade-in slide-in-from-top-5 duration-300">
      <p className="font-semibold text-sm">Berhasil masuk!</p>
      <p className="text-xs opacity-90">Selamat datang kembali di SARA.</p>
    </div>
  );
}
