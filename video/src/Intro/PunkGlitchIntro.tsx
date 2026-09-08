import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CAPTION_FONT_FAMILY } from "../Caption/fonts";

/**
 * Xerox-zine punk title card.
 *
 * Photocopied, torn and misaligned rather than smooth: the portrait runs full
 * frame in hard black and white under a halftone screen, and each title slams
 * in on its own as a ransom-note strip, rotated off-grid and bleeding past the
 * edge of the frame. Glitch is reserved for the cuts, so it lands as a hit
 * instead of a constant wash.
 *
 * Artwork goes in video/public/images/ (see that folder's README):
 *   backdrop.png  — the abstract typography artwork, flashed on the hits
 *   portrait.png  — the cut-out portrait
 * Both are optional; a stand-in is drawn if a file is absent.
 */

const BACKDROP = "images/backdrop.png";
const PORTRAIT = "images/portrait.png";

/** Set true if portrait.png has a solid WHITE background instead of alpha. */
const PORTRAIT_KNOCKS_OUT_WHITE = false;

const PAPER = "#F2F0EA";
const INK = "#0A0A0A";
const YELLOW = "#FFD500";
const RED = "#FF1E1E";

export const INTRO_DURATION = 150;

type Strip = {
  text: string;
  from: number;
  duration: number;
  fill: string;
  ink: string;
  rotate: number;
  /** -1 bleeds off the left, 1 off the right, 0 sits centred. */
  bleed: number;
  top: string;
  size: number;
};

const STRIPS: Strip[] = [
  {
    text: "Creative Director",
    from: 24,
    duration: 34,
    fill: INK,
    ink: PAPER,
    rotate: -3.5,
    bleed: -1,
    top: "13%",
    size: 106,
  },
  {
    text: "Cultural Strategist",
    from: 58,
    duration: 34,
    fill: YELLOW,
    ink: INK,
    rotate: 2.5,
    bleed: 1,
    top: "13%",
    size: 102,
  },
  {
    text: "Creative Technologist",
    from: 92,
    duration: 34,
    fill: RED,
    ink: PAPER,
    rotate: -2,
    bleed: -1,
    top: "13%",
    size: 92,
  },
];

/** The frames where something cuts — glitch is allowed only here. */
const CUTS = [0, 10, 24, 58, 92, 126];

const cutHeat = (frame: number) =>
  CUTS.reduce((peak, c) => {
    const t = (frame - c) / 5;
    if (t < 0 || t > 1) return peak;
    return Math.max(peak, 1 - t);
  }, 0);

const useAssetExists = (src: string) => {
  const [exists, setExists] = useState<boolean | null>(null);
  const [handle] = useState(() => delayRender(`Probing ${src}`));

  useEffect(() => {
    const img = new window.Image();
    const done = (found: boolean) => {
      setExists(found);
      continueRender(handle);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = staticFile(src);
  }, [handle, src]);

  return exists;
};

/** Head-and-shoulders stand-in, so layout can be judged before art lands. */
const PortraitStandIn: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
    <svg viewBox="0 0 600 900" width="100%" height="92%">
      <path
        d="M300 120c78 0 132 62 132 146 0 58-22 104-52 132 74 26 148 70 176 148 18 50 26 118 30 174H14c4-56 12-124 30-174 28-78 102-122 176-148-30-28-52-74-52-132 0-84 54-146 132-146z"
        fill="none"
        stroke="#9A9A9A"
        strokeWidth={10}
        strokeDasharray="26 18"
      />
    </svg>
  </AbsoluteFill>
);

