import { useEffect, useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { getAdminBookings } from '../../api/admin/dashboardApi.js'
import { AGGREGATE_PAGE_SIZE, TREND_RANGES, buildTrendSeries, formatNumber, lastDaysRange, toApiDate } from './dashboardData.js'

const X0 = 52, X1 = 702, Y0 = 40, Y1 = 260

function curveOf(points) {
  return points.reduce((path, [x, y], index) => {
    if (!index) return `M ${x},${y}`
    const [px, py] = points[index - 1]
    const middle = (px + x) / 2
    return `${path} C ${middle},${py} ${middle},${y} ${x},${y}`
  }, '')
}

export default function TrendsChart() {
  const [range, setRange] = useState('30 ngày')
  const [state, setState] = useState({ days: 0, error: '', bookings: [] })
  const days = TREND_RANGES[range]

  useEffect(() => {
    let cancelled = false
    const { from, to } = lastDaysRange(days)
    getAdminBookings({ DateFrom: toApiDate(from), DateTo: toApiDate(to), Page: 1, PageSize: AGGREGATE_PAGE_SIZE })
      .then(({ items }) => !cancelled && setState({ days, error: '', bookings: items }))
      .catch(error => !cancelled && setState({ days, error: error.message, bookings: [] }))
    return () => { cancelled = true }
  }, [days])

  const loading = state.days !== days
  const series = useMemo(() => buildTrendSeries(state.bookings, days), [state.bookings, days])
  const totalRevenue = series.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = series.reduce((sum, item) => sum + item.bookings, 0)
  const maxRevenue = Math.max(1, ...series.map(item => item.revenue))
  const maxBookings = Math.max(1, ...series.map(item => item.bookings))
  const step = series.length > 1 ? (X1 - X0) / (series.length - 1) : 0
  const revenuePoints = series.map((item, index) => [X0 + index * step, Y1 - (item.revenue / maxRevenue) * (Y1 - Y0)])
  const bookingPoints = series.map((item, index) => [X0 + index * step, Y1 - (item.bookings / maxBookings) * (Y1 - Y0)])
  const revenueCurve = curveOf(revenuePoints)
  const labelEvery = Math.max(1, Math.ceil(series.length / 7))

  return (
    <section className="admin-panel admin-trends">
      <div className="admin-panel-heading">
        <div><h2>Xu hướng đặt sân và doanh thu</h2><p>Biểu đồ lượt đặt sân và doanh thu giúp theo dõi tăng trưởng nền tảng.</p></div>
        <div className="admin-segmented admin-range-tabs" role="group" aria-label="Khoảng thời gian biểu đồ">{Object.keys(TREND_RANGES).map(item => <button key={item} type="button" aria-pressed={range === item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}<small>{TREND_RANGES[item] > 30 ? 'Tuần' : 'Ngày'}</small></button>)}</div>
      </div>
      <div className="admin-chart-summary">
        <div><i className="admin-legend-dot" /><span>Doanh thu nền tảng<small>(Triệu VNĐ)</small></span><strong>{(totalRevenue / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</strong></div>
        <div><i className="admin-legend-dot muted" /><span>Số lượng<small>lượt đặt sân</small></span><strong>{formatNumber(totalBookings)}</strong></div>
        <span className="admin-chart-growth"><TrendingUp size={14} /> {range} gần nhất</span>
      </div>
      <div className="admin-chart-wrap">
        {loading ? <p className="admin-empty">Đang tải dữ liệu biểu đồ…</p>
          : state.error ? <p className="admin-empty">{state.error}</p>
            : !totalBookings ? <p className="admin-empty">Chưa có lượt đặt sân trong {range} gần nhất.</p>
              : <svg viewBox="0 0 740 330" role="img" aria-label={`Xu hướng lượt đặt sân và doanh thu trong ${range}`}>
                <defs><linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#24734b" stopOpacity=".28" /><stop offset="100%" stopColor="#24734b" stopOpacity=".015" /></linearGradient></defs>
                {[0, 1, 2, 3, 4].map(index => <g key={index}><line x1={X0} y1={Y0 + index * 55} x2={X1} y2={Y0 + index * 55} stroke="#e5ece8" strokeDasharray="3 4" /><text x="12" y={Y0 + 4 + index * 55} fill="#9ca8af" fontSize="11">{((maxRevenue * (4 - index)) / 4 / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</text></g>)}
                <path d={`${revenueCurve} L ${X1},${Y1} L ${X0},${Y1} Z`} fill="url(#admin-revenue-fill)" />
                <path d={revenueCurve} fill="none" stroke="#257148" strokeWidth="3" />
                <path d={curveOf(bookingPoints)} fill="none" stroke="#9dbfa5" strokeWidth="2" strokeDasharray="4 4" />
                {series.map((item, index) => (index % labelEvery === 0 || index === series.length - 1) && <text key={item.label} x={X0 + index * step} y="309" textAnchor={index === series.length - 1 ? 'end' : index ? 'middle' : 'start'} fill="#99a3ad" fontSize="11">{index === series.length - 1 && TREND_RANGES[range] <= 30 ? 'Hôm nay' : item.label}</text>)}
              </svg>}
      </div>
      <div className="admin-chart-footer"><span><i className="admin-legend-dot" /> Doanh thu (triệu ₫)</span><span><i className="admin-legend-dot muted" /> Lượt đặt sân</span><span className="admin-muted">Nguồn: /api/v1/bookings/admin</span></div>
    </section>
  )
}
