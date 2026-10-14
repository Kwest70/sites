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
 * The Law of Diffusion of Innovation, as Simon Sinek applies it to cultural
 * change inside an organisation ("How to Make a Cultural Transformation").
 *
 * The argument, not the taxonomy, is the subject: most change programmes are
 * run like a marketing campaign, sold to everyone at once. Sinek's point is to
 * back the ~16% who already believe and let the majority follow.
 *
 * Design notes:
 * - Colour encodes the THREE GROUPS Sinek acts on (back them / they follow /
 *   leave them), not the five Rogers bins. The five bins are still visible as
 *   the 2px paper gaps between fills, so nothing is lost. An earlier version
 *   used a five-step sequential ink ramp; that charted the taxonomy rather
 *   than the argument.
 * - The threshold at -1σ is a TIPPING POINT, not Moore's chasm. A chasm is a
 *   barrier you force a crossing of; Sinek's claim is the opposite — reach
 *   the willing and the majority comes on its own.
 * - Three-colour set validated: worst adjacent CVD ΔE 25.1, well clear of the
 *   8 threshold. Yellow is under 3:1 against the paper, so it carries the
 *   relief that demands — bounded by the 7px ink curve and directly labelled.
 */

const PAPER = "#F2F0EA";
const INK = "#0A0A0A";
const YELLOW = "#FFD500";
const RED = "#FF1E1E";

const WILLING = YELLOW;
const MAJORITY = "#5C5852";
const RESISTANT = "#191817";

export const DIFFUSION_DURATION = 400;

type Segment = {
  name: string;
  share: number;
  from: number;
  to: number;
  fill: string;
  labelAt: number;
  inside: boolean;
  appearsAt: number;
};

const SEGMENTS: Segment[] = [
  {
    name: "Innovators",
    share: 2.5,
    from: -3.4,
    to: -2,
    fill: WILLING,
    labelAt: -2.45,
    inside: false,
    appearsAt: 58,
  },
  {
    name: "Early Adopters",
    share: 13.5,
    from: -2,
    to: -1,
    fill: WILLING,
    labelAt: -1.62,
    inside: false,
    appearsAt: 80,
  },
  {
    name: "Early Majority",
    share: 34,
    from: -1,
    to: 0,
    fill: MAJORITY,
    labelAt: -0.5,
    inside: true,
    appearsAt: 110,
  },
  {
    name: "Late Majority",
    share: 34,
    from: 0,
    to: 1,
    fill: MAJORITY,
    labelAt: 0.5,
    inside: true,
    appearsAt: 132,
  },
  {
    name: "Laggards",
    share: 16,
    from: 1,
    to: 3.4,
    fill: RESISTANT,
    labelAt: 1.42,
    inside: true,
    appearsAt: 160,
  },
];

const GROUPS = [
  {
    label: "The Willing",
    share: "16%",
    who: "Innovators + Early Adopters",
    action: "Back these people",
    fill: WILLING,
    appearsAt: 80,
  },
  {
    label: "The Majority",
    share: "68%",
    who: "Early + Late Majority",
    action: "Follow once they see proof",
    fill: MAJORITY,
    appearsAt: 132,
  },
  {
    label: "The Resistant",
    share: "16%",
    who: "Laggards",
    action: "Don't spend your energy here",
    fill: RESISTANT,
    appearsAt: 160,
  },
];

const TIPPING_AT = 195;
const BRACKET_AT = 230;
const CALLOUT_AT = 272;

// --- plot geometry ------------------------------------------------------
const PLOT_W = 940;
const PLOT_H = 430;
const SIGMA_MIN = -3.4;
const SIGMA_MAX = 3.4;

const xOf = (sigma: number) =>
  ((sigma - SIGMA_MIN) / (SIGMA_MAX - SIGMA_MIN)) * PLOT_W;
const bell = (sigma: number) => Math.exp(-(sigma * sigma) / 2);
const yOf = (sigma: number) => PLOT_H - bell(sigma) * PLOT_H;

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

