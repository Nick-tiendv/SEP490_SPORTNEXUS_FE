import { AuthProvider } from './context/AuthContext.jsx'
import ToastProvider from './components/common/ToastProvider.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider />
      <App />
    </AuthProvider>
  </StrictMode>,
)
