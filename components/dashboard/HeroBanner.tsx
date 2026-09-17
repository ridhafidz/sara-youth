"use client";

import { SDG_COLORS } from "@/lib/sdgColors";

/**
 * Grid layout: 5 columns × 4 rows = 20 cells
 * Index 0–10  → SDG 1–11
 * Index 11    → "THE GLOBAL GOALS" anchor slot
 * Index 12–17 → SDG 12–17
 * Index 18–19 → transparent filler
 */
type GridCell =
  | { type: "sdg"; goal: number }
  | { type: "logo" }
  | { type: "empty" };

function buildGrid(): GridCell[] {
  const cells: GridCell[] = [];
  // SDG 1–11 → indices 0–10
  for (let g = 1; g <= 11; g++) cells.push({ type: "sdg", goal: g });
  // Global Goals logo at index 11
  cells.push({ type: "logo" });
  // SDG 12–17 → indices 12–17
  for (let g = 12; g <= 17; g++) cells.push({ type: "sdg", goal: g });
  // Filler to reach 20
  cells.push({ type: "empty" }, { type: "empty" });
  return cells;
}

const GRID_CELLS = buildGrid();

export function HeroBanner() {
  return (
    <section
      className="rounded-[var(--sara-radius-lg)] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--sara-primary) 0%, var(--sara-primary-dark) 100%)",
      }}
    >
      <div className="flex items-center gap-6 p-8">
        {/* ── Left: Copy & CTAs ── */}
        <div className="flex-1 min-w-0">
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
              className="px-5 py-2.5 rounded-[var(--sara-radius-sm)] border border-white/60 text-white text-sm font-medium backdrop-blur-sm transition hover:bg-white/10 hover:border-white active:scale-95"
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

        {/* ── Right: 5×4 SDG Icon Grid ── */}
        <div className="hidden md:grid grid-cols-5 gap-1.5 shrink-0">
          {GRID_CELLS.map((cell, i) => {
            // Stagger delay: 50ms × index, capped so last icons aren't too delayed
            const delay = `${Math.min(i * 50, 600)}ms`;

            if (cell.type === "empty") {
              return (
                <div
                  key={`empty-${i}`}
                  className="w-[52px] h-[52px] rounded-md"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              );
            }

            if (cell.type === "logo") {
              return (
                <div
                  key="logo"
                  className="sdg-icon-cell w-[52px] h-[52px] rounded-md flex flex-col items-center justify-center bg-white p-1"
                  style={{ animationDelay: delay }}
                  title="The Global Goals"
                >
                  {/* UN "THE GLOBAL GOALS" mark — text-based faithful representation */}
                  <div className="flex flex-col items-center gap-0.5 leading-none">
                    <span
                      className="font-extrabold text-[7px] tracking-tight uppercase leading-none"
                      style={{ color: "#009edb" }}
                    >
                      THE
                    </span>
                    <span
                      className="font-extrabold text-[6px] tracking-tight uppercase leading-none"
                      style={{ color: "#009edb" }}
                    >
                      GLOBAL
                    </span>
                    <span
                      className="font-extrabold text-[6px] tracking-tight uppercase leading-none"
                      style={{ color: "#009edb" }}
                    >
                      GOALS
                    </span>
                    {/* Simplified SDG circle ring mark */}
                    <div
                      className="mt-0.5 w-4 h-4 rounded-full border-[2.5px]"
                      style={{ borderColor: "#009edb" }}
                    />
                  </div>
                </div>
              );
            }

            // SDG cell
            const { color, name } = SDG_COLORS[cell.goal];
            return (
              <div
                key={cell.goal}
                className="sdg-icon-cell w-[52px] h-[52px] rounded-md flex flex-col items-end justify-between p-1 cursor-pointer hover:brightness-110 transition-all"
                style={{ background: color, animationDelay: delay }}
                title={`SDG ${cell.goal}: ${name}`}
                aria-label={`SDG ${cell.goal}: ${name}`}
              >
                {/* Goal number — top right, bold white */}
                <span className="text-white font-extrabold text-[11px] leading-none self-start">
                  {cell.goal}
                </span>
                {/* Short name — bottom, tiny white */}
                <span
                  className="text-white/90 font-semibold leading-tight text-center w-full"
                  style={{ fontSize: "5.5px" }}
                >
                  {name.split(" ").slice(0, 3).join(" ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
