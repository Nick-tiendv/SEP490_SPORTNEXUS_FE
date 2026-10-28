import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  bulkDeleteSlots,
  bulkUpdateSlots,
  deleteSlot,
  generateCourtSlots,
  generateFacilitySlots,
  getCourts,
  getFacilitySlotsRange,
} from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { WEEK_DAYS, addDays, formatDate, formatTime, formatVND, statusBadge, toDateKey, toTimeSpan } from '../shared.js'

const BULK_ACTIONS = [
  { value: 'LOCK', label: 'Khóa ca trống', hint: 'Nghỉ lễ, bảo trì: khách không đặt được.' },
  { value: 'UNLOCK', label: 'Mở lại ca đã khóa', hint: 'Trả các ca đã khóa về trạng thái trống.' },
  { value: 'SET_PRICE', label: 'Đổi giá', hint: 'Giờ vàng, cuối tuần: chỉ áp dụng cho ca chưa có khách.' },
  { value: 'DELETE', label: 'Xóa ca', hint: 'Xóa ca chưa bắt đầu và chưa có người đặt (vd sinh nhầm).' },
]

function CourtPicker({ courts, value, onChange }) {
  const all = value.length === 0
  return (
    <div className="snx-row">
      <button type="button" className="snx-chip" aria-pressed={all} onClick={() => onChange([])}>Tất cả sân</button>
      {courts.map((c) => {
        const id = String(c.id)
        const on = value.includes(id)
        return <button key={id} type="button" className="snx-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== id) : [...value, id])}>{c.name}</button>
      })}
    </div>
  )
}

