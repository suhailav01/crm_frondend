"use client";

export default function ReusableModal({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveText = "Save",
  type = "sidebar",
  width
}) {
  if (!isOpen) return null;

  // Support both sidebar and right
  const isSidebar = type === "sidebar" || type === "right";
  const modalWidth = width ? width : isSidebar ? "450px" : "550px";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: isSidebar ? "flex-end" : "center",
        alignItems: isSidebar ? "stretch" : "center",
        zIndex: 1050,
        backdropFilter: "blur(2px)"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          width: modalWidth,
          height: isSidebar ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: isSidebar ? "0px" : "10px",
          boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
          animation: isSidebar
            ? "slideInRight 0.3s ease-out"
            : "fadeIn 0.2s ease-out"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h5
            style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "18px"
            }}
          >
            {title}
          </h5>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#999"
            }}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div
          style={{
            padding: "24px",
            flex: 1,
            overflowY: "auto"
          }}
        >
          {children}
        </div>

        {/* FOOTER */}
        {onSave && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "12px"
            }}
          >
            <button
              onClick={onClose}
              className="btn btn-light"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                background: "#6366f1",
                border: "none",
                fontWeight: "600"
              }}
            >
              {saveText}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}