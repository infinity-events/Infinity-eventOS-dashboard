import { useRef } from "react";
import { NavLink } from "react-router-dom";

import { LogOut, X } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { HomeIcon } from "./icons/home";
import { CalendarDaysIcon } from "./icons/calendar-days";
import { TicketIcon } from "./icons/ticket";
import { RadioIcon } from "./icons/radio";
import { UsersIcon } from "./icons/users";
import { WalletIcon } from "./icons/wallet";
import { ChartColumnIncreasingIcon } from "./icons/chart-column-increasing";
import { SettingsIcon } from "./icons/settings";


const items=[

{
name:"Dashboard",
path:"/dashboard",
icon:HomeIcon
},

{
name:"Festival",
path:"/festivals",
icon:CalendarDaysIcon
},

{
name:"Biglietti",
path:"/tickets",
icon:TicketIcon
},

{
name:"Bracciali",
path:"/wristbands",
icon:RadioIcon
},

{
name:"Partecipanti",
path:"/participants",
icon:UsersIcon
},

{
name:"Wallet",
path:"/wallet",
icon:WalletIcon
},

{
name:"Analytics",
path:"/analytics",
icon:ChartColumnIncreasingIcon
},

{
name:"Impostazioni",
path:"/settings",
icon:SettingsIcon
}

];

function SidebarNavItem({ item, onClose }) {
  const iconRef = useRef(null);

  const startIconAnimation = () => iconRef.current?.startAnimation();
  const stopIconAnimation = () => iconRef.current?.stopAnimation();

  return (
    <NavLink
      key={item.name}
      to={item.path}
      className={({isActive}) => `
        flex
        gap-3
        items-center
        p-3
        rounded-xl
        transition
        ${isActive ? "bg-white/10" : "hover:bg-white/5"}
      `}
      onClick={onClose}
      onMouseEnter={startIconAnimation}
      onMouseLeave={stopIconAnimation}
      onMouseDown={startIconAnimation}
      onFocus={startIconAnimation}
      onBlur={stopIconAnimation}
    >
      <item.icon ref={iconRef} size={20} />
      <span>{item.name}</span>
    </NavLink>
  );
}



export default function Sidebar({open=false,onClose=()=>{}}){
const {logout}=useAuth();


return (

<>
<div
className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${open?"opacity-100":"pointer-events-none opacity-0"}`}
onClick={onClose}
aria-hidden="true"
/>
<aside className={`fixed inset-y-0 left-0 z-50 flex flex-col z-50 w-72 max-w-[85vw] min-h-screen bg-[#111217] border-r border-white/5 p-5 sm:p-6 transform transition-transform duration-200 md:static md:z-auto md:w-72 md:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>


<h1 className="
text-xl
font-bold
mb-8
flex
items-center
gap-3
">

<img
src="/favicon.svg"
alt="logo-dash"
className="
h-9
w-9
shrink-0
object-contain
brightness-0
invert
"
/>
<span>Infinity EventOS</span>
<button onClick={onClose} className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden" aria-label="Chiudi menu">
<X size={20}/>
</button>

</h1>



<nav className="space-y-2">


{items.map((item) => (
  <SidebarNavItem key={item.name} item={item} onClose={onClose} />
))}


</nav>

<button
type="button"
onClick={()=>{onClose();logout();}}
className="mt-auto flex w-full items-center gap-3 rounded-xl p-3 text-gray-400 transition hover:bg-red-500/10 hover:text-red-300"
>
<motion.span whileHover={{x:4,scale:1.08}} whileTap={{scale:0.9}} transition={{type:"spring",stiffness:320,damping:18}} className="flex shrink-0">
<LogOut size={20}/>
</motion.span>
<span>Esci dall’account</span>
</button>


</aside>
</>

)

}
