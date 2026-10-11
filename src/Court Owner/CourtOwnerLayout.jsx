import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Trang Chủ', path: '/owner/dashboard', icon: 'home', desc: 'Tổng quan vận hành cơ sở' },
  { label: 'Quản Lý Cụm Sân', path: '/owner/courts', icon: 'domain', desc: 'Cụm phức hợp & Định giá động' },
  { label: 'Quét QR Check-in', path: '/owner/check-qr', icon: 'qr_code_scanner', desc: 'Xác nhận vào sân & Giải ngân Escrow' },
  { label: 'Lịch Đặt Sân Tích Hợp', path: '/owner/schedule', icon: 'calendar_month', desc: 'Lưới lịch đa bộ môn' },
  { label: 'Giải Đấu Tự Động', path: '/owner/tournament', icon: 'emoji_events', desc: 'Tự bốc thăm & Sơ đồ nhánh đấu' },
  { label: 'Báo Cáo & Rút Tiền', path: '/owner/settlement', icon: 'account_balance_wallet', desc: 'Quyết toán doanh thu & Payout' },
]

export default function CourtOwnerLayout() {
  const location = useLocation()
  const [ownerBalance, setOwnerBalance] = useState(() => {
    const saved = localStorage.getItem('court_owner_balance')
    return saved !== null ? Number(saved) : 48650000
  })

  const [ownerProfile, setOwnerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_owner_profile')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {
      fullName: 'Nguyễn Văn Đức',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      roleTitle: 'Chủ Cơ Sở',
    }
  })

  const [hoveredNav, setHoveredNav] = useState(null)

  useEffect(() => {
    // Tự động làm sạch '• Đối Tác Kim Cương' hoặc 'VIP' trong localStorage nếu có
    try {
      const saved = localStorage.getItem('sportnexus_owner_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.roleTitle && (parsed.roleTitle.includes('Kim Cương') || parsed.roleTitle.includes('VIP'))) {
          parsed.roleTitle = 'Chủ Cơ Sở'
          localStorage.setItem('sportnexus_owner_profile', JSON.stringify(parsed))
          setOwnerProfile(parsed)
        }
      }
    } catch (e) {}

    const interval = setInterval(() => {
      const saved = localStorage.getItem('court_owner_balance')
      if (saved !== null) setOwnerBalance(Number(saved))
    }, 1000)

    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('sportnexus_owner_profile')
        if (saved) setOwnerProfile(JSON.parse(saved))
      } catch (e) {}
    }
    window.addEventListener('sportnexus_owner_profile_updated', handleProfileUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('sportnexus_owner_profile_updated', handleProfileUpdate)
    }
  }, [])

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

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

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} className="sport-animated-bg">
      {/* Court Owner Fixed Sidebar (260px) */}
      <aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col select-none"
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 252, 246, 0.92) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(45, 95, 63, 0.12)',
          boxShadow: '4px 0 28px rgba(45, 95, 63, 0.06)',
        }}
      >
        {/* Brand Logo Header — Đồng bộ chuẩn xác theo Role Player */}
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
                whiteSpace: 'nowrap',
              }}
            >
              Hệ Thống Quản Trị Chủ Sân
            </span>
          </div>
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
              SportNexus Arena Q.7
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', fontSize: '11px', color: '#047857' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              4 Khu Vực • 14 Sân Hoạt Động
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

      {/* Main Area Offset by 260px */}
      <div style={{ paddingLeft: '260px' }}>
        {/* Fixed Topbar matching Player TopBar layout */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: '260px',
            right: 0,
            zIndex: 40,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(45, 95, 63, 0.12)',
            boxShadow: '0 4px 20px rgba(45, 95, 63, 0.04)',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            gap: '16px',
          }}
        >
          {/* Breadcrumb & Facility Status (Left side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#2D5F3F' }}>
              home
            </span>
            <Link
              to="/owner/dashboard"
              style={{
                fontSize: '13px',
                color: '#4B5563',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Chủ Sân SportNexus
            </Link>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>›</span>
            <span style={{ fontSize: '13.5px', color: '#1C3524', fontWeight: 800 }}>
              {pageInfo.title}
            </span>

            {/* Live Facility Active Badge */}
            <div
              style={{
                marginLeft: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#DCFCE7',
                border: '1px solid rgba(45, 95, 63, 0.2)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#15803D',
              }}
            >
              <span style={{ fontSize: '11px' }}>🟢</span>
              <span>14/14 Sân Đang Phục Vụ</span>
            </div>
          </div>

          {/* Right Controls: Available Wallet + Pending Escrow + Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                padding: '6px 14px',
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
                <div style={{ fontSize: '9.5px', color: '#15803D', fontWeight: 800, textTransform: 'uppercase' }}>
                  Số Dư Khả Dụng
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C3524' }}>
                  {formatVND(ownerBalance)}
                </div>
              </div>
            </Link>

            {/* Pending Escrow Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FEF3C7',
                borderRadius: '20px',
                padding: '6px 12px',
                border: '1px solid #F59E0B',
                fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#B45309' }}>
                lock_clock
              </span>
              <div>
                <div style={{ fontSize: '9.5px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>
                  Tạm Giữ Escrow
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#78350F' }}>
                  19.820.000 đ
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
                gap: '10px',
                paddingLeft: '10px',
                borderLeft: '1px solid rgba(45, 95, 63, 0.15)',
                textDecoration: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                padding: '4px 8px 4px 10px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(45, 95, 63, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <img
                src={ownerProfile.avatar}
                alt={ownerProfile.fullName}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '2px solid #10B981',
                  objectFit: 'cover',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C3524', lineHeight: 1.2 }}>
                  {ownerProfile.fullName}
                </span>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>
                  Chủ Cơ Sở
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ width: '100%', paddingTop: '60px', minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
