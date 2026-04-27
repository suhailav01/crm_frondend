"use client";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
export default function Page() {

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected company CSV:", file);
    importCompaniesCsv(file);

    e.target.value = "";
  };
  const importCompaniesCsv = async (file) => {
    try {
      const token = localStorage.getItem("token");
      setIsImporting(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("COMPANY CSV DATA:", results.data);

            const rows = results.data || [];

            if (!rows.length) {
              toast.error("CSV is empty");
              setIsImporting(false);
              return;
            }

            const formattedCompanies = rows
              .map((row) => {
                let ownerIds = [];

                if (currentUser?.role === "admin") {
                  ownerIds = row.owners
                    ? row.owners
                      .split(",")
                      .map((id) => id.trim())
                      .filter(Boolean)
                    : [];
                } else if (currentUser?.id) {
                  ownerIds = [String(currentUser.id)];
                }

                return {
                  domain_name: row.domain_name?.trim() || "",
                  company_name: row.company_name?.trim() || "",
                  email: row.email?.trim() || "",
                  phone_number: row.phone_number?.trim() || "",
                  industry: row.industry?.trim() || "",
                  city: row.city?.trim() || "",
                  country_region: row.country_region?.trim() || "",
                  no_of_employees: row.no_of_employees?.trim() || "",
                  annual_revenue: row.annual_revenue?.trim() || "",
                  owners: ownerIds,
                };
              })
              .filter(
                (company) =>
                  company.company_name &&
                  company.phone_number &&
                  company.industry &&
                  company.owners.length > 0
              );

            console.log("FORMATTED COMPANIES:", formattedCompanies);

            if (!formattedCompanies.length) {
              toast.error("No valid rows found in CSV");
              setIsImporting(false);
              return;
            }

            const res = await fetch("http://localhost:7000/api/v1/companies/import", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ companies: formattedCompanies }),
            });

            const data = await res.json();

            if (!res.ok) {
              toast.error(data.message || "Import failed");
              setIsImporting(false);
              return;
            }

            toast.success(
              `Imported ${data.count || formattedCompanies.length} companies successfully`
            );

            await fetchCompanies();
            setIsImporting(false);
          } catch (err) {
            console.error("COMPANY IMPORT ERROR:", err);
            toast.error("Import failed");
            setIsImporting(false);
          }
        },
        error: (err) => {
          console.error("CSV PARSE ERROR:", err);
          toast.error("Failed to read CSV");
          setIsImporting(false);
        },
      });
    } catch (err) {
      console.error("CSV IMPORT ERROR:", err);
      toast.error("Import failed");
      setIsImporting(false);
    }
  };
  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Company name is required";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!selectedUsers || selectedUsers.length === 0) {
      newErrors.owner = "At least one owner is required";
    }
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const API = "http://localhost:7000/api/v1/companies";
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return;
      }

      const res = await fetch(API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      console.log("API RESPONSE:", result);

      if (!res.ok) {
        console.log("Fetch companies failed:", result.message);
        return;
      }

      const companiesArray = Array.isArray(result)
        ? result
        : result.data || result.companies || [];

      const formatted = companiesArray.map((c) => ({
        id: c.id,
        domain_name: c.domain_name || "",
        name: c.company_name,
        email: c.email || "",
        owner: (c.owners || []).map((u) => `${u.first_name} ${u.last_name}`).join(", "),
        user_ids: (c.owners || []).map((u) => String(u.id)),
        phone: c.phone_number,
        industry: c.industry,
        city: c.city,
        country: c.country_region,
        no_of_employees: c.no_of_employees || "",
        annual_revenue: c.annual_revenue || "",
        created: new Date(c.created_at).toLocaleString(),
      }));

      setCompanies(formatted);
    } catch (err) {
      console.error("Fetch companies error:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
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

        const usersArray = Array.isArray(data.data) ? data.data : [];

        const formattedUsers = usersArray.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Users fetch error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const visibleUsers =
    currentUser?.role === "admin"
      ? users
      : users.filter((u) => String(u.id) === String(currentUser?.id));
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      setSelectedUsers([String(currentUser.id)]);
    }
  }, [currentUser]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  // 3️⃣ Filter companies based on searchTerm
  const filteredCompanies = companies.filter((company) => {
    if (searchTerm.trim() === "") return true; // show all if empty
    return (
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const [formData, setFormData] = useState({
    domain_name: "",
    name: "",
    email: "",
    phone: "",
    industry: "",
    type: "",
    city: "",
    country: "",
    no_of_employees: "",
    annual_revenue: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSave = async () => {
    if (!validate()) return;
    const token = localStorage.getItem("token");

    try {
      const payload = {
        domain_name: formData.domain_name || "",
        company_name: formData.name,
        email: formData.email || "",
        phone_number: formData.phone,
        industry: formData.industry,
        city: formData.city,
        country_region: formData.country,
        no_of_employees: formData.no_of_employees,
        annual_revenue: formData.annual_revenue,
        owners: selectedUsers,
      };

      console.log("selectedUsers:", selectedUsers);
      console.log("payload:", payload);

      let res;

      if (editId) {
        console.log("Updating ID:", editId);

        res = await fetch(`${API}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      console.log("API RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong");
      }

      await fetchCompanies();

      setFormData({
        domain_name: "",
        name: "",
        email: "",
        phone: "",
        industry: "",
        type: "",
        city: "",
        country: "",
        no_of_employees: "",
        annual_revenue: "",
      });

      setSelectedUsers(
        currentUser && currentUser.role !== "admin"
          ? [String(currentUser.id)]
          : []
      );
      setEditId(null);
      setErrors({});
      setOpenModal(false);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message);
    }
  };
  const handleEdit = (company) => {
    setFormData(company);
    setSelectedUsers(
      currentUser && currentUser.role !== "admin"
        ? [String(currentUser.id)]
        : (company.user_ids || [])
    );
    setEditId(company.id);
    setOpenModal(true);
  };
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("DELETE RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }
      await fetchCompanies();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchError("Search cannot be empty");
    } else {
      setSearchError("");
    }
  };
  return (
    <div
      className="bg-light min-vh-100 "
      style={{
        width: "100%",
        marginLeft: "20px",
        padding: "50px 30px 50px 50px",
      }}    >
      {/* WHITE CARD */}
      <div className="bg-white rounded-4 p-4 shadow-sm">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-semibold mb-0">Companies</h5>

          <div className="d-flex gap-2">
            <>
              <input
                type="file"
                accept=".csv"
                id="companyCsvInput"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              <button
                className="px-4 py-2 rounded-3 fw-medium"
                style={{
                  border: "1px solid #635BFF",
                  background: "#fff",
                  color: "#635BFF",
                }}
                onClick={() => document.getElementById("companyCsvInput").click()}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Import"}
              </button>
            </>

            <button
              onClick={() => {
                setFormData({
                  domain_name: "",
                  name: "",
                  email: "",
                  phone: "",
                  industry: "",
                  type: "",
                  city: "",
                  country: "",
                  no_of_employees: "",
                  annual_revenue: "",
                });
                setSelectedUsers(
                  currentUser && currentUser.role !== "admin"
                    ? [String(currentUser.id)]
                    : []
                );
                setEditId(null);
                setErrors({});
                setOpenModal(true);
              }}
              className="px-4 py-2 rounded-3 text-white fw-medium"
              style={{
                background: "#635BFF",
                border: "none",
              }}
            >
              Create
            </button>
          </div>
        </div>

        {/* SEARCH + PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search phone, name, city"
            className="form-control"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              maxWidth: "300px",
              borderRadius: "20px",
            }}
          />

          {/* PAGINATION */}
          <div className="d-flex align-items-center gap-2">
            <span
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              style={{ color: "#999", cursor: "pointer" }}
            >
              ← Previous
            </span>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: num === currentPage ? "#635BFF" : "transparent",
                  color: num === currentPage ? "#fff" : "#333",
                }}
              >
                {num}
              </button>
            ))}

            <span
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              style={{ color: "#635BFF", cursor: "pointer" }}
            >
              Next →
            </span>
          </div>
        </div>

        {/* FILTER (SIMPLE UI) */}
        <div className="d-flex gap-2 mb-3">
          <select className="form-select w-auto">
            <option>Industry Type</option>
          </select>
          <select className="form-select w-auto">
            <option>City</option>
          </select>
          <select className="form-select w-auto">
            <option>Country/Region</option>
          </select>
          <select className="form-select w-auto">
            <option>Lead Status</option>
          </select>
          <input type="date" className="form-control w-auto" />
        </div>

        <div className="table-responsive rounded-3 overflow-hidden">
          <table className="table align-middle mb-0">

            <thead>
              <tr>
                <th style={headerStyle}></th>
                <th style={headerStyle}>Company Name</th>
                <th style={headerStyle}>Email</th>
                <th style={headerStyle}>company Owner</th>
                <th style={headerStyle}>phone Number</th>
                <th style={headerStyle}>Industry</th>
                <th style={headerStyle}>City</th>
                <th style={headerStyle}>Country</th>
                <th style={headerStyle}>Created Date</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {paginatedCompanies.map((company) => (
                <tr
                  key={company.id}
                  style={{ borderBottom: "1px solid #eee" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td>
                    <input type="checkbox" />
                  </td>

                  <td
                    className="p-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/companies/${company.id}`)}
                  >
                    {company.name}
                  </td>
                  <td className="p-2 text-secondary small">{company.email}</td>
                  <td className="p-2 text-secondary small">{company.owner}</td>
                  <td className="p-2 text-secondary small">{company.phone}</td>
                  <td className="p-2 text-secondary small">{company.industry}</td>
                  <td className="p-2 text-secondary small">{company.city}</td>
                  <td className="p-2 text-secondary small">{company.country}</td>
                  <td className="p-2 text-secondary small">{company.created}</td>

                  <td className="p-3">
                    <div className="d-flex gap-3">
                      <Pencil
                        size={16}
                        style={{ color: "#635BFF", cursor: "pointer" }}
                        onClick={() => handleEdit(company)}
                      />
                      <Trash2
                        size={16}
                        style={{ color: "#ff4d4f", cursor: "pointer" }}
                        onClick={() => handleDelete(company.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL */}
      {openModal && (
        <>
          <div
            onClick={() => setOpenModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(5px)",
              zIndex: 1040,
            }}
          />

          {/* SIDE MODAL */}
          <div
            className="position-fixed top-0 end-0 bg-white shadow"
            style={{
              width: "420px",
              height: "100vh",
              zIndex: 1050,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h6 className="fw-semibold mb-0">
                {editId ? "Edit Company" : "Create Company"}
              </h6>

              <span
                onClick={() => setOpenModal(false)}
                style={{ cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </span>
            </div>

            {/* BODY */}
            <div className="p-4" style={{ overflowY: "auto", flex: 1 }}>
              {/* Domain Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Domain Name <span className="text-danger">*</span>
                </label>
                <input
                  name="domain_name"
                  value={formData.domain_name || ""}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter"
                />
                {errors.domain && (
                  <small className="text-danger">{errors.domain}</small>
                )}
              </div>

              {/* Company Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter"
                />
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>

              {/* NEW EMAIL FIELD */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter company email"
                />
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>

              {/* ✅ MULTIPLE OWNERS */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Company Owners <span className="text-danger">*</span>
                </label>

                {currentUser?.role === "admin" ? (
                  <div
                    style={{
                      border: "1px solid #ced4da",
                      borderRadius: "6px",
                      padding: "10px",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {visibleUsers.map((user) => {
                      const userId = String(user.id);

                      return (
                        <div key={user.id} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(userId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers((prev) => [...prev, userId]);
                              } else {
                                setSelectedUsers((prev) =>
                                  prev.filter((id) => id !== userId)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`user-${user.id}`}
                          >
                            {user.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={
                      currentUser
                        ? currentUser.name ||
                        `${currentUser.first_name || ""} ${currentUser.last_name || ""
                          }`.trim()
                        : ""
                    }
                    readOnly
                  />
                )}

                {errors.owner && (
                  <small className="text-danger">{errors.owner}</small>
                )}
              </div>

              {/* Industry + Type */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Industry <span className="text-danger">*</span>
                  </label>

                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Choose</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Financial Advisory">Financial Advisory</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Logistics & Supply Chain">
                      Logistics & Supply Chain
                    </option>
                    <option value="Marketing Agencies">Marketing Agencies</option>
                    <option value="Education Technology">Education Technology</option>
                  </select>

                  {errors.industry && (
                    <small className="text-danger">{errors.industry}</small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Type</label>

                  <select
                    name="type"
                    value={formData.type || ""}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Choose</option>
                    <option value="Startup">Startup</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                    <option value="Government">Government</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>
                </div>
              </div>

              {/* City + Country */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Country</label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">No of employees</label>
                  <input
                    name="no_of_employees"
                    value={formData.no_of_employees || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Annual Revenue</label>
                  <input
                    name="annual_revenue"
                    value={formData.annual_revenue || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Phone Number <span className="text-danger">*</span>
                </label>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />

                {errors.phone && (
                  <small className="text-danger">{errors.phone}</small>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-3 border-top d-flex gap-2">
              <button
                className="btn btn-light w-50"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="btn w-50 text-white"
                style={{
                  background: "linear-gradient(90deg, #635BFF, #5e4cf3)",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* HEADER STYLE */
const headerStyle = {
  background: "#635BFF",
  color: "white",
  padding: "20px",
  fontSize: "13px",
  fontWeight: "400",
  border: "none",
};
