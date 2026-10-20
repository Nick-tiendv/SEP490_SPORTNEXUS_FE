// Dashboard.jsx — SportNexus Court Owner Dashboard
// Giao diện trang chủ quản trị cơ sở thể thao phức hợp SportNexus

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerBookings, getOwnerDashboard } from '../api/owner'
import { useOwnerContext } from './ownerContext.js'

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
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.90)',
        padding: '22px',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Doanh thu theo ngày</h3>
          <p style={{ margin: '2px 0 0 0', color: '#1E293B', fontSize: '13px', fontWeight: 600 }}>
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

      {!loading && total === 0 ? (
        <div style={{ height: `${CHART_HEIGHT}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#475569' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#CBD5E1' }}>bar_chart</span>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Chưa có doanh thu trong {periodDays} ngày gần nhất</div>
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
                  <div style={{ fontWeight: 800, marginBottom: '2px' }}>Ngày {active.label}</div>
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
  )
}

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const todayVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date())
const daysAgoVN = (days) => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date(Date.now() - days * 86400000))
const toClockVN = (value) =>
  value ? new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '—'
const PERIOD_OPTIONS = [7, 30, 90]
const TODAY_LIST_LIMIT = 6

export default function Dashboard() {
  const { facilityId, facility, facilities, wallet, profile } = useOwnerContext()
  const [periodDays, setPeriodDays] = useState(30)

  // Dữ liệu gắn với khóa (cơ sở + kỳ) để không hiện nhầm số liệu cũ khi đổi cơ sở / kỳ.
  const statsKey = `${facilityId}|${periodDays}`
  const [stats, setStats] = useState(null) // { key, data }
  const [statsError, setStatsError] = useState(null) // { key, message }
  const [todayBookings, setTodayBookings] = useState(null) // { facilityId, items }

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    const key = `${facilityId}|${periodDays}`
    getOwnerDashboard({ facilityId, from: daysAgoVN(periodDays - 1), to: todayVN() })
      .then((data) => !cancelled && setStats({ key, data }))
      .catch((error) => !cancelled && setStatsError({ key, message: error.message }))
    return () => { cancelled = true }
  }, [facilityId, periodDays])

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
  }, [facilityId])

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
      key: 'checkin', link: '/owner/check-qr', icon: 'qr_code_scanner', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
      title: `${upcomingToday.length} đơn chờ check-in hôm nay`, desc: 'Quét QR hoặc check-in thủ công khi khách tới',
    },
    data?.openReports > 0 && {
      // Chưa có trang khiếu nại cho chủ sân nên mục này chỉ hiển thị, không có link.
      key: 'reports', link: null, icon: 'report', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA',
      title: `${data.openReports} khiếu nại đang mở`, desc: 'Người chơi đang chờ chủ sân phản hồi',
    },
    rejectedFacilities.length > 0 && {
      key: 'rejected', link: '/owner/courts', icon: 'block', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA',
      title: `${rejectedFacilities.length} cơ sở bị từ chối duyệt`, desc: rejectedFacilities.map((item) => item.name).join(', '),
    },
    pendingFacilities.length > 0 && {
      key: 'pending', link: '/owner/courts', icon: 'hourglass_top', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A',
      title: `${pendingFacilities.length} cơ sở đang chờ admin duyệt`, desc: pendingFacilities.map((item) => item.name).join(', '),
    },
    inactiveCourts > 0 && {
      key: 'inactive', link: '/owner/courts', icon: 'build', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA',
      title: `${inactiveCourts} sân đang tạm ngưng`, desc: 'Mở lại sân khi đã bảo trì xong',
    },
  ].filter(Boolean)

  const formatVND = (num) => (num === null || num === undefined ? '—' : new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' đ')
  const formatPercent = (num) => (num === null || num === undefined ? '—' : `${Number(num).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`)
  const statValue = (value, format = (v) => v) => (data ? format(value) : statsLoadError ? '—' : '...')

  return (
    <div className="responsive-page-container" style={{ minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
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
              {profile?.fullName ? `Xin chào, ${profile.fullName}` : 'SportNexus Operating System'}
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
            {facility?.name ? `${facility.name} • ` : ''}Số liệu {periodDays} ngày gần nhất
            {data ? ` • ${formatPercent(data.cancellationRate)} đơn bị hủy • ${data.reviewCount || 0} đánh giá (${Number(data.averageRating || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}★)` : ''}
          </p>
          {statsLoadError && (
            <p style={{ margin: '6px 0 0 0', color: '#B91C1C', fontSize: '13px', fontWeight: 700 }}>
              Không tải được thống kê: {statsLoadError}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            title="Kỳ thống kê"
            style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800, color: '#0F172A', background: '#FFFFFF', cursor: 'pointer' }}
          >
            {PERIOD_OPTIONS.map((days) => (
              <option key={days} value={days}>{days} ngày gần nhất</option>
            ))}
          </select>
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
                {facility ? `${facility.activeCourtCount}/${facility.courtCount}` : '0/0'} Sân Sẵn Sàng
                {data?.openReports ? ` • ${data.openReports} khiếu nại mở` : ''}
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
              SỐ DƯ KHẢ DỤNG
            </span>
            <span className="material-symbols-outlined" style={{ color: '#34D399', fontSize: '22px' }}>
              account_balance_wallet
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#FFFFFF' }}>
            {formatVND(wallet?.availableBalance ?? wallet?.balance)}
          </div>
          <div style={{ fontSize: '12px', color: '#D1FAE5', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              lock_clock
            </span>
            Đang tạm giữ: {formatVND(wallet?.frozenBalance)}
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
              ĐƠN ĐẶT SÂN ({periodDays} NGÀY)
            </span>
            <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '22px' }}>
              receipt_long
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#B45309' }}>
            {statValue(data?.totalBookings)} <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>đơn</span>
          </div>
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
            {data ? `${data.checkedInBookings} đã check-in • ${data.cancelledBookings} đã hủy • ${data.upcomingTodayBookings} đơn sắp tới hôm nay` : 'Đang tải...'}
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
              TỶ LỆ LẤP ĐẦY ({periodDays} NGÀY)
            </span>
            <span className="material-symbols-outlined" style={{ color: '#1D4ED8', fontSize: '22px' }}>
              pie_chart
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            {statValue(data?.occupancyRate, formatPercent)}{' '}
            {data && <span style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>({data.bookedSlots}/{data.sellableSlots} ca)</span>}
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
            {(() => {
              const peak = (data?.bookingsByHour || []).reduce((best, item) => (!best || item.bookings > best.bookings ? item : best), null)
              return peak?.bookings ? `🔥 Khung giờ đông nhất: ${String(peak.hour).padStart(2, '0')}:00 (${peak.bookings} đơn)` : 'Ca đã có người đặt / ca mở bán'
            })()}
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
              DOANH THU ({periodDays} NGÀY)
            </span>
            <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '22px' }}>
              trending_up
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>
            {statValue(data?.totalRevenue, formatVND)}
          </div>
          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
            {data ? `Online ${formatVND(data.onlineRevenue)} • Tại quầy ${formatVND(data.walkInRevenue)}` : 'Đơn đã thanh toán + phí hủy'}
          </div>
        </div>
      </div>

      {/* SECTION 1: BIỂU ĐỒ DOANH THU THEO NGÀY & VIỆC CẦN XỬ LÝ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', marginBottom: '32px' }}>
        <div style={{ minWidth: 0 }}>
          <RevenueChart days={data?.revenueByDay || []} loading={!data && !statsLoadError} periodDays={periodDays} formatVND={formatVND} />
        </div>

        {/* Việc cần xử lý */}
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
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Việc Cần Xử Lý</h3>
          <p style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '13px', fontWeight: 600 }}>Những mục đang chờ bạn hành động</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todoItems.length === 0 ? (
              <div style={{ padding: '18px', borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center', color: '#15803D', fontSize: '13.5px', fontWeight: 800 }}>
                Mọi thứ đều ổn ✓
              </div>
            ) : (
              todoItems.map((item) => {
                const Row = item.link ? Link : 'div'
                return (
                <Row
                  key={item.key}
                  {...(item.link ? { to: item.link } : {})}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${item.border}`,
                    background: item.bg,
                    textDecoration: 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: item.color }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  {item.link && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>chevron_right</span>}
                </Row>
                )
              })
            )}
          </div>
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
                Khách Đặt Sân Hôm Nay
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#1E293B', fontSize: '13px', fontWeight: 600 }}>
                {todayList ? `${upcomingToday.length} đơn chờ check-in • ${todayList.length - upcomingToday.length} đã check-in` : 'Đang tải...'}
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
            {todayList && todayList.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                Hôm nay chưa có đơn đặt sân nào.
              </div>
            )}
            {(todayList || []).slice(0, TODAY_LIST_LIMIT).map((item) => {
              const checkedIn = String(item.bookingStatus).toUpperCase() === 'CHECKED_IN'
              const customer = item.customerName || 'Khách hàng'
              return (
              <div
                key={item.bookingId}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: checkedIn ? 'rgba(240, 253, 244, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: checkedIn ? '#10B981' : '#F59E0B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {customer.trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {customer}{item.isWalkIn ? ' (Vãng lai)' : ''}
                      </span>
                      {item.customerPhone && <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700 }}>({item.customerPhone})</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                      {item.courtName}{item.sportName ? ` • ${item.sportName}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600, marginTop: '2px' }}>
                      Khung giờ: <strong style={{ color: '#0F172A' }}>{toClockVN(item.startTime)} - {toClockVN(item.endTime)}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: checkedIn ? '#16A34A' : '#D97706' }}>
                    {formatVND(item.totalAmount)}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    {checkedIn ? (
                      <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ Đã Check-in
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
              )
            })}
            {todayList && todayList.length > TODAY_LIST_LIMIT && (
              <Link to="/owner/check-qr" style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#2563EB', textDecoration: 'none' }}>
                Xem tất cả {todayList.length} đơn hôm nay →
              </Link>
            )}
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
              Hiệu Quả Từng Sân ({periodDays} ngày)
            </h3>
            <Link
              to="/owner/courts"
              style={{ fontSize: '12px', color: '#047857', fontWeight: 800, textDecoration: 'none' }}
            >
              Quản Lý Sân
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data && courtStats.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                Chưa có dữ liệu đặt sân trong kỳ.
              </div>
            )}
            {!data && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                {statsLoadError ? '—' : 'Đang tải...'}
              </div>
            )}
            {courtStats.map((court) => {
              const occupancy = court.sellableSlots ? Math.round((court.bookedSlots / court.sellableSlots) * 100) : 0
              return (
                <div
                  key={court.courtId}
                  style={{
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    background: 'rgba(248, 250, 252, 0.95)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{court.courtName}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>Lấp đầy: {occupancy}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: '#E2E8F0', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(occupancy, 100)}%`, height: '100%', background: '#10B981' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: '#1E293B', fontWeight: 700 }}>
                    <span>{court.bookings} đơn • {court.bookedSlots}/{court.sellableSlots} ca</span>
                    <span style={{ fontWeight: 800, color: '#9A3412' }}>{formatVND(court.revenue)}</span>
                  </div>
                </div>
              )
            })}
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
            Xem Chi Tiết Lưới Lịch {facility?.courtCount ?? 0} Sân
          </Link>
        </div>
      </div>
    </div>
  )
}
