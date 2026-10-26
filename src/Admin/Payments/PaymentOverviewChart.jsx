import { useState } from 'react'
import { CHART_RANGES, money } from './paymentData.js'

// Gom byDay theo ngày, hoặc theo tuần khi khoảng dài hơn 30 ngày.
function bucketize(byDay, days) {
  const size = days > 30 ? 7 : 1
  const buckets = []
  byDay.forEach((day, index) => {
    const bucket = Math.floor(index / size)
    if (!buckets[bucket]) buckets[bucket] = { label: new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), deposits: 0, bookingGrossValue: 0, refunds: 0, ownerEarnings: 0 }
    for (const key of ['deposits', 'bookingGrossValue', 'refunds', 'ownerEarnings']) buckets[bucket][key] += day[key]
  })
  return buckets
}

// Dữ liệu: GET /api/v1/admin/wallets/statistics → byDay.
export default function PaymentOverviewChart({ byDay, range, onRange, loading, error }) {
  const [hovered, setHovered] = useState(null)
  const days = CHART_RANGES[range]
  const points = bucketize(byDay, days)
  const max = Math.max(1, ...points.map(point => Math.max(point.deposits, point.bookingGrossValue, point.ownerEarnings))) * 1.2
  const y = value => 210 - (value / max) * 175
  const slot = points.length ? 500 / points.length : 0
  const x = index => 60 + slot * index + slot / 2
  const bar = Math.max(2, Math.min(14, slot / 3))
  const labelEvery = Math.max(1, Math.ceil(points.length / 8))
  const trendPath = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)} ${y(point.ownerEarnings)}`).join(' ')
  const empty = !points.some(point => point.deposits || point.bookingGrossValue || point.refunds || point.ownerEarnings)
  return <section className="payments-overview"><header><div><h2>Dòng tiền nền tảng</h2><p>Nạp tiền, giá trị đặt sân và doanh thu chủ sân {days > 30 ? 'theo tuần' : 'theo ngày'} trong {range} gần nhất.</p></div><div className="payments-periods" aria-label="Khoảng biểu đồ">{Object.keys(CHART_RANGES).map(value => <button key={value} aria-pressed={range === value} onClick={() => { onRange(value); setHovered(null) }}>{value}</button>)}</div></header>
    <div className="payments-chart-legend"><span><i />Nạp tiền</span><span><i className="pending" />Giá trị đặt sân</span><span><i className="trend" />Doanh thu chủ sân</span></div>
    <div className="payments-chart">{loading ? <p className="payments-empty">Đang tải biểu đồ…</p> : error ? <p className="payments-empty">{error}</p> : empty ? <p className="payments-empty">Chưa có dòng tiền trong {range} gần nhất.</p>
      : <svg viewBox="0 0 570 255" role="img" aria-label={`Biểu đồ dòng tiền ${range} gần nhất`}>
        {[0, 0.5, 1].map(level => <g key={level}><line x1="48" y1={y(max * level)} x2="560" y2={y(max * level)} stroke="#e6eee8" strokeDasharray="3 3" /><text x="42" y={y(max * level) + 3} textAnchor="end" fill="#9baaa3" fontSize="10">{max * level >= 1e6 ? `${((max * level) / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr` : `${Math.round((max * level) / 1000).toLocaleString('vi-VN')}k`}</text></g>)}
        {points.map((point, index) => <g key={point.label} className="payments-chart-point" tabIndex={0} role="button" aria-label={`${point.label}: nạp ${money(point.deposits)}, đặt sân ${money(point.bookingGrossValue)}, chủ sân ${money(point.ownerEarnings)}, hoàn tiền ${money(point.refunds)}`} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)}>
          <rect x={x(index) - slot / 2} y="25" width={slot} height="210" fill="transparent" />
          <rect x={x(index) - bar - 1} y={y(point.deposits)} width={bar} height={210 - y(point.deposits)} fill="#58a776" rx="1" />
          <rect x={x(index) + 1} y={y(point.bookingGrossValue)} width={bar} height={210 - y(point.bookingGrossValue)} fill="#efb63e" rx="1" />
          {(index % labelEvery === 0 || index === points.length - 1) && <text x={x(index)} y="235" textAnchor="middle" fill="#7e9688" fontSize="10">{point.label}</text>}
        </g>)}
        <path d={trendPath} fill="none" stroke="#287b4c" strokeWidth="2" pointerEvents="none" />
      </svg>}
      {hovered !== null && points[hovered] && <div className="payments-chart-tooltip" role="tooltip"><strong>{points[hovered].label}</strong><span>Nạp tiền: {money(points[hovered].deposits)}</span><span>Giá trị đặt sân: {money(points[hovered].bookingGrossValue)}</span><span>Doanh thu chủ sân: {money(points[hovered].ownerEarnings)}</span><span>Hoàn tiền: {money(points[hovered].refunds)}</span></div>}
    </div></section>
}
