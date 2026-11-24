// Dashboard.jsx — SportNexus Court Owner Dashboard
// Giao diện trang chủ quản trị cơ sở thể thao phức hợp SportNexus

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerBookings, getOwnerDashboard } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js'
import { BookingComparisonPanel, CourtBookingsPanel, OwnerKpiCard } from './OwnerDashboardCharts.jsx'
import './ownerDashboard.css'
import './ownerPanels.css'

// Màu cột: #059669 đạt tương phản >= 3:1 trên nền trắng (#10B981 chỉ 2.47:1).
const BAR_COLOR = '#059669'
const BAR_HOVER_COLOR = '#047857'
const CHART_HEIGHT = 200

// Rút gọn số tiền cho trục: 0 / 500k / 1,2tr / 1,5 tỷ
const compactVND = (value) => {
  const fmt = (n) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
  if (value >= 1e9) return `${fmt(value / 1e9)} tỷ`
  if (value >= 1e6) return `${fmt(value / 1e6)}tr`
  if (value >= 1e3) return `${fmt(value / 1e3)}k`
  return String(value)
}
// Mốc trục tròn: 1 / 2 / 2,5 / 5 x 10^n
const niceMax = (value) => {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= value)
  return step * power
}
const toDayLabel = (date) => {
  const [, m, d] = String(date).slice(0, 10).split('-')
  return `${d}/${m}`
}

