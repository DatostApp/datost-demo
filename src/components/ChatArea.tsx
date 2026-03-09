import React from "react";
import { useCurrentFrame, staticFile } from "remotion";
import { SlackMessage, Mention } from "./SlackMessage";
import { FOCUS_MSG_TARGET } from "./CursorTargetContext";
import { TypingIndicator } from "./TypingIndicator";

// ─── Thread reply indicator types ─────────────────────────────────────────────

export type ThreadReplyParticipant = "maceo" | "jason" | "bot";

export interface ThreadReply {
  frame: number;
  participant: ThreadReplyParticipant;
}

// ─── Small avatar for thread indicator ────────────────────────────────────────

const PARTICIPANT_CONFIG = {
  maceo: { color: "#4a154b", initial: "M" },
  jason: { color: "#2b5e3a", initial: "J" },
  bot: null, // uses Datost icon
} as const;

const SmallAvatar: React.FC<{ participant: ThreadReplyParticipant }> = ({
  participant,
}) => {
  if (participant === "bot") {
    return (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 5,
          backgroundColor: "#f0ebe4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={staticFile("datost-icon.svg")}
          alt="Datost"
          style={{ width: 24, height: 24 }}
        />
      </div>
    );
  }

  const config = PARTICIPANT_CONFIG[participant];
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 5,
        backgroundColor: config.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {config.initial}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ToolbarButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      color: "#9ea0a5",
    }}
  >
    {children}
  </div>
);

const FormatButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      color: "#9ea0a5",
    }}
  >
    {children}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

interface ChatAreaProps {
  channel?: string;
  message?: React.ReactNode;
  messageAuthor?: string;
  messageAvatarColor?: string;
  messageAvatarInitial?: string;
  messageTimestamp?: string;
  messageStartFrame?: number;
  typingName?: string;
  typingStartFrame?: number;
  typingEndFrame?: number;
  hoverFrameStart?: number;
  hoverFrameEnd?: number;
  hoverBarShowFrame?: number;
  hoverBarHideFrame?: number;
  highlightThreadFrame?: number;
  cursorTargetId?: string;
  replyTargetId?: string;
  threadReplies?: ThreadReply[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  channel = "general",
  message,
  messageAuthor = "Maceo",
  messageAvatarColor = "#4a154b",
  messageAvatarInitial = "M",
  messageTimestamp = "2:42 PM",
  messageStartFrame = 60,
  typingName = "Maceo",
  typingStartFrame = 15,
  typingEndFrame = 60,
  hoverFrameStart = 108,
  hoverFrameEnd = 155,
  hoverBarShowFrame = 110,
  hoverBarHideFrame = 155,
  highlightThreadFrame = 130,
  cursorTargetId = "maceoMessage",
  replyTargetId = "replyButton",
  threadReplies = [],
}) => {
  const frame = useCurrentFrame();

  // Calculate visible replies and unique participants
  const visibleReplies = threadReplies.filter((r) => frame >= r.frame);
  const replyCount = visibleReplies.length;
  const participants = [
    ...new Set(visibleReplies.map((r) => r.participant)),
  ];

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
          height: 62,
          borderBottom: "1px solid #35373b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 26px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 17, color: "#9ea0a5" }}>#</span>
          <span
            style={{
              fontSize: 21,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {channel}
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
          padding: "20px 26px",
          overflow: "hidden",
        }}
      >
        <SlackMessage
          author={messageAuthor}
          avatarColor={messageAvatarColor}
          avatarInitial={messageAvatarInitial}
          timestamp={messageTimestamp}
          startFrame={messageStartFrame}
          hoverFrameStart={hoverFrameStart}
          hoverFrameEnd={hoverFrameEnd}
          hoverBarShowFrame={hoverBarShowFrame}
          hoverBarHideFrame={hoverBarHideFrame}
          highlightThreadFrame={highlightThreadFrame}
          cursorTargetId={cursorTargetId}
          replyTargetId={replyTargetId}
          cameraTargetId={FOCUS_MSG_TARGET}
        >
          {message ?? (
            <>
              <Mention>Jason</Mention>, I've been looking at the renewal list for
              next month, and pulled together some notes on where things stand. a
              few of the big accounts feel really quiet lately. like I haven't seen
              Rivian or Plaid in the product at all. have you noticed anything?
            </>
          )}
        </SlackMessage>

        {/* Thread reply indicator */}
        {replyCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: 58,
              marginTop: 10,
              padding: "5px 0",
            }}
          >
            {/* Participant avatars */}
            <div style={{ display: "flex", gap: 2 }}>
              {participants.map((p) => (
                <SmallAvatar key={p} participant={p} />
              ))}
            </div>

            {/* Reply count */}
            <span
              style={{
                color: "#1d9bd1",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>

            {/* Last reply time */}
            <span style={{ color: "#616061", fontSize: 16 }}>
              Last reply today at 2:43 PM
            </span>
          </div>
        )}

        <TypingIndicator name={typingName} startFrame={typingStartFrame} endFrame={typingEndFrame} />
      </div>

      {/* Message input */}
      <div style={{ padding: "0 26px 26px 26px" }}>
        <div
          style={{
            border: "1px solid #35373b",
            borderRadius: 10,
            backgroundColor: "#222529",
            overflow: "hidden",
          }}
        >
          {/* Formatting toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "8px 16px",
              borderBottom: "1px solid #35373b",
            }}
          >
            <FormatButton>
              <strong style={{ fontSize: 18, fontWeight: 800 }}>B</strong>
            </FormatButton>
            <FormatButton>
              <em style={{ fontSize: 18 }}>I</em>
            </FormatButton>
            <FormatButton>
              <span style={{ fontSize: 18, textDecoration: "line-through" }}>
                S
              </span>
            </FormatButton>
            <div
              style={{
                width: 1,
                height: 20,
                backgroundColor: "#35373b",
                margin: "0 5px",
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
              padding: "14px 18px",
              minHeight: 28,
              color: "#7c7e83",
              fontSize: 18,
            }}
          >
            Message #{channel}
          </div>

          {/* Bottom toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 10px 8px",
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
                <span style={{ fontSize: 20, color: "#9ea0a5" }}>Aa</span>
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
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "#007a5a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1L13 7L1 13V8.75L8 7L1 5.25V1Z"
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
