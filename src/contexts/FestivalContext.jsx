import {createContext,useContext,useState} from "react";

const FestivalContext=createContext();

export function FestivalProvider({children}){

const [festival,setFestivalState]=useState(
JSON.parse(localStorage.getItem("festival")) || null
);


function setFestival(data){

setFestivalState(data);

localStorage.setItem(
"festival",
JSON.stringify(data)
);

}


function addTicket(ticket){

setFestivalState(prev=>{

const updated={
...prev,
tickets:[
...(prev.tickets || []),
ticket
]
};

localStorage.setItem(
"festival",
JSON.stringify(updated)
);

return updated;

});

}


return(
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