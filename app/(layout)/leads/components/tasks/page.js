"use client";
import { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { SideModal } from "@/app/(components)/sideModal/page";
import Tasks from "@/app/(activityComponents)/tasksTab/page";
import { FaSearch } from "react-icons/fa";

export default function TasksTab({
  onAddActivity,
  data = [],
  searchTerm,
  leadId,
  leadOwner,
  users = [],
  currentUser,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasksData, setTasksData] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (leadId) fetchTasks();
  }, [leadId]);

  useEffect(() => {
    if (!isAdmin && currentUser?.id) {
      setAssignedTo([currentUser.id]);
    }
  }, [isAdmin, currentUser]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-tasks/${leadId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("API did not return JSON");
      }

      const result = await res.json();
      console.log("LEAD TASKS API RESPONSE:", result);

      if (!res.ok) throw new Error(result.message || "Failed to fetch tasks");

      const mapped = (result.data || []).map((item) => ({
        id: item.id,
        task_name: item.task_name,
        assigned_users: item.assigned_users || [],
        created_by_name: item.created_by_name || "Unknown",
        due_date: item.due_date || "",
        due_time: item.due_time || "",
        priority: item.priority || "",
        task_type: item.task_type || "",
        note: item.note || "",
        status: item.status || "Pending",
      }));

      setTasksData(mapped);
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err);
      setTasksData([]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (
        !title.trim() ||
        !date ||
        !time ||
        !type ||
        !priority ||
        !description.trim()
      ) {
        alert("Please fill all required fields");
        return;
      }

      const finalAssignedTo = isAdmin ? assignedTo : [user?.id];

      if (!Array.isArray(finalAssignedTo) || finalAssignedTo.length === 0) {
        alert("Please select at least one assignee");
        return;
      }

      const payload = {
        lead_id: Number(leadId),
        task_name: title,
        due_date: date,
        due_time: time,
        task_type: type,
        priority,
        assigned_to: finalAssignedTo,
        note: description || null,
        status: "Pending",
        created_by: user?.id || null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("API did not return JSON");
      }

      const result = await res.json();
      console.log("CREATE LEAD TASK RESPONSE:", result);

      if (!res.ok) throw new Error(result.message || "Failed to create task");

      await fetchTasks();

      setTitle("");
      setDate("");
      setTime("");
      setType("");
      setPriority("");
      setDescription("");
      setAssignedTo(isAdmin ? [] : user?.id ? [user.id] : []);
      setIsOpen(false);
    } catch (err) {
      console.error("CREATE TASK ERROR:", err);
      alert(err.message || "Failed to create task");
    }
  };

  const filteredTasks = tasksData.filter((item) => {
    const term = searchTerm?.toLowerCase().trim();
    if (!term) return true;

    const ownerNames =
      item.assigned_users?.map((user) => user.name).join(", ").toLowerCase() || "";

    return (
      (item.task_name || "").toLowerCase().includes(term) ||
      (item.note || "").toLowerCase().includes(term) ||
      ownerNames.includes(term) ||
      (item.task_type || "").toLowerCase().includes(term) ||
      (item.priority || "").toLowerCase().includes(term) ||
      (item.status || "").toLowerCase().includes(term)
    );
  });

  const isSearching = searchTerm?.trim() !== "";

  const blurOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    zIndex: 1040,
    display: isOpen ? "block" : "none",
  };

  const mainContentStyle = {
    filter: isOpen ? "blur(4px)" : "none",
    pointerEvents: isOpen ? "none" : "auto",
    transition: "filter 0.3s ease",
  };

  return (
    <>
      <div style={blurOverlayStyle} onClick={() => setIsOpen(false)} />

      <div style={mainContentStyle}>
        <div
          className="p-0"
          style={{
            maxHeight: "450px",
            overflowY: "auto",
            paddingRight: "5px",
          }}
        >
          {isSearching ? (
            filteredTasks.length === 0 ? (
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

                <h6 className="fw-semibold mb-1">No results found</h6>

                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Try adjusting your search or use different keywords.
                </p>
              </div>
            ) : (
              <Tasks tasks={filteredTasks} onCreateTask={() => setIsOpen(true)} />
            )
          ) : tasksData.length === 0 ? (
            <div
              className="text-center"
              style={{
                border: "2px dashed #d6dbe3",
                borderRadius: "10px",
                padding: "40px",
              }}
            >
              <p className="text-muted mb-3">No Tasks available.</p>

              <Button
                style={{
                  backgroundColor: "#5e4cf3",
                  border: "none",
                  padding: "6px 18px",
                  fontSize: "14px",
                }}
                onClick={() => setIsOpen(true)}
              >
                Create Task
              </Button>
            </div>
          ) : (
            <Tasks tasks={tasksData} onCreateTask={() => setIsOpen(true)} />
          )}
        </div>
      </div>

      <SideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Task"
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "5px",
            }}
          >
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Task Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label className="small fw-bold">
                    Due Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Col>

                <Col>
                  <Form.Label className="small fw-bold">
                    Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Label className="small fw-bold">
                    Task Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Choose</option>
                    <option value="To-Do">To-Do</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Follow Up">Follow Up</option>
                  </Form.Select>
                </Col>

                <Col>
                  <Form.Label className="small fw-bold">
                    Priority <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="">Choose</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Assigned to <span className="text-danger">*</span>
                </Form.Label>

                {isAdmin ? (
                  <div
                    style={{
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      padding: "10px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      background: "#fff",
                    }}
                  >
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`lead-task-user-${user.id}`}
                            checked={assignedTo.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedTo((prev) => [...prev, user.id]);
                              } else {
                                setAssignedTo((prev) =>
                                  prev.filter((id) => id !== user.id)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`lead-task-user-${user.id}`}
                          >
                            {user.first_name} {user.last_name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted mb-0">No users found</p>
                    )}
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    value={`${currentUser?.first_name || ""} ${currentUser?.last_name || ""
                      }`}
                    readOnly
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Note <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
            </Form>
          </div>

          <div
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button
              style={{
                backgroundColor: "#5e4cf3",
                border: "none",
              }}
              className="w-100"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </SideModal>
    </>
  );
}
