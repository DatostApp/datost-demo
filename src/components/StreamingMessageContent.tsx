import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { SpiderVerseMention } from "./SpiderVerseMention";

interface Segment {
  type: "text" | "mention" | "spiderverse";
  content: string;
}

interface StreamingMessageContentProps {
  segments: Segment[];
  startFrame: number;
  speed?: number;
  /** How long the spider-verse effect plays before text resumes */
  spiderverseDuration?: number;
}

function buildCharTimings(text: string, baseSpeed: number): number[] {
  const timings: number[] = [];
  let accumulated = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prev = text[i - 1];
    let delay = baseSpeed;
    if (char !== " " && prev && prev !== " " && prev !== ",") {
      delay *= 0.75 + Math.sin(i * 1.7) * 0.15;
    }
    if (prev === ",") delay *= 1.8;
    if (prev === " ") delay *= 1.1 + Math.sin(i * 2.3) * 0.15;
    accumulated += delay;
    timings.push(accumulated);
  }
  return timings;
}

export const StreamingMessageContent: React.FC<
  StreamingMessageContentProps
> = ({ segments, startFrame, speed = 0.7, spiderverseDuration = 30 }) => {
  const frame = useCurrentFrame();

  // Build a timeline: for each segment, compute when it starts/ends streaming
  const timeline = useMemo(() => {
    let currentOffset = 0;
    return segments.map((seg) => {
      const segStart = currentOffset;

      if (seg.type === "text" || seg.type === "mention") {
        const displayText = seg.type === "mention" ? `@${seg.content}` : seg.content;
        const timings = buildCharTimings(displayText, speed);
        const segDuration = timings.length > 0 ? timings[timings.length - 1] : 0;
        currentOffset += segDuration;
        return { ...seg, segStart, timings, segDuration, displayText };
      }

      // spiderverse: stream the text in, then pause for the animation
      const fullText = `@${seg.content}`;
      const timings = buildCharTimings(fullText, speed);
      const typeDuration = timings.length > 0 ? timings[timings.length - 1] : 0;
      const segDuration = typeDuration + spiderverseDuration;
      currentOffset += segDuration;
      return {
        ...seg,
        segStart,
        timings,
        typeDuration,
        segDuration,
        animationStartOffset: typeDuration,
      };
    });
  }, [segments, speed, spiderverseDuration]);

  if (frame < startFrame) return null;

  const elapsed = frame - startFrame;

  return (
    <span>
      {timeline.map((seg, idx) => {
        const segElapsed = elapsed - seg.segStart;

        if (segElapsed < 0) return null;

        if (seg.type === "text" || seg.type === "mention") {
          const displayText = (seg as { displayText?: string }).displayText ?? seg.content;
          let charsToShow = 0;
          for (let i = 0; i < seg.timings.length; i++) {
            if (segElapsed >= seg.timings[i]) {
              charsToShow = i + 1;
            } else {
              break;
            }
          }
          const doneTyping = charsToShow >= displayText.length;
          const useMentionStyle = seg.type === "mention" && doneTyping;
          const style = useMentionStyle ? {
            color: "#1d9bd1",
            backgroundColor: "rgba(29,155,209,0.1)",
            borderRadius: 3,
            padding: "0 2px",
            fontWeight: 500 as const,
          } : { color: "#d1d2d3" };
          return (
            <span key={idx} style={style}>
              {displayText.slice(0, charsToShow)}
            </span>
          );
        }

        // Spider-verse segment
        const fullText = `@${seg.content}`;
        let charsToShow = 0;
        for (let i = 0; i < seg.timings.length; i++) {
          if (segElapsed >= seg.timings[i]) {
            charsToShow = i + 1;
          } else {
            break;
          }
        }

        const doneTyping = charsToShow >= fullText.length;
        const animStartFrame =
          startFrame + seg.segStart + (seg as { typeDuration: number }).typeDuration;

        if (!doneTyping) {
          // Still streaming in — show as plain text, no mention styling
          return (
            <span key={idx} style={{ color: "#d1d2d3" }}>
              {fullText.slice(0, charsToShow)}
            </span>
          );
        }

        // Done typing — show SpiderVerse animation
        return (
          <SpiderVerseMention
            key={idx}
            text={seg.content}
            startFrame={animStartFrame}
            effectDuration={spiderverseDuration}
          />
        );
      })}
    </span>
  );
};
