import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ALL_CATEGORIES } from "@/lib/template-configs";
import type { TemplateConfig } from "@/lib/types";
import {
  GraduationCap, ShoppingCart, UtensilsCrossed, Stethoscope,
  Briefcase, HardHat, Truck, Scissors, Factory, ArrowRight, FileText,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, ShoppingCart, UtensilsCrossed, Stethoscope,
  Briefcase, HardHat, Truck, Scissors, Factory,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string; ring: string }> = {
  coaching:     { bg: "bg-violet-50",  icon: "text-violet-600",  border: "border-violet-200", ring: "ring-violet-200" },
  retail:       { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", ring: "ring-emerald-200" },
  restaurant:   { bg: "bg-orange-50",  icon: "text-orange-600",  border: "border-orange-200", ring: "ring-orange-200" },
  medical:      { bg: "bg-red-50",     icon: "text-red-600",     border: "border-red-200",    ring: "ring-red-200" },
  freelance:    { bg: "bg-blue-50",    icon: "text-blue-600",    border: "border-blue-200",   ring: "ring-blue-200" },
  construction: { bg: "bg-yellow-50",  icon: "text-yellow-700",  border: "border-yellow-200", ring: "ring-yellow-200" },
  transport:    { bg: "bg-cyan-50",    icon: "text-cyan-700",    border: "border-cyan-200",   ring: "ring-cyan-200" },
  salon:        { bg: "bg-pink-50",    icon: "text-pink-600",    border: "border-pink-200",   ring: "ring-pink-200" },
  manufacturer: { bg: "bg-stone-50",   icon: "text-stone-700",   border: "border-stone-200",  ring: "ring-stone-200" },
};

function CategoryCard({ config, index }: { config: TemplateConfig; index: number }) {
  const navigate = useNavigate();
  const Icon = ICON_MAP[config.icon] ?? FileText;
  const colors = COLOR_MAP[config.category] ?? COLOR_MAP.freelance;

  const handleClick = () =>
    navigate({ to: "/invoice/$category", params: { category: config.category } });

  return (
    <button
      onClick={handleClick}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both", animationDuration: "380ms" }}
      className="group relative w-full text-left rounded-2xl border bg-card transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in slide-in-from-bottom-4 active:scale-[0.98]"
    >
      {/* ── Mobile: horizontal row ── */}
      <div className="flex sm:hidden items-center gap-3 px-4 py-3.5">
        <div
          className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl ${colors.bg} ${colors.border} border transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors duration-200">
            {config.displayName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-snug">
            {config.description}
          </p>
        </div>
        <ArrowRight
          className={`h-4 w-4 ${colors.icon} shrink-0 opacity-35 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200`}
        />
      </div>

      {/* ── Desktop: vertical card ── */}
      <div className="hidden sm:block p-6">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border mb-4 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors duration-200">
          {config.displayName}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed pr-6">
          {config.description}
        </p>
        <span className="absolute bottom-5 right-5 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
          <ArrowRight className={`h-4 w-4 ${colors.icon}`} />
        </span>
        <span
          className={`absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2 ${colors.ring} pointer-events-none`}
        />
      </div>
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-base sm:text-lg shadow-sm shrink-0">
            ₹
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">DataFirst Bill</h1>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">
              Free · Offline · Your data stays on device
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-7 sm:mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs text-muted-foreground mb-3 sm:mb-4 font-medium">
            <FileText className="h-3 w-3" />
            9 industry templates · 100% offline · No login required
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
            Generate professional bills
            <br className="hidden sm:block" />
            {" "}for any industry
          </h2>
          <p className="text-muted-foreground max-w-sm sm:max-w-md mx-auto text-sm leading-relaxed">
            Pick your industry below. Every template is pre-configured with the right
            fields, tax rules, and document format your business needs.
          </p>
        </div>

        {/* Category grid — 1 col on mobile (horizontal rows), 2 col sm, 3 col md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {ALL_CATEGORIES.map((config, i) => (
            <CategoryCard key={config.category} config={config} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p
          className="text-center text-xs text-muted-foreground mt-8 sm:mt-10 animate-in fade-in duration-700"
          style={{ animationDelay: "500ms", animationFillMode: "both" }}
        >
          All calculations are done in your browser. Nothing is sent to any server.
        </p>
      </main>
    </div>
  );
}
