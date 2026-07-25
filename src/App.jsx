import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Navigate} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Festivals from "./pages/Festivals";
import Tickets from "./pages/Tickets";
import Wristbands from "./pages/Wristbands";
import Participants from "./pages/Participants";
import NFCRegister from "./pages/NFCRegister";


function App(){

return (

<BrowserRouter>

<Routes>
<Route path="/" element={<Navigate to="/dashboard" replace/>}/>
<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/tickets" element={<Tickets/>}/>
<Route path="/wristbands" element={<Wristbands/>}/>
<Route path="/nfc/register" element={<NFCRegister/>}/>
</Routes>

</BrowserRouter>

)

}


export default App;