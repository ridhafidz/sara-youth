"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setAuthCookie } from "@/lib/authCookie";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Set cookie agar middleware server-side mengenali sesi
      setAuthCookie(credential.user.uid);
      router.push(`${redirectTo}${redirectTo === "/dashboard" ? "?login=success" : ""}`);
    } catch (err: any) {
      console.error(err);
      setError("Gagal login. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>

      {error && (
        <div className="rounded-[var(--sara-radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-[var(--sara-radius-sm)] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--sara-primary)" }}
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <div className="text-center mt-4">
        <span className="text-sm text-[var(--sara-text-secondary)]">
          Belum punya akun?{" "}
        </span>
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-sm font-semibold text-[var(--sara-primary)] hover:underline"
        >
          Daftar
        </button>
      </div>
    </form>
  );
}
