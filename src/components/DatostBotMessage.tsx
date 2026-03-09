import React from "react";
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

export interface BotResponseContent {
  /** Stats line, e.g. "2 tools executed" */
  statsText: string;
  statsSucceeded: string;
  statsTime: string;
  /** Main response paragraph (can include JSX) */
  responseText: React.ReactNode;
  /** Table columns and rows (optional — omit for no table) */
  tableColumns?: TableColumn[];
  tableRows?: TableRow[];
  /** Analysis paragraph below the table */
  analysisText: React.ReactNode;
  /** Data source label */
  source: string;
  /** Timestamp shown on the final response */
  timestamp: string;
}

export interface DatostBotMessageProps {
  // --- Timing ---
  startFrame: number;
  phase2Frame: number;
  cycle1Frame: number;
  tool1DoneFrame: number;
  tool2DoneFrame: number;
  cycle2Frame: number;
  finalResponseFrame: number;

  // --- Content ---
  /** Phase 1 loading text (default: "Looking into that...") */
  phase1Text?: string;
  /** Phase 1 emoji (default: "🤔") */
  phase1Emoji?: string;
  /** Phase 2 loading text (default: "Querying your data sources...") */
  phase2Text?: string;
  /** Phase 2 emoji (default: "🔄") */
  phase2Emoji?: string;
  /** Tool calls shown during cycle phases */
  tools?: ToolCall[];
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

export const DatostBotMessage: React.FC<DatostBotMessageProps> = ({
  startFrame,
  phase2Frame,
  cycle1Frame,
  tool1DoneFrame,
  tool2DoneFrame,
  cycle2Frame,
  finalResponseFrame,
  phase1Text = "Looking into that...",
  phase1Emoji = "🤔",
  phase2Text = "Querying your data sources...",
  phase2Emoji = "🔄",
  tools = [],
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

  // Determine current phase
  const isFinal = frame >= finalResponseFrame;
  const isCycle2 = !isFinal && frame >= cycle2Frame;
  const isCycle1 = !isFinal && !isCycle2 && frame >= cycle1Frame;
  const isQuerying = !isFinal && !isCycle2 && !isCycle1 && frame >= phase2Frame;

  const renderPhaseContent = () => {
    if (isFinal) {
      const finalFade = spring({
        frame: frame - finalResponseFrame,
        fps,
        config: { damping: 18, stiffness: 120, mass: 0.5 },
      });
      const finalOpacity = interpolate(finalFade, [0, 1], [0, 1]);

      return (
        <div style={{ opacity: finalOpacity }}>
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
            }}
          >
            <span>{response.statsText}</span>
            <span>•</span>
            <span>✅</span>
            <span style={{ marginLeft: 4 }}>{response.statsSucceeded}</span>
            <span>•</span>
            <span>🔴</span>
            <span style={{ marginLeft: 4 }}>{response.statsTime}</span>
          </div>

          {/* Main response text */}
          <div
            style={{
              fontSize: 14,
              color: "#d1d2d3",
              lineHeight: 1.5,
              marginBottom: 6,
            }}
          >
            {response.responseText}
          </div>

          {/* Table (optional) */}
          {response.tableColumns && response.tableRows && (
            <DataTable
              columns={response.tableColumns}
              rows={response.tableRows}
            />
          )}

          {/* Analysis */}
          <div
            style={{
              fontSize: 14,
              color: "#d1d2d3",
              lineHeight: 1.5,
              marginTop: 4,
              marginBottom: 10,
            }}
          >
            {response.analysisText}
          </div>

          {/* Sources */}
          <div style={{ fontSize: 11, color: "#9ea0a5", marginBottom: 3 }}>
            Sources:{" "}
            <span style={{ color: "#7c7e83" }}>{response.source}</span>
          </div>

          {/* Disclaimer */}
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

          {/* Timestamp */}
          <div style={{ fontSize: 12, color: "#616061", marginBottom: 8 }}>
            {response.timestamp}
          </div>

          {/* Action buttons */}
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
        </div>
      );
    }

    if (isCycle1) {
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
            const toolDoneFrame =
              i === 0 ? tool1DoneFrame : tool2DoneFrame;
            const toolStartFrame =
              i === 0 ? cycle1Frame + 5 : tool1DoneFrame + 8;
            return (
              <ToolItem
                key={i}
                text={tool.name}
                done={frame >= toolDoneFrame}
                timing={frame >= toolDoneFrame ? tool.timing : undefined}
                startFrame={toolStartFrame}
              />
            );
          })}
        </div>
      );
    }

    if (isQuerying) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#9ea0a5",
            fontSize: 14,
          }}
        >
          <span style={{ flexShrink: 0 }}>{phase2Emoji}</span>
          <span>{phase2Text}</span>
        </div>
      );
    }

    // Phase 1
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#9ea0a5",
          fontSize: 14,
        }}
      >
        <span style={{ flexShrink: 0 }}>{phase1Emoji}</span>
        <span>{phase1Text}</span>
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
