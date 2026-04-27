"use client";
import { useState } from "react";

export default function Notes({ notes = [], onCreateNote = () => {} }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h5 style={{ fontWeight: "700", margin: 0 }}>Notes</h5>

        <button
          onClick={onCreateNote}
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
          Create Note
        </button>
      </div>

      {/* LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              border: "2px dashed #e2e8f0",
              borderRadius: "12px",
              color: "#64748b",
            }}
          >
            No notes available.
          </div>
        ) : (
          notes.map((note, index) => {
            const isOpen = expandedIndex === index;

            return (
              <div
                key={note.id || index}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                {/* HEADER */}
                <div
                  onClick={() => setExpandedIndex(isOpen ? null : index)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    cursor: "pointer",
                    backgroundColor: isOpen ? "#f8fafc" : "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#6366f1",
                        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "0.2s",
                      }}
                    >
                      ▼
                    </span>

                    <div style={{ fontSize: "13px" }}>
                      <strong>Note</strong>
                      <span style={{ color: "#64748b", marginLeft: "5px" }}>
                        by {note.user || "Unknown User"}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {formatDate(note.created_at)}
                  </span>
                </div>

                {/* EXPANDED CONTENT (single block only) */}
                {isOpen && (
                  <div style={{ padding: "0 40px 16px 40px" }}>
                    {/* Note Text */}
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#475569",
                        lineHeight: "1.6",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: note.text || "",
                      }}
                    />

                    {/* Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {note.attachments.map((file, i) => (
                          <img
                            key={i}
                            src={`http://localhost:7000/${file.file_path}`}
                            style={{
                              maxWidth: "200px",
                              borderRadius: "6px",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}