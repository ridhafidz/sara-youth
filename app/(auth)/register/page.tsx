import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register — SARA",
  description: "Daftar akun SARA baru",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sara-bg)]">
      <div
        className="w-full max-w-md bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] p-10"
        style={{ boxShadow: "var(--sara-shadow-card)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/sara-logo.png"
            alt="SARA Logo"
            width={40}
            height={40}
            className="rounded-[var(--sara-radius-md)] shrink-0"
          />
          <div>
            <p className="font-bold text-[var(--sara-text-primary)] leading-tight text-base">
              SARA
            </p>
            <p className="text-[10px] text-[var(--sara-text-secondary)] leading-tight">
              SDGs Accountability and Risk Analytics
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--sara-text-primary)] mb-1">
          Buat Akun
        </h1>
        <p className="text-sm text-[var(--sara-text-secondary)] mb-8">
          Daftar untuk mengakses dashboard SARA
        </p>

        <Suspense fallback={<div className="h-64" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}