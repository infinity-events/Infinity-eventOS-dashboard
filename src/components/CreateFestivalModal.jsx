import { useState } from "react";

export default function CreateFestivalModal({close=()=>{},create,required=false}){

const [form,setForm]=useState({
name:"",
location:"",
startDate:"",
endDate:"",
startTime:"10:00",
endTime:"23:00"
});

function submit(){
  create({
    name:form.name,
    location:form.location,
    startDate:`${form.startDate}T${form.startTime}:00`,
    endDate:`${form.endDate}T${form.endTime}:00`
  });
}


return <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">

<div className="bg-[#17181D] p-5 sm:p-8 rounded-3xl w-full max-w-[450px] max-h-[calc(100vh-2rem)] overflow-y-auto">

<p className="text-purple-300 text-sm font-semibold mb-2">INFINITY EVENTOS</p>
<h2 className="text-2xl font-bold mb-2">
{required?"Crea il tuo primo festival":"Crea un nuovo festival"}
</h2>
<p className="text-gray-400 text-sm mb-4">Imposta i dati principali dell’evento per iniziare a lavorare.</p>


<input
className="input"
placeholder="Nome festival"
value={form.name}
onChange={e=>setForm({...form,name:e.target.value})}
/>

<div className="grid grid-cols-2 gap-3">
<input className="input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/>
<input className="input" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/>
</div>


<input
className="input"
placeholder="Location"
value={form.location}
onChange={e=>setForm({...form,location:e.target.value})}
/>


<input
className="input"
type="date"
value={form.startDate}
onChange={e=>setForm({...form,startDate:e.target.value})}
/>


<input
className="input"
type="date"
value={form.endDate}
onChange={e=>setForm({...form,endDate:e.target.value})}
/>


<button
className="mt-5 bg-purple-600 p-3 rounded-xl w-full"
onClick={submit}
>
Crea festival
</button>


<button
className="mt-3 text-gray-400 w-full"
onClick={close}
disabled={required}
>
Annulla
</button>


</div>

</div>

}
