"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MonitoringSchedule } from "@/components/dashboard/MonitoringSchedule";
import { ActivitiesList } from "@/components/dashboard/ActivitiesList";
import { SystemNotification } from "@/components/dashboard/SystemNotification";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearAuthCookie } from "@/lib/authCookie";

function PanelDivider() {
  return <hr style={{ borderColor: "var(--sara-border)" }} />;
}

export function RightPanel() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Admin");
      } else {
        setUserName("Pengguna");
      }
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      clearAuthCookie();
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside
      className="flex flex-col gap-5 px-4 py-6 bg-[var(--sara-surface)] border-l border-[var(--sara-border)] overflow-y-auto"
      style={{ width: 300 }}
      aria-label="Right panel"
    >
      {/* ── Admin Profile ── */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <Link 
          href="/account"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-[var(--sara-primary-light)] hover:opacity-90 transition"
          style={{ background: "var(--sara-primary)" }}
          aria-label={`Avatar for ${userName}`}
        >
          {userName.charAt(0).toUpperCase()}
        </Link>

        <Link href="/account" className="flex-1 min-w-0 group cursor-pointer">
          <p className="text-sm font-semibold text-[var(--sara-text-primary)] truncate group-hover:text-[var(--sara-primary)] transition">
            {userName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--sara-success)" }}
            />
            <p className="text-[10px] text-[var(--sara-text-secondary)] capitalize">
              Admin · Online
            </p>
          </div>
        </Link>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Profile options"
          className="p-1 rounded-md text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] hover:bg-[var(--sara-bg)] transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>

        {showDropdown && (
          <div className="absolute top-12 right-0 w-48 bg-[var(--sara-surface)] rounded-xl border border-[var(--sara-border)] shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
            <Link
              href="/account"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--sara-text-secondary)] hover:bg-[var(--sara-bg)] hover:text-[var(--sara-primary)] transition"
            >
              <User size={15} />
              My Account
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <PanelDivider />

      {/* ── Real-time: Monitoring Schedule ── */}
      <MonitoringSchedule />

      <PanelDivider />

      {/* ── Real-time: Activities ── */}
      <ActivitiesList />

      <PanelDivider />

      {/* ── Real-time: System Notification ── */}
      <SystemNotification />
    </aside>
  );
}
