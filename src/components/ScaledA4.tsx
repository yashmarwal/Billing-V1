import { useEffect, useRef, useState } from "react";

const A4_W = 794; // 210mm at 96dpi

export function ScaledA4({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapH, setWrapH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const recalc = () => {
      const cw = containerRef.current?.clientWidth ?? A4_W;
      const ch = contentRef.current?.scrollHeight ?? 0;
      const s = Math.min(1, cw / A4_W);
      setScale(s);
      setWrapH(s < 1 && ch > 0 ? ch * s : undefined);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", overflow: "hidden", height: wrapH }}
    >
      <div
        ref={contentRef}
        style={{
          width: `${A4_W}px`,
          transformOrigin: "top left",
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
