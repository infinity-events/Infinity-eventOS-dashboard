import { useState } from "react";

export default function CreateFestivalModal({close,create}){

const [form,setForm]=useState({
name:"",
location:"",
startDate:"",
endDate:""
});


return <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

<div className="bg-[#17181D] p-8 rounded-3xl w-[450px]">

<h2 className="text-2xl font-bold mb-6">
Crea festival
</h2>


<input
className="input"
placeholder="Nome festival"
value={form.name}
onChange={e=>setForm({...form,name:e.target.value})}
/>


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
onClick={()=>create(form)}
>
Crea festival
</button>


<button
className="mt-3 text-gray-400 w-full"
onClick={close}
>
Annulla
</button>


</div>

</div>

}