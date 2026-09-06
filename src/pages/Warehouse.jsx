import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  History,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Truck,
  User,
  Users,
  X,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import QRCode from "react-qr-code";

import {
  getInventoryStats,
  getInventoryAssets,
  getInventoryRentals,
  getInventoryMovements,
  createInventoryAsset,
  createInventoryRental,
  returnInventoryAsset,
} from "../api/inventory";

function downloadAssetLabel(asset) {
  if (!asset?.assetCode) return;

  const qrCanvas = document.querySelector(
    "#asset-label-qr canvas",
  );

  if (!qrCanvas) {
    alert("QR non ancora disponibile.");
    return;
  }

  const width = 1000;
  const height = 1200;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  // Sfondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Nome asset
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.font = "bold 64px Arial";

  const name =
    asset.name?.length > 24
      ? asset.name.substring(0, 24) + "..."
      : asset.name;

  ctx.fillText(
    name,
    width / 2,
    130,
  );

  // Codice inventario
  ctx.fillStyle = "#777777";
  ctx.font = "32px monospace";

  ctx.fillText(
    asset.assetCode,
    width / 2,
    185,
  );

  // QR
  const qrSize = 650;
  const qrX = (width - qrSize) / 2;
  const qrY = 280;

  ctx.drawImage(
    qrCanvas,
    qrX,
    qrY,
    qrSize,
    qrSize,
  );

  // Bordo arrotondato intorno al QR
  ctx.strokeStyle = "#eeeeee";
  ctx.lineWidth = 8;

  const radius = 35;

  ctx.beginPath();
  ctx.roundRect(
    qrX - 25,
    qrY - 25,
    qrSize + 50,
    qrSize + 50,
    radius,
  );
  ctx.stroke();

  // Codice sotto il QR
  ctx.fillStyle = "#777777";
  ctx.font = "26px Arial";

  ctx.fillText(
    "INFINITY EVENTOS",
    width / 2,
    1050,
  );

  // Download
  const link =
    document.createElement("a");

  link.download = `${asset.assetCode}-label.png`;
  link.href = canvas.toDataURL("image/png");

  link.click();
}

function printAssetLabel(asset) {
  if (!asset?.assetCode) return;

  const qrCanvas = document.querySelector(
    "#asset-label-qr canvas",
  );

  if (!qrCanvas) {
    alert("QR non ancora disponibile.");
    return;
  }

  const qrDataUrl =
    qrCanvas.toDataURL("image/png");

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=600,height=800",
    );

  if (!printWindow) {
    alert(
      "Il browser ha bloccato la finestra di stampa.",
    );
    return;
  }

  const safeName =
    String(asset.name || "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const safeCode =
    String(asset.assetCode || "")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${safeCode}</title>

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
            justify-content: flex-start;
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
              src="${qrDataUrl}"
            />
          </div>

          <div class="brand">
            INFINITY EVENTOS
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };

          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function normalizeQrCode(value) {
  if (!value) return "";

  const text = String(value).trim();

  const match = text.match(/INV-\d+/i);
  if (match) {
    return match[0].toUpperCase();
  }

  try {
    const url = new URL(text);
    const lastPart = url.pathname.split("/").filter(Boolean).pop();

    if (lastPart) {
      const urlMatch = lastPart.match(/INV-\d+/i);
      if (urlMatch) return urlMatch[0].toUpperCase();
    }
  } catch {
    // QR non URL
  }

  return text.toUpperCase();
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
    default:
      return status || "-";
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
    default:
      return "bg-white/5 text-white/60 border-white/10";
  }
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getActiveRental(asset) {
  return asset?.rentalItems?.find(
    (item) =>
      !item.returnedAt &&
      item.rental?.status === "ACTIVE",
  )?.rental;
}

