import {useSearchParams} from "react-router-dom";
import {useState} from "react";
import {registerWristband} from "../api/wristbands";

export default function NFCRegister(){

const [params]=useSearchParams();

const festivalId=params.get("festival");

const [uid,setUid]=useState("");
const [status,setStatus]=useState("Pronto per la scansione");


async function scanNFC(){

if(!("NDEFReader" in window)){

setStatus(
"NFC non supportato. Usa Android Chrome."
);

return;

}


try{

const ndef=new NDEFReader();

await ndef.scan();

setStatus(
"Avvicina il braccialetto..."
);


ndef.onreading=async(event)=>{


const uid=event.serialNumber;


setUid(uid);

setStatus(
"Registrazione in corso..."
);


await registerWristband({

uid,
festivalId

});


setStatus(
"✅ Braccialetto registrato"
);


};


}catch(error){

console.error(error);

setStatus(
"Errore lettura NFC"
);

}


}



return(

<div className="min-h-screen bg-black text-white flex items-center justify-center">

<div className="bg-[#17181D] rounded-2xl p-8 w-[400px]">


<h1 className="text-3xl font-bold">
Registrazione NFC
</h1>


<p className="text-gray-400 mt-2">
Festival:
{festivalId}
</p>


<button
onClick={scanNFC}
className="bg-purple-600 rounded-xl p-4 w-full mt-8"
>
📡 Leggi braccialetto
</button>


<div className="mt-6">

<p className="text-gray-400">
UID:
</p>

<p className="text-purple-400 break-all">
{uid || "-"}
</p>


</div>


<p className="mt-6 text-center text-gray-400">
{status}
</p>


</div>

</div>

)

}