// Biểu đồ cột doanh thu theo ngày (revenueByDay của GET /owner/dashboard).
function RevenueChart({ days, loading, periodDays, formatVND }) {
  const [hovered, setHovered] = useState(null)
  const [showTable, setShowTable] = useState(false)
  const items = days.map((day) => ({ date: day.date, label: toDayLabel(day.date), revenue: Number(day.revenue) || 0, bookings: Number(day.bookings) || 0 }))
  const max = niceMax(Math.max(0, ...items.map((item) => item.revenue)))
  const ticks = [max, max / 2, 0]
  const total = items.reduce((sum, item) => sum + item.revenue, 0)
  const best = items.reduce((top, item) => (!top || item.revenue > top.revenue ? item : top), null)
  // Chỉ ghi nhãn ngày ở vài cột để không chồng chữ.
  const labelEvery = Math.max(1, Math.ceil(items.length / 8))
  const active = hovered !== null ? items[hovered] : null

  return (
    <section className="owner-panel owner-panel--trend" style={{ padding: '0 0 20px' }}>
      <div className="owner-panel-heading">
        <div>
          <h3>Doanh thu theo ngày</h3>
          <p>
            {loading
              ? 'Đang tải...'
              : items.length
                ? `${periodDays} ngày gần nhất • Tổng ${formatVND(total)}${best?.revenue ? ` • Cao nhất ${best.label}: ${formatVND(best.revenue)}` : ''}`
                : 'Chưa có dữ liệu trong kỳ'}
          </p>
        </div>
        {total > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
          >
            {showTable ? 'Xem biểu đồ' : 'Xem dạng bảng'}
          </button>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
      {!loading && total === 0 ? (
        <div style={{ height: `${CHART_HEIGHT}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#475569' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#CBD5E1' }}>bar_chart</span>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Chưa có doanh thu trong {periodDays} ngày gần nhất</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Biểu đồ sẽ hiện khi cơ sở có đơn đặt sân đã thanh toán.</div>
        </div>
      ) : showTable ? (
        <div style={{ maxHeight: `${CHART_HEIGHT + 40}px`, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', color: '#0F172A' }}>Ngày</th>
                <th style={{ padding: '8px 10px', color: '#0F172A', textAlign: 'right' }}>Số đơn</th>
                <th style={{ padding: '8px 10px', color: '#0F172A', textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.date} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '7px 10px', color: '#1E293B', fontWeight: 600 }}>{item.label}</td>
                  <td style={{ padding: '7px 10px', color: '#1E293B', textAlign: 'right' }}>{item.bookings}</td>
                  <td style={{ padding: '7px 10px', color: '#0F172A', fontWeight: 700, textAlign: 'right' }}>{formatVND(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Trục Y */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${CHART_HEIGHT}px`, fontSize: '11px', color: '#64748B', fontWeight: 600, textAlign: 'right', minWidth: '40px' }}>
            {ticks.map((tick) => (
              <span key={tick} style={{ transform: 'translateY(-50%)', lineHeight: 1 }}>{compactVND(tick)}</span>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            {/* Lưới ngang */}
            <div style={{ position: 'absolute', inset: `0 0 auto 0`, height: `${CHART_HEIGHT}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              {ticks.map((tick) => (
                <div key={tick} style={{ borderTop: tick === 0 ? '1px solid #94A3B8' : '1px dashed #E2E8F0' }} />
              ))}
            </div>

            {/* Cột */}
            <div
              role="img"
              aria-label={`Biểu đồ doanh thu ${items.length} ngày, tổng ${formatVND(total)}`}
              style={{ position: 'relative', height: `${CHART_HEIGHT}px`, display: 'flex', alignItems: 'flex-end', gap: '2px' }}
              onMouseLeave={() => setHovered(null)}
            >
              {items.map((item, index) => (
                <div
                  key={item.date}
                  onMouseEnter={() => setHovered(index)}
                  style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'default' }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      margin: '0 auto',
                      height: `${(item.revenue / max) * 100}%`,
                      minHeight: item.revenue > 0 ? '2px' : 0,
                      background: hovered === index ? BAR_HOVER_COLOR : BAR_COLOR,
                      borderRadius: '4px 4px 0 0',
                      transition: 'background 0.12s',
                    }}
                  />
                </div>
              ))}

              {/* Tooltip */}
              {active && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: `${Math.min((active.revenue / max) * 100, 85)}%`,
                    left: `${((hovered + 0.5) / items.length) * 100}%`,
                    transform: `translate(${hovered > items.length / 2 ? '-100%' : '0'}, -8px)`,
                    background: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.25)',
                    zIndex: 5,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Ngày {active.label}</div>
                  <div>Doanh thu: {formatVND(active.revenue)}</div>
                  <div>Số đơn: {active.bookings}</div>
                </div>
              )}
            </div>

            {/* Nhãn trục X */}
            <div style={{ display: 'flex', gap: '2px', marginTop: '6px' }}>
              {items.map((item, index) => (
                <div key={item.date} style={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: '10.5px', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'visible' }}>
                  {index % labelEvery === 0 ? item.label : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  )
}

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const todayVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date())
const daysAgoVN = (days) => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date(Date.now() - days * 86400000))
const toClockVN = (value) =>
  value ? new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '—'
const PERIOD_OPTIONS = [7, 30, 90]
const TODAY_LIST_LIMIT = 6
// Màu xoay vòng cho thẻ từng sân (như danh sách "Môn thể thao phổ biến" của Admin)
const COURT_TONES = ['emerald', 'blue', 'amber', 'violet', 'rose', 'teal']

export default function Dashboard() {
  const { facilityId, facility, facilities, wallet, profile, loading: layoutLoading } = useOwnerContext()
  const [periodDays, setPeriodDays] = useState(30)

  // Dữ liệu gắn với khóa (cơ sở + kỳ) để không hiện nhầm số liệu cũ khi đổi cơ sở / kỳ.
  const statsKey = `${facilityId}|${periodDays}`
  const [stats, setStats] = useState(null) // { key, data }
  const [statsError, setStatsError] = useState(null) // { key, message }
  const [todayBookings, setTodayBookings] = useState(null) // { facilityId, items }
  // Có đơn mới / bị hủy, quay lại tab → tải lại số liệu (giữ số cũ trong lúc tải)
  const [liveKey, setLiveKey] = useState(0)
  useLiveRefresh(() => setLiveKey((value) => value + 1), { enabled: !!facilityId })

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    const key = `${facilityId}|${periodDays}`
    getOwnerDashboard({ facilityId, from: daysAgoVN(periodDays - 1), to: todayVN() })
      .then((data) => !cancelled && setStats({ key, data }))
      .catch((error) => !cancelled && setStatsError({ key, message: error.message }))
    return () => { cancelled = true }
  }, [facilityId, periodDays, liveKey])

  // Đơn hôm nay (đã thanh toán / đã check-in), sắp xếp theo giờ chơi
  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    getOwnerBookings({ facilityId, date: todayVN(), page: 1, pageSize: 100 })
      .then(({ items }) => {
        if (cancelled) return
        const list = items
          .filter((item) => ['PAID', 'CHECKED_IN'].includes(String(item.bookingStatus).toUpperCase()))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        setTodayBookings({ facilityId, items: list })
      })
      .catch(() => !cancelled && setTodayBookings({ facilityId, items: [] }))
    return () => { cancelled = true }
  }, [facilityId, liveKey])

  const data = stats?.key === statsKey ? stats.data : null
  const statsLoadError = statsError?.key === statsKey ? statsError.message : ''
  const todayList = todayBookings?.facilityId === facilityId ? todayBookings.items : null
  const upcomingToday = (todayList || []).filter((item) => String(item.bookingStatus).toUpperCase() === 'PAID')
  const courtStats = (data?.revenueByCourt || []).slice().sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))

  // Việc cần xử lý: chỉ hiện mục có số > 0
  const pendingFacilities = (facilities || []).filter((item) => item.approvalStatus === 'PENDING')
  const rejectedFacilities = (facilities || []).filter((item) => item.approvalStatus === 'REJECTED')
  const inactiveCourts = facility ? facility.courtCount - facility.activeCourtCount : 0
  const todoItems = [
    upcomingToday.length > 0 && {
      key: 'checkin', link: '/owner/check-qr', icon: 'qr_code_scanner', tone: 'blue', action: 'Quét QR',
      title: `${upcomingToday.length} đơn chờ check-in hôm nay`, desc: 'Quét QR hoặc check-in thủ công khi khách tới',
    },
    data?.openReports > 0 && {
      // Chưa có trang khiếu nại cho chủ sân nên mục này chỉ hiển thị, không có link.
      key: 'reports', link: null, icon: 'report', tone: 'rose',
      title: `${data.openReports} khiếu nại đang mở`, desc: 'Người chơi đang chờ chủ sân phản hồi',
    },
    rejectedFacilities.length > 0 && {
      key: 'rejected', link: '/owner/courts', icon: 'block', tone: 'rose', action: 'Xem lại',
      title: `${rejectedFacilities.length} cơ sở bị từ chối duyệt`, desc: rejectedFacilities.map((item) => item.name).join(', '),
    },
    pendingFacilities.length > 0 && {
      key: 'pending', link: '/owner/courts', icon: 'hourglass_top', tone: 'amber', action: 'Xem',
      title: `${pendingFacilities.length} cơ sở đang chờ admin duyệt`, desc: pendingFacilities.map((item) => item.name).join(', '),
    },
    inactiveCourts > 0 && {
      key: 'inactive', link: '/owner/courts', icon: 'build', tone: 'violet', action: 'Mở sân',
      title: `${inactiveCourts} sân đang tạm ngưng`, desc: 'Mở lại sân khi đã bảo trì xong',
    },
  ].filter(Boolean)

  const formatVND = (num) => (num === null || num === undefined ? '—' : new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' Điểm')
  const formatPercent = (num) => (num === null || num === undefined ? '—' : `${Number(num).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`)
  const statValue = (value, format = (v) => v) => (data ? format(value) : statsLoadError ? '—' : '...')

  return (
    <div className="snx-page">
      {/* Top Welcome / Overview Header Banner Hub */}
      <div className="snx-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="snx-page-eyebrow">
              Vận hành
            </span>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>
              {profile?.fullName ? `Xin chào, ${profile.fullName}` : ''}
            </span>
          </div>
          <h1 className="snx-page-title">
            Tổng quan
          </h1>
          <p className="snx-page-subtitle">
            {facility?.name ? `${facility.name} • ` : ''}Số liệu {periodDays} ngày gần nhất
            {data ? ` • ${formatPercent(data.cancellationRate)} đơn bị hủy • ${data.reviewCount || 0} đánh giá (${Number(data.averageRating || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}★)` : ''}
          </p>
          {statsLoadError && (
            <p style={{ margin: '6px 0 0 0', color: '#B91C1C', fontSize: '13px', fontWeight: 700 }}>
              Không tải được thống kê: {statsLoadError}
            </p>
          )}
        </div>

        <div className="owner-header-actions">
          <div className="owner-segmented" role="group" aria-label="Kỳ thống kê">
            {PERIOD_OPTIONS.map((days) => (
              <button key={days} type="button" aria-pressed={periodDays === days} onClick={() => setPeriodDays(days)}>{days} ngày</button>
            ))}
          </div>
          <span className="owner-status-pill" title="Trạng thái hệ thống">
            <span className="material-symbols-outlined">verified</span>
            {facility ? `${facility.activeCourtCount}/${facility.courtCount}` : '0/0'} sân sẵn sàng
            {data?.openReports ? ` • ${data.openReports} khiếu nại mở` : ''}
          </span>
        </div>
      </div>

      {!layoutLoading && !facilityId && <div style={{ marginBottom: 24 }}><NoFacilityState what="nhận khách đặt sân" /></div>}

      {/* 4 thẻ chỉ số chính (cùng phong cách thẻ Admin) */}
      <div className="owner-kpi-grid">
        <OwnerKpiCard tone="emerald" label="Số dư khả dụng" icon="account_balance_wallet" value={formatVND(wallet?.availableBalance ?? wallet?.balance)}>
          <span className="material-symbols-outlined">lock_clock</span>
          Đang tạm giữ: {formatVND(wallet?.frozenBalance)}
        </OwnerKpiCard>

        <OwnerKpiCard tone="amber" label={`Đơn đặt sân (${periodDays} ngày)`} icon="receipt_long" value={statValue(data?.totalBookings)} unit="đơn">
          {data ? `${data.checkedInBookings} đã check-in • ${data.cancelledBookings} đã hủy • ${data.upcomingTodayBookings} đơn sắp tới hôm nay` : 'Đang tải...'}
        </OwnerKpiCard>

        <OwnerKpiCard tone="blue" label={`Tỷ lệ lấp đầy (${periodDays} ngày)`} icon="pie_chart" value={statValue(data?.occupancyRate, formatPercent)} unit={data ? `(${data.bookedSlots}/${data.sellableSlots} ca)` : undefined}>
          {(() => {
            const peak = (data?.bookingsByHour || []).reduce((best, item) => (!best || item.bookings > best.bookings ? item : best), null)
            return peak?.bookings ? `🔥 Khung giờ đông nhất: ${String(peak.hour).padStart(2, '0')}:00 (${peak.bookings} đơn)` : 'Ca đã có người đặt / ca mở bán'
          })()}
        </OwnerKpiCard>

        <OwnerKpiCard tone="teal" label={`Doanh thu (${periodDays} ngày)`} icon="trending_up" value={statValue(data?.totalRevenue, formatVND)}>
          {data ? `Online ${formatVND(data.onlineRevenue)} • Tại quầy ${formatVND(data.walkInRevenue)}` : 'Đơn đã thanh toán + phí hủy'}
        </OwnerKpiCard>
      </div>

      {/* SECTION 1: BIỂU ĐỒ DOANH THU THEO NGÀY & VIỆC CẦN XỬ LÝ */}
      <div className="owner-section-grid">
        <RevenueChart days={data?.revenueByDay || []} loading={!data && !statsLoadError} periodDays={periodDays} formatVND={formatVND} />

        {/* Việc cần xử lý (như khung "Yêu cầu quản trị đang chờ xử lý" của Admin) */}
        <section className="owner-panel owner-panel--attention">
          <div className="owner-panel-heading">
            <div>
              <h3>Việc cần xử lý</h3>
              <p>Những mục đang chờ bạn hành động</p>
            </div>
          </div>
          <div className="owner-panel-body">
            {todoItems.length === 0 ? (
              <div className="owner-item owner-tone--emerald owner-all-good">
                <span className="material-symbols-outlined">task_alt</span>
                Mọi thứ đều ổn
              </div>
            ) : (
              todoItems.map((item) => {
                const Row = item.link ? Link : 'div'
                return (
                  <Row key={item.key} {...(item.link ? { to: item.link } : {})} className={`owner-item owner-todo owner-tone--${item.tone}`}>
                    <span className="owner-item__icon"><span className="material-symbols-outlined">{item.icon}</span></span>
                    <div className="owner-todo__body">
                      <div className="owner-todo__title">{item.title}</div>
                      <div className="owner-todo__desc">{item.desc}</div>
                    </div>
                    {item.link && <span className="owner-todo__go">{item.action || 'Xem'}</span>}
                  </Row>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* So sánh số đơn theo tháng / quý và giữa các sân trong cơ sở */}
      {facilityId && (
        <div className="owner-chart-grid">
          <BookingComparisonPanel facilityId={facilityId} />
          <CourtBookingsPanel courts={data?.revenueByCourt} periodDays={periodDays} loading={!data && !statsLoadError} error={statsLoadError} />
        </div>
      )}

      {/* SECTION 2: KHÁCH ĐẶT SÂN HÔM NAY & HIỆU QUẢ TỪNG SÂN */}
      <div className="owner-section-grid">
        {/* Khách đặt sân hôm nay */}
        <section className="owner-panel owner-panel--trend">
          <div className="owner-panel-heading">
            <div>
              <h3>Khách đặt sân hôm nay</h3>
              <p>{todayList ? `${upcomingToday.length} đơn chờ check-in • ${todayList.length - upcomingToday.length} đã check-in` : 'Đang tải...'}</p>
            </div>
            <Link to="/owner/check-qr" className="owner-panel-link">
              Quét QR Terminal
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="owner-panel-body">
            {todayList && todayList.length === 0 && <div className="owner-empty">Hôm nay chưa có đơn đặt sân nào.</div>}
            {(todayList || []).slice(0, TODAY_LIST_LIMIT).map((item) => {
              const checkedIn = String(item.bookingStatus).toUpperCase() === 'CHECKED_IN'
              const customer = item.customerName || 'Khách hàng'
              return (
                <div key={item.bookingId} className={`owner-item owner-guest owner-tone--${checkedIn ? 'emerald' : 'amber'}`}>
                  <div className="owner-guest__info">
                    <div className="owner-guest__avatar">{customer.trim().charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="owner-guest__name">
                        {customer}{item.isWalkIn ? ' (Vãng lai)' : ''}
                        {item.customerPhone && <small>({item.customerPhone})</small>}
                      </div>
                      <div className="owner-guest__meta">{item.courtName}{item.sportName ? ` • ${item.sportName}` : ''}</div>
                      <div className="owner-guest__time">Khung giờ: <strong>{toClockVN(item.startTime)} - {toClockVN(item.endTime)}</strong></div>
                    </div>
                  </div>
                  <div className="owner-guest__side">
                    <div className="owner-guest__amount">{formatVND(item.totalAmount)}</div>
                    {checkedIn
                      ? <span className="owner-guest__done">✓ Đã check-in</span>
                      : <Link to="/owner/check-qr" className="owner-guest__action">Quét QR Ngay</Link>}
                  </div>
                </div>
              )
            })}
            {todayList && todayList.length > TODAY_LIST_LIMIT && (
              <Link to="/owner/check-qr" className="owner-panel-link" style={{ justifyContent: 'center' }}>
                Xem tất cả {todayList.length} đơn hôm nay
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            )}
          </div>
        </section>

        {/* Hiệu quả từng sân (như khung "Môn thể thao phổ biến" của Admin) */}
        <section className="owner-panel owner-panel--rank">
          <div className="owner-panel-heading">
            <div>
              <h3>Hiệu quả từng sân</h3>
              <p>Tỷ lệ lấp đầy và doanh thu {periodDays} ngày gần nhất</p>
            </div>
            <Link to="/owner/courts" className="owner-panel-link">Quản lý sân</Link>
          </div>

          <div className="owner-panel-body">
            {!data && <div className="owner-empty">{statsLoadError ? '—' : 'Đang tải...'}</div>}
            {data && courtStats.length === 0 && <div className="owner-empty">Chưa có dữ liệu đặt sân trong kỳ.</div>}
            {courtStats.map((court, index) => {
              const occupancy = court.sellableSlots ? Math.round((court.bookedSlots / court.sellableSlots) * 100) : 0
              return (
                <div key={court.courtId} className={`owner-item owner-tone--${COURT_TONES[index % COURT_TONES.length]}`}>
                  <div className="owner-court__head">
                    <span className="owner-court__name"><i className="owner-item__badge">{index + 1}</i>{court.courtName}</span>
                    <span className="owner-item__pill">Lấp đầy {occupancy}%</span>
                  </div>
                  <div className="owner-item__track"><span style={{ width: `${Math.min(occupancy, 100)}%` }} /></div>
                  <div className="owner-court__meta">
                    <span>{court.bookings} đơn • {court.bookedSlots}/{court.sellableSlots} ca</span>
                    <strong>{formatVND(court.revenue)}</strong>
                  </div>
                </div>
              )
            })}
          </div>

          <Link to="/owner/schedule" className="owner-panel-footer">
            <span className="material-symbols-outlined">calendar_month</span>
            Xem chi tiết lưới lịch {facility?.courtCount ?? 0} Sân
          </Link>
        </section>
      </div>

      {/* SECTION 3: BẢNG THỐNG KÊ DOANH THU TỪNG SÂN CON (?from&to) */}
      {facilityId && (
        <CourtRevenueTablePanel
          facilityId={facilityId}
          periodDays={periodDays}
          dashboardCourts={data?.revenueByCourt}
          dashboardLoading={!data && !statsLoadError}
          dashboardError={statsLoadError}
          formatVND={formatVND}
        />
      )}
    </div>
  )
}

function CourtRevenueTablePanel({ facilityId, periodDays, dashboardCourts, dashboardLoading, dashboardError, formatVND }) {
  const defaultFrom = daysAgoVN(periodDays - 1)
  const defaultTo = todayVN()
  const [rangeState, setRangeState] = useState({ periodDays, from: defaultFrom, to: defaultTo })
  const activeFrom = rangeState.periodDays === periodDays ? rangeState.from : defaultFrom
  const activeTo = rangeState.periodDays === periodDays ? rangeState.to : defaultTo
  const isCustomRange = activeFrom !== defaultFrom || activeTo !== defaultTo
  const invalidRange = Boolean(activeFrom && activeTo && activeFrom > activeTo)

  const customKey = isCustomRange && !invalidRange ? `${facilityId}|${activeFrom}|${activeTo}` : ''
  const [customResult, setCustomResult] = useState({ key: '', courts: [], error: '' })

  useEffect(() => {
    if (!customKey) return undefined
    let cancelled = false
    getOwnerDashboard({ facilityId, from: activeFrom || undefined, to: activeTo || undefined })
      .then((res) => !cancelled && setCustomResult({ key: customKey, courts: res?.revenueByCourt || [], error: '' }))
      .catch((error) => !cancelled && setCustomResult({ key: customKey, courts: [], error: error.message }))
    return () => {
      cancelled = true
    }
  }, [customKey, facilityId, activeFrom, activeTo])

  const loading = isCustomRange ? Boolean(customKey) && customResult.key !== customKey : dashboardLoading
  const error = invalidRange
    ? 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.'
    : isCustomRange
    ? customResult.key === customKey
      ? customResult.error
      : ''
    : dashboardError
  const rawCourts = isCustomRange ? (customResult.key === customKey ? customResult.courts : []) : dashboardCourts || []
  const rows = rawCourts.slice().sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))
  const totalBookings = rows.reduce((sum, item) => sum + (Number(item.bookings) || 0), 0)
  const totalBookedSlots = rows.reduce((sum, item) => sum + (Number(item.bookedSlots) || 0), 0)
  const totalSellableSlots = rows.reduce((sum, item) => sum + (Number(item.sellableSlots) || 0), 0)
  const totalRevenue = rows.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0)
  const totalOccupancy = totalSellableSlots ? Math.round((totalBookedSlots / totalSellableSlots) * 100) : 0

  return (
    <section className="owner-panel owner-panel--trend" aria-label="Bảng thống kê doanh thu từng sân con">
      <div className="owner-panel-heading">
        <div>
          <h3>Thống kê doanh thu từng sân con</h3>
          <p>
            Chi tiết số đơn, tỷ lệ lấp đầy và doanh thu từng sân từ {activeFrom || '—'} đến {activeTo || '—'}
          </p>
        </div>
        <div className="owner-court-table-filters">
          <label>
            Từ ngày
            <input
              type="date"
              value={activeFrom}
              onChange={(e) => setRangeState({ periodDays, from: e.target.value, to: activeTo })}
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              value={activeTo}
              onChange={(e) => setRangeState({ periodDays, from: activeFrom, to: e.target.value })}
            />
          </label>
          {isCustomRange && (
            <button
              type="button"
              className="owner-court-table-reset"
              onClick={() => setRangeState({ periodDays, from: defaultFrom, to: defaultTo })}
            >
              Theo kỳ ({periodDays} ngày)
            </button>
          )}
        </div>
      </div>

      <div className="owner-panel-body">
        {error ? (
          <div className="owner-empty" style={{ color: '#B91C1C' }} role="alert">
            {error}
          </div>
        ) : loading && !rows.length ? (
          <div className="owner-empty">Đang tải thống kê doanh thu từng sân con...</div>
        ) : rows.length === 0 ? (
          <div className="owner-empty">Chưa có dữ liệu doanh thu từng sân trong khoảng thời gian này.</div>
        ) : (
          <div className="owner-court-table-wrap">
            <table className="owner-court-table">
              <thead>
                <tr>
                  <th>Sân con</th>
                  <th>Số đơn</th>
                  <th>Ca đã đặt / Mở bán</th>
                  <th>Tỷ lệ lấp đầy</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody style={loading ? { opacity: 0.55 } : undefined}>
                {rows.map((court, idx) => {
                  const occ = court.sellableSlots ? Math.round((Number(court.bookedSlots || 0) / court.sellableSlots) * 100) : 0
                  return (
                    <tr key={court.courtId || `${court.courtName}-${idx}`}>
                      <td><strong>{court.courtName || '—'}</strong></td>
                      <td>{Number(court.bookings || 0).toLocaleString('vi-VN')}</td>
                      <td>{Number(court.bookedSlots || 0).toLocaleString('vi-VN')} / {Number(court.sellableSlots || 0).toLocaleString('vi-VN')}</td>
                      <td>{occ}%</td>
                      <td><strong>{formatVND(court.revenue)}</strong></td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th>Tổng cộng ({rows.length} sân)</th>
                  <th>{totalBookings.toLocaleString('vi-VN')}</th>
                  <th>{totalBookedSlots.toLocaleString('vi-VN')} / {totalSellableSlots.toLocaleString('vi-VN')}</th>
                  <th>{totalOccupancy}%</th>
                  <th>{formatVND(totalRevenue)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
