import { useState } from 'react'
import { Link } from 'react-router-dom'

// Dữ liệu mẫu ban đầu về Cụm sân phức hợp SportNexus
const INITIAL_COMPLEX_DATA = {
  facilityName: 'SportNexus Multi-Sport Complex Saigon',
  facilityAddress: '35 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh',
  facilityPhone: '0908 123 456',
  openingTime: '05:00',
  closingTime: '23:30',
  slotDuration: 60, // phút
  bufferTime: 10, // phút đọn dẹp vệ sinh giữa ca
  zones: [
    {
      id: 'zone-a',
      name: 'Khu A — Cụm Sân Cầu Lông Quốc Tế BWF',
      sport: 'badminton',
      sportLabel: 'Cầu lông',
      color: '#10B981',
      icon: 'sports_tennis',
      basePrice: 180000,
      peakPrice: 260000,
      description: 'Thảm Yonex thi đấu chuyên nghiệp, hệ thống đèn LED 1200 Lux chống chói, máy lạnh 21°C',
      amenities: ['Máy lạnh 21°C', 'Thảm Yonex BWF', 'Đèn LED chống chói', 'Ghế trọng tài', 'Phòng tắm nóng lạnh'],
      courts: [
        { id: 'a1', name: 'Sân A1 (Tiêu chuẩn VIP)', status: 'active', floor: 'Thảm Yonex BWF Xanh' },
        { id: 'a2', name: 'Sân A2 (Tiêu chuẩn VIP)', status: 'active', floor: 'Thảm Yonex BWF Xanh' },
        { id: 'a3', name: 'Sân A3 (Tiêu chuẩn Quốc tế)', status: 'active', floor: 'Thảm Yonex BWF Xanh' },
        { id: 'a4', name: 'Sân A4 (Tiêu chuẩn Quốc tế)', status: 'active', floor: 'Thảm Yonex BWF Xanh' },
        { id: 'a5', name: 'Sân A5 (Khán đài Mini)', status: 'maintenance', floor: 'Đang bảo trì thay thảm' },
      ],
    },
    {
      id: 'zone-b',
      name: 'Khu B — Cụm Sân Bóng Đá Mini Cỏ Nhân Tạo',
      sport: 'football',
      sportLabel: 'Bóng đá',
      color: '#3B82F6',
      icon: 'sports_soccer',
      basePrice: 380000,
      peakPrice: 550000,
      description: 'Cỏ nhân tạo chất lượng cao FIFA Quality Pro sợi kim cương, hạt cao su EPDM đàn hồi, dàn đèn cao áp 800W',
      amenities: ['Cỏ FIFA Quality Pro', 'Dàn đèn Philips 800W', 'Lưới chắn bóng cao cấp', 'Bình nước miễn phí', 'Khán đài 50 chỗ'],
      courts: [
        { id: 'b1', name: 'Sân B1 — Sân 5 Mini (Khung thành nhôm)', status: 'active', floor: 'Cỏ nhân tạo 5cm EPDM' },
        { id: 'b2', name: 'Sân B2 — Sân 5 Mini (Khung thành nhôm)', status: 'active', floor: 'Cỏ nhân tạo 5cm EPDM' },
        { id: 'b3', name: 'Sân B3 — Sân 7 Liên hoàn (Có thể ghép)', status: 'active', floor: 'Cỏ nhân tạo 5cm EPDM' },
      ],
    },
    {
      id: 'zone-c',
      name: 'Khu C — Cụm Sân Pickleball USAPA Pro',
      sport: 'pickleball',
      sportLabel: 'Pickleball',
      color: '#F59E0B',
      icon: 'sports_tennis',
      basePrice: 200000,
      peakPrice: 280000,
      description: 'Mặt sân Acrylic 8 lớp đạt chuẩn USAPA, mái che vòm khí động học thoáng mát, lưới điều chỉnh cơ khí',
      amenities: ['Mái che vòm chống mưa', 'Mặt sân Acrylic 8 lớp', 'Bóng thi đấu Franklin', 'Khu nghỉ ngơi quạt gió'],
      courts: [
        { id: 'c1', name: 'Sân C1 (Center Court VIP)', status: 'active', floor: 'Acrylic Cushion USAPA' },
        { id: 'c2', name: 'Sân C2 (Mái che cao)', status: 'active', floor: 'Acrylic Cushion USAPA' },
        { id: 'c3', name: 'Sân C3 (Mái che cao)', status: 'active', floor: 'Acrylic Cushion USAPA' },
        { id: 'c4', name: 'Sân C4 (Mặt sân ngoài trời)', status: 'active', floor: 'Acrylic Hardcourt' },
      ],
    },
    {
      id: 'zone-d',
      name: 'Khu D — Sân Quần Vợt (Tennis)',
      sport: 'tennis',
      sportLabel: 'Tennis',
      color: '#EC4899',
      icon: 'sports_tennis',
      basePrice: 300000,
      peakPrice: 420000,
      description: 'Mặt sân cứng DecoTurf tiêu chuẩn giải Grand Slam US Open, hệ thống chiếu sáng ban đêm không bóng mờ',
      amenities: ['Mặt sân DecoTurf', 'Đèn LED 1500 Lux', 'Máy bắn bóng tự động', 'Phòng thay đồ riêng'],
      courts: [
        { id: 'd1', name: 'Sân D1 (Sân trung tâm có mái che)', status: 'active', floor: 'DecoTurf 5 lớp' },
        { id: 'd2', name: 'Sân D2 (Sân ngoài trời cao cấp)', status: 'active', floor: 'DecoTurf 5 lớp' },
      ],
    },
  ],
  dynamicPricingRules: [
    {
      id: 'rule-peak-evening',
      name: 'Giờ Cao Điểm Buổi Tối (Peak Hours)',
      type: 'time_window',
      days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      timeRange: '17:00 - 22:00',
      multiplier: 1.35,
      active: true,
      badge: 'Giờ vàng',
      badgeColor: '#EF4444',
      description: 'Áp dụng cho các ca tối đông khách trong tuần (tăng 35% so với giá cơ sở)',
    },
    {
      id: 'rule-weekend',
      name: 'Cuối Tuần Cao Điểm (Weekend Premium)',
      type: 'weekend',
      days: ['Thứ 7', 'Chủ Nhật'],
      timeRange: '06:00 - 10:30 & 16:00 - 22:30',
      multiplier: 1.45,
      active: true,
      badge: 'Cuối tuần',
      badgeColor: '#F97316',
      description: 'Lượng khách tập trung cao nhất tuần (tăng 45% hoặc định giá cố định)',
    },
    {
      id: 'rule-offpeak',
      name: 'Giờ Vắng Khách (Happy Hours / Giảm Giá)',
      type: 'discount',
      days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      timeRange: '09:00 - 15:00',
      multiplier: 0.8,
      active: true,
      badge: 'Giảm 20%',
      badgeColor: '#10B981',
      description: 'Kích cầu khung giờ trưa vắng khách cho học sinh, sinh viên, người làm việc tự do',
    },
    {
      id: 'rule-lastminute',
      name: 'Khuyến Mãi Đặt Cận Giờ (Flash Fill)',
      type: 'last_minute',
      days: ['Hàng ngày'],
      timeRange: 'Trước giờ chơi 90 phút nếu sân còn trống',
      multiplier: 0.75,
      active: true,
      badge: 'Flash 25%',
      badgeColor: '#8B5CF6',
      description: 'Tự động mở bán giảm 25% cho các slot trống chuẩn bị đến giờ chơi',
    },
  ],
}

