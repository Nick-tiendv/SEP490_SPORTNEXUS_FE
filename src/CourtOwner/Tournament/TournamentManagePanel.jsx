import { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { assignMatchCourt, blockCourts, getCourtSchedule, getCourts, getFacilitySlots, releaseCourts, updateTournamentInfo } from '../../api/owner'
import { uploadImage } from '../../api/player/uploadApi.js'
import { addDays, formatDate, formatDateTime, formatTime, toDateKey, toTimeSpan } from '../shared.js'

// Ngày ISO -> giá trị cho <input type="date">.
const dateInput = (value) => (value ? toDateKey(value) : '')

function EditInfoModal({ tournament, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: tournament.name || '',
    startDate: dateInput(tournament.startDate),
    endDate: dateInput(tournament.endDate),
    registrationDeadline: dateInput(tournament.registrationDeadline),
    imageUrl: tournament.imageUrl || '',
    rules: tournament.rules || '',
  })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      setForm((prev) => ({ ...prev, imageUrl: '' }))
      const url = await uploadImage(file, 'tournament')
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (error) {
      toast.error(error.message || 'Không tải được ảnh.')
    } finally {
      setUploading(false)
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên giải.'); return }
    if (form.startDate && form.endDate && form.endDate < form.startDate) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (form.registrationDeadline && form.startDate && form.registrationDeadline > form.startDate) { toast.error('Hạn đăng ký phải trước ngày thi đấu.'); return }
    setBusy(true)
    try {
      // Field null thì BE giữ nguyên.
      await updateTournamentInfo(tournament.id, {
        name: form.name.trim(),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        registrationDeadline: form.registrationDeadline || null,
        imageUrl: form.imageUrl || null,
        rules: form.rules.trim() || null,
      })
      toast.success('Đã lưu thông tin giải.')
      onSaved()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="edit-tournament-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <h2 id="edit-tournament-title" className="snx-card-title">Sửa thông tin giải</h2>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack" style={{ gap: 12 }}>
          <label className="snx-field">Tên giải<input className="snx-input" maxLength={200} value={form.name} onChange={set('name')} /></label>
          <div className="snx-form-grid">
            <label className="snx-field">Ngày bắt đầu<input className="snx-input" type="date" value={form.startDate} onChange={set('startDate')} /></label>
            <label className="snx-field">Ngày kết thúc<input className="snx-input" type="date" min={form.startDate} value={form.endDate} onChange={set('endDate')} /></label>
            <label className="snx-field">Hạn đăng ký<input className="snx-input" type="date" max={form.startDate || undefined} value={form.registrationDeadline} onChange={set('registrationDeadline')} /></label>
          </div>
          <div className="snx-field">Ảnh bìa
            <div className="snx-row">
              {form.imageUrl && <img src={form.imageUrl} alt="Ảnh bìa giải" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />}
              <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
                {uploading ? 'Đang tải…' : form.imageUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(e) => { upload(e.target.files[0]); e.target.value = '' }} />
              </label>
            </div>
          </div>
          <label className="snx-field">Điều lệ giải<textarea className="snx-textarea" rows={4} maxLength={4000} value={form.rules} onChange={set('rules')} /></label>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy || uploading}>Lưu</button>
        </div>
      </form>
    </div>
  )
}

function CourtBlockForm({ tournamentId, courts, onDone }) {
  const today = toDateKey()
  const [form, setForm] = useState({ courtIds: [], dateFrom: today, dateTo: today, startTime: '', endTime: '' })
  const [busy, setBusy] = useState('')
  const [conflicts, setConflicts] = useState([])
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const run = async (mode) => {
    if (form.dateTo < form.dateFrom) { toast.error('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    if (mode === 'block' && !form.courtIds.length) { toast.error('Chọn ít nhất 1 sân để giữ.'); return }
    const body = {
      courtIds: form.courtIds.length ? form.courtIds : null,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      startTime: toTimeSpan(form.startTime),
      endTime: toTimeSpan(form.endTime),
    }
    setBusy(mode)
    try {
      const r = mode === 'block' ? await blockCourts(tournamentId, body) : await releaseCourts(tournamentId, body)
      setConflicts(r?.conflicts || [])
      toast.success(mode === 'block'
        ? `Đã giữ ${r?.blockedSlots ?? 0} ca (đã giữ trước đó ${r?.alreadyBlockedSlots ?? 0}).`
        : `Đã trả ${r?.blockedSlots ?? r?.matchedSlots ?? 0} ca cho khách đặt.`)
      onDone()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="snx-stack" style={{ gap: 10 }}>
      <div className="snx-row">
        {courts.map((c) => {
          const id = String(c.id)
          const on = form.courtIds.includes(id)
          return <button key={id} type="button" className="snx-chip" aria-pressed={on} onClick={() => setForm({ ...form, courtIds: on ? form.courtIds.filter((x) => x !== id) : [...form.courtIds, id] })}>{c.name}</button>
        })}
      </div>
      <div className="snx-form-grid">
        <label className="snx-field">Từ ngày<input className="snx-input" type="date" value={form.dateFrom} onChange={set('dateFrom')} /></label>
        <label className="snx-field">Đến ngày<input className="snx-input" type="date" min={form.dateFrom} value={form.dateTo} onChange={set('dateTo')} /></label>
        <label className="snx-field">Từ giờ<input className="snx-input" type="time" value={form.startTime} onChange={set('startTime')} /></label>
        <label className="snx-field">Đến giờ<input className="snx-input" type="time" value={form.endTime} onChange={set('endTime')} /></label>
      </div>
      <div className="snx-row">
        <span className="snx-muted">Trả ca: bỏ trống sân và giờ = trả mọi ca chưa tới giờ đang giữ.</span>
        <span className="snx-spacer" />
        <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={!!busy} onClick={() => run('release')}>Trả ca</button>
        <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={!!busy} onClick={() => run('block')}>Giữ sân cho giải</button>
      </div>
      {conflicts.length > 0 && (
        <div className="snx-alert snx-alert--error" style={{ flexDirection: 'column' }}>
          <strong>{conflicts.length} ca không giữ được:</strong>
          {conflicts.slice(0, 8).map((c) => <span key={c.slotId}>{c.courtName} {formatDateTime(c.startTime)}: {c.reason}</span>)}
        </div>
      )}
    </div>
  )
}

function AssignCourtModal({ match, tournamentId, facilityId, onClose, onAssigned }) {
  const [date, setDate] = useState(match.time ? toDateKey(match.time) : toDateKey())
  const [slotId, setSlotId] = useState('')
  const [busy, setBusy] = useState(false)
  const day = useApi(() => getFacilitySlots(facilityId, date), [facilityId, date])
  // Chỉ ca chưa qua: ca đã giữ cho giải này hoặc ca còn trống.
  const options = (day.data?.courts || []).flatMap((c) => (c.slots || [])
    .filter((s) => !s.isPast && !s.bookingId && !s.matchId && (String(s.tournamentId || '') === String(tournamentId) || String(s.status).toUpperCase() === 'AVAILABLE'))
    .map((s) => ({ ...s, courtName: c.courtName, reserved: String(s.tournamentId || '') === String(tournamentId) })))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const submit = async (event) => {
    event.preventDefault()
    if (!slotId) { toast.error('Chọn một ca sân.'); return }
    setBusy(true)
    try {
      const r = await assignMatchCourt(match.id, slotId)
      toast.success(`Đã xếp ${r?.courtName || 'sân'} lúc ${formatDateTime(r?.startTime)}.`)
      onAssigned()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="assign-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="assign-title" className="snx-card-title">Xếp sân cho trận</h2>
            <p className="snx-card-subtitle">{match.roundName ? `${match.roundName}: ` : ''}{match.a?.name || 'Chờ xác định'} vs {match.b?.name || 'Chờ xác định'}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack" style={{ gap: 12 }}>
          <div className="snx-row">
            <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => { setDate(addDays(date, -1)); setSlotId('') }} aria-label="Ngày trước"><span className="material-symbols-outlined">chevron_left</span></button>
            <input className="snx-input" style={{ width: 'auto' }} type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlotId('') }} aria-label="Ngày thi đấu" />
            <button type="button" className="snx-btn snx-btn--secondary snx-btn--icon" onClick={() => { setDate(addDays(date, 1)); setSlotId('') }} aria-label="Ngày sau"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
          {day.error && <div className="snx-alert snx-alert--error">{day.error}</div>}
          {day.loading ? <p className="snx-muted">Đang tải ca…</p> : options.length === 0 ? (
            <div className="snx-empty">Không có ca trống trong ngày này.</div>
          ) : (
            <div className="snx-list" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {options.map((s) => (
                <label key={s.id} className="snx-list-item" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="slot" value={s.id} checked={slotId === String(s.id)} onChange={() => setSlotId(String(s.id))} />
                  <strong>{formatTime(s.startTime)} – {formatTime(s.endTime)}</strong>
                  <span>{s.courtName}</span>
                  <span className="snx-spacer" />
                  {s.reserved ? <span className="snx-badge snx-badge--amber">Đã giữ cho giải</span> : <span className="snx-badge snx-badge--green">Còn trống</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy || !slotId}>Xếp sân</button>
        </div>
      </form>
    </div>
  )
}

// Quản lý thêm cho giải đang chọn: sửa thông tin, giữ / trả sân, xếp sân cho trận.
export default function TournamentManagePanel({ tournament, child, rounds, facilityId, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const courts = useApi(() => getCourts(facilityId), [facilityId], { enabled: !!facilityId, initialData: [] })
  const schedule = useApi(() => getCourtSchedule(tournament.id), [tournament.id])
  const status = String(tournament.status || '').toUpperCase()
  const closed = ['CANCELLED', 'FINISHED'].includes(status)
  const matches = (rounds || []).flatMap((round) => round.matches || []).filter((m) => m.id)
  const blocks = schedule.data?.blocks || []

  return (
    <div className="snx-card" style={{ marginBottom: 24 }}>
      <div className="snx-row" style={{ marginBottom: 12 }}>
        <h2 className="snx-card-title">Quản lý giải & lịch sân</h2>
        <span className="snx-spacer" />
        {!closed && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEditing(true)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Sửa thông tin giải</button>}
      </div>
      <div className="snx-form-grid" style={{ marginBottom: 16 }}>
        <div><div className="snx-muted">Thi đấu</div><strong>{tournament.startDate ? `${formatDate(tournament.startDate)} – ${formatDate(tournament.endDate)}` : 'Chưa đặt ngày'}</strong></div>
        <div><div className="snx-muted">Hạn đăng ký</div><strong>{tournament.registrationDeadline ? formatDateTime(tournament.registrationDeadline) : '—'}</strong></div>
      </div>

      {!closed && (
        <>
          <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 8 }}>Giữ khung giờ sân cho giải</h3>
          <CourtBlockForm tournamentId={tournament.id} courts={courts.data || []} onDone={schedule.refresh} />
        </>
      )}

      <h3 className="snx-card-title" style={{ fontSize: 15, margin: '18px 0 8px' }}>Khung giờ đang giữ ({blocks.length})</h3>
      {schedule.error && <div className="snx-alert snx-alert--error">{schedule.error}</div>}
      {blocks.length === 0 ? <p className="snx-muted">Chưa giữ khung giờ nào.</p> : (
        <div className="snx-row">
          {blocks.map((b) => <span key={`${b.courtId}|${b.startTime}`} className="snx-badge snx-badge--amber">{b.courtName}: {formatDateTime(b.startTime)} – {formatTime(b.endTime)} ({b.slotCount} ca)</span>)}
        </div>
      )}

      {child && matches.length > 0 && (
        <>
          <h3 className="snx-card-title" style={{ fontSize: 15, margin: '18px 0 8px' }}>Xếp sân cho trận ({child.name})</h3>
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Vòng</th><th>Trận</th><th>Sân / giờ</th><th /></tr></thead>
              <tbody>
                {matches.map((m) => {
                  const done = ['FINISHED', 'COMPLETED'].includes(String(m.status).toUpperCase())
                  return (
                    <tr key={m.id}>
                      <td>{m.roundName || `Vòng ${m.round}`}</td>
                      <td>{m.a?.name || 'Chờ xác định'} vs {m.b?.name || 'Chờ xác định'}</td>
                      <td>{m.court ? `${m.court} • ${formatDateTime(m.time)}` : <span className="snx-muted">Chưa xếp</span>}</td>
                      <td>{!done && !closed && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setAssigning(m)}>{m.court ? 'Đổi sân' : 'Xếp sân'}</button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && <EditInfoModal tournament={tournament} onClose={() => setEditing(false)} onSaved={onChanged} />}
      {assigning && (
        <AssignCourtModal
          match={assigning}
          tournamentId={tournament.id}
          facilityId={facilityId}
          onClose={() => setAssigning(null)}
          onAssigned={() => { schedule.refresh(); onChanged() }}
        />
      )}
    </div>
  )
}
