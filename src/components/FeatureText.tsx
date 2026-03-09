import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useCameraTransformRef } from "./CursorPositionContext";

interface FeatureTextProps {
  title: string;
  subtitle?: string;
  tags?: string[];
  durationInFrames: number;
}

// The Slack layout is 1920px wide in content space.
const CONTENT_WIDTH = 1920;
// Minimum gap between the Slack right edge and the feature text
const GAP = 30;

export const FeatureText: React.FC<FeatureTextProps> = ({
  title,
  subtitle,
  tags,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const camRef = useCameraTransformRef();
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

  // Where the right edge of the Slack content falls in screen space
  const { zoom, offsetX } = camRef.current;
  const slackRightEdge = offsetX + CONTENT_WIDTH * zoom;

  // Position the text to start just past the Slack content, right-aligned to viewport edge
  const leftPos = Math.max(slackRightEdge + GAP, width * 0.55);
  const availableWidth = width - leftPos - 40;

  // Don't render if there's no room
  if (availableWidth < 150) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: leftPos,
        right: 40,
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        opacity,
        transform: `translateX(${slideX}px)`,
        textAlign: "left",
        pointerEvents: "none",
      }}
    >
     <div style={{ maxWidth: availableWidth }}>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
          marginBottom: subtitle || tags ? 20 : 0,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 26,
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
            justifyContent: "flex-start",
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
                  padding: "10px 24px",
                  borderRadius: 8,
                  backgroundColor: "rgba(0, 122, 90, 0.12)",
                  border: "1px solid rgba(0, 122, 90, 0.3)",
                  color: "#4ade80",
                  fontSize: 22,
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
