import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

interface TypingTextBoxProps {
  text: string;
  /** Frame when typing starts */
  startFrame: number;
  /** Base frames per character (lower = faster) */
  speed?: number;
  /** Frame when the text box clears (message sent) */
  clearFrame?: number;
}

// Generate a deterministic per-character delay map
// Varies speed subtly: pauses slightly after spaces/commas, faster mid-word
function buildCharTimings(text: string, baseSpeed: number): number[] {
  const timings: number[] = [];
  let accumulated = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prev = text[i - 1];

    let delay = baseSpeed;

    // Slightly faster mid-word
    if (char !== " " && prev && prev !== " " && prev !== ",") {
      delay *= 0.75 + Math.sin(i * 1.7) * 0.15;
    }

    // Small pause after commas
    if (prev === ",") {
      delay *= 1.8;
    }

    // Tiny variation after spaces (start of new word)
    if (prev === " ") {
      delay *= 1.1 + Math.sin(i * 2.3) * 0.15;
    }

    accumulated += delay;
    timings.push(accumulated);
  }

  return timings;
}

export const TypingTextBox: React.FC<TypingTextBoxProps> = ({
  text,
  startFrame,
  speed = 0.7,
  clearFrame,
}) => {
  const frame = useCurrentFrame();

  const timings = useMemo(() => buildCharTimings(text, speed), [text, speed]);

  if (frame < startFrame) return null;
  if (clearFrame !== undefined && frame >= clearFrame) return null;

  const elapsed = frame - startFrame;

  // Find how many chars should be visible based on timing
  let charsToShow = 0;
  for (let i = 0; i < timings.length; i++) {
    if (elapsed >= timings[i]) {
      charsToShow = i + 1;
    } else {
      break;
    }
  }

  const visibleText = text.slice(0, charsToShow);
  const doneTyping = charsToShow >= text.length;

  // Blinking caret — blink every 16 frames (~0.5s)
  const caretVisible = doneTyping ? Math.floor(frame / 16) % 2 === 0 : true;

  return (
    <span style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
      <span style={{ color: "#d1d2d3" }}>{visibleText}</span>
      {caretVisible && (
        <span
          style={{
            color: "#d1d2d3",
            fontWeight: 300,
          }}
        >
          |
        </span>
      )}
    </span>
  );
};
