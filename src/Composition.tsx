import { AbsoluteFill } from "remotion";
import { SlackLayout } from "./components/SlackLayout";

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
      <SlackLayout />
    </AbsoluteFill>
  );
};
