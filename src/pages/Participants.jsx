import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BadgeCheck,
  Clock,
  Keyboard,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Wifi
} from "lucide-react";

import { useFestival } from "../contexts/FestivalContext";

import {
  getTickets
} from "../api/tickets";

import {
  checkManualEntrance,
  checkNfcEntrance,
  checkQrEntrance,
  getEntranceLogs
} from "../api/entrance";



export default function Participants(){


const {festival}=useFestival();


const [tickets,setTickets]=useState([]);

const [logs,setLogs]=useState([]);


const [qrCode,setQrCode]=useState("");

const [manualQuery,setManualQuery]=useState("");

const [nfcUid,setNfcUid]=useState("");


const [search,setSearch]=useState("");


const [result,setResult]=useState(null);


const [error,setError]=useState("");

const [info,setInfo]=useState("");


const [loading,setLoading]=useState(false);


const [ticketsLoading,setTicketsLoading]=useState(false);

const [logsLoading,setLogsLoading]=useState(false);



const canUseWebNfc =
useMemo(
()=>typeof window!=="undefined" &&
"NDEFReader" in window,
[]
);





const stats =
useMemo(()=>{


const total=tickets.length;


const inside =
logs.filter(
log=>log.action==="ENTRY"
).length;



return{

total,

inside,

waiting:
Math.max(total-inside,0),

lastEntranceAt:
logs[0]?.createdAt || null

};


},[
tickets,
logs
]);







const filteredTickets =
useMemo(()=>{


const term =
search.trim().toLowerCase();



if(!term)
return tickets;



return tickets.filter(ticket=>{


const user=ticket.user;


const name =
`${user?.firstName || ""} ${user?.lastName || ""}`
.toLowerCase();



const email =
(user?.email || "")
.toLowerCase();



const code =
(ticket.code || "")
.toLowerCase();



const wristband =
(
ticket.wristband?.uid ||
ticket.wristband?.code ||
""
)
.toLowerCase();



return (

name.includes(term)

||

email.includes(term)

||

code.includes(term)

||

wristband.includes(term)

);


});


},[
tickets,
search
]);








useEffect(()=>{


if(!festival)
return;


loadTickets();

loadLogs();


setResult(null);

setError("");

setInfo("");


},[festival]);







async function loadTickets(){


try{


setTicketsLoading(true);


const data =
await getTickets(
festival.id
);


setTickets(data);


}

catch(err){


setError(
"Errore caricamento partecipanti"
);


}

finally{


setTicketsLoading(false);


}


}








async function loadLogs(){


if(!festival)
return;



try{


setLogsLoading(true);


const data =
await getEntranceLogs(
festival.id
);


setLogs(data);


}

catch(err){


setInfo(
"Storico ingressi non disponibile"
);


}

finally{


setLogsLoading(false);


}


}







async function submitEntrance(
type,
value
){


if(
!festival ||
!value.trim()
)
return;



try{


setLoading(true);


setError("");

setInfo("");

setResult(null);



const payload={

festivalId:festival.id

};



let response;



if(type==="qr"){


response =
await checkQrEntrance({

...payload,

code:value.trim()

});


setQrCode("");

}





if(type==="nfc"){


response =
await checkNfcEntrance({

...payload,

uid:value.trim()

});


setNfcUid("");

}





if(type==="manual"){


response =
await checkManualEntrance({

...payload,

query:value.trim()

});


setManualQuery("");

}




setResult(response);



await loadTickets();

await loadLogs();



}

catch(err){


setError(
"Controllo ingresso fallito"
);


}

finally{


setLoading(false);


}


}








async function readNfc(){


if(!canUseWebNfc){


setInfo(
"NFC non supportato dal browser"
);


return;


}



try{


const reader =
new window.NDEFReader();



await reader.scan();



reader.onreading =
event=>{


const uid =
event.serialNumber;



setNfcUid(uid);


submitEntrance(
"nfc",
uid
);


};



}

catch(err){


setError(
"Lettura NFC fallita"
);


}


}








if(!festival){


return(

<div className="text-white">

<h1 className="text-3xl font-bold">
Partecipanti
</h1>

<p className="text-gray-400 mt-3">
Seleziona un festival
</p>

</div>

);


}

return (
<div className="text-white">
<div className="mb-8">
<h1 className="text-4xl font-bold">Partecipanti</h1>
<p className="text-gray-400 mt-2">Controllo ingressi {festival.name}</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
<StatCard title="Totali" value={stats.total}/>
<StatCard title="Presenti" value={stats.inside}/>
<StatCard title="Da entrare" value={stats.waiting}/>
</div>

<div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">

<section className="space-y-5">

<Card title="Controllo QR" icon={<ScanLine/>}>
<form onSubmit={e=>{e.preventDefault();submitEntrance("qr",qrCode)}} className="flex gap-3">
<input value={qrCode} onChange={e=>setQrCode(e.target.value)} placeholder="Codice ticket" className="input"/>
<button disabled={loading} className="btn purple">Controlla</button>
</form>
</Card>

<Card title="Controllo NFC" icon={<Wifi/>}>
<div className="flex gap-3">
<input value={nfcUid} onChange={e=>setNfcUid(e.target.value)} placeholder="UID braccialetto" className="input"/>
<button onClick={readNfc} className="btn cyan">Leggi</button>
<button onClick={()=>submitEntrance("nfc",nfcUid)} disabled={loading} className="btn">OK</button>
</div>
</Card>

<Card title="Ricerca manuale" icon={<Keyboard/>}>
<form onSubmit={e=>{e.preventDefault();submitEntrance("manual",manualQuery)}} className="flex gap-3">
<input value={manualQuery} onChange={e=>setManualQuery(e.target.value)} placeholder="Nome/email/codice" className="input"/>
<button className="btn yellow">Cerca</button>
</form>
</Card>

{result&&<ResultPanel result={result}/>}
{error&&<Alert text={error}/>}
{info&&<Alert text={info}/>}
</section>

<section className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex justify-between mb-5">
<h2 className="text-xl font-bold">Lista partecipanti</h2>
<button onClick={loadTickets}><RefreshCw/></button>
</div>

<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..." className="input mb-5"/>

<table className="w-full">
<thead>
<tr className="text-gray-400">
<th>Nome</th>
<th>Ticket</th>
<th>Stato</th>
</tr>
</thead>
<tbody>
{filteredTickets.map(t=>(
<tr key={t.id} className="border-b border-white/5">
<td className="py-3">
{ticketName(t)}
<div className="text-gray-400 text-sm">{t.user?.email}</div>
</td>
<td>{t.code}</td>
<td>
<StatusBadge status={logs.some(l=>l.ticketId===t.id&&l.action==="ENTRY")}/>
</td>
</tr>
))}
</tbody>
</table>
</section>
</div>

<section className="bg-[#17181D] rounded-xl p-5 mt-6">
<div className="flex justify-between mb-4">
<h2 className="text-xl font-bold flex gap-2"><Clock/> Storico accessi</h2>
<button onClick={loadLogs}>Aggiorna</button>
</div>

{logs.map(log=>(
<div key={log.id} className="p-3 border-b border-white/5 flex justify-between">
<div>
<b>{logName(log)}</b>
<p className="text-gray-400">{log.ticket?.code}</p>
</div>
<span>{log.method}</span>
</div>
))}
</section>

</div>
);
}

