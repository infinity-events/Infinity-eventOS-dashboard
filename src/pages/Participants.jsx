import {useEffect,useMemo,useState} from "react";
import {BadgeCheck,Clock,Keyboard,RefreshCw,ScanLine,ShieldAlert,Wifi} from "lucide-react";
import {Html5QrcodeScanner} from "html5-qrcode";
import {useFestival} from "../contexts/FestivalContext";
import {getTickets} from "../api/tickets";
import {checkManualEntrance,checkNfcEntrance,checkQrEntrance,getEntranceLogs} from "../api/entrance";

export default function Participants(){

const {festival}=useFestival();

const [tickets,setTickets]=useState([]);
const [logs,setLogs]=useState([]);

const [qrCode,setQrCode]=useState("");
const [nfcUid,setNfcUid]=useState("");
const [manualQuery,setManualQuery]=useState("");
const [search,setSearch]=useState("");

const [result,setResult]=useState(null);
const [error,setError]=useState("");
const [info,setInfo]=useState("");

const [loading,setLoading]=useState(false);
const [ticketsLoading,setTicketsLoading]=useState(false);
const [logsLoading,setLogsLoading]=useState(false);
const [scannerOpen,setScannerOpen]=useState(false);

const canUseWebNfc=useMemo(
()=>typeof window!=="undefined"&&"NDEFReader"in window,
[]
);

const stats=useMemo(()=>{

const inside=logs.filter(l=>l.action==="ENTRY").length;

return{
total:tickets.length,
inside,
waiting:Math.max(tickets.length-inside,0),
lastEntranceAt:logs[0]?.createdAt
};

},[tickets,logs]);


const filteredTickets=useMemo(()=>{

const term=search.toLowerCase().trim();

if(!term)return tickets;

return tickets.filter(t=>{

const user=t.user;

return(
`${user?.firstName||""} ${user?.lastName||""}`
.toLowerCase()
.includes(term)
||
(user?.email||"")
.toLowerCase()
.includes(term)
||
(t.code||"")
.toLowerCase()
.includes(term)
||
(t.wristband?.uid||"")
.toLowerCase()
.includes(term)
);

});

},[tickets,search]);


useEffect(()=>{

if(!festival)return;

loadTickets();
loadLogs();

},[festival]);


async function loadTickets(){

try{

setTicketsLoading(true);

const data=await getTickets(festival.id);

setTickets(data);

}catch(e){

setError("Errore caricamento partecipanti");

}finally{

setTicketsLoading(false);

}

}


async function loadLogs(){

try{

setLogsLoading(true);

const data=await getEntranceLogs(festival.id);

setLogs(data);

}catch(e){

setInfo("Errore caricamento ingressi");

}finally{

setLogsLoading(false);

}

}


async function submitEntrance(type,value){

if(!value.trim())return;

try{

setLoading(true);
setResult(null);
setError("");

let response;

const base={
festivalId:festival.id
};

if(type==="qr")
response=await checkQrEntrance({...base,code:value});

if(type==="nfc")
response=await checkNfcEntrance({...base,uid:value});

if(type==="manual")
response=await checkManualEntrance({...base,query:value});


setResult(response);

await loadTickets();
await loadLogs();

if(type==="qr")setQrCode("");
if(type==="nfc")setNfcUid("");
if(type==="manual")setManualQuery("");


}catch(e){

setError(
e?.response?.data?.message||
"Controllo ingresso fallito"
);

}finally{

setLoading(false);

}

}


function startQrScanner(){

setScannerOpen(true);

setTimeout(()=>{

const scanner=new Html5QrcodeScanner(
"qr-reader",
{
fps:10,
qrbox:250
}
);


scanner.render(
(code)=>{

setQrCode(code);

scanner.clear();

setScannerOpen(false);

submitEntrance("qr",code);

},
()=>{}
);


},100);

}


async function readNfc(){

if(!canUseWebNfc){

setInfo("NFC non supportato");

return;

}

try{

const reader=new window.NDEFReader();

await reader.scan();

reader.onreading=e=>{

const uid=e.serialNumber;

setNfcUid(uid);

submitEntrance("nfc",uid);

};

}catch(e){

setError("Errore lettura NFC");

}

}


if(!festival)
return(
<div className="text-white">
<h1 className="text-3xl font-bold">Partecipanti</h1>
<p className="text-gray-400 mt-3">Seleziona un festival</p>
</div>
);

return(
<div className="text-white">

<div className="mb-8">
<h1 className="text-4xl font-bold">Partecipanti</h1>
<p className="text-gray-400 mt-2">
Gestione ingressi per {festival.name}
</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
<StatCard title="Partecipanti" value={stats.total}/>
<StatCard title="Dentro ora" value={stats.inside}/>
<StatCard title="Da entrare" value={stats.waiting}/>
</div>


<div className="grid grid-cols-1 2xl:grid-cols-[0.9fr_1.1fr] gap-6">


<section className="space-y-5">


<Card title="Ingresso QR" icon={<ScanLine className="text-purple-300"/>}>

<div className="flex flex-col gap-4">

<button
onClick={startQrScanner}
className="bg-purple-600 hover:bg-purple-700 rounded-xl px-5 py-3 flex items-center justify-center gap-2"
>
<ScanLine size={20}/>
Apri fotocamera
</button>


<input
value={qrCode}
onChange={e=>setQrCode(e.target.value)}
placeholder="Inserisci codice ticket"
className="input"
/>


<button
disabled={loading||!qrCode}
onClick={()=>submitEntrance("qr",qrCode)}
className="btn purple"
>
Controlla
</button>


{
scannerOpen&&
<div
id="qr-reader"
className="rounded-xl overflow-hidden"
/>
}

</div>

</Card>



<Card title="Ingresso NFC" icon={<Wifi className="text-cyan-300"/>}>

<div className="flex flex-col gap-3">

<div className="flex gap-3">

<input
value={nfcUid}
onChange={e=>setNfcUid(e.target.value)}
placeholder="UID braccialetto"
className="input"
/>


<button
onClick={readNfc}
className="btn cyan"
>
Leggi
</button>

</div>


<button
disabled={loading||!nfcUid}
onClick={()=>submitEntrance("nfc",nfcUid)}
className="btn"
>
Controlla NFC
</button>

</div>

</Card>




<Card title="Ingresso manuale" icon={<Keyboard className="text-yellow-300"/>}>

<form
onSubmit={e=>{
e.preventDefault();
submitEntrance("manual",manualQuery);
}}
className="flex gap-3"
>

<input
value={manualQuery}
onChange={e=>setManualQuery(e.target.value)}
placeholder="Nome, email o codice"
className="input"
/>


<button className="btn yellow">
Cerca
</button>


</form>

</Card>



{
result&&
<ResultPanel result={result}/>
}


{
error&&
<Alert text={error}/>
}


{
info&&
<Alert text={info}/>
}


</section>




<section className="bg-[#17181D] border border-white/5 rounded-xl p-5">

<div className="flex justify-between items-center mb-5">

<h2 className="text-xl font-bold">
Lista partecipanti
</h2>


<button
onClick={loadTickets}
>
<RefreshCw size={20}/>
</button>


</div>


<input
value={search}
onChange={e=>setSearch(e.target.value)}
placeholder="Cerca partecipante..."
className="input mb-5"
/>



{
ticketsLoading?

<p className="text-gray-400">
Caricamento...
</p>

:

<table className="w-full">

<thead>

<tr className="text-gray-400 text-left border-b border-white/10">

<th className="pb-3">
Nome
</th>

<th>
Ticket
</th>

<th>
Braccialetto
</th>

<th>
Stato
</th>

</tr>

</thead>


<tbody>

{
filteredTickets.map(ticket=>{


const entered=
logs.some(
l=>
l.ticketId===ticket.id &&
l.action==="ENTRY"
);


return(

<tr
key={ticket.id}
className="border-b border-white/5"
>

<td className="py-4">

<p className="font-medium">
{ticketName(ticket)}
</p>

<p className="text-sm text-gray-400">
{ticket.user?.email}
</p>

</td>


<td>
{ticket.code}

<p className="text-gray-400 text-sm">
{ticket.type}
</p>

</td>


<td>

{ticket.wristband?.uid||
ticket.wristband?.code||
"-"}

</td>


<td>

<StatusBadge status={entered}/>

</td>


</tr>

)

})

}


</tbody>

</table>

}


</section>

</div>





<section className="mt-6 bg-[#17181D] border border-white/5 rounded-xl p-5">


<div className="flex justify-between mb-5">

<h2 className="text-xl font-bold flex gap-2 items-center">
<Clock/>
Storico ingressi
</h2>


<button
onClick={loadLogs}
>
Aggiorna
</button>


</div>



<div className="space-y-3">

{
logs.map(log=>(

<div
key={log.id}
className="flex justify-between items-center bg-black/20 rounded-xl p-4"
>


<div>

<p className="font-medium">
{logName(log)}
</p>

<p className="text-gray-400 text-sm">
{log.ticket?.code}
</p>

</div>


<MethodBadge method={log.method}/>


</div>

))
}

</div>


</section>


</div>
)

}



