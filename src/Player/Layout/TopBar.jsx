import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'

function TopBar() {
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
        left: '240px',
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
      {/* Breadcrumb & Sport Filter Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
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
              DUPR 3.8 • Elo 1650
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
            }}
          >
            99.4
          </div>
        </Link>
      </div>
    </header>
  )
}

export default TopBar
