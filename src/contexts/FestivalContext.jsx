/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import {createContext,useContext,useEffect,useState} from "react";
import { useAuth } from "./AuthContext";
import { getFestivals } from "../api/festivals";

const FestivalContext=createContext();

function readSavedFestival(){
  try{
    const saved=localStorage.getItem("festival");
    return saved ? JSON.parse(saved) : null;
  }catch(error){
    console.warn("Festival salvato non valido:",error);
    localStorage.removeItem("festival");
    return null;
  }
}

export function FestivalProvider({children}){
  const [festival,setFestivalState]=useState(readSavedFestival);
  const [festivals,setFestivals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const {user}=useAuth();

  useEffect(()=>{
    if(!user){
      setFestivals([]);
      setFestivalState(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active=true;
    setLoading(true);
    setError(null);

    getFestivals().then(data=>{
      if(!active)return;
      const list=Array.isArray(data)?data:[];
      setFestivals(list);
      const savedId=localStorage.getItem(`festival:${user.uid}`);
      const selected=list.find(item=>item.id===savedId)||list[0]||null;
      setFestivalState(selected);
      if(selected)localStorage.setItem("festival",JSON.stringify(selected));
    }).catch(error=>{
      if(!active)return;
      console.error("Errore caricamento festival:",error);
      setFestivals([]);
      setError("Non riesco a caricare i festival. Controlla la connessione e riprova.");
    }).finally(()=>{
      if(active)setLoading(false);
    });

    return ()=>{active=false};
  },[user]);

  function setFestival(data){
    setFestivalState(data);
    if(user?.uid&&data?.id)localStorage.setItem(`festival:${user.uid}`,data.id);
    localStorage.setItem("festival",JSON.stringify(data));
  }

  function addFestival(data){
    setFestivals(prev=>[...prev,data]);
    setFestival(data);
    setError(null);
  }

  function addTicket(ticket){
    setFestivalState(prev=>{
      const updated={...prev,tickets:[...(prev?.tickets || []),ticket]};
      localStorage.setItem("festival",JSON.stringify(updated));
      return updated;
    });
  }

  return(
    <FestivalContext.Provider
      value={{
        festival,
        festivals,
        loading,
        error,
        setFestival,
        addFestival,
        updateFestivalContext:setFestival,
        addTicket
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival(){
  return useContext(FestivalContext);
}
