import { useEffect, useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { getAdminDashboard } from '../../api/admin/dashboardApi.js'
import { TREND_RANGES, buildTrendSeries, formatCurrency, formatNumber, lastDaysRange, moneyUnit, niceMax, toApiDate } from './dashboardData.js'
import { BookingsBarView, CourtCompareView, FacilityCompareView, PeriodCompareView } from './ChartViews.jsx'

// Kiểu xem của khung biểu đồ: người dùng chọn, mỗi kiểu một dạng biểu đồ phù hợp.
const VIEWS = {
  trend: { label: 'Xu hướng', desc: 'Giá trị đặt sân, lượt đặt sân và người dùng mới theo thời gian.' },
  bookings: { label: 'Lượt đặt', desc: 'Số lượt đặt sân theo từng ngày (theo tuần khi xem 90 ngày).' },
  compare: { label: 'So sánh kỳ', desc: 'Lượt đặt sân tháng này so với tháng trước, quý này so với quý trước.' },
  facilities: { label: 'Theo cơ sở', desc: 'So sánh số đơn đặt sân giữa các cơ sở (cụm sân).' },
  courts: { label: 'Theo sân con', desc: 'So sánh số đơn giữa các sân con trong một cơ sở.' },
}

const X0 = 52, X1 = 702, Y0 = 40, Y1 = 260
const SERIES = {
  revenue: { color: '#15803d', integer: false },
  bookings: { color: '#0284c7', integer: true },
  newUsers: { color: '#ea580c', integer: true },
}

function curveOf(points) {
  return points.reduce((path, [x, y], index) => {
    if (!index) return `M ${x},${y}`
    const [px, py] = points[index - 1]
    const middle = (px + x) / 2
    return `${path} C ${middle},${py} ${middle},${y} ${x},${y}`
  }, '')
}

export default function TrendsChart({ reloadKey = 0 }) {
  const [view, setView] = useState('trend')
  const [range, setRange] = useState('30 ngày')
  const [state, setState] = useState({ key: '', error: '', byDay: [] })
  const days = TREND_RANGES[range]
  const apiRange = useMemo(() => { const { from, to } = lastDaysRange(days); return { fromDate: toApiDate(from), toDate: toApiDate(to) } }, [days])
  const requestKey = `${days}|${reloadKey}`

  useEffect(() => {
    let cancelled = false
    const { from, to } = lastDaysRange(days)
    getAdminDashboard({ fromDate: toApiDate(from), toDate: toApiDate(to) }, { fresh: reloadKey > 0 })
      .then(({ byDay }) => !cancelled && setState({ key: requestKey, error: '', byDay }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message, byDay: [] }))
    return () => { cancelled = true }
  }, [days, reloadKey, requestKey])

  const loading = state.key !== requestKey
  const series = useMemo(() => buildTrendSeries(state.byDay, days), [state.byDay, days])
  const total = key => series.reduce((sum, item) => sum + item[key], 0)
  const totalRevenue = total('revenue'), totalBookings = total('bookings'), totalUsers = total('newUsers')
  const step = series.length > 1 ? (X1 - X0) / (series.length - 1) : 0
  const xOf = index => X0 + index * step
  // Mỗi đường dùng thang riêng, làm tròn lên giá trị "đẹp" để nhãn trục khớp với đường vẽ.
  const topOf = key => niceMax(Math.max(0, ...series.map(item => item[key])), SERIES[key].integer)
  const pointsOf = key => { const top = topOf(key); return series.map((item, index) => [xOf(index), Y1 - (item[key] / top) * (Y1 - Y0)]) }
  const points = { revenue: pointsOf('revenue'), bookings: pointsOf('bookings'), newUsers: pointsOf('newUsers') }
  const revenueCurve = curveOf(points.revenue)
  // Trục trái hiển thị thang của chỉ số đầu tiên có dữ liệu.
  const axisKey = totalRevenue ? 'revenue' : totalBookings ? 'bookings' : 'newUsers'
  const axisTop = topOf(axisKey)
  const money = moneyUnit(axisTop)
  const axis = axisKey === 'revenue'
    ? { unit: money.unit, format: value => (value / money.divisor).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) }
    : { unit: axisKey === 'bookings' ? 'Lượt đặt' : 'Người dùng', format: value => value.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) }
  const labelEvery = Math.max(1, Math.ceil(series.length / 7))
  const empty = !totalRevenue && !totalBookings && !totalUsers

  return (
    <section className="admin-panel admin-trends">
      <div className="admin-panel-heading">
        <div><h2>Xu hướng nền tảng</h2><p>{VIEWS[view].desc}</p></div>
        {view !== 'compare' && <div className="admin-segmented admin-range-tabs" role="group" aria-label="Khoảng thời gian biểu đồ">{Object.keys(TREND_RANGES).map(item => <button key={item} type="button" aria-pressed={range === item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}{TREND_RANGES[item] > 30 && (view === 'trend' || view === 'bookings') && <small>theo tuần</small>}</button>)}</div>}
      </div>
      <div className="admin-chart-views" role="tablist" aria-label="Kiểu biểu đồ">
        {Object.entries(VIEWS).map(([key, item]) => <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? 'selected' : ''} onClick={() => setView(key)}>{item.label}</button>)}
      </div>
      {view === 'compare' ? <PeriodCompareView reloadKey={reloadKey} />
        : view === 'facilities' ? <FacilityCompareView range={apiRange} rangeLabel={range} reloadKey={reloadKey} />
          : view === 'courts' ? <CourtCompareView range={apiRange} rangeLabel={range} reloadKey={reloadKey} />
            : <>
      <div className="admin-chart-summary">
        <div className="admin-trend-metric admin-trend-metric--revenue"><i className="admin-legend-dot admin-legend-dot--revenue" /><span>Giá trị đặt sân<small>(Điểm)</small></span><strong>{loading ? '…' : formatCurrency(totalRevenue)}</strong></div>
        <div className="admin-trend-metric admin-trend-metric--bookings"><i className="admin-legend-dot admin-legend-dot--bookings" /><span>Số lượng<small>lượt đặt sân</small></span><strong>{loading ? '…' : formatNumber(totalBookings)}</strong></div>
        <div className="admin-trend-metric admin-trend-metric--users"><i className="admin-legend-dot admin-legend-dot--users" /><span>Người dùng<small>đăng ký mới</small></span><strong>{loading ? '…' : formatNumber(totalUsers)}</strong></div>
        <span className="admin-chart-growth"><TrendingUp size={14} /> {range} gần nhất</span>
      </div>
      <div className="admin-chart-wrap">
        {loading ? <p className="admin-empty">Đang tải dữ liệu biểu đồ…</p>
          : state.error ? <p className="admin-empty">{state.error}</p>
            : view === 'bookings' ? <BookingsBarView series={series} rangeLabel={range} />
            : empty ? <p className="admin-empty">Chưa có hoạt động trong {range} gần nhất.</p>
              : <svg viewBox="0 0 740 330" role="img" aria-label={`Xu hướng giá trị đặt sân, lượt đặt sân và người dùng mới trong ${range}`}>
                <defs><linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity=".24" /><stop offset="100%" stopColor="#16a34a" stopOpacity=".015" /></linearGradient></defs>
                <text x="12" y="22" fill="#9ca8af" fontSize="11">{axis.unit}</text>
                {[0, 1, 2, 3, 4].map(index => <g key={index}><line x1={X0} y1={Y0 + index * 55} x2={X1} y2={Y0 + index * 55} stroke="#e5ece8" strokeDasharray="3 4" /><text x="12" y={Y0 + 4 + index * 55} fill="#9ca8af" fontSize="11">{axis.format((axisTop * (4 - index)) / 4)}</text></g>)}
                {totalRevenue > 0 && <path d={`${revenueCurve} L ${X1},${Y1} L ${X0},${Y1} Z`} fill="url(#admin-revenue-fill)" />}
                <path d={revenueCurve} fill="none" stroke={SERIES.revenue.color} strokeWidth="3" />
                <path d={curveOf(points.bookings)} fill="none" stroke={SERIES.bookings.color} strokeWidth="2.5" strokeDasharray="5 4" />
                <path d={curveOf(points.newUsers)} fill="none" stroke={SERIES.newUsers.color} strokeWidth="2.5" />
                {/* Chấm tại các điểm có dữ liệu để dễ đọc khi dữ liệu thưa (chỉ 1–2 ngày có hoạt động). */}
                {Object.entries(SERIES).map(([key, { color }]) => series.map((item, index) => item[key] > 0 && <circle key={`${key}-${item.label}`} cx={points[key][index][0]} cy={points[key][index][1]} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />))}
                {series.map((item, index) => <rect key={item.label} x={xOf(index) - Math.max(step, 8) / 2} y={Y0} width={Math.max(step, 8)} height={Y1 - Y0} fill="transparent"><title>{`${item.label}: ${formatNumber(item.bookings)} lượt đặt · ${formatCurrency(item.revenue)} · ${formatNumber(item.newUsers)} người dùng mới`}</title></rect>)}
                {series.map((item, index) => (index % labelEvery === 0 || index === series.length - 1) && <text key={item.label} x={xOf(index)} y="309" textAnchor={index === series.length - 1 ? 'end' : index ? 'middle' : 'start'} fill="#99a3ad" fontSize="11">{index === series.length - 1 && TREND_RANGES[range] <= 30 ? 'Hôm nay' : item.label}</text>)}
              </svg>}
      </div>
      {view === 'trend' && <div className="admin-chart-footer"><span><i className="admin-legend-dot admin-legend-dot--revenue" /> Giá trị đặt sân</span><span><i className="admin-legend-dot admin-legend-dot--bookings" /> Lượt đặt sân</span><span><i className="admin-legend-dot admin-legend-dot--users" /> Người dùng mới</span><span className="admin-muted">Mỗi đường dùng thang riêng · rê chuột để xem số liệu</span></div>}
            </>}
    </section>
  )
}
