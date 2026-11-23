import { Fragment, useEffect, useRef, useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  bulkDeleteSlots,
  bulkUpdateSlots,
  deleteSlot,
  findOverlappingPeriods,
  generateCourtSlots,
  generateFacilitySlots,
  getCourts,
  getFacilityAvailability,
  getFacilitySlotsRange,
  getPricePeriods,
} from '../../api/owner'
import PricePeriodsCard from './PricePeriodsCard.jsx'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { WEEK_DAYS, addDays, formatDate, formatTime, formatVND, statusBadge, toDateKey, toTimeSpan } from '../shared.js'

const BULK_ACTIONS = [
  { value: 'LOCK', label: 'Khóa ca trống', icon: 'lock', tone: 'amber' },
  { value: 'UNLOCK', label: 'Mở lại ca đã khóa', icon: 'lock_open', tone: 'green' },
  { value: 'SET_PRICE', label: 'Đổi giá', icon: 'payments', tone: 'blue' },
  { value: 'DELETE', label: 'Xóa ca', icon: 'delete', tone: 'red' },
]

// Môn của sân: CourtResponse.categoryName (lịch tuần trả sportName)
const sportOfCourt = (court) => court?.categoryName || court?.sportName || ''

// Sân sẽ thao tác: sân đã chọn (trong danh sách đang hiện); không chọn sân nào thì
// - đang lọc theo môn: mọi sân của môn đó (gửi rõ id, tránh BE hiểu "rỗng" là mọi sân của cơ sở)
// - không lọc: rỗng = mọi sân đang dùng
const targetCourtIds = (selected, courts, scoped) => {
  const visible = selected.filter((id) => courts.some((c) => String(c.id) === id))
  if (visible.length) return visible
  return scoped ? courts.map((c) => String(c.id)) : []
}

const DAY_FULL_LABELS = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'Chủ nhật' }
const WEEK_DAY_OPTIONS = WEEK_DAYS.map((d) => ({ ...d, fullLabel: DAY_FULL_LABELS[d.value] || d.label }))
const WEEK_DAY_INDEX = new Map(WEEK_DAY_OPTIONS.map((d, idx) => [d.value, idx]))

const sliceWeekDayRange = (fromValue, toValue) => {
  const fromIdx = WEEK_DAY_INDEX.get(fromValue) ?? 0
  const toIdx = WEEK_DAY_INDEX.get(toValue) ?? (WEEK_DAY_OPTIONS.length - 1)
  const picked = fromIdx <= toIdx
    ? WEEK_DAY_OPTIONS.slice(fromIdx, toIdx + 1)
    : [...WEEK_DAY_OPTIONS.slice(fromIdx), ...WEEK_DAY_OPTIONS.slice(0, toIdx + 1)]
  return picked.length >= WEEK_DAY_OPTIONS.length ? [] : picked.map((d) => d.value)
}

const formatWeekDaysSummary = (days) => {
  if (!days?.length || days.length >= WEEK_DAY_OPTIONS.length) return 'Mọi ngày'
  const ordered = [...days].sort((a, b) => (WEEK_DAY_INDEX.get(a) ?? 9) - (WEEK_DAY_INDEX.get(b) ?? 9))
  const contiguous = ordered.length >= 3 && ordered.every((v, i) => i === 0 || WEEK_DAY_INDEX.get(v) === WEEK_DAY_INDEX.get(ordered[i - 1]) + 1)
  const shortOf = (v) => WEEK_DAY_OPTIONS.find((d) => d.value === v)?.label || ''
  return contiguous ? `${shortOf(ordered[0])} – ${shortOf(ordered.at(-1))}` : ordered.map(shortOf).join(', ')
}

