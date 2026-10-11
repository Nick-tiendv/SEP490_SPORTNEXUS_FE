// Dashboard.jsx — SportNexus Player Dashboard
// Thiết kế pastel sáng, năng động, chuyên nghiệp & hỗ trợ lọc linh hoạt theo 5 môn thể thao (Cầu Lông, Pickleball, Bóng Đá, Bóng Rổ, Tennis)

import { useState, useEffect } from 'react'
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
    desc: 'Ghép đội đúng trình độ, cam kết không bùng hẹn.',
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

// =========================================================================
// QUY CHUẨN THÔNG SỐ SÂN THỰC TẾ THEO TIÊU CHUẨN THI ĐẤU QUỐC TẾ CHÍNH THỨC
// =========================================================================
export const SPORT_COURT_STANDARDS = {
  badminton: {
    sportName: 'Cầu Lông',
    federation: 'BWF (Badminton World Federation)',
    courtType: 'Thảm PVC Yonex 5mm đạt chuẩn BWF',
    realDimensions: '13.40m × 6.10m (Đánh đôi) / 5.18m (Đánh đơn)',
    netHeight: '1.55m tại 2 cột trụ biên, 1.524m tại tâm lưới',
    keyFeatures: 'Vạch giao bóng ngắn cách lưới 1.98m • Vạch đôi cách đáy 0.76m • Hành lang đơn 0.46m',
    lighting: '800 - 1000 Lux (Chống chói góc nghiêng)',
  },
  pickleball: {
    sportName: 'Pickleball',
    federation: 'USAPA (USA Pickleball Association)',
    courtType: 'Mặt sân Acrylic Pro 8 lớp kháng lóa & giảm chấn',
    realDimensions: '44ft × 20ft (13.41m × 6.10m)',
    netHeight: '36 inch (0.91m) tại 2 biên, 34 inch (0.86m) tại đai giữa',
    keyFeatures: 'Kitchen (Non-Volley Zone) 7ft (2.13m) mỗi bên • Centerline 15ft từ Kitchen ra Baseline',
    lighting: '600 - 800 Lux (Đèn LED chống chói ngoài trời)',
  },
  football: {
    sportName: 'Bóng Đá Sân 7',
    federation: 'VFF / FIFA Quality Concept for Football Turf',
    courtType: 'Cỏ nhân tạo Monofilament 50mm + Hạt cao su EPDM',
    realDimensions: '50.0m × 30.0m (Tỷ lệ tiêu chuẩn sân 7 người)',
    netHeight: 'Khung thành 6.0m × 2.1m (Lưới dù trắng)',
    keyFeatures: 'Vòng tròn giữa sân R=6.0m • Vòng cấm địa 16.5m × 13.0m • Chấm phạt đền 9.0m',
    lighting: '500 - 750 Lux (Hệ thống đèn pha chuyên dụng)',
  },
  basketball: {
    sportName: 'Bóng Rổ',
    federation: 'FIBA (International Basketball Federation)',
    courtType: 'Sàn gỗ phong Maple Bắc Mỹ thi đấu trong nhà',
    realDimensions: '28.0m × 15.0m (Chuẩn FIBA Official)',
    netHeight: 'Vành rổ cao 3.05m • Bảng kính cường lực 1.80m × 1.05m',
    keyFeatures: 'Cung 3 điểm R=6.75m • Vùng ném phạt (Paint) 5.8m × 4.9m • Vòng ném phạt R=1.80m',
    lighting: '1000 - 1500 Lux (Chuẩn thi đấu chuyên nghiệp)',
  },
  tennis: {
    sportName: 'Tennis',
    federation: 'ITF (International Tennis Federation)',
    courtType: 'Mặt sân cứng DecoTurf US Open / Australian Open',
    realDimensions: '23.77m × 10.97m (Đánh đôi) / 8.23m (Đánh đơn)',
    netHeight: '1.07m tại 2 cột biên, 0.914m tại đai tâm (Center Strap)',
    keyFeatures: 'Vạch giao bóng cách lưới 6.40m • Hành lang đôi 1.37m • Vạch chữ T chia ô Deuce & Ad',
    lighting: '750 - 1000 Lux (Chuẩn Grand Slam & ATP Tour)',
  },
}

