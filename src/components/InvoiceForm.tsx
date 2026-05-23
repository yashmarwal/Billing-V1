import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ItemRowEditor } from "./ItemRowEditor";
import { type InvoiceData } from "@/lib/calculations";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const steps = ["Business", "Buyer", "Invoice", "Items"] as const;

export function InvoiceForm({ data, onChange }: Props) {
  const [step, setStep] = useState(0);
  const set = <K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) => onChange({ ...data, [k]: v });
  const b = data.business, buyer = data.buyer, inv = data.invoice;

  const handleLogo = (file: File) => {
    const r = new FileReader();
    r.onload = () => set("business", { ...b, logo: String(r.result) });
    r.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
              i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Accordion type="single" collapsible defaultValue="basics">
          <AccordionItem value="basics">
            <AccordionTrigger>Business Basics</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <Field label="Business Name"><Input value={b.name} onChange={(e) => set("business", { ...b, name: e.target.value })} /></Field>
              <Field label="Tagline / Line of Business"><Input value={b.tagline} onChange={(e) => set("business", { ...b, tagline: e.target.value })} /></Field>
              <Field label="Logo (upload or initials text)">
                <div className="flex gap-2">
                  <Input placeholder="e.g. AB" value={b.logo.startsWith("data:") ? "" : b.logo} onChange={(e) => set("business", { ...b, logo: e.target.value })} />
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
                </div>
              </Field>
              <Field label="Address"><Textarea rows={2} value={b.address} onChange={(e) => set("business", { ...b, address: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Phone"><Input value={b.phone} onChange={(e) => set("business", { ...b, phone: e.target.value })} /></Field>
                <Field label="Email"><Input value={b.email} onChange={(e) => set("business", { ...b, email: e.target.value })} /></Field>
              </div>
              <Field label="GSTIN"><Input value={b.gstin} placeholder="22AAAAA0000A1Z5" onChange={(e) => set("business", { ...b, gstin: e.target.value.toUpperCase() })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="State"><Input value={b.state} onChange={(e) => set("business", { ...b, state: e.target.value })} /></Field>
                <Field label="State Code"><Input value={b.stateCode} onChange={(e) => set("business", { ...b, stateCode: e.target.value })} /></Field>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="bank">
            <AccordionTrigger>Bank Details</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <Field label="Bank Name"><Input value={b.bankName} onChange={(e) => set("business", { ...b, bankName: e.target.value })} /></Field>
              <Field label="Account No"><Input value={b.accountNo} onChange={(e) => set("business", { ...b, accountNo: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="IFSC"><Input value={b.ifsc} onChange={(e) => set("business", { ...b, ifsc: e.target.value.toUpperCase() })} /></Field>
                <Field label="Branch"><Input value={b.branch} onChange={(e) => set("business", { ...b, branch: e.target.value })} /></Field>
              </div>
              <Field label="Terms & Conditions"><Textarea rows={3} value={b.terms} onChange={(e) => set("business", { ...b, terms: e.target.value })} /></Field>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <Field label="Buyer Name"><Input value={buyer.name} onChange={(e) => set("buyer", { ...buyer, name: e.target.value })} /></Field>
          <Field label="Buyer Address"><Textarea rows={2} value={buyer.address} onChange={(e) => set("buyer", { ...buyer, address: e.target.value })} /></Field>
          <Field label="Buyer GSTIN"><Input value={buyer.gstin} onChange={(e) => set("buyer", { ...buyer, gstin: e.target.value.toUpperCase() })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="State"><Input value={buyer.state} onChange={(e) => set("buyer", { ...buyer, state: e.target.value })} /></Field>
            <Field label="State Code"><Input value={buyer.stateCode} onChange={(e) => set("buyer", { ...buyer, stateCode: e.target.value })} /></Field>
          </div>
          <Field label="Place of Supply"><Input value={buyer.placeOfSupply} onChange={(e) => set("buyer", { ...buyer, placeOfSupply: e.target.value })} /></Field>
          <p className="text-xs text-muted-foreground">
            Tip: if buyer state code matches your business state code, CGST + SGST is applied. Otherwise IGST.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Invoice Number"><Input value={inv.number} onChange={(e) => set("invoice", { ...inv, number: e.target.value })} /></Field>
            <Field label="Invoice Date"><Input type="date" value={inv.date} onChange={(e) => set("invoice", { ...inv, date: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="GR No"><Input value={inv.grNo} onChange={(e) => set("invoice", { ...inv, grNo: e.target.value })} /></Field>
            <Field label="Challan No"><Input value={inv.challanNo} onChange={(e) => set("invoice", { ...inv, challanNo: e.target.value })} /></Field>
          </div>
          <Field label="Transport By"><Input value={inv.transportBy} onChange={(e) => set("invoice", { ...inv, transportBy: e.target.value })} /></Field>
          <Field label="Order Reference (optional)"><Input value={inv.orderRef} onChange={(e) => set("invoice", { ...inv, orderRef: e.target.value })} /></Field>
        </div>
      )}

      {step === 3 && <ItemRowEditor items={data.items} onChange={(items) => set("items", items)} />}

      <div className="flex justify-between pt-2">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((x) => x - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
        <Button disabled={step === steps.length - 1} onClick={() => setStep((x) => x + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

