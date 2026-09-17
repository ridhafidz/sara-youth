import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login — SARA",
  description: "Masuk ke akun SARA Anda",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sara-bg)]">
      <div
        className="w-full max-w-md bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] p-10"
        style={{ boxShadow: "var(--sara-shadow-card)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/sara-logo-new.png"
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
          Welcome back
        </h1>
        <p className="text-sm text-[var(--sara-text-secondary)] mb-8">
          Masuk ke dashboard SARA Anda
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
