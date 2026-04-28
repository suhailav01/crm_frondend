const DataTable = ({ headers = [], data = [], renderRow = () => null }) => {
  const headerStyle = {
    backgroundColor: "#5e4cf3",
    color: "white",
    border: "none",
    paddingTop: "15px",
    paddingBottom: "15px",
    fontWeight: "400"
  };

  return (
    <div className="table-responsive border rounded-3">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th className="ps-3" style={{ ...headerStyle, width: "50px" }}>
              <input type="checkbox" className="form-check-input" />
            </th>
            {headers.map((h, i) => (
              <th key={i} style={headerStyle} className="small text-uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item, index) => (
            <tr key={item.id || index} className="border-bottom">
              <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;