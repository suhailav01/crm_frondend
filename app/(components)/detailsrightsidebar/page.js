"use client";
import { FaRobot, FaPlus } from "react-icons/fa";

const DetailsRightSidebar = ({
  summary,
  attachmentsNote,
  onAddClick,
}) => {

  return (
    <div className="ps-lg-3">
      {/* AI Deal Summary Box */}
      <div
        className="rounded-3 p-3 mb-4 border"
        style={{ 
          backgroundColor: "#f8f9ff", 
          borderColor: "#7c4dff !important",
          borderWidth: "1px",
          borderStyle: "solid" 
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <FaRobot className="text-primary" size={18} />
          <span className="text-primary small fw-bold" style={{ color: "#6366f1" }}>
            AI Deal Summary
          </span>
        </div>
        <p className="text-muted mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>
          {summary}
        </p>
      </div>

      {/* Attachments Section */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="fw-bold m-0 small text-dark d-flex align-items-center gap-1">
            <span style={{ fontSize: "14px", transform: "rotate(-15deg)" }}></span> Attachments
          </h6>
          <button
  type="button" 
  onClick={onAddClick}
  className="btn btn-link p-0 text-primary text-decoration-none small fw-bold"
>
  + Add
</button>
        </div>
        <p className="text-muted" style={{ fontSize: "12px", lineHeight: "1.4" }}>
          {attachmentsNote}
        </p>
      </div>
    </div>
  );
};

export default DetailsRightSidebar;