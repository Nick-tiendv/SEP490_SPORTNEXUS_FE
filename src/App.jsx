import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './Auth/ProtectedRoute.jsx'
import { useAuth } from './context/authContext.js'
import { roleDestination } from './Auth/roleRoutes.js'

// Authentication
import ForgotPassword from './Auth/ForgotPassword.jsx'
import Login from './Auth/Login.jsx'
import Register from './Auth/Register.jsx'
import ResetPassword from './Auth/ResetPassword.jsx'
import VerifyAccount from './Auth/VerifyAccount.jsx'

// Player pages
import AIChatBooking from './Player/Booking/AIChat/AIChatBooking.jsx'
import CommunityFeed from './Player/LFG/CommunityFeed.jsx'
import CommunityPage from './Player/Community/CommunityPage.jsx'
import CourtDetails from './Player/Booking/CourtDetail/CourtDetails.jsx'
import CreateMatch from './Player/LFG/CreateMatch.jsx'
import Dashboard from './Player/Home/Dashboard.jsx'
import FlashClaim from './Player/LFG/FlashClaim.jsx'
import LiveQRPass from './Player/CheckIn/LiveQRPass.jsx'
import CheckInQR from './Player/CheckIn/CheckInQR.jsx'
import MapBooking from './Player/Booking/FindCourt/MapBooking.jsx'
import OnBoarding from './Player/Profile/OnBoarding.jsx'
import PlayerLayout from './Player/Layout/PlayerLayout.jsx'
import PostMatchRating from './Player/Rating/PostMatchRating.jsx'
import Profile from './Player/Profile/Profile.jsx'
import SplitPayment from './Player/Booking/Payment/SplitPayment.jsx'
import TournamentList from './Player/Tournament/TournamentList.jsx'
import WalletEscrow from './Player/Wallet/WalletEscrow.jsx'
import DepositSuccess from './Player/Wallet/DepositSuccess.jsx'
import DepositCancel from './Player/Wallet/DepositCancel.jsx'

// Admin pages
import AdminLayout from './Admin/Layout/AdminLayout.jsx'
import AdminDashboard from './Admin/Dashboard/AdminDashboard.jsx'
import UserManagement from './Admin/Users/UserManagement.jsx'
import CourtOwnerManagement from './Admin/CourtOwners/CourtOwnerManagement.jsx'
import FacilityManagement from './Admin/Facilities/FacilityManagement.jsx'
import BookingManagement from './Admin/Bookings/BookingManagement.jsx'
import LFGManagement from './Admin/LFG/LFGManagement.jsx'
import TournamentManagement from './Admin/Tournaments/TournamentManagement.jsx'
import PaymentManagement from './Admin/Payments/PaymentManagement.jsx'
import ReviewsReportsPage from './Admin/Reviews/ReviewsReportsPage.jsx'
import NotificationManagement from './Admin/Notifications/NotificationManagement.jsx'
import MasterDataManagement from './Admin/MasterData/MasterDataManagement.jsx'
import SystemSettings from './Admin/Settings/SystemSettings.jsx'

// Court Owner pages
import CourtOwnerLayout from './CourtOwner/Layout/CourtOwnerLayout.jsx'
import CourtOwnerDashboard from './CourtOwner/Dashboard/Dashboard.jsx'
import CourtOwnerProfile from './CourtOwner/Profile/Profile.jsx'
import CourtManage from './CourtOwner/Courts/CourtManage.jsx'
import CheckQR from './CourtOwner/CheckIn/CheckQR.jsx'
import ViewCourtBookingSchedule from './CourtOwner/Schedule/BookingSchedule.jsx'
import CreateAutomatedTournament from './CourtOwner/Tournament/CreateTournament.jsx'
import Settlement from './CourtOwner/Settlement/Settlement.jsx'

// Redirect users to the appropriate homepage based on their role
function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  return <Navigate replace to={isAuthenticated ? roleDestination(role) || '/login' : '/login'} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* Onboarding */}

        {/* Protected Player application */}
        <Route element={<ProtectedRoute destination="/dashboard" requiredRole="Player" />}>
          <Route path="/onboarding" element={<OnBoarding />} />
          <Route element={<PlayerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<WalletEscrow />} />
            {/* PayOS returnUrl / cancelUrl (BE cấu hình PayOS__ReturnUrl / PayOS__CancelUrl) */}
            <Route path="/wallet/deposit-success" element={<DepositSuccess />} />
            <Route path="/wallet/deposit-cancel" element={<DepositCancel />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/feed" element={<CommunityPage />} />
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
        </Route>

        {/* Protected Admin application */}
        <Route element={<ProtectedRoute destination="/admin/dashboard" requiredRole="Admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate replace to="/admin/dashboard" />}
            />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="court-owners" element={<CourtOwnerManagement />} />
            <Route path="facilities" element={<FacilityManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="lfg" element={<LFGManagement />} />
            <Route path="tournaments" element={<TournamentManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="reviews-reports" element={<ReviewsReportsPage />} />
            <Route path="master-data" element={<MasterDataManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
        </Route>

        {/* Protected Court Owner application */}
        <Route element={<ProtectedRoute destination="/owner/dashboard" />}>
          <Route path="/owner" element={<CourtOwnerLayout />}>
            <Route
              index
              element={<Navigate replace to="/owner/dashboard" />}
            />
            <Route path="dashboard" element={<CourtOwnerDashboard />} />
            <Route path="profile" element={<CourtOwnerProfile />} />
            <Route path="courts" element={<CourtManage />} />
            <Route path="court-manage" element={<CourtManage />} />
            <Route path="check-qr" element={<CheckQR />} />
            <Route
              path="schedule"
              element={<ViewCourtBookingSchedule />}
            />
            <Route
              path="view-schedule"
              element={<ViewCourtBookingSchedule />}
            />
            <Route
              path="tournament"
              element={<CreateAutomatedTournament />}
            />
            <Route
              path="create-tournament"
              element={<CreateAutomatedTournament />}
            />
            <Route path="settlement" element={<Settlement />} />
          </Route>
        </Route>

        {/* Court Owner aliases */}
        <Route
          path="/owner-dashboard"
          element={<Navigate replace to="/owner/dashboard" />}
        />
        <Route
          path="/owner-profile"
          element={<Navigate replace to="/owner/profile" />}
        />
        <Route
          path="/court-manage"
          element={<Navigate replace to="/owner/courts" />}
        />
        <Route
          path="/owner-qr"
          element={<Navigate replace to="/owner/check-qr" />}
        />
        <Route
          path="/owner-schedule"
          element={<Navigate replace to="/owner/schedule" />}
        />
        <Route
          path="/owner-tournament"
          element={<Navigate replace to="/owner/tournament" />}
        />
        <Route
          path="/owner-settlement"
          element={<Navigate replace to="/owner/settlement" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
