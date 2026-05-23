import type { InvoiceData } from "./calculations";
import type { TemplateInvoiceData, TemplateConfig } from "./types";

const KEY_CURRENT = "gst_invoice_current";
const KEY_DRAFTS = "gst_invoice_drafts";
const KEY_BUSINESS = "gst_invoice_business";

export const emptyInvoice = (): InvoiceData => ({
  business: {
    name: "", logo: "", tagline: "", address: "", phone: "", email: "",
    gstin: "", state: "", stateCode: "", bankName: "", accountNo: "",
    ifsc: "", branch: "", terms: "Goods once sold will not be taken back.",
  },
  buyer: { name: "", address: "", gstin: "", state: "", stateCode: "", placeOfSupply: "" },
  invoice: {
    number: "INV-001",
    date: new Date().toISOString().slice(0, 10),
    grNo: "", challanNo: "", transportBy: "", orderRef: "",
  },
  items: [{ description: "", hsn: "", qty: 1, unit: "Nos", rate: 0, discount: 0, gstRate: 18, notes: "" }],
  settings: { roundOff: true, saveToLocal: true, watermark: false },
});

export function saveCurrent(data: InvoiceData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_CURRENT, JSON.stringify(data));
  localStorage.setItem(KEY_BUSINESS, JSON.stringify(data.business));
}

export function loadCurrent(): InvoiceData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY_CURRENT);
  if (!raw) {
    const biz = localStorage.getItem(KEY_BUSINESS);
    if (biz) {
      const d = emptyInvoice();
      d.business = JSON.parse(biz);
      return d;
    }
    return null;
  }
  try { return JSON.parse(raw); } catch { return null; }
}

export interface Draft { id: string; name: string; savedAt: string; data: InvoiceData; }

export function listDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_DRAFTS) || "[]"); } catch { return []; }
}

export function saveDraft(data: InvoiceData, name?: string) {
  const drafts = listDrafts();
  const draft: Draft = {
    id: crypto.randomUUID(),
    name: name || data.invoice.number || "Untitled",
    savedAt: new Date().toISOString(),
    data,
  };
  drafts.unshift(draft);
  localStorage.setItem(KEY_DRAFTS, JSON.stringify(drafts.slice(0, 50)));
  return draft;
}

export function deleteDraft(id: string) {
  localStorage.setItem(KEY_DRAFTS, JSON.stringify(listDrafts().filter((d) => d.id !== id)));
}

export function clearCurrent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_CURRENT);
}

export function resetAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_CURRENT);
  localStorage.removeItem(KEY_DRAFTS);
  localStorage.removeItem(KEY_BUSINESS);
}

// ── Template invoice storage (per-category) ─────────────────────────────────

function templateKey(category: string) {
  return `gst_template_${category}`;
}

export function emptyTemplateInvoice(config: TemplateConfig): TemplateInvoiceData {
  const taxEnabled: Record<string, boolean> = {};
  for (const t of config.taxes) taxEnabled[t.key] = t.enabled;

  const extraFields: Record<string, string> = {};
  for (const f of config.extraFields) {
    if (f.key === "invoiceDate" || f.key === "billDate" || f.key === "paymentDate" || f.key === "invoiceDate") {
      extraFields[f.key] = new Date().toISOString().slice(0, 10);
    } else {
      extraFields[f.key] = "";
    }
  }

  const blankItem: TemplateInvoiceData["items"][0] = { id: crypto.randomUUID() };
  for (const col of config.lineItemColumns) {
    blankItem[col.key] = col.type === "number" ? 0 : "";
  }

  return {
    category: config.category,
    sender: { logo: "", ...Object.fromEntries(config.senderFields.map((f) => [f.key, ""])) },
    receiver: Object.fromEntries(config.receiverFields.map((f) => [f.key, ""])),
    items: [blankItem],
    extraFields,
    taxEnabled,
    settings: {
      roundOff: false,
      saveToLocal: true,
      watermark: false,
      taxMode: "cgst-sgst",
      documentTitle: config.documentTitle,
    },
  };
}

export function saveTemplateInvoice(category: string, data: TemplateInvoiceData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(templateKey(category), JSON.stringify(data));
}

export function loadTemplateInvoice(category: string): TemplateInvoiceData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(templateKey(category));
  if (!raw) return null;
  try { return JSON.parse(raw) as TemplateInvoiceData; } catch { return null; }
}

export function clearTemplateInvoice(category: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(templateKey(category));
}
