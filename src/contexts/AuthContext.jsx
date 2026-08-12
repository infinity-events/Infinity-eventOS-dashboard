/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "../firebase";

import {
GoogleAuthProvider,
onAuthStateChanged,
signInWithPopup,
signOut
} from "firebase/auth";



const AuthContext=createContext();



export function AuthProvider({children}){


const [user,setUser]=useState(null);

const [loading,setLoading]=useState(true);

async function loginWithGoogle(){
  const provider=new GoogleAuthProvider();
  return signInWithPopup(auth,provider);
}

function logout(){
  return signOut(auth);
}



useEffect(()=>{


const unsubscribe = onAuthStateChanged(
auth,
(currentUser)=>{

setUser(currentUser);

setLoading(false);

}

);


return unsubscribe;


},[]);





return (

<AuthContext.Provider

value={{
user,
loading,
loginWithGoogle,
logout
}}

>

{children}

</AuthContext.Provider>


)


}



export function useAuth(){

return useContext(AuthContext);

}
