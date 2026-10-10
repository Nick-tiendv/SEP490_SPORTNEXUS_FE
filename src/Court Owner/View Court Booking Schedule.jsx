import { useState } from 'react'
import { Link } from 'react-router-dom'

// Danh sách các sân thuộc cụm thể thao phức hợp
const COURTS_LIST = [
  { id: 'a1', zone: 'Khu A', zoneName: 'Khu A — Cầu Lông BWF', name: 'Sân Cầu Lông A1 (VIP)', sport: 'badminton', sportLabel: 'Cầu lông', color: '#10B981', price: 260000 },
  { id: 'a2', zone: 'Khu A', zoneName: 'Khu A — Cầu Lông BWF', name: 'Sân Cầu Lông A2 (VIP)', sport: 'badminton', sportLabel: 'Cầu lông', color: '#10B981', price: 260000 },
  { id: 'a3', zone: 'Khu A', zoneName: 'Khu A — Cầu Lông BWF', name: 'Sân Cầu Lông A3', sport: 'badminton', sportLabel: 'Cầu lông', color: '#10B981', price: 220000 },
  { id: 'a4', zone: 'Khu A', zoneName: 'Khu A — Cầu Lông BWF', name: 'Sân Cầu Lông A4', sport: 'badminton', sportLabel: 'Cầu lông', color: '#10B981', price: 220000 },
  { id: 'b1', zone: 'Khu B', zoneName: 'Khu B — Bóng Đá Mini', name: 'Sân Bóng Đá B1 (Sân 5)', sport: 'football', sportLabel: 'Bóng đá', color: '#3B82F6', price: 450000 },
  { id: 'b2', zone: 'Khu B', zoneName: 'Khu B — Bóng Đá Mini', name: 'Sân Bóng Đá B2 (Sân 5)', sport: 'football', sportLabel: 'Bóng đá', color: '#3B82F6', price: 450000 },
  { id: 'b3', zone: 'Khu B', zoneName: 'Khu B — Bóng Đá Mini', name: 'Sân Bóng Đá B3 (Sân 7)', sport: 'football', sportLabel: 'Bóng đá', color: '#3B82F6', price: 650000 },
  { id: 'c1', zone: 'Khu C', zoneName: 'Khu C — Pickleball Pro', name: 'Sân Pickleball C1 (Center VIP)', sport: 'pickleball', sportLabel: 'Pickleball', color: '#F59E0B', price: 280000 },
  { id: 'c2', zone: 'Khu C', zoneName: 'Khu C — Pickleball Pro', name: 'Sân Pickleball C2 (Mái che)', sport: 'pickleball', sportLabel: 'Pickleball', color: '#F59E0B', price: 240000 },
  { id: 'c3', zone: 'Khu C', zoneName: 'Khu C — Pickleball Pro', name: 'Sân Pickleball C3 (Mái che)', sport: 'pickleball', sportLabel: 'Pickleball', color: '#F59E0B', price: 240000 },
  { id: 'd1', zone: 'Khu D', zoneName: 'Khu D — Quần Vợt Tennis', name: 'Sân Tennis D1 (Center)', sport: 'tennis', sportLabel: 'Tennis', color: '#EC4899', price: 380000 },
  { id: 'd2', zone: 'Khu D', zoneName: 'Khu D — Quần Vợt Tennis', name: 'Sân Tennis D2 (Hardcourt)', sport: 'tennis', sportLabel: 'Tennis', color: '#EC4899', price: 340000 },
]

// Các khung giờ từ 06:00 đến 23:00
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
]

