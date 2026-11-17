// Các kiểu xem bổ sung cho khung "Xu hướng nền tảng" (TrendsChart.jsx).
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAdminCourtBookingStats, getAdminDashboard, getBookingStatistics } from '../../api/admin/dashboardApi.js'
import { getFacilityOptions } from '../../api/admin/bookingApi.js'
import PeriodComparisonChart from '../../components/charts/PeriodComparisonChart.jsx'
import RankBarChart from '../../components/charts/RankBarChart.jsx'
import { COMPARE_KINDS, buildComparisonRows, comparePeriods, summarizeComparison } from '../../utils/periodCompare.js'
import { formatCurrency, formatNumber, growth } from './dashboardData.js'

const Empty = ({ children }) => <p className="admin-empty">{children}</p>

// 1. Lượt đặt sân theo ngày (hoặc theo tuần với 90 ngày) dạng cột.
export function BookingsBarView({ series, rangeLabel }) {
  if (!series.some(item => item.bookings > 0)) return <Empty>Chưa có lượt đặt sân trong {rangeLabel} gần nhất.</Empty>
  return (
    <div className="admin-chart-canvas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={series} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#e5ece8" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} interval="preserveStartEnd" minTickGap={10} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={44} />
          <Tooltip cursor={{ fill: 'rgba(2, 132, 199, 0.07)' }} formatter={value => [`${formatNumber(value)} lượt`, 'Lượt đặt sân']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12.5 }} />
          <Bar dataKey="bookings" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. So sánh lượt đặt tháng này / tháng trước, quý này / quý trước (byDay của GET /admin/dashboard).
export function PeriodCompareView({ reloadKey }) {
  const [kind, setKind] = useState('month')
  const [state, setState] = useState({ key: '' })
  const periods = useMemo(() => comparePeriods(kind), [kind])
  const requestKey = `${kind}|${reloadKey}`

  useEffect(() => {
    let cancelled = false
    const load = ({ from, to }) => getAdminDashboard({ fromDate: from, toDate: to }, { fresh: reloadKey > 0 })
    Promise.all([load(periods.previous), load(periods.current)])
      .then(([previous, current]) => !cancelled && setState({ key: requestKey, previous: previous.byDay, current: current.byDay }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message }))
    return () => { cancelled = true }
  }, [periods, reloadKey, requestKey])

  const loading = state.key !== requestKey
  const rows = loading || state.error ? [] : buildComparisonRows(periods, state.previous, state.current)
  const summary = rows.length ? summarizeComparison(rows, periods) : null
  const unitLabel = COMPARE_KINDS[kind].toLowerCase()

  return (
    <div className="admin-chart-view">
      <div className="admin-chart-view__bar">
        <div className="admin-segmented" role="group" aria-label="Kỳ so sánh">{Object.entries(COMPARE_KINDS).map(([key, label]) => <button key={key} type="button" aria-pressed={kind === key} className={kind === key ? 'selected' : ''} onClick={() => setKind(key)}>{label}</button>)}</div>
        {summary && <span className="admin-chart-view__note">{periods.current.label}: <strong>{formatNumber(summary.current)}</strong> lượt · {periods.previous.label}: <strong>{formatNumber(summary.previousTotal)}</strong> lượt · so với cùng mốc {unitLabel} trước: <strong>{growth(summary.current, summary.previousSameDay) || '—'}</strong></span>}
      </div>
      {loading ? <Empty>Đang tải dữ liệu so sánh…</Empty>
        : state.error ? <Empty>{state.error}</Empty>
          : !summary.current && !summary.previousTotal ? <Empty>Chưa có lượt đặt sân trong {periods.previous.label} và {periods.current.label}.</Empty>
            : <div className="admin-chart-canvas"><PeriodComparisonChart rows={rows} previousLabel={periods.previous.label} currentLabel={periods.current.label} height={280} /></div>}
    </div>
  )
}

