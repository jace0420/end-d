import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'rpg-awesome/css/rpg-awesome.min.css' // <--- ADD THIS LINE
import './index.css' // (This file should be empty per previous instructions, but keep the line)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)