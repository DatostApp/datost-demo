import React, { useMemo } from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

// --- Public types for configuring content ---

export interface TableColumn {
  key: string;
  header: string;
  /** Optional: highlight negative/positive values in this column */
  colorize?: boolean;
}

export interface TableRow {
  [key: string]: string | boolean | undefined;
  /** If true, colorized columns render red; if false, green */
  negative?: boolean;
}

export interface ToolCall {
  name: string;
  timing?: string;
}

export interface Attachment {
  type: "file" | "link";
  name: string;
  description?: string;
  url?: string;
  /** For rich file previews: "excel" | "pdf" */
  fileType?: "excel" | "pdf";
  /** Display title (shown large in the preview card) */
  title?: string;
  /** Preview table data for Excel-type attachments */
  previewRows?: string[][];
  /** Preview table headers for Excel-type attachments */
  previewHeaders?: string[];
  /** Preview image path (use staticFile) for PDF previews */
  previewImage?: string;
}

// --- Streaming segment types ---

export type StreamSegment =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "paragraph" }
  | { type: "blockquote"; content: string; style?: React.CSSProperties }
  | { type: "table" }
  | { type: "image"; src: string }
  | { type: "attachments" };

export interface BotResponseContent {
  /** Stats line, e.g. "2 tools executed" */
  statsText: string;
  statsSucceeded: string;
  statsTime: string;
  /** Streamable content segments (primary content source) */
  streamContent: StreamSegment[];
  /** Chars per frame for streaming speed (default 3.5) */
  streamSpeed?: number;
  /** Table columns and rows (referenced by { type: "table" } segments) */
  tableColumns?: TableColumn[];
  tableRows?: TableRow[];
  /** Optional file/link attachments (referenced by { type: "attachments" } segments) */
  attachments?: Attachment[];
  /** Data source label */
  source: string;
  /** Timestamp shown on the final response */
  timestamp: string;
}

export interface DatostBotMessageProps {
  // --- Timing ---
  startFrame: number;
  cycle1Frame: number;
  /** Per-tool done frames — one entry per tool */
  toolDoneFrames: number[];
  cycle2Frame: number;
  finalResponseFrame: number;

  // --- Content ---
  /** Tool calls shown during cycle phases */
  tools?: ToolCall[];
  /** If tools list is truncated, show "and N more" */
  additionalToolCount?: number;
  /** Final response content */
  response: BotResponseContent;
}

// --- Internal sub-components ---

const thStyle: React.CSSProperties = {
  padding: "5px 6px",
  fontSize: 11,
  fontWeight: 600,
  color: "#9ea0a5",
  borderBottom: "1px solid #4a4a4d",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "4px 6px",
  fontSize: 11,
  color: "#d1d2d3",
  borderBottom: "1px solid rgba(53,55,59,0.5)",
  whiteSpace: "nowrap",
};

const DataTable: React.FC<{
  columns: TableColumn[];
  rows: TableRow[];
}> = ({ columns, rows }) => (
  <div style={{ overflowX: "auto", margin: "8px 0" }}>
    <table
      style={{ width: "100%", borderCollapse: "collapse", borderSpacing: 0 }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={thStyle}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col, ci) => {
              const val = row[col.key] as string;
              const isFirst = ci === 0;
              const shouldColorize = col.colorize && val;
              return (
                <td
                  key={col.key}
                  style={{
                    ...tdStyle,
                    fontWeight: isFirst || shouldColorize ? 600 : undefined,
                    color: shouldColorize
                      ? row.negative
                        ? "#e0564f"
                        : "#2bac76"
                      : undefined,
                  }}
                >
                  {val}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ToolItem: React.FC<{
  text: string;
  done: boolean;
  timing?: string;
  startFrame: number;
}> = ({ text, done, timing, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame) return null;

  const fadeIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.3 },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 0",
        fontSize: 13,
        opacity: interpolate(fadeIn, [0, 1], [0, 1]),
      }}
    >
      {done ? (
        <span style={{ fontSize: 13, flexShrink: 0 }}>✅</span>
      ) : (
        <span style={{ fontSize: 13, flexShrink: 0 }}>⏳</span>
      )}
      <span style={{ color: "#d1d2d3" }}>{text}</span>
      {done && timing && (
        <span style={{ color: "#7c7e83", fontSize: 11 }}>({timing})</span>
      )}
    </div>
  );
};

const ActionButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      backgroundColor: "transparent",
      border: "1px solid #35373b",
      borderRadius: 6,
      padding: "5px 12px",
      color: "#1d9bd1",
      fontSize: 12,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// --- Main component ---

