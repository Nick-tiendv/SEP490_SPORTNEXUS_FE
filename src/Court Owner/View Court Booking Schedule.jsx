import { useEffect, useMemo, useState } from 'react'
import { cancelOwnerBooking, checkInBooking, createWalkInBooking, getCancellationReasons, getFacilitySlots, updateSlotStatus } from '../api/owner'
import { useOwnerContext } from './ownerContext.js'

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
// Body PUT /slots/{id}/status nhận enum dạng số (docs/api/02).
const SLOT_STATUS_CODE = { AVAILABLE: 0, MAINTENANCE: 3 }

const SPORT_COLORS = {
  'Cầu lông': '#10B981',
  'Bóng đá': '#3B82F6',
  Pickleball: '#F59E0B',
  Tennis: '#EC4899',
  'Bóng chuyền': '#8B5CF6',
  'Bóng rổ': '#EF4444',
}
const sportColor = (sport) => SPORT_COLORS[sport] || '#64748B'

const todayVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date())
const toClockVN = (value) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
const shiftDate = (date, days) => {
  const [y, m, d] = date.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return next.toISOString().slice(0, 10)
}
const formatDateVN = (date) => {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

// Trạng thái hiển thị của 1 ô lịch
function cellState(slot) {
  if (!slot) return 'none'
  const status = String(slot.status || '').toUpperCase()
  if (status === 'BOOKED') {
    const booking = String(slot.bookingStatus || '').toUpperCase()
    if (booking === 'CHECKED_IN') return 'checked_in'
    if (booking === 'PENDING') return 'pending'
    return 'paid'
  }
  if (status === 'MAINTENANCE') return 'maintenance'
  if (status === 'RESERVED') return 'reserved'
  return slot.isPast ? 'past' : 'available'
}

const CELL_STYLES = {
  checked_in: { bg: '#ECFDF5', chip: '#10B981', label: 'Đã Vào Sân' },
  paid: { bg: '#FEF3C7', chip: '#F59E0B', label: 'Đã Thanh Toán' },
  pending: { bg: '#EFF6FF', chip: '#3B82F6', label: 'Chờ Góp Tiền' },
  reserved: { bg: '#F5F3FF', chip: '#8B5CF6', label: 'Giữ Cho Giải' },
}

const BOOKING_STATUS_LABEL = {
  checked_in: 'ĐÃ CHECK-IN (ĐANG CHƠI)',
  paid: 'ĐÃ THANH TOÁN (CHỜ CHECK-IN)',
  pending: 'ĐƠN CHIA TIỀN (CHỜ GÓP ĐỦ)',
}

export default function ViewCourtBookingSchedule() {
  const { facilityId, facility, loading: layoutLoading, error: layoutError, refreshWallet } = useOwnerContext()
  const [selectedDate, setSelectedDate] = useState(todayVN)
  const [filterSport, setFilterSport] = useState('all')
  const [reloadKey, setReloadKey] = useState(0)

  // Lịch gắn với khóa (cơ sở + ngày + lần tải) để không hiện nhầm dữ liệu cũ khi đổi ngày.
  const calendarKey = `${facilityId}|${selectedDate}|${reloadKey}`
  const [calendar, setCalendar] = useState(null) // { key, data }
  const [calendarError, setCalendarError] = useState(null) // { key, message }
  const [cancelReasons, setCancelReasons] = useState([])

  const [selectedSlot, setSelectedSlot] = useState(null) // { court, slot }
  const [walkinSlot, setWalkinSlot] = useState(null) // { court, slot } hoặc { items: [{ court, slot }] } khi đặt nhiều ca
  // Chế độ chọn nhiều ca rời nhau (gửi courtSlotIds). Danh sách chọn gắn với cơ sở + ngày.
  const [multiMode, setMultiMode] = useState(false)
  const [picks, setPicks] = useState({ key: '', items: [] })
  const [walkinName, setWalkinName] = useState('')
  const [walkinPhone, setWalkinPhone] = useState('')
  const [walkinSlots, setWalkinSlots] = useState(1)
  const [walkinNote, setWalkinNote] = useState('')
  const [walkinAutoCheckIn, setWalkinAutoCheckIn] = useState(false)
  const [cancelMode, setCancelMode] = useState(false)
  const [cancelReasonCode, setCancelReasonCode] = useState('')
  const [cancelReasonText, setCancelReasonText] = useState('')
  const [lockAfterCancel, setLockAfterCancel] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    const key = `${facilityId}|${selectedDate}|${reloadKey}`
    getFacilitySlots(facilityId, selectedDate)
      .then((data) => !cancelled && setCalendar({ key, data }))
      .catch((error) => !cancelled && setCalendarError({ key, message: error.message }))
    return () => { cancelled = true }
  }, [facilityId, selectedDate, reloadKey])

  useEffect(() => {
    getCancellationReasons().then(setCancelReasons).catch(() => {})
  }, [])

  const reload = () => setReloadKey((value) => value + 1)
  // Giữ dữ liệu lần tải trước của cùng cơ sở + ngày trong lúc tải lại để lưới không nháy.
  const sameView = (key) => key?.split('|').slice(0, 2).join('|') === `${facilityId}|${selectedDate}`
  const data = calendar && sameView(calendar.key) ? calendar.data : null
  const loadError = layoutError || (calendarError?.key === calendarKey ? calendarError.message : '')
  const loading = layoutLoading || (!!facilityId && !data && !loadError)

  const courts = useMemo(
    () =>
      (data?.courts || []).map((court) => ({
        id: String(court.courtId),
        name: court.courtName || '—',
        sport: court.sportName || 'Khác',
        status: String(court.status || '').toUpperCase(),
        // Ca theo giờ bắt đầu (giờ Việt Nam) để tra ô lưới.
        slots: new Map((court.slots || []).map((slot) => [toClockVN(slot.startTime), slot])),
      })),
    [data],
  )

  const sports = [...new Set(courts.map((court) => court.sport))]
  const filteredCourts = courts.filter((court) => filterSport === 'all' || court.sport === filterSport)
  const timeSlots = useMemo(() => [...new Set(courts.flatMap((court) => [...court.slots.keys()]))].sort(), [courts])

  // Thống kê trong ngày (theo bộ lọc)
  let totalSlotsCount = 0
  let bookedCount = 0
  let checkedInCount = 0
  let expectedRevenue = 0
  filteredCourts.forEach((court) => {
    court.slots.forEach((slot) => {
      totalSlotsCount++
      const state = cellState(slot)
      if (state === 'checked_in' || state === 'paid' || state === 'pending') {
        bookedCount++
        expectedRevenue += Number(slot.price) || 0
        if (state === 'checked_in') checkedInCount++
      }
    })
  })
  const occupancyRate = totalSlotsCount ? Math.round((bookedCount / totalSlotsCount) * 100) : 0
  const activeCourtCount = filteredCourts.filter((court) => court.status === 'ACTIVE').length

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' đ'

  // Số ca trống liên tiếp tính từ ca được chọn (để đặt nhiều giờ một lần)
  const consecutiveFreeSlots = (court, slot) => {
    const times = [...court.slots.keys()].sort()
    let count = 0
    for (let i = times.indexOf(toClockVN(slot.startTime)); i >= 0 && i < times.length; i++) {
      if (cellState(court.slots.get(times[i])) !== 'available') break
      if (count > 0 && court.slots.get(times[i - 1]).endTime !== court.slots.get(times[i]).startTime) break
      count++
    }
    return Math.max(count, 1)
  }

  // Ca đang chọn của đúng cơ sở + ngày đang xem (đổi ngày thì danh sách cũ tự bỏ qua).
  const viewKey = `${facilityId}|${selectedDate}`
  const pickedItems = picks.key === viewKey ? picks.items : []
  const pickedIds = new Set(pickedItems.map((item) => item.slot.id))
  const pickedTotal = pickedItems.reduce((sum, item) => sum + (Number(item.slot.price) || 0), 0)

  const togglePick = (court, slot) => {
    setPicks((prev) => {
      const items = prev.key === viewKey ? prev.items : []
      const exists = items.some((item) => item.slot.id === slot.id)
      return { key: viewKey, items: exists ? items.filter((item) => item.slot.id !== slot.id) : [...items, { court, slot }] }
    })
  }

  const clearPicks = () => setPicks({ key: '', items: [] })

  const toggleMultiMode = () => {
    setMultiMode((value) => !value)
    clearPicks()
  }

  const openWalkin = (target) => {
    setWalkinSlot(target)
    setWalkinName('')
    setWalkinPhone('')
    setWalkinSlots(1)
    setWalkinNote('')
    setWalkinAutoCheckIn(false)
  }

  const openMultiWalkin = () => {
    if (!pickedItems.length) return
    const items = [...pickedItems].sort(
      (a, b) => a.court.name.localeCompare(b.court.name, 'vi') || String(a.slot.startTime).localeCompare(String(b.slot.startTime)),
    )
    openWalkin({ items })
  }

  const handleSlotClick = (court, slot) => {
    const state = cellState(slot)
    if (multiMode) {
      if (state === 'available') togglePick(court, slot)
      return
    }
    if (state === 'none' || state === 'past' || state === 'reserved') return
    if (state === 'available') {
      openWalkin({ court, slot })
      return
    }
    setSelectedSlot({ court, slot })
    setCancelMode(false)
    setCancelReasonCode(String(cancelReasons[0]?.code ?? ''))
    setCancelReasonText('')
    setLockAfterCancel(false)
  }

  const runAction = async (action, successMessage, after) => {
    setBusy(true)
    try {
      await action()
      showToast(successMessage)
      after?.()
      reload()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  // Đặt sân cho khách vãng lai: POST /bookings/owner/walk-in
  const handleCreateWalkinBooking = (e) => {
    e.preventDefault()
    if (!walkinName.trim() || !walkinSlot || busy) return
    const customer = {
      customerName: walkinName.trim(),
      customerPhone: walkinPhone.trim() || null,
      note: walkinNote.trim() || null,
      autoCheckIn: walkinAutoCheckIn,
    }
    if (walkinSlot.items) {
      const { items } = walkinSlot
      runAction(
        () => createWalkInBooking({ courtSlotIds: items.map((item) => item.slot.id), ...customer }),
        `Đã nhận đặt ${items.length} ca cho "${customer.customerName}"!`,
        () => { setWalkinSlot(null); clearPicks(); setMultiMode(false) },
      )
      return
    }
    const { court, slot } = walkinSlot
    runAction(
      () =>
        createWalkInBooking({
          courtSlotId: slot.id,
          numberOfSlots: Number(walkinSlots) || 1,
          ...customer,
        }),
      `Đã nhận đặt sân cho "${customer.customerName}" tại ${court.name} lúc ${toClockVN(slot.startTime)}!`,
      () => setWalkinSlot(null),
    )
  }

  // Khóa / mở lại ca trống: PUT /slots/{id}/status
  const handleToggleSlotLock = (slot, lock) => {
    runAction(
      () => updateSlotStatus(slot.id, { status: lock ? SLOT_STATUS_CODE.MAINTENANCE : SLOT_STATUS_CODE.AVAILABLE }),
      lock ? 'Đã khóa ca để bảo trì.' : 'Đã mở lại ca cho khách đặt.',
      () => { setWalkinSlot(null); setSelectedSlot(null) },
    )
  }

  // Check-in thủ công: POST /bookings/owner/{id}/check-in
  const handleQuickCheckIn = () => {
    const { slot } = selectedSlot
    runAction(
      () => checkInBooking(slot.bookingId, { checkInAllParticipants: true }),
      '✅ Đã check-in cho đơn đặt sân!',
      () => { setSelectedSlot(null); refreshWallet().catch(() => {}) },
    )
  }

  // Hủy đơn (người đặt luôn được hoàn tiền): POST /bookings/owner/{id}/cancel
  const handleCancelBooking = (e) => {
    e.preventDefault()
    const { slot } = selectedSlot
    const reason = cancelReasons.find((item) => String(item.code) === cancelReasonCode)
    if (reason?.isCustom && !cancelReasonText.trim()) {
      showToast('Vui lòng nhập lý do hủy.', 'error')
      return
    }
    runAction(
      () =>
        cancelOwnerBooking(slot.bookingId, {
          reasonCode: reason ? reason.code : null,
          reason: reason?.isCustom ? cancelReasonText.trim() : reason?.label || cancelReasonText.trim() || null,
          lockSlotAfterCancel: lockAfterCancel,
        }),
      'Đã hủy đơn đặt sân và hoàn tiền cho người đặt.',
      () => setSelectedSlot(null),
    )
  }

  const panelStyle = { background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(255, 255, 255, 0.90)', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }
  const dateButtonStyle = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center' }
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }

  if (!layoutLoading && !layoutError && !facilityId) {
    return (
      <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ ...panelStyle, padding: '48px 28px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#10B981' }}>domain_add</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '12px 0 6px' }}>Bạn chưa có cơ sở nào</h2>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: 600 }}>
            Hãy đăng ký cơ sở thể thao và chờ quản trị viên phê duyệt để xem lịch đặt sân.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '420px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toastMessage.msg}
        </div>
      )}

      {/* Header section */}
      <div
        style={{
          ...panelStyle,
          borderRadius: '20px',
          padding: '24px 28px',
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
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>
              {data?.facilityName || facility?.name || ''}
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Lịch Đặt Sân Ngày {formatDateVN(selectedDate)}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
            Xem toàn bộ {courts.length} sân{sports.length ? ` (${sports.join(', ')})` : ''} trên một bảng lưới duy nhất. Bấm ô trống để nhận khách vãng lai.
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
              calendar_view_week
            </span>
            <div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                Tổng Quy Mô Lưới
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                {data ? `${data.totalSlots} ca • ${data.availableSlots} trống • ${data.lockedSlots} khóa` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={panelStyle}>
          <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 800 }}>Tỷ Lệ Lấp Đầy Trong Ngày</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>{occupancyRate}%</div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
            {bookedCount}/{totalSlotsCount} ca đã có khách
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 800 }}>Đã Check-in & Vào Sân</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', margin: '4px 0' }}>{checkedInCount} Ca</div>
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700 }}>
            {bookedCount - checkedInCount} ca đang chờ khách tới
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 800 }}>Doanh Thu Dự Kiến Trong Ngày</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#1D4ED8', margin: '4px 0' }}>{formatVND(expectedRevenue)}</div>
          <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 700 }}>Tổng giá các ca đã có khách</div>
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 800 }}>Sân Sẵn Sàng Phục Vụ</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', margin: '4px 0' }}>
            {activeCourtCount}/{filteredCourts.length} Sân
          </div>
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700 }}>Sân con đang hoạt động</div>
        </div>
      </div>

      {/* Filter and Legend Controls */}
      <div
        style={{
          ...panelStyle,
          borderRadius: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Date picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>Ngày:</span>
            <button type="button" style={dateButtonStyle} onClick={() => setSelectedDate((d) => shiftDate(d, -1))} title="Ngày trước">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}
            />
            <button type="button" style={dateButtonStyle} onClick={() => setSelectedDate((d) => shiftDate(d, 1))} title="Ngày sau">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
            <button type="button" style={dateButtonStyle} onClick={() => setSelectedDate(todayVN())}>Hôm nay</button>
            <button type="button" style={dateButtonStyle} onClick={reload} title="Tải lại lịch">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            </button>
          </div>

          {/* Sport Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>Bộ môn:</span>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}
            >
              <option value="all">Tất cả môn</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={toggleMultiMode}
            title="Chọn nhiều ca rời nhau rồi tạo một đơn tại quầy"
            style={{
              ...dateButtonStyle,
              gap: '6px',
              background: multiMode ? '#10B981' : '#FFFFFF',
              borderColor: multiMode ? '#10B981' : '#CBD5E1',
              color: multiMode ? '#FFFFFF' : '#0F172A',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{multiMode ? 'close' : 'library_add_check'}</span>
            {multiMode ? 'Thoát chọn nhiều ca' : 'Chọn nhiều ca'}
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 600 }}>
          {[
            ['#10B981', 'Đã Check-in'],
            ['#F59E0B', 'Đã Thanh Toán (Chờ vào sân)'],
            ['#3B82F6', 'Chờ Góp Tiền'],
            ['#8B5CF6', 'Giữ Cho Giải Đấu'],
            ['#94A3B8', 'Bảo Trì / Khóa'],
          ].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: color }} />
              <span>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid #CBD5E1' }} />
            <span>Còn Trống (Bấm để nhận khách)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Schedule Viewport */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 32px rgba(45, 95, 63, 0.06)',
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        {loading || loadError || timeSlots.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: loadError ? '#EF4444' : '#10B981' }}>
              {loading ? 'progress_activity' : loadError ? 'error' : 'event_busy'}
            </span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
              {loading ? 'Đang tải lịch đặt sân...' : loadError ? 'Không thể tải lịch đặt sân' : 'Chưa có ca sân nào trong ngày này'}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
              {loading
                ? 'Lần tải đầu có thể mất 30–60 giây khi máy chủ khởi động.'
                : loadError || 'Vào Quản Lý Cụm Sân để sinh ca cho các sân con, hoặc chọn ngày khác.'}
            </div>
          </div>
        ) : (
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
                {timeSlots.map((time) => (
                  <th
                    key={time}
                    style={{
                      padding: '12px 10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#475569',
                      textAlign: 'center',
                      background: '#F8FAFC',
                      borderLeft: '1px solid #E2E8F0',
                      minWidth: '85px',
                    }}
                  >
                    {time}
                  </th>
                ))}
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
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sportColor(court.sport), flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{court.name}</div>
                        <div style={{ fontSize: '11.5px', color: court.status === 'ACTIVE' ? '#1E293B' : '#B45309', fontWeight: 700 }}>
                          {court.sport}{court.status !== 'ACTIVE' ? ' • Tạm ngưng' : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Time Slot Columns */}
                  {timeSlots.map((time) => {
                    const slot = court.slots.get(time)
                    const state = cellState(slot)
                    const style = CELL_STYLES[state]
                    const picked = !!slot && pickedIds.has(slot.id)
                    const clickable = multiMode ? state === 'available' : state === 'available' || state === 'maintenance' || !!style && state !== 'reserved'

                    return (
                      <td
                        key={time}
                        onClick={() => handleSlotClick(court, slot)}
                        title={slot ? `${toClockVN(slot.startTime)} - ${toClockVN(slot.endTime)} • ${formatVND(slot.price)}` : 'Chưa sinh ca'}
                        style={{
                          padding: '6px',
                          borderLeft: '1px solid #F1F5F9',
                          cursor: clickable ? 'pointer' : 'default',
                          verticalAlign: 'top',
                          background: picked ? '#D1FAE5' : style ? style.bg : state === 'maintenance' ? '#F1F5F9' : '#FFFFFF',
                          outline: picked ? '2px solid #10B981' : 'none',
                          outlineOffset: '-2px',
                          opacity: multiMode && !clickable ? 0.55 : 1,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (state === 'available' && !picked) e.currentTarget.style.background = '#F1F5F9'
                        }}
                        onMouseLeave={(e) => {
                          if (state === 'available' && !picked) e.currentTarget.style.background = '#FFFFFF'
                        }}
                      >
                        {style ? (
                          <div
                            style={{
                              padding: '6px 8px',
                              borderRadius: '8px',
                              background: style.chip,
                              color: '#FFFFFF',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                              {state === 'reserved' ? slot.matchName || slot.tournamentName || 'Trận đấu giải' : slot.customerName || 'Khách hàng'}
                            </div>
                            <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>
                              {style.label}{slot.isWalkIn ? ' • Vãng lai' : ''}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              height: '42px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: state === 'maintenance' ? '#64748B' : '#CBD5E1',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {state === 'available' && picked && (
                              <>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#047857', fontWeight: 800 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                  Đã chọn
                                </span>
                                <span style={{ fontSize: '10px', color: '#047857' }}>{formatVND(slot.price)}</span>
                              </>
                            )}
                            {state === 'available' && !picked && (
                              <>
                                <span>{multiMode ? '+ Chọn' : '+ Trống'}</span>
                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{formatVND(slot.price)}</span>
                              </>
                            )}
                            {state === 'maintenance' && (
                              <>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>build</span>
                                <span>Bảo trì</span>
                              </>
                            )}
                            {state === 'past' && <span>Đã qua</span>}
                            {state === 'none' && <span>—</span>}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thanh thao tác khi chọn nhiều ca */}
      {multiMode && (
        <div
          style={{
            ...panelStyle,
            position: 'sticky',
            bottom: '16px',
            marginTop: '16px',
            zIndex: 30,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            border: '1px solid #A7F3D0',
          }}
        >
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
            {pickedItems.length
              ? <>Đã chọn <strong>{pickedItems.length} ca</strong> • Tổng <strong style={{ color: '#047857' }}>{formatVND(pickedTotal)}</strong></>
              : 'Bấm vào các ô trống trên lưới để chọn ca (có thể khác giờ, khác sân).'}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={clearPicks}
              disabled={!pickedItems.length}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: pickedItems.length ? 1 : 0.5 }}
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={openMultiWalkin}
              disabled={!pickedItems.length}
              style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: pickedItems.length ? 1 : 0.5 }}
            >
              Đặt {pickedItems.length || ''} ca đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Modal: Chi tiết ca đã đặt / đang bảo trì */}
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
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            {(() => {
              const { court, slot } = selectedSlot
              const state = cellState(slot)
              const timeRange = `${toClockVN(slot.startTime)} - ${toClockVN(slot.endTime)}`

              if (state === 'maintenance') {
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Ca Đang Khóa / Bảo Trì</h3>
                      <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 600, margin: '0 0 20px 0' }}>
                      {court.name} • {timeRange} ngày {formatDateVN(selectedDate)}. Mở lại để người chơi có thể đặt ca này.
                    </p>
                    <button
                      onClick={() => handleToggleSlotLock(slot, false)}
                      disabled={busy || slot.isPast}
                      style={{ width: '100%', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy || slot.isPast ? 0.6 : 1 }}
                    >
                      {slot.isPast ? 'Ca đã qua giờ' : busy ? 'Đang xử lý...' : 'Mở Lại Ca'}
                    </button>
                  </>
                )
              }

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span
                      style={{
                        background: state === 'checked_in' ? '#DCFCE7' : state === 'pending' ? '#DBEAFE' : '#FEF3C7',
                        color: state === 'checked_in' ? '#15803D' : state === 'pending' ? '#1D4ED8' : '#B45309',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {BOOKING_STATUS_LABEL[state]}
                    </span>
                    <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                    Chi Tiết Đặt Sân: {court.name}
                  </h3>

                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #CBD5E1', marginBottom: '20px' }}>
                    {[
                      ['Người đặt:', `${slot.customerName || '—'}${slot.isWalkIn ? ' (Khách vãng lai)' : ''}`],
                      ['Số điện thoại:', slot.customerPhone || '—'],
                      ['Khung giờ:', `${timeRange} • ${formatDateVN(selectedDate)}`],
                      ['Giá ca:', formatVND(slot.price)],
                      ['Mã đơn:', String(slot.bookingId || '—').slice(0, 8).toUpperCase()],
                    ].map(([label, value], idx, rows) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: idx < rows.length - 1 ? '8px' : 0 }}>
                        <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>{label}</span>
                        <strong style={{ fontSize: '14px', color: '#0F172A', textAlign: 'right', fontFamily: label === 'Mã đơn:' ? 'monospace' : undefined }}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  {cancelMode ? (
                    <form onSubmit={handleCancelBooking}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Lý do hủy:</label>
                      <select value={cancelReasonCode} onChange={(e) => setCancelReasonCode(e.target.value)} style={{ ...inputStyle, marginBottom: '10px', background: '#FFFFFF' }}>
                        {cancelReasons.map((reason) => (
                          <option key={reason.code} value={String(reason.code)}>{reason.label}</option>
                        ))}
                      </select>
                      {cancelReasons.find((item) => String(item.code) === cancelReasonCode)?.isCustom && (
                        <input
                          type="text"
                          placeholder="Nhập lý do hủy..."
                          value={cancelReasonText}
                          onChange={(e) => setCancelReasonText(e.target.value)}
                          style={{ ...inputStyle, marginBottom: '10px' }}
                        />
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                        <input type="checkbox" checked={lockAfterCancel} onChange={(e) => setLockAfterCancel(e.target.checked)} />
                        Khóa ca này để bảo trì sau khi hủy
                      </label>
                      <p style={{ fontSize: '12px', color: '#B45309', fontWeight: 600, margin: '0 0 16px 0' }}>
                        Chủ sân hủy đơn thì người đặt luôn được hoàn tiền.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setCancelMode(false)} style={{ flex: 1, background: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                          Quay lại
                        </button>
                        <button type="submit" disabled={busy} style={{ flex: 1, background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                          {busy ? 'Đang hủy...' : 'Xác Nhận Hủy Đơn'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {state === 'paid' && (
                        <button
                          onClick={handleQuickCheckIn}
                          disabled={busy}
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
                            opacity: busy ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
                          {busy ? 'Đang check-in...' : 'Check-in Thủ Công'}
                        </button>
                      )}
                      {state !== 'checked_in' && (
                        <button
                          onClick={() => setCancelMode(true)}
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '10px', padding: '12px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flex: state === 'paid' ? undefined : 1 }}
                        >
                          Hủy Đặt Sân
                        </button>
                      )}
                      {state === 'checked_in' && (
                        <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#047857', fontWeight: 700 }}>
                          Khách đã check-in — đơn không thể hủy.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Modal: Đặt Sân Cho Khách Vãng Lai (Walk-in) */}
      {walkinSlot && (
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
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Đặt Giữ Chỗ Nhanh (Khách Vãng Lai)</h3>
              <button onClick={() => setWalkinSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {walkinSlot.items ? (
              <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', border: '1px solid #CBD5E1' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  {walkinSlot.items.length} ca ngày {formatDateVN(selectedDate)}
                </div>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {walkinSlot.items.map(({ court, slot }) => (
                    <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#1E293B', fontWeight: 600, padding: '3px 0' }}>
                      <span>{court.name} • {toClockVN(slot.startTime)} - {toClockVN(slot.endTime)}</span>
                      <span>{formatVND(slot.price)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, color: '#047857', borderTop: '1px dashed #CBD5E1', marginTop: '6px', paddingTop: '6px' }}>
                  <span>Tổng cộng</span>
                  <span>{formatVND(walkinSlot.items.reduce((sum, { slot }) => sum + (Number(slot.price) || 0), 0))}</span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', border: '1px solid #CBD5E1' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{walkinSlot.court.name}</div>
                <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600, marginTop: '2px' }}>
                  Bắt đầu: <strong>{toClockVN(walkinSlot.slot.startTime)}</strong> ngày {formatDateVN(selectedDate)} • Giá:{' '}
                  <strong>{formatVND(walkinSlot.slot.price)}</strong>/ca
                </div>
              </div>
            )}

            <form onSubmit={handleCreateWalkinBooking}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Tên Khách Hàng / Đội Bóng:</label>
                <input type="text" required placeholder="VD: Anh Tuấn, FC Hoàng Gia..." value={walkinName} onChange={(e) => setWalkinName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: walkinSlot.items ? '1fr' : '1fr 140px', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Số Điện Thoại:</label>
                  <input type="tel" placeholder="09xx xxx xxx" value={walkinPhone} onChange={(e) => setWalkinPhone(e.target.value)} style={inputStyle} />
                </div>
                {!walkinSlot.items && <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Số ca liên tiếp:</label>
                  <select value={walkinSlots} onChange={(e) => setWalkinSlots(Number(e.target.value))} style={{ ...inputStyle, background: '#FFFFFF' }}>
                    {Array.from({ length: consecutiveFreeSlots(walkinSlot.court, walkinSlot.slot) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} ca</option>
                    ))}
                  </select>
                </div>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Ghi chú tại quầy:</label>
                <input type="text" placeholder="VD: Đã thu tiền mặt 100%" value={walkinNote} onChange={(e) => setWalkinNote(e.target.value)} style={inputStyle} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '20px' }}>
                <input type="checkbox" checked={walkinAutoCheckIn} onChange={(e) => setWalkinAutoCheckIn(e.target.checked)} />
                Khách đã có mặt — check-in luôn
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                {walkinSlot.items ? <span /> : (
                  <button
                    type="button"
                    onClick={() => handleToggleSlotLock(walkinSlot.slot, true)}
                    disabled={busy}
                    title="Khóa ca này (bảo trì), người chơi sẽ không đặt được"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #FED7AA', background: '#FFF7ED', color: '#C2410C', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Khóa ca
                  </button>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setWalkinSlot(null)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
                  >
                    {busy ? 'Đang tạo đơn...' : 'Xác Nhận Giữ Sân'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
