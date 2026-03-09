import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { DatostWordmark } from "./OverlayCard";
import { SlackMessage, ChannelMention } from "./SlackMessage";

const clampOpts = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const OutroSequence: React.FC = () => {
  const frame = useCurrentFrame();

  // Dark background fades in over 30 frames — covers the Slack UI
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], clampOpts);

  // Lingering message fades in fast, appearing before bg is fully dark
  const msgOpacity = interpolate(frame, [5, 18], [0, 1], clampOpts);

  // Branding appears after bg is fully dark
  const wordmarkOpacity = interpolate(frame, [35, 50], [0, 1], clampOpts);
  const subtitleOpacity = interpolate(frame, [42, 52], [0, 1], clampOpts);
  const urlOpacity = interpolate(frame, [50, 60], [0, 1], clampOpts);

  return (
    <AbsoluteFill>
      {/* Dark background fade */}
      <AbsoluteFill
        style={{
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse at 50% 40%, #141618 0%, #0a0a0a 70%)",
        }}
      />

      {/* Everything centered as a single vertical stack */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ opacity: wordmarkOpacity }}>
          <DatostWordmark height={90} />
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            fontSize: 28,
            color: "#8e9196",
            marginTop: 14,
          }}
        >
          Your AI data analyst — right in Slack
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontSize: 30,
            color: "#007a5a",
            fontWeight: 600,
            marginTop: 44,
          }}
        >
          datost.com
        </div>

        {/* Lingering message — below branding */}
        <div
          style={{
            opacity: msgOpacity,
            width: 700,
            marginTop: 80,
            fontSize: 15,
            color: "#d1d2d3",
          }}
        >
          <SlackMessage
            author="Maceo"
            avatarColor="#4a154b"
            avatarInitial="M"
            timestamp="Just now"
            startFrame={0}
            noAnimation
          >
            done, dropping this in <ChannelMention>cs-renewals</ChannelMention>. we just went from
            &ldquo;I have a bad feeling about some accounts&rdquo; to a full
            churn prevention system in one thread
          </SlackMessage>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
