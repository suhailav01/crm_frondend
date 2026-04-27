export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="position-relative" style={{ width: "300px" }}>
    <input
      type="text"
      className="form-control ps-4 bg-light border-0"
      placeholder={placeholder}
      style={{ borderRadius: "10px", height: "45px" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);