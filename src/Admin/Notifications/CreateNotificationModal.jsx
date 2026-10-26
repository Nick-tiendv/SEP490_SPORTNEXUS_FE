import { useEffect, useRef, useState } from 'react'
import { CalendarClock, Send } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { listAccounts } from '../../api/admin/accountApi.js'
import { MAX_BODY, MAX_TITLE, MAX_USERS, blankBroadcast, formatNumber, formatTime, normalize, referenceTypes, targetLabels, toBroadcastPayload, validateBroadcast, vnLocalInput, vnLocalToIso } from './notificationHelpers.js'

const roleText = role => (/owner/i.test(role) ? 'Chủ sân' : /player/i.test(role) ? 'Người chơi' : role || '—')

// Soạn đợt thông báo: POST /api/v1/admin/notifications/broadcast (docs 41).
export default function CreateNotificationModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(blankBroadcast)
  const [minSchedule] = useState(() => vnLocalInput(Date.now() + 2 * 60 * 1000))
  const [users, setUsers] = useState(null) // null = chưa tải
  const [usersError, setUsersError] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const confirmButton = useRef(null)
  const needUsers = form.target === 'USERS'

  // Danh sách người nhận: GET /api/accounts, bỏ Admin và tài khoản đã khóa (BE từ chối người nhận bị khóa).
  useEffect(() => {
    if (!needUsers || users) return
    let cancelled = false
    listAccounts()
      .then(items => !cancelled && setUsers(items.filter(user => user.status === 'Active' && !/admin/i.test(user.role))))
      .catch(err => !cancelled && setUsersError(err.message))
    return () => { cancelled = true }
  }, [needUsers, users])
  useEffect(() => { if (confirming) confirmButton.current?.focus() }, [confirming])

  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError('') }
  const toggleUser = id => change('userIds', form.userIds.includes(id) ? form.userIds.filter(item => item !== id) : [...form.userIds, id])
  const matches = (users || []).filter(user => normalize(`${user.name} ${user.username} ${user.email} ${user.phone}`).includes(normalize(search.trim())))

  const review = event => {
    event.preventDefault()
    const issue = validateBroadcast(form)
    if (issue) { setError(issue); return }
    setConfirming(true)
  }
  const send = async () => {
    const issue = validateBroadcast(form)
    if (issue) { setConfirming(false); setError(issue); return }
    setSubmitting(true)
    try {
      await onSubmit(toBroadcastPayload(form))
    } catch (err) {
      setError(err.message); setConfirming(false); setSubmitting(false)
    }
  }

  const recipientText = needUsers ? `${formatNumber(form.userIds.length)} người dùng được chọn` : targetLabels[form.target]
  const scheduleText = form.sendMode === 'later' ? `Hẹn gửi lúc ${formatTime(vnLocalToIso(form.scheduledLocal))} (UTC+7)` : 'Gửi ngay'

  return <DemoDialog title={confirming ? 'Xác nhận gửi thông báo' : 'Tạo thông báo hệ thống'} onClose={submitting ? () => {} : onClose}>
    <div className="nt-modal-content">
      {confirming ? <div className="nt-confirmation">
        <h3>{form.title.trim()}</h3><p>{form.body.trim()}</p>
        <p><strong>Người nhận:</strong> {recipientText} · <strong>{scheduleText}</strong>{form.referenceType ? ` · Liên kết: ${referenceTypes[form.referenceType]}` : ''}</p>
        <p className="nt-muted">Thông báo hiển thị trong hộp thư ứng dụng của người nhận. Sau khi gửi vẫn có thể thu hồi.</p>
        <footer><button className="nt-button" onClick={() => setConfirming(false)} disabled={submitting}>Quay lại chỉnh sửa</button><button ref={confirmButton} className="nt-button primary" onClick={send} disabled={submitting}>{submitting ? 'Đang gửi…' : form.sendMode === 'later' ? 'Xác nhận hẹn giờ' : 'Xác nhận gửi'}</button></footer>
      </div> :
        <form className="nt-form" onSubmit={review} noValidate>
          <label>Tiêu đề <span>*</span><input value={form.title} onChange={event => change('title', event.target.value)} maxLength={MAX_TITLE} required /><small>{form.title.length} / {MAX_TITLE} ký tự</small></label>
          <label>Nội dung <span>*</span><textarea rows={4} value={form.body} onChange={event => change('body', event.target.value)} maxLength={MAX_BODY} required /><small>{formatNumber(form.body.length)} / {formatNumber(MAX_BODY)} ký tự</small></label>
          <label>Đối tượng nhận<select value={form.target} onChange={event => change('target', event.target.value)}>{Object.entries(targetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {needUsers && <fieldset><legend>Chọn người nhận ({formatNumber(form.userIds.length)}/{formatNumber(MAX_USERS)})</legend>
            <input aria-label="Tìm người nhận" placeholder="Tìm tên, tên đăng nhập, email, SĐT…" value={search} onChange={event => setSearch(event.target.value)} />
            <div className="nt-recipient-picker">
              {usersError ? <p className="nt-error">{usersError}</p> : !users ? <p>Đang tải danh sách người dùng…</p> : <>
                {matches.slice(0, 200).map(user => <label className="nt-checkbox" key={user.id}><input type="checkbox" checked={form.userIds.includes(user.id)} onChange={() => toggleUser(user.id)} /><span>{user.name}<small>{[user.email || user.phone, roleText(user.role)].filter(Boolean).join(' · ')}</small></span></label>)}
                {!matches.length && <p>Không tìm thấy người dùng.</p>}
                {matches.length > 200 && <p className="nt-muted">Đang hiện 200/{formatNumber(matches.length)} kết quả, hãy gõ thêm để lọc.</p>}
              </>}
            </div>
          </fieldset>}
          <div className="nt-form-row">
            <label>Liên kết tới (tùy chọn)<select value={form.referenceType} onChange={event => change('referenceType', event.target.value)}><option value="">Không liên kết</option>{Object.entries(referenceTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>ID đối tượng liên kết<input value={form.referenceId} onChange={event => change('referenceId', event.target.value)} placeholder="VD: id giải đấu (UUID)" disabled={!form.referenceType} /></label>
          </div>
          <div className="nt-form-row">
            <label>Thời điểm gửi<select value={form.sendMode} onChange={event => change('sendMode', event.target.value)}><option value="now">Gửi ngay</option><option value="later">Hẹn giờ gửi</option></select></label>
            {form.sendMode === 'later' && <label>Gửi lúc (UTC+7)<input type="datetime-local" min={minSchedule} value={form.scheduledLocal} onChange={event => change('scheduledLocal', event.target.value)} /></label>}
          </div>
          {form.sendMode === 'later' && <small className="nt-muted">Hẹn giờ sau thời điểm hiện tại ít nhất 1 phút và trong vòng 30 ngày.</small>}
          <section className="nt-live-preview" aria-label="Xem trước"><small>XEM TRƯỚC · {recipientText.toUpperCase()}</small><h3>{form.title || 'Tiêu đề thông báo'}</h3><p>{form.body || 'Nội dung thông báo sẽ hiển thị ở đây.'}</p></section>
          {error && <p className="nt-error" role="alert">{error}</p>}
          <footer><button type="button" className="nt-button" onClick={onClose}>Hủy</button><button className="nt-button primary" type="submit">{form.sendMode === 'later' ? <CalendarClock size={14} /> : <Send size={14} />}{form.sendMode === 'later' ? 'Hẹn giờ gửi' : 'Gửi thông báo'}</button></footer>
        </form>}
    </div>
  </DemoDialog>
}
