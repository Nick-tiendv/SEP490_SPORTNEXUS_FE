import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPassword from './Auth/ForgotPassword.jsx'
import Login from './Auth/Login.jsx'
import Register from './Auth/Register.jsx'
import AIChatBooking from './Player/AIChatBooking.jsx'
import CommunityFeed from './Player/CommunityFeed.jsx'
import CourtDetails from './Player/CourtDetails.jsx'
import CreateMatch from './Player/CreateMatch.jsx'
import Dashboard from './Player/Dashboard.jsx'
import FlashClaim from './Player/FlashClaim.jsx'
import LiveQRPass from './Player/LiveQRPass.jsx'
import MapBooking from './Player/MapBooking.jsx'
import OnBoarding from './Player/OnBoarding.jsx'
import PlayerLayout from './Player/PlayerLayout.jsx'
import PostMatchRating from './Player/PostMatchRating.jsx'
import Profile from './Player/Profile.jsx'
import SplitPayment from './Player/SplitPayment.jsx'
import TournamentList from './Player/TournamentList.jsx'
import Wallet from './Player/Wallet.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnBoarding />} />

        {/* Player app — all wrapped in a single shared layout */}
        <Route element={<PlayerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/tournament" element={<TournamentList />} />
          <Route path="/court-finder" element={<MapBooking />} />
          <Route path="/court" element={<CourtDetails />} />
          <Route path="/ai-chat" element={<AIChatBooking />} />
          <Route path="/qr-pass" element={<LiveQRPass />} />
          <Route path="/flash-claim" element={<FlashClaim />} />
          <Route path="/create-match" element={<CreateMatch />} />
          <Route path="/split-payment" element={<SplitPayment />} />
          <Route path="/post-match-rating" element={<PostMatchRating />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
