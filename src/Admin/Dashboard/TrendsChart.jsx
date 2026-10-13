import { useState } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { trends } from './dashboardData.js'

export default function TrendsChart() {
  const [range, setRange] = useState('30 ngày')
  const values = trends[range]
  const points = values.map((value, index) => [52 + index * (650 / (values.length - 1)), 260 - value * 3.4])
  const curve = points.reduce((path, [x, y], index) => {
    if (!index) return `M ${x},${y}`
    const [px, py] = points[index - 1]
    const middle = (px + x) / 2
    return `${path} C ${middle},${py} ${middle},${y} ${x},${y}`
  }, '')
  return (
    <section className="admin-panel admin-trends">
      <div className="admin-panel-heading">
        <div><h2>Bookings &amp; Revenue Trends</h2><p>Biểu đồ bookings và doanh thu giúp theo dõi tăng trưởng nền tảng.</p></div>
        <div className="admin-range-tabs" aria-label="Chart period">{Object.keys(trends).map(item => <button key={item} aria-pressed={range === item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}<small>{item === '7 ngày' ? 'Days' : item === '30 ngày' ? 'Days' : 'Months'}</small></button>)}</div>
      </div>
      <div className="admin-chart-summary">
        <div><i className="admin-legend-dot" /><span>Doanh thu nền tảng<small>(Triệu VNĐ)</small></span><strong>4.580<small>↑ 24.8%</small></strong></div>
        <div><i className="admin-legend-dot muted" /><span>Số lượng<small>bookings</small></span><strong>94.620<small>↑ 18.6%</small></strong></div>
        <span className="admin-chart-growth"><TrendingUp size={14} /> Biểu đồ tăng trưởng ổn định</span>
      </div>
      <div className="admin-chart-wrap">
        <svg viewBox="0 0 740 330" role="img" aria-label={`Mock bookings and revenue trends for ${range}`}>
          <defs><linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#24734b" stopOpacity=".28" /><stop offset="100%" stopColor="#24734b" stopOpacity=".015" /></linearGradient></defs>
          {[0, 1, 2, 3, 4].map(index => <g key={index}><line x1="52" y1={40 + index * 55} x2="702" y2={40 + index * 55} stroke="#e5ece8" strokeDasharray="3 4" /><text x="12" y={44 + index * 55} fill="#9ca8af" fontSize="11">{(6 - index * 1.5).toFixed(2)}</text></g>)}
          <path d={`${curve} L 702,275 L 52,275 Z`} fill="url(#admin-revenue-fill)" />
          <path d={curve} fill="none" stroke="#257148" strokeWidth="3" />
          <path d="M52,278 C105,254 110,243 145,237 S205,211 245,202 S310,211 352,206 S402,177 445,181 S501,164 535,143 S624,137 702,120" fill="none" stroke="#9dbfa5" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="316" y="53" width="250" height="28" rx="6" fill="#29353c" /><text x="331" y="71" fill="white" fontSize="10">● 776.0 triệu VNĐ / 24.980 bookings</text>
          {['01 TH03', '06 TH03', '11 TH03', '16 TH03', '21 TH03', '26 TH03', 'Hôm nay'].map((label, index) => <text key={label} x={52 + index * 108} y="309" textAnchor={index === 6 ? 'end' : 'start'} fill="#99a3ad" fontSize="11">{label}</text>)}
        </svg>
      </div>
      <div className="admin-chart-footer"><span><i className="admin-legend-dot" /> Doanh thu</span><span><i className="admin-legend-dot muted" /> Bookings</span><span className="admin-muted">Dữ liệu mẫu <ChevronDown size={12} /></span></div>
    </section>
  )
}
