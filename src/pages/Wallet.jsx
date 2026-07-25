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

}catch(error){

console.error(error);

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

}catch(error){

console.error(error);

alert(error.message);

}finally{

setLoading(false);

}

}


return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">
Wallet
</h1>


<div className="grid grid-cols-4 gap-4 mb-8">

<div className="bg-white rounded-xl shadow p-5">
<p>Wallet</p>
<h2 className="text-2xl font-bold">
{stats?.wallets ?? 0}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Saldo totale</p>
<h2 className="text-2xl font-bold">
€ {stats?.balance ?? 0}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Ricariche</p>
<h2 className="text-2xl font-bold">
€ {stats?.topup ?? 0}
</h2>
</div>


<div className="bg-white rounded-xl shadow p-5">
<p>Speso</p>
<h2 className="text-2xl font-bold">
€ {stats?.spent ?? 0}
</h2>
</div>

</div>



<div className="grid grid-cols-2 gap-6">


<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">
Ricarica braccialetto
</h2>


<input
className="border rounded p-3 w-full mb-3"
placeholder="Codice bracciale"
value={topup.wristbandCode}
onChange={e=>setTopup({
...topup,
wristbandCode:e.target.value
})}
/>


<input
className="border rounded p-3 w-full mb-3"
type="number"
value={topup.amount}
onChange={e=>setTopup({
...topup,
amount:e.target.value
})}
/>


<button
disabled={loading}
onClick={handleTopup}
className="bg-black text-white rounded-xl p-3 w-full"
>

{
loading?
"Caricamento..."
:
"Ricarica"
}

</button>


</div>



<div className="bg-white rounded-xl shadow p-6">

<h2 className="text-xl font-bold mb-4">
Pagamento manuale
</h2>


<input
className="border rounded p-3 w-full mb-3"
placeholder="Codice bracciale"
value={payment.wristbandCode}
onChange={e=>setPayment({
...payment,
wristbandCode:e.target.value
})}
/>


<input
className="border rounded p-3 w-full mb-3"
type="number"
value={payment.amount}
onChange={e=>setPayment({
...payment,
amount:e.target.value
})}
/>


<input
className="border rounded p-3 w-full mb-3"
placeholder="Descrizione"
value={payment.description}
onChange={e=>setPayment({
...payment,
description:e.target.value
})}
/>


<button
disabled={loading}
onClick={handlePayment}
className="bg-black text-white rounded-xl p-3 w-full"
>

{
loading?
"Caricamento..."
:
"Paga"
}

</button>


</div>


</div>

</div>

);

}