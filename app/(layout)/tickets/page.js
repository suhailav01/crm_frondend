"use client";
import { useEffect, useState } from "react";
import { SearchBar } from "@/app/(components)/searchBar/page";
import { SideModal } from "@/app/(components)/sideModal/page";
import { DataTable } from "@/app/(components)/dataTable/page";
import { Pagination } from "@/app/(components)/pagination/page";
import { FilterBar } from "@/app/(components)/filterBar/page";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import Papa from "papaparse";
import "react-toastify/dist/ReactToastify.css";
export default function TicketsPage() {
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dealsList, setDealsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const handleTicketFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected ticket CSV:", file);
    importTicketsCsv(file);

    e.target.value = "";
  };
  const importTicketsCsv = async (file) => {
    const loadingToast = toast.loading("Importing tickets...");

    try {
      const token = localStorage.getItem("token");
      setIsImporting(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("TICKET CSV DATA:", results.data);

            const rows = results.data || [];

            if (!rows.length) {
              toast.dismiss(loadingToast);
              toast.error("CSV is empty");
              setIsImporting(false);
              return;
            }

            const formattedTickets = rows
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
                  ticket_name: row.ticket_name?.trim() || "",
                  description: row.description?.trim() || "",
                  status: row.status?.trim() || "Open",
                  source: row.source?.trim() || "Chat",
                  priority: row.priority?.trim() || "Medium",
                  deal_id: row.deal_id ? Number(row.deal_id) : null,
                  company_id: row.company_id ? Number(row.company_id) : null,
                  owners: ownerIds,
                };
              })
              .filter(
                (ticket) =>
                  ticket.ticket_name &&
                  ticket.owners.length > 0 &&
                  (
                    (ticket.deal_id && !ticket.company_id) ||
                    (!ticket.deal_id && ticket.company_id)
                  )
              );

            console.log("FORMATTED TICKETS:", formattedTickets);

            if (!formattedTickets.length) {
              toast.dismiss(loadingToast);
              toast.error("No valid rows found in CSV");
              setIsImporting(false);
              return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/import`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ tickets: formattedTickets }),
            });

            const data = await res.json();

            toast.dismiss(loadingToast);

            if (!res.ok) {
              toast.error(data.message || "Import failed");
              setIsImporting(false);
              return;
            }

            toast.success(`Imported ${data.count || formattedTickets.length} tickets successfully`);
            await fetchTickets();
            setIsImporting(false);
          } catch (err) {
            console.error("TICKET IMPORT ERROR:", err);
            toast.dismiss(loadingToast);
            toast.error("Import failed");
            setIsImporting(false);
          }
        },
        error: (err) => {
          console.error("CSV PARSE ERROR:", err);
          toast.dismiss(loadingToast);
          toast.error("Failed to read CSV");
          setIsImporting(false);
        },
      });
    } catch (err) {
      console.error("CSV IMPORT ERROR:", err);
      toast.dismiss(loadingToast);
      toast.error("Import failed");
      setIsImporting(false);
    }
  };
  //fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setDealsList(data.data || []);
        } else {
          setDealsList([]);
        }
      } catch (err) {
        console.error("Deals fetch error:", err);
        setDealsList([]);
      }
    };

    fetchDeals();
  }, []);
  // fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setCompaniesList(data.data || []);
        } else {
          setCompaniesList([]);
        }
      } catch (err) {
        console.error("Companies fetch error:", err);
        setCompaniesList([]);
      }
    };

    fetchCompanies();
  }, []);
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);
  // fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup/users`, {
          headers: {
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
  const visibleUsers =
    currentUser?.role === "admin"
      ? users
      : users.filter((u) => String(u.id) === String(currentUser?.id));
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      setSelectedUsers([String(currentUser.id)]);
    }
  }, [currentUser]);
  // 1. Data State
  // fetch tickets
  const [tickets, setTickets] = useState([]);
  // fetch tickets
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log("API RESULT:", result);

      const ticketsArray = Array.isArray(result.data) ? result.data : [];

      const formatted = ticketsArray.map((t) => ({
        id: t.id,
        name: t.ticket_name,
        description: t.description || "",
        owner: (t.owners || [])
          .map((u) => `${u.first_name} ${u.last_name}`)
          .join(", "),
        user_ids: (t.owners || []).map((u) => String(u.id)),
        status: t.status,
        priority: t.priority,
        source: t.source,
        date: t.created_at,
        deal_id: t.deal_id ? String(t.deal_id) : "",
        company_id: t.company_id ? String(t.company_id) : "",
        deal_name: t.deal_name || "",
        company_name: t.company_name || "",
        contact_email: t.contact_email || "",
        contact_phone_number: t.contact_phone_number || "",
      }));

      setTickets(formatted);
    } catch (err) {
      console.error(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Open",
    source: "Chat",
    priority: "Medium",
    deal_id: "",
    company_id: "",
  });
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ticket name is required";
    }

    if (!selectedUsers || selectedUsers.length === 0) {
      newErrors.owner = "At least one owner is required";
    }
    if (formData.deal_id && formData.company_id) {
      newErrors.link = "Select either Deal or Company, not both";
    }
    if (!formData.deal_id && !formData.company_id) {
      newErrors.link = "Select a Deal or a Company";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleEdit = (ticket) => {
    const normalizeText = (val, map, defaultValue = "") => {
      if (!val) return defaultValue;
      const key = val.toLowerCase().trim();
      return map[key] || defaultValue; // ✅ ALWAYS safe
    };

    const priorityMap = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    const sourceMap = {
      email: "Email",
      phone: "Phone",
      chat: "Chat",
    };

    const statusMap = {
      open: "Open",
      "in progress": "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    };

    setFormData({
      name: ticket.name || "",
      description: ticket.description || "",
      status: normalizeText(ticket.status, statusMap, "Open"),
      source: normalizeText(ticket.source, sourceMap, "Email"),
      priority: normalizeText(ticket.priority, priorityMap, "Medium"),
      deal_id: ticket.deal_id || "",
      company_id: ticket.company_id || "",
    });
    setSelectedUsers(
      currentUser && currentUser.role !== "admin"
        ? [String(currentUser.id)]
        : (ticket.user_ids || [])
    );
    setErrors({});
    setEditingId(ticket.id);
    setIsModalOpen(true);
  };

  const handleRowClick = (id) => {
    router.push(`/tickets/${id}`);
  };
  const [filters, setFilters] = useState({
    owner: "",
    status: "",
    source: "",
    priority: "",
  });
  const ticketFilters = [
    {
      label: "Ticket Owner",
      options: users.map((u) => u.name),
      value: filters.owner,
      onChange: (val) => {
        setFilters((prev) => ({ ...prev, owner: val }));
        setCurrentPage(1);
      },
    },
    {
      label: "Ticket Status",
      options: ["Open", "In Progress", "Resolved", "Closed"],
      value: filters.status,
      onChange: (val) => {
        setFilters((prev) => ({ ...prev, status: val }));
        setCurrentPage(1);
      },
    },
    {
      label: "Source",
      options: ["Chat", "Email", "Phone"],
      value: filters.source,
      onChange: (val) => {
        setFilters((prev) => ({ ...prev, source: val }));
        setCurrentPage(1);
      },
    },
    {
      label: "Priority",
      options: ["Low", "Medium", "High"],
      value: filters.priority,
      onChange: (val) => {
        setFilters((prev) => ({ ...prev, priority: val }));
        setCurrentPage(1);
      },
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesOwner = !filters.owner || t.owner === filters.owner;
    const matchesStatus = !filters.status || t.status === filters.status;
    const matchesSource = !filters.source || t.source === filters.source;
    const matchesPriority = !filters.priority || t.priority === filters.priority;
    return (
      matchesSearch &&
      matchesOwner &&
      matchesStatus &&
      matchesSource &&
      matchesPriority
    );
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + itemsPerPage,
  );


  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");

      setTickets((prev) => prev.filter((t) => t.id !== id));

      toast.success(data.message || "Ticket deleted successfully");
    } catch (err) {
      console.error("Delete error:", err.message);
      toast.error("Delete failed: " + err.message);
    }
  };

  const confirmDelete = (ticketId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this ticket?</p>
          <div className="d-flex gap-2 justify-content-end mt-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={closeToast}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                handleDelete(ticketId);
                closeToast();
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };
  const handleSave = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("token");

    try {
      const payload = {
        ticket_name: formData.name,
        description: formData.description,
        status: formData.status,
        source: formData.source,
        priority: formData.priority,
        deal_id: formData.deal_id ? Number(formData.deal_id) : null,
        company_id: formData.company_id ? Number(formData.company_id) : null,
        owners: selectedUsers,
      };

      let saveRes;

      if (editingId) {
        saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const saveData = await saveRes.json();
      console.log("SAVE RESPONSE:", saveData);

      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData?.message || "Save failed");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("FETCH AFTER SAVE:", data);

      const ticketsArray = Array.isArray(data.data) ? data.data : [];

      const formatted = ticketsArray.map((t) => ({
        id: t.id,
        name: t.ticket_name,
        description: t.description || "",
        owner: (t.owners || [])
          .map((u) => `${u.first_name} ${u.last_name}`)
          .join(", "),
        user_ids: (t.owners || []).map((u) => String(u.id)),
        status: t.status,
        priority: t.priority,
        source: t.source,
        date: t.created_at,
        deal_id: t.deal_id ? String(t.deal_id) : "",
        company_id: t.company_id ? String(t.company_id) : "",
        deal_name: t.deal_name || "",
        company_name: t.company_name || "",
        contact_email: t.contact_email || "",
        contact_phone_number: t.contact_phone_number || "",
      }));

      setTickets(formatted);

      toast.success(
        editingId ? "Ticket updated successfully" : "Ticket created successfully"
      );

      setIsModalOpen(false);
      setEditingId(null);
      setSelectedUsers(
        currentUser && currentUser.role !== "admin"
          ? [String(currentUser.id)]
          : []
      );
      setErrors({});
      setFormData({
        name: "",
        description: "",
        status: "Open",
        source: "Chat",
        priority: "Medium",
        deal_id: "",
        company_id: "",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Save failed");
    }
  };
  return (
    <div
      className="position-relative"
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        marginLeft: "20px",
      }}
    >
      {/* --- BACKDROP BLUR OVERLAY --- */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Light dim
            backdropFilter: "blur(6px)", // The Blur Effect
            WebkitBackdropFilter: "blur(6px)", // Safari Support
            zIndex: 1040, // Just below SideModal
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <div
        className="mt-4"
        style={{
          backgroundColor: "#f4f7fe",
          minHeight: "100vh",
          marginLeft: "15px",
          padding: "25px",
          filter: isModalOpen ? "blur(2px)" : "none",
          transition: "filter 0.3s ease",
          pointerEvents: isModalOpen ? "none" : "auto",
        }}
      >
        <div className="card border-0 shadow-sm rounded-4 p-4">
          {/* --- HEADER --- */}
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h4 className="fw-bold mb-0">Tickets</h4>
            <div className="d-flex gap-2">
              <>
                <input
                  type="file"
                  accept=".csv"
                  id="ticketCsvInput"
                  style={{ display: "none" }}
                  onChange={handleTicketFileSelect}
                />

                <button
                  className="btn btn-outline-secondary px-4 fw-medium border-2"
                  style={{
                    borderRadius: "8px",
                    color: "#6a5af9",
                    borderColor: "#6a5af9",
                  }}
                  onClick={() => document.getElementById("ticketCsvInput").click()}
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : "Import"}
                </button>
              </>
              <button
                className="btn text-white px-4 fw-medium"
                style={{ background: "#5e4cf3", borderRadius: "8px" }}
                onClick={() => {
                  setEditingId(null);
                  setErrors({});
                  setSelectedUsers(
                    currentUser && currentUser.role !== "admin"
                      ? [String(currentUser.id)]
                      : []
                  );
                  setFormData({
                    name: "",
                    description: "",
                    status: "Open",
                    source: "Chat",
                    priority: "Medium",
                    deal_id: "",
                    company_id: "",
                  });
                  setIsModalOpen(true);
                }}
              >
                Create
              </button>
            </div>
          </div>

          {/* --- SEARCH & PAGINATION --- */}
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search ticket name..."
            />
            <Pagination
              current={currentPage}
              total={filteredTickets.length}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>

          {/* --- FILTER BAR --- */}
          <FilterBar filters={ticketFilters} />

          {/* --- DATA TABLE --- */}
          <DataTable
            headers={[
              "Ticket Name",
              "DEAL",
              "COMPANY",
              " EMAIL",
              " PHONE",
              "Status",
              "Priority",
              "Source",
              "Owner",
              "Date",
              "Actions",
            ]}
            data={paginatedTickets}
            renderRow={(ticket) => (
              <>
                <td
                  className="fw-small text-dark"
                  style={{ color: "#5e4cf3", cursor: "pointer" }}
                  onClick={() => handleRowClick(ticket.id)}
                >
                  {" "}
                  {ticket.name}
                </td>
                <td className="text-secondary small">{ticket.deal_name || "-"}</td>
                <td className="text-secondary small">{ticket.company_name || "-"}</td>
                <td className="text-secondary small">{ticket.contact_email || "-"}</td>
                <td className="text-secondary small">{ticket.contact_phone_number || "-"}</td>
                <td className="text-secondary small">{ticket.status}</td>
                <td className="text-secondary small">{ticket.priority}</td>
                <td className="text-secondary small">{ticket.source}</td>
                <td className="text-secondary small">{ticket.owner}</td>
                <td className="text-secondary small">{ticket.date}</td>
                <td className="text-end pe-4">
                  <div className="d-flex justify-content-end gap-3">
                    <i
                      className="bi bi-pencil-square"
                      style={{ color: "#5e4cf3", cursor: "pointer" }}
                      onClick={() => handleEdit(ticket)}
                    ></i>
                    <i
                      className="bi bi-trash3 text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => confirmDelete(ticket.id)}
                    ></i>
                  </div>
                </td>
              </>
            )}
          />
        </div>
      </div>

      {/* --- SIDE MODAL --- */}
      {/* Ensure SideModal has a z-index higher than 1040 in its internal CSS */}
      <SideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Ticket" : "Create Ticket"}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 140px)",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "6px",
            }}
          >
            <div className="mb-3">
              <label className="small fw-bold text-muted">
                Ticket Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">Description</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="row mb-3">
              <div className="col-6">
                <label className="small fw-bold text-muted">
                  Ticket Status <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.status || "Open"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="col-6">
                <label className="small fw-bold text-muted">
                  Source <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.source || "Chat"}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Chat">Chat</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">
                Priority <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={formData.priority || "Medium"}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* ✅ NEW DEAL FIELD */}
            <div className="mb-3">
              <label className="small fw-bold text-muted">Deal</label>
              <select
                className="form-select"
                value={formData.deal_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deal_id: e.target.value,
                    company_id: e.target.value ? "" : formData.company_id,
                  })
                }
              >
                <option value="">Select Deal</option>
                {dealsList.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.deal_name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ NEW COMPANY FIELD */}
            <div className="mb-3">
              <label className="small fw-bold text-muted">Company</label>
              <select
                className="form-select"
                value={formData.company_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company_id: e.target.value,
                    deal_id: e.target.value ? "" : formData.deal_id,
                  })
                }
              >
                <option value="">Select Company</option>
                {companiesList.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
              {errors.link && (
                <small className="text-danger">{errors.link}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">
                Ticket Owners <span className="text-danger">*</span>
              </label>

              {currentUser?.role === "admin" ? (
                <div
                  style={{
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    padding: "10px",
                    maxHeight: "180px",
                    overflowY: "auto",
                    background: "#fff",
                  }}
                >
                  {visibleUsers.length > 0 ? (
                    visibleUsers.map((user) => {
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
                    })
                  ) : (
                    <small className="text-muted">No users available</small>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={
                    currentUser?.name ||
                    `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim()
                  }
                  readOnly
                />
              )}

              {errors.owner && (
                <small className="text-danger">{errors.owner}</small>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
              marginTop: "12px",
              background: "#fff",
            }}
            className="d-flex gap-2"
          >
            <button
              className="btn btn-outline-secondary w-50"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn text-white w-50"
              style={{ background: "#5e4cf3" }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </SideModal>
    </div>
  );
}
