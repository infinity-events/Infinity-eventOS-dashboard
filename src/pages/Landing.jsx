import { useState } from "react";
import { LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Landing(){
  const {loginWithGoogle}=useAuth();
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function login(){
    setError("");setLoading(true);
    try{await loginWithGoogle();}
    catch(err){setError(err?.message||"Accesso non riuscito");}
    finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-6">
    <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-center">
      <section className="hidden lg:block px-8">
        <div className="flex items-center gap-3 mb-10"><img src="/favicon.svg" className="h-10 w-10 brightness-0 invert"/><span className="text-xl font-bold">Infinity EventOS</span></div>
        <p className="text-purple-300 font-semibold mb-4 flex items-center gap-2"><Sparkles size={18}/> LA TUA REGIA DIGITALE</p>
        <h1 className="text-5xl font-bold leading-tight">Tutto il tuo festival,<br/><span className="text-purple-400">sotto controllo.</span></h1>
        <p className="text-gray-400 text-lg mt-6 max-w-lg">Organizza eventi, ticket, braccialetti e accessi da un’unica dashboard.</p>
      </section>
      <section className="bg-[#17181D] border border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl">
        <div className="lg:hidden flex items-center gap-3 mb-10"><img src="/favicon.svg" className="h-9 w-9 brightness-0 invert"/><span className="text-lg font-bold">Infinity EventOS</span></div>
        <h2 className="text-3xl font-bold">Bentornato.</h2>
        <p className="text-gray-400 mt-2">Accedi per gestire i tuoi festival.</p>
        <button onClick={login} disabled={loading} className="mt-8 w-full rounded-2xl bg-white text-gray-900 py-3.5 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition disabled:opacity-60"><LogIn size={20}/>{loading?"Accesso in corso...":"Accedi con Google"}</button>
        <div className="flex items-center gap-2 justify-center text-xs text-gray-500 mt-6"><ShieldCheck size={15}/> Accesso sicuro tramite Firebase Authentication</div>
        {error&&<p className="mt-5 text-sm text-red-300 bg-red-500/10 rounded-xl p-3">{error}</p>}
      </section>
    </div>
  </main>;
}
