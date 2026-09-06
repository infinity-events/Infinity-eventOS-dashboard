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
import POS from './pages/POS';
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Warehouse from "./pages/Warehouse";
import Landing from "./pages/Landing";
import CreateFestivalModal from "./components/CreateFestivalModal";
import { useAuth } from "./contexts/AuthContext";
import { useFestival } from "./contexts/FestivalContext";
import { createFestival } from "./api/festivals";

function RoleRoute({ children, allowedRoles }) {
  const { role } = useAuth();

  if (!role) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        Caricamento profilo...
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

function AccessDenied() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Accesso negato
        </h1>

        <p className="text-gray-400 mt-3">
          Non hai i permessi necessari per accedere a questa sezione.
        </p>

        <button
          onClick={() => window.history.back()}
          className="mt-6 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20"
        >
          Torna indietro
        </button>
      </div>
    </div>
  );
}

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
<Route
  path="/dashboard"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Dashboard />
    </RoleRoute>
  }
/>
<Route
  path="/festivals"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Festivals />
    </RoleRoute>
  }
/>

<Route
  path="/tickets"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Tickets />
    </RoleRoute>
  }
/>

<Route
  path="/wristbands"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Wristbands />
    </RoleRoute>
  }
/>

<Route
  path="/participants"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER", "STAFF", "SECURITY"]}>
      <Participants />
    </RoleRoute>
  }
/>

<Route
  path="/nfc/register"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER", "STAFF"]}>
      <NFCRegister />
    </RoleRoute>
  }
/>

<Route
  path="/wristbands/manual"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER", "STAFF"]}>
      <WristbandManual />
    </RoleRoute>
  }
/>

<Route
  path="/wallet"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Wallet />
    </RoleRoute>
  }
/>

<Route
  path="/pos"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER", "CASHIER"]}>
      <POS />
    </RoleRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Analytics />
    </RoleRoute>
  }
/>

<Route
  path="/settings"
  element={
    <RoleRoute allowedRoles={["ADMIN", "AZIENDA", "OWNER"]}>
      <Settings />
    </RoleRoute>
  }
/>

<Route
  path="/magazzino"
  element={
    <RoleRoute allowedRoles={["ADMIN"]}>
      <Warehouse />
    </RoleRoute>
  }
/>

<Route 
  path="/access-denied"
  element={<AccessDenied/>}/>
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
