import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import ProtectedRoute from './Auth/ProtectedRoute.jsx'
import { useAuth } from './context/authContext.js'
import { roleDestination } from './Auth/roleRoutes.js'

// Authentication
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword.jsx'))
import Login from './Auth/Login.jsx'
const Register = lazy(() => import('./Auth/Register.jsx'))
const ResetPassword = lazy(() => import('./Auth/ResetPassword.jsx'))
const VerifyAccount = lazy(() => import('./Auth/VerifyAccount.jsx'))

// Player pages
const AIChatBooking = lazy(() => import('./Player/Booking/AIChat/AIChatBooking.jsx'))
const CommunityFeed = lazy(() => import('./Player/LFG/CommunityFeed.jsx'))
const CommunityPage = lazy(() => import('./Player/Community/CommunityPage.jsx'))
const CourtDetails = lazy(() => import('./Player/Booking/CourtDetail/CourtDetails.jsx'))
const CreateMatch = lazy(() => import('./Player/LFG/CreateMatch.jsx'))
const Dashboard = lazy(() => import('./Player/Home/Dashboard.jsx'))
const FlashClaim = lazy(() => import('./Player/LFG/FlashClaim.jsx'))
const CheckInQR = lazy(() => import('./Player/CheckIn/CheckInQR.jsx'))
const MapBooking = lazy(() => import('./Player/Booking/FindCourt/MapBooking.jsx'))
const OnBoarding = lazy(() => import('./Player/Profile/OnBoarding.jsx'))
import PlayerLayout from './Player/Layout/PlayerLayout.jsx'
const PostMatchRating = lazy(() => import('./Player/Rating/PostMatchRating.jsx'))
const Profile = lazy(() => import('./Player/Profile/Profile.jsx'))
const SplitPayment = lazy(() => import('./Player/Booking/Payment/SplitPayment.jsx'))
const TournamentList = lazy(() => import('./Player/Tournament/TournamentList.jsx'))
const WalletEscrow = lazy(() => import('./Player/Wallet/WalletEscrow.jsx'))
const DepositSuccess = lazy(() => import('./Player/Wallet/DepositSuccess.jsx'))
const DepositCancel = lazy(() => import('./Player/Wallet/DepositCancel.jsx'))

// Admin pages
import AdminLayout from './Admin/Layout/AdminLayout.jsx'
const AdminDashboard = lazy(() => import('./Admin/Dashboard/AdminDashboard.jsx'))
const UserManagement = lazy(() => import('./Admin/Users/UserManagement.jsx'))
const CourtOwnerManagement = lazy(() => import('./Admin/CourtOwners/CourtOwnerManagement.jsx'))
const FacilityManagement = lazy(() => import('./Admin/Facilities/FacilityManagement.jsx'))
const BookingManagement = lazy(() => import('./Admin/Bookings/BookingManagement.jsx'))
const LFGManagement = lazy(() => import('./Admin/LFG/LFGManagement.jsx'))
const TournamentManagement = lazy(() => import('./Admin/Tournaments/TournamentManagement.jsx'))
const TeamManagement = lazy(() => import('./Admin/Teams/TeamManagement.jsx'))
const PromotionManagement = lazy(() => import('./Admin/Promotions/PromotionManagement.jsx'))
const PaymentManagement = lazy(() => import('./Admin/Payments/PaymentManagement.jsx'))
const ReviewsReportsPage = lazy(() => import('./Admin/Reviews/ReviewsReportsPage.jsx'))
const NotificationManagement = lazy(() => import('./Admin/Notifications/NotificationManagement.jsx'))
const MasterDataManagement = lazy(() => import('./Admin/MasterData/MasterDataManagement.jsx'))
const SystemSettings = lazy(() => import('./Admin/Settings/SystemSettings.jsx'))

// Court Owner pages
import CourtOwnerLayout from './CourtOwner/Layout/CourtOwnerLayout.jsx'
const CourtOwnerDashboard = lazy(() => import('./CourtOwner/Dashboard/Dashboard.jsx'))
const CourtOwnerProfile = lazy(() => import('./CourtOwner/Profile/Profile.jsx'))
const CourtManage = lazy(() => import('./CourtOwner/Courts/CourtManage.jsx'))
const CheckQR = lazy(() => import('./CourtOwner/CheckIn/CheckQR.jsx'))
const ViewCourtBookingSchedule = lazy(() => import('./CourtOwner/Schedule/BookingSchedule.jsx'))
const CreateAutomatedTournament = lazy(() => import('./CourtOwner/Tournament/CreateTournament.jsx'))
const Settlement = lazy(() => import('./CourtOwner/Settlement/Settlement.jsx'))
const OwnerFacilities = lazy(() => import('./CourtOwner/Facilities/OwnerFacilities.jsx'))
const OwnerSlots = lazy(() => import('./CourtOwner/Slots/OwnerSlots.jsx'))
const OwnerBookings = lazy(() => import('./CourtOwner/Bookings/OwnerBookings.jsx'))
const OwnerReviews = lazy(() => import('./CourtOwner/Reviews/OwnerReviews.jsx'))
const OwnerReports = lazy(() => import('./CourtOwner/Reports/OwnerReports.jsx'))
const OwnerPromotions = lazy(() => import('./CourtOwner/Promotions/OwnerPromotions.jsx'))

