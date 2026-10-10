import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ForgotPassword from './Auth/ForgotPassword.jsx'
import Login from './Auth/Login.jsx'
import Register from './Auth/Register.jsx'
import ResetPassword from './Auth/ResetPassword.jsx'
import VerifyAccount from './Auth/VerifyAccount.jsx'
import AIChatBooking from './Player/Book a court/AIChatBooking.jsx'
import CommunityFeed from './Player/Looking for group/CommunityFeed.jsx'
import CourtDetails from './Player/Book a court/CourtDetails.jsx'
import CreateMatch from './Player/Looking for group/CreateMatch.jsx'
import Dashboard from './Player/Layout/Dashboard.jsx'
import FlashClaim from './Player/Looking for group/FlashClaim.jsx'
import LiveQRPass from './Player/In-stadium experience/LiveQRPass.jsx'
import CheckInQR from './Player/Check-in/Check-in QR.jsx'
import MapBooking from './Player/Book a court/MapBooking.jsx'
import OnBoarding from './Player/Initialization & Profile/OnBoarding.jsx'
import PlayerLayout from './Player/Layout/PlayerLayout.jsx'
import PostMatchRating from './Player/In-stadium experience/PostMatchRating.jsx'
import Profile from './Player/Initialization & Profile/Profile.jsx'
import SplitPayment from './Player/Book a court/SplitPayment.jsx'
import TournamentList from './Player/Finance & Events/TournamentList.jsx'
import WalletEscrow from './Player/Wallet/WalletEscrow.jsx'

// Court Owner Pages & Layout
import CourtOwnerLayout from './Court Owner/CourtOwnerLayout.jsx'
import CourtOwnerDashboard from './Court Owner/Dashboard.jsx'
import CourtOwnerProfile from './Court Owner/Profile.jsx'
import CourtManage from './Court Owner/Court Manage.jsx'
import CheckQR from './Court Owner/Check QR.jsx'
import ViewCourtBookingSchedule from './Court Owner/View Court Booking Schedule.jsx'
import CreateAutomatedTournament from './Court Owner/Create Automated Tournament.jsx'
import Settlement from './Court Owner/Settlement.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnBoarding />} />

        {/* Player app — all wrapped in a single shared layout */}
        <Route element={<PlayerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<WalletEscrow />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/tournament" element={<TournamentList />} />
          <Route path="/court-finder" element={<MapBooking />} />
          <Route path="/court" element={<CourtDetails />} />
          <Route path="/ai-chat" element={<AIChatBooking />} />
          <Route path="/qr-pass" element={<CheckInQR />} />
          <Route path="/check-in" element={<CheckInQR />} />
          <Route path="/live-qr" element={<LiveQRPass />} />
          <Route path="/flash-claim" element={<FlashClaim />} />
          <Route path="/create-match" element={<CreateMatch />} />
          <Route path="/split-payment" element={<SplitPayment />} />
          <Route path="/post-match-rating" element={<PostMatchRating />} />
        </Route>

        {/* Court Owner App — wrapped in CourtOwnerLayout */}
        <Route path="/owner" element={<CourtOwnerLayout />}>
          <Route index element={<Navigate replace to="/owner/dashboard" />} />
          <Route path="dashboard" element={<CourtOwnerDashboard />} />
          <Route path="profile" element={<CourtOwnerProfile />} />
          <Route path="courts" element={<CourtManage />} />
          <Route path="court-manage" element={<CourtManage />} />
          <Route path="check-qr" element={<CheckQR />} />
          <Route path="schedule" element={<ViewCourtBookingSchedule />} />
          <Route path="view-schedule" element={<ViewCourtBookingSchedule />} />
          <Route path="tournament" element={<CreateAutomatedTournament />} />
          <Route path="create-tournament" element={<CreateAutomatedTournament />} />
          <Route path="settlement" element={<Settlement />} />
        </Route>

        {/* Direct aliases for convenience */}
        <Route path="/owner-dashboard" element={<Navigate replace to="/owner/dashboard" />} />
        <Route path="/owner-profile" element={<Navigate replace to="/owner/profile" />} />
        <Route path="/court-manage" element={<Navigate replace to="/owner/courts" />} />
        <Route path="/owner-qr" element={<Navigate replace to="/owner/check-qr" />} />
        <Route path="/owner-schedule" element={<Navigate replace to="/owner/schedule" />} />
        <Route path="/owner-tournament" element={<Navigate replace to="/owner/tournament" />} />
        <Route path="/owner-settlement" element={<Navigate replace to="/owner/settlement" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
