"use client";

import { useState, useEffect } from "react";
import { Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("sara-theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!theme) return;

    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem("sara-theme", theme);
  }, [theme]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);
    
    try {
      // Fake delay for saving notifications and theme preference
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-[var(--sara-text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
          Kelola preferensi notifikasi dan tampilan aplikasi SARA Anda.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications Section */}
        <div className="bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] border border-[var(--sara-border)] p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--sara-border)] pb-4">
            <div className="p-2 bg-[var(--sara-primary-light)] text-[var(--sara-primary)] rounded-lg">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--sara-text-primary)]">Notifikasi</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-[var(--sara-text-primary)] text-sm">Notifikasi Email</p>
                <p className="text-xs text-[var(--sara-text-secondary)]">Terima update laporan dan jadwal via email.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition ${emailNotifs ? 'bg-[var(--sara-primary)]' : 'bg-gray-200'}`}></div>
                <div className={`absolute left-1 top-1 bg-[var(--sara-surface)] w-4 h-4 rounded-full transition transform ${emailNotifs ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-[var(--sara-text-primary)] text-sm">Notifikasi Push</p>
                <p className="text-xs text-[var(--sara-text-secondary)]">Terima peringatan langsung di browser.</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition ${pushNotifs ? 'bg-[var(--sara-primary)]' : 'bg-gray-200'}`}></div>
                <div className={`absolute left-1 top-1 bg-[var(--sara-surface)] w-4 h-4 rounded-full transition transform ${pushNotifs ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-[var(--sara-surface)] rounded-[var(--sara-radius-lg)] border border-[var(--sara-border)] p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--sara-border)] pb-4">
            <div className="p-2 bg-[var(--sara-primary-light)] text-[var(--sara-primary)] rounded-lg">
              <Palette size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--sara-text-primary)]">Tampilan</h2>
          </div>
          
          <div className="flex gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium capitalize transition
                  ${theme === t 
                    ? 'border-[var(--sara-primary)] bg-[var(--sara-primary-light)] text-[var(--sara-primary)]' 
                    : 'border-[var(--sara-border)] text-[var(--sara-text-secondary)] hover:bg-[var(--sara-bg)]'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
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
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--sara-primary)" }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
