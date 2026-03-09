import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface SpiderVerseMentionProps {
  text: string;
  startFrame: number;
  effectDuration?: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const FONTS = [
  '"Impact", sans-serif',
  '"Georgia", serif',
  '"Courier New", monospace',
  '"Arial Black", sans-serif',
  '"Times New Roman", serif',
  '"Comic Sans MS", cursive',
  '"Trebuchet MS", sans-serif',
  '"Palatino", serif',
];

const COLORS = [
  "#ff3366", "#ffcc00", "#00ff88", "#ff6600", "#cc33ff",
  "#00ccff", "#ff0044", "#33ff33", "#ff9900", "#ffffff",
  "#ff1493", "#7fff00",
];

const BG_COLORS = [
  "#1a1a2e", "#e63946", "#2d2d2d", "#f4a261", "#264653",
  "#9b2226", "#3a0ca3", "#023e8a", "transparent", "#540b0e",
  "#606c38", "#3d405b",
];

function getLetterStyle(
  charIndex: number,
  cycleFrame: number
): React.CSSProperties {
  const cycleSeed = Math.floor(cycleFrame / 2);
  const seed = cycleSeed * 100 + charIndex * 7;
  const r = (offset: number) => seededRandom(seed + offset);

  const font = FONTS[Math.floor(r(1) * FONTS.length)];
  const color = COLORS[Math.floor(r(2) * COLORS.length)];
  const bg = BG_COLORS[Math.floor(r(3) * BG_COLORS.length)];
  const rotation = (r(4) - 0.5) * 24;
  const scale = 0.8 + r(5) * 0.7;
  const size = 17 + Math.floor(r(6) * 14);
  const bold = r(7) > 0.4;
  const italic = r(8) > 0.7;
  const uppercase = r(9) > 0.5;
  const border = r(10) > 0.6;
  const skewX = (r(11) - 0.5) * 10;

  return {
    fontFamily: font,
    color,
    backgroundColor: bg,
    fontSize: size,
    fontWeight: bold ? 900 : 400,
    fontStyle: italic ? "italic" : "normal",
    textTransform: uppercase ? "uppercase" : "none",
    transform: `rotate(${rotation}deg) scale(${scale}) skewX(${skewX}deg)`,
    padding: "0 2px",
    borderRadius: border ? 2 : 0,
    border: border ? "1px solid rgba(255,255,255,0.3)" : "none",
    lineHeight: 1.2,
    boxShadow: r(12) > 0.5 ? "1px 1px 0 rgba(0,0,0,0.5)" : "none",
    textShadow:
      r(13) > 0.6
        ? `${r(14) > 0.5 ? "" : "-"}1px ${r(15) > 0.5 ? "" : "-"}1px 0 rgba(0,0,0,0.8)`
        : "none",
  };
}

const normalStyle: React.CSSProperties = {
  color: "#1d9bd1",
  backgroundColor: "rgba(29,155,209,0.1)",
  borderRadius: 3,
  padding: "0 2px",
  fontWeight: 500,
};

export const SpiderVerseMention: React.FC<SpiderVerseMentionProps> = ({
  text,
  startFrame,
  effectDuration = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = frame - startFrame;
  const isAnimating = elapsed >= 0 && elapsed < effectDuration;

  const settleProgress = spring({
    frame: Math.max(0, frame - (startFrame + effectDuration)),
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.5 },
  });

  const isSettling =
    frame >= startFrame + effectDuration && settleProgress < 0.99;

  const showOverlay = isAnimating || isSettling;
  const overlayOpacity = isAnimating
    ? 1
    : interpolate(settleProgress, [0, 1], [1, 0]);

  const fullText = `@${text}`;
  const letters = fullText.split("");

  return (
    <span style={{ position: "relative", display: "inline" }}>
      {/* Base layer — always rendered, always determines layout size */}
      <span style={normalStyle}>@{text}</span>

      {/* Overlay — animated letters positioned on top, no layout impact */}
      {showOverlay && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: overlayOpacity,
          }}
        >
          {letters.map((char, i) => {
            if (isAnimating) {
              const style = getLetterStyle(i, elapsed);
              const letterDelay = i * 1.5;
              const letterProgress = spring({
                frame: Math.max(0, elapsed - letterDelay),
                fps,
                config: { damping: 12, stiffness: 200, mass: 0.3 },
              });
              const letterScale = interpolate(
                letterProgress,
                [0, 1],
                [0, 1]
              );

              return (
                <span
                  key={`${i}-${elapsed}`}
                  style={{
                    ...style,
                    display: "inline-block",
                    opacity: letterScale,
                    transform: `${style.transform} scale(${letterScale})`,
                  }}
                >
                  {char}
                </span>
              );
            }

            // Settling — last random style fading out
            const lastStyle = getLetterStyle(i, effectDuration - 1);
            return (
              <span
                key={i}
                style={{
                  ...lastStyle,
                  display: "inline-block",
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      )}
    </span>
  );
};
