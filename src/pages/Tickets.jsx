import {useEffect,useState} from "react";
import {Plus,Trash2,RefreshCw,Ticket} from "lucide-react";
import {useFestival} from "../contexts/FestivalContext";
import {
getTicketCategories,
createTicketCategory,
deleteTicketCategory
} from "../api/ticketCategory";


export default function Tickets(){

const {festival}=useFestival();

const [categories,setCategories]=useState([]);

const [form,setForm]=useState({
name:"",
type:"STANDARD",
price:"",
quantity:""
});

const [loading,setLoading]=useState(false);
const [error,setError]=useState("");
const [success,setSuccess]=useState("");


useEffect(()=>{

if(festival){
loadCategories();
}

},[festival]);


async function loadCategories(){

try{

const data=await getTicketCategories(festival.id);

setCategories(data);

}catch(e){

setError("Errore caricamento categorie");

}

}


async function create(){

if(!festival)return;

try{

setLoading(true);
setError("");
setSuccess("");


await createTicketCategory({

festivalId:festival.id,

name:form.name,

type:form.type,

price:Number(form.price),

quantity:Number(form.quantity)

});


setForm({
name:"",
type:"STANDARD",
price:"",
quantity:""
});


setSuccess("Categoria creata");

loadCategories();


}catch(e){

setError("Errore creazione categoria");

}
finally{

setLoading(false);

}

}



async function remove(id){

await deleteTicketCategory(id);

loadCategories();

}



if(!festival){

return(

<div className="text-white">

<h1 className="text-3xl font-bold">
Ticket
</h1>

<p className="text-gray-400 mt-3">
Seleziona un festival
</p>

</div>

)

}



return(

<div className="text-white">

<div className="mb-8">

<h1 className="text-4xl font-bold">
Ticket
</h1>

<p className="text-gray-400 mt-2">
Gestisci le categorie disponibili per {festival.name}
</p>

</div>



<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">



<div className="bg-[#17181D] rounded-xl p-6 border border-white/5">


<div className="flex items-center gap-3 mb-5">

<Plus className="text-purple-400"/>

<h2 className="text-xl font-bold">
Nuova categoria
</h2>

</div>



<div className="space-y-4">


<input
className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
placeholder="Nome categoria"
value={form.name}
onChange={
e=>setForm({...form,name:e.target.value})
}
/>


<select
className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
value={form.type}
onChange={
e=>setForm({...form,type:e.target.value})
}
>

<option value="STANDARD">
STANDARD
</option>

<option value="VIP">
VIP
</option>

<option value="BACKSTAGE">
BACKSTAGE
</option>

</select>



<input
type="number"
className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
placeholder="Prezzo"
value={form.price}
onChange={
e=>setForm({...form,price:e.target.value})
}
/>



<input
type="number"
className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3"
placeholder="Quantità disponibile"
value={form.quantity}
onChange={
e=>setForm({...form,quantity:e.target.value})
}
/>



<button

disabled={loading}

onClick={create}

className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-3 font-semibold"

>

Crea categoria

</button>


</div>


{error &&
<p className="text-red-300 mt-4">
{error}
</p>
}

{success &&
<p className="text-green-300 mt-4">
{success}
</p>
}


</div>




<div className="bg-[#17181D] rounded-xl p-6 border border-white/5">


<div className="flex justify-between items-center mb-5">


<div className="flex items-center gap-3">

<Ticket className="text-cyan-300"/>

<h2 className="text-xl font-bold">
Categorie attive
</h2>

</div>


<button
onClick={loadCategories}
className="bg-white/10 p-3 rounded-xl"
>

<RefreshCw size={18}/>

</button>


</div>



<div className="space-y-4">


{
categories.length===0 ?

<p className="text-gray-400">
Nessuna categoria creata
</p>

:

categories.map(category=>(


<div
key={category.id}
className="bg-black/20 rounded-xl p-5 border border-white/5"
>


<div className="flex justify-between">


<div>

<h3 className="font-bold text-lg">

{category.name}

</h3>


<p className="text-gray-400">

{category.type} · {category.price}€

</p>


</div>



<button

onClick={()=>remove(category.id)}

className="text-red-400 hover:text-red-300"

>

<Trash2 size={20}/>

</button>


</div>



<div className="mt-4 text-sm text-gray-400">

Venduti:
<span className="text-white ml-2">

{category.sold}

</span>

/

{category.quantity}

</div>


</div>


))

}


</div>


</div>



</div>


</div>

)

}