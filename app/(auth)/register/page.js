"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    company_name: "",
    industry_type: "",
    country_region: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = "Enter a valid phone number";
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.industry_type) {
      newErrors.industry_type = "Please select an industry";
    }

    if (!formData.country_region.trim()) {
      newErrors.country_region = "Country or region is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setServerError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone_number: formData.phone_number.trim(),
          company_name: formData.company_name.trim(),
          industry_type: formData.industry_type,
          country_region: formData.country_region.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log("REGISTER DATA:", data);

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (data.user?.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        setServerError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
      }}
    >
      <div className="container mt-4">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-10 col-lg-9">
            <div
              className="card"
              style={{
                padding: "30px",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
              }}
            >
              <h4 className="text-center fw-bold mb-4">Register</h4>

              {serverError && (
                <div className="alert alert-danger py-2" role="alert">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleRegister} noValidate>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className={`form-control ${
                        errors.first_name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your first name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.first_name}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className={`form-control ${
                        errors.last_name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your last name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.last_name}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.email}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      className={`form-control ${
                        errors.phone_number ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your phone number"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.phone_number}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      className={`form-control ${
                        errors.company_name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your company name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.company_name}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Industry Type</label>
                    <select
                      name="industry_type"
                      className={`form-select ${
                        errors.industry_type ? "is-invalid" : ""
                      }`}
                      value={formData.industry_type}
                      onChange={handleChange}
                    >
                      <option value="">Choose</option>
                      <option value="IT">IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                    </select>
                    <div className="invalid-feedback">
                      {errors.industry_type}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Country or Region</label>
                    <input
                      type="text"
                      name="country_region"
                      className={`form-control ${
                        errors.country_region ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your country or region"
                      value={formData.country_region}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      {errors.country_region}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.password}</div>
                  </div>

                  <div className="col-12 mt-3">
                    <button
                      type="submit"
                      className="btn"
                      disabled={loading}
                      style={{
                        width: "370px",
                        background:
                          "linear-gradient(90deg, #5f4bd8, #6c4ed9)",
                        color: "#fff",
                        borderRadius: "6px",
                        height: "42px",
                      }}
                    >
                      {loading ? "Registering..." : "Register"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p className="text-center mt-4 text-muted">
              Already have an account?{" "}
              <a href="/login" className="text-decoration-none">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}