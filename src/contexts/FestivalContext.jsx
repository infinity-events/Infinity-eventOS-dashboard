/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import {createContext,useContext,useEffect,useState} from "react";
import { useAuth } from "./AuthContext";
import { getFestivals } from "../api/festivals";

const FestivalContext=createContext();

export function FestivalProvider({children}){

const [festival,setFestivalState]=useState(
JSON.parse(localStorage.getItem("festival")) || null
);

const [festivals,setFestivals]=useState([]);
const [loading,setLoading]=useState(true);
const {user}=useAuth();

useEffect(()=>{
  if(!user){setFestivals([]);setFestivalState(null);setLoading(false);return;}
  let active=true;
  setLoading(true);
  getFestivals().then(data=>{
    if(!active)return;
    const list=Array.isArray(data)?data:[];
    setFestivals(list);
    const savedId=localStorage.getItem(`festival:${user.uid}`);
    const selected=list.find(item=>item.id===savedId)||list[0]||null;
    setFestivalState(selected);
    if(selected)localStorage.setItem("festival",JSON.stringify(selected));
  }).catch(error=>console.error("Errore caricamento festival:",error)).finally(()=>active&&setLoading(false));
  return ()=>{active=false};
},[user]);

function setFestival(data){
setFestivalState(data);
if(user?.uid&&data?.id)localStorage.setItem(`festival:${user.uid}`,data.id);
localStorage.setItem(
"festival",
JSON.stringify(data)
);

}

function addFestival(data){
  setFestivals(prev=>[...prev,data]);
  setFestival(data);
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
festivals,
loading,
setFestival,
addFestival,
        updateFestivalContext:setFestival,
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
