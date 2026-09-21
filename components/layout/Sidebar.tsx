"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/authCookie";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  BarChart2,
  FileText,
  Settings,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "SDGs Programs", href: "/sdgs-programs", icon: Target },
  { label: "Impact Assessment", href: "/impact-assessment", icon: TrendingUp },
  { label: "Impact Insights", href: "/impact-insights", icon: BarChart2 },
  { label: "SDGs Reports", href: "/sdgs-reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

const secondaryNav = [
  { label: "My Account", href: "/account", icon: User },
  { label: "Sign Out", href: "/logout", icon: LogOut },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      clearAuthCookie(); // Hapus cookie sebelum signOut agar middleware langsung redirect
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className="flex flex-col h-full bg-[var(--sara-surface)] border-r border-[var(--sara-border)] px-4 py-6"
      style={{ width: 240 }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <Image
          src="/sara-logo.png"
          alt="SARA Logo"
          width={36}
          height={36}
          style={{ width: 36, height: 'auto' }}
          className="rounded-[var(--sara-radius-md)] shrink-0"
        />
        <div>
          <p className="font-bold text-[var(--sara-text-primary)] text-sm leading-tight tracking-wide">
            SARA
          </p>
          <p className="text-[9px] text-[var(--sara-text-secondary)] leading-tight">
            SDGs Accountability<br />and Risk Analytics
          </p>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex flex-col gap-1 flex-1">
        {mainNav.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${
                  active
                    ? "bg-[var(--sara-primary)] text-white shadow-sm"
                    : "text-[var(--sara-text-secondary)] hover:bg-[var(--sara-primary-light)] hover:text-[var(--sara-text-primary)]"
                }`}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-white" : "text-[var(--sara-text-secondary)]"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Secondary Navigation ── */}
      <div className="flex flex-col gap-1 mt-6 pt-6 border-t border-[var(--sara-border)]">
        {secondaryNav.map(({ label, href, icon: Icon }) => {
          if (href === "/logout") {
            return (
              <button
                key={href}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--sara-text-secondary)] hover:bg-[var(--sara-primary-light)] hover:text-[var(--sara-text-primary)] transition-all duration-150"
              >
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </button>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--sara-text-secondary)] hover:bg-[var(--sara-primary-light)] hover:text-[var(--sara-text-primary)] transition-all duration-150"
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
