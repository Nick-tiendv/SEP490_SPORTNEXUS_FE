import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSport } from '../Context/sportContext.js'
import NotificationBell from './NotificationBell.jsx'
import { getWallet } from '../../api/player/walletApi.js'
import { logoutApi } from '../../api/player/profileApi.js'
import { useAuth } from '../../context/authContext.js'
import { useCurrentUser } from '../../hooks/useCurrentUser.js'
import { AppTopbar, UserMenu } from '../../components/layout/AppShell.jsx'

// Tên trang hiển thị trên thanh trên (đường dẫn "Người chơi › Tên trang")
const PAGE_TITLES = {
  '/dashboard': 'Trang chủ',
  '/court-finder': 'Đặt sân',
  '/court': 'Chi tiết sân',
  '/split-payment': 'Thanh toán đặt sân',
  '/ai-chat': 'Trợ lý AI đặt sân',
  '/community': 'Ghép trận LFG',
  '/feed': 'Cộng đồng',
  '/create-match': 'Tạo kèo mới',
  '/flash-claim': 'Nhận suất nhanh',
  '/qr-pass': 'Vé check-in QR',
  '/check-in': 'Vé check-in QR',
  '/live-qr': 'Vé check-in QR',
  '/post-match-rating': 'Đánh giá sau trận',
  '/tournament': 'Giải đấu & Đội',
  '/wallet': 'Ví Escrow',
  '/wallet/deposit-success': 'Nạp tiền thành công',
  '/wallet/deposit-cancel': 'Đã hủy nạp tiền',
  '/profile': 'Hồ sơ cá nhân',
}
// Các trang có lọc theo môn thể thao (hiện nhãn môn đang lọc cạnh tên trang)
const SPORT_FILTER_PAGES = ['/dashboard', '/court-finder', '/community']

function TopBar({ onMenu }) {
  const currentUser = useCurrentUser()
  const { logout } = useAuth()
  const { pathname } = useLocation()
  const { selectedSports, isAllActive, SPORTS_LIST = [] } = useSport()
  const activeSportsList = SPORTS_LIST.filter((s) => selectedSports?.includes(s.key))
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 0
  })

  useEffect(() => {
    // Đồng bộ số dư thực tế từ Backend API
    getWallet()
      .then((w) => {
        if (w && typeof w.balance === 'number') setWalletBalance(w.balance)
      })
      .catch(() => {})
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  const handleLogout = () => {
    logoutApi().catch(() => {})
    logout()
  }

  const sportLabel = isAllActive
    ? 'Tất cả môn'
    : activeSportsList.length === 1
    ? `${activeSportsList[0].emoji} ${activeSportsList[0].label}`
    : `${activeSportsList.length} môn đang lọc`

  return (
    <AppTopbar
      onMenu={onMenu}
      rootLabel="Người chơi"
      rootTo="/dashboard"
      title={PAGE_TITLES[pathname] || 'SportNexus'}
      actions={(
        <>
          <Link to="/wallet" className="snx-pill" title="Ví Escrow · Nạp tiền">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>
              <span className="snx-pill-label">Ví Escrow</span>
              <span className="snx-pill-value">{new Intl.NumberFormat('vi-VN').format(walletBalance)} đ</span>
            </span>
          </Link>
          <NotificationBell />
          <UserMenu
            name={currentUser.name || 'Người chơi'}
            subtitle={currentUser.fairPlayScore != null ? `Fair Play ${currentUser.fairPlayScore}` : 'Người chơi'}
            avatarUrl={currentUser.avatarUrl}
            profileTo="/profile"
            onLogout={handleLogout}
          />
        </>
      )}
    >
      {SPORT_FILTER_PAGES.includes(pathname) && <span className="snx-crumb-chip snx-hide-sm">{sportLabel}</span>}
    </AppTopbar>
  )
}

export default TopBar
