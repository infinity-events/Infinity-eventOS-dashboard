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

console.error(
"Errore caricamento statistiche wallet:",
error
);

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

console.error(
"Errore ricarica:",
error
);

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

console.error(
"Errore pagamento:",
error
);

alert(error.message);


}finally{

setLoading(false);

}

}



return(

<div className="space-y-6">


<div>

<h1 className="text-3xl font-bold">
Wallet
</h1>

<p className="opacity-70 mt-1">
Gestione pagamenti e ricariche dei braccialetti
</p>

</div>




<div className="grid grid-cols-1 md:grid-cols-4 gap-4">


<div className="rounded-xl border p-5">

<p className="opacity-70">
Wallet attivi
</p>

<h2 className="text-2xl font-bold mt-2">
{stats?.wallets ?? 0}
</h2>

</div>



<div className="rounded-xl border p-5">

<p className="opacity-70">
Saldo totale
</p>

<h2 className="text-2xl font-bold mt-2">
€ {stats?.balance ?? 0}
</h2>

</div>



<div className="rounded-xl border p-5">

<p className="opacity-70">
Ricariche
</p>

<h2 className="text-2xl font-bold mt-2">
€ {stats?.topup ?? 0}
</h2>

</div>



<div className="rounded-xl border p-5">

<p className="opacity-70">
Speso
</p>

<h2 className="text-2xl font-bold mt-2">
€ {stats?.spent ?? 0}
</h2>

</div>


</div>





<div className="grid grid-cols-1 md:grid-cols-2 gap-6">



<div className="rounded-xl border p-6">

<h2 className="text-xl font-bold mb-4">
Ricarica braccialetto
</h2>



<input

className="w-full rounded-lg border p-3 mb-3"

placeholder="Codice braccialetto"

value={topup.wristbandCode}

onChange={(e)=>
setTopup({
...topup,
wristbandCode:e.target.value
})
}

/>



<input

className="w-full rounded-lg border p-3 mb-4"

type="number"

placeholder="Importo"

value={topup.amount}

onChange={(e)=>
setTopup({
...topup,
amount:e.target.value
})
}

/>



<button

disabled={loading}

onClick={handleTopup}

className="w-full rounded-lg p-3 bg-primary text-white"

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






<div className="rounded-xl border p-6">

<h2 className="text-xl font-bold mb-4">
Pagamento manuale
</h2>



<input

className="w-full rounded-lg border p-3 mb-3"

placeholder="Codice braccialetto"

value={payment.wristbandCode}

onChange={(e)=>
setPayment({
...payment,
wristbandCode:e.target.value
})
}

/>



<input

className="w-full rounded-lg border p-3 mb-3"

type="number"

placeholder="Importo"

value={payment.amount}

onChange={(e)=>
setPayment({
...payment,
amount:e.target.value
})
}

/>



<input

className="w-full rounded-lg border p-3 mb-4"

placeholder="Descrizione"

value={payment.description}

onChange={(e)=>
setPayment({
...payment,
description:e.target.value
})
}

/>



<button

disabled={loading}

onClick={handlePayment}

className="w-full rounded-lg p-3 bg-primary text-white"

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



</div>

);

}