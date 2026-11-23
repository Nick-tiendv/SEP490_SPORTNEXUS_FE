import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { confirmDialog } from '../../components/common/confirm.js'
import { createPricePeriod, deletePricePeriod, getPricePeriods, updatePricePeriod } from '../../api/owner'
import { addDays, formatDate, formatVND, toDateKey, toTimeSpan } from '../shared.js'

// Tuần lễ vàng / giá ngày đặc biệt: chủ sân đặt GIÁ CỐ ĐỊNH mỗi ca cho một khoảng ngày (lễ, sale, phụ thu Tết).
// BE đổi giá các ca trống trong đợt, ca đã có khách giữ nguyên, ca sinh sau cũng theo giá đợt.
const EMPTY = { name: '', fromDate: '', toDate: '', courtIds: [], startTime: '', endTime: '', price: '' }

// BE chưa có API (404 / 405) thì báo đang chờ, không coi là lỗi của chủ sân
const isMissingApi = (error) => error?.status === 404 || error?.status === 405

function PeriodForm({ courts, initial, busy, onCancel, onSubmit }) {
  const today = toDateKey()
  const [form, setForm] = useState(initial)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const toggleCourt = (id) => setForm({ ...form, courtIds: form.courtIds.includes(id) ? form.courtIds.filter((x) => x !== id) : [...form.courtIds, id] })

  const submit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return toast.error('Vui lòng đặt tên đợt (vd: Phụ thu Tết, Sale cuối năm).')
    if (!form.fromDate || !form.toDate) return toast.error('Vui lòng chọn từ ngày và đến ngày.')
    if (form.toDate < form.fromDate) return toast.error('Đến ngày phải từ ngày bắt đầu trở đi.')
    if ((form.startTime && !form.endTime) || (!form.startTime && form.endTime)) return toast.error('Nhập đủ cả giờ bắt đầu và giờ kết thúc, hoặc để trống cả hai (cả ngày).')
    if (form.startTime && form.endTime <= form.startTime) return toast.error('Giờ kết thúc phải sau giờ bắt đầu.')
    const price = Number(form.price)
    if (!(price > 0)) return toast.error('Vui lòng nhập giá mỗi ca.')
    onSubmit({
      name: form.name.trim(),
      fromDate: form.fromDate,
      toDate: form.toDate,
      courtIds: form.courtIds.length ? form.courtIds : null,
      startTime: toTimeSpan(form.startTime),
      endTime: toTimeSpan(form.endTime),
      price,
    })
  }

  return (
    <form className="snx-stack" style={{ gap: 12, padding: 12, borderRadius: 12, border: '1px solid var(--snx-border, #e2e8f0)' }} onSubmit={submit}>
      <div className="snx-form-grid">
        <label className="snx-field">Tên đợt<input className="snx-input" maxLength={100} placeholder="VD: Phụ thu Tết, Sale cuối năm" value={form.name} onChange={set('name')} /></label>
        <label className="snx-field">Giá mỗi ca (đ)<input className="snx-input" type="number" min={1000} step={1000} placeholder="VD: 130000" value={form.price} onChange={set('price')} /></label>
        <label className="snx-field">Từ ngày<input className="snx-input" type="date" min={today} value={form.fromDate} onChange={set('fromDate')} /></label>
        <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.fromDate || today} value={form.toDate} onChange={set('toDate')} /></label>
        <label className="snx-field">Từ giờ (trống = cả ngày)<input className="snx-input" type="time" value={form.startTime} onChange={set('startTime')} /></label>
        <label className="snx-field">Đến giờ<input className="snx-input" type="time" value={form.endTime} onChange={set('endTime')} /></label>
      </div>
      <div className="snx-row">
        <button type="button" className="snx-chip" aria-pressed={!form.courtIds.length} onClick={() => setForm({ ...form, courtIds: [] })}>Tất cả sân</button>
        {courts.map((c) => {
          const id = String(c.id)
          return <button key={id} type="button" className="snx-chip" aria-pressed={form.courtIds.includes(id)} onClick={() => toggleCourt(id)}>{c.name}</button>
        })}
      </div>
      <p className="snx-muted" style={{ margin: 0, fontSize: 12.5 }}>Áp dụng cho các ca còn trống trong đợt; ca đã có khách đặt giữ nguyên giá cũ.</p>
      <div className="snx-row">
        <span className="snx-spacer" />
        <button type="button" className="snx-btn snx-btn--ghost" onClick={onCancel} disabled={busy}>Hủy</button>
        <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu đợt giá'}</button>
      </div>
    </form>
  )
}