function Card({title,icon,children}){

return(

<div className="bg-[#17181D] border border-white/5 rounded-xl p-5">

<div className="flex gap-3 items-center mb-4">

{icon}

<h2 className="text-xl font-bold">
{title}
</h2>

</div>

{children}

</div>

)

}



function StatCard({title,value}){

return(

<div className="bg-[#17181D] border border-white/5 rounded-xl p-5">

<p className="text-gray-400">
{title}
</p>

<h2 className="text-3xl font-bold mt-2">
{value}
</h2>

</div>

)

}



function ResultPanel({result}){

const ok=result.allowed;

return(

<div className={`rounded-xl p-5 border ${ok?"bg-green-500/10 border-green-500/30":"bg-yellow-500/10 border-yellow-500/30"}`}>

<div className="flex items-center gap-3">

{
ok?
<BadgeCheck className="text-green-400" size={35}/>
:
<ShieldAlert className="text-yellow-400" size={35}/>
}

<h2 className="text-2xl font-bold">

{
ok?
"ACCESSO CONSENTITO"
:
"ACCESSO BLOCCATO"
}

</h2>

</div>


<p className="mt-4 text-lg">
{logName(result.log||result.ticket)}
</p>


<p className="text-gray-400">
{result.reason}
</p>


</div>

)

}



function MethodBadge({method}){

const style={

QR:"bg-purple-500/20 text-purple-300",

NFC:"bg-cyan-500/20 text-cyan-300",

MANUAL:"bg-yellow-500/20 text-yellow-300"

};


return(

<span className={`px-3 py-1 rounded-full text-sm ${style[method]}`}>

{method}

</span>

)

}



function StatusBadge({status}){

return(

<span className={`px-3 py-1 rounded-full text-sm ${status?"bg-green-500/20 text-green-300":"bg-yellow-500/20 text-yellow-300"}`}>

{status?"Entrato":"Da entrare"}

</span>

)

}



function Alert({text}){

return(

<div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
{text}
</div>

)

}



function ticketName(t){

return t.user?
`${t.user.firstName} ${t.user.lastName}`:
"Partecipante";

}



function logName(x){

const u=x?.user||x?.ticket?.user;

return u?
`${u.firstName} ${u.lastName}`:
x?.ticket?.code||"Partecipante";

}