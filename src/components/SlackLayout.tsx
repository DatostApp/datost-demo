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
  "hmm thats not great, quiet accounts right before renewal is normally bad news, do we know how active they usually are";

// ─── Bot response #1 — Renewal accounts table ───────────────────────────────

const BOT1_TOOLS: ToolCall[] = [
  { name: "Renewal accounts with 90-day usage comparison", timing: "823ms" },
  { name: "Get total renewal count", timing: "734ms" },
];

const BOT1_TABLE_COLUMNS: TableColumn[] = [
  { key: "account", header: "Account" },
  { key: "tier", header: "Tier" },
  { key: "arr", header: "ARR" },
  { key: "usage90d", header: "Usage (90d ago)" },
  { key: "usageNow", header: "Usage (now)" },
  { key: "change", header: "Change", colorize: true },
];

const BOT1_TABLE_ROWS = [
  { account: "Rivian", tier: "Enterprise", arr: "$340K", usage90d: "12,400 sessions", usageNow: "3,470", change: "-72%", negative: true },
  { account: "Plaid", tier: "Enterprise", arr: "$285K", usage90d: "8,900 sessions", usageNow: "3,740", change: "-58%", negative: true },
  { account: "Brex", tier: "Growth", arr: "$112K", usage90d: "3,200 sessions", usageNow: "1,470", change: "-54%", negative: true },
  { account: "Lattice", tier: "Growth", arr: "$98K", usage90d: "2,100 sessions", usageNow: "1,260", change: "-40%", negative: true },
  { account: "Ramp", tier: "Growth", arr: "$145K", usage90d: "4,600 sessions", usageNow: "4,140", change: "-10%", negative: true },
  { account: "Notion", tier: "Enterprise", arr: "$410K", usage90d: "18,300 sessions", usageNow: "19,100", change: "+4%", negative: false },
];

