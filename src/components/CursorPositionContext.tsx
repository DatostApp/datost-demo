import React, { createContext, useContext, useRef } from "react";

interface Pos {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CameraMode =
  | "intro"
  | "messageFocus"
  | "cursorTrack"
  | "replyBox"
  | "thread";

export interface CameraPhase {
  mode: CameraMode;
  startFrame: number;
}

type PosRef = React.MutableRefObject<Pos | null>;
type RectRef = React.MutableRefObject<Rect | null>;
type NumRef = React.MutableRefObject<number>;
type PhaseRef = React.MutableRefObject<CameraPhase>;

interface CameraTracking {
  cursor: PosRef;
  latestMessage: PosRef;
  replyBox: PosRef;
  focusRect: RectRef;
  threadContentHeight: NumRef;
  lastMessageHeight: NumRef;
  cameraPhase: PhaseRef;
}

const CameraTrackingContext = createContext<CameraTracking>({
  cursor: { current: null },
  latestMessage: { current: null },
  replyBox: { current: null },
  focusRect: { current: null },
  threadContentHeight: { current: 0 },
  lastMessageHeight: { current: 0 },
  cameraPhase: { current: { mode: "intro", startFrame: 0 } },
});

export const CursorPositionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cursor = useRef<Pos | null>(null);
  const latestMessage = useRef<Pos | null>(null);
  const replyBox = useRef<Pos | null>(null);
  const focusRect = useRef<Rect | null>(null);
  const threadContentHeight = useRef(0);
  const lastMessageHeight = useRef(0);
  const cameraPhase = useRef<CameraPhase>({ mode: "intro", startFrame: 0 });
  return (
    <CameraTrackingContext.Provider
      value={{ cursor, latestMessage, replyBox, focusRect, threadContentHeight, lastMessageHeight, cameraPhase }}
    >
      {children}
    </CameraTrackingContext.Provider>
  );
};

export const useCursorPositionRef = () => useContext(CameraTrackingContext).cursor;
export const useLatestMessageRef = () => useContext(CameraTrackingContext).latestMessage;
export const useReplyBoxRef = () => useContext(CameraTrackingContext).replyBox;
export const useFocusRectRef = () => useContext(CameraTrackingContext).focusRect;
export const useThreadContentHeightRef = () =>
  useContext(CameraTrackingContext).threadContentHeight;
export const useLastMessageHeightRef = () =>
  useContext(CameraTrackingContext).lastMessageHeight;
export const useCameraPhaseRef = () => useContext(CameraTrackingContext).cameraPhase;
