import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Printer, FilePlus, Settings2, Eye, X } from "lucide-react";
import type { TemplateConfig, TemplateInvoiceData } from "@/lib/types";
import {
  emptyTemplateInvoice,
  saveTemplateInvoice,
  loadTemplateInvoice,
  clearTemplateInvoice,
} from "@/lib/invoice-storage";
import { TemplateForm } from "./TemplateForm";
import { TemplatePreview } from "./TemplatePreview";
import { ManufacturerPreview } from "./ManufacturerPreview";

interface Props {
  config: TemplateConfig;
  category: string;
}

export function TemplateInvoicePage({ config, category }: Props) {
  const [data, setData] = useState<TemplateInvoiceData>(() => emptyTemplateInvoice(config));
  const [hydrated, setHydrated] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  useEffect(() => {
    const saved = loadTemplateInvoice(category);
    if (saved) setData(saved);
    setHydrated(true);
  }, [category]);

  useEffect(() => {
    if (hydrated && data.settings.saveToLocal) {
      saveTemplateInvoice(category, data);
    }
  }, [data, hydrated, category]);

  const setSetting = <K extends keyof TemplateInvoiceData["settings"]>(
    k: K,
    v: TemplateInvoiceData["settings"][K],
  ) => setData((prev) => ({ ...prev, settings: { ...prev.settings, [k]: v } }));

  const onNew = () => {
    if (!confirm("Clear this invoice and start fresh?")) return;
    const fresh = emptyTemplateInvoice(config);
    setData(fresh);
    clearTemplateInvoice(category);
    toast.success("Started a new invoice");
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <Toaster position="top-center" />

      {/* Toolbar */}
      <div className="no-print px-4 py-3 flex items-center gap-2 flex-wrap border-b bg-background/60">
        <span className="text-sm font-semibold mr-1">{config.documentTitle}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">— {config.displayName}</span>
        <div className="ml-auto flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onNew}>
            <FilePlus className="h-4 w-4 mr-1" /> New
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print / PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobilePreview(true)}
          >
            <Eye className="h-4 w-4 mr-1" /> Preview
          </Button>

          {/* Settings sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" title="Settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[320px] flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4" /> Invoice Settings
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Preferences saved with this invoice.
                </SheetDescription>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="space-y-3 flex-1">
                {[
                  { key: "roundOff" as const, label: "Round off grand total", desc: "Rounds to nearest rupee" },
                  { key: "saveToLocal" as const, label: "Auto-save to device", desc: "Saves in browser storage" },
                  { key: "watermark" as const, label: "Show watermark", desc: "Adds faint business name" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between rounded-xl border bg-card p-4">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={data.settings[key] as boolean}
                      onCheckedChange={(v) => setSetting(key, v)}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <div>
                    <p className="text-sm font-medium">Tax Mode</p>
                    <p className="text-[11px] text-muted-foreground">CGST+SGST or IGST</p>
                  </div>
                  <div className="flex rounded-lg overflow-hidden border text-xs font-medium">
                    {(["cgst-sgst", "igst"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSetting("taxMode", mode)}
                        className={`px-2 py-1 transition-colors duration-150 ${data.settings.taxMode === mode ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                      >
                        {mode === "cgst-sgst" ? "CGST+SGST" : "IGST"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        {/* Form panel */}
        <section className="no-print">
          <div className="rounded-xl border bg-card p-4 lg:sticky lg:top-[104px]">
            <TemplateForm config={config} data={data} onChange={setData} />
          </div>
        </section>

        {/* Preview panel (desktop) */}
        <section className="invoice-area hidden lg:block overflow-x-auto">
          {config.category === "manufacturer"
            ? <ManufacturerPreview config={config} data={data} />
            : <TemplatePreview config={config} data={data} />}
        </section>
      </div>

      {/* Mobile preview overlay */}
      {mobilePreview && (
        <div className="lg:hidden no-print fixed inset-0 z-40 bg-background overflow-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="sticky top-0 flex items-center justify-between p-3 bg-background border-b">
            <span className="text-sm font-medium">Preview</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setMobilePreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-3 overflow-x-auto">
            {config.category === "manufacturer"
              ? <ManufacturerPreview config={config} data={data} />
              : <TemplatePreview config={config} data={data} />}
          </div>
        </div>
      )}

      {/* Print-only */}
      <div className="print-only">
        {config.category === "manufacturer"
          ? <ManufacturerPreview config={config} data={data} />
          : <TemplatePreview config={config} data={data} />}
      </div>
    </div>
  );
}
