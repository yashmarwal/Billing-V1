import { computeLineAmount, numberToWords } from "@/lib/calculations";
import type { TemplateConfig, TemplateInvoiceData } from "@/lib/types";

interface Props {
  config: TemplateConfig;
  data: TemplateInvoiceData;
}

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TemplatePreview({ config, data }: Props) {
  const subtotal = data.items.reduce(
    (s, it) => s + computeLineAmount(it, config.lineItemCompute),
    0,
  );

  const enabledTaxes = config.taxes.filter((t) => data.taxEnabled[t.key] ?? t.enabled);
  const taxLines = enabledTaxes.filter((t) => !t.isDeduction);
  const deductionLines = enabledTaxes.filter((t) => t.isDeduction);
  const taxTotal = taxLines.reduce((s, t) => s + (subtotal * t.rate) / 100, 0);
  const totalDeductions = deductionLines.reduce((s, t) => s + (subtotal * t.rate) / 100, 0);
  const preRound = subtotal + taxTotal - totalDeductions;
  const grand = data.settings.roundOff ? Math.round(preRound) : preRound;
  const roundOff = grand - preRound;

  const docTitle = data.settings.documentTitle || config.documentTitle;
  const tipAmount = Number(data.extraFields.tipAmount) || 0;
  const grandWithTip = grand + tipAmount;

  // Columns to display (include computed amount column)
  const allCols = config.lineItemColumns;

  return (
    <div
      className="invoice-sheet bg-white text-black mx-auto shadow-sm border border-neutral-200 print:shadow-none print:border-0"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontSize: "10px",
        position: "relative",
        padding: "20px",
      }}
    >
      {/* Watermark */}
      {data.settings.watermark && (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", opacity: 0.05, pointerEvents: "none",
            fontSize: "100px", fontWeight: 900, transform: "rotate(-30deg)",
            color: "black",
          }}
        >
          {data.sender.name || config.senderLabel.toUpperCase()}
        </div>
      )}

      {/* Document title strip */}
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <div className="text-[9px] tracking-widest font-medium">{docTitle.toUpperCase()}</div>
      </div>

      {/* Header: sender info + extra fields side by side */}
      <div className="flex gap-4 border-b-2 border-black pb-3 mb-3">
        <div className="flex-1">
          <div className="text-xl font-bold">{data.sender.name || `[${config.senderLabel} Name]`}</div>
          {data.sender.tagline && <div className="text-[9px] italic">{data.sender.tagline}</div>}
          {data.sender.address && <div className="text-[9px] whitespace-pre-line mt-0.5">{data.sender.address}</div>}
          <div className="text-[9px] mt-0.5 space-y-0.5">
            {data.sender.contact && <div>Tel: {data.sender.contact}</div>}
            {data.sender.email && <div>Email: {data.sender.email}</div>}
            {data.sender.phone && <div>Ph: {data.sender.phone}</div>}
            {data.sender.gstin && <div className="font-semibold">GSTIN: {data.sender.gstin}</div>}
            {data.sender.fssai && <div>FSSAI: {data.sender.fssai}</div>}
            {data.sender.pan && <div>PAN: {data.sender.pan}</div>}
            {data.sender.regNumber && <div>Reg. No.: {data.sender.regNumber}</div>}
            {data.sender.licenseNo && <div>License: {data.sender.licenseNo}</div>}
          </div>
        </div>

        {/* Extra meta fields (invoice number, date, etc.) */}
        <div className="text-[9px] min-w-[130px]">
          <table className="w-full">
            <tbody>
              {config.extraFields.slice(0, 8).map((f) => {
                const val = data.extraFields[f.key];
                if (!val) return null;
                return (
                  <tr key={f.key}>
                    <td className="font-semibold py-0.5 pr-1 whitespace-nowrap">{f.label}:</td>
                    <td>{val}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sender/Receiver row */}
      <div className="grid grid-cols-2 border-b-2 border-black mb-3">
        <div className="p-2 border-r border-black">
          <div className="font-bold text-[9px] mb-1">{config.senderLabel}:</div>
          <ReceiverBlock label={config.receiverLabel} data={data} config={config} />
        </div>
        <div className="p-2">
          <SenderExtraBlock data={data} config={config} />
        </div>
      </div>

      {/* Items table */}
      <table className="w-full border-collapse border-b-2 border-black text-[9px] mb-3">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-black p-1 w-6 text-center">#</th>
            {allCols.map((col) => (
              <th key={col.key} className="border border-black p-1 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => {
            const amount = computeLineAmount(item, config.lineItemCompute);
            return (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{i + 1}</td>
                {allCols.map((col) => (
                  <td
                    key={col.key}
                    className={`border border-black p-1 ${col.type === "number" || col.computed ? "text-right" : ""}`}
                  >
                    {col.computed
                      ? `₹${fmt(amount)}`
                      : col.prefix && item[col.key]
                        ? `${col.prefix}${item[col.key]}`
                        : String(item[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
          {/* Blank filler rows */}
          {Array.from({ length: Math.max(0, 4 - data.items.length) }).map((_, i) => (
            <tr key={`e${i}`}>
              <td className="border border-black p-1">&nbsp;</td>
              {allCols.map((col) => (
                <td key={col.key} className="border border-black p-1">&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + words */}
      <div className="grid grid-cols-2 border-b-2 border-black mb-3">
        {/* Left: amount in words + bank details */}
        <div className="p-2 border-r border-black text-[9px]">
          {config.showAmountInWords && (
            <div className="mb-2">
              <div className="font-semibold">Amount in Words:</div>
              <div className="italic">{numberToWords(tipAmount > 0 ? grandWithTip : grand)}</div>
            </div>
          )}
          <BankDetails data={data} config={config} />
          {config.notes && (
            <div className="mt-2 text-[8px] text-neutral-600 border-t pt-1">{config.notes}</div>
          )}
        </div>

        {/* Right: tax breakdown + totals */}
        <div className="p-2 text-[9px]">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-0.5">Subtotal</td>
                <td className="text-right">₹{fmt(subtotal)}</td>
              </tr>
              {taxLines.map((t) => (
                <tr key={t.key}>
                  <td className="py-0.5">{t.label}</td>
                  <td className="text-right">₹{fmt((subtotal * t.rate) / 100)}</td>
                </tr>
              ))}
              {deductionLines.map((t) => (
                <tr key={t.key} className="text-red-700">
                  <td className="py-0.5">{t.label}</td>
                  <td className="text-right">− ₹{fmt((subtotal * t.rate) / 100)}</td>
                </tr>
              ))}
              {data.settings.roundOff && Math.abs(roundOff) > 0.001 && (
                <tr>
                  <td className="py-0.5">Round Off</td>
                  <td className="text-right">{roundOff >= 0 ? "+" : ""}₹{fmt(roundOff)}</td>
                </tr>
              )}
              {tipAmount > 0 && (
                <tr>
                  <td className="py-0.5">Tip (discretionary)</td>
                  <td className="text-right">₹{fmt(tipAmount)}</td>
                </tr>
              )}
              <tr className="font-bold border-t border-black text-[11px]">
                <td className="pt-1">Grand Total</td>
                <td className="text-right pt-1">
                  ₹{fmt(tipAmount > 0 ? grandWithTip : grand)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: terms + signature */}
      {config.showSignatureBlock ? (
        <div className="grid grid-cols-2 text-[9px]">
          <div className="p-2 border-r border-black">
            <div className="font-semibold mb-1">Terms & Conditions:</div>
            <div className="whitespace-pre-line text-neutral-700">{config.notes}</div>
          </div>
          <div className="p-2 text-right flex flex-col justify-between min-h-[80px]">
            <div className="font-semibold">
              For {data.sender.name || config.senderLabel}
            </div>
            <div className="border-t border-black pt-1 mt-10">Authorised Signatory</div>
          </div>
        </div>
      ) : (
        <div className="text-[8px] text-neutral-500 text-center pt-2">
          This is a computer-generated document.
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────────────────

function ReceiverBlock({ label, data, config }: { label: string; data: TemplateInvoiceData; config: TemplateConfig }) {
  const r = data.receiver;
  const primary = r.studentName || r.patientName || r.clientName || r.guestName || r.customerName || r.name || r.consignorName;
  const secondary = r.guardianName || r.company || r.consigneeName;
  const address = r.address || r.consignorAddress;
  const gstin = r.gstin;
  const contact = r.contact || r.phone;

  if (!primary && !address) {
    return <div className="text-neutral-400 italic">— {label} details not filled —</div>;
  }

  return (
    <div className="text-[9px] space-y-0.5">
      {primary && <div className="font-semibold">{primary}</div>}
      {secondary && <div>{secondary}</div>}
      {address && <div className="whitespace-pre-line">{address}</div>}
      {gstin && <div>GSTIN: {gstin}</div>}
      {contact && <div>Contact: {contact}</div>}
      {/* Template-specific fields */}
      {r.class && <div>Class: {r.class} {r.batch ? `| Batch: ${r.batch}` : ""}</div>}
      {r.rollNumber && <div>Roll No.: {r.rollNumber}</div>}
      {r.tableNo && <div>Table: {r.tableNo} {r.covers ? `| Covers: ${r.covers}` : ""}</div>}
      {r.orderType && <div>Order: {r.orderType}</div>}
      {r.age && <div>Age: {r.age} {r.gender ? `| ${r.gender}` : ""}</div>}
      {r.patientId && <div>Patient ID: {r.patientId}</div>}
      {r.projectRef && <div>Project Ref: {r.projectRef}</div>}
      {r.membershipId && <div>Membership: {r.membershipId}</div>}
      {config.category === "construction" && r.projectName && <div>Project: {r.projectName}</div>}
      {r.consigneeName && r.consignorName && (
        <div className="mt-1 pt-1 border-t border-neutral-200">
          <div className="font-semibold">Consignee:</div>
          <div>{r.consigneeName}</div>
          {r.consigneeAddress && <div className="whitespace-pre-line">{r.consigneeAddress}</div>}
        </div>
      )}
    </div>
  );
}

function SenderExtraBlock({ data, config }: { data: TemplateInvoiceData; config: TemplateConfig }) {
  const ef = data.extraFields;
  const fields = config.extraFields.slice(8); // remaining extra fields in right column
  if (fields.length === 0) {
    return (
      <div className="text-[9px] space-y-0.5">
        {ef.academicYear && <div><span className="font-semibold">Academic Year:</span> {ef.academicYear}</div>}
        {ef.course && <div><span className="font-semibold">Course:</span> {ef.course}</div>}
        {ef.paymentMode && <div><span className="font-semibold">Payment Mode:</span> {ef.paymentMode}</div>}
        {ef.paymentTerms && <div><span className="font-semibold">Payment Terms:</span> {ef.paymentTerms}</div>}
        {ef.dueDate && <div><span className="font-semibold">Due Date:</span> {ef.dueDate}</div>}
        {ef.outstandingBalance && <div><span className="font-semibold">Outstanding:</span> ₹{ef.outstandingBalance}</div>}
        {ef.nextDueDate && <div><span className="font-semibold">Next Due:</span> {ef.nextDueDate}</div>}
        {ef.diagnosis && <div><span className="font-semibold">Diagnosis:</span> {ef.diagnosis}</div>}
        {ef.raBillNumber && <div><span className="font-semibold">RA Bill No.:</span> {ef.raBillNumber}</div>}
        {ef.workOrderNumber && <div><span className="font-semibold">WO Number:</span> {ef.workOrderNumber}</div>}
        {ef.billPeriodFrom && ef.billPeriodTo && (
          <div><span className="font-semibold">Bill Period:</span> {ef.billPeriodFrom} to {ef.billPeriodTo}</div>
        )}
        {ef.lrNumber && <div><span className="font-semibold">LR/Docket:</span> {ef.lrNumber}</div>}
        {ef.vehicleNumber && <div><span className="font-semibold">Vehicle:</span> {ef.vehicleNumber}</div>}
        {ef.mode && <div><span className="font-semibold">Mode:</span> {ef.mode}</div>}
        {ef.loyaltyPoints && <div><span className="font-semibold">Loyalty Points:</span> {ef.loyaltyPoints}</div>}
      </div>
    );
  }
  return null;
}

function BankDetails({ data, config }: { data: TemplateInvoiceData; config: TemplateConfig }) {
  const s = data.sender;
  if (config.category !== "freelance") return null;
  if (!s.bankName && !s.accountNo) return null;
  return (
    <div className="mt-1">
      <div className="font-semibold mb-0.5">Payment Details:</div>
      {s.bankName && <div>Bank: {s.bankName}</div>}
      {s.accountNo && <div>A/C: {s.accountNo}</div>}
      {s.ifsc && <div>IFSC: {s.ifsc}</div>}
      {s.pan && <div>PAN: {s.pan}</div>}
    </div>
  );
}
