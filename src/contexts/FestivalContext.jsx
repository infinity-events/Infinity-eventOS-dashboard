import { createContext, useContext, useState } from "react";


const FestivalContext = createContext();



export function FestivalProvider({children}){


const [festival,setFestival] = useState(null);



function addTicket(ticket){


setFestival(prev => ({

...prev,

tickets:[

...(prev.tickets || []),

ticket

]

}));

}



return (

<FestivalContext.Provider

value={{
festival,
setFestival,
addTicket
}}

>

{children}

</FestivalContext.Provider>

)

}



export function useFestival(){

return useContext(FestivalContext);

}