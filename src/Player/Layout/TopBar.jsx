import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'

function TopBar() {
  const location = useLocation()
  const isCommunity = location.pathname === '/community'
  const isCreateMatch = location.pathname === '/create-match'
  const isQRPass = ['/qr-pass', '/checkin', '/check-in'].includes(location.pathname)
  const isTournament = location.pathname === '/tournament'
  const isWallet = location.pathname === '/wallet'
  const isProfile = location.pathname === '/profile'
  const { selectedSports, isAllActive, isSportActive, toggleSport } = useSport()
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('escrow_balance')
      if (saved !== null) setWalletBalance(Number(saved))
    }
    window.addEventListener('escrow_balance_updated', handleUpdate)
    return () => window.removeEventListener('escrow_balance_updated', handleUpdate)
  }, [])

  return (
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
      {/* Breadcrumb & Sport Filter Status or Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        {isWallet ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#15803D' }}>
              bolt
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C3524', letterSpacing: '-0.3px' }}>
              Ví Điện Tử
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>•</span>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
              Nạp Tiền Trực Tuyến
            </span>
          </div>
        ) : isProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#15803D' }}>
              badge
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C3524', letterSpacing: '-0.3px' }}>
              Hồ Sơ Người Chơi
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>•</span>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
              Vận Động Viên SportNexus
            </span>
          </div>
        ) : isTournament ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#15803D' }}>
              emoji_events
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C3524', letterSpacing: '-0.3px' }}>
              Giải Đấu Thể Thao 2026
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>•</span>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
              Vòng Chung Kết Toàn Quốc
            </span>
          </div>
        ) : isQRPass ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              borderRadius: '24px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#15803D',
              letterSpacing: '0.4px',
              boxShadow: '0 1px 4px rgba(21, 128, 61, 0.08)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16A34A' }}>
              verified_user
            </span>
            <span style={{ textTransform: 'uppercase' }}>
              HỆ THỐNG BẢO VỆ GIAO DỊCH ĐỘC LẬP • CHECK-IN QR BẢO CHỨNG
            </span>
          </div>
        ) : isCreateMatch ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
              bolt
            </span>
            <Link
              to="/community"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#1C3524',
                textDecoration: 'none',
                letterSpacing: '-0.3px',
              }}
            >
              Sàn Ghép Trận &amp; Tranh Slot
            </Link>
            <span style={{ color: '#9CA3AF', fontSize: '14px' }}>•</span>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
              Đăng Kèo Mới
            </span>
          </div>
        ) : isCommunity ? (
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#1C3524',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Sàn Ghép Trận &amp; Tranh Slot
          </h1>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#2D5F3F' }}>
              home
            </span>
            <Link
              to="/dashboard"
              style={{
                fontSize: '13px',
                color: '#4B5563',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Trang Chủ SportNexus
            </Link>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>›</span>
            <span style={{ fontSize: '13px', color: '#1C3524', fontWeight: 700 }}>
              Khu Vực Thi Đấu &amp; Đặt Sân
            </span>

            {/* Current Active Sport Pill */}
            <div
              style={{
                marginLeft: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isAllActive ? '#DCFCE7' : '#F0FDF4',
                border: '1px solid rgba(45, 95, 63, 0.2)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#15803D',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}
            >
              <span style={{ fontSize: '12px' }}>
                {isAllActive ? '✨' : isSportActive('badminton') ? '🏸' : '🏓'}
              </span>
              <span>
                {isAllActive
                  ? 'Tất cả: Cầu Lông & Pickleball'
                  : isSportActive('badminton')
                  ? 'Chỉ Cầu Lông'
                  : 'Chỉ Pickleball'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: Wallet + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Escrow Wallet */}
        <Link
          to="/wallet"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #EAF7EE 0%, #E0F5E6 100%)',
            borderRadius: '20px',
            padding: '7px 16px',
            border: '1px solid rgba(45, 95, 63, 0.18)',
            boxShadow: '0 2px 6px rgba(45, 95, 63, 0.05)',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 95, 63, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 95, 63, 0.05)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#2D5F3F' }}>
            account_balance_wallet
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C3524' }}>
            Ví Escrow:
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803D' }}>
            {new Intl.NumberFormat('vi-VN').format(walletBalance)} đ
          </span>
        </Link>

        {/* User Avatar + Info */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '12px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(235, 248, 240, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '12px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(45, 95, 63, 0.25)',
            }}
          >
            MMM
          </div>
          {/* Name + stats */}
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#1C3524' }}>
              Minh Minh Minh
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
              @minhminhminh
            </p>
          </div>
          {/* Rating badge */}
          <div
            style={{
              background: '#FFF3E0',
              border: '1px solid #FFE0B2',
              borderRadius: '10px',
              padding: '4px 10px',
              fontWeight: 800,
              fontSize: '13px',
              color: '#E65100',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>⭐</span>
            <span>4.9</span>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default TopBar
