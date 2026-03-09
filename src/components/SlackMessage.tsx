import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { MessageHoverBar } from "./MessageHoverBar";
import { useCursorTarget } from "./CursorTargetContext";

export interface SlackMessageProps {
  author: string;
  avatarColor: string;
  avatarInitial: string;
  timestamp: string;
  children: React.ReactNode;
  /** Frame at which this message starts appearing */
  startFrame: number;
  isBot?: boolean;
  botLabel?: string;
  /** Frame range for the hover highlight background */
  hoverFrameStart?: number;
  hoverFrameEnd?: number;
  /** Frame when hover toolbar appears */
  hoverBarShowFrame?: number;
  /** Frame when hover toolbar disappears */
  hoverBarHideFrame?: number;
  /** Frame when thread button gets highlighted */
  highlightThreadFrame?: number;
  /** Cursor target ID for this message body */
  cursorTargetId?: string;
  /** Cursor target ID for the reply button */
  replyTargetId?: string;
  /** Camera target ID — registers the full message container for camera framing */
  cameraTargetId?: string;
  /** Continuation message — no avatar or name, just aligned text */
  continuation?: boolean;
  /** Skip the slide/fade entrance animation */
  noAnimation?: boolean;
}

export const SlackMessage: React.FC<SlackMessageProps> = ({
  author,
  avatarColor,
  avatarInitial,
  timestamp,
  children,
  startFrame,
  isBot,
  botLabel,
  hoverFrameStart,
  hoverFrameEnd,
  hoverBarShowFrame,
  hoverBarHideFrame,
  highlightThreadFrame,
  cursorTargetId,
  replyTargetId,
  cameraTargetId,
  continuation,
  noAnimation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const messageRef = useCursorTarget(cursorTargetId ?? "__unused_msg");
  const cameraRef = useCursorTarget(cameraTargetId ?? "__unused_cam");

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 18,
      stiffness: 140,
      mass: 0.6,
    },
  });

  if (frame < startFrame) return null;

  const opacity = noAnimation ? 1 : interpolate(progress, [0, 1], [0, 1]);
  const translateY = noAnimation ? 0 : interpolate(progress, [0, 1], [30, 0]);

  const isHovered =
    hoverFrameStart !== undefined &&
    hoverFrameEnd !== undefined &&
    frame >= hoverFrameStart &&
    frame < hoverFrameEnd;

  if (continuation) {
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "2px 20px",
          margin: "0 -20px",
          opacity,
          transform: `translateY(${translateY}px)`,
          position: "relative",
          backgroundColor: isHovered
            ? "rgba(255,255,255,0.04)"
            : "transparent",
        }}
      >
        {hoverBarShowFrame !== undefined &&
          hoverBarHideFrame !== undefined && (
            <MessageHoverBar
              showFrame={hoverBarShowFrame}
              hideFrame={hoverBarHideFrame}
              highlightThreadFrame={highlightThreadFrame}
              replyTargetId={replyTargetId}
            />
          )}
        {/* Spacer to align with messages above */}
        <div style={{ width: 48, flexShrink: 0 }} />
        <div
          ref={cursorTargetId ? messageRef : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 20,
            color: "#d1d2d3",
            lineHeight: 1.46,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cameraTargetId ? cameraRef : undefined}
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 20px",
        margin: "0 -20px",
        opacity,
        transform: `translateY(${translateY}px)`,
        position: "relative",
        backgroundColor: isHovered ? "rgba(255,255,255,0.04)" : "transparent",
      }}
    >
      {hoverBarShowFrame !== undefined && hoverBarHideFrame !== undefined && (
        <MessageHoverBar
          showFrame={hoverBarShowFrame}
          hideFrame={hoverBarHideFrame}
          highlightThreadFrame={highlightThreadFrame}
          replyTargetId={replyTargetId}
        />
      )}
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {avatarInitial}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#d1d2d3",
            }}
          >
            {author}
          </span>
          {isBot && (
            <span
              style={{
                fontSize: 14,
                color: "#9ea0a5",
                backgroundColor: "rgba(255,255,255,0.06)",
                padding: "2px 7px",
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              {botLabel || "APP"}
            </span>
          )}
          <span
            style={{
              fontSize: 16,
              color: "#616061",
            }}
          >
            {timestamp}
          </span>
        </div>

        {/* Message body */}
        <div
          ref={cursorTargetId ? messageRef : undefined}
          style={{
            fontSize: 20,
            color: "#d1d2d3",
            lineHeight: 1.46,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** Styled @mention inline */
export const Mention: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      color: "#1d9bd1",
      backgroundColor: "rgba(29,155,209,0.1)",
      borderRadius: 4,
      padding: "0 3px",
      fontWeight: 500,
    }}
  >
    @{children}
  </span>
);

/** Styled #channel mention inline */
export const ChannelMention: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      color: "#1d9bd1",
      backgroundColor: "rgba(29,155,209,0.1)",
      borderRadius: 4,
      padding: "0 3px",
      fontWeight: 500,
    }}
  >
    #{children}
  </span>
);
