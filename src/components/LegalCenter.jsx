import {useState} from "react";
import {ArrowLeft,Camera,ChevronRight,Cookie,FileText,Mail,Scale,ShieldCheck,Ticket,WalletCards,X} from "lucide-react";

const docs=[
  {id:"privacy",icon:ShieldCheck,title:"Privacy Policy",text:[
    ["Titolare del trattamento","Infinity Events SRL, Piazzale Don Enrico Paglioni, 1 — infinityeventsit@gmail.com."],
    ["Dati trattati","Per la gestione dell'area riservata possono essere trattati nome, cognome, email e data di nascita, oltre agli identificativi tecnici necessari all'autenticazione e ai dati collegati a ticket, accessi e braccialetti quando utilizzati."],
    ["Finalità","Creazione e gestione dell'account, gestione degli eventi, assistenza, verifica dei titoli di accesso, registrazione degli ingressi, gestione dei braccialetti NFC e invio dei report richiesti dall'utente."],
    ["Fornitori","L'autenticazione utilizza Firebase Authentication. L'infrastruttura applicativa utilizza servizi cloud e database necessari all'erogazione del servizio. I biglietti e i relativi pagamenti sono gestiti da Ciaoticket."],
    ["NFC","Attualmente l'UID del braccialetto NFC viene utilizzato come identificativo e può essere associato all'account/ticket secondo le funzionalità attive. Eventuali funzionalità cashless saranno oggetto di specifica informativa prima dell'attivazione."],
    ["Cancellazione account","L'utente può richiedere la cancellazione. La richiesta viene gestita manualmente entro 3–4 giorni lavorativi, salvo dati che debbano essere conservati per obblighi di legge o tutela dei diritti."],
    ["Diritti","L'interessato può esercitare i diritti previsti dal GDPR, inclusi accesso, rettifica, cancellazione, limitazione, opposizione e, ove applicabile, portabilità, scrivendo a infinityeventsit@gmail.com."],
    ["Aggiornamenti","Questa informativa potrà essere aggiornata quando cambiano funzionalità, fornitori o trattamenti. La versione pubblicata sul sito è quella applicabile."]
  ]},
  {id:"cookies",icon:Cookie,title:"Cookie Policy",text:[
    ["Situazione attuale","Infinity EventOS non utilizza Google Analytics, Meta Pixel o altri strumenti di analisi/profilazione pubblicitaria secondo la configurazione attuale."],
    ["Cookie tecnici e tecnologie necessarie","Il sito e l'area riservata possono utilizzare tecnologie strettamente necessarie al funzionamento, all'autenticazione, alla sicurezza e alla gestione della sessione. Questi strumenti non vengono utilizzati per finalità pubblicitarie."],
    ["Preferenze","Qualora in futuro venissero introdotti strumenti che richiedono il consenso, il sistema di gestione delle preferenze sarà aggiornato prima della loro attivazione e la presente policy verrà modificata."]
  ]},
  {id:"terms",icon:Scale,title:"Termini e condizioni",text:[
    ["Servizio","Infinity EventOS è una piattaforma software destinata alla gestione operativa di eventi. L'accesso alle funzioni riservate è consentito esclusivamente agli utenti autorizzati."],
    ["Account","L'utente è responsabile della correttezza dei dati forniti e della sicurezza delle proprie credenziali e deve utilizzare il servizio secondo legge e buona fede."],
    ["Disponibilità","Infinity Events SRL adotta misure ragionevoli per mantenere il servizio disponibile, ma non garantisce l'assenza assoluta di interruzioni, errori o manutenzioni."],
    ["Proprietà","Interfaccia, marchi, testi, grafica e software di Infinity EventOS restano protetti dalle norme applicabili. È vietato copiarli, modificarli o utilizzarli fuori dagli scopi autorizzati."],
    ["Contatti","Per assistenza o segnalazioni: infinityeventsit@gmail.com."]
  ]},
  {id:"tickets",icon:Ticket,title:"Biglietti, vendita e rimborsi",text:[
    ["Vendita","I biglietti VividFest sono nominativi e la vendita, il pagamento e la relativa procedura di acquisto sono gestiti da Ciaoticket. Le condizioni mostrate durante il checkout Ciaoticket fanno fede per il processo di acquisto."],
    ["Accesso","Il ticket consente l'accesso all'evento secondo le condizioni applicabili all'evento e previa verifica del titolo di ingresso. Il ticket può essere associato ai dati dell'utente e alla registrazione dell'ingresso in Infinity EventOS."],
    ["Rimborso","La richiesta di rimborso è ammessa secondo la policy dell'evento fino alle ore 00:00 del giorno di inizio dell'evento. Le modalità operative del rimborso sono quelle rese disponibili da Ciaoticket, che gestisce vendita e pagamento."],
    ["Evento annullato o modificato","In caso di annullamento, rinvio o modifica dell'evento saranno comunicate agli acquirenti le procedure applicabili, anche tramite il canale di vendita Ciaoticket."]
  ]},
  {id:"access",icon:FileText,title:"Regolamento di accesso",text:[
    ["Ticket nominativo","All'ingresso può essere richiesto il titolo di ingresso e, quando previsto, un documento idoneo a verificare la corrispondenza con il nominativo indicato sul ticket."],
    ["Controlli","L'organizzazione può effettuare controlli di sicurezza e verificare validità, stato e utilizzo del ticket. Un ticket già utilizzato, contraffatto, alterato o non valido può comportare il rifiuto dell'accesso."],
    ["Comportamento","L'accesso e la permanenza nell'area dell'evento sono subordinati al rispetto delle disposizioni di sicurezza, del personale autorizzato e delle regole comunicate per lo specifico evento."],
    ["Braccialetti","Quando utilizzati, i braccialetti NFC possono essere associati a un partecipante e utilizzati come identificativo operativo. Le regole del servizio cashless, quando attivo, saranno pubblicate separatamente."]
  ]},
  {id:"media",icon:Camera,title:"Foto e video",text:[
    ["Riprese","Durante gli eventi possono essere realizzate fotografie e riprese video da operatori incaricati da Infinity Events SRL."],
    ["Utilizzo","I contenuti possono essere pubblicati sui canali social ufficiali, incluso Instagram, e sul sito web dell'organizzazione per documentazione e comunicazione dell'evento."],
    ["Richieste","Per segnalazioni relative a immagini o riprese è possibile contattare infinityeventsit@gmail.com, indicando il contenuto interessato e la richiesta."],
    ["Nota","Le modalità di utilizzo possono dipendere dalla natura della ripresa, dalla posizione del soggetto e dal contesto dell'evento. Per contenuti realizzati come soggetto principale potranno essere adottate modalità specifiche di acquisizione dell'autorizzazione."]
  ]},
  {id:"reports",icon:Mail,title:"Report e comunicazioni",text:[
    ["Report settimanali","Gli utenti autorizzati possono ricevere report settimanali relativi all'attività dell'evento. Il servizio è disattivabile e non costituisce una newsletter commerciale."],
    ["Marketing","Attualmente Infinity EventOS non utilizza questi report per finalità di marketing."],
    ["Tracking email","I report non utilizzano sistemi di tracking dell'apertura o del click secondo la configurazione attuale."]
  ]}
];

