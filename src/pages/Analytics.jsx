import { useEffect, useState } from "react";

import { useFestival } from "../contexts/FestivalContext";
import { getAnalytics } from "../api/analytics";

import {
  generateReport as createReport,
  sendTestReport,
  saveReportEmail,
  getReportEmail,
} from "../api/reports";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const { festival } = useFestival();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reportLoading, setReportLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [reportEmail, setReportEmail] = useState("");

  useEffect(() => {
    if (festival) {
      loadAnalytics();
      loadEmail();
    }
  }, [festival]);

  // ============================================================
  // LOAD ANALYTICS
  // ============================================================

  async function loadAnalytics() {
    try {
      setLoading(true);

      const result = await getAnalytics(festival.id);

      setData(result);
    } catch (error) {
      console.error("Errore analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // REPORT EMAIL
  // ============================================================

  async function loadEmail() {
    try {
      const result = await getReportEmail(festival.id);

      setReportEmail(result.email || "");
    } catch (error) {
      console.error("Errore email:", error);
    }
  }

  async function saveEmail() {
    try {
      setEmailLoading(true);

      await saveReportEmail(
        festival.id,
        reportEmail,
      );

      alert("Email salvata");
    } catch (error) {
      console.error(error);

      alert("Errore salvataggio email");
    } finally {
      setEmailLoading(false);
    }
  }

  async function generate() {
    try {
      setReportLoading(true);

      await createReport(festival.id);

      alert("Report generato e inviato via email");
    } catch (error) {
      console.error(error);

      alert("Errore generazione report");
    } finally {
      setReportLoading(false);
    }
  }

  async function sendTest() {
    try {
      setReportLoading(true);

      await sendTestReport(festival.id);

      alert("Email inviata");
    } catch (error) {
      console.error(error);

      alert("Errore invio email");
    } finally {
      setReportLoading(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="text-white text-xl p-10">
        Caricamento...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-white p-10">
        Impossibile caricare le analytics.
      </div>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const ticketChart = Object.entries(
    data.tickets?.categories || {},
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const revenueChart = [
    {
      name: "Ticket",
      value: data.tickets?.revenue || 0,
    },
    {
      name: "POS",
      value: data.pos?.revenue || 0,
    },
  ];

  const participantsChart = [
    {
      name: "Dentro",
      value: data.participants?.inside || 0,
    },
    {
      name: "Fuori",
      value: data.participants?.outside || 0,
    },
  ];

  const walletChart = [
    {
      name: "Ricariche",
      value: data.wallet?.topups || 0,
    },
    {
      name: "Speso",
      value: data.wallet?.spent || 0,
    },
  ];

  const entranceTimeline =
    data.entrances?.timeline || [];

  const topProducts =
    data.pos?.topProducts || [];

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="pb-10">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Analytics
        </h1>

        <p className="text-gray-400 mt-2">
          Statistiche evento in tempo reale
        </p>
      </div>


      {/* ======================================================
          MAIN KPI
      ====================================================== */}

      <div className="grid grid-cols-4 gap-6">

        <Card
          title="Partecipanti"
          value={
            data.participants?.total || 0
          }
        />

        <Card
          title="Ingressi"
          value={
            data.entrances?.total || 0
          }
        />

        <Card
          title="Ancora fuori"
          value={
            data.participants?.outside || 0
          }
        />

        <Card
          title="Incasso totale"
          value={`€${(
            data.event?.totalRevenue || 0
          ).toFixed(2)}`}
        />

      </div>


      {/* ======================================================
          SECOND KPI
      ====================================================== */}

      <div className="grid grid-cols-4 gap-6 mt-6">

        <Card
          title="Ticket venduti"
          value={
            data.tickets?.sold || 0
          }
        />

        <Card
          title="Incasso ticket"
          value={`€${(
            data.tickets?.revenue || 0
          ).toFixed(2)}`}
        />

        <Card
          title="Incasso POS"
          value={`€${(
            data.pos?.revenue || 0
          ).toFixed(2)}`}
        />

        <Card
          title="Prodotti venduti"
          value={topProducts.reduce(
            (sum, product) =>
              sum + product.quantity,
            0,
          )}
        />

      </div>


      {/* ======================================================
          ENTRANCES
      ====================================================== */}

      <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5 mt-8">

        <div className="flex justify-between items-center mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Andamento ingressi
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Ingressi registrati nel tempo
            </p>
          </div>

          <div className="text-right">

            <p className="text-gray-400 text-sm">
              Picco
            </p>

            <p className="text-xl font-bold">
              {data.entrances?.peak?.value || 0}
              {data.entrances?.peak?.time
                ? ` alle ${data.entrances.peak.time}`
                : ""}
            </p>

          </div>

        </div>


        <div className="h-80">

          <ResponsiveContainer>
            <LineChart data={entranceTimeline}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>


      {/* ======================================================
          PARTICIPANTS + TICKETS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-6 mt-8">


        {/* PARTICIPANTS */}

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            Partecipanti
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={participantsChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {participantsChart.map(
                    (item, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#22c55e",
                            "#ef4444",
                          ][index % 2]
                        }
                      />
                    ),
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* TICKET CATEGORIES */}

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            Categorie ticket
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={ticketChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {ticketChart.map(
                    (item, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#8b5cf6",
                            "#3b82f6",
                            "#22c55e",
                            "#f59e0b",
                          ][index % 4]
                        }
                      />
                    ),
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* ======================================================
          REVENUE
      ====================================================== */}

      <div className="grid grid-cols-2 gap-6 mt-8">


        {/* REVENUE */}

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            Incassi
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <BarChart data={revenueChart}>

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* POS PRODUCTS */}

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            Prodotti più venduti
          </h2>

          {topProducts.length === 0 ? (

            <p className="text-gray-400">
              Nessuna vendita POS.
            </p>

          ) : (

            <div className="space-y-3">

              {topProducts.map(
                (product, index) => (

                  <div
                    key={product.productId}
                    className="flex items-center justify-between bg-[#0f1014] rounded-xl px-4 py-3"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-gray-500 w-5">
                        {index + 1}
                      </span>

                      <span className="font-medium">
                        {product.name}
                      </span>

                    </div>

                    <div className="text-right">

                      <p className="font-bold">
                        {product.quantity} pezzi
                      </p>

                      <p className="text-gray-400 text-sm">
                        €{product.revenue.toFixed(2)}
                      </p>

                    </div>

                  </div>

                ),
              )}

            </div>

          )}

        </div>

      </div>


      {/* ======================================================
          WALLET
      ====================================================== */}

      <div className="grid grid-cols-2 gap-6 mt-8">


        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            Wallet
          </h2>

          <div className="h-72">

            <ResponsiveContainer>

              <BarChart data={walletChart}>

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* KPI */}

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            KPI Evento
          </h2>

          <div className="space-y-5 text-gray-300">

            <KpiRow
              label="Attivazione bracciali"
              value={`${data.wristbands?.activationPercentage || 0}%`}
            />

            <KpiRow
              label="Spesa media wallet"
              value={`€${(
                data.wallet?.averageSpend || 0
              ).toFixed(2)}`}
            />

            <KpiRow
              label="Incasso ticket"
              value={`€${(
                data.tickets?.revenue || 0
              ).toFixed(2)}`}
            />

            <KpiRow
              label="Incasso POS"
              value={`€${(
                data.pos?.revenue || 0
              ).toFixed(2)}`}
            />

            <KpiRow
              label="Incasso totale"
              value={`€${(
                data.event?.totalRevenue || 0
              ).toFixed(2)}`}
            />

          </div>

        </div>

      </div>


      {/* ======================================================
          REPORT
      ====================================================== */}

      <div className="mt-8">

        <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

          <h2 className="text-xl font-bold mb-5">
            📄 Report automatici
          </h2>

          <div className="space-y-4">

            <p className="text-gray-300">

              Stato:

              <span className="text-green-400 ml-2">
                Attivo
              </span>

            </p>


            <p className="text-gray-300">
              Frequenza: Ogni lunedì
            </p>


            <div>

              <p className="text-gray-400 mb-2">
                Email destinatario
              </p>

              <input
                type="email"
                value={reportEmail}
                onChange={(e) =>
                  setReportEmail(e.target.value)
                }
                placeholder="azienda@email.it"
                className="w-full bg-[#0f1014] border border-white/10 rounded-xl px-4 py-2 text-white"
              />


              <button
                onClick={saveEmail}
                disabled={emailLoading}
                className="mt-3 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl disabled:opacity-50"
              >
                {emailLoading
                  ? "Salvataggio..."
                  : "Salva email"}
              </button>

            </div>


            <div className="flex gap-3">

              <button
                onClick={generate}
                disabled={reportLoading}
                className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Genera ora
              </button>


              <button
                onClick={sendTest}
                disabled={reportLoading}
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Invia test
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// CARD
// ============================================================

function Card({ title, value }) {
  return (
    <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

      <p className="text-gray-400">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-3">
        {value}
      </h2>

    </div>
  );
}


// ============================================================
// KPI ROW
// ============================================================

function KpiRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">

      <span>
        {label}
      </span>

      <b className="text-white text-lg">
        {value}
      </b>

    </div>
  );
}
