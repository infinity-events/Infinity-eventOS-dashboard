export default function NFCScanner({onScan}){

async function startScan(){

if(!("NDEFReader" in window)){

alert("Questo dispositivo non supporta NFC");
return;

}

try{

const ndef=new window.NDEFReader();

await ndef.scan();

alert("Avvicina il braccialetto...");


ndef.onreading=(event)=>{

const serial=event.serialNumber;

if(!serial){

alert("UID non trovato");
return;

}

const uid=serial
.replace(/:/g,'')
.toUpperCase();


alert("UID LETTO: "+uid);

onScan(uid);

};


}catch(error){

console.error(error);

alert("Errore durante la lettura NFC");

}

}


return(
<button
onClick={startScan}
className="mt-8 w-full rounded-xl bg-purple-600 p-4 text-white text-lg"
>
📡 Scansiona braccialetto
</button>
)

}