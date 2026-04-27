"use client";

import { useEffect, useState } from "react";

export default function SalesReport({ data = [] }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthMap = {};
  data.forEach((item) => {
    monthMap[item.month] = Number(item.total || 0);
  });

  const chartData = months.map((month) => {
    const total = monthMap[month] || 0;

    // light bar should be bigger than dark bar
    const target = total > 0 ? Math.round(total * 1.8) : 0;

    return {
      month,
      total,
      target,
    };
  });

  const maxValue = Math.max(
    ...chartData.map((item) => Math.max(item.total, item.target)),
    1
  );

  const yAxisValues = [
    maxValue,
    Math.round(maxValue * 0.5),
    Math.round(maxValue * 0.25),
    Math.round(maxValue * 0.1),
    0,
  ];

  const formatCurrency = (value) => {
    return `$${Number(value || 0).toLocaleString()}`;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 h-90">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="fw-bold text-dark m-0">Sales Reports</h6>

        <select
          className="form-select form-select-sm border-light text-muted w-auto"
          style={{ fontSize: "0.8rem" }}
          defaultValue="Monthly"
        >
          <option>Monthly</option>
        </select>
      </div>

      <div className="position-relative mt-2" style={{ height: "250px" }}>
        {/* Y Axis */}
        <div
          className="position-absolute h-100 d-flex flex-column justify-content-between text-muted"
          style={{ fontSize: "0.75rem", width: "60px" }}
        >
          {yAxisValues.map((val, index) => (
            <span key={index}>{formatCurrency(val)}</span>
          ))}
        </div>

        {/* Chart */}
        <div
          className="d-flex align-items-end justify-content-between h-100"
          style={{ marginLeft: "65px" }}
        >
          {chartData.map((item, i) => {
            const darkHeight =
              maxValue > 0 ? (item.total / maxValue) * 100 : 0;

            const lightHeight =
              maxValue > 0 ? (item.target / maxValue) * 100 : 0;

            const finalDarkHeight = Math.max(
              darkHeight,
              item.total > 0 ? 8 : 0
            );

            const finalLightHeight = Math.max(
              lightHeight,
              item.target > 0 ? 12 : 0
            );

            return (
              <div key={i} className="text-center" style={{ width: "5.5%" }}>
                <div
                  className="position-relative d-flex justify-content-center align-items-end"
                  style={{
                    height: "200px",
                  }}
                >
                  {/* Light back bar */}
                  <div
                    className="position-absolute bottom-0 rounded-top"
                    style={{
                      width: "24px",
                      height: animate ? `${finalLightHeight}%` : "0%",
                      background:
                        "repeating-linear-gradient(to right, rgba(124, 113, 244, 0.10) 0px, rgba(124, 113, 244, 0.10) 2px, rgba(124, 113, 244, 0.18) 2px, rgba(124, 113, 244, 0.18) 4px)",
                      transition: `height 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`,
                    }}
                  />

                  {/* Dark front bar */}
                  <div
                    className="position-absolute bottom-0 rounded-top"
                    style={{
                      width: "24px",
                      height: animate ? `${finalDarkHeight}%` : "0%",
                      background:
                        "linear-gradient(to top, #7C71F4, #A594F9)",
                      transition: `height 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`,
                      zIndex: 2,
                    }}
                    title={formatCurrency(item.total)}
                  />
                </div>

                <div
                  className="mt-2 text-muted"
                  style={{
                    fontSize: "0.7rem",
                    opacity: animate ? 1 : 0,
                    transform: animate ? "translateY(0)" : "translateY(8px)",
                    transition: `all 0.4s ease ${0.2 + i * 0.05}s`,
                  }}
                >
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}