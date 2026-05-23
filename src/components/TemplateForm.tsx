import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Copy,
  Building2, User, List, FileText, Receipt, Upload, X,
} from "lucide-react";
import type { TemplateConfig, TemplateInvoiceData, TemplateItem, FieldDef } from "@/lib/types";
import { computeLineAmount } from "@/lib/calculations";

interface Props {
  config: TemplateConfig;
  data: TemplateInvoiceData;
  onChange: (data: TemplateInvoiceData) => void;
}

const STEP_META = [
  { label: "Sender", icon: Building2 },
  { label: "Receiver", icon: User },
  { label: "Items", icon: List },
  { label: "Details", icon: FileText },
  { label: "Summary", icon: Receipt },
] as const;

export function TemplateForm({ config, data, onChange }: Props) {
  const [step, setStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [animDir, setAnimDir] = useState<1 | -1>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSteps = STEP_META.length;

  const goTo = (next: number) => {
    if (next === displayStep || isTransitioning) return;
    setAnimDir(next > displayStep ? 1 : -1);
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setDisplayStep(next);
      setIsTransitioning(false);
    }, 180);
  };

  const setSender = (k: string, v: string) =>
    onChange({ ...data, sender: { ...data.sender, [k]: v } });
  const setReceiver = (k: string, v: string) =>
    onChange({ ...data, receiver: { ...data.receiver, [k]: v } });
  const setExtra = (k: string, v: string) =>
    onChange({ ...data, extraFields: { ...data.extraFields, [k]: v } });
  const setTaxEnabled = (k: string, v: boolean) =>
    onChange({ ...data, taxEnabled: { ...data.taxEnabled, [k]: v } });

  const addItem = () => {
    const blank: TemplateItem = { id: crypto.randomUUID() };
    for (const col of config.lineItemColumns) blank[col.key] = col.type === "number" ? 0 : "";
    onChange({ ...data, items: [...data.items, blank] });
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    onChange({ ...data, items: data.items.filter((it) => it.id !== id) });
  };

  const dupItem = (id: string) => {
    const idx = data.items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    const copy = { ...data.items[idx], id: crypto.randomUUID() };
    const next = [...data.items];
    next.splice(idx + 1, 0, copy);
    onChange({ ...data, items: next });
  };

  const updateItem = (id: string, key: string, value: string | number) => {
    onChange({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    });
  };

  // totals for summary step
  const subtotal = data.items.reduce((s, it) => s + computeLineAmount(it, config.lineItemCompute), 0);
  const enabledTaxes = config.taxes.filter((t) => data.taxEnabled[t.key] ?? t.enabled);
  const taxTotal = enabledTaxes
    .filter((t) => !t.isDeduction)
    .reduce((s, t) => s + (subtotal * t.rate) / 100, 0);
  const deductions = enabledTaxes
    .filter((t) => t.isDeduction)
    .reduce((s, t) => s + (subtotal * t.rate) / 100, 0);
  const grand = data.settings.roundOff
    ? Math.round(subtotal + taxTotal - deductions)
    : subtotal + taxTotal - deductions;

  return (
    <div className="space-y-4">
      {/* Step tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STEP_META.map(({ label, icon: Icon }, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
              i === displayStep
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((displayStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Animated step content */}
      <div
        className={cn(
          "transition-all duration-180 ease-in-out",
          isTransitioning
            ? animDir === 1
              ? "opacity-0 -translate-x-3"
              : "opacity-0 translate-x-3"
            : "opacity-100 translate-x-0",
        )}
      >
        {step === 0 && (
          <div className="space-y-3">
            <LogoUploadField
              value={data.sender.logo ?? ""}
              onChange={(v) => setSender("logo", v)}
            />
            <FieldsPanel
              title={`${config.senderLabel} Information`}
              fields={config.senderFields}
              values={data.sender}
              onChange={setSender}
              context={data.sender}
            />
          </div>
        )}
        {step === 1 && (
          <FieldsPanel
            title={`${config.receiverLabel} Information`}
            fields={config.receiverFields}
            values={data.receiver}
            onChange={setReceiver}
            context={data.receiver}
          />
        )}
        {step === 2 && (
          <ItemsPanel
            config={config}
            items={data.items}
            onAdd={addItem}
            onRemove={removeItem}
            onDup={dupItem}
            onUpdate={updateItem}
            compute={config.lineItemCompute}
          />
        )}
        {step === 3 && (
          <FieldsPanel
            title="Invoice Details"
            fields={config.extraFields}
            values={data.extraFields}
            onChange={setExtra}
            context={data.extraFields}
          />
        )}
        {step === 4 && (
          <SummaryPanel
            config={config}
            data={data}
            subtotal={subtotal}
            taxTotal={taxTotal}
            deductions={deductions}
            grand={grand}
            onTaxToggle={setTaxEnabled}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={displayStep === 0}
          onClick={() => goTo(displayStep - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          size="sm"
          disabled={displayStep === totalSteps - 1}
          onClick={() => goTo(displayStep + 1)}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ── FieldsPanel ──────────────────────────────────────────────────────────────

interface FieldsPanelProps {
  title: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  context: Record<string, string>;
}

function FieldsPanel({ title, fields, values, onChange, context }: FieldsPanelProps) {
  const visibleFields = fields.filter((f) => {
    if (!f.conditional) return true;
    return context[f.conditional.field] === f.conditional.value;
  });

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {visibleFields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={values[f.key] ?? ""}
            onChange={(v) => onChange(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const colSpan = field.span === "full" ? "col-span-2" : "";
  const labelNode = (
    <Label htmlFor={id} className="text-xs flex items-center gap-1">
      {field.label}
      {field.optional && <span className="text-muted-foreground/60 text-[10px]">(optional)</span>}
    </Label>
  );

  if (field.type === "textarea") {
    return (
      <div className={cn("space-y-1", colSpan)}>
        {labelNode}
        <Textarea
          id={id}
          rows={2}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm resize-none"
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={cn("space-y-1", colSpan)}>
        {labelNode}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", colSpan)}>
      {labelNode}
      <Input
        id={id}
        type={field.type === "number" ? "number" : field.type}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
        onWheel={field.type === "number" ? (e) => (e.target as HTMLInputElement).blur() : undefined}
      />
    </div>
  );
}

// ── LogoUploadField ──────────────────────────────────────────────────────────

function LogoUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Business Logo <span className="text-[10px]">(optional)</span></p>
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="logo" className="h-12 max-w-[120px] object-contain rounded border bg-muted/20" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium bg-background hover:bg-muted transition-colors">
          <Upload className="h-3.5 w-3.5" />
          Upload Logo (PNG / JPG / SVG)
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onChange(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />
        </label>
      )}
    </div>
  );
}

// ── ItemsPanel ───────────────────────────────────────────────────────────────

interface ItemsPanelProps {
  config: TemplateConfig;
  items: TemplateItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onDup: (id: string) => void;
  onUpdate: (id: string, key: string, value: string | number) => void;
  compute: TemplateConfig["lineItemCompute"];
}

function ItemsPanel({ config, items, onAdd, onRemove, onDup, onUpdate, compute }: ItemsPanelProps) {
  const editableCols = config.lineItemColumns.filter((c) => !c.computed);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Line Items</h3>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const amount = computeLineAmount(item, compute);
          return (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Item {idx + 1}
                  <span className="ml-2 text-foreground font-bold">
                    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDup(item.id)} title="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(item.id)} title="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {editableCols.map((col) => (
                  <div
                    key={col.key}
                    className={cn("space-y-1", col.width && col.width >= 30 ? "col-span-2" : "")}
                  >
                    <Label className="text-[11px] text-muted-foreground">{col.label}</Label>
                    {col.type === "select" ? (
                      <select
                        value={String(item[col.key] ?? "")}
                        onChange={(e) => onUpdate(item.id, col.key, e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select…</option>
                        {col.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <Input
                        type={col.type === "number" ? "number" : "text"}
                        value={item[col.key] === 0 && col.type === "number" ? "" : String(item[col.key] ?? "")}
                        placeholder={col.placeholder ?? (col.type === "number" ? "0" : "")}
                        className="h-8 text-xs"
                        min={col.type === "number" ? 0 : undefined}
                        onWheel={col.type === "number" ? (e) => (e.target as HTMLInputElement).blur() : undefined}
                        onChange={(e) => {
                          const v = col.type === "number"
                            ? (e.target.value === "" ? 0 : Number(e.target.value))
                            : e.target.value;
                          onUpdate(item.id, col.key, v);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> Add Item
      </Button>
    </div>
  );
}

// ── SummaryPanel ─────────────────────────────────────────────────────────────

interface SummaryPanelProps {
  config: TemplateConfig;
  data: TemplateInvoiceData;
  subtotal: number;
  taxTotal: number;
  deductions: number;
  grand: number;
  onTaxToggle: (key: string, enabled: boolean) => void;
}

function SummaryPanel({ config, data, subtotal, taxTotal, deductions, grand, onTaxToggle }: SummaryPanelProps) {
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tax & Summary</h3>

      {/* Tax toggles */}
      <div className="space-y-2">
        {config.taxes.length === 0 && (
          <div className="text-xs text-muted-foreground italic border rounded-lg p-3 bg-muted/30">
            Tax rates are set in the <strong>Invoice Details</strong> step (SGST / CGST / IGST %).
          </div>
        )}
        {config.taxes.map((t) => (
          <div key={t.key} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div>
              <p className="text-xs font-medium">{t.label}</p>
              {t.note && <p className="text-[10px] text-muted-foreground">{t.note}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {t.enabled || (data.taxEnabled[t.key] ?? t.enabled) ? (
                <span className="text-xs text-muted-foreground">
                  ₹{fmt((subtotal * t.rate) / 100)}
                </span>
              ) : null}
              {t.toggleable ? (
                <Switch
                  checked={data.taxEnabled[t.key] ?? t.enabled}
                  onCheckedChange={(v) => onTaxToggle(t.key, v)}
                  className="scale-90"
                />
              ) : (
                <span className="text-xs font-medium text-primary">ON</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{fmt(subtotal)}</span>
        </div>
        {config.taxes
          .filter((t) => !t.isDeduction && (data.taxEnabled[t.key] ?? t.enabled))
          .map((t) => (
            <div key={t.key} className="flex justify-between text-muted-foreground">
              <span>{t.label}</span>
              <span>₹{fmt((subtotal * t.rate) / 100)}</span>
            </div>
          ))}
        {config.taxes
          .filter((t) => t.isDeduction && (data.taxEnabled[t.key] ?? t.enabled))
          .map((t) => (
            <div key={t.key} className="flex justify-between text-destructive">
              <span>{t.label}</span>
              <span>− ₹{fmt((subtotal * t.rate) / 100)}</span>
            </div>
          ))}
        <div className="border-t pt-2 flex justify-between font-bold text-base">
          <span>Grand Total</span>
          <span>₹{fmt(grand)}</span>
        </div>
      </div>

      {/* Notes preview */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">{config.notes}</p>
      </div>
    </div>
  );
}
