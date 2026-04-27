"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Button, Nav, Form, } from "react-bootstrap";
import {
  FaArrowLeft,
  FaRegStickyNote,
  FaEnvelope,
  FaPhoneAlt,
  FaTasks,
  FaVideo,
  FaEdit,
  FaRobot,
  FaSearch,
} from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import ReusableModal from "@/app/(activityComponents)/reusableModal/page";
import ActivityTab from "../components/activity/page";
import NotesTab from "../components/notes/page";
import EmailsTab from "../components/email/page";
import CallsTab from "../components/calls/page";
import TasksTab from "../components/tasks/page";
import MeetingsTab from "../components/meetings/page";
import toast, { Toaster } from "react-hot-toast";


export default function LeadDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [activeTab, setActiveTab] = useState("Notes");
  const [searchTerm, setSearchTerm] = useState("");
  const [allActivities, setAllActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [dealOwners, setDealOwners] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [leadOwners, setLeadOwners] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAbout, setShowAbout] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);
  const [dealForm, setDealForm] = useState({
    deal_name: "",
    amount: "",
    deal_stage: "Negotiation",
    priority: "Medium",
    close_date: "",
    deal_owner_ids: [],
  });
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:7000/api/v1/companies", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setCompaniesList(data.data || []);
        } else {
          setCompaniesList([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompaniesList([]);
      }
    };

    fetchCompanies();
  }, []);
  useEffect(() => {
    const fetchLeadOwners = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:7000/api/auth/signup/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setLeadOwners(data.data || []);
        } else {
          setLeadOwners([]);
        }
      } catch (error) {
        console.error("Error fetching lead owners:", error);
        setLeadOwners([]);
      }
    };

    fetchLeadOwners();
  }, []);
  useEffect(() => {
    const fetchDealOwners = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:7000/api/auth/signup/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setDealOwners(data.data || []);
        } else {
          setDealOwners([]);
        }
      } catch (error) {
        console.error("Error fetching deal owners:", error);
        setDealOwners([]);
      }
    };

    fetchDealOwners();
  }, []);
  //  initial load
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("activities")) || [];
    setAllActivities(stored);
  }, []);

  //  ADD THIS JUST BELOW
  useEffect(() => {
    const handleStorage = () => {
      const stored = JSON.parse(localStorage.getItem("activities")) || [];
      setAllActivities(stored);
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:7000/api/v1/leads/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        const item = data.lead || data.data || data;

        if (!item) return;

        const formatted = {
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          email: item.email,
          phone: item.phone_number,
          jobTitle: item.job_title,
          companyId: item.company_id ? String(item.company_id) : "",
          companyName: item.company_name || "",
          owner_ids: (item.owners || []).map((u) => String(u.id)),
          ownerNames: (item.owners || [])
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", "),
          status: item.status,
          date: item.created_at,
        };

        setLead(formatted);
        setEditedLead(formatted);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) fetchLead();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        first_name: editedLead.firstName,
        last_name: editedLead.lastName,
        email: editedLead.email,
        phone_number: editedLead.phone,
        job_title: editedLead.jobTitle,
        city: null,
        company_id: editedLead.companyId ? Number(editedLead.companyId) : null,
        status: editedLead.status,
        is_converted: false,
        owners: (editedLead.owner_ids || []).map(Number),
      };

      const res = await fetch(`http://localhost:7000/api/v1/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setLead({
          ...editedLead,
          ownerNames: leadOwners
            .filter((u) => (editedLead.owner_ids || []).includes(String(u.id)))
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", "),
          companyName:
            companiesList.find(
              (c) => String(c.id) === String(editedLead.companyId)
            )?.company_name || "",
        });

        setEditedLead((prev) => ({
          ...prev,
          ownerNames: leadOwners
            .filter((u) => (prev.owner_ids || []).includes(String(u.id)))
            .map((u) => `${u.first_name} ${u.last_name}`)
            .join(", "),
          companyName:
            companiesList.find(
              (c) => String(c.id) === String(prev.companyId)
            )?.company_name || "",
        }));

        setIsEditing(false);
        toast.success("Lead updated successfully");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };
  const handleConvert = () => {
    if (!lead || lead.status !== "Qualified") {
      toast.error("Only qualified leads can be converted");
      return;
    }

    setDealForm({
      deal_name: `${lead.firstName} ${lead.lastName} Deal`,
      amount: "",
      deal_stage: "Negotiation",
      priority: "Medium",
      close_date: new Date().toISOString().split("T")[0],
      deal_owner_ids:
        currentUser && currentUser.role !== "admin"
          ? [String(currentUser.id)]
          : [],
    });

    setShowConvertModal(true);
  };
  const handleCreateDeal = async () => {
    try {
      if (!dealForm.amount) {
        toast.error("Please enter amount");
        return;
      }

      if (!dealForm.deal_owner_ids.length) {
        toast.error("Please select at least one deal owner");
        return;
      }

      const payload = {
        deal_name: dealForm.deal_name,
        lead_id: lead.id,
        deal_stage: dealForm.deal_stage,
        amount: Number(dealForm.amount),
        close_date: dealForm.close_date,
        priority: dealForm.priority,
        owners: dealForm.deal_owner_ids.map(Number),
      };
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:7000/api/v1/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deal created successfully ✅");
        setShowConvertModal(false);

        setTimeout(() => {
          router.push(`/deals?leadId=${lead.id}&name=${lead.firstName} ${lead.lastName}`);
        }, 1200);
      } else {
        toast.error(data.message || "Failed to create deal");
      }
    } catch (error) {
      console.error("Create deal error:", error);
      toast.error("Conversion failed ❌");
    }
  };

  const handleAddClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };
  const isImageFile = (fileName = "") => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const handleDeleteAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  if (!lead) return <div className="p-5 text-center">Loading...</div>;
  const filteredActivities =
    searchTerm.trim() === ""
      ? []
      : allActivities.filter((item) => {
        const term = searchTerm.toLowerCase();

        return (
          item.text?.toLowerCase().includes(term) ||
          item.user?.toLowerCase().includes(term) ||
          item.subject?.toLowerCase().includes(term) ||
          item.body?.toLowerCase().includes(term) ||
          item.senderName?.toLowerCase().includes(term) ||
          item.summary?.toLowerCase().includes(term) ||
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.owner?.toLowerCase().includes(term)
        );
      });

  return (
    <>
      <ReusableModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert Lead to Deal"
        onSave={handleCreateDeal}
        type="right"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Qualified Lead ID
            </label>
            <input
              value={lead?.id || ""}
              readOnly
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
                background: "#f8fafc",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Deal Name
            </label>
            <input
              value={dealForm.deal_name}
              onChange={(e) =>
                setDealForm({ ...dealForm, deal_name: e.target.value })
              }
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={dealForm.amount}
              onChange={(e) =>
                setDealForm({ ...dealForm, amount: e.target.value })
              }
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Deal Owners
            </label>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px",
                maxHeight: "160px",
                overflowY: "auto",
                background: "#fff",
              }}
            >
              {(currentUser?.role === "admin"
                ? dealOwners
                : dealOwners.filter((u) => String(u.id) === String(currentUser?.id))
              ).map((user) => {
                const userId = String(user.id);

                return (
                  <div key={user.id} style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={dealForm.deal_owner_ids.includes(userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDealForm((prev) => ({
                              ...prev,
                              deal_owner_ids: [...prev.deal_owner_ids, userId],
                            }));
                          } else {
                            setDealForm((prev) => ({
                              ...prev,
                              deal_owner_ids: prev.deal_owner_ids.filter(
                                (id) => id !== userId
                              ),
                            }));
                          }
                        }}
                      />
                      {user.first_name} {user.last_name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Deal Stage
            </label>
            <select
              value={dealForm.deal_stage}
              onChange={(e) =>
                setDealForm({ ...dealForm, deal_stage: e.target.value })
              }
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
                background: "white",
              }}
            >
              <option value="Negotiation">Negotiation</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Priority
            </label>
            <select
              value={dealForm.priority}
              onChange={(e) =>
                setDealForm({ ...dealForm, priority: e.target.value })
              }
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
                background: "white",
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              Close Date
            </label>
            <input
              type="date"
              value={dealForm.close_date}
              onChange={(e) =>
                setDealForm({ ...dealForm, close_date: e.target.value })
              }
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid #e2e8f0",
                padding: "8px 4px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>
      </ReusableModal>
      <Toaster position="top-right" />
      <div style={{ paddingTop: "45px", paddingLeft: "30px", paddingRight: "45px" }}>
        <Container
          fluid
          className="bg-white  border shadow-md"
          style={{
            paddingLeft: "30px",
            paddingTop: "30px",
            marginLeft: "37px",
            borderRadius: "20px",
            paddingBottom: "15px",
          }}
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center">
            <div
              className="text-muted small"
              onClick={() => router.back()}
              style={{ cursor: "pointer" }}
            >
              <FaArrowLeft className="me-2" /> Leads
            </div>
          </div>

          <Row className="g-4">
            {/* LEFT COLUMN */}
            <Col lg={3} className="border-end pe-3">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="rounded-3 bg-light d-flex align-items-center justify-content-center fw-bold text-secondary"
                  style={{ width: "60px", height: "60px", fontSize: "24px" }}
                >
                  {lead.firstName?.[0]}
                </div>
                <div>
                  <h5 className="fw-bold mb-0">
                    {lead.firstName} {lead.lastName}
                  </h5>
                  <p className="text-muted small mb-0">{lead.jobTitle}</p>
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    {lead.email} 📋
                  </span>
                </div>
              </div>

              <div
                className="px-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(30px, 1fr))",
                  gap: "8px",
                }}
              >
                {[
                  { Icon: FaRegStickyNote, label: "Note", tab: "Notes" },
                  { Icon: FaEnvelope, label: "Email", tab: "Emails" },
                  { Icon: FaPhoneAlt, label: "Call", tab: "Calls" },
                  { Icon: FaTasks, label: "Task", tab: "Tasks" },
                  { Icon: FaVideo, label: "Meet...", tab: "Meetings" },
                ].map((item, i) => {
                  const isActive = activeTab === item.tab;

                  return (
                    <div
                      key={i}
                      className="text-center p-2 border rounded-3 shadow-sm"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor: isActive ? "#f0eeff" : "#ffffff",
                      }}
                      onClick={() => setActiveTab(item.tab)}
                      onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "#f0eeff";
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                    >
                      <item.Icon
                        className="d-block mx-auto mb-1"
                        size={16}
                        style={{ color: "#5e4cf3" }}
                      />

                      <span
                        className="text-muted d-block"
                        style={{ fontSize: "10px", fontWeight: "500" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <div
                  className="d-flex align-items-center justify-content-between mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowAbout(!showAbout)}
                >
                  <div className="d-flex align-items-center gap-2">

                    <FaChevronRight
                      size={12}
                      style={{
                        transform: showAbout ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "0.2s",
                        color: "#6b7280"
                      }}
                    />

                    <span
                      style={{
                        fontWeight: "500",     // lighter
                        fontSize: "14px",
                        color: "#475569",      // softer grey (exact CRM feel)
                      }}
                    >
                      About this lead
                    </span>
                  </div>

                  <FaEdit
                    size={14}
                    style={{ color: "#9ca3af", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  />
                </div>
                {showAbout && (
                  <>
                    {[
                      { label: "Email", key: "email" },
                      { label: "First Name", key: "firstName" },
                      { label: "Last Name", key: "lastName" },
                      { label: "Phone number", key: "phone" },
                      { label: "Lead Status", key: "status" },
                      { label: "Job Title", key: "jobTitle" },
                      { label: "Created Date", key: "date" },
                    ].map((field, idx) => (
                      <div className="mb-3" key={idx}>
                        <label className="text-muted d-block" style={{ fontSize: "11px" }}>
                          {field.label}
                        </label>

                        {isEditing ? (
                          field.key === "status" ? (
                            <Form.Select
                              size="sm"
                              value={editedLead?.status || ""}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option value="New">New</option>
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Qualified">Qualified</option>
                            </Form.Select>
                          ) : (
                            <Form.Control
                              size="sm"
                              value={editedLead?.[field.key] || ""}
                              onChange={(e) =>
                                setEditedLead({
                                  ...editedLead,
                                  [field.key]: e.target.value,
                                })
                              }
                            />
                          )
                        ) : (
                          <span className="small fw-semibold text-dark">
                            {lead?.[field.key]}
                          </span>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <Button
                        size="sm"
                        className="mt-2"
                        style={{ backgroundColor: "#5e4cf3", border: "none" }}
                        onClick={handleUpdate}
                      >
                        Save
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Col>

            <Col lg={6} className="px-lg-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="position-relative flex-grow-1">
                  <FaSearch
                    className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                    size={14}
                  />

                  <Form.Control
                    type="text"
                    placeholder="Search activities"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5 bg-light border-0 py-2 rounded-2"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <Button
                  disabled={lead?.status !== "Qualified"}
                  onClick={handleConvert}
                  className="rounded-2 px-4 border-0"
                  style={{
                    backgroundColor: "#5e4cf3",
                    fontSize: "14px",
                    height: "38px",
                    opacity: lead?.status !== "Qualified" ? 0.5 : 1,
                  }}
                >
                  Convert
                </Button>
              </div>

              <Nav
                variant="tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                style={{ gap: "25px" }}
              >
                {[
                  "Activity",
                  "Notes",
                  "Emails",
                  "Calls",
                  "Tasks",
                  "Meetings",
                ].map((tab) => (
                  <Nav.Item key={tab}>
                    <Nav.Link
                      eventKey={tab}
                      className="px-0 fw-bold"
                      style={{
                        fontSize: "14px",
                        background: "transparent",
                        border: "none",
                        borderBottom:
                          activeTab === tab
                            ? "3px solid #5e4cf3"
                            : "3px solid transparent",
                        color: activeTab === tab ? "#5e4cf3" : "#6c757d",
                      }}
                    >
                      {tab}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {activeTab === "Activity" && (
                <ActivityTab leadId={lead?.id} searchTerm={searchTerm} />
              )}
              {activeTab === "Notes" && (
                <NotesTab
                  leadId={lead?.id}
                  searchTerm={searchTerm}
                  currentUser={currentUser}
                />)}
              {activeTab === "Emails" && (
                <EmailsTab
                  leadId={lead?.id}
                  leadEmail={lead?.email}
                  searchTerm={searchTerm}
                />
              )}
              {activeTab === "Calls" && (
                <CallsTab lead={lead} searchTerm={searchTerm} leadId={lead?.id} />
              )}
              {activeTab === "Tasks" && (
                <TasksTab
                  leadId={lead?.id}
                  searchTerm={searchTerm}
                  users={leadOwners}
                  currentUser={currentUser}
                />
              )}
              {activeTab === "Meetings" && (
                <MeetingsTab
                  leadId={lead?.id}
                  data={filteredActivities}
                  searchTerm={searchTerm}
                />
              )}
            </Col>

            {/* RIGHT COLUMN */}
            <Col lg={3} className="border-start ps-2 pt-3">
              <div
                className="rounded-3 p-3 mb-3 border"
                style={{ backgroundColor: "#f8f9ff" }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaRobot className="text-primary" size={16} />
                  <span className="text-primary small fw-bold">
                    AI Lead Summary
                  </span>
                </div>
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: "12px", lineHeight: "1.6" }}
                >
                  There are no activities associated with this lead.
                </p>
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "16px",
                  fontFamily: "sans-serif",
                  boxSizing: "border-box"
                }}
              >
                {/* Attachments Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    onClick={() => setShowAttachments(!showAttachments)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FaChevronRight
                      size={12}
                      style={{
                        transform: showAttachments ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "0.2s",
                        color: "#6b7280",
                      }}
                    />

                    <span
                      style={{
                        fontWeight: "500",     // lighter
                        fontSize: "14px",
                        color: "#475569",      // softer grey (exact CRM feel)
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
                      marginTop: "4px",
                    }}
                  >
                    + Add
                  </span>
                </div>
                {showAttachments && (
                  <>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "8px",
                        lineHeight: "1.4"
                      }}
                    >
                      See the files attached to your activities or uploaded to this record.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      multiple
                      onChange={handleFileChange}
                    />

                    {attachments.length > 0 ? (
                      <div
                        style={{
                          marginTop: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "12px",
                          minHeight: "100px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          flexWrap: "wrap",
                          background: "#fff",
                        }}
                      >
                        {attachments.map((file, index) => {
                          const fileName = file.file_name || file.name || `file-${index}`;
                          const fileUrl = file.file_path
                            ? `http://localhost:7000/${file.file_path}`
                            : URL.createObjectURL(file);

                          const imageFile = isImageFile(fileName);

                          return (
                            <div
                              key={`${fileName}-${index}`}
                              style={{
                                position: "relative",
                                width: "60px",
                                height: "60px",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                overflow: "hidden",
                                background: "#ffffff",
                                flexShrink: 0,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(index)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  border: "1px solid #ccc",
                                  background: "#fff",
                                  color: "#000",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  zIndex: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>

                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: "block", width: "100%", height: "100%" }}
                              >
                                {imageFile ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#374151",
                                      textAlign: "center",
                                      padding: "8px",
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {fileName.length > 12
                                      ? fileName.slice(0, 12) + "..."
                                      : fileName}
                                  </div>
                                )}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
                        No attachments found
                      </p>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
