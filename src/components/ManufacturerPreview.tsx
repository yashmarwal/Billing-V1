import { computeLineAmount, numberToWords } from "@/lib/calculations";
import type { TemplateConfig, TemplateInvoiceData } from "@/lib/types";

interface Props {
  config: TemplateConfig;
  data: TemplateInvoiceData;
}

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const rsPaise = (n: number) => ({
  rs: Math.floor(n).toLocaleString("en-IN"),
  paise: Math.round((n % 1) * 100).toString().padStart(2, "0"),
});

const cell: React.CSSProperties = { border: "1px solid black", padding: "3px 5px" };
const bold: React.CSSProperties = { fontWeight: "bold" };

export function ManufacturerPreview({ config, data }: Props) {
  const s = data.sender;
  const r = data.receiver;
  const ef = data.extraFields;

  const subtotal = data.items.reduce(
    (acc, it) => acc + computeLineAmount(it, config.lineItemCompute),
    0,
  );

  const sgstRate = Number(ef.sgstRate) || 0;
  const cgstRate = Number(ef.cgstRate) || 0;
  const igstRate = Number(ef.igstRate) || 0;

  const sgstAmt = (subtotal * sgstRate) / 100;
  const cgstAmt = (subtotal * cgstRate) / 100;
  const igstAmt = (subtotal * igstRate) / 100;

  const preRound = subtotal + sgstAmt + cgstAmt + igstAmt;
  const grand = data.settings.roundOff ? Math.round(preRound) : preRound;
  const roundOff = grand - preRound;

  const { rs: grandRs, paise: grandPaise } = rsPaise(grand);
  const { rs: subRs, paise: subPaise } = rsPaise(subtotal);

  const blankRows = Math.max(0, 6 - data.items.length);

  return (
    <div
      className="invoice-sheet bg-white text-black mx-auto shadow-sm border border-neutral-300 print:shadow-none print:border-0"
        style={{
          width: "210mm",
          minHeight: "297mm",
          fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
          fontSize: "9px",
          position: "relative",
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ borderBottom: "2px solid black" }}>
          {/* Top: logo left | business name center */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: "10px", minHeight: "64px" }}>
            {s.logo && (
              <img
                src={s.logo}
                alt="logo"
                style={{ maxHeight: "56px", maxWidth: "80px", objectFit: "contain", flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, textAlign: "center" }}>
              {s.headerLine && (
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>{s.headerLine}</div>
              )}
              <div style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "1px", lineHeight: "1.15" }}>
                {s.name || "BUSINESS NAME"}
              </div>
              {s.address && (
                <div style={{ fontSize: "8px", marginTop: "3px", color: "#333" }}>{s.address}</div>
              )}
              {s.mobile && (
                <div style={{ fontSize: "8px", color: "#333" }}>Mob: {s.mobile}</div>
              )}
            </div>
            {/* spacer to balance logo */}
            {s.logo && <div style={{ width: "80px", flexShrink: 0 }} />}
          </div>

          {/* Specialisation banner */}
          {s.specialisation && (
            <div
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                textAlign: "center",
                padding: "4px 8px",
                fontSize: "9px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              {s.specialisation}
            </div>
          )}
        </div>

        {/* ── META ROW: Invoice No | GSTIN | Date ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "2px solid black" }}>
          <div style={{ padding: "4px 8px", borderRight: "1px solid black" }}>
            <span style={bold}>Invoice No.: </span>
            {ef.invoiceNumber || "___________"}
          </div>
          <div style={{ padding: "4px 8px", borderRight: "1px solid black", textAlign: "center" }}>
            <span style={bold}>GSTIN: </span>
            {s.gstin || "___________________________"}
          </div>
          <div style={{ padding: "4px 8px", textAlign: "right" }}>
            <span style={bold}>Date: </span>
            {ef.invoiceDate || "___________"}
          </div>
        </div>

        {/* ── BUYER PANEL ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid black" }}>
          <div style={{ padding: "6px 8px", borderRight: "1px solid black" }}>
            <div>
              <span style={bold}>M/s: </span>
              {r.ms || "_________________________"}
            </div>
            <div style={{ marginTop: "3px" }}>
              <span style={bold}>Mobile: </span>
              {r.mobile || "______________"}
            </div>
            <div style={{ marginTop: "3px" }}>
              <span style={bold}>GSTIN: </span>
              {r.gstin || "______________________"}
            </div>
          </div>
          <div style={{ padding: "6px 8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ ...bold, paddingRight: "4px", whiteSpace: "nowrap" }}>State:</td>
                  <td>{r.state || "___________"}</td>
                  <td style={{ ...bold, paddingLeft: "8px", whiteSpace: "nowrap" }}>Code:</td>
                  <td>{r.stateCode || "___"}</td>
                </tr>
                <tr>
                  <td style={{ ...bold, paddingRight: "4px" }}>GR No.:</td>
                  <td>{r.grNo || "___________"}</td>
                  <td style={{ ...bold, paddingLeft: "8px" }}>Challan:</td>
                  <td>{r.challanNo || "___________"}</td>
                </tr>
                <tr>
                  <td style={{ ...bold, paddingRight: "4px", whiteSpace: "nowrap" }}>Place of Supply:</td>
                  <td colSpan={3}>{r.placeOfSupply || "___________"}</td>
                </tr>
                <tr>
                  <td style={{ ...bold, paddingRight: "4px", whiteSpace: "nowrap" }}>Transport By:</td>
                  <td colSpan={3}>{r.transportBy || "___________"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "2px solid black" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th rowSpan={2} style={{ ...cell, width: "4%", textAlign: "center" }}>Sr.</th>
              <th rowSpan={2} style={{ ...cell, width: "33%", textAlign: "left" }}>Description of Goods</th>
              <th rowSpan={2} style={{ ...cell, width: "8%", textAlign: "center" }}>HSN</th>
              <th rowSpan={2} style={{ ...cell, width: "7%", textAlign: "center" }}>Qty</th>
              <th rowSpan={2} style={{ ...cell, width: "7%", textAlign: "center" }}>Unit</th>
              <th rowSpan={2} style={{ ...cell, width: "13%", textAlign: "center" }}>Rate (₹)</th>
              <th colSpan={2} style={{ ...cell, textAlign: "center" }}>Amount</th>
            </tr>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ ...cell, width: "14%", textAlign: "center" }}>Rs.</th>
              <th style={{ ...cell, width: "7%", textAlign: "center" }}>P.</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => {
              const amount = computeLineAmount(item, config.lineItemCompute);
              const { rs, paise } = rsPaise(amount);
              return (
                <tr key={item.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{i + 1}</td>
                  <td style={cell}>{String(item.description ?? "")}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{String(item.hsn ?? "")}</td>
                  <td style={{ ...cell, textAlign: "right" }}>{String(item.qty ?? "")}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{String(item.unit ?? "")}</td>
                  <td style={{ ...cell, textAlign: "right" }}>{String(item.rate ?? "")}</td>
                  <td style={{ ...cell, textAlign: "right" }}>{rs}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{paise}</td>
                </tr>
              );
            })}

            {/* Filler blank rows */}
            {Array.from({ length: blankRows }).map((_, i) => (
              <tr key={`blank${i}`} style={{ height: "18px" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
                  <td key={c} style={cell}>&nbsp;</td>
                ))}
              </tr>
            ))}

            {/* Subtotal row */}
            <tr style={{ backgroundColor: "#f9f9f9" }}>
              <td colSpan={6} style={{ ...cell, textAlign: "right", ...bold }}>Sub Total</td>
              <td style={{ ...cell, textAlign: "right", ...bold }}>{subRs}</td>
              <td style={{ ...cell, textAlign: "center", ...bold }}>{subPaise}</td>
            </tr>
          </tbody>
        </table>

        {/* ── FOOTER: Bank + Tax Summary ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid black" }}>
          {/* Left: bank + amount in words */}
          <div style={{ padding: "6px 8px", borderRight: "1px solid black" }}>
            {(s.bankName || s.accountNo) && (
              <div style={{ marginBottom: "4px" }}>
                <div style={{ ...bold, marginBottom: "2px" }}>Bank Details:</div>
                {s.bankName && <div>Bank: {s.bankName}</div>}
                {s.accountNo && <div>A/C No.: {s.accountNo}</div>}
                {s.ifsc && <div>IFSC: {s.ifsc}</div>}
                {s.branch && <div>Branch: {s.branch}</div>}
              </div>
            )}
            {config.showAmountInWords && (
              <div style={{ borderTop: "1px solid #ccc", paddingTop: "4px" }}>
                <div style={bold}>Amount in Words:</div>
                <div style={{ fontStyle: "italic" }}>
                  Rupees {numberToWords(grand)} Only
                </div>
              </div>
            )}
          </div>

          {/* Right: tax breakdown */}
          <div style={{ padding: "6px 8px" }}>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: "2px" }}>SGST @ {sgstRate}%</td>
                  <td style={{ textAlign: "right" }}>₹{fmt(sgstAmt)}</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: "2px" }}>CGST @ {cgstRate}%</td>
                  <td style={{ textAlign: "right" }}>₹{fmt(cgstAmt)}</td>
                </tr>
                {igstRate > 0 && (
                  <tr>
                    <td style={{ paddingBottom: "2px" }}>IGST @ {igstRate}%</td>
                    <td style={{ textAlign: "right" }}>₹{fmt(igstAmt)}</td>
                  </tr>
                )}
                {data.settings.roundOff && Math.abs(roundOff) > 0.001 && (
                  <tr>
                    <td style={{ paddingBottom: "2px" }}>Round Off</td>
                    <td style={{ textAlign: "right" }}>
                      {roundOff >= 0 ? "+" : ""}₹{fmt(roundOff)}
                    </td>
                  </tr>
                )}
                <tr style={{ borderTop: "1px solid black" }}>
                  <td style={{ ...bold, paddingTop: "3px", fontSize: "10px" }}>Grand Total</td>
                  <td style={{ ...bold, textAlign: "right", paddingTop: "3px", fontSize: "10px" }}>
                    ₹{grandRs}.{grandPaise}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TERMS BAR ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            borderBottom: "1px solid black",
            padding: "6px 8px",
            gap: "16px",
          }}
        >
          <div>
            {ef.terms1 && <div>{ef.terms1}</div>}
            {ef.terms2 && <div>{ef.terms2}</div>}
            {ef.terms3 && <div>{ef.terms3}</div>}
            {ef.jurisdictionCity && (
              <div style={{ marginTop: "3px" }}>
                Subject to {ef.jurisdictionCity} Jurisdiction
              </div>
            )}
            {!ef.terms1 && !ef.terms2 && !ef.terms3 && (
              <div style={{ color: "#999" }}>
                Goods once sold will not be taken back. E&amp;OE.
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", minWidth: "120px" }}>
            <div style={bold}>For: {s.name || "_______________"}</div>
          </div>
        </div>

        {/* ── SIGNATURE ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "2px solid black",
            minHeight: "52px",
          }}
        >
          {[
            "Receiver's Signature",
            "Driver's Signature",
            "Authorised Signatory",
          ].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "4px 8px",
                borderRight: i < 2 ? "1px solid black" : undefined,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div />
              <div
                style={{
                  ...bold,
                  fontSize: "8px",
                  textAlign: i === 2 ? "right" : "left",
                  borderTop: "1px solid #999",
                  paddingTop: "2px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── TRIPLICATE LEGEND ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", backgroundColor: "#e8e8e8" }}>
          {[
            "ORIGINAL (Buyer's Copy)",
            "DUPLICATE (Transporter's Copy)",
            "TRIPLICATE (Seller's Copy)",
          ].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "4px",
                textAlign: "center",
                ...bold,
                fontSize: "8px",
                letterSpacing: "0.5px",
                borderRight: i < 2 ? "1px solid #aaa" : undefined,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
  );
}
