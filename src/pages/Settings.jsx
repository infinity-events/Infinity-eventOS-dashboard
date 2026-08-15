import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  ExternalLink,
  Info,
  LoaderCircle,
  MapPin,
  Ticket,
} from "lucide-react";
import { useFestival } from "../contexts/FestivalContext";
import { updateFestival } from "../api/festivals";

const statusOptions = [
  { value: "BOZZA", label: "Bozza", description: "L’evento è in preparazione e non è ancora operativo.", color: "text-amber-300", background: "bg-amber-400/10 border-amber-400/20" },
  { value: "ATTIVO", label: "Attivo", description: "L’evento è operativo e pronto per la gestione sul campo.", color: "text-emerald-300", background: "bg-emerald-400/10 border-emerald-400/20" },
  { value: "CHIUSO", label: "Chiuso", description: "L’evento è terminato. Le operazioni di ingresso vengono mantenute in sola consultazione.", color: "text-gray-300", background: "bg-white/5 border-white/10" },
];

function normalizeStatus(value) {
  if (value === "ACTIVE") return "ATTIVO";
  if (value === "CLOSED") return "CHIUSO";
  return value || "BOZZA";
}

function formatDate(value) {
  if (!value) return "Non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default function Settings() {
  const { festival, setFestival } = useFestival();
  const [savingStatus, setSavingStatus] = useState(false);
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState(0);
  const archiveProgressRef = useRef(0);
  const [archiving, setArchiving] = useState(false);

  if (!festival) {
    return <div className="rounded-3xl border border-white/10 bg-[#17181D] p-8 text-white"><h1 className="text-3xl font-bold">Nessun festival selezionato</h1><p className="mt-2 text-gray-400">Seleziona o crea un festival per accedere alle impostazioni.</p></div>;
  }

  const currentStatus = normalizeStatus(festival.status);
  const selectedStatus = statusOptions.find((item) => item.value === currentStatus) || statusOptions[0];

  async function changeStatus(status) {
    if (status === currentStatus || savingStatus) return;
    setSavingStatus(true);
    setNotice("");
    try {
      const updated = await updateFestival(festival.id, { status });
      setFestival(updated);
      setNotice(`Stato aggiornato: ${statusOptions.find((item) => item.value === status)?.label}.`);
    } catch (error) {
      setNotice(error.message || "Non è stato possibile aggiornare lo stato.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function copyFestivalId() {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(festival.id);
      setNotice("ID festival copiato negli appunti.");
    } catch {
      setNotice("Non è stato possibile copiare l’ID festival.");
    } finally {
      setCopying(false);
    }
  }

  function startArchive(event) {
    if (archiving || currentStatus === "CHIUSO") return;
    const startX = event.clientX;
    const move = (moveEvent) => {
      const distance = Math.max(0, Math.min(240, moveEvent.clientX - startX));
      const progress = distance / 240;
      archiveProgressRef.current = progress;
      setArchiveProgress(progress);
    };
    const end = async () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      if (archiveProgressRef.current < 0.85) {
        archiveProgressRef.current = 0;
        setArchiveProgress(0);
        return;
      }
      setArchiving(true);
      try {
        const updated = await updateFestival(festival.id, { status: "CHIUSO" });
        setFestival(updated);
        setArchiveOpen(false);
        setNotice("Festival archiviato correttamente.");
      } catch (error) {
        setNotice(error.message || "Non è stato possibile archiviare il festival.");
      } finally {
        archiveProgressRef.current = 0;
        setArchiveProgress(0);
        setArchiving(false);
      }
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end, { once: true });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-300">Workspace evento</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Impostazioni</h1>
        <p className="mt-2 text-gray-400">Ciclo di vita, identificativi e controlli operativi di {festival.name}</p>
      </div>

      {notice && <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-sm text-purple-100"><CheckCircle2 size={18} className="text-purple-300" />{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-xl font-bold">Stato operativo</h2><p className="mt-1 text-sm text-gray-400">Aggiorna il ciclo di vita del festival dal backend.</p></div>
            {savingStatus && <LoaderCircle size={19} className="animate-spin text-purple-300" />}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {statusOptions.map((option) => {
              const active = option.value === currentStatus;
              return <button key={option.value} type="button" disabled={savingStatus} onClick={() => changeStatus(option.value)} className={`rounded-xl border p-4 text-left transition ${active ? option.background : "border-white/5 bg-[#111217] hover:border-white/15"}`}><div className="flex items-center justify-between gap-2"><span className={`text-sm font-semibold ${active ? option.color : "text-gray-300"}`}>{option.label}</span>{active && <Check size={16} className={option.color} />}</div><p className="mt-3 text-xs leading-5 text-gray-500">{option.description}</p></button>;
            })}
          </div>
          <div className="mt-5 flex gap-3 rounded-xl border border-white/5 bg-[#111217] p-4 text-sm text-gray-400"><Info size={18} className="mt-0.5 shrink-0 text-purple-300" /><p>{selectedStatus.description}</p></div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
          <h2 className="text-xl font-bold">Identificativi workspace</h2>
          <p className="mt-1 text-sm text-gray-400">Dati utili per assistenza e integrazioni.</p>
          <div className="mt-6 space-y-4">
            <div><p className="text-xs uppercase tracking-wide text-gray-500">ID festival</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate rounded-lg bg-[#111217] px-3 py-2 text-xs text-gray-300">{festival.id}</code><button type="button" onClick={copyFestivalId} className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white" title="Copia ID">{copying ? <LoaderCircle size={16} className="animate-spin" /> : <Clipboard size={16} />}</button></div></div>
            <MetaRow icon={MapPin} label="Location" value={festival.location || "Non impostata"} />
            <MetaRow icon={Clock3} label="Periodo" value={`${formatDate(festival.startDate)} — ${formatDate(festival.endDate)}`} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/5 bg-[#17181D] p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Controlli operativi</h2><p className="mt-1 text-sm text-gray-400">Apri direttamente gli strumenti che usi durante la gestione.</p></div><ExternalLink size={19} className="hidden text-gray-500 sm:block" /></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SettingsLink to="/tickets" icon={Ticket} title="Biglietti" text="Categorie, prezzi e disponibilità" />
          <SettingsLink to="/wristbands" icon={Archive} title="Bracciali" text="Attivazioni e stato operativo" />
          <SettingsLink to="/analytics" icon={Clock3} title="Report e analytics" text="Dati e report periodici" />
        </div>
      </section>

      <section className="rounded-2xl border border-red-500/20 bg-[#17181D] p-6 sm:p-7">
        <div className="flex items-start gap-3"><Archive size={20} className="mt-0.5 text-red-400" /><div><h2 className="font-bold text-red-300">Zona pericolosa</h2><p className="mt-1 text-sm leading-6 text-gray-400">Archivia il festival solo quando le operazioni sono terminate. L’azione imposta lo stato su Chiuso e non elimina i dati.</p></div></div>
        {currentStatus === "CHIUSO" ? <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-gray-300"><CheckCircle2 size={18} className="text-gray-400" /> Questo festival è già chiuso.</div> : !archiveOpen ? <button type="button" onClick={() => setArchiveOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 p-3 text-red-300 transition hover:bg-red-500/25"><Archive size={18} /> Archivia festival</button> : <div className="mt-5"><p className="mb-3 text-sm text-gray-300">Scorri per confermare l’archiviazione.</p><div className="relative h-14 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 select-none touch-none"><div className="absolute inset-y-0 left-0 bg-red-500/30 transition-[width]" style={{ width: `${Math.max(16, archiveProgress * 100)}%` }} /><button type="button" disabled={archiving} onPointerDown={startArchive} className="absolute left-1 top-1 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg cursor-grab active:cursor-grabbing disabled:opacity-70">{archiving ? <LoaderCircle size={20} className="animate-spin" /> : archiveProgress >= 0.85 ? <Check size={20} /> : <ChevronRight size={22} />}</button><span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-200">Scorri →</span></div><button type="button" onClick={() => { setArchiveOpen(false); archiveProgressRef.current = 0; setArchiveProgress(0); }} className="mt-3 w-full text-sm text-gray-500 transition hover:text-white">Annulla</button></div>}
      </section>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) { return <div className="flex items-center gap-3"><Icon size={17} className="shrink-0 text-purple-300" /><div className="min-w-0"><p className="text-xs uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 truncate text-sm text-gray-200">{value}</p></div></div>; }
function SettingsLink({ to, icon: Icon, title, text }) { return <Link to={to} className="group rounded-xl border border-white/5 bg-[#111217] p-4 transition hover:border-purple-400/30 hover:bg-purple-500/5"><Icon size={19} className="text-purple-300" /><div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-gray-200">{title}</p><ArrowRight size={15} className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-purple-300" /></div><p className="mt-1 text-xs leading-5 text-gray-500">{text}</p></Link>; }
