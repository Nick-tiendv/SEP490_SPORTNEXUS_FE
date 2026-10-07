// Dashboard.jsx — SportNexus Player Dashboard
// Thiết kế pastel sáng, năng động, thân thiện & hỗ trợ lọc theo môn Cầu Lông / Pickleball

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'

const actionCards = [
  {
    icon: 'calendar_month',
    iconColor: '#15803D',
    iconBg: '#EAF7EE',
    title: 'Đặt Sân',
    desc: 'Tìm sân trống gần nhất, chia bill cọc tự động 1-chạm.',
    link: '/court-finder',
  },
  {
    icon: 'group',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    title: 'Ghép Trận LFG',
    desc: 'Ghép đội đúng trình DUPR/Elo, cam kết không bùng hẹn.',
    link: '/community',
  },
  {
    icon: 'qr_code_scanner',
    iconColor: '#7C3AED',
    iconBg: '#F3E8FF',
    title: 'Check-in QR',
    desc: 'Mở cổng sân tự động và bảo đảm quỹ Escrow minh bạch.',
    link: '/qr-pass',
  },
  {
    icon: 'emoji_events',
    iconColor: '#EA580C',
    iconBg: '#FFEDD5',
    title: 'Giải Đấu Mở',
    desc: 'Xem lịch thi đấu phân nhánh và bảng vàng thành tích.',
    link: '/tournament',
  },
]

// Dữ liệu trận đấu kế tiếp của cả 2 môn
const upcomingMatchesData = [
  {
    id: 'up-1',
    sport: 'badminton',
    sportName: 'Cầu Lông',
    sportEmoji: '🏸',
    sportBadgeBg: '#EAF7EE',
    sportBadgeColor: '#15803D',
    time: '19:30 Tối nay (90 phút)',
    type: 'Cầu Lông Đôi Nam Nữ • BWF',
    deposit: 'Đã đặt cọc: 60.000 đ',
    title: 'Cầu Lông Bình Thạnh Arena — Sân Yonex BWF 03',
    address: 'Số 18/2 Chu Văn An, Bình Thạnh (Cách 1.5km) • Đủ 4/4 người',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=160&h=160&fit=crop',
    qrCode: 'SNX-BAD-9921',
  },
  {
    id: 'up-2',
    sport: 'pickleball',
    sportName: 'Pickleball',
    sportEmoji: '🏓',
    sportBadgeBg: '#ECFDF5',
    sportBadgeColor: '#047857',
    time: '20:00 Ngày mai (120 phút)',
    type: 'Pickleball Đôi Nam Nữ • DUPR 3.5+',
    deposit: 'Đã đặt cọc: 80.000 đ',
    title: 'Pickleball D-Dink Hub Thảo Điền — Sân Pro USAPA 02',
    address: 'Số 28 Thảo Điền, TP. Thủ Đức (Cách 2.3km) • Đủ 4/4 người',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=160&h=160&fit=crop',
    qrCode: 'SNX-PCK-4412',
  },
]

// Dữ liệu kèo ghép trận LFG
const allLfgMatches = [
  {
    id: 'lfg-1',
    sport: 'pickleball',
    sportName: 'Pickleball Đôi',
    sportEmoji: '🏓',
    missing: 'Thiếu 1 người',
    missingColor: '#DC2626',
    time: '20:30 Hôm nay • CLB Phú Mỹ Hưng (1.2 km)',
    price: '55.000 đ / người',
    host: 'Host Tuấn Hoàng (DUPR 3.8)',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=100&h=100&fit=crop',
    badge: 'Chuẩn USAPA',
  },
  {
    id: 'lfg-2',
    sport: 'badminton',
    sportName: 'Cầu Lông Nam Nữ',
    sportEmoji: '🏸',
    missing: 'Thiếu 2 người',
    missingColor: '#DC2626',
    time: '18:00 Ngày mai • Sân Tre Xanh Bình Thạnh (2.8 km)',
    price: '45.000 đ / người',
    host: 'Host Linh (Elo 1600)',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&h=100&fit=crop',
    badge: 'Thảm Yonex',
  },
  {
    id: 'lfg-3',
    sport: 'pickleball',
    sportName: 'Pickleball Giao Lưu D-Dink',
    sportEmoji: '🏓',
    missing: 'Thiếu 2 người',
    missingColor: '#D97706',
    time: '06:30 Sáng mai • Sân Sala Q.2 (1.8 km)',
    price: '60.000 đ / người',
    host: 'Host Quỳnh Anh (DUPR 3.2)',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=100&h=100&fit=crop',
    badge: 'Cộng Đồng',
  },
  {
    id: 'lfg-4',
    sport: 'badminton',
    sportName: 'Cầu Lông Smash Đôi Nam',
    sportEmoji: '🏸',
    missing: 'Thiếu 1 người',
    missingColor: '#DC2626',
    time: '19:30 Tối nay • CLB Viettel Q.10 (3.2 km)',
    price: '50.000 đ / người',
    host: 'Host Hoàng Nam (Elo 1750)',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&h=100&fit=crop',
    badge: 'Cạnh Tranh Cao',
  },
]

