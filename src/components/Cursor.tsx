import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { useCursorPositions } from "./CursorTargetContext";

interface CursorKeyframe {
  frame: number;
  /** Named target registered via useCursorTarget, or absolute {x, y} */
  target: string | { x: number; y: number };
}

interface CursorProps {
  keyframes: CursorKeyframe[];
  /** Frame when a click happens (brief scale pulse) */
  clickFrame?: number;
}

export const Cursor: React.FC<CursorProps> = ({ keyframes, clickFrame }) => {
  const frame = useCurrentFrame();
  const getPosition = useCursorPositions();

  if (frame < keyframes[0].frame) return null;

  // Resolve each keyframe to actual coordinates
  const resolved = keyframes.map((k) => {
    if (typeof k.target === "string") {
      const pos = getPosition(k.target);
      return { frame: k.frame, x: pos?.x ?? -100, y: pos?.y ?? -100 };
    }
    return { frame: k.frame, x: k.target.x, y: k.target.y };
  });

  const frames = resolved.map((k) => k.frame);
  const xValues = resolved.map((k) => k.x);
  const yValues = resolved.map((k) => k.y);

  const x = interpolate(frame, frames, xValues, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  const y = interpolate(frame, frames, yValues, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  // Click pulse
  let scale = 1;
  if (
    clickFrame !== undefined &&
    frame >= clickFrame &&
    frame < clickFrame + 6
  ) {
    scale = interpolate(
      frame,
      [clickFrame, clickFrame + 3, clickFrame + 6],
      [1, 0.75, 1],
      { extrapolateRight: "clamp" }
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        transform: `scale(${scale})`,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
      }}
    >
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
        <path
          d="M1 1L1 17.5L5.5 13.5L9 21L12 19.5L8.5 12H14.5L1 1Z"
          fill="white"
          stroke="black"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
