"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section
      className="rounded-[var(--sara-radius-lg)] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--sara-primary) 0%, var(--sara-primary-dark) 100%)",
      }}
    >
      <div className="flex items-stretch justify-between">
        {/* ── Left: Copy & CTAs ── */}
        <div className="flex-1 min-w-0 p-8 py-10">
          {/* Eyebrow */}
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            SDGs Accountability &amp; Risk Analytics
          </p>

          {/* Headline */}
          <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
            SARA Youth SDGs
            <br />
            Dashboard
          </h1>
          <p className="text-white/70 text-sm mb-8 max-w-xs">
            Monitor program dampak, skor SDGs, dan distribusi program mahasiswa
            secara real-time.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-5 py-2.5 rounded-[var(--sara-radius-sm)] border border-white/60 text-white text-sm font-medium backdrop-blur-sm transition hover:bg-[var(--sara-surface)]/10 hover:border-white active:scale-95"
              aria-label="View Risk Summary"
            >
              View Risk Summary
            </button>
            <button
              className="px-5 py-2.5 rounded-[var(--sara-radius-sm)] bg-white text-sm font-semibold transition hover:opacity-90 active:scale-95"
              style={{ color: "var(--sara-primary)" }}
              aria-label="Access Monitoring Panel"
            >
              Access Monitoring Panel
            </button>
          </div>
        </div>

        {/* ── Right: SDG Image ── */}
        <div className="hidden md:block relative w-[280px] lg:w-[400px] shrink-0">
          <Image
            src="/sdgs-img.jpeg"
            alt="SDGs Grid"
            fill
            className="object-cover opacity-90 hover:opacity-100 transition-opacity"
            priority
          />
        </div>
      </div>
    </section>
  );
}
