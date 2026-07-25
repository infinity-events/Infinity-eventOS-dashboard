import {useSearchParams} from "react-router-dom";
import {useState} from "react";
import {registerWristband} from "../api/wristbands";

export default function NFCRegister(){

const [params]=useSearchParams();
const festivalId=params.get("festival");

const [uid,setUid]=useState("");
const [status,setStatus]=useState("");

async function register(){

try{

await registerWristband({
uid,
festivalId
});

setStatus("Braccialetto registrato");

setUid("");

}catch(e){

console.error(e);
setStatus("Errore registrazione");

}

}


async function scanNFC(){

if(!("NDEFReader" in window)){

setStatus("NFC non supportato");

return;

}

try{

const ndef=new NDEFReader();

await ndef.scan();

setStatus("Avvicina il braccialetto");

ndef.onreading=(event)=>{

const uid=event.serialNumber;

setUid(uid);

setStatus("UID letto");

};

}catch(e){

console.error(e);
setStatus("Errore NFC");

}

}


return(
<div className="min-h-screen bg-black text-white flex items-center justify-center">

<div className="bg-[#17181D] p-8 rounded-2xl w-[400px]">

<h1 className="text-3xl font-bold">
Scanner NFC
</h1>

<p className="text-gray-400 mt-2">
Registrazione braccialetti
</p>


<button
onClick={scanNFC}
className="bg-purple-600 p-4 rounded-xl w-full mt-6">
📱 Avvia scansione NFC
</button>


<input
className="input w-full mt-5"
placeholder="UID manuale"
value={uid}
onChange={e=>setUid(e.target.value)}
/>


<button
onClick={register}
className="bg-white/10 p-4 rounded-xl w-full mt-4">
Registra braccialetto
</button>


<p className="text-center mt-5 text-gray-400">
{status}
</p>

</div>

</div>
)

}