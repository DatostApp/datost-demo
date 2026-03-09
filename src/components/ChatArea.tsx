import React from "react";
import { SlackMessage, Mention } from "./SlackMessage";
import { TypingIndicator } from "./TypingIndicator";

const ToolbarButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
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
    {children}
  </div>
);

export const ChatArea: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1a1d21",
      }}
    >
      {/* Channel header */}
      <div
        style={{
          height: 49,
          borderBottom: "1px solid #35373b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#9ea0a5" }}>#</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            all-datost
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ToolbarButton>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="6" r="4" stroke="#9ea0a5" strokeWidth="1.5" />
              <path d="M9.5 9.5L14 14" stroke="#9ea0a5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "16px 20px",
          overflow: "hidden",
        }}
      >
        <SlackMessage
          author="Maceo"
          avatarColor="#4a154b"
          avatarInitial="M"
          timestamp="9:31 PM"
          startFrame={60}
          hoverFrameStart={108}
          hoverFrameEnd={155}
          hoverBarShowFrame={110}
          hoverBarHideFrame={155}
          highlightThreadFrame={130}
          cursorTargetId="maceoMessage"
          replyTargetId="replyButton"
        >
          <Mention>Jason</Mention>, I've been looking at the renewal list for
          next month, and pulled together some notes on where things stand. a
          few of the big accounts feel really quiet lately. like I haven't seen
          Rivian or Plaid in the product at all. have you noticed anything?
        </SlackMessage>

        <TypingIndicator name="Maceo" startFrame={15} endFrame={60} />
      </div>

      {/* Message input */}
      <div style={{ padding: "0 20px 20px 20px" }}>
        <div
          style={{
            border: "1px solid #35373b",
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
              padding: "6px 12px",
              borderBottom: "1px solid #35373b",
            }}
          >
            <FormatButton>
              <strong style={{ fontSize: 14, fontWeight: 800 }}>B</strong>
            </FormatButton>
            <FormatButton>
              <em style={{ fontSize: 14 }}>I</em>
            </FormatButton>
            <FormatButton>
              <span style={{ fontSize: 14, textDecoration: "line-through" }}>
                S
              </span>
            </FormatButton>
            <div
              style={{
                width: 1,
                height: 16,
                backgroundColor: "#35373b",
                margin: "0 4px",
              }}
            />
            <FormatButton>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4H12M4 8H10M4 12H8" stroke="#9ea0a5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </FormatButton>
            <FormatButton>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L6 12M10 4L10 12M4 6H12M4 10H12" stroke="#9ea0a5" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </FormatButton>
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "10px 14px",
              minHeight: 22,
              color: "#7c7e83",
              fontSize: 14,
            }}
          >
            Message #all-datost
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
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormatButton>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                  <path d="M9 5V13M5 9H13" stroke="#9ea0a5" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </FormatButton>
              <FormatButton>
                <span style={{ fontSize: 16, color: "#9ea0a5" }}>Aa</span>
              </FormatButton>
              <FormatButton>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                  <circle cx="6.5" cy="7.5" r="1" fill="#9ea0a5" />
                  <circle cx="11.5" cy="7.5" r="1" fill="#9ea0a5" />
                  <path d="M6 11C6.8 12.2 8 13 9 13C10 13 11.2 12.2 12 11" stroke="#9ea0a5" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </FormatButton>
              <FormatButton>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="#9ea0a5" strokeWidth="1.3" />
                  <text x="9" y="12" textAnchor="middle" fill="#9ea0a5" fontSize="10" fontWeight="600">@</text>
                </svg>
              </FormatButton>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "#007a5a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7L12 2V12L2 7Z"
                    fill="#fff"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormatButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
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
    {children}
  </div>
);
