type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * Future Creatives "F" mark — chunky rounded monoline with a curled stem foot
 * and two open arms. Colour comes from `currentColor`.
 */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 100 115"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
        {/* stem with a curled foot + top arm (open) */}
        <path d="M26 101 C35 101 40 95 40 85 V33 C40 25 45 20 54 20 H76" />
        {/* middle arm (open) */}
        <path d="M40 60 H70" />
      </g>
    </svg>
  );
}
