import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SlackLayout } from "./components/SlackLayout";
import { CameraContainer } from "./components/CameraContainer";
import { CursorPositionProvider } from "./components/CursorPositionContext";

export const MyComposition = () => {
  const clickFrame = 126;
  const typingStartFrame = 180;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
      <Audio src={staticFile("bg-music.mp3")} volume={0.3} />

      {/* Mouse click when cursor clicks the reply box */}
      <Sequence from={clickFrame} layout="none">
        <Audio src={staticFile("mouse-click.mp3")} volume={0.8} />
      </Sequence>

      {/* Keyboard typing while Jason types his reply */}
      <Sequence from={typingStartFrame} layout="none">
        <Audio src={staticFile("keyboard-typing.mp3")} volume={0.5} />
      </Sequence>

      <CursorPositionProvider>
        <CameraContainer>
          <SlackLayout />
        </CameraContainer>
      </CursorPositionProvider>
    </AbsoluteFill>
  );
};
