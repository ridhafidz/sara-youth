"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setAuthCookie } from "@/lib/authCookie";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }

      // Set cookie agar middleware server-side mengenali sesi
      setAuthCookie(userCredential.user.uid);
      setSuccess("Membuat akun berhasil! Mengalihkan...");
      
      setTimeout(() => {
        router.push("/dashboard?login=success");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah. Minimal 6 karakter.");
      } else {
        setError("Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5"
        >
          Nama
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Lengkap"
          className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>
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
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5"
        >
          Konfirmasi Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>

      {error && (
        <div className="rounded-[var(--sara-radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[var(--sara-radius-sm)] bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-[var(--sara-radius-sm)] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 mt-2"
        style={{ background: "var(--sara-primary)" }}
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>

      <div className="text-center mt-4">
        <span className="text-sm text-[var(--sara-text-secondary)]">
          Sudah punya akun?{" "}
        </span>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm font-semibold text-[var(--sara-primary)] hover:underline"
        >
          Masuk
        </button>
      </div>
    </form>
  );
}
