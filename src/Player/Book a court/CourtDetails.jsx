import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { getFacilities, getFacilityById } from '../../api/facilityApi.js'
import { getCourtSlots, getFacilityAvailability } from '../../api/bookingApi.js'

// Tạo danh sách 7 ngày từ hôm nay (định dạng YYYY-MM-DD cho backend)
function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const dayOfWeek = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : d.getDay() === 0 ? 'Chủ Nhật' : `Thứ ${d.getDay() + 1}`
    days.push({
      dateStr,
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
      dayOfWeek,
      label: `${day}/${month}`,
    })
  }
  return days
}

function CourtDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const dateList = useMemo(() => getNext7Days(), [])
  const [selectedDateStr, setSelectedDateStr] = useState(() => dateList[0]?.dateStr || '')

  // Bước 1: Thông tin Cụm sân
  const [facility, setFacility] = useState(() => location.state?.facility || null)
  const [, setFacilityLoading] = useState(!facility)

  // Sân con đang chọn để xem lịch
  const [selectedCourtId, setSelectedCourtId] = useState(null)

  // Dữ liệu lưới ca của sân con từ API GET /api/v1/courts/{courtId}/slots
  const [courtSlots, setCourtSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState(null)

  // Danh sách các ca thi đấu đã chọn để đặt: Array of slot objects
  const [selectedSlots, setSelectedSlots] = useState([])

  // Tải chi tiết Cụm sân thể thao từ API (Bước 1: GET /api/v1/facilities/{id})
  useEffect(() => {
    let isMounted = true
    async function loadFacility() {
      const paramId = searchParams.get('id') || searchParams.get('facilityId') || facility?.id
      try {
        setFacilityLoading(true)
        if (paramId) {
          const detail = await getFacilityById(paramId)
          if (isMounted && detail) {
            setFacility(detail)
            return
          }
        }
        if (!facility) {
          const list = await getFacilities()
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setFacility(list[0])
          }
        }
      } catch (err) {
        console.warn('Lỗi khi tải chi tiết Cụm sân:', err)
      } finally {
        if (isMounted) setFacilityLoading(false)
      }
    }
    loadFacility()
    return () => { isMounted = false }
  }, [searchParams])

  // Danh sách sân con từ facility.courts
  const courtsList = useMemo(() => {
    if (Array.isArray(facility?.courts) && facility.courts.length > 0) {
      return facility.courts.map((c) => ({
        id: c.id,
        name: c.name,
        sportName: c.categoryName,
        status: c.status,
        defaultPrice: Number(c.defaultPrice) || 120000,
        isBookable: c.status === 'ACTIVE',
      }))
    }
    return []
  }, [facility])

  // Tự động chọn sân con đầu tiên (ưu tiên ACTIVE)
  useEffect(() => {
    if (courtsList.length > 0) {
      if (!selectedCourtId || !courtsList.some((c) => c.id === selectedCourtId)) {
        const firstActive = courtsList.find((c) => c.status === 'ACTIVE') || courtsList[0]
        setSelectedCourtId(firstActive.id)
      }
    }
  }, [courtsList, selectedCourtId])

  // Sân con hiện đang được xem (ưu tiên sân ACTIVE)
  const activeCourt = useMemo(() => {
    return (
      courtsList.find((c) => c.id === selectedCourtId) ||
      courtsList.find((c) => c.status === 'ACTIVE') ||
      courtsList[0] ||
      null
    )
  }, [courtsList, selectedCourtId])

  // GỌI API GET /api/v1/courts/{courtId}/slots?date=YYYY-MM-DD (Hình 2 & 3)
  useEffect(() => {
    let isMounted = true
    async function loadSlots() {
      if (!activeCourt?.id) return
      try {
        setSlotsLoading(true)
        setSlotsError(null)
        const slotsData = await getCourtSlots(activeCourt.id, selectedDateStr)
        if (isMounted) {
          setCourtSlots(Array.isArray(slotsData) ? slotsData : [])
        }
      } catch (err) {
        console.warn(`[CourtDetails] Lỗi khi tải lưới ca sân ${activeCourt.id}:`, err)
        if (isMounted) setSlotsError('Không thể tải lưới ca của sân con này. Vui lòng thử lại.')
      } finally {
        if (isMounted) setSlotsLoading(false)
      }
    }
    loadSlots()
    return () => { isMounted = false }
  }, [activeCourt?.id, selectedDateStr])

  // Format giờ từ ISO string "2026-10-19T06:00:00+07:00" -> "06:00"
  const formatTimeSlot = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return isoString.slice(11, 16)
    }
  }

  // Kiểm tra ca thi đấu có khả dụng hay không (case-insensitive)
  const isSlotAvailable = (slot) => {
    if (!slot) return false
    const norm = String(slot.status || '').toLowerCase()
    return norm === 'available' && slot.isBookable !== false && !slot.isPast
  }

  // Tự động chọn sẵn ca trống đầu tiên khi lưới ca được tải về
  useEffect(() => {
    if (courtSlots.length > 0 && selectedSlots.length === 0 && activeCourt) {
      const firstAvail = courtSlots.find(isSlotAvailable)
      if (firstAvail) {
        setSelectedSlots([
          {
            ...firstAvail,
            courtName: activeCourt.name,
            courtId: activeCourt.id,
            sportName: activeCourt.sportName,
            formattedStart: formatTimeSlot(firstAvail.startTime),
            formattedEnd: formatTimeSlot(firstAvail.endTime),
          },
        ])
      }
    }
  }, [courtSlots, activeCourt, selectedSlots.length])

  // Toggle chọn một ca thi đấu (Chỉ ca trạng thái Available mới đặt được)
  const handleToggleSlot = (slot, court) => {
    if (!isSlotAvailable(slot)) {
      return
    }

    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === slot.id)
      if (exists) {
        return prev.filter((s) => s.id !== slot.id)
      } else {
        return [
          ...prev,
          {
            ...slot,
            courtName: court.name,
            courtId: court.id,
            sportName: court.sportName,
            formattedStart: formatTimeSlot(slot.startTime),
            formattedEnd: formatTimeSlot(slot.endTime),
          },
        ]
      }
    })
  }

  // Chọn toàn bộ các ca trống còn lại trên sân hiện tại
  const handleSelectAllCourtAvailableSlots = () => {
    if (!activeCourt) return
    const avail = courtSlots.filter(isSlotAvailable)
    if (avail.length === 0) return

    setSelectedSlots((prev) => {
      const newItems = avail
        .filter((s) => !prev.some((p) => p.id === s.id))
        .map((slot) => ({
          ...slot,
          courtName: activeCourt.name,
          courtId: activeCourt.id,
          sportName: activeCourt.sportName,
          formattedStart: formatTimeSlot(slot.startTime),
          formattedEnd: formatTimeSlot(slot.endTime),
        }))
      return [...prev, ...newItems]
    })
  }

  // Xóa toàn bộ lựa chọn ca
  const handleClearSelectedSlots = () => {
    setSelectedSlots([])
  }

  // Tính toán payload đặt sân: courtSlotId + numberOfSlots (Cách 1) hoặc courtSlotIds (Cách 2)
  const bookingPayloadConfig = useMemo(() => {
    if (selectedSlots.length === 0) {
      return { courtSlotId: null, numberOfSlots: 0, courtSlotIds: [], isConsecutive: false }
    }

    // Sắp xếp các slot đã chọn theo thời gian bắt đầu
    const sorted = [...selectedSlots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    // Kiểm tra xem tất cả có thuộc cùng 1 sân con và liên tiếp nhau không
    const sameCourt = sorted.every((s) => s.courtId === sorted[0].courtId)
    let isConsecutive = sameCourt && sorted.length <= 24

    if (isConsecutive && sorted.length > 1) {
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentEnd = new Date(sorted[i].endTime).getTime()
        const nextStart = new Date(sorted[i + 1].startTime).getTime()
        if (currentEnd !== nextStart) {
          isConsecutive = false
          break
        }
      }
    }

    const firstId = sorted[0].id
    const allIds = sorted.map((s) => s.id)

    return {
      courtSlotId: firstId,
      numberOfSlots: isConsecutive ? sorted.length : 1,
      courtSlotIds: allIds,
      isConsecutive,
    }
  }, [selectedSlots])

  // Tổng tiền hiển thị tạm tính (server tự tính lại khi gọi Bước 3)
  const totalAmountVnd = useMemo(() => {
    return selectedSlots.reduce((sum, slot) => sum + (Number(slot.price) || 0), 0)
  }, [selectedSlots])

  // Tên các sân con được chọn
  const uniqueCourtNames = useMemo(() => {
    return Array.from(new Set(selectedSlots.map((s) => s.courtName)))
  }, [selectedSlots])

  // Ảnh đại diện cụm sân
  const heroImage =
    facility?.imageItems?.find((img) => img.isThumbnail)?.url ||
    facility?.images?.[0] ||
    'https://picsum.photos/seed/sportnexus-fac-2-1/800/600'

  // Chuyển sang Bước 3 & Bước 4 tại SplitPayment
  const handleCheckout = () => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ca sân còn trống trước khi tiếp tục!')
      return
    }

    const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validSlots = selectedSlots.filter((s) => GUID_REGEX.test(s.id))
    if (validSlots.length === 0) {
      alert('❌ Ca sân được chọn không có mã định danh (GUID) hợp lệ từ máy chủ. Vui lòng chọn ca sân trong danh sách ca trống!')
      return
    }

    const primarySport = activeCourt?.sportName?.toLowerCase().includes('pickleball')
      ? 'pickleball'
      : activeCourt?.sportName?.toLowerCase().includes('bóng đá')
      ? 'football'
      : activeCourt?.sportName?.toLowerCase().includes('tennis')
      ? 'tennis'
      : 'badminton'

    const timeSummary = selectedSlots
      .map((s) => `${s.formattedStart} - ${s.formattedEnd}`)
      .join(', ')

    const firstId = bookingPayloadConfig.courtSlotId || validSlots[0]?.id
    const allIds =
      Array.isArray(bookingPayloadConfig.courtSlotIds) && bookingPayloadConfig.courtSlotIds.length > 0
        ? bookingPayloadConfig.courtSlotIds.filter((id) => GUID_REGEX.test(id))
        : validSlots.map((s) => s.id)

    // Lưu cache để SplitPayment không bao giờ bị thiếu ID
    try {
      if (firstId) localStorage.setItem('sportnexus_selected_slot_id', firstId)
      if (allIds && allIds.length > 0) localStorage.setItem('sportnexus_selected_slot_ids', JSON.stringify(allIds))
    } catch {
      // Bỏ qua lỗi quota storage nếu có
    }

    navigate('/split-payment', {
      state: {
        facilityId: facility?.id,
        courtId: activeCourt?.id,
        court: facility?.name || 'Cụm Sân Thể Thao',
        address: facility?.address || 'Hồ Chí Minh',
        subCourt: uniqueCourtNames.join(', ') || activeCourt?.name || 'Sân 1',
        subCourts: uniqueCourtNames,
        courtCount: uniqueCourtNames.length || 1,
        subCourtDesc: `${facility?.openTime?.slice(0, 5) || '06:00'} - ${facility?.closeTime?.slice(0, 5) || '22:00'} • ${facility?.description || 'Sân đạt chuẩn thi đấu'}`,
        image: heroImage,
        sport: primarySport,
        date: selectedDateStr,
        slot: timeSummary,
        slotCount: selectedSlots.length,
        hours: selectedSlots.length * 1.0,
        total: totalAmountVnd,
        // Dữ liệu Bước 3: Đảm bảo luôn có ít nhất 1 ca sân
        courtSlotId: firstId,
        numberOfSlots: bookingPayloadConfig.numberOfSlots || allIds.length || 1,
        courtSlotIds: allIds,
        isConsecutive: bookingPayloadConfig.isConsecutive,
        selectedSlots: selectedSlots,
      },
    })
  }

  return (
    <div className="flex flex-col w-full relative">
      {/* Hero Header Cụm Sân (Bước 1) */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/10 blur-[130px] pointer-events-none rounded-full"></div>
        <div className="relative w-full rounded-2xl overflow-hidden min-h-[380px] lg:min-h-[420px] flex flex-col justify-end">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('${heroImage}')`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>

          <div className="relative z-10 p-space-lg lg:p-space-xl flex flex-col justify-between gap-space-lg mt-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                    Cụm Sân Thể Thao Đạt Chuẩn
                  </span>
                  <span className="text-on-surface-variant text-label-sm">•</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {facility?.address || 'Hồ Chí Minh'}
                  </span>
                  {facility?.openTime && (
                    <>
                      <span className="text-on-surface-variant text-label-sm">•</span>
                      <span className="font-label-sm text-label-sm text-emerald-400 font-semibold">
                        Mở cửa: {facility.openTime.slice(0, 5)} - {facility.closeTime?.slice(0, 5)}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">
                  {facility?.name || 'Cụm Sân Thể Thao SportNexus'}
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium flex items-center gap-space-xs">
                  <span className="text-primary font-bold">
                    {courtsList.length} sân con trong cụm
                  </span>
                  <span className="text-primary">•</span> {facility?.description || 'Mặt sân mới, đèn thi đấu hiện đại'}
                </p>

                {/* Badges & Amenities */}
                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">star</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">
                      {facility?.averageRating > 0 ? facility.averageRating : 4.9}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      ({facility?.reviewCount || 128} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Live API Cụm Sân
                    </span>
                  </div>

                  {facility?.phone && (
                    <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
                      <span className="material-symbols-outlined text-cyan-400 text-[18px]">call</span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                        {facility.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => navigate('/court-finder')}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2 transition-all border border-outline-variant/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Đổi cụm sân khác
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column: Calendar Date + Availability Matrix (Bước 2: GET /api/v1/courts/{courtId}/slots) */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* BƯỚC 2: CHỌN NGÀY THI ĐẤU */}
          <div className="flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-low shadow-xl border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Bước 2: Chọn Ngày Để Lấy Lưới Ca Sân Con
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Đồng bộ trực tiếp qua API: <code>GET /api/v1/courts/{'{courtId}'}/slots?date={selectedDateStr}</code>
                </p>
              </div>
              <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                {courtSlots.length > 0 ? `${courtSlots.filter(s => s.status === 'Available' && s.isBookable && !s.isPast).length} ca trống` : 'Đang tải lưới ca'}
              </span>
            </div>

            {/* Thanh chọn 7 ngày kế tiếp */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-space-xs pt-space-xs">
              {dateList.map((item) => {
                const isSelected = item.dateStr === selectedDateStr
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(item.dateStr)}
                    className={`flex flex-col items-center py-space-md px-space-xs rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-container-highest shadow-[0_0_20px_rgba(0,229,255,0.35)] ring-2 ring-primary/60 scale-[1.02]'
                        : 'bg-surface-container hover:bg-surface-container-high'
                    }`}
                  >
                    <span
                      className={`font-label-sm text-label-sm uppercase font-semibold ${
                        isSelected ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {item.dayOfWeek}
                    </span>
                    <span
                      className={`font-headline-md text-headline-md font-bold mt-1 ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {item.dayNum}
                    </span>
                    <span className="font-label-sm text-xs text-on-surface-variant mt-0.5">
                      Th{item.monthNum}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* BƯỚC 1 & 2: DANH SÁCH SÂN CON TRONG CỤM SÂN */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">stadium</span>
                  Chọn Sân Con Trong Cụm ({courtsList.length} sân)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bấm vào từng sân con để gọi API <code>/api/v1/courts/{'{courtId}'}/slots</code> lấy lưới ca tương ứng
                </p>
              </div>

              {selectedSlots.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelectedSlots}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-red-400 font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  Xóa ca đã chọn ({selectedSlots.length})
                </button>
              )}
            </div>

            {/* Tabs danh sách sân con */}
            <div className="flex items-center gap-space-sm overflow-x-auto pb-2 scrollbar-none">
              {courtsList.map((court) => {
                const isCurrentCourt = court.id === selectedCourtId
                const countSelectedInThisCourt = selectedSlots.filter((s) => s.courtId === court.id).length
                return (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => setSelectedCourtId(court.id)}
                    className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all shrink-0 cursor-pointer ${
                      isCurrentCourt
                        ? 'bg-surface-container-highest border-2 border-primary shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                        : 'bg-surface-container-low hover:bg-surface-container border border-outline-variant/15'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCurrentCourt ? 'bg-primary text-surface-container-lowest' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">sports_tennis</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-1.5">
                        {court.name}
                        {countSelectedInThisCourt > 0 && (
                          <span className="w-5 h-5 rounded-full bg-secondary-container text-surface-container-lowest text-xs flex items-center justify-center font-bold">
                            {countSelectedInThisCourt}
                          </span>
                        )}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {court.sportName} • {court.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* BƯỚC 2: BẢNG LƯỚI CA CỦA SÂN CON (GET /api/v1/courts/{courtId}/slots) */}
          <div className="flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-low shadow-xl border border-outline-variant/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  Lưới Ca Sân: {activeCourt?.name || 'Sân con'} (Ngày {selectedDateStr})
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  <span className="text-secondary-container font-semibold">Chỉ ca trạng thái Available mới đặt được</span> (Quyền truy cập công khai không cần đăng nhập)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllCourtAvailableSlots}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold flex items-center gap-1 transition-all border border-primary/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">select_all</span>
                  Chọn tất cả ca trống sân này
                </button>
              </div>
            </div>

            {/* Legend hướng dẫn trạng thái */}
            <div className="flex items-center gap-space-md flex-wrap py-2 px-space-md rounded-xl bg-surface-container text-label-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span>Available (Có thể đặt)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/60"></span>
                <span>Booked / Maintenance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-500/60"></span>
                <span>Đã qua giờ (isPast)</span>
              </div>
            </div>

            {/* State Loading */}
            {slotsLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-label-sm text-label-sm">Đang gọi API GET /api/v1/courts/{'{courtId}'}/slots...</span>
              </div>
            )}

            {/* State Error */}
            {slotsError && !slotsLoading && (
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 text-error flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span className="font-body-sm text-body-sm">{slotsError}</span>
              </div>
            )}

            {/* Slots Grid */}
            {!slotsLoading && !slotsError && courtSlots.length === 0 && (
              <div className="py-10 text-center text-on-surface-variant font-body-sm">
                Không tìm thấy ca thi đấu nào cho sân này vào ngày {selectedDateStr}. Vui lòng chọn ngày khác.
              </div>
            )}

            {!slotsLoading && !slotsError && courtSlots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-sm pt-space-xs">
                {courtSlots.map((slot) => {
                  const isAvailable = slot.status === 'Available' && slot.isBookable && !slot.isPast
                  const isSelected = selectedSlots.some((s) => s.id === slot.id)
                  const startStr = formatTimeSlot(slot.startTime)
                  const endStr = formatTimeSlot(slot.endTime)

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleToggleSlot(slot, activeCourt)}
                      className={`relative p-3.5 rounded-xl flex flex-col justify-between text-left transition-all border ${
                        isSelected
                          ? 'bg-surface-container-high border-secondary-container shadow-[0_0_20px_rgba(52,255,140,0.35)] ring-2 ring-secondary-container/60 scale-[1.02] cursor-pointer'
                          : isAvailable
                          ? 'bg-surface-container hover:bg-surface-container-high border-emerald-500/30 hover:border-emerald-400 cursor-pointer'
                          : 'bg-surface-container-lowest/40 opacity-50 border-outline-variant/10 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {startStr} - {endStr}
                        </span>
                        {isSelected ? (
                          <span className="material-symbols-outlined text-secondary-container text-[18px]">
                            check_circle
                          </span>
                        ) : isAvailable ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        ) : (
                          <span className="material-symbols-outlined text-red-400 text-[16px]">lock</span>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                        <span className="font-label-sm text-xs text-on-surface-variant">
                          {isSelected ? (
                            <strong className="text-secondary-container">Đang chọn</strong>
                          ) : isAvailable ? (
                            'Có thể đặt'
                          ) : slot.isPast ? (
                            'Đã qua'
                          ) : slot.status === 'Maintenance' ? (
                            'Bảo trì'
                          ) : (
                            'Đã đặt'
                          )}
                        </span>
                        <span className="font-label-md text-label-md font-bold text-primary">
                          {Number(slot.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col gap-space-lg border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tóm Tắt Đặt Sân</h3>
              <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {selectedSlots.length} Ca đã chọn
              </span>
            </div>

            {/* Cụm Sân & Ngày */}
            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                  {facility?.name || 'Cụm Sân SportNexus'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  {selectedDateStr}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {facility?.address || 'Hồ Chí Minh'}
              </span>
            </div>

            {/* Danh sách các ca đã chọn */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {selectedSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container/50 text-center text-on-surface-variant text-body-sm">
                  Chưa chọn ca thi đấu nào. Nhấp vào các ca màu xanh lá để chọn giờ thi đấu.
                </div>
              ) : (
                selectedSlots.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-space-sm rounded-xl bg-surface-container-high border border-primary/20 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {s.courtName} • {s.formattedStart} - {s.formattedEnd}
                      </span>
                      <span className="font-label-sm text-xs text-on-surface-variant">
                        Ca #{idx + 1} ({s.sportName})
                      </span>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-primary">
                      {Number(s.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Chế độ đặt theo Bước 3 */}
            {selectedSlots.length > 0 && (
              <div className="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant flex items-center justify-between">
                <span>Chế độ đặt (Bước 3):</span>
                <strong className="text-primary">
                  {bookingPayloadConfig.isConsecutive
                    ? `Cách 1: ${bookingPayloadConfig.numberOfSlots} ca liên tiếp`
                    : `Cách 2: ${bookingPayloadConfig.courtSlotIds.length} ca rời nhau`}
                </strong>
              </div>
            )}

            {/* Total Amount */}
            <div className="pt-space-md flex items-baseline justify-between border-t border-outline-variant/20">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                  Tổng tiền dự kiến
                </span>
                <small className="text-xs text-on-surface-variant font-medium">
                  (Server sẽ tự tính lại chính xác ở Bước 3)
                </small>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-display-lg font-extrabold text-primary leading-none tracking-tight">
                  {totalAmountVnd.toLocaleString('vi-VN')}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">đ</span>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedSlots.length === 0}
              className="w-full py-space-md rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm font-extrabold flex items-center justify-center gap-space-sm transition-all shadow-[0_0_28px_rgba(0,229,255,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleCheckout}
            >
              <span>
                {selectedSlots.length > 0
                  ? `Xác Nhận & Tiếp Tục Thanh Toán (${selectedSlots.length} Ca)`
                  : 'Vui Lòng Chọn Ít Nhất 1 Ca Sân'}
              </span>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourtDetails
