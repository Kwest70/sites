import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CAPTION_FONT_FAMILY } from "../Caption/fonts";

/**
 * Diffusion of Innovation — Rogers' five adopter categories, with Moore's
 * chasm marked between the Early Adopters and the Early Majority.
 *
 * The classic version of this chart plots the bell curve and the cumulative
 * S-curve together on two y-axes. That is a dual-axis chart, so it is not done
 * here: the bell is the chart, and cumulative adoption is called out as a
 * figure instead of a second scale.
 *
 * The five groups are ordered bins of a continuous variable (time of
 * adoption), so colour is a SEQUENTIAL ink ramp, not a categorical set. Its
 * steps were chosen by measured OKLab lightness — 0.74 / 0.615 / 0.49 / 0.365
 * / 0.21, monotonically decreasing in even intervals — rather than by eye.
 */

const PAPER = "#F2F0EA";
const INK = "#0A0A0A";
const YELLOW = "#FFD500";
const RED = "#FF1E1E";

/** Sequential ink ramp, light → dark. See the note above. */
const RAMP = ["#B0AAA1", "#89847D", "#63605B", "#403E3B", "#191817"];

export const DIFFUSION_DURATION = 270;

type Segment = {
  name: string;
  share: number;
  /** Boundaries in standard deviations from the mean. */
  from: number;
  to: number;
  /** Where the % sits — the arithmetic midpoint lands badly in the tails. */
  labelAt: number;
  /** Inside the fill (light ink) or above the curve (dark ink). */
  inside: boolean;
};

const SEGMENTS: Segment[] = [
  {
    name: "Innovators",
    share: 2.5,
    from: -3.4,
    to: -2,
    labelAt: -2.45,
    inside: false,
  },
  {
    name: "Early Adopters",
    share: 13.5,
    from: -2,
    to: -1,
    labelAt: -1.62,
    inside: false,
  },
  {
    name: "Early Majority",
    share: 34,
    from: -1,
    to: 0,
    labelAt: -0.5,
    inside: true,
  },
  {
    name: "Late Majority",
    share: 34,
    from: 0,
    to: 1,
    labelAt: 0.5,
    inside: true,
  },
  {
    name: "Laggards",
    share: 16,
    from: 1,
    to: 3.4,
    labelAt: 1.42,
    inside: true,
  },
];

// --- plot geometry ------------------------------------------------------
const PLOT_W = 940;
const PLOT_H = 460;
const SIGMA_MIN = -3.4;
const SIGMA_MAX = 3.4;

const xOf = (sigma: number) =>
  ((sigma - SIGMA_MIN) / (SIGMA_MAX - SIGMA_MIN)) * PLOT_W;
const bell = (sigma: number) => Math.exp(-(sigma * sigma) / 2);
const yOf = (sigma: number) => PLOT_H - bell(sigma) * PLOT_H;

/** Filled area under the curve between two sigma bounds. */
const areaPath = (from: number, to: number) => {
  const steps = 60;
  const pts: string[] = [`M ${xOf(from)} ${PLOT_H}`];
  for (let i = 0; i <= steps; i++) {
    const s = from + ((to - from) * i) / steps;
    pts.push(`L ${xOf(s)} ${yOf(s)}`);
  }
  pts.push(`L ${xOf(to)} ${PLOT_H}`, "Z");
  return pts.join(" ");
};

const curvePath = () => {
  const steps = 240;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = SIGMA_MIN + ((SIGMA_MAX - SIGMA_MIN) * i) / steps;
    pts.push(`${i === 0 ? "M" : "L"} ${xOf(s)} ${yOf(s)}`);
  }
  return pts.join(" ");
};

// --- timing -------------------------------------------------------------
const TITLE_AT = 6;
const CURVE_AT = 26;
const FIRST_SEGMENT_AT = 58;
const SEGMENT_STEP = 22;
const CHASM_AT = FIRST_SEGMENT_AT + SEGMENT_STEP * 5 + 10;

const segmentAppearsAt = (i: number) => FIRST_SEGMENT_AT + i * SEGMENT_STEP;

