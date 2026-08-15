import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useFestival } from "../contexts/FestivalContext";
import { updateFestival } from "../api/festivals";

const statusConfig = {
  ATTIVO: { label: "Attivo", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" },
  ACTIVE: { label: "Attivo", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" },
  CHIUSO: { label: "Chiuso", tone: "text-gray-300 bg-white/5 border-white/10" },
  CLOSED: { label: "Chiuso", tone: "text-gray-300 bg-white/5 border-white/10" },
  BOZZA: { label: "Bozza", tone: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
};

function formatDate(value, withTime = false) {
  if (!value) return "Da definire";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function getStatus(status) {
  return statusConfig[status] || statusConfig.BOZZA;
}

export default function Festivals() {
  const { festival, festivals, setFestival } = useFestival();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", location: "" });

  const status = getStatus(festival?.status);
  const eventDates = useMemo(() => {
    if (!festival) return "Da definire";
    const start = formatDate(festival.startDate || festival.date);
    const end = festival.endDate ? formatDate(festival.endDate) : "";
    return end && end !== start ? `${start} — ${end}` : start;
  }, [festival]);

  if (!festival) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#17181D] p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-300">Festival</p>
        <h1 className="mt-3 text-3xl font-bold">Nessun festival creato</h1>
        <p className="mt-2 text-gray-400">Crea il tuo primo evento per iniziare a configurarlo.</p>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const updated = await updateFestival(festival.id, form);
      setFestival(updated);
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Non è stato possibile salvare le modifiche.");
    } finally {
      setSaving(false);
    }
  }

  function openEditor() {
    setForm({ name: festival.name || "", location: festival.location || "" });
    setEditing(true);
  }

  const setupItems = [
    { label: "Dettagli evento", done: Boolean(festival.name && festival.location), icon: CalendarDays },
    { label: "Categorie biglietti", done: Boolean(festival.tickets?.length), icon: Ticket },
    { label: "Accessi e partecipanti", done: false, icon: Users },
  ];
  const completedSetup = setupItems.filter((item) => item.done).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-300">Workspace evento</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{festival.name}</h1>
          <p className="mt-2 text-gray-400">Anagrafica, configurazione e stato del tuo festival</p>
        </div>
        <div className="flex gap-3">
          <select
            value={festival.id}
            onChange={(event) => setFestival(festivals.find((item) => item.id === event.target.value))}
            className="min-w-0 max-w-[190px] rounded-xl border border-white/10 bg-[#17181D] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-400/60"
            aria-label="Seleziona festival"
          >
            {festivals.map((item) => <option key={item.id} value={item.id} className="bg-[#17181D]">{item.name}</option>)}
          </select>
          <button onClick={openEditor} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-purple-500">
            <Pencil size={16} /> Modifica
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/70 via-[#26203F] to-[#17181D] p-6 sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" /> {status.label}
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-5xl">Costruiamo il tuo prossimo evento.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-purple-100/70">Tieni qui sotto controllo le informazioni che definiscono il festival, prima di passare alla gestione operativa.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-purple-100/75">
            <InfoLine icon={MapPin} value={festival.location || "Location da definire"} />
            <InfoLine icon={CalendarDays} value={eventDates} />
            <InfoLine icon={Clock3} value={`${formatDate(festival.startDate, true).split(",")[1]?.trim() || "Orario da definire"}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-xl font-bold">Configurazione evento</h2><p className="mt-1 text-sm text-gray-400">Una vista rapida di ciò che è pronto.</p></div>
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-sm font-semibold text-gray-300">{completedSetup}/{setupItems.length}</span>
          </div>
          <div className="mt-6 space-y-3">
            {setupItems.map(({ label, done, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#111217] p-3.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${done ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-gray-400"}`}><Icon size={18} /></span>
                <span className="flex-1 text-sm font-medium text-gray-200">{label}</span>
                {done ? <CheckCircle2 size={18} className="text-emerald-300" /> : <span className="text-xs text-gray-500">Da configurare</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
          <h2 className="text-xl font-bold">Informazioni principali</h2>
          <div className="mt-6 divide-y divide-white/5">
            <DetailRow label="Nome evento" value={festival.name} />
            <DetailRow label="Location" value={festival.location || "Da definire"} />
            <DetailRow label="Periodo" value={eventDates} />
            <DetailRow label="Stato" value={status.label} valueClass={status.tone.split(" ")[0]} />
          </div>
          <button onClick={openEditor} className="mt-6 flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-purple-200">Aggiorna i dettagli <ArrowRight size={16} /></button>
        </section>
      </div>

      <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Prossimi passi</h2><p className="mt-1 text-sm text-gray-400">Vai direttamente alla sezione che vuoi completare.</p></div><Link to="/tickets" className="flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200">Gestisci operatività <ArrowRight size={16} /></Link></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <QuickLink to="/tickets" icon={Ticket} title="Biglietti" text="Configura categorie e prezzi" />
          <QuickLink to="/participants" icon={Users} title="Partecipanti" text="Controlla accessi e presenze" />
          <QuickLink to="/analytics" icon={Clock3} title="Analytics" text="Leggi i risultati dell'evento" />
        </div>
      </section>

      {editing && <EditModal form={form} setForm={setForm} save={save} saving={saving} error={error} close={() => setEditing(false)} />}
    </div>
  );
}

function InfoLine({ icon: Icon, value }) { return <div className="flex items-center gap-2"><Icon size={16} className="shrink-0 text-purple-300" /><span>{value}</span></div>; }
function DetailRow({ label, value, valueClass = "text-gray-200" }) { return <div className="flex items-center justify-between gap-4 py-3.5 text-sm"><span className="text-gray-500">{label}</span><span className={`text-right font-medium ${valueClass}`}>{value}</span></div>; }
function QuickLink({ to, icon: Icon, title, text }) { return <Link to={to} className="group rounded-xl border border-white/5 bg-[#111217] p-4 transition hover:border-purple-400/30 hover:bg-purple-500/5"><Icon size={19} className="text-purple-300" /><p className="mt-4 text-sm font-semibold text-gray-200">{title}</p><p className="mt-1 text-xs leading-5 text-gray-500">{text}</p><ArrowRight size={15} className="mt-3 text-gray-600 transition group-hover:translate-x-1 group-hover:text-purple-300" /></Link>; }

function EditModal({ form, setForm, save, saving, error, close }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-[450px] rounded-3xl border border-white/10 bg-[#17181D] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-300">Anagrafica</p><h2 className="mt-2 text-2xl font-bold">Modifica festival</h2></div><button onClick={close} className="rounded-lg p-2 text-gray-400 hover:bg-white/10" aria-label="Chiudi"><X size={20} /></button></div><input className="input" placeholder="Nome festival" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><input className="input" placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<button onClick={save} disabled={saving || !form.name.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 p-3.5 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Salvataggio..." : <><Plus size={17} /> Salva modifiche</>}</button></div></div>;
}
