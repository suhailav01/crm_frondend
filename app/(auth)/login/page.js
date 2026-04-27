"use client";
import { toast } from "react-toastify";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN DATA:", data);

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful");
        if (data.user?.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/leads"); 
        }
      } else {
         toast.error(data.message || "Login failed ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong ❌");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        className="card shadow-sm "
        style={{
          padding: "40px",
          height: "285px",
          width: "430px",
          // borderRadius: "10px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <h3 className="text-center fw-bold mt-5 ">Log in</h3>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label text-muted">Email</label>
            <input
              style={{ width: "350px" }}
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label className="form-label text-muted">Password</label>
              <Link
                href="/reset-password"
                className="text-decoration-none"
                style={{ fontSize: "14px" }}
              >
                Forgot password?
              </Link>
            </div>

            <div style={{ width: "350px" }}
              className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="input-group-text bg-white"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn w-100 text-white"
            style={{
              background: "linear-gradient(90deg, #5f4bd8, #6c4ed9)",
              borderRadius: "6px",
              height: "42px",
            }}
          >
            Log in
          </button>
        </form>

        {/* Bottom text */}
        <p className="text-center mt-5 mb-0 text-muted">
          Don’t have an account?{" "}
          <a href="/register" className="text-decoration-none">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
