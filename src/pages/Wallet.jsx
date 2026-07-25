import {useEffect,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {walletStats,topupWallet,payWallet, getTransactions} from "../api/wallet";


export default function Wallet(){

const {festival}=useFestival();

const [stats,setStats]=useState(null);
const [loading,setLoading]=useState(false);
const [transactions,setTransactions]=useState([]);

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

console.error(
"Errore caricamento wallet:",
error
);

} if(festival?.ownerId){

const tx=await getTransactions(
festival.ownerId
);

setTransactions(tx);

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


setTopup({
wristbandCode:"",
amount:20
});


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


setPayment({

wristbandCode:"",
amount:5,
description:""

});


}catch(error){

console.error(error);
alert(error.message);

}finally{

setLoading(false);

}

}



return <div>



<div className="mb-10">

<h1 className="text-4xl font-bold">
Wallet
</h1>

<p className="text-gray-400 mt-2">
Gestione pagamenti, ricariche e saldo braccialetti
</p>

</div>




<div className="grid grid-cols-4 gap-6">


<Card
title="Wallet attivi"
value={stats?.wallets || 0}
/>


<Card
title="Saldo totale"
value={`€${stats?.balance || 0}`}
/>


<Card
title="Totale ricaricato"
value={`€${stats?.topup || 0}`}
/>


<Card
title="Totale speso"
value={`€${stats?.spent || 0}`}
/>


</div>





<div className="grid grid-cols-2 gap-6 mt-8">



<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Ricarica braccialetto
</h2>


<input

className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mb-4"

placeholder="Codice braccialetto"

value={topup.wristbandCode}

onChange={(e)=>setTopup({

...topup,

wristbandCode:e.target.value

})}

/>



<input

className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mb-5"

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

className="w-full bg-white text-black rounded-xl p-3 font-bold"

>

{
loading
?
"Caricamento..."
:
"Ricarica"
}

</button>


</div>





<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Pagamento manuale
</h2>


<input

className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mb-4"

placeholder="Codice braccialetto"

value={payment.wristbandCode}

onChange={(e)=>setPayment({

...payment,

wristbandCode:e.target.value

})}

/>



<input

className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mb-4"

type="number"

placeholder="Importo"

value={payment.amount}

onChange={(e)=>setPayment({

...payment,

amount:e.target.value

})}

/>



<input

className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mb-5"

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

className="w-full bg-white text-black rounded-xl p-3 font-bold"

>

{
loading
?
"Caricamento..."
:
"Paga"
}

</button>


</div>


</div>




<div className="mt-8 bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Ultime transazioni
</h2>


<div className="space-y-3">

{
transactions.length===0 && (

<p className="text-gray-400">
Nessuna transazione disponibile
</p>

)
}


{
transactions.map((tx)=>(

<div
key={tx.id}
className="flex justify-between items-center border-b border-white/5 pb-3"
>

<div>

<p className="font-bold">
{tx.type==="TOPUP" ? "💳 Ricarica" : "💰 Acquisto"}
</p>

<p className="text-gray-400 text-sm">
{tx.description}
</p>

</div>


<p className={
tx.type==="TOPUP"
?
"text-green-400 font-bold"
:
"text-red-400 font-bold"
}
>

{
tx.type==="TOPUP"
?
"+ "
:
"- "
}

€{tx.amount}

</p>


</div>

))

}

</div>


</div>



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