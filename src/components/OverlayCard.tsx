import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

interface OverlayCardProps {
  title?: string;
  subtitle?: string;
  tags?: string[];
  showLogo?: boolean;
  showUrl?: boolean;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

/** The D-icon + "atost" wordmark, matching the official brand treatment. */
export const DatostWordmark: React.FC<{ height?: number }> = ({ height = 100 }) => {
  const iconH = height;
  const iconW = iconH * (228 / 254);
  const fontSize = iconH / 0.727;
  const descenderOffset = fontSize * 0.14;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <svg
        viewBox="72 72 228 254"
        style={{
          width: iconW,
          height: iconH,
          marginBottom: descenderOffset,
          marginRight: 1,
          flexShrink: 0,
        }}
      >
        <defs>
          <mask id="wordmarkMask">
            <rect x="0" y="0" width="400" height="400" fill="white" />
            <rect x="0" y="150" width="400" height="10" fill="black" />
            <rect x="0" y="238" width="400" height="10" fill="black" />
            <rect x="150" y="0" width="10" height="400" fill="black" />
          </mask>
        </defs>
        <path
          d="M 72 72 L 200 72 C 300 72 300 200 300 200 C 300 200 300 326 200 326 L 72 326 Z"
          fill="#ffffff"
          mask="url(#wordmarkMask)"
        />
      </svg>
      <span
        style={{
          fontSize,
          fontWeight: 900,
          color: "#ffffff",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          letterSpacing: -3.5,
          lineHeight: 1,
        }}
      >
        atost
      </span>
    </div>
  );
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  title,
  subtitle,
  tags,
  showLogo = false,
  showUrl = false,
  durationInFrames,
  fadeInFrames = 15,
  fadeOutFrames = 15,
}) => {
  const frame = useCurrentFrame();
  const clampOpts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const opacity = (() => {
    if (fadeOutFrames <= 0) return 1;
    return interpolate(
      frame,
      [durationInFrames - fadeOutFrames, durationInFrames],
      [1, 0],
      clampOpts,
    );
  })();

  const contentY = 0;

  const logoOpacity = 1;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          "radial-gradient(ellipse at 50% 40%, #141618 0%, #0a0a0a 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${contentY}px)`,
        }}
      >
        {showLogo ? (
          <div style={{ opacity: logoOpacity, marginBottom: 36 }}>
            <DatostWordmark height={130} />
          </div>
        ) : (
          title && (
            <div
              style={{
                fontSize: 90,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
                textAlign: "center",
                letterSpacing: -0.5,
              }}
            >
              {title}
            </div>
          )
        )}
        {subtitle && (
          <div
            style={{
              fontSize: 46,
              color: "#8e9196",
              fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
              textAlign: "center",
              maxWidth: 1200,
              lineHeight: 1.6,
              marginTop: showLogo ? 0 : 20,
              opacity: 1,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