// Component minh họa sơ đồ sân chính xác 100% theo tỷ lệ kỹ thuật và quy chuẩn quốc tế
export function SportCourtDiagram({ sport, width = 58, height = 32, style = {}, showDimensions = false }) {
  // -------------------------------------------------------------
  // 1. CẦU LÔNG (BADMINTON) — BWF STANDARD: 13.40m × 6.10m
  // -------------------------------------------------------------
  if (sport === 'badminton') {
    if (showDimensions) {
      // Bản vẽ kỹ thuật Blueprint CAD độ phân giải cao có thước đo chi tiết
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 680 340"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#0F172A', borderRadius: '12px', ...style }}
        >
          <defs>
            <linearGradient id="bwfBlueMat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <pattern id="gridCadBadm" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="680" height="340" fill="#0B132B" rx="12" />
          <rect width="680" height="340" fill="url(#gridCadBadm)" />

          {/* Sân thi đấu chính BWF: 500px = 13.40m (~37.31 px/m), 228px = 6.10m (~37.37 px/m) */}
          {/* Lề ngoài (Surround): x=90..590, y=56..284 */}
          <rect x="74" y="42" width="532" height="256" rx="6" fill="#0D381E" stroke="rgba(74, 222, 128, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
          <text x="80" y="52" fill="#4ADE80" fontSize="8" fontFamily="monospace">VÙNG ĐỆM AN TOÀN BWF (RUNOFF MIN 1.5M)</text>

          {/* Mặt thảm chính BWF */}
          <rect x="90" y="56" width="500" height="228" rx="2" fill="url(#bwfBlueMat)" stroke="#FFFFFF" strokeWidth="2" />

          {/* Vạch đánh đơn (Singles Sidelines cách biên 0.46m ~ 17.2px) */}
          <line x1="90" y1="73.2" x2="590" y2="73.2" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.95" />
          <line x1="90" y1="266.8" x2="590" y2="266.8" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.95" />

          {/* Vạch giao bóng dài đánh đôi (0.76m ~ 28.4px từ baseline) */}
          <line x1="118.4" y1="56" x2="118.4" y2="284" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.95" />
          <line x1="561.6" y1="56" x2="561.6" y2="284" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.95" />

          {/* Vạch giao bóng ngắn (Short service lines cách lưới 1.98m ~ 73.9px) */}
          <line x1="266.1" y1="56" x2="266.1" y2="284" stroke="#FFFFFF" strokeWidth="1.6" />
          <line x1="413.9" y1="56" x2="413.9" y2="284" stroke="#FFFFFF" strokeWidth="1.6" />

          {/* Đường trung tâm (Center line) */}
          <line x1="90" y1="170" x2="266.1" y2="170" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="413.9" y1="170" x2="590" y2="170" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Lưới thi đấu tại tâm x=340 */}
          <line x1="340" y1="48" x2="340" y2="292" stroke="#FACC15" strokeWidth="3" strokeDasharray="3,1.5" />
          <circle cx="340" cy="50" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          <circle cx="340" cy="290" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />

          {/* Chú thích khu vực trên sân */}
          <text x="192" y="125" fill="rgba(255,255,255,0.7)" fontSize="9.5" fontWeight="600" textAnchor="middle">Ô GIAO BÓNG TRÁI</text>
          <text x="192" y="222" fill="rgba(255,255,255,0.7)" fontSize="9.5" fontWeight="600" textAnchor="middle">Ô GIAO BÓNG PHẢI</text>
          <text x="488" y="125" fill="rgba(255,255,255,0.7)" fontSize="9.5" fontWeight="600" textAnchor="middle">Ô GIAO BÓNG PHẢI</text>
          <text x="488" y="222" fill="rgba(255,255,255,0.7)" fontSize="9.5" fontWeight="600" textAnchor="middle">Ô GIAO BÓNG TRÁI</text>

          {/* THƯỚC ĐO KÍCH THƯỚC KỸ THUẬT (DIMENSIONS) */}
          {/* 1. Chiều dài tổng thể trên cùng: 13.40m */}
          <line x1="90" y1="26" x2="590" y2="26" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="90" y1="20" x2="90" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="590" y1="20" x2="590" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="340" y="21" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">13.40m (Chiều dài quy chuẩn BWF)</text>

          {/* 2. Chiều rộng bên trái: 6.10m & 5.18m */}
          <line x1="50" y1="56" x2="50" y2="284" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="44" y1="56" x2="56" y2="56" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="44" y1="284" x2="56" y2="284" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="40" y="174" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 40 174)" fontFamily="monospace">6.10m Đôi / 5.18m Đơn</text>

          {/* 3. Phân đoạn chi tiết phía dưới */}
          <line x1="90" y1="312" x2="118.4" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="104.2" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">0.76m</text>

          <line x1="118.4" y1="312" x2="266.1" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="192.2" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">3.96m</text>

          <line x1="266.1" y1="312" x2="340" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="303" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">1.98m (Cách lưới)</text>

          <line x1="340" y1="312" x2="413.9" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="377" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">1.98m</text>

          <line x1="413.9" y1="312" x2="561.6" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="487.7" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">3.96m</text>

          <line x1="561.6" y1="312" x2="590" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="575.8" y="325" fill="#FDE047" fontSize="8.5" textAnchor="middle">0.76m</text>

          {/* Chiều cao lưới */}
          <text x="340" y="40" fill="#FACC15" fontSize="8.5" fontWeight="bold" textAnchor="middle">LƯỚI: CỘT 1.55M • TÂM 1.524M</text>
        </svg>
      )
    }

    // Thumbnail mode
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 100"
        style={{ borderRadius: '5px', display: 'block', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.18)', ...style }}
        title="Sơ đồ kỹ thuật sân Cầu Lông chuẩn BWF (13.40m × 6.10m)"
      >
        <defs>
          <linearGradient id="badmintonMatGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="100" rx="5" fill="#0F5128" />
        <rect x="10" y="10" width="200" height="80" rx="1.5" fill="url(#badmintonMatGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="10" y1="16" x2="210" y2="16" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.9" />
        <line x1="10" y1="84" x2="210" y2="84" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.9" />
        <line x1="21.3" y1="10" x2="21.3" y2="90" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.9" />
        <line x1="198.7" y1="10" x2="198.7" y2="90" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.9" />
        <line x1="80.5" y1="10" x2="80.5" y2="90" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="139.5" y1="10" x2="139.5" y2="90" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="10" y1="50" x2="80.5" y2="50" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="139.5" y1="50" x2="210" y2="50" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="110" y1="7" x2="110" y2="93" stroke="#FDE047" strokeWidth="1.8" strokeDasharray="2.5,1" />
        <circle cx="110" cy="7.5" r="1.8" fill="#FEF08A" />
        <circle cx="110" cy="92.5" r="1.8" fill="#FEF08A" />
      </svg>
    )
  }

  // -------------------------------------------------------------
  // 2. PICKLEBALL — USAPA STANDARD: 44ft × 20ft (13.41m × 6.10m)
  // -------------------------------------------------------------
  if (sport === 'pickleball') {
    if (showDimensions) {
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 680 340"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#0F172A', borderRadius: '12px', ...style }}
        >
          <defs>
            <linearGradient id="pckBlueCad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="pckKitchenCad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
            <pattern id="gridCadPck" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="680" height="340" fill="#0B132B" rx="12" />
          <rect width="680" height="340" fill="url(#gridCadPck)" />

          {/* Vùng ngoài sân an toàn */}
          <rect x="74" y="44" width="532" height="252" rx="6" fill="#075985" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
          <text x="80" y="54" fill="#38BDF8" fontSize="8" fontFamily="monospace">KHU VỰC CHẠY NGOÀI SÂN AN TOÀN (RUNOFF AREA)</text>

          {/* Sân chính USAPA: 500px = 44ft (~11.36 px/ft), 227px = 20ft (~11.36 px/ft) */}
          <rect x="90" y="60" width="500" height="227" rx="2" fill="url(#pckBlueCad)" stroke="#FFFFFF" strokeWidth="2" />

          {/* Khu vực Kitchen (Non-Volley Zone) 7ft (79.5px) mỗi bên từ lưới x=340 */}
          {/* Kitchen rộng 159px từ x=260.5 đến x=419.5 */}
          <rect x="260.5" y="60" width="159" height="227" fill="url(#pckKitchenCad)" />
          <line x1="260.5" y1="60" x2="260.5" y2="287" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="419.5" y1="60" x2="419.5" y2="287" stroke="#FFFFFF" strokeWidth="2" />

          {/* Đường trung tâm (Centerline) chia ô giao bóng CHỈ NẰM NGOÀI KITCHEN */}
          <line x1="90" y1="173.5" x2="260.5" y2="173.5" stroke="#FFFFFF" strokeWidth="1.8" />
          <line x1="419.5" y1="173.5" x2="590" y2="173.5" stroke="#FFFFFF" strokeWidth="1.8" />

          {/* Lưới Pickleball tại tâm x=340 */}
          <line x1="340" y1="52" x2="340" y2="295" stroke="#FDE047" strokeWidth="3" strokeDasharray="3,1.5" />
          <circle cx="340" cy="54" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          <circle cx="340" cy="293" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          {/* Dây đai giữa giữ lưới (Center strap 34 inch) */}
          <rect x="337" y="165" width="6" height="17" fill="#FFFFFF" rx="1.5" />

          {/* Nhãn ký hiệu khu vực */}
          <text x="340" y="125" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">THE KITCHEN</text>
          <text x="340" y="142" fill="#E0F2FE" fontSize="8" textAnchor="middle">NON-VOLLEY ZONE</text>
          <text x="175" y="125" fill="rgba(255,255,255,0.8)" fontSize="9.5" fontWeight="600" textAnchor="middle">RIGHT SERVICE AREA</text>
          <text x="175" y="230" fill="rgba(255,255,255,0.8)" fontSize="9.5" fontWeight="600" textAnchor="middle">LEFT SERVICE AREA</text>
          <text x="505" y="125" fill="rgba(255,255,255,0.8)" fontSize="9.5" fontWeight="600" textAnchor="middle">LEFT SERVICE AREA</text>
          <text x="505" y="230" fill="rgba(255,255,255,0.8)" fontSize="9.5" fontWeight="600" textAnchor="middle">RIGHT SERVICE AREA</text>

          {/* KÍCH THƯỚC QUY CHUẨN KỸ THUẬT */}
          {/* Chiều dài tổng thể trên cùng: 44 ft / 13.41m */}
          <line x1="90" y1="26" x2="590" y2="26" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="90" y1="20" x2="90" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="590" y1="20" x2="590" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="340" y="21" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">44 ft (13.41m) — USAPA Regulation Length</text>

          {/* Chiều rộng bên trái: 20 ft / 6.10m */}
          <line x1="50" y1="60" x2="50" y2="287" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="44" y1="60" x2="56" y2="60" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="44" y1="287" x2="56" y2="287" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="40" y="174" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 40 174)" fontFamily="monospace">20 ft (6.10m)</text>

          {/* Phân đoạn phía dưới: 15ft - 7ft - 7ft - 15ft */}
          <line x1="90" y1="312" x2="260.5" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="175" y="325" fill="#FDE047" fontSize="9" textAnchor="middle">15 ft (4.57m)</text>

          <line x1="260.5" y1="312" x2="340" y2="312" stroke="#34D399" strokeWidth="1.2" />
          <text x="300" y="325" fill="#34D399" fontSize="9" fontWeight="bold" textAnchor="middle">7 ft</text>

          <line x1="340" y1="312" x2="419.5" y2="312" stroke="#34D399" strokeWidth="1.2" />
          <text x="380" y="325" fill="#34D399" fontSize="9" fontWeight="bold" textAnchor="middle">7 ft (Kitchen)</text>

          <line x1="419.5" y1="312" x2="590" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="505" y="325" fill="#FDE047" fontSize="9" textAnchor="middle">15 ft (4.57m)</text>

          <text x="340" y="44" fill="#FACC15" fontSize="8.5" fontWeight="bold" textAnchor="middle">LƯỚI: 36 INCH (0.91M) BIÊN • 34 INCH (0.86M) TÂM</text>
        </svg>
      )
    }

    // Thumbnail mode
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 100"
        style={{ borderRadius: '5px', display: 'block', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.18)', ...style }}
        title="Sơ đồ kỹ thuật sân Pickleball chuẩn USAPA (44ft × 20ft)"
      >
        <defs>
          <linearGradient id="pckMatGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="pckKitchenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="100" rx="5" fill="#075985" />
        <rect x="10" y="10" width="200" height="80" rx="1.5" fill="url(#pckMatGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
        <rect x="78.2" y="10" width="63.6" height="80" fill="url(#pckKitchenGrad)" />
        <line x1="78.2" y1="10" x2="78.2" y2="90" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="141.8" y1="10" x2="141.8" y2="90" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="10" y1="50" x2="78.2" y2="50" stroke="#FFFFFF" strokeWidth="1.0" />
        <line x1="141.8" y1="50" x2="210" y2="50" stroke="#FFFFFF" strokeWidth="1.0" />
        <line x1="110" y1="7" x2="110" y2="93" stroke="#FDE047" strokeWidth="1.8" strokeDasharray="3,1" />
        <circle cx="110" cy="7.5" r="1.8" fill="#FEF08A" />
        <circle cx="110" cy="92.5" r="1.8" fill="#FEF08A" />
        <rect x="108.8" y="46.5" width="2.4" height="7" fill="#FFFFFF" rx="0.5" />
      </svg>
    )
  }

  // -------------------------------------------------------------
  // 3. BÓNG ĐÁ (FOOTBALL) — VFF / FIFA SÂN 7: 50.0m × 30.0m
  // -------------------------------------------------------------
  if (sport === 'football') {
    if (showDimensions) {
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 680 420"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#0F172A', borderRadius: '12px', ...style }}
        >
          <defs>
            <linearGradient id="fbGrassDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="fbGrassLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <pattern id="gridCadFb" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="680" height="420" fill="#0B132B" rx="12" />
          <rect width="680" height="420" fill="url(#gridCadFb)" />

          {/* Vùng ngoài đường pitch */}
          <rect x="64" y="40" width="552" height="342" rx="6" fill="#14532D" stroke="rgba(74, 222, 128, 0.4)" strokeWidth="1" strokeDasharray="4,4" />

          {/* Sân cỏ thi đấu chính: 520px = 50.0m (10.4 px/m), 312px = 30.0m (10.4 px/m) */}
          <rect x="80" y="55" width="520" height="312" rx="2" fill="url(#fbGrassDark)" stroke="#FFFFFF" strokeWidth="2" />
          {/* Các dải cỏ so le như sân vận động thật */}
          {[1, 3, 5, 7, 9].map((i) => (
            <rect key={i} x={80 + i * 52} y="55" width="52" height="312" fill="url(#fbGrassLight)" opacity="0.3" />
          ))}

          {/* Đường giữa sân & vòng tròn tâm R=6.0m (62.4px) */}
          <line x1="340" y1="55" x2="340" y2="367" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="340" cy="211" r="62.4" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="340" cy="211" r="3" fill="#FFFFFF" />

          {/* Vòng cấm địa (Penalty Box): 16.5m × 13.0m (171.6px × 135.2px) */}
          {/* Trái */}
          <rect x="80" y="125.2" width="135.2" height="171.6" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="173.6" cy="211" r="3" fill="#FFFFFF" />
          <path d="M 215.2 165 A 62.4 62.4 0 0 1 215.2 257" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Khung thành trái (6.0m × 2.1m -> 62.4px) */}
          <rect x="64" y="179.8" width="16" height="62.4" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

          {/* Phải */}
          <rect x="464.8" y="125.2" width="135.2" height="171.6" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="506.4" cy="211" r="3" fill="#FFFFFF" />
          <path d="M 464.8 165 A 62.4 62.4 0 0 0 464.8 257" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Khung thành phải */}
          <rect x="600" y="179.8" width="16" height="62.4" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

          {/* 4 Cung phạt góc R=1.0m (10.4px) */}
          <path d="M 80 65.4 A 10.4 10.4 0 0 1 90.4 55" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 80 356.6 A 10.4 10.4 0 0 0 90.4 367" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 600 65.4 A 10.4 10.4 0 0 0 589.6 55" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 600 356.6 A 10.4 10.4 0 0 1 589.6 367" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Chú thích thông số trên sân */}
          <text x="340" y="195" fill="rgba(255,255,255,0.8)" fontSize="9.5" fontWeight="bold" textAnchor="middle">VÒNG TRÒN TRUNG TÂM</text>
          <text x="340" y="235" fill="#FDE047" fontSize="9" textAnchor="middle">BÁN KÍNH R = 6.0M</text>
          <text x="145" y="145" fill="rgba(255,255,255,0.85)" fontSize="9" textAnchor="middle">VÒNG CẤM 16.5M × 13.0M</text>
          <text x="173.6" y="232" fill="#FDE047" fontSize="8.5" textAnchor="middle">CHẤM 9M</text>

          {/* KÍCH THƯỚC QUY CHUẨN */}
          {/* Chiều dài 50.0m */}
          <line x1="80" y1="26" x2="600" y2="26" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="80" y1="20" x2="80" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="600" y1="20" x2="600" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="340" y="21" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">50.0m (Tiêu chuẩn sân 7 người VFF / FIFA)</text>

          {/* Chiều rộng 30.0m */}
          <line x1="40" y1="55" x2="40" y2="367" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="34" y1="55" x2="46" y2="55" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="34" y1="367" x2="46" y2="367" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="30" y="211" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 30 211)" fontFamily="monospace">30.0m (Chiều rộng sân)</text>

          {/* Phía dưới: thông số khung thành */}
          <text x="340" y="398" fill="#FACC15" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            KHUNG THÀNH: 6.0M × 2.1M • ĐIỂM PHẠT ĐỀN CÁCH GÔN: 9.0M • CỎ MONOFILAMENT 50MM
          </text>
        </svg>
      )
    }

    // Thumbnail mode
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 132"
        style={{ borderRadius: '5px', display: 'block', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.18)', ...style }}
        title="Sơ đồ kỹ thuật sân Bóng Đá 7 người chuẩn FIFA / VFF (50m × 30m)"
      >
        <defs>
          <linearGradient id="fbGrassGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="fbGrassGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="132" rx="5" fill="#14532D" />
        <rect x="10" y="10" width="200" height="112" rx="2" fill="url(#fbGrassGrad1)" stroke="#FFFFFF" strokeWidth="1.2" />
        {[1, 3, 5, 7].map((i) => (
          <rect key={i} x={10 + i * 25} y="10" width="25" height="112" fill="url(#fbGrassGrad2)" opacity="0.32" />
        ))}
        <line x1="110" y1="10" x2="110" y2="122" stroke="#FFFFFF" strokeWidth="1.1" />
        <circle cx="110" cy="66" r="24" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
        <circle cx="110" cy="66" r="1.6" fill="#FFFFFF" />
        <rect x="10" y="36" width="28" height="60" fill="none" stroke="#FFFFFF" strokeWidth="1.0" />
        <circle cx="44" cy="66" r="1.4" fill="#FFFFFF" />
        <path d="M 38 52 A 15 15 0 0 1 38 80" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <rect x="4" y="52" width="6" height="28" fill="none" stroke="#FFFFFF" strokeWidth="1.3" />
        <rect x="182" y="36" width="28" height="60" fill="none" stroke="#FFFFFF" strokeWidth="1.0" />
        <circle cx="176" cy="66" r="1.4" fill="#FFFFFF" />
        <path d="M 182 52 A 15 15 0 0 0 182 80" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <rect x="210" y="52" width="6" height="28" fill="none" stroke="#FFFFFF" strokeWidth="1.3" />
        <path d="M 10 16 A 6 6 0 0 1 16 10" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <path d="M 10 116 A 6 6 0 0 0 16 122" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <path d="M 210 16 A 6 6 0 0 0 204 10" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
        <path d="M 210 116 A 6 6 0 0 1 204 122" fill="none" stroke="#FFFFFF" strokeWidth="0.9" />
      </svg>
    )
  }

  // -------------------------------------------------------------
  // 4. BÓNG RỔ (BASKETBALL) — FIBA STANDARD: 28.0m × 15.0m
  // -------------------------------------------------------------
  if (sport === 'basketball') {
    if (showDimensions) {
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 680 390"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#0F172A', borderRadius: '12px', ...style }}
        >
          <defs>
            <linearGradient id="hardwoodCad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="paintCadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9A3412" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
            <pattern id="gridCadBb" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="680" height="390" fill="#0B132B" rx="12" />
          <rect width="680" height="390" fill="url(#gridCadBb)" />

          {/* Vùng ngoài đường biên */}
          <rect x="64" y="40" width="552" height="308" rx="6" fill="#78350F" stroke="rgba(251, 146, 60, 0.4)" strokeWidth="1" strokeDasharray="4,4" />

          {/* Sân bóng rổ chính FIBA: 520px = 28.0m (18.57 px/m), 278.5px = 15.0m (18.57 px/m) */}
          <rect x="80" y="55" width="520" height="278.5" rx="2" fill="url(#hardwoodCad)" stroke="#FFFFFF" strokeWidth="2" />

          {/* Đường giữa sân & vòng tròn tâm R=1.80m (33.4px) */}
          <line x1="340" y1="55" x2="340" y2="333.5" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="340" cy="194.25" r="33.4" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />

          {/* VÙNG NÉM PHẠT (KEY / PAINT): 5.80m × 4.90m (107.7px × 91.0px) */}
          {/* Trái */}
          <rect x="80" y="148.75" width="107.7" height="91" fill="url(#paintCadGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="187.7" cy="194.25" r="33.4" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="4,3" />
          {/* Cung 3 điểm FIBA trái (R=6.75m ~ 125.3px từ tâm rổ x=109.2) */}
          <path d="M 80 71.7 L 126 71.7 A 125.3 125.3 0 0 1 126 316.8 L 80 316.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          {/* Bảng rổ & Vành rổ trái */}
          <line x1="102.3" y1="177" x2="102.3" y2="211.5" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx="109.2" cy="194.25" r="5" fill="none" stroke="#F97316" strokeWidth="2" />

          {/* Phải */}
          <rect x="492.3" y="148.75" width="107.7" height="91" fill="url(#paintCadGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="492.3" cy="194.25" r="33.4" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="4,3" />
          {/* Cung 3 điểm FIBA phải */}
          <path d="M 600 71.7 L 554 71.7 A 125.3 125.3 0 0 0 554 316.8 L 600 316.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          {/* Bảng rổ & Vành rổ phải */}
          <line x1="577.7" y1="177" x2="577.7" y2="211.5" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx="490.8" cy="194.25" r="5" fill="none" stroke="#F97316" strokeWidth="2" />

          {/* Chú thích kỹ thuật */}
          <text x="340" y="180" fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="bold" textAnchor="middle">VÒNG TRÒN GIỮA SÂN</text>
          <text x="340" y="215" fill="#FDE047" fontSize="8.5" textAnchor="middle">ĐƯỜNG KÍNH 3.60M (R=1.80M)</text>
          <text x="133.8" y="198" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">THE KEY (5.8M × 4.9M)</text>
          <text x="210" y="95" fill="#FDE047" fontSize="9" textAnchor="middle">CUNG 3 ĐIỂM FIBA (R = 6.75M)</text>

          {/* KÍCH THƯỚC QUY CHUẨN */}
          <line x1="80" y1="26" x2="600" y2="26" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="80" y1="20" x2="80" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="600" y1="20" x2="600" y2="32" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="340" y="21" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">28.0m (Quy chuẩn FIBA Official)</text>

          <line x1="40" y1="55" x2="40" y2="333.5" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="34" y1="55" x2="46" y2="55" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="34" y1="333.5" x2="46" y2="333.5" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="30" y="194" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 30 194)" fontFamily="monospace">15.0m (Chiều rộng)</text>

          <text x="340" y="368" fill="#FACC15" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            VÀNH RỔ CAO 3.05M • BẢNG KÍNH 1.80M × 1.05M • SÀN GỖ PHONG MAPLE CAO CẤP
          </text>
        </svg>
      )
    }

    // Thumbnail mode
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 118"
        style={{ borderRadius: '5px', display: 'block', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.18)', ...style }}
        title="Sơ đồ kỹ thuật sân Bóng Rổ chuẩn FIBA (28.0m × 15.0m)"
      >
        <defs>
          <linearGradient id="hardwoodGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="paintAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="118" rx="5" fill="#78350F" />
        <rect x="10" y="10" width="200" height="98" rx="2" fill="url(#hardwoodGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="110" y1="10" x2="110" y2="108" stroke="#FFFFFF" strokeWidth="1.1" />
        <circle cx="110" cy="59" r="16" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
        <rect x="10" y="41.5" width="41.4" height="35" fill="url(#paintAreaGrad)" stroke="#FFFFFF" strokeWidth="1.0" />
        <circle cx="51.4" cy="59" r="12.8" fill="none" stroke="#FFFFFF" strokeWidth="1.0" strokeDasharray="3,2" />
        <path d="M 10 22 L 28 22 A 48.2 48.2 0 0 1 28 96 L 10 96" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
        <line x1="18.5" y1="51" x2="18.5" y2="67" stroke="#FFFFFF" strokeWidth="2.4" />
        <circle cx="21.2" cy="59" r="3.2" fill="none" stroke="#F97316" strokeWidth="1.4" />
        <rect x="168.6" y="41.5" width="41.4" height="35" fill="url(#paintAreaGrad)" stroke="#FFFFFF" strokeWidth="1.0" />
        <circle cx="168.6" cy="59" r="12.8" fill="none" stroke="#FFFFFF" strokeWidth="1.0" strokeDasharray="3,2" />
        <path d="M 210 22 L 192 22 A 48.2 48.2 0 0 0 192 96 L 210 96" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
        <line x1="201.5" y1="51" x2="201.5" y2="67" stroke="#FFFFFF" strokeWidth="2.4" />
        <circle cx="198.8" cy="59" r="3.2" fill="none" stroke="#F97316" strokeWidth="1.4" />
      </svg>
    )
  }

  // -------------------------------------------------------------
  // 5. TENNIS — ITF GRAND SLAM STANDARD: 23.77m × 10.97m (8.23m Đơn)
  // -------------------------------------------------------------
  if (sport === 'tennis') {
    if (showDimensions) {
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 680 340"
          style={{ width: '100%', height: 'auto', display: 'block', background: '#0F172A', borderRadius: '12px', ...style }}
        >
          <defs>
            <linearGradient id="tennisOuterCad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>
            <linearGradient id="tennisInnerCad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <pattern id="gridCadTn" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="680" height="340" fill="#0B132B" rx="12" />
          <rect width="680" height="340" fill="url(#gridCadTn)" />

          {/* Vùng ngoài sân DecoTurf Green */}
          <rect x="64" y="40" width="552" height="260" rx="6" fill="url(#tennisOuterCad)" stroke="rgba(74, 222, 128, 0.4)" strokeWidth="1" strokeDasharray="4,4" />

          {/* Sân thi đấu chính US Open Blue: 520px = 23.77m (21.88 px/m), 240px = 10.97m (21.88 px/m) */}
          <rect x="80" y="50" width="520" height="240" rx="2" fill="url(#tennisInnerCad)" stroke="#FFFFFF" strokeWidth="2" />

          {/* Hành lang đánh đôi (Doubles Alleys: 1.37m ~ 30px mỗi bên) */}
          <line x1="80" y1="80" x2="600" y2="80" stroke="#FFFFFF" strokeWidth="1.6" />
          <line x1="80" y1="260" x2="600" y2="260" stroke="#FFFFFF" strokeWidth="1.6" />

          {/* Vạch giao bóng (Service lines cách lưới 6.40m ~ 140px) */}
          <line x1="200" y1="80" x2="200" y2="260" stroke="#FFFFFF" strokeWidth="1.8" />
          <line x1="480" y1="80" x2="480" y2="260" stroke="#FFFFFF" strokeWidth="1.8" />

          {/* Vạch chữ T trung tâm (Center service line) */}
          <line x1="200" y1="170" x2="480" y2="170" stroke="#FFFFFF" strokeWidth="1.8" />

          {/* Dấu tâm Baseline (Center marks) */}
          <line x1="80" y1="170" x2="90" y2="170" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="590" y1="170" x2="600" y2="170" stroke="#FFFFFF" strokeWidth="2" />

          {/* Lưới Tennis tại tâm x=340 */}
          <line x1="340" y1="42" x2="340" y2="298" stroke="#FDE047" strokeWidth="3" strokeDasharray="3,1.5" />
          <circle cx="340" cy="44" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          <circle cx="340" cy="296" r="4.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          {/* Đai tâm (Center Strap 0.914m) */}
          <rect x="337" y="162" width="6" height="16" fill="#FFFFFF" rx="1.5" />

          {/* Chú thích các ô giao bóng */}
          <text x="270" y="130" fill="rgba(255,255,255,0.85)" fontSize="9.5" fontWeight="bold" textAnchor="middle">DEUCE COURT</text>
          <text x="270" y="215" fill="rgba(255,255,255,0.85)" fontSize="9.5" fontWeight="bold" textAnchor="middle">AD COURT</text>
          <text x="410" y="130" fill="rgba(255,255,255,0.85)" fontSize="9.5" fontWeight="bold" textAnchor="middle">AD COURT</text>
          <text x="410" y="215" fill="rgba(255,255,255,0.85)" fontSize="9.5" fontWeight="bold" textAnchor="middle">DEUCE COURT</text>
          <text x="140" y="68" fill="#FDE047" fontSize="8" textAnchor="middle">HÀNH LANG ĐÔI 1.37M</text>

          {/* KÍCH THƯỚC QUY CHUẨN */}
          <line x1="80" y1="24" x2="600" y2="24" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="80" y1="18" x2="80" y2="30" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="600" y1="18" x2="600" y2="30" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="340" y="19" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">23.77m (78 ft) — Chuẩn ITF Grand Slam</text>

          <line x1="45" y1="50" x2="45" y2="290" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="39" y1="50" x2="51" y2="50" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="39" y1="290" x2="51" y2="290" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="35" y="170" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" transform="rotate(-90 35 170)" fontFamily="monospace">10.97m Đôi / 8.23m Đơn</text>

          {/* Phía dưới: Vạch giao bóng 6.40m */}
          <line x1="200" y1="312" x2="340" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="270" y="324" fill="#FDE047" fontSize="9" textAnchor="middle">6.40m (21 ft cách lưới)</text>

          <line x1="340" y1="312" x2="480" y2="312" stroke="#FDE047" strokeWidth="1" />
          <text x="410" y="324" fill="#FDE047" fontSize="9" textAnchor="middle">6.40m (21 ft cách lưới)</text>

          <text x="340" y="38" fill="#FACC15" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            LƯỚI: CỘT BIÊN 1.07M • TÂM LƯỚI (STRAP) 0.914M • MẶT DECOTURF
          </text>
        </svg>
      )
    }

    // Thumbnail mode
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 102"
        style={{ borderRadius: '5px', display: 'block', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.18)', ...style }}
        title="Sơ đồ kỹ thuật sân Tennis chuẩn ITF Grand Slam (23.77m × 10.97m)"
      >
        <defs>
          <linearGradient id="tennisOuterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="tennisInnerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="102" rx="5" fill="url(#tennisOuterGrad)" />
        <rect x="10" y="10" width="200" height="82" fill="url(#tennisInnerGrad)" stroke="#FFFFFF" strokeWidth="1.3" />
        <line x1="10" y1="20.2" x2="210" y2="20.2" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="10" y1="81.8" x2="210" y2="81.8" stroke="#FFFFFF" strokeWidth="0.9" />
        <line x1="110" y1="8" x2="110" y2="94" stroke="#FDE047" strokeWidth="1.8" strokeDasharray="3,1" />
        <circle cx="110" cy="8.5" r="1.8" fill="#FEF08A" />
        <circle cx="110" cy="93.5" r="1.8" fill="#FEF08A" />
        <rect x="108.8" y="47.5" width="2.4" height="7" fill="#FFFFFF" rx="0.5" />
        <line x1="56.2" y1="20.2" x2="56.2" y2="81.8" stroke="#FFFFFF" strokeWidth="1.0" />
        <line x1="163.8" y1="20.2" x2="163.8" y2="81.8" stroke="#FFFFFF" strokeWidth="1.0" />
        <line x1="56.2" y1="51" x2="163.8" y2="51" stroke="#FFFFFF" strokeWidth="1.0" />
        <line x1="10" y1="51" x2="14" y2="51" stroke="#FFFFFF" strokeWidth="1.2" />
        <line x1="206" y1="51" x2="210" y2="51" stroke="#FFFFFF" strokeWidth="1.2" />
      </svg>
    )
  }

  return null
}

