"use client";

import { useState, useEffect } from "react";
import { User, Shield, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  updatePassword,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  deleteUser
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { clearAuthCookie } from "@/lib/authCookie";

export default function AccountPage() {
  const router = useRouter();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete Account State
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || "");
        setEmail(user.email || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Pengguna tidak terautentikasi.");

      // 1. Update Profile (Name)
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // 2. Update Email (Requires recent login usually)
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // 3. Update Password
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Password dan Konfirmasi Password tidak cocok.");
        }
        if (newPassword.length < 6) {
          throw new Error("Password minimal 6 karakter.");
        }
        await updatePassword(user, newPassword);
        setNewPassword("");
        setConfirmPassword("");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMsg("Sesi Anda sudah terlalu lama. Silakan logout dan login kembali untuk melakukan perubahan ini.");
      } else {
        setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan pengaturan.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setErrorMsg(null);

      const user = auth.currentUser;
      if (!user) throw new Error("Pengguna tidak terautentikasi.");

      await deleteUser(user);

      clearAuthCookie();
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMsg("Sesi Anda sudah terlalu lama. Silakan logout dan login kembali untuk menghapus akun.");
      } else {
        setErrorMsg(err.message || "Terjadi kesalahan saat menghapus akun.");
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-[var(--sara-text-primary)]">My Account</h1>
        <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
          Kelola informasi profil, keamanan akun, dan hapus akun.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Section */}
        <div className="bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] border border-[var(--sara-border)] p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--sara-border)] pb-4">
            <div className="p-2 bg-[var(--sara-primary-light)] text-[var(--sara-primary)] rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--sara-text-primary)]">Profil Pengguna</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Anda"
                className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
              />
            </div>
          </div>
        </div>

        {/* Security / Password Section */}
        <div className="bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] border border-[var(--sara-border)] p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--sara-border)] pb-4">
            <div className="p-2 bg-[var(--sara-primary-light)] text-[var(--sara-primary)] rounded-lg">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--sara-text-primary)]">Keamanan & Password</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Biarkan kosong jika tidak ingin mengubah"
                className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sara-text-primary)] mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-2.5 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-surface)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons for Profile & Security */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          {errorMsg && (
            <span className="text-sm font-medium text-red-600 animate-in fade-in flex-1">
              {errorMsg}
            </span>
          )}
          {saved && !errorMsg && (
            <span className="text-sm font-medium text-green-600 animate-in fade-in">
              Perubahan berhasil disimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={saving || deleting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--sara-primary)" }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/10 rounded-[var(--sara-radius-lg)] border border-red-200 dark:border-red-900/50 p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Hapus Akun</h2>
        </div>

        <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
          Penghapusan akun bersifat permanen. Semua data Anda akan hilang dan tidak dapat dipulihkan.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition"
          >
            Hapus Akun
          </button>
        ) : (
          <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--sara-text-secondary)] hover:bg-[var(--sara-bg)] rounded-md transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
