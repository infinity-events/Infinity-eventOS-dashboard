import { useEffect,useState } from "react";
import { useFestival } from "../contexts/FestivalContext";
import { createFestival } from "../api/festivals";
import CreateFestivalModal from "../components/CreateFestivalModal";
import {getAnalytics} from "../api/analytics";

export default function Dashboard(){

const {festival,setFestival,festivals,addFestival}=useFestival();
const [showModal,setShowModal]=useState(false);
const [analytics,setAnalytics]=useState(null);

useEffect(()=>{if(festival)getAnalytics(festival.id).then(setAnalytics).catch(console.error)},[festival]);


async function handleCreate(data){

try{

const newFestival=await createFestival(data);
addFestival(newFestival);
setShowModal(false);

}catch(error){

console.error("Errore creazione festival:",error);

}

}


return <div>

<div className="mb-10">

<h1 className="text-4xl font-bold">
<select value={festival?.id||""} onChange={e=>setFestival(festivals.find(item=>item.id===e.target.value))} className="bg-transparent outline-none cursor-pointer max-w-full">
{festivals.map(item=><option key={item.id} value={item.id} className="bg-[#17181D]">{item.name}</option>)}
</select>
<button onClick={()=>setShowModal(true)} className="ml-3 align-middle text-sm px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition">+ Nuovo</button>
</h1>

<p className="text-gray-400 mt-2">
Panoramica evento
</p>
</div>

<div className="grid grid-cols-4 gap-6">
<Card
title="Biglietti venduti"
value={analytics?.tickets?.sold || 0}
/>

<Card
title="Bracciali attivati"
value={analytics?.wristbands?.activated || 0}
/>

<Card
title="Incassi"
value={`€${analytics?.tickets?.revenue || 0}`}
/>

<Card
title="Wallet speso"
value={`€${analytics?.wallet?.spent || 0}`}
/>
</div>

<div className="grid grid-cols-2 gap-6 mt-8">

<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
Ultime attività
</h2>

<div className="space-y-4 text-gray-300">
<p>
🎟 {analytics?.tickets?.sold || 0} biglietti venduti
</p>
<p>
📿 {analytics?.wristbands?.activated || 0} bracciali attivati
</p>
<p>
💳 €{analytics?.wallet?.spent || 0} spesi tramite wallet
</p>

</div>

</div>


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
Stato evento
</h2>

<div className="bg-green-500/20 text-green-400 inline-block px-4 py-2 rounded-full">

{festival?.status==="ACTIVE"
?
"🟢 Attivo"
:
festival?.status==="CLOSED"
?
"⚫ Chiuso"
:
"🟡 Bozza"
}

</div>

<div className="mt-6 text-gray-400">

<p>📍 {festival?.location || "-"}</p>

<p className="mt-2">
📅 {festival?.startDate || "-"}
</p>

</div>

</div>

</div>


{showModal&&
<CreateFestivalModal
close={()=>setShowModal(false)}
create={handleCreate}
/>
}

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
