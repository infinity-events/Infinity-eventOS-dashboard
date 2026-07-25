import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {registerWristband} from "../api/wristbands";

export default function WristbandManual(){

const [params]=useSearchParams();

const festivalId=params.get("festival");

const [uid,setUid]=useState("");
const [message,setMessage]=useState("");

async function save(){

try{

await registerWristband({
uid,
festivalId
});

setMessage("Braccialetto registrato");

setUid("");

}catch(e){

setMessage("Errore registrazione");

}

}


return(

<div className="text-white">

<h1 className="text-3xl font-bold">
Registrazione manuale
</h1>

<input
className="bg-[#17181D] p-4 rounded-xl mt-6 w-full"
placeholder="UID NFC"
value={uid}
onChange={e=>setUid(e.target.value)}
/>


<button
onClick={save}
className="bg-purple-600 p-4 rounded-xl mt-4"
>
Registra
</button>


<p className="mt-4 text-gray-400">
{message}
</p>

</div>

)

}