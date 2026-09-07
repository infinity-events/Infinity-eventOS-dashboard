import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

import QRCode from "react-qr-code";

import {
  getInventoryStats,
  getInventoryAssets,
  getInventoryAsset,
  createInventoryAsset,
  getInventoryRentals,
  getInventoryRental,
  createInventoryRental,
  returnInventoryAsset,
  getInventoryMovements,
  deleteInventoryAsset,
} from "../api/inventory";


/* =========================================================
   HELPERS
========================================================= */

function normalizeQrCode(value) {
  if (!value) return "";

  const text = String(value).trim();

  const match = text.match(/INV-\d+/i);

  if (match) {
    return match[0].toUpperCase();
  }

  try {
    const url = new URL(text);

    const lastPart = url.pathname
      .split("/")
      .filter(Boolean)
      .pop();

    if (lastPart) {
      const urlMatch =
        lastPart.match(/INV-\d+/i);

      if (urlMatch) {
        return urlMatch[0].toUpperCase();
      }
    }
  } catch {
    // QR non URL
  }

  return text.toUpperCase();
}

function playScanBeep(type = "success") {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const success = type === "success";

    oscillator.type = "sine";
    oscillator.frequency.value = success ? 880 : 420;

    gain.gain.setValueAtTime(
      0.0001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.18,
      context.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.13
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(
      context.currentTime + 0.13
    );

    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch (error) {
    console.warn(
      "Impossibile riprodurre il bip:",
      error
    );
  }
}


function statusLabel(status) {
  switch (status) {
    case "AVAILABLE":
      return "Disponibile";

    case "RENTED":
      return "Noleggiato";

    case "MAINTENANCE":
      return "Manutenzione";

    case "LOST":
      return "Smarrimento";

    case "DISMISSED":
      return "Dismesso";

    default:
      return status || "—";
  }
}


function statusClass(status) {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "RENTED":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";

    case "MAINTENANCE":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    case "LOST":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    case "DISMISSED":
      return "bg-white/5 text-white/40 border-white/10";

    default:
      return "bg-white/5 text-white/50 border-white/10";
  }
}


function formatDate(value) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(
      "it-IT",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    ).format(new Date(value));
  } catch {
    return "—";
  }
}


function formatDateOnly(value) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(
      "it-IT",
      {
        dateStyle: "medium",
      }
    ).format(new Date(value));
  } catch {
    return "—";
  }
}


/* =========================================================
   GENERIC MODAL
========================================================= */

function Modal({
  title,
  children,
  onClose,
  maxWidth = "max-w-xl",
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] rounded-2xl border border-white/10 bg-[#111113] shadow-2xl flex flex-col overflow-hidden`}
      >

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto min-h-0">
          {children}
        </div>

      </div>
    </div>
  );
}


/* =========================================================
   ASSET DETAIL MODAL
========================================================= */

function AssetDetailModal({
  asset,
  onClose,
  onRent,
  onReturn,
  onDelete,
}) {
  return (
    <Modal
      title="Dettaglio asset"
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">

        <div>
          <h3 className="text-2xl font-semibold text-white">
            {asset.name}
          </h3>

          <p className="mt-1 text-sm text-white/40 font-mono">
            {asset.assetCode}
          </p>
        </div>


        {/* QR */}

        <div className="flex justify-center">
          <div
            id="asset-label-qr"
            className="bg-white p-6 rounded-[28px] inline-flex"
          >
            <QRCode
              value={String(asset.assetCode)}
              size={280}
              level="M"
            />
          </div>
        </div>


        {/* STATUS / CATEGORY */}

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-white/40">
              Stato
            </p>

            <span
              className={`inline-flex mt-2 px-2.5 py-1 rounded-lg border text-xs ${statusClass(
                asset.status
              )}`}
            >
              {statusLabel(asset.status)}
            </span>
          </div>


          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs text-white/40">
              Categoria
            </p>

            <p className="mt-1 font-medium">
              {asset.category || "—"}
            </p>
          </div>

        </div>


        {asset.description && (
          <div>
            <p className="text-xs text-white/40 mb-1">
              Descrizione
            </p>

            <p className="text-sm text-white/70">
              {asset.description}
            </p>
          </div>
        )}


        {asset.serialNumber && (
          <div>
            <p className="text-xs text-white/40 mb-1">
              Numero di serie
            </p>

            <p className="font-mono text-sm">
              {asset.serialNumber}
            </p>
          </div>
        )}


        {/* QR ACTIONS */}

        <div className="grid grid-cols-2 gap-2">

          <button
            onClick={() =>
              downloadAssetLabel(asset)
            }
            className="py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scarica PNG
          </button>


          <button
            onClick={() =>
              printAssetLabel(asset)
            }
            className="py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Stampa
          </button>

        </div>


        {/* MAIN ACTIONS */}

        <div className="flex gap-2">

          {asset.status === "AVAILABLE" && (
            <button
              onClick={onRent}
              className="flex-1 py-3 rounded-xl bg-white text-black font-medium"
            >
              Noleggia
            </button>
          )}


          {asset.status === "RENTED" && (
            <button
              onClick={onReturn}
              className="flex-1 py-3 rounded-xl bg-white text-black font-medium"
            >
              Registra restituzione
            </button>
          )}


          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            Chiudi
          </button>

        </div>


        {/* DELETE */}

        {asset.status !== "RENTED" && (
          <button
            onClick={onDelete}
            className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Elimina asset
          </button>
        )}

      </div>
    </Modal>
  );
}


/* =========================================================
   WAREHOUSE
========================================================= */