// Dữ liệu trận đấu kế tiếp của cả 5 môn thể thao
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
    surface: 'Thảm PVC Yonex 5mm',
    deposit: 'Đã đặt cọc: 60.000 đ',
    title: 'Cầu Lông Bình Thạnh Arena — Sân Yonex BWF 03',
    address: 'Số 18/2 Chu Văn An, Bình Thạnh (Cách 1.5km) • Đủ 4/4 người',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=320&h=320&fit=crop',
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
    type: 'Pickleball Đôi Nam Nữ • Trình Khá',
    surface: 'Mặt Acrylic Pro USAPA 8 Lớp',
    deposit: 'Đã đặt cọc: 80.000 đ',
    title: 'Pickleball D-Dink Hub Thảo Điền — Sân Pro USAPA 02',
    address: 'Số 28 Thảo Điền, TP. Thủ Đức (Cách 2.3km) • Đủ 4/4 người',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=320&h=320&fit=crop',
    qrCode: 'SNX-PCK-4412',
  },
  {
    id: 'up-3',
    sport: 'football',
    sportName: 'Bóng Đá',
    sportEmoji: '⚽',
    sportBadgeBg: '#EFF6FF',
    sportBadgeColor: '#2563EB',
    time: '19:00 Ngày mai (90 phút)',
    type: 'Bóng Đá Sân 7 Giao Hữu • Trình Khá',
    surface: 'Cỏ Nhân Tạo 50mm Chuẩn FIFA',
    deposit: 'Đã đặt cọc: 120.000 đ',
    title: 'Sân Bóng Đá Chảo Lửa Tân Bình — Sân Số 02',
    address: 'Số 30 Phan Thúc Duyện, Tân Bình (Cách 2.4km) • Đủ 14/14 người',
    img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=320&h=320&fit=crop',
    qrCode: 'SNX-FTB-8832',
  },
  {
    id: 'up-4',
    sport: 'basketball',
    sportName: 'Bóng Rổ',
    sportEmoji: '🏀',
    sportBadgeBg: '#FFF7ED',
    sportBadgeColor: '#EA580C',
    time: '18:30 Tối thứ 7 (120 phút)',
    type: 'Bóng Rổ 5x5 • Trình Bán Chuyên',
    surface: 'Sàn Gỗ Phong Maple Pro Giảm Chấn',
    deposit: 'Đã đặt cọc: 100.000 đ',
    title: 'SSA Arena Thảo Điền — Sân Trong Nhà FIBA',
    address: 'Số 189 Quốc Hương, Thảo Điền (Cách 3.0km) • Đủ 10/10 người',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=320&h=320&fit=crop',
    qrCode: 'SNX-BKB-7719',
  },
  {
    id: 'up-5',
    sport: 'tennis',
    sportName: 'Tennis',
    sportEmoji: '🎾',
    sportBadgeBg: '#F7FEE7',
    sportBadgeColor: '#65A30D',
    time: '06:00 Sáng chủ nhật (120 phút)',
    type: 'Tennis Đôi Nam • Trình Khá',
    surface: 'Mặt Sân Cứng DecoTurf US Open',
    deposit: 'Đã đặt cọc: 90.000 đ',
    title: 'CLB Tennis Lan Anh Quận 10 — Sân Quốc Tế 01',
    address: 'Số 291 Cách Mạng Tháng 8, Quận 10 (Cách 1.8km) • Đủ 4/4 người',
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=320&h=320&fit=crop',
    qrCode: 'SNX-TNS-6604',
  },
]

