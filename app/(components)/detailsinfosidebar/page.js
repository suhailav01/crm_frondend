"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaRegStickyNote,
  FaTasks,
  FaVideo,
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const DetailsInfoSidebar = ({
  deal = {},
  activeTab,
  onTabChange,
  onSaveEdit,
}) => {
  /* EDIT STATE */
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    owner: "",
    priority: "",
    createdDate: "",
  });

  // 🔥 USERS STATE
  const [users, setUsers] = useState([]);

  // 🔥 FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup/users"
        );
        const data = await res.json();

        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // 👉 EDIT CLICK
  const handleEdit = () => {
    setFormData({
      owner: deal.deal_owner || "", // ID store cheyyum
      priority: deal.priority || "",
      createdDate: deal.created_at
        ? deal.created_at.split("T")[0]
        : "",
    });

    setIsEditing(true);
  };

  // 👉 SAVE CLICK
  const handleSave = () => {
    onSaveEdit && onSaveEdit(formData); // 🔥 parent API call
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  /* TABS */
  const tabs = [
    { key: "Notes", label: "Note", icon: FaRegStickyNote },
    { key: "Emails", label: "Email", icon: FaEnvelope },
    { key: "Calls", label: "Call", icon: FaPhoneAlt },
    { key: "Tasks", label: "Task", icon: FaTasks },
    { key: "Meetings", label: "Meeting", icon: FaVideo },
  ];

  const handleTabClick = (key) => {
    onTabChange && onTabChange(key);
  };

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      {/* HEADER */}
      <h5 className="fw-bold mb-1">{deal.deal_name}</h5>

      <p className="text-muted small mb-1">
        Amount : <strong>{deal.amount || "-"}</strong>
      </p>

      <p className="text-primary small fw-semibold mb-3">
        Stage : {deal.deal_stage || "-"}
      </p>

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-2 mb-4 flex-wrap justify-content-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`border rounded-3 text-center ${activeTab === tab.key
                  ? "bg-primary text-white border-primary"
                  : "bg-light border-0"
                }`}
            >
              <Icon
                size={14}
                className={`mb-1 ${activeTab === tab.key ? "text-white" : "text-primary"
                  }`}
              />
              <div style={{ fontSize: "11px" }}>{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* ABOUT SECTION */}
      <div className="p-3 bg-light rounded-3">
        {!isEditing && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold small m-0">About this Deal</h6>

            <button
              onClick={handleEdit}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f5f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FiEdit size={16} color="#4f46e5" />
            </button>
          </div>
        )}

        {/* OWNER */}
        <div className="mb-2">
          <small className="text-muted">Deal Owner</small>

          {isEditing ? (
            <select
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className="form-control form-control-sm"
            >
              <option value="">Choose</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          ) : (
            <div className="fw-semibold small">
              {deal?.owners?.length
                ? deal.owners
                  .map((u) => `${u.first_name || ""} ${u.last_name || ""}`.trim())
                  .join(", ")
                : "—"}
            </div>
          )}
        </div>

        {/* PRIORITY */}
        <div className="mb-2">
          <small className="text-muted">Priority</small>

          {isEditing ? (
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-control form-control-sm"
            >
              <option value="">Choose</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          ) : (
            <div className="fw-semibold small">{deal.priority}</div>
          )}
        </div>

        {/* CREATED DATE */}
        <div className="mb-2">
          <small className="text-muted">Created Date</small>

          {isEditing ? (
            <input
              type="date"
              name="createdDate"
              value={formData.createdDate}
              onChange={handleChange}
              className="form-control form-control-sm"
            />
          ) : (
            <div className="fw-semibold small">
              {new Date(deal.created_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        {isEditing && (
          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="btn btn-light btn-sm w-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsInfoSidebar;