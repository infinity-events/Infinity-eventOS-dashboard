import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {getAnalytics} from "../api/analytics";


export default function Analytics(){

const {festival}=useFestival();

const [data,setData]=useState(null);
const [loading,setLoading]=useState(true);


useEffect(()=>{

if(festival){

loadAnalytics();

}

},[festival]);

async function loadAnalytics(){

try{

const result=await getAnalytics(
festival.id
);

setData(result);


}catch(error){

console.error(
"Errore analytics:",
error
);


}finally{

setLoading(false);

}

}



if(loading){

return (
<div className="text-white text-xl p-10">
Caricamento...
</div>
)

}



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

<Card
title="Biglietti venduti"
value={data?.tickets?.sold || 0}
/>


<Card
title="Incasso ticket"
value={`€${data?.tickets?.revenue || 0}`}
/>


<Card
title="Bracciali attivati"
value={data?.wristbands?.activated || 0}
/>


<Card
title="Spesa wallet"
value={`€${data?.wallet?.spent || 0}`}
/>


</div>




<div className="grid grid-cols-2 gap-6 mt-8">


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Categorie biglietti
</h2>


{
Object.entries(
data?.tickets?.categories || {}
)
.map(([name,value])=>(


<div
key={name}
className="flex justify-between text-gray-300 mb-3"
>

<span>
{name}
</span>

<span className="font-bold">
{value}
</span>


</div>


))
}


</div>





<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Wallet
</h2>


<p className="text-gray-400">
Ricariche
</p>

<p className="text-2xl font-bold mb-4">
€{data?.wallet?.topups || 0}
</p>



<p className="text-gray-400">
Speso
</p>

<p className="text-2xl font-bold">
€{data?.wallet?.spent || 0}
</p>



</div>


</div>



</div>

}



function Card({title,value}){


return (

<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<p className="text-gray-400">
{title}
</p>


<h2 className="text-3xl font-bold mt-3">
{value}
</h2>


</div>

)

}