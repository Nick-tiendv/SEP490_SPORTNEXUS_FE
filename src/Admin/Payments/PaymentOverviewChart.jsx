import { useState } from 'react'
import { chartPeriods, money } from './paymentData.js'

export default function PaymentOverviewChart() {
  const [period, setPeriod] = useState('day')
  const [hovered, setHovered] = useState(null)
  const { points, context } = chartPeriods[period]
  const max = Math.max(...points.map(point => Math.max(point.successful, point.pending, point.trend))) * 1.2
  const y = value => 210 - value / max * 175
  const x = index => 72 + index * 74
  const trendPath = points.map((point, index) => index === 0 ? `M${x(index)} ${y(point.trend)}` : `C${x(index) - 37} ${y(points[index - 1].trend)},${x(index) - 37} ${y(point.trend)},${x(index)} ${y(point.trend)}`).join(' ')
  return <section className="payments-overview"><header><div><h2>Tổng quan thanh toán <span>Dữ liệu minh họa</span></h2><p>{context} · Giá trị giao dịch mẫu, không tính từ bảng.</p></div><div className="payments-periods" aria-label="Khoảng biểu đồ">{Object.entries(chartPeriods).map(([value, data]) => <button key={value} aria-pressed={period === value} onClick={() => { setPeriod(value); setHovered(null) }}>{data.label}</button>)}</div></header><div className="payments-chart-legend"><span><i />Thành công</span><span><i className="pending" />Đang xử lý</span><span><i className="trend" />Xu hướng mẫu</span></div><div className="payments-chart"><svg viewBox="0 0 570 255" role="img" aria-label={`Biểu đồ thanh toán theo ${chartPeriods[period].label.toLowerCase()}`}>
    {[0, .5, 1].map(level => <g key={level}><line x1="48" y1={y(max * level)} x2="550" y2={y(max * level)} stroke="#e6eee8" strokeDasharray="3 3" /><text x="42" y={y(max * level) + 3} textAnchor="end" fill="#9baaa3" fontSize="8">{(max * level / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr đ</text></g>)}
    {points.map((point, index) => <g key={point.label} className="payments-chart-point" tabIndex={0} role="button" aria-label={`${point.label}: thành công ${money(point.successful)}, đang xử lý ${money(point.pending)}, xu hướng ${money(point.trend)}`} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => setHovered(index)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setHovered(index) } }}><title>{point.label} · {money(point.successful)} · {money(point.pending)}</title><rect x={x(index) - 22} y="25" width="60" height="210" fill="transparent" /><rect x={x(index) - 15} y={y(point.successful)} width="12" height={210 - y(point.successful)} fill="#58a776" rx="1" /><rect x={x(index) + 5} y={y(point.pending)} width="7" height={210 - y(point.pending)} fill="#efb63e" rx="1" /><text x={x(index)} y="235" textAnchor="middle" fill="#7e9688" fontSize="8">{point.label}</text></g>)}
    <path d={trendPath} fill="none" stroke="#287b4c" strokeWidth="2" pointerEvents="none" />
  </svg>{hovered !== null && <div className="payments-chart-tooltip" role="tooltip"><strong>{points[hovered].label}</strong><span>Thành công: {money(points[hovered].successful)}</span><span>Đang xử lý: {money(points[hovered].pending)}</span><span>Xu hướng: {money(points[hovered].trend)}</span></div>}</div></section>
}
