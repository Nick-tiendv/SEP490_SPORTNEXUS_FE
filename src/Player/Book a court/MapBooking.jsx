// MapBooking.jsx — Đặt Sân Trực Tuyến & Giữ Chỗ Thời Gian Thực
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'
import './MapBooking.css'

const PRICE_MIN = 50000
const PRICE_MAX = 500000
const HOLD_SECONDS = 15 * 60

const DISTRICTS = [
  { key: 'all', label: 'Tất cả khu vực' },
  { key: 'q7', label: 'Quận 7 (Gần bạn: 0.8 km)' },
  { key: 'binhthanh', label: 'Bình Thạnh (5.2 km)' },
  { key: 'thuduc', label: 'TP. Thủ Đức (6.4 km)' },
]

const COURTS = [
  {
    id: 'snx-q7',
    sport: 'badminton',
    name: 'SportNexus Arena Q.7',
    address: '35 Huỳnh Tấn Phát, P. Tân Thuận Đông',
    mapQuery: '35 Huỳnh Tấn Phát, Tân Thuận Đông, Quận 7, Hồ Chí Minh',
    district: 'q7',
    distance: 0.8,
    rating: 4.9,
    price: 220000,
    courtCount: 5,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&h=200&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX BWF 01',
    subCourtDesc: 'Thảm Yonex Tiêu Chuẩn Quốc Tế',
    route: { eta: '3 phút di chuyển qua Huỳnh Tấn Phát', note: 'Tuyến đường thông thoáng • Đỗ xe máy & ô tô miễn phí' },
    overrides: {},
  },
  {
    id: 'yonex-bt',
    sport: 'badminton',
    name: 'CLB Cầu Lông YONEX',
    address: '128 Điện Biên Phủ, Bình Thạnh',
    mapQuery: '128 Điện Biên Phủ, Bình Thạnh, Hồ Chí Minh',
    district: 'binhthanh',
    distance: 5.2,
    rating: 4.8,
    price: 160000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=200&h=200&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX 03',
    subCourtDesc: 'Sàn gỗ phủ thảm PU chống trơn',
    route: { eta: '14 phút di chuyển qua Nguyễn Hữu Cảnh', note: 'Giờ cao điểm hơi đông • Có bãi giữ xe máy' },
    overrides: { s3: 'available', s6: 'booked' },
  },
  {
    id: 'ddink-td',
    sport: 'pickleball',
    name: 'D-Dink Pickleball Hub',
    address: '28 Thảo Điền, TP. Thủ Đức',
    mapQuery: '28 Thảo Điền, Thủ Đức, Hồ Chí Minh',
    district: 'thuduc',
    distance: 6.4,
    rating: 4.9,
    price: 250000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=200&h=200&fit=crop',
    subCourt: 'Sân Pickleball Pro USAPA 02',
    subCourtDesc: 'Mặt sân acrylic chuẩn USAPA',
    route: { eta: '18 phút di chuyển qua Cầu Thủ Thiêm 2', note: 'Tuyến đường thông thoáng • Bãi đỗ ô tô rộng' },
    overrides: { s1: 'available', s4: 'held' },
  },
  {
    id: 'pmh-pb',
    sport: 'pickleball',
    name: 'Phú Mỹ Hưng Pickleball Club',
    address: '12 Nguyễn Lương Bằng, Quận 7',
    mapQuery: '12 Nguyễn Lương Bằng, Tân Phú, Quận 7, Hồ Chí Minh',
    district: 'q7',
    distance: 1.2,
    rating: 4.7,
    price: 180000,
    courtCount: 4,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=200&h=200&fit=crop',
    subCourt: 'Sân Pickleball PMH 01',
    subCourtDesc: 'Sân ngoài trời có mái che',
    route: { eta: '5 phút di chuyển qua Nguyễn Văn Linh', note: 'Tuyến đường thông thoáng • Đỗ xe miễn phí' },
    overrides: { s2: 'available', s7: 'booked' },
  },
]

