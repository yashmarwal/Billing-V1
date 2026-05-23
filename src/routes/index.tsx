import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import {
  emptyInvoice, loadCurrent, saveCurrent, saveDraft, listDrafts,
  deleteDraft, clearCurrent, resetAll, type Draft,
} from "@/lib/invoice-storage";
import type { InvoiceData } from "@/lib/calculations";
import {
  Printer, Save, FileDown, FolderOpen, RotateCcw, Eye, FileText,
  Trash2, Settings2, HardDrive, Hash, Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Free GST Invoice Generator — Offline, No Login" },
      { name: "description", content: "Create GST-compliant Indian invoices in seconds. Guided builder, live preview, print or save as PDF. 100% free, works offline, data stays on your device." },
    ],
  }),
});

function Index() {
  const [data, setData] = useState<InvoiceData>(() => emptyInvoice());
  const [hydrated, setHydrated] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const saved = loadCurrent();
    if (saved) setData(saved);
    setDrafts(listDrafts());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && data.settings.saveToLocal) saveCurrent(data);
  }, [data, hydrated]);

  const setSetting = <K extends keyof InvoiceData["settings"]>(k: K, v: InvoiceData["settings"][K]) =>
    setData((prev) => ({ ...prev, settings: { ...prev.settings, [k]: v } }));

  const onSaveDraft = () => {
    saveDraft(data);
    setDrafts(listDrafts());
    toast.success("Draft saved on this device");
  };
  const onLoadDraft = (d: Draft) => { setData(d.data); toast.success(`Loaded: ${d.name}`); };
  const onDeleteDraft = (id: string) => { deleteDraft(id); setDrafts(listDrafts()); };
  const onClear = () => { setData(emptyInvoice()); clearCurrent(); toast.success("Current invoice cleared"); };
  const onReset = () => {
    if (confirm("Erase ALL saved data on this device (business profile + drafts)?")) {
      resetAll(); setData(emptyInvoice()); setDrafts([]); toast.success("All data reset");
    }
  };
  const onDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${data.invoice.number || "invoice"}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const onPrint = () => window.print();

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-center" />

      {/* Top bar — hidden in print */}
      <header className="no-print sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">₹</div>
            <div>
              <h1 className="text-base font-bold leading-tight">GST Invoice Builder</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Free · Offline · Your data stays on this device</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm"><FolderOpen className="h-4 w-4 mr-1" />Drafts ({drafts.length})</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Saved Drafts</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-2">
                  {drafts.length === 0 && <p className="text-sm text-muted-foreground">No drafts yet. Click "Save Draft" to keep a copy.</p>}
                  {drafts.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded border p-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(d.savedAt).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onLoadDraft(d)}><FileText className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => onDeleteDraft(d.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={onSaveDraft}><Save className="h-4 w-4 mr-1" />Save Draft</Button>
            <Button variant="outline" size="sm" onClick={onDownloadJson}><FileDown className="h-4 w-4 mr-1" />JSON</Button>
            <Button variant="outline" size="sm" onClick={onClear}>Clear</Button>
            <Button variant="ghost" size="sm" onClick={onReset}><RotateCcw className="h-4 w-4 mr-1" />Reset All</Button>
            <Button size="sm" onClick={onPrint}><Printer className="h-4 w-4 mr-1" />Print / Save PDF</Button>

            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title="Settings">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[320px] sm:w-[360px] flex flex-col">
                <SheetHeader className="pb-2">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <Settings2 className="h-4 w-4 text-primary" />
                    </div>
                    Invoice Settings
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Preferences are saved automatically with your invoice.
                  </SheetDescription>
                </SheetHeader>

                <Separator className="my-4" />

                <div className="space-y-3 flex-1">
                  <SettingRow
                    icon={<Hash className="h-4 w-4" />}
                    title="Round off grand total"
                    description="Rounds the final amount to the nearest rupee"
                    checked={data.settings.roundOff}
                    onChange={(v) => setSetting("roundOff", v)}
                    delay={0}
                  />
                  <SettingRow
                    icon={<HardDrive className="h-4 w-4" />}
                    title="Auto-save to this device"
                    description="Keeps your progress in browser storage"
                    checked={data.settings.saveToLocal}
                    onChange={(v) => setSetting("saveToLocal", v)}
                    delay={60}
                  />
                  <SettingRow
                    icon={<Layers className="h-4 w-4" />}
                    title="Show watermark on preview"
                    description="Adds a faint business name behind the invoice"
                    checked={data.settings.watermark}
                    onChange={(v) => setSetting("watermark", v)}
                    delay={120}
                  />
                </div>

                <Separator className="my-4" />
                <p className="text-[11px] text-muted-foreground text-center pb-2">
                  All data stays on your device — nothing is sent to any server.
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="max-w-[1600px] mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="no-print">
          <div className="rounded-xl border bg-card p-4 lg:sticky lg:top-20">
            <h2 className="text-sm font-semibold mb-3">Guided Bill Builder</h2>
            <InvoiceForm data={data} onChange={setData} />
            <div className="lg:hidden mt-4">
              <Button className="w-full" variant="secondary" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-1" /> Show Live Preview
              </Button>
            </div>
          </div>
        </section>

        <section className="invoice-area">
          <div className="hidden lg:block">
            <InvoicePreview data={data} />
          </div>
        </section>
      </main>

      {/* Mobile preview */}
      {previewOpen && (
        <div className="lg:hidden no-print fixed inset-0 z-30 bg-background overflow-auto">
          <div className="sticky top-0 flex justify-end p-3 bg-background border-b">
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button size="sm" className="ml-2" onClick={onPrint}><Printer className="h-4 w-4 mr-1" />Print</Button>
          </div>
          <div className="p-3"><InvoicePreview data={data} /></div>
        </div>
      )}

      {/* Print-only invoice */}
      <div className="print-only">
        <InvoicePreview data={data} />
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  delay: number;
}

function SettingRow({ icon, title, description, checked, onChange, delay }: SettingRowProps) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-right-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both", animationDuration: "350ms" }}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
          checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="shrink-0"
      />
    </div>
  );
}
