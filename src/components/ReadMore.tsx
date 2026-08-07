"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const COLLAPSED_LINES = 3;

/**
 * Height of the first `n` rendered lines of `container`, measured from its top.
 *
 * Deliberately not `lineHeight * n`: a block can hold several paragraphs, and
 * the margins between them mean n line-heights lands mid-glyph rather than on
 * a line boundary. Walking the text and watching for the baseline to step down
 * gives the true bottom edge of line n. It stops as soon as line n+1 begins,
 * so it only ever inspects three or four lines of characters.
 */
function firstLinesHeight(container: HTMLElement, n: number): number | null {
  const top = container.getBoundingClientRect().top;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const bottoms: number[] = [];

  let node = walker.nextNode() as Text | null;
  while (node) {
    for (let i = 0; i < node.length; i += 1) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.height) continue;

      const bottom = rect.bottom - top;
      // A new line box has started once the bottom edge steps down.
      if (!bottoms.length || bottom > bottoms[bottoms.length - 1] + 1) {
        bottoms.push(bottom);
        if (bottoms.length > n) return bottoms[n - 1];
      }
    }
    node = walker.nextNode() as Text | null;
  }

  return bottoms.length >= n ? bottoms[n - 1] : null;
}

/**
 * Clips a body-text block to three lines with a "Read more +" toggle.
 *
 * Children may be several <p> elements — a whole section body goes inside one
 * ReadMore, and expanding reveals every paragraph. A block that is already
 * three lines or shorter renders plainly, with no toggle.
 */
export default function ReadMore({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsedPx, setCollapsedPx] = useState<number | null>(null);
  const [fullPx, setFullPx] = useState(0);
  const inner = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const el = inner.current;
    if (!el) return;

    const clipAt = firstLinesHeight(el, COLLAPSED_LINES);
    const full = el.scrollHeight;

    setFullPx(full);
    // null => the whole block fits in three lines, so there is nothing to clip.
    setCollapsedPx(clipAt !== null && full > clipAt + 1 ? clipAt : null);
  }, []);

  useEffect(() => {
    measure();

    // Bangers / Space Mono / DM Sans swap in after first paint — remeasure
    // once the real metrics are known, and again on any reflow.
    document.fonts?.ready.then(measure).catch(() => {});

    const el = inner.current;
    const ro = el ? new ResizeObserver(measure) : null;
    if (el && ro) ro.observe(el);

    return () => ro?.disconnect();
  }, [measure]);

  const body = (
    <div className="body-text" ref={inner}>
      {children}
    </div>
  );

  if (collapsedPx === null) return body;

  return (
    <div className="readmore">
      <div
        className="readmore__clip"
        style={{ maxHeight: expanded ? fullPx : collapsedPx }}
      >
        {body}
      </div>

      <button
        type="button"
        className="readmore__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Less −" : "Read more +"}
      </button>
    </div>
  );
}