// Dữ liệu kèo ghép trận LFG cho 5 môn với hình ảnh riêng biệt
const allLfgMatches = [
  {
    id: 'lfg-1',
    sport: 'pickleball',
    sportName: 'Pickleball Đôi D-Dink',
    sportEmoji: '🏓',
    missing: 'Thiếu 1 người',
    missingColor: '#DC2626',
    time: '20:30 Hôm nay • CLB Phú Mỹ Hưng (1.2 km)',
    price: '55.000 đ / người',
    host: 'Host Tuấn Hoàng (Trình Khá)',
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
    host: 'Host Linh (Trình Khá - Nâng cao)',
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
    host: 'Host Quỳnh Anh (Trình Trung bình)',
    img: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=100&h=100&fit=crop',
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
    host: 'Host Hoàng Nam (Trình Bán chuyên)',
    img: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=100&h=100&fit=crop',
    badge: 'Cạnh Tranh Cao',
  },
  {
    id: 'lfg-5',
    sport: 'football',
    sportName: 'Bóng Đá Kèo Sân 7 Giao Lưu',
    sportEmoji: '⚽',
    missing: 'Thiếu 3 người',
    missingColor: '#2563EB',
    time: '20:00 Tối nay • Sân SportZone Q.7 (2.5 km)',
    price: '65.000 đ / người',
    host: 'Host Minh Nhật (Vui vẻ hòa đồng)',
    img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=100&h=100&fit=crop',
    badge: 'Cỏ Chuẩn FIFA',
  },
  {
    id: 'lfg-6',
    sport: 'basketball',
    sportName: 'Bóng Rổ Bán Chuyên 3x3',
    sportEmoji: '🏀',
    missing: 'Thiếu 2 người',
    missingColor: '#EA580C',
    time: '18:30 Tối mai • Sân SSA Thảo Điền (3.0 km)',
    price: '55.000 đ / người',
    host: 'Host Tuấn Kiệt (Trình Bán chuyên)',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop',
    badge: 'Sàn Pro Trong Nhà',
  },
  {
    id: 'lfg-7',
    sport: 'tennis',
    sportName: 'Tennis Đôi Nam Nữ Giao Lưu',
    sportEmoji: '🎾',
    missing: 'Thiếu 1 người',
    missingColor: '#65A30D',
    time: '06:00 Sáng chủ nhật • CLB Lan Anh Q.10 (1.5 km)',
    price: '80.000 đ / người',
    host: 'Host Thanh Trúc (Trình Khá)',
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=100&h=100&fit=crop',
    badge: 'Mặt Sân Cứng',
  },
  {
    id: 'lfg-8',
    sport: 'football',
    sportName: 'Bóng Đá Mini Sân 5 Tốc Độ',
    sportEmoji: '⚽',
    missing: 'Thiếu 2 người',
    missingColor: '#2563EB',
    time: '21:00 Tối mai • Sân Chảo Lửa Tân Bình (2.4 km)',
    price: '50.000 đ / người',
    host: 'Host Quang Huy (Trình Khá)',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&h=100&fit=crop',
    badge: 'Cỏ Đèn LED Đêm',
  },
  {
    id: 'lfg-9',
    sport: 'basketball',
    sportName: 'Bóng Rổ Phủi Full Court 5x5',
    sportEmoji: '🏀',
    missing: 'Thiếu 3 người',
    missingColor: '#EA580C',
    time: '17:00 Chủ nhật • Sân Cung Thiếu Nhi Q.1 (1.8 km)',
    price: '40.000 đ / người',
    host: 'Host Đức Anh (Trình Phong trào)',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
    badge: 'Mặt Cao Su EPDM',
  },
  {
    id: 'lfg-10',
    sport: 'tennis',
    sportName: 'Tennis Rally Rèn Kỹ Năng',
    sportEmoji: '🎾',
    missing: 'Thiếu 1 người',
    missingColor: '#65A30D',
    time: '17:30 Tối nay • Sân Sunrise City Q.7 (2.1 km)',
    price: '95.000 đ / người',
    host: 'Host Hoàng Long (Trình Khá - Chắc tay)',
    img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&h=100&fit=crop',
    badge: 'Sân Resort Cao Cấp',
  },
]