// 3. So sánh số đơn giữa các cơ sở (cụm sân): topFacilities của GET /bookings/admin/statistics.
export function FacilityCompareView({ range, rangeLabel, reloadKey }) {
  const [state, setState] = useState({ key: '' })
  const requestKey = `${range.fromDate}|${range.toDate}|${reloadKey}`

  useEffect(() => {
    let cancelled = false
    getBookingStatistics({ DateFrom: range.fromDate, DateTo: range.toDate })
      .then(({ topFacilities }) => !cancelled && setState({ key: requestKey, items: topFacilities }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message }))
    return () => { cancelled = true }
  }, [range.fromDate, range.toDate, requestKey])

  if (state.key !== requestKey) return <Empty>Đang tải dữ liệu cơ sở…</Empty>
  if (state.error) return <Empty>{state.error}</Empty>
  const items = state.items
    .filter(item => item.totalBookings > 0)
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .map(item => ({ name: item.name, value: item.totalBookings, hint: `${formatNumber(item.cancelledBookings)} hủy${item.ownerName ? ` · ${item.ownerName}` : ''}` }))
  if (!items.length) return <Empty>Chưa có cơ sở nào có lượt đặt sân trong {rangeLabel} gần nhất.</Empty>
  return (
    <div className="admin-chart-view">
      <span className="admin-chart-view__note">Xếp hạng cơ sở theo tổng số đơn (gồm cả đơn hủy) trong {rangeLabel} gần nhất.</span>
      <div className="admin-chart-canvas admin-chart-canvas--scroll"><RankBarChart items={items} /></div>
    </div>
  )
}

// 4. So sánh số đơn, doanh thu giữa các sân con của một cơ sở: GET /admin/facilities/{id}/courts/statistics.
// getAdminCourtBookingStats trả mảng [{ courtId, courtName, bookings, revenue }]; tổng cộng do FE cộng lại.
export function CourtCompareView({ range, rangeLabel, reloadKey }) {
  const [facilities, setFacilities] = useState(null)
  const [facilityId, setFacilityId] = useState('')
  const [state, setState] = useState({ key: '' })
  const requestKey = `${facilityId}|${range.fromDate}|${range.toDate}|${reloadKey}`

  useEffect(() => {
    let cancelled = false
    getFacilityOptions()
      .then(list => !cancelled && setFacilities(list))
      .catch(() => !cancelled && setFacilities([]))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    getAdminCourtBookingStats({ facilityId, fromDate: range.fromDate, toDate: range.toDate })
      .then(courts => !cancelled && setState({ key: requestKey, courts }))
      .catch(error => !cancelled && setState({ key: requestKey, error: error.message }))
    return () => { cancelled = true }
  }, [facilityId, range.fromDate, range.toDate, requestKey])

  const ready = facilityId && state.key === requestKey && !state.error
  const courts = ready ? state.courts || [] : []
  const totals = ready ? { bookings: courts.reduce((sum, court) => sum + court.bookings, 0), revenue: courts.reduce((sum, court) => sum + court.revenue, 0) } : null
  const items = courts
    .map(court => ({ name: court.courtName, value: court.bookings, hint: formatCurrency(court.revenue) }))
    .sort((a, b) => b.value - a.value)
  let body
  if (!facilityId) body = <Empty>Chọn một cơ sở để so sánh số đơn giữa các sân con.</Empty>
  else if (state.key !== requestKey) body = <Empty>Đang tải dữ liệu sân con…</Empty>
  else if (state.error) body = <Empty>{state.error}</Empty>
  else if (!items.length) body = <Empty>Cơ sở này chưa có sân con.</Empty>
  else if (!items.some(item => item.value > 0)) body = <Empty>Cơ sở này chưa có lượt đặt sân trong {rangeLabel} gần nhất.</Empty>
  else body = <div className="admin-chart-canvas admin-chart-canvas--scroll"><RankBarChart items={items} /></div>

  return (
    <div className="admin-chart-view">
      <div className="admin-chart-view__bar">
        <select className="admin-select" value={facilityId} onChange={event => setFacilityId(event.target.value)} aria-label="Chọn cơ sở" disabled={!facilities?.length}>
          <option value="">{facilities == null ? 'Đang tải cơ sở…' : facilities.length ? 'Chọn cơ sở…' : 'Không có cơ sở'}</option>
          {(facilities || []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {totals && courts.length > 0 && <span className="admin-chart-view__note">Tổng: <strong>{formatNumber(totals.bookings)}</strong> đơn · doanh thu <strong>{formatCurrency(totals.revenue)}</strong></span>}
      </div>
      {body}
    </div>
  )
}
