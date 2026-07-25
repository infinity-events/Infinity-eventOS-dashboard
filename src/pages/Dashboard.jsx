import { useEffect,useState } from "react";
import { useFestival } from "../contexts/FestivalContext";
import { getFestivals,createFestival } from "../api/festivals";
import CreateFestivalModal from "../components/CreateFestivalModal";
import {getAnalytics} from "../api/analytics";

export default function Dashboard(){

const {festival,setFestival}=useFestival();
const [showModal,setShowModal]=useState(false);
const [loading,setLoading]=useState(true);
const [analytics,setAnalytics]=useState(null);

useEffect(()=>{
loadFestival();
},[]);

async function loadFestival(){

try{

const data=await getFestivals();

if(data.length>0){
setFestival(data[0]);
const stats=await getAnalytics(data[0].id);
setAnalytics(stats);
}

}catch(error){

console.error("Errore caricamento festival:",error);

}finally{

setLoading(false);

}

}


async function handleCreate(data){

try{

const newFestival=await createFestival(data);

setFestival(newFestival);
setShowModal(false);

}catch(error){

console.error("Errore creazione festival:",error);

}

}


if(loading)
return <div className="text-white text-xl p-10">Caricamento...</div>;


return <div>

<div className="mb-10">

<h1 className="text-4xl font-bold">
{festival?.name || "Dashboard"}
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