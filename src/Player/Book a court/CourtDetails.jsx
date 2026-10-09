import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const TIME_SLOTS = [
  { id: 't1', start: '17:00', end: '18:00', hours: 1, price: 15.0, label: 'Early Evening', isPeak: false },
  { id: 't2', start: '18:00', end: '19:00', hours: 1, price: 18.0, label: 'Selected Slot (1.0 hr)', isPeak: false },
  { id: 't3', start: '19:00', end: '20:00', hours: 1, price: 21.6, label: 'Peak (+20%)', isPeak: true },
  { id: 't4', start: '20:00', end: '21:00', hours: 1, price: 18.0, label: 'Prime Night', isPeak: false },
]

const COURTS_LIST = [
  { id: 'c1', name: 'Court 01', type: 'BWF Certified Pro-Mat Synthetic Floor', badge: 'Synthetic Pro' },
  { id: 'c2', name: 'Court 02', type: 'BWF Certified Pro-Mat Synthetic Floor', badge: 'Synthetic Pro' },
  { id: 'c3', name: 'Court 03', type: 'Olympic Grade Maple Hardwood', badge: 'Olympic Wood' },
  { id: 'c4', name: 'Court 04', type: 'BWF Certified Pro-Mat Synthetic Floor', badge: 'Synthetic Pro' },
  { id: 'c5', name: 'Court 05', type: 'Olympic Grade Maple Hardwood', badge: 'Olympic Wood' },
  { id: 'c6', name: 'Court 06', type: 'VIP Center Championship Arena 1400 Lux', badge: 'Center Court VIP' },
]

// Mock booked courts per slot to make experience realistic
const BOOKED_BY_SLOT = {
  t1: ['c2'],
  t2: ['c3'],
  t3: ['c2', 'c5'],
  t4: ['c6'],
}

