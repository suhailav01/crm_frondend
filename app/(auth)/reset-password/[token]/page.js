"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const { token } = useParams();

  const getStrength = () => {
    if (newPassword.length < 6) return 25;
    if (newPassword.length < 10) return 60;
    return 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setMessage("Password reset successfully ✅");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container d-flex align-items-center justify-content-center">
      <div className="card reset-card p-4 shadow-lg">
        <h3 className="text-center mb-2 fw-bold">Reset Password </h3>
        <p className="text-center text-muted small mb-4">
          Enter your new password
        </p>

        {/* ALERTS */}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {message && <div className="alert alert-success py-2">{message}</div>}

        {/* INPUT */}
        <div className="mb-3 position-relative">
          <input
            type={show ? "text" : "password"}
            className="form-control form-control-lg pe-5"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <span className="eye-icon" onClick={() => setShow(!show)}>
            {show ? <Eye size={20} /> : <EyeOff size={20} />}
          </span>
        </div>
        {newPassword && (
          <div className="mb-3">
            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar"
                style={{ width: `${getStrength()}%` }}
              ></div>
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <p className="text-center text-muted small mt-3">
          Use at least 6 characters
        </p>
      </div>
    </div>
  );
}
