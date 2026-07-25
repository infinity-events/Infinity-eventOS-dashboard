import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
        apiKey: "AIzaSyAreXtr2VRoi9FrPR1PSNhrM1qfWyzpYqw",
        authDomain: "sample-firebase-ai-app-be9db.firebaseapp.com",
        projectId: "sample-firebase-ai-app-be9db",
        storageBucket: "sample-firebase-ai-app-be9db.firebasestorage.app",
        messagingSenderId: "301656458329",
        appId: "1:301656458329:web:fbc1fd553ca2912b9c9d48"
    };



const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);