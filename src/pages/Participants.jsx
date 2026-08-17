import {useEffect,useMemo,useRef,useState} from "react";
import {BadgeCheck,Clock,Keyboard,RefreshCw,ScanLine,Search,ShieldAlert,Wifi,X} from "lucide-react";
import {Html5Qrcode,Html5QrcodeSupportedFormats} from "html5-qrcode";
import {useFestival} from "../contexts/FestivalContext";
import {getTickets} from "../api/tickets";
import {checkManualEntrance,checkNfcEntrance,checkQrEntrance,getEntranceLogs} from "../api/entrance";

export default function Participants(){
const {festival}=useFestival();
const [tickets,setTickets]=useState([]),[logs,setLogs]=useState([]);
const [qrCode,setQrCode]=useState(""),[nfcUid,setNfcUid]=useState(""),[manualQuery,setManualQuery]=useState("");
const [search,setSearch]=useState(""),[statusFilter,setStatusFilter]=useState("ALL"),[typeFilter,setTypeFilter]=useState("ALL");
const [selectedTicket,setSelectedTicket]=useState(null),[result,setResult]=useState(null),[error,setError]=useState(""),[info,setInfo]=useState("");
const [loading,setLoading]=useState(false),[ticketsLoading,setTicketsLoading]=useState(false),[scannerOpen,setScannerOpen]=useState(false);
const scannerRef=useRef(null);
const canUseWebNfc=useMemo(()=>typeof window!=="undefined"&&"NDEFReader"in window,[]);

const logByTicket=useMemo(()=>logs.reduce((map,log)=>{(map[log.ticketId]??=[]).push(log);return map},{}),[logs]);
const enteredIds=useMemo(()=>new Set(logs.filter(l=>l.action==="ENTRY").map(l=>l.ticketId)),[logs]);
const stats=useMemo(()=>({total:tickets.length,inside:[...enteredIds].filter(id=>tickets.some(t=>t.id===id)).length,waiting:Math.max(tickets.length-enteredIds.size,0)}),[tickets,enteredIds]);
const types=useMemo(()=>[...new Set(tickets.map(t=>t.type).filter(Boolean))],[tickets]);
const filteredTickets=useMemo(()=>{
  const term=search.toLowerCase().trim();
  return tickets.filter(ticket=>{
    const user=ticket.user;
    const name=`${user?.firstName||""} ${user?.lastName||""}`.toLowerCase();
    const wristband=participantWristband(ticket);
    const haystack=[name,user?.email,ticket.code,wristband?.uid,wristband?.code].filter(Boolean).join(" ").toLowerCase();
    const entered=enteredIds.has(ticket.id);
    return (!term||haystack.includes(term))&&(statusFilter==="ALL"||(statusFilter==="ENTERED"&&entered)||(statusFilter==="WAITING"&&!entered))&&(typeFilter==="ALL"||ticket.type===typeFilter);
  });
},[tickets,search,statusFilter,typeFilter,enteredIds]);

useEffect(()=>{if(festival){loadTickets();loadLogs()}},[festival]);
useEffect(()=>()=>{if(scannerRef.current){scannerRef.current.clear().catch(()=>{});scannerRef.current=null}},[]);

async function loadTickets(){try{setTicketsLoading(true);setTickets(await getTickets(festival.id))}catch{setError("Errore caricamento partecipanti")}finally{setTicketsLoading(false)}}
async function loadLogs(){try{setLogs(await getEntranceLogs(festival.id))}catch{setInfo("Errore caricamento ingressi")}}

async function submitEntrance(type,value){
  const normalized=type==="qr"?extractQrCode(value):value.trim();
  if(!normalized)return;
  try{
    setLoading(true);setResult(null);setError("");
    const base={festivalId:festival.id};
    const response=type==="qr"?await checkQrEntrance({...base,code:normalized}):type==="nfc"?await checkNfcEntrance({...base,uid:normalized}):await checkManualEntrance({...base,query:normalized});
    setResult(response);await Promise.all([loadTickets(),loadLogs()]);
    if(type==="qr")setQrCode("");if(type==="nfc")setNfcUid("");if(type==="manual")setManualQuery("");
  }catch(e){setError(e?.response?.data?.message||e?.message||"Controllo ingresso fallito")}finally{setLoading(false)}
}

function startQrScanner(){
  if(scannerRef.current)return;
  setScannerOpen(true);
  setTimeout(()=>{
    const scanner=new Html5Qrcode("qr-reader");
    scannerRef.current=scanner;
    scanner.start(
      {facingMode:"environment"},
      {fps:10,qrbox:(viewfinderWidth,viewfinderHeight)=>{const size=Math.floor(Math.min(viewfinderWidth,viewfinderHeight)*0.8);return {width:size,height:size}},aspectRatio:1,formatsToSupport:[Html5QrcodeSupportedFormats.QR_CODE],disableFlip:false},
      async code=>{
        if(scannerRef.current!==scanner)return;
        scannerRef.current=null;
        try{await scanner.stop();await scanner.clear()}catch(error){void error}
        const normalized=extractQrCode(code);
        setQrCode(normalized);
        setInfo(`QR letto: ${normalized}`);
        setScannerOpen(false);
        submitEntrance("qr",normalized);
      },
      ()=>null
    ).catch(error=>{
      if(scannerRef.current===scanner)scannerRef.current=null;
      setScannerOpen(false);
      setError(error?.message||"Impossibile avviare la fotocamera");
    });
  },100);
}
function closeScanner(){const scanner=scannerRef.current;scannerRef.current=null;if(scanner)scanner.stop().catch(()=>{}).finally(()=>scanner.clear().catch(()=>{}));setScannerOpen(false)}
async function readNfc(){
  if(!canUseWebNfc){setInfo("NFC non supportato su questo dispositivo");return}
  try{const reader=new window.NDEFReader();await reader.scan();reader.onreading=e=>{const uid=e.serialNumber||"";setNfcUid(uid);submitEntrance("nfc",uid)}}catch{setError("Errore lettura NFC")}
}

if(!festival)return <div className="text-white"><h1 className="text-3xl font-bold">Partecipanti</h1><p className="text-gray-400 mt-3">Seleziona un festival</p></div>;
return <div className="text-white">
  <div className="mb-8"><h1 className="text-4xl font-bold">Partecipanti</h1><p className="text-gray-400 mt-2">Gestione ingressi per {festival.name}</p></div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"><StatCard title="Partecipanti" value={stats.total}/><StatCard title="Dentro ora" value={stats.inside}/><StatCard title="Da entrare" value={stats.waiting}/></div>
  <div className="grid grid-cols-1 2xl:grid-cols-[0.9fr_1.1fr] gap-6">
    <section className="space-y-5">
      <Card title="Ingresso QR" icon={<ScanLine className="text-purple-300"/>}><div className="flex flex-col gap-4"><button onClick={startQrScanner} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-5 py-3 flex items-center justify-center gap-2"><ScanLine size={20}/>Apri fotocamera</button><input value={qrCode} onChange={e=>setQrCode(e.target.value)} placeholder="Inserisci codice ticket" className="input"/><button disabled={loading||!qrCode} onClick={()=>submitEntrance("qr",qrCode)} className="btn purple">Controlla</button>{scannerOpen&&<div className="relative"><button onClick={closeScanner} className="absolute right-2 top-2 z-10 bg-black/70 p-2 rounded-lg"><X size={18}/></button><div id="qr-reader" className="rounded-xl overflow-hidden"/></div>}</div></Card>
      <Card title="Ingresso NFC" icon={<Wifi className="text-cyan-300"/>}><div className="flex flex-col gap-3"><div className="flex flex-col sm:flex-row gap-3"><input value={nfcUid} onChange={e=>setNfcUid(e.target.value)} placeholder="UID braccialetto" className="input"/><button onClick={readNfc} className="btn cyan">Leggi</button></div><button disabled={loading||!nfcUid} onClick={()=>submitEntrance("nfc",nfcUid)} className="btn">Controlla NFC</button></div></Card>
      <Card title="Ingresso manuale" icon={<Keyboard className="text-yellow-300"/>}><form onSubmit={e=>{e.preventDefault();submitEntrance("manual",manualQuery)}} className="flex flex-col sm:flex-row gap-3"><input value={manualQuery} onChange={e=>setManualQuery(e.target.value)} placeholder="Nome, email o codice" className="input"/><button className="btn yellow">Cerca</button></form></Card>
      {result&&<ResultPanel result={result}/>} {error&&<Alert text={error}/>} {info&&<Alert text={info}/>}
    </section>
    <section className="bg-[#17181D] border border-white/5 rounded-xl p-5">
      <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-bold">Lista partecipanti</h2><button onClick={()=>Promise.all([loadTickets(),loadLogs()])} className="p-2 rounded-lg hover:bg-white/10"><RefreshCw size={20}/></button></div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-5"><div className="relative"><Search size={18} className="absolute left-3 top-3 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca nome, email, ticket o braccialetto" className="input pl-10"/></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input"><option value="ALL">Tutti gli stati</option><option value="ENTERED">Entrati</option><option value="WAITING">Da entrare</option></select><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="input"><option value="ALL">Tutti i ticket</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select></div>
      {ticketsLoading?<p className="text-gray-400">Caricamento...</p>:<div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-gray-400 text-left border-b border-white/10"><th className="pb-3">Nome</th><th>Ticket</th><th>Braccialetto</th><th>Stato</th></tr></thead><tbody>{filteredTickets.map(ticket=>{const wristband=participantWristband(ticket);return <tr key={ticket.id} onClick={()=>setSelectedTicket(ticket)} className="border-b border-white/5 cursor-pointer hover:bg-white/5"><td className="py-4"><p className="font-medium">{ticketName(ticket)}</p><p className="text-sm text-gray-400">{ticket.user?.email||"Dati utente non disponibili"}</p></td><td><span className="font-medium">{ticket.code}</span><p className="text-gray-400 text-sm">{ticket.type} · {formatPrice(ticket.price)}</p></td><td>{wristband?.uid||wristband?.code||"-"}</td><td><StatusBadge status={enteredIds.has(ticket.id)}/></td></tr>})}</tbody></table>{filteredTickets.length===0&&<p className="text-gray-400 py-6 text-center">Nessun partecipante trovato</p>}</div>}
    </section>
  </div>
  <section className="mt-6 bg-[#17181D] border border-white/5 rounded-xl p-5"><div className="flex justify-between mb-5"><h2 className="text-xl font-bold flex gap-2 items-center"><Clock/>Storico ingressi</h2><button onClick={loadLogs} className="text-gray-300 hover:text-white">Aggiorna</button></div><div className="space-y-3">{logs.map(log=><div key={log.id} className="flex justify-between items-center bg-black/20 rounded-xl p-4"><div><p className="font-medium">{logName(log)}</p><p className="text-gray-400 text-sm">{log.ticket?.code} · {formatDate(log.createdAt)}</p></div><MethodBadge method={log.method}/></div>)}{!logs.length&&!ticketsLoading&&<p className="text-gray-400">Nessun ingresso registrato</p>}</div></section>
  {selectedTicket&&<ParticipantDrawer ticket={selectedTicket} logs={logByTicket[selectedTicket.id]||[]} entered={enteredIds.has(selectedTicket.id)} onClose={()=>setSelectedTicket(null)}/>}
</div>;
}

function ParticipantDrawer({ticket,logs,entered,onClose}){const user=ticket.user;const wristband=participantWristband(ticket);return <div className="fixed inset-0 z-40 bg-black/70 flex justify-end" onClick={onClose}><aside className="w-full max-w-xl h-full overflow-y-auto bg-[#17181D] border-l border-white/10 p-6" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-start mb-8"><div><p className="text-sm text-purple-300 uppercase tracking-wide">Scheda partecipante</p><h2 className="text-2xl font-bold mt-2">{ticketName(ticket)}</h2><p className="text-gray-400 mt-1">{user?.email||"Email non disponibile"}</p></div><button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X/></button></div><DetailSection title="Informazioni utente"><Detail label="Nome" value={ticketName(ticket)}/><Detail label="Email" value={user?.email}/><Detail label="Telefono" value={user?.phone}/><Detail label="Città" value={user?.city}/></DetailSection><DetailSection title="Ticket"><Detail label="Codice" value={ticket.code}/><Detail label="Tipo" value={ticket.type}/><Detail label="Prezzo" value={formatPrice(ticket.price)}/><Detail label="Stato" value={ticket.status}/><Detail label="Creato" value={formatDate(ticket.createdAt)}/></DetailSection><DetailSection title="Braccialetto"><Detail label="Stato" value={wristband?(wristband.activated?"Attivato":"Non attivato"):"Non associato"}/><Detail label="Codice" value={wristband?.code}/><Detail label="UID" value={wristband?.uid}/></DetailSection><DetailSection title="Ingresso"><Detail label="Stato" value={entered?"Entrato":"Da entrare"}/><Detail label="Ultimo ingresso" value={formatDate(logs[0]?.createdAt)}/>{logs.length?<div className="mt-4 space-y-2">{logs.map(log=><div key={log.id} className="rounded-lg bg-black/20 p-3 flex justify-between"><span>{log.method} · {log.action}</span><span className="text-gray-400">{formatDate(log.createdAt)}</span></div>)}</div>:<p className="text-gray-400 text-sm mt-3">Nessun ingresso registrato</p>}</DetailSection></aside></div>}
function DetailSection({title,children}){return <div className="border-t border-white/10 pt-5 mt-5"><h3 className="font-bold mb-3">{title}</h3><div className="space-y-2">{children}</div></div>}
function Detail({label,value}){return <div className="flex justify-between gap-4 text-sm"><span className="text-gray-400">{label}</span><span className="text-right">{value||"-"}</span></div>}
function Card({title,icon,children}){return <div className="bg-[#17181D] border border-white/5 rounded-xl p-5"><div className="flex gap-3 items-center mb-4">{icon}<h2 className="text-xl font-bold">{title}</h2></div>{children}</div>}
function StatCard({title,value}){return <div className="bg-[#17181D] border border-white/5 rounded-xl p-5"><p className="text-gray-400">{title}</p><h2 className="text-3xl font-bold mt-2">{value}</h2></div>}
function ResultPanel({result}){const ok=result.allowed;return <div className={`rounded-xl p-5 border ${ok?"bg-green-500/10 border-green-500/30":"bg-yellow-500/10 border-yellow-500/30"}`}><div className="flex items-center gap-3">{ok?<BadgeCheck className="text-green-400" size={35}/>:<ShieldAlert className="text-yellow-400" size={35}/>}<h2 className="text-2xl font-bold">{ok?"ACCESSO CONSENTITO":"ACCESSO BLOCCATO"}</h2></div><p className="mt-4 text-lg">{logName(result.log||result.ticket)}</p><p className="text-gray-400">{result.reason}</p></div>}
function MethodBadge({method}){const style={QR:"bg-purple-500/20 text-purple-300",NFC:"bg-cyan-500/20 text-cyan-300",MANUAL:"bg-yellow-500/20 text-yellow-300"};return <span className={`px-3 py-1 rounded-full text-sm ${style[method]||"bg-white/10 text-gray-300"}`}>{method}</span>}
function StatusBadge({status}){return <span className={`px-3 py-1 rounded-full text-sm ${status?"bg-green-500/20 text-green-300":"bg-yellow-500/20 text-yellow-300"}`}>{status?"Entrato":"Da entrare"}</span>}
function Alert({text}){return <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">{text}</div>}
function ticketName(t){return t.user?`${t.user.firstName||""} ${t.user.lastName||""}`.trim()||"Partecipante":"Partecipante"}
function participantWristband(ticket){return ticket.wristband||ticket.user?.wristbands?.find(wristband=>wristband.festivalId===ticket.festivalId)||null}
function logName(x){const u=x?.user||x?.ticket?.user;return u?`${u.firstName||""} ${u.lastName||""}`.trim():x?.ticket?.code||"Partecipante"}
function formatDate(value){return value?new Date(value).toLocaleString("it-IT"):"-"}
function formatPrice(value){return typeof value==="number"?new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(value):"-"}
function extractQrCode(value){
  const raw=String(value??"").trim();if(!raw)return "";
  try{const parsed=JSON.parse(raw);if(typeof parsed==="string")return parsed.trim();const candidate=parsed.code||parsed.ticketCode||parsed.ticket?.code||parsed.value;if(candidate)return String(candidate).trim()}catch(error){void error}
  try{const url=new URL(raw);for(const key of ["code","ticket","ticketCode","ticket_code"]){const candidate=url.searchParams.get(key);if(candidate)return candidate.trim()}const lastSegment=decodeURIComponent(url.pathname.split("/").filter(Boolean).pop()||"");if(lastSegment.startsWith("VF-"))return lastSegment}catch(error){void error}
  const ticketCode=raw.match(/VF-\d{4}-[A-Z0-9]{6}/i)?.[0];
  return ticketCode||raw;
}
