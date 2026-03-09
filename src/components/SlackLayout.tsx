import React from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ThreadPanel } from "./ThreadPanel";
import { Cursor } from "./Cursor";
import { SlackMessage, Mention } from "./SlackMessage";
import { CursorTargetProvider } from "./CursorTargetContext";

export const SlackLayout: React.FC = () => {
  // Thread opens after cursor clicks the reply button
  const threadOpenFrame = 142;

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
          <ThreadPanel openFrame={threadOpenFrame}>
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

        {/* Animated cursor — uses named targets from refs */}
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
            // Stay during click
            { frame: 142, target: "replyButton" },
            // Drift away after click
            { frame: 170, target: { x: 1600, y: 500 } },
            // Off screen right
            { frame: 195, target: { x: 1950, y: 400 } },
          ]}
          clickFrame={138}
        />
      </div>
    </CursorTargetProvider>
  );
};