const BOT1_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,557ms total",
  streamContent: [
    { type: "text", content: "38 accounts are up for renewal in April. Most look healthy — but " },
    { type: "bold", content: "4 accounts stand out with major usage drops:" },
    { type: "table" },
    { type: "paragraph" },
    { type: "text", content: "Rivian is down 72% — that's a serious red flag for a $340K account. Plaid and Brex are also trending the wrong way. I'd prioritize these for outreach this week." },
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
    { type: "text", content: " is the most concerning — usage was steady at ~12K sessions/week then " },
    { type: "bold", content: "dropped off a cliff the week of January 20th" },
    { type: "text", content: ". That's not gradual disengagement, something specific broke." },
    { type: "paragraph" },
    { type: "bold", content: "Plaid" },
    { type: "text", content: " is the opposite — a slow, steady fade from 8,900 down to 3,740 over 13 weeks. No single event, just gradual disengagement. Harder to reverse." },
    { type: "paragraph" },
    { type: "bold", content: "Brex" },
    { type: "text", content: " mirrors Rivian's pattern on a smaller scale. Ramp and Notion are stable." },
    { type: "image", src: staticFile("usage_trend_chart.png") },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #3 — Support tickets & NPS ────────────────────────────────

const BOT3_TOOLS: ToolCall[] = [
  { name: "Support tickets for Rivian and Plaid", timing: "645ms" },
  { name: "NPS responses for Rivian and Plaid", timing: "703ms" },
];

const BOT3_RESPONSE: BotResponseContent = {
  statsText: "2 tools executed",
  statsSucceeded: "2 succeeded",
  statsTime: "1,348ms total",
  streamContent: [
    { type: "bold", content: "Rivian — 11 support tickets." },
    { type: "text", content: " 7 are about the same issue — their SSO integration broke after the February platform update (v4.2). Their team can't log in reliably. Escalated twice, no resolution." },
    { type: "paragraph" },
    { type: "bold", content: "Plaid — 3 tickets + NPS flag." },
    { type: "text", content: " Only minor support tickets, but their latest NPS is a " },
    { type: "bold", content: "4 out of 10" },
    { type: "text", content: ":" },
    { type: "blockquote", content: "\"We've outgrown the reporting features. Evaluating alternatives that offer better analytics.\"" },
    { type: "bold", content: "Two different churn signals." },
    { type: "text", content: " Rivian is frustrated because something " },
    { type: "bold", content: "broke" },
    { type: "text", content: " — fixable. Plaid is " },
    { type: "bold", content: "outgrowing us" },
    { type: "text", content: " — that's a product gap, not a support ticket." },
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
  { key: "integrations", header: "Integrations" },
  { key: "signal", header: "Recent Signal" },
  { key: "usage", header: "Usage (now)", colorize: true },
];

const BOT4_TABLE_ROWS = [
  { account: "Retool", tier: "Enterprise", arr: "$175K", integrations: "2", signal: "Filed ticket last week", usage: "-5%", negative: true },
  { account: "Mercury", tier: "Growth", arr: "$130K", integrations: "1", signal: "Low engagement depth", usage: "-3%", negative: true },
  { account: "Vercel", tier: "Enterprise", arr: "$205K", integrations: "2", signal: "2 tickets in 3 weeks", usage: "-8%", negative: true },
  { account: "Linear", tier: "Enterprise", arr: "$160K", integrations: "1", signal: "NPS dropped from 8 → 5", usage: "-2%", negative: true },
];

const BOT4_RESPONSE: BotResponseContent = {
  statsText: "3 tools executed",
  statsSucceeded: "3 succeeded",
  statsTime: "6,181ms total",
  streamContent: [
    { type: "text", content: "Accounts with " },
    { type: "bold", content: "low integration adoption + recent support friction" },
    { type: "text", content: " have a " },
    { type: "bold", content: "6x higher rate of usage decline" },
    { type: "text", content: " (p < 0.001). Integration depth is the sticky factor — 3+ integrations and accounts almost never churn." },
    { type: "paragraph" },
    { type: "bold", content: "4 more accounts fit this high-risk pattern" },
    { type: "text", content: " that aren't showing drops " },
    { type: "bold", content: "yet" },
    { type: "text", content: ":" },
    { type: "table" },
    { type: "paragraph" },
    { type: "text", content: "They match the profile of accounts that decline within 30-60 days. Combined with the original 4, that's " },
    { type: "bold", content: "$1.5M in ARR" },
    { type: "text", content: " across 8 at-risk accounts — not just $835K." },
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
    { type: "text", content: "Here's everything — full at-risk account list ranked by churn risk score, plus a 4-page report with executive summary, charts, and recommendations for leadership." },
    { type: "paragraph" },
    { type: "text", content: "Top priority: Rivian (94), Plaid (89), and Brex (82) are critical. The 4 newly flagged accounts are in the 55-68 range — not on fire yet but headed that direction." },
    { type: "attachments" },
  ],
  attachments: [
    {
      type: "file",
      name: "Q2_Renewal_Risk_Accounts.xlsx",
      description: "10 rows × 13 columns — ranked by churn risk score",
      fileType: "excel",
      title: "Q2 Renewal Risk Accounts",
      previewHeaders: [
        "Account", "Tier", "ARR", "Renewal Dat", "Integrations",
        "Sessions (90d)", "Sessions", "Usage Chang", "Tickets",
        "Ticket Summary", "Latest NP", "Churn Risk", "Risk Level",
      ],
      previewRows: [
        ["Rivian", "Enterprise", "$340K", "2026-04-12", "2", "12400", "3470 -72%", "", "11 SSO integration broken after v4.2 update;", "3", "94 Critical", "", "94 Critical"],
        ["Plaid", "Enterprise", "$285K", "2026-04-18", "1", "8900", "3740 -58%", "", "3 Minor issues; NPS: 'outgrown reporting'", "4", "89 Critical", "", "89 Critical"],
        ["Brex", "Growth", "$112K", "2026-04-08", "2", "3200", "1470 -54%", "", "2 Login issues reported + Feb admin q…", "5", "82 Critical", "", "82 Critical"],
        ["Lattice", "Growth", "$98K", "2026-02-22", "1", "2100", "1260 -40%", "", "2 Support escalated re: onboarding; slow load in…", "4", "76 High", "", "76 High"],
        ["Vercel", "Enterprise", "$205K", "2026-04-15", "2", "9800", "9020 -8%", "", "2 2 tickets in 3 weeks — API rate limiting", "5", "68 High", "", "68 High"],
        ["Retool", "Enterprise", "$175K", "2026-05-20", "2", "7200", "6840 -5%", "", "1 Perf. issue: reliability issue filed last week", "6", "63 High", "", "63 High"],
        ["Linear", "Enterprise", "$160K", "2026-04-25", "1", "6100", "5980 -2%", "", "0 No tickets. NPS dropped from 8 to 5", "5", "58 High", "", "58 High"],
        ["Mercury", "Growth", "$130K", "2026-06-30", "1", "4400", "4270 -3%", "", "0 No tickets; low engagement depth — only 1…", "6", "55 Moderate", "", "55 Moderate"],
        ["Ramp", "Growth", "$145K", "2026-04-10", "4", "4600", "4140 -10%", "", "0 No tickets; slight usage dip but…", "7", "35 Moderate", "", "35 Moderate"],
        ["Notion", "Enterprise", "$410K", "2026-06-05", "7", "18300", "19100 +4%", "", "0 No issues; healthy and growing", "9", "8 Low", "", "8 Low"],
      ],
    },
    {
      type: "file",
      name: "Q2_Renewal_Risk_Report.pdf",
      description:
        "4-page report — executive summary, charts, analysis, recommendations",
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
    { type: "text", content: "Dashboard is live. It tracks all renewal accounts with usage trends, support activity, integration depth, and a health score. Anything that crosses into the risk zone gets flagged automatically. I'd recommend the CS team checks this weekly — it'll catch the next Rivian before it becomes a fire drill." },
    { type: "attachments" },
  ],
  attachments: [
    {
      type: "link",
      name: "Launchpad — Account Health & Renewal Tracker",
      description: "4 KPIs · usage trend · health scores · churn risk scatter",
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
  const cursorHoverStartFrame = 108;

  // ── Scene 1: Thread opens ──────────────────────────────────────────────
  const threadOpenFrame = 142;
  const cursorClickReplyBox = 172;
  const cursorDisappearFrame = 178;

  // ── Scene 2: Jason types first reply ───────────────────────────────────
  const typingStartFrame = 185;
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
  const bot1Start = 450;
  const bot1Cycle1 = 460;
  const bot1ToolDone = [495, 520];
  const bot1Cycle2 = 540;
  const bot1Final = 580;
  const bot1End = streamEndFrame(bot1Final, BOT1_RESPONSE);

  // ── Maceo reacts (no typing) ────────────────────────────────────────
  const maceoMsg1Frame = bot1End + PAUSE;

  // ── Maceo asks for trends (no typing) ─────────────────────────────────
  const maceoMsg2Frame = maceoMsg1Frame + 50;

  // ── Bot #2 ────────────────────────────────────────────────────────────
  const bot2Start = maceoMsg2Frame + 50;
  const bot2Cycle1 = bot2Start + 10;
  const bot2ToolDone = [bot2Cycle1 + 35, bot2Cycle1 + 60];
  const bot2Cycle2 = bot2ToolDone[1] + 20;
  const bot2Final = bot2Cycle2 + 40;
  const bot2End = streamEndFrame(bot2Final, BOT2_RESPONSE);

  // ── Maceo asks about support tickets (no typing) ──────────────────────
  const maceoMsg3Frame = bot2End + PAUSE;

  // ── Bot #3 ────────────────────────────────────────────────────────────
  const bot3Start = maceoMsg3Frame + 50;
  const bot3Cycle1 = bot3Start + 10;
  const bot3ToolDone = [bot3Cycle1 + 35, bot3Cycle1 + 65];
  const bot3Cycle2 = bot3ToolDone[1] + 20;
  const bot3Final = bot3Cycle2 + 40;
  const bot3End = streamEndFrame(bot3Final, BOT3_RESPONSE);

  // ── Maceo pivots to bigger picture (no typing) ────────────────────────
  const maceoMsg4Frame = bot3End + PAUSE;

  // ── Jason asks for churn analysis (no typing) ─────────────────────────
  const jasonMsg1Frame = maceoMsg4Frame + 50;

  // ── Bot #4 (3 tools) ─────────────────────────────────────────────────
  const bot4Start = jasonMsg1Frame + 50;
  const bot4Cycle1 = bot4Start + 10;
  const bot4ToolDone = [bot4Cycle1 + 40, bot4Cycle1 + 80, bot4Cycle1 + 110];
  const bot4Cycle2 = bot4ToolDone[2] + 25;
  const bot4Final = bot4Cycle2 + 45;
  const bot4End = streamEndFrame(bot4Final, BOT4_RESPONSE);

  // ── Jason wants action (no typing) ────────────────────────────────────
  const jasonMsg2Frame = bot4End + PAUSE;

  // ── Maceo asks for combined export + report (no typing) ───────────────
  const maceoMsg5Frame = jasonMsg2Frame + 50;

  // ── Bot #5 (4 tools) ─────────────────────────────────────────────────
  const bot5Start = maceoMsg5Frame + 50;
  const bot5Cycle1 = bot5Start + 10;
  const bot5ToolDone = [bot5Cycle1 + 40, bot5Cycle1 + 75, bot5Cycle1 + 105, bot5Cycle1 + 130];
  const bot5Cycle2 = bot5ToolDone[3] + 25;
  const bot5Final = bot5Cycle2 + 45;
  const bot5End = streamEndFrame(bot5Final, BOT5_RESPONSE);

  // ── Jason wants ongoing monitoring (no typing) ────────────────────────
  const jasonMsg3Frame = bot5End + PAUSE;

  // ── Maceo asks for dashboard (no typing) ──────────────────────────────
  const maceoMsg6Frame = jasonMsg3Frame + 50;

  // ── Bot #6 (3 tools) ─────────────────────────────────────────────────
  const bot6Start = maceoMsg6Frame + 50;
  const bot6Cycle1 = bot6Start + 10;
  const bot6ToolDone = [bot6Cycle1 + 35, bot6Cycle1 + 70, bot6Cycle1 + 100];
  const bot6Cycle2 = bot6ToolDone[2] + 25;
  const bot6Final = bot6Cycle2 + 40;
  const bot6End = streamEndFrame(bot6Final, BOT6_RESPONSE);

  // ── Maceo closing (no typing) ─────────────────────────────────────────
  const maceoMsg7Frame = bot6End + PAUSE;

  // ── Thread reply milestones (for channel message indicator) ──────────
  const threadReplies: ThreadReply[] = [
    { frame: messageSentFrame, participant: "jason" },
    { frame: jason2AppearFrame, participant: "jason" },
    { frame: bot1Start, participant: "bot" },
    { frame: maceoMsg1Frame, participant: "maceo" },
    { frame: maceoMsg2Frame, participant: "maceo" },
    { frame: bot2Start, participant: "bot" },
    { frame: maceoMsg3Frame, participant: "maceo" },
    { frame: bot3Start, participant: "bot" },
    { frame: maceoMsg4Frame, participant: "maceo" },
    { frame: jasonMsg1Frame, participant: "jason" },
    { frame: bot4Start, participant: "bot" },
    { frame: jasonMsg2Frame, participant: "jason" },
    { frame: maceoMsg5Frame, participant: "maceo" },
    { frame: bot5Start, participant: "bot" },
    { frame: jasonMsg3Frame, participant: "jason" },
    { frame: maceoMsg6Frame, participant: "maceo" },
    { frame: bot6Start, participant: "bot" },
    { frame: maceoMsg7Frame, participant: "maceo" },
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
            <ChatArea threadReplies={threadReplies} />
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
                  <Mention>Datost</Mention> which accounts are up for renewal
                  next month, and how do their usage this month compare to 90
                  days ago
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

                {/* ── Maceo reacts ────────────────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg1Frame}
                >
                  damn, Rivian is down 72%? they're one of our biggest accounts
                </SlackMessage>

                {/* ── Maceo asks for trends ──────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg2Frame}
                  continuation
                >
                  <Mention>Datost</Mention> show me a weekly usage trend for
                  our top 6 at-risk accounts over the last 90 days. include a
                  chart
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

                {/* ── Maceo asks about support tickets ─────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg3Frame}
                >
                  <Mention>Datost</Mention> any support tickets or NPS responses
                  from Rivian and Plaid in the last 60 days? what are they about?
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

                {/* ── Maceo: broader view ─────────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg4Frame}
                >
                  ok so rivian is fixable but plaid is a product gap. are there
                  other accounts we're missing?
                </SlackMessage>

                {/* ── Jason asks for churn analysis ─────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg1Frame}
                >
                  <Mention>Datost</Mention> run an analysis across all renewal
                  accounts, is there a correlation between feature adoption,
                  support ticket volume, and usage decline show me what predicts
                  churn risk
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

                {/* ── Jason: get to CS team ─────────────────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg2Frame}
                >
                  we need to get this to the cs team today, can you pull
                  everything together
                </SlackMessage>

                {/* ── Maceo asks for combined export + report ────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg5Frame}
                >
                  <Mention>Datost</Mention> export the full at-risk account list
                  as a spreadsheet and put together a report with the analysis,
                  charts, and recommendations for leadership
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

                {/* ── Jason: can't do this every quarter ────────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg3Frame}
                >
                  this is great, but can't do this firedrill every quarter, we
                  need something the cs team can check on their own
                </SlackMessage>

                {/* ── Maceo asks for dashboard ──────────────────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg6Frame}
                >
                  <Mention>Datost</Mention> build a dashboard that tracks
                  account health, usage trends, support ticket volume, and
                  renewal dates. flag anything that looks at risk
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
                  startFrame={maceoMsg7Frame}
                >
                  done, dropping this in <ChannelMention>cs-renewals</ChannelMention>. we just went from "I have
                  a bad feeling about some accounts" to a full churn prevention
                  system in one thread
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
            { frame: 90, target: { x: 1850, y: 1020 } },
            { frame: 108, target: "maceoMessage" },
            { frame: 118, target: "maceoMessage" },
            { frame: 130, target: "replyButton" },
            { frame: 138, target: "replyButton" },
            { frame: 142, target: "replyButton" },
            { frame: 165, target: "threadReplyBox" },
            { frame: cursorClickReplyBox, target: "threadReplyBox" },
          ]}
          clickFrame={cursorClickReplyBox}
          hideFrame={cursorDisappearFrame}
        />
      </div>
    </CursorTargetProvider>
  );
};
