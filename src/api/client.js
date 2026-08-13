import { auth } from "../firebase";


const API_URL =
"https://infinity-eventos-api.onrender.com";



export async function apiRequest(
endpoint,
options={}
){


let token=null;



if(auth.currentUser){

token = await auth.currentUser.getIdToken();

}



const response = await fetch(

API_URL + endpoint,

{

headers:{

"Content-Type":"application/json",

...(token && {

Authorization:
`Bearer ${token}`

}),

...options.headers

},

...options

}

);



if(!response.ok){
let message="API Error: "+response.status;
try{
const data=await response.json();
message=data?.message||data?.error||message;
}catch{
// Il backend potrebbe non restituire un corpo JSON.
}
throw new Error(message);

}



return response.json();


}
