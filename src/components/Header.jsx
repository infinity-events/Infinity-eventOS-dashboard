import {Menu} from "lucide-react";

export default function Header({onMenuClick=()=>{}}){

return(

<header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 border-b border-white/5">
<button onClick={onMenuClick} className="rounded-xl p-2 text-gray-300 hover:bg-white/10 md:hidden" aria-label="Apri menu">
<Menu size={24}/>
</button>

<div className="
bg-[#17181D]
px-4
py-2
rounded-xl
">

<span className="sm:hidden">A</span>
<span className="hidden sm:inline">Andrea 👋</span>

</div>

</header>

)

}
