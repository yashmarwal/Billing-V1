import { calcTotals, fmt, numberToWords, type InvoiceData } from "@/lib/calculations";

export function InvoicePreview({ data }: { data: InvoiceData }) {
  const t = calcTotals(data);
  const b = data.business;
  const buyer = data.buyer;
  const inv = data.invoice;

  return (
    <div className="invoice-sheet bg-white text-black mx-auto p-6 shadow-sm border border-neutral-200 print:shadow-none print:border-0 print:p-8" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', sans-serif", fontSize: "11px", position: "relative" }}>
      {data.settings.watermark && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.06, pointerEvents: "none", fontSize: "120px", fontWeight: 900, transform: "rotate(-30deg)" }}>
          {b.name || "INVOICE"}
        </div>
      )}

      <div className="text-center border-b-2 border-black pb-2">
        <div className="text-[10px] tracking-widest">TAX INVOICE</div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 border-b-2 border-black py-3">
        {b.logo && b.logo.startsWith("data:") ? (
          <img src={b.logo} alt="logo" className="h-16 w-16 object-contain" />
        ) : b.logo ? (
          <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg print:bg-black print:text-white">{b.logo}</div>
        ) : null}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight print:!text-black">{b.name || "Your Business Name"}</h1>
          {b.tagline && <div className="italic text-[11px] print:!text-black">{b.tagline}</div>}
          <div className="text-[10px] mt-1 whitespace-pre-line print:!text-black">{b.address}</div>
          <div className="text-[10px] print:!text-black">
            {b.phone && <>Ph: {b.phone} </>}{b.email && <> | {b.email}</>}
          </div>
          <div className="text-[10px] font-semibold print:!text-black">
            {b.gstin && <>GSTIN: {b.gstin}</>}{b.state && <> | State: {b.state} ({b.stateCode})</>}
          </div>
        </div>
      </div>

      {/* Invoice meta + Buyer */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="p-2 border-r border-black">
          <div className="font-bold text-[11px] mb-1">Bill To:</div>
          <div className="font-semibold">{buyer.name || "—"}</div>
          <div className="whitespace-pre-line">{buyer.address}</div>
          {buyer.gstin && <div>GSTIN: {buyer.gstin}</div>}
          {buyer.state && <div>State: {buyer.state} ({buyer.stateCode})</div>}
          {buyer.placeOfSupply && <div>Place of Supply: {buyer.placeOfSupply}</div>}
        </div>
        <div className="p-2 text-[10px]">
          <table className="w-full">
            <tbody>
              <tr><td className="font-semibold py-0.5">Invoice No</td><td>{inv.number}</td></tr>
              <tr><td className="font-semibold py-0.5">Date</td><td>{inv.date}</td></tr>
              {inv.grNo && <tr><td className="font-semibold py-0.5">GR No</td><td>{inv.grNo}</td></tr>}
              {inv.challanNo && <tr><td className="font-semibold py-0.5">Challan No</td><td>{inv.challanNo}</td></tr>}
              {inv.transportBy && <tr><td className="font-semibold py-0.5">Transport</td><td>{inv.transportBy}</td></tr>}
              {inv.orderRef && <tr><td className="font-semibold py-0.5">Order Ref</td><td>{inv.orderRef}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items */}
      <table className="w-full border-collapse border-b-2 border-black text-[10px]">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-black p-1 w-8">#</th>
            <th className="border border-black p-1 text-left">Description</th>
            <th className="border border-black p-1 w-16">HSN</th>
            <th className="border border-black p-1 w-12">Qty</th>
            <th className="border border-black p-1 w-12">Unit</th>
            <th className="border border-black p-1 w-16">Rate</th>
            <th className="border border-black p-1 w-14">Disc</th>
            <th className="border border-black p-1 w-12">GST%</th>
            <th className="border border-black p-1 w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">
                {it.description || "—"}
                {it.notes && <div className="text-[9px] italic text-neutral-600">{it.notes}</div>}
              </td>
              <td className="border border-black p-1 text-center">{it.hsn}</td>
              <td className="border border-black p-1 text-right">{it.qty}</td>
              <td className="border border-black p-1 text-center">{it.unit}</td>
              <td className="border border-black p-1 text-right">{fmt(it.rate)}</td>
              <td className="border border-black p-1 text-right">{fmt(it.discount || 0)}</td>
              <td className="border border-black p-1 text-right">{it.gstRate}%</td>
              <td className="border border-black p-1 text-right">{fmt(t.rows[i].amount)}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 5 - data.items.length) }).map((_, i) => (
            <tr key={`e${i}`}><td className="border border-black p-1">&nbsp;</td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
          ))}
        </tbody>
      </table>

      {/* Totals + words */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        <div className="p-2 text-[10px]">
          <div className="font-semibold">Amount in Words:</div>
          <div className="italic">{numberToWords(t.grand)}</div>
          {(b.bankName || b.accountNo) && (
            <div className="mt-3">
              <div className="font-semibold">Bank Details:</div>
              {b.bankName && <div>Bank: {b.bankName}</div>}
              {b.accountNo && <div>A/C: {b.accountNo}</div>}
              {b.ifsc && <div>IFSC: {b.ifsc}</div>}
              {b.branch && <div>Branch: {b.branch}</div>}
            </div>
          )}
        </div>
        <div className="p-2 text-[10px] border-l border-black">
          <table className="w-full">
            <tbody>
              <tr><td>Subtotal</td><td className="text-right">{fmt(t.subtotal)}</td></tr>
              {t.sameState ? (
                <>
                  <tr><td>CGST</td><td className="text-right">{fmt(t.cgst)}</td></tr>
                  <tr><td>SGST</td><td className="text-right">{fmt(t.sgst)}</td></tr>
                </>
              ) : (
                <tr><td>IGST</td><td className="text-right">{fmt(t.igst)}</td></tr>
              )}
              {data.settings.roundOff && <tr><td>Round Off</td><td className="text-right">{fmt(t.roundOff)}</td></tr>}
              <tr className="font-bold border-t border-black text-[12px]">
                <td className="pt-1">Grand Total</td><td className="text-right pt-1">₹ {fmt(t.grand)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 text-[10px]">
        <div className="p-2 border-r border-black">
          <div className="font-semibold mb-1">Terms & Conditions:</div>
          <div className="whitespace-pre-line">{b.terms}</div>
        </div>
        <div className="p-2 text-right flex flex-col justify-between min-h-[100px]">
          <div className="font-semibold">For {b.name || "Your Business"}</div>
          <div className="mt-12 border-t border-black pt-1">Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
}