// Mock dữ liệu đặt sân ban đầu cho các ô grid
const INITIAL_BOOKINGS = {
  // Sân A1
  'a1-07:00': { customer: 'Phạm Tuấn Anh', phone: '0901234567', status: 'checked_in', escrow: 220000, code: 'SNX-1011-CHK', note: 'CLB Cầu lông Sáng' },
  'a1-17:00': { customer: 'Nguyễn Văn An', phone: '0912345678', status: 'checked_in', escrow: 350000, code: 'SNX-89324-CHK', note: 'Đặt cặp đấu giao hữu' },
  'a1-18:00': { customer: 'Trần Hoài Nam', phone: '0933888777', status: 'escrow_locked', escrow: 260000, code: 'SNX-5512-CHK', note: 'Đã cọc Escrow' },
  'a1-19:00': { customer: 'Trần Hoài Nam', phone: '0933888777', status: 'escrow_locked', escrow: 260000, code: 'SNX-5513-CHK', note: 'Đã cọc Escrow' },
  'a1-20:00': { customer: 'Lê Quốc Bảo', phone: '0987654321', status: 'escrow_locked', escrow: 260000, code: 'SNX-7711-CHK', note: 'Kèo đôi nam nữ' },

  // Sân A2
  'a2-08:00': { customer: 'Vũ Minh Đức', phone: '0944112233', status: 'checked_in', escrow: 220000, code: 'SNX-3312-CHK', note: 'Đánh đơn' },
  'a2-18:00': { customer: 'Đỗ Tiến Đạt', phone: '0908765432', status: 'escrow_locked', escrow: 260000, code: 'SNX-9981-CHK', note: 'Đã thanh toán Escrow' },
  'a2-19:00': { customer: 'Đỗ Tiến Đạt', phone: '0908765432', status: 'escrow_locked', escrow: 260000, code: 'SNX-9982-CHK', note: 'Đã thanh toán Escrow' },

  // Sân A3
  'a3-15:00': { customer: 'Phạm Đức Trọng', phone: '0934999888', status: 'checked_in', escrow: 300000, code: 'SNX-99001-USED', note: 'Đã giải ngân' },
  'a3-17:00': { customer: 'Nguyễn Hải Đăng', phone: '0977223344', status: 'escrow_locked', escrow: 220000, code: 'SNX-6612-CHK', note: 'Khách quen tuần' },

  // Sân B1 (Bóng đá)
  'b1-17:00': { customer: 'FC Thanh Niên Q7', phone: '0918273645', status: 'checked_in', escrow: 450000, code: 'SNX-4421-CHK', note: 'Trận bóng 5v5' },
  'b1-19:00': { customer: 'Trần Minh Quân', phone: '0988765432', status: 'escrow_locked', escrow: 600000, code: 'SNX-44219-CHK', note: 'FC Saigon All-Stars' },
  'b1-20:00': { customer: 'Trần Minh Quân', phone: '0988765432', status: 'escrow_locked', escrow: 600000, code: 'SNX-44220-CHK', note: 'FC Saigon All-Stars' },

  // Sân B2
  'b2-18:00': { customer: 'FC Techcombank', phone: '0922334455', status: 'escrow_locked', escrow: 450000, code: 'SNX-7761-CHK', note: 'Giao hữu nội bộ' },
  'b2-19:00': { customer: 'FC Brotherhood', phone: '0933445566', status: 'escrow_locked', escrow: 450000, code: 'SNX-7762-CHK', note: 'Trận 60 phút' },

  // Sân B3 (Sân 7)
  'b3-18:00': { customer: 'FC Đại Học Tôn Đức Thắng', phone: '0966778899', status: 'escrow_locked', escrow: 650000, code: 'SNX-8811-CHK', note: 'Sân 7 người' },
  'b3-19:00': { customer: 'FC Đại Học Tôn Đức Thắng', phone: '0966778899', status: 'escrow_locked', escrow: 650000, code: 'SNX-8812-CHK', note: 'Sân 7 người' },

  // Sân C1 (Pickleball)
  'c1-16:00': { customer: 'Lê Hoàng Yến', phone: '0903111222', status: 'checked_in', escrow: 240000, code: 'SNX-77102-CHK', note: 'Đã check-in' },
  'c1-17:00': { customer: 'Ngô Thanh Vân', phone: '0912998877', status: 'escrow_locked', escrow: 280000, code: 'SNX-3341-CHK', note: 'Tập huấn đôi nam nữ' },
  'c1-18:00': { customer: 'Ngô Thanh Vân', phone: '0912998877', status: 'escrow_locked', escrow: 280000, code: 'SNX-3342-CHK', note: 'Tập huấn đôi nam nữ' },

  // Sân D1 (Tennis)
  'd1-17:00': { customer: 'Lâm Chí Hào', phone: '0909554433', status: 'escrow_locked', escrow: 380000, code: 'SNX-9911-CHK', note: 'Đánh đơn 2 set' },
  'd1-18:00': { customer: 'Lâm Chí Hào', phone: '0909554433', status: 'escrow_locked', escrow: 380000, code: 'SNX-9912-CHK', note: 'Đánh đơn 2 set' },
}

