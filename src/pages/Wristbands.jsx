import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {getWristbands,getWristbandStats} from "../api/wristbands";
import QRCode from "react-qr-code";

export default function Wristbands(){

const {festival}=useFestival();

const [wristbands,setWristbands]=useState([]);
const [stats,setStats]=useState({
total:0,
activated:0,
notActivated:0
});
const [showRegister,setShowRegister]=useState(false);

const [loading,setLoading]=useState(false);

const [showQR,setShowQR]=useState(false);


useEffect(()=>{

if(!festival)return;

loadWristbands();

},[festival]);


async function loadWristbands(){

try{

setLoading(true);

const data=await getWristbands(festival.id);
const stat=await getWristbandStats(festival.id);

setWristbands(data);
setStats(stat);

}catch(error){

console.error(
"Errore caricamento braccialetti:",
error
);

}finally{

setLoading(false);

}

}


if(!festival){

return(

<div className="text-white">

<h1 className="text-3xl font-bold">
Braccialetti
</h1>

<p className="text-gray-400 mt-4">
Nessun festival selezionato
</p>

</div>

)

}


return(

<div className="text-white">

<div className="mb-6">

<h1 className="text-3xl font-bold">
Braccialetti
</h1>

<p className="text-gray-400">
Festival:
<span className="text-white ml-2">
{festival.name}
</span>
</p>

</div>


<div className="grid grid-cols-3 gap-5 mb-8">


<div className="bg-[#17181D] rounded-xl p-5">

<p className="text-gray-400">
Totali
</p>

<h2 className="text-3xl font-bold">
{stats.total}
</h2>

</div>


<div className="bg-[#17181D] rounded-xl p-5">

<p className="text-gray-400">
Attivati
</p>

<h2 className="text-3xl font-bold text-green-400">
{stats.activated}
</h2>

</div>


<div className="bg-[#17181D] rounded-xl p-5">

<p className="text-gray-400">
Disponibili
</p>

<h2 className="text-3xl font-bold text-yellow-400">
{stats.notActivated}
</h2>

</div>


</div>


<div className="bg-[#17181D] rounded-xl p-5">


<div className="flex justify-between items-center mb-6">

<h2 className="text-xl font-bold">
Lista braccialetti
</h2>

<button
className="bg-purple-600 px-5 py-3 rounded-xl hover:bg-purple-700"
onClick={()=>setShowRegister(true)}
>
+ Registra braccialetto
</button>

</div>


{loading && (
<p className="text-gray-400">
Caricamento...
</p>
)}


<table className="w-full">

<thead>

<tr className="border-b border-gray-700 text-gray-400">

<th className="text-left py-3">
UID
</th>

<th>
Codice
</th>

<th>
Stato
</th>

<th>
Utente
</th>

</tr>

</thead>


<tbody>

{wristbands.map(w=>(

<tr
key={w.id}
className="border-b border-gray-800"
>

<td className="py-3">
{w.uid || "-"}
</td>

<td>
{w.code}
</td>

<td>

{w.activated ?

<span className="text-green-400">
Attivo
</span>

:

<span className="text-yellow-400">
Disponibile
</span>

}

</td>

<td>

{w.user?.email || "-"}

</td>

</tr>

))}


</tbody>

</table>


</div>

{showRegister && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center">

<div className="bg-[#17181D] rounded-2xl p-8 w-[400px]">

<h2 className="text-2xl font-bold mb-6">
Registra braccialetto
</h2>


<button
className="w-full bg-purple-600 p-4 rounded-xl mb-4"
onClick={()=>setShowQR(true)}
>
📱 Scansiona NFC
</button>

{showQR && (

<div className="mt-6 bg-white p-4 rounded-xl">

<QRCode
value={`${window.location.origin}/nfc/register?festival=${festival.id}`}
/>

<p className="text-black text-center mt-3 text-sm">
Scansiona con il telefono NFC
</p>

</div>

)}


<button
className="w-full bg-gray-700 p-4 rounded-xl"
onClick={()=>{
window.location.href =
`${window.location.origin}/nfc/register?festival=${festival.id}`
}}
>
⌨ Inserisci UID manualmente
</button>


<button
className="mt-5 text-gray-400"
onClick={()=>setShowRegister(false)}
>
Annulla
</button>


</div>

</div>

)}

</div>

)

}