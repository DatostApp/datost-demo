import React from "react";

const SidebarIcon: React.FC<{
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}> = ({ label, active, icon }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: "4px 0",
      cursor: "pointer",
      opacity: active ? 1 : 0.7,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: 12, color: active ? "#fff" : "#9ea0a5" }}>
      {label}
    </span>
  </div>
);

const ChannelItem: React.FC<{
  name: string;
  active?: boolean;
  prefix?: string;
  unread?: boolean;
}> = ({ name, active, prefix = "#", unread }) => (
  <div
    style={{
      padding: "5px 20px 5px 16px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      backgroundColor: active ? "#1164a3" : "transparent",
      borderRadius: 8,
      marginLeft: 10,
      marginRight: 10,
      cursor: "pointer",
      fontWeight: unread ? 700 : 400,
      color: active ? "#fff" : unread ? "#d1d2d3" : "#9ea0a5",
      fontSize: 18,
    }}
  >
    <span style={{ fontSize: 17, opacity: 0.7, width: 18, textAlign: "center" }}>
      {prefix}
    </span>
    <span
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  </div>
);

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      padding: "16px 20px 5px 26px",
      fontSize: 17,
      color: "#9ea0a5",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3 2L7 5L3 8" fill="#9ea0a5" />
      </svg>
      <span>{label}</span>
    </div>
  </div>
);

const DMItem: React.FC<{
  name: string;
  online?: boolean;
  isYou?: boolean;
}> = ({ name, online, isYou }) => (
  <div
    style={{
      padding: "5px 20px 5px 16px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginLeft: 10,
      marginRight: 10,
      borderRadius: 8,
      cursor: "pointer",
      color: "#9ea0a5",
      fontSize: 18,
    }}
  >
    <div style={{ position: "relative", width: 26, height: 26 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 5,
          backgroundColor: "#5b5e63",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "#fff",
          fontWeight: 600,
        }}
      >
        {name[0]}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#2bac76",
            border: "2px solid #1a1d21",
          }}
        />
      )}
    </div>
    <span>
      {name}
      {isYou && (
        <span style={{ opacity: 0.5, fontSize: 15, marginLeft: 5 }}>you</span>
      )}
    </span>
  </div>
);

export const Sidebar: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Icon rail */}
      <div
        style={{
          width: 72,
          backgroundColor: "#1a1d21",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 8,
          gap: 2,
          borderRight: "1px solid #35373b",
        }}
      >
        {/* Workspace icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: "#4a154b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 10,
          }}
        >
          D
        </div>

        <SidebarIcon
          label="Home"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 8L10 3L17 8V17H12V12H8V17H3V8Z"
                stroke="#9ea0a5"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <SidebarIcon
          label="DMs"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="2"
                y="4"
                width="16"
                height="12"
                rx="2"
                stroke="#9ea0a5"
                strokeWidth="1.5"
              />
              <path
                d="M2 7L10 12L18 7"
                stroke="#9ea0a5"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <SidebarIcon
          label="Activity"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="#9ea0a5" strokeWidth="1.5" />
              <path
                d="M10 6V10L13 13"
                stroke="#9ea0a5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <SidebarIcon
          label="More"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="5" cy="10" r="1.5" fill="#9ea0a5" />
              <circle cx="10" cy="10" r="1.5" fill="#9ea0a5" />
              <circle cx="15" cy="10" r="1.5" fill="#9ea0a5" />
            </svg>
          }
        />
      </div>

      {/* Channel list */}
      <div
        style={{
          width: 320,
          backgroundColor: "#1a1d21",
          borderRight: "1px solid #35373b",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Workspace header */}
        <div
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #35373b",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 21, color: "#fff" }}>
            Datost
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          <SectionHeader label="Channels" />
          <ChannelItem name="general" active />
          <ChannelItem name="cs-renewals" />
          <ChannelItem name="all-datost" />
          <ChannelItem name="social" />

          <SectionHeader label="Engineering" />
          <ChannelItem name="datadog-alerts" />
          <ChannelItem name="debugging" />
          <ChannelItem name="linear-updates" />

          <SectionHeader label="Direct messages" />
          <DMItem name="Jason" online />
          <DMItem name="Maceo" isYou online />
        </div>

        {/* Bottom items */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #35373b",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "5px 10px",
              color: "#9ea0a5",
              fontSize: 18,
              borderRadius: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="1"
                y="1"
                width="14"
                height="14"
                rx="3"
                stroke="#9ea0a5"
                strokeWidth="1.5"
              />
              <path
                d="M8 5V11M5 8H11"
                stroke="#9ea0a5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Apps
          </div>
        </div>
      </div>
    </div>
  );
};