// Dữ liệu gợi ý sân trống với hình minh họa và mặt sân riêng biệt cho từng sân của mỗi môn
const allSuggestedCourts = [
  {
    id: 'court-1',
    sport: 'pickleball',
    sportEmoji: '🏓',
    slot: 'Trống 18:00 - 19:30',
    dist: 'Cách 1.5 km',
    name: 'Pickleball Hub Q.7',
    surface: 'Mặt Acrylic Pro USAPA 2 màu • Kitchen Zone 7ft',
    price: '180.000 đ/h • Chuẩn USAPA Pro',
    rating: '4.9 ★ (512 đánh giá)',
    img: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=200&h=200&fit=crop',
  },
  {
    id: 'court-2',
    sport: 'badminton',
    sportEmoji: '🏸',
    slot: 'Trống 19:00 - 21:00',
    dist: 'Cách 3.1 km',
    name: 'Cầu Lông Bình Thạnh Arena',
    surface: 'Thảm PVC BWF Yonex giảm chấn • Đèn chống lóa',
    price: '120.000 đ/h • Thảm BWF Yonex',
    rating: '4.8 ★ (340 đánh giá)',
    img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&h=200&fit=crop',
  },
  {
    id: 'court-3',
    sport: 'pickleball',
    sportEmoji: '🏓',
    slot: 'Trống 20:00 - 22:00',
    dist: 'Cách 2.8 km',
    name: 'Pickleball Saigon D-Dink Park Thủ Đức',
    surface: 'Cụm 8 Sân USAPA Ngoài Trời • Đèn LED Chuyên Dụng',
    price: '160.000 đ/h • 8 Sân Đèn LED Ngoài Trời',
    rating: '4.9 ★ (210 đánh giá)',
    img: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=200&h=200&fit=crop',
  },
  {
    id: 'court-4',
    sport: 'badminton',
    sportEmoji: '🏸',
    slot: 'Trống 17:30 - 19:00',
    dist: 'Cách 2.0 km',
    name: 'CLB Cầu Lông Đào Duy Anh Phú Nhuận',
    surface: '6 Sân Thảm Tiêu Chuẩn Thi Đấu • Trần Cao 10m',
    price: '110.000 đ/h • 6 Sân Chuẩn Thi Đấu',
    rating: '4.7 ★ (185 đánh giá)',
    img: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=200&h=200&fit=crop',
  },
  {
    id: 'court-5',
    sport: 'football',
    sportEmoji: '⚽',
    slot: 'Trống 19:00 - 21:00',
    dist: 'Cách 2.4 km',
    name: 'Sân Bóng Đá Chảo Lửa Tân Bình',
    surface: 'Cụm 8 Sân 5 & 7 Cỏ Nhân Tạo • Đèn Pha 1000W',
    price: '300.000 đ/h • Cụm 8 Sân Cỏ Nhân Tạo',
    rating: '4.9 ★ (420 đánh giá)',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&h=200&fit=crop',
  },
  {
    id: 'court-6',
    sport: 'basketball',
    sportEmoji: '🏀',
    slot: 'Trống 18:00 - 20:00',
    dist: 'Cách 3.0 km',
    name: 'Sân Bóng Rổ SSA Thảo Điền',
    surface: 'Sàn Gỗ Phong Maple Pro • Trụ Kính FIBA',
    price: '280.000 đ/h • Sàn Thi Đấu Trong Nhà',
    rating: '4.8 ★ (195 đánh giá)',
    img: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=200&h=200&fit=crop',
  },
  {
    id: 'court-7',
    sport: 'tennis',
    sportEmoji: '🎾',
    slot: 'Trống 17:00 - 19:00',
    dist: 'Cách 1.8 km',
    name: 'CLB Tennis Lan Anh Quận 10',
    surface: '7 Sân Cứng DecoTurf US Open • Khán Đài Đèn Thi Đấu',
    price: '260.000 đ/h • Chuẩn Quốc Tế',
    rating: '4.9 ★ (610 đánh giá)',
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=200&fit=crop',
  },
  {
    id: 'court-8',
    sport: 'football',
    sportEmoji: '⚽',
    slot: 'Trống 20:30 - 22:00',
    dist: 'Cách 2.5 km',
    name: 'Sân Bóng Đá SportZone Q.7',
    surface: 'Sân 7 Chuẩn FIFA • Cỏ Monofilament Êm Chân',
    price: '320.000 đ/h • Cụm Sân Hiện Đại Q7',
    rating: '4.8 ★ (290 đánh giá)',
    img: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&h=200&fit=crop',
  },
  {
    id: 'court-9',
    sport: 'basketball',
    sportEmoji: '🏀',
    slot: 'Trống 17:00 - 19:00',
    dist: 'Cách 1.8 km',
    name: 'Sân Bóng Rổ Cung Thiếu Nhi Q.1',
    surface: 'Mặt Sân Cao Su EPDM Ngoài Trời • Kháng Thời Tiết',
    price: '250.000 đ/h • 4 Sân Trụ Kính',
    rating: '4.9 ★ (310 đánh giá)',
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop',
  },
  {
    id: 'court-10',
    sport: 'tennis',
    sportEmoji: '🎾',
    slot: 'Trống 18:30 - 20:30',
    dist: 'Cách 2.1 km',
    name: 'Sân Quần Vợt Sunrise City Q.7',
    surface: 'Mặt Sân Đất Nện & Cứng • Dịch Vụ Căng Vợt Nhặt Bóng',
    price: '220.000 đ/h • Khuôn Viên Resort',
    rating: '4.7 ★ (180 đánh giá)',
    img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&h=200&fit=crop',
  },
  {
    id: 'court-11',
    sport: 'badminton',
    sportEmoji: '🏸',
    slot: 'Trống 20:00 - 22:00',
    dist: 'Cách 3.2 km',
    name: 'Sân Cầu Lông Viettel Hoàng Hoa Thám',
    surface: '12 Sân Thảm BWF Liên Hoàn • Trần Cao 11m Máy Lạnh',
    price: '170.000 đ/h • 12 Sân Thi Đấu',
    rating: '4.8 ★ (560 đánh giá)',
    img: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=200&h=200&fit=crop',
  },
  {
    id: 'court-12',
    sport: 'pickleball',
    sportEmoji: '🏓',
    slot: 'Trống 19:30 - 21:00',
    dist: 'Cách 2.4 km',
    name: 'Kỳ Hòa Pickleball & Sport Club Q.10',
    surface: 'Mặt Sân Acrylic 8 Lớp • Ghế Khán Giả Che Mát',
    price: '240.000 đ/h • Có Mái Che Thoáng',
    rating: '4.8 ★ (275 đánh giá)',
    img: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=200&h=200&fit=crop',
  },
]

