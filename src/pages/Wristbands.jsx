import QRCode from "react-qr-code";
import {useEffect,useState} from "react";

export default function RegisterModal({festival,close,reload}){
const [mode,setMode]=useState(null);
const [uid,setUid]=useState("");

async function submit(){
if(!uid)return;

try{
await registerWristband({
uid,
festivalId:festival.id
});

await reload();
close();

}catch(e){
console.error("Errore registrazione:",e);
}
}

return(
<div className="fixed inset-0 bg-black/60 flex items-center justify-center">
<div className="bg-[#17181D] p-8 rounded-2xl w-[420px]">

<h2 className="text-2xl font-bold">
Registra braccialetto
</h2>

<p className="text-gray-400 mt-2">
Scegli il metodo di registrazione
</p>

<div className="flex flex-col gap-3 mt-6">

<button
onClick={()=>setMode("nfc")}
className="bg-purple-600 p-4 rounded-xl">
📱 Scansiona con telefono NFC
</button>

<button
onClick={()=>setMode("manual")}
className="bg-white/10 p-4 rounded-xl">
⌨ Inserisci UID manualmente
</button>

</div>

{mode==="manual"&&(
<>
<input
className="input w-full mt-5"
placeholder="UID NFC"
value={uid}
onChange={e=>setUid(e.target.value)}
/>

<button
onClick={submit}
className="bg-purple-600 mt-4 px-5 py-3 rounded-xl w-full">
Registra
</button>
</>
)}

{mode==="nfc"&&(
<div className="mt-6 text-center">

<p className="text-gray-400 mb-4">
Scansiona con il telefono dell'operatore
</p>

<QRCode
value={`${window.location.origin}/nfc/register?festival=${festival.id}`}
size={220}
/>

<p className="text-xs text-gray-500 mt-4">
Apri la fotocamera e inquadra il QR
</p>

</div>
)}

<button
onClick={close}
className="mt-4 text-gray-400 w-full">
Annulla
</button>

</div>
</div>
)
}