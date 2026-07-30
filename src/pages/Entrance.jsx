import {useEffect,useMemo,useState} from "react";
import {BadgeCheck,Clock,Keyboard,ScanLine,ShieldAlert,Wifi} from "lucide-react";
import {useFestival} from "../contexts/FestivalContext";
import {
checkManualEntrance,
checkNfcEntrance,
checkQrEntrance,
getEntranceLogs,
getEntranceStats
} from "../api/entrance";

export default function Entrance(){

const {festival}=useFestival();
const [qrCode,setQrCode]=useState("");
const [manualQuery,setManualQuery]=useState("");
const [nfcUid,setNfcUid]=useState("");
const [result,setResult]=useState(null);
const [error,setError]=useState("");
const [loading,setLoading]=useState(false);
const [logs,setLogs]=useState([]);
const [stats,setStats]=useState({
totalTickets:0,
inside:0,
waiting:0,
lastEntranceAt:null
});

const canUseWebNfc=useMemo(
()=>typeof window!=="undefined" && "NDEFReader" in window,
[]
);

useEffect(()=>{
if(!festival)return;
loadEntranceData();
},[festival]);

async function loadEntranceData(){
try{
const [logData,statsData]=await Promise.all([
getEntranceLogs(festival.id),
getEntranceStats(festival.id)
]);

setLogs(logData);
setStats(statsData);
}catch(error){
console.error("Errore caricamento ingressi:",error);
}
}

async function submitEntrance(type,value){
if(!festival || !value.trim())return;

try{
setLoading(true);
setError("");
setResult(null);

const payload={
festivalId:festival.id
};

let response;

if(type==="qr"){
response=await checkQrEntrance({
...payload,
code:value.trim()
});
setQrCode("");
}

if(type==="nfc"){
response=await checkNfcEntrance({
...payload,
uid:value.trim()
});
setNfcUid("");
}

if(type==="manual"){
response=await checkManualEntrance({
...payload,
query:value.trim()
});
setManualQuery("");
}

setResult(response);
await loadEntranceData();
}catch(error){
setError(error.message || "Errore durante il controllo ingresso");
}finally{
setLoading(false);
}
}

async function readNfc(){
if(!canUseWebNfc){
setError("Lettura NFC non supportata da questo browser");
return;
}

try{
setError("");
const reader=new window.NDEFReader();
await reader.scan();

reader.onreading=event=>{
const uid=event.serialNumber;
setNfcUid(uid);
submitEntrance("nfc",uid);
};
}catch(error){
setError(error.message || "Impossibile leggere il braccialetto NFC");
}
}

if(!festival){
return(
<div className="text-white">
<h1 className="text-3xl font-bold">Ingresso</h1>
<p className="text-gray-400 mt-4">Seleziona un festival per iniziare i controlli.</p>
</div>
)
}

return(
<div className="text-white">

<div className="mb-8">
<h1 className="text-4xl font-bold">Ingresso</h1>
<p className="text-gray-400 mt-2">
Controllo accessi per <span className="text-white">{festival.name}</span>
</p>
</div>

<div className="grid grid-cols-3 gap-5 mb-8">
<StatCard title="Presenti" value={stats.inside}/>
<StatCard title="Da entrare" value={stats.waiting}/>
<StatCard
title="Ultimo ingresso"
value={stats.lastEntranceAt ? formatTime(stats.lastEntranceAt) : "-"}
/>
</div>

<div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">

<section className="space-y-5">

<div className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex items-center gap-3 mb-4">
<ScanLine className="text-purple-300" size={22}/>
<h2 className="text-xl font-bold">QR Code</h2>
</div>

<form
className="flex gap-3"
onSubmit={event=>{
event.preventDefault();
submitEntrance("qr",qrCode);
}}
>
<input
value={qrCode}
onChange={event=>setQrCode(event.target.value)}
className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-400"
placeholder="Codice biglietto"
/>
<button
disabled={loading}
className="bg-purple-600 px-5 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
>
Controlla
</button>
</form>
</div>

<div className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex items-center gap-3 mb-4">
<Wifi className="text-cyan-300" size={22}/>
<h2 className="text-xl font-bold">NFC</h2>
</div>

<div className="flex gap-3">
<input
value={nfcUid}
onChange={event=>setNfcUid(event.target.value)}
className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
placeholder="UID braccialetto"
/>
<button
type="button"
onClick={readNfc}
className="bg-cyan-600 px-5 py-3 rounded-xl hover:bg-cyan-700"
>
Leggi
</button>
<button
type="button"
disabled={loading}
onClick={()=>submitEntrance("nfc",nfcUid)}
className="bg-white/10 px-5 py-3 rounded-xl hover:bg-white/15 disabled:opacity-50"
>
Controlla
</button>
</div>
</div>

<div className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex items-center gap-3 mb-4">
<Keyboard className="text-yellow-300" size={22}/>
<h2 className="text-xl font-bold">Ricerca manuale</h2>
</div>

<form
className="flex gap-3"
onSubmit={event=>{
event.preventDefault();
submitEntrance("manual",manualQuery);
}}
>
<input
value={manualQuery}
onChange={event=>setManualQuery(event.target.value)}
className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-400"
placeholder="Nome, email, codice ticket o braccialetto"
/>
<button
disabled={loading}
className="bg-yellow-500 text-black px-5 py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50"
>
Registra
</button>
</form>
</div>

{result && (
<ResultPanel result={result}/>
)}

{error && (
<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-200">
{error}
</div>
)}

</section>

<section className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex items-center gap-3 mb-5">
<Clock className="text-gray-300" size={22}/>
<h2 className="text-xl font-bold">Storico accessi</h2>
</div>

{logs.length===0 ? (
<p className="text-gray-400">Nessun ingresso registrato</p>
) : (
<div className="space-y-3">
{logs.map(log=>(
<div
key={log.id}
className="grid grid-cols-[70px_1fr_auto] gap-3 items-center border-b border-white/5 pb-3"
>
<span className="text-gray-400">{formatTime(log.createdAt)}</span>
<div>
<p className="font-medium">{displayName(log)}</p>
<p className="text-sm text-gray-400">{log.ticket?.code || "-"}</p>
</div>
<span className="text-xs bg-white/10 rounded-full px-3 py-1">{log.method}</span>
</div>
))}
</div>
)}
</section>

</div>
</div>
)
}