export default function Warehouse() {

  const scannerRef = useRef(null);

  // Protezione contro letture ripetute dello stesso QR
  const rentalScanBusyRef = useRef(false);
  const lastRentalScanRef = useRef({
    code: "",
    timestamp: 0,
  });


  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    lost: 0,
  });

  const [assets, setAssets] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [movements, setMovements] = useState([]);


  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");


  /* -------------------------------------------------------
     MODALS
  ------------------------------------------------------- */

  const [detailAsset, setDetailAsset] =
    useState(null);

  const [showCreateAsset, setShowCreateAsset] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);


  /* -------------------------------------------------------
     SCANNER
  ------------------------------------------------------- */

  const [scannerOpen, setScannerOpen] =
    useState(false);


  /* -------------------------------------------------------
     CREATE ASSET
  ------------------------------------------------------- */

  const [assetForm, setAssetForm] =
    useState({
      name: "",
      description: "",
      category: "",
      serialNumber: "",
    });

  const [createdAsset, setCreatedAsset] =
    useState(null);


  /* -------------------------------------------------------
     RENTAL WIZARD
  ------------------------------------------------------- */

  const [rentalStep, setRentalStep] =
    useState(null);

  const [rentalForm, setRentalForm] =
    useState({
      customerName: "",
      customerCompany: "",
      customerEmail: "",
      customerPhone: "",
      expectedReturnAt: "",
      notes: "",
    });

  const [rentalAssets, setRentalAssets] =
    useState([]);

  function closeRentalWizard() {
  stopRentalScanner();

  setRentalStep(null);
  setRentalAssets([]);

  setRentalForm({
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "",
    expectedReturnAt: "",
    notes: "",
  });

  lastRentalScanRef.current = {
    code: "",
    timestamp: 0,
  };

  rentalScanBusyRef.current = false;

  setError("");
  setSuccess("");
}


  /* =======================================================
     LOAD DATA
  ======================================================= */

  async function loadData() {
    try {
      setLoading(true);

      const [
        statsData,
        assetsData,
        rentalsData,
        movementsData,
      ] = await Promise.all([
        getInventoryStats(),
        getInventoryAssets(),
        getInventoryRentals(),
        getInventoryMovements(),
      ]);

      setStats(
        statsData || {
          total: 0,
          available: 0,
          rented: 0,
          maintenance: 0,
          lost: 0,
        }
      );

      setAssets(
        Array.isArray(assetsData)
          ? assetsData
          : []
      );

      setRentals(
        Array.isArray(rentalsData)
          ? rentalsData
          : []
      );

      setMovements(
        Array.isArray(movementsData)
          ? movementsData
          : []
      );

    } catch (err) {
      console.error(
        "Errore caricamento magazzino:",
        err
      );

      setError(
        err?.message ||
          "Impossibile caricare il magazzino."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  /* =======================================================
     SCANNER
  ======================================================= */

  function stopScanner() {
    const scanner =
      scannerRef.current;

    if (!scanner) return;

    scannerRef.current = null;

    scanner
      .stop()
      .then(() => scanner.clear())
      .catch((error) => {
        console.warn(
          "Errore chiusura scanner:",
          error
        );
      });
  }


  async function handleScannedCode(code) {
    if (!code) {
      setError("QR non valido.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const normalizedCode =
        normalizeQrCode(code);

      const asset =
        await getInventoryAsset(
          normalizedCode
        );

      if (!asset) {
        setError(
          `Asset ${normalizedCode} non trovato.`
        );
        return;
      }

      setDetailAsset(asset);

    } catch (err) {
      console.error(
        "Errore ricerca asset QR:",
        err
      );

      setError(
        err?.message ||
          `Asset ${code} non trovato nel magazzino.`
      );
    }
  }


  function startScanner() {
    if (scannerRef.current) return;

    setError("");
    setSuccess("");
    setScannerOpen(true);

    setTimeout(() => {

      const scanner =
        new Html5Qrcode(
          "warehouse-qr-reader"
        );

      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,

            qrbox: (
              viewfinderWidth,
              viewfinderHeight
            ) => {

              const size = Math.floor(
                Math.min(
                  viewfinderWidth,
                  viewfinderHeight
                ) * 0.8
              );

              return {
                width: size,
                height: size,
              };
            },

            aspectRatio: 1,

            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
            ],

            disableFlip: false,
          },

          async (decodedText) => {

            if (
              scannerRef.current !==
              scanner
            ) {
              return;
            }

            console.log(
              "QR MAGAZZINO RILEVATO:",
              decodedText
            );

            scannerRef.current = null;

            try {
              await scanner.stop();
            } catch (error) {
              console.warn(
                "Errore stop scanner:",
                error
              );
            }

            try {
              await scanner.clear();
            } catch (error) {
              console.warn(
                "Errore clear scanner:",
                error
              );
            }

            setScannerOpen(false);

            await handleScannedCode(
              decodedText
            );
          },

          () => null
        )
        .catch((error) => {

          console.error(
            "Errore avvio scanner:",
            error
          );

          if (
            scannerRef.current ===
            scanner
          ) {
            scannerRef.current = null;
          }

          setScannerOpen(false);

          setError(
            error?.message ||
              "Impossibile avviare la fotocamera"
          );
        });

    }, 100);
  }


  /* =======================================================
     RENTAL SCANNER
  ======================================================= */

  function stopRentalScanner() {
    const scanner =
      scannerRef.current;

    if (!scanner) return;

    scannerRef.current = null;

    scanner
      .stop()
      .then(() => scanner.clear())
      .catch((error) => {
        console.warn(
          "Errore chiusura scanner noleggio:",
          error
        );
      });
  }


  async function handleRentalScan(code) {
  if (!code) return;

  const normalizedCode =
    normalizeQrCode(code);

  if (!normalizedCode) return;

  const now = Date.now();

  /*
   * Ignora lo stesso QR se rimane davanti
   * alla fotocamera.
   */
  if (
    lastRentalScanRef.current.code ===
      normalizedCode &&
    now -
      lastRentalScanRef.current.timestamp <
      1500
  ) {
    return;
  }

  if (rentalScanBusyRef.current) {
    return;
  }

  lastRentalScanRef.current = {
    code: normalizedCode,
    timestamp: now,
  };

  rentalScanBusyRef.current = true;

  try {
    setError("");
    setSuccess("");

    /*
     * BLOCCO IMMEDIATO DEL DUPLICATO
     */
    if (
      rentalAssets.some(
        (item) =>
          item.assetCode ===
          normalizedCode
      )
    ) {
      playScanBeep("error");

      setError(
        `${normalizedCode} è già presente nel noleggio.`
      );

      return;
    }

    const asset =
      await getInventoryAsset(
        normalizedCode
      );

    if (!asset) {
      playScanBeep("error");

      setError(
        `${normalizedCode} non trovato nel magazzino.`
      );

      return;
    }

    if (
      asset.status !==
      "AVAILABLE"
    ) {
      playScanBeep("error");

      setError(
        `${asset.name} non è disponibile. Stato attuale: ${statusLabel(
          asset.status
        )}.`
      );

      return;
    }

    /*
     * Aggiunta atomica tramite controllo
     * sull'array corrente.
     */
    setRentalAssets((current) => {
      if (
        current.some(
          (item) =>
            item.assetCode ===
            asset.assetCode
        )
      ) {
        return current;
      }

      return [
        ...current,
        asset,
      ];
    });

    playScanBeep("success");

    setSuccess(
      `${asset.name} aggiunto al noleggio.`
    );
  } catch (err) {
    console.error(
      "Errore scansione noleggio:",
      err
    );

    playScanBeep("error");

    setError(
      err?.message ||
        "Impossibile aggiungere l'asset."
    );
  } finally {
    setTimeout(() => {
      rentalScanBusyRef.current =
        false;
    }, 500);
  }
}


  function startRentalScanner() {

    if (scannerRef.current)
      return;

    setError("");
    setSuccess("");

    setTimeout(() => {

      const scanner =
        new Html5Qrcode(
          "rental-qr-reader"
        );

      scannerRef.current =
        scanner;

      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,

            qrbox: (
              viewfinderWidth,
              viewfinderHeight
            ) => {

              const size = Math.floor(
                Math.min(
                  viewfinderWidth,
                  viewfinderHeight
                ) * 0.8
              );

              return {
                width: size,
                height: size,
              };
            },

            aspectRatio: 1,

            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
            ],

            disableFlip: false,
          },

          async (decodedText) => {

            if (
              scannerRef.current !==
              scanner
            ) {
              return;
            }

            console.log(
              "QR NOLEGGIO:",
              decodedText
            );

            await handleRentalScan(
              decodedText
            );

            /*
             * NON chiudiamo lo scanner.
             *
             * L'operatore continua a
             * scansionare tutti gli asset.
             */

          },

          () => null
        )
        .catch((error) => {

          console.error(
            "Errore avvio scanner noleggio:",
            error
          );

          if (
            scannerRef.current ===
            scanner
          ) {
            scannerRef.current = null;
          }

          setError(
            error?.message ||
              "Impossibile avviare la fotocamera."
          );
        });

    }, 100);
  }


  /* =======================================================
     RENTAL WIZARD
  ======================================================= */

  function openNewRental() {

    stopRentalScanner();

    setRentalForm({
      customerName: "",
      customerCompany: "",
      customerEmail: "",
      customerPhone: "",
      expectedReturnAt: "",
      notes: "",
    });

    setRentalAssets([]);

    lastRentalScanRef.current = {
          code: "",
          timestamp: 0,
    };

    rentalScanBusyRef.current = false;

    setError("");
    setSuccess("");

    setRentalStep("details");
  }


  function goToRentalScan() {

    if (
      !rentalForm.customerName.trim()
    ) {
      setError(
        "Inserisci il nome del cliente."
      );
      return;
    }

    setError("");
    setSuccess("");

    setRentalStep("scan");

    setTimeout(() => {
      startRentalScanner();
    }, 150);
  }


  function finishRentalScan() {

    stopRentalScanner();

    setError("");
    setSuccess("");

    setRentalStep("summary");
  }


  function addRentalAsset(asset) {

    if (!asset) return;

    const exists =
      rentalAssets.some(
        (item) =>
          item.assetCode ===
          asset.assetCode
      );

    if (exists) return;

    setRentalAssets(
      (current) => [
        ...current,
        asset,
      ]
    );
  }


  function removeRentalAsset(
    assetCode
  ) {

    setRentalAssets(
      (current) =>
        current.filter(
          (asset) =>
            asset.assetCode !==
            assetCode
        )
    );
  }


  async function completeRental() {

    if (
      rentalAssets.length === 0
    ) {
      setError(
        "Scansiona almeno un asset."
      );
      return;
    }

    try {

      setError("");
      setSuccess("");

      await createInventoryRental({
        ...rentalForm,

        assetCodes:
          rentalAssets.map(
            (asset) =>
              asset.assetCode
          ),
      });

      stopRentalScanner();

      setRentalStep(null);
      setRentalAssets([]);

      await loadData();

      setSuccess(
        "Noleggio completato correttamente."
      );

    } catch (err) {

      console.error(
        "Errore completamento noleggio:",
        err
      );

      setError(
        err?.message ||
          "Impossibile completare il noleggio."
      );
    }
  }


  /* =======================================================
     CREATE ASSET
  ======================================================= */

  async function handleCreateAsset(
    event
  ) {

    event?.preventDefault();

    if (!assetForm.name.trim()) {
      setError(
        "Inserisci il nome dell'asset."
      );
      return;
    }

    try {

      setError("");
      setSuccess("");

      const asset =
        await createInventoryAsset({
          name:
            assetForm.name.trim(),

          description:
            assetForm.description.trim() ||
            undefined,

          category:
            assetForm.category.trim() ||
            undefined,

          serialNumber:
            assetForm.serialNumber.trim() ||
            undefined,
        });

      setCreatedAsset(asset);

      setAssetForm({
        name: "",
        description: "",
        category: "",
        serialNumber: "",
      });

      await loadData();

    } catch (err) {

      console.error(
        "Errore creazione asset:",
        err
      );

      setError(
        err?.message ||
          "Impossibile creare l'asset."
      );
    }
  }


  /* =======================================================
     RETURN
  ======================================================= */

  async function handleReturn(
    asset
  ) {

    if (!asset?.assetCode)
      return;

    const confirmed =
      window.confirm(
        `Registrare la restituzione di "${asset.name}"?`
      );

    if (!confirmed) return;

    try {

      setError("");
      setSuccess("");

      await returnInventoryAsset(
        asset.assetCode
      );

      setDetailAsset(null);

      await loadData();

      setSuccess(
        `${asset.name} restituito correttamente.`
      );

    } catch (err) {

      console.error(
        "Errore restituzione:",
        err
      );

      setError(
        err?.message ||
          "Impossibile registrare la restituzione."
      );
    }
  }


  /* =======================================================
     DELETE / DISMISS
  ======================================================= */

  async function handleDeleteAsset(
    asset
  ) {

    if (!asset?.assetCode)
      return;

    const confirmed =
      window.confirm(
        `Sei sicuro di voler eliminare "${asset.name}"?\n\nSe l'asset ha uno storico, verrà dismesso e lo storico verrà conservato.`
      );

    if (!confirmed)
      return;

    try {

      setError("");
      setSuccess("");

      const result =
        await deleteInventoryAsset(
          asset.assetCode
        );

      setDetailAsset(null);

      await loadData();

      if (
        result?.action ===
        "DISMISSED"
      ) {
        setSuccess(
          `Asset ${asset.assetCode} dismesso. Lo storico è stato conservato.`
        );
      } else {
        setSuccess(
          `Asset ${asset.assetCode} eliminato definitivamente.`
        );
      }

    } catch (err) {

      console.error(
        "Errore eliminazione asset:",
        err
      );

      setError(
        err?.message ||
          "Impossibile eliminare l'asset."
      );
    }
  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredAssets =
    assets.filter((asset) => {

      const searchValue =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        asset.name
          ?.toLowerCase()
          .includes(searchValue) ||
        asset.assetCode
          ?.toLowerCase()
          .includes(searchValue) ||
        asset.category
          ?.toLowerCase()
          .includes(searchValue) ||
        asset.serialNumber
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        asset.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });


  /* =======================================================
     ACTIVE RENTALS
  ======================================================= */

  const activeRentals =
    rentals.filter(
      (rental) =>
        rental.status === "ACTIVE"
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-5 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Magazzino
          </h1>

          <p className="mt-1 text-sm text-white/40">
            Gestione attrezzature e noleggi
          </p>
        </div>


        <div className="flex flex-wrap gap-2">

          <button
            onClick={startScanner}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scansiona asset
          </button>


          <button
            onClick={openNewRental}
            className="px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuovo noleggio
          </button>


          <button
            onClick={() =>
              setShowCreateAsset(true)
            }
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Nuovo asset
          </button>

        </div>

      </div>


      {/* FEEDBACK */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-3">
          <X className="w-4 h-4 mt-0.5 shrink-0" />

          <span className="flex-1">
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
            className="text-red-300/60 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {success && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-3">
          <Check className="w-4 h-4 shrink-0" />

          <span className="flex-1">
            {success}
          </span>

          <button
            onClick={() =>
              setSuccess("")
            }
            className="text-emerald-300/60 hover:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">

        <StatCard
          label="Totale"
          value={stats.total}
          icon={Package}
        />

        <StatCard
          label="Disponibili"
          value={stats.available}
          icon={Check}
        />

        <StatCard
          label="Noleggiati"
          value={stats.rented}
          icon={Users}
        />

        <StatCard
          label="Manutenzione"
          value={stats.maintenance}
          icon={RefreshCw}
        />

        <StatCard
          label="Smarrimento"
          value={stats.lost}
          icon={X}
        />

      </div>


      {/* ASSETS */}

      <section className="rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">

        <div className="p-5 border-b border-white/10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="font-semibold">
                Inventario
              </h2>

              <p className="text-sm text-white/40 mt-1">
                Tutti gli asset operativi
              </p>
            </div>


            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Cerca asset..."
                  className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/20"
                />

              </div>


              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
              >
                <option value="ALL">
                  Tutti gli stati
                </option>

                <option value="AVAILABLE">
                  Disponibili
                </option>

                <option value="RENTED">
                  Noleggiati
                </option>

                <option value="MAINTENANCE">
                  Manutenzione
                </option>

                <option value="LOST">
                  Smarrimento
                </option>
              </select>

            </div>

          </div>

        </div>


        {loading ? (
          <div className="p-12 text-center text-white/40">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3" />
            Caricamento magazzino...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center">

            <Package className="w-10 h-10 mx-auto text-white/20 mb-3" />

            <p className="text-white/50">
              Nessun asset trovato.
            </p>

          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="text-left text-xs text-white/30 border-b border-white/5">

                  <th className="px-5 py-3 font-medium">
                    Asset
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Codice
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Categoria
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Stato
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Noleggio
                  </th>

                  <th className="px-5 py-3" />

                </tr>
              </thead>


              <tbody>

                {filteredAssets.map(
                  (asset) => {

                    const activeRental =
                      asset.rentalItems?.find(
                        (item) =>
                          item.returnedAt ===
                          null &&
                          item.rental?.status ===
                          "ACTIVE"
                      );

                    return (
                      <tr
                        key={asset.id}
                        onClick={() =>
                          setDetailAsset(asset)
                        }
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition cursor-pointer"
                      >

                        <td className="px-5 py-4">

                          <div className="font-medium">
                            {asset.name}
                          </div>

                          {asset.description && (
                            <div className="text-xs text-white/30 mt-1 max-w-xs truncate">
                              {asset.description}
                            </div>
                          )}

                        </td>


                        <td className="px-5 py-4">

                          <span className="font-mono text-sm text-white/60">
                            {asset.assetCode}
                          </span>

                        </td>


                        <td className="px-5 py-4 text-sm text-white/50">
                          {asset.category || "—"}
                        </td>


                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg border text-xs ${statusClass(
                              asset.status
                            )}`}
                          >
                            {statusLabel(
                              asset.status
                            )}
                          </span>

                        </td>


                        <td className="px-5 py-4">

                          {activeRental ? (
                            <div>
                              <p className="text-sm">
                                {
                                  activeRental
                                    .rental
                                    ?.customerName
                                }
                              </p>

                              <p className="text-xs text-white/30 mt-1">
                                {
                                  activeRental
                                    .rental
                                    ?.customerCompany
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-white/30">
                              —
                            </span>
                          )}

                        </td>


                        <td className="px-5 py-4 text-right">

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setDetailAsset(asset);
                            }}
                            className="p-2 rounded-lg hover:bg-white/10 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ACTIVE RENTALS */}

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">

        <div className="p-5 border-b border-white/10 flex items-center justify-between">

          <div>
            <h2 className="font-semibold">
              Noleggi attivi
            </h2>

            <p className="text-sm text-white/40 mt-1">
              Attrezzatura attualmente fuori dal magazzino
            </p>
          </div>

          <span className="text-sm text-white/40">
            {activeRentals.length}
          </span>

        </div>


        {activeRentals.length === 0 ? (
          <div className="p-8 text-center text-white/30">
            Nessun noleggio attivo.
          </div>
        ) : (

          <div className="divide-y divide-white/5">

            {activeRentals
              .slice(0, 10)
              .map((rental) => (

                <div
                  key={rental.id}
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>

                    <div className="flex items-center gap-2">

                      <User className="w-4 h-4 text-white/30" />

                      <span className="font-medium">
                        {rental.customerName}
                      </span>

                    </div>

                    {rental.customerCompany && (
                      <p className="text-sm text-white/40 mt-1">
                        {rental.customerCompany}
                      </p>
                    )}

                  </div>


                  <div className="text-sm text-white/40">
                    {rental.items?.length || 0} asset
                  </div>


                  <div className="text-sm text-white/40">
                    {formatDate(
                      rental.rentedAt
                    )}
                  </div>


                  <button
                    onClick={async () => {
                      try {
                        const fullRental =
                          await getInventoryRental(
                            rental.id
                          );

                        alert(
                          `Noleggio: ${
                            fullRental.customerName
                          }\nAsset: ${
                            fullRental.items?.length ||
                            0
                          }`
                        );
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    Dettagli
                  </button>

                </div>

              ))}

          </div>

        )}

      </section>


      {/* HISTORY */}

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#111113] overflow-hidden">

        <div className="p-5 flex items-center justify-between">

          <div>
            <h2 className="font-semibold">
              Attività recente
            </h2>

            <p className="text-sm text-white/40 mt-1">
              Ultimi movimenti del magazzino
            </p>
          </div>

          <button
            onClick={() =>
              setShowHistory(true)
            }
            className="text-sm text-white/50 hover:text-white transition"
          >
            Vedi tutto
          </button>

        </div>


        <div className="divide-y divide-white/5">

          {movements
            .slice(0, 5)
            .map((movement) => (

              <div
                key={movement.id}
                className="px-5 py-4 flex items-center gap-3"
              >

                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock3 className="w-4 h-4 text-white/40" />
                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-sm truncate">
                    {movement.asset?.name ||
                      movement.assetId}
                  </p>

                  <p className="text-xs text-white/30 mt-1">
                    {movement.type}
                    {" · "}
                    {formatDate(
                      movement.createdAt
                    )}
                  </p>

                </div>

              </div>

            ))}

          {movements.length === 0 && (
            <div className="px-5 py-8 text-center text-white/30">
              Nessun movimento.
            </div>
          )}

        </div>

      </section>


      {/* ===================================================
          SCANNER MODAL
      =================================================== */}

      {scannerOpen && (
        <Modal
          title="Scansiona asset"
          onClose={() => {
            stopScanner();
            setScannerOpen(false);
          }}
          maxWidth="max-w-xl"
        >

          <div className="space-y-4">

            <div
              id="warehouse-qr-reader"
              className="w-full overflow-hidden rounded-2xl"
            />

            <p className="text-center text-sm text-white/40">
              Inquadra il QR dell'asset.
            </p>


            <button
              onClick={() => {
                stopScanner();
                setScannerOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10"
            >
              Chiudi
            </button>

          </div>

        </Modal>
      )}

      {/* =========================================================
              NEW RENTAL — STEP 1
          ========================================================= */}
      {rentalStep === "details" && (
        <Modal
          title="Nuovo noleggio"
          onClose={closeRentalWizard}
        >
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-white">
                Dati del cliente
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Inserisci i dati del cliente prima di iniziare la scansione
                degli asset.
              </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nome cliente *
                </label>

                <input
                  type="text"
                  value={rentalForm.customerName}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Nome e cognome"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.07] transition"
                  autoFocus
                />
              </div>

              {/* Azienda */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Azienda
                </label>

                <input
                  type="text"
                  value={rentalForm.customerCompany}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      customerCompany: e.target.value,
                    }))
                  }
                  placeholder="Nome azienda"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.07] transition"
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Telefono
                </label>

                <input
                  type="tel"
                  value={rentalForm.customerPhone}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="+39 ..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.07] transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={rentalForm.customerEmail}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      customerEmail: e.target.value,
                    }))
                  }
                  placeholder="email@esempio.it"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.07] transition"
                />
              </div>

              {/* Data prevista restituzione */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Restituzione prevista
                </label>

                <input
                  type="datetime-local"
                  value={rentalForm.expectedReturnAt}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      expectedReturnAt: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/30 focus:bg-white/[0.07] transition [color-scheme:dark]"
                />
              </div>

              {/* Note */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Note
                </label>

                <textarea
                  value={rentalForm.notes}
                  onChange={(e) =>
                    setRentalForm((current) => ({
                      ...current,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Eventuali note sul noleggio..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.07] transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={closeRentalWizard}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={goToRentalScan}
                disabled={!rentalForm.customerName.trim()}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Avanti
              </button>
            </div>
          </div>
        </Modal>
      )}


      {/* ===================================================
          NEW RENTAL — STEP 2
      =================================================== */}

      {rentalStep === "scan" && (
        <Modal
          title="Scansione asset"
          onClose={() => {
            stopRentalScanner();
            setRentalStep(null);
          }}
          maxWidth="max-w-xl"
        >

          <div className="space-y-4">

            <div>
              <p className="text-sm font-medium">
                2. Scansiona l'attrezzatura
              </p>

              <p className="text-xs text-white/40 mt-1">
                Scansiona in sequenza tutti gli asset richiesti dal cliente.
              </p>
            </div>


            <div
              id="rental-qr-reader"
              className="w-full overflow-hidden rounded-2xl"
            />


            <div className="rounded-xl bg-white/5 border border-white/10 p-4">

              <div className="flex items-center justify-between mb-3">

                <span className="text-sm text-white/50">
                  Asset scansionati
                </span>

                <span className="font-semibold">
                  {rentalAssets.length}
                </span>

              </div>


              {rentalAssets.length === 0 ? (
                <p className="text-sm text-white/30">
                  Nessun asset scansionato.
                </p>
              ) : (

                <div className="space-y-2">

                  {rentalAssets.map(
                    (asset) => (

                      <div
                        key={asset.assetCode}
                        className="flex items-center gap-3 rounded-xl bg-black/20 p-3"
                      >

                        <Package className="w-4 h-4 text-white/40" />

                        <div className="flex-1 min-w-0">

                          <p className="text-sm truncate">
                            {asset.name}
                          </p>

                          <p className="text-xs text-white/30 font-mono">
                            {asset.assetCode}
                          </p>

                        </div>

                        <Check className="w-4 h-4 text-emerald-400" />

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            <button
              onClick={finishRentalScan}
              className="w-full py-3 rounded-xl bg-white text-black font-medium"
            >
              Fine
            </button>

          </div>

        </Modal>
      )}


      {/* ===================================================
          NEW RENTAL — STEP 3
      =================================================== */}

      {rentalStep === "summary" && (
        <Modal
          title="Riepilogo noleggio"
          onClose={() =>
            setRentalStep(null)
          }
          maxWidth="max-w-xl"
        >

          <div className="space-y-5">

            <div>
              <p className="text-sm font-medium">
                3. Controlla e completa
              </p>

              <p className="text-xs text-white/40 mt-1">
                Verifica gli asset prima di confermare il noleggio.
              </p>
            </div>


            {/* CUSTOMER */}

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">

              <div className="flex items-start gap-3">

                <User className="w-4 h-4 mt-0.5 text-white/40" />

                <div>

                  <p className="font-medium">
                    {rentalForm.customerName}
                  </p>

                  {rentalForm.customerCompany && (
                    <p className="text-sm text-white/40 mt-1">
                      {rentalForm.customerCompany}
                    </p>
                  )}

                  {rentalForm.customerEmail && (
                    <p className="text-sm text-white/40 mt-1">
                      {rentalForm.customerEmail}
                    </p>
                  )}

                  {rentalForm.customerPhone && (
                    <p className="text-sm text-white/40 mt-1">
                      {rentalForm.customerPhone}
                    </p>
                  )}

                </div>

              </div>

            </div>


            {/* ASSETS */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <div>
                  <p className="text-sm font-medium">
                    Asset noleggiati
                  </p>

                  <p className="text-xs text-white/30 mt-1">
                    {rentalAssets.length} asset
                  </p>
                </div>

              </div>


              {rentalAssets.length === 0 ? (

                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">

                  <Package className="w-8 h-8 mx-auto text-white/20 mb-2" />

                  <p className="text-sm text-white/40">
                    Nessun asset selezionato.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {rentalAssets.map(
                    (asset) => (

                      <div
                        key={asset.assetCode}
                        className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                      >

                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">

                          <Package className="w-4 h-4 text-white/50" />

                        </div>


                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-medium truncate">
                            {asset.name}
                          </p>

                          <p className="text-xs text-white/30 font-mono mt-1">
                            {asset.assetCode}
                          </p>

                        </div>


                        <button
                          onClick={() =>
                            removeRentalAsset(
                              asset.assetCode
                            )
                          }
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                          title="Rimuovi asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* ADD */}

            <button
              onClick={() => {

                setRentalStep("scan");

                setTimeout(() => {
                  startRentalScanner();
                }, 150);

              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Aggiungi asset
            </button>


            {/* RETURN DATE */}

            {rentalForm.expectedReturnAt && (
              <div className="flex items-center gap-3 text-sm text-white/50">

                <CalendarDays className="w-4 h-4" />

                Restituzione prevista:

                <span className="text-white">
                  {formatDate(
                    rentalForm.expectedReturnAt
                  )}
                </span>

              </div>
            )}


            {/* COMPLETE */}

            <button
              onClick={completeRental}
              disabled={
                rentalAssets.length === 0
              }
              className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Completa noleggio
            </button>


            <button
              onClick={() =>
                setRentalStep("details")
              }
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Modifica dati
            </button>

          </div>

        </Modal>
      )}


      {/* ===================================================
          CREATE ASSET
      =================================================== */}

      {showCreateAsset && !createdAsset && (
        <Modal
          title="Nuovo asset"
          onClose={() =>
            setShowCreateAsset(false)
          }
        >

          <form
            onSubmit={
              handleCreateAsset
            }
            className="space-y-5"
          >

            <Input
              label="Nome asset"
              required
              value={assetForm.name}
              onChange={(value) =>
                setAssetForm(
                  (current) => ({
                    ...current,
                    name: value,
                  })
                )
              }
              placeholder="Case Cavi 1"
            />


            <Input
              label="Categoria"
              value={
                assetForm.category
              }
              onChange={(value) =>
                setAssetForm(
                  (current) => ({
                    ...current,
                    category: value,
                  })
                )
              }
              placeholder="Casse, Rack, Luci..."
            />


            <Input
              label="Numero di serie"
              value={
                assetForm.serialNumber
              }
              onChange={(value) =>
                setAssetForm(
                  (current) => ({
                    ...current,
                    serialNumber: value,
                  })
                )
              }
              placeholder="Seriale..."
            />


            <TextArea
              label="Descrizione"
              value={
                assetForm.description
              }
              onChange={(value) =>
                setAssetForm(
                  (current) => ({
                    ...current,
                    description: value,
                  })
                )
              }
              placeholder="Descrizione dell'attrezzatura..."
            />


            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-black font-medium"
            >
              Crea asset
            </button>

          </form>

        </Modal>
      )}


      {/* ===================================================
          CREATED ASSET
      =================================================== */}

      {showCreateAsset &&
        createdAsset && (
          <Modal
            title="Asset creato"
            onClose={() => {
              setShowCreateAsset(false);
              setCreatedAsset(null);
            }}
            maxWidth="max-w-lg"
          >

            <div className="space-y-5 text-center">

              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">

                <Check className="w-6 h-6 text-emerald-400" />

              </div>


              <div>

                <h3 className="text-xl font-semibold">
                  {createdAsset.name}
                </h3>

                <p className="mt-1 text-sm text-white/40 font-mono">
                  {createdAsset.assetCode}
                </p>

              </div>


              <div className="bg-white p-6 rounded-[28px] inline-flex">

                <QRCode
                  value={String(
                    createdAsset.assetCode
                  )}
                  size={280}
                  level="M"
                />

              </div>


              <p className="text-sm text-white/40">
                Questo QR identifica in modo univoco l'asset.
              </p>


              <button
                onClick={() => {
                  setShowCreateAsset(false);
                  setCreatedAsset(null);
                }}
                className="w-full py-3 rounded-xl bg-white text-black font-medium"
              >
                Fine
              </button>

            </div>

          </Modal>
        )}


      {/* ===================================================
          HISTORY MODAL
      =================================================== */}

      {showHistory && (
        <Modal
          title="Storico magazzino"
          onClose={() =>
            setShowHistory(false)
          }
          maxWidth="max-w-2xl"
        >

          <div className="space-y-2">

            {movements.length === 0 ? (

              <div className="py-10 text-center text-white/30">
                Nessun movimento.
              </div>

            ) : (

              movements.map(
                (movement) => (

                  <div
                    key={movement.id}
                    className="rounded-xl bg-white/5 border border-white/10 p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">

                        <Clock3 className="w-4 h-4 text-white/40" />

                      </div>


                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                          <p className="font-medium">
                            {movement.asset?.name ||
                              movement.assetId}
                          </p>

                          <span className="text-xs text-white/30">
                            {formatDate(
                              movement.createdAt
                            )}
                          </span>

                        </div>


                        <p className="text-xs text-white/40 mt-1">
                          {movement.type}
                        </p>


                        {movement.note && (
                          <p className="text-sm text-white/50 mt-2">
                            {movement.note}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </Modal>
      )}

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111113] p-4">

      <div className="flex items-center justify-between">

        <span className="text-sm text-white/40">
          {label}
        </span>

        <Icon className="w-4 h-4 text-white/30" />

      </div>

      <p className="text-2xl font-semibold mt-3">
        {value}
      </p>

    </div>
  );
}


function Input({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">

      <span className="block text-xs text-white/40 mb-2">
        {label}
        {required && (
          <span className="text-red-400 ml-1">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/20 placeholder:text-white/20"
      />

    </label>
  );
}


function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">

      <span className="block text-xs text-white/40 mb-2">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/20 placeholder:text-white/20 resize-none"
      />

    </label>
  );
}


/* =========================================================
   QR LABEL DOWNLOAD
========================================================= */

function downloadAssetLabel(asset) {

  if (!asset?.assetCode)
    return;

  const qrSvg =
    document.querySelector(
      "#asset-label-qr svg"
    );

  if (!qrSvg) {
    alert(
      "QR non ancora disponibile."
    );
    return;
  }

  const svgData =
    new XMLSerializer()
      .serializeToString(qrSvg);

  const svgBlob =
    new Blob(
      [svgData],
      {
        type:
          "image/svg+xml;charset=utf-8",
      }
    );

  const url =
    URL.createObjectURL(
      svgBlob
    );

  const img =
    new Image();

  img.onload = () => {

    const width = 1000;
    const height = 1200;

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /* NAME */

    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font =
      "bold 64px Arial";

    const name =
      asset.name?.length > 24
        ? asset.name.substring(
            0,
            24
          ) + "..."
        : asset.name;

    ctx.fillText(
      name,
      width / 2,
      130
    );


    /* CODE */

    ctx.fillStyle = "#777777";
    ctx.font =
      "32px monospace";

    ctx.fillText(
      asset.assetCode,
      width / 2,
      185
    );


    /* QR */

    const qrSize = 650;

    const qrX =
      (width - qrSize) / 2;

    const qrY = 280;

    ctx.drawImage(
      img,
      qrX,
      qrY,
      qrSize,
      qrSize
    );


    /* BORDER */

    ctx.strokeStyle =
      "#eeeeee";

    ctx.lineWidth = 8;

    const radius = 35;

    ctx.beginPath();

    ctx.roundRect(
      qrX - 25,
      qrY - 25,
      qrSize + 50,
      qrSize + 50,
      radius
    );

    ctx.stroke();


    /* BRAND */

    ctx.fillStyle =
      "#777777";

    ctx.font =
      "26px Arial";

    ctx.fillText(
      "INFINITY EVENTOS",
      width / 2,
      1050
    );


    /* DOWNLOAD */

    const link =
      document.createElement(
        "a"
      );

    link.download =
      `${asset.assetCode}-label.png`;

    link.href =
      canvas.toDataURL(
        "image/png"
      );

    link.click();

    URL.revokeObjectURL(url);
  };


  img.onerror = () => {

    URL.revokeObjectURL(url);

    alert(
      "Impossibile generare il PNG del QR."
    );

  };


  img.src = url;
}


/* =========================================================
   PRINT QR LABEL
========================================================= */

function printAssetLabel(asset) {

  if (!asset?.assetCode)
    return;

  const qrSvg =
    document.querySelector(
      "#asset-label-qr svg"
    );

  if (!qrSvg) {
    alert(
      "QR non ancora disponibile."
    );
    return;
  }

  const svgData =
    new XMLSerializer()
      .serializeToString(qrSvg);

  const svgBlob =
    new Blob(
      [svgData],
      {
        type:
          "image/svg+xml;charset=utf-8",
      }
    );

  const qrUrl =
    URL.createObjectURL(
      svgBlob
    );

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=600,height=800"
    );

  if (!printWindow) {

    URL.revokeObjectURL(
      qrUrl
    );

    alert(
      "Il browser ha bloccato la finestra di stampa."
    );

    return;
  }


  const safeName =
    String(
      asset.name || ""
    )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        ""
      );


  const safeCode =
    String(
      asset.assetCode || ""
    )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      );


  printWindow.document.write(`
    <!DOCTYPE html>

    <html>

      <head>

        <title>
          ${safeCode}
        </title>

        <style>

          @page {
            size: 100mm 120mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: white;
            font-family: Arial, sans-serif;
          }

          .label {
            width: 100mm;
            height: 120mm;
            padding: 10mm;

            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .name {
            font-size: 22pt;
            font-weight: 700;
            text-align: center;
            margin-top: 4mm;
            max-width: 90mm;
            word-break: break-word;
          }

          .code {
            font-family: monospace;
            font-size: 11pt;
            color: #777;
            margin-top: 2mm;
          }

          .qr-wrapper {
            margin-top: 8mm;
            padding: 5mm;

            border: 1px solid #eee;
            border-radius: 5mm;
          }

          .qr {
            width: 62mm;
            height: 62mm;
            display: block;
          }

          .brand {
            margin-top: 8mm;
            font-size: 8pt;
            letter-spacing: 1px;
            color: #888;
          }

        </style>

      </head>


      <body>

        <div class="label">

          <div class="name">
            ${safeName}
          </div>

          <div class="code">
            ${safeCode}
          </div>

          <div class="qr-wrapper">

            <img
              class="qr"
              src="${qrUrl}"
            />

          </div>

          <div class="brand">
            INFINITY EVENTOS
          </div>

        </div>


        <script>

          window.onload =
            function() {

              setTimeout(
                function() {

                  window.print();

                },
                500
              );

            };


          window.onafterprint =
            function() {

              window.close();

            };

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();


  setTimeout(() => {

    URL.revokeObjectURL(
      qrUrl
    );

  }, 5000);
}