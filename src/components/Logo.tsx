type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * Future Creatives "F" mark — rounded monoline: a stem with a curled foot and
 * two pill-shaped arms. Colour comes from `currentColor` (set text-primary on
 * the parent).
 */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
        {/* stem with a curled foot */}
        <path d="M37 20 V92 C37 100 32 105 24 105" />
        {/* top arm — pill loop */}
        <rect x="37" y="16" width="49" height="31" rx="15.5" />
        {/* middle arm — shorter pill loop */}
        <rect x="37" y="57" width="39" height="27" rx="13.5" />
      </g>
    </svg>
  );
}
