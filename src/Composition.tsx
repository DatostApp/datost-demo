import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SlackLayout } from "./components/SlackLayout";
import { CameraContainer } from "./components/CameraContainer";
import { CursorPositionProvider } from "./components/CursorPositionContext";
import { OverlayCard } from "./components/OverlayCard";
import { FeatureText } from "./components/FeatureText";
import { OutroSequence } from "./components/OutroSequence";

const INTRO_DURATION = 60;

export const MyComposition = () => {
  const clickFrame = 126;
  const typingStartFrame = 180;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Background music plays from the very start */}
      <Audio src={staticFile("bg-music.mp3")} volume={0.3} />

      {/* Sound effects — offset by intro duration */}
      <Sequence from={INTRO_DURATION + clickFrame} layout="none">
        <Audio src={staticFile("mouse-click.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={INTRO_DURATION + typingStartFrame} layout="none">
        <Audio src={staticFile("keyboard-typing.mp3")} volume={0.5} />
      </Sequence>

      {/* Slack content — offset so intro plays first */}
      <Sequence from={INTRO_DURATION} durationInFrames={3100}>
        <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
          <CursorPositionProvider>
            <CameraContainer>
              <SlackLayout />
            </CameraContainer>
          </CursorPositionProvider>
        </AbsoluteFill>
      </Sequence>

      {/* ── Intro overlay (renders on top, fades out to reveal Slack) ── */}
      <Sequence durationInFrames={INTRO_DURATION + 15}>
        <OverlayCard
          subtitle="Your AI data analyst — right in Slack"
          showLogo
          durationInFrames={INTRO_DURATION + 15}
          fadeInFrames={15}
          fadeOutFrames={15}
        />
      </Sequence>

      {/* ── Feature text in the right margin during conversation gaps ── */}

      {/* Bot #1 starts responding — database connectivity */}
      <Sequence from={INTRO_DURATION + 450} durationInFrames={386}>
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
          durationInFrames={386}
        />
      </Sequence>

      {/* Bot #2 starts responding — chart generation */}
      <Sequence from={INTRO_DURATION + 836} durationInFrames={378}>
        <FeatureText
          title="Generate charts & visualizations"
          subtitle="Usage trends, comparisons, and breakdowns — rendered in seconds"
          durationInFrames={378}
        />
      </Sequence>

      {/* Bot #3 starts responding — integrations */}
      <Sequence from={INTRO_DURATION + 1214} durationInFrames={468}>
        <FeatureText
          title="Integrate with your full stack"
          subtitle="Audit logs, feature flags, codebase, and more — for the complete picture"
          tags={[
            "Datadog",
            "Sentry",
            "PostHog",
            "Slack",
            "GitHub",
            "Coda",
            "Notion",
          ]}
          durationInFrames={468}
        />
      </Sequence>

      {/* Bot #4 starts responding — advanced analysis */}
      <Sequence from={INTRO_DURATION + 1682} durationInFrames={496}>
        <FeatureText
          title="Run advanced data analysis"
          subtitle="Correlations, predictions, and statistical insights across all your data"
          durationInFrames={496}
        />
      </Sequence>

      {/* Bot #5 starts responding — file exports */}
      <Sequence from={INTRO_DURATION + 2178} durationInFrames={483}>
        <FeatureText
          title="Export to any file type"
          subtitle="Spreadsheets, PDFs, charts, and reports — ready to share"
          durationInFrames={483}
        />
      </Sequence>

      {/* Bot #6 starts responding — live dashboards */}
      <Sequence from={INTRO_DURATION + 2661} durationInFrames={399}>
        <FeatureText
          title="Build live dashboards"
          subtitle="KPIs, trends, and health scores — auto-refreshing and shareable with your team"
          durationInFrames={399}
        />
      </Sequence>

      {/* ── Outro: message lingers as everything fades to black ────── */}
      <Sequence from={INTRO_DURATION + 3060}>
        <OutroSequence />
      </Sequence>
    </AbsoluteFill>
  );
};
