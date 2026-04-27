
"use client";

export default function StatCard({ title, value, icon, iconStyle }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p
            className="text-muted mb-1 fw-medium"
            style={{ fontSize: "0.9rem" }}
          >
            {title}
          </p>

          <h2
            className="fw-bold mb-0"
            style={{
              fontSize: "1.9rem",
              color: "#111827",
              lineHeight: "1.1",
            }}
          >
            {value}
          </h2>
        </div>

        <div
          className="d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: "56px",
            height: "56px",
            minWidth: "56px",
            ...iconStyle,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}