export const DiffusionOfInnovation: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn = interpolate(frame, [TITLE_AT, TITLE_AT + 6], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Curve inks itself on left to right.
  const draw = interpolate(frame, [CURVE_AT, CURVE_AT + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const chasmOpen = interpolate(frame, [CHASM_AT, CHASM_AT + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const CURVE_LEN = 2600;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      {/* title */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: -40,
          right: -40,
          transform: `rotate(-1.6deg) translateX(${titleIn}px)`,
          backgroundColor: INK,
          padding: "16px 56px 24px",
          boxShadow: `12px 12px 0 ${RED}`,
        }}
      >
        <div
          style={{
            fontFamily: CAPTION_FONT_FAMILY,
            fontSize: 92,
            lineHeight: 1,
            color: PAPER,
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          Diffusion of Innovation
        </div>
      </div>

      {/* chart */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 70,
          width: PLOT_W,
          height: PLOT_H + 80,
        }}
      >
        <svg width={PLOT_W} height={PLOT_H + 80} style={{ overflow: "visible" }}>
          {/* segment fills, each inset 2px so paper shows between them */}
          {SEGMENTS.map((seg, i) => {
            const on = frame >= segmentAppearsAt(i);
            const rise = interpolate(
              frame,
              [segmentAppearsAt(i), segmentAppearsAt(i) + 8],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            );
            if (!on) return null;

            return (
              <g key={seg.name} opacity={rise}>
                <path
                  d={areaPath(seg.from, seg.to)}
                  fill={RAMP[i]}
                  stroke={PAPER}
                  strokeWidth={2}
                  transform={`translate(0 ${(1 - rise) * 26})`}
                />
              </g>
            );
          })}

          {/* the curve itself */}
          <path
            d={curvePath()}
            fill="none"
            stroke={INK}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={CURVE_LEN}
            strokeDashoffset={CURVE_LEN * (1 - draw)}
          />

          {/* baseline */}
          <line
            x1={0}
            y1={PLOT_H}
            x2={PLOT_W * draw}
            y2={PLOT_H}
            stroke={INK}
            strokeWidth={7}
            strokeLinecap="round"
          />

          {/* the chasm, between Early Adopters and Early Majority */}
          {chasmOpen > 0 ? (
            <g opacity={chasmOpen}>
              <line
                x1={xOf(-1)}
                y1={-20}
                x2={xOf(-1)}
                y2={PLOT_H + 14}
                stroke={RED}
                strokeWidth={8}
                strokeDasharray="18 14"
              />
              <g
                transform={`translate(${xOf(-1)} ${-54}) rotate(-2)`}
              >
                <rect
                  x={-150}
                  y={-46}
                  width={300}
                  height={62}
                  fill={RED}
                  transform={`scale(${chasmOpen} 1)`}
                />
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  style={{
                    fontFamily: CAPTION_FONT_FAMILY,
                    fontSize: 46,
                    fill: PAPER,
                  }}
                >
                  THE CHASM
                </text>
              </g>
            </g>
          ) : null}
          {/* percentages — drawn after the chasm rule so it cannot clip them */}
          {SEGMENTS.map((seg, i) => {
            if (frame < segmentAppearsAt(i) + 4) return null;
            const x = xOf(seg.labelAt);
            const top = yOf(seg.labelAt);
            // Inside labels sit in the body of the fill; outside ones ride above.
            const y = seg.inside ? top + (PLOT_H - top) * 0.42 : top - 22;
            return (
              <text
                key={seg.name}
                x={x}
                y={y}
                textAnchor="middle"
                style={{
                  fontFamily: CAPTION_FONT_FAMILY,
                  fontSize: 42,
                  fill: seg.inside ? PAPER : INK,
                }}
              >
                {seg.share}%
              </text>
            );
          })}

        </svg>
      </div>

      {/* legend — names carried here, since the segments are too narrow */}
      <div
        style={{
          position: "absolute",
          top: 1000,
          left: 70,
          width: PLOT_W,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {SEGMENTS.map((seg, i) => {
          if (frame < segmentAppearsAt(i)) return null;
          const slide = interpolate(
            frame,
            [segmentAppearsAt(i), segmentAppearsAt(i) + 7],
            [-40, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );
          return (
            <div
              key={seg.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                transform: `translateX(${slide}px)`,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  backgroundColor: RAMP[i],
                  border: `4px solid ${INK}`,
                }}
              />
              <div
                style={{
                  fontFamily: CAPTION_FONT_FAMILY,
                  fontSize: 58,
                  color: INK,
                  textTransform: "uppercase",
                  flex: 1,
                }}
              >
                {seg.name}
              </div>
              <div
                style={{
                  fontFamily: CAPTION_FONT_FAMILY,
                  fontSize: 58,
                  color: INK,
                }}
              >
                {seg.share}%
              </div>
            </div>
          );
        })}
      </div>

      {/* the point of the chasm, stated once it has opened */}
      {chasmOpen > 0.9 ? (
        <div
          style={{
            position: "absolute",
            bottom: 96,
            left: 70,
            width: PLOT_W,
            backgroundColor: YELLOW,
            border: `6px solid ${INK}`,
            padding: "22px 30px",
            transform: "rotate(0.8deg)",
            boxShadow: `10px 10px 0 ${INK}`,
          }}
        >
          <div
            style={{
              fontFamily: CAPTION_FONT_FAMILY,
              fontSize: 50,
              lineHeight: 1.1,
              color: INK,
              textTransform: "uppercase",
            }}
          >
            16% adopt on belief. The other 84% wait for proof.
          </div>
        </div>
      ) : null}

      {SEGMENTS.map((seg, i) => (
        <Sequence key={seg.name} from={segmentAppearsAt(i)}>
          <Audio src={staticFile("audio/impact.wav")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence from={CHASM_AT}>
        <Audio src={staticFile("audio/impact.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
