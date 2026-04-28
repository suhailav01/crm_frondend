"use client"

 const Pagination = ({ current, total, onPageChange }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= total) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2 small text-muted">
     
      <span  style={{ 
          cursor: current > 1 ? "pointer" : "not-allowed",
          opacity: current > 1 ? 1 : 0.5 
        }}   onClick={() => handlePageChange(current - 1)}  > ← Previous   </span>

      {/* Current Page Display */}
      <span className="badge rounded-3 text-white" style={{ background: "#5e4cf3", padding: "8px 12px" }}>
        {current}
      </span>

     
      {current < total && (
        <>
          <span 
            style={{ cursor: "pointer" }}   onClick={() => handlePageChange(current + 1)} >
            {current + 1}
          </span>
          {current + 1 < total && <span>...</span>}
        </>
      )}

      {/* Next Button */}
      <span 
        style={{ 
          color: current < total ? "#5e4cf3" : "#ccc", 
          cursor: current < total ? "pointer" : "not-allowed" 
        }}  onClick={() => handlePageChange(current + 1)} >   Next →
      </span>
    </div>
  );
};


export default Pagination;