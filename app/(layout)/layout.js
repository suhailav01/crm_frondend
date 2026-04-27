"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./sidebar/page";
import Nav from "./nav/page";

export default function ProtectedLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuth");
    if (!isAuth) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ display: "flex" }}>
      
      {/* ✅ Sidebar OUTSIDE */}
      <Sidebar />

      {/* ✅ Main Content */}
      <div style={{ flex: 1, marginLeft: "15px" }}>
        
        {/* Navbar */}
        <nav style={{ background: "#ddd", padding: "10px" }}>
          <Nav />
        </nav>

        {/* Page Content */}
        <div style={{ padding: "20px" }}>
          {children}
        </div>

      </div>
    </div>
  );
}