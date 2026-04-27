"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();

  const wrapperRef = useRef(null);
  const notificationRef = useRef(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [users, setUsers] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const storedUser = localStorage.getItem("user");
        const userObj = storedUser ? JSON.parse(storedUser) : null;
        const userId = userObj?.id;

        console.log("USER ID:", userId); // ✅ debug

        const res = await fetch("http://localhost:7000/api/auth/signup/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const usersArray = Array.isArray(data.data) ? data.data : [];

        const formattedUsers = usersArray.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          first_name: u.first_name,
          phone_number: u.phone_number,
          profile_image: u.profile_image,
        }));

        setUsers(formattedUsers);

        // ✅ correct matching
        const loggedUser = formattedUsers.find(
          (u) => String(u.id) === String(userId)
        );

        console.log("LOGGED USER:", loggedUser); // ✅ debug

        if (loggedUser) {
          setCurrentUser(loggedUser);
        }
      } catch (err) {
        console.error("Users fetch error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const userInitial = currentUser?.first_name
    ? currentUser.first_name.charAt(0).toUpperCase()
    : "?";
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchResults = async () => {
        if (!search.trim()) {
          setResults([]);
          setShowResults(false);
          return;
        }

        try {
          const res = await fetch(
            `http://localhost:7000/api/v1/search?query=${encodeURIComponent(search)}`
          );
          const data = await res.json();

          if (data.success) {
            setResults(data.data || []);
            setShowResults(true);
          } else {
            setResults([]);
            setShowResults(true);
          }
        } catch (error) {
          console.error("GLOBAL SEARCH ERROR:", error);
          setResults([]);
          setShowResults(true);
        }
      };

      fetchResults();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setShowUserMenu(false);
      }

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setShowResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // ✅ keep empty
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };
  const handleNavigate = (item) => {
    setSearch("");
    setShowResults(false);

    if (item.module === "leads") {
      router.push(`/leads/${item.route_id}`);
    } else if (item.module === "deals") {
      router.push(`/deals/${item.route_id}`);
    } else if (item.module === "companies") {
      router.push(`/companies/${item.route_id}`);
    } else if (item.module === "tickets") {
      router.push(`/tickets/${item.route_id}`);
    } else {
      router.push("/dashboard");
    }
  };

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetch("http://localhost:7000/api/v1/notifications"),
        fetch("http://localhost:7000/api/v1/notifications/unread-count"),
      ]);

      const listData = await listRes.json();
      const countData = await countRes.json();

      if (listData.success) {
        setNotifications(listData.data || []);
      }

      if (countData.success) {
        setUnreadCount(Number(countData.data.unread_count) || 0);
      }
    } catch (error) {
      console.error("FETCH NOTIFICATIONS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (item) => {
    try {
      if (!item.is_read) {
        await fetch(
          `http://localhost:7000/api/v1/notifications/${item.id}/read`,
          {
            method: "PUT",
          }
        );
      }

      setShowNotifications(false);
      fetchNotifications();

      if (item.module === "tickets") {
        router.push(`/tickets/${item.record_id}`);
      } else if (item.module === "leads") {
        router.push(`/leads/${item.record_id}`);
      } else if (item.module === "deals") {
        router.push(`/deals/${item.record_id}`);
      } else if (item.module === "companies") {
        router.push(`/companies/${item.record_id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("NOTIFICATION CLICK ERROR:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("http://localhost:7000/api/v1/notifications/read-all", {
        method: "PUT",
      });
      fetchNotifications();
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const stripHtml = (html) => {
    if (!html) return "";
    return String(html).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom fixed-top px-4 py-2 ">
      <div className="container-fluid d-flex align-items-center">
        <Link
          href="/dashboard"
          className="navbar-brand fw-bold fs-4 me-auto"
          style={{ color: "#000", letterSpacing: "1px" }}
        >
          CRM
        </Link>

        <div className="d-flex align-items-center">
          {/* Search Bar */}
          <div
            ref={wrapperRef}
            className="position-relative me-3 "
          >
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </span>

            <input
              className="form-control bg-light border-0 ps-5"
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowResults(true);
              }}
              style={{
                borderRadius: "10px",
                width: "280px",
                height: "45px",
                fontSize: "0.95rem",
              }}
            />

            {showResults && search.trim() && (
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  zIndex: 1050,
                  maxHeight: "350px",
                  overflowY: "auto",
                }}
              >
                {results.length === 0 ? (
                  <div
                    style={{
                      padding: "14px",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    No results found
                  </div>
                ) : (
                  results.map((item, index) => (
                    <div
                      key={`${item.type}-${item.id}-${index}`}
                      onClick={() => handleNavigate(item)}
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        {stripHtml(item.title)}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        {stripHtml(item.subtitle)}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#5D5FEF",
                          marginTop: "4px",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div ref={notificationRef} className="position-relative me-3">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="btn btn-outline-secondary border d-flex align-items-center justify-content-center"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                position: "relative",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="#5D5FEF"
                viewBox="0 0 16 16"
              >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
              </svg>

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    padding: "0 5px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  right: 0,
                  width: "340px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  zIndex: 1100,
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "14px" }}>
                    Notifications
                  </span>

                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#5D5FEF",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "14px",
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    No notifications available
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #f8fafc",
                        cursor: "pointer",
                        backgroundColor: item.is_read ? "#fff" : "#eef2ff",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        {item.message}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#5D5FEF",
                          marginTop: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {item.module} • {item.action_type}
                        </span>
                        <span>{formatDateTime(item.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div ref={userMenuRef} className="position-relative">
            {/* Avatar */}
            <div
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: "45px",
                height: "45px",
                backgroundColor: "#5D5FEF",
                borderRadius: "50%",
                fontSize: "1.1rem",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {currentUser?.profile_image ? (
                <img
                  src={`http://localhost:7000/${currentUser.profile_image}`}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                userInitial
              )}
            </div>

            {/* Dropdown */}
            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "55px",
                  right: 0,
                  width: "220px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  zIndex: 1200,
                  overflow: "hidden",
                }}
              >
                {/* User Info */}
                <div
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    {currentUser?.name || "User"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Logged in
                  </div>
                </div>

                {/* Profile */}
                <div
                  onClick={() => {
                    router.push("/profile");
                    setShowUserMenu(false);
                  }}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  👤 Profile
                </div>

                {/* Logout */}
                <div
                  onClick={handleLogout}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#ef4444",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}