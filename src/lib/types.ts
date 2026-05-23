export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "file"
  | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  conditional?: { field: string; value: string };
  span?: "full" | "half";
  prefix?: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  computed?: boolean;
  width?: number;
  optional?: boolean;
  prefix?: string;
  placeholder?: string;
}

export interface TaxDef {
  key: string;
  label: string;
  rate: number;
  enabled: boolean;
  toggleable: boolean;
  note?: string;
  group?: string;
  isDeduction?: boolean;
}

export type ComputeMode =
  | "direct"
  | "qty*rate"
  | "qty*rate-disc"
  | "qty*rate*(1-discPct/100)";

export interface TemplateConfig {
  category: string;
  displayName: string;
  icon: string;
  description: string;
  documentTitle: string;
  senderLabel: string;
  receiverLabel: string;
  senderFields: FieldDef[];
  receiverFields: FieldDef[];
  lineItemColumns: ColumnDef[];
  lineItemCompute: ComputeMode;
  extraFields: FieldDef[];
  taxes: TaxDef[];
  notes: string;
  showAmountInWords: boolean;
  showSignatureBlock: boolean;
  color: string;
  accentBg: string;
}

export interface TemplateItem {
  id: string;
  [key: string]: string | number;
}

export interface TemplateInvoiceData {
  category: string;
  sender: Record<string, string>;
  receiver: Record<string, string>;
  items: TemplateItem[];
  extraFields: Record<string, string>;
  taxEnabled: Record<string, boolean>;
  settings: {
    roundOff: boolean;
    saveToLocal: boolean;
    watermark: boolean;
    taxMode: "cgst-sgst" | "igst";
    documentTitle: string;
  };
}