function Dashboard() {
  const navigate = useNavigate()

  // Tự động chuyển hướng sang trang Chủ Sân nếu tài khoản có vai trò là Court Owner
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('sportnexus_user_role')
      if (savedRole === 'court_owner') {
        navigate('/owner/dashboard', { replace: true })
      }
    } catch (e) {}
  }, [navigate])

  const [playerProfile, setPlayerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return { name: 'Minh Minh Minh' }
  })

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const saved = localStorage.getItem('player_profile_data')
        if (saved) setPlayerProfile(JSON.parse(saved))
      } catch (e) {}
    }
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleProfileUpdate)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleProfileUpdate)
    }
  }, [])

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
  const [inspectCourtSport, setInspectCourtSport] = useState(null)

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
                Xin chào, {playerProfile.name || 'Minh Minh Minh'} 👋
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
                Trình: Trung bình - Khá
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
              {isAllActive
                ? 'Đang xem toàn bộ sân & kèo cho cả 5 môn thể thao (Cầu Lông, Pickleball, Bóng Đá, Bóng Rổ, Tennis). Đặt sân & bảo chứng Escrow minh bạch.'
                : selectedSports.length === 0
                ? 'Chưa chọn môn nào. Vui lòng bấm vào môn bên dưới để lọc, hoặc chọn "Tất cả 5 môn" để xem toàn bộ.'
                : selectedSports.length === 1
                ? `Đang hiển thị chuyên biệt cho ${SPORTS_LIST.find(s => s.key === selectedSports[0])?.label || ''}. Nhấp thêm môn khác để mở rộng tìm kiếm (hoặc nhấp lại để hủy).`
                : `Đang lọc ${selectedSports.length} môn (${selectedSports.map(k => SPORTS_LIST.find(s => s.key === k)?.label).filter(Boolean).join(', ')}). Nhấp môn đã chọn để hủy bớt.`}
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
              flexWrap: 'wrap',
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
                      ? `Click để chỉ xem riêng ${s.label}`
                      : isActive
                      ? `Đang chọn ${s.label} (Click để hủy chọn)`
                      : `Click để chọn thêm ${s.label}`
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

            {/* View All Button */}
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
              title="Xem toàn bộ 5 môn thể thao"
            >
              <span>✨</span>
              <span>Tất cả 5 môn</span>
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
                  ? 'Toàn bộ 5 môn thể thao (Cầu Lông, Pickleball, Bóng Đá, Bóng Rổ, Tennis)'
                  : selectedSports.length === 0
                  ? 'Chưa chọn môn nào'
                  : selectedSports.length === 1
                  ? `Chỉ hiển thị ${SPORTS_LIST.find(s => s.key === selectedSports[0])?.label || ''}`
                  : `Đang chọn ${selectedSports.length} môn (${selectedSports.map(k => SPORTS_LIST.find(s => s.key === k)?.label).filter(Boolean).join(', ')})`}
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
              : selectedSports.length === 0
              ? '💡 Bấm vào môn thể thao phía trên để chọn'
              : '💡 Bấm lại môn đã chọn để hủy, hoặc bấm Tất cả 5 môn'}
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
              {selectedSports.length === 0
                ? 'Chưa chọn môn nào để hiển thị trận đấu'
                : 'Không có trận đấu sắp tới nào cho bộ lọc này'}
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
              Xem tất cả 5 môn
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
                {/* Court image & mini diagram */}
                <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
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

                  {/* Sơ đồ kỹ thuật sân chuẩn thi đấu quốc tế */}
                  <div
                    onClick={() => setInspectCourtSport(m.sport)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '4px 6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                    }}
                    title={`Bấm để xem bản vẽ quy chuẩn kỹ thuật sân ${m.sportName} chi tiết`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.06)'
                      e.currentTarget.style.borderColor = '#15803D'
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(21,128,61,0.18)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.borderColor = '#E5E7EB'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <SportCourtDiagram sport={m.sport} width={52} height={28} />
                    <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#15803D', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                      QUY CHUẨN 🔍
                    </span>
                  </div>
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
                    {m.surface && (
                      <>
                        <span style={{ color: '#D1D5DB', fontSize: '12px' }}>•</span>
                        <span
                          style={{
                            fontSize: '11.5px',
                            color: '#1E40AF',
                            background: '#EFF6FF',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                          }}
                        >
                          🏟️ {m.surface}
                        </span>
                      </>
                    )}
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
            {filteredLfgMatches.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '14px',
                  padding: '28px',
                  textAlign: 'center',
                  border: '1px dashed #D1D5DB',
                }}
              >
                <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>
                  {selectedSports.length === 0
                    ? 'Chưa chọn môn nào để hiển thị kèo ghép'
                    : 'Không có kèo ghép nào cho bộ lọc này'}
                </p>
                <button
                  type="button"
                  onClick={selectAllSports}
                  style={{
                    background: '#15803D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xem tất cả 5 môn
                </button>
              </div>
            ) : (
              filteredLfgMatches.map((m) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
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
                      {m.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '1px 5px',
                            borderRadius: '4px',
                          }}
                        >
                          {m.badge}
                        </span>
                      )}
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
              ))
            )}
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
            {filteredCourts.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '14px',
                  padding: '28px',
                  textAlign: 'center',
                  border: '1px dashed #D1D5DB',
                }}
              >
                <p style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>
                  {selectedSports.length === 0
                    ? 'Chưa chọn môn nào để hiển thị sân trống'
                    : 'Không có sân trống nào cho bộ lọc này'}
                </p>
                <button
                  type="button"
                  onClick={selectAllSports}
                  style={{
                    background: '#15803D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xem tất cả 5 môn
                </button>
              </div>
            ) : (
              filteredCourts.map((c) => (
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
                  {/* Court image & mini diagram preview */}
                  <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ position: 'relative' }}>
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

                    {/* Sơ đồ sân chuẩn kỹ thuật quốc tế */}
                    <div
                      onClick={() => setInspectCourtSport(c.sport)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '3px 4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out',
                      }}
                      title={`Bấm xem bản vẽ quy chuẩn & kích thước thực tế sân ${c.name}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.06)'
                        e.currentTarget.style.borderColor = '#15803D'
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(21,128,61,0.18)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.borderColor = '#E5E7EB'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <SportCourtDiagram sport={c.sport} width={46} height={26} />
                      <span style={{ fontSize: '8px', fontWeight: 800, color: '#15803D', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                        QUY CHUẨN 🔍
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
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
                    {c.surface && (
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#047857', fontWeight: 600 }}>
                        🏟️ {c.surface}
                      </p>
                    )}
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
              ))
            )}
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

      {/* ===================== MODAL BẢN VẼ KỸ THUẬT QUY CHUẨN THI ĐẤU QUỐC TẾ ===================== */}
      {inspectCourtSport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(11, 19, 43, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectCourtSport(null)
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid #E5E7EB',
                background: 'linear-gradient(to right, #F8FAFC, #F0FDF4)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                  }}
                >
                  {SPORTS_LIST.find((s) => s.key === inspectCourtSport)?.emoji || '🏟️'}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                      Bản Vẽ Quy Chuẩn Kỹ Thuật {SPORT_COURT_STANDARDS[inspectCourtSport]?.sportName}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#15803D',
                        background: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #86EFAC',
                      }}
                    >
                      {SPORT_COURT_STANDARDS[inspectCourtSport]?.federation?.split('(')[0]?.trim()}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                    Chuẩn quốc tế chính thức: {SPORT_COURT_STANDARDS[inspectCourtSport]?.federation}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setInspectCourtSport(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9'
                  e.currentTarget.style.color = '#0F172A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.color = '#64748B'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Sub-header Sport Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                overflowX: 'auto',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginRight: '4px' }}>
                Đổi môn:
              </span>
              {SPORTS_LIST.map((s) => {
                const isCur = inspectCourtSport === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setInspectCourtSport(s.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: isCur ? '1.5px solid #15803D' : '1px solid #E2E8F0',
                      background: isCur ? '#15803D' : '#FFFFFF',
                      color: isCur ? '#FFFFFF' : '#334155',
                      fontSize: '12px',
                      fontWeight: isCur ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Blueprint Display Card */}
              <div
                style={{
                  background: '#0B132B',
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: '0 8px 30px rgba(11, 19, 43, 0.4)',
                  border: '1px solid #1E293B',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38BDF8' }}>
                      architecture
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'monospace' }}>
                      SƠ ĐỒ HÌNH HỌC TỶ LỆ 1:1 THEO LUẬT THI ĐẤU
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                    {SPORT_COURT_STANDARDS[inspectCourtSport]?.realDimensions}
                  </span>
                </div>

                {/* SVG Blueprint Mode */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <SportCourtDiagram sport={inspectCourtSport} width="100%" height="auto" showDimensions={true} />
                </div>
              </div>

              {/* Technical Specifications 4-Grid */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Thông Số Kỹ Thuật Chi Tiết Đạt Chuẩn SportNexus
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#0369A1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>straighten</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase' }}>Kích Thước Sân</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {SPORT_COURT_STANDARDS[inspectCourtSport]?.realDimensions}
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#B45309' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sports_score</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase' }}>Lưới / Khung Thành / Rổ</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {SPORT_COURT_STANDARDS[inspectCourtSport]?.netHeight}
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#15803D' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>layers</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase' }}>Chất Liệu Bề Mặt</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {SPORT_COURT_STANDARDS[inspectCourtSport]?.courtType}
                    </p>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#7C3AED' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lightbulb</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase' }}>Tiêu Chuẩn Chiếu Sáng</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {SPORT_COURT_STANDARDS[inspectCourtSport]?.lighting}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Features Callout */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: '#15803D', fontSize: '22px', marginTop: '1px' }}>
                  verified
                </span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#166534', display: 'block', marginBottom: '4px' }}>
                    Đặc điểm nhận diện & Vạch kẻ chuẩn {SPORT_COURT_STANDARDS[inspectCourtSport]?.federation?.split('(')[0]?.trim()}
                  </strong>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#374151', lineHeight: 1.55 }}>
                    {SPORT_COURT_STANDARDS[inspectCourtSport]?.keyFeatures}. Toàn bộ hệ thống sân đối tác của SportNexus đều được thẩm định định kỳ đạt tối thiểu 95% độ phẳng và hệ số ma sát thể thao chuẩn mực.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
              }}
            >
              <button
                type="button"
                onClick={() => setInspectCourtSport(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đóng Bản Vẽ
              </button>
              <button
                type="button"
                onClick={() => {
                  selectOnlySport(inspectCourtSport)
                  setInspectCourtSport(null)
                  navigate('/court-finder')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  map
                </span>
                <span>Tìm Sân Đạt Chuẩn Này Trên Bản Đồ</span>
              </button>
            </div>
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
              Hệ sinh thái thể thao 5 môn (Cầu Lông, Pickleball, Bóng Đá, Bóng Rổ, Tennis) tiên phong tích hợp Đặt Sân Tức Thì, Ghép Trận LFG thông minh, Hợp Đồng Ký Quỹ Escrow bảo chứng 100%.
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
              style={{ margin: '0 0 7px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('badminton')}
            >
              🏸 Cầu Lông Chuẩn BWF
            </p>
            <p
              style={{ margin: '0 0 7px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('pickleball')}
            >
              🏓 Pickleball Pro Hub
            </p>
            <p
              style={{ margin: '0 0 7px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('football')}
            >
              ⚽ Bóng Đá Chuẩn FIFA
            </p>
            <p
              style={{ margin: '0 0 7px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('basketball')}
            >
              🏀 Bóng Rổ Sàn Gỗ FIBA
            </p>
            <p
              style={{ margin: '0 0 7px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}
              onClick={() => selectOnlySport('tennis')}
            >
              🎾 Tennis Chuẩn Quốc Tế
            </p>
            <p
              style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803D', fontWeight: 700, cursor: 'pointer' }}
              onClick={selectAllSports}
            >
              ✨ Xem tất cả 5 môn
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