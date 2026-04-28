"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff, #e0d9ff)",
      }}
    >
      <div
        className="card shadow-lg"
        style={{
          width: "400px",
          padding: "40px",
          borderRadius: "12px",
          border: "none",
          textAlign: "center",
        }}
      >
        <h2 className="fw-bold mb-3" style={{ color: "#5f4bd8" }}>
          Forgot Password
        </h2>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
          Enter your email address below and we’ll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              style={{
                padding: "12px 15px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white"
            style={{
              background: "linear-gradient(90deg, #5f4bd8, #6c4ed9)",
              borderRadius: "8px",
              height: "45px",
              fontWeight: "600",
              fontSize: "15px",
            }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-muted" style={{ fontSize: "14px" }}>
          Remembered your password?{" "}
          <a
            href="/login"
            className="text-decoration-none"
            style={{ color: "#5f4bd8", fontWeight: "500" }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