export default function PricePeriodsCard({ facilityId, courts, onDone }) {
  const [reload, setReload] = useState(0)
  const [state, setState] = useState({ key: '', items: [], error: null })
  const [editing, setEditing] = useState(null) // null | { id?, form }
  const [busy, setBusy] = useState(false)
  const key = `${facilityId}|${reload}`

  useEffect(() => {
    let cancelled = false
    getPricePeriods(facilityId, { from: toDateKey() })
      .then((items) => !cancelled && setState({ key, items: items.sort((a, b) => a.fromDate.localeCompare(b.fromDate)), error: null }))
      .catch((error) => !cancelled && setState({ key, items: [], error }))
    return () => { cancelled = true }
  }, [facilityId, key])

  const loading = state.key !== key
  const missingApi = isMissingApi(state.error)
  const courtName = (id) => courts.find((c) => String(c.id) === id)?.name || 'Sân đã xóa'
  const done = () => { setEditing(null); setReload((v) => v + 1); onDone?.() }

  const save = async (payload) => {
    setBusy(true)
    try {
      const r = editing?.id ? await updatePricePeriod(facilityId, editing.id, payload) : await createPricePeriod(facilityId, payload)
      const detail = r && (r.updatedSlots != null || r.skippedBookedSlots != null)
        ? ` Đã đổi giá ${r.updatedSlots ?? 0} ca trống, giữ nguyên ${r.skippedBookedSlots ?? 0} ca đã có khách.`
        : ''
      toast.success(`${editing?.id ? 'Đã cập nhật' : 'Đã tạo'} đợt "${payload.name}".${detail}`)
      done()
    } catch (error) {
      toast.error(isMissingApi(error) ? 'Hệ thống chưa hỗ trợ lưu đợt giá (đang chờ cập nhật).' : error.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (period) => {
    if (!(await confirmDialog(`Xóa đợt "${period.name}"? Các ca còn trống trong đợt sẽ trở về giá thường.`))) return
    try {
      await deletePricePeriod(facilityId, period.id)
      toast.success(`Đã xóa đợt "${period.name}".`)
      done()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const today = toDateKey()
  const startNew = () => setEditing({ form: { ...EMPTY, fromDate: today, toDate: addDays(today, 2) } })
  const startEdit = (p) => setEditing({ id: p.id, form: { name: p.name, fromDate: p.fromDate, toDate: p.toDate, courtIds: p.courtIds, startTime: p.startTime, endTime: p.endTime, price: String(p.price) } })

  return (
    <div className="snx-card">
      <div className="snx-row">
        <div>
          <h2 className="snx-card-title">Tuần lễ vàng / Giá ngày đặc biệt</h2>
          <p className="snx-card-subtitle">Đặt giá riêng cho vài ngày: sale dịp lễ, cuối năm hoặc phụ thu Tết. Người chơi thấy tên đợt trên ca.</p>
        </div>
        <span className="snx-spacer" />
        {!editing && !missingApi && <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={startNew}>+ Tạo đợt giá</button>}
      </div>

      <div className="snx-stack" style={{ gap: 10, marginTop: 12 }}>
        {editing && <PeriodForm key={editing.id || 'new'} courts={courts} initial={editing.form} busy={busy} onCancel={() => setEditing(null)} onSubmit={save} />}

        {loading ? <p className="snx-muted">Đang tải đợt giá…</p>
          : missingApi ? <div className="snx-alert snx-alert--info">Tính năng đang chờ hệ thống cập nhật, sẽ dùng được khi hoàn tất.</div>
          : state.error ? <div className="snx-alert snx-alert--error">{state.error.message}</div>
          : !state.items.length ? <p className="snx-muted" style={{ margin: 0 }}>Chưa có đợt giá nào sắp diễn ra.</p>
          : (
            <div className="snx-table-wrap">
              <table className="snx-table">
                <thead><tr><th>Đợt</th><th>Thời gian</th><th>Khung giờ</th><th>Sân</th><th>Giá mỗi ca</th><th /></tr></thead>
                <tbody>
                  {state.items.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{formatDate(p.fromDate)} – {formatDate(p.toDate)}</td>
                      <td>{p.startTime && p.endTime ? `${p.startTime} – ${p.endTime}` : 'Cả ngày'}</td>
                      <td>{p.courtIds.length ? p.courtIds.map(courtName).join(', ') : 'Tất cả sân'}</td>
                      <td><strong>{formatVND(p.price)}</strong></td>
                      <td>
                        <div className="snx-row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                          <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => startEdit(p)}>Sửa</button>
                          <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => remove(p)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
