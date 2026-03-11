import React from "react";
import { useCurrentFrame, staticFile, interpolate } from "remotion";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { ChatArea, type ThreadReply } from "./ChatArea";
import { ThreadPanel } from "./ThreadPanel";
import { Cursor } from "./Cursor";
import { SlackMessage, Mention, ChannelMention } from "./SlackMessage";
import { CursorTargetProvider, LATEST_MSG_TARGET, useCursorTarget } from "./CursorTargetContext";
import {
  DatostBotMessage,
  type BotResponseContent,
  type TableColumn,
  type ToolCall,
} from "./DatostBotMessage";
import { useCameraPhaseRef, type CameraMode } from "./CursorPositionContext";


// ─── Character constants ─────────────────────────────────────────────────────

const MACEO = { author: "Maceo", color: "#4a154b", initial: "M" } as const;
const JASON = { author: "Jason", color: "#2b5e3a", initial: "J" } as const;

// ─── Jason's first reply (typed in reply box) ────────────────────────────────

const JASON_TEXT =
  "quiet before renewal is bad news. do we know how active they usually are";

// ─── Bot response #1 — Renewal accounts table ───────────────────────────────

const BOT1_TOOLS: ToolCall[] = [
  { name: "Renewal accounts with 90-day usage comparison", timing: "823ms" },
  { name: "Get total renewal count", timing: "734ms" },
];

const BOT1_TABLE_COLUMNS: TableColumn[] = [
  { key: "account", header: "Account" },
  { key: "tier", header: "Tier" },
  { key: "arr", header: "Contract" },
  { key: "usage90d", header: "Activity (90d ago)" },
  { key: "usageNow", header: "Activity (now)" },
  { key: "change", header: "Change", colorize: true },
];

const BOT1_TABLE_ROWS = [
  { account: "Rivian", tier: "Enterprise", arr: "$340K", usage90d: "12,400", usageNow: "3,470", change: "-72%", negative: true },
  { account: "Plaid", tier: "Enterprise", arr: "$285K", usage90d: "8,900", usageNow: "3,740", change: "-58%", negative: true },
  { account: "Brex", tier: "Growth", arr: "$112K", usage90d: "3,200", usageNow: "1,470", change: "-54%", negative: true },
  { account: "Lattice", tier: "Growth", arr: "$98K", usage90d: "2,100", usageNow: "1,260", change: "-40%", negative: true },
  { account: "Ramp", tier: "Growth", arr: "$145K", usage90d: "4,600", usageNow: "4,140", change: "-10%", negative: true },
  { account: "Notion", tier: "Enterprise", arr: "$410K", usage90d: "18,300", usageNow: "19,100", change: "+4%", negative: false },
];

const BOT1_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,557ms total",
  streamContent: [
    { type: "text", content: "38 renewing in April. Most look fine, but " },
    { type: "bold", content: "4 have major drops:" },
    { type: "table" },
    { type: "paragraph" },
    { type: "text", content: "Rivian down 72% on a $340K contract is a red flag. Plaid and Brex heading the wrong way too." },
  ],
  tableColumns: BOT1_TABLE_COLUMNS,
  tableRows: BOT1_TABLE_ROWS,
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #2 — Weekly usage trends ───────────────────────────────────

const BOT2_TOOLS: ToolCall[] = [
  { name: "Weekly session data for renewal accounts", timing: "1,102ms" },
  { name: "Generate usage trend chart", timing: "865ms" },
];

