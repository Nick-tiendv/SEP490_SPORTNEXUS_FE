import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { getMyFacilities, getMyProfile, getMyWallet, logout as logoutApi } from '../../api/owner'
import { useAuth } from '../../context/authContext.js'
import { AppFooter, AppSidebar, AppTopbar, SidebarNav, UserMenu } from '../../components/layout/AppShell.jsx'
import NotificationBell from '../../Player/Layout/NotificationBell.jsx'
import { FACILITY_STORAGE_KEY } from './ownerContext.js'

const toFacilitySummary = (raw) => {
  const courts = Array.isArray(raw.courts) ? raw.courts : []
  return {
    id: String(raw.id),
    name: raw.name || '—',
    address: raw.address || '',
    approvalStatus: String(raw.approvalStatus || '').toUpperCase(),
    isLocked: raw.isLocked === true,
    courtCount: courts.length,
    activeCourtCount: courts.filter((court) => String(court.status).toUpperCase() === 'ACTIVE').length,
    sportCount: new Set(courts.map((court) => court.categoryId)).size,
  }
}

const fetchFacilities = async () => (await getMyFacilities()).map(toFacilitySummary)

const readSavedFacilityId = () => {
  try { return localStorage.getItem(FACILITY_STORAGE_KEY) } catch { return null }
}

const navItems = [
  { label: 'Trang Chủ', path: '/owner/dashboard', icon: 'home', description: 'Tổng quan vận hành cơ sở' },
  { label: 'Quản Lý Cụm Sân', path: '/owner/courts', icon: 'domain', description: 'Cụm phức hợp & Định giá động' },
  { label: 'Quét QR Check-in', path: '/owner/check-qr', icon: 'qr_code_scanner', description: 'Xác nhận & Giải ngân' },
  { label: 'Lịch Đặt Sân Tích Hợp', path: '/owner/schedule', icon: 'calendar_month', description: 'Lưới lịch đa bộ môn' },
  { label: 'Giải Đấu Tự Động', path: '/owner/tournament', icon: 'emoji_events', description: 'Tự bốc thăm & Sơ đồ nhánh đấu' },
  { label: 'Báo Cáo & Rút Tiền', path: '/owner/settlement', icon: 'account_balance_wallet', description: 'Doanh thu & Quyết toán' },
]

