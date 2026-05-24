import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Printer, FilePlus, Settings2, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { ScaledA4 } from "./ScaledA4";

interface Props {
  config: TemplateConfig;
  category: string;
}

// ── Settings sheet ────────────────────────────────────────────────────────────

interface SettingsSheetProps {
  data: TemplateInvoiceData;
  setSetting: <K extends keyof TemplateInvoiceData["settings"]>(
    k: K,
    v: TemplateInvoiceData["settings"][K],
  ) => void;
}

function SettingsSheet({ data, setSetting }: SettingsSheetProps) {
  return (
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
          {(
            [
              { key: "roundOff" as const, label: "Round off grand total", desc: "Rounds to nearest rupee" },
              { key: "saveToLocal" as const, label: "Auto-save to device", desc: "Saves in browser storage" },
              { key: "watermark" as const, label: "Show watermark", desc: "Adds faint business name" },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={data.settings[key]}
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
                  className={`px-2 py-1 transition-colors duration-150 ${
                    data.settings.taxMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {mode === "cgst-sgst" ? "CGST+SGST" : "IGST"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function TemplateInvoicePage({ config, category }: Props) {
  const [data, setData] = useState<TemplateInvoiceData>(() => emptyTemplateInvoice(config));
  const [hydrated, setHydrated] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

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
    setData(emptyTemplateInvoice(config));
    clearTemplateInvoice(category);
    toast.success("Started a new invoice");
  };

  const invoiceEl =
    config.category === "manufacturer" ? (
      <ManufacturerPreview config={config} data={data} />
    ) : (
      <TemplatePreview config={config} data={data} />
    );

  return (
    <div className="max-w-400 mx-auto">
      <Toaster position="top-center" />

      {/* ── Desktop toolbar ── */}
      <div className="no-print hidden lg:flex px-4 py-3 items-center gap-2 flex-wrap border-b bg-background/60">
        <span className="text-sm font-semibold mr-1">{config.documentTitle}</span>
        <span className="text-xs text-muted-foreground">— {config.displayName}</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onNew}>
            <FilePlus className="h-4 w-4 mr-1" /> New
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print / PDF
          </Button>
          <SettingsSheet data={data} setSetting={setSetting} />
        </div>
      </div>

      {/* ── Desktop two-panel layout ── */}
      <div className="hidden lg:grid px-4 py-6 gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <section className="no-print">
          <div className="rounded-xl border bg-card p-4 lg:sticky lg:top-26">
            <TemplateForm config={config} data={data} onChange={setData} />
          </div>
        </section>
        <section className="invoice-area">
          <ScaledA4>{invoiceEl}</ScaledA4>
        </section>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden no-print">

        {/* Edit tab content */}
        {mobileTab === "edit" && (
          <div className="px-4 pt-5 pb-28 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold leading-tight">{config.documentTitle}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{config.displayName}</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs px-2.5"
                  onClick={onNew}
                >
                  <FilePlus className="h-3.5 w-3.5" /> New
                </Button>
                <SettingsSheet data={data} setSetting={setSetting} />
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <TemplateForm config={config} data={data} onChange={setData} />
            </div>
          </div>
        )}

        {/* Preview tab content */}
        {mobileTab === "preview" && (
          <div className="pt-4 pb-28">
            <div className="flex items-center justify-between px-4 mb-3">
              <p className="text-xs font-medium text-muted-foreground">{config.displayName}</p>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs px-3"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </Button>
            </div>
            <div className="px-3">
              <ScaledA4>{invoiceEl}</ScaledA4>
            </div>
          </div>
        )}

        {/* Bottom tab bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur-sm">
          <div className="flex">
            {(["edit", "preview"] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors duration-150",
                  mobileTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setMobileTab(tab)}
              >
                {tab === "edit" ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                {tab === "edit" ? "Edit" : "Preview"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Print-only */}
      <div className="print-only">{invoiceEl}</div>
    </div>
  );
}
