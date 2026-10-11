// Dashboard.jsx — SportNexus Court Owner Dashboard
// Giao diện trang chủ quản trị cơ sở thể thao phức hợp SportNexus

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// 5 Chức năng chính tương ứng lần lượt với các mục trên sidebar
const actionCards = [
  {
    icon: 'domain',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    title: 'Quản Lý Cụm Sân',
    subtitle: 'Chức năng #1',
    desc: 'Quản lý 4 khu phức hợp (Cầu lông, Bóng đá, Pickleball, Tennis), Lưới thời gian & Định giá động (Dynamic Pricing).',
    link: '/owner/courts',
    badge: 'Định Giá Động AI',
    badgeColor: '#059669',
  },
  {
    icon: 'qr_code_scanner',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    title: 'Quét QR Check-in',
    subtitle: 'Chức năng #2',
    desc: 'Quét mã QR của người chơi bằng camera 4K để xác nhận check-in và kích hoạt giải ngân Escrow tức thì.',
    link: '/owner/check-qr',
    badge: 'Giải Ngân Escrow',
    badgeColor: '#1D4ED8',
  },
  {
    icon: 'calendar_month',
    iconColor: '#059669',
    iconBg: '#EAF7EE',
    title: 'Lịch Đặt Sân Tích Hợp',
    subtitle: 'Chức năng #3',
    desc: 'Xem lịch đặt sân dưới dạng Lưới (Grid view) đồng bộ cho toàn bộ 14 sân con, quản lý lấp đầy & nhận khách vãng lai.',
    link: '/owner/schedule',
    badge: 'Lưới Đa Sân 24/7',
    badgeColor: '#047857',
  },
  {
    icon: 'emoji_events',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    title: 'Giải Đấu Tự Động',
    subtitle: 'Chức năng #4',
    desc: 'Tự động xếp hạt giống, bốc thăm ngẫu nhiên công bằng và khởi tạo sơ đồ nhánh đấu (Bracket diagram) trực quan.',
    link: '/owner/tournament',
    badge: 'Auto Bracket AI',
    badgeColor: '#B45309',
  },
  {
    icon: 'account_balance_wallet',
    iconColor: '#7C3AED',
    iconBg: '#F3E8FF',
    title: 'Báo Cáo & Rút Tiền',
    subtitle: 'Chức năng #5',
    desc: 'Xem báo cáo doanh thu tài chính, số dư khả dụng và tạo lệnh rút tiền (Payout) chuyển khoản nhanh Napas 24/7.',
    link: '/owner/settlement',
    badge: 'Napas 24/7 Tức Thì',
    badgeColor: '#6D28D9',
  },
]

// Ca thi đấu sắp tới giờ check-in hôm nay
const upcomingCheckIns = [
  {
    id: 'chk-1',
    code: 'SNX-89324-CHK',
    customer: 'Nguyễn Văn An',
    phone: '0912 345 678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    court: 'Khu A — Sân Cầu Lông A1 (VIP)',
    sport: 'Cầu lông',
    time: '18:00 - 19:30 (Trong 15 phút tới)',
    escrow: 350000,
    status: 'pending',
  },
  {
    id: 'chk-2',
    code: 'SNX-44219-CHK',
    customer: 'Trần Minh Quân (FC Saigon)',
    phone: '0988 765 432',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
    court: 'Khu B — Sân Bóng Đá B1 (Sân 5)',
    sport: 'Bóng đá',
    time: '19:00 - 20:30 (Hôm nay)',
    escrow: 600000,
    status: 'pending',
  },
  {
    id: 'chk-3',
    code: 'SNX-77102-CHK',
    customer: 'Lê Hoàng Yến',
    phone: '0903 111 222',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    court: 'Khu C — Sân Pickleball C1 (Center VIP)',
    sport: 'Pickleball',
    time: '17:30 - 18:30 (Đang diễn ra)',
    escrow: 240000,
    status: 'checked_in',
  },
]

