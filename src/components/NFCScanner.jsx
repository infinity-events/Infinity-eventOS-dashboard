import { Capacitor } from "@capacitor/core";
import { CapacitorNfc } from "@capgo/capacitor-nfc";

export default function NFCScanner({ onScan }) {

  async function startScan() {

    // ==========================================
    // APP NATIVA ANDROID / IOS
    // ==========================================

    if (Capacitor.isNativePlatform()) {

      try {

        const { supported } = await CapacitorNfc.isSupported();

        if (!supported) {
          alert("Questo dispositivo non supporta NFC");
          return;
        }

        alert("Avvicina il braccialetto al telefono...");

        const listener = await CapacitorNfc.addListener(
          "nfcEvent",
          async (event) => {

            console.log("NFC EVENT:", event);

            if (!event.tag?.id) {
              alert("UID non trovato");
              return;
            }

            const uid = event.tag.id
              .map(byte =>
                byte
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase()
              )
              .join("");

            console.log("UID LETTO:", uid);

            await CapacitorNfc.stopScanning();
            await listener.remove();

            onScan(uid);
          }
        );

        await CapacitorNfc.startScanning({
          iosSessionType: "tag",
          invalidateAfterFirstRead: true,
          alertMessage:
            "Avvicina il braccialetto alla parte superiore del dispositivo."
        });

      } catch (error) {

        console.error("Errore NFC:", error);

        alert(
          error?.message ||
          "Errore durante la lettura NFC"
        );

      }

      return;
    }


    // ==========================================
    // BROWSER / WEB NFC
    // ==========================================

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

        const uid = serial
          .replace(/:/g, "")
          .toUpperCase();

        console.log("UID LETTO:", uid);

        onScan(uid);

      };

    } catch (error) {

      console.error("Errore Web NFC:", error);

      alert("Errore durante la lettura NFC");

    }

  }


  return (

    <button
      onClick={startScan}
      className="mt-8 w-full rounded-xl bg-purple-600 p-4 text-white text-lg"
    >
      📡 Scansiona braccialetto
    </button>

  );

}