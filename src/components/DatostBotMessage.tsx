import React from "react";
import {
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";

interface DatostBotMessageProps {
  startFrame: number;
  phase2Frame: number;
  cycle1Frame: number;
  tool1DoneFrame: number;
  tool2DoneFrame: number;
  cycle2Frame: number;
  finalResponseFrame: number;
}

/** Spinning SVG circle used for tool execution items */
const ToolSpinner: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = (frame * 10) % 360;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        transform: `rotate(${rotation}deg)`,
        flexShrink: 0,
      }}
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="#7c7e83"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="18 14"
        strokeLinecap="round"
      />
    </svg>
  );
};

const TABLE_DATA = [
  {
    account: "Rivian",
    tier: "Enterprise",
    arr: "$340K",
    usage90d: "12,400 sessions",
    usageNow: "3,470",
    change: "-72%",
    negative: true,
  },
  {
    account: "Plaid",
    tier: "Enterprise",
    arr: "$285K",
    usage90d: "8,900 sessions",
    usageNow: "3,740",
    change: "-58%",
    negative: true,
  },
  {
    account: "Brex",
    tier: "Growth",
    arr: "$112K",
    usage90d: "3,200 sessions",
    usageNow: "1,470",
    change: "-54%",
    negative: true,
  },
  {
    account: "Lattice",
    tier: "Growth",
    arr: "$98K",
    usage90d: "2,100 sessions",
    usageNow: "1,260",
    change: "-40%",
    negative: true,
  },
  {
    account: "Ramp",
    tier: "Growth",
    arr: "$145K",
    usage90d: "4,600 sessions",
    usageNow: "4,140",
    change: "-10%",
    negative: true,
  },
  {
    account: "Notion",
    tier: "Enterprise",
    arr: "$410K",
    usage90d: "18,300 sessions",
    usageNow: "19,100",
    change: "+4%",
    negative: false,
  },
];

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

const DataTable: React.FC = () => (
  <div style={{ overflowX: "auto", margin: "8px 0" }}>
    <table
      style={{ width: "100%", borderCollapse: "collapse", borderSpacing: 0 }}
    >
      <thead>
        <tr>
          <th style={thStyle}>Account</th>
          <th style={thStyle}>Tier</th>
          <th style={thStyle}>ARR</th>
          <th style={thStyle}>Usage (90d ago)</th>
          <th style={thStyle}>Usage (now)</th>
          <th style={thStyle}>Change</th>
        </tr>
      </thead>
      <tbody>
        {TABLE_DATA.map((row) => (
          <tr key={row.account}>
            <td style={{ ...tdStyle, fontWeight: 600 }}>{row.account}</td>
            <td style={tdStyle}>{row.tier}</td>
            <td style={tdStyle}>{row.arr}</td>
            <td style={tdStyle}>{row.usage90d}</td>
            <td style={tdStyle}>{row.usageNow}</td>
            <td
              style={{
                ...tdStyle,
                color: row.negative ? "#e0564f" : "#2bac76",
                fontWeight: 600,
              }}
            >
              {row.change}
            </td>
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

export const DatostBotMessage: React.FC<DatostBotMessageProps> = ({
  startFrame,
  phase2Frame,
  cycle1Frame,
  tool1DoneFrame,
  tool2DoneFrame,
  cycle2Frame,
  finalResponseFrame,
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
            <span>2 tools executed</span>
            <span>•</span>
            <span>✅</span><span style={{ marginLeft: 4 }}>2 succeeded</span>
            <span>•</span>
            <span>🔴</span><span style={{ marginLeft: 4 }}>1,557ms total</span>
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
            38 accounts are up for renewal in April. Most look healthy — but{" "}
            <strong>4 accounts stand out with major usage drops:</strong>
          </div>

          <DataTable />

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
            Rivian is down 72% — that&apos;s a serious red flag for a $340K
            account. Plaid and Brex are also trending the wrong way. I&apos;d
            prioritize these for outreach this week.
          </div>

          {/* Sources */}
          <div style={{ fontSize: 11, color: "#9ea0a5", marginBottom: 3 }}>
            Sources:{" "}
            <span style={{ color: "#7c7e83" }}>Datost Prod (postgresql)</span>
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
            9:44 PM
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <ActionButton><span>📋</span><span style={{ marginLeft: 4 }}>View Full Response</span></ActionButton>
            <ActionButton><span>🔁</span><span style={{ marginLeft: 4 }}>Run Again</span></ActionButton>
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
            <span
              style={{ fontWeight: 600, fontSize: 13, color: "#d1d2d3" }}
            >
              Cycle 2
            </span>
            <span>🕐</span>
          </div>
          <ToolItem
            text="Renewal accounts with 90-day usage comparison"
            done
            timing="761.6ms"
            startFrame={0}
          />
          <ToolItem
            text="Get renewal accounts and usage change"
            done
            startFrame={0}
          />
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
            <span
              style={{ fontWeight: 600, fontSize: 13, color: "#d1d2d3" }}
            >
              Cycle 1
            </span>
            <span>🕐</span>
          </div>
          <ToolItem
            text="Renewal accounts with 90-day usage comparison"
            done={frame >= tool1DoneFrame}
            timing={frame >= tool1DoneFrame ? "761.6ms" : undefined}
            startFrame={cycle1Frame + 5}
          />
          <ToolItem
            text="Get renewal accounts and usage change"
            done={frame >= tool2DoneFrame}
            startFrame={tool1DoneFrame + 8}
          />
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
          <span style={{ flexShrink: 0 }}>🔄</span>
          <span>Querying your data sources...</span>
        </div>
      );
    }

    // Phase 1: Looking into that...
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
        <span style={{ flexShrink: 0 }}>🤔</span>
        <span>Looking into that...</span>
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
