import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ThreadPanel } from "./ThreadPanel";
import { Cursor } from "./Cursor";
import { SlackMessage, Mention } from "./SlackMessage";
import { CursorTargetProvider } from "./CursorTargetContext";
import { StreamingMessageContent } from "./StreamingMessageContent";
import {
  DatostBotMessage,
  type BotResponseContent,
  type TableColumn,
  type ToolCall,
} from "./DatostBotMessage";
import { TypingIndicator } from "./TypingIndicator";

const JASON_TEXT =
  "hmm thats not great, quiet accounts right before renewal is normally bad news, do we know how active they usually are";

// --- Bot response content (edit here to reuse with different data) ---

const BOT_TOOLS: ToolCall[] = [
  { name: "Renewal accounts with 90-day usage comparison", timing: "761.6ms" },
  { name: "Get renewal accounts and usage change" },
];

const BOT_TABLE_COLUMNS: TableColumn[] = [
  { key: "account", header: "Account" },
  { key: "tier", header: "Tier" },
  { key: "arr", header: "ARR" },
  { key: "usage90d", header: "Usage (90d ago)" },
  { key: "usageNow", header: "Usage (now)" },
  { key: "change", header: "Change", colorize: true },
];

const BOT_TABLE_ROWS = [
  { account: "Rivian", tier: "Enterprise", arr: "$340K", usage90d: "12,400 sessions", usageNow: "3,470", change: "-72%", negative: true },
  { account: "Plaid", tier: "Enterprise", arr: "$285K", usage90d: "8,900 sessions", usageNow: "3,740", change: "-58%", negative: true },
  { account: "Brex", tier: "Growth", arr: "$112K", usage90d: "3,200 sessions", usageNow: "1,470", change: "-54%", negative: true },
  { account: "Lattice", tier: "Growth", arr: "$98K", usage90d: "2,100 sessions", usageNow: "1,260", change: "-40%", negative: true },
  { account: "Ramp", tier: "Growth", arr: "$145K", usage90d: "4,600 sessions", usageNow: "4,140", change: "-10%", negative: true },
  { account: "Notion", tier: "Enterprise", arr: "$410K", usage90d: "18,300 sessions", usageNow: "19,100", change: "+4%", negative: false },
];

const BOT_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,557ms total",
  responseText: (
    <>
      38 accounts are up for renewal in April. Most look healthy — but{" "}
      <strong>4 accounts stand out with major usage drops:</strong>
    </>
  ),
  tableColumns: BOT_TABLE_COLUMNS,
  tableRows: BOT_TABLE_ROWS,
  analysisText:
    "Rivian is down 72% — that's a serious red flag for a $340K account. Plaid and Brex are also trending the wrong way. I'd prioritize these for outreach this week.",
  source: "Datost Prod (postgresql)",
  timestamp: "9:44 PM",
};