export default function Warehouse() {
  const scannerRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedAssets, setSelectedAssets] = useState([]);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const [detailAsset, setDetailAsset] = useState(null);
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

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

      setStats(statsData);
      setAssets(assetsData || []);
      setRentals(rentalsData || []);
      setMovements(movementsData || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.message || "Errore caricamento magazzino",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) return;

    scannerRef.current = null;

    scanner
      .stop()
      .catch(() => {})
      .finally(() => {
        scanner.clear().catch(() => {});
      });
  }

  function startScanner() {
  setError("");
  setSuccess("");
  setScannerOpen(true);

  setTimeout(() => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode(
      "warehouse-qr-reader",
      {
        verbose: false,
      },
    );

    scannerRef.current = scanner;

    scanner
      .start(
        {
          facingMode: "environment",
        },
        {
          fps: 15,

          qrbox: function (viewfinderWidth, viewfinderHeight) {
            const minEdge = Math.min(
              viewfinderWidth,
              viewfinderHeight,
            );

            const size = Math.floor(
              minEdge * 0.65,
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

          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },

          disableFlip: false,
        },

        async (decodedText) => {
          if (scannerRef.current !== scanner) {
            return;
          }

          console.log(
            "QR MAGAZZINO RILEVATO:",
            decodedText,
          );

          const code =
            normalizeQrCode(decodedText);

          scannerRef.current = null;

          try {
            await scanner.stop();
          } catch (error) {
            console.warn(
              "Stop scanner:",
              error,
            );
          }

          try {
            await scanner.clear();
          } catch (error) {
            console.warn(
              "Clear scanner:",
              error,
            );
          }

          setScannerOpen(false);

          await handleScannedCode(code);
        },

        (errorMessage) => {
          // html5-qrcode chiama questa funzione
          // continuamente quando NON trova un QR.
          // Non mostriamo errori all'utente.
        },
      )
      .catch((error) => {
        console.error(
          "Errore avvio scanner:",
          error,
        );

        if (
          scannerRef.current === scanner
        ) {
          scannerRef.current = null;
        }

        setScannerOpen(false);

        setError(
          error?.message ||
            "Impossibile avviare la fotocamera",
        );
      });
  }, 300);
}

  async function handleScannedCode(code) {
    if (!code) {
      setError("QR non valido");
      return;
    }

    const asset = assets.find(
      (item) =>
        item.assetCode.toUpperCase() ===
        code.toUpperCase(),
    );

    if (!asset) {
      setError(
        `Asset ${code} non trovato nel magazzino.`,
      );
      return;
    }

    setDetailAsset(asset);
  }

  function handleManualSearch() {
    const code = normalizeQrCode(manualCode);

    if (!code) return;

    handleScannedCode(code);
    setManualCode("");
  }

  function toggleAsset(asset) {
    if (asset.status !== "AVAILABLE") return;

    setSelectedAssets((current) => {
      if (current.includes(asset.assetCode)) {
        return current.filter(
          (code) => code !== asset.assetCode,
        );
      }

      return [...current, asset.assetCode];
    });
  }

  function selectSingleAsset(asset) {
    if (asset.status !== "AVAILABLE") return;

    setSelectedAssets([asset.assetCode]);
    setDetailAsset(null);
    setRentalModalOpen(true);
  }

  function openRentalForSelected() {
    if (!selectedAssets.length) {
      setError("Seleziona almeno un asset.");
      return;
    }

    setRentalModalOpen(true);
  }

  async function handleReturn(asset) {
    if (!asset?.assetCode) return;

    const confirmed = window.confirm(
      `Confermi la restituzione di ${asset.assetCode}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await returnInventoryAsset(asset.assetCode);

      setSuccess(
        `${asset.assetCode} restituito correttamente.`,
      );

      setDetailAsset(null);

      await loadData(true);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Errore durante la restituzione",
      );
    }
  }

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.assetCode
          ?.toLowerCase()
          .includes(query) ||
        asset.name
          ?.toLowerCase()
          .includes(query) ||
        asset.category
          ?.toLowerCase()
          .includes(query) ||
        asset.serialNumber
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        asset.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white p-8">
        <div className="flex items-center gap-3 text-white/60">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Caricamento magazzino...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold">
                  Magazzino
                </h1>

                <p className="text-sm text-white/40">
                  Gestione attrezzatura e noleggi
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Aggiorna
            </button>

            <button
              onClick={startScanner}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition flex items-center gap-2 font-medium"
            >
              <QrCode className="w-4 h-4" />
              Scansiona QR
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuovo asset
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 px-4 py-3 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 px-4 py-3 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Archive}
            label="Totale asset"
            value={stats?.total ?? assets.length}
          />

          <StatCard
            icon={CheckCircle2}
            label="Disponibili"
            value={stats?.available ?? 0}
          />

          <StatCard
            icon={Truck}
            label="Noleggiati"
            value={stats?.rented ?? 0}
          />

          <StatCard
            icon={Clock3}
            label="Manutenzione"
            value={stats?.maintenance ?? 0}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid lg:grid-cols-3 gap-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-5 h-5" />
              <div>
                <h2 className="font-medium">
                  Cerca tramite QR
                </h2>
                <p className="text-xs text-white/40">
                  Scansiona il codice dell'attrezzatura
                </p>
              </div>
            </div>

            <button
              onClick={startScanner}
              className="w-full rounded-xl bg-white text-black py-3 font-medium hover:bg-white/90 transition"
            >
              Apri fotocamera
            </button>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5" />
              <div>
                <h2 className="font-medium">
                  Ricerca manuale
                </h2>
                <p className="text-xs text-white/40">
                  Inserisci il codice INV dell'asset
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) =>
                  setManualCode(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualSearch();
                  }
                }}
                placeholder="es. INV-000001"
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
              />

              <button
                onClick={handleManualSearch}
                className="px-5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15"
              >
                Cerca
              </button>
            </div>
          </div>
        </div>

        {/* ASSETS */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

          <div className="p-5 border-b border-white/10 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold">
                Attrezzatura
              </h2>
              <p className="text-sm text-white/40">
                {filteredAssets.length} asset visualizzati
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cerca..."
                  className="w-56 bg-black/20 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="bg-[#111113] border border-white/10 rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="ALL">
                  Tutti
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
                  Smarriti
                </option>
              </select>
            </div>
          </div>

          {selectedAssets.length > 0 && (
            <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="text-sm text-white/60">
                <strong className="text-white">
                  {selectedAssets.length}
                </strong>{" "}
                asset selezionati
              </div>

              <button
                onClick={openRentalForSelected}
                className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Crea noleggio
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-white/30 border-b border-white/10">
                  <th className="px-5 py-4 w-10"></th>
                  <th className="px-5 py-4">
                    Asset
                  </th>
                  <th className="px-5 py-4">
                    Categoria
                  </th>
                  <th className="px-5 py-4">
                    Stato
                  </th>
                  <th className="px-5 py-4">
                    Noleggiato a
                  </th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => {
                  const rental =
                    getActiveRental(asset);

                  const selected =
                    selectedAssets.includes(
                      asset.assetCode,
                    );

                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={
                            asset.status !== "AVAILABLE"
                          }
                          onChange={() =>
                            toggleAsset(asset)
                          }
                          className="w-4 h-4 accent-white"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            setDetailAsset(asset)
                          }
                          className="text-left"
                        >
                          <div className="font-medium">
                            {asset.name}
                          </div>

                          <div className="text-xs text-white/30 mt-1 font-mono">
                            {asset.assetCode}
                          </div>
                        </button>
                      </td>

                      <td className="px-5 py-4 text-sm text-white/50">
                        {asset.category || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg border text-xs ${statusClass(
                            asset.status,
                          )}`}
                        >
                          {statusLabel(asset.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {rental ? (
                          <div>
                            <div>
                              {rental.customerName}
                            </div>

                            {rental.customerCompany && (
                              <div className="text-xs text-white/30">
                                {
                                  rental.customerCompany
                                }
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/20">
                            -
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            setDetailAsset(asset)
                          }
                          className="p-2 rounded-lg hover:bg-white/10"
                        >
                          <ChevronRight className="w-4 h-4 text-white/40" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredAssets.length && (
              <div className="py-16 text-center text-white/30">
                Nessun asset trovato.
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* RENTALS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">
                  Noleggi attivi
                </h2>
                <p className="text-sm text-white/40">
                  Attrezzatura attualmente fuori
                </p>
              </div>

              <Users className="w-5 h-5 text-white/30" />
            </div>

            <div className="space-y-2">
              {rentals
                .filter(
                  (rental) =>
                    rental.status === "ACTIVE",
                )
                .slice(0, 5)
                .map((rental) => (
                  <div
                    key={rental.id}
                    className="rounded-xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="font-medium">
                          {rental.customerName}
                        </div>

                        {rental.customerCompany && (
                          <div className="text-xs text-white/40">
                            {
                              rental.customerCompany
                            }
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-white/30">
                        {formatDate(
                          rental.rentedAt,
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rental.items?.map((item) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 rounded-md bg-white/5 text-xs font-mono text-white/50"
                        >
                          {item.asset?.assetCode ||
                            item.assetId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              {!rentals.some(
                (rental) =>
                  rental.status === "ACTIVE",
              ) && (
                <div className="py-8 text-center text-white/25 text-sm">
                  Nessun noleggio attivo.
                </div>
              )}
            </div>
          </div>

          {/* HISTORY */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">
                  Ultimi movimenti
                </h2>
                <p className="text-sm text-white/40">
                  Attività recenti del magazzino
                </p>
              </div>

              <button
                onClick={() =>
                  setHistoryOpen(true)
                }
                className="text-xs text-white/50 hover:text-white"
              >
                Vedi tutto
              </button>
            </div>

            <div className="space-y-2">
              {movements
                .slice(0, 6)
                .map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center gap-3 rounded-xl bg-black/20 p-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                      <History className="w-4 h-4 text-white/40" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        {movement.type}
                      </div>

                      <div className="text-xs text-white/30 truncate">
                        {movement.asset?.assetCode ||
                          movement.assetId}
                      </div>
                    </div>

                    <div className="text-xs text-white/25">
                      {formatDate(
                        movement.createdAt,
                      )}
                    </div>
                  </div>
                ))}

              {!movements.length && (
                <div className="py-8 text-center text-white/25 text-sm">
                  Nessun movimento.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCANNER MODAL */}
      {scannerOpen && (
        <Modal
          title="Scansiona asset"
          onClose={() => {
            stopScanner();
            setScannerOpen(false);
          }}
        >
          <div
            id="warehouse-qr-reader"
            className="overflow-hidden rounded-xl bg-black min-h-[320px]"
          />

          <p className="text-sm text-white/40 text-center mt-4">
            Inquadra il QR dell'attrezzatura.
          </p>
        </Modal>
      )}

      {/* DETAIL MODAL */}
      {detailAsset && (
        <AssetDetailModal
          asset={detailAsset}
          onClose={() =>
            setDetailAsset(null)
          }
          onRent={() =>
            selectSingleAsset(detailAsset)
          }
          onReturn={() =>
            handleReturn(detailAsset)
          }
        />
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <CreateAssetModal
          onClose={() =>
            setCreateModalOpen(false)
          }
          onCreated={async (created) => {
            setCreateModalOpen(false);
            setSuccess(
              `${created.name} creato come ${created.assetCode}.`,
            );
            await loadData(true);
            setDetailAsset(created);
          }}
        />
      )}

      {/* RENTAL MODAL */}
      {rentalModalOpen && (
        <RentalModal
          assetCodes={selectedAssets}
          onClose={() =>
            setRentalModalOpen(false)
          }
          onCreated={async () => {
            setRentalModalOpen(false);
            setSelectedAssets([]);
            setSuccess(
              "Noleggio registrato correttamente.",
            );
            await loadData(true);
          }}
        />
      )}

      {/* HISTORY MODAL */}
      {historyOpen && (
        <Modal
          title="Storico magazzino"
          onClose={() =>
            setHistoryOpen(false)
          }
        >
          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="border border-white/5 rounded-xl p-4 bg-black/20"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-medium">
                      {movement.type}
                    </div>

                    <div className="text-xs text-white/40 mt-1 font-mono">
                      {movement.asset?.assetCode ||
                        movement.assetId}
                    </div>
                  </div>

                  <div className="text-xs text-white/30">
                    {formatDate(
                      movement.createdAt,
                    )}
                  </div>
                </div>

                {movement.note && (
                  <div className="text-sm text-white/50 mt-3">
                    {movement.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/40">
          {label}
        </div>

        <Icon className="w-4 h-4 text-white/30" />
      </div>

      <div className="text-3xl font-semibold mt-3">
        {value}
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function AssetDetailModal({
  asset,
  onClose,
  onRent,
  onReturn,
}) {
  const rental = getActiveRental(asset);

  return (
    <Modal
      title="Dettaglio asset"
      onClose={onClose}
    >
      <div className="space-y-5">

        <div>
          <div className="text-2xl font-semibold">
            {asset.name}
          </div>

          <div className="font-mono text-sm text-white/30 mt-1">
            {asset.assetCode}
          </div>
        </div>

        <div className="flex justify-center py-4">
          <div 
            id="asset-label-qr"
            className="bg-white p-6 rounded-2xl"
        >
            <QRCode
                value={asset.assetCode}
                size={280}
            />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Info
            label="Stato"
            value={
              <span
                className={`inline-flex px-2 py-1 rounded-lg border text-xs ${statusClass(
                  asset.status,
                )}`}
              >
                {statusLabel(asset.status)}
              </span>
            }
          />

          <Info
            label="Categoria"
            value={
              asset.category || "-"
            }
          />

          <Info
            label="Seriale"
            value={
              asset.serialNumber || "-"
            }
          />

          <Info
            label="Creato"
            value={formatDate(
              asset.createdAt,
            )}
          />
        </div>

        {asset.description && (
          <div>
            <div className="text-xs text-white/30 mb-1">
              Descrizione
            </div>

            <div className="text-sm text-white/60">
              {asset.description}
            </div>
          </div>
        )}

        {rental && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="text-xs text-orange-300/60 mb-2">
              ATTUALMENTE NOLEGGIATO
            </div>

            <div className="font-medium">
              {rental.customerName}
            </div>

            {rental.customerCompany && (
              <div className="text-sm text-white/40">
                {rental.customerCompany}
              </div>
            )}

            {rental.customerPhone && (
              <div className="text-sm text-white/40 mt-2">
                {rental.customerPhone}
              </div>
            )}

            <div className="text-xs text-white/30 mt-3">
              Noleggiato il{" "}
              {formatDate(rental.rentedAt)}
            </div>
          </div>
        )}

        <div className="space-y-2">

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
    </div>
      </div>
    </Modal>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="text-xs text-white/30">
        {label}
      </div>

      <div className="text-sm mt-1">
        {value}
      </div>
    </div>
  );
}

function CreateAssetModal({
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    serialNumber: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Inserisci il nome dell'asset.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result =
        await createInventoryAsset({
          name: form.name.trim(),
          category:
            form.category.trim() || undefined,
          serialNumber:
            form.serialNumber.trim() ||
            undefined,
          description:
            form.description.trim() ||
            undefined,
        });

      setCreated(result);
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Errore creazione asset",
      );
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <Modal
        title="Asset creato"
        onClose={() =>
          onCreated(created)
        }
      >
        <div className="text-center space-y-5">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />

          <div>
            <div className="font-semibold text-lg">
              {created.name}
            </div>

            <div className="font-mono text-white/40 mt-1">
              {created.assetCode}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-5 rounded-2xl">
              <QRCode
                value={created.assetCode}
                size={220}
              />
            </div>
          </div>

          <p className="text-sm text-white/40">
            Questo QR identifica permanentemente
            l'attrezzatura.
          </p>

          <button
            onClick={() =>
              onCreated(created)
            }
            className="w-full py-3 rounded-xl bg-white text-black font-medium"
          >
            Fine
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Nuovo asset"
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 p-3 text-sm">
            {error}
          </div>
        )}

        <Field
          label="Nome asset"
          value={form.name}
          onChange={(value) =>
            update("name", value)
          }
          placeholder="es. Case Cavi 1"
          required
        />

        <Field
          label="Categoria"
          value={form.category}
          onChange={(value) =>
            update("category", value)
          }
          placeholder="es. Audio, Luci, Strutture"
        />

        <Field
          label="Numero seriale"
          value={form.serialNumber}
          onChange={(value) =>
            update(
              "serialNumber",
              value,
            )
          }
          placeholder="Opzionale"
        />

        <div>
          <label className="text-xs text-white/40">
            Descrizione
          </label>

          <textarea
            value={form.description}
            onChange={(e) =>
              update(
                "description",
                e.target.value,
              )
            }
            rows={3}
            placeholder="Note sull'attrezzatura..."
            className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none resize-none"
          />
        </div>

        <button
          disabled={saving}
          className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50"
        >
          {saving
            ? "Creazione..."
            : "Crea asset"}
        </button>
      </form>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="text-xs text-white/40">
        {label}
      </label>

      <input
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-white/30"
      />
    </div>
  );
}

function RentalModal({
  assetCodes,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "",
    expectedReturnAt: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.customerName.trim()) {
      setError(
        "Inserisci il nome del cliente.",
      );
      return;
    }

    if (!assetCodes.length) {
      setError(
        "Nessun asset selezionato.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createInventoryRental({
        assetCodes,
        customerName:
          form.customerName.trim(),
        customerCompany:
          form.customerCompany.trim() ||
          undefined,
        customerEmail:
          form.customerEmail.trim() ||
          undefined,
        customerPhone:
          form.customerPhone.trim() ||
          undefined,
        expectedReturnAt:
          form.expectedReturnAt
            ? new Date(
                form.expectedReturnAt,
              ).toISOString()
            : undefined,
        notes:
          form.notes.trim() ||
          undefined,
      });

      await onCreated();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Errore creazione noleggio",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Nuovo noleggio"
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 p-3 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="text-xs text-white/30 mb-2">
            ASSET SELEZIONATI
          </div>

          <div className="flex flex-wrap gap-2">
            {assetCodes.map((code) => (
              <span
                key={code}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 font-mono text-xs text-white/60"
              >
                {code}
              </span>
            ))}
          </div>
        </div>

        <Field
          label="Cliente"
          value={form.customerName}
          onChange={(value) =>
            update(
              "customerName",
              value,
            )
          }
          placeholder="Nome e cognome"
          required
        />

        <Field
          label="Azienda"
          value={form.customerCompany}
          onChange={(value) =>
            update(
              "customerCompany",
              value,
            )
          }
          placeholder="Opzionale"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            label="Email"
            value={form.customerEmail}
            onChange={(value) =>
              update(
                "customerEmail",
                value,
              )
            }
            placeholder="cliente@email.it"
          />

          <Field
            label="Telefono"
            value={form.customerPhone}
            onChange={(value) =>
              update(
                "customerPhone",
                value,
              )
            }
            placeholder="+39..."
          />
        </div>

        <div>
          <label className="text-xs text-white/40">
            Data prevista restituzione
          </label>

          <input
            type="datetime-local"
            value={
              form.expectedReturnAt
            }
            onChange={(e) =>
              update(
                "expectedReturnAt",
                e.target.value,
              )
            }
            className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-white/40">
            Note
          </label>

          <textarea
            value={form.notes}
            onChange={(e) =>
              update(
                "notes",
                e.target.value,
              )
            }
            rows={3}
            className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 outline-none resize-none"
          />
        </div>

        <button
          disabled={saving}
          className="w-full py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50"
        >
          {saving
            ? "Registrazione..."
            : "Conferma noleggio"}
        </button>
      </form>
    </Modal>
  );
}