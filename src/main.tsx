import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { SesionProvider } from './lib/sesion'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </HashRouter>
  </StrictMode>,
)
