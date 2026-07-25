import { createContext, useContext, useState } from "react";


const TicketContext = createContext();


export function TicketProvider({children}){


const [tickets,setTickets] = useState([]);



function addTicket(ticket){

setTickets(prev => [

...prev,

{
id:Date.now(),
sold:0,
status:"In vendita",
...ticket
}

]);

}



return (

<TicketContext.Provider

value={{
tickets,
addTicket
}}

>

{children}

</TicketContext.Provider>

)

}



export function useTickets(){

return useContext(TicketContext);

}