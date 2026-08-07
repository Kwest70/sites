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
  const [collapsedHeight, setCollapsedHeight] = useState("0");
  const contentRef = useRef<HTMLDivElement>(null);
  const fullHeightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureHeight = () => {
      if (!fullHeightRef.current) return;

      const fullHeight = fullHeightRef.current.offsetHeight;
      const lineHeight = parseFloat(
        window.getComputedStyle(fullHeightRef.current).lineHeight
      );
      const targetHeight = lineHeight * maxLines;

      // Show toggle if content is significantly taller than max lines
      const shouldShowToggle = fullHeight > targetHeight * 1.2; // 20% buffer for safety
      setShowToggle(shouldShowToggle);
      setCollapsedHeight(`${targetHeight}px`);
    };

    // Wait for fonts to load and content to render
    const timer = setTimeout(measureHeight, 100);
    window.addEventListener("resize", measureHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureHeight);
    };
  }, [children, maxLines]);

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
