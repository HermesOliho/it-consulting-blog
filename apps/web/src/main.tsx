import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css' // styles globaux
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter doit entourer App : sans lui, <Routes> dans App.tsx plante */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)