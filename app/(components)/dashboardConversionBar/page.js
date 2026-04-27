
"use client";

export default function ConversionBar({ label, percentage, colorClass }) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span
          className="fw-semibold text-secondary"
          style={{ fontSize: "0.75rem" }}
        >
          {label}
        </span>

        <span
          className="text-muted"
          style={{ fontSize: "0.7rem" }}
        >
        </span>
      </div>

      <div
        className="progress"
        style={{
          height: "8px",
          backgroundColor: "#edf2f7",
          borderRadius: "999px",
        }}
      >
        <div
          className={`progress-bar rounded-pill ${colorClass}`}
          role="progressbar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}