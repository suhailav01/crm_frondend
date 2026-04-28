"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import RichTextEditor from "@/app/(activityComponents)/richTextEditor/page";
/* -------- ACTIVITY COMPONENT IMPORTS -------- */
import ReusableModal from "@/app/(activityComponents)/reusableModal/page";
import Activity from "@/app/(activityComponents)/activityTabs/page";
import Notes from "@/app/(activityComponents)/notesTabs/page";
import Emails from "@/app/(activityComponents)/emailsTabs/page";
import Calls from "@/app/(activityComponents)/callsTabs/page";
import Meetings from "@/app/(activityComponents)/meetingsTab/page";
import Tasks from "@/app/(activityComponents)/tasksTab/page";

export default function companiesDetailsPage() {


  const router = useRouter();
  const { id } = useParams();


  const API = `${process.env.NEXT_PUBLIC_API_URL}/companies`;
  const [activeTab, setActiveTab] = useState("Activity");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAbout, setShowAbout] = useState(true);
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);
  const visibleUsers =
    currentUser?.role === "admin"
      ? users
      : users.filter((u) => String(u.id) === String(currentUser?.id));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        console.log("USERS API RESPONSE:", text);

        const data = JSON.parse(text);

        const usersArray = Array.isArray(data.data) ? data.data : [];

        const formattedUsers = usersArray.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Users fetch error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);
  const handleAddClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };
  const tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];
  const [isEditOpen, setIsEditOpen] = useState(false);

  // MODAL STATES
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  // INPUT STATES (EMAIL)
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // INPUT STATES (NOTE)
  const [noteText, setNoteText] = useState("");

  // INPUT STATES (MEETING)
  const [mtTitle, setMtTitle] = useState("");
  const [mtStartDate, setMtStartDate] = useState("");
  const [mtStartTime, setMtStartTime] = useState("");
  const [mtEndTime, setMtEndTime] = useState("");
  const [mtLocation, setMtLocation] = useState("");
  const [mtNote, setMtNote] = useState("");

  // INPUT STATES (CALL)
  const [connectedUser, setConnectedUser] = useState("Jane Cooper");
  const [callOutcome, setCallOutcome] = useState("Connected");
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [callNote, setCallNote] = useState("");
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(false);
  const [liveCallStatus, setLiveCallStatus] = useState("");
  const [liveCallSid, setLiveCallSid] = useState("");
  const [liveCallDuration, setLiveCallDuration] = useState(0);
  // INPUT STATES (TASK)
  const [taskName, setTaskName] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskPriority, setTaskPriority] = useState("High");
  const [taskNote, setTaskNote] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState([]);
  /* -------------------- DATA STATES -------------------- */
  const [company, setCompany] = useState(null);
  const [editCompany, setEditCompany] = useState(null);
  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      const data = result.data;

      console.log("FINAL DATA 👉", data);

      const formatted = {
        id: data.id,
        name: data.company_name || "",
        email: data.email || "",
        owner: (data.owners || [])
          .map((u) => `${u.first_name} ${u.last_name}`)
          .join(", "),
        owner_ids: (data.owners || []).map((u) => String(u.id)),
        phone: data.phone_number || "",
        industry: data.industry || "",
        city: data.city || "",
        country: data.country_region || "",
        domain_name: data.domain_name || "",
        employees: data.no_of_employees || "",
        revenue: data.annual_revenue || "",
        created: data.created_at
          ? new Date(data.created_at).toLocaleString()
          : "",
      };

      setCompany(formatted);
      setEditCompany(formatted);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (id) fetchCompanyDetails();
  }, [id]);

  const [activities, setActivities] = useState([]);
  const [notesData, setNotesData] = useState([]);
  const [emailsData, setEmailsData] = useState([]);
  const [callsData, setCallsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [meetingsData, setMeetingsData] = useState([]);

  /* -------------------- HANDLERS -------------------- */
  const handleSaveMeeting = async () => {
    if (!mtTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: Number(id),
            title: mtTitle,
            start_date: mtStartDate,
            start_time: mtStartTime,
            end_time: mtEndTime,
            attendees: currentUser?.id, // or dropdown value
            location: mtLocation,
            reminder: "10 minutes before",
            note: mtNote,
            created_by: currentUser?.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // 🔥 refresh meetings
      fetchCompanyMeetings();

      // reset
      setMtTitle("");
      setMtStartDate("");
      setMtStartTime("");
      setMtEndTime("");
      setMtLocation("");
      setMtNote("");

      setIsMeetingModalOpen(false);
      setActiveTab("Meetings");

    } catch (err) {
      console.error("MEETING ERROR:", err);
      alert(err.message);
    }
  };




  const fetchCompanyMeetings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/meetings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        const formatted = data.data.map((meeting) => ({
          id: meeting.id,
          title: meeting.title,
          date: meeting.start_date,
          time: `${meeting.start_time} - ${meeting.end_time}`,
          description: meeting.note,
        }));

        setMeetingsData(formatted);
      }
    } catch (err) {
      console.error("FETCH MEETING ERROR:", err);
    }
  };


  useEffect(() => {
    if (id) fetchCompanyMeetings();
  }, [id]);





  //------------------------------------------------------




  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/notes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      console.log("NOTES RESULT 👉", result);

      const notesArray = Array.isArray(result.data) ? result.data : [];

      const formatted = notesArray.map((note) => ({
        id: note.id,
        user: note.created_by_name || note.first_name || "Unknown",
        text: note.note_text || note.text || "",
        date: note.created_at || note.date,
      }));

      console.log("FORMATTED NOTES 👉", formatted);

      setNotesData(formatted);
    } catch (err) {
      console.error("Fetch notes error:", err);
    }
  };

  useEffect(() => {
    if (id) fetchNotes();
  }, [id]);



  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: id,
            note_text: noteText,
            created_by: currentUser?.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // 🔥 refresh notes after create
      fetchNotes();

      setNoteText("");
      setIsNoteModalOpen(false);
      setActiveTab("Notes");
    } catch (err) {
      console.error("Create note error:", err);
      alert(err.message);
    }
  };

  //------------------------------------------------------------
  const handleSendCompanyEmail = async () => {
    if (!id) {
      console.error("Company ID missing");
      return;
    }

    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      alert("Recipients, subject and body are required");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = localStorage.getItem("token");
      if (!user?.id) {
        alert("User not found");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: Number(id),
            recipients: emailTo.split(","), // 🔥 important
            subject: emailSubject,
            body: emailBody,
            sent_by: user.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      // ✅ refresh emails
      fetchCompanyEmails();

      // UI reset
      setEmailTo("");
      setEmailSubject("");
      setEmailBody("");
      setIsEmailModalOpen(false);
      setActiveTab("Emails");

      alert("Email sent successfully ✅");

    } catch (err) {
      console.error("SEND COMPANY EMAIL ERROR:", err);
      alert(err.message || "Something went wrong");
    }
  };



  const fetchCompanyEmails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/emails/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        const formatted = data.data.map((item) => ({
          id: item.id,
          subject: item.subject,
          senderName: item.sent_by_name || "Unknown",
          recipient: Array.isArray(item.recipients)
            ? item.recipients.join(", ")
            : item.recipients,
          date: new Date(item.created_at).toLocaleString(),
          body: item.body,
        }));

        setEmailsData(formatted);
      }
    } catch (err) {
      console.error("FETCH COMPANY EMAIL ERROR:", err);
    }
  };

  useEffect(() => {
    if (id) fetchCompanyEmails();
  }, [id]);

  //----------------------------------------------------------------------------


  const handleSaveCall = async () => {
    if (!callNote.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/calls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: Number(id),
            connected_to: connectedUser,
            call_outcome: callOutcome,
            call_date: callDate,
            call_time: callTime,
            note: callNote,
            created_by: currentUser?.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // 🔥 refresh calls
      fetchCompanyCalls();

      // reset
      setCallNote("");
      setCallDate("");
      setCallTime("");
      setConnectedUser("");
      setCallOutcome("Connected");

      setIsCallModalOpen(false);
      setActiveTab("Calls");

    } catch (err) {
      console.error("CALL ERROR:", err);
      alert(err.message);
    }
  };


  const fetchCompanyCalls = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/calls/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        const formatted = data.data.map((call) => ({
          id: call.id,
          user: call.connected_to,
          summary: call.note,
          date: call.call_date,
          outcome: call.call_outcome,
        }));

        setCallsData(formatted);
      }
    } catch (err) {
      console.error("FETCH CALL ERROR:", err);
    }
  };

  useEffect(() => {
    if (id) fetchCompanyCalls();
  }, [id]);





  //------------------------------------------------------------------------

  const handleSaveTask = async () => {
    if (
      !taskName.trim() ||
      !taskDueDate ||
      !taskTime ||
      !taskType ||
      !taskPriority ||
      !taskNote.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const assignedUsers =
        currentUser?.role === "admin"
          ? taskAssignedTo
          : [currentUser?.id];

      if (!assignedUsers || assignedUsers.length === 0) {
        alert("Please select at least one employee");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_id: Number(id),
          task_name: taskName,
          due_date: taskDueDate,
          due_time: taskTime,
          task_type: taskType,
          priority: taskPriority,
          assigned_to: assignedUsers,
          note: taskNote,
          status: "Pending",
          created_by: currentUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      fetchCompanyTasks();

      setTaskName("");
      setTaskDueDate("");
      setTaskTime("");
      setTaskType("");
      setTaskPriority("High");
      setTaskAssignedTo([]);
      setTaskNote("");

      setIsTaskModalOpen(false);
      setActiveTab("Tasks");
    } catch (err) {
      console.error("TASK ERROR:", err);
      alert(err.message);
    }
  };


  const fetchCompanyTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        const formatted = data.data.map((task) => ({
          id: task.id,
          title: task.task_name,
          owner:
            task.assigned_users?.length > 0
              ? task.assigned_users.map((u) => u.name).join(", ")
              : "Unassigned",
          assigned_users: task.assigned_users || [],
          dueDate: task.due_date,
          priority: task.priority,
          description: task.note,
        }));

        setTasksData(formatted);
      }
    } catch (err) {
      console.error("FETCH TASK ERROR:", err);
    }
  };

  useEffect(() => {
    if (id) fetchCompanyTasks();
  }, [id]);
  //----------------------------------------------------------------------------------

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (!currentUser?.id) {
      alert("User not loaded");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      for (let file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("company_id", Number(id));
        formData.append("uploaded_by", currentUser.id);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/company/attachments/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();

        console.log("UPLOAD RESPONSE:", data);

        if (!res.ok || data.success === false) {
          throw new Error(data.message || "Upload failed");
        }
      }

      fetchCompanyAttachments();

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert(err.message);
    }
  };




  const fetchCompanyAttachments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/attachments/company/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("ATTACHMENT API returned HTML:", text);
        return;
      }

      const data = await res.json();

      console.log("ATTACHMENTS:", data);

      setAttachments(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("FETCH ATTACHMENTS ERROR:", err);
    }
  };


  useEffect(() => {
    if (id) fetchCompanyAttachments();
  }, [id]);


  const handleDeleteAttachments = async (fileId) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/company/attachments/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchCompanyAttachments();

    } catch (err) {
      console.error(err);
    }
  };





  const handleMakePhoneCall = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      if (!id) {
        alert("company id not found");
        return;
      }

      console.log("company full data:", company);

      let phone =
        company?.contact_phone_number ||
        company?.phone_number ||
        company?.customer_phone ||
        company?.phone ||
        "";

      if (!phone) {
        alert("Customer phone number not found");
        console.log("Missing phone in company:", company);
        return;
      }

      // convert to string and clean spaces/dashes
      phone = String(phone).trim().replace(/\s+/g, "").replace(/-/g, "");

      // remove leading 0 if user saved like 08113032178
      if (phone.startsWith("0")) {
        phone = phone.substring(1);
      }

      // if no country code, force India +91
      if (!phone.startsWith("+")) {
        phone = `+91${phone}`;
      }

      console.log("FINAL PHONE:", phone);

      const payload = {
        company_id: parseInt(id, 10),
        customer_phone: phone,
        connected_to: company?.name || company?.company_name || "Customer",
        created_by: Number(user.id),
      };

      console.log("payload:", payload);

      setIsCallPanelOpen(true);
      setLiveCallStatus("calling");
      setLiveCallDuration(0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/calls/make-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text);
        setLiveCallStatus("failed");
        alert("Server did not return valid JSON");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setLiveCallSid(data?.data?.twilio_sid || data?.data?.sid || "");
        setLiveCallStatus("initiated");
        await fetchCompanyCalls();
      } else {
        setLiveCallStatus("failed");
        alert(data.message || data.error || "Failed to make call");
      }
    } catch (err) {
      console.error("CALL ERROR:", err);
      setLiveCallStatus("failed");
      alert("Something went wrong while making call");
    }
  };


  const handleEndLiveCall = async () => {
    try {
      if (!liveCallSid) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/calls/end-call/${liveCallSid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setLiveCallStatus("completed");
        await fetchCompanyCalls();
      }
    } catch (err) {
      console.error("END CALL ERROR:", err);
    }
  };


  //---------------------------------------------------------------------

  useEffect(() => {
    const combined = [
      ...notesData.map((n) => ({
        title: "Note",
        user: n.user,
        message: n.text,
        date: n.date,
      })),

      ...emailsData.map((e) => ({
        title: "Email",
        user: e.senderName,
        message: e.subject,
        date: e.date,
      })),

      ...callsData.map((c) => ({
        title: "Call",
        user: c.user,
        message: c.summary,
        date: c.date,
      })),

      ...tasksData.map((t) => ({
        title: "Task",
        user: t.owner,
        message: t.title,
        date: t.dueDate,
      })),

      ...meetingsData.map((m) => ({
        title: "Meeting",
        user: "You",
        message: m.title,
        date: m.date,
      })),
    ];

    // latest first
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    setActivities(combined);
  }, [notesData, emailsData, callsData, tasksData, meetingsData]);





  const filteredActivities = activities.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredNotes = notesData.filter((item) =>
    (item.text || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmails = emailsData.filter(
    (item) =>
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.body.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredCalls = callsData.filter((item) =>
    item.summary.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredTasks = tasksData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredMeetings = meetingsData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );
  if (!company) {
    return <div>Loading...</div>;
  }
  return (
    <div
      style={{
        marginLeft: "15px",
        background: "#f8fafc",
        width: "100%",
        minHeight: "100vh",
        padding: "50px 30px 50px 55px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* call panel modal */}
      <ReusableModal
        isOpen={isCallPanelOpen}
        onClose={() => setIsCallPanelOpen(false)}
        title=""
        type="center"
        width="360px"
      >
        <div
          style={{
            background: "#000",
            color: "#fff",
            borderRadius: "20px",
            padding: "30px 20px",
            textAlign: "center",
            minHeight: "420px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* TOP */}
          <div>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "#1e293b",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}
            >
              👤
            </div>

            <h3 style={{ margin: "0 0 6px", fontWeight: "600" }}>
              {company?.name || "Customer"}
            </h3>

            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "10px" }}>
              {liveCallStatus === "calling" && "Calling..."}
              {liveCallStatus === "initiated" && "Connecting..."}
              {liveCallStatus === "ringing" && "Ringing..."}
              {liveCallStatus === "in-progress" && "Connected"}
              {liveCallStatus === "answered" && "Connected"}
              {liveCallStatus === "completed" && "Call Ended"}
              {liveCallStatus === "failed" && "Call Failed"}
              {liveCallStatus === "busy" && "Busy"}
              {liveCallStatus === "no-answer" && "No Answer"}
            </p>

            {/* TIMER */}
            <div style={{ fontSize: "18px", fontWeight: "500", marginTop: "8px" }}>
              {liveCallDuration ? `${liveCallDuration}s` : "0s"}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginTop: "30px",
            }}
          >
            {/* MUTE (UI only for now) */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  background: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "6px",
                  cursor: "pointer",
                }}
              >
                🔇
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>Mute</span>
            </div>

            {/* END CALL */}
            <div style={{ textAlign: "center" }}>
              <div
                onClick={handleEndLiveCall}
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                📞
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                End
              </span>
            </div>

            {/* SPEAKER (UI only) */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  background: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "6px",
                  cursor: "pointer",
                }}
              >
                🔊
              </div>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                Speaker
              </span>
            </div>
          </div>
        </div>
      </ReusableModal>
      {/* --- EMAIL MODAL (Center) --- */}
      <ReusableModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="New Email"
        type="center"
        width="600px"
      >
        <div className="border-bottom p-2 d-flex justify-content-between align-items-center">
          <input
            type="text"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="Recipients"
            className="form-control border-0 shadow-none"
          />
          <div
            style={{ fontSize: "13px", color: "#6c63ff", cursor: "pointer" }}
          >
            Cc&nbsp;&nbsp;Bcc
          </div>
        </div>

        {/* Subject */}
        <div className="border-bottom p-2">
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="form-control border-0 shadow-none"
          />
        </div>

        {/* Body */}
        <div style={{ padding: "10px" }}>
          <textarea
            rows="10"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Body Text"
            className="form-control border-0 shadow-none"
            style={{ resize: "none" }}
          />
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between p-2 border-top">
          <button
            onClick={handleSendCompanyEmail}
            className="btn"
            style={{
              background: "#6c63ff",
              color: "white",
              padding: "6px 20px",
              fontSize: "14px",
            }}
          >
            Send
          </button>

          <div className="d-flex gap-3 text-muted" style={{ fontSize: "18px" }}>
            <i className="bi bi-paperclip"></i>
            <i className="bi bi-link-45deg"></i>
            <i className="bi bi-emoji-smile"></i>
            <i className="bi bi-image"></i>
          </div>

          <i className="bi bi-trash text-muted"></i>
        </div>
      </ReusableModal>

      {/* ---  NOTE MODAL (Sidebar) --- */}
      <ReusableModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Create Note"
        onSave={handleSaveNote}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#333" }}>
            Note <span style={{ color: "#ef4444" }}>*</span>
          </label>

          <RichTextEditor
            value={noteText}
            onChange={setNoteText}
            placeholder="Enter note..."
            minHeight="250px"
          />
        </div>
      </ReusableModal>

      {/* --- CALL MODAL  --- */}
      <ReusableModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        title="Log Call"
        type="right"
        width="420px"
      >
        {/* Connected */}
        <label className="small fw-bold mb-1">
          Connected <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={connectedUser}
          onChange={(e) => setConnectedUser(e.target.value)}
          className="form-control mb-3"
          placeholder="Jane Cooper"
        />

        {/* Call Outcome */}
        <label className="small fw-bold mb-1">
          Call Outcome <span className="text-danger">*</span>
        </label>
        <select
          value={callOutcome}
          onChange={(e) => setCallOutcome(e.target.value)}
          className="form-select mb-3"
        >
          <option value="">Choose</option>
          <option>Connected</option>
          <option>Busy</option>
          <option>No Answer</option>
        </select>

        {/* Date and Time */}
        <div className="row mb-3">
          <div className="col-6">
            <label className="small fw-bold mb-1">
              Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="col-6">
            <label className="small fw-bold mb-1">
              Time <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Note */}
        <label className="small fw-bold mb-1">
          Note <span className="text-danger">*</span>
        </label>

        <div className="border rounded mb-3">
          <div className="border-bottom p-2 small text-muted">
            Normal text
            <span className="ms-3">B</span>
            <span className="ms-2">I</span>
            <span className="ms-2">U</span>
            <span className="ms-2">•</span>
            <span className="ms-2">1.</span>
          </div>

          <textarea
            rows="4"
            value={callNote}
            onChange={(e) => setCallNote(e.target.value)}
            placeholder="Enter"
            className="form-control border-0"
            style={{ resize: "none" }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button
            onClick={() => setIsCallModalOpen(false)}
            className="btn btn-light"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveCall}
            className="btn"
            style={{
              background: "#6c63ff",
              color: "white",
              padding: "6px 20px",
            }}
          >
            Save
          </button>
        </div>
      </ReusableModal>

      {/* --- TASK MODAL  --- */}
      <ReusableModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create Task"
        type="sidebar"
        onSave={handleSaveTask}
      >
        <label className="small fw-bold mb-1">
          Task Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Enter"
          className="form-control mb-3"
        />

        <div className="row mb-3">
          <div className="col-6">
            <label className="small fw-bold mb-1">
              Due Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="col-6">
            <label className="small fw-bold mb-1">
              Time <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <label className="small fw-bold mb-1">
              Task Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="">Choose</option>
              <option value="To-Do">To-Do</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div className="col-6">
            <label className="small fw-bold mb-1">
              Priority <span className="text-danger">*</span>
            </label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className="form-select"
            >
              <option value="">Choose</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <label className="small fw-bold mb-1">
          Assigned to <span className="text-danger">*</span>
        </label>

        {currentUser?.role === "admin" ? (
          <div
            className="border rounded p-2 mb-3"
            style={{ maxHeight: "180px", overflowY: "auto" }}
          >
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`company-task-user-${user.id}`}
                    checked={taskAssignedTo.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTaskAssignedTo((prev) => [...prev, user.id]);
                      } else {
                        setTaskAssignedTo((prev) =>
                          prev.filter((id) => id !== user.id)
                        );
                      }
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`company-task-user-${user.id}`}
                  >
                    {user.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-muted mb-0">No employees found</p>
            )}
          </div>
        ) : (
          <input
            type="text"
            className="form-control mb-3"
            value={`${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`}
            readOnly
          />
        )}

        <label className="small fw-bold mb-1">
          Note <span className="text-danger">*</span>
        </label>

        <div className="border rounded mb-3">
          <div className="border-bottom p-2 small text-muted">
            Normal text
            <span className="ms-3">B</span>
            <span className="ms-2">I</span>
            <span className="ms-2">U</span>
            <span className="ms-2">•</span>
            <span className="ms-2">1.</span>
          </div>

          <textarea
            rows="4"
            value={taskNote}
            onChange={(e) => setTaskNote(e.target.value)}
            placeholder="Enter"
            className="form-control border-0"
            style={{ resize: "none" }}
          />
        </div>
      </ReusableModal>

      {/* --- MEETING MODAL (Sidebar) --- */}
      <ReusableModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        title="Schedule Meeting"
        type="sidebar"
        onSave={handleSaveMeeting}
      >
        {/* Title */}
        <label className="small fw-bold mb-1">
          Title <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={mtTitle}
          onChange={(e) => setMtTitle(e.target.value)}
          placeholder="Enter"
          className="form-control mb-3"
        />

        {/* Start Date */}
        <label className="small fw-bold mb-1">
          Start Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          value={mtStartDate}
          onChange={(e) => setMtStartDate(e.target.value)}
          className="form-control mb-3"
        />

        {/* Start Time + End Time */}
        <div className="row mb-3">
          <div className="col-6">
            <label className="small fw-bold mb-1">
              Start Time <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              value={mtStartTime}
              onChange={(e) => setMtStartTime(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="col-6">
            <label className="small fw-bold mb-1">
              End Time <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              value={mtEndTime}
              onChange={(e) => setMtEndTime(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Attendees */}
        <label className="small fw-bold mb-1">
          Attendees <span className="text-danger">*</span>
        </label>
        <select className="form-select mb-3">
          <option>Choose</option>
          <option>Maria Johnson</option>
          <option>Jane Cooper</option>
          <option>Suhail</option>
        </select>

        {/* Location */}
        <label className="small fw-bold mb-1">Location</label>
        <select className="form-select mb-3">
          <option>Choose</option>
          <option>Google Meet</option>
          <option>Zoom</option>
          <option>Office</option>
        </select>

        {/* Reminder */}
        <label className="small fw-bold mb-1">Reminder</label>
        <select className="form-select mb-3">
          <option>Choose</option>
          <option>10 minutes before</option>
          <option>30 minutes before</option>
          <option>1 hour before</option>
        </select>

        {/* Note Editor */}
        <label className="small fw-bold mb-1">
          Note <span className="text-danger">*</span>
        </label>

        <div className="border rounded mb-3">
          {/* Toolbar */}
          <div className="border-bottom p-2 small text-muted">
            Normal text
            <span className="ms-3">B</span>
            <span className="ms-2">I</span>
            <span className="ms-2">U</span>
            <span className="ms-2">•</span>
            <span className="ms-2">1.</span>
          </div>

          <textarea
            rows="4"
            value={mtNote}
            onChange={(e) => setMtNote(e.target.value)}
            placeholder="Enter"
            className="form-control border-0"
            style={{ resize: "none" }}
          />
        </div>
      </ReusableModal>
      {/* edit modal */}
      <ReusableModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Company"
        onSave={async () => {
          try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API}/${company.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                company_name: editCompany.name || "",
                email: editCompany.email || "",
                phone_number: editCompany.phone || "",
                industry: editCompany.industry || "",
                city: editCompany.city || "",
                country_region: editCompany.country || "",
                domain_name: editCompany.domain_name || "",
                no_of_employees: editCompany.employees || "",
                annual_revenue: editCompany.revenue || "",
                owners:
                  currentUser && currentUser.role !== "admin"
                    ? [String(currentUser.id)]
                    : editCompany.owner_ids || [],
              }),
            });

            const data = await res.json();
            console.log("UPDATE RESPONSE:", data);

            if (!res.ok) {
              throw new Error(data?.message || "Update failed");
            }

            await fetchCompanyDetails();
            setIsEditOpen(false);
          } catch (err) {
            console.error("Update error:", err);
            alert(err.message);
          }
        }}
      >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Company Name</label>
            <input
              className="form-control"
              value={editCompany?.name || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, name: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Domain</label>
            <input
              className="form-control"
              value={editCompany?.domain_name || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, domain_name: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Industry</label>
            <input
              className="form-control"
              value={editCompany?.industry || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, industry: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Phone</label>
            <input
              className="form-control"
              value={editCompany?.phone || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, phone: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Owners</label>
            <div
              style={{
                border: "1px solid #ced4da",
                borderRadius: "6px",
                padding: "10px",
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {visibleUsers.map((user) => {
                const userId = String(user.id);

                return (
                  <div key={user.id} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`edit-user-${user.id}`}
                      checked={(editCompany?.owner_ids || []).includes(userId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const updatedIds = [
                            ...(editCompany?.owner_ids || []),
                            userId,
                          ];
                          const updatedNames = users
                            .filter((u) => updatedIds.includes(String(u.id)))
                            .map((u) => u.name)
                            .join(", ");

                          setEditCompany({
                            ...editCompany,
                            owner_ids: updatedIds,
                            owner: updatedNames,
                          });
                        } else {
                          const updatedIds = (
                            editCompany?.owner_ids || []
                          ).filter((id) => id !== userId);

                          const updatedNames = users
                            .filter((u) => updatedIds.includes(String(u.id)))
                            .map((u) => u.name)
                            .join(", ");

                          setEditCompany({
                            ...editCompany,
                            owner_ids: updatedIds,
                            owner: updatedNames,
                          });
                        }
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`edit-user-${user.id}`}
                    >
                      {user.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label>City</label>
            <input
              className="form-control"
              value={editCompany?.city || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, city: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Country</label>
            <input
              className="form-control"
              value={editCompany?.country || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, country: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>No of Employees</label>
            <input
              className="form-control"
              value={editCompany?.employees || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, employees: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Revenue</label>
            <input
              className="form-control"
              value={editCompany?.revenue || ""}
              onChange={(e) =>
                setEditCompany({ ...editCompany, revenue: e.target.value })
              }
            />
          </div>
        </div>
      </ReusableModal>
      {/* --- MAIN PAGE LAYOUT --- */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          minHeight: "535px",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            width: "350px",
            padding: "20px",
            fontFamily: "Inter, sans-serif",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
          }}
        >
          {/* Back Button */}
          <div
            onClick={() => router.back()}
            style={{
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "15px",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "18px" }}>‹</span>
            <strong>Companies</strong>
          </div>

          {/* Company Header */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                background: "#e2e8f0",
                borderRadius: "8px",
              }}
            ></div>

            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
                {company?.name || "no company name"}
              </h3>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                {company?.industry || "no industry"}
              </div>
              <div style={{ fontSize: "13px", color: "#6366f1" }}>
                {company?.domain_name || "no domain"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {[
              {
                label: "Note",
                tab: "Notes",
                icon: "bi bi-pencil-square",
                modal: () => setIsNoteModalOpen(true),
              },
              {
                label: "Email",
                tab: "Emails",
                icon: "bi bi-envelope",
                modal: () => {
                  setEmailTo(company?.email || "");
                  setIsEmailModalOpen(true);
                },
              },
              {
                label: "Call",
                tab: "Calls",
                icon: "bi bi-telephone",
                modal: () => setIsCallModalOpen(true),
              },
              {
                label: "Task",
                tab: "Tasks",
                icon: "bi bi-check2-square",
                modal: () => setIsTaskModalOpen(true),
              },
              {
                label: "Meeting",
                tab: "Meetings",
                icon: "bi bi-calendar3",
                modal: () => setIsMeetingModalOpen(true),
              },
            ].map((item, idx) => {
              const isActive = activeTab === item.tab;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.tab);
                    item.modal();
                  }}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <div
                    style={{
                      background: isActive ? "#6366f1" : "#fff",
                      color: isActive ? "#fff" : "#6366f1",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      height: "38px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      transition: "0.2s",
                    }}
                  >
                    <i className={item.icon}></i>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: isActive ? "#6366f1" : "#475569",
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* About Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: showAbout ? "15px" : "10px",
              alignItems: "center",
            }}
          >
            <strong
              style={{
                fontSize: "14px",
                color: "#1e293b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => setShowAbout(!showAbout)}
            >
              <span style={{ fontSize: "12px" }}>{showAbout ? "▼" : "▶"}</span>
              About this Company
            </strong>

            <i
              className="bi bi-pencil"
              style={{ color: "#6366f1", cursor: "pointer" }}
              onClick={() => {
                setEditCompany(company);
                setIsEditOpen(true);
              }}
            ></i>
          </div>

          {/* Company Details */}
          {showAbout && (
            <>
              {[
                { label: "Company Domain Name", value: company?.domain_name },
                { label: "Company Name", value: company?.name },
                { label: "Industry", value: company?.industry },
                { label: "Phone number", value: company?.phone },
                { label: "Company Owner", value: company?.owner },
                { label: "City", value: company?.city },
                { label: "Country/Region", value: company?.country },
                { label: "No of Employees", value: company?.employees },
                { label: "Annual Revenue", value: company?.revenue },
                { label: "Created Date", value: company?.created },
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#1e293b",
                      fontWeight: "500",
                    }}
                  >
                    {item.value || "-"}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CENTER PANEL */}

        <div style={{ width: "50%", padding: "24px" }}>
          {/* SEARCH BAR */}
          <div
            style={{
              marginBottom: "20px",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Search activities"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
            />

            {/* Search Icon */}
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            ></i>
          </div>
          <div
            style={{
              display: "flex",
              gap: "25px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "20px",
            }}
          >
            {tabs.map((tab) => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: "10px",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === tab ? "2px solid #6366f1" : "none",
                  color: activeTab === tab ? "#6366f1" : "#64748b",
                  fontWeight: activeTab === tab ? "600" : "400",
                  transition: "all 0.2s ease",
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {activeTab === "Activity" && (
            <Activity activities={filteredActivities} />
          )}

          {activeTab === "Notes" && (
            <Notes
              notes={filteredNotes}
              onCreateNote={() => setIsNoteModalOpen(true)}
            />
          )}
          {activeTab === "Emails" && (
            <Emails
              emails={filteredEmails}
              onCreateEmail={() => setIsEmailModalOpen(true)}
            />
          )}

          {activeTab === "Calls" && (
            <Calls
              calls={filteredCalls}
              onCreateCall={() => setIsCallModalOpen(true)}
              onMakePhoneCall={handleMakePhoneCall}
            />
          )}


          {activeTab === "Tasks" && (
            <Tasks
              tasks={filteredTasks}
              onCreateTask={() => setIsTaskModalOpen(true)}
            />
          )}

          {activeTab === "Meetings" && (
            <Meetings
              meetingsData={filteredMeetings}
              onCreateMeeting={() => setIsMeetingModalOpen(true)}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{ width: "300px", padding: "16px", fontFamily: "sans-serif" }}
        >
          {/* AI Ticket Summary Box */}
          <div
            style={{
              border: "1px solid #7c3aed",
              borderRadius: "12px",
              padding: "16px",
              backgroundColor: "#ffffff",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  marginRight: "8px",
                  color: "#6366f1",
                  fontSize: "20px",
                }}
              >
                🤖
              </span>
              <h6
                style={{
                  color: "#6366f1",
                  fontWeight: "700",
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                AI Ticket Summary
              </h6>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#1f2937",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              The ticket titled “Payment Failure Issue” currently has no
              associated conversation, call, or note transcripts.
            </p>
          </div>

          {/* Attachments Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  marginRight: "8px",
                  color: "#374151",
                }}
              >
                ▼
              </span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Attachments
              </span>
            </div>

            <span
              onClick={handleAddClick}
              style={{
                color: "#6366f1",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              + Add
            </span>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "8px",
              lineHeight: "1.4",
            }}
          >
            See the files attached to your activities or uploaded to this
            record.
          </p>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileUpload}   // ✅ change here
          />

          {/* Attachment List */}
          {attachments.map((file) => (
            <div key={file.id}>
              <a
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${file.file_path}`}
                target="_blank"
                rel="noreferrer"
              >
                📎 {file.file_name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
