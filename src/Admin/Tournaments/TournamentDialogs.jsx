import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { approveTournament, cancelTournament, lockTournament, rejectTournament, unlockTournament } from '../../api/admin/tournamentApi.js'

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

// Admin không tạo giải: chủ sân và người chơi tạo. Giải do người chơi tạo ở trạng thái chờ Admin duyệt (approve / reject).
// Admin chỉ theo dõi giải (QĐ-G): bốc thăm, tạo nhánh, nhập tỉ số, thêm người do Ban tổ chức làm; Admin chỉ duyệt / khóa / hủy.

const actions = {
  cancel: { title: 'Xác nhận hủy giải', button: 'Xác nhận hủy giải', danger: true, reason: true, task: (context, reason) => cancelTournament(context.tournament.id, reason), message: context => `Đã hủy giải ${context.tournament.name}.` },
  lock: { title: 'Khóa giải đấu', button: 'Khóa giải', danger: true, reason: true, task: (context, reason) => lockTournament(context.tournament.id, reason), message: context => `Đã khóa giải ${context.tournament.name}.` },
  approve: { title: 'Duyệt giải đấu', button: 'Duyệt giải', task: context => approveTournament(context.tournament.id), message: context => `Đã duyệt giải ${context.tournament.name}.` },
  reject: { title: 'Từ chối giải đấu', button: 'Từ chối', danger: true, reason: true, task: (context, reason) => rejectTournament(context.tournament.id, reason), message: context => `Đã từ chối giải ${context.tournament.name}.` },
  unlock: { title: 'Mở khóa giải đấu', button: 'Mở khóa', task: context => unlockTournament(context.tournament.id), message: context => `Đã mở khóa giải ${context.tournament.name}.` },
}
const explanation = (type, context) => ({
  cancel: 'Hủy toàn bộ giải đấu. Việc hoàn phí cho người đã đăng ký do backend xử lý theo chính sách hiện hành.',
  lock: 'Khóa giải để tạm dừng hoạt động (ví dụ nội dung chưa rõ ràng, có báo cáo vi phạm). Ban tổ chức sẽ thấy lý do khóa.',
  approve: `Giải do ${context.tournament.organizer || 'người chơi'} tạo sẽ hiện công khai và bắt đầu nhận đăng ký.`,
  reject: 'Giải không được công khai và không nhận đăng ký. Ban tổ chức sẽ thấy lý do từ chối.',
  unlock: context.tournament.lockReason ? `Lý do khóa trước đó: ${context.tournament.lockReason}` : 'Cho phép giải hoạt động trở lại.',
}[type])

// approve / reject / cancel / lock / unlock (PATCH /api/v1/admin/tournaments/{id}/…).
export function TournamentActionDialog({ type, context, onClose, onDone }) {
  const action = actions[type]
  const [reason, setReason] = useState('')
  const { submitting, error, setError, run } = useSubmit(onDone)
  const name = context.tournament.name
  const confirm = () => {
    if (action.reason && !reason.trim()) return setError('Vui lòng nhập lý do.')
    run(() => action.task(context, reason.trim()), action.message(context))
  }
  return <DemoDialog title={action.title} onClose={submitting ? noop : onClose}>
    <p><strong>{name}</strong></p>
    <p className="tournaments-dialog-explanation">{explanation(type, context)}</p>
    {action.reason && <div className="users-form"><label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder={type === 'lock' || type === 'reject' ? 'Ví dụ: Nội dung giới thiệu giải chưa rõ ràng…' : 'Ví dụ: Không đủ người đăng ký…'} /></label></div>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Giữ nguyên</button><button className={`users-button ${action.danger ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting}>{submitting ? 'Đang xử lý…' : action.button}</button></footer>
  </DemoDialog>
}
