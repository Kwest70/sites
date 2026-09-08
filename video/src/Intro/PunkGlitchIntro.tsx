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
 * Punk / glitch title card.
 *
 * Expects two files in video/public/images/ (see that folder's README):
 *   backdrop.png  — the abstract typography artwork
 *   portrait.png  — the cut-out portrait, ideally with a transparent background
 *
 * Both are optional: if a file is absent the composition falls back to a
 * procedural stand-in rather than failing to render, so the studio never goes
 * blank while the artwork is still being added.
 */

const BACKDROP = "images/backdrop.png";
const PORTRAIT = "images/portrait.png";

/**
 * Set to true if portrait.png has a solid WHITE background instead of
 * transparency — multiply blending drops the white and keeps the subject.
 */
const PORTRAIT_KNOCKS_OUT_WHITE = false;

const YELLOW = "#FFD500";
const INK = "#000000";

export const INTRO_DURATION = 135;

const TITLES = [
  { text: "Creative Director", appearsAt: 36 },
  { text: "Cultural Strategist", appearsAt: 52 },
  { text: "Creative Technologist", appearsAt: 68 },
];

/** Bursts of glitch: {frame, amplitude, decay in frames}. */
const BURSTS = [
  { f: 0, a: 1, d: 10 },
  { f: 18, a: 0.95, d: 7 },
  { f: 36, a: 0.85, d: 6 },
  { f: 52, a: 0.85, d: 6 },
  { f: 68, a: 0.85, d: 6 },
  { f: 88, a: 0.5, d: 5 },
  { f: 104, a: 0.6, d: 5 },
  { f: 118, a: 1, d: 17 },
];

const glitchAt = (frame: number) =>
  BURSTS.reduce((peak, b) => {
    if (frame < b.f) return peak;
    const t = (frame - b.f) / b.d;
    return t > 1 ? peak : Math.max(peak, b.a * (1 - t));
  }, 0);

/** Probe an asset once so a missing file degrades instead of breaking. */
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

/**
 * One pass of glitch: the picture is torn into horizontal bands that are
 * shoved sideways, each band carrying its own red/cyan fringe. Doing the
 * displacement and the channel split in a single pass keeps this to ~13
 * copies of the scene per frame; nesting two separate effects cost 33 and
 * jammed the render thread during the heavy end burst.
 */
const Glitched: React.FC<{
  readonly intensity: number;
  readonly seed: number;
  readonly children: React.ReactNode;
}> = ({ intensity, seed, children }) => {
  if (intensity <= 0.01) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const bands = 11;
  const split = intensity * 20;

  return (
    <AbsoluteFill>
      {new Array(bands).fill(0).map((_, i) => {
        const top = (i / bands) * 100;
        const bottom = 100 - ((i + 1) / bands) * 100;
        const kick = random(`${seed}-${i}`) - 0.5;
        const skip = random(`${seed}-s-${i}`) > 0.45 ? 1 : 0.15;
        const dx = kick * 190 * intensity * skip;
        const tint = random(`${seed}-t-${i}`);

        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${bottom}% 0)`,
              transform: `translateX(${dx}px)`,
              filter:
                tint > 0.72
                  ? `hue-rotate(${Math.round(intensity * 40)}deg) saturate(1.5)`
                  : undefined,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}

      {/* whole-frame channel split, only while the burst is strong */}
      {intensity > 0.45 ? (
        <>
          <AbsoluteFill
            style={{
              transform: `translateX(${-split}px)`,
              filter: "url(#punk-red)",
              mixBlendMode: "screen",
              opacity: 0.5,
            }}
          >
            {children}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `translateX(${split}px)`,
              filter: "url(#punk-cyan)",
              mixBlendMode: "screen",
              opacity: 0.5,
            }}
          >
            {children}
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Backdrop: React.FC<{
  readonly frame: number;
  readonly exists: boolean;
}> = ({ frame, exists }) => {
  const drift = interpolate(frame, [0, INTRO_DURATION], [1.14, 1.28]);

  if (!exists) {
    // Stand-in until backdrop.png is added.
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #FF2D6F 0%, transparent 55%)," +
            "radial-gradient(circle at 75% 65%, #10C7B4 0%, transparent 55%)," +
            "radial-gradient(circle at 50% 90%, #FF7A1A 0%, transparent 60%)," +
            "#141018",
          transform: `scale(${drift})`,
        }}
      />
    );
  }

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(BACKDROP)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${drift})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Portrait: React.FC<{
  readonly frame: number;
  readonly exists: boolean;
}> = ({ frame, exists }) => {
  const rise = interpolate(frame, [18, 34], [140, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pop = interpolate(frame, [18, 30], [1.18, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const shell: React.CSSProperties = {
    justifyContent: "flex-end",
    alignItems: "center",
    transform: `translateY(${rise}px) scale(${pop})`,
  };

  if (!exists) {
    return (
      <AbsoluteFill style={shell}>
        <div
          style={{
            width: 620,
            height: 860,
            borderRadius: "300px 300px 0 0",
            background: "#2A2A31",
            border: `10px solid ${INK}`,
            opacity: 0.9,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={shell}>
      <Img
        src={staticFile(PORTRAIT)}
        style={{
          width: "112%",
          objectFit: "contain",
          mixBlendMode: PORTRAIT_KNOCKS_OUT_WHITE ? "multiply" : "normal",
        }}
      />
    </AbsoluteFill>
  );
};

const Title: React.FC<{
  readonly text: string;
  readonly appearsAt: number;
  readonly frame: number;
}> = ({ text, appearsAt, frame }) => {
  const local = frame - appearsAt;
  if (local < 0) return null;

  const slam = interpolate(local, [0, 7], [1.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Stutters on for the first few frames, then locks.
  const stutter = local < 6 && random(`t-${appearsAt}-${frame}`) > 0.62;
  const jitter = local < 10 ? (random(`j-${appearsAt}-${frame}`) - 0.5) * 16 : 0;

  return (
    <div
      style={{
        transform: `scale(${slam}) translateX(${jitter}px)`,
        opacity: stutter ? 0.25 : 1,
        fontFamily: CAPTION_FONT_FAMILY,
        fontSize: 98,
        whiteSpace: "nowrap",
        lineHeight: 1.02,
        textAlign: "center",
        textTransform: "uppercase",
        color: YELLOW,
        WebkitTextStroke: `13px ${INK}`,
        paintOrder: "stroke fill",
        textShadow: stutter
          ? `${-9}px 0 #FF0044, 9px 0 #00E5FF`
          : "6px 6px 0 rgba(0,0,0,0.45)",
      }}
    >
      {text}
    </div>
  );
};

export const PunkGlitchIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const g = glitchAt(frame);

  // Probed once here, not inside the duplicated glitch layers.
  const backdropOk = useAssetExists(BACKDROP);
  const portraitOk = useAssetExists(PORTRAIT);

  // Hard strobe on the opening frames and the sign-off.
  const strobe =
    (frame < 9 && random(`st-${frame}`) > 0.55) ||
    (frame > 118 && random(`st-${frame}`) > 0.62);

  const scanShift = (Math.floor(frame / 2) * 3) % 6;

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* channel-isolating filters used by <Chroma> */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="punk-red">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="punk-cyan">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {backdropOk === null || portraitOk === null ? null : (
        <Glitched intensity={g} seed={frame}>
          <AbsoluteFill>
            <Backdrop frame={frame} exists={backdropOk} />
            <Portrait frame={frame} exists={portraitOk} />
          </AbsoluteFill>
        </Glitched>
      )}

      {/* titles sit above the head, centred */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 210,
          paddingLeft: 40,
          paddingRight: 40,
          gap: 18,
          flexDirection: "column",
        }}
      >
        {TITLES.map((t) => (
          <Title
            key={t.text}
            text={t.text}
            appearsAt={t.appearsAt}
            frame={frame}
          />
        ))}
      </AbsoluteFill>

      {/* scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.30) 0px, rgba(0,0,0,0.30) 2px, transparent 2px, transparent 6px)",
          transform: `translateY(${scanShift}px)`,
          opacity: 0.5,
          mixBlendMode: "multiply",
        }}
      />

      {/* grain */}
      <AbsoluteFill
        style={{
          opacity: 0.05 + g * 0.11,
          mixBlendMode: "overlay",
          backgroundImage: `repeating-conic-gradient(#fff 0% 25%, #000 0% 50%)`,
          backgroundSize: `${5 + (Math.floor(frame / 4) % 2)}px ${5 + (Math.floor(frame / 6) % 2)}px`,
        }}
      />

      {strobe ? (
        <AbsoluteFill
          style={{ backgroundColor: YELLOW, mixBlendMode: "difference" }}
        />
      ) : null}

      {/* hits on the portrait landing and each title */}
      <Sequence from={18}>
        <Audio src={staticFile("audio/impact.wav")} volume={0.9} />
      </Sequence>
      {TITLES.map((t) => (
        <Sequence key={t.text} from={t.appearsAt}>
          <Audio src={staticFile("audio/impact.wav")} volume={0.7} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