const BOT2_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,967ms total",
  streamContent: [
    { type: "bold", content: "Rivian" },
    { type: "text", content: " steady at ~12K/week then " },
    { type: "bold", content: "fell off a cliff January 20th" },
    { type: "text", content: ". Something broke." },
    { type: "paragraph" },
    { type: "bold", content: "Plaid" },
    { type: "text", content: " slow fade over 13 weeks, 8,900 to 3,740. Gradual pullback, no single event." },
    { type: "paragraph" },
    { type: "bold", content: "Brex" },
    { type: "text", content: " same pattern as Rivian, smaller scale. Ramp and Notion stable." },
    { type: "image", src: staticFile("usage_trend_chart.png") },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #3 — Support tickets & NPS ────────────────────────────────

const BOT3_TOOLS: ToolCall[] = [
  { name: "Support tickets for Rivian and Plaid", timing: "645ms" },
  { name: "Satisfaction scores for Rivian and Plaid", timing: "703ms" },
];

const BOT3_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,348ms total",
  streamContent: [
    { type: "bold", content: "Rivian, 11 tickets." },
    { type: "text", content: " 7 are the same issue: login system broke after a recent update. Escalated twice, unresolved." },
    { type: "paragraph" },
    { type: "bold", content: "Plaid, 3 tickets + low rating." },
    { type: "text", content: " Satisfaction score is " },
    { type: "bold", content: "4 out of 10" },
    { type: "text", content: ":" },
    { type: "blockquote", content: "\"We've outgrown the reporting. Evaluating alternatives.\"" },
    { type: "bold", content: "Two different problems." },
    { type: "text", content: " Rivian " },
    { type: "bold", content: "broke" },
    { type: "text", content: ", fixable. Plaid is " },
    { type: "bold", content: "outgrowing us" },
    { type: "text", content: ", product gap." },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #4 — Churn pattern analysis ───────────────────────────────

const BOT4_TOOLS: ToolCall[] = [
  { name: "Renewal account health data", timing: "1,842ms" },
  { name: "Churn pattern analysis", timing: "2,104ms" },
  { name: "Record insight", timing: "35ms" },
];

const BOT4_TABLE_COLUMNS: TableColumn[] = [
  { key: "account", header: "Account" },
  { key: "tier", header: "Tier" },
  { key: "arr", header: "ARR" },
  { key: "integrations", header: "Features Used" },
  { key: "signal", header: "Recent Signal" },
  { key: "usage", header: "Activity (now)", colorize: true },
];

const BOT4_TABLE_ROWS = [
  { account: "Retool", tier: "Enterprise", arr: "$175K", integrations: "2", signal: "Filed ticket last week", usage: "-5%", negative: true },
  { account: "Mercury", tier: "Growth", arr: "$130K", integrations: "1", signal: "Only using basic features", usage: "-3%", negative: true },
  { account: "Vercel", tier: "Enterprise", arr: "$205K", integrations: "2", signal: "2 tickets in 3 weeks", usage: "-8%", negative: true },
  { account: "Linear", tier: "Enterprise", arr: "$160K", integrations: "1", signal: "Rating dropped from 8 → 5", usage: "-2%", negative: true },
];

const BOT4_RESPONSE: BotResponseContent = {
  statsText: "3 tools executed",
  statsSucceeded: "3 succeeded",
  statsTime: "6,181ms total",
  streamContent: [
    { type: "bold", content: "Low feature usage + support issues" },
    { type: "text", content: " = " },
    { type: "bold", content: "6x higher decline rate" },
    { type: "text", content: ". 3+ features and they almost never leave." },
    { type: "paragraph" },
    { type: "bold", content: "4 more accounts fit this pattern" },
    { type: "text", content: " that aren't dropping " },
    { type: "bold", content: "yet" },
    { type: "text", content: ":" },
    { type: "table" },
    { type: "paragraph" },
    { type: "text", content: "With the original 4, that's " },
    { type: "bold", content: "$1.5M at risk" },
    { type: "text", content: " across 8 accounts, not just $835K." },
    { type: "image", src: staticFile("churn_risk_chart.png") },
  ],
  tableColumns: BOT4_TABLE_COLUMNS,
  tableRows: BOT4_TABLE_ROWS,
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #5 — Combined export + report ─────────────────────────────

const BOT5_TOOLS: ToolCall[] = [
  { name: "Build at-risk account export", timing: "412ms" },
  { name: "Generate report charts", timing: "1,245ms" },
  { name: "Compile spreadsheet and PDF", timing: "1,201ms" },
  { name: "Verify data integrity", timing: "323ms" },
];

const BOT5_RESPONSE: BotResponseContent = {
  statsText: "4 tools executed",
  statsSucceeded: "4 succeeded",
  statsTime: "3,181ms total",
  streamContent: [
    { type: "text", content: "At-risk accounts ranked by risk score, plus a report with charts and recommendations." },
    { type: "paragraph" },
    { type: "text", content: "Rivian (94), Plaid (89), Brex (82) are critical. The 4 new flags are 55-68, not on fire yet but heading there." },
    { type: "attachments" },
  ],
  attachments: [
    {
      type: "file",
      name: "Q2_Renewal_Risk_Accounts.xlsx",
      description: "10 rows × 13 columns, ranked by risk score",
      fileType: "excel",
      title: "Q2 Renewal Risk Accounts",
      previewHeaders: [
        "Account", "Tier", "Contract", "Renewal Dat", "Features",
        "Activity (90d)", "Activity", "Change", "Tickets",
        "Ticket Summary", "Rating", "Risk Score", "Risk Level",
      ],
      previewRows: [
        ["Rivian", "Enterprise", "$340K", "2026-04-12", "2", "12400", "3470 -72%", "", "11 Login system broke after recent update", "3", "94 Critical", "", "94 Critical"],
        ["Plaid", "Enterprise", "$285K", "2026-04-18", "1", "8900", "3740 -58%", "", "3 Minor issues; 'outgrown reporting'", "4", "89 Critical", "", "89 Critical"],
        ["Brex", "Growth", "$112K", "2026-04-08", "2", "3200", "1470 -54%", "", "2 Login issues reported + Feb admin q…", "5", "82 Critical", "", "82 Critical"],
        ["Lattice", "Growth", "$98K", "2026-02-22", "1", "2100", "1260 -40%", "", "2 Support escalated re: onboarding; slow load in…", "4", "76 High", "", "76 High"],
        ["Vercel", "Enterprise", "$205K", "2026-04-15", "2", "9800", "9020 -8%", "", "2 2 tickets in 3 weeks, API rate limiting", "5", "68 High", "", "68 High"],
        ["Retool", "Enterprise", "$175K", "2026-05-20", "2", "7200", "6840 -5%", "", "1 Perf. issue: reliability issue filed last week", "6", "63 High", "", "63 High"],
        ["Linear", "Enterprise", "$160K", "2026-04-25", "1", "6100", "5980 -2%", "", "0 No tickets. Rating dropped from 8 to 5", "5", "58 High", "", "58 High"],
        ["Mercury", "Growth", "$130K", "2026-06-30", "1", "4400", "4270 -3%", "", "0 No tickets; low feature usage, only 1…", "6", "55 Moderate", "", "55 Moderate"],
        ["Ramp", "Growth", "$145K", "2026-04-10", "4", "4600", "4140 -10%", "", "0 No tickets; slight usage dip but…", "7", "35 Moderate", "", "35 Moderate"],
        ["Notion", "Enterprise", "$410K", "2026-06-05", "7", "18300", "19100 +4%", "", "0 No issues; healthy and growing", "9", "8 Low", "", "8 Low"],
      ],
    },
    {
      type: "file",
      name: "Q2_Renewal_Risk_Report.pdf",
      description:
        "4-page report: executive summary, charts, analysis, recommendations",
      fileType: "pdf",
      title: "Q2 Renewal Risk Report",
      previewImage: staticFile("pdf_preview-2.png"),
    },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #6 — Dashboard ────────────────────────────────────────────

const BOT6_TOOLS: ToolCall[] = [
  { name: "Create dashboard", timing: "412ms" },
  { name: "Save dashboard widgets", timing: "1,876ms" },
  { name: "Verify KPIs render", timing: "521ms" },
];

const BOT6_RESPONSE: BotResponseContent = {
  statsText: "3 tools executed",
  statsSucceeded: "3 succeeded",
  statsTime: "2,809ms total",
  streamContent: [
    { type: "text", content: "Dashboard is live. Tracks usage trends, support activity, feature adoption, and health scores. Anything at risk gets flagged automatically." },
    { type: "attachments" },
  ],
  attachments: [
    {
      type: "link",
      name: "Launchpad: Account Health & Renewal Tracker",
      description: "4 KPIs · usage trend · health scores · churn risk scatter",
      fileType: "dashboard",
      title: "Account Health & Renewal Tracker",
      previewImage: staticFile("dashboard_preview.png"),
    },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Helper: compute when a bot message's streaming finishes ─────────────────

function streamEndFrame(
  finalFrame: number,
  content: BotResponseContent,
): number {
  const speed = content.streamSpeed ?? 3.5;
  const totalChars = content.streamContent.reduce((sum, seg) => {
    if (seg.type === "text" || seg.type === "bold" || seg.type === "blockquote")
      return sum + seg.content.length;
    return sum;
  }, 0);
  const streamFrames = Math.ceil(totalChars / speed);
  const footerBuffer = 20; // footer fade-in time
  return finalFrame + streamFrames + footerBuffer;
}

const PAUSE = 60; // 2-second pause after each bot message (at 30fps)

// ─── Tracker for camera to follow latest thread content ──────────────────────

const LatestMessageTracker: React.FC = () => {
  const ref = useCursorTarget(LATEST_MSG_TARGET);
  return <div ref={ref} style={{ height: 0 }} />;
};

// ─── Main layout ─────────────────────────────────────────────────────────────

export const SlackLayout: React.FC = () => {
  const frame = useCurrentFrame();
  const cameraPhaseRef = useCameraPhaseRef();

  // ── Scene 0: Camera phases ──────────────────────────────────────────────
  const messageAppearFrame = 60;
  const cursorHoverStartFrame = 168;

  // ── Scene 1: Thread opens ──────────────────────────────────────────────
  const threadOpenFrame = 202;
  const cursorClickReplyBox = 232;
  const cursorDisappearFrame = 238;

  // ── Scene 2: Jason types first reply ───────────────────────────────────
  const typingStartFrame = 245;
  const typingEndFrame =
    typingStartFrame + Math.ceil(JASON_TEXT.length * 0.85) + 10;
  const messageSentFrame = typingEndFrame + 5;

  // ── Write camera phase ──────────────────────────────────────────────────
  let cameraMode: CameraMode;
  if (frame < messageAppearFrame) cameraMode = "intro";
  else if (frame < cursorHoverStartFrame) cameraMode = "messageFocus";
  else if (frame < cursorDisappearFrame) cameraMode = "cursorTrack";
  else if (frame < messageSentFrame) cameraMode = "replyBox";
  else cameraMode = "thread";

  if (cameraMode !== cameraPhaseRef.current.mode) {
    cameraPhaseRef.current = { mode: cameraMode, startFrame: frame };
  }

  // ── Scene 3: Jason's @Datost message streams ──────────────────────────
  const jason2AppearFrame = messageSentFrame + 25;

  // ── Fade out surrounding Slack UI after @Datost message appears ──────
  const uiFadeStart = jason2AppearFrame + 30; // short delay after message
  const uiFadeEnd = uiFadeStart + 40; // fade over ~1.3 seconds
  const slackUiOpacity = interpolate(frame, [uiFadeStart, uiFadeEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Bot #1 (straight to tools) ────────────────────────────────────────
  const bot1Start = jason2AppearFrame + 60;
  const bot1Cycle1 = bot1Start + 10;
  const bot1ToolDone = [bot1Start + 45, bot1Start + 70];
  const bot1Cycle2 = bot1Start + 90;
  const bot1Final = bot1Start + 130;
  const bot1End = streamEndFrame(bot1Final, BOT1_RESPONSE);

  // ── Jason reacts to table ────────────────────────────────────────────
  const jasonReact1Frame = bot1End + PAUSE;
  // ── Maceo: @Datost trends ──────────────────────────────────────────
  const maceoMsg1Frame = jasonReact1Frame + 50;

  // ── Bot #2 ────────────────────────────────────────────────────────────
  const bot2Start = maceoMsg1Frame + 50;
  const bot2Cycle1 = bot2Start + 10;
  const bot2ToolDone = [bot2Cycle1 + 35, bot2Cycle1 + 60];
  const bot2Cycle2 = bot2ToolDone[1] + 20;
  const bot2Final = bot2Cycle2 + 40;
  const bot2End = streamEndFrame(bot2Final, BOT2_RESPONSE);

  // ── Jason reacts to trends ─────────────────────────────────────────
  const jasonReact2Frame = bot2End + PAUSE;
  // ── Maceo: @Datost support tickets ─────────────────────────────────
  const maceoMsg2Frame = jasonReact2Frame + 50;

  // ── Bot #3 ────────────────────────────────────────────────────────────
  const bot3Start = maceoMsg2Frame + 50;
  const bot3Cycle1 = bot3Start + 10;
  const bot3ToolDone = [bot3Cycle1 + 35, bot3Cycle1 + 65];
  const bot3Cycle2 = bot3ToolDone[1] + 20;
  const bot3Final = bot3Cycle2 + 40;
  const bot3End = streamEndFrame(bot3Final, BOT3_RESPONSE);

  // ── Maceo reacts to diagnosis ──────────────────────────────────────
  const maceoReact1Frame = bot3End + PAUSE;
  // ── Jason: @Datost churn analysis ──────────────────────────────────
  const jasonMsg1Frame = maceoReact1Frame + 50;

  // ── Bot #4 (3 tools) ─────────────────────────────────────────────────
  const bot4Start = jasonMsg1Frame + 50;
  const bot4Cycle1 = bot4Start + 10;
  const bot4ToolDone = [bot4Cycle1 + 40, bot4Cycle1 + 80, bot4Cycle1 + 110];
  const bot4Cycle2 = bot4ToolDone[2] + 25;
  const bot4Final = bot4Cycle2 + 45;
  const bot4End = streamEndFrame(bot4Final, BOT4_RESPONSE);

  // ── Jason reacts to $1.5M ──────────────────────────────────────────
  const jasonReact3Frame = bot4End + PAUSE;
  // ── Maceo: @Datost export ──────────────────────────────────────────
  const maceoMsg3Frame = jasonReact3Frame + 50;

  // ── Bot #5 (4 tools) ─────────────────────────────────────────────────
  const bot5Start = maceoMsg3Frame + 50;
  const bot5Cycle1 = bot5Start + 10;
  const bot5ToolDone = [bot5Cycle1 + 40, bot5Cycle1 + 75, bot5Cycle1 + 105, bot5Cycle1 + 130];
  const bot5Cycle2 = bot5ToolDone[3] + 25;
  const bot5Final = bot5Cycle2 + 45;
  const bot5End = streamEndFrame(bot5Final, BOT5_RESPONSE);

  // ── Jason: ongoing + dashboard ────────────────────────────────────────
  const jasonMsg2Frame = bot5End + PAUSE;

  // ── Bot #6 (3 tools) ─────────────────────────────────────────────────
  const bot6Start = jasonMsg2Frame + 50;
  const bot6Cycle1 = bot6Start + 10;
  const bot6ToolDone = [bot6Cycle1 + 35, bot6Cycle1 + 70, bot6Cycle1 + 100];
  const bot6Cycle2 = bot6ToolDone[2] + 25;
  const bot6Final = bot6Cycle2 + 40;
  const bot6End = streamEndFrame(bot6Final, BOT6_RESPONSE);

  // ── Maceo closing ─────────────────────────────────────────────────────
  const maceoMsg4Frame = bot6End + PAUSE;

  // ── Thread reply milestones (for channel message indicator) ──────────
  const threadReplies: ThreadReply[] = [
    { frame: messageSentFrame, participant: "jason" },
    { frame: jason2AppearFrame, participant: "jason" },
    { frame: bot1Start, participant: "bot" },
    { frame: jasonReact1Frame, participant: "jason" },
    { frame: maceoMsg1Frame, participant: "maceo" },
    { frame: bot2Start, participant: "bot" },
    { frame: jasonReact2Frame, participant: "jason" },
    { frame: maceoMsg2Frame, participant: "maceo" },
    { frame: bot3Start, participant: "bot" },
    { frame: maceoReact1Frame, participant: "maceo" },
    { frame: jasonMsg1Frame, participant: "jason" },
    { frame: bot4Start, participant: "bot" },
    { frame: jasonReact3Frame, participant: "jason" },
    { frame: maceoMsg3Frame, participant: "maceo" },
    { frame: bot5Start, participant: "bot" },
    { frame: jasonMsg2Frame, participant: "jason" },
    { frame: bot6Start, participant: "bot" },
    { frame: maceoMsg4Frame, participant: "maceo" },
  ];

  return (
    <CursorTargetProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
          color: "#d1d2d3",
          position: "relative",
        }}
      >
        <div style={{ opacity: slackUiOpacity }}>
          <TitleBar />
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ opacity: slackUiOpacity, display: "flex" }}>
            <Sidebar />
          </div>
          <div style={{ opacity: slackUiOpacity, flex: 1, display: "flex", overflow: "hidden" }}>
            <ChatArea
              threadReplies={threadReplies}
              hoverFrameStart={cursorHoverStartFrame}
              hoverFrameEnd={threadOpenFrame + 15}
              hoverBarShowFrame={cursorHoverStartFrame + 2}
              hoverBarHideFrame={threadOpenFrame + 15}
              highlightThreadFrame={190}
            />
          </div>
          <ThreadPanel
            openFrame={-60}
            chromeOpacity={slackUiOpacity}
            replyTyping={[
              {
                text: JASON_TEXT,
                startFrame: typingStartFrame,
                speed: 0.7,
                clearFrame: messageSentFrame,
              },
            ]}
            threadMessages={
              <>
                {/* ── Jason's first reply (from typing) ────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={messageSentFrame}
                >
                  {JASON_TEXT}
                </SlackMessage>

                {/* ── Jason's @Datost message (appears instantly) ──── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jason2AppearFrame}
                  continuation
                >
                  <Mention>Datost</Mention> which accounts renew next month,
                  check their activity vs 90 days ago
                </SlackMessage>

                {/* ── Bot response #1 ──────────────────────────────── */}
                <DatostBotMessage
                  startFrame={bot1Start}
                  cycle1Frame={bot1Cycle1}
                  toolDoneFrames={bot1ToolDone}
                  cycle2Frame={bot1Cycle2}
                  finalResponseFrame={bot1Final}
                  tools={BOT1_TOOLS}
                  response={BOT1_RESPONSE}
                />

                {/* ── Jason reacts to table ────────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonReact1Frame}
                >
                  rivian from 12k to 3k?
                </SlackMessage>

                {/* ── Maceo: @Datost trends ───────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg1Frame}
                >
                  <Mention>Datost</Mention> show me the weekly trends for
                  these accounts
                </SlackMessage>

                {/* ── Bot response #2 (usage trends) ───────────────── */}
                <DatostBotMessage
                  startFrame={bot2Start}
                  cycle1Frame={bot2Cycle1}
                  toolDoneFrames={bot2ToolDone}
                  cycle2Frame={bot2Cycle2}
                  finalResponseFrame={bot2Final}
                  tools={BOT2_TOOLS}
                  response={BOT2_RESPONSE}
                />

                {/* ── Jason reacts to trends ───────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonReact2Frame}
                >
                  we need to find out what happened at rivian in january
                </SlackMessage>

                {/* ── Maceo: @Datost support tickets ─────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg2Frame}
                >
                  <Mention>Datost</Mention> check support tickets for
                  rivian and plaid
                </SlackMessage>

                {/* ── Bot response #3 (support tickets) ────────────── */}
                <DatostBotMessage
                  startFrame={bot3Start}
                  cycle1Frame={bot3Cycle1}
                  toolDoneFrames={bot3ToolDone}
                  cycle2Frame={bot3Cycle2}
                  finalResponseFrame={bot3Final}
                  tools={BOT3_TOOLS}
                  response={BOT3_RESPONSE}
                />

                {/* ── Maceo reacts to diagnosis ────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoReact1Frame}
                >
                  we broke rivian's login. that's fixable at least
                </SlackMessage>

                {/* ── Jason: @Datost churn analysis ──────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg1Frame}
                >
                  <Mention>Datost</Mention> what about the rest of our
                  renewals, what predicts churn
                </SlackMessage>

                {/* ── Bot response #4 (churn analysis) ─────────────── */}
                <DatostBotMessage
                  startFrame={bot4Start}
                  cycle1Frame={bot4Cycle1}
                  toolDoneFrames={bot4ToolDone}
                  cycle2Frame={bot4Cycle2}
                  finalResponseFrame={bot4Final}
                  tools={BOT4_TOOLS}
                  response={BOT4_RESPONSE}
                />

                {/* ── Jason reacts to $1.5M ───────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonReact3Frame}
                >
                  $1.5M. we came in worried about 2 accounts
                </SlackMessage>

                {/* ── Maceo: @Datost export ───────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg3Frame}
                >
                  need to get this to cs.{" "}
                  <Mention>Datost</Mention> export the at-risk list as a
                  spreadsheet and build a report
                </SlackMessage>

                {/* ── Bot response #5 (Excel + PDF) ──────────────────── */}
                <DatostBotMessage
                  startFrame={bot5Start}
                  cycle1Frame={bot5Cycle1}
                  toolDoneFrames={bot5ToolDone}
                  cycle2Frame={bot5Cycle2}
                  finalResponseFrame={bot5Final}
                  tools={BOT5_TOOLS}
                  response={BOT5_RESPONSE}
                />

                {/* ── Jason: ongoing + dashboard ──────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg2Frame}
                >
                  can't do this every quarter.{" "}
                  <Mention>Datost</Mention> build a dashboard tracking account
                  health, usage, tickets, and renewals. flag anything at risk
                </SlackMessage>

                {/* ── Bot response #6 (dashboard) ──────────────────── */}
                <DatostBotMessage
                  startFrame={bot6Start}
                  cycle1Frame={bot6Cycle1}
                  toolDoneFrames={bot6ToolDone}
                  cycle2Frame={bot6Cycle2}
                  finalResponseFrame={bot6Final}
                  tools={BOT6_TOOLS}
                  response={BOT6_RESPONSE}
                />

                {/* ── Maceo: closing message ────────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg4Frame}
                >
                  dropping this in <ChannelMention>cs-renewals</ChannelMention>. went from "bad feeling about
                  some accounts" to a full churn prevention system in one
                  thread
                </SlackMessage>

                <LatestMessageTracker />
              </>
            }
          >
            {/* Original message echoed in thread */}
            <SlackMessage
              author={MACEO.author}
              avatarColor={MACEO.color}
              avatarInitial={MACEO.initial}
              timestamp="2:42 PM"
              startFrame={threadOpenFrame + 10}
            >
              <Mention>Jason</Mention> been looking at next month's renewals.
              some of the big accounts feel really quiet, haven't seen Rivian
              or Plaid in the product at all
            </SlackMessage>
          </ThreadPanel>
        </div>

        {/* Animated cursor */}
        <Cursor
          keyframes={[
            { frame: 150, target: { x: 1850, y: 1020 } },
            { frame: 168, target: "maceoMessage" },
            { frame: 178, target: "maceoMessage" },
            { frame: 190, target: "replyButton" },
            { frame: 198, target: "replyButton" },
            { frame: 202, target: "replyButton" },
            { frame: 225, target: "threadReplyBox" },
            { frame: cursorClickReplyBox, target: "threadReplyBox" },
          ]}
          clickFrame={cursorClickReplyBox}
          hideFrame={cursorDisappearFrame}
        />
      </div>
    </CursorTargetProvider>
  );
};
