import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"

import './index.css'
import App from './App.jsx'

import {FestivalProvider} from "./contexts/FestivalContext.jsx"
import {TicketProvider} from "./contexts/TicketContext.jsx"
import {AuthProvider} from "./contexts/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
<StrictMode>

<BrowserRouter>

<AuthProvider>

<FestivalProvider>

<TicketProvider>

<App/>

</TicketProvider>

</FestivalProvider>

</AuthProvider>

</BrowserRouter>

</StrictMode>
)