import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {getAnalytics} from "../api/analytics";
import {
generateReport as createReport,
sendTestReport,
saveReportEmail,
getReportEmail
} from "../api/reports";

import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip
} from "recharts";

export default function Analytics(){

const {festival}=useFestival();
const [data,setData]=useState(null);
const [loading,setLoading]=useState(true);
const [reportLoading,setReportLoading]=useState(false);
const [emailLoading,setEmailLoading]=useState(false);
const [reportEmail,setReportEmail]=useState("");

useEffect(()=>{
if(festival){
loadAnalytics();
loadEmail();
}
},[festival]);

async function loadAnalytics(){
try{
const result=await getAnalytics(festival.id);
setData(result);
}catch(error){
console.error("Errore analytics:",error);
}finally{
setLoading(false);
}
}

async function loadEmail(){
try{
const result=await getReportEmail(festival.id);
setReportEmail(result.email||"");
}catch(error){
console.error("Errore email:",error);
}
}

async function saveEmail(){
try{
setEmailLoading(true);
await saveReportEmail(festival.id,reportEmail);
alert("Email salvata");
}catch(error){
console.error(error);
alert("Errore salvataggio email");
}finally{
setEmailLoading(false);
}
}

async function generate(){
try{
setReportLoading(true);
await createReport(festival.id);
alert("Report generato");
}catch(error){
console.error(error);
alert("Errore generazione report");
}finally{
setReportLoading(false);
}
}

async function sendTest(){
try{
setReportLoading(true);
await sendTestReport(festival.id);
alert("Email inviata");
}catch(error){
console.error(error);
alert("Errore invio email");
}finally{
setReportLoading(false);
}
}

if(loading)
return <div className="text-white text-xl p-10">Caricamento...</div>;


const ticketChart=data?.tickets?.categories?
Object.entries(data.tickets.categories).map(([name,value])=>({name,value}))
:[];

const walletChart=[
{name:"Ricariche",value:data?.wallet?.topups||0},
{name:"Speso",value:data?.wallet?.spent||0}
];

const activation=Math.round(
((data?.wristbands?.activated||0)/
(data?.tickets?.sold||1))*100
);


return <div>

<div className="mb-10">
<h1 className="text-4xl font-bold">Analytics</h1>
<p className="text-gray-400 mt-2">Statistiche evento in tempo reale</p>
</div>


<div className="grid grid-cols-4 gap-6">
<Card title="Biglietti venduti" value={data?.tickets?.sold||0}/>
<Card title="Incasso ticket" value={`€${data?.tickets?.revenue||0}`}/>
<Card title="Bracciali attivati" value={data?.wristbands?.activated||0}/>
<Card title="Spesa wallet" value={`€${data?.wallet?.spent||0}`}/>
</div>


<div className="grid grid-cols-2 gap-6 mt-8">

<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">
<h2 className="text-xl font-bold mb-5">Categorie biglietti</h2>

<div className="h-72">
<ResponsiveContainer>
<PieChart>
<Pie data={ticketChart} dataKey="value" nameKey="name" outerRadius={100}>
{ticketChart.map((item,index)=>
<Cell key={index} fill={["#8b5cf6","#3b82f6","#22c55e","#f59e0b"][index%4]}/>
)}
</Pie>
<Tooltip/>
</PieChart>
</ResponsiveContainer>
</div>
</div>


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">
<h2 className="text-xl font-bold mb-5">Wallet</h2>

<div className="h-72">
<ResponsiveContainer>
<BarChart data={walletChart}>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="value"/>
</BarChart>
</ResponsiveContainer>
</div>
</div>

</div>


<div className="grid grid-cols-2 gap-6 mt-8">


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
📄 Report automatici
</h2>

<div className="space-y-4">

<p className="text-gray-300">
Stato:
<span className="text-green-400 ml-2">Attivo</span>
</p>

<p className="text-gray-300">
Frequenza: Ogni lunedì
</p>


<div>
<p className="text-gray-400 mb-2">
Email destinatario
</p>

<input
value={reportEmail}
onChange={(e)=>setReportEmail(e.target.value)}
placeholder="azienda@email.it"
className="w-full bg-[#0f1014] border border-white/10 rounded-xl px-4 py-2"
/>

<button
onClick={saveEmail}
disabled={emailLoading}
className="mt-3 bg-blue-600 px-4 py-2 rounded-xl"
>
Salva email
</button>

</div>


<div className="flex gap-3">

<button
onClick={generate}
disabled={reportLoading}
className="bg-violet-600 px-4 py-2 rounded-xl"
>
Genera ora
</button>

<button
onClick={sendTest}
disabled={reportLoading}
className="bg-zinc-700 px-4 py-2 rounded-xl"
>
Invia test
</button>

</div>

</div>

</div>


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
📊 KPI Evento
</h2>

<div className="space-y-4 text-gray-300">

<p>
Attivazione bracciali:
<b className="ml-2 text-white">{activation}%</b>
</p>

<p>
Spesa media wallet:
<b className="ml-2 text-white">
€{((data?.wallet?.spent||0)/(data?.tickets?.sold||1)).toFixed(2)}
</b>
</p>

<p>
Incasso totale:
<b className="ml-2 text-white">
€{(data?.tickets?.revenue||0)+(data?.wallet?.topups||0)}
</b>
</p>

</div>

</div>

</div>

</div>

}


function Card({title,value}){

return <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">
<p className="text-gray-400">{title}</p>
<h2 className="text-3xl font-bold mt-3">{value}</h2>
</div>

}