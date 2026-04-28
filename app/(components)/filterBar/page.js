 const FilterBar = ({ filters }) => (
  <div className="d-flex gap-2 mb-4">
    {filters.map((filter, index) => (
      <select 
        key={index} 
        className="form-select border-light-subtle text-muted small" 
        style={{ width: "170px" }}
        onChange={(e) => filter.onChange(e.target.value)}
      >
        <option value="">{filter.label}</option>
        {filter.options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    ))}
  </div>
);
export default FilterBar;