import {Routes,Route,Navigate} from "react-router-dom";
import Sidebar from "./components/Sidebar";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Wristbands from "./pages/Wristbands";
import Festivals from "./pages/Festivals";
import NFCRegister from "./pages/NFCRegister";
import Participants from "./pages/Participants";
import WristbandManual from "./pages/WristbandManual";


function Layout(){

return(
<div className="flex min-h-screen bg-black text-white">

<Sidebar/>

<main className="flex-1 p-8">
<Routes>
<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/festivals" element={<Festivals/>}/>
<Route path="/tickets" element={<Tickets/>}/>
<Route path="/wristbands" element={<Wristbands/>}/>
<Route path="/participants" element={<Participants/>}/>
<Route path="/nfc/register" element={<NFCRegister/>}/>
<Route path="/wristbands/manual" element={<WristbandManual/>}/>
</Routes>
</main>

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