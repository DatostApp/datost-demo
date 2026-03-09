import React, { useRef, useLayoutEffect, useState } from "react";
import {
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { useCursorTarget } from "./CursorTargetContext";
import { TypingTextBox } from "./TypingTextBox";

interface ReplyTypingSession {
  text: string;
  startFrame: number;
  speed?: number;
  clearFrame: number;
}

interface ThreadPanelProps {
  /** Frame when the panel starts opening */
  openFrame: number;
  children?: React.ReactNode;
  /** Thread reply messages rendered after the OP */
  threadMessages?: React.ReactNode;
  /** Typing in the reply box config — single session or array of sessions */
  replyTyping?: ReplyTypingSession | ReplyTypingSession[];
}

const FormatBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: 26,
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      color: "#9ea0a5",
    }}
  >
    {children}
  </div>
);

export const ThreadPanel: React.FC<ThreadPanelProps> = ({
  openFrame,
  children,
  threadMessages,
  replyTyping,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const replyBoxRef = useCursorTarget("threadReplyBox");
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Measure content vs container and auto-scroll to keep bottom visible.
  // Intentionally runs every render (every frame) to track dynamic content.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerH = containerRef.current.clientHeight;
      const contentH = contentRef.current.scrollHeight;
      const overflow = Math.max(0, contentH - containerH);
      setScrollOffset(overflow);
    }
  });

  if (frame < openFrame) return null;

  const slideIn = spring({
    frame: frame - openFrame,
    fps,
    config: {
      damping: 22,
      stiffness: 100,
      mass: 0.7,
    },
  });

  const width = interpolate(slideIn, [0, 1], [0, 480]);
  const contentOpacity = interpolate(slideIn, [0.4, 1], [0, 1], {
    extrapolateLeft: "clamp",
  });

  // Normalize replyTyping to array
  const typingSessions: ReplyTypingSession[] = replyTyping
    ? Array.isArray(replyTyping)
      ? replyTyping
      : [replyTyping]
    : [];

  // Find the active typing session (the one currently in progress)
  const activeSession = typingSessions.find(
    (s) => frame >= s.startFrame - 10 && frame < s.clearFrame + 5,
  );

  // Is the reply box "focused"
  const isReplyFocused = activeSession !== undefined && frame >= activeSession.startFrame - 10;

  // Show placeholder only when not focused
  const showPlaceholder = !isReplyFocused;

  return (
    <div
      style={{
        width,
        height: "100%",
        backgroundColor: "#1a1d21",
        borderLeft: "1px solid #35373b",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          opacity: contentOpacity,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Thread header */}
        <div
          style={{
            height: 49,
            borderBottom: "1px solid #35373b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            Thread
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                color: "#9ea0a5",
                whiteSpace: "nowrap",
              }}
            >
              #cs-renewals
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                color: "#9ea0a5",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="#9ea0a5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Thread messages */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            ref={contentRef}
            style={{
              transform: `translateY(-${scrollOffset}px)`,
            }}
          >
            {children}
            {threadMessages}
            <div style={{ minHeight: 16, flexShrink: 0 }} />
          </div>
        </div>

        {/* Reply input */}
        <div style={{ padding: "0 12px 12px 12px", flexShrink: 0 }}>
          <div
            style={{
              border: isReplyFocused
                ? "1px solid #1d9bd1"
                : "1px solid #35373b",
              borderRadius: 8,
              backgroundColor: "#222529",
              overflow: "hidden",
            }}
          >
            {/* Formatting toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: "4px 10px",
                borderBottom: "1px solid #35373b",
              }}
            >
              <FormatBtn>
                <strong style={{ fontSize: 13, fontWeight: 800 }}>B</strong>
              </FormatBtn>
              <FormatBtn>
                <em style={{ fontSize: 13 }}>I</em>
              </FormatBtn>
              <FormatBtn>
                <span
                  style={{ fontSize: 13, textDecoration: "line-through" }}
                >
                  S
                </span>
              </FormatBtn>
              <div
                style={{
                  width: 1,
                  height: 14,
                  backgroundColor: "#35373b",
                  margin: "0 3px",
                }}
              />
              <FormatBtn>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4H12M4 8H10M4 12H8"
                    stroke="#9ea0a5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </FormatBtn>
              <FormatBtn>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4L6 12M10 4L10 12M4 6H12M4 10H12"
                    stroke="#9ea0a5"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </FormatBtn>
            </div>

            {/* Reply placeholder / typing area */}
            <div
              ref={replyBoxRef}
              style={{
                padding: "8px 12px",
                minHeight: 20,
                fontSize: 14,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {showPlaceholder ? (
                <span style={{ color: "#7c7e83" }}>Reply...</span>
              ) : (
                activeSession && (
                  <TypingTextBox
                    key={activeSession.startFrame}
                    text={activeSession.text}
                    startFrame={activeSession.startFrame}
                    speed={activeSession.speed}
                    clearFrame={activeSession.clearFrame}
                  />
                )
              )}
            </div>

            {/* Also send to channel checkbox */}
            <div
              style={{
                padding: "0 12px 6px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: "1.5px solid #5b5e63",
                  backgroundColor: "transparent",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#9ea0a5",
                  whiteSpace: "nowrap",
                }}
              >
                Also send to{" "}
                <span style={{ color: "#d1d2d3" }}># all-datost</span>
              </span>
            </div>

            {/* Bottom toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px 6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <FormatBtn>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                    <path d="M9 5V13M5 9H13" stroke="#9ea0a5" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </FormatBtn>
                <FormatBtn>
                  <span style={{ fontSize: 14, color: "#9ea0a5" }}>Aa</span>
                </FormatBtn>
                <FormatBtn>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                    <circle cx="6.5" cy="7.5" r="1" fill="#9ea0a5" />
                    <circle cx="11.5" cy="7.5" r="1" fill="#9ea0a5" />
                    <path d="M6 11C6.8 12.2 8 13 9 13C10 13 11.2 12.2 12 11" stroke="#9ea0a5" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </FormatBtn>
                <FormatBtn>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                    <text x="9" y="12" textAnchor="middle" fill="#9ea0a5" fontSize="10" fontWeight="600">@</text>
                  </svg>
                </FormatBtn>
              </div>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: "#007a5a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L12 2V12L2 7Z" fill="#fff" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
