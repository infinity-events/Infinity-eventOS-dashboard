import { useState } from "react";

export default function Participants(){

const [participants,setParticipants]=useState([]);

return <div>

<div className="mb-10">
<h1 className="text-4xl font-bold">Partecipanti</h1>
<p className="text-gray-400 mt-2">Gestione utenti e ingressi</p>
</div>


<div className="grid grid-cols-3 gap-6 mb-8">

<Card title="Totali" value={participants.length}/>

<Card title="Presenti ora" value="0"/>

<Card title="Ingressi oggi" value="0"/>

</div>


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-6">
Lista partecipanti
</h2>

{
participants.length===0 ?

<p className="text-gray-400">
Nessun partecipante registrato
</p>

:

<table className="w-full">
<thead>
<tr className="text-gray-400 text-left">
<th>Nome</th>
<th>Email</th>
<th>Stato</th>
</tr>
</thead>

<tbody>

{participants.map(p=>
<tr key={p.id} className="border-t border-white/5">
<td className="py-4">{p.name}</td>
<td>{p.email}</td>
<td>{p.status}</td>
</tr>
)}

</tbody>
</table>

}

</div>


</div>

}


function Card({title,value}){

return <div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<p className="text-gray-400">{title}</p>

<h2 className="text-3xl font-bold mt-3">
{value}
</h2>

</div>

}