// Mỗi trang tải riêng (React.lazy) và có ErrorBoundary riêng: 1 trang lỗi không làm trắng cả app,
// layout (sidebar, topbar) vẫn giữ nguyên trong lúc tải trang.
function PageLoader() {
  return (
    <div role="status" aria-live="polite" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh', color: '#6b7a75', font: '500 14px Inter, sans-serif' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>progress_activity</span>
      Đang tải trang…
    </div>
  )
}
function Page({ children }) {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

// Chuyển hướng giữ nguyên query (?bookingId=…, ?cardId=…)
function RedirectWithQuery({ to }) {
  const { search } = useLocation()
  return <Navigate replace to={`${to}${search}`} />
}

// Redirect users to the appropriate homepage based on their role
function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  return <Navigate replace to={isAuthenticated ? roleDestination(role) || '/login' : '/login'} />
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
        <Route path="/verify-account" element={<Page><VerifyAccount /></Page>} />
        <Route path="/reset-password" element={<Page><ResetPassword /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />

        {/* Onboarding */}

        {/* Protected Player application */}
        <Route element={<ProtectedRoute destination="/dashboard" requiredRole="Player" />}>
          <Route path="/onboarding" element={<Page><OnBoarding /></Page>} />
          <Route element={<PlayerLayout />}>
            <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
            <Route path="/profile" element={<Page><Profile /></Page>} />
            <Route path="/wallet" element={<Page><WalletEscrow /></Page>} />
            {/* PayOS returnUrl / cancelUrl (BE cấu hình PayOS__ReturnUrl / PayOS__CancelUrl) */}
            <Route path="/wallet/deposit-success" element={<Page><DepositSuccess /></Page>} />
            <Route path="/wallet/deposit-cancel" element={<Page><DepositCancel /></Page>} />
            <Route path="/community" element={<Page><CommunityFeed /></Page>} />
            <Route path="/feed" element={<Page><CommunityPage /></Page>} />
            <Route path="/tournament" element={<Page><TournamentList /></Page>} />
            <Route path="/court-finder" element={<Page><MapBooking /></Page>} />
            <Route path="/court" element={<Page><CourtDetails /></Page>} />
            <Route path="/ai-chat" element={<Page><AIChatBooking /></Page>} />
            <Route path="/qr-pass" element={<Page><CheckInQR /></Page>} />
            <Route path="/check-in" element={<Page><CheckInQR /></Page>} />
            {/* Trang vé cũ (dữ liệu mẫu) đã gộp vào /qr-pass */}
            <Route path="/live-qr" element={<RedirectWithQuery to="/qr-pass" />} />
            <Route path="/flash-claim" element={<Page><FlashClaim /></Page>} />
            <Route path="/create-match" element={<Page><CreateMatch /></Page>} />
            <Route path="/split-payment" element={<Page><SplitPayment /></Page>} />
            <Route path="/post-match-rating" element={<Page><PostMatchRating /></Page>} />
          </Route>
        </Route>

        {/* Protected Admin application */}
        <Route element={<ProtectedRoute destination="/admin/dashboard" requiredRole="Admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate replace to="/admin/dashboard" />}
            />
            <Route path="dashboard" element={<Page><AdminDashboard /></Page>} />
            <Route path="users" element={<Page><UserManagement /></Page>} />
            <Route path="court-owners" element={<Page><CourtOwnerManagement /></Page>} />
            <Route path="teams" element={<Page><TeamManagement /></Page>} />
            <Route path="promotions" element={<Page><PromotionManagement /></Page>} />
            <Route path="facilities" element={<Page><FacilityManagement /></Page>} />
            <Route path="bookings" element={<Page><BookingManagement /></Page>} />
            <Route path="lfg" element={<Page><LFGManagement /></Page>} />
            <Route path="tournaments" element={<Page><TournamentManagement /></Page>} />
            <Route path="payments" element={<Page><PaymentManagement /></Page>} />
            <Route path="reviews-reports" element={<Page><ReviewsReportsPage /></Page>} />
            <Route path="master-data" element={<Page><MasterDataManagement /></Page>} />
            <Route path="notifications" element={<Page><NotificationManagement /></Page>} />
            <Route path="settings" element={<Page><SystemSettings /></Page>} />
          </Route>
        </Route>

        {/* Protected Court Owner application */}
        <Route element={<ProtectedRoute destination="/owner/dashboard" />}>
          <Route path="/owner" element={<CourtOwnerLayout />}>
            <Route
              index
              element={<Navigate replace to="/owner/dashboard" />}
            />
            <Route path="dashboard" element={<Page><CourtOwnerDashboard /></Page>} />
            <Route path="profile" element={<Page><CourtOwnerProfile /></Page>} />
            <Route path="facilities" element={<Page><OwnerFacilities /></Page>} />
            <Route path="slots" element={<Page><OwnerSlots /></Page>} />
            <Route path="bookings" element={<Page><OwnerBookings /></Page>} />
            <Route path="reviews" element={<Page><OwnerReviews /></Page>} />
            <Route path="reports" element={<Page><OwnerReports /></Page>} />
            <Route path="promotions" element={<Page><OwnerPromotions /></Page>} />
            <Route path="courts" element={<Page><CourtManage /></Page>} />
            <Route path="court-manage" element={<Page><CourtManage /></Page>} />
            <Route path="check-qr" element={<Page><CheckQR /></Page>} />
            <Route
              path="schedule"
              element={<Page><ViewCourtBookingSchedule /></Page>}
            />
            <Route
              path="view-schedule"
              element={<Page><ViewCourtBookingSchedule /></Page>}
            />
            <Route
              path="tournament"
              element={<Page><CreateAutomatedTournament /></Page>}
            />
            <Route
              path="create-tournament"
              element={<Page><CreateAutomatedTournament /></Page>}
            />
            <Route path="settlement" element={<Page><Settlement /></Page>} />
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
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
