"use client";
import { useState } from "react";

export default function Tasks({ tasks = [], onCreateTask = () => {} }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  const toggleComplete = (index) => {
    if (completedTasks.includes(index)) {
      setCompletedTasks(completedTasks.filter((i) => i !== index));
    } else {
      setCompletedTasks([...completedTasks, index]);
    }
  };

  const formatAssignedUsers = (assignedUsers) => {
    if (!Array.isArray(assignedUsers) || assignedUsers.length === 0) {
      return "Unassigned";
    }
    return assignedUsers.map((user) => user.name).join(", ");
  };

  const formatDueDateTime = (dueDate, dueTime) => {
    if (!dueDate && !dueTime) return "-";
    if (dueDate && dueTime) return `${dueDate} ${dueTime}`;
    return dueDate || dueTime || "-";
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          border: "2px dashed #e2e8f0",
          borderRadius: "12px",
        }}
      >
        <p style={{ color: "#64748b" }}>No Tasks available.</p>
        <button
          onClick={onCreateTask}
          style={{
            background: "#6366f1",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          + Add your first task
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h5
          style={{
            fontWeight: "700",
            fontSize: "18px",
            margin: 0,
            color: "#334155",
          }}
        >
          Tasks
        </h5>
        <button
          onClick={onCreateTask}
          style={{
            backgroundColor: "#5c59e8",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Create Task
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {tasks.map((task, index) => {
          const isExpanded = expandedIndex === index;
          const isCompleted =
            completedTasks.includes(index) || task.status === "Completed";

          return (
            <div
              key={task.id || index}
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: "10px",
                background: "#fff",
                padding: "16px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
                  <span
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    style={{
                      color: "#6366f1",
                      cursor: "pointer",
                      fontSize: "12px",
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`bi ${
                        isExpanded ? "bi-chevron-down" : "bi-chevron-right"
                      }`}
                    ></i>
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        marginBottom: "8px",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong style={{ color: "#334155", fontWeight: "700" }}>
                        Task
                      </strong>{" "}
                      assigned to {formatAssignedUsers(task.assigned_users)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        onClick={() => toggleComplete(index)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: isCompleted
                            ? "none"
                            : "2px solid #cbd5e1",
                          borderRadius: "50%",
                          cursor: "pointer",
                          backgroundColor: isCompleted
                            ? "#22c55e"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted && (
                          <i
                            className="bi bi-check"
                            style={{ fontSize: "14px" }}
                          ></i>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: isCompleted ? "#94a3b8" : "#6366f1",
                          textDecoration: isCompleted
                            ? "line-through"
                            : "none",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {task.task_name || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    flexWrap: "wrap",
                  }}
                >
                  <i
                    className="bi bi-calendar-event"
                    style={{ color: "#ef4444", fontSize: "14px" }}
                  ></i>
                  <span style={{ fontWeight: "500", color: "#ef4444" }}>
                    Due :
                  </span>
                  <span style={{ color: "#64748b" }}>
                    {formatDueDateTime(task.due_date, task.due_time)}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      background: "#eff6ff",
                      borderRadius: "8px",
                      padding: "16px 20px",
                      display: "flex",
                      gap: "30px",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Due Date & Time
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {formatDueDateTime(task.due_date, task.due_time)}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Priority
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {task.priority || "High"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Type
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {task.task_type || "To-Do"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Status
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {task.status || "Pending"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      lineHeight: "1.6",
                      margin: 0,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: task.note || "<p>No note available</p>",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}