function WeekDaySelector({ label = 'Áp dụng các thứ', value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [rangeFrom, setRangeFrom] = useState(1)
  const [rangeTo, setRangeTo] = useState(5)
  const rootRef = useRef(null)
  const isAll = !value?.length || value.length >= WEEK_DAY_OPTIONS.length
  const summary = formatWeekDaysSummary(value)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  const selectAll = () => { onChange([]); setOpen(false) }
  const toggleDay = (dayValue) => {
    const base = isAll ? WEEK_DAY_OPTIONS.map((d) => d.value) : value
    const next = base.includes(dayValue) ? base.filter((x) => x !== dayValue) : [...base, dayValue]
    onChange(next.length === 0 || next.length >= WEEK_DAY_OPTIONS.length ? [] : next)
  }
  const applyRange = (fromVal = rangeFrom, toVal = rangeTo) => {
    onChange(sliceWeekDayRange(fromVal, toVal))
  }

  return (
    <div className="snx-field snx-weekday" ref={rootRef}>
      <span>{label}</span>
      <div className="snx-weekday-bar">
        <button
          type="button"
          className={`snx-btn snx-btn--sm snx-btn--green${isAll ? ' is-active' : ''}`}
          aria-pressed={isAll}
          onClick={selectAll}
        >
          <span className="material-symbols-outlined">{isAll ? 'done_all' : 'event_available'}</span>
          Mọi ngày
        </button>
        <button
          type="button"
          className={`snx-btn snx-btn--sm ${isAll ? 'snx-btn--secondary' : 'snx-btn--blue is-active'}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">date_range</span>
          <span>{isAll ? 'Chọn thứ trong tuần' : `Đang chọn: ${summary}`}</span>
          <span className="material-symbols-outlined">{open ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>
      {open && (
        <div className="snx-weekday-panel">
          <div className="snx-weekday-range">
            <span className="snx-weekday-range-title">Chọn nhanh theo khoảng thứ</span>
            <div className="snx-weekday-range-controls">
              <select
                className="snx-select"
                aria-label="Từ thứ"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(Number(e.target.value))}
              >
                {WEEK_DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.fullLabel}</option>)}
              </select>
              <span className="snx-muted snx-weekday-range-sep">→</span>
              <select
                className="snx-select"
                aria-label="Đến thứ"
                value={rangeTo}
                onChange={(e) => setRangeTo(Number(e.target.value))}
              >
                {WEEK_DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.fullLabel}</option>)}
              </select>
              <button type="button" className="snx-btn snx-btn--sm snx-btn--blue is-active snx-weekday-range-apply" onClick={() => applyRange()}>
                Chọn khoảng
              </button>
            </div>
            <div className="snx-row" style={{ gap: 6 }}>
              <button type="button" className="snx-chip" onClick={() => { setRangeFrom(1); setRangeTo(5); applyRange(1, 5) }}>T2 – T6</button>
              <button type="button" className="snx-chip" onClick={() => { setRangeFrom(6); setRangeTo(0); applyRange(6, 0) }}>Cuối tuần (T7 – CN)</button>
            </div>
          </div>
          <div className="snx-weekday-list" role="group" aria-label="Danh sách các thứ trong tuần">
            {WEEK_DAY_OPTIONS.map((d) => {
              const checked = isAll || value.includes(d.value)
              return (
                <label key={d.value} className={`snx-weekday-option${checked ? ' is-selected' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleDay(d.value)} />
                  <span>{d.fullLabel}</span>
                  <span className="snx-weekday-short">{d.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CourtPicker({ courts, value, onChange, allLabel = 'Tất cả sân' }) {
  const all = value.length === 0
  return (
    <div className="snx-row">
      <button type="button" className="snx-chip" aria-pressed={all} onClick={() => onChange([])}>{allLabel}</button>
      {courts.map((c) => {
        const id = String(c.id)
        const on = value.includes(id)
        return <button key={id} type="button" className="snx-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== id) : [...value, id])}>{c.name}</button>
      })}
    </div>
  )
}

function GenerateCard({ facilityId, courts, scoped, allLabel, onDone }) {
  const today = toDateKey()
  const [form, setForm] = useState({ courtIds: [], dateFrom: today, dateTo: addDays(today, 6), openTime: '', closeTime: '', durationMinutes: '', price: '' })
  const [priceRules, setPriceRules] = useState([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const addPriceRule = () => setPriceRules((prev) => [...prev, { daysOfWeek: [], startTime: '17:00', endTime: '22:00', price: '' }])
  const updateRule = (idx, patch) => setPriceRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  const removeRule = (idx) => setPriceRules((prev) => prev.filter((_, i) => i !== idx))

  const submit = async (event) => {
    event.preventDefault()
    if (form.dateTo < form.dateFrom) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (form.openTime && form.closeTime && form.closeTime <= form.openTime) { toast.error('Giờ đóng phải sau giờ mở.'); return }
    const duration = form.durationMinutes === '' ? null : Number(form.durationMinutes)
    if (duration !== null && (!Number.isInteger(duration) || duration < 15 || duration > 480)) {
      toast.error('Thời lượng mỗi ca phải là số nguyên từ 15 đến 480 phút.')
      return
    }
    const basePrice = form.price === '' ? null : Number(form.price)
    if (basePrice !== null && (!Number.isFinite(basePrice) || basePrice < 0)) {
      toast.error('Giá mỗi ca không hợp lệ.')
      return
    }
    const rulesPayload = []
    for (let i = 0; i < priceRules.length; i += 1) {
      const rule = priceRules[i]
      if (!rule.startTime || !rule.endTime || rule.endTime <= rule.startTime) {
        toast.error(`Khung giá riêng #${i + 1}: giờ kết thúc phải sau giờ bắt đầu.`)
        return
      }
      const rulePrice = Number(rule.price)
      if (!Number.isFinite(rulePrice) || rulePrice < 0 || rule.price === '') {
        toast.error(`Khung giá riêng #${i + 1}: vui lòng nhập giá hợp lệ.`)
        return
      }
      rulesPayload.push({
        daysOfWeek: rule.daysOfWeek.length ? rule.daysOfWeek : null,
        startTime: toTimeSpan(rule.startTime),
        endTime: toTimeSpan(rule.endTime),
        price: rulePrice,
      })
    }

    const body = {
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      openTime: toTimeSpan(form.openTime),
      closeTime: toTimeSpan(form.closeTime),
      // Bỏ trống = thời lượng ca chủ sân chọn cho từng sân (trang Sân & giá), chưa chọn thì theo môn
      durationMinutes: duration,
      price: basePrice,
      priceRules: rulesPayload,
    }
    const ids = targetCourtIds(form.courtIds, courts, scoped)
    setBusy(true)
    try {
      let rows = []
      if (ids.length === 1) {
        // 1 sân: POST /courts/{courtId}/slots/generate
        const r = await generateCourtSlots(ids[0], body)
        const name = courts.find((c) => String(c.id) === ids[0])?.name || 'Sân'
        rows = [{
          courtId: ids[0],
          courtName: name,
          success: true,
          createdSlots: r?.createdSlots ?? 0,
          updatedSlots: r?.updatedSlots ?? 0,
          skippedSlots: r?.skippedSlots ?? 0,
          pastSlots: r?.pastSlots ?? 0,
        }]
      } else {
        // Nhiều sân / tất cả: POST /facilities/{id}/slots/generate (courtIds rỗng = mọi sân đang dùng)
        const r = await generateFacilitySlots(facilityId, { ...body, courtIds: ids.length ? ids : null })
        rows = Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : []
      }
      setResult(rows)
      const failedCount = rows.filter((item) => item.success === false).length
      const createdTotal = rows.reduce((sum, item) => sum + (Number(item.createdSlots) || 0), 0)
      if (rows.length && failedCount === rows.length) toast.error('Không sinh được ca nào. Kiểm tra chi tiết bên dưới.')
      else if (failedCount > 0) toast.warning(`Đã tạo ${createdTotal} ca mới (${failedCount} sân không thành công).`)
      else toast.success(createdTotal ? `Đã sinh ${createdTotal} ca mới.` : 'Đã sinh ca.')
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
      <div className="snx-stack" style={{ gap: 12, marginTop: 12 }}>
        <CourtPicker courts={courts} allLabel={allLabel} value={form.courtIds.filter((id) => courts.some((c) => String(c.id) === id))} onChange={(courtIds) => setForm({ ...form, courtIds })} />
        <div className="snx-form-grid">
          <label className="snx-field">Từ ngày<input className="snx-input" type="date" min={today} value={form.dateFrom} onChange={set('dateFrom')} /></label>
          <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.dateFrom} value={form.dateTo} onChange={set('dateTo')} /></label>
          <label className="snx-field">Giờ mở<input className="snx-input" type="time" value={form.openTime} onChange={set('openTime')} /></label>
          <label className="snx-field">Giờ đóng<input className="snx-input" type="time" value={form.closeTime} onChange={set('closeTime')} /></label>
          <label className="snx-field">Mỗi ca (phút)<input className="snx-input" type="number" min={15} max={480} step={15} placeholder="Theo sân" value={form.durationMinutes} onChange={set('durationMinutes')} /></label>
          <label className="snx-field">Giá mỗi ca (đ)<input className="snx-input" type="number" min={0} step={1000} placeholder="Giá mặc định" value={form.price} onChange={set('price')} /></label>
        </div>
        <div className="snx-stack" style={{ gap: 8 }}>
          <div className="snx-row">
            <span className="snx-muted" style={{ fontSize: 13 }}>Khung giá riêng (giờ vàng / cuối tuần):</span>
            <span className="snx-spacer" />
            <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={addPriceRule}>+ Thêm khung giá</button>
          </div>
          {priceRules.map((rule, idx) => (
            <div key={idx} className="snx-stack" style={{ gap: 8, padding: 10, borderRadius: 10, border: '1px solid var(--snx-border, #e2e8f0)' }}>
              <div className="snx-form-grid">
                <label className="snx-field">Từ giờ<input className="snx-input" type="time" value={rule.startTime} onChange={(e) => updateRule(idx, { startTime: e.target.value })} /></label>
                <label className="snx-field">Đến giờ<input className="snx-input" type="time" value={rule.endTime} onChange={(e) => updateRule(idx, { endTime: e.target.value })} /></label>
                <label className="snx-field">Giá (đ)<input className="snx-input" type="number" min={0} step={1000} placeholder="VD: 150000" value={rule.price} onChange={(e) => updateRule(idx, { price: e.target.value })} /></label>
              </div>
              <WeekDaySelector value={rule.daysOfWeek} onChange={(daysOfWeek) => updateRule(idx, { daysOfWeek })} />
              <div className="snx-row">
                <span className="snx-spacer" />
                <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => removeRule(idx)}>Xóa</button>
              </div>
            </div>
          ))}
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

function BulkCard({ facilityId, courts, scoped, allLabel, onDone }) {
  const today = toDateKey()
  const [form, setForm] = useState({ action: 'LOCK', courtIds: [], dateFrom: today, dateTo: today, startTime: '', endTime: '', daysOfWeek: [], price: '' })
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const activeAction = BULK_ACTIONS.find((a) => a.value === form.action) || BULK_ACTIONS[0]

  const submit = async (event) => {
    event.preventDefault()
    if (form.dateTo < form.dateFrom) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (form.action === 'SET_PRICE' && !(Number(form.price) > 0)) { toast.error('Vui lòng nhập giá mới.'); return }
    if (form.action === 'DELETE' && !(await confirmDialog('Xóa mọi ca trống khớp bộ lọc? Không hoàn tác được.'))) return
    const ids = targetCourtIds(form.courtIds, courts, scoped)
    const filter = {
      courtIds: ids.length ? ids : null,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      startTime: toTimeSpan(form.startTime),
      endTime: toTimeSpan(form.endTime),
      daysOfWeek: form.daysOfWeek.length ? form.daysOfWeek : null,
    }
    // Đổi giá trùng đợt tuần lễ vàng / giá đặc biệt: báo trước vì sẽ ghi đè giá đợt trên các ca trống.
    // Không tải được danh sách đợt (vd BE chưa có API) thì bỏ qua bước kiểm tra.
    if (form.action === 'SET_PRICE') {
      const periods = await getPricePeriods(facilityId, { from: form.dateFrom, to: form.dateTo }).catch(() => [])
      const overlapping = findOverlappingPeriods(periods, { courtIds: ids, dateFrom: form.dateFrom, dateTo: form.dateTo, startTime: form.startTime, endTime: form.endTime })
      if (overlapping.length) {
        const nameOf = (id) => courts.find((c) => String(c.id) === id)?.name || 'Sân'
        const lines = overlapping.map((p) => `• ${p.courtIds.length ? p.courtIds.map(nameOf).join(', ') : 'Tất cả sân'}: "${p.name}" (${formatDate(p.fromDate)} – ${formatDate(p.toDate)})`).join('\n')
        const ok = await confirmDialog(
          `Các sân sau đang áp dụng tuần lễ vàng / giá đặc biệt:\n${lines}\n\nĐổi giá sẽ ghi đè giá của đợt trên các ca còn trống. Vẫn tiếp tục?`,
          { title: 'Trùng đợt giá đặc biệt', confirmLabel: 'Vẫn đổi giá', cancelLabel: 'Không đổi', danger: true },
        )
        if (!ok) return
      }
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
      <div className="snx-stack" style={{ gap: 12, marginTop: 12 }}>
        <div className="snx-row" role="tablist" aria-label="Thao tác" style={{ gap: 8 }}>
          {BULK_ACTIONS.map((a) => {
            const selected = form.action === a.value
            return (
              <button
                key={a.value}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`snx-btn snx-btn--sm snx-btn--${a.tone}${selected ? ' is-active' : ''}`}
                onClick={() => setForm({ ...form, action: a.value })}
              >
                <span className="material-symbols-outlined">{a.icon}</span>
                {a.label}
              </button>
            )
          })}
        </div>
        <CourtPicker courts={courts} allLabel={allLabel} value={form.courtIds.filter((id) => courts.some((c) => String(c.id) === id))} onChange={(courtIds) => setForm({ ...form, courtIds })} />
        <div className="snx-form-grid">
          <label className="snx-field">Từ ngày<input className="snx-input" type="date" min={today} value={form.dateFrom} onChange={set('dateFrom')} /></label>
          <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.dateFrom} value={form.dateTo} onChange={set('dateTo')} /></label>
          <label className="snx-field">Từ giờ<input className="snx-input" type="time" value={form.startTime} onChange={set('startTime')} /></label>
          <label className="snx-field">Đến giờ<input className="snx-input" type="time" value={form.endTime} onChange={set('endTime')} /></label>
          {form.action === 'SET_PRICE' && <label className="snx-field">Giá mới (đ)<input className="snx-input" type="number" min={1000} step={1000} value={form.price} onChange={set('price')} /></label>}
        </div>
        <WeekDaySelector value={form.daysOfWeek} onChange={(daysOfWeek) => setForm({ ...form, daysOfWeek })} />
        <div className="snx-row"><span className="snx-spacer" /><button type="submit" className={`snx-btn snx-btn--${activeAction.tone} is-active`} disabled={busy || !courts.length}><span className="material-symbols-outlined">{activeAction.icon}</span>{busy ? 'Đang xử lý…' : activeAction.label}</button></div>
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
  const today = toDateKey()
  const [from, setFrom] = useState(today)
  const to = addDays(from, 6)
  const [open, setOpen] = useState(null) // { dayIndex, courtId }

  const courts = useApi(() => getCourts(facilityId), [facilityId], { enabled: !!facilityId, initialData: [] })
  const range = useApi(() => getFacilitySlotsRange(facilityId, { from, to }), [facilityId, from], { enabled: !!facilityId })
  const availability = useApi(() => getFacilityAvailability(facilityId, { date: today }), [facilityId, today], { enabled: !!facilityId })
  const refreshAll = () => { range.refresh(); availability.refresh() }
  const r = range.data
  const days = r?.days || []
  const courtRows = days[0]?.courts?.map((c) => ({ courtId: c.courtId, courtName: c.courtName, sportName: c.sportName })) || (courts.data || []).map((c) => ({ courtId: c.id, courtName: c.name, sportName: sportOfCourt(c) }))

  // Lọc / nhóm theo môn: bảng 7 ngày và 2 thẻ thao tác hàng loạt chỉ làm việc với sân của môn đang chọn
  const [sport, setSport] = useState('')
  const allCourts = courts.data || []
  const sportNames = [...new Set([...allCourts.map(sportOfCourt), ...courtRows.map((row) => row.sportName)].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
  const activeSport = sportNames.includes(sport) ? sport : ''
  const scopedCourts = activeSport ? allCourts.filter((c) => sportOfCourt(c) === activeSport) : allCourts
  const visibleRows = courtRows
    .filter((row) => !activeSport || row.sportName === activeSport)
    .sort((a, b) => (a.sportName || '').localeCompare(b.sportName || '', 'vi'))
  const allCourtsLabel = activeSport ? `Tất cả sân ${activeSport}` : 'Tất cả sân'
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
        {sportNames.length > 1 && (
          <div className="snx-row" style={{ marginBottom: 12 }} role="group" aria-label="Lọc theo môn">
            <span className="snx-muted">Môn:</span>
            <button type="button" className="snx-chip" aria-pressed={!activeSport} onClick={() => setSport('')}>Tất cả ({allCourts.length || courtRows.length} sân)</button>
            {sportNames.map((name) => (
              <button key={name} type="button" className="snx-chip" aria-pressed={activeSport === name} onClick={() => setSport(name)}>
                {name} ({courtRows.filter((row) => row.sportName === name).length} sân)
              </button>
            ))}
          </div>
        )}
        {range.error && <div className="snx-alert snx-alert--error">{range.error}</div>}
        {availability.data && (
          <p className="snx-muted" style={{ margin: '0 0 8px', fontSize: 12.5 }}>
            Khách tìm sân hôm nay đặt được: <strong>{availability.data.availableSlots ?? 0}</strong> ca trống trên{' '}
            {(availability.data.courts || []).filter((c) => c.isBookable).length}/{(availability.data.courts || []).length} sân.
          </p>
        )}
        {r && activeSport && <p className="snx-muted" style={{ margin: '0 0 6px', fontSize: 12 }}>Số liệu dưới đây tính cho toàn cơ sở.</p>}
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
              <thead><tr><th>Sân</th>{days.map((d) => <th key={d.date}>{new Date(String(d.date).includes('T') ? d.date : `${d.date}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</th>)}</tr></thead>
              <tbody>
                {visibleRows.map((row, rowIndex) => (
                  <Fragment key={row.courtId}>
                  {!activeSport && sportNames.length > 1 && row.sportName !== visibleRows[rowIndex - 1]?.sportName && (
                    <tr><td colSpan={days.length + 1} style={{ background: 'var(--snx-green-50)', fontWeight: 700 }}>{row.sportName || 'Chưa rõ môn'}</td></tr>
                  )}
                  <tr>
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
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PricePeriodsCard facilityId={facilityId} courts={allCourts} onDone={refreshAll} />

      <div className="snx-grid snx-grid--2">
        <GenerateCard facilityId={facilityId} courts={scopedCourts} scoped={Boolean(activeSport)} allLabel={allCourtsLabel} onDone={refreshAll} />
        <BulkCard facilityId={facilityId} courts={scopedCourts} scoped={Boolean(activeSport)} allLabel={allCourtsLabel} onDone={refreshAll} />
      </div>

      {openDay && openCourt && <DaySlotsModal day={openDay} court={openCourt} onClose={() => setOpen(null)} onDeleted={refreshAll} />}
    </div>
  )
}
