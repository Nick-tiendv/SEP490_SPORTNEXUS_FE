import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'

const navItems = [
  { label: 'Trang Chủ', path: '/dashboard', icon: 'home' },
  { label: 'Đặt Sân', path: '/court-finder', icon: 'calendar_month' },
  { label: 'Ghép Trận LFG', path: '/community', icon: 'group' },
  { label: 'Check-in QR', path: '/qr-pass', icon: 'qr_code_scanner' },
  { label: 'Giải Đấu', path: '/tournament', icon: 'emoji_events' },
  { label: 'Ví Escrow', path: '/wallet', icon: 'account_balance_wallet' },
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

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col select-none"
      style={{
        width: '240px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(244, 252, 246, 0.90) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(45, 95, 63, 0.12)',
        boxShadow: '4px 0 28px rgba(45, 95, 63, 0.06)',
      }}
    >
      {/* Brand Logo Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 18px 16px 18px',
          borderBottom: '1px solid rgba(45, 95, 63, 0.08)',
        }}
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
            }}
          >
            Nền Tảng Thể Thao Đa Môn
          </span>
        </div>
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
            <span style={{ fontSize: '9px' }}>{isAllActive ? '✨' : isSportActive('badminton') ? '🏸' : '🏓'}</span>
            {isAllActive
              ? 'Cả 2 môn'
              : isSportActive('badminton')
              ? 'Chỉ Cầu Lông'
              : 'Chỉ Pickleball'}
          </span>
        </div>

        {/* Sport Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SPORTS_LIST.map((s) => {
            const isActive = isSportActive(s.key)
            const isBadminton = s.key === 'badminton'

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSport(s.key)}
                title={
                  isAllActive
                    ? `Click để chỉ hiển thị ${s.label}`
                    : isActive
                    ? `Đang hiển thị ${s.label} (Click để xem cả 2 môn)`
                    : `Click để hiển thị cả 2 môn`
                }
                style={{
                  flex: 1,
                  padding: '11px 6px',
                  borderRadius: '14px',
                  border: isActive
                    ? isBadminton
                      ? '2px solid #2D5F3F'
                      : '2px solid #047857'
                    : '1.5px solid rgba(45, 95, 63, 0.16)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: isActive
                    ? isBadminton
                      ? 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)'
                      : 'linear-gradient(135deg, #047857 0%, #10B981 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? '#ffffff' : '#374151',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '11.5px',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive
                    ? '0 6px 16px rgba(45, 95, 63, 0.24)'
                    : '0 2px 6px rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                  transform: isActive ? 'translateY(-1.5px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#ECFDF5'
                    e.currentTarget.style.borderColor = '#10B981'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
                    e.currentTarget.style.borderColor = 'rgba(45, 95, 63, 0.16)'
                    e.currentTarget.style.transform = 'none'
                  }
                }}
              >
                {/* Active Check Badge */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '5px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '10px',
                        color: isBadminton ? '#2D5F3F' : '#047857',
                        fontWeight: 900,
                      }}
                    >
                      check
                    </span>
                  </span>
                )}

                <span
                  style={{
                    fontSize: '24px',
                    lineHeight: 1,
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' : 'none',
                  }}
                  role="img"
                  aria-label={s.label}
                >
                  {s.emoji}
                </span>
                <span style={{ letterSpacing: '-0.2px' }}>{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Quick helper / Show All button when only 1 is active */}
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
            <span>Xem cả 2 môn thể thao</span>
          </button>
        )}

        <div style={{ marginTop: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#6B7280', fontStyle: 'italic' }}>
            {isAllActive
              ? 'Nhấp 1 môn để lọc riêng'
              : 'Nhấp môn còn lại để xem cả 2'}
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

      {/* Footer: Escrow Status Card */}
      <div style={{ padding: '12px 14px' }}>
        <div
          style={{
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #EAF7EE 0%, #E0F5E6 100%)',
            borderRadius: '14px',
            border: '1px solid rgba(45, 95, 63, 0.16)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 10px rgba(45, 95, 63, 0.05)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: '#2D5F3F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(45, 95, 63, 0.25)',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '19px' }}>
              verified_user
            </span>
          </div>
          <div style={{ lineHeight: 1.3, flex: 1 }}>
            <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#1C3524', margin: 0 }}>
              Bảo chứng Escrow 24/7
            </p>
            <p style={{ fontSize: '10.5px', color: '#2D5F3F', margin: 0, fontWeight: 500 }}>
              Giao dịch an toàn & minh bạch
            </p>
          </div>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              flexShrink: 0,
              boxShadow: '0 0 8px #10B981',
            }}
          />
        </div>
      </div>
    </aside>
  )
}

export default TopSideBar