// Tình trạng 4 Cụm sân trực tiếp
const complexZonesOverview = [
  {
    id: 'zone-a',
    name: 'Khu A — Cầu Lông BWF',
    totalCourts: 5,
    activeCourts: 5,
    occupancy: '92%',
    currentPrice: '260.000 đ/h (Giờ vàng 🔥)',
    color: '#10B981',
    icon: 'sports_tennis',
  },
  {
    id: 'zone-b',
    name: 'Khu B — Bóng Đá Mini Sân 5-7',
    totalCourts: 3,
    activeCourts: 3,
    occupancy: '100%',
    currentPrice: '550.000 đ/h (Peak)',
    color: '#3B82F6',
    icon: 'sports_soccer',
  },
  {
    id: 'zone-c',
    name: 'Khu C — Pickleball USAPA Pro',
    totalCourts: 4,
    activeCourts: 4,
    occupancy: '75%',
    currentPrice: '280.000 đ/h',
    color: '#F59E0B',
    icon: 'sports_tennis',
  },
  {
    id: 'zone-d',
    name: 'Khu D — Quần Vợt Tennis ATP',
    totalCourts: 2,
    activeCourts: 2,
    occupancy: '65%',
    currentPrice: '420.000 đ/h',
    color: '#EC4899',
    icon: 'sports_tennis',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
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
      roleTitle: 'Chủ Cơ Sở',
    }
  })

  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('sportnexus_owner_profile')
        if (saved) setOwnerProfile(JSON.parse(saved))
      } catch (e) {}
    }
    window.addEventListener('sportnexus_owner_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('sportnexus_owner_profile_updated', handleProfileUpdate)
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  return (
    <div style={{ padding: '24px 32px 48px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1C3524 0%, #2D5F3F 50%, #15803D 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(45, 95, 63, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        {/* Subtle Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-30px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: '#DCFCE7',
                }}
              >
                CƠ SỞ VẬN HÀNH CHÍNH THỨC
              </span>
              <span style={{ fontSize: '12px', color: '#BBF7D0' }}>• Hoạt động 100% thời gian thực</span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Chào mừng trở lại, Chủ Cơ Sở {ownerProfile.fullName}! 🏟️
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#D1FAE5', maxWidth: '640px', lineHeight: 1.5 }}>
              Hệ thống vận hành Cụm thể thao phức hợp <strong>SportNexus Arena Q.7</strong> (4 Khu: Cầu lông BWF, Bóng đá mini, Pickleball, Tennis) — Tự động hóa lịch đặt sân & giải ngân Escrow tức thì.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/owner/courts"
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                domain
              </span>
              Quản Lý Cụm Sân
            </Link>

            <Link
              to="/owner/check-qr"
              style={{
                background: '#FFFFFF',
                color: '#15803D',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                transition: 'transform 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                qr_code_scanner
              </span>
              Quét QR Check-in
            </Link>

            <Link
              to="/owner/schedule"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                grid_view
              </span>
              Xem Lịch Lưới
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Financial & Operation Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        {/* Metric 1: Available Balance */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(6, 78, 59, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase' }}>
              SỐ DƯ KHẢ DỤNG (ĐÃ GIẢI NGÂN)
            </span>
            <span className="material-symbols-outlined" style={{ color: '#34D399', fontSize: '22px' }}>
              account_balance_wallet
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#FFFFFF' }}>
            {formatVND(ownerBalance)}
          </div>
          <div style={{ fontSize: '12px', color: '#D1FAE5', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              check_circle
            </span>
            Sẵn sàng rút tức thì Napas 24/7
          </div>
        </div>

        {/* Metric 2: Pending Escrow */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
              TẠM GIỮ TẠI SMART ESCROW
            </span>
            <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '22px' }}>
              lock_clock
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#B45309' }}>
            19.820.000 đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Giải ngân tự động khi quét QR vào sân
          </div>
        </div>

        {/* Metric 3: Occupancy Rate */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
              TỶ LỆ LẤP ĐẦY TRONG NGÀY
            </span>
            <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '22px' }}>
              pie_chart
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            78.3% <span style={{ fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>(94/120 slot)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>
            🔥 Giờ cao điểm tối đạt 96% công suất
          </div>
        </div>

        {/* Metric 4: Projected Daily Revenue */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
              DOANH THU DỰ KIẾN HÔM NAY
            </span>
            <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: '22px' }}>
              trending_up
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            22.850.000 đ
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Tự động tính theo Dynamic Pricing
          </div>
        </div>
      </div>

      {/* SECTION 1: LẦN LƯỢT TẤT CẢ CÁC CHỨC NĂNG BÊN SIDEBAR (Action Cards Grid) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Trung Tâm Chức Năng Quản Trị (Core Capabilities)
            </h2>
            <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '13px' }}>
              Truy cập nhanh lần lượt tất cả các nghiệp vụ quản lý cơ sở từ sidebar
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
            5/5 Chức Năng Hoạt Động
          </span>
        </div>

        {/* 5 Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {actionCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              style={{
                textDecoration: 'none',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = card.iconColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'
                e.currentTarget.style.borderColor = '#E2E8F0'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: card.iconBg,
                      color: card.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                      {card.icon}
                    </span>
                  </div>

                  <span
                    style={{
                      background: `${card.badgeColor}15`,
                      color: card.badgeColor,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                  {card.subtitle}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px 0' }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  {card.desc}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #F1F5F9',
                  color: card.iconColor,
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <span>Mở giao diện</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 2: LIVE UPCOMING CHECK-INS & COMPLEX ZONES MONITOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Upcoming Check-in Queue */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Lịch Check-in Chờ Giải Ngân Escrow Hôm Nay
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '12.5px' }}>
                Người chơi sắp tới sân — Sẵn sàng quét mã QR để giải ngân tiền cọc
              </p>
            </div>
            <Link
              to="/owner/check-qr"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563EB',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Quét QR Terminal
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingCheckIns.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: item.status === 'checked_in' ? '#F0FDF4' : '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={item.avatar}
                    alt={item.customer}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        {item.customer}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>({item.phone})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                      {item.court}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Khung giờ: <strong>{item.time}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: item.status === 'checked_in' ? '#16A34A' : '#D97706' }}>
                    {formatVND(item.escrow)}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    {item.status === 'checked_in' ? (
                      <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ Đã Giải Ngân
                      </span>
                    ) : (
                      <Link
                        to="/owner/check-qr"
                        style={{
                          background: '#10B981',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        Quét QR Ngay
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Complex Zones Monitor */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Tình Trạng 4 Cụm Thể Thao
            </h3>
            <Link
              to="/owner/courts"
              style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, textDecoration: 'none' }}
            >
              Chỉnh Sửa Giá
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complexZonesOverview.map((zone) => (
              <div
                key={zone.id}
                style={{
                  border: '1px solid #F1F5F9',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  background: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ color: zone.color, fontSize: '18px' }}
                    >
                      {zone.icon}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {zone.name.split('—')[0].trim()}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                    Lấp đầy: {zone.occupancy}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748B' }}>
                  <span>{zone.activeCourts}/{zone.totalCourts} sân hoạt động</span>
                  <span style={{ fontWeight: 600, color: '#B45309' }}>{zone.currentPrice}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Schedule Button */}
          <Link
            to="/owner/schedule"
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px dashed #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              calendar_month
            </span>
            Xem Chi Tiết Lưới Lịch 14 Sân
          </Link>
        </div>
      </div>
    </div>
  )
}