// Mẫu khung giờ — giá được tính theo giá/giờ của từng cụm sân
const SLOT_TEMPLATE = [
  { id: 's1', start: '16:00', end: '17:00', hours: 1, factor: 1, status: 'booked', note: 'Đã kín lịch' },
  { id: 's2', start: '17:00', end: '18:00', hours: 1, factor: 1, status: 'booked', note: 'FC Sài Gòn Đặt' },
  { id: 's3', start: '18:00', end: '19:00', hours: 1, factor: 1, status: 'held' },
  { id: 's4', start: '19:00', end: '19:30', hours: 0.5, factor: 1, status: 'available' },
  { id: 's5', start: '19:30', end: '21:00', hours: 1.5, factor: 1, status: 'available' },
  { id: 's6', start: '21:00', end: '22:00', hours: 1, factor: 0.91, status: 'available' },
  { id: 's7', start: '22:00', end: '23:00', hours: 1, factor: 0.82, status: 'available' },
]

const formatVnd = (n) => `${n.toLocaleString('vi-VN')} đ`
const roundTo10k = (n) => Math.round(n / 10000) * 10000
const formatHours = (h) => `${String(h).replace('.', ',')} giờ`
const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function buildSlots(court) {
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : null,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}

function MapBooking() {
  const navigate = useNavigate()
  const { isSportActive, toggleSport, selectAllSports, SPORTS_LIST } = useSport()

  const [district, setDistrict] = useState('all')
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX])
  const [selectedCourtId, setSelectedCourtId] = useState('snx-q7')
  const [selectedSlotId, setSelectedSlotId] = useState('s5')
  const [holdLeft, setHoldLeft] = useState(8 * 60 + 42)
  const [mapType, setMapType] = useState('m')
  const summaryRef = useRef(null)

  // Lọc cụm sân theo môn, khu vực, khoảng giá
  const filteredCourts = useMemo(
    () =>
      COURTS.filter(
        (c) =>
          isSportActive(c.sport) &&
          (district === 'all' || c.district === district) &&
          c.price >= priceRange[0] &&
          c.price <= priceRange[1]
      ).sort((a, b) => a.distance - b.distance),
    [isSportActive, district, priceRange]
  )

  const selectedCourt =
    filteredCourts.find((c) => c.id === selectedCourtId) || filteredCourts[0] || null
  const slots = useMemo(() => (selectedCourt ? buildSlots(selectedCourt) : []), [selectedCourt])
  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status !== 'booked') || null

  // Đếm ngược thời gian khóa giữ chỗ
  useEffect(() => {
    if (!selectedSlot) return undefined
    const timer = setInterval(() => setHoldLeft((t) => Math.max(t - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [selectedSlot])

  // Hết thời gian giữ chỗ → tự động nhả khung giờ
  useEffect(() => {
    if (holdLeft === 0 && selectedSlotId) setSelectedSlotId(null)
  }, [holdLeft, selectedSlotId])

  const handleSelectCourt = (court) => {
    if (court.id === selectedCourt?.id) return
    setSelectedCourtId(court.id)
    setSelectedSlotId(null)
  }

  const handleSelectSlot = (slot) => {
    if (slot.status === 'booked') return
    setSelectedSlotId(slot.id)
    setHoldLeft(HOLD_SECONDS)
  }

  const handleClearFilters = () => {
    setDistrict('all')
    setPriceRange([PRICE_MIN, PRICE_MAX])
    selectAllSports()
  }

  const handleMinPrice = (v) => setPriceRange(([, max]) => [Math.min(Number(v), max - 10000), max])
  const handleMaxPrice = (v) => setPriceRange(([min]) => [min, Math.max(Number(v), min + 10000)])

  const handleConfirm = () => {
    if (!selectedCourt || !selectedSlot) return
    navigate('/split-payment', {
      state: {
        court: selectedCourt.name,
        subCourt: selectedCourt.subCourt,
        slot: `${selectedSlot.start} - ${selectedSlot.end}`,
        total: selectedSlot.price,
      },
    })
  }

  const scrollToSummary = () => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const sportOf = (key) => SPORTS_LIST.find((s) => s.key === key)
  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const mapSrc = selectedCourt
    ? `https://maps.google.com/maps?q=${encodeURIComponent(selectedCourt.mapQuery)}&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent('Hồ Chí Minh')}&t=${mapType}&z=12&output=embed`

  return (
    <div className="mb-page">
      {/* ===================== HEADER ===================== */}
      <header className="mb-header">
        <div>
          <h1 className="mb-title">Đặt Sân Trực Tuyến &amp; Giữ Chỗ Thời Gian Thực</h1>
          <p className="mb-subtitle">
            Tìm sân trống gần bạn qua định vị GPS, chủ động dùng lịch 100% bằng khóa bí quan dữ liệu và xác nhận
            đặt chỗ lập tức.
          </p>
        </div>
        <div className="mb-header-chips">
          <span className="mb-chip">
            <span className="mb-dot" /> GPS Độ Chính Xác: 1.5M
          </span>
          <span className={`mb-chip mb-chip--timer ${selectedSlot && holdLeft < 120 ? 'is-urgent' : ''}`}>
            <span className="material-symbols-outlined">lock</span>
            {selectedSlot ? `Khóa giữ chỗ: ${formatTimer(holdLeft)}` : 'Chưa giữ chỗ'}
          </span>
        </div>
      </header>

      <div className="mb-grid">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="mb-col">
          {/* Filter card */}
          <section className="mb-card" aria-label="Bộ lọc sân">
            <div className="mb-filter-head">
              <h2>{filteredCourts.length} Địa điểm sẵn sàng</h2>
              <button id="mb-clear-filter" type="button" className="mb-link-btn" onClick={handleClearFilters}>
                Xóa Lọc
              </button>
            </div>

            <span className="mb-label">Môn thể thao</span>
            <div className="mb-sport-toggle">
              {SPORTS_LIST.map((s) => (
                <button
                  key={s.key}
                  id={`mb-sport-${s.key}`}
                  type="button"
                  className={`mb-sport-btn ${isSportActive(s.key) ? 'is-active' : ''}`}
                  onClick={() => toggleSport(s.key)}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>

            <span className="mb-label">Khu vực TP.HCM</span>
            <div className="mb-select-wrap">
              <span className="material-symbols-outlined mb-ic-left">location_on</span>
              <select
                id="mb-district"
                className="mb-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined mb-ic-right">expand_more</span>
            </div>

            <span className="mb-label">Tầm giá / giờ</span>
            <div className="mb-range">
              <div className="mb-range-track" />
              <div
                className="mb-range-fill"
                style={{ left: `${pct(priceRange[0])}%`, right: `${100 - pct(priceRange[1])}%` }}
              />
              <input
                id="mb-price-min"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={10000}
                value={priceRange[0]}
                onChange={(e) => handleMinPrice(e.target.value)}
                aria-label="Giá tối thiểu"
              />
              <input
                id="mb-price-max"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={10000}
                value={priceRange[1]}
                onChange={(e) => handleMaxPrice(e.target.value)}
                aria-label="Giá tối đa"
              />
            </div>
            <div className="mb-range-values">
              <span>{formatVnd(priceRange[0])}</span>
              <span>{formatVnd(priceRange[1])}</span>
            </div>
          </section>

          {/* Court list */}
          <div className="mb-section-head">
            <h2>Cụm Sân Gần Bạn</h2>
            <small>{filteredCourts.length} địa điểm sẵn sàng</small>
          </div>

          {filteredCourts.length === 0 && (
            <div className="mb-card mb-empty">
              <span className="material-symbols-outlined">search_off</span>
              Không tìm thấy sân phù hợp. Hãy thử mở rộng khu vực hoặc tầm giá.
            </div>
          )}

          {filteredCourts.map((court, i) => {
            const active = court.id === selectedCourt?.id
            const sport = sportOf(court.sport)
            return (
              <article
                key={court.id}
                id={`mb-court-${court.id}`}
                className={`mb-card mb-court ${active ? 'is-active' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleSelectCourt(court)}
              >
                <div className="mb-court-top">
                  <img className="mb-court-img" src={court.image} alt={court.name} loading="lazy" />
                  <div className="mb-court-info">
                    <div className="mb-court-name-row">
                      <h3 className="mb-court-name">{court.name}</h3>
                      <span className="mb-rating">
                        <span className="material-symbols-outlined">star</span>
                        {court.rating}
                      </span>
                    </div>
                    <p className="mb-court-addr">
                      <span className="material-symbols-outlined">location_on</span>
                      {court.address}
                    </p>
                    <div className="mb-court-meta">
                      <span className="mb-tag">
                        {sport?.emoji} {sport?.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span className="material-symbols-outlined">directions_car</span>
                        {court.distance} km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-court-bottom">
                  <span className="mb-price">
                    {court.price.toLocaleString('vi-VN')} đ<small>/h</small>
                  </span>
                  {active ? (
                    <button type="button" className="mb-btn mb-btn--primary">
                      Đang Chọn <span className="material-symbols-outlined">arrow_circle_right</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mb-btn mb-btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectCourt(court)
                      }}
                    >
                      Chọn Sân Nhanh
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="mb-col">
          {/* Map */}
          <section className="mb-card mb-map" aria-label="Bản đồ sân">
            <iframe
              key={mapSrc}
              title="Bản đồ vị trí sân"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="mb-map-overlay mb-map-overlay--tl">
              <span className="mb-map-pill">
                <span className="material-symbols-outlined">near_me</span>
                Vị trí của bạn: Nguyễn Thị Thập, Q.7
              </span>
            </div>
            <div className="mb-map-overlay mb-map-overlay--tr">
              <div className="mb-map-tabs">
                <button
                  type="button"
                  className={`mb-map-tab ${mapType === 'm' ? 'is-active' : ''}`}
                  onClick={() => setMapType('m')}
                >
                  Bản Đồ
                </button>
                <button
                  type="button"
                  className={`mb-map-tab ${mapType === 'k' ? 'is-active' : ''}`}
                  onClick={() => setMapType('k')}
                >
                  Vệ Tinh
                </button>
              </div>
            </div>
            {selectedCourt && (
              <>
                <div className="mb-map-pin">
                  <span className="mb-map-pin-label">
                    <span className="material-symbols-outlined">location_on</span>
                    {selectedCourt.name.replace('SportNexus ', '')} ({selectedCourt.distance} km) •{' '}
                    {selectedCourt.courtCount} sân đề
                  </span>
                </div>
                <div className="mb-map-route">
                  <div className="mb-map-route-ic">
                    <span className="material-symbols-outlined">directions_car</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong>{selectedCourt.route.eta}</strong>
                    <span className="mb-sub">{selectedCourt.route.note}</span>
                  </div>
                  <a
                    id="mb-directions"
                    className="mb-btn mb-btn--primary"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      selectedCourt.mapQuery
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    Chỉ Đường <span className="material-symbols-outlined">north_east</span>
                  </a>
                </div>
              </>
            )}
          </section>

          {/* Slot grid */}
          <section className="mb-card" aria-label="Lịch sân">
            <div className="mb-slots-head">
              <div>
                <h2>Lưới Lịch Sân Trực Quan: {selectedCourt ? selectedCourt.subCourt : '—'}</h2>
                <p>Khóa bí quan (Pessimistic Lock) chống trùng giờ tuyệt đối.</p>
              </div>
              <div className="mb-legend">
                <span>
                  <i style={{ background: 'var(--mb-red-bg)', border: '1px solid var(--mb-red-line)' }} /> Đã Đặt
                </span>
                <span>
                  <i style={{ background: '#f5c542' }} /> Giữ Chỗ
                </span>
                <span>
                  <i style={{ background: '#86d97f' }} /> Sẵn Sàng
                </span>
              </div>
            </div>

            {!selectedCourt ? (
              <div className="mb-empty">
                <span className="material-symbols-outlined">event_busy</span>
                Chọn một cụm sân để xem lịch trống.
              </div>
            ) : (
              <div className="mb-slots">
                {slots.map((slot, i) => {
                  const delay = { animationDelay: `${i * 40}ms` }
                  if (slot.id === selectedSlot?.id) {
                    return (
                      <div key={slot.id} className="mb-slot mb-slot--selected">
                        <div className="mb-slot-time">
                          <span className="material-symbols-outlined">schedule</span>
                          {slot.start} - {slot.end} ({String(slot.hours).replace('.', ',')} giờ)
                          <span className="mb-slot-badge">Đang khóa giữ chỗ</span>
                        </div>
                        <div className="mb-slot-desc">
                          {selectedCourt.subCourt} ({selectedCourt.subCourtDesc})
                        </div>
                        <div className="mb-slot-row">
                          <span className="mb-slot-price">{formatVnd(slot.price)}</span>
                          <button type="button" className="mb-btn mb-btn--white" onClick={scrollToSummary}>
                            Chốt Sân
                          </button>
                        </div>
                      </div>
                    )
                  }
                  if (slot.status === 'booked') {
                    return (
                      <div key={slot.id} className="mb-slot mb-slot--booked" style={delay} aria-disabled="true">
                        <span className="material-symbols-outlined mb-slot-lock">lock</span>
                        <span className="mb-slot-time">
                          {slot.start} - {slot.end}
                        </span>
                        <span className="mb-slot-note">{slot.note}</span>
                      </div>
                    )
                  }
                  return (
                    <button
                      key={slot.id}
                      id={`mb-slot-${slot.id}`}
                      type="button"
                      className={`mb-slot mb-slot--${slot.status}`}
                      style={delay}
                      onClick={() => handleSelectSlot(slot)}
                    >
                      <span className="mb-slot-time">
                        {slot.start} - {slot.end}
                      </span>
                      <div className="mb-slot-row">
                        <span className="mb-slot-price">{formatVnd(slot.price)}</span>
                        {slot.status === 'held' && <span className="mb-slot-mini">Chọn</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="mb-card" ref={summaryRef} aria-label="Xác nhận chọn sân">
            <div className="mb-summary-box">
              <div className="mb-summary-ic">
                <span style={{ fontSize: 22 }}>{sportOf(selectedCourt?.sport)?.emoji || '🏸'}</span>
              </div>
              <div className="mb-summary-info">
                <h3>
                  {selectedCourt ? selectedCourt.subCourt : 'Chưa chọn sân'}
                  {selectedSlot && <span className="mb-pill-green">Đã khóa Giữ</span>}
                </h3>
                <p>
                  <span className="material-symbols-outlined">schedule</span>
                  {selectedSlot
                    ? `${selectedSlot.start} - ${selectedSlot.end} (Hôm nay, ${todayStr}) • ${formatHours(
                        selectedSlot.hours
                      )}`
                    : 'Vui lòng chọn một khung giờ còn trống trên lưới lịch'}
                </p>
              </div>
              <div className="mb-summary-total">
                <small>Tổng tiền sân:</small>
                <strong>{selectedSlot ? formatVnd(selectedSlot.price) : '0 đ'}</strong>
              </div>
            </div>

            <button
              id="mb-confirm-booking"
              type="button"
              className="mb-btn mb-btn--primary mb-confirm"
              disabled={!selectedSlot}
              onClick={handleConfirm}
            >
              <span className="material-symbols-outlined">check_circle</span>
              Xác Nhận Chọn Sân
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="mb-secure-note">
              <span className="material-symbols-outlined">verified_user</span>
              Hệ thống giữ chỗ độc quyền trong 15:00 phút để bạn tiến hành thanh toán an toàn.
            </p>
          </section>
        </div>
      </div>

      {/* ===================== FOOTER ===================== */}
      <footer className="mb-footer">
        <div className="mb-footer-top">
          <div>
            <div className="mb-footer-brand">
              <span className="mb-footer-logo">
                <span className="material-symbols-outlined">bolt</span>
              </span>
              <strong>SPORTNEXUS VIETNAM</strong>
            </div>
            <p>Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.</p>
          </div>
          <div className="mb-footer-links">
            <div>
              <span>
                <span className="material-symbols-outlined">support_agent</span> Hotline 24/7: 0968950913
              </span>
              <span>
                <span className="material-symbols-outlined">verified_user</span> Bảo vệ Ký Quỹ Escrow
              </span>
            </div>
            <div>
              <a href="#">Điều khoản dịch vụ</a>
              <a href="#">Chính sách Fairplay</a>
            </div>
          </div>
        </div>
        <div className="mb-footer-bottom">
          <span>
            © 2026 SportNexus Vietnam Joint Stock Company • Nền tảng chuyên biệt Pickleball &amp; Cầu Lông. Bảo lưu
            mọi quyền.
          </span>
          <span className="mb-live">
            <i /> Hệ thống bảo chứng Escrow thời gian thực
          </span>
        </div>
      </footer>
    </div>
  )
}

export default MapBooking
