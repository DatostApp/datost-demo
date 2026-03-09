import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface FeatureTextProps {
  title: string;
  subtitle?: string;
  tags?: string[];
  durationInFrames: number;
}

export const FeatureText: React.FC<FeatureTextProps> = ({
  title,
  subtitle,
  tags,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = 15;
  const fadeOut = 15;

  const opacity = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const slideX = interpolate(frame, [0, fadeIn + 5], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        opacity,
        transform: `translateX(${slideX}px)`,
        textAlign: "right",
        maxWidth: 500,
        pointerEvents: "none",
      }}
    >
     <div>
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
          marginBottom: subtitle || tags ? 16 : 0,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 20,
            color: "#8e9196",
            fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.5,
            opacity: interpolate(
              frame,
              [fadeIn, fadeIn + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          {subtitle}
        </div>
      )}
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          {tags.map((tag, i) => {
            const tagStart = fadeIn + i * 3;
            return (
              <div
                key={tag}
                style={{
                  opacity: interpolate(
                    frame,
                    [tagStart, tagStart + 8],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                  padding: "8px 18px",
                  borderRadius: 6,
                  backgroundColor: "rgba(0, 122, 90, 0.12)",
                  border: "1px solid rgba(0, 122, 90, 0.3)",
                  color: "#4ade80",
                  fontSize: 17,
                  fontWeight: 500,
                  fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
      )}
     </div>
    </div>
  );
};
