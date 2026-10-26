import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { getMyFacilities, getMyProfile, getMyWallet } from '../../api/owner'
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
  { label: 'Trang Chủ', path: '/owner/dashboard', icon: 'home', desc: 'Tổng quan vận hành cơ sở' },
  { label: 'Quản Lý Cụm Sân', path: '/owner/courts', icon: 'domain', desc: 'Cụm phức hợp & Định giá động' },
  { label: 'Quét QR Check-in', path: '/owner/check-qr', icon: 'qr_code_scanner', desc: 'Xác nhận & Giải ngân' },
  { label: 'Lịch Đặt Sân Tích Hợp', path: '/owner/schedule', icon: 'calendar_month', desc: 'Lưới lịch đa bộ môn' },
  { label: 'Giải Đấu Tự Động', path: '/owner/tournament', icon: 'emoji_events', desc: 'Tự bốc thăm & Sơ đồ nhánh đấu' },
  { label: 'Báo Cáo & Rút Tiền', path: '/owner/settlement', icon: 'account_balance_wallet', desc: 'Doanh thu & Quyết toán' },
]

export default function CourtOwnerLayout() {
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [facilityId, setFacilityId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [hoveredNav, setHoveredNav] = useState(null)

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


  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} className="sport-animated-bg">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Court Owner Sidebar (Drawer on mobile, fixed on desktop) */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 252, 246, 0.94) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(45, 95, 63, 0.12)',
          boxShadow: '4px 0 28px rgba(45, 95, 63, 0.06)',
        }}
      >
        {/* Brand Logo Header — Bấm vào tự động về Trang Chủ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 14px 18px',
            borderBottom: '1px solid rgba(45, 95, 63, 0.08)',
          }}
        >
          <Link
            to="/owner/dashboard"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
            className="group cursor-pointer"
            title="Về Trang Chủ Chủ Sân"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(45, 95, 63, 0.28)',
              }}
              className="group-hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>
                bolt
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '17px',
                    color: '#1C3524',
                    letterSpacing: '-0.4px',
                  }}
                >
                  SportNexus
                </span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  color: '#2D5F3F',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  fontWeight: 700,
                  opacity: 0.9,
                  whiteSpace: 'nowrap',
                }}
              >
                Hệ Thống Quản Trị Chủ Sân
              </span>
            </div>
          </Link>

          {/* Nút đóng sidebar trên điện thoại */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Đóng menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Operating Facility Box */}
        <div style={{ padding: '12px 14px 6px 14px' }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EAF7EE 0%, #E0F5E6 100%)',
              border: '1px solid rgba(45, 95, 63, 0.16)',
            }}
          >
            <div style={{ fontSize: '10px', color: '#15803D', fontWeight: 800, textTransform: 'uppercase' }}>
              CƠ SỞ ĐANG QUẢN LÝ
            </div>
            {facilities.length > 1 ? (
              <select
                value={facilityId}
                onChange={(e) => selectFacility(e.target.value)}
                title="Đổi cơ sở đang quản lý"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '4px 6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(45, 95, 63, 0.25)',
                  background: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#1C3524',
                  cursor: 'pointer',
                }}
              >
                {facilities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}{item.approvalStatus === 'PENDING' ? ' (Chờ duyệt)' : item.approvalStatus === 'REJECTED' ? ' (Bị từ chối)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#1C3524',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {loading ? 'Đang tải...' : facility?.name || 'Chưa có cơ sở'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '11px', color: '#047857' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: facility?.activeCourtCount ? '#10B981' : '#9CA3AF' }} />
              {facility ? `${facility.sportCount} Khu Vực • ${facility.activeCourtCount}/${facility.courtCount} Sân Hoạt Động` : '0 Sân'}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ padding: '4px 10px', fontSize: '10.5px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
            Chức Năng Quản Trị
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const isHovered = hoveredNav === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                // Đóng sidebar khi chọn trang trên điện thoại
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => setHoveredNav(item.path)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.18s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)'
                    : isHovered
                    ? '#F0FDF4'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : isHovered ? '#15803D' : '#374151',
                  boxShadow: isActive ? '0 3px 12px rgba(45, 95, 63, 0.25)' : 'none',
                  transform: isHovered && !isActive ? 'translateX(3px)' : 'none',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '22px',
                    color: isActive ? '#FFFFFF' : isHovered ? '#15803D' : '#4B5563',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 800 : 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '10.5px',
                      opacity: isActive ? 0.9 : 0.65,
                      fontWeight: 500,
                      marginTop: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>

                {isActive && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#A7F3D0',
                      flexShrink: 0,
                    }}
                  />
                )}
              </NavLink>
            )
          })}
        </div>

      </aside>

      {/* Main Area Offset by 260px on desktop, 0 on mobile */}
      <div className="app-main-content-wrapper">
        {/* Fixed Topbar matching Player TopBar layout */}
        <header className="app-topbar">
          {/* Hamburger Menu Toggle on Mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#2D5F3F]/20 text-[#1C3524] shadow-xs shrink-0 active:scale-95 transition-transform"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Breadcrumb & Facility Status (Left side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#2D5F3F', flexShrink: 0 }}>
              home
            </span>
            <Link
              to="/owner/dashboard"
              style={{
                fontSize: '13px',
                color: '#4B5563',
                textDecoration: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Chủ Sân SportNexus
            </Link>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>›</span>
            <span style={{ fontSize: '13.5px', color: '#1C3524', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pageInfo.title}
            </span>

            {/* Live Facility Active Badge - Hidden on small mobile */}
            <div
              className="hidden md:inline-flex"
              style={{
                marginLeft: '12px',
                alignItems: 'center',
                gap: '6px',
                background: '#DCFCE7',
                border: '1px solid rgba(45, 95, 63, 0.2)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#15803D',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '11px' }}>{facility?.activeCourtCount ? '🟢' : '⚪'}</span>
              <span>{facility ? `${facility.activeCourtCount}/${facility.courtCount}` : '0/0'} Sân Đang Phục Vụ</span>
            </div>
          </div>

          {/* Right Controls: Available Wallet + Pending Escrow + Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Realtime Available Balance Wallet Pill */}
            <Link
              to="/owner/settlement"
              title="Xem Báo cáo Doanh thu & Rút tiền"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #EAF7EE 0%, #E0F5E6 100%)',
                borderRadius: '20px',
                padding: '5px 12px',
                border: '1px solid rgba(45, 95, 63, 0.2)',
                boxShadow: '0 2px 6px rgba(45, 95, 63, 0.05)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                account_balance_wallet
              </span>
              <div>
                <div className="hidden sm:block" style={{ fontSize: '9px', color: '#15803D', fontWeight: 800, textTransform: 'uppercase' }}>
                  Số Dư Khả Dụng
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1C3524', whiteSpace: 'nowrap' }}>
                  {formatVND(wallet?.availableBalance ?? wallet?.balance)}
                </div>
              </div>
            </Link>

            {/* Pending Escrow Pill - hidden on small mobile */}
            <div
              className="hidden md:flex"
              style={{
                alignItems: 'center',
                gap: '6px',
                background: '#FEF3C7',
                borderRadius: '20px',
                padding: '5px 10px',
                border: '1px solid #F59E0B',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#B45309' }}>
                lock_clock
              </span>
              <div>
                <div style={{ fontSize: '9px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>
                  Đang Tạm Giữ
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#78350F' }}>
                  {formatVND(wallet?.frozenBalance)}
                </div>
              </div>
            </div>

            {/* Owner Avatar & Name — Clickable to Profile */}
            <Link
              to="/owner/profile"
              title="Xem & Chỉnh sửa Hồ sơ cá nhân"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '8px',
                borderLeft: '1px solid rgba(45, 95, 63, 0.15)',
                textDecoration: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                padding: '4px 6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(45, 95, 63, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '2px solid #10B981',
                    objectFit: 'cover',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '2px solid #10B981',
                    background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {displayName.trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C3524', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 700 }}>
                  Chủ Cơ Sở
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ width: '100%', paddingTop: '60px', minHeight: '100vh' }}>
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
