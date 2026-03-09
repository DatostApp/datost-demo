import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

interface TypingIndicatorProps {
  name: string;
  /** Frame when typing starts */
  startFrame: number;
  /** Frame when typing stops (message arrives) */
  endFrame: number;
}

const BouncingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  // Cycle every 20 frames (~0.66s), offset by delay
  const cycle = (frame - delay) % 24;
  const y = interpolate(
    cycle,
    [0, 6, 12, 24],
    [0, -3, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "#9ea0a5",
        transform: `translateY(${y}px)`,
      }}
    />
  );
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  name,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame >= endFrame) return null;

  const fadeIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.4 },
  });

  const opacity = interpolate(fadeIn, [0, 1], [0, 1]);
  const translateY = interpolate(fadeIn, [0, 1], [8, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 0",
        fontSize: 17,
        color: "#9ea0a5",
      }}
    >
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <BouncingDot delay={0} />
        <BouncingDot delay={4} />
        <BouncingDot delay={8} />
      </div>
      <span style={{ marginLeft: 4 }}>
        <strong style={{ color: "#d1d2d3", fontWeight: 600 }}>{name}</strong> is
        typing...
      </span>
    </div>
  );
};
