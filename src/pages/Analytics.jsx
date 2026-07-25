import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {getAnalytics} from "../api/analytics";

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

useEffect(()=>{
if(festival) loadAnalytics();
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


if(loading)
return <div className="text-white text-xl p-10">Caricamento...</div>;


const ticketChart=data?.tickets?.categories
?
Object.entries(data.tickets.categories).map(([name,value])=>({
name,
value
}))
:
[];


const walletChart=[
{
name:"Ricariche",
value:data?.wallet?.topups||0
},
{
name:"Speso",
value:data?.wallet?.spent||0
}
];


return <div>

<div className="mb-10">

<h1 className="text-4xl font-bold">
Analytics
</h1>

<p className="text-gray-400 mt-2">
Statistiche evento in tempo reale
</p>

</div>


<div className="grid grid-cols-4 gap-6">

<Card title="Biglietti venduti" value={data?.tickets?.sold||0}/>

<Card title="Incasso ticket" value={`€${data?.tickets?.revenue||0}`}/>

<Card title="Bracciali attivati" value={data?.wristbands?.activated||0}/>

<Card title="Spesa wallet" value={`€${data?.wallet?.spent||0}`}/>

</div>


<div className="grid grid-cols-2 gap-6 mt-8">


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
Categorie biglietti
</h2>

<div className="h-72">

<ResponsiveContainer>

<PieChart>

<Pie data={ticketChart} dataKey="value" nameKey="name" outerRadius={100}>

{
ticketChart.map((item,index)=>(

<Cell
key={index}
fill={[
"#8b5cf6",
"#3b82f6",
"#22c55e",
"#f59e0b"
][index%4]}
/>

))
}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

</div>



<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
Wallet
</h2>

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


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5 mt-8">

<h2 className="text-xl font-bold mb-5">
Riepilogo
</h2>

<div className="text-gray-300 space-y-3">

<p>
🎟 Ticket venduti: {data?.tickets?.sold||0}
</p>

<p>
📿 Bracciali attivati: {data?.wristbands?.activated||0}
</p>

<p>
💳 Ricariche wallet: €{data?.wallet?.topups||0}
</p>

<p>
💰 Spesa wallet: €{data?.wallet?.spent||0}
</p>

</div>

</div>


</div>

}


function Card({title,value}){

return <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<p className="text-gray-400">
{title}
</p>

<h2 className="text-3xl font-bold mt-3">
{value}
</h2>

</div>

}