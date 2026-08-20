import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const myCompSchema2 = z.object({
  logoColor1: zColor(),
  logoColor2: zColor(),
});

/**
 * Future Creatives "F" mark — the same geometry as src/components/Logo.tsx
 * on the site, drawn twice: a black backing stroke and the coloured stroke
 * on top, matching the brand lockup.
 */
export const Logo: React.FC<z.infer<typeof myCompSchema2>> = ({
  logoColor1: color1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { mass: 0.5 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${scale})`,
      }}
    >
      <svg width={420} height={483} viewBox="0 0 100 115" fill="none">
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* black backing stroke */}
          <g stroke="#000000" strokeWidth={21}>
            <path d="M26 101 C35 101 40 95 40 85 V33 C40 25 45 20 54 20 H76" />
            <path d="M40 60 H70" />
          </g>
          {/* coloured stroke on top */}
          <g stroke={color1} strokeWidth={13}>
            <path d="M26 101 C35 101 40 95 40 85 V33 C40 25 45 20 54 20 H76" />
            <path d="M40 60 H70" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
