import { useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import {
  addTournamentStaff, assignMatchCourt, assignMatchOfficials, autoScheduleTournament, blockCourts, decideRegistration,
  getCourtSchedule, getCourts, getFacilitySlots, getStandings, getTournamentStaff, releaseCourts, removeTournamentStaff, updateTournamentInfo, updateTournamentStaff,
} from '../../api/owner'
import { confirmDialog } from '../../components/common/confirm.js'
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

const STAFF_ROLES = [['REFEREE', 'Trọng tài'], ['SCORER', 'Ghi điểm'], ['OTHER', 'Khác']]
const STAFF_ROLE_LABEL = Object.fromEntries(STAFF_ROLES)

// Nhân sự giải: người có accountId (tài khoản SportNexus) nhập được tỉ số
function StaffSection({ tournamentId, staff, onChanged, closed }) {
  const [form, setForm] = useState({ fullName: '', phone: '', role: 'REFEREE', accountId: '', note: '' })
  // Đang sửa nhân sự nào (null = form đang thêm mới)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const startEdit = (m) => {
    setEditingId(m.id || m.staffId)
    setForm({ fullName: m.fullName || '', phone: m.phone || '', role: String(m.role || 'REFEREE').toUpperCase(), accountId: m.accountId || '', note: m.note || '' })
  }
  const cancelEdit = () => { setEditingId(null); setForm({ fullName: '', phone: '', role: 'REFEREE', accountId: '', note: '' }) }
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const submit = async (event) => {
    event.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim()) { toast.error('Nhập họ tên và số điện thoại.'); return }
    setBusy(true)
    try {
      const payload = {
        fullName: form.fullName.trim(), phone: form.phone.trim(), role: form.role,
        accountId: form.accountId.trim() || null, note: form.note.trim() || null,
      }
      if (editingId) await updateTournamentStaff(tournamentId, editingId, payload)
      else await addTournamentStaff(tournamentId, payload)
      toast.success(editingId ? 'Đã cập nhật nhân sự.' : 'Đã thêm nhân sự.')
      setEditingId(null)
      setForm({ fullName: '', phone: '', role: 'REFEREE', accountId: '', note: '' })
      onChanged()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async (member) => {
    if (!(await confirmDialog(`Xóa ${member.fullName} khỏi nhân sự giải?`))) return
    try {
      await removeTournamentStaff(tournamentId, member.id || member.staffId)
      toast.success('Đã xóa nhân sự.')
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <>
      <h3 className="snx-card-title" style={{ fontSize: 15, margin: '18px 0 8px' }}>Nhân sự giải ({staff.length})</h3>
      {staff.length > 0 && (
        <div className="snx-list" style={{ marginBottom: 10 }}>
          {staff.map((m) => (
            <div key={m.id || m.staffId} className="snx-list-item">
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{m.fullName}</strong> <span className="snx-badge snx-badge--blue">{STAFF_ROLE_LABEL[String(m.role).toUpperCase()] || m.role}</span>
                <div className="snx-muted">{m.phone}{m.accountId ? ' · Có tài khoản (nhập được tỉ số)' : ''}{m.note ? ` · ${m.note}` : ''}</div>
              </div>
              {!closed && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => startEdit(m)} disabled={busy}>Sửa</button>}
              {!closed && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => remove(m)}>Xóa</button>}
            </div>
          ))}
        </div>
      )}
      {!closed && (
        <form className="snx-form-grid" onSubmit={submit}>
          <label className="snx-field">Họ tên<input className="snx-input" maxLength={100} value={form.fullName} onChange={set('fullName')} /></label>
          <label className="snx-field">Số điện thoại<input className="snx-input" maxLength={15} value={form.phone} onChange={set('phone')} /></label>
          <label className="snx-field">Vai trò
            <select className="snx-select" value={form.role} onChange={set('role')}>{STAFF_ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
          <label className="snx-field">Mã tài khoản (không bắt buộc)<input className="snx-input" placeholder="accountId" value={form.accountId} onChange={set('accountId')} /></label>
          <label className="snx-field">Ghi chú<input className="snx-input" maxLength={200} value={form.note} onChange={set('note')} /></label>
          <div className="snx-field" style={{ justifyContent: 'flex-end', flexDirection: 'row', gap: 8 }}>
            {editingId && <button type="button" className="snx-btn snx-btn--secondary" onClick={cancelEdit} disabled={busy}>Hủy sửa</button>}
            <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>{editingId ? 'Lưu thay đổi' : 'Thêm nhân sự'}</button>
          </div>
        </form>
      )}
    </>
  )
}

// Bảng xếp hạng vòng bảng / vòng tròn
function StandingsSection({ childId }) {
  const standings = useApi(() => getStandings(childId), [childId], { initialData: [], enabled: !!childId })
  const groups = (standings.data || []).filter((g) => g?.rows?.length)
  if (!groups.length) return null
  return (
    <>
      <h3 className="snx-card-title" style={{ fontSize: 15, margin: '18px 0 8px' }}>Bảng xếp hạng</h3>
      {groups.map((g) => (
        <div key={g.group || 'all'} className="snx-table-wrap" style={{ marginBottom: 10 }}>
          <table className="snx-table">
            <thead><tr><th>{g.group ? `Bảng ${g.group}` : '#'}</th><th>Đấu thủ</th><th>Trận</th><th>T</th><th>H</th><th>B</th><th>HS</th><th>Điểm</th></tr></thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.participantId}><td>{r.rank}</td><td>{r.name}</td><td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td><td>{r.diff > 0 ? `+${r.diff}` : r.diff}</td><td><strong>{r.points}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  )
}

// Thiếu người khi hết hạn đăng ký: BTC chọn hủy / gia hạn / vẫn thi đấu trong 24 giờ
function RegistrationDecision({ tournamentId, onDone }) {
  const [decision, setDecision] = useState('EXTEND')
  const [newDeadline, setNewDeadline] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (decision === 'EXTEND' && !newDeadline) { toast.error('Chọn hạn đăng ký mới.'); return }
    if (decision === 'CANCEL' && !(await confirmDialog('Hủy bảng đấu và hoàn 100% lệ phí cho người đã đăng ký?'))) return
    setBusy(true)
    try {
      await decideRegistration(tournamentId, { decision, newDeadline: decision === 'EXTEND' ? new Date(newDeadline).toISOString() : null, reason: reason.trim() || null })
      toast.success('Đã ghi nhận quyết định.')
      onDone()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="snx-alert snx-alert--info" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, marginBottom: 16 }}>
      <strong>Hết hạn đăng ký nhưng chưa đủ người?</strong>
      <span>Chọn trong 24 giờ sau khi nhận thông báo: hủy (hoàn 100% lệ phí), gia hạn đăng ký hoặc vẫn thi đấu với số người hiện có (cần ≥ 2).</span>
      <div className="snx-row">
        <select className="snx-select" style={{ width: 'auto' }} value={decision} onChange={(e) => setDecision(e.target.value)}>
          <option value="EXTEND">Gia hạn đăng ký</option>
          <option value="CONTINUE">Vẫn thi đấu</option>
          <option value="CANCEL">Hủy bảng đấu</option>
        </select>
        {decision === 'EXTEND' && <input className="snx-input" style={{ width: 'auto' }} type="datetime-local" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} aria-label="Hạn đăng ký mới" />}
        <input className="snx-input" style={{ flex: '1 1 160px' }} placeholder="Lý do (không bắt buộc)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busy} onClick={submit}>Xác nhận</button>
      </div>
    </div>
  )
}

