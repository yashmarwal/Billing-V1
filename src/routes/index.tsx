import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ALL_CATEGORIES } from "@/lib/template-configs";
import type { TemplateConfig } from "@/lib/types";
import {
  GraduationCap, ShoppingCart, UtensilsCrossed, Stethoscope,
  Briefcase, HardHat, Truck, Scissors, ArrowRight, FileText,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, ShoppingCart, UtensilsCrossed, Stethoscope,
  Briefcase, HardHat, Truck, Scissors,
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
};

function CategoryCard({ config, index }: { config: TemplateConfig; index: number }) {
  const navigate = useNavigate();
  const Icon = ICON_MAP[config.icon] ?? FileText;
  const colors = COLOR_MAP[config.category];

  return (
    <button
      onClick={() => navigate({ to: "/invoice/$category", params: { category: config.category } })}
      className="group relative text-left rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both", animationDuration: "400ms" }}
    >
      {/* icon blob */}
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${colors.icon}`} />
      </div>

      <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors duration-200">
        {config.displayName}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed pr-6">
        {config.description}
      </p>

      {/* arrow */}
      <span className="absolute bottom-5 right-5 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
        <ArrowRight className={`h-4 w-4 ${colors.icon}`} />
      </span>

      {/* subtle hover ring */}
      <span className={`absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2 ${colors.ring} pointer-events-none`} />
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      {/* Hero header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-lg shadow-sm">
            ₹
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">DataFirst Bill</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">Free · Offline · Your data stays on device</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero text */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs text-muted-foreground mb-4 font-medium">
            <FileText className="h-3 w-3" />
            8 industry templates · 100% offline · No login required
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Generate professional bills<br className="hidden sm:block" /> for any industry
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Pick your industry below. Every template is pre-configured with the right fields,
            tax rules, and document format that your business actually needs.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_CATEGORIES.map((config, i) => (
            <CategoryCard key={config.category} config={config} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-10 animate-in fade-in duration-700" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
          All calculations are done in your browser. Nothing is sent to any server.
        </p>
      </main>
    </div>
  );
}
