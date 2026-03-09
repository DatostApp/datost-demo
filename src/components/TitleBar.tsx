import React from "react";

export const TitleBar: React.FC = () => {
  return (
    <div
      style={{
        height: 48,
        backgroundColor: "#1a1d21",
        display: "flex",
        alignItems: "center",
        paddingLeft: 16,
        paddingRight: 16,
        borderBottom: "1px solid #35373b",
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 10, marginLeft: 5 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#ff5f57",
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#febc2e",
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#28c840",
          }}
        />
      </div>

      {/* Navigation arrows */}
      <div
        style={{
          display: "flex",
          gap: 5,
          marginLeft: 20,
          color: "#9ea0a5",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="#9ea0a5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="#9ea0a5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Search bar */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        <div
          style={{
            width: 640,
            height: 34,
            backgroundColor: "#35373b",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ea0a5",
            fontSize: 17,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ marginRight: 6 }}
          >
            <circle cx="7" cy="7" r="5" stroke="#9ea0a5" strokeWidth="1.5" />
            <path
              d="M11 11L14 14"
              stroke="#9ea0a5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Search Datost
        </div>
      </div>

      {/* Right side avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: "#4a154b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        M
      </div>
    </div>
  );
};
