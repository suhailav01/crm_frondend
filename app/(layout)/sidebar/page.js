"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    setUser(parsedUser);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const menuItems = [
    ...(user?.role === "admin"
      ? [{ name: "Dashboard", icon: "bi-grid", path: "/dashboard" }]
      : []),
    { name: "Leads", icon: "bi-people", path: "/leads" },
    { name: "Companies", icon: "bi-briefcase", path: "/companies" },
    { name: "Deals", icon: "bi-clipboard-check", path: "/deals" },
    { name: "Tickets", icon: "bi-ticket-perforated", path: "/tickets" },
  ];

  return (
    <aside
      className="bg-white border-end d-flex flex-column align-items-center py-4"
      style={{
        marginTop: "63px",
        width: "75px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex:1000,
      }}
    >
      <div className="nav flex-column align-items-center w-100 gap-4">
        {menuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={index}
              href={item.path}
              className="text-decoration-none w-100 d-flex justify-content-center"
            >
              <div className="d-flex flex-column align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "42px",
                    height: "42px",
                    backgroundColor: isActive ? "#5D5FEF" : "#F2F2F2",
                    transition: "0.3s",
                  }}
                >
                  <i
                    className={`bi ${item.icon}`}
                    style={{
                      fontSize: "18px",
                      color: isActive ? "#FFFFFF" : "#9E9E9E",
                    }}
                  ></i>
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    marginTop: "6px",
                    color: isActive ? "#5D5FEF" : "#9E9E9E",
                  }}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}