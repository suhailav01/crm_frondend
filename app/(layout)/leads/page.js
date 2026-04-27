"use client";
import React, { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/app/(components)/dataTable/page";
import { FilterBar } from "@/app/(components)/filterBar/page";
import { Pagination } from "@/app/(components)/pagination/page";
import { SideModal } from "@/app/(components)/sideModal/page";
import { SearchBar } from "@/app/(components)/searchBar/page";
import styles from "./style.module.css";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import Papa from "papaparse";
export default function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const itemsPerPage = 5;
  const [companiesList, setCompaniesList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    console.log("Selected file:", file);

    importCsv(file);

    e.target.value = "";
  };
  const importCsv = async (file) => {
  try {
    const token = localStorage.getItem("token");
    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log("CSV DATA:", results.data);

          const rows = results.data || [];

          if (!rows.length) {
            toast.error("CSV is empty");
            setIsImporting(false);
            return;
          }

          const formattedLeads = rows
            .map((row) => {
              const companyId = row.company_id ? Number(row.company_id) : null;

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
                first_name: row.first_name?.trim() || "",
                last_name: row.last_name?.trim() || "",
                email: row.email?.trim() || "",
                phone_number: row.phone_number?.trim() || "",
                job_title: row.job_title?.trim() || "",
                city: row.city?.trim() || null,
                company_id: companyId,
                status: row.status?.trim() || "New",
                is_converted: false,
                owners: ownerIds,
              };
            })
            .filter(
              (lead) =>
                lead.first_name &&
                lead.email &&
                lead.phone_number &&
                lead.owners.length > 0
            );

          console.log("FORMATTED LEADS:", formattedLeads);

          if (!formattedLeads.length) {
            toast.error("No valid rows found in CSV");
            setIsImporting(false);
            return;
          }

          const res = await fetch("http://localhost:7000/api/v1/leads/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ leads: formattedLeads }),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Import failed");
            setIsImporting(false);
            return;
          }

          toast.success(`Imported ${data.count || formattedLeads.length} leads successfully`);
          await fetchLeads();
          setIsImporting(false);
        } catch (err) {
          console.error("IMPORT ERROR:", err);
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
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:7000/api/v1/companies", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("COMPANIES API RESPONSE:", data);

        if (data.success) {
          setCompaniesList(data.data || []);
        } else {
          setCompaniesList([]);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompaniesList([]);
      }
    };

    fetchCompanies();
  }, []);
  const router = useRouter();

  const handleRowClick = (item) => {
    router.push(`/leads/${item.id}`);
  };

  const headers = [
    "NAME",
    "EMAIL",
    "PHONE NUMBER",
    "COMPANY",
    "CONTACT OWNER",
    "CREATED DATE",
    "LEAD STATUS",
    "ACTIONS",
  ];
  const [ownersList, setOwnersList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const visibleOwners =
    currentUser?.role === "admin"
      ? ownersList
      : ownersList.filter((u) => String(u.id) === String(currentUser?.id));
  useEffect(() => {
    const fetchOwners = async () => {
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

        if (data.success) {
          setOwnersList(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching owners:", err);
      }
    };

    fetchOwners();
  }, []);



  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    jobTitle: "",
    companyId: "",
    status: "New",
  });

  const [leadsData, setLeadsData] = useState([]);
  const API_URL = "http://localhost:7000/api/v1/leads";
  // fetch leads
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      const formatted = data.data.map((item) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone_number,
        jobTitle: item.job_title,
        companyId: item.company_id ? String(item.company_id) : "",
        companyName: item.company_name || "",
        owner: (item.owners || [])
          .map((u) => `${u.first_name} ${u.last_name}`)
          .join(", "),
        user_ids: (item.owners || []).map((u) => String(u.id)),
        status: item.status,
        date: item.created_at,
      }));
      setLeadsData(formatted);
    } catch (error) {
      console.error(error);
    }
  };



  useEffect(() => {
    fetchLeads();
  }, []);
  const validate = () => {
    let newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!selectedUsers.length) newErrors.owner = "At least one owner is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone_number: formData.phone,
      job_title: formData.jobTitle,
      city: null,
      company_id: formData.companyId ? Number(formData.companyId) : null,
      status: formData.status,
      is_converted: false,
      owners: selectedUsers,
    };

    try {
      const token = localStorage.getItem("token");

      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      fetchLeads();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      companyId: "",
      status: "New",
    });
    setSelectedUsers([]);
    setErrors({});
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Lead deleted successfully");
      fetchLeads();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      email: item.email || "",
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      phone: item.phone || "",
      jobTitle: item.jobTitle || "",
      companyId: item.companyId || "",
      status: item.status || "New",
    });

    setSelectedUsers(
      currentUser && currentUser.role !== "admin"
        ? [String(currentUser.id)]
        : (item.user_ids || [])
    );
    setEditId(item.id);
    setIsModalOpen(true);
  };
  const confirmDelete = (id) => {
    toast((t) => (
      <div
        style={{
          padding: "10px",
          minWidth: "350px",
        }}
      >
        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
          Delete this lead?
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "5px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
            onClick={() => {
              handleDelete(id);
              toast.dismiss(t.id);
            }}
          >
            Delete
          </button>

          <button
            style={{
              background: "#e9ecef",
              border: "none",
              padding: "5px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const filteredData = useMemo(() => {
    return leadsData.filter((item) => {
      const matchesSearch =
        item.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.includes(search);
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesDate = dateFilter ? item.date === dateFilter : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, leadsData, statusFilter, dateFilter]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusBadge = (status) => {
    const stylesMap = {
      Open: "bg-success-subtle text-success border-success-subtle",
      New: "bg-info-subtle text-info border-info-subtle",
      "In Progress": "bg-warning-subtle text-warning border-warning-subtle",
    };
    return (
      <span
        className={`badge border rounded-1 px-3 py-1 fw-normal ${stylesMap[status] || "bg-light text-dark"}`}
        style={{ fontSize: "11px" }}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className={`container-fluid ${styles.container}`}>
        <div className={`mb-2 border shadow-sm p-3 ${styles.Head}`}>
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <h4 className="fw-bold m-0" style={{ fontFamily: "initial" }}>
              Leads
            </h4>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <>
                <input
                  type="file"
                  accept=".csv"
                  id="csvInput"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                <button
                  className="btn btn-outline-primary px-4"
                  onClick={() => document.getElementById("csvInput").click()}
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : "Import"}
                </button>
              </>
              <button
                className="btn text-white px-4"
                style={{ backgroundColor: "#5e4cf3" }}
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    email: "",
                    firstName: "",
                    lastName: "",
                    phone: "",
                    jobTitle: "",
                    companyId: "",
                    status: "New",
                  });
                  setSelectedUsers(
                    currentUser && currentUser.role !== "admin"
                      ? [String(currentUser.id)]
                      : []
                  );
                  setErrors({});
                  setIsModalOpen(true);
                }}
              >
                Create
              </button>
            </div>
          </div>
          <hr></hr>

          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <SearchBar
                value={search}
                onChange={(val) => setSearch(val)}
                placeholder="Search phone, name, email"
              />
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-md-end">
              <Pagination
                current={currentPage}
                total={Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3 p-0 border overflow-hidden shadow-sm bg-white">
          <div className="table-responsive p-4">
            <div className="d-flex gap-3 mb-3">
              <FilterBar
                filters={[
                  {
                    label: "Lead Status",
                    options: ["Open", "New", "In Progress"],
                    onChange: (val) => setStatusFilter(val),
                  },
                ]}
              />
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: "200px", height: "40px" }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <DataTable
              headers={headers}
              data={paginatedData}
              renderRow={(item) => (
                <>
                  <td
                    className="small text-dark py-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.firstName} {item.lastName}
                  </td>

                  <td
                    className="small text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.email}
                  </td>

                  <td
                    className="small text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.phone}
                  </td>
                  <td
                    className="small text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.companyName || "-"}
                  </td>
                  <td
                    className="small text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.owner || "-"}
                  </td>
                  <td
                    className="small text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(item)}
                  >
                    {item.date}
                  </td>

                  <td>{getStatusBadge(item.status)}</td>

                  <td>
                    <div className="d-flex gap-3 align-items-center">
                      <FaEdit
                        size={16}
                        title="Edit"
                        style={{
                          color: "#5e4cf3",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onClick={() => handleEdit(item)}
                      />

                      <FaTrash
                        size={16}
                        title="Delete"
                        style={{
                          color: "#dc3545",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onClick={() => confirmDelete(item.id)}
                      />
                    </div>
                  </td>
                </>
              )}
            />
          </div>
        </div>
        <>
          {isModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 1040,
                transition: "all 0.3s ease",
              }}
              onClick={resetForm}
            />
          )}

          <div
            style={{
              filter: isModalOpen ? "blur(4px)" : "none",
              transition: "filter 0.3s ease",
            }}
          ></div>
          <SideModal
            isOpen={isModalOpen}
            onClose={resetForm}
            title={editId ? "Edit Lead" : "Create Lead"}
          >
            <div
              className="d-flex flex-column"
              style={{ height: "calc(100vh - 100px)" }}
            >
              <div
                className="flex-grow-1 pe-2"
                style={{ overflowY: "auto", overflowX: "hidden" }}
              >
                <div className="mb-2 mt-2">
                  <label className="form-label small fw-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  {errors.firstName && (
                    <small className="text-danger">{errors.firstName}</small>
                  )}
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  {errors.phone && (
                    <small className="text-danger">{errors.phone}</small>
                  )}
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                  />
                </div>

                {/* ✅ NEW COMPANY FIELD */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Company
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.companyId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, companyId: e.target.value })
                    }
                  >
                    <option value="">Select Company</option>
                    {(companiesList || []).map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <small className="text-danger">{errors.companyId}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Contact Owners <span className="text-danger">*</span>
                  </label>

                  {currentUser?.role === "admin" ? (
                    <div
                      style={{
                        border: "1px solid #ced4da",
                        borderRadius: "6px",
                        padding: "10px",
                        maxHeight: "160px",
                        overflowY: "auto",
                        background: "#fff",
                      }}
                    >
                      {visibleOwners.map((user) => {
                        const userId = String(user.id);

                        return (
                          <div key={user.id} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`lead-owner-${user.id}`}
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
                              htmlFor={`lead-owner-${user.id}`}
                            >
                              {user.first_name} {user.last_name}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={
                        currentUser
                          ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
                          : ""
                      }
                      readOnly
                    />
                  )}

                  {errors.owner && (
                    <small className="text-danger">{errors.owner}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Lead Status
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="New">New</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Qualified">Qualified</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 pt-3 border-top bg-white mt-auto">
                <button
                  className="btn btn-light btn-sm w-50"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-sm text-white w-50"
                  style={{ backgroundColor: "#5e4cf3" }}
                  onClick={handleSave}
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </SideModal>
        </>
      </div>
    </>
  );
}
