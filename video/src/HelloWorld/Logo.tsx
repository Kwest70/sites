import { zColor } from "@remotion/zod-types";
import { AbsoluteFill } from "remotion";
import { z } from "zod";

export const myCompSchema2 = z.object({
  logoColor1: zColor(),
  logoColor2: zColor(),
});

export const Logo: React.FC<z.infer<typeof myCompSchema2>> = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg viewBox="0 0 240 280" width="300" height="350">
        {/* Left vertical bar */}
        <rect x="50" y="30" width="40" height="200" rx="20" fill="#00D9D9" stroke="#000000" strokeWidth="6" />
        {/* Top horizontal bar */}
        <rect x="50" y="30" width="130" height="40" rx="20" fill="#00D9D9" stroke="#000000" strokeWidth="6" />
        {/* Middle horizontal bar */}
        <rect x="50" y="110" width="110" height="40" rx="20" fill="#00D9D9" stroke="#000000" strokeWidth="6" />
      </svg>
    </AbsoluteFill>
  );
};
