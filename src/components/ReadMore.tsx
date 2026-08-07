"use client";

import { useState, useRef, useEffect } from "react";
import "./ReadMore.css";

interface ReadMoreProps {
  children: string;
  maxLines?: number;
  isDarkBg?: boolean;
}

export default function ReadMore({
  children,
  maxLines = 3,
  isDarkBg = false,
}: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fullHeightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current || !fullHeightRef.current) return;

    // Calculate line height
    const lineHeight = parseFloat(
      window.getComputedStyle(contentRef.current).lineHeight
    );
    const collapsedHeight = lineHeight * maxLines;
    const fullHeight = fullHeightRef.current.offsetHeight;

    // Only show toggle if text exceeds max lines
    setShowToggle(fullHeight > collapsedHeight + 10); // 10px buffer
  }, [children, maxLines]);

  const collapsedHeight = `calc(${maxLines} * 1.7em)`;
  const expandedHeight = fullHeightRef.current?.offsetHeight || "auto";

  if (!showToggle) {
    return <div className="read-more-text">{children}</div>;
  }

  return (
    <div className={`read-more-container ${isDarkBg ? "dark" : "light"}`}>
      <div
        ref={contentRef}
        className="read-more-content"
        style={{
          maxHeight: isExpanded ? expandedHeight : collapsedHeight,
        }}
      >
        <div ref={fullHeightRef} className="read-more-text">
          {children}
        </div>
      </div>
      <button
        className="read-more-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Less −" : "Read more +"}
      </button>
    </div>
  );
}
