export default function NFCScanner({ onScan }) {
  async function startScan() {
    if (!("NDEFReader" in window)) {
      alert("Questo dispositivo non supporta NFC");
      return;
    }

    try {
      const ndef = new window.NDEFReader();

      await ndef.scan();

      alert("Avvicina il braccialetto...");

      ndef.onreading = (event) => {
        const serial = event.serialNumber;

        if (!serial) {
          alert("UID non trovato");
          return;
        }

        const uid = serial.replace(/:/g, "").toUpperCase();

        alert("UID LETTO: " + uid);

        onScan(uid);
      };
    } catch (error) {
      console.error("Errore NFC:", error);
      alert("Errore durante la lettura NFC");
    }
  }

  return (
    <button
      onClick={startScan}
      style={{
        padding: "12px 20px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      📡 Scansiona braccialetto
    </button>
  );
}