import {useSearchParams} from "react-router-dom";
import {useState} from "react";
import {registerWristband} from "../api/wristbands";

export default function NFCRegister(){

const [params]=useSearchParams();
const festivalId=params.get("festival");

const [uid,setUid]=useState("");
const [status,setStatus]=useState("Pronto");

async function scan(){

if(!("NDEFReader" in window)){
setStatus("NFC non supportato");
return;
}

try{

const ndef=new NDEFReader();

await ndef.scan();

setStatus("Avvicina il braccialetto");

ndef.onreading=async(event)=>{

const uid=event.serialNumber;

setUid(uid);

setStatus("Registrazione...");

await registerWristband({
uid,
festivalId
});

setStatus("✅ Braccialetto registrato");

};

}catch(e){

console.error(e);
setStatus("Errore NFC");

}

}


return(
<div className="min-h-screen bg-black text-white flex items-center justify-center">

<div className="bg-[#17181D] rounded-2xl p-8 w-[400px]">

<h1 className="text-3xl font-bold">
Scanner NFC
</h1>

<p className="text-gray-400 mt-2">
Registrazione braccialetti evento
</p>

<button
onClick={scan}
className="bg-purple-600 rounded-xl p-4 w-full mt-6">

📡 Avvia lettura NFC

</button>

<div className="mt-6">

<p>
UID:
</p>

<p className="text-purple-400">
{uid || "-"}
</p>

</div>

<p className="text-gray-400 mt-6 text-center">
{status}
</p>

</div>

</div>
)

}