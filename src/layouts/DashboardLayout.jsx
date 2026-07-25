import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


export default function DashboardLayout(){

return (

<div className="
flex
min-h-screen
bg-[#09090B]
text-white
">

<Sidebar/>

<div className="flex-1">

<Header/>

<main className="
p-8
">

<Outlet/>

</main>


</div>


</div>

)

}