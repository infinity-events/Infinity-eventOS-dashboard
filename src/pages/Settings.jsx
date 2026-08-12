import {useRef,useState} from "react";
import {useFestival} from "../contexts/FestivalContext";
import {updateFestival} from "../api/festivals";
import {Archive, Check, ChevronRight, LoaderCircle} from "lucide-react";

export default function Settings(){

const {festival, setFestival}=useFestival();

const [settings,setSettings]=useState({
    nfcActivation:true,
    walletPayments:true,
    autoLock:false
});

const [form,setForm]=useState({

name:festival?.name || "",
location:festival?.location || "",
status:festival?.status || "BOZZA"

});

const [archiveOpen,setArchiveOpen]=useState(false);
const [archiveProgress,setArchiveProgress]=useState(0);
const archiveProgressRef=useRef(0);
const [archiving,setArchiving]=useState(false);


function handleChange(e){

setForm({

...form,

[e.target.name]:e.target.value

});

}


async function save(){
    try{
    const updated=await updateFestival(
    festival.id,
    form
    );
    setFestival(updated);
    alert("Impostazioni salvate");

    }catch(error){
    console.error(
    "Errore salvataggio:",
    error
    );
    }
}

function startArchive(event){
    if(archiving)return;
    const startX=event.clientX;
    const move=(moveEvent)=>{
        const distance=Math.max(0,Math.min(240,moveEvent.clientX-startX));
        const progress=distance/240;
        archiveProgressRef.current=progress;
        setArchiveProgress(progress);
    };
    const end=async()=>{
        document.removeEventListener("pointermove",move);
        document.removeEventListener("pointerup",end);
        if(archiveProgressRef.current>=0.85){
            setArchiving(true);
            try{
                const updated=await updateFestival(festival.id,{status:"CHIUSO"});
                setFestival(updated);
                setArchiveOpen(false);
                archiveProgressRef.current=0;
                setArchiveProgress(0);
            }catch(error){
                console.error("Errore archiviazione:",error);
                alert("Non è stato possibile archiviare l'evento.");
            }finally{setArchiving(false);}
        }else{
            archiveProgressRef.current=0;
            setArchiveProgress(0);
        }
    };
    document.addEventListener("pointermove",move);
    document.addEventListener("pointerup",end,{once:true});
}

return <div>

<div className="mb-10">
<h1 className="text-4xl font-bold">
Impostazioni
</h1>

<p className="text-gray-400 mt-2">
Configurazione evento e sistema
</p>

</div>



<div className="grid grid-cols-2 gap-6">


<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">


<h2 className="text-xl font-bold mb-5">
Informazioni evento
</h2>



<label className="text-gray-400">
Nome evento
</label>

<input
name="name"
value={form.name}
onChange={handleChange}
className="w-full mt-2 mb-4 bg-black/20 border border-white/10 rounded-xl p-3 text-white"
/>



<label className="text-gray-400">
Location
</label>

<input
name="location"
value={form.location}
onChange={handleChange}
className="w-full mt-2 mb-4 bg-black/20 border border-white/10 rounded-xl p-3 text-white"
/>



<label className="text-gray-400">
Stato
</label>

<select

name="status"

value={form.status}

onChange={handleChange}

className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl p-3 text-white"

>

<option value="BOZZA">
Bozza
</option>

<option value="ATTIVO">
Attivo
</option>

<option value="CHIUSO">
Chiuso
</option>

</select>



<button

onClick={save}

className="mt-6 bg-white text-black rounded-xl px-6 py-3 font-bold"

>

Salva modifiche

</button>


</div>

<div className="space-y-6">

<div className="bg-[#17181D] rounded-2xl p-6 border border-white/5">

<h2 className="text-xl font-bold mb-5">
Sistema NFC
</h2>


<div className="space-y-5">


<Toggle
title="Attivazione bracciali"
description="Permette agli utenti di associare il bracciale NFC al proprio account"
enabled={settings.nfcActivation}
setEnabled={()=>setSettings({
...settings,
nfcActivation:!settings.nfcActivation
})}
/>



<Toggle
title="Pagamenti wallet"
description="Abilita i pagamenti tramite bracciale NFC"
enabled={settings.walletPayments}
setEnabled={()=>setSettings({
...settings,
walletPayments:!settings.walletPayments
})}
/>



<Toggle
title="Blocco automatico fine evento"
description="Blocca automaticamente i bracciali alla chiusura del festival"
enabled={settings.autoLock}
setEnabled={()=>setSettings({
...settings,
autoLock:!settings.autoLock
})}
/>



</div>


</div>





<div className="bg-[#17181D] rounded-2xl p-6 border border-red-500/20">


<h2 className="text-xl font-bold mb-5 text-red-400">
Zona pericolosa
</h2>


{!archiveOpen ? <button onClick={()=>setArchiveOpen(true)} className="w-full bg-red-500/20 text-red-400 rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-red-500/30 transition">
<Archive size={18}/>
Archivia evento
</button> : <div>
<p className="text-sm text-gray-300 mb-3">Scorri per confermare l’archiviazione dell’evento.</p>
<div className="relative h-14 rounded-xl bg-red-500/10 border border-red-500/20 overflow-hidden select-none touch-none">
<div className="absolute inset-y-0 left-0 bg-red-500/30 transition-[width]" style={{width:`${Math.max(16,archiveProgress*100)}%`}}/>
<button type="button" disabled={archiving} onPointerDown={startArchive} className="absolute top-1 left-1 h-12 w-12 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing disabled:opacity-70">
{archiving?<LoaderCircle size={20} className="animate-spin"/>:archiveProgress>=0.85?<Check size={20}/>:<ChevronRight size={22}/>}
</button>
<span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-200 pointer-events-none">Scorri →</span>
</div>
<button type="button" onClick={()=>{setArchiveOpen(false);archiveProgressRef.current=0;setArchiveProgress(0)}} className="w-full mt-3 text-sm text-gray-500 hover:text-white transition">Annulla</button>
</div>}


</div>


</div>


</div>


</div>

}

function Toggle({title,description,enabled,setEnabled}){

return (

<div className="flex items-center justify-between">


<div>

<p className="font-bold">
{title}
</p>

<p className="text-gray-400 text-sm mt-1">
{description}
</p>

</div>


<button

onClick={setEnabled}

className={`cursor-pointer w-14 h-7 rounded-full p-1 transition ${
enabled
?
"bg-green-500"
:
"bg-gray-600"
}`}

>

<div

className={`bg-white w-5 h-5 rounded-full transition ${
enabled
?
"translate-x-7"
:
"translate-x-0"
}`}

/>

</button>


</div>

)

}
