"use client";

import { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { SideModal } from "@/app/(components)/sideModal/page";
import Meetings from "@/app/(activityComponents)/meetingsTab/page";
import { FaSearch } from "react-icons/fa";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function MeetingsTab({
  leadId,
  onAddActivity,
  data = [],
  searchTerm,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [meetingsData, setMeetingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("");
  const [location, setLocation] = useState("");
  const [reminder, setReminder] = useState("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setAttendees("");
    setLocation("");
    setReminder("");
    setNote("");
  };

  const fetchMeetings = async () => {
    if (!leadId) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/lead-meetings/${leadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch meetings");
      }

      const formattedMeetings = (result.data || []).map((item) => ({
        ...item,
        type: "meeting",
        date: item.start_date,
        time: item.start_time,
      }));

      setMeetingsData(formattedMeetings);
    } catch (error) {
      console.error("FETCH MEETINGS ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [leadId]);

  const handleSave = async () => {
    try {
      if (!leadId) {
        alert("Lead ID is missing");
        return;
      }

      if (!title || !date || !startTime || !endTime || !attendees) {
        alert("Title, date, start time, end time and attendees are required");
        return;
      }

      setSaving(true);

      const payload = {
        lead_id: leadId,
        title,
        start_date: date,
        start_time: startTime,
        end_time: endTime,
        attendees,
        location: location || null,
        reminder: reminder || null,
        note: note || null,
        created_by: null,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/lead-meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create meeting");
      }

      const newMeeting = {
        ...result.data,
        type: "meeting",
        date: result.data.start_date,
        time: result.data.start_time,
      };

      setMeetingsData((prev) => [newMeeting, ...prev]);

      if (onAddActivity) {
        onAddActivity(newMeeting);
      }

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("CREATE MEETING ERROR:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/lead-meetings/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete meeting");
      }

      setMeetingsData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("DELETE MEETING ERROR:", error);
      alert(error.message);
    }
  };

  const filteredMeetings = meetingsData.filter((item) => {
    const q = searchTerm?.toLowerCase()?.trim();
    if (!q) return true;

    return (
      item.title?.toLowerCase().includes(q) ||
      item.note?.toLowerCase().includes(q) ||
      item.attendees?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  const isSearching = searchTerm?.trim() !== "";

  const blurOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    zIndex: 1040,
    display: isOpen ? "block" : "none",
  };

  const mainContentStyle = {
    filter: isOpen ? "blur(5px)" : "none",
    transition: "filter 0.3s",
  };

  return (
    <>
      <div style={blurOverlayStyle} onClick={() => setIsOpen(false)} />

      <div style={mainContentStyle}>
        <div className="p-0">
          {loading ? (
            <div className="text-center py-4">Loading meetings...</div>
          ) : isSearching ? (
            filteredMeetings.length === 0 ? (
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
                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Try adjusting your search or use different keywords.
                </p>
              </div>
            ) : (
              <div
  style={{
    maxHeight: filteredMeetings.length > 5 ? "420px" : "auto",
    overflowY: filteredMeetings.length > 5 ? "auto" : "visible",
    paddingRight: filteredMeetings.length > 5 ? "6px" : "0px",
  }}
>
  <Meetings
    meetingsData={filteredMeetings}
    onCreateMeeting={() => setIsOpen(true)}
    onDeleteMeeting={handleDeleteMeeting}
  />
</div>
            )
          ) : meetingsData.length === 0 ? (
            <div
              className="text-center"
              style={{
                border: "2px dashed #d6dbe3",
                borderRadius: "10px",
                padding: "40px",
              }}
            >
              <p className="text-muted mb-3">No Meetings available.</p>

              <Button
                style={{
                  backgroundColor: "#5e4cf3",
                  border: "none",
                  padding: "6px 18px",
                  fontSize: "14px",
                }}
                onClick={() => setIsOpen(true)}
              >
                Schedule Meeting
              </Button>
            </div>
          ) : (
           <div
  style={{
    maxHeight: meetingsData.length > 5 ? "420px" : "auto",
    overflowY: meetingsData.length > 5 ? "auto" : "visible",
    paddingRight: meetingsData.length > 5 ? "6px" : "0px",
  }}
>
  <Meetings
    meetingsData={meetingsData}
    onCreateMeeting={() => setIsOpen(true)}
    onDeleteMeeting={handleDeleteMeeting}
  />
</div>
          )}
        </div>
      </div>

      <SideModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title="Schedule Meeting"
      >
        <div style={{ width: "100%", overflowX: "hidden", padding: "5px" }}>
          <Form
            className="d-flex flex-column h-100"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="flex-grow-1" style={{ paddingBottom: "100px" }}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold mb-1">
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter"
                  size="sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold mb-1">
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>

              <Row className="mb-2 g-2">
                <Col xs={6}>
                  <Form.Label className="small fw-bold mb-1">
                    Start Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    size="sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Col>

                <Col xs={6}>
                  <Form.Label className="small fw-bold mb-1">
                    End Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    size="sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </Col>
              </Row>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold mb-1">
                  Attendees <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter attendees"
                  size="sm"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold mb-1">Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter location"
                  size="sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold mb-1">Reminder</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter reminder"
                  size="sm"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold mb-1">Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                />
              </Form.Group>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                backgroundColor: "white",
                borderTop: "1px solid #eee",
                display: "flex",
                gap: "10px",
              }}
            >
              <Button
                type="button"
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                style={{ backgroundColor: "#5e4cf3", border: "none" }}
                className="w-100"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </Form>
        </div>
      </SideModal>
    </>
  );
}