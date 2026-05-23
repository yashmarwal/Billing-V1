import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, Plus } from "lucide-react";
import { rowAmount, fmt, type Item } from "@/lib/calculations";

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

const blankItem: Item = { description: "", hsn: "", qty: 1, unit: "Nos", rate: 0, discount: 0, gstRate: 18, notes: "" };

export function ItemRowEditor({ items, onChange }: Props) {
  const update = (i: number, patch: Partial<Item>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };
  const add = () => onChange([...items, { ...blankItem }]);
  const dup = (i: number) => onChange([...items.slice(0, i + 1), { ...items[i] }, ...items.slice(i + 1)]);
  const rm = (i: number) => onChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : items);

  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Item {i + 1} <span className="text-muted-foreground font-normal">· ₹{fmt(rowAmount(it))}</span></div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => dup(i)} title="Duplicate"><Copy className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => rm(i)} title="Remove"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <Label className="text-xs">Description</Label>
              <Input value={it.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="What did you sell?" />
            </div>
            <div className="col-span-4"><Label className="text-xs">HSN</Label><Input value={it.hsn} onChange={(e) => update(i, { hsn: e.target.value })} /></div>
            <div className="col-span-4"><Label className="text-xs">Qty</Label><Input type="number" value={it.qty} min={0} onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => update(i, { qty: +e.target.value || 0 })} /></div>
            <div className="col-span-4"><Label className="text-xs">Unit</Label><Input value={it.unit} onChange={(e) => update(i, { unit: e.target.value })} placeholder="Nos / Kg / Hr" /></div>
            <div className="col-span-4"><Label className="text-xs">Rate ₹</Label><Input type="number" value={it.rate} min={0} onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => update(i, { rate: +e.target.value || 0 })} /></div>
            <div className="col-span-4"><Label className="text-xs">Discount ₹</Label><Input type="number" value={it.discount === 0 ? "" : it.discount} placeholder="0" min={0} onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => update(i, { discount: e.target.value === "" ? 0 : +e.target.value })} /></div>
            <div className="col-span-4"><Label className="text-xs">GST %</Label><Input type="number" value={it.gstRate} min={0} onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => update(i, { gstRate: +e.target.value || 0 })} /></div>
            <div className="col-span-12"><Label className="text-xs">Notes (optional)</Label><Input value={it.notes || ""} onChange={(e) => update(i, { notes: e.target.value })} /></div>
          </div>
        </div>
      ))}
      <Button onClick={add} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
    </div>
  );
}
