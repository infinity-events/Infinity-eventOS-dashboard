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


function Layout(){
const [menuOpen,setMenuOpen]=useState(false);

return(
<div className="flex min-h-screen overflow-x-hidden bg-black text-white">

<Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>

<div className="min-w-0 flex-1">
<Header onMenuClick={()=>setMenuOpen(true)}/>
<main className="min-w-0 p-4 sm:p-8">
<Routes>
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


export default function App(){

return(
<Routes>

<Route path="/" element={<Navigate to="/dashboard" replace/>}/>

<Route path="/*" element={<Layout/>}/>

</Routes>
)

}
