"use client";

import { useParams } from "next/navigation";
import { Container, Row, Col, Nav, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import styles from "../deals.module.css";
import { useEffect, useState, useRef } from "react";

import DetailsInfoSidebar from "../../../(components)/detailsinfosidebar/page";
import DetailsRightSidebar from "../../../(components)/detailsrightsidebar/page";

import ReusableModal from "../../../(activityComponents)/reusableModal/page";

import Activity from "../../../(activityComponents)/activityTabs/page";
import Notes from "../../../(activityComponents)/notesTabs/page";
import Emails from "../../../(activityComponents)/emailsTabs/page";
import Calls from "../../../(activityComponents)/callsTabs/page";
import Tasks from "../../../(activityComponents)/tasksTab/page";
import MeetingsTab from "../../../(activityComponents)/meetingsTab/page";
import toast, { Toaster } from "react-hot-toast";

import EmojiPicker from "emoji-picker-react";

export default function DealDetails() {
  const { id } = useParams();
  const params = useParams();
  const dealId = params.id;

  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const [showEmoji, setShowEmoji] = useState(false);

  const [dealData, setDealData] = useState(null);



  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:7000/api/v1/deals/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        console.log("DEAL DETAILS RESULT:", result);

        if (res.ok && result.success) {
          setDealData(result.data);
          console.log(result.data);
        }
      } catch (err) {
        console.error("Error fetching deal:", err);
      }
    };

    if (id) fetchDeal();
  }, [id]);

  //-----------------------------------------------------------------------

  //  CREATE NOTE
 const fetchNotes = async () => {
  try {
    const res = await fetch(`http://localhost:7000/api/v1/deal/notes/${id}`);
    const result = await res.json();

    if (result.success) {
      const formatted = result.data.map((note) => ({
        id: note.id,
         text: note.note_text, // 🔥 FIX
        user: note.created_by_name || "User", // 🔥 FIX
        created_at: note.created_at,
      }));

      setNotes(formatted);
    }
  } catch (err) {
    console.error(err);
  }
};



  useEffect(() => {
    if (id) fetchNotes();
  }, [id]);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch("http://localhost:7000/api/v1/deal/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: id,
          note_text: newNote,
        }),
      });

      const result = await res.json();

     if (result.success) {
  setNotes((prev) => [result.data, ...prev]); // 🔥 instant UI update

  await fetchNotes(); // optional (sync with DB)

  fetchActivities();

  setNewNote("");
  setShowNoteModal(false);
}
    } catch (err) {
      console.error(err);
    }
  };

  //----------------------------------------------------------------------------
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:7000/api/v1/deal/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: dealId,
          recipients: emailForm.recipient,
          cc: emailForm.cc || null,
          bcc: emailForm.bcc || null,
          subject: emailForm.subject,
          body: emailForm.body,
          sent_by: 1,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Email sent successfully ");

        //  UI update (IMPORTANT)
        setEmails((prev) => [data.data, ...prev]);

        // reset
        setEmailForm({
          recipient: "",
          cc: "",
          bcc: "",
          subject: "",
          body: "",
        });

        setShowEmailModal(false);
      } else {
        toast.error(data.message || "Failed ");
      }
    } catch (error) {
      console.error("EMAIL ERROR:", error);
      toast.error("Something went wrong ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dealId) return;

    const fetchEmails = async () => {
      try {
        const res = await fetch(
          `http://localhost:7000/api/v1/deal/emails/${dealId}`,
        );

        const result = await res.json();

        if (result.success) {
          setEmails(result.data);
        }
      } catch (err) {
        console.error("EMAIL FETCH ERROR:", err);
      }
    };

    fetchEmails();
  }, [dealId]);

  //-----------------------------------------------------------------------------

  const [showCallingModal, setShowCallingModal] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState(null);

  const [calls, setCalls] = useState([]);

  const [callForm, setCallForm] = useState({
    connected_to: "",
    note: "",
    call_outcome: "Connected",
    date: "",
    time: "",
  });

  const [showCallModal, setShowCallModal] = useState(false);

  const formattedCalls = calls.map((call) => ({
    user: call.created_by_name || "User",
    summary: call.note || call.call_outcome,
    date: new Date(call.created_at).toLocaleString(),

    //  extra fields
    outcome: call.call_outcome,
    duration: call.duration_seconds || "—",
  }));
  const fetchCalls = async () => {
    try {
      const res = await fetch(
        `http://localhost:7000/api/v1/deal/calls/${dealId}`,
      );
      const data = await res.json();

      if (data.success) {
        setCalls(data.data);
      }
    } catch (err) {
      console.error("FETCH CALLS ERROR:", err);
    }
  };

  useEffect(() => {
    if (dealId) fetchCalls();
  }, [dealId]);

  const handleOpenCallModal = () => {
    setCallForm({
      connected_to: dealData?.phone_number || "",
      note: "",
      call_outcome: "Connected",
      date: "",
      time: "",
    });

    setShowCallModal(true);
  };


  const handleMakeCall = async () => {

 const phone =
  dealData?.owners?.[0]?.phone_number ||
  dealData?.lead_phone_number;

  if (!phone) {
    toast.error("Owner phone number missing ❌");
    return;
  }

  try {
    setLoading(true);

    setShowCallingModal(true);
    setCallStatus("calling");
    setCallDuration(0);

    const res = await fetch(
      "http://localhost:7000/api/v1/deal/calls/make-call",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: dealId,
          customer_phone: phone, // 🔥 owner phone
          created_by: 1,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setCurrentCallSid(data.data.twilio_sid);
      setCallStatus("initiated");
      pollCallStatus();
    } else {
      setCallStatus("failed");
    }
  } catch (err) {
    console.error(err);
    setCallStatus("failed");
  } finally {
    setLoading(false);
  }
};




  const handleLogCall = async () => {
    try {
      const res = await fetch("http://localhost:7000/api/v1/deal/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: dealId,
          connected_to: callForm.connected_to,
          call_outcome: callForm.call_outcome,
          note: callForm.note,
          created_by: 1,

          call_date: callForm.date || now.toISOString().split("T")[0],
          call_time: callForm.time || now.toTimeString().split(" ")[0],

          phone_number: callForm.connected_to,
          twilio_sid: null,
          call_status: "completed",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowCallModal(false);
        fetchCalls();
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndCall = async () => {
    if (!currentCallSid) return;

    try {
      await fetch(
        `http://localhost:7000/api/v1/deal/calls/end-call/${currentCallSid}`,
        {
          method: "POST",
        },
      );

      setCallStatus("completed");
      setShowCallingModal(false);
      fetchCalls();
    } catch (err) {
      console.error(err);
    }
  };

  //--------------------------------------------------------------------------
  const inputStyle = {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #e2e8f0",
    padding: "8px 4px",
    fontSize: "13px",
    outline: "none",
  };

  //-------------------------------------------------------------------------

  //images videos uploaded

  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);


const handleFileChange = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const newFiles = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
    type: file.type,
  }));

  setAttachments((prev) => [...prev, ...newFiles]);

  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deal_id", dealId);
    formData.append("uploaded_by", 1); // 🔥 FIX

    try {
      const res = await fetch(
        "http://localhost:7000/api/v1/deal/attachments/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok || !data) {
  throw new Error(data?.message || "Upload failed");
}

      toast.success(file.name + " uploaded ✅");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      toast.error(file.name + " failed ❌");
    }
  }

  e.target.value = "";
};


 const handleAddClick = () => {
  fileInputRef.current.click();
};

  //-----------------------------------------------------------------------
  const [allActivities, setAllActivities] = useState([]);

  const fetchActivities = async () => {
    const res = await fetch(`http://localhost:7000/api/v1/deal/activity/${id}`);
    const data = await res.json();

    if (data.success) {
      const formatted = data.data.map((item) => ({
        type: item.type,
        title: item.title,
        message: item.subtitle,
        user: item.user_name,
        date: new Date(item.created_at).toLocaleString(),
      }));

      setAllActivities(formatted);
    }
  };

  useEffect(() => {
    if (id) fetchActivities();
  }, [id]);

  //-----------------------------------------------------------------------

  //  NOTES STATE
  const [notes, setNotes] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  //----------------------------------------------------------------------------

  const [showEmailModal, setShowEmailModal] = useState(false);

  const [emailForm, setEmailForm] = useState({
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const handleOpenEmailModal = () => {
    setEmailForm({
      recipient: dealData?.lead_email || "",
      cc: "",
      bcc: "",
      subject: dealData?.deal_name ? `Regarding ${dealData.deal_name}` : "",
      body: `Hi ${dealData?.first_name || ""},

`,
    });

    setShowEmailModal(true);
  };
  //-------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [taskForm, setTaskForm] = useState({
    task_name: "",
    due_date: "",
    due_time: "",
    task_type: "",
    priority: "",
    note: "",
  });

  const handleSaveTask = async () => {
    try {
      const res = await fetch("http://localhost:7000/api/v1/deal/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal_id: dealId,
          task_name: taskForm.task_name,
          due_date: taskForm.due_date,
          due_time: taskForm.due_time,
          task_type: taskForm.task_type,
          priority: taskForm.priority,
          note: taskForm.note,
          created_by: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Task created successfully");

      setShowTaskModal(false);

      fetchTasks(); //refresh list
      fetchActivities();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `http://localhost:7000/api/v1/deal/tasks/${dealId}`,
      );
      const data = await res.json();

      setTasks(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [dealId]);

  //----------------------------------------------------------------------------

  const [meetings, setMeetings] = useState([]);

  const fetchMeetings = async () => {
    try {
      const res = await fetch(
        `http://localhost:7000/api/v1/deal/meetings/${dealId}`,
      );

      const data = await res.json();

      if (data.success) {
        setMeetings(data.data);
      }
    } catch (err) {
      console.error("FETCH MEETING ERROR:", err);
    }
  };

  useEffect(() => {
    if (dealId) fetchMeetings();
  }, [dealId]);

  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
    location: "",
    note: "",
  });

  //-----------------------------------------------------------------------------------
  const handleUpdateDeal = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:7000/api/v1/deals/${dealId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dealData,
          deal_owner: Number(updatedData.owner),
          priority: updatedData.priority,
          created_at: updatedData.createdDate,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");

        // 🔥 UI refresh
        setDealData(data.data);
      } else {
        toast.error("Update failed ❌");
      }
    } catch (err) {
      toast.error("Error ❌");
    }
  };
  //----------------------------------------------------------------------------
  //TAB STATE
  const tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];
  const [activeTab, setActiveTab] = useState("Activity");

  //  SEARCH
  const [search, setSearch] = useState("");

  if (!dealData) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  //---------------------------------------------------------------------

  const filteredActivities = allActivities.filter((item) => {
    const text = search.toLowerCase();

    return (
      item.title?.toLowerCase().includes(text) ||
      item.message?.toLowerCase().includes(text) ||
      item.user?.toLowerCase().includes(text) ||
      item.type?.toLowerCase().includes(text)
    );
  });

  //---------------------------------------------------------------------

  //  TAB SWITCH
  const renderContent = () => {
    switch (activeTab) {
      case "Activity":
        return (
          <Activity activities={search ? filteredActivities : allActivities} />
        );

      case "Notes":
        return (
          <Notes notes={notes} onCreateNote={() => setShowNoteModal(true)} />
        );

      case "Emails":
        return (
          <>
            {/*EMAILS COMPONENT */}
            <Emails
              emails={emails}
              onCreateEmail={handleOpenEmailModal}
            />
          </>
        );

      case "Calls":
        return (
          <Calls
            calls={formattedCalls}
            onCreateCall={handleOpenCallModal}
            onMakePhoneCall={handleMakeCall}
          />
        );

      case "Tasks":
        return (
          <Tasks tasks={tasks} onCreateTask={() => setShowTaskModal(true)} />
        );

      case "Meetings":
        return (
          <MeetingsTab
            meetingsData={meetings}
            onCreateMeeting={() => setShowMeetingModal(true)}
          />
        );

      default:
        return null;
    }
  };

  //--------------------------------------------------------------

  const handleEmojiClick = (emojiData) => {
    setEmailForm({
      ...emailForm,
      body: emailForm.body + emojiData.emoji,
    });
  };

  //------------------------------------------------
   console.log("DEAL OWNER DATA:", dealData?.owners);
  return (
    <div className={styles.pageWrapper1}>
      <Toaster position="top-right" />
      <Container fluid className={styles.mainContainer}>
        <Row className="mb-3">
          <Col className="d-flex align-items-center gap-2 text-muted small">
            <span
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => window.history.back()}
            >
              ← Deals
            </span>
          </Col>
        </Row>

        <Row className="mt-3">
          {/* LEFT */}
          <Col lg={3} md={4}>
            <DetailsInfoSidebar
              deal={dealData}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSaveEdit={handleUpdateDeal}
            />
          </Col>
          {/* CENTER */}

          <Col lg={6} md={8}>
            {/*  SEARCH */}
            <div className="position-relative mb-4">
              <FaSearch
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={14}
              />
              <Form.Control
                type="text"
                placeholder="Search activities"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-5 bg-light border-0 py-2 rounded-2"
              />
            </div>

            {/*  TABS */}
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-bottom mb-4"
              style={{ gap: "20px" }}
            >
              {tabs.map((tab) => (
                <Nav.Item key={tab}>
                  <Nav.Link
                    eventKey={tab}
                    className={`px-0 border-0 fw-bold ${activeTab === tab
                      ? "text-primary border-bottom border-primary border-3"
                      : "text-muted"
                      }`}
                    style={{ background: "transparent" }}
                  >
                    {tab}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            {/*  TAB CONTENT */}
            {renderContent()}

            {activeTab === "Activity" && (
              <div className={styles.infoBox}>
                <p className={styles.infoText}>
                  This deal was created for{" "}
                  <strong>
                    {dealData?.owners?.length
                      ? dealData.owners.map((u) => `${u.first_name} ${u.last_name}`).join(", ")
                      : "No Owner"}
                  </strong>{" "}
                  on {dealData.date || "-"}
                </p>
              </div>
            )}
          </Col>

          {/* RIGHT */}
          <Col lg={3} md={12}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              onChange={handleFileChange}
            />

            <DetailsRightSidebar onAddClick={handleAddClick} />

            {attachments.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "6px",
                  }}
                >
                  Recently uploaded
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {attachments.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px",
                        background: "#f1f5f9",
                        borderRadius: "8px",
                        position: "relative",
                      }}
                    >
                      {/* THUMBNAIL */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          background: "#e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.type.startsWith("image") && (
                          <img
                            src={item.preview}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        {item.type.startsWith("video") && (
                          <video
                            src={item.preview}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>

                      {/* TEXT */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "#1e293b",
                          }}
                        >
                          {item.file.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {new Date().toLocaleString()}
                        </div>
                      </div>

                      {/* DELETE */}
                      <div
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#64748b",
                        }}
                      >
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/*  NOTE MODAL */}
      <ReusableModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Create Note"
        onSave={handleCreateNote}
        type="right"
      >
        <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
          {/* Label Section */}
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#444" }}
            >
              Note <span style={{ color: "#ef4444" }}>*</span>
            </label>
          </div>

          {/* Editor Container */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            {/* Toolbar*/}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#fcfcfc",
              }}
            >
              {/* Text Dropdown */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#333",
                }}
              >
                Normal text <span style={{ fontSize: "10px" }}>▼</span>
              </div>

              {/* Vertical Divider */}
              <div
                style={{
                  width: "1px",
                  height: "18px",
                  backgroundColor: "#e2e8f0",
                }}
              ></div>

              {/* Icons Group */}
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  color: "#555",
                  fontSize: "15px",
                }}
              >
                <b style={{ cursor: "pointer" }}>B</b>
                <i style={{ cursor: "pointer", fontFamily: "serif" }}>I</i>
                <u style={{ cursor: "pointer" }}>U</u>
              </div>

              <div
                style={{
                  width: "1px",
                  height: "18px",
                  backgroundColor: "#e2e8f0",
                }}
              ></div>

              {/* List Icons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                <span style={{ cursor: "pointer" }}>≡</span>
                <span style={{ cursor: "pointer" }}>≣</span>
                <span style={{ cursor: "pointer", fontSize: "14px" }}>🖼️</span>
              </div>
            </div>

            {/* Input Area */}
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter"
              style={{
                width: "100%",
                height: "180px",
                padding: "12px",
                border: "none",
                outline: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                resize: "none",
                color: "#333",
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>
      </ReusableModal>

      {/* //--------------------------------------------------------- */}

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setShowEmailModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(6px)",
              zIndex: 9998,
            }}
          />

          {/* MODAL */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "550px",
              background: "#fff",
              borderRadius: "8px",
              zIndex: 9999,
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "#387be6",
                color: "#fff",
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>New Message</span>
              <span
                onClick={() => setShowEmailModal(false)}
                style={{ cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </span>
            </div>

            {/* BODY */}
            <div>
              {/* TO */}
              <div
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ width: "70px", color: "#888" }}>To</span>
                <input
                  value={emailForm.recipient}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, recipient: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>

              {/* CC */}
              <div
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ width: "70px", color: "#888" }}>CC</span>
                <input
                  value={emailForm.cc}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, cc: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>

              {/* BCC */}
              <div
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ width: "70px", color: "#888" }}>BCC</span>
                <input
                  value={emailForm.bcc}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, bcc: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>

              {/* SUBJECT */}
              <div
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ width: "70px", color: "#888" }}>Subject</span>
                <input
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, subject: e.target.value })
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontWeight: "500",
                  }}
                />
              </div>

              {/* MESSAGE */}
              <textarea
                placeholder="Write your message..."
                value={emailForm.body}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, body: e.target.value })
                }
                style={{
                  width: "100%",
                  height: "200px",
                  padding: "20px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            {/* FOOTER */}

            {/* TOOLBAR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "10px 20px",
                borderTop: "1px solid #eee",
              }}
            >
              {/* EMOJI */}
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                😊
              </button>

              {/* BOLD */}
              <button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    body: emailForm.body + " **bold text** ",
                  })
                }
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                B
              </button>

              {/* LINK */}
              <button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    body: emailForm.body + " https:// ",
                  })
                }
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                🔗
              </button>

              {/* IMAGE */}
              <label style={{ cursor: "pointer" }}>
                🖼️
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>

              {/* ATTACH FILE */}
              <label style={{ cursor: "pointer" }}>
                📎
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* ATTACHMENTS PREVIEW */}
            {attachments.length > 0 && (
              <div style={{ padding: "10px 20px" }}>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: "12px",
                      color: "#555",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {file.name}
                    <span
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      style={{ cursor: "pointer", color: "red" }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* FOOTER */}
            <div
              style={{
                padding: "15px 20px",
                display: "flex",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <button
                onClick={handleSendEmail}
                disabled={loading}
                style={{
                  background: loading ? "#a5b4fc" : "#6366f1",
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Sending..." : "Send"}
              </button>

              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  border: "none",
                  background: "none",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </>
      )}

      {showEmoji && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "20px",
            zIndex: 10000,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* //--------------------------------------------------------------- */}

      <ReusableModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        title="Log Call"
        onSave={handleLogCall}
        type="right"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Connected *
            </label>
            <input
              value={callForm.connected_to}
              onChange={(e) =>
                setCallForm({ ...callForm, connected_to: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Call Outcome *
            </label>
            <select
              value={callForm.call_outcome}
              onChange={(e) =>
                setCallForm({ ...callForm, call_outcome: e.target.value })
              }
              style={inputStyle}
            >
              <option value="">Choose</option>
              <option>Connected</option>
              <option>Not Connected</option>
              <option>Interested</option>
            </select>
          </div>

          {/* Date + Time */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Date *
              </label>
              <input
                type="date"
                value={callForm.date}
                onChange={(e) =>
                  setCallForm({ ...callForm, date: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Time *
              </label>
              <input
                type="time"
                value={callForm.time}
                onChange={(e) =>
                  setCallForm({ ...callForm, time: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Note *
            </label>
            <textarea
              value={callForm.note}
              onChange={(e) =>
                setCallForm({ ...callForm, note: e.target.value })
              }
              style={{ ...inputStyle, height: "100px" }}
            />
          </div>
        </div>
      </ReusableModal>

      {showCallingModal && (
        <>
          {/* BACKDROP */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 9998,
            }}
          />

          {/* MODAL */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "350px",
              background: "#000",
              color: "#fff",
              borderRadius: "16px",
              padding: "30px",
              textAlign: "center",
              zIndex: 9999,
            }}
          >
            <h3>{dealData?.name || "Customer"}</h3>

            <p style={{ marginTop: "10px", color: "#aaa" }}>
              {callStatus === "calling" && "Calling..."}
              {callStatus === "initiated" && "Connecting..."}
              {callStatus === "ringing" && "Ringing..."}
              {callStatus === "in-progress" && "Connected"}
              {callStatus === "completed" && "Call Ended"}
              {callStatus === "failed" && "Call Failed"}
              {callStatus === "busy" && "Busy"}
              {callStatus === "no-answer" && "No Answer"}
            </p>

            {/* TIMER */}
            <div style={{ marginTop: "10px", fontSize: "18px" }}>
              {callDuration}s
            </div>

            {/* END BUTTON */}
            <button
              onClick={handleEndCall}
              style={{
                marginTop: "20px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              End Call ❌
            </button>
          </div>
        </>
      )}

      {/* ---------------------------------------------------------------- */}

      <ReusableModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create Task"
        onSave={async () => {
         if (
  !taskForm.task_name ||
  !taskForm.due_date ||
  !taskForm.due_time ||
  !taskForm.task_type ||
  !taskForm.priority ||
  !taskForm.assigned_to
) {
  alert("Please fill all required fields");
  return;
}

          try {
            const res = await fetch("http://localhost:7000/api/v1/deal/tasks", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                deal_id: dealId,
                task_name: taskForm.task_name,
                due_date: taskForm.due_date,
                due_time: taskForm.due_time,
                task_type: taskForm.task_type,
                priority: taskForm.priority,
                 assigned_to: Number(taskForm.assigned_to), // 🔥 important
                note: taskForm.note,
                created_by: 1, // login user id
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              alert(data.message);
              return;
            }

            // refresh UI from backend
            fetchTasks();

            setTaskForm({
  task_name: "",
  due_date: "",
  due_time: "",
  task_type: "",
  priority: "",
  assigned_to: "",
  note: "",
});

            setShowTaskModal(false);
          } catch (err) {
            console.error(err);
            alert("Error saving task");
          }
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Task Name */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Task Name *
            </label>
            <input
              value={taskForm.task_name}
              onChange={(e) =>
                setTaskForm({ ...taskForm, task_name: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          {/* Date + Time */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Due Date *
              </label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, due_date: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Time *
              </label>
              <input
                type="time"
                value={taskForm.due_time}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, due_time: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Type + Priority */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Task Type *
              </label>
              <select
                value={taskForm.task_type}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, task_type: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Choose</option>
                <option>To-Do</option>
                <option>Call</option>
                <option>Email</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Priority *
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Choose</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>


          <div>
  <label style={{ fontSize: "12px", fontWeight: "600" }}>
    Assigned to *
  </label>

  <select
    value={taskForm.assigned_to}
    onChange={(e) =>
      setTaskForm({ ...taskForm, assigned_to: e.target.value })
    }
    style={inputStyle}
  >
    <option value="">Choose</option>

    {dealData?.owners?.length > 0 ? (
      dealData.owners.map((owner) => (
        <option key={owner.id} value={owner.id}>
          {owner.first_name} {owner.last_name}
        </option>
      ))
    ) : (
      <option disabled>No Owners Found</option>
    )}
  </select>
</div>




          {/* Note */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Note</label>
            <textarea
              value={taskForm.note}
              onChange={(e) =>
                setTaskForm({ ...taskForm, note: e.target.value })
              }
              style={{ ...inputStyle, height: "100px" }}
            />
          </div>
        </div>
      </ReusableModal>

      {/* //----------------------------------------------------------------------------------------- */}

      <ReusableModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        title="Schedule Meeting"
        onSave={async () => {
          if (
            !meetingForm.title ||
            !meetingForm.date ||
            !meetingForm.startTime ||
            !meetingForm.endTime ||
            !meetingForm.attendees
          ) {
            alert("Fill all required fields");
            return;
          }

          try {
            const res = await fetch(
              "http://localhost:7000/api/v1/deal/meetings",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  deal_id: dealId,
                  title: meetingForm.title,
                  start_date: meetingForm.date,
                  start_time: meetingForm.startTime,
                  end_time: meetingForm.endTime,
                  attendees: meetingForm.attendees,
                  location: meetingForm.location,
                  note: meetingForm.note,
                  created_by: 1,
                }),
              },
            );

            const data = await res.json();

            if (!res.ok) {
              alert(data.message);
              return;
            }

            fetchMeetings(); //  REFRESH FROM DB

            setShowMeetingModal(false);

            setMeetingForm({
              title: "",
              date: "",
              startTime: "",
              endTime: "",
              attendees: "",
              location: "",
              note: "",
            });
          } catch (err) {
            console.error(err);
            alert("Error creating meeting");
          }
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Title *
            </label>
            <input
              value={meetingForm.title}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, title: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Start Date *
            </label>
            <input
              type="date"
              value={meetingForm.date}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, date: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          {/* Time */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                Start Time *
              </label>
              <input
                type="time"
                value={meetingForm.startTime}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, startTime: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>
                End Time *
              </label>
              <input
                type="time"
                value={meetingForm.endTime}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, endTime: e.target.value })
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Attendees *
            </label>
            <input
              value={meetingForm.attendees}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, attendees: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Location
            </label>
            <input
              value={meetingForm.location}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, location: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Note</label>
            <textarea
              value={meetingForm.note}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, note: e.target.value })
              }
              style={{ ...inputStyle, height: "100px" }}
            />
          </div>
        </div>
      </ReusableModal>
    </div>
  );
}
