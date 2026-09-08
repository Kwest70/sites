import "./index.css";
import { Composition } from "remotion";
import {
  CAPTION_DURATION,
  ProfileCaption,
} from "./Caption/ProfileCaption";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProfileCaption"
        component={ProfileCaption}
        durationInFrames={CAPTION_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Future Creatives",
          titleColor: "#0E0018",
          logoColor1: "#4FD8F5",
          logoColor2: "#4FD8F5",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#4FD8F5" as const,
          logoColor2: "#4FD8F5" as const,
        }}
      />
    </>
  );
};
