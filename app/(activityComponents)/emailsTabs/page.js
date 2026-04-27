"use client";
import { useState } from "react";

export default function Emails({ emails = [], onCreateEmail }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER ALWAYS VISIBLE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h5 style={{ fontWeight: "700", margin: 0 }}>Emails</h5>

        <button
          onClick={onCreateEmail}
          style={{
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Create Email
        </button>
      </div>

      {/* EMPTY STATE */}
      {emails.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            border: "2px dashed #e2e8f0",
            borderRadius: "12px",
          }}
        >
          <p style={{ color: "#64748b" }}>No Emails available.</p>
        </div>
      ) : (
        <>
          {/* DATE LABEL */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#64748b",
              marginBottom: "15px",
            }}
          >
            June 2025
          </div>

          {/* EMAIL LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {emails.map((email, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedIndex(isExpanded ? null : index)
                    }
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: isExpanded ? "#f8fafc" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          color: "#6366f1",
                          fontSize: "10px",
                          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "0.2s",
                        }}
                      >
                        ▼
                      </span>

                      <div style={{ fontSize: "13px" }}>
                        <strong style={{ color: "#1e293b" }}>
                          Logged Email - {email.subject}
                        </strong>
                        <span style={{ color: "#64748b", marginLeft: "5px" }}>
                          by {email.senderName}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {email.date}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "0 45px 20px 45px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: "15px",
                        }}
                      >
                        To {email.recipient}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#334155",
                          lineHeight: "1.6",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {email.body}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}