function GenerateCard({ facilityId, courts, onDone }) {
  const today = toDateKey()
  const [form, setForm] = useState({ courtIds: [], dateFrom: today, dateTo: addDays(today, 6), openTime: '', closeTime: '', durationMinutes: 60, price: '' })
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (form.dateTo < form.dateFrom) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (form.openTime && form.closeTime && form.closeTime <= form.openTime) { toast.error('Giờ đóng phải sau giờ mở.'); return }
    const body = {
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      openTime: toTimeSpan(form.openTime),
      closeTime: toTimeSpan(form.closeTime),
      durationMinutes: Number(form.durationMinutes) || 60,
      price: form.price === '' ? null : Number(form.price),
      priceRules: [],
    }
    setBusy(true)
    try {
      if (form.courtIds.length === 1) {
        // 1 sân: POST /courts/{courtId}/slots/generate
        const r = await generateCourtSlots(form.courtIds[0], body)
        const name = courts.find((c) => String(c.id) === form.courtIds[0])?.name || 'Sân'
        setResult([{ courtName: name, success: true, createdSlots: r?.createdSlots, updatedSlots: r?.updatedSlots, skippedSlots: r?.skippedSlots, pastSlots: r?.pastSlots }])
      } else {
        // Nhiều sân / tất cả: POST /facilities/{id}/slots/generate (courtIds rỗng = mọi sân đang dùng)
        const r = await generateFacilitySlots(facilityId, { ...body, courtIds: form.courtIds.length ? form.courtIds : null })
        setResult(Array.isArray(r) ? r : [])
      }
      toast.success('Đã sinh ca.')
      onDone()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="snx-card" onSubmit={submit}>
      <h2 className="snx-card-title">Sinh ca hàng loạt</h2>
      <p className="snx-card-subtitle">Bỏ trống giờ = theo giờ mở cửa của cơ sở. Bỏ trống giá = giá mặc định của từng sân.</p>
      <div className="snx-stack" style={{ gap: 12, marginTop: 12 }}>
        <CourtPicker courts={courts} value={form.courtIds} onChange={(courtIds) => setForm({ ...form, courtIds })} />
        <div className="snx-form-grid">
          <label className="snx-field">Từ ngày<input className="snx-input" type="date" min={today} value={form.dateFrom} onChange={set('dateFrom')} /></label>
          <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.dateFrom} value={form.dateTo} onChange={set('dateTo')} /></label>
          <label className="snx-field">Giờ mở<input className="snx-input" type="time" value={form.openTime} onChange={set('openTime')} /></label>
          <label className="snx-field">Giờ đóng<input className="snx-input" type="time" value={form.closeTime} onChange={set('closeTime')} /></label>
          <label className="snx-field">Mỗi ca (phút)<input className="snx-input" type="number" min={15} max={480} step={15} value={form.durationMinutes} onChange={set('durationMinutes')} /></label>
          <label className="snx-field">Giá mỗi ca (đ)<input className="snx-input" type="number" min={0} step={1000} placeholder="Giá mặc định" value={form.price} onChange={set('price')} /></label>
        </div>
        <div className="snx-row"><span className="snx-spacer" /><button type="submit" className="snx-btn snx-btn--primary" disabled={busy || !courts.length}>{busy ? 'Đang sinh…' : 'Sinh ca'}</button></div>
        {result && (
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Sân</th><th>Tạo mới</th><th>Cập nhật</th><th>Bỏ qua</th><th>Đã qua</th></tr></thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.courtId || r.courtName}>
                    <td>{r.courtName}{r.success === false && <div className="snx-muted" style={{ color: '#b91c1c' }}>{r.message}</div>}</td>
                    <td>{r.createdSlots ?? 0}</td><td>{r.updatedSlots ?? 0}</td><td>{r.skippedSlots ?? 0}</td><td>{r.pastSlots ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </form>
  )
}

function BulkCard({ facilityId, courts, onDone }) {
  const today = toDateKey()
  const [form, setForm] = useState({ action: 'LOCK', courtIds: [], dateFrom: today, dateTo: today, startTime: '', endTime: '', daysOfWeek: [], price: '' })
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const action = BULK_ACTIONS.find((a) => a.value === form.action)

  const submit = async (event) => {
    event.preventDefault()
    if (form.dateTo < form.dateFrom) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (form.action === 'SET_PRICE' && !(Number(form.price) > 0)) { toast.error('Vui lòng nhập giá mới.'); return }
    if (form.action === 'DELETE' && !(await confirmDialog('Xóa mọi ca trống khớp bộ lọc? Không hoàn tác được.'))) return
    const filter = {
      courtIds: form.courtIds.length ? form.courtIds : null,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      startTime: toTimeSpan(form.startTime),
      endTime: toTimeSpan(form.endTime),
      daysOfWeek: form.daysOfWeek.length ? form.daysOfWeek : null,
    }
    setBusy(true)
    try {
      const r = form.action === 'DELETE'
        ? await bulkDeleteSlots(facilityId, filter)
        : await bulkUpdateSlots(facilityId, { ...filter, action: form.action, price: form.action === 'SET_PRICE' ? Number(form.price) : null })
      toast.success(`Khớp ${r?.matchedSlots ?? 0} ca • đã áp dụng ${r?.affectedSlots ?? 0} • bỏ qua ${r?.skippedSlots ?? 0}.`)
      onDone()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="snx-card" onSubmit={submit}>
      <h2 className="snx-card-title">Thao tác hàng loạt</h2>
      <p className="snx-card-subtitle">Ca đã có khách đặt luôn được giữ nguyên.</p>
      <div className="snx-stack" style={{ gap: 12, marginTop: 12 }}>
        <div className="snx-tabs" role="tablist" aria-label="Thao tác">
          {BULK_ACTIONS.map((a) => <button key={a.value} type="button" role="tab" aria-selected={form.action === a.value} className="snx-tab" onClick={() => setForm({ ...form, action: a.value })}>{a.label}</button>)}
        </div>
        <p className="snx-muted" style={{ margin: 0 }}>{action.hint}</p>
        <CourtPicker courts={courts} value={form.courtIds} onChange={(courtIds) => setForm({ ...form, courtIds })} />
        <div className="snx-form-grid">
          <label className="snx-field">Từ ngày<input className="snx-input" type="date" min={today} value={form.dateFrom} onChange={set('dateFrom')} /></label>
          <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.dateFrom} value={form.dateTo} onChange={set('dateTo')} /></label>
          <label className="snx-field">Từ giờ<input className="snx-input" type="time" value={form.startTime} onChange={set('startTime')} /></label>
          <label className="snx-field">Đến giờ<input className="snx-input" type="time" value={form.endTime} onChange={set('endTime')} /></label>
          {form.action === 'SET_PRICE' && <label className="snx-field">Giá mới (đ)<input className="snx-input" type="number" min={1000} step={1000} value={form.price} onChange={set('price')} /></label>}
        </div>
        <div className="snx-row">
          <span className="snx-muted">Chỉ các thứ:</span>
          {WEEK_DAYS.map((d) => {
            const on = form.daysOfWeek.includes(d.value)
            return <button key={d.value} type="button" className="snx-chip" aria-pressed={on} onClick={() => setForm({ ...form, daysOfWeek: on ? form.daysOfWeek.filter((x) => x !== d.value) : [...form.daysOfWeek, d.value] })}>{d.label}</button>
          })}
          {form.daysOfWeek.length === 0 && <span className="snx-muted">(mọi ngày)</span>}
        </div>
        <div className="snx-row"><span className="snx-spacer" /><button type="submit" className={`snx-btn ${form.action === 'DELETE' ? 'snx-btn--danger' : 'snx-btn--primary'}`} disabled={busy || !courts.length}>{busy ? 'Đang xử lý…' : 'Áp dụng'}</button></div>
      </div>
    </form>
  )
}

function DaySlotsModal({ day, court, onClose, onDeleted }) {
  const [busyId, setBusyId] = useState(null)
  const remove = async (slot) => {
    if (!(await confirmDialog(`Xóa ca ${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}?`))) return
    setBusyId(slot.id)
    try {
      await deleteSlot(slot.id)
      toast.success('Đã xóa ca.')
      onDeleted()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusyId(null)
    }
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="day-slots-title">
        <div className="snx-modal-head">
          <div><h2 id="day-slots-title" className="snx-card-title">{court.courtName} • {formatDate(day.date)}</h2><p className="snx-card-subtitle">{court.slots.length} ca</p></div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-table-wrap">
          <table className="snx-table">
            <thead><tr><th>Giờ</th><th>Giá</th><th>Trạng thái</th><th>Khách / giải</th><th /></tr></thead>
            <tbody>
              {court.slots.map((s) => {
                const b = statusBadge(s.status)
                const deletable = !s.isPast && !s.bookingId && String(s.status).toUpperCase() === 'AVAILABLE'
                return (
                  <tr key={s.id}>
                    <td>{formatTime(s.startTime)} – {formatTime(s.endTime)}{s.isPast && <div className="snx-muted">Đã qua</div>}</td>
                    <td>{formatVND(s.price)}</td>
                    <td><span className={b.className}>{b.label}</span></td>
                    <td>{s.customerName || s.tournamentName || '—'}{s.matchName && <div className="snx-muted">{s.matchName}</div>}</td>
                    <td>{deletable && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" disabled={busyId === s.id} onClick={() => remove(s)}>Xóa</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function OwnerSlots() {
  const { facilityId, facility } = useOwnerContext()
  const [from, setFrom] = useState(toDateKey())
  const to = addDays(from, 6)
  const [open, setOpen] = useState(null) // { dayIndex, courtId }

  const courts = useApi(() => getCourts(facilityId), [facilityId], { enabled: !!facilityId, initialData: [] })
  const range = useApi(() => getFacilitySlotsRange(facilityId, { from, to }), [facilityId, from], { enabled: !!facilityId })
  const r = range.data
  const days = r?.days || []
  const courtRows = days[0]?.courts?.map((c) => ({ courtId: c.courtId, courtName: c.courtName, sportName: c.sportName })) || (courts.data || []).map((c) => ({ courtId: c.id, courtName: c.name }))
  const openDay = open ? days[open.dayIndex] : null
  const openCourt = openDay?.courts?.find((c) => String(c.courtId) === String(open.courtId))

  if (!facilityId) {
    return (
      <div className="snx-stack">
        <PageHeader eyebrow="Cơ sở & sân" eyebrowIcon="event_repeat" title="Ca sân" />
        <NoFacilityState what="sinh ca và mở bán sân" />
      </div>
    )
  }

  return (
    <div className="snx-stack">
      <PageHeader eyebrow="Cơ sở & sân" eyebrowIcon="event_repeat" title="Ca sân" subtitle={`Sinh ca, khóa / mở, đổi giá và xóa ca của ${facility?.name || 'cơ sở'}.`} />

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Lịch 7 ngày</h2>
          <span className="snx-spacer" />
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => setFrom(addDays(from, -7))} aria-label="Tuần trước"><span className="material-symbols-outlined">chevron_left</span></button>
          <input className="snx-input" style={{ width: 'auto' }} type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} aria-label="Từ ngày" />
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => setFrom(addDays(from, 7))} aria-label="Tuần sau"><span className="material-symbols-outlined">chevron_right</span></button>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setFrom(toDateKey())}>Hôm nay</button>
        </div>
        {range.error && <div className="snx-alert snx-alert--error">{range.error}</div>}
        {r && (
          <div className="snx-stats" style={{ marginBottom: 12 }}>
            <div className="snx-stat"><div className="snx-stat-label">Tổng ca</div><div className="snx-stat-value">{r.totalSlots}</div></div>
            <div className="snx-stat"><div className="snx-stat-label">Đã đặt</div><div className="snx-stat-value">{r.bookedSlots}</div></div>
            <div className="snx-stat"><div className="snx-stat-label">Còn trống</div><div className="snx-stat-value">{r.availableSlots}</div></div>
            <div className="snx-stat"><div className="snx-stat-label">Đã khóa</div><div className="snx-stat-value">{r.lockedSlots}</div></div>
            <div className="snx-stat"><div className="snx-stat-label">Giữ cho giải</div><div className="snx-stat-value">{r.reservedSlots}</div></div>
          </div>
        )}
        {range.loading && !r ? <p className="snx-muted">Đang tải lịch…</p> : courtRows.length === 0 ? (
          <div className="snx-empty"><span className="material-symbols-outlined">sports_tennis</span>Cơ sở chưa có sân con. <Link to="/owner/courts">Thêm sân</Link></div>
        ) : (
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Sân</th>{days.map((d) => <th key={d.date}>{new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</th>)}</tr></thead>
              <tbody>
                {courtRows.map((row) => (
                  <tr key={row.courtId}>
                    <td><strong>{row.courtName}</strong>{row.sportName && <div className="snx-muted">{row.sportName}</div>}</td>
                    {days.map((d, index) => {
                      const c = d.courts?.find((x) => String(x.courtId) === String(row.courtId))
                      const slots = c?.slots || []
                      const booked = slots.filter((s) => s.bookingId).length
                      const free = slots.filter((s) => String(s.status).toUpperCase() === 'AVAILABLE' && !s.isPast).length
                      return (
                        <td key={d.date}>
                          {slots.length === 0 ? <span className="snx-muted">—</span> : (
                            <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" style={{ padding: '2px 6px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setOpen({ dayIndex: index, courtId: row.courtId })}>
                              <span>{slots.length} ca</span>
                              <span className="snx-muted" style={{ fontSize: 11 }}>{booked} đặt • {free} trống</span>
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="snx-grid snx-grid--2">
        <GenerateCard facilityId={facilityId} courts={courts.data || []} onDone={range.refresh} />
        <BulkCard facilityId={facilityId} courts={courts.data || []} onDone={range.refresh} />
      </div>

      {openDay && openCourt && <DaySlotsModal day={openDay} court={openCourt} onClose={() => setOpen(null)} onDeleted={range.refresh} />}
    </div>
  )
}
