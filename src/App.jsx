import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPassword from './Auth/ForgotPassword.jsx'
import Login from './Auth/Login.jsx'
import Register from './Auth/Register.jsx'
import AIChatBooking from './Player/AIChatBooking.jsx'
import CommunityFeed from './Player/CommunityFeed.jsx'
import CourtDetails from './Player/CourtDetails.jsx'
import Dashboard from './Player/Dashboard.jsx'
import LiveQRPass from './Player/LiveQRPass.jsx'
import MapBooking from './Player/MapBooking.jsx'
import OnBoarding from './Player/OnBoarding.jsx'
import PlayerDashboard from './Player/PlayerDashboard.jsx'
import PlayerProfile from './Player/PlayerProfile.jsx'
import Tournament from './Player/Tournament.jsx'
import Wallet from './Player/Wallet.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/player-dashboard" element={<PlayerDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-chat" element={<AIChatBooking />} />
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/court" element={<CourtDetails />} />
        <Route path="/court-finder" element={<MapBooking />} />
        <Route path="/qr-pass" element={<LiveQRPass />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<PlayerProfile />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
