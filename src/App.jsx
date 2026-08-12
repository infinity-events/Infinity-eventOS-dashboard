import {useState} from "react";
import {Routes,Route,Navigate} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Wristbands from "./pages/Wristbands";
import Festivals from "./pages/Festivals";
import NFCRegister from "./pages/NFCRegister";
import Participants from "./pages/Participants";
import WristbandManual from "./pages/WristbandManual";
import Wallet from "./pages/Wallet";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import CreateFestivalModal from "./components/CreateFestivalModal";
import { useAuth } from "./contexts/AuthContext";
import { useFestival } from "./contexts/FestivalContext";
import { createFestival } from "./api/festivals";


function Layout(){
const [menuOpen,setMenuOpen]=useState(false);

return(
<div className="flex min-h-screen overflow-x-hidden bg-black text-white">

<Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>

<div className="min-w-0 flex-1">
<Header onMenuClick={()=>setMenuOpen(true)}/>
<main className="min-w-0 p-4 sm:p-8">
<Routes>
<Route path="/" element={<Navigate to="/dashboard" replace/>}/>
<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/festivals" element={<Festivals/>}/>
<Route path="/tickets" element={<Tickets/>}/>
<Route path="/wristbands" element={<Wristbands/>}/>
<Route path="/entrance" element={<Navigate to="/participants" replace/>}/>
<Route path="/participants" element={<Participants/>}/>
<Route path="/nfc/register" element={<NFCRegister/>}/>
<Route path="/wristbands/manual" element={<WristbandManual/>}/>
<Route path="/wallet" element={<Wallet/>}/>
<Route path="/analytics" element={<Analytics/>}/>
<Route path="/settings" element={<Settings/>}/>
</Routes>
</main>
</div>

</div>
)

}

function AuthenticatedApp(){
  const {loading}=useFestival();
  const {festivals,addFestival}=useFestival();
  if(loading)return <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">Caricamento dei tuoi festival...</div>;
  async function handleCreate(data){
    const created=await createFestival(data);
    addFestival(created);
  }
  return <>
    <Layout/>
    {festivals.length===0&&<CreateFestivalModal required create={handleCreate}/>} 
  </>;
}


export default function App(){
const {user,loading}=useAuth();
if(loading)return <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">Caricamento...</div>;
if(!user)return <Landing/>;

return(
<AuthenticatedApp/>
)

}
