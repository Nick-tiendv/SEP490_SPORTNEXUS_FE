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

  // Tự động chuyển hướng về trang Người chơi nếu tài khoản đăng nhập có vai trò Player
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('sportnexus_user_role')
      if (savedRole === 'player') {
        navigate('/dashboard', { replace: true })
      }
    } catch (e) {}
  }, [navigate])

  const [ownerBalance, setOwnerBalance] = useState(() => {
    const saved = localStorage.getItem('court_owner_balance')
    return saved !== null ? Number(saved) : 48650000
  })

  const [toastMessage, setToastMessage] = useState(null)


  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  return (
    <div className="responsive-page-container" style={{ minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
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


      {/* Top Welcome / Overview Header Banner Hub */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '24px 28px',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Trung Tâm Quản Trị Chủ Sân
            </span>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>
              SportNexus Operating System
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Tổng Quan Hoạt Động & Tài Chính Cơ Sở
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
            Giám sát doanh thu, giải ngân Smart Escrow tức thì và điều phối hoạt động sân thể thao theo thời gian thực.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '20px' }}>
              verified
            </span>
            <div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                Trạng Thái Hệ Thống
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                14/14 Sân Sẵn Sàng
              </div>
            </div>
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
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.94) 0%, rgba(6, 95, 70, 0.94) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(6, 78, 59, 0.25)',
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
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
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
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
            Giải ngân tự động khi quét QR vào sân
          </div>
        </div>

        {/* Metric 3: Occupancy Rate */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>
              TỶ LỆ LẤP ĐẦY TRONG NGÀY
            </span>
            <span className="material-symbols-outlined" style={{ color: '#1D4ED8', fontSize: '22px' }}>
              pie_chart
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            78.3% <span style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>(94/120 slot)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
            🔥 Giờ cao điểm tối đạt 96% công suất
          </div>
        </div>

        {/* Metric 4: Projected Daily Revenue */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              DOANH THU DỰ KIẾN HÔM NAY
            </span>
            <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '22px' }}>
              trending_up
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            22.850.000 đ
          </div>
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
            Tự động tính theo Dynamic Pricing
          </div>
        </div>
      </div>

      {/* SECTION 1: LẦN LƯỢT TẤT CẢ CÁC CHỨC NĂNG BÊN SIDEBAR (Action Cards Grid) */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            padding: '18px 24px',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Trung Tâm Chức Năng Quản Trị (Core Capabilities)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '13.5px', fontWeight: 600 }}>
              Truy cập nhanh lần lượt tất cả các nghiệp vụ quản lý cơ sở từ sidebar
            </p>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: '#047857',
              fontWeight: 800,
              background: '#DCFCE7',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #86EFAC',
            }}
          >
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
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '22px',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
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

                <div style={{ fontSize: '11px', color: '#1E293B', fontWeight: 800, textTransform: 'uppercase' }}>
                  {card.subtitle}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px 0' }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#1E293B', lineHeight: 1.5, fontWeight: 600 }}>
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
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            padding: '22px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Lịch Check-in Chờ Giải Ngân Escrow Hôm Nay
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#1E293B', fontSize: '13px', fontWeight: 600 }}>
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
                  background: item.status === 'checked_in' ? 'rgba(240, 253, 244, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {item.customer}
                      </span>
                      <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700 }}>({item.phone})</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                      {item.court}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600, marginTop: '2px' }}>
                      Khung giờ: <strong style={{ color: '#0F172A' }}>{item.time}</strong>
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
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.90)',
            padding: '22px',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Tình Trạng 4 Cụm Thể Thao
            </h3>
            <Link
              to="/owner/courts"
              style={{ fontSize: '12px', color: '#047857', fontWeight: 800, textDecoration: 'none' }}
            >
              Chỉnh Sửa Giá
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complexZonesOverview.map((zone) => (
              <div
                key={zone.id}
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  background: 'rgba(248, 250, 252, 0.95)',
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
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      {zone.name.split('—')[0].trim()}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>
                    Lấp đầy: {zone.occupancy}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: '#1E293B', fontWeight: 700 }}>
                  <span>{zone.activeCourts}/{zone.totalCourts} sân hoạt động</span>
                  <span style={{ fontWeight: 800, color: '#9A3412' }}>{zone.currentPrice}</span>
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
              background: 'rgba(255, 255, 255, 0.85)',
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