function Doc({doc}){return <article className="space-y-7"><div><div className="flex items-center gap-3 text-purple-300"><doc.icon size={20}/><span className="text-xs uppercase tracking-[.18em] font-bold">Documento</span></div><h2 className="text-3xl sm:text-4xl font-bold mt-3">{doc.title}</h2></div>{doc.text.map(([title,body])=><section key={title}><h3 className="text-sm font-semibold text-white mb-2">{title}</h3><p className="text-sm sm:text-[15px] leading-7 text-zinc-400">{body}</p></section>)}</article>}

export default function LegalCenter({compact=false}){
 const [open,setOpen]=useState(compact?"":null);
 const [doc,setDoc]=useState(docs[0]);
 const show=(item)=>{setDoc(item);setOpen("doc")};
 if(compact)return <div className="flex flex-wrap gap-3 text-xs text-zinc-500">{docs.map(item=><button key={item.id} onClick={()=>show(item)} className="hover:text-white transition">{item.title}</button>)}{open&&<div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center" onMouseDown={(e)=>e.target===e.currentTarget&&setOpen(null)}><div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111217] shadow-2xl p-6 sm:p-9"><div className="flex justify-end mb-4"><button onClick={()=>setOpen(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><X size={18}/></button></div><Doc doc={doc}/></div></div>}</div>;
 return <div className="min-h-screen bg-[#09090B] text-white"><header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl"><div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between"><a href="/dashboard" className="flex items-center gap-3 font-bold"><img src="/favicon.svg" className="w-8 h-8 brightness-0 invert"/><span>Infinity EventOS</span></a><a href="/" className="text-sm text-zinc-400 hover:text-white flex items-center gap-2"><ArrowLeft size={16}/> Dashboard</a></div></header><main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16"><div className="max-w-3xl mb-12"><p className="text-purple-300 text-xs uppercase tracking-[.2em] font-bold">Legal Center</p><h1 className="text-4xl sm:text-6xl font-bold tracking-tight mt-3">Tutto ciò che devi sapere.</h1><p className="text-zinc-400 mt-5 text-base sm:text-lg leading-7">Le informazioni legali e privacy di Infinity EventOS e dei servizi VividFest, raccolte in un unico spazio.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{docs.map(item=><button key={item.id} onClick={()=>show(item)} className="text-left rounded-2xl border border-white/10 bg-white/[.025] hover:bg-white/[.05] hover:border-purple-400/30 p-5 transition group"><div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-300 grid place-items-center mb-6"><item.icon size={19}/></div><h2 className="font-semibold">{item.title}</h2><p className="text-xs leading-5 text-zinc-500 mt-2">Apri documento <ChevronRight size={13} className="inline group-hover:translate-x-1 transition-transform"/></p></button>)}</div><div className="mt-10 rounded-2xl border border-amber-400/10 bg-amber-400/[.04] p-5 text-xs leading-6 text-zinc-500"><strong className="text-zinc-300">Nota:</strong> i testi sono la base informativa del progetto e devono essere verificati dal professionista incaricato della compliance prima della pubblicazione definitiva, soprattutto per ruoli dei fornitori, conservazione dei dati e specifiche condizioni dell'evento.</div></main></div>
}
