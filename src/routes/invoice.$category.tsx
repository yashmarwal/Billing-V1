import { createFileRoute, useParams, Link, notFound } from "@tanstack/react-router";
import { getTemplateConfig } from "@/lib/template-configs";
import { TemplateInvoicePage } from "@/components/TemplateInvoicePage";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/invoice/$category")({
  component: InvoiceRoute,
  loader: ({ params }) => {
    try {
      return getTemplateConfig(params.category);
    } catch {
      throw notFound();
    }
  },
});

function InvoiceRoute() {
  const { category } = useParams({ from: "/invoice/$category" });
  const config = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-muted/30 animate-in fade-in duration-300">
      {/* Breadcrumb bar */}
      <div className="no-print border-b bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 group"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            All Categories
          </Link>
          <span className="text-xs text-muted-foreground/40">/</span>
          <span className="text-xs font-medium text-foreground">{config.displayName}</span>
        </div>
      </div>

      <TemplateInvoicePage config={config} category={category} />
    </div>
  );
}
