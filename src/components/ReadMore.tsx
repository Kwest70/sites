"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ReadMoreProps = {
  /** One entry per paragraph. Rendered as a single collapsible block. */
  paragraphs: string[];
  className?: string;
};

/**
 * Shows the first 3 lines of a body block; expands to reveal the rest with a
 * 200ms height transition. If the block is already 3 lines or fewer, the full
 * text is shown with no toggle.
 */
export function ReadMore({ paragraphs, className }: ReadMoreProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const [collapsedH, setCollapsedH] = useState(0);
  const [fullH, setFullH] = useState(0);

  const measure = () => {
    const el = innerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    let lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.7;
    const collapsed = Math.round(lh * 3);
    setCollapsedH(collapsed);
    setFullH(el.scrollHeight);
    setNeedsToggle(el.scrollHeight > collapsed + 2);
  };

  useLayoutEffect(() => {
    measure();
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paragraphs]);

  // Re-measure once web fonts have loaded (line height can shift).
  useEffect(() => {
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxHeight = !needsToggle ? "none" : expanded ? `${fullH}px` : `${collapsedH}px`;

  return (
    <div className={className}>
      <div
        style={{ maxHeight, overflow: "hidden", transition: "max-height 200ms ease" }}
      >
        <div ref={innerRef}>
          {paragraphs.map((p, i) => (
            <p key={i} className={cn("text-lg", i > 0 && "mt-5")}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-orange hover:opacity-80"
        >
          {expanded ? "Less −" : "Read more +"}
        </button>
      )}
    </div>
  );
}
