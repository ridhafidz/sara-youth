import {
  Globe,
  TrendingUp,
  Activity,
  FileText,
  Lightbulb,
} from "lucide-react";

interface FeatureCardData {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  href: string;
}

const FEATURES: FeatureCardData[] = [
  {
    id: "sdgs-mapping",
    label: "SDGs Mapping",
    sublabel: "Panel",
    icon: <Globe size={22} strokeWidth={1.5} className="text-[var(--sara-primary-dark)]" />,
    href: "/sdgs-programs",
  },
  {
    id: "impact-score",
    label: "Impact Score",
    sublabel: "Indicator",
    icon: <TrendingUp size={22} strokeWidth={1.5} className="text-[var(--sara-primary-dark)]" />,
    href: "/impact-assessment",
  },
  {
    id: "impact-tracker",
    label: "Impact Indicator",
    sublabel: "Tracker",
    icon: <Activity size={22} strokeWidth={1.5} className="text-[var(--sara-primary-dark)]" />,
    href: "/impact-insights",
  },
  {
    id: "sdgs-report",
    label: "SDGs Impact",
    sublabel: "Report",
    icon: <FileText size={22} strokeWidth={1.5} className="text-[var(--sara-primary-dark)]" />,
    href: "/sdgs-reports",
  },
  {
    id: "improvement",
    label: "Improvement",
    sublabel: "Recommendation Panel",
    icon: <Lightbulb size={22} strokeWidth={1.5} className="text-[var(--sara-primary-dark)]" />,
    href: "/improvements",
  },
];

export function FeatureGrid() {
  return (
    <section aria-labelledby="feature-heading">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="feature-heading"
          className="text-base font-semibold text-[var(--sara-text-primary)]"
        >
          Feature
        </h2>
        <button
          className="text-sm font-medium transition hover:underline"
          style={{ color: "var(--sara-primary)" }}
          aria-label="See all features"
        >
          See All
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FEATURES.map((feat) => (
          <a
            key={feat.id}
            href={feat.href}
            className="feature-card group rounded-[var(--sara-radius-md)] p-5 flex flex-col justify-between cursor-pointer select-none"
            style={{
              background: "var(--sara-primary)",
              boxShadow: "var(--sara-shadow-card)",
              aspectRatio: "1 / 1",
              minHeight: 120,
            }}
            aria-label={`${feat.label} ${feat.sublabel}`}
          >
            {/* Icon container — white pill on top */}
            <div
              className="w-10 h-10 rounded-[var(--sara-radius-sm)] flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              {feat.icon}
            </div>

            {/* Label — bottom, white bold */}
            <div className="mt-auto">
              <p className="text-white font-bold text-sm leading-snug">
                {feat.label}
              </p>
              <p className="text-white/75 font-medium text-xs leading-snug">
                {feat.sublabel}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
