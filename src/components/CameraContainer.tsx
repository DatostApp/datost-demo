import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig, Easing } from "remotion";
import {
  useCursorPositionRef,
  useLatestMessageRef,
  useReplyBoxRef,
  useFocusRectRef,
  useLastMessageHeightRef,
  useCameraPhaseRef,
  useCameraTransformRef,
  type CameraMode,
} from "./CursorPositionContext";

interface CameraContainerProps {
  children: React.ReactNode;
}

// 20 px viewport-space margin on each side of the focused message
const FOCUS_MARGIN = 20;

// How many frames each mode takes to ease in
const TRANSITION_FRAMES: Record<CameraMode, number> = {
  intro: 1,
  messageFocus: 18,
  cursorTrack: 12,
  replyBox: 10,
  thread: 25,
};

// Target tilt per mode
const TILT: Record<CameraMode, [number, number]> = {
  intro: [0, 0],
  messageFocus: [0, 0],
  cursorTrack: [0, 0],
  replyBox: [1.5, -0.8],
  thread: [0.4, -0.2],
};

interface Snapshot {
  zoom: number;
  focalX: number;
  focalY: number;
  tiltX: number;
  tiltY: number;
}

export const CameraContainer: React.FC<CameraContainerProps> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cursorPos = useCursorPositionRef();
  const latestMsg = useLatestMessageRef();
  const replyBox = useReplyBoxRef();
  const focusRect = useFocusRectRef();
  const lastMsgHeight = useLastMessageHeightRef();
  const phase = useCameraPhaseRef();
  const cameraTransform = useCameraTransformRef();

  const cx = width / 2;
  const cy = height / 2;

  const ease = Easing.inOut(Easing.ease);
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi);

  // ── Pan tolerance — ignore shifts smaller than this (in content px) ──
  const PAN_TOLERANCE = 10;
  const committedTargetRef = useRef<{ x: number; y: number }>({ x: cx, y: cy });

  // ── Snapshot refs for smooth transitions ──────────────────────────────
  const prevModeRef = useRef<CameraMode>("intro");
  const fromRef = useRef<Snapshot>({
    zoom: 1,
    focalX: cx,
    focalY: cy,
    tiltX: 0,
    tiltY: 0,
  });
  const lastRef = useRef<Snapshot>({
    zoom: 1,
    focalX: cx,
    focalY: cy,
    tiltX: 0,
    tiltY: 0,
  });

  // ── Detect mode change — snapshot what was rendered last frame ────────
  const mode = phase.current.mode;
  const modeAge = frame - phase.current.startFrame;

  if (mode !== prevModeRef.current) {
    fromRef.current = { ...lastRef.current };
    prevModeRef.current = mode;
  }

  // ── Easing progress for current transition ───────────────────────────
  const duration = TRANSITION_FRAMES[mode];
  const t = ease(Math.min(1, modeAge / duration));

  // ── Derive target zoom from mode + refs ──────────────────────────────
  const msgZoom = focusRect.current
    ? (width - FOCUS_MARGIN * 2) / focusRect.current.width
    : 1.3;

  // Thread zoom: fit the latest message (+ padding) inside the viewport.
  // At zoom z the viewport shows height/z content-pixels vertically.
  const THREAD_ZOOM_PADDING = 300; // breathing room for avatar/header above + reply box below
  const msgH = lastMsgHeight.current || 0;
  const rawThreadZoom =
    msgH > 0
      ? clamp(height / (msgH + THREAD_ZOOM_PADDING), 1.0, 1.8)
      : 1.8;

  // Smooth-follow the thread zoom so it doesn't jump when a new message
  // of a different size appears.
  const smoothThreadZoomRef = useRef(rawThreadZoom);
  if (mode === "thread") {
    const zoomDelta = rawThreadZoom - smoothThreadZoomRef.current;
    // Zoom out faster (content growing) than zoom in (new shorter message)
    const followSpeed = zoomDelta < 0 ? 0.25 : 0.10;
    smoothThreadZoomRef.current += zoomDelta * followSpeed;
  } else {
    // Stay in sync when not in thread mode so the first frame is correct
    smoothThreadZoomRef.current = rawThreadZoom;
  }
  const threadZoom = smoothThreadZoomRef.current;

  let targetZoom: number;
  switch (mode) {
    case "intro":
      targetZoom = 1.0;
      break;
    case "messageFocus":
      targetZoom = msgZoom;
      break;
    case "cursorTrack":
    case "replyBox":
      targetZoom = 2.0;
      break;
    case "thread":
      targetZoom = threadZoom;
      break;
  }

  const zoom = fromRef.current.zoom + (targetZoom - fromRef.current.zoom) * t;

  // ── Derive target focal point from mode + refs ───────────────────────
  const halfW = cx / zoom;
  const halfH = cy / zoom;

  let rawX: number;
  let rawY: number;

  switch (mode) {
    case "intro":
      rawX = cx;
      rawY = cy;
      break;
    case "messageFocus":
      rawX = focusRect.current?.x ?? cx;
      rawY = focusRect.current?.y ?? cy;
      break;
    case "cursorTrack":
      rawX = cursorPos.current?.x ?? cx;
      rawY = cursorPos.current?.y ?? cy;
      break;
    case "replyBox":
      rawX = replyBox.current?.x ?? cx;
      rawY = replyBox.current?.y ?? cy;
      break;
    case "thread":
      rawX = latestMsg.current?.x ?? cx;
      // Center on the vertical middle of the latest message
      rawY = (latestMsg.current?.y ?? cy) - (lastMsgHeight.current * 0.5);
      break;
  }

  // Skip clamping for focus modes so messages are always perfectly centered
  const skipClamp = mode === "messageFocus" || mode === "thread";
  const candidateX = skipClamp ? rawX : clamp(rawX, halfW, width - halfW);
  const candidateY = skipClamp ? rawY : clamp(rawY, halfH, height - halfH);

  // Dead-zone: only commit a new target when the shift exceeds PAN_TOLERANCE
  const dx = candidateX - committedTargetRef.current.x;
  const dy = candidateY - committedTargetRef.current.y;
  if (dx * dx + dy * dy > PAN_TOLERANCE * PAN_TOLERANCE || mode !== prevModeRef.current) {
    committedTargetRef.current = { x: candidateX, y: candidateY };
  }
  const targetX = committedTargetRef.current.x;
  const targetY = committedTargetRef.current.y;

  const focalX = fromRef.current.focalX + (targetX - fromRef.current.focalX) * t;
  const focalY = fromRef.current.focalY + (targetY - fromRef.current.focalY) * t;

  // ── Tilt ─────────────────────────────────────────────────────────────
  const [targetTiltX, targetTiltY] = TILT[mode];
  const tiltX = fromRef.current.tiltX + (targetTiltX - fromRef.current.tiltX) * t;
  const tiltY = fromRef.current.tiltY + (targetTiltY - fromRef.current.tiltY) * t;

  // ── Persist last rendered values for next mode change ────────────────
  lastRef.current = { zoom, focalX, focalY, tiltX, tiltY };

  // ── Compute transform ────────────────────────────────────────────────
  const offsetX = cx - focalX * zoom;
  const offsetY = cy - focalY * zoom;

  // Publish for overlays (FeatureText) to read
  cameraTransform.current = { zoom, offsetX, offsetY };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          perspective: 2500,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "50% 50%",
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "0 0",
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              willChange: "transform",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
