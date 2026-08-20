import { zColor } from "@remotion/zod-types";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import logoImage from "./future-creatives-logo.png";

export const myCompSchema2 = z.object({
  logoColor1: zColor(),
  logoColor2: zColor(),
});

export const Logo: React.FC<z.infer<typeof myCompSchema2>> = ({
  logoColor1: color1,
  logoColor2: color2,
}) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={logoImage}
        style={{
          width: "400px",
          height: "400px",
          objectFit: "contain",
        }}
        alt="Future Creatives"
      />
    </AbsoluteFill>
  );
};
