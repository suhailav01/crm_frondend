
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/app/(components)/dasboardCard/page";
import ConversionBar from "@/app/(components)/dashboardConversionBar/page";
import SalesReport from "@/app/(components)/SalesReportChart/page";
import TeamTable from "@/app/(components)/TeamPerformanceTable/page";
import { Users, Briefcase, CheckCircle, DollarSign } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!token || !user) {
        router.push("/login");
        return;
      }

      if (user.role !== "admin") {
        router.push("/leads");
        return;
      }

      setAuthorized(true);

      try {
        const res = await fetch("http://localhost:7000/api/v1/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setDashboardData(data.data);
        } else {
          console.error("Dashboard fetch failed:", data.message);
        }
      } catch (err) {
        console.error("DASHBOARD FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [router]);

  if (!authorized || loading) return null;

  const summary = dashboardData?.summary || {};
  const conversion = dashboardData?.conversion || {};
  const salesReportData = dashboardData?.sales_report || [];
  const teamPerformanceData = dashboardData?.team_performance || [];

  const stats = [
    {
      title: "Total Leads",
      value: Number(summary.total_leads).toLocaleString(),
      color: "#635BFF",
      gradient: "#E0D9FF",
      icon: Users,
    },
    {
      title: "Active Deals",
      value: Number(summary.active_deals).toLocaleString(),
      color: "#2ED4A3",
      gradient: "#D1F7EC",
      icon: Briefcase,
    },
    {
      title: "Closed Deals",
      value: Number(summary.closed_deals).toLocaleString(),
      color: "#FF5C5C",
      gradient: "#FFE5E5",
      icon: CheckCircle,
    },
    {
      title: "Monthly Revenue",
      value: Number(summary.monthly_revenue).toLocaleString(),
      color: "#FFB800",
      gradient: "#FFF4D6",
      icon: DollarSign,
    },
  ];

  const conversionValues = [
    { label: "Contact", value: Number(conversion.contact), color: "bg-primary" },
    { label: "Qualified Lead", value: Number(conversion.qualified_lead), color: "bg-info" },
    { label: "Proposal Sent", value: Number(conversion.proposal_sent), color: "bg-warning" },
    { label: "Negotiation", value: Number(conversion.negotiation), color: "bg-primary" },
    { label: "Closed Won", value: Number(conversion.closed_won), color: "bg-success" },
    { label: "Closed Lost", value: Number(conversion.closed_lost), color: "bg-danger" },
  ];

  const maxConversionValue = Math.max(...conversionValues.map((item) => item.value), 1);

  const conversions = conversionValues.map((item) => ({
    ...item,
    percentage: Math.round((item.value / maxConversionValue) * 100),
  }));
  console.log("dashboardData:", dashboardData);
  console.log("teamPerformanceData:", teamPerformanceData);
  return (
    <div
      className="container-fluid bg-light min-vh-100"
      style={{ marginLeft: "20px", width: "100%", padding: "50px 40px 50px 55px" }}
    >
      <div className="row g-4 mb-4">
        {stats.map((item, idx) => {
          const IconComponent = item.icon;

          return (
            <div key={idx} className="col-md-3">
              <StatCard
                title={item.title}
                value={item.value}
                icon={<IconComponent size={20} color={item.color} />}
                iconStyle={{
                  background: `radial-gradient(circle at 70% 30%, ${item.gradient}, #ffffff)`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-2 px-3">
            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: "0.85rem" }}>
              Contact to Deal Conversion
            </h6>

            <div className="d-flex flex-column gap-0">
              {conversions.map((bar, idx) => (
                <ConversionBar
                  key={idx}
                  label={`${bar.label} (${bar.value})`}
                  percentage={bar.percentage}
                  colorClass={bar.color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <SalesReport key={salesReportData.length} data={salesReportData} />
        </div>
      </div>

      <TeamTable data={teamPerformanceData} />
    </div>
  );
}