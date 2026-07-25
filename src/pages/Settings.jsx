import {useState} from "react";
import {useFestival} from "../contexts/FestivalContext";


export default function Settings(){

const {festival}=useFestival();

const [form,setForm]=useState({

name:festival?.name || "",
location:festival?.location || "",
status:festival?.status || "BOZZA"

});


function handleChange(e){

setForm({

...form,

[e.target.name]:e.target.value

});

}


function save(){

console.log("SALVATAGGIO IMPOSTAZIONI:",form);

alert("Impostazioni salvate");

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


<button className="w-full bg-red-500/20 text-red-400 rounded-xl p-3">

Archivia evento

</button>


</div>


</div>


</div>


</div>

}