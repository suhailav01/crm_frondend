"use client";

export default function TeamTable({ data = [] }) {
  const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString()}`;
};

  const getTrendBadge = (activeDeals, closedDeals) => {
    const active = Number(activeDeals || 0);
    const closed = Number(closedDeals || 0);

    if (closed >= active) {
      return {
        text: "Strong",
        className: "bg-success-subtle text-success",
      };
    }

    if (closed > 0) {
      return {
        text: "Average",
        className: "bg-warning-subtle text-warning",
      };
    }

    return {
      text: "Low",
      className: "bg-danger-subtle text-danger",
    };
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 text-dark">Team Performance Tracking</h6>
        <button
          className="btn btn-outline-secondary btn-sm px-3 rounded-2 text-primary border-light-subtle"
          style={{ fontSize: "0.8rem" }}
        >
          Export CSV
        </button>
      </div>

      <div className="table-responsive px-4 pb-4">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr
              className="text-muted"
              style={{ fontSize: "0.8rem", borderBottom: "1px solid #f8f9fa" }}
            >
              <th className="fw-normal py-3 border-0">Employee</th>
              <th className="fw-normal py-3 text-center border-0">Active Deals</th>
              <th className="fw-normal py-3 text-center border-0">Closed Deals</th>
              <th className="fw-normal py-3 text-end border-0">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((emp, idx) => {
                const trend = getTrendBadge(emp.active_deals, emp.closed_deals);

                return (
                  <tr key={emp.id || idx} style={{ borderBottom: "1px solid #f8f9fa" }}>
                    <td className="py-3 border-0 fw-medium">{emp.employee}</td>
                    <td className="py-3 border-0 text-center text-secondary">
                      {emp.active_deals}
                    </td>
                    <td className="py-3 border-0 text-center text-secondary">
                      {emp.closed_deals}
                    </td>
                    <td className="py-3 border-0 text-end fw-bold">
                      {formatCurrency(emp.revenue)}
                      <span
                        className={`ms-2 px-2 py-1 rounded-1 ${trend.className}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {trend.text}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4 border-0">
                  No team performance data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}