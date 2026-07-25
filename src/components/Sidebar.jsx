import { NavLink } from "react-router-dom";

import {
Home,
Calendar,
Ticket,
Radio,
Users,
WalletCards,
ChartBar,
Settings
} from "lucide-react";


const items=[

{
name:"Dashboard",
path:"/dashboard",
icon:Home
},

{
name:"Festival",
path:"/festivals",
icon:Calendar
},

{
name:"Biglietti",
path:"/tickets",
icon:Ticket
},

{
name:"Bracciali",
path:"/wristbands",
icon:Radio
},

{
name:"Partecipanti",
path:"/participants",
icon:Users
},

{
name:"Wallet",
path:"/wallet",
icon:WalletCards
},

{
name:"Analytics",
path:"/analytics",
icon:ChartBar
},

{
name:"Impostazioni",
path:"/settings",
icon:Settings
}

];



export default function Sidebar(){


return (

<aside className="
w-72
min-h-screen
bg-[#111217]
border-r
border-white/5
p-6
">


<h1 className="
text-xl
font-bold
mb-10
">

∞ Infinity EventOS

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

>


<item.icon size={20}/>


<span>

{item.name}

</span>


</NavLink>


))

}


</nav>


</aside>

)

}