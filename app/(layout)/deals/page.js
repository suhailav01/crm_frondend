"use client";

import { useState, useEffect } from "react";
import styles from "../deals/deals.module.css";
import formStyles from "../deals/deals.module.css";
import DataTable from "@/app/(components)/dataTable/page";
import FilterBar from "@/app/(components)/filterBar/page";
import SearchBar from "@/app/(components)/searchBar/page";
import Pagination from "@/app/(components)/pagination/page";
import SideModal from "@/app/(components)/sideModal/page";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Papa from "papaparse";
import { Toaster, toast } from "react-hot-toast";
export default function DealsPage() {
  const searchParams = useSearchParams();

  const leadId = searchParams.get("leadId");
  const name = searchParams.get("name");

  const initialFormData = {
    deal_name: "",
    deal_stage: "",
    amount: "",
    close_date: "",
    priority: "Medium",
    lead_id: "",
    company_id: "",
  };
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [data, setData] = useState([]);
  const [ownersList, setOwnersList] = useState([]);
  const [errors, setErrors] = useState({});
  const [qualifiedLeads, setQualifiedLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const handleDealFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected deal CSV:", file);
    importDealsCsv(file);

    e.target.value = "";
  };

  const importDealsCsv = async (file) => {
    try {
      const token = localStorage.getItem("token");
      setIsImporting(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("DEAL CSV DATA:", results.data);

            const rows = results.data || [];

            if (!rows.length) {
              toast.error("CSV is empty");
              setIsImporting(false);
              return;
            }

            const formattedDeals = rows
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
                  deal_name: row.deal_name?.trim() || "",
                  lead_id: row.lead_id ? Number(row.lead_id) : null,
                  company_id: row.company_id ? Number(row.company_id) : null,
                  deal_stage: row.deal_stage?.trim() || "Proposal Sent",
                  amount: row.amount ? Number(row.amount) : 0,
                  close_date: row.close_date?.trim() || null,
                  priority: row.priority?.trim() || "Medium",
                  owners: ownerIds,
                };
              })
              .filter(
                (deal) =>
                  deal.deal_name &&
                  deal.lead_id &&
                  deal.deal_stage &&
                  deal.owners.length > 0
              );

            console.log("FORMATTED DEALS:", formattedDeals);

            if (!formattedDeals.length) {
              toast.error("No valid rows found in CSV");
              setIsImporting(false);
              return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/import`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ deals: formattedDeals }),
            });

            const data = await res.json();

            if (!res.ok) {
              toast.error(data.message || "Import failed");
              setIsImporting(false);
              return;
            }

            toast.success(`Imported ${data.count || formattedDeals.length} deals successfully`);
            await fetchDeals();
            setIsImporting(false);
          } catch (err) {
            console.error("DEAL IMPORT ERROR:", err);
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
    if (currentUser && currentUser.role !== "admin") {
      setSelectedUsers([String(currentUser.id)]);
    }
  }, [currentUser]);
  const visibleOwners =
    currentUser?.role === "admin"
      ? ownersList
      : ownersList.filter((u) => String(u.id) === String(currentUser?.id));
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    setCurrentUser(storedUser || null);
  }, []);

  useEffect(() => {
    if (leadId) {
      setFormData((prev) => ({
        ...prev,
        lead_id: Number(leadId),
        deal_name: name ? `${name} Deal` : "",
        company_id: prev.company_id || "",
      }));
      setSelectedUsers(
        currentUser && currentUser.role !== "admin"
          ? [String(currentUser.id)]
          : []
      );
      setErrors({});
      setEditingId(null);
      setIsModalOpen(false);
    }
  }, [leadId, name, currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      console.log("fetch deal ", result);
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);
  useEffect(() => {
    const fetchQualifiedLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        const leadsArray = result.data || result.leads || result || [];

        const filtered = Array.isArray(leadsArray)
          ? leadsArray.filter(
            (lead) =>
              lead.status === "Qualified" && lead.is_converted !== true
          )
          : [];

        setQualifiedLeads(filtered);
      } catch (error) {
        console.error("Error fetching qualified leads:", error);
      }
    };

    fetchQualifiedLeads();
  }, []);
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup/users`, {
          headers: {
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
  const handleLeadChange = (e) => {
    const selectedLeadId = e.target.value;

    const selectedLead = qualifiedLeads.find(
      (lead) => String(lead.id) === String(selectedLeadId)
    );

    setFormData((prev) => ({
      ...prev,
      lead_id: selectedLeadId,
      deal_name: selectedLead
        ? `${selectedLead.first_name} ${selectedLead.last_name} Deal`
        : "",
      company_id: selectedLead?.company_id || "",
    }));

    setErrors((prev) => ({
      ...prev,
      lead_id: "",
    }));
  };
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
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.lead_id) newErrors.lead_id = "Qualified lead is required";
    if (!formData.deal_name.trim()) newErrors.deal_name = "Deal name is required";
    if (!formData.deal_stage) newErrors.deal_stage = "Deal stage is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!selectedUsers.length) newErrors.deal_owner = "At least one owner is required";
    if (!formData.priority) newErrors.priority = "Priority is required";

    if (
      (formData.deal_stage === "Closed Won" ||
        formData.deal_stage === "Closed Lost") &&
      !formData.close_date
    ) {
      newErrors.close_date = "Close date is required for closed deals";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedUsers(
      currentUser && currentUser.role !== "admin"
        ? [String(currentUser.id)]
        : []
    );
    setEditingId(null);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const token = localStorage.getItem("token");
      const payload = {
        deal_name: formData.deal_name,
        lead_id: formData.lead_id ? Number(formData.lead_id) : null,
        company_id: formData.company_id ? Number(formData.company_id) : null,
        deal_stage: formData.deal_stage,
        amount: Number(formData.amount),
        close_date: formData.close_date || null,
        priority: formData.priority,
        owners: selectedUsers,
      };

      console.log("DEAL SAVE PAYLOAD:", payload);

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/deals/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/deals`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("DEAL SAVE RESPONSE:", result);

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Save failed");
      }

      toast.success(editingId ? "Deal updated successfully" : "Deal created successfully");

      setIsModalOpen(false);
      resetForm();
      fetchDeals();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (deal) => {
    setFormData({
      deal_name: deal.deal_name || "",
      deal_stage: deal.deal_stage || "",
      amount: deal.amount || "",
      close_date: deal.close_date
        ? String(deal.close_date).split("T")[0]
        : "",
      priority: deal.priority || "Medium",
      lead_id: deal.lead_id || "",
      company_id: deal.company_id || "",
    });

    setSelectedUsers(
      currentUser && currentUser.role !== "admin"
        ? [String(currentUser.id)]
        : (deal.owners || []).map((u) => String(u.id))
    );

    setEditingId(deal.id);
    setErrors({});
    setIsModalOpen(true);
  };

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    setData((prev) => prev.filter((deal) => deal.id !== id));

    toast.success("Deal deleted successfully 🗑️");
  } catch (err) {
    toast.error(err.message || "Delete failed ❌");
  }
};

  const headers = [
    "",
    "DEAL NAME",
    "LEAD",
    "EMAIL",
    "PHONE NUMBER",
    "DEAL STAGE",
    "CLOSE DATE",
    "DEAL OWNER",
    "AMOUNT",
    "ACTIONS",
  ];

  const [filterValues, setFilterValues] = useState({
    name: "",
    stage: "",
    owner: "",
    closeDate: "",
    createdDate: "",
  });

  const owners = [...new Set(data.map((item) => (item.owners || []).map((u) => `${u.first_name} ${u.last_name}`).join(", ")).filter(Boolean)),];
  const dealNames = [...new Set(data.map((item) => item.deal_name).filter(Boolean))];
  const stages = [...new Set(data.map((item) => item.deal_stage).filter(Boolean))];

  const filters = [
    {
      label: "Deal Name",
      options: dealNames,
      onChange: (value) => setFilterValues({ ...filterValues, name: value }),
    },
    {
      label: "Deal Owner",
      options: owners,
      onChange: (value) => setFilterValues({ ...filterValues, owner: value }),
    },
    {
      label: "Deal Stage",
      options: stages,
      onChange: (value) => setFilterValues({ ...filterValues, stage: value }),
    },
    {
      label: "Close Date",
      options: ["Today", "This Week"],
      onChange: (value) => setFilterValues({ ...filterValues, closeDate: value }),
    },
    {
      label: "Created Date",
      options: ["Today", "This Month"],
      onChange: (value) => setFilterValues({ ...filterValues, createdDate: value }),
    },
  ];

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();

    const ownerText = (item.owners || [])
      .map((u) => `${u.first_name} ${u.last_name}`)
      .join(", ");

    const matchSearch =
      (item.deal_name?.toLowerCase() || "").includes(search) ||
      ownerText.toLowerCase().includes(search) ||
      (item.deal_stage?.toLowerCase() || "").includes(search);

    const matchName = !filterValues.name || item.deal_name === filterValues.name;
    const matchStage = !filterValues.stage || item.deal_stage === filterValues.stage;
    const matchOwner = !filterValues.owner || ownerText === filterValues.owner;

    const matchCloseDate =
      !filterValues.closeDate ||
      (item.close_date &&
        new Date(item.close_date).toDateString() === new Date().toDateString());

    const matchCreatedDate =
      !filterValues.createdDate ||
      (item.created_at &&
        new Date(item.created_at).toDateString() === new Date().toDateString());

    return (
      matchSearch &&
      matchName &&
      matchStage &&
      matchOwner &&
      matchCloseDate &&
      matchCreatedDate
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className={styles.pageWrapper}>
             <Toaster position="top-right" />  
      <div className={styles.topSection}>
        <h2 className={styles.title}>Deals</h2>
        <div className={styles.btnGroup}>
          <>
            <input
              type="file"
              accept=".csv"
              id="dealCsvInput"
              style={{ display: "none" }}
              onChange={handleDealFileSelect}
            />

            <button
              className={styles.importBtn}
              onClick={() => document.getElementById("dealCsvInput").click()}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Import"}
            </button>
          </>

          <button
            className={styles.createBtn}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            Create
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div>
          <div className={styles.searchPaginationRow}>
            <SearchBar
              placeholder="Search deal, owner, stage"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
            />

            <Pagination
              current={currentPage}
              total={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>

        <div className="mb-4">
          <FilterBar filters={filters} />
        </div>

        <DataTable
          headers={headers}
          data={paginatedData}
          headerClassName={styles.tableHeader}
          renderRow={(item) => (
            <>
              <td></td>

              <td>
                <Link
                  href={`/deals/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {item.deal_name}
                </Link>
              </td>

              {/* ✅ NEW LEAD COLUMN */}
              <td>
                {item.first_name || item.last_name
                  ? `${item.first_name || ""} ${item.last_name || ""}`
                  : "-"}
              </td>

              <td>{item.lead_email || "-"}</td>

              <td>{item.lead_phone_number || "-"}</td>

              <td>{item.deal_stage}</td>

              <td>
                {item.close_date
                  ? new Date(item.close_date).toLocaleDateString()
                  : "-"}
              </td>

              <td>
                {(item.owners || [])
                  .map((u) => `${u.first_name} ${u.last_name}`)
                  .join(", ")}
              </td>

              <td>{item.amount}</td>

              <td>
                <div className={styles.actionIcons}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.iconBtn}
                  >
                    <FiEdit size={18} color="#5e4cf3" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.deleteIcon}
                  >
                    <MdDelete size={18} color="#ef4444" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      <SideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? "Edit Deal" : "Create Deal"}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 120px)",
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "6px",
            }}
          >
            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>
                Qualified Leads <span>*</span>
              </label>

              <select
                name="lead_id"
                value={formData.lead_id}
                onChange={handleLeadChange}
                className={`${formStyles.select} ${errors.lead_id ? formStyles.errorInput : ""
                  }`}
                disabled={editingId !== null}
              >
                <option value="">Choose</option>

                {qualifiedLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </option>
                ))}
              </select>

              {errors.lead_id && (
                <span className={formStyles.errorText}>{errors.lead_id}</span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>
                Deal Name <span>*</span>
              </label>

              <input
                type="text"
                name="deal_name"
                value={formData.deal_name}
                onChange={handleChange}
                className={`${formStyles.input} ${errors.deal_name ? formStyles.errorInput : ""
                  }`}
              />

              {errors.deal_name && (
                <span className={formStyles.errorText}>{errors.deal_name}</span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>
                Deal Stage <span>*</span>
              </label>

              <select
                name="deal_stage"
                value={formData.deal_stage}
                onChange={handleChange}
                className={`${formStyles.select} ${errors.deal_stage ? formStyles.errorInput : ""
                  }`}
              >
                <option value="">Choose</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>

              {errors.deal_stage && (
                <span className={formStyles.errorText}>{errors.deal_stage}</span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>
                Amount <span>*</span>
              </label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`${formStyles.input} ${errors.amount ? formStyles.errorInput : ""
                  }`}
              />

              {errors.amount && (
                <span className={formStyles.errorText}>{errors.amount}</span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label className={formStyles.label}>
                Deal Owners <span>*</span>
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
                          id={`deal-owner-${user.id}`}
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
                          htmlFor={`deal-owner-${user.id}`}
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
                  className={formStyles.input}
                  value={
                    currentUser
                      ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
                      : ""
                  }
                  readOnly
                />
              )}

              {errors.deal_owner && (
                <span className={formStyles.errorText}>{errors.deal_owner}</span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Close Date{" "}
                  {(formData.deal_stage === "Closed Won" ||
                    formData.deal_stage === "Closed Lost") && <span>*</span>}
                </label>

                <div className={formStyles.dateWrapper}>
                  <DatePicker
                    selected={formData.close_date ? new Date(formData.close_date) : null}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        close_date: date ? date.toISOString().split("T")[0] : "",
                      }))
                    }
                    placeholderText="dd/mm/yyyy"
                    dateFormat="dd/MM/yyyy"
                    className={`${formStyles.input} ${errors.close_date ? formStyles.errorInput : ""
                      }`}
                    calendarClassName={formStyles.calendar}
                  />
                </div>

                {errors.close_date && (
                  <span className={formStyles.errorText}>{errors.close_date}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Priority <span>*</span>
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={formStyles.select}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
              marginTop: "12px",
              background: "#fff",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              className={formStyles.cancelBtn}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              style={{ width: "50%" }}
            >
              Cancel
            </button>

            <button
              className={formStyles.saveBtn}
              onClick={handleSave}
              style={{ width: "50%" }}
            >
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </SideModal>
    </div>
  );
}