export const SlackLayout: React.FC = () => {
  const frame = useCurrentFrame();

  const threadOpenFrame = 142;

  // Cursor clicks reply box, then disappears
  const cursorClickReplyBox = 172;
  const cursorDisappearFrame = 178;

  // Typing starts after cursor disappears
  const typingStartFrame = 185;
  // At ~0.7 avg frames/char, 113 chars ~= ~90 frames
  const typingEndFrame =
    typingStartFrame + Math.ceil(JASON_TEXT.length * 0.85) + 10;
  // Message "sends" and appears
  const messageSentFrame = typingEndFrame + 5;

  // Jason's second message (continuation) appears shortly after
  const jason2AppearFrame = messageSentFrame + 25;

  // --- Bot response timing ---
  // Streaming message finishes ~107 frames after it starts
  const botAppearFrame = 450;
  const botPhase2Frame = 490;
  const botCycle1Frame = 575;
  const botTool1DoneFrame = 610;
  const botTool2DoneFrame = 635;
  const botCycle2Frame = 655;
  const botFinalFrame = 700;

  // Maceo's follow-up in thread
  const maceoThreadTypingFrame = 850;
  const maceoFollowupFrame = 910;

  // Thread scroll: smoothly scroll messages up once bot final response appears
  const scrollOffset = interpolate(
    frame,
    [botFinalFrame, botFinalFrame + 45, maceoFollowupFrame, maceoFollowupFrame + 30],
    [0, 130, 130, 200],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <CursorTargetProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
          fontSize: 15,
          color: "#d1d2d3",
          position: "relative",
        }}
      >
        <TitleBar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar />
          <ChatArea />
          <ThreadPanel
            openFrame={threadOpenFrame}
            replyTyping={{
              text: JASON_TEXT,
              startFrame: typingStartFrame,
              speed: 0.7,
              clearFrame: messageSentFrame,
            }}
            scrollOffset={scrollOffset}
            threadMessages={
              <>
                <SlackMessage
                  author="Jason"
                  avatarColor="#2b5e3a"
                  avatarInitial="J"
                  timestamp="9:44 PM"
                  startFrame={messageSentFrame}
                >
                  {JASON_TEXT}
                </SlackMessage>
                <SlackMessage
                  author="Jason"
                  avatarColor="#2b5e3a"
                  avatarInitial="J"
                  timestamp="9:44 PM"
                  startFrame={jason2AppearFrame}
                  continuation
                  noAnimation
                >
                  <StreamingMessageContent
                    startFrame={jason2AppearFrame}
                    speed={0.7}
                    spiderverseDuration={30}
                    segments={[
                      { type: "mention", content: "Datost" },
                      {
                        type: "text",
                        content:
                          " which accounts are up for renewal next month, and how do their usage this month compare to 90 days ago",
                      },
                    ]}
                  />
                </SlackMessage>

                {/* Datost bot response */}
                <DatostBotMessage
                  startFrame={botAppearFrame}
                  phase2Frame={botPhase2Frame}
                  cycle1Frame={botCycle1Frame}
                  tool1DoneFrame={botTool1DoneFrame}
                  tool2DoneFrame={botTool2DoneFrame}
                  cycle2Frame={botCycle2Frame}
                  finalResponseFrame={botFinalFrame}
                  tools={BOT_TOOLS}
                  response={BOT_RESPONSE}
                />

                {/* Maceo typing indicator in thread */}
                <TypingIndicator
                  name="Maceo"
                  startFrame={maceoThreadTypingFrame}
                  endFrame={maceoFollowupFrame}
                />

                {/* Maceo's follow-up */}
                <SlackMessage
                  author="Maceo"
                  avatarColor="#4a154b"
                  avatarInitial="M"
                  timestamp="9:44 PM"
                  startFrame={maceoFollowupFrame}
                >
                  damn, Rivian is down 72%! they're one of our biggest accounts
                </SlackMessage>
              </>
            }
          >
            {/* Original message echoed in thread */}
            <SlackMessage
              author="Maceo"
              avatarColor="#4a154b"
              avatarInitial="M"
              timestamp="9:31 PM"
              startFrame={threadOpenFrame + 10}
            >
              <Mention>Jason</Mention>, I've been looking at the renewal list
              for next month, and pulled together some notes on where things
              stand. a few of the big accounts feel really quiet lately. like I
              haven't seen Rivian or Plaid in the product at all. have you
              noticed anything?
            </SlackMessage>
          </ThreadPanel>
        </div>

        {/* Animated cursor */}
        <Cursor
          keyframes={[
            // Start at bottom-right corner
            { frame: 90, target: { x: 1850, y: 1020 } },
            // Land on the message body
            { frame: 108, target: "maceoMessage" },
            // Pause on message
            { frame: 118, target: "maceoMessage" },
            // Glide to the reply in thread button
            { frame: 130, target: "replyButton" },
            // Hold on reply button before click
            { frame: 138, target: "replyButton" },
            // Stay during click (thread opens)
            { frame: 142, target: "replyButton" },
            // Move to the thread reply text box
            { frame: 165, target: "threadReplyBox" },
            // Click the reply box
            { frame: cursorClickReplyBox, target: "threadReplyBox" },
          ]}
          clickFrame={cursorClickReplyBox}
          hideFrame={cursorDisappearFrame}
        />
      </div>
    </CursorTargetProvider>
  );
};