// --- Excel file icon (green "X") ---
const ExcelIcon: React.FC = () => (
  <div
    style={{
      width: 38,
      height: 38,
      borderRadius: 6,
      backgroundColor: "#1D6F42",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <span style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>X</span>
  </div>
);

// --- PDF file icon (red document) ---
const PdfIcon: React.FC = () => (
  <div
    style={{
      width: 38,
      height: 38,
      borderRadius: 6,
      backgroundColor: "#D93025",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>PDF</span>
  </div>
);

// --- Mini spreadsheet preview ---
const SpreadsheetPreview: React.FC<{
  headers?: string[];
  rows?: string[][];
}> = ({ headers, rows }) => {
  if (!headers || !rows) return null;

  // Color coding based on risk level in last column
  const getRiskColor = (risk: string): string => {
    if (risk.includes("Critical")) return "rgba(224,86,79,0.15)";
    if (risk.includes("High")) return "rgba(255,165,0,0.12)";
    if (risk.includes("Moderate")) return "rgba(255,255,0,0.08)";
    if (risk.includes("Low")) return "rgba(43,172,118,0.1)";
    return "transparent";
  };

  const getRiskTextColor = (risk: string): string => {
    if (risk.includes("Critical")) return "#e0564f";
    if (risk.includes("High")) return "#e8963e";
    if (risk.includes("Moderate")) return "#c9b458";
    if (risk.includes("Low")) return "#2bac76";
    return "#666";
  };

  return (
    <div
      style={{
        backgroundColor: "#fafafa",
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: "6px 4px",
        overflow: "hidden",
      }}
    >
      <div style={{ transform: "scale(0.92)", transformOrigin: "top left", width: "108%" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 8,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "3px 4px",
                  fontSize: 7,
                  fontWeight: 700,
                  color: "#fff",
                  backgroundColor: "#4472C4",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  borderRight: "1px solid #3a63a8",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const riskVal = row[row.length - 1] || "";
            const bgColor = getRiskColor(riskVal);
            return (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isRiskCol = ci === row.length - 1;
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: "2px 4px",
                        fontSize: 7,
                        color: isRiskCol ? getRiskTextColor(cell) : "#333",
                        fontWeight: isRiskCol || ci === 0 ? 600 : 400,
                        backgroundColor: bgColor,
                        borderBottom: "1px solid #e0e0e0",
                        borderRight: "1px solid #e8e8e8",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

// --- PDF document preview (uses actual image, clipped like Slack) ---
const PdfPreview: React.FC<{ previewImage?: string }> = ({ previewImage }) => {
  if (!previewImage) return null;
  return (
    <div
      style={{
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fafafa",
        maxHeight: 120,
      }}
    >
      <img
        src={previewImage}
        style={{
          width: "100%",
          display: "block",
        }}
      />
    </div>
  );
};

// --- Rich file preview card ---
const FilePreviewCard: React.FC<{ attachment: Attachment }> = ({
  attachment,
}) => {
  const isExcel = attachment.fileType === "excel";
  const isPdf = attachment.fileType === "pdf";
  const label = isExcel ? "Excel Spreadsheet" : isPdf ? "PDF" : "File";
  const displayTitle = attachment.title || attachment.name;

  return (
    <div style={{ margin: "6px 0" }}>
      {/* Section label */}
      <div
        style={{
          fontSize: 12,
          color: "#d1d2d3",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 9, color: "#9ea0a5" }}>▼</span>
      </div>

      {/* Preview card */}
      <div
        style={{
          border: "1px solid #35373b",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#1a1d21",
          maxWidth: 380,
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
          }}
        >
          {isExcel ? <ExcelIcon /> : <PdfIcon />}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#d1d2d3",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayTitle}
            </div>
            <div style={{ fontSize: 11, color: "#9ea0a5", marginTop: 1 }}>
              {label}
            </div>
          </div>
        </div>

        {/* Preview content */}
        {isExcel && (
          <SpreadsheetPreview
            headers={attachment.previewHeaders}
            rows={attachment.previewRows?.slice(0, 6)}
          />
        )}
        {isPdf && <PdfPreview previewImage={attachment.previewImage} />}
      </div>
    </div>
  );
};

// --- Simple attachment card (for links and generic files) ---
const AttachmentCard: React.FC<{ attachment: Attachment }> = ({
  attachment,
}) => {
  // Use rich preview for Excel/PDF files
  if (attachment.fileType === "excel" || attachment.fileType === "pdf") {
    return <FilePreviewCard attachment={attachment} />;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        border: "1px solid #35373b",
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.02)",
        margin: "8px 0",
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {attachment.type === "file" ? "📎" : "🔗"}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: attachment.type === "link" ? "#1d9bd1" : "#d1d2d3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {attachment.name}
        </div>
        {attachment.description && (
          <div style={{ fontSize: 11, color: "#9ea0a5", marginTop: 1 }}>
            {attachment.description}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Streaming content renderer ---

interface SegmentTiming {
  segment: StreamSegment;
  charStart: number; // cumulative char offset where this segment starts
  charCount: number; // number of chars in this segment (0 for non-text)
}

const StreamingContent: React.FC<{
  segments: StreamSegment[];
  charsRevealed: number;
  tableColumns?: TableColumn[];
  tableRows?: TableRow[];
  attachments?: Attachment[];
}> = ({ segments, charsRevealed, tableColumns, tableRows, attachments }) => {
  // Build timing map
  const timings = useMemo<SegmentTiming[]>(() => {
    let offset = 0;
    return segments.map((seg) => {
      const charCount =
        seg.type === "text" || seg.type === "bold"
          ? seg.content.length
          : seg.type === "blockquote"
            ? seg.content.length
            : 0;
      const timing = { segment: seg, charStart: offset, charCount };
      offset += charCount;
      return timing;
    });
  }, [segments]);

  const elements: React.ReactNode[] = [];
  let paragraphChildren: React.ReactNode[] = [];
  let paragraphKey = 0;

  const flushParagraph = () => {
    if (paragraphChildren.length > 0) {
      elements.push(
        <div
          key={`p-${paragraphKey++}`}
          style={{
            fontSize: 14,
            color: "#d1d2d3",
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          {paragraphChildren}
        </div>
      );
      paragraphChildren = [];
    }
  };

  for (let i = 0; i < timings.length; i++) {
    const { segment, charStart, charCount } = timings[i];

    // How many chars into this segment are we?
    const charsIntoSeg = Math.max(0, charsRevealed - charStart);
    if (charsIntoSeg <= 0 && charCount > 0) break; // haven't reached this text yet
    // For non-text segments, they appear once all preceding text is revealed
    if (charCount === 0 && charsRevealed < charStart) break;

    switch (segment.type) {
      case "text": {
        const shown = Math.min(charsIntoSeg, charCount);
        paragraphChildren.push(
          <span key={`t-${i}`}>{segment.content.slice(0, shown)}</span>
        );
        break;
      }
      case "bold": {
        const shown = Math.min(charsIntoSeg, charCount);
        paragraphChildren.push(
          <strong key={`b-${i}`}>{segment.content.slice(0, shown)}</strong>
        );
        break;
      }
      case "paragraph": {
        flushParagraph();
        break;
      }
      case "blockquote": {
        flushParagraph();
        const shown = Math.min(charsIntoSeg, charCount);
        elements.push(
          <div
            key={`bq-${i}`}
            style={{
              margin: "0 0 8px",
              padding: "6px 10px",
              borderLeft: "3px solid #4a4a4d",
              color: "#b5b7bb",
              fontSize: 13,
              fontStyle: "italic",
              ...(segment.style || {}),
            }}
          >
            {segment.content.slice(0, shown)}
          </div>
        );
        break;
      }
      case "table": {
        flushParagraph();
        if (tableColumns && tableRows) {
          elements.push(
            <DataTable
              key={`tbl-${i}`}
              columns={tableColumns}
              rows={tableRows}
            />
          );
        }
        break;
      }
      case "image": {
        flushParagraph();
        elements.push(
          <img
            key={`img-${i}`}
            src={segment.src}
            style={{
              width: "100%",
              borderRadius: 6,
              margin: "8px 0",
            }}
          />
        );
        break;
      }
      case "attachments": {
        flushParagraph();
        if (attachments) {
          attachments.forEach((att, ai) => {
            elements.push(<AttachmentCard key={`att-${ai}`} attachment={att} />);
          });
        }
        break;
      }
    }
  }

  // Flush any remaining inline content
  flushParagraph();

  return <>{elements}</>;
};

// Compute total char count for a segment array
function totalStreamChars(segments: StreamSegment[]): number {
  return segments.reduce((sum, seg) => {
    if (seg.type === "text" || seg.type === "bold" || seg.type === "blockquote")
      return sum + seg.content.length;
    return sum;
  }, 0);
}

export const DatostBotMessage: React.FC<DatostBotMessageProps> = ({
  startFrame,
  cycle1Frame,
  toolDoneFrames,
  cycle2Frame,
  finalResponseFrame,
  tools = [],
  additionalToolCount,
  response,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame) return null;

  const enterProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.6 },
  });

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const translateY = interpolate(enterProgress, [0, 1], [20, 0]);

  // Determine current phase — goes straight to tool execution
  const isFinal = frame >= finalResponseFrame;
  const isCycle2 = !isFinal && frame >= cycle2Frame;

  const renderPhaseContent = () => {
    if (isFinal) {
      const elapsed = frame - finalResponseFrame;
      const speed = response.streamSpeed ?? 3.5;
      const charsRevealed = Math.floor(elapsed * speed);
      const total = totalStreamChars(response.streamContent);
      const streamDone = charsRevealed >= total;

      // Stats line fades in immediately
      const statsFade = spring({
        frame: elapsed,
        fps,
        config: { damping: 18, stiffness: 120, mass: 0.5 },
      });

      // Footer fades in after streaming completes
      const footerDelay = 5;
      const footerFade = streamDone
        ? spring({
            frame: Math.max(0, elapsed - Math.ceil(total / speed) - footerDelay),
            fps,
            config: { damping: 18, stiffness: 120, mass: 0.5 },
          })
        : 0;

      return (
        <div>
          {/* Stats line */}
          <div
            style={{
              fontSize: 12,
              color: "#9ea0a5",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexWrap: "wrap",
              opacity: interpolate(statsFade, [0, 1], [0, 1]),
            }}
          >
            <span>{response.statsText}</span>
            <span>•</span>
            <span>✅</span>
            <span style={{ marginLeft: 4 }}>{response.statsSucceeded}</span>
            <span>•</span>
            <span>⏱️</span>
            <span style={{ marginLeft: 4 }}>{response.statsTime}</span>
          </div>

          {/* Streaming content */}
          <StreamingContent
            segments={response.streamContent}
            charsRevealed={charsRevealed}
            tableColumns={response.tableColumns}
            tableRows={response.tableRows}
            attachments={response.attachments}
          />

          {/* Footer: sources, disclaimer, timestamp, buttons */}
          {streamDone && (
            <div style={{ opacity: interpolate(footerFade, [0, 1], [0, 1]) }}>
              <div style={{ fontSize: 11, color: "#9ea0a5", marginBottom: 3 }}>
                Sources:{" "}
                <span style={{ color: "#7c7e83" }}>{response.source}</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#7c7e83",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>⚡</span>
                <span>AI-generated response</span>
                <span>•</span>
                <span>Verify critical information</span>
              </div>
              <div style={{ fontSize: 12, color: "#616061", marginBottom: 8 }}>
                {response.timestamp}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <ActionButton>
                  <span>📋</span>
                  <span style={{ marginLeft: 4 }}>View Full Response</span>
                </ActionButton>
                <ActionButton>
                  <span>🔁</span>
                  <span style={{ marginLeft: 4 }}>Run Again</span>
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isCycle2) {
      return (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13, color: "#d1d2d3" }}>
              Cycle 2
            </span>
            <span>🕐</span>
          </div>
          {tools.map((tool, i) => (
            <ToolItem
              key={i}
              text={tool.name}
              done
              timing={tool.timing}
              startFrame={0}
            />
          ))}
          {additionalToolCount !== undefined && additionalToolCount > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "#7c7e83",
                padding: "3px 0",
                marginLeft: 19,
              }}
            >
              and {additionalToolCount} more ✅
            </div>
          )}
        </div>
      );
    }

    // Tool execution phase (cycle1 — default before cycle2/final)
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 13, color: "#d1d2d3" }}>
            Cycle 1
          </span>
          <span>🕐</span>
        </div>
        {tools.map((tool, i) => {
          const doneFrame = toolDoneFrames[i] ?? toolDoneFrames[toolDoneFrames.length - 1];
          const toolStartFrame =
            i === 0
              ? cycle1Frame + 5
              : (toolDoneFrames[i - 1] ?? cycle1Frame) + 8;
          return (
            <ToolItem
              key={i}
              text={tool.name}
              done={frame >= doneFrame}
              timing={frame >= doneFrame ? tool.timing : undefined}
              startFrame={toolStartFrame}
            />
          );
        })}
        {additionalToolCount !== undefined && additionalToolCount > 0 && (
          <div
            style={{
              fontSize: 12,
              color: "#7c7e83",
              padding: "3px 0",
              marginLeft: 19,
            }}
          >
            and {additionalToolCount} more...
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 0",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Datost Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "#f0ebe4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={staticFile("datost-icon.svg")}
          alt="Datost"
          style={{ width: 30, height: 30 }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name / badges / timestamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: "#d1d2d3" }}>
            Datost
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#9ea0a5",
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "1px 5px",
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            APP
          </span>
          <span style={{ fontSize: 12, color: "#616061" }}>Just now</span>
        </div>

        {/* Phase content */}
        {renderPhaseContent()}
      </div>
    </div>
  );
};