// Quản lý thêm cho giải đang chọn: sửa thông tin, giữ / trả sân, xếp sân, nhân sự, trọng tài, bảng xếp hạng.
// courtOnly: chủ sân xem giải người khác tổ chức tại sân mình, chỉ giữ / trả sân.
export default function TournamentManagePanel({ tournament, child, rounds, facilityId, onChanged, mode = 'owner', courtOnly = false }) {
  // Người chơi làm BTC không giữ / trả sân được (court-blocks chỉ dành cho chủ sân / Admin)
  const canBlockCourts = mode !== 'player'
  const [editing, setEditing] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const courts = useApi(() => getCourts(facilityId), [facilityId], { enabled: !!facilityId && canBlockCourts, initialData: [] })
  const schedule = useApi(() => getCourtSchedule(tournament.id), [tournament.id])
  const staff = useApi(() => getTournamentStaff(tournament.id), [tournament.id], { enabled: !courtOnly, initialData: [] })
  const referees = (staff.data || []).filter((m) => String(m.role).toUpperCase() === 'REFEREE')
  const [scheduling, setScheduling] = useState(false)
  const childStatus = String(child?.status || '').toUpperCase()
  const autoSchedule = async () => {
    setScheduling(true)
    try {
      await autoScheduleTournament(child?.id || tournament.id)
      toast.success('Đã tự xếp ca và đề xuất trọng tài cho các trận.')
      schedule.refresh()
      onChanged()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setScheduling(false)
    }
  }
  const setOfficial = async (match, staffId) => {
    try {
      await assignMatchOfficials(match.id, staffId ? [staffId] : [])
      toast.success(staffId ? 'Đã phân trọng tài.' : 'Đã bỏ trọng tài.')
      onChanged()
    } catch (error) {
      toast.error(error.message)
    }
  }
  const status = String(tournament.status || '').toUpperCase()
  const closed = ['CANCELLED', 'FINISHED'].includes(status)
  const matches = (rounds || []).flatMap((round) => round.matches || []).filter((m) => m.id)
  const blocks = schedule.data?.blocks || []

  return (
    <div className="snx-card" style={{ marginBottom: 24 }}>
      <div className="snx-row" style={{ marginBottom: 12 }}>
        <h2 className="snx-card-title">Quản lý giải & lịch sân</h2>
        <span className="snx-spacer" />
        {!closed && !courtOnly && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEditing(true)}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Sửa thông tin giải</button>}
      </div>
      <div className="snx-form-grid" style={{ marginBottom: 16 }}>
        <div><div className="snx-muted">Thi đấu</div><strong>{tournament.startDate ? `${formatDate(tournament.startDate)} – ${formatDate(tournament.endDate)}` : 'Chưa đặt ngày'}</strong></div>
        <div><div className="snx-muted">Hạn đăng ký</div><strong>{tournament.registrationDeadline ? formatDateTime(tournament.registrationDeadline) : '—'}</strong></div>
      </div>

      {!courtOnly && child && childStatus === 'OPEN' && <RegistrationDecision tournamentId={child.id} onDone={onChanged} />}

      {!closed && canBlockCourts && (
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

      {!courtOnly && child && matches.length > 0 && (
        <>
          <div className="snx-row" style={{ margin: '18px 0 8px' }}>
            <h3 className="snx-card-title" style={{ fontSize: 15 }}>Xếp sân & trọng tài ({child.name})</h3>
            <span className="snx-spacer" />
            {!closed && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={scheduling} onClick={autoSchedule}>{scheduling ? 'Đang xếp…' : 'Tự xếp ca + trọng tài'}</button>}
          </div>
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Vòng</th><th>Trận</th><th>Sân / giờ</th><th>Trọng tài</th><th /></tr></thead>
              <tbody>
                {matches.map((m) => {
                  const done = ['FINISHED', 'COMPLETED'].includes(String(m.status).toUpperCase())
                  return (
                    <tr key={m.id}>
                      <td>{m.roundName || `Vòng ${m.round}`}</td>
                      <td>{m.a?.name || 'Chờ xác định'} vs {m.b?.name || 'Chờ xác định'}</td>
                      <td>{m.court ? `${m.court} • ${formatDateTime(m.time)}` : <span className="snx-muted">Chưa xếp</span>}</td>
                      <td>
                        {!done && !closed && referees.length > 0 ? (
                          <select className="snx-select" style={{ minWidth: 140 }} defaultValue="" onChange={(e) => setOfficial(m, e.target.value)} aria-label="Phân trọng tài">
                            <option value="">— Chọn —</option>
                            {referees.map((r) => <option key={r.id || r.staffId} value={r.id || r.staffId}>{r.fullName}</option>)}
                          </select>
                        ) : <span className="snx-muted">{referees.length ? '—' : 'Chưa có trọng tài'}</span>}
                      </td>
                      <td>{!done && !closed && <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setAssigning(m)}>{m.court ? 'Đổi sân' : 'Xếp sân'}</button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!courtOnly && child && <StandingsSection key={`${child.id}|${matches.length}|${matches.filter((m) => m.winnerId || m.isDraw).length}`} childId={child.id} />}

      {!courtOnly && <StaffSection tournamentId={tournament.id} staff={staff.data || []} onChanged={staff.refresh} closed={closed} />}

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
