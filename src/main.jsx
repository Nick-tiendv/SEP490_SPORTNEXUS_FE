import { AuthProvider } from './context/AuthContext.jsx'
import ToastProvider from './components/common/ToastProvider.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './styles/tailwind.css'
import './index.css'
import './styles/app-shell.css'
import './styles/ui-kit.css'
import App from './App.jsx'

// Bản đồ tìm sân dùng window.L (trước đây nạp Leaflet từ CDN unpkg).
window.L = L

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider />
      <App />
    </AuthProvider>
  </StrictMode>,
)