const rise = (frame: number, at: number, len = 8) =>
  interpolate(frame, [at, at + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const DiffusionOfInnovation: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn = interpolate(frame, [6, 12], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const draw = interpolate(frame, [26, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const tipping = rise(frame, TIPPING_AT, 10);
  const bracket = rise(frame, BRACKET_AT, 10);
  const CURVE_LEN = 2600;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <div
        style={{
          position: "absolute",
          top: 86,
          left: -40,
          right: -40,
          transform: `rotate(-1.6deg) translateX(${titleIn}px)`,
          backgroundColor: INK,
          padding: "14px 56px 22px",
          boxShadow: `12px 12px 0 ${RED}`,
        }}
      >
        <div
          style={{
            fontFamily: CAPTION_FONT_FAMILY,
            fontSize: 78,
            lineHeight: 1,
            color: PAPER,
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          How culture actually changes
        </div>
      </div>

      {/* the mistake, stated before the chart answers it */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 70,
          width: PLOT_W,
          opacity: rise(frame, 30, 10),
          fontFamily: CAPTION_FONT_FAMILY,
          fontSize: 40,
          lineHeight: 1.1,
          color: INK,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        The mistake: it gets sold to everyone at once.
      </div>

      <div
        style={{
          position: "absolute",
          top: 424,
          left: 70,
          width: PLOT_W,
          height: PLOT_H + 90,
        }}
      >
        <svg width={PLOT_W} height={PLOT_H + 90} style={{ overflow: "visible" }}>
          {SEGMENTS.map((seg) => {
            if (frame < seg.appearsAt) return null;
            const r = rise(frame, seg.appearsAt);
            return (
              <path
                key={seg.name}
                d={areaPath(seg.from, seg.to)}
                fill={seg.fill}
                stroke={PAPER}
                strokeWidth={2}
                opacity={r}
                transform={`translate(0 ${(1 - r) * 26})`}
              />
            );
          })}

          <path
            d={curvePath()}
            fill="none"
            stroke={INK}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={CURVE_LEN}
            strokeDashoffset={CURVE_LEN * (1 - draw)}
          />
          <line
            x1={0}
            y1={PLOT_H}
            x2={PLOT_W * draw}
            y2={PLOT_H}
            stroke={INK}
            strokeWidth={7}
            strokeLinecap="round"
          />

          {/* the tipping point — a threshold reached, not a barrier crossed */}
          {tipping > 0 ? (
            <g opacity={tipping}>
              <line
                x1={xOf(-1)}
                y1={-16}
                x2={xOf(-1)}
                y2={PLOT_H + 12}
                stroke={RED}
                strokeWidth={8}
              />
              <g transform={`translate(${xOf(-1)} -46)`}>
                <rect
                  x={-186}
                  y={-44}
                  width={372}
                  height={60}
                  fill={RED}
                  transform={`scale(${tipping} 1)`}
                />
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  style={{
                    fontFamily: CAPTION_FONT_FAMILY,
                    fontSize: 44,
                    fill: PAPER,
                  }}
                >
                  TIPPING POINT
                </text>
              </g>
            </g>
          ) : null}

          {/* percentages last, so the tipping rule cannot clip them */}
          {SEGMENTS.map((seg) => {
            if (frame < seg.appearsAt + 4) return null;
            const top = yOf(seg.labelAt);
            const y = seg.inside ? top + (PLOT_H - top) * 0.42 : top - 20;
            return (
              <text
                key={seg.name}
                x={xOf(seg.labelAt)}
                y={y}
                textAnchor="middle"
                style={{
                  fontFamily: CAPTION_FONT_FAMILY,
                  fontSize: 40,
                  fill: seg.inside ? PAPER : INK,
                }}
              >
                {seg.share}%
              </text>
            );
          })}

          {/* bracket under the willing */}
          {bracket > 0 ? (
            <g opacity={bracket}>
              <path
                d={`M ${xOf(-3.4)} ${PLOT_H + 26} L ${xOf(-3.4)} ${PLOT_H + 46} L ${xOf(-1)} ${PLOT_H + 46} L ${xOf(-1)} ${PLOT_H + 26}`}
                fill="none"
                stroke={INK}
                strokeWidth={6}
              />
              <text
                x={xOf(-2.2)}
                y={PLOT_H + 96}
                textAnchor="middle"
                style={{
                  fontFamily: CAPTION_FONT_FAMILY,
                  fontSize: 44,
                  fill: INK,
                }}
              >
                START HERE
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      {/* three groups, by what you do about them */}
      <div
        style={{
          position: "absolute",
          top: 1100,
          left: 70,
          width: PLOT_W,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        {GROUPS.map((g) => {
          if (frame < g.appearsAt) return null;
          const slide = interpolate(
            frame,
            [g.appearsAt, g.appearsAt + 7],
            [-40, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );
          return (
            <div
              key={g.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 22,
                transform: `translateX(${slide}px)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  backgroundColor: g.fill,
                  border: `4px solid ${INK}`,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: CAPTION_FONT_FAMILY,
                    fontSize: 56,
                    lineHeight: 1,
                    color: INK,
                    textTransform: "uppercase",
                  }}
                >
                  {g.label} — {g.share}
                </div>
                <div
                  style={{
                    fontFamily: CAPTION_FONT_FAMILY,
                    fontSize: 34,
                    lineHeight: 1.15,
                    color: "#5C5852",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {g.who} · {g.action}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {frame >= CALLOUT_AT ? (
        <div
          style={{
            position: "absolute",
            bottom: 150,
            left: 70,
            width: PLOT_W,
            backgroundColor: YELLOW,
            border: `6px solid ${INK}`,
            padding: "24px 30px",
            transform: `rotate(0.8deg) scale(${rise(frame, CALLOUT_AT, 6)})`,
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
            Don't sell it to everyone. Back the 16% who already believe — the
            rest follow.
          </div>
        </div>
      ) : null}

      {SEGMENTS.map((seg) => (
        <Sequence key={seg.name} from={seg.appearsAt}>
          <Audio src={staticFile("audio/impact.wav")} volume={0.4} />
        </Sequence>
      ))}
      <Sequence from={TIPPING_AT}>
        <Audio src={staticFile("audio/impact.wav")} volume={0.9} />
      </Sequence>
      <Sequence from={CALLOUT_AT}>
        <Audio src={staticFile("audio/impact.wav")} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
