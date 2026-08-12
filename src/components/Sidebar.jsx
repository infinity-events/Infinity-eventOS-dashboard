import { NavLink } from "react-router-dom";

import {
Home,
Calendar,
Ticket,
Radio,
Users,
WalletCards,
ChartBar,
Settings,
X
} from "lucide-react";

import AnimatedSidebarIcon from "./AnimatedSidebarIcon";


const items=[

{
name:"Dashboard",
path:"/dashboard",
icon:Home,
iconName:"home"
},

{
name:"Festival",
path:"/festivals",
icon:Calendar,
iconName:"calendar"
},

{
name:"Biglietti",
path:"/tickets",
icon:Ticket,
iconName:"ticket"
},

{
name:"Bracciali",
path:"/wristbands",
icon:Radio,
iconName:"radio"
},

{
name:"Partecipanti",
path:"/participants",
icon:Users,
iconName:"users"
},

{
name:"Wallet",
path:"/wallet",
icon:WalletCards,
iconName:"wallet"
},

{
name:"Analytics",
path:"/analytics",
icon:ChartBar,
iconName:"analytics"
},

{
name:"Impostazioni",
path:"/settings",
icon:Settings,
iconName:"settings"
}

];



export default function Sidebar({open=false,onClose=()=>{}}){


return (

<>
<div
className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${open?"opacity-100":"pointer-events-none opacity-0"}`}
onClick={onClose}
aria-hidden="true"
/>
<aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] min-h-screen bg-[#111217] border-r border-white/5 p-5 sm:p-6 transform transition-transform duration-200 md:static md:z-auto md:w-72 md:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>


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


{

items.map((item)=>(


<NavLink

key={item.name}

to={item.path}

className={({isActive})=>

`
flex
gap-3
items-center
p-3
rounded-xl
transition

${isActive 
? "bg-white/10"
: "hover:bg-white/5"
}

`

}
onClick={onClose}

>


<AnimatedSidebarIcon icon={item.icon} name={item.iconName} size={20}/>


<span>

{item.name}

</span>


</NavLink>


))

}


</nav>


</aside>
</>

)

}
