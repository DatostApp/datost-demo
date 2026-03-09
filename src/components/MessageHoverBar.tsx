import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { useCursorTarget } from "./CursorTargetContext";

interface MessageHoverBarProps {
  /** Frame when the toolbar appears */
  showFrame: number;
  /** Frame when the toolbar disappears */
  hideFrame: number;
  /** Highlight the thread button (on hover) starting at this frame */
  highlightThreadFrame?: number;
  /** Cursor target ID for the reply button */
  replyTargetId?: string;
}

const HoverIcon: React.FC<{
  children: React.ReactNode;
  highlighted?: boolean;
  tooltip?: string;
  showTooltip?: boolean;
  targetRef?: (el: HTMLElement | null) => void;
}> = ({ children, highlighted, tooltip, showTooltip, targetRef }) => (
  <div
    ref={targetRef}
    style={{
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      backgroundColor: highlighted ? "#35373b" : "transparent",
      color: highlighted ? "#e8e8e8" : "#9ea0a5",
      position: "relative",
    }}
  >
    {children}
    {tooltip && showTooltip && (
      <div
        style={{
          position: "absolute",
          bottom: -32,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1d1c1d",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          border: "1px solid #4a4a4d",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          zIndex: 10,
        }}
      >
        {tooltip}
      </div>
    )}
  </div>
);

export const MessageHoverBar: React.FC<MessageHoverBarProps> = ({
  showFrame,
  hideFrame,
  highlightThreadFrame,
  replyTargetId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const replyRef = useCursorTarget(replyTargetId ?? "replyButton");

  if (frame < showFrame || frame >= hideFrame) return null;

  const fadeIn = spring({
    frame: frame - showFrame,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.3 },
  });

  const opacity = interpolate(fadeIn, [0, 1], [0, 1]);
  const threadHighlighted =
    highlightThreadFrame !== undefined && frame >= highlightThreadFrame;

  return (
    <div
      style={{
        position: "absolute",
        top: -16,
        right: 20,
        opacity,
        display: "flex",
        border: "1px solid #35373b",
        borderRadius: 6,
        backgroundColor: "#222529",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        overflow: "visible",
      }}
    >
      {/* Emoji */}
      <HoverIcon>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6.5" cy="7.5" r="1" fill="currentColor" />
          <circle cx="11.5" cy="7.5" r="1" fill="currentColor" />
          <path
            d="M6 11C6.8 12.2 8 13 9 13C10 13 11.2 12.2 12 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </HoverIcon>
      {/* Reply in thread */}
      <HoverIcon
        highlighted={threadHighlighted}
        tooltip="Reply in thread"
        showTooltip={threadHighlighted}
        targetRef={replyRef}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M3 4H12C13.1 4 14 4.9 14 6V10C14 11.1 13.1 12 12 12H7L4 15V12H3C1.9 12 1 11.1 1 10V6C1 4.9 1.9 4 3 4Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </HoverIcon>
      {/* Bookmark */}
      <HoverIcon>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M5 3H13V15L9 12L5 15V3Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </HoverIcon>
      {/* More actions */}
      <HoverIcon>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="5" cy="9" r="1.2" fill="currentColor" />
          <circle cx="9" cy="9" r="1.2" fill="currentColor" />
          <circle cx="13" cy="9" r="1.2" fill="currentColor" />
        </svg>
      </HoverIcon>
    </div>
  );
};
