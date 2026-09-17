import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RightPanel } from "@/components/layout/RightPanel";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /**
     * 3-column grid: [240px sidebar | 1fr main | 300px right panel]
     * All columns are full viewport height; sidebar and right panel are sticky.
     * Below `lg` (1024px): collapses to single-column.
     */
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--sara-bg)]">
        {/* ── Left: Sidebar (sticky, full height) ── */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* ── Center: Topbar + scrollable content ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto px-6 py-6"
            style={{ gap: "var(--sara-space-card-gap)" }}
          >
            {children}
          </main>
        </div>

        {/* ── Right: Panel (sticky, full height) ── */}
        <div className="hidden xl:flex shrink-0 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </AuthProvider>
  );
}
