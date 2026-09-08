import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CAPTION_FONT_FAMILY } from "./fonts";

const FONT_FAMILY = CAPTION_FONT_FAMILY;

// --- Look ---------------------------------------------------------------
const YELLOW = "#FFD500";
const OUTLINE = "#000000";
const BACKGROUND = "#FFFFFF";
const STROKE_WIDTH = 14;
const UPPERCASE = true;

// --- Motion -------------------------------------------------------------
/** Frames the line takes to fly forward and slam to a stop. */
const IMPACT_FRAMES = 13;
/** How far away the line starts. Smaller = comes from further back. */
const START_SCALE = 0.06;

// --- Sound --------------------------------------------------------------
/** Whoosh of the line travelling forward, swelling into the hit. */
const SWOOSH_VOLUME = 0.55;
/** The hit as it slams to a stop. */
const IMPACT_VOLUME = 0.85;

type CaptionLine = {
  text: string;
  durationInFrames: number;
  fontSize: number;
};

export const LINES: CaptionLine[] = [
  {
    text: "We exist to counter the culture",
    durationInFrames: 60,
    fontSize: 132,
  },
  {
    text: "that benefits from our division as humans",
    durationInFrames: 66,
    fontSize: 124,
  },
  {
    text: "By unlocking the value in the 1000’s of creative industry projects",
    durationInFrames: 108,
    fontSize: 106,
  },
  {
    text: "that are not supported by institutions and blocked by gatekeepers.",
    durationInFrames: 84,
    fontSize: 110,
  },
];

export const CAPTION_DURATION = LINES.reduce(
  (total, line) => total + line.durationInFrames,
  0,
);

const Line: React.FC<{ readonly line: CaptionLine }> = ({ line }) => {
  const frame = useCurrentFrame();

  // Flies toward the viewer and decelerates hard into a dead stop.
  const scale = interpolate(frame, [0, IMPACT_FRAMES], [START_SCALE, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: FONT_FAMILY,
          fontSize: line.fontSize,
          lineHeight: 1.07,
          textAlign: "center",
          color: YELLOW,
          WebkitTextStroke: `${STROKE_WIDTH}px ${OUTLINE}`,
          paintOrder: "stroke fill",
          textTransform: UPPERCASE ? "uppercase" : "none",
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

export const ProfileCaption: React.FC = () => {
  let from = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: BACKGROUND }}>
      {LINES.map((line) => {
        const startsAt = from;
        from += line.durationInFrames;

        // Each Sequence unmounts when its duration is up, so the line that has
        // just landed disappears at the exact frame the next one starts flying.
        return (
          <Sequence
            key={line.text}
            from={startsAt}
            durationInFrames={line.durationInFrames}
          >
            <Line line={line} />
            <Audio
              src={staticFile("audio/swoosh.wav")}
              volume={SWOOSH_VOLUME}
            />
            <Sequence from={IMPACT_FRAMES}>
              <Audio
                src={staticFile("audio/impact.wav")}
                volume={IMPACT_VOLUME}
              />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
