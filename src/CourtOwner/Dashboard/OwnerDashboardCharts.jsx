// Thẻ KPI và các biểu đồ so sánh trên Dashboard chủ sân.
import { useEffect, useMemo, useState } from 'react'
import { getOwnerDashboard } from '../../api/owner'
import PeriodComparisonChart from '../../components/charts/PeriodComparisonChart.jsx'
import RankBarChart from '../../components/charts/RankBarChart.jsx'
import { COMPARE_KINDS, buildComparisonRows, comparePeriods, summarizeComparison } from '../../utils/periodCompare.js'

const number = (value) => Number(value || 0).toLocaleString('vi-VN')

// Thẻ KPI cùng phong cách Admin. tone: emerald | amber | blue | teal
export function OwnerKpiCard({ tone, label, icon, value, unit, children }) {
  return (
    <article className={`owner-kpi owner-kpi--${tone}`}>
      <div className="owner-kpi__heading">
        <span>{label}</span>
        <span className="owner-kpi__icon"><span className="material-symbols-outlined">{icon}</span></span>
      </div>
      <div className="owner-kpi__value">{value}{unit && <small>{unit}</small>}</div>
      <div className="owner-kpi__sub">{children}</div>
    </article>
  )
}

// So sánh số đơn tháng này / tháng trước, quý này / quý trước (GET /owner/dashboard cho từng kỳ).
export function BookingComparisonPanel({ facilityId }) {
  const [kind, setKind] = useState('month')
  const [state, setState] = useState({ key: '' })
  const requestKey = `${facilityId}|${kind}`
  const periods = useMemo(() => comparePeriods(kind), [kind])

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    const load = ({ from, to }) => getOwnerDashboard({ facilityId, from, to })
    Promise.all([load(periods.previous), load(periods.current)])
      .then(([previous, current]) => !cancelled && setState({ key: requestKey, previous: previous?.revenueByDay || [], current: current?.revenueByDay || [] }))
      .catch((error) => !cancelled && setState({ key: requestKey, error: error.message }))
    return () => { cancelled = true }
  }, [facilityId, periods, requestKey])

  const loading = state.key !== requestKey
  const rows = loading || state.error ? [] : buildComparisonRows(periods, state.previous, state.current)
  const summary = rows.length ? summarizeComparison(rows, periods) : null
  const empty = summary && !summary.current && !summary.previousTotal
  const unitLabel = COMPARE_KINDS[kind].toLowerCase()

  return (
    <section className="owner-chart-panel">
      <div className="owner-chart-panel__head">
        <div>
          <h3>So sánh số đơn theo {unitLabel}</h3>
          <p>{periods.previous.label} và {periods.current.label} • số đơn cộng dồn theo ngày</p>
        </div>
        <div className="owner-segmented" role="group" aria-label="Kỳ so sánh">
          {Object.entries(COMPARE_KINDS).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={kind === key} onClick={() => setKind(key)}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="owner-chart-empty">Đang tải dữ liệu so sánh...</div>
        : state.error ? <div className="owner-chart-empty">Không tải được dữ liệu: {state.error}</div>
          : (
            <>
              <div className="owner-compare-stats">
                <div><small>{periods.current.label} (tới hôm nay)</small><strong>{number(summary.current)} đơn</strong></div>
                <div><small>{periods.previous.label} (cả kỳ)</small><strong>{number(summary.previousTotal)} đơn</strong></div>
                <div>
                  <small>So với cùng mốc {unitLabel} trước</small>
                  <strong className={summary.change == null ? '' : summary.change >= 0 ? 'is-up' : 'is-down'}>
                    {summary.change == null ? '—' : `${summary.change >= 0 ? '+' : ''}${summary.change.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`}
                  </strong>
                </div>
              </div>
              {empty
                ? <div className="owner-chart-empty">Chưa có đơn đặt sân trong {periods.previous.label} và {periods.current.label}.</div>
                : <PeriodComparisonChart rows={rows} previousLabel={periods.previous.label} currentLabel={periods.current.label} />}
              <p className="owner-chart-note">
                % thay đổi so sánh {periods.current.label} với {number(summary.previousSameDay)} đơn của {periods.previous.label} tính tới cùng ngày thứ {periods.current.elapsed}.
              </p>
            </>
          )}
    </section>
  )
}

// Số đơn của từng sân trong cơ sở (revenueByCourt của GET /owner/dashboard theo kỳ đang chọn).
export function CourtBookingsPanel({ courts, periodDays, loading, error }) {
  const items = (courts || [])
    .map((court) => ({ name: court.courtName || 'Sân', value: Number(court.bookings) || 0, hint: `lấp đầy ${Number(court.occupancyRate || 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` }))
    .sort((a, b) => b.value - a.value)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="owner-chart-panel owner-panel--rank">
      <div className="owner-chart-panel__head">
        <div>
          <h3>Số đơn theo từng sân</h3>
          <p>{periodDays} ngày gần nhất • {loading ? '...' : `${number(total)} đơn / ${items.length} sân`}</p>
        </div>
      </div>
      {loading ? <div className="owner-chart-empty">Đang tải...</div>
        : error ? <div className="owner-chart-empty">Không tải được dữ liệu: {error}</div>
          : !items.length ? <div className="owner-chart-empty">Cơ sở chưa có sân nào.</div>
            : total === 0 ? <div className="owner-chart-empty">Chưa có đơn đặt sân trong {periodDays} ngày gần nhất.</div>
              : <RankBarChart items={items} />}
    </section>
  )
}
