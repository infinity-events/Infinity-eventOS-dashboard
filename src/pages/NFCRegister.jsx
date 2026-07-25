import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import NFCScanner from "../components/NFCScanner";
import {registerWristband} from "../api/wristbands";


export default function NFCRegister(){

const [params]=useSearchParams();

const festivalId=params.get("festival");

const [uid,setUid]=useState(null);
const [wristband,setWristband]=useState(null);
const [error,setError]=useState(null);


return(

<main className="min-h-screen bg-black text-white p-6">


<h1 className="text-3xl font-bold">
Registrazione braccialetti NFC
</h1>


<p className="text-gray-400 mt-2">
Festival ID: {festivalId}
</p>


<NFCScanner

onScan={async(value)=>{

setUid(value);

try{

console.log("DATI REGISTER:",{
uid:value,
festivalId
});

const result=await registerWristband({
uid:value,
festivalId
});


setWristband(result);

setTimeout(()=>{
window.location.href="/wristbands";
},1500);

}catch(err){

console.error(err);

setError(err.message);

}

}}

/>


{uid &&

<div className="mt-6 bg-[#17181D] rounded-xl p-5">

<h2 className="font-bold">
Braccialetto trovato
</h2>

<p>
UID:
</p>

<code>
{uid}
</code>

</div>

}


{wristband &&

<div className="mt-6 bg-[#17181D] rounded-xl p-5">

<h2 className="font-bold text-green-400">
Registrato!
</h2>

<p>
Codice: {wristband.code}
</p>

<p>
Attivazione: {wristband.activationCode}
</p>

</div>

}


{error &&
<p className="text-red-400 mt-5">
{error}
</p>
}


</main>

)

}