function CourtDetails() {
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(22)
  const [selectedSlotId, setSelectedSlotId] = useState('t2')
  const [selectedCourtIds, setSelectedCourtIds] = useState(['c4'])

  const selectedSlot = useMemo(
    () => TIME_SLOTS.find((s) => s.id === selectedSlotId) || TIME_SLOTS[1],
    [selectedSlotId]
  )

  const bookedCourts = useMemo(
    () => BOOKED_BY_SLOT[selectedSlotId] || [],
    [selectedSlotId]
  )

  // Toggle court selection (allows multiple courts in the same time slot)
  const handleToggleCourt = (courtId) => {
    if (bookedCourts.includes(courtId)) return
    setSelectedCourtIds((prev) => {
      if (prev.includes(courtId)) {
        if (prev.length <= 1) return prev // Keep at least one court selected
        return prev.filter((id) => id !== courtId)
      } else {
        return [...prev, courtId]
      }
    })
  }

  const handleSelectAllAvailableCourts = () => {
    const available = COURTS_LIST.filter((c) => !bookedCourts.includes(c.id)).map((c) => c.id)
    setSelectedCourtIds(available)
  }

  const handleSelectSingleCourt = (courtId) => {
    if (bookedCourts.includes(courtId)) return
    setSelectedCourtIds([courtId])
  }

  const selectedCourts = useMemo(
    () => COURTS_LIST.filter((c) => selectedCourtIds.includes(c.id)),
    [selectedCourtIds]
  )

  const courtCount = selectedCourts.length
  const totalAmountUsd = (selectedSlot.price * courtCount).toFixed(2)

  const handleCheckout = () => {
    const courtNames = selectedCourts.map((c) => c.name)
    navigate('/split-payment', {
      state: {
        court: 'Kinetic Arena',
        address: 'Metropolitan Sports Hub, TP.HCM',
        subCourt: courtNames.join(', '),
        subCourts: courtNames,
        courtCount: courtNames.length,
        subCourtDesc: 'BWF Certified Pro-Mat Synthetic Floor',
        image: 'https://lh3.googleusercontent.com/aida/AEtjO1WdQ1-KKfnvwaSO4limEZmMa4EYvWiwHJh-ee9W3R9MusGMY2e0qlgwXbsjqxoztcUlkiHxzOLU8Rj7fuDxe23FEJagcAhTZzSXyAJNqkf5YUHNbGPgjZPKwuCCO3EoHymYunbwsdWb_O_Z2P3Oj4yT_rItFinuMCXFEQB0i1oR2ufaSKbZ8FxN1mCuYZFgWIDhw1Yxoh1z054PmkESyxdccl2X-cYwTGBP4Oxk-GIVOkLs9bC3tbWYLg',
        sport: 'badminton',
        slot: `${selectedSlot.start} - ${selectedSlot.end}`,
        hours: selectedSlot.hours,
        total: Math.round(Number(totalAmountUsd) * 25000), // Quy đổi sang VNĐ cho trang thanh toán
        hourlyRate: Math.round(selectedSlot.price * 25000),
      },
    })
  }

  return (
    <div className="flex flex-col w-full relative">
      {/* Hero Header */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/10 blur-[130px] pointer-events-none rounded-full"></div>
        <div className="relative w-full rounded-2xl overflow-hidden min-h-[380px] lg:min-h-[440px] flex flex-col justify-end">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida/AEtjO1WdQ1-KKfnvwaSO4limEZmMa4EYvWiwHJh-ee9W3R9MusGMY2e0qlgwXbsjqxoztcUlkiHxzOLU8Rj7fuDxe23FEJagcAhTZzSXyAJNqkf5YUHNbGPgjZPKwuCCO3EoHymYunbwsdWb_O_Z2P3Oj4yT_rItFinuMCXFEQB0i1oR2ufaSKbZ8FxN1mCuYZFgWIDhw1Yxoh1z054PmkESyxdccl2X-cYwTGBP4Oxk-GIVOkLs9bC3tbWYLg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>

          <div className="relative z-10 p-space-lg lg:p-space-xl flex flex-col justify-between gap-space-lg mt-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                    Premier Pro Facility
                  </span>
                  <span className="text-on-surface-variant text-label-sm">•</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Metropolitan Sports Hub
                  </span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">
                  Kinetic Arena
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium flex items-center gap-space-xs">
                  <span className="text-primary font-bold">
                    {courtCount > 1
                      ? `Đang chọn ${courtCount} sân (${selectedCourts.map((c) => c.name).join(', ')})`
                      : selectedCourts[0]?.name || 'Court 04'}
                  </span>
                  <span className="text-primary">•</span> BWF Certified Pro-Mat Synthetic Floor
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/95 backdrop-blur-md shadow-md">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">star</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">4.8</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      (342 verified reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">wb_twilight</span>
                    <span className="font-label-md text-label-md">Olympic Grade 1200 Lux</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-surface-container-high/70 backdrop-blur-md text-on-surface">
                    <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">ac_unit</span>
                    <span className="font-label-md text-label-md">Climate Controlled 21°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    <span className="font-label-md text-label-md font-semibold">Hỗ trợ đặt nhiều sân cùng giờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="w-full px-margin-lg py-space-xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start relative z-10 -mt-16">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* Calendar Select */}
          <div className="flex flex-col gap-space-sm p-space-md rounded-2xl bg-surface-container-low shadow-lg">
            <div className="flex items-center justify-between px-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  October 2025
                </span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-space-xs pt-space-xs">
              {[20, 21, 22, 23, 24, 25].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`flex flex-col items-center py-space-md px-space-xs rounded-xl transition-all ${
                    day === selectedDay
                      ? 'bg-surface-container-highest shadow-[0_0_20px_rgba(0,229,255,0.35)] ring-2 ring-primary/40'
                      : 'bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`font-label-sm text-label-sm uppercase ${
                      day === selectedDay ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    Wed
                  </span>
                  <span
                    className={`font-headline-md text-headline-md font-bold mt-1 ${
                      day === selectedDay ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    {day}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex flex-col gap-space-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Khung Giờ Thi Đấu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot.id === selectedSlotId
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setSelectedSlotId(slot.id)
                      // Khi đổi khung giờ, nếu sân đang chọn bị trùng lịch booked thì đổi sang sân trống
                      const newBooked = BOOKED_BY_SLOT[slot.id] || []
                      setSelectedCourtIds((prev) => {
                        const valid = prev.filter((id) => !newBooked.includes(id))
                        if (valid.length > 0) return valid
                        const firstAvail = COURTS_LIST.find((c) => !newBooked.includes(c.id))
                        return firstAvail ? [firstAvail.id] : []
                      })
                    }}
                    className={`relative p-space-md rounded-2xl flex flex-col justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-surface-container-high shadow-[0_0_28px_rgba(52,255,140,0.3)] scale-[1.02] border border-secondary-fixed/50 ring-2 ring-primary-container'
                        : 'bg-surface-container-low shadow-md hover:bg-surface-container'
                    }`}
                  >
                    {slot.isPeak && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-error-container text-on-error font-label-sm text-label-sm font-bold flex items-center gap-1 uppercase">
                        <span className="material-symbols-outlined text-[12px]">local_fire_department</span> Peak
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-headline-md text-headline-md font-bold text-on-surface">
                        {slot.start} - {slot.end}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm font-semibold flex items-center gap-1 mt-1 ${
                          isSelected ? 'text-secondary-container' : 'text-on-surface-variant'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Khung giờ đang chọn
                          </>
                        ) : (
                          slot.label
                        )}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 flex items-center justify-between bg-surface-container-lowest/80 px-space-sm py-1.5 rounded-xl">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Đơn giá/sân</span>
                      <span className="font-headline-sm text-headline-sm font-extrabold text-secondary-container">
                        ${slot.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CHỌN SÂN THI ĐẤU — CHO PHÉP CHỌN VÀ ĐẶT NHIỀU SÂN CÙNG MỘT KHUNG GIỜ */}
          <div className="flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-low shadow-xl border border-outline-variant/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">stadium</span>
                  Chọn Sân Trong Cụm Kinetic Arena (Khung giờ {selectedSlot.start} - {selectedSlot.end})
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Bạn có thể chọn <strong>1 hoặc nhiều sân cùng lúc</strong> cho nhóm đông người hoặc tổ chức thi đấu
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllAvailableCourts}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold flex items-center gap-1 transition-all border border-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">select_all</span>
                  Chọn tất cả sân trống
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSingleCourt('c4')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium transition-all"
                >
                  Chỉ chọn 1 sân
                </button>
              </div>
            </div>

            {/* Banner trạng thái số sân đã chọn */}
            <div className="flex items-center justify-between px-space-md py-2.5 rounded-xl bg-primary/10 border border-primary/25">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">sports_tennis</span>
                <span className="font-label-md text-label-md text-on-surface">
                  Đang chọn: <strong className="text-primary font-bold">{courtCount} sân</strong> (
                  {selectedCourts.map((c) => c.name).join(', ')})
                </span>
              </div>
              <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-bold">
                {selectedSlot.start} - {selectedSlot.end}
              </span>
            </div>

            {/* Court Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md pt-space-xs">
              {COURTS_LIST.map((court) => {
                const isBooked = bookedCourts.includes(court.id)
                const isSelected = selectedCourtIds.includes(court.id)

                return (
                  <div
                    key={court.id}
                    onClick={() => handleToggleCourt(court.id)}
                    className={`relative p-space-md rounded-2xl flex flex-col justify-between transition-all cursor-pointer border ${
                      isBooked
                        ? 'bg-surface-container-lowest/50 opacity-60 border-red-900/30 cursor-not-allowed'
                        : isSelected
                        ? 'bg-surface-container-high border-secondary-container shadow-[0_0_20px_rgba(52,255,140,0.25)] ring-2 ring-secondary-container/50'
                        : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/15 hover:border-primary/40'
                    }`}
                  >
                    {/* Top status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-secondary-container text-surface-container-lowest'
                              : isBooked
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {isSelected ? (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          ) : isBooked ? (
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          )}
                        </div>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {court.name}
                        </span>
                      </div>
                      <span
                        className={`font-label-sm text-label-sm px-2 py-0.5 rounded-md font-semibold ${
                          isSelected
                            ? 'bg-secondary-container/20 text-secondary-container'
                            : isBooked
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {isSelected ? 'Đang chọn' : isBooked ? 'Đã kín lịch' : 'Còn trống'}
                      </span>
                    </div>

                    {/* Middle details */}
                    <div className="mt-3 flex flex-col gap-1">
                      <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                        {court.type}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                          {court.badge}
                        </span>
                        <span className="font-label-sm text-label-sm text-primary">
                          ${selectedSlot.price.toFixed(2)}/h
                        </span>
                      </div>
                    </div>

                    {/* Bottom action indicator */}
                    <div className="mt-4 pt-2.5 border-t border-outline-variant/10 flex items-center justify-between font-label-sm text-label-sm">
                      <span className="text-on-surface-variant">
                        {isBooked ? 'Được đặt bởi nhóm khác' : isSelected ? 'Nhấn để bỏ chọn' : 'Nhấn để chọn sân này'}
                      </span>
                      {isSelected && (
                        <span className="text-secondary-container font-bold flex items-center gap-0.5">
                          Đã chọn <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column Checkout Panel */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
          <div className="p-space-lg rounded-2xl bg-surface-container-low backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col gap-space-lg border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Booking Summary</h3>
              <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {courtCount} Sân
              </span>
            </div>

            {/* Venue & Courts List */}
            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                  Kinetic Arena Metro
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Wednesday, Oct {selectedDay}, 2025
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedCourts.map((c) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-primary/30 text-primary font-headline-sm text-headline-sm font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">sports_tennis</span>
                    {c.name}
                  </span>
                ))}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                BWF Certified Pro-Mat Synthetic Floor
              </span>
            </div>

            {/* Time Slot */}
            <div className="p-space-md rounded-xl bg-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">timer</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Reserved Slot (Cùng khung giờ)
                  </span>
                  <span className="font-label-lg text-label-lg font-bold text-on-surface">
                    {selectedSlot.start} - {selectedSlot.end} ({selectedSlot.hours * 60} Mins)
                  </span>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                <span>Đơn giá mỗi sân</span>
                <span>${selectedSlot.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                <span>Số lượng sân đặt</span>
                <span className="text-primary font-bold">{courtCount} sân</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                <span>Thời lượng thi đấu</span>
                <span>{selectedSlot.hours} giờ</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="pt-space-md flex items-baseline justify-between border-t border-outline-variant/20">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                  Total Amount
                </span>
                <small className="text-xs text-on-surface-variant font-medium">
                  ({courtCount} sân × ${selectedSlot.price.toFixed(2)})
                </small>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">USD</span>
                <span className="font-display-lg text-display-lg font-extrabold text-on-surface leading-none tracking-tight">
                  ${totalAmountUsd}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={courtCount === 0}
              className="w-full py-space-md rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary font-headline-sm text-headline-sm font-extrabold flex items-center justify-center gap-space-sm transition-all shadow-[0_0_28px_rgba(0,229,255,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
            >
              <span>Xác Nhận &amp; Tiếp Tục Thanh Toán ({courtCount} Sân)</span>
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourtDetails
