export default function CustomAlert({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
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
          maxWidth: "90%",
          width: "350px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
          color: "#5a4635",
        }}
      >
        <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#ff6210",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
