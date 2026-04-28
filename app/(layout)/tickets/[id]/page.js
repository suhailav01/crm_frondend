"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import RichTextEditor from "@/app/(activityComponents)/richTextEditor/page";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
/* -------- ACTIVITY COMPONENT IMPORTS -------- */
import ReusableModal from "@/app/(activityComponents)/reusableModal/page";
import Activity from "@/app/(activityComponents)/activityTabs/page";
import Notes from "@/app/(activityComponents)/notesTabs/page";
import Emails from "@/app/(activityComponents)/emailsTabs/page";
import Calls from "@/app/(activityComponents)/callsTabs/page";
import Meetings from "@/app/(activityComponents)/meetingsTab/page";
import Tasks from "@/app/(activityComponents)/tasksTab/page";

export default function TicketDetailsPage() {
  const [users, setUsers] = useState([]);
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const isAdmin = storedUser?.role === "admin";
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup/users`);
        const data = await res.json();

        const usersArray = Array.isArray(data.data) ? data.data : [];

        const formatted = usersArray.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`, // adjust if needed
        }));

        setUsers(formatted);
      } catch (err) {
        console.error("Users fetch error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);
  const { id } = useParams()
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Activity");  // attachment section 
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("")
  const [showAboutDetails, setShowAboutDetails] = useState(true);
  const handleAddClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ticket_id", id);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        // store DB response (not raw file)
        setAttachments((prev) => [...prev, data.data]);
      } catch (err) {
        console.error("Upload error", err);
      }
    }
  };
  useEffect(() => {
    const fetchAttachments = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/ticket/${id}`
      );
      const data = await res.json();
      setAttachments(data);
    };

    if (id) fetchAttachments();
  }, [id]);
  const tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editTicket, setEditTicket] = useState({
    description: "",
    ownerIds: [],
    priority: "",
  });
  // MODAL STATES
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [emailFiles, setEmailFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
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
  const [mtAttendees, setMtAttendees] = useState("");
  const [mtReminder, setMtReminder] = useState("");
  // INPUT STATES (CALL)
  const [connectedUser, setConnectedUser] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
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
  const [taskPriority, setTaskPriority] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState([]);
  /* -------------------- DATA STATES -------------------- */
  const [ticket, setTicket] = useState(null);
  //fetch ticket 
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await res.json();

        console.log("API RESPONSE:", data);
        const t = data.data || data;
        setTicket({
          id: t.id,
          name: t.ticket_name || "",
          status: t.status || "",
          owner: (t.owners || [])
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", "),
          ownerIds: (t.owners || []).map((u) => String(u.id)),
          priority: t.priority || "",
          description: t.description || "",
          source: t.source || "",
          deal_id: t.deal_id || null,
          company_id: t.company_id || null,
          contact_email: t.contact_email || "",
          contact_phone_number: t.contact_phone_number || "",
        });

      } catch (err) {
        console.error("Error fetching ticket:", err);
      }
    };
    if (id) fetchTicket();
  }, [id]);
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}`);
      const data = await res.json();

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
          id: item.id,
          user: item.created_by_name || "Unknown User",
          text: item.note_text,
          date: new Date(item.created_at).toLocaleString(),
        }));
        setNotesData(formatted);
      }
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/${id}`);
      const data = await res.json();

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
          id: item.id,
          subject: item.subject || "No Subject",
          senderName: item.sent_by_name || "Unknown User",
          recipient: item.recipients,
          date: new Date(item.created_at).toLocaleString(),
          body: item.body,
        }));
        setEmailsData(formatted);
      }
    } catch (err) {
      console.error("FETCH EMAILS ERROR:", err);
    }
  };

  const fetchCalls = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calls/${id}`);
      const data = await res.json();

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
          id: item.id,
          user: item.created_by_name || item.connected_to,
          summary: item.note || "",
          date: `${item.call_date} ${item.call_time}`,
          outcome: item.call_outcome,
          call_status: item.call_status,
          duration_seconds: item.duration_seconds,
        }));
        setCallsData(formatted);
      }
    } catch (err) {
      console.error("FETCH CALLS ERROR:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("TASK API RESPONSE:", data);

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
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

        console.log("FORMATTED TASKS:", formatted);
        setTasksData(formatted);
      } else {
        setTasksData([]);
      }
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err);
      setTasksData([]);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meetings/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("MEETINGS API RESPONSE:", data);

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
          id: item.id,
          title: item.title || "",
          date: item.start_date || "",
          time:
            item.start_time && item.end_time
              ? `${item.start_time} - ${item.end_time}`
              : item.start_time || "",
          attendees: item.attendees || "",
          location: item.location || "",
          reminder: item.reminder || "",
          description: item.note || "",
          createdBy: item.created_by_name || "Unknown User",
        }));

        console.log("FORMATTED MEETINGS:", formatted);
        setMeetingsData(formatted);
      } else {
        setMeetingsData([]);
      }
    } catch (err) {
      console.error("FETCH MEETINGS ERROR:", err);
      setMeetingsData([]);
    }
  };
  const fetchActivity = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity/${id}`);
      const data = await res.json();

      console.log("ACTIVITY API RESPONSE:", data);

      if (data.success) {
        const formatted = (data.data || []).map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          user: item.user_name || "Unknown User",
          message: item.subtitle || "",
          date: new Date(item.created_at).toLocaleString(),
        }));

        console.log("FORMATTED ACTIVITIES:", formatted);
        setActivities(formatted);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("FETCH ACTIVITY ERROR:", err);
      setActivities([]);
    }
  };
  useEffect(() => {
    if (!id) return;

    fetchNotes();
    fetchEmails();
    fetchCalls();
    fetchTasks();
    fetchMeetings();
    fetchActivity();
  }, [id]);
  const handleUpdateTicket = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_name: ticket.name,
          description: editTicket.description || ticket.description,
          status: ticket.status,
          source: ticket.source,
          priority: editTicket.priority || ticket.priority,
          owners: editTicket.ownerIds || ticket.ownerIds || [],
          deal_id: ticket.deal_id || null,
          company_id: ticket.company_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Ticket updated successfully");

      setTicket((prev) => ({
        ...prev,
        name: data.data.ticket_name ?? prev.name,
        description: data.data.description ?? prev.description,
        status: data.data.status ?? prev.status,
        source: data.data.source ?? prev.source,
        priority: data.data.priority ?? prev.priority,
        owner: users
          .filter((u) => (editTicket.ownerIds || []).includes(String(u.id)))
          .map((u) => u.name)
          .join(", "),
        ownerIds: editTicket.ownerIds || prev.ownerIds,
      }));

      setIsEditOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Something went wrong");
    }
  };
  // states for activity tabs
  const [notesData, setNotesData] = useState([]);
  const [emailsData, setEmailsData] = useState([]);
  const [callsData, setCallsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [meetingsData, setMeetingsData] = useState([]);
  const [activities, setActivities] = useState([]);
  /* -------------------- HANDLERS -------------------- */
  const handleSaveMeeting = async () => {
    const plainText = mtNote.replace(/<[^>]*>/g, "").trim();

    if (
      !mtTitle.trim() ||
      !mtStartDate ||
      !mtStartTime ||
      !mtEndTime ||
      !mtAttendees ||
      !plainText
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = localStorage.getItem("token");

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/v1/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_id: Number(id),
          title: mtTitle.trim(),
          start_date: mtStartDate,
          start_time: mtStartTime,
          end_time: mtEndTime,
          attendees: mtAttendees,
          location: mtLocation || null,
          reminder: mtReminder || null,
          note: mtNote,
          created_by: user.id,
        }),
      });

      const data = await res.json();
      console.log("SAVE MEETING RESPONSE:", data);

      if (res.ok && data.success) {
        setMtTitle("");
        setMtStartDate("");
        setMtStartTime("");
        setMtEndTime("");
        setMtAttendees("");
        setMtLocation("");
        setMtReminder("");
        setMtNote("");
        setIsMeetingModalOpen(false);
        setActiveTab("Meetings");
        fetchMeetings();
        fetchActivity();
        toast.success("Meeting created successfully");
      } else {
        alert(data.message || data.error || "Failed to save meeting");
      }
    } catch (err) {
      console.error("SAVE MEETING ERROR:", err);
      alert("Something went wrong while saving meeting");
    }
  };
  const handleEmojiClick = (emojiData) => {
    setEmailBody((prev) => prev + emojiData.emoji);
  };

  const handleEmailFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEmailFiles(files);

    const previews = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));

    setImagePreview(previews);
  };

  const clearEmailModal = () => {
    setEmailTo("");
    setEmailCc("");
    setEmailBcc("");
    setEmailSubject("");
    setEmailBody("");
    setEmailFiles([]);
    setImagePreview([]);
    setShowCcBcc(false);
    setShowEmojiPicker(false);
  };
  const handleOpenEmailModal = () => {
    setEmailTo(ticket?.contact_email || "");
    setEmailCc("");
    setEmailBcc("");
    setEmailSubject("");
    setEmailBody("");
    setEmailFiles([]);
    setImagePreview([]);
    setShowCcBcc(false);
    setShowEmojiPicker(false);
    setIsEmailModalOpen(true);
  };
  const handleSaveTask = async () => {
    const plainText = taskNote.replace(/<[^>]*>/g, "").trim();

    if (
      !taskName.trim() ||
      !taskDueDate ||
      !taskTime ||
      !taskType ||
      !taskPriority ||
      !plainText
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = localStorage.getItem("token");

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      const isAdmin = user?.role === "admin";

      if (isAdmin && (!taskAssignedTo || taskAssignedTo.length === 0)) {
        alert("Please select at least one employee");
        return;
      }

      const assignedUsers = isAdmin ? taskAssignedTo : [user.id];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_id: Number(id),
          task_name: taskName,
          due_date: taskDueDate,
          due_time: taskTime,
          task_type: taskType,
          priority: taskPriority,
          assigned_to: assignedUsers, // admin = multiple, user = own id
          note: taskNote,
          status: "Pending",
          created_by: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTaskName("");
        setTaskDueDate("");
        setTaskTime("");
        setTaskType("");
        setTaskPriority("");
        setTaskAssignedTo([]);
        setTaskNote("");
        setIsTaskModalOpen(false);
        setActiveTab("Tasks");
        fetchTasks();
        fetchActivity();
      } else {
        alert(data.message || data.error || "Failed to save task");
      }
    } catch (err) {
      console.error("SAVE TASK ERROR:", err);
      alert("Something went wrong while saving task");
    }
  };
  const pollCallsAfterStart = () => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes

    const intervalId = setInterval(async () => {
      attempts += 1;

      await fetchCalls();
      await fetchActivity();

      // get latest call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calls/${id}`);
      const data = await res.json();

      if (data.success && data.data?.length > 0) {
        const latestCall = data.data[0];

        setLiveCallStatus(latestCall.call_status || "initiated");
        setLiveCallDuration(latestCall.duration_seconds || 0);

        if (
          ["completed", "failed", "busy", "no-answer", "canceled"].includes(
            latestCall.call_status
          )
        ) {
          clearInterval(intervalId);
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 5000);
  };
  const handleSaveCall = async () => {
    const plainText = callNote.replace(/<[^>]*>/g, "").trim();

    if (!connectedUser.trim() || !callOutcome || !callDate || !callTime || !plainText) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: Number(id),
          connected_to: connectedUser,
          call_outcome: callOutcome,
          call_date: callDate,
          call_time: callTime,
          note: callNote,
          created_by: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConnectedUser("");
        setCallOutcome("");
        setCallDate("");
        setCallTime("");
        setCallNote("");
        setIsCallModalOpen(false);
        setActiveTab("Calls");
        fetchCalls();
        fetchActivity();
      } else {
        alert(data.message || data.error || "Failed to save call");
      }
    } catch (err) {
      console.error("SAVE CALL ERROR:", err);
      alert("Something went wrong while saving call");
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
        alert("Ticket id not found");
        return;
      }

      console.log("ticket full data:", ticket);

      let phone =
        ticket?.contact_phone_number ||
        ticket?.phone_number ||
        ticket?.customer_phone ||
        ticket?.phone ||
        "";

      if (!phone) {
        alert("Customer phone number not found");
        console.log("Missing phone in ticket:", ticket);
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
        ticket_id: parseInt(id, 10),
        customer_phone: phone,
        connected_to: ticket?.name || ticket?.ticket_name || "Customer",
        created_by: Number(user.id),
      };

      console.log("payload:", payload);

      setIsCallPanelOpen(true);
      setLiveCallStatus("calling");
      setLiveCallDuration(0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calls/make-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        await fetchCalls();
        await fetchActivity();
        pollCallsAfterStart();
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/calls/end-call/${liveCallSid}`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (data.success) {
        setLiveCallStatus("completed");
        await fetchCalls();
        await fetchActivity();
      }
    } catch (err) {
      console.error("END CALL ERROR:", err);
    }
  };
  const handleSaveNote = async () => {
    // remove HTML tags and check real text content
    const plainText = noteText.replace(/<[^>]*>/g, "").trim();

    if (!plainText) {
      alert("Note is required");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_id: Number(id),
          note_text: noteText, // rich text HTML
          created_by: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNoteText("");
        setIsNoteModalOpen(false);
        setActiveTab("Notes");
        fetchNotes();
        fetchActivity();
      } else {
        alert(data.message || data.error || "Failed to save note");
      }
    } catch (err) {
      console.error("SAVE NOTE ERROR:", err);
      alert("Something went wrong while saving note");
    }
  };

  const handleSendEmail = async () => {
    if (!id) {
      console.error("Ticket ID is missing");
      return;
    }

    const plainText = emailBody.trim();

    if (!emailTo.trim() || !emailSubject.trim() || !plainText) {
      alert("Recipients, subject and body are required");
      return;
    }

    try {
      setSendingEmail(true);

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("User not found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("ticket_id", Number(id));
      formData.append("recipients", emailTo);
      formData.append("cc", emailCc || "");
      formData.append("bcc", emailBcc || "");
      formData.append("subject", emailSubject);
      formData.append("body", emailBody);
      formData.append("sent_by", user.id);

      emailFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("EMAIL RESPONSE:", data);

      if (res.ok && data.success) {
        clearEmailModal();
        setIsEmailModalOpen(false);
        setActiveTab("Emails");
        await fetchEmails();
        await fetchActivity();
      } else {
        alert(data.message || data.error || "Failed to send email");
      }
    } catch (err) {
      console.error("SEND EMAIL ERROR:", err);
      alert("Something went wrong while sending email");
    } finally {
      setSendingEmail(false);
    }
  };
  const filteredActivities = activities.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.message.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotes = notesData.filter((item) =>
    item.text.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmails = emailsData.filter((item) =>
    item.subject.toLowerCase().includes(search.toLowerCase()) ||
    item.body.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCalls = callsData.filter((item) =>
    item.summary.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTasks = tasksData.filter((item) =>
    (item.task_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredMeetings = meetingsData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  const handleDeleteAttachment = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attachments/${id}`, {
        method: "DELETE",
      });

      setAttachments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };
  if (!ticket) return <div>Loading...</div>;
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
      {/* call status panel */}
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
              {ticket?.name || "Customer"}
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
        onClose={() => {
          setIsEmailModalOpen(false);
          clearEmailModal();
        }}
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
            style={{
              fontSize: "13px",
              color: "#6c63ff",
              cursor: "pointer",
              fontWeight: "500",
              minWidth: "70px",
              textAlign: "right",
            }}
            onClick={() => setShowCcBcc((prev) => !prev)}
          >
            Cc&nbsp;&nbsp;Bcc
          </div>
        </div>

        {showCcBcc && (
          <>
            <div className="border-bottom p-2">
              <input
                type="text"
                value={emailCc}
                onChange={(e) => setEmailCc(e.target.value)}
                placeholder="Cc"
                className="form-control border-0 shadow-none"
              />
            </div>

            <div className="border-bottom p-2">
              <input
                type="text"
                value={emailBcc}
                onChange={(e) => setEmailBcc(e.target.value)}
                placeholder="Bcc"
                className="form-control border-0 shadow-none"
              />
            </div>
          </>
        )}

        <div className="border-bottom p-2">
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="form-control border-0 shadow-none"
          />
        </div>

        <div style={{ padding: "10px", position: "relative" }}>
          <textarea
            rows="10"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Body Text"
            className="form-control border-0 shadow-none"
            style={{ resize: "none" }}
          />

          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                zIndex: 1000,
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        {emailFiles.length > 0 && (
          <div
            style={{
              padding: "0 12px 10px 12px",
              fontSize: "13px",
              color: "#475569",
            }}
          >
            {emailFiles.map((file, index) => (
              <div key={index}>📎 {file.name}</div>
            ))}
          </div>
        )}

        {imagePreview.length > 0 && (
          <div
            style={{
              padding: "0 12px 12px 12px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {imagePreview.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={img.name}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
            ))}
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between p-2 border-top">
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="btn"
            style={{
              background: sendingEmail ? "#a5b4fc" : "#6c63ff",
              color: "white",
              padding: "6px 20px",
              fontSize: "14px",
              border: "none",
              borderRadius: "8px",
              cursor: sendingEmail ? "not-allowed" : "pointer",
            }}
          >
            {sendingEmail ? "Sending..." : "Send"}
          </button>

          <div
            className="d-flex gap-3 text-muted"
            style={{ fontSize: "18px", alignItems: "center" }}
          >
            <label style={{ cursor: "pointer", margin: 0 }}>
              <i className="bi bi-paperclip"></i>
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleEmailFileChange}
              />
            </label>

            <i className="bi bi-link-45deg" style={{ cursor: "pointer" }}></i>

            <i
              className="bi bi-emoji-smile"
              style={{ cursor: "pointer" }}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            ></i>

            <label style={{ cursor: "pointer", margin: 0 }}>
              <i className="bi bi-image"></i>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleEmailFileChange}
              />
            </label>
          </div>

          <i
            className="bi bi-trash text-muted"
            style={{ cursor: "pointer" }}
            onClick={clearEmailModal}
          ></i>
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

      {/* --- CALL MODAL (Sidebar) --- */}
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

      {/* --- TASK MODAL (Sidebar) --- */}
      <ReusableModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create Task"
        type="sidebar"
        onSave={handleSaveTask}
      >
        {/* Task Name */}
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

        {/* Due Date + Time */}
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

        {/* Task Type + Priority */}
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

        {/* Assigned To */}
        <label className="small fw-bold mb-1">
          Assigned to <span className="text-danger">*</span>
        </label>

        {isAdmin ? (
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
                    id={`task-user-${user.id}`}
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
                    htmlFor={`task-user-${user.id}`}
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
            value={`${storedUser?.first_name || ""} ${storedUser?.last_name || ""}`}
            readOnly
          />
        )}

        {/* Note Editor */}
        <label className="small fw-bold mb-1">
          Note <span className="text-danger">*</span>
        </label>

        <div className="mb-3">
          <RichTextEditor
            value={taskNote}
            onChange={setTaskNote}
            placeholder="Enter task note..."
            minHeight="180px"
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
        <select
          className="form-select mb-3"
          value={mtAttendees}
          onChange={(e) => setMtAttendees(e.target.value)}
        >
          <option value="">Choose</option>
          {users.map((user) => (
            <option key={user.id} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>

        {/* Location */}
        <label className="small fw-bold mb-1">Location</label>
        <select
          className="form-select mb-3"
          value={mtLocation}
          onChange={(e) => setMtLocation(e.target.value)}
        >
          <option value="">Choose</option>
          <option>Google Meet</option>
          <option>Zoom</option>
          <option>Office</option>
        </select>

        {/* Reminder */}
        <label className="small fw-bold mb-1">Reminder</label>
        <select
          className="form-select mb-3"
          value={mtReminder}
          onChange={(e) => setMtReminder(e.target.value)}
        >
          <option value="">Choose</option>
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
      {/* ticket edit modal */}
      <ReusableModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Ticket"
        onSave={handleUpdateTicket}
      >
        {/* Description */}
        <label className="small fw-bold mb-1">Description</label>
        <textarea
          value={editTicket.description || ""}
          onChange={(e) =>
            setEditTicket({ ...editTicket, description: e.target.value })
          }
          className="form-control mb-3"
        />

        {/* Multiple Owners */}
        <label className="small fw-bold mb-1">
          Owners <span className="text-danger">*</span>
        </label>
        <div
          style={{
            border: "1px solid #ced4da",
            borderRadius: "6px",
            padding: "10px",
            maxHeight: "160px",
            overflowY: "auto",
            marginBottom: "16px",
            background: "#fff",
          }}
        >
          {users.map((user) => {
            const userId = String(user.id);

            return (
              <div key={user.id} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`edit-owner-${user.id}`}
                  checked={(editTicket.ownerIds || []).includes(userId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditTicket({
                        ...editTicket,
                        ownerIds: [...(editTicket.ownerIds || []), userId],
                      });
                    } else {
                      setEditTicket({
                        ...editTicket,
                        ownerIds: (editTicket.ownerIds || []).filter(
                          (id) => id !== userId
                        ),
                      });
                    }
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`edit-owner-${user.id}`}
                >
                  {user.name}
                </label>
              </div>
            );
          })}
        </div>

        {/* Priority */}
        <label className="small fw-bold mb-1">Priority</label>
        <select
          value={editTicket.priority || ""}
          onChange={(e) =>
            setEditTicket({ ...editTicket, priority: e.target.value })
          }
          className="form-select"
        >
          <option value="">Choose</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
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
              fontSize: "15px",
              marginBottom: "10px",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>‹</span> <strong>Tickets</strong>
          </div>

          {/* Ticket Title & Status */}
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1e293b",
              margin: "0 0 8px 0",
            }}
          >
            {ticket.name}
          </h2>

          <div style={{ marginBottom: "24px", color: "#475569", fontSize: "15px" }}>
            Status :{" "}
            <span
              style={{
                color: "#475569",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {ticket.status} <span style={{ fontSize: "12px" }}>▼</span>
            </span>
          </div>

          {/* Action Icons Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
              background: "#f8fafc",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "8px",
            }}
          >
            {[
              { label: "Note", icon: "bi bi-pencil-square", tab: "Notes" },
              { label: "Email", icon: "bi bi-envelope", tab: "Emails" },
              { label: "Call", icon: "bi bi-telephone", tab: "Calls" },
              { label: "Task", icon: "bi bi-calendar-check", tab: "Tasks" },
              { label: "Meeting", icon: "bi bi-calendar3", tab: "Meetings" },
            ].map((item, idx) => {
              const isActive = activeTab === item.tab;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(item.tab)}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <div
                    style={{
                      background: isActive ? "#6366f1" : "white",
                      color: isActive ? "white" : "#6366f1",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      transition: "0.2s",
                    }}
                  >
                    <i className={item.icon}></i>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
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

          {/* About Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: showAboutDetails ? "20px" : "10px",
            }}
          >
            <div
              onClick={() => setShowAboutDetails(!showAboutDetails)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#1e293b",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "12px" }}>
                {showAboutDetails ? "▼" : "▶"}
              </span>
              About this Ticket
            </div>

            <i
              className="bi bi-pencil"
              style={{ color: "#6366f1", cursor: "pointer" }}
              onClick={() => {
                setEditTicket({
                  description: ticket.description || "",
                  ownerIds: ticket.ownerIds || [],
                  priority: ticket.priority || "",
                });
                setIsEditOpen(true);
              }}
            ></i>
          </div>

          {/* Expand / Collapse Details */}
          {showAboutDetails && (
            <>
              {[
                { label: "Ticket Description", value: ticket.description },
                { label: "Ticket Owners", value: ticket.owner },
                { label: "Priority", value: ticket.priority },
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#5f90d4",
                      marginBottom: "6px",
                    }}
                  >
                    {field.label}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#1e293b",
                      fontWeight: "545",
                    }}
                  >
                    {field.value || "-"}
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
                  borderBottom: activeTab === tab ? "2px solid #6366f1" : "none",
                  color: activeTab === tab ? "#6366f1" : "#64748b",
                  fontWeight: activeTab === tab ? "600" : "400",
                  transition: "all 0.2s ease"
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {activeTab === "Activity" && <Activity activities={filteredActivities} />}

          {activeTab === "Notes" && (
            <Notes
              notes={filteredNotes}
              onCreateNote={() => setIsNoteModalOpen(true)}
            />
          )}

          {activeTab === "Emails" && (
            <Emails
              emails={filteredEmails}
              onCreateEmail={handleOpenEmailModal}
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
        <div style={{ width: "300px", padding: "16px", fontFamily: "sans-serif" }}>

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
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ marginRight: "8px", color: "#6366f1", fontSize: "20px" }}>🤖</span>
              <h6 style={{ color: "#6366f1", fontWeight: "700", margin: 0, fontSize: "14px" }}>
                AI Ticket Summary
              </h6>
            </div>

            <p style={{ fontSize: "13px", color: "#1f2937", lineHeight: "1.5", margin: 0 }}>
              The ticket titled “Payment Failure Issue” currently has no associated
              conversation, call, or note transcripts.
            </p>
          </div>

          {/* Attachments Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "12px", marginRight: "8px", color: "#374151" }}>▼</span>
              <span style={{ fontWeight: "700", color: "#374151", fontSize: "14px" }}>
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

          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px", lineHeight: "1.4" }}>
            See the files attached to your activities or uploaded to this record.
          </p>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileChange}
          />

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  style={{
                    fontSize: "13px",
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* LEFT */}
                  <div>
                    📎{" "}
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/${file.file_path}`}
                      target="_blank"
                      style={{ color: "#6366f1", textDecoration: "none" }}
                    >
                      {file.file_name}
                    </a>
                  </div>

                  {/* RIGHT (DELETE) */}
                  <span
                    onClick={() => handleDeleteAttachment(file.id)}
                    style={{
                      color: "red",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



