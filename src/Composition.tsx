import { useEffect } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SlackLayout } from "./components/SlackLayout";
import { CameraContainer } from "./components/CameraContainer";
import { CursorPositionProvider } from "./components/CursorPositionContext";
import { OverlayCard } from "./components/OverlayCard";
import { FeatureText } from "./components/FeatureText";
import { OutroSequence } from "./components/OutroSequence";

const INTRO_DURATION = 30;

// Preload all static images so they're cached before rendering
const PRELOAD_IMAGES = [
  staticFile("datost-icon.svg"),
  staticFile("usage_trend_chart.png"),
  staticFile("churn_risk_chart.png"),
  staticFile("pdf_preview-1.png"),
  staticFile("pdf_preview-2.png"),
  staticFile("dashboard_preview.png"),
];

export const MyComposition = () => {
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const clickFrame = 202;
  const typingStartFrame = 245;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <CursorPositionProvider>
      {/* Background music plays from the very start */}
      <Audio src={staticFile("bg-music.mp3")} volume={0.3} />

      {/* Sound effects — offset by intro duration */}
      <Sequence from={INTRO_DURATION + clickFrame} layout="none">
        <Audio src={staticFile("mouse-click.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={INTRO_DURATION + typingStartFrame} layout="none">
        <Audio src={staticFile("keyboard-typing.mp3")} volume={0.5} />
      </Sequence>
      {/* Typing sounds for Jason's @Datost request messages */}
      {/* (no typing on reaction messages — VO covers those) */}
      <Sequence from={INTRO_DURATION + 1486} layout="none">
        <Audio src={staticFile("keyboard-typing.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={INTRO_DURATION + 2319} layout="none">
        <Audio src={staticFile("keyboard-typing.mp3")} volume={0.4} />
      </Sequence>

      {/* ── Jason voiceover (reactive narration) ────────────────────── */}

      {/* React to Maceo's "accounts feel quiet" message */}
      <Sequence from={INTRO_DURATION + 70} layout="none">
        <Audio src={staticFile("voiceover/01-maceo-concern.mp3")} volume={0.9} />
      </Sequence>

      {/* "Let's just ask Datost" — as @Datost message appears */}
      <Sequence from={INTRO_DURATION + 350} layout="none">
        <Audio src={staticFile("voiceover/02-ask-datost.mp3")} volume={0.9} />
      </Sequence>

      {/* "Whoa, Rivian's down 72%" — reacting to bot1 table */}
      <Sequence from={INTRO_DURATION + 546} layout="none">
        <Audio src={staticFile("voiceover/03-bot1-table.mp3")} volume={0.9} />
      </Sequence>

      {/* "Rivian fell off a cliff" — reacting to bot2 trends */}
      <Sequence from={INTRO_DURATION + 900} layout="none">
        <Audio src={staticFile("voiceover/05-bot2-trends.mp3")} volume={0.9} />
      </Sequence>

      {/* "Eleven tickets, same bug" — reacting to bot3 support data */}
      <Sequence from={INTRO_DURATION + 1281} layout="none">
        <Audio src={staticFile("voiceover/06-bot3-tickets.mp3")} volume={0.9} />
      </Sequence>

      {/* "What about the rest of the book" — Jason's thought before typing */}
      <Sequence from={INTRO_DURATION + 1512} layout="none">
        <Audio src={staticFile("voiceover/07-jason-churn.mp3")} volume={0.9} />
      </Sequence>

      {/* "$1.5M at risk" — reacting to bot4 churn analysis */}
      <Sequence from={INTRO_DURATION + 1796} layout="none">
        <Audio src={staticFile("voiceover/08-bot4-risk.mp3")} volume={0.9} />
      </Sequence>

      {/* "Spreadsheet, PDF, just like that" — reacting to bot5 exports */}
      <Sequence from={INTRO_DURATION + 2199} layout="none">
        <Audio src={staticFile("voiceover/09-bot5-export.mp3")} volume={0.9} />
      </Sequence>

      {/* "We need this running all the time" — Jason's thought before typing */}
      <Sequence from={INTRO_DURATION + 2363} layout="none">
        <Audio src={staticFile("voiceover/10-jason-dashboard.mp3")} volume={0.9} />
      </Sequence>

      {/* "Live dashboard, exactly what we needed" — reacting to bot6 */}
      <Sequence from={INTRO_DURATION + 2560} layout="none">
        <Audio src={staticFile("voiceover/11-bot6-dashboard.mp3")} volume={0.9} />
      </Sequence>

      {/* Slack content — offset so intro plays first */}
      <Sequence from={INTRO_DURATION} durationInFrames={2786}>
        <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
          <CameraContainer>
            <SlackLayout />
          </CameraContainer>
        </AbsoluteFill>
      </Sequence>

      {/* ── Intro overlay (renders on top, fades out to reveal Slack) ── */}
      <Sequence durationInFrames={INTRO_DURATION + 10}>
        <OverlayCard
          subtitle="Your AI data analyst, right in Slack"
          showLogo
          durationInFrames={INTRO_DURATION + 10}
          fadeInFrames={10}
          fadeOutFrames={10}
        />
      </Sequence>

      {/* ── Feature text in the right margin during conversation gaps ── */}

      {/* Bot #1 starts responding — database connectivity */}
      <Sequence from={INTRO_DURATION + 406} durationInFrames={303}>
        <FeatureText
          title="Connect to any database"
          tags={[
            "PostgreSQL",
            "MySQL",
            "BigQuery",
            "Snowflake",
            "Databricks",
            "Firestore",
            "+ more",
          ]}
          durationInFrames={303}
        />
      </Sequence>

      {/* Bot #2 starts responding — chart generation */}
      <Sequence from={INTRO_DURATION + 759} durationInFrames={327}>
        <FeatureText
          title="Generate charts & visualizations"
          subtitle="Usage trends, comparisons, and breakdowns, rendered in seconds"
          durationInFrames={327}
        />
      </Sequence>

      {/* Bot #3 starts responding — integrations */}
      <Sequence from={INTRO_DURATION + 1136} durationInFrames={355}>
        <FeatureText
          title="Integrate with your full stack"
          subtitle="Audit logs, feature flags, codebase, and more, for the complete picture"
          tags={[
            "Datadog",
            "Sentry",
            "PostHog",
            "Slack",
            "GitHub",
            "Coda",
            "Notion",
            "Any MCP server",
            "+ more",
          ]}
          durationInFrames={355}
        />
      </Sequence>

      {/* Bot #4 starts responding — advanced analysis */}
      <Sequence from={INTRO_DURATION + 1541} durationInFrames={388}>
        <FeatureText
          title="Run advanced data analysis"
          subtitle="Correlations, predictions, and statistical insights across all your data"
          durationInFrames={388}
        />
      </Sequence>

      {/* Bot #5 starts responding — file exports */}
      <Sequence from={INTRO_DURATION + 1979} durationInFrames={396}>
        <FeatureText
          title="Export to any file type"
          subtitle="Spreadsheets, PDFs, charts, and reports, ready to share"
          durationInFrames={396}
        />
      </Sequence>

      {/* Bot #6 starts responding — live dashboards */}
      <Sequence from={INTRO_DURATION + 2375} durationInFrames={353}>
        <FeatureText
          title="Build live dashboards"
          subtitle="KPIs, trends, and health scores, auto-refreshing and shareable with your team"
          durationInFrames={353}
        />
      </Sequence>

      {/* ── Outro: message lingers as everything fades to black ────── */}
      <Sequence from={INTRO_DURATION + 2728}>
        <OutroSequence />
      </Sequence>
      </CursorPositionProvider>
    </AbsoluteFill>
  );
};
