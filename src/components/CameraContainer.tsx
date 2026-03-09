import React from "react";
import { useCurrentFrame, useVideoConfig, Easing } from "remotion";
import {
  useCursorPositionRef,
  useLatestMessageRef,
  useReplyBoxRef,
  useFocusRectRef,
  useThreadContentHeightRef,
} from "./CursorPositionContext";

interface CameraContainerProps {
  children: React.ReactNode;
}

// 20 px viewport-space margin on each side of the focused message
const FOCUS_MARGIN = 20;

export const CameraContainer: React.FC<CameraContainerProps> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cursorPos = useCursorPositionRef();
  const latestMsg = useLatestMessageRef();
  const replyBox = useReplyBoxRef();
  const focusRect = useFocusRectRef();
  const threadContentHeight = useThreadContentHeightRef();

  const cx = width / 2; // 960
  const cy = height / 2; // 540

  // ── Easing helper ──────────────────────────────────────────────────────
  const ease = Easing.inOut(Easing.ease);

  // Segment-wise interpolation with per-segment easing
  const smooth = (keyframes: [number, number][]): number => {
    if (frame <= keyframes[0][0]) return keyframes[0][1];
    if (frame >= keyframes[keyframes.length - 1][0])
      return keyframes[keyframes.length - 1][1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      const [f0, v0] = keyframes[i];
      const [f1, v1] = keyframes[i + 1];
      if (frame >= f0 && frame <= f1) {
        const t = ease((frame - f0) / (f1 - f0));
        return v0 + (v1 - v0) * t;
      }
    }
    return keyframes[keyframes.length - 1][1];
  };

  // ── Message-focus zoom — derived from actual message width ────────────
  // zoom = (viewport - 2 * margin) / messageWidth
  const msgZoom = focusRect.current
    ? (width - FOCUS_MARGIN * 2) / focusRect.current.width
    : 1.3; // fallback if ref hasn't measured yet

  // ── Dynamic thread zoom — shrinks as bot messages grow ─────────────────
  // The thread panel container is ~height-49(header)-~100(input) ≈ height-149.
  // When content exceeds visible area we zoom out so the latest message stays
  // legible.  We map content height to zoom:
  //   contentH ≤ visibleH  → 1.8  (thread fits, stay zoomed in)
  //   contentH grows       → zoom decreases linearly
  //   contentH very large  → floor at 1.15 (never zoom out further)
  const threadVisibleH = height - 149; // approximate visible thread area
  const contentH = threadContentHeight.current || threadVisibleH;
  const threadZoom = Math.max(
    1.15,
    Math.min(1.8, 1.8 * (threadVisibleH / Math.max(contentH, threadVisibleH)))
  );

  // ── Zoom keyframes ────────────────────────────────────────────────────
  // 1x → zoom to fit message → hold → follow cursor at 2x → hold for typing → thread
  const zoom = smooth([
    [0, 1.0],
    [60, 1.0],          // message appears
    [78, msgZoom],       // zoom to fit message with margin
    [108, msgZoom],      // hold on message (~1 s pause)
    [120, 2.0],          // cursor hovers → zoom in to follow
    [178, 2.0],          // cursor disappears — stay zoomed on reply box
    [295, 2.0],          // hold during first message typing
    [340, threadZoom],   // ease to thread-reading zoom (dynamic based on content)
  ]);

  // ── Focal point — use ref for message focus, static fallback otherwise
  const msgCenterX = focusRect.current?.x ?? 1140;
  const msgCenterY = focusRect.current?.y ?? 880;

  const staticFocalX = smooth([
    [0, cx],
    [60, cx],
    [78, msgCenterX],    // center on message (from ref)
    [108, msgCenterX],   // hold
    [178, msgCenterX],   // transition base after cursor
  ]);

  const staticFocalY = smooth([
    [0, cy],
    [60, cy],
    [78, msgCenterY],    // center on message (from ref)
    [108, msgCenterY],   // hold
    [178, msgCenterY],   // transition base after cursor
  ]);

  // ── Blend factors ─────────────────────────────────────────────────────
  // Each blend cross-fades into the next — no gaps where the camera
  // would snap back to the static focal point.

  // cursorBlend: 0 = static, 1 = track cursor
  const cursorBlend = smooth([
    [0, 0],
    [108, 0],            // message focus — static
    [118, 1],            // ease into cursor tracking
    [168, 1],            // tracking
    [178, 0],            // fade out (replyBoxBlend takes over)
  ]);

  // replyBoxBlend: ramps up BEFORE cursor ends so they cross-fade
  const replyBoxBlend = smooth([
    [0, 0],
    [168, 0],            // start rising as cursor fades
    [178, 1],            // fully locked on reply box by cursor disappear
    [295, 1],            // hold during typing
    [305, 0],            // fade out (msgBlend takes over)
  ]);

  // msgBlend: ramps up BEFORE replyBox ends so they cross-fade
  const msgBlend = smooth([
    [0, 0],
    [295, 0],            // start rising as replyBox fades
    [305, 1],            // fully tracking latest message
  ]);

  // ── Clamp helper — keep view within composition bounds ────────────────
  const halfW = cx / zoom;
  const halfH = cy / zoom;
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi);

  // ── Focal point — weighted average of active targets ────────────────
  // During cross-fades two targets are active simultaneously. A sequential
  // blend leaks the static base position and causes a jostle. Instead we
  // compute a single weighted-average target so the static base only
  // contributes when NO tracker is active.

  let trackX = 0;
  let trackY = 0;
  let trackW = 0;

  if (cursorPos.current && cursorBlend > 0) {
    const tx = clamp(cursorPos.current.x, halfW, width - halfW);
    const ty = clamp(cursorPos.current.y, halfH, height - halfH);
    trackX += tx * cursorBlend;
    trackY += ty * cursorBlend;
    trackW += cursorBlend;
  }

  if (replyBox.current && replyBoxBlend > 0) {
    const tx = clamp(replyBox.current.x, halfW, width - halfW);
    const ty = clamp(replyBox.current.y, halfH, height - halfH);
    trackX += tx * replyBoxBlend;
    trackY += ty * replyBoxBlend;
    trackW += replyBoxBlend;
  }

  if (latestMsg.current && msgBlend > 0) {
    const tx = clamp(latestMsg.current.x, halfW, width - halfW);
    const ty = clamp(latestMsg.current.y, halfH, height - halfH);
    trackX += tx * msgBlend;
    trackY += ty * msgBlend;
    trackW += msgBlend;
  }

  let focalX: number;
  let focalY: number;

  if (trackW > 0) {
    // Blend between static base and the weighted-average target
    const avgX = trackX / trackW;
    const avgY = trackY / trackW;
    const t = Math.min(1, trackW); // 0→1 as tracking engages
    focalX = staticFocalX + (avgX - staticFocalX) * t;
    focalY = staticFocalY + (avgY - staticFocalY) * t;
  } else {
    focalX = staticFocalX;
    focalY = staticFocalY;
  }

  // ── 3D tilt — kicks in during typing ───────────────────────────────────
  const tiltX = smooth([
    [0, 0],
    [170, 0],
    [220, 1.5],
    [350, 1.5],
    [430, 0.4],
  ]);

  const tiltY = smooth([
    [0, 0],
    [170, 0],
    [220, -0.8],
    [350, -0.8],
    [430, -0.2],
  ]);

  // ── Compute transform ──────────────────────────────────────────────────
  const offsetX = cx - focalX * zoom;
  const offsetY = cy - focalY * zoom;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Tilt layer — rotates around screen center */}
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
          {/* Zoom + pan layer */}
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