export default function CourtManage() {
  const [complexData, setComplexData] = useState(INITIAL_COMPLEX_DATA)
  const [activeTab, setActiveTab] = useState('zones') // 'zones' | 'pricing' | 'timegrid'
  const [selectedZone, setSelectedZone] = useState(complexData.zones[0])
  const [showAddCourtModal, setShowAddCourtModal] = useState(false)
  const [newCourtName, setNewCourtName] = useState('')
  const [newCourtFloor, setNewCourtFloor] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  // Bộ mô phỏng tính giá động trực quan
  const [simSport, setSimSport] = useState('badminton')
  const [simDay, setSimDay] = useState('weekday') // 'weekday' | 'weekend'
  const [simHour, setSimHour] = useState(18) // 18h tối

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Toggle trạng thái sân
  const handleToggleCourtStatus = (zoneId, courtId) => {
    setComplexData((prev) => {
      const updatedZones = prev.zones.map((zone) => {
        if (zone.id !== zoneId) return zone
        const updatedCourts = zone.courts.map((court) => {
          if (court.id !== courtId) return court
          const nextStatus = court.status === 'active' ? 'maintenance' : 'active'
          return { ...court, status: nextStatus }
        })
        return { ...zone, courts: updatedCourts }
      })
      return { ...prev, zones: updatedZones }
    })
    showToast('Đã cập nhật trạng thái hoạt động của sân thành công!')
  }

  // Thêm sân mới vào khu vực
  const handleAddCourt = (e) => {
    e.preventDefault()
    if (!newCourtName.trim()) return

    const newCourt = {
      id: `${selectedZone.id}-${Date.now().toString().slice(-4)}`,
      name: newCourtName.trim(),
      status: 'active',
      floor: newCourtFloor.trim() || 'Tiêu chuẩn quốc tế',
    }

    setComplexData((prev) => {
      const updatedZones = prev.zones.map((z) => {
        if (z.id !== selectedZone.id) return z
        return { ...z, courts: [...z.courts, newCourt] }
      })
      return { ...prev, zones: updatedZones }
    })

    setSelectedZone((prev) => ({
      ...prev,
      courts: [...prev.courts, newCourt],
    }))

    setNewCourtName('')
    setNewCourtFloor('')
    setShowAddCourtModal(false)
    showToast(`Đã thêm sân "${newCourt.name}" vào ${selectedZone.name}!`)
  }

  // Toggle quy tắc định giá động
  const handleToggleRule = (ruleId) => {
    setComplexData((prev) => {
      const updatedRules = prev.dynamicPricingRules.map((rule) => {
        if (rule.id !== ruleId) return rule
        return { ...rule, active: !rule.active }
      })
      return { ...prev, dynamicPricingRules: updatedRules }
    })
    showToast('Đã lưu cấu hình quy tắc định giá động!')
  }

  // Cập nhật giá cơ bản của Khu
  const handleUpdateZonePrice = (zoneId, field, value) => {
    const num = Number(value) || 0
    setComplexData((prev) => {
      const updatedZones = prev.zones.map((z) => {
        if (z.id !== zoneId) return z
        return { ...z, [field]: num }
      })
      return { ...prev, zones: updatedZones }
    })
    if (selectedZone.id === zoneId) {
      setSelectedZone((prev) => ({ ...prev, [field]: num }))
    }
  }

  // Tính giá mô phỏng theo giờ
  const calculateSimulatedPrice = () => {
    const zone = complexData.zones.find((z) => z.sport === simSport) || complexData.zones[0]
    let base = zone.basePrice
    let multiplier = 1.0
    let appliedRule = 'Giá Tiêu Chuẩn (Giờ Thường)'

    if (simDay === 'weekend') {
      if ((simHour >= 6 && simHour < 11) || (simHour >= 16 && simHour <= 22)) {
        multiplier = 1.45
        appliedRule = 'Quy tắc Cuối Tuần Cao Điểm (+45%)'
      } else {
        multiplier = 1.2
        appliedRule = 'Cuối Tuần Giờ Thường (+20%)'
      }
    } else {
      if (simHour >= 17 && simHour <= 22) {
        multiplier = 1.35
        appliedRule = 'Quy tắc Giờ Cao Điểm Buổi Tối (+35%)'
      } else if (simHour >= 9 && simHour < 15) {
        multiplier = 0.8
        appliedRule = 'Quy tắc Giờ Vắng Khách / Happy Hours (-20%)'
      }
    }

    const finalPrice = Math.round(base * multiplier)
    return { base, multiplier, finalPrice, appliedRule, zone }
  }

  const simResult = calculateSimulatedPrice()

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  // Tổng số sân trong cụm
  const totalCourts = complexData.zones.reduce((sum, z) => sum + z.courts.length, 0)
  const activeCourts = complexData.zones.reduce(
    (sum, z) => sum + z.courts.filter((c) => c.status === 'active').length,
    0
  )

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: '#F8FAFC' }}>
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

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Cơ Sở Phức Hợp Thể Thao
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Mã cơ sở: <strong>SNX-FAC-HCM07</strong>
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            {complexData.facilityName}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
              location_on
            </span>
            {complexData.facilityAddress}
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Quy mô Cụm</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                {complexData.zones.length} Khu Vực • {totalCourts} Sân Con
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined">sports_score</span>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Tỷ lệ Sẵn Sàng</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>
                {activeCourts}/{totalCourts} Đang Phục Vụ ({Math.round((activeCourts / totalCourts) * 100)}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => setActiveTab('zones')}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === 'zones' ? '#10B981' : '#64748B',
            border: 'none',
            borderBottom: activeTab === 'zones' ? '3px solid #10B981' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            view_quilt
          </span>
          Quản Lý Cụm Sân & Khu Vực
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === 'pricing' ? '#10B981' : '#64748B',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '3px solid #10B981' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            trending_up
          </span>
          Định Giá Động (Dynamic Pricing)
          <span
            style={{
              background: '#FEF3C7',
              color: '#B45309',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            AI Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timegrid')}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === 'timegrid' ? '#10B981' : '#64748B',
            border: 'none',
            borderBottom: activeTab === 'timegrid' ? '3px solid #10B981' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            schedule
          </span>
          Cấu Hình Lưới Thời Gian (Time Grid)
        </button>
      </div>

      {/* TAB 1: QUẢN LÝ CỤM SÂN & KHU VỰC */}
      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Zone Selector Sidebar */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
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
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  Danh Sách Khu Vực
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  {complexData.zones.length} khu
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {complexData.zones.map((zone) => {
                  const isSelected = selectedZone.id === zone.id
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${zone.color}` : '1px solid #E2E8F0',
                        background: isSelected ? `${zone.color}0D` : '#FFFFFF',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: `${zone.color}20`,
                            color: zone.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                            {zone.icon}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {zone.name.split('—')[0].trim()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {zone.sportLabel} • {zone.courts.length} sân
                          </div>
                        </div>
                      </div>

                      <span className="material-symbols-outlined" style={{ color: isSelected ? zone.color : '#CBD5E1', fontSize: '20px' }}>
                        chevron_right
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Add Zone prompt */}
              <button
                onClick={() => showToast('Tính năng thêm cụm sân thể thao mới đã sẵn sàng.')}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px dashed #CBD5E1',
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add_circle
                </span>
                Thêm Khu Thể Thao Mới
              </button>
            </div>
          </div>

          {/* Zone Detail & Courts View */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              {/* Zone Top Info Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #E2E8F0',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${selectedZone.color}20`,
                        color: selectedZone.color,
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {selectedZone.sportLabel}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      Tổng: {selectedZone.courts.length} sân đấu
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {selectedZone.name}
                  </h2>
                  <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '13px', maxWidth: '650px' }}>
                    {selectedZone.description}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddCourtModal(true)}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    add
                  </span>
                  Thêm Sân Con
                </button>
              </div>

              {/* Amenities tags */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Tiện ích trang bị cho khu vực:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedZone.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>
                        verified
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Overview for Zone */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    Mức Giá Áp Dụng Cho Khu Này
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Giờ chuẩn: </span>
                      <strong style={{ fontSize: '16px', color: '#0F172A' }}>
                        {formatVND(selectedZone.basePrice)}/h
                      </strong>
                    </div>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <div>
                      <span style={{ fontSize: '13px', color: '#EF4444' }}>Giờ cao điểm: </span>
                      <strong style={{ fontSize: '16px', color: '#EF4444' }}>
                        {formatVND(selectedZone.peakPrice)}/h
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('pricing')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    edit
                  </span>
                  Chỉnh Sửa Giá
                </button>
              </div>

              {/* Courts Grid */}
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                Danh Sách Các Sân Con Trong {selectedZone.name.split('—')[0].trim()}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {selectedZone.courts.map((court) => {
                  const isActive = court.status === 'active'
                  return (
                    <div
                      key={court.id}
                      style={{
                        background: '#FFFFFF',
                        border: isActive ? '1px solid #E2E8F0' : '1px solid #FED7AA',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isActive ? '#DCFCE7' : '#FEF3C7',
                            color: isActive ? '#15803D' : '#B45309',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isActive ? '#16A34A' : '#D97706',
                            }}
                          />
                          {isActive ? 'Hoạt động tốt' : 'Đang bảo trì'}
                        </span>

                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                          ID: {court.id.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                        {court.name}
                      </div>

                      <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94A3B8' }}>
                          layers
                        </span>
                        {court.floor}
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        <button
                          onClick={() => handleToggleCourtStatus(selectedZone.id, court.id)}
                          style={{
                            background: isActive ? '#FFF7ED' : '#F0FDF4',
                            border: isActive ? '1px solid #FFEDD5' : '1px solid #DCFCE7',
                            color: isActive ? '#C2410C' : '#15803D',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {isActive ? 'build' : 'check_circle'}
                          </span>
                          {isActive ? 'Chuyển bảo trì' : 'Mở lại sân'}
                        </button>

                        <button
                          onClick={() => showToast(`Cấu hình camera & thiết bị IoT sân ${court.name} đã kết nối.`)}
                          title="Cài đặt thiết bị IoT & camera"
                          style={{
                            background: 'none',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            videocam
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ĐỊNH GIÁ ĐỘNG (DYNAMIC PRICING ENGINE) */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Rules list & base config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Banner AI Engine */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10B981',
                      color: '#34D399',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                    }}
                  >
                    DYNAMIC PRICING ENGINE v2.4
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>• Tự động tối ưu doanh thu</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>
                  Hệ Thống Định Giá Thông Minh Theo Khung Giờ
                </h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', maxWidth: '580px' }}>
                  Tự động điều chỉnh giá giờ cao điểm (Peak Hours), giảm giá giờ vắng khách (Off-peak Happy Hours) và kích cầu đặt sân cận giờ thông qua cơ chế Smart Escrow.
                </p>
              </div>

              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                  auto_graph
                </span>
              </div>
            </div>

            {/* Base Rates table for each Zone */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                Bảng Giá Cơ Sở Theo Từng Cụm Sân (VND/Giờ)
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                        Khu Vực & Bộ Môn
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                        Giá Giờ Thường (Base Rate)
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                        Giá Giờ Cao Điểm (Peak Rate)
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                        Chênh Lệch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {complexData.zones.map((zone) => (
                      <tr key={zone.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: `${zone.color}20`,
                                color: zone.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {zone.icon}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                {zone.name.split('—')[0].trim()}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>{zone.sportLabel}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="number"
                            step="10000"
                            value={zone.basePrice}
                            onChange={(e) => handleUpdateZonePrice(zone.id, 'basePrice', e.target.value)}
                            style={{
                              width: '140px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#0F172A',
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="number"
                            step="10000"
                            value={zone.peakPrice}
                            onChange={(e) => handleUpdateZonePrice(zone.id, 'peakPrice', e.target.value)}
                            style={{
                              width: '140px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#EF4444',
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#16A34A',
                              background: '#DCFCE7',
                              padding: '4px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            +{Math.round(((zone.peakPrice - zone.basePrice) / zone.basePrice) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Rules Configuration */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Quy Tắc Định Giá Động Đang Áp Dụng
                </h3>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 700 }}>
                  ● 4/4 Quy tắc đang hoạt động
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {complexData.dynamicPricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px',
                      background: rule.active ? '#FFFFFF' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: `${rule.badgeColor}15`,
                          color: rule.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                          {rule.multiplier > 1 ? 'trending_up' : 'trending_down'}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                            {rule.name}
                          </span>
                          <span
                            style={{
                              background: `${rule.badgeColor}20`,
                              color: rule.badgeColor,
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {rule.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{rule.description}</p>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: '#475569' }}>
                          <span>
                            <strong>Khung giờ:</strong> {rule.timeRange}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Ngày áp dụng:</strong> {rule.days.join(', ')}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Hệ số:</strong>{' '}
                            <span style={{ color: rule.multiplier >= 1 ? '#EF4444' : '#10B981', fontWeight: 800 }}>
                              {rule.multiplier}x
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        style={{
                          background: rule.active ? '#10B981' : '#CBD5E1',
                          border: 'none',
                          borderRadius: '999px',
                          width: '48px',
                          height: '26px',
                          padding: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'background 0.2s',
                          justifyContent: rule.active ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Realtime Pricing Simulator Widget */}
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                position: 'sticky',
                top: '84px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '24px' }}>
                  calculate
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  Trình Mô Phỏng Giá Thời Gian Thực
                </h3>
              </div>

              {/* Select sport */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Chọn Bộ Môn / Khu Vực
                </label>
                <select
                  value={simSport}
                  onChange={(e) => setSimSport(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    background: '#F8FAFC',
                  }}
                >
                  <option value="badminton">Khu A — Cầu Lông (Gốc: 180.000đ)</option>
                  <option value="football">Khu B — Bóng Đá Sân 5 (Gốc: 380.000đ)</option>
                  <option value="pickleball">Khu C — Pickleball (Gốc: 200.000đ)</option>
                  <option value="tennis">Khu D — Tennis (Gốc: 300.000đ)</option>
                </select>
              </div>

              {/* Select Day Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Ngày Trong Tuần
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setSimDay('weekday')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: simDay === 'weekday' ? '2px solid #10B981' : '1px solid #CBD5E1',
                      background: simDay === 'weekday' ? '#ECFDF5' : '#FFFFFF',
                      color: simDay === 'weekday' ? '#065F46' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Ngày Thường (T2 - T6)
                  </button>
                  <button
                    onClick={() => setSimDay('weekend')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: simDay === 'weekend' ? '2px solid #F97316' : '1px solid #CBD5E1',
                      background: simDay === 'weekend' ? '#FFF7ED' : '#FFFFFF',
                      color: simDay === 'weekend' ? '#9A3412' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cuối Tuần (T7 - CN)
                  </button>
                </div>
              </div>

              {/* Slider for Hours */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                    Khung Giờ Thi Đấu:
                  </label>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                    {simHour.toString().padStart(2, '0')}:00 - {(simHour + 1).toString().padStart(2, '0')}:00
                  </strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="23"
                  value={simHour}
                  onChange={(e) => setSimHour(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  <span>05:00</span>
                  <span>12:00</span>
                  <span>18:00 (Peak)</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Simulator Calculation Result Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #BBF7D0',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Kết Quả Tính Giá Người Chơi Trả
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#14532D', margin: '6px 0' }}>
                  {formatVND(simResult.finalPrice)}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#166534' }}> / giờ</span>
                </div>

                <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', lineHeight: 1.4 }}>
                  ⚡ Áp dụng: <strong>{simResult.appliedRule}</strong>
                </div>

                <div
                  style={{
                    paddingTop: '10px',
                    borderTop: '1px dashed #86EFAC',
                    fontSize: '12px',
                    color: '#15803D',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Giá gốc ban đầu:</span>
                  <span>{formatVND(simResult.base)}</span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#15803D',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                  }}
                >
                  <span>Hệ số điều chỉnh:</span>
                  <span>{simResult.multiplier}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CẤU HÌNH LƯỚI THỜI GIAN (TIME GRID CONFIGURATION) */}
      {activeTab === 'timegrid' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Cấu Hình Khung Giờ Hoạt Động & Lưới Thời Gian (Time Grid Slots)
            </h2>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
              Thiết lập khung giờ mở cửa, đóng cửa, bước nhảy thời lượng đặt sân và thời gian đệm vệ sinh sân giữa các ca.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Giờ mở cửa */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Giờ Mở Cửa Cơ Sở
              </label>
              <input
                type="time"
                value={complexData.openingTime}
                onChange={(e) => setComplexData((prev) => ({ ...prev, openingTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              />
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', display: 'block' }}>
                Bắt đầu nhận ca đặt sân đầu tiên
              </span>
            </div>

            {/* Giờ đóng cửa */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Giờ Đóng Cửa Cơ Sở
              </label>
              <input
                type="time"
                value={complexData.closingTime}
                onChange={(e) => setComplexData((prev) => ({ ...prev, closingTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              />
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', display: 'block' }}>
                Ca chơi cuối cùng kết thúc
              </span>
            </div>

            {/* Bước nhảy khung giờ */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Thời Lượng Mỗi Slot (Bước Nhảy)
              </label>
              <select
                value={complexData.slotDuration}
                onChange={(e) => setComplexData((prev) => ({ ...prev, slotDuration: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <option value={30}>30 phút / slot (Linh hoạt cao)</option>
                <option value={60}>60 phút / slot (Khuyến nghị chuẩn)</option>
                <option value={90}>90 phút / slot (Bóng đá trận dài)</option>
                <option value={120}>120 phút / slot (2 tiếng)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', display: 'block' }}>
                Quy định độ dài mỗi ô đặt lịch
              </span>
            </div>

            {/* Thời gian đệm vệ sinh */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Thời Gian Đệm Vệ Sinh / Lau Sân
              </label>
              <select
                value={complexData.bufferTime}
                onChange={(e) => setComplexData((prev) => ({ ...prev, bufferTime: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <option value={0}>0 phút (Nối ca liền mạch)</option>
                <option value={5}>5 phút nghỉ giữa các ca</option>
                <option value={10}>10 phút lau sàn BWF & nhặt bóng</option>
                <option value={15}>15 phút</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', display: 'block' }}>
                Tránh chồng chéo người chơi đến ca sau
              </span>
            </div>
          </div>

          {/* Time Grid Preview */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
              Mô Phỏng Trực Quan Lưới Thời Gian Trong Ngày (05:00 - 23:00)
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Array.from({ length: 18 }).map((_, i) => {
                const hour = 5 + i
                const isPeak = hour >= 17 && hour <= 22
                const isOffpeak = hour >= 9 && hour <= 14
                return (
                  <div
                    key={hour}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: isPeak ? '1px solid #FCA5A5' : isOffpeak ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                      background: isPeak ? '#FEF2F2' : isOffpeak ? '#ECFDF5' : '#FFFFFF',
                      textAlign: 'center',
                      minWidth: '85px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: isPeak ? '#DC2626' : '#0F172A' }}>
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        marginTop: '4px',
                        color: isPeak ? '#EF4444' : isOffpeak ? '#059669' : '#64748B',
                      }}
                    >
                      {isPeak ? 'Giờ Vàng 🔥' : isOffpeak ? 'Happy Hour' : 'Chuẩn'}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => showToast('Cấu hình Lưới thời gian đã được lưu và áp dụng cho toàn hệ thống!')}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                Lưu Thay Đổi Cấu Hình Lưới Thời Gian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm Sân Con */}
      {showAddCourtModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Thêm Sân Mới Vào {selectedZone.name.split('—')[0].trim()}
              </h3>
              <button
                onClick={() => setShowAddCourtModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCourt}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Tên Sân Con (VD: Sân A6 - Sân Thảm Thi Đấu)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sân..."
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Loại Mặt Sàn / Trang Thiết Bị
                </label>
                <input
                  type="text"
                  placeholder="VD: Thảm Yonex BWF Xanh lá chống trượt"
                  value={newCourtFloor}
                  onChange={(e) => setNewCourtFloor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCourtModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xác Nhận Thêm Sân
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
