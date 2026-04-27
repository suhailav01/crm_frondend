"use client";
import { useState } from "react";

export default function Calls({
  calls = [],
  onCreateCall,
  onMakePhoneCall,
}) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "ringing":
        return "#f59e0b"; // yellow
      case "in-progress":
      case "answered":
        return "#10b981"; // green
      case "completed":
        return "#3b82f6"; // blue
      case "failed":
      case "busy":
      case "no-answer":
      case "canceled":
        return "#ef4444"; // red
      case "initiated":
      default:
        return "#64748b"; // gray
    }
  };

  const formatDuration = (durationSeconds, fallbackDuration) => {
    if (durationSeconds === null || durationSeconds === undefined) {
      return fallbackDuration || "—";
    }

    const totalSeconds = Number(durationSeconds);

    if (Number.isNaN(totalSeconds)) {
      return fallbackDuration || "—";
    }

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins > 0) {
      return `${mins} min ${secs}s`;
    }

    return `${secs}s`;
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER ALWAYS VISIBLE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <h5 style={{ fontWeight: "700", margin: 0, color: "#1e293b" }}>
          Calls
        </h5>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={onMakePhoneCall}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Make a Phone Call
          </button>

          
        </div>
      </div>

      {/* EMPTY STATE */}
      {calls.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            border: "2px dashed #e2e8f0",
            borderRadius: "12px",
            background: "#fff",
          }}
        >
          <p style={{ color: "#64748b", marginBottom: "16px" }}>
            No Calls available.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {calls.map((call, index) => (
            <div
              key={call.id || index}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                background: "#fff",
                padding: "16px",
              }}
            >
              <div
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                  <span
                    style={{
                      color: "#6366f1",
                      transform:
                        expandedIndex === index
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      transition: "0.2s",
                      flexShrink: 0,
                    }}
                  >
                    ▼
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ color: "#1e293b" }}>Call</strong> from{" "}
                      {call.user}

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: getStatusColor(call.call_status),
                          color: "#fff",
                          textTransform: "capitalize",
                        }}
                      >
                        {call.call_status || "initiated"}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        marginTop: "4px",
                        marginBottom: 0,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {call.summary}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {call.date}
                </span>
              </div>

              {expandedIndex === index && (
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "20px",
                    paddingLeft: "25px",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      Outcome
                    </label>
                    <div
                      style={{
                        padding: "8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {call.outcome || "Connected"}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      Duration
                    </label>
                    <div
                      style={{
                        padding: "8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {formatDuration(call.duration_seconds, call.duration)} 🕒
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      Call Status
                    </label>
                    <div
                      style={{
                        padding: "8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginTop: "5px",
                        textTransform: "capitalize",
                      }}
                    >
                      {call.call_status || "initiated"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}