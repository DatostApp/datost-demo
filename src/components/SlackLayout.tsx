import React from "react";
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

// ─── Character constants ─────────────────────────────────────────────────────
// Script "Adi" = code "Maceo" (purple #4a154b, initial M)
// Script "Maceo" = code "Jason" (green #2b5e3a, initial J)

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
  responseText: (
    <>
      38 accounts are up for renewal in April. Most look healthy — but{" "}
      <strong>4 accounts stand out with major usage drops:</strong>
    </>
  ),
  tableColumns: BOT1_TABLE_COLUMNS,
  tableRows: BOT1_TABLE_ROWS,
  analysisText:
    "Rivian is down 72% — that's a serious red flag for a $340K account. Plaid and Brex are also trending the wrong way. I'd prioritize these for outreach this week.",
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
  responseText: (
    <>
      <div style={{ margin: "0 0 8px" }}>
        Two very different patterns here:
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Rivian</strong> is the most concerning — that's not a gradual
        decline, it's a <strong>cliff</strong>. Usage was steady at ~12K
        sessions/week then fell off completely the{" "}
        <strong>week of January 20th</strong> down to ~3K. Something specific
        happened. That kind of sudden drop usually means a blocker, not
        disengagement.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Plaid</strong> is the opposite — a slow, steady fade from 8,900
        down to 3,740 over 13 weeks. No single event, just gradual
        disengagement. That's typically harder to reverse because it signals
        loss of interest rather than a fixable incident.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Brex</strong> mirrors Rivian's pattern on a smaller scale —
        stable until mid-February then a sudden drop. Worth investigating
        whether the same root cause hit both.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Lattice</strong> is a slow bleed — down a little every week,
        consistent decline.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Ramp</strong> and <strong>Notion</strong> are essentially
        stable. Ramp has a slight drift (-10%) but nothing alarming. Notion is
        healthy and growing.
      </div>
      <div>
        I'd dig into what happened at Rivian the week of Jan 20th — that cliff
        pattern almost always points to something specific that broke.
      </div>
    </>
  ),
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
  responseText: (
    <>
      <div style={{ margin: "0 0 8px" }}>Two very different stories here:</div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Rivian — 11 support tickets</strong>
        <br />7 are about the <strong>same issue</strong> — their SSO
        integration broke after the February platform update (v4.2). Their team
        can't log in reliably. It's been escalated twice with no resolution. The
        other 4 tickets are minor UI bugs.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        That explains the cliff drop in the usage chart. If their team literally
        can't log in, of course sessions fell off a cliff the week of Jan 20th.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        <strong>Plaid — 3 tickets + NPS flag</strong>
        <br />
        Only 3 support tickets, all minor. But their most recent NPS response is
        a <strong>score of 4</strong> with this comment:
      </div>
      <div
        style={{
          margin: "0 0 8px",
          padding: "6px 10px",
          borderLeft: "3px solid #4a4a4d",
          color: "#b5b7bb",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        "We've outgrown the reporting features. Evaluating alternatives that
        offer better analytics."
      </div>
      <div style={{ margin: "0 0 8px" }}>
        Two other Plaid users gave similar feedback about the reporting
        limitations.
      </div>
      <div>
        <strong>These are two very different churn signals.</strong> Rivian is
        frustrated because something <strong>broke</strong> — that's fixable. If
        the SSO issue from the v4.2 update gets resolved, there's a good chance
        they re-engage. Plaid is a harder problem — they're not broken, they're{" "}
        <strong>outgrowing us</strong>. That's a product gap conversation, not a
        support ticket.
      </div>
    </>
  ),
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
  responseText: (
    <>
      <div style={{ margin: "0 0 8px" }}>
        The strongest predictor of churn risk isn't just usage decline — it's{" "}
        <strong>
          low integration adoption combined with recent support friction
        </strong>
        . Accounts with fewer than 3 active integrations AND a support ticket or
        low NPS in the last 30 days have a{" "}
        <strong>6x higher rate of usage decline</strong> (p {"<"} 0.001).
      </div>
      <div style={{ margin: "0 0 8px" }}>
        Accounts with 3+ integrations almost never churn, regardless of ticket
        volume. Integration depth is the sticky factor.
      </div>
      <div style={{ margin: "0 0 8px" }}>
        But here's what I'd flag — there are{" "}
        <strong>4 accounts that fit this high-risk pattern</strong> that aren't
        showing major usage drops <strong>yet</strong>:
      </div>
    </>
  ),
  tableColumns: BOT4_TABLE_COLUMNS,
  tableRows: BOT4_TABLE_ROWS,
  analysisText: (
    <>
      They look healthy on the surface but match the profile of accounts that
      typically decline within 30-60 days. Combined with the original 4, that's{" "}
      <strong>$1.5M in ARR</strong> across 8 at-risk accounts — not $835K.
      <br />
      <br />
      I'd get the CS team on Retool and Vercel this week before they follow the
      same trajectory as Rivian.
    </>
  ),
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #5 — CSV export ───────────────────────────────────────────

const BOT5_TOOLS: ToolCall[] = [
  { name: "Build at-risk account export", timing: "412ms" },
  { name: "Upload CSV file", timing: "856ms" },
  { name: "Verify data integrity", timing: "323ms" },
];

const BOT5_RESPONSE: BotResponseContent = {
  statsText: "3 tools executed",
  statsSucceeded: "3 succeeded",
  statsTime: "1,591ms total",
  responseText: (
    <>
      Here's the full export — 10 at-risk accounts with usage data, ticket
      history, integration count, and a churn risk score. I ranked them by risk
      so your CS team can prioritize outreach.
      <br />
      <br />
      Top priority: Rivian (94), Plaid (89), and Brex (82) are all critical. The
      4 newly flagged accounts (Retool, Mercury, Vercel, Linear) are in the
      55-68 range — not on fire yet but headed that direction.
    </>
  ),
  attachments: [
    {
      type: "file",
      name: "Launchpad_At_Risk_Accounts_Q2_Renewals.csv",
      description: "10 rows × 13 columns — ranked by churn risk score",
    },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #6 — PDF report ───────────────────────────────────────────

const BOT6_TOOLS: ToolCall[] = [
  { name: "Generate charts for report", timing: "1,245ms" },
  { name: "Build Typst report template", timing: "892ms" },
  { name: "Compile PDF", timing: "345ms" },
];

const BOT6_RESPONSE: BotResponseContent = {
  statsText: "5 tools executed",
  statsSucceeded: "5 succeeded",
  statsTime: "2,988ms total",
  responseText: (
    <>
      Here's the full report — executive summary, at-risk account breakdown,
      usage trend charts, support ticket analysis, and the churn pattern
      findings. Charts are included so it's ready to share as-is.
    </>
  ),
  attachments: [
    {
      type: "file",
      name: "Launchpad_Q2_Renewal_Risk_Report.pdf",
      description:
        "4-page report — executive summary, charts, analysis, recommendations",
    },
  ],
  source: "Datost Prod (postgresql)",
  timestamp: "Just now",
};

// ─── Bot response #7 — Dashboard ────────────────────────────────────────────

const BOT7_TOOLS: ToolCall[] = [
  { name: "Create dashboard", timing: "412ms" },
  { name: "Save dashboard widgets", timing: "1,876ms" },
  { name: "Verify KPIs render", timing: "521ms" },
];

const BOT7_RESPONSE: BotResponseContent = {
  statsText: "3 tools executed",
  statsSucceeded: "3 succeeded",
  statsTime: "2,809ms total",
  responseText: (
    <>
      Dashboard is live. It tracks all renewal accounts with usage trends,
      support activity, integration depth, and a health score. Anything that
      crosses into the risk zone gets flagged automatically. I'd recommend the
      CS team checks this weekly — it'll catch the next Rivian before it becomes
      a fire drill.
    </>
  ),
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

// ─── Main layout ─────────────────────────────────────────────────────────────

export const SlackLayout: React.FC = () => {
  // ── Scene 1: Thread opens ──────────────────────────────────────────────
  const threadOpenFrame = 142;
  const cursorClickReplyBox = 172;
  const cursorDisappearFrame = 178;

  // ── Scene 2: Jason types first reply ───────────────────────────────────
  const typingStartFrame = 185;
  const typingEndFrame =
    typingStartFrame + Math.ceil(JASON_TEXT.length * 0.85) + 10;
  const messageSentFrame = typingEndFrame + 5;

  // ── Scene 3: Jason's @Datost message streams ──────────────────────────
  const jason2AppearFrame = messageSentFrame + 25;

  // ── Scene 4: Bot response #1 ──────────────────────────────────────────
  const bot1Start = 450;
  const bot1Phase2 = 490;
  const bot1Cycle1 = 575;
  const bot1ToolDone = [610, 635];
  const bot1Cycle2 = 655;
  const bot1Final = 700;

  // ── Scene 5: Maceo reacts ─────────────────────────────────────────────
  const maceoTyping1Start = 850;
  const maceoMsg1Frame = 910;

  // ── Scene 6: Jason reacts to Plaid ────────────────────────────────────
  const jasonTyping2Start = 960;
  const jasonMsg2Frame = 1010;

  // ── Scene 7: Maceo asks for usage trends (@Datost) ────────────────────
  const maceoTyping2Start = 1050;
  const maceoMsg2Frame = 1100;

  // ── Scene 8: Bot response #2 (usage trends) ──────────────────────────
  const bot2Start = 1150;
  const bot2Phase2 = 1190;
  const bot2Cycle1 = 1260;
  const bot2ToolDone = [1300, 1330];
  const bot2Cycle2 = 1350;
  const bot2Final = 1400;

  // ── Scene 9: Jason comments on cliff ──────────────────────────────────
  const jasonTyping3Start = 1560;
  const jasonMsg3Frame = 1610;

  // ── Scene 10: Maceo agrees ────────────────────────────────────────────
  const maceoTyping3Start = 1640;
  const maceoMsg3Frame = 1690;

  // ── Scene 11: Maceo asks about support tickets (@Datost) ──────────────
  const maceoTyping4Start = 1730;
  const maceoMsg4Frame = 1780;

  // ── Scene 12: Bot response #3 (support tickets) ───────────────────────
  const bot3Start = 1830;
  const bot3Phase2 = 1870;
  const bot3Cycle1 = 1940;
  const bot3ToolDone = [1975, 2005];
  const bot3Cycle2 = 2025;
  const bot3Final = 2075;

  // ── Scene 13: Jason reacts to SSO ─────────────────────────────────────
  const jasonTyping4Start = 2230;
  const jasonMsg4Frame = 2280;

  // ── Scene 14: Maceo wants broader view ────────────────────────────────
  const maceoTyping5Start = 2310;
  const maceoMsg5Frame = 2360;

  // ── Scene 15: Jason asks for churn analysis (@Datost) ─────────────────
  const jasonTyping5Start = 2400;
  const jasonMsg5Frame = 2450;

  // ── Scene 16: Bot response #4 (churn analysis — 3 tools) ─────────────
  const bot4Start = 2500;
  const bot4Phase2 = 2540;
  const bot4Cycle1 = 2620;
  const bot4ToolDone = [2660, 2700, 2730];
  const bot4Cycle2 = 2755;
  const bot4Final = 2810;

  // ── Scene 17: Maceo reacts ────────────────────────────────────────────
  const maceoTyping6Start = 2980;
  const maceoMsg6Frame = 3030;

  // ── Scene 18: Jason responds ──────────────────────────────────────────
  const jasonTyping6Start = 3060;
  const jasonMsg6Frame = 3110;

  // ── Scene 19: Maceo asks for CSV export (@Datost) ─────────────────────
  const maceoTyping7Start = 3150;
  const maceoMsg7Frame = 3200;

  // ── Scene 20: Bot response #5 (CSV export — 3 tools) ─────────────────
  const bot5Start = 3250;
  const bot5Phase2 = 3290;
  const bot5Cycle1 = 3360;
  const bot5ToolDone = [3395, 3425, 3450];
  const bot5Cycle2 = 3475;
  const bot5Final = 3525;

  // ── Scene 21: Jason asks for report ───────────────────────────────────
  const jasonTyping7Start = 3630;
  const jasonMsg7Frame = 3680;

  // ── Scene 22: Maceo asks Datost to create report (@Datost) ────────────
  const maceoTyping8Start = 3720;
  const maceoMsg8Frame = 3770;

  // ── Scene 23: Bot response #6 (PDF report — 5 tools) ─────────────────
  const bot6Start = 3820;
  const bot6Phase2 = 3860;
  const bot6Cycle1 = 3940;
  const bot6ToolDone = [3975, 4010, 4040];
  const bot6Cycle2 = 4065;
  const bot6Final = 4115;

  // ── Scene 24: Jason's observation ─────────────────────────────────────
  const jasonTyping8Start = 4210;
  const jasonMsg8Frame = 4260;

  // ── Scene 25: Maceo asks for dashboard (@Datost) ──────────────────────
  const maceoTyping9Start = 4300;
  const maceoMsg9Frame = 4350;

  // ── Scene 26: Bot response #7 (dashboard — 3 tools) ──────────────────
  const bot7Start = 4400;
  const bot7Phase2 = 4440;
  const bot7Cycle1 = 4510;
  const bot7ToolDone = [4545, 4580, 4610];
  const bot7Cycle2 = 4635;
  const bot7Final = 4685;

  // ── Scene 27: Maceo's closing message ─────────────────────────────────
  const maceoTyping10Start = 4780;
  const maceoMsg10Frame = 4830;

  // ── Reply box typing text for additional sessions ──────────────────────
  const MACEO_DATOST_TEXT2 =
    "show me a weekly usage trend for our top 6 at-risk accounts over the last 90 days. include a chart";

  const MACEO_DATOST_TEXT3 =
    "any support tickets or NPS responses from Rivian and Plaid in the last 60 days? what are they about?";

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
            replyTyping={[
              {
                text: JASON_TEXT,
                startFrame: typingStartFrame,
                speed: 0.7,
                clearFrame: messageSentFrame,
              },
              {
                text: MACEO_DATOST_TEXT2,
                startFrame: maceoTyping2Start,
                speed: 0.5,
                clearFrame: maceoMsg2Frame,
              },
              {
                text: MACEO_DATOST_TEXT3,
                startFrame: maceoTyping4Start,
                speed: 0.5,
                clearFrame: maceoMsg4Frame,
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

                {/* ── Jason's @Datost message (streaming) ──────────── */}
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
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

                {/* ── Bot response #1 ──────────────────────────────── */}
                <DatostBotMessage
                  startFrame={bot1Start}
                  phase2Frame={bot1Phase2}
                  cycle1Frame={bot1Cycle1}
                  toolDoneFrames={bot1ToolDone}
                  cycle2Frame={bot1Cycle2}
                  finalResponseFrame={bot1Final}
                  tools={BOT1_TOOLS}
                  response={BOT1_RESPONSE}
                />

                {/* ── Maceo: "damn, Rivian is down 72%!" ───────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping1Start}
                  endFrame={maceoMsg1Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg1Frame}
                >
                  damn, Rivian is down 72%? they're one of our biggest accounts
                </SlackMessage>

                {/* ── Jason: "and plaid too??" ──────────────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping2Start}
                  endFrame={jasonMsg2Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg2Frame}
                >
                  and plaid too?? are they just seasonal or is something
                  actually wrong
                </SlackMessage>

                {/* ── Maceo asks for usage trends (@Datost) ────────── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg2Frame}
                >
                  <Mention>Datost</Mention> show me a weekly usage trend for
                  our top 6 at-risk accounts over the last 90 days. include a
                  chart
                </SlackMessage>

                {/* ── Bot response #2 (usage trends) ───────────────── */}
                <DatostBotMessage
                  startFrame={bot2Start}
                  phase2Frame={bot2Phase2}
                  cycle1Frame={bot2Cycle1}
                  toolDoneFrames={bot2ToolDone}
                  cycle2Frame={bot2Cycle2}
                  finalResponseFrame={bot2Final}
                  tools={BOT2_TOOLS}
                  response={BOT2_RESPONSE}
                />

                {/* ── Jason: cliff comment ──────────────────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping3Start}
                  endFrame={jasonMsg3Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg3Frame}
                >
                  that rivian drop is a cliff not a trend, something happened 6
                  weeks ago
                </SlackMessage>

                {/* ── Maceo: agreed ─────────────────────────────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping3Start}
                  endFrame={maceoMsg3Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg3Frame}
                >
                  agreed. let me check if they've been complaining
                </SlackMessage>

                {/* ── Maceo asks about support tickets (@Datost) ───── */}
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg4Frame}
                >
                  <Mention>Datost</Mention> any support tickets or NPS responses
                  from Rivian and Plaid in the last 60 days? what are they about?
                </SlackMessage>

                {/* ── Bot response #3 (support tickets) ────────────── */}
                <DatostBotMessage
                  startFrame={bot3Start}
                  phase2Frame={bot3Phase2}
                  cycle1Frame={bot3Cycle1}
                  toolDoneFrames={bot3ToolDone}
                  cycle2Frame={bot3Cycle2}
                  finalResponseFrame={bot3Final}
                  tools={BOT3_TOOLS}
                  response={BOT3_RESPONSE}
                />

                {/* ── Jason: SSO reaction ───────────────────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping4Start}
                  endFrame={jasonMsg4Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg4Frame}
                >
                  so rivian is literally churning because of a broken SSO
                  integration, thats fixable
                </SlackMessage>

                {/* ── Maceo: broader view ───────────────────────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping5Start}
                  endFrame={maceoMsg5Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg5Frame}
                >
                  yeah but I want to know if this is bigger than just these two.
                  are there other accounts we're missing?
                </SlackMessage>

                {/* ── Jason asks for churn analysis (@Datost) ──────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping5Start}
                  endFrame={jasonMsg5Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg5Frame}
                >
                  <Mention>Datost</Mention> run an analysis across all renewal
                  accounts, is there a correlation between feature adoption,
                  support ticket volume, and usage decline show me what predicts
                  churn risk
                </SlackMessage>

                {/* ── Bot response #4 (churn analysis) ─────────────── */}
                <DatostBotMessage
                  startFrame={bot4Start}
                  phase2Frame={bot4Phase2}
                  cycle1Frame={bot4Cycle1}
                  toolDoneFrames={bot4ToolDone}
                  cycle2Frame={bot4Cycle2}
                  finalResponseFrame={bot4Final}
                  tools={BOT4_TOOLS}
                  response={BOT4_RESPONSE}
                />

                {/* ── Maceo: 4 more at risk? ───────────────────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping6Start}
                  endFrame={maceoMsg6Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg6Frame}
                >
                  wait so there are 4 more accounts at risk that we didn't even
                  know about?
                </SlackMessage>

                {/* ── Jason: get to CS team ─────────────────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping6Start}
                  endFrame={jasonMsg6Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg6Frame}
                >
                  yeah we need to get this to the cs team today, can you pull
                  everything together
                </SlackMessage>

                {/* ── Maceo asks for CSV export (@Datost) ──────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping7Start}
                  endFrame={maceoMsg7Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg7Frame}
                >
                  <Mention>Datost</Mention> export the full at-risk account list
                  with usage trends, support ticket summaries, and churn risk
                  score as a csv
                </SlackMessage>

                {/* ── Bot response #5 (CSV export) ─────────────────── */}
                <DatostBotMessage
                  startFrame={bot5Start}
                  phase2Frame={bot5Phase2}
                  cycle1Frame={bot5Cycle1}
                  toolDoneFrames={bot5ToolDone}
                  cycle2Frame={bot5Cycle2}
                  finalResponseFrame={bot5Final}
                  tools={BOT5_TOOLS}
                  response={BOT5_RESPONSE}
                />

                {/* ── Jason: asks for report ────────────────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping7Start}
                  endFrame={jasonMsg7Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg7Frame}
                >
                  also can you put together a report with the analysis and
                  findings, i want to send to leadership with context not just a
                  spreadsheet
                </SlackMessage>

                {/* ── Maceo asks for report creation (@Datost) ─────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping8Start}
                  endFrame={maceoMsg8Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg8Frame}
                >
                  <Mention>Datost</Mention> create a report on our renewal risk,
                  include the at-risk accounts, usage trends, support ticket
                  findings, and the churn pattern analysis with charts
                </SlackMessage>

                {/* ── Bot response #6 (PDF report) ─────────────────── */}
                <DatostBotMessage
                  startFrame={bot6Start}
                  phase2Frame={bot6Phase2}
                  cycle1Frame={bot6Cycle1}
                  toolDoneFrames={bot6ToolDone}
                  cycle2Frame={bot6Cycle2}
                  finalResponseFrame={bot6Final}
                  tools={BOT6_TOOLS}
                  additionalToolCount={2}
                  response={BOT6_RESPONSE}
                />

                {/* ── Jason: can't do this every quarter ────────────── */}
                <TypingIndicator
                  name={JASON.author}
                  startFrame={jasonTyping8Start}
                  endFrame={jasonMsg8Frame}
                />
                <SlackMessage
                  author={JASON.author}
                  avatarColor={JASON.color}
                  avatarInitial={JASON.initial}
                  timestamp="Just now"
                  startFrame={jasonMsg8Frame}
                >
                  this is great, but can't do this firedrill every quarter, we
                  need something the cs team can check on their own
                </SlackMessage>

                {/* ── Maceo asks for dashboard (@Datost) ───────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping9Start}
                  endFrame={maceoMsg9Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg9Frame}
                >
                  <Mention>Datost</Mention> build a dashboard that tracks
                  account health, usage trends, support ticket volume, and
                  renewal dates. flag anything that looks at risk
                </SlackMessage>

                {/* ── Bot response #7 (dashboard) ──────────────────── */}
                <DatostBotMessage
                  startFrame={bot7Start}
                  phase2Frame={bot7Phase2}
                  cycle1Frame={bot7Cycle1}
                  toolDoneFrames={bot7ToolDone}
                  cycle2Frame={bot7Cycle2}
                  finalResponseFrame={bot7Final}
                  tools={BOT7_TOOLS}
                  response={BOT7_RESPONSE}
                />

                {/* ── Maceo: closing message ────────────────────────── */}
                <TypingIndicator
                  name={MACEO.author}
                  startFrame={maceoTyping10Start}
                  endFrame={maceoMsg10Frame}
                />
                <SlackMessage
                  author={MACEO.author}
                  avatarColor={MACEO.color}
                  avatarInitial={MACEO.initial}
                  timestamp="Just now"
                  startFrame={maceoMsg10Frame}
                >
                  done, dropping this in #cs-renewals. we just went from "I have
                  a bad feeling about some accounts" to a full churn prevention
                  system in one thread
                </SlackMessage>

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