// Dữ liệu gợi ý sân trống
const allSuggestedCourts = [
  {
    id: 'court-1',
    sport: 'pickleball',
    sportEmoji: '🏓',
    slot: 'Trống 18:00 - 19:30',
    dist: 'Cách 1.5 km',
    name: 'Pickleball Hub Q.7',
    price: '180.000 đ/h • Chuẩn USAPA Pro',
    rating: '4.9 ★ (512 đánh giá)',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=100&h=100&fit=crop',
  },
  {
    id: 'court-2',
    sport: 'badminton',
    sportEmoji: '🏸',
    slot: 'Trống 19:00 - 21:00',
    dist: 'Cách 3.1 km',
    name: 'Cầu Lông Bình Thạnh Arena',
    price: '120.000 đ/h • Thảm BWF Yonex',
    rating: '4.8 ★ (340 đánh giá)',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&h=100&fit=crop',
  },
  {
    id: 'court-3',
    sport: 'pickleball',
    sportEmoji: '🏓',
    slot: 'Trống 20:00 - 22:00',
    dist: 'Cách 2.8 km',
    name: 'Pickleball Saigon D-Dink Park Thủ Đức',
    price: '160.000 đ/h • 8 Sân Đèn LED Ngoài Trời',
    rating: '4.9 ★ (210 đánh giá)',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=100&h=100&fit=crop',
  },
  {
    id: 'court-4',
    sport: 'badminton',
    sportEmoji: '🏸',
    slot: 'Trống 17:30 - 19:00',
    dist: 'Cách 2.0 km',
    name: 'CLB Cầu Lông Đào Duy Anh Phú Nhuận',
    price: '110.000 đ/h • 6 Sân Chuẩn Thi Đấu',
    rating: '4.7 ★ (185 đánh giá)',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100&h=100&fit=crop',
  },
]

