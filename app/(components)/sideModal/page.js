const SideModal = ({
  isOpen = false,
  onClose = () => { },
  title = "",
  children = null,
}) => {
  if (!isOpen) return null;
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.3)", zIndex: 1040 }}
      />
      {/* Drawer */}
      <div className="bg-white shadow-lg p-4" style={{ position: "fixed", top: 0, right: 0, width: "400px", height: "100%", zIndex: 1050 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        {children}
      </div>
    </>
  );
};
export default SideModal;