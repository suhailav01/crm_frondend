"use client";
import { useState } from "react";

export default function Activity({ activities = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "note":
        return "bi bi-pencil-square";
      case "email":
        return "bi bi-envelope";
      case "call":
        return "bi bi-telephone";
      case "task":
        return "bi bi-check2-square";
      case "meeting":
        return "bi bi-calendar3";
      default:
        return "bi bi-circle-fill";
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "note":
        return "#8b5cf6";
      case "email":
        return "#6366f1";
      case "call":
        return "#10b981";
      case "task":
        return "#f59e0b";
      case "meeting":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const renderMainContent = (item) => {
    const htmlContent = item.title || "";

    if (item.type === "note") {
      return (
        <div
          style={{
            fontWeight: "600",
            fontSize: "13px",
            color: "#1e293b",
            lineHeight: "1.5",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          dangerouslySetInnerHTML={{
            __html: htmlContent,
          }}
        />
      );
    }

    return (
      <div
        style={{
          fontWeight: "600",
          fontSize: "13px",
          color: "#1e293b",
          lineHeight: "1.5",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {htmlContent}
      </div>
    );
  };

  const renderExpandedContent = (item) => {
    const content =
      item.details || item.message || "More details about this activity...";

    if (item.type === "note") {
      return (
        <div
          style={{
            lineHeight: "1.6",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      );
    }

    return content;
  };

  const upcomingActivities = activities.slice(0, 2);
  const remainingActivities = activities.slice(2);

  return (
    <>
      <h6
        style={{
          fontWeight: "700",
          fontSize: "15px",
          marginBottom: "16px",
        }}
      >
        Upcoming
      </h6>

      {upcomingActivities.length === 0 ? (
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: "10px",
            padding: "18px",
            background: "#fff",
            color: "#64748b",
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          No activity available.
        </div>
      ) : (
        upcomingActivities.map((item, index) => (
          <div
            key={`${item.type}-${item.id}-upcoming-${index}`}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "10px",
              background: "#fff",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
  
 
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    minWidth: "32px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: getIconColor(item.type),
                    fontSize: "14px",
                  }}
                >
                  <i className={getActivityIcon(item.type)}></i>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {renderMainContent(item)}

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      marginTop: "2px",
                    }}
                  >
                    <span style={{ color: "#4977d3", fontWeight: "500" }}>
                      {item.user}
                    </span>{" "}
                    {item.type === "note" ? null : item.message}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  whiteSpace: "nowrap",
                }}
              >
                {item.date}
              </div>
            </div>
          </div>
        ))
      )}

      {remainingActivities.length > 0 && (
        <>
          <h6
            style={{
              fontWeight: "700",
              fontSize: "15px",
              margin: "20px 0 12px",
            }}
          >
            June 2025
          </h6>

          {remainingActivities.map((item, index) => {
            const actualIndex = index + 2;
            const isOpen = openIndex === actualIndex;

            return (
              <div
                key={`${item.type}-${item.id}-remaining-${actualIndex}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => toggleItem(actualIndex)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px",
                    cursor: "pointer",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        color: "#6366f1",
                        fontSize: "12px",
                        marginTop: "8px",
                        flexShrink: 0,
                      }}
                    >
                      {isOpen ? "▼" : "▶"}
                    </span>

                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        minWidth: "32px",
                        borderRadius: "8px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: getIconColor(item.type),
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      <i className={getActivityIcon(item.type)}></i>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      {renderMainContent(item)}

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#475569",
                          marginTop: "2px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <span style={{ color: "#4977d3", fontWeight: "500" }}>
                          {item.user}
                        </span>{" "}
                        {item.type === "note" ? null : item.message}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.date}
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: "12px 14px 12px 58px",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "13px",
                      color: "#334155",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {renderExpandedContent(item)}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}