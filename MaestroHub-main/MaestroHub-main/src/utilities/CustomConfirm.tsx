export default function CustomConfirm({
  visible,
  message,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff8f1",
          padding: "1.5rem 2rem",
          borderRadius: "1rem",
          width: "350px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
          color: "#5a4635",
        }}
      >
        <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "0.5rem",
              backgroundColor: "#ccc",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "0.5rem",
              backgroundColor: "#ff6210",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