function StatCard({title,value}){
return(
<div className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<p className="text-gray-400">{title}</p>
<h2 className="text-3xl font-bold mt-2">{value}</h2>
</div>
)
}

function ResultPanel({result}){
const allowed=result.allowed;
const Icon=allowed ? BadgeCheck : ShieldAlert;
const panelClass=allowed
? "bg-green-500/10 border border-green-500/30 rounded-xl p-6"
: "bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6";

return(
<div className={panelClass}>
<div className="flex items-center gap-3 mb-4">
<Icon className={allowed ? "text-green-300" : "text-yellow-300"} size={28}/>
<h2 className="text-2xl font-bold">
{allowed ? "ACCESSO CONSENTITO" : "BIGLIETTO GIA UTILIZZATO"}
</h2>
</div>
<p className="text-lg">{displayName(result.log || {ticket:result.ticket})}</p>
<p className="text-gray-300 mt-1">
{result.ticket?.type} · {result.ticket?.code}
</p>
{result.log?.createdAt && (
<p className="text-gray-400 mt-3">
Ingresso registrato alle {formatTime(result.log.createdAt)}
</p>
)}
</div>
)
}

function displayName(item){
const user=item.user || item.ticket?.user;

if(user){
return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

return item.ticket?.code || "Partecipante";
}

function formatTime(value){
return new Date(value).toLocaleTimeString("it-IT",{
hour:"2-digit",
minute:"2-digit"
});
}