export default function CourtOwnerLayout() {
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [facilityId, setFacilityId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { logout } = useAuth()

  const applyFacilities = useCallback((list) => {
    setFacilities(list)
    setFacilityId((current) => {
      if (list.some((item) => item.id === current)) return current
      const saved = readSavedFacilityId()
      // Ưu tiên cơ sở đã chọn trước đó, rồi đến cơ sở đã có sân.
      return list.find((item) => item.id === saved)?.id || list.find((item) => item.courtCount > 0)?.id || list[0]?.id || ''
    })
    return list
  }, [])

  const refreshProfile = useCallback(() => getMyProfile().then((data) => { setProfile(data); return data }), [])
  const refreshWallet = useCallback(() => getMyWallet().then((data) => { setWallet(data); return data }), [])
  // Tải lại danh sách cơ sở (gồm số sân) — gọi sau khi thêm / đổi trạng thái sân.
  const refreshFacilities = useCallback(() => fetchFacilities().then(applyFacilities), [applyFacilities])

  const selectFacility = useCallback((id) => {
    setFacilityId(id)
    try { localStorage.setItem(FACILITY_STORAGE_KEY, id) } catch { /* bỏ qua */ }
  }, [])

  useEffect(() => {
    let cancelled = false
    // Hồ sơ và ví lỗi thì chỉ hiện "—", không chặn trang; lỗi danh sách cơ sở mới báo cho trang con.
    getMyProfile().then((data) => !cancelled && setProfile(data)).catch(() => {})
    getMyWallet().then((data) => !cancelled && setWallet(data)).catch(() => {})
    fetchFacilities()
      .then((list) => !cancelled && applyFacilities(list))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [applyFacilities])

  const facility = facilities.find((item) => item.id === facilityId) || null
  const outletContext = { profile, wallet, facilities, facilityId, facility, selectFacility, refreshProfile, refreshWallet, refreshFacilities, loading, error }

  const formatVND = (num) => (num === null || num === undefined ? '—' : new Intl.NumberFormat('vi-VN').format(num) + ' đ')
  const displayName = profile?.fullName || profile?.username || 'Chủ sân'

  // Xác định tiêu đề hiển thị trên header tương ứng với trang
  const getCurrentPageTitle = () => {
    if (location.pathname.includes('/owner/profile')) return { title: 'Hồ Sơ Chủ Sân & Doanh Nghiệp', sub: 'Thông tin cá nhân & Quản trị tài khoản' }
    if (location.pathname.includes('/owner/courts')) return { title: 'Quản Lý Cụm Sân Phức Hợp', sub: 'Cấu hình Lưới giờ & Định giá động' }
    if (location.pathname.includes('/owner/check-qr')) return { title: 'Quét Mã QR Check-in', sub: 'Mở khóa giải ngân Smart Escrow tức thì' }
    if (location.pathname.includes('/owner/schedule')) return { title: 'Lịch Đặt Sân Tích Hợp', sub: 'Lưới hiển thị toàn bộ 14 sân con' }
    if (location.pathname.includes('/owner/tournament')) return { title: 'Giải Đấu Tự Động', sub: 'Tự bốc thăm & Sơ đồ nhánh đấu Knockout' }
    if (location.pathname.includes('/owner/settlement')) return { title: 'Báo Cáo Doanh Thu & Quyết Toán', sub: 'Rút tiền nhanh Napas 24/7' }
    return { title: 'Trang Chủ Quản Trị Cơ Sở', sub: 'Cụm thể thao phức hợp SportNexus Arena' }
  }

  const pageInfo = getCurrentPageTitle()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMenu = useCallback(() => setMobileOpen(false), [])
  const handleLogout = () => {
    logoutApi().catch(() => {})
    logout()
  }

  return (
    <div className="sport-animated-bg" style={{ minHeight: '100vh' }}>
      <AppSidebar homeTo="/owner/dashboard" roleLabel="Chủ sân" open={mobileOpen} onClose={closeMenu}>
        {/* Cơ sở đang quản lý */}
        <div className="snx-owner-facility">
          <div className="snx-owner-facility-label">Cơ sở đang quản lý</div>
          {facilities.length > 1 ? (
            <select value={facilityId} onChange={(e) => selectFacility(e.target.value)} title="Đổi cơ sở đang quản lý">
              {facilities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}{item.approvalStatus === 'PENDING' ? ' (Chờ duyệt)' : item.approvalStatus === 'REJECTED' ? ' (Bị từ chối)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="snx-owner-facility-name">{loading ? 'Đang tải...' : facility?.name || 'Chưa có cơ sở'}</div>
          )}
          <div className="snx-owner-facility-meta">
            <span className={facility?.activeCourtCount ? 'is-on' : ''} />
            {facility ? `${facility.sportCount} khu vực • ${facility.activeCourtCount}/${facility.courtCount} sân hoạt động` : '0 sân'}
          </div>
        </div>
        <SidebarNav title="Chức năng quản trị" items={navItems} />
      </AppSidebar>

      <div className="snx-workspace">
        <AppTopbar
          onMenu={() => setMobileOpen(true)}
          rootLabel="Chủ sân"
          rootTo="/owner/dashboard"
          title={pageInfo.title}
          actions={(
            <>
              <Link to="/owner/settlement" className="snx-pill" title="Báo cáo doanh thu & rút tiền">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span><span className="snx-pill-label">Số dư khả dụng</span><span className="snx-pill-value">{formatVND(wallet?.availableBalance ?? wallet?.balance)}</span></span>
              </Link>
              <span className="snx-pill snx-pill--warning snx-hide-sm" title="Tiền đang tạm giữ">
                <span className="material-symbols-outlined">lock_clock</span>
                <span><span className="snx-pill-label">Đang tạm giữ</span><span className="snx-pill-value">{formatVND(wallet?.frozenBalance)}</span></span>
              </span>
              <NotificationBell linkable={false} />
              <UserMenu name={displayName} subtitle="Chủ cơ sở" avatarUrl={profile?.avatarUrl} profileTo="/owner/profile" onLogout={handleLogout} />
            </>
          )}
        />
        <main className="snx-main">
          <Outlet context={outletContext} />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}