const Portrait: React.FC<{
  readonly frame: number;
  readonly exists: boolean;
}> = ({ frame, exists }) => {
  // Punches in hard on frame 10, then creeps.
  const punch = interpolate(frame, [10, 18], [1.22, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const creep = interpolate(frame, [18, INTRO_DURATION], [1.05, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = frame < 18 ? punch : creep;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom})`,
        // Hard black-and-white photocopy.
        filter: "grayscale(1) contrast(2.6) brightness(1.08)",
      }}
    >
      {exists ? (
        <Img
          src={staticFile(PORTRAIT)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 22%",
            mixBlendMode: PORTRAIT_KNOCKS_OUT_WHITE ? "multiply" : "normal",
          }}
        />
      ) : (
        <PortraitStandIn />
      )}
    </AbsoluteFill>
  );
};

/** A ransom-note strip: solid block, rotated, running past the frame edge. */
const RansomStrip: React.FC<{ readonly strip: Strip }> = ({ strip }) => {
  const frame = useCurrentFrame();

  // Snaps in over 3 frames — no easing curve, this should feel stamped.
  const inSlide = interpolate(frame, [0, 3], [strip.bleed * 90 - 40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rattle = frame < 5 ? (random(`r-${strip.text}-${frame}`) - 0.5) * 12 : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start" }}>
      <div
        style={{
          position: "absolute",
          top: strip.top,
          left: strip.bleed < 0 ? "-9%" : undefined,
          right: strip.bleed > 0 ? "-9%" : undefined,
          transform: `rotate(${strip.rotate}deg) translateX(${inSlide + rattle}px)`,
          backgroundColor: strip.fill,
          paddingTop: 18,
          paddingBottom: 26,
          paddingLeft: strip.bleed < 0 ? 160 : 60,
          paddingRight: strip.bleed > 0 ? 160 : 60,
          boxShadow: `14px 14px 0 ${INK}`,
        }}
      >
        <div
          style={{
            fontFamily: CAPTION_FONT_FAMILY,
            fontSize: strip.size,
            lineHeight: 1,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            color: strip.ink,
            letterSpacing: "-0.01em",
          }}
        >
          {strip.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Torn bands, only on the cut frames. */
const Torn: React.FC<{
  readonly heat: number;
  readonly seed: number;
  readonly children: React.ReactNode;
}> = ({ heat, seed, children }) => {
  if (heat <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;

  const bands = 9;

  return (
    <AbsoluteFill>
      {new Array(bands).fill(0).map((_, i) => {
        const top = (i / bands) * 100;
        const bottom = 100 - ((i + 1) / bands) * 100;
        const dx = (random(`${seed}-${i}`) - 0.5) * 240 * heat;

        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              transform: `translateX(${dx}px)`,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const PunkGlitchIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const heat = cutHeat(frame);

  const backdropOk = useAssetExists(BACKDROP);
  const portraitOk = useAssetExists(PORTRAIT);

  // Single-frame inversions on the hits.
  const invert = heat > 0.7 && random(`inv-${frame}`) > 0.45;

  if (backdropOk === null || portraitOk === null) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Torn heat={heat} seed={frame}>
        <AbsoluteFill>
          {/* artwork flashes through on the hits only */}
          {heat > 0.35 && backdropOk ? (
            <AbsoluteFill style={{ opacity: heat }}>
              <Img
                src={staticFile(BACKDROP)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          ) : null}

          {frame >= 10 ? (
            <Portrait frame={frame} exists={portraitOk} />
          ) : null}

          {/* halftone screen */}
          <AbsoluteFill
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #000 0 32%, transparent 33%)",
              backgroundSize: "5px 5px",
              mixBlendMode: "screen",
              opacity: 0.42,
            }}
          />
        </AbsoluteFill>
      </Torn>

      {STRIPS.map((strip) => (
        <Sequence
          key={strip.text}
          from={strip.from}
          durationInFrames={strip.duration}
        >
          <RansomStrip strip={strip} />
        </Sequence>
      ))}

      {/* photocopy dirt */}
      <AbsoluteFill
        style={{
          opacity: 0.14,
          mixBlendMode: "multiply",
          backgroundImage:
            "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)",
          backgroundSize: `${7 + (Math.floor(frame / 5) % 2)}px ${7}px`,
        }}
      />

      {invert ? (
        <AbsoluteFill
          style={{ backgroundColor: PAPER, mixBlendMode: "difference" }}
        />
      ) : null}

      {CUTS.filter((c) => c >= 10).map((c) => (
        <Sequence key={c} from={c}>
          <Audio src={staticFile("audio/impact.wav")} volume={0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