export default function ViewCourtBookingSchedule() {
  const [selectedDate, setSelectedDate] = useState('2026-10-10')
  const [filterSport, setFilterSport] = useState('all') // 'all' | 'badminton' | 'football' | 'pickleball' | 'tennis'
  const [filterZone, setFilterZone] = useState('all') // 'all' | 'Khu A' | 'Khu B' | 'Khu C' | 'Khu D'
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'checked_in' | 'escrow_locked' | 'available'

  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showWalkinModal, setShowWalkinModal] = useState(false)
  const [walkinSlotData, setWalkinSlotData] = useState(null)
  const [walkinName, setWalkinName] = useState('')
  const [walkinPhone, setWalkinPhone] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Lọc danh sách sân hiển thị
  const filteredCourts = COURTS_LIST.filter((c) => {
    if (filterSport !== 'all' && c.sport !== filterSport) return false
    if (filterZone !== 'all' && c.zone !== filterZone) return false
    return true
  })

  // Thống kê tổng số slot trong ngày
  const totalSlotsCount = filteredCourts.length * TIME_SLOTS.length
  let bookedCount = 0
  let checkedInCount = 0
  let totalEscrowRevenue = 0

  filteredCourts.forEach((c) => {
    TIME_SLOTS.forEach((t) => {
      const key = `${c.id}-${t}`
      const b = bookings[key]
      if (b) {
        bookedCount++
        totalEscrowRevenue += b.escrow
        if (b.status === 'checked_in') checkedInCount++
      }
    })
  })

  const occupancyRate = Math.round((bookedCount / totalSlotsCount) * 100) || 0

  // Click vào ô slot
  const handleSlotClick = (court, time) => {
    const key = `${court.id}-${time}`
    const booking = bookings[key]

    if (booking) {
      setSelectedSlot({
        key,
        court,
        time,
        ...booking,
      })
    } else {
      setWalkinSlotData({ court, time, key })
      setWalkinName('')
      setWalkinPhone('')
      setShowWalkinModal(true)
    }
  }

  // Đặt sân nhanh cho khách vãng lai
  const handleCreateWalkinBooking = (e) => {
    e.preventDefault()
    if (!walkinName.trim() || !walkinSlotData) return

    const newKey = walkinSlotData.key
    const newBooking = {
      customer: `${walkinName.trim()} (Khách Vãng Lai)`,
      phone: walkinPhone.trim() || '0900 000 000',
      status: 'checked_in', // Khách đến trực tiếp, coi như check-in ngay
      escrow: walkinSlotData.court.price,
      code: `WLK-${Math.floor(1000 + Math.random() * 9000)}-DIR`,
      note: 'Thanh toán trực tiếp tại quầy lễ tân',
    }

    setBookings((prev) => ({
      ...prev,
      [newKey]: newBooking,
    }))

    setShowWalkinModal(false)
    showToast(`Đã nhận đặt sân trực tiếp cho "${newBooking.customer}" lúc ${walkinSlotData.time}!`)
  }

  // Hủy đặt sân
  const handleCancelBooking = (key) => {
    setBookings((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setSelectedSlot(null)
    showToast('Đã hủy lịch đặt sân và hoàn trả trạng thái slot trống!')
  }

  // Check-in nhanh từ Modal
  const handleQuickCheckIn = (key) => {
    setBookings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'checked_in',
      },
    }))
    setSelectedSlot((prev) => (prev ? { ...prev, status: 'checked_in' } : null))
    showToast('✅ Đã xác nhận check-in nhanh & kích hoạt giải ngân Escrow!')
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

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

      {/* Header section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
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
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Unified Multi-Sport Scheduler
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Lưới lịch trực quan đồng bộ thời gian thực
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
            Lịch Đặt Sân Tích Hợp Toàn Bộ Cụm Thể Thao
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
            Xem toàn bộ {COURTS_LIST.length} sân (Cầu lông, Bóng đá, Pickleball, Tennis) trên một bảng lưới trực quan duy nhất.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '6px 12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() - 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              color: '#0F172A',
              cursor: 'pointer',
              background: 'transparent',
              outline: 'none',
            }}
          />

          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <button
            onClick={() => setSelectedDate('2026-10-10')}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Hôm Nay
          </button>
        </div>
      </div>

      {/* Analytics KPI Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Tỷ Lệ Lấp Đầy Trong Ngày</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {occupancyRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
            {bookedCount}/{totalSlotsCount} khung giờ đã có khách
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Đã Check-in & Vào Sân</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', margin: '4px 0' }}>
            {checkedInCount} Trận Đấu
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {bookedCount - checkedInCount} trận đang chờ tới giờ
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Doanh Thu Escrow Dự Kiến</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', margin: '4px 0' }}>
            {formatVND(totalEscrowRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
            Tiền cọc an toàn bảo chứng 100%
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sân Sẵn Sàng Phục Vụ</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
            {filteredCourts.length} Sân Đấu
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Áp dụng định giá động tự động
          </div>
        </div>
      </div>

      {/* Filter and Legend Controls */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Sport Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Bộ môn:</span>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              <option value="all">Tất cả môn</option>
              <option value="badminton">🏸 Cầu lông</option>
              <option value="football">⚽ Bóng đá mini</option>
              <option value="pickleball">🏓 Pickleball</option>
              <option value="tennis">🎾 Tennis</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Khu vực:</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              <option value="all">Tất cả khu (A, B, C, D)</option>
              <option value="Khu A">Khu A (Cầu lông)</option>
              <option value="Khu B">Khu B (Bóng đá)</option>
              <option value="Khu C">Khu C (Pickleball)</option>
              <option value="Khu D">Khu D (Tennis)</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10B981' }} />
            <span>Đã Check-in (Đang chơi)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#F59E0B' }} />
            <span>Đã Cọc Escrow (Chờ vào sân)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid #CBD5E1' }} />
            <span>Còn Trống (Bấm để nhận khách)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Schedule Viewport */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
              <th
                style={{
                  padding: '14px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#1E293B',
                  textAlign: 'left',
                  width: '240px',
                  position: 'sticky',
                  left: 0,
                  background: '#F8FAFC',
                  zIndex: 20,
                  boxShadow: '2px 0 5px rgba(0,0,0,0.04)',
                }}
              >
                SÂN THI ĐẤU
              </th>
              {TIME_SLOTS.map((slot) => {
                const hourNum = parseInt(slot.split(':')[0], 10)
                const isPeak = hourNum >= 17 && hourNum <= 22
                return (
                  <th
                    key={slot}
                    style={{
                      padding: '12px 10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isPeak ? '#DC2626' : '#475569',
                      textAlign: 'center',
                      background: isPeak ? '#FEF2F2' : '#F8FAFC',
                      borderLeft: '1px solid #E2E8F0',
                      minWidth: '85px',
                    }}
                  >
                    <div>{slot}</div>
                    {isPeak && (
                      <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: 800, textTransform: 'uppercase' }}>
                        Peak 🔥
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filteredCourts.map((court) => (
              <tr key={court.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                {/* Court Name Col (Sticky) */}
                <td
                  style={{
                    padding: '12px 18px',
                    position: 'sticky',
                    left: 0,
                    background: '#FFFFFF',
                    zIndex: 10,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.04)',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: court.color,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {court.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {court.zoneName.split('—')[0]} • {formatVND(court.price)}/h
                      </div>
                    </div>
                  </div>
                </td>

                {/* Time Slot Columns */}
                {TIME_SLOTS.map((time) => {
                  const key = `${court.id}-${time}`
                  const booking = bookings[key]
                  const isCheckedIn = booking?.status === 'checked_in'
                  const isLocked = booking?.status === 'escrow_locked'

                  return (
                    <td
                      key={time}
                      onClick={() => handleSlotClick(court, time)}
                      style={{
                        padding: '6px',
                        borderLeft: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        verticalAlign: 'top',
                        background: isCheckedIn
                          ? '#ECFDF5'
                          : isLocked
                          ? '#FEF3C7'
                          : '#FFFFFF',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!booking) e.currentTarget.style.background = '#F1F5F9'
                      }}
                      onMouseLeave={(e) => {
                        if (!booking) e.currentTarget.style.background = '#FFFFFF'
                      }}
                    >
                      {booking ? (
                        <div
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            background: isCheckedIn ? '#10B981' : '#F59E0B',
                            color: '#FFFFFF',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {booking.customer.split('(')[0].trim()}
                          </div>
                          <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>
                            {isCheckedIn ? 'Đã Vào Sân' : 'Đã Cọc Escrow'}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#CBD5E1',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          + Trống
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Chi Tiết Lượt Đặt Sân Đã Có */}
      {selectedSlot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
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
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: selectedSlot.status === 'checked_in' ? '#DCFCE7' : '#FEF3C7',
                    color: selectedSlot.status === 'checked_in' ? '#15803D' : '#B45309',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {selectedSlot.status === 'checked_in' ? 'ĐÃ CHECK-IN (ĐANG CHƠI)' : 'CHỜ CHECK-IN (ĐÃ CỌC ESCROW)'}
                </span>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
              Chi Tiết Đặt Sân: {selectedSlot.court.name}
            </h3>

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Người đặt:</span>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>{selectedSlot.customer}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Số điện thoại:</span>
                <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: 700 }}>{selectedSlot.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Khung giờ:</span>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                  {selectedSlot.time} (60 phút) • {selectedDate}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Tiền cọc Escrow:</span>
                <strong style={{ fontSize: '15px', color: '#16A34A' }}>{formatVND(selectedSlot.escrow)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Mã vé đặt sân:</span>
                <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'monospace' }}>{selectedSlot.code}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedSlot.status !== 'checked_in' && (
                <button
                  onClick={() => handleQuickCheckIn(selectedSlot.key)}
                  style={{
                    flex: 1,
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    how_to_reg
                  </span>
                  Check-in Nhanh & Giải Ngân
                </button>
              )}

              <button
                onClick={() => handleCancelBooking(selectedSlot.key)}
                style={{
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy Đặt Sân
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Đặt Sân Cho Khách Vãng Lai (Walk-in) */}
      {showWalkinModal && walkinSlotData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
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
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Đặt Giữ Chỗ Nhanh (Khách Vãng Lai)
              </h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {walkinSlotData.court.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Khung giờ: <strong>{walkinSlotData.time}</strong> • Giá: <strong>{formatVND(walkinSlotData.court.price)}</strong>
              </div>
            </div>

            <form onSubmit={handleCreateWalkinBooking}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Tên Khách Hàng / Đội Bóng:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Anh Tuấn, FC Hoàng Gia..."
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Số Điện Thoại Liên Hệ:
                </label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đóng
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
                  Xác Nhận Giữ Sân
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
