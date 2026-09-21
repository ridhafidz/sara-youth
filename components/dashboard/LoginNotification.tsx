"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function LoginNotification() {
  const searchParams = useSearchParams();
  // Baca nilai param SEBELUM useEffect — hanya saat render pertama
  const isLoginSuccess = searchParams.get("login") === "success";

  const [show, setShow] = useState(isLoginSuccess);
  const [visible, setVisible] = useState(isLoginSuccess);

  useEffect(() => {
    if (!isLoginSuccess) return;

    // Bersihkan query param dari URL
    window.history.replaceState({}, "", window.location.pathname);

    // Fade-out di 2.5s, unmount di 3s
    const fadeTimer = setTimeout(() => setVisible(false), 2500);
    const hideTimer = setTimeout(() => setShow(false), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — hanya jalan sekali saat mount

  if (!show) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-[var(--sara-radius-md)] shadow-lg"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <p className="font-semibold text-sm">Berhasil masuk!</p>
      <p className="text-xs opacity-90">Selamat datang kembali di SARA.</p>
    </div>
  );
}
