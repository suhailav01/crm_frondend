"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Circle
} from "lucide-react";
const API = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function LeadActivityTimeline({ leadId, searchTerm = "" }) {
  const [activities, setActivities] = useState([]);
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId) return;

    const fetchAllActivities = async () => {
      try {
        setLoading(true);

        const [
          callsRes,
          emailsRes,
          meetingsRes,
          notesRes,
          tasksRes,
        ] = await Promise.all([
          fetch(`${API}/lead-calls/${leadId}`),
          fetch(`${API}/lead-emails/${leadId}`),
          fetch(`${API}/lead-meetings/${leadId}`),
          fetch(`${API}/leads-notes/${leadId}`),
          fetch(`${API}/lead-tasks/${leadId}`),
        ]);

        const [
          callsJson,
          emailsJson,
          meetingsJson,
          notesJson,
          tasksJson,
        ] = await Promise.all([
          callsRes.json(),
          emailsRes.json(),
          meetingsRes.json(),
          notesRes.json(),
          tasksRes.json(),
        ]);

        const calls = (callsJson.data || []).map((item) => ({
          id: `call-${item.id}`,
          rawId: item.id,
          type: "call",
          title: `Call with ${item.connected_to || "Unknown"}`,
          body: item.note || item.call_outcome || "Call activity",
          meta: item.call_outcome || "",
          date: mergeDateTime(item.call_date, item.call_time),
          displayDate: formatDateTime(item.call_date, item.call_time),
          sortDate: getDateObject(item.call_date, item.call_time),
        }));

        const emails = (emailsJson.data || []).map((item) => ({
          id: `email-${item.id}`,
          rawId: item.id,
          type: "email",
          title: item.subject || "Email",
          body: stripHtml(item.body || ""),
          meta: `To: ${item.recipients || "-"}`,
          date: item.created_at || "",
          displayDate: formatSingleDate(item.created_at),
          sortDate: getDateObject(item.created_at),
        }));

        const meetings = (meetingsJson.data || []).map((item) => ({
          id: `meeting-${item.id}`,
          rawId: item.id,
          type: "meeting",
          title: item.title || "Meeting",
          body:
            item.note ||
            `Attendees: ${item.attendees || "-"}${item.location ? ` | Location: ${item.location}` : ""}`,
          meta: item.reminder ? `Reminder: ${item.reminder}` : "",
          date: mergeDateTime(item.start_date, item.start_time),
          displayDate: formatDateTime(item.start_date, item.start_time),
          sortDate: getDateObject(item.start_date, item.start_time),
        }));

        const notes = (notesJson.data || []).map((item) => ({
          id: `note-${item.id}`,
          rawId: item.id,
          type: "note",
          title: `Note by ${item.created_by_name || "User"}`,
          body: stripHtml(item.note_text || ""),
          meta: "",
          date: item.created_at || "",
          displayDate: formatSingleDate(item.created_at),
          sortDate: getDateObject(item.created_at),
        }));

        const tasks = (tasksJson.data || []).map((item) => ({
          id: `task-${item.id}`,
          rawId: item.id,
          type: "task",
          title: item.task_name || "Task",
          body: item.note || "Task activity",
          meta: `${item.priority || "No Priority"}${item.task_type ? ` • ${item.task_type}` : ""}${item.status ? ` • ${item.status}` : ""}`,
          status: item.status || "Pending",
          date: mergeDateTime(item.due_date, item.due_time),
          displayDate: formatDateTime(item.due_date, item.due_time),
          sortDate: getDateObject(item.due_date, item.due_time),
        }));

        const merged = [...calls, ...emails, ...meetings, ...notes, ...tasks]
          .sort((a, b) => {
            const aTime = a.sortDate ? new Date(a.sortDate).getTime() : 0;
            const bTime = b.sortDate ? new Date(b.sortDate).getTime() : 0;
            return bTime - aTime;
          });

        setActivities(merged);

        const initialOpen = {};
        merged.forEach((item) => {
          initialOpen[item.id] = false;
        });
        setOpen(initialOpen);
      } catch (error) {
        console.error("FETCH ACTIVITY ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, [leadId]);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return activities;

    return activities.filter((item) => {
      return (
        item.title?.toLowerCase().includes(term) ||
        item.body?.toLowerCase().includes(term) ||
        item.meta?.toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term)
      );
    });
  }, [activities, searchTerm]);

  const toggle = (id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

const getTypeIcon = (type) => {
  const baseStyle =
  "flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 hover:bg-indigo-200";
  switch (type) {
    case "call":
      return (
        <div className={`${baseStyle} bg-indigo-100`}>
          <Phone className="w-4 h-4 text-indigo-600" />
        </div>
      );

    case "email":
      return (
        <div className={`${baseStyle} bg-indigo-100`}>
          <Mail className="w-4 h-4 text-indigo-600" />
        </div>
      );

    case "meeting":
      return (
        <div className={`${baseStyle} bg-indigo-100`}>
          <Calendar className="w-4 h-4 text-indigo-600" />
        </div>
      );

    case "note":
      return (
        <div className={`${baseStyle} bg-indigo-100`}>
          <FileText className="w-4 h-4 text-indigo-600" />
        </div>
      );

    case "task":
      return (
        <div className={`${baseStyle} bg-indigo-100`}>
          <CheckCircle className="w-4 h-4 text-indigo-600" />
        </div>
      );

    default:
      return (
        <div className={`${baseStyle} bg-gray-100`}>
          <Circle className="w-4 h-4 text-gray-400" />
        </div>
      );
  }
};
  const getTypeLabel = (type) => {
    switch (type) {
      case "call":
        return "Call";
      case "email":
        return "Email";
      case "meeting":
        return "Meeting";
      case "note":
        return "Note";
      case "task":
        return "Task";
      default:
        return "Activity";
    }
  };

  const isTaskOverdue = (item) => {
    if (item.type !== "task") return false;
    if (!item.sortDate) return false;
    if ((item.status || "").toLowerCase() === "completed") return false;

    return new Date(item.sortDate) < new Date();
  };

  return (
    <div className="p-0">
      {loading ? (
        <div className="text-center py-4">Loading activities...</div>
      ) : filteredActivities.length === 0 ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center"
          style={{ padding: "40px 20px" }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#f0eeff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            <FaSearch size={20} style={{ color: "#5e4cf3" }} />
          </div>

          <h6 className="fw-semibold mb-1">No activities found</h6>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Try adjusting your search or add a new activity.
          </p>
        </div>
      ) : (
        <div
          style={{
            maxHeight: "470px",
            overflowY: "auto",
            paddingRight: "6px",
          }}
        >
          {filteredActivities.map((item) => {
            const expanded = open[item.id];
            const overdue = isTaskOverdue(item);

            return (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "12px",
                  background: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex" style={{ gap: "10px", flex: 1 }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "#f3f0ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "4px",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "6px",
                        }}
                      >
                        {getTypeLabel(item.type)}
                        {item.meta ? ` • ${item.meta}` : ""}
                      </div>

                      {!expanded && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#4b5563",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.body || "No details available"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginLeft: "10px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: overdue ? "#ef4444" : "#6b7280",
                        fontWeight: overdue ? "600" : "400",
                      }}
                    >
                      {overdue ? "Overdue" : item.displayDate}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {expanded ? "▲" : "▼"}
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#4b5563",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.body || "No details available"}
                    </div>

                    {item.displayDate && (
                      <div
                        style={{
                          marginTop: "10px",
                          fontSize: "12px",
                          color: "#9ca3af",
                        }}
                      >
                        {item.displayDate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function mergeDateTime(date, time) {
  if (!date && !time) return "";
  if (date && time) return `${date}T${time}`;
  return date || "";
}

function getDateObject(date, time) {
  const value = mergeDateTime(date, time);
  if (!value) return null;

  const parsed = new Date(value);
  return parsed.toString() === "Invalid Date" ? null : parsed;
}

function formatDateTime(date, time) {
  const value = mergeDateTime(date, time);
  if (!value) return "";

  const parsed = new Date(value);
  if (parsed.toString() === "Invalid Date") return `${date || ""} ${time || ""}`.trim();

  return parsed.toLocaleString();
}

function formatSingleDate(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (parsed.toString() === "Invalid Date") return value;

  return parsed.toLocaleString();
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}