function Dashboard() {
  const navigate = useNavigate()
  const {
    selectedSports,
    toggleSport,
    selectAllSports,
    selectOnlySport,
    isSportActive,
    isAllActive,
    SPORTS_LIST,
  } = useSport()

  const [qrModalMatch, setQrModalMatch] = useState(null)

  // Lọc dữ liệu theo môn đang chọn
  const filteredUpcomingMatches = upcomingMatchesData.filter((m) =>
    isSportActive(m.sport)
  )

  const filteredLfgMatches = allLfgMatches.filter((m) =>
    isSportActive(m.sport)
  )

  const filteredCourts = allSuggestedCourts.filter((c) =>
    isSportActive(c.sport)
  )

  return (
    <div
      style={{
        padding: '24px 32px 48px',
        maxWidth: '1160px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ===================== SECTION 1: WELCOME & QUICK SPORT BAR ===================== */}
      <section
        style={{
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '26px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 24px rgba(45, 95, 63, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Welcome Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#1C3524',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                Xin chào, Minh Minh Minh 👋
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #EAF7EE 0%, #DCFCE7 100%)',
                  color: '#15803D',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #86EFAC',
                }}
              >
                DUPR 3.8 • Elo 1650
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
              {isAllActive
                ? 'Đang xem toàn bộ sân & kèo cho cả Cầu Lông và Pickleball. Đặt sân & bảo chứng Escrow minh bạch.'
                : isSportActive('badminton')
                ? 'Đang hiển thị chuyên biệt cho Cầu Lông (Thảm BWF, Kèo Elo). Nhấn thêm Pickleball để xem cả 2 môn.'
                : 'Đang hiển thị chuyên biệt cho Pickleball (Chuẩn USAPA, Kèo DUPR). Nhấn thêm Cầu Lông để xem cả 2 môn.'}
            </p>
          </div>

          {/* Quick Sport Selector Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F0FDF4',
              padding: '6px 8px',
              borderRadius: '16px',
              border: '1.5px solid rgba(45, 95, 63, 0.14)',
            }}
          >
            {SPORTS_LIST.map((s) => {
              const isActive = isSportActive(s.key)
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleSport(s.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: isActive ? '1.5px solid #2D5F3F' : '1.5px solid transparent',
                    background: isActive
                      ? 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)'
                      : 'rgba(255, 255, 255, 0.9)',
                    color: isActive ? '#fff' : '#374151',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(45, 95, 63, 0.22)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  title={
                    isAllActive
                      ? `Click để chỉ xem ${s.label}`
                      : isActive
                      ? `Đang hiển thị ${s.label}`
                      : `Click để xem cả 2 môn`
                  }
                >
                  <span style={{ fontSize: '16px' }}>{s.emoji}</span>
                  <span>{s.label}</span>
                  {isActive && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#86EFAC',
                        boxShadow: '0 0 6px #86EFAC',
                      }}
                    />
                  )}
                </button>
              )
            })}

            {/* View Both Button */}
            <button
              type="button"
              onClick={selectAllSports}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: '12px',
                border: isAllActive ? '1.5px solid #10B981' : '1.5px dashed #A7F3D0',
                background: isAllActive ? '#DCFCE7' : 'transparent',
                color: isAllActive ? '#15803D' : '#059669',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span>✨</span>
              <span>Cả 2 môn</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'linear-gradient(90deg, #F0FDF4 0%, #F9FCF9 100%)',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            fontSize: '12px',
            color: '#374151',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
              filter_list
            </span>
            <span>
              Bộ lọc hiện tại:{' '}
              <strong style={{ color: '#1C3524' }}>
                {isAllActive
                  ? 'Toàn bộ 2 môn (Cầu Lông & Pickleball)'
                  : isSportActive('badminton')
                  ? 'Chỉ hiển thị Cầu Lông'
                  : 'Chỉ hiển thị Pickleball'}
              </strong>
            </span>
            <span style={{ color: '#9CA3AF' }}>•</span>
            <span>
              {filteredUpcomingMatches.length} trận sắp tới • {filteredLfgMatches.length} kèo ghép • {filteredCourts.length} sân trống
            </span>
          </div>

          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            {isAllActive
              ? '💡 Nhấn vào 1 môn để lọc riêng'
              : '💡 Nhấn nút môn còn lại để xem cả 2'}
          </span>
        </div>
      </section>

      {/* ===================== SECTION 2: ACTION CARDS ===================== */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {actionCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '20px 18px',
              textDecoration: 'none',
              display: 'block',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 18px rgba(45, 95, 63, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(45, 95, 63, 0.12)'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.borderColor = '#A7F3D0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(45, 95, 63, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '22px', color: card.iconColor }}
                >
                  {card.icon}
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: '#9CA3AF', transition: 'transform 0.2s' }}
              >
                arrow_forward
              </span>
            </div>
            <p
              style={{
                margin: '0 0 6px 0',
                fontWeight: 800,
                fontSize: '15px',
                color: '#1C3524',
              }}
            >
              {card.title}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: 1.5 }}>
              {card.desc}
            </p>
          </Link>
        ))}
      </section>

      {/* ===================== SECTION 3: UPCOMING MATCHES ===================== */}
      <section style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#15803D',
                display: 'inline-block',
                boxShadow: '0 0 8px #15803D',
              }}
            />
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1C3524' }}>
              Trận đấu kế tiếp của bạn ({filteredUpcomingMatches.length})
            </h2>
          </div>
          <Link
            to="/community"
            style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', fontWeight: 700 }}
          >
            Lịch thi đấu cá nhân ›
          </Link>
        </div>

        {filteredUpcomingMatches.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed #D1D5DB',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#374151' }}>
              Không có trận đấu nào cho môn này
            </p>
            <button
              onClick={selectAllSports}
              style={{
                background: '#15803D',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Xem cả 2 môn
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredUpcomingMatches.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 20px rgba(45, 95, 63, 0.05)',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Court image */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={m.img}
                    alt={m.title}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '2px 4px',
                      borderRadius: '6px',
                      lineHeight: 1,
                    }}
                  >
                    {m.sportEmoji}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '5px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: m.sportBadgeColor,
                        background: m.sportBadgeBg,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {m.sportName}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#15803D' }}>
                      {m.time}
                    </span>
                    <span style={{ color: '#D1D5DB', fontSize: '12px' }}>•</span>
                    <span style={{ fontSize: '12.5px', color: '#4B5563', fontWeight: 500 }}>
                      {m.type}
                    </span>
                    <span style={{ color: '#D1D5DB', fontSize: '12px' }}>•</span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#047857',
                        background: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {m.deposit}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '0 0 6px 0',
                      fontWeight: 800,
                      fontSize: '16px',
                      color: '#1C3524',
                    }}
                  >
                    {m.title}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '12.5px',
                      color: '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#15803D' }}>
                      location_on
                    </span>
                    {m.address}
                  </p>
                </div>

                {/* QR button */}
                <button
                  type="button"
                  onClick={() => setQrModalMatch(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px 18px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(45, 95, 63, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 95, 63, 0.32)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 95, 63, 0.25)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    qr_code_2
                  </span>
                  Mã QR Vào Sân
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== SECTION 4: LFG + SUGGESTED COURTS ===================== */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        {/* LFG Column */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>
                groups
              </span>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C3524' }}>
                Kèo ghép trận LFG ({filteredLfgMatches.length})
              </h2>
            </div>
            <Link
              to="/community"
              style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', fontWeight: 700 }}
            >
              Xem tất cả kèo ›
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredLfgMatches.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 2px 10px rgba(45, 95, 63, 0.04)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 95, 63, 0.09)'
                  e.currentTarget.style.transform = 'translateY(-1.5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(45, 95, 63, 0.04)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={m.img}
                    alt={m.sportName}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      fontSize: '14px',
                      background: '#fff',
                      borderRadius: '50%',
                      padding: '1px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    {m.sportEmoji}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1C3524' }}>
                      {m.sportName}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: m.missingColor,
                        background: '#FEE2E2',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {m.missing}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#4B5563' }}>
                    {m.time}
                  </p>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280' }}>
                    <strong style={{ color: '#15803D' }}>{m.price}</strong> • {m.host}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/community')}
                  style={{
                    background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(45, 95, 63, 0.2)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                >
                  Vào Slot
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Courts Column */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>
                stadium
              </span>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C3524' }}>
                Gợi ý sân trống giờ đẹp ({filteredCourts.length})
              </h2>
            </div>
            <Link
              to="/court-finder"
              style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', fontWeight: 700 }}
            >
              Mở bản đồ sân ›
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCourts.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 2px 10px rgba(45, 95, 63, 0.04)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(45, 95, 63, 0.09)'
                  e.currentTarget.style.transform = 'translateY(-1.5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(45, 95, 63, 0.04)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={c.img}
                    alt={c.name}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      fontSize: '14px',
                      background: '#fff',
                      borderRadius: '50%',
                      padding: '1px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    {c.sportEmoji}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#15803D',
                        background: '#DCFCE7',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {c.slot}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>• {c.dist}</span>
                  </div>
                  <p
                    style={{
                      margin: '0 0 2px 0',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: '#1C3524',
                    }}
                  >
                    {c.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280' }}>
                    {c.price} • {c.rating}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/court-finder')}
                  style={{
                    background: '#EAF7EE',
                    color: '#15803D',
                    border: '1px solid #86EFAC',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#15803D'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#EAF7EE'
                    e.currentTarget.style.color = '#15803D'
                  }}
                >
                  Đặt Sân
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QR CODE MODAL ===================== */}
      {qrModalMatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setQrModalMatch(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#EAF7EE',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                qr_code_2
              </span>
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
              Mã QR Check-in Vào Cổng
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#6B7280' }}>
              Quét tại cổng turnstile IoT tại <strong>{qrModalMatch.title}</strong>
            </p>

            {/* QR Mock graphic */}
            <div
              style={{
                background: '#F9FAFB',
                border: '2px dashed #D1D5DB',
                borderRadius: '16px',
                padding: '20px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrModalMatch.qrCode}`}
                alt="QR Code"
                style={{ width: '160px', height: '160px', display: 'block' }}
              />
              <span
                style={{
                  display: 'block',
                  marginTop: '10px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#15803D',
                  letterSpacing: '1px',
                }}
              >
                {qrModalMatch.qrCode}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#15803D',
                marginBottom: '18px',
                background: '#F0FDF4',
                padding: '8px',
                borderRadius: '10px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                verified_user
              </span>
              <span>Ký quỹ Escrow đã khóa 100% tự động</span>
            </div>

            <button
              type="button"
              onClick={() => setQrModalMatch(null)}
              style={{
                width: '100%',
                padding: '11px',
                background: '#15803D',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ===================== FOOTER ===================== */}
      <footer
        style={{
          borderTop: '1px solid rgba(45, 95, 63, 0.12)',
          paddingTop: '28px',
          marginTop: '12px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '32px',
            marginBottom: '24px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>
                  bolt
                </span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#1C3524' }}>
                SportNexus Vietnam
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              Hệ sinh thái thể thao Cầu Lông &amp; Pickleball tiên phong tích hợp Đặt Sân Tức Thì, Ghép Trận LFG thông minh, Hợp Đồng Ký Quỹ Escrow bảo chứng 100%.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#15803D',
                background: '#EAF7EE',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #86EFAC',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                headset_mic
              </span>
              <span>Hotline Hỗ Trợ 24/7: <strong>0968 950 913</strong></span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <p
              style={{
                fontWeight: 800,
                fontSize: '12px',
                color: '#1C3524',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '10px',
                marginTop: 0,
              }}
            >
              Môn Thể Thao
            </p>
            <p
              style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('badminton')}
            >
              🏸 Cầu Lông Chuẩn BWF
            </p>
            <p
              style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('pickleball')}
            >
              🏓 Pickleball Pro Hub
            </p>
            <p
              style={{ margin: 0, fontSize: '13px', color: '#15803D', fontWeight: 600, cursor: 'pointer' }}
              onClick={selectAllSports}
            >
              ✨ Xem cả 2 môn
            </p>
          </div>

          {/* Col 3 */}
          <div>
            <p
              style={{
                fontWeight: 800,
                fontSize: '12px',
                color: '#1C3524',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '10px',
                marginTop: 0,
              }}
            >
              An Toàn &amp; Ký Quỹ
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563' }}>Chính Sách Escrow</p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563' }}>Cam Kết Chống Bùng Trận</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>Hoàn Tiền 100% Khi Hủy Hợp Lệ</p>
          </div>

          {/* Col 4 */}
          <div>
            <p
              style={{
                fontWeight: 800,
                fontSize: '12px',
                color: '#1C3524',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '10px',
                marginTop: 0,
              }}
            >
              Dành Cho Cụm Sân
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563' }}>Đăng Ký Đối Tác Cụm Sân</p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4B5563' }}>Cổng Kiểm Soát IoT QR</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>Hệ Thống Chia Tiền Tự Động</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(45, 95, 63, 0.08)',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
            © 2026 SportNexus Vietnam Inc. Nền tảng thể thao thông minh thế hệ mới.
          </p>
          <div style={{ display: 'flex', gap: '18px' }}>
            <a href="#" style={{ fontSize: '12px', color: '#4B5563', textDecoration: 'none' }}>
              Điều Khoản Sử Dụng
            </a>
            <a href="#" style={{ fontSize: '12px', color: '#4B5563', textDecoration: 'none' }}>
              Chính Sách Escrow
            </a>
            <a href="#" style={{ fontSize: '12px', color: '#4B5563', textDecoration: 'none' }}>
              Bảo Mật Dữ Liệu
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard