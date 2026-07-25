import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {walletStats,topupWallet,payWallet} from "../api/wallet";

export default function Wallet(){

const {festival}=useFestival();

const [stats,setStats]=useState(null);
const [loading,setLoading]=useState(false);

const [topup,setTopup]=useState({
wristbandCode:"",
amount:20
});

const [payment,setPayment]=useState({
wristbandCode:"",
amount:5,
description:""
});


useEffect(()=>{

if(festival){
loadStats();
}

},[festival]);


async function loadStats(){

try{

const data=await walletStats(festival.id);
setStats(data);

}catch(error){

console.error("Errore caricamento wallet:",error);

}

}


async function handleTopup(){

try{

setLoading(true);

await topupWallet({
wristbandCode:topup.wristbandCode,
amount:Number(topup.amount)
});

await loadStats();

alert("Ricarica completata");

setTopup({
wristbandCode:"",
amount:20
});

}catch(error){

console.error("Errore ricarica:",error);
alert(error.message);

}finally{

setLoading(false);

}

}


async function handlePayment(){

try{

setLoading(true);

await payWallet({
wristbandCode:payment.wristbandCode,
amount:Number(payment.amount),
description:payment.description
});

await loadStats();

alert("Pagamento completato");

setPayment({
wristbandCode:"",
amount:5,
description:""
});

}catch(error){

console.error("Errore pagamento:",error);
alert(error.message);

}finally{

setLoading(false);

}

}


return(

<div className="p-6 text-white">

<h1 className="text-3xl font-bold mb-6">
Wallet
</h1>


<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">


<div className="bg-[#111] border border-white/10 rounded-xl p-5">
<p className="text-gray-400">
Wallet attivi
</p>
<h2 className="text-2xl font-bold">
{stats?.wallets ?? 0}
</h2>
</div>


<div className="bg-[#111] border border-white/10 rounded-xl p-5">
<p className="text-gray-400">
Saldo totale
</p>
<h2 className="text-2xl font-bold">
€ {stats?.balance ?? 0}
</h2>
</div>


<div className="bg-[#111] border border-white/10 rounded-xl p-5">
<p className="text-gray-400">
Ricariche
</p>
<h2 className="text-2xl font-bold">
€ {stats?.topup ?? 0}
</h2>
</div>


<div className="bg-[#111] border border-white/10 rounded-xl p-5">
<p className="text-gray-400">
Speso
</p>
<h2 className="text-2xl font-bold">
€ {stats?.spent ?? 0}
</h2>
</div>


</div>



<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


<div className="bg-[#111] border border-white/10 rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
Ricarica braccialetto
</h2>


<input
className="w-full mb-3 p-3 rounded-lg bg-black border border-white/20 text-white"
placeholder="Codice braccialetto"
value={topup.wristbandCode}
onChange={(e)=>setTopup({
...topup,
wristbandCode:e.target.value
})}
/>


<input
className="w-full mb-3 p-3 rounded-lg bg-black border border-white/20 text-white"
type="number"
placeholder="Importo"
value={topup.amount}
onChange={(e)=>setTopup({
...topup,
amount:e.target.value
})}
/>


<button
disabled={loading}
onClick={handleTopup}
className="w-full p-3 rounded-lg bg-white text-black font-bold disabled:opacity-50"
>

{loading?"Caricamento...":"Ricarica"}

</button>


</div>




<div className="bg-[#111] border border-white/10 rounded-xl p-6">

<h2 className="text-xl font-bold mb-4">
Pagamento manuale
</h2>


<input
className="w-full mb-3 p-3 rounded-lg bg-black border border-white/20 text-white"
placeholder="Codice braccialetto"
value={payment.wristbandCode}
onChange={(e)=>setPayment({
...payment,
wristbandCode:e.target.value
})}
/>


<input
className="w-full mb-3 p-3 rounded-lg bg-black border border-white/20 text-white"
type="number"
placeholder="Importo"
value={payment.amount}
onChange={(e)=>setPayment({
...payment,
amount:e.target.value
})}
/>


<input
className="w-full mb-3 p-3 rounded-lg bg-black border border-white/20 text-white"
placeholder="Descrizione"
value={payment.description}
onChange={(e)=>setPayment({
...payment,
description:e.target.value
})}
/>


<button
disabled={loading}
onClick={handlePayment}
className="w-full p-3 rounded-lg bg-white text-black font-bold disabled:opacity-50"
>

{loading?"Caricamento...":"Paga"}

</button>


</div>


</div>


</div>

);

}