function Card({title,icon,children}){
return <div className="bg-[#17181D] rounded-xl p-5 border border-white/5">
<div className="flex gap-3 mb-4 items-center">{icon}<h2 className="font-bold text-xl">{title}</h2></div>
{children}
</div>
}

function StatCard({title,value}){
return <div className="bg-[#17181D] rounded-xl p-5">
<p className="text-gray-400">{title}</p>
<h2 className="text-3xl font-bold">{value}</h2>
</div>
}

function ResultPanel({result}){
return <div className={`p-5 rounded-xl ${result.allowed?"bg-green-500/20":"bg-yellow-500/20"}`}>
<div className="flex gap-3 items-center">
{result.allowed?<BadgeCheck/>:<ShieldAlert/>}
<h2 className="text-2xl font-bold">
{result.allowed?"ACCESSO CONSENTITO":"ACCESSO BLOCCATO"}
</h2>
</div>
<p className="mt-3">{logName(result.log||result.ticket)}</p>
<p>{result.reason}</p>
</div>
}

function Alert({text}){
return <div className="bg-red-500/20 p-4 rounded-xl">{text}</div>
}

function StatusBadge({status}){
return <span className={`px-3 py-1 rounded-full ${status?"bg-green-500/20 text-green-300":"bg-yellow-500/20 text-yellow-300"}`}>
{status?"Entrato":"Da entrare"}
</span>
}

function ticketName(t){
return t.user?`${t.user.firstName} ${t.user.lastName}`:"Partecipante";
}

function logName(x){
const u=x?.user||x?.ticket?.user;
return u?`${u.firstName} ${u.lastName}`:"Partecipante";
}