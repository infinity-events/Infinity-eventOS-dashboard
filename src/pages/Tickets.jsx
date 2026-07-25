import { useEffect,useState } from "react";
import { useFestival } from "../contexts/FestivalContext";
import { getTickets,createTicket } from "../api/tickets";
import {getTicketStats} from "../api/tickets";

export default function Tickets(){

const {festival}=useFestival();

const [tickets,setTickets]=useState([]);
const [loading,setLoading]=useState(true);
const [showModal,setShowModal]=useState(false);
const [stats,setStats]=useState(null);


useEffect(()=>{
if(festival)
loadTickets();
},[festival]);


async function loadTickets(){

try{

const data=await getTickets(festival.id);

setTickets(data);


const statistics=await getTicketStats(festival.id);

setStats(statistics);


}catch(error){

console.error(error);

}finally{

setLoading(false);

}

}

async function handleCreate(data){

try{

setLoading(true);

for(let i=0;i<Number(data.quantity);i++){

await createTicket({
festivalId:festival.id,
type:data.type,
price:Number(data.price)
});

}

await loadTickets();

setShowModal(false);

}catch(error){

console.error("Errore creazione ticket:",error);

}finally{

setLoading(false);

}

}


if(!festival){

return <div className="text-white p-10">
Nessun festival creato
</div>

}


if(loading){

return <div className="text-white p-10">
Caricamento...
</div>

}



return <div>


<div className="flex justify-between items-center mb-10">

<div>

<h1 className="text-4xl font-bold">
Biglietti
</h1>

<p className="text-gray-400 mt-2">
Gestione ticket di {festival.name}
</p>

</div>


<button
onClick={()=>setShowModal(true)}
className="bg-purple-600 px-6 py-3 rounded-xl"
>
+ Nuovo biglietto
</button>


</div>



<div className="grid grid-cols-3 gap-6 mb-8">

<Card
title="Ticket totali"
value={stats?.total || 0}
/>


<Card
title="Incasso potenziale"
value={"€"+(stats?.revenue || 0)}
/>


<Card
title="Categorie"
value={
Object.keys(stats?.categories || {}).length
}
/>


</div>

<div className="grid grid-cols-3 gap-6 mb-8">

{
Object.entries(stats?.categories || {}).map(
([type,data])=>(

<div
key={type}
className="bg-[#17181D] rounded-2xl p-6 border border-white/5"
>

<h3 className="text-xl font-bold">
{type}
</h3>

<p className="text-gray-400 mt-3">
{data.quantity} ticket
</p>

<p className="text-purple-400 mt-2">
€{data.revenue}
</p>

</div>

)

)

}

</div>

<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-6">
Lista biglietti
</h2>


<table className="w-full">

<thead>

<tr className="text-gray-400 text-left">

<th>Codice</th>
<th>Tipo</th>
<th>Prezzo</th>
<th>Stato</th>

</tr>

</thead>


<tbody>

{
tickets.length===0?

<tr>

<td
colSpan="4"
className="text-center py-10 text-gray-400"
>
Nessun biglietto creato
</td>

</tr>

:

tickets.map(t=>(

<tr
key={t.id}
className="border-t border-white/5"
>

<td className="py-4">
{t.code}
</td>

<td>
{t.type}
</td>

<td>
€{t.price}
</td>

<td>
{t.status}
</td>

</tr>

))

}

</tbody>

</table>

</div>



{
showModal&&

<CreateTicketModal
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



function CreateTicketModal({close,create}){

const [data,setData]=useState({

type:"STANDARD",
price:10,
quantity:100

});


return <div className="fixed inset-0 bg-black/70 flex items-center justify-center">


<div className="bg-[#17181D] p-8 rounded-3xl w-[400px]">


<h2 className="text-2xl font-bold mb-6">
Nuovo biglietto
</h2>



<label className="text-gray-400">
Tipo biglietto
</label>

<select
className="input mt-2 w-full"
value={data.type}
onChange={e=>setData({
...data,
type:e.target.value
})}
>

<option value="STANDARD">
Standard
</option>

<option value="VIP">
VIP
</option>

<option value="BACKSTAGE">
Backstage
</option>


</select>



<label className="text-gray-400 mt-4 block">
Prezzo
</label>

<input

className="input mt-2 w-full"

type="number"

value={data.price}

onChange={e=>setData({
...data,
price:Number(e.target.value)
})}

/>

<label className="text-gray-400 mt-4 block">
Quantità
</label>

<input
className="input mt-4 w-full"
type="number"
placeholder="Quantità"
value={data.quantity}
onChange={e=>setData({
...data,
quantity:Number(e.target.value)
})}
/>



<button
disabled={loading}
onClick={()=>create(data)}
>
{
loading && (
<p className="text-sm text-gray-400 mt-2">
Generazione biglietti in corso...
</p>
)
}
</button>



<button

className="text-gray-400 mt-3 w-full"

onClick={close}

>
Annulla
</button>


</div>


</div>

}