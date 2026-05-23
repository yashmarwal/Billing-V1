export interface Item {
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstRate: number;
  notes?: string;
}

export interface Business {
  name: string;
  logo: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  terms: string;
}

export interface Buyer {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  placeOfSupply: string;
}

export interface InvoiceMeta {
  number: string;
  date: string;
  grNo: string;
  challanNo: string;
  transportBy: string;
  orderRef: string;
}

export interface Settings {
  roundOff: boolean;
  saveToLocal: boolean;
  watermark: boolean;
}

export interface InvoiceData {
  business: Business;
  buyer: Buyer;
  invoice: InvoiceMeta;
  items: Item[];
  settings: Settings;
}

// ── Template line-item computation ──────────────────────────────────────────
import type { ComputeMode, TemplateItem } from "./types";

export function computeLineAmount(item: TemplateItem, mode: ComputeMode): number {
  const qty = Number(item.qty) || 1;
  const rate = Number(item.rate) || 0;
  const amount = Number(item.amount) || 0;
  const disc = Number(item.discount) || 0;
  const discPct = Number(item.discountPct) || 0;

  switch (mode) {
    case "direct": return Math.max(0, amount);
    case "qty*rate": return Math.max(0, qty * rate);
    case "qty*rate-disc": return Math.max(0, qty * rate - disc);
    case "qty*rate*(1-discPct/100)": return Math.max(0, qty * rate * (1 - discPct / 100));
    default: return Math.max(0, amount);
  }
}

export function rowAmount(item: Item): number {
  const gross = (Number(item.qty) || 0) * (Number(item.rate) || 0);
  const disc = Number(item.discount) || 0;
  return Math.max(0, gross - disc);
}

export function calcTotals(data: InvoiceData) {
  const sameState =
    !!data.business.stateCode &&
    data.business.stateCode.trim() === data.buyer.stateCode.trim();

  const rows = data.items.map((i) => {
    const amount = rowAmount(i);
    const gstAmt = (amount * (Number(i.gstRate) || 0)) / 100;
    return {
      amount,
      gstAmt,
      cgst: sameState ? gstAmt / 2 : 0,
      sgst: sameState ? gstAmt / 2 : 0,
      igst: sameState ? 0 : gstAmt,
    };
  });

  const subtotal = rows.reduce((s, r) => s + r.amount, 0);
  const cgst = rows.reduce((s, r) => s + r.cgst, 0);
  const sgst = rows.reduce((s, r) => s + r.sgst, 0);
  const igst = rows.reduce((s, r) => s + r.igst, 0);
  const totalTax = cgst + sgst + igst;
  const preRound = subtotal + totalTax;
  const grand = data.settings.roundOff ? Math.round(preRound) : preRound;
  const roundOff = grand - preRound;

  return { rows, subtotal, cgst, sgst, igst, totalTax, grand, roundOff, sameState };
}

export const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function numberToWords(num: number): string {
  const n = Math.round(num);
  if (n === 0) return "Zero Rupees Only";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const inWords = (x: number): string => {
    if (x < 20) return a[x];
    if (x < 100) return b[Math.floor(x/10)] + (x%10 ? " " + a[x%10] : "");
    if (x < 1000) return a[Math.floor(x/100)] + " Hundred" + (x%100 ? " " + inWords(x%100) : "");
    if (x < 100000) return inWords(Math.floor(x/1000)) + " Thousand" + (x%1000 ? " " + inWords(x%1000) : "");
    if (x < 10000000) return inWords(Math.floor(x/100000)) + " Lakh" + (x%100000 ? " " + inWords(x%100000) : "");
    return inWords(Math.floor(x/10000000)) + " Crore" + (x%10000000 ? " " + inWords(x%10000000) : "");
  };
  return inWords(n) + " Rupees Only";
}
