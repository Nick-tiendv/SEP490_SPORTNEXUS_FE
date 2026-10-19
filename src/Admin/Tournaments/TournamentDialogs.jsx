import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { addParticipant, cancelTournament, checkInParticipant, createTournament, generateBracket, lockTournament, randomPairing, removeParticipant, unlockTournament, updateMatchScore } from '../../api/admin/tournamentApi.js'
import { categoryTypeLabels, sportLabels, date } from './tournamentData.js'

const noop = () => {}
// Chạy một thao tác API trong hộp thoại: quản lý trạng thái đang gửi và lỗi.
function useSubmit(onDone) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const run = async (task, message) => {
    setSubmitting(true); setError('')
    try { await task(); onDone(message) } catch (err) { setError(err.message); setSubmitting(false) }
  }
  return { submitting, error, setError, run }
}

const emptyChild = () => ({ name: '', categoryType: '0', maxParticipants: '16', entryFee: '0', prizes: [{ position: '1', rewardAmount: '' }] })

// POST /api/v1/tournaments — CreateTournamentRequest.
export function TournamentForm({ facilities, sports, onClose, onDone }) {
  const [values, setValues] = useState({ name: '', facilityId: facilities[0]?.id || '', categoryId: sports[0]?.id || '' })
  const [children, setChildren] = useState([emptyChild()])
  const { submitting, error, setError, run } = useSubmit(onDone)
  const setChild = (index, key, value) => setChildren(previous => previous.map((child, i) => (i === index ? { ...child, [key]: value } : child)))
  const setPrize = (index, prizeIndex, key, value) => setChildren(previous => previous.map((child, i) => (i === index ? { ...child, prizes: child.prizes.map((prize, p) => (p === prizeIndex ? { ...prize, [key]: value } : prize)) } : child)))
  const submit = event => {
    event.preventDefault()
    if (values.name.trim().length < 3) return setError('Tên giải phải có ít nhất 3 ký tự.')
    if (!values.facilityId || !values.categoryId) return setError('Vui lòng chọn cơ sở và môn thể thao.')
    const payloadChildren = []
    for (const child of children) {
      const maxParticipants = Number(child.maxParticipants), entryFee = Number(child.entryFee)
      if (child.name.trim().length < 2) return setError('Mỗi hạng mục cần tên (ví dụ: Đơn nam).')
      if (!Number.isInteger(maxParticipants) || maxParticipants < 2 || maxParticipants > 256) return setError('Số người tối đa phải là số nguyên từ 2 đến 256.')
      if (!Number.isFinite(entryFee) || entryFee < 0) return setError('Phí tham gia phải lớn hơn hoặc bằng 0.')
      const prizes = child.prizes.filter(prize => prize.position.trim() && prize.rewardAmount !== '').map(prize => ({ position: prize.position.trim(), rewardAmount: Number(prize.rewardAmount) }))
      if (prizes.some(prize => !Number.isFinite(prize.rewardAmount) || prize.rewardAmount < 0)) return setError('Giá trị giải thưởng phải lớn hơn hoặc bằng 0.')
      payloadChildren.push({ name: child.name.trim(), categoryType: Number(child.categoryType), maxParticipants, entryFee, prizes })
    }
    run(() => createTournament({ name: values.name.trim(), facilityId: values.facilityId, categoryId: values.categoryId, children: payloadChildren }), `Đã tạo giải ${values.name.trim()}.`)
  }
  const row = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }
  return <DemoDialog title="Tạo giải đấu" onClose={submitting ? noop : onClose}><form className="users-form" noValidate onSubmit={submit}>
    <label>Tên giải đấu<input value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} maxLength={120} required /></label>
    <label>Cơ sở<select value={values.facilityId} onChange={event => setValues({ ...values, facilityId: event.target.value })} disabled={!facilities.length}>{facilities.length ? facilities.map(facility => <option key={facility.id} value={facility.id}>{facility.name}</option>) : <option>Chưa có cơ sở</option>}</select></label>
    <label>Môn thể thao<select value={values.categoryId} onChange={event => setValues({ ...values, categoryId: event.target.value })} disabled={!sports.length}>{sports.length ? sports.map(sport => <option key={sport.id} value={sport.id}>{sportLabels[sport.name] || sport.name}</option>) : <option>Chưa có môn</option>}</select></label>
    {children.map((child, index) => <fieldset key={index} style={{ border: '1px solid var(--admin-border-color, #dfe7e2)', borderRadius: 8, padding: 10 }}><legend>Hạng mục {index + 1}{children.length > 1 && <button type="button" className="tournaments-text-button" onClick={() => setChildren(children.filter((_, i) => i !== index))} aria-label={`Xóa hạng mục ${index + 1}`}><Trash2 size={12} /></button>}</legend>
      <div style={row}><label>Tên hạng mục<input value={child.name} onChange={event => setChild(index, 'name', event.target.value)} placeholder="Đơn nam" maxLength={80} /></label><label>Loại<select value={child.categoryType} onChange={event => setChild(index, 'categoryType', event.target.value)}>{Object.entries(categoryTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
      <div style={row}><label>Số người tối đa<input type="number" min={2} step={1} value={child.maxParticipants} onChange={event => setChild(index, 'maxParticipants', event.target.value)} /></label><label>Phí tham gia (đ)<input type="number" min={0} step={1000} value={child.entryFee} onChange={event => setChild(index, 'entryFee', event.target.value)} /></label></div>
      {child.prizes.map((prize, prizeIndex) => <div key={prizeIndex} style={row}><label>Hạng<input value={prize.position} onChange={event => setPrize(index, prizeIndex, 'position', event.target.value)} maxLength={20} /></label><label>Tiền thưởng (đ)<input type="number" min={0} step={1000} value={prize.rewardAmount} onChange={event => setPrize(index, prizeIndex, 'rewardAmount', event.target.value)} /></label></div>)}
      <button type="button" className="tournaments-text-button" onClick={() => setChild(index, 'prizes', [...child.prizes, { position: String(child.prizes.length + 1), rewardAmount: '' }])}><Plus size={12} />Thêm giải thưởng</button>
    </fieldset>)}
    <button type="button" className="users-button" onClick={() => setChildren([...children, emptyChild()])}><Plus size={12} />Thêm hạng mục</button>
    {error && <p className="users-form-error" role="alert">{error}</p>}<footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang tạo…' : 'Tạo giải đấu'}</button></footer>
  </form></DemoDialog>
}

const actions = {
  generate: { title: 'Tạo nhánh đấu', button: 'Xác nhận', task: context => generateBracket(context.targetId), message: () => 'Đã tạo nhánh đấu.' },
  pair: { title: 'Bốc thăm ngẫu nhiên', button: 'Xác nhận', task: context => randomPairing(context.targetId), message: () => 'Đã bốc thăm ngẫu nhiên.' },
  cancel: { title: 'Xác nhận hủy giải', button: 'Xác nhận hủy giải', danger: true, reason: true, task: (context, reason) => cancelTournament(context.tournament.id, reason), message: context => `Đã hủy giải ${context.tournament.name}.` },
  lock: { title: 'Khóa giải đấu', button: 'Khóa giải', danger: true, reason: true, task: (context, reason) => lockTournament(context.tournament.id, reason), message: context => `Đã khóa giải ${context.tournament.name}.` },
  unlock: { title: 'Mở khóa giải đấu', button: 'Mở khóa', task: context => unlockTournament(context.tournament.id), message: context => `Đã mở khóa giải ${context.tournament.name}.` },
}
const explanation = (type, context) => ({
  generate: context.hasBracket ? 'Đã có nhánh đấu. Tạo lại có thể thay thế nhánh đấu và kết quả hiện tại.' : `Tạo nhánh đấu từ ${context.participants.length} người tham gia hiện có.`,
  pair: `Xáo trộn ngẫu nhiên thứ tự ${context.participants.length} người tham gia để xếp cặp.`,
  cancel: 'Hủy toàn bộ giải đấu. Việc hoàn phí cho người đã đăng ký do backend xử lý theo chính sách hiện hành.',
  lock: 'Khóa giải để tạm dừng hoạt động (ví dụ nội dung chưa rõ ràng, có báo cáo vi phạm). Ban tổ chức sẽ thấy lý do khóa.',
  unlock: context.tournament.lockReason ? `Lý do khóa trước đó: ${context.tournament.lockReason}` : 'Cho phép giải hoạt động trở lại.',
}[type])

// generate-bracket / execute-random-pairing (API giải đấu) · cancel / lock / unlock (PATCH /api/v1/admin/tournaments/{id}/…).
export function TournamentActionDialog({ type, context, onClose, onDone }) {
  const action = actions[type]
  const [reason, setReason] = useState('')
  const { submitting, error, setError, run } = useSubmit(onDone)
  const name = ['cancel', 'lock', 'unlock'].includes(type) ? context.tournament.name : context.targetName
  const confirm = () => {
    if (action.reason && !reason.trim()) return setError('Vui lòng nhập lý do.')
    run(() => action.task(context, reason.trim()), action.message(context))
  }
  return <DemoDialog title={action.title} onClose={submitting ? noop : onClose}>
    <p><strong>{name}</strong></p>
    <p className="tournaments-dialog-explanation">{explanation(type, context)}</p>
    {action.reason && <div className="users-form"><label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder={type === 'lock' ? 'Ví dụ: Nội dung giới thiệu giải chưa rõ ràng…' : 'Ví dụ: Không đủ người đăng ký…'} /></label></div>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Giữ nguyên</button><button className={`users-button ${action.danger ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting}>{submitting ? 'Đang xử lý…' : action.button}</button></footer>
  </DemoDialog>
}

// POST /api/v1/tournaments/{id}/participants — theo số điện thoại hoặc mã tài khoản / đội.
export function AddParticipantDialog({ context, onClose, onDone }) {
  const [mode, setMode] = useState('phone')
  const [value, setValue] = useState('')
  const { submitting, error, setError, run } = useSubmit(onDone)
  const submit = event => {
    event.preventDefault()
    const input = value.trim()
    if (mode === 'phone' && !/^[+\d\s()-]{7,20}$/.test(input)) return setError('Số điện thoại không hợp lệ.')
    if (mode !== 'phone' && !/^[0-9a-f-]{36}$/i.test(input)) return setError('Mã phải là UUID (36 ký tự).')
    run(() => addParticipant(context.targetId, { [mode === 'phone' ? 'phone' : mode === 'user' ? 'userId' : 'teamId']: input }), 'Đã thêm người tham gia.')
  }
  return <DemoDialog title="Thêm người tham gia" onClose={submitting ? noop : onClose}><form className="users-form" onSubmit={submit}>
    <p>{context.targetName}</p>
    <label>Thêm theo<select value={mode} onChange={event => { setMode(event.target.value); setValue('') }}><option value="phone">Số điện thoại</option><option value="user">Mã tài khoản (userId)</option><option value="team">Mã đội (teamId)</option></select></label>
    <label>{mode === 'phone' ? 'Số điện thoại' : mode === 'user' ? 'userId' : 'teamId'}<input value={value} onChange={event => setValue(event.target.value)} type={mode === 'phone' ? 'tel' : 'text'} required /></label>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang thêm…' : 'Thêm'}</button></footer>
  </form></DemoDialog>
}

// Xem người tham gia, check-in (POST /check-in) hoặc xóa (DELETE /participants/{id}).
export function ParticipantDialog({ context, onClose, onDone }) {
  const { participant } = context
  const [confirmRemove, setConfirmRemove] = useState(false)
  const { submitting, error, run } = useSubmit(onDone)
  return <DemoDialog title="Thông tin người tham gia" onClose={submitting ? noop : onClose}>
    <div className="tournaments-player"><UserAvatar user={participant} /><div><strong>{participant.name}</strong><small>{[participant.seed != null && `Hạt giống ${participant.seed}`, participant.phone].filter(Boolean).join(' · ')}</small></div></div>
    {participant.registered && <p>Ngày đăng ký: {date(participant.registered)}.</p>}
    <p>Thanh toán: {participant.paid ? 'Đã thanh toán' : 'Chưa thanh toán'} · Check-in: {participant.checkedIn ? 'Đã check-in' : 'Chưa check-in'}.</p>
    {confirmRemove && <p className="users-form-error">Xóa {participant.name} khỏi {context.targetName}? Bấm “Xác nhận xóa” để tiếp tục.</p>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Đóng</button>
      {!participant.checkedIn && <button className="users-button primary" disabled={submitting} onClick={() => run(() => checkInParticipant(context.targetId, participant.id), `Đã check-in cho ${participant.name}.`)}>Check-in</button>}
      <button className="users-button users-danger" disabled={submitting} onClick={() => (confirmRemove ? run(() => removeParticipant(context.targetId, participant.id), `Đã xóa ${participant.name} khỏi giải.`) : setConfirmRemove(true))}>{confirmRemove ? 'Xác nhận xóa' : 'Xóa khỏi giải'}</button>
    </footer>
  </DemoDialog>
}

// PUT /api/v1/matches/{matchId}/score
export function ScoreDialog({ context, onClose, onDone }) {
  const { match } = context
  const [values, setValues] = useState({ a: match.scoreA ?? '', b: match.scoreB ?? '', winner: match.winnerId || '' })
  const { submitting, error, setError, run } = useSubmit(onDone)
  const submit = event => {
    event.preventDefault()
    const a = Number(values.a), b = Number(values.b)
    if (values.a === '' || values.b === '' || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return setError('Tỷ số phải là số nguyên không âm.')
    const winnerId = values.winner || (a > b ? match.a.id : b > a ? match.b.id : '')
    run(() => updateMatchScore(match.id, { scoreP1: a, scoreP2: b, winnerId }), 'Đã cập nhật tỷ số.')
  }
  return <DemoDialog title="Cập nhật tỷ số" onClose={submitting ? noop : onClose}><form className="users-form" onSubmit={submit}>
    <p>{match.roundLabel || ''} · {match.a.name} — {match.b.name}</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><label>{match.a.name || 'Bên 1'}<input type="number" min={0} step={1} value={values.a} onChange={event => setValues({ ...values, a: event.target.value })} required /></label><label>{match.b.name || 'Bên 2'}<input type="number" min={0} step={1} value={values.b} onChange={event => setValues({ ...values, b: event.target.value })} required /></label></div>
    <label>Người thắng<select value={values.winner} onChange={event => setValues({ ...values, winner: event.target.value })}><option value="">Tự xác định theo tỷ số</option>{[match.a, match.b].filter(side => side.id).map(side => <option key={side.id} value={side.id}>{side.name}</option>)}</select></label>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting || !match.id}>{submitting ? 'Đang lưu…' : 'Lưu tỷ số'}</button></footer>
  </form></DemoDialog>
}
