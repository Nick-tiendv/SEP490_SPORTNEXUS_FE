import { useState, useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'

const navItems = [
  { label: 'Trang Chủ', path: '/dashboard', icon: 'home' },
  { label: 'Đặt Sân', path: '/court-finder', icon: 'calendar_month' },
  { label: 'Ghép Trận LFG', path: '/community', icon: 'group' },
  { label: 'Check-in QR', path: '/qr-pass', icon: 'qr_code_scanner' },
  { label: 'Giải Đấu', path: '/tournament', icon: 'emoji_events' },
  { label: 'Nạp Ví Escrow', path: '/wallet', icon: 'account_balance_wallet' },
]

function TopSideBar() {
  const location = useLocation()
  const {
    selectedSports,
    toggleSport,
    selectAllSports,
    isSportActive,
    isAllActive,
    SPORTS_LIST,
  } = useSport()

  const [hoveredNav, setHoveredNav] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lắng nghe toggle mở/đóng sidebar trên điện thoại
  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev)
    const handleClose = () => setMobileOpen(false)
    window.addEventListener('toggle-sportnexus-sidebar', handleToggle)
    window.addEventListener('close-sportnexus-sidebar', handleClose)
    return () => {
      window.removeEventListener('toggle-sportnexus-sidebar', handleToggle)
      window.removeEventListener('close-sportnexus-sidebar', handleClose)
    }
  }, [])

  // Đóng sidebar khi người dùng chuyển trang
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Backdrop overlay khi mở trên điện thoại */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

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
        {/* Brand Logo Header - Bấm vào tự động về Trang Chủ */}
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
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
            className="group cursor-pointer"
            title="Về Trang Chủ SportNexus"
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
                {location.pathname === '/tournament' ? 'TOURNAMENT ENGINE' : 'Nền Tảng Thể Thao Đa Môn'}
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

      {/* Sport Selector Section */}
      <div style={{ padding: '16px 14px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            paddingLeft: '2px',
            paddingRight: '2px',
          }}
        >
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#4B5563',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Lọc Theo Môn
          </span>

          {/* Status Badge */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isAllActive ? '#15803D' : '#1C3524',
              background: isAllActive ? '#DCFCE7' : '#E0F2FE',
              border: `1px solid ${isAllActive ? '#86EFAC' : '#BAE6FD'}`,
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '9px' }}>
              {isAllActive
                ? '✨'
                : SPORTS_LIST.find((s) => isSportActive(s.key))?.emoji || '🏅'}
            </span>
            {isAllActive
              ? 'Tất cả 5 môn'
              : selectedSports.length === 1
              ? `Chỉ ${SPORTS_LIST.find((s) => s.key === selectedSports[0])?.label || ''}`
              : `${selectedSports.length} môn đang chọn`}
          </span>
        </div>

        {/* Sport Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {SPORTS_LIST.map((s) => {
            const isActive = isSportActive(s.key)

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSport(s.key)}
                title={
                  isAllActive
                    ? `Click để chỉ hiển thị ${s.label}`
                    : isActive
                    ? `Đang hiển thị ${s.label} (Click để xem tất cả)`
                    : `Click để chọn ${s.label}`
                }
                style={{
                  padding: '9px 4px',
                  borderRadius: '12px',
                  border: isActive
                    ? '2px solid #2D5F3F'
                    : '1.5px solid rgba(45, 95, 63, 0.16)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  background: isActive
                    ? 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? '#ffffff' : '#374151',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '11px',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(45, 95, 63, 0.24)'
                    : '0 1px 4px rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#ECFDF5'
                    e.currentTarget.style.borderColor = '#10B981'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
                    e.currentTarget.style.borderColor = 'rgba(45, 95, 63, 0.16)'
                  }
                }}
              >
                {/* Active Check Badge */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '3px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '9px',
                        color: '#2D5F3F',
                        fontWeight: 900,
                      }}
                    >
                      check
                    </span>
                  </span>
                )}

                <span
                  style={{
                    fontSize: '20px',
                    lineHeight: 1,
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' : 'none',
                  }}
                  role="img"
                  aria-label={s.label}
                >
                  {s.emoji}
                </span>
                <span style={{ letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Quick helper / Show All button when not all is active */}
        {!isAllActive && (
          <button
            type="button"
            onClick={selectAllSports}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px 8px',
              borderRadius: '10px',
              border: '1px dashed #10B981',
              background: '#F0FDF4',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#DCFCE7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F0FDF4'
            }}
          >
            <span>✨</span>
            <span>Xem tất cả môn thể thao</span>
          </button>
        )}

        <div style={{ marginTop: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#6B7280', fontStyle: 'italic' }}>
            {isAllActive
              ? 'Nhấp 1 môn để lọc riêng'
              : 'Nhấp thêm môn để xem kết hợp'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '6px 12px', flex: 1, overflowY: 'auto' }}>
        <p
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#4B5563',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '8px',
            paddingLeft: '6px',
          }}
        >
          Menu Điều Hướng
        </p>

        {navItems.map(({ label, path, icon }) => {
          const isCourtBookingActive = path === '/court-finder' && ['/court-finder', '/split-payment', '/court'].includes(location.pathname)
          const isCommunityActive = path === '/community' && ['/community', '/create-match', '/flash-claim'].includes(location.pathname)
          const isQRActive = path === '/qr-pass' && ['/qr-pass', '/check-in', '/checkin'].includes(location.pathname)

          return (
            <NavLink
              key={path}
              to={path}
              onMouseEnter={() => setHoveredNav(path)}
              onMouseLeave={() => setHoveredNav(null)}
              style={({ isActive }) => {
                const active = isActive || isCourtBookingActive || isCommunityActive || isQRActive
                const isHovered = hoveredNav === path
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '13px',
                  marginBottom: '5px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: active ? 700 : 600,
                  color: active ? '#ffffff' : isHovered ? '#15803D' : '#374151',
                  background: active
                    ? 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)'
                    : isHovered
                    ? '#EAF7EE'
                    : 'transparent',
                  boxShadow: active
                    ? '0 4px 14px rgba(45, 95, 63, 0.28)'
                    : 'none',
                  transform: isHovered && !active ? 'translateX(3px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                }
              }}
            >
              {({ isActive }) => {
                const active = isActive || isCourtBookingActive || isCommunityActive || isQRActive
                const isHovered = hoveredNav === path
                return (
                  <>
                    {/* Left glowing neon accent indicator for active item */}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '0',
                          top: '25%',
                          height: '50%',
                          width: '3.5px',
                          background: '#86EFAC',
                          borderRadius: '0 4px 4px 0',
                          boxShadow: '0 0 8px #86EFAC',
                        }}
                      />
                    )}
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '21px',
                        color: active ? '#ffffff' : isHovered ? '#15803D' : '#6B7280',
                        transition: 'color 0.2s',
                      }}
                    >
                      {icon}
                    </span>
                    <span>{label}</span>
                    {active && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#86EFAC',
                          boxShadow: '0 0 6px #86EFAC',
                        }}
                      />
                    )}
                  </>
                )
              }}
            </NavLink>
          )
        })}
      </nav>
    </aside>
    </>
  )
}

export default TopSideBar
