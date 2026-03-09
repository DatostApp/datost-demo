import { AbsoluteFill, Audio, staticFile } from "remotion";
import { SlackLayout } from "./components/SlackLayout";
import { CameraContainer } from "./components/CameraContainer";
import { CursorPositionProvider } from "./components/CursorPositionContext";

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
      <Audio src={staticFile("bg-music.mp3")} volume={0.3} />
      <CursorPositionProvider>
        <CameraContainer>
          <SlackLayout />
        </CameraContainer>
      </CursorPositionProvider>
    </AbsoluteFill>
  );
};
