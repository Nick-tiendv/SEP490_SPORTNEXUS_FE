import { useEffect, useRef, useState } from 'react'
import { Send, CalendarClock, FilePenLine } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { audiences, channels, formTypes, recipients } from './notificationData.js'
import { localDate, normalize, resolveRecipients, scheduleInput, validateNotification } from './notificationHelpers.js'
import { NotificationBadge } from './NotificationUI.jsx'

const adminDisplayLabels = {
  "Confirmed": "Đã xác nhận",
  "Completed": "Đã hoàn thành",
  "Recruiting": "Đang tìm người",
  "Announcement": "Thông báo chung",
  "Maintenance": "Bảo trì",
  "General": "Chung",
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Booking": "Đặt sân",
  "Payment": "Thanh toán",
  "Tournament": "Giải đấu",
  "System": "Hệ thống",
  "Broadcast": "Thông báo hàng loạt",
  "LFG": "Tìm nhóm chơi",
  "Registration": "Đăng ký",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Pending": "Đang chờ xử lý",
  "Read": "Đã đọc",
  "Delivered": "Đã giao",
  "Failed": "Thất bại",
  "Sent": "Đã gửi",
  "Sending": "Đang gửi",
  "Draft": "Bản nháp",
  "Scheduled": "Đã lên lịch",
  "Cancelled": "Đã hủy",
  "In-App": "Trong ứng dụng",
  "Push Notification": "Thông báo đẩy",
  "All Users": "Tất cả người dùng",
  "Players": "Người chơi",
  "Court Owners": "Chủ sân",
  "Admins": "Quản trị viên",
  "Selected Users": "Người dùng được chọn",
  "All": "Tất cả"
}


const blankForm = { title: '', message: '', type: 'Announcement', audience: 'All Users', channels: ['In-App'], selectedUsers: [], scheduleAt: '' }

export default function CreateNotificationModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...blankForm, ...initial, channels: [...(initial?.channels || blankForm.channels)], selectedUsers: [...(initial?.selectedUsers || [])] }))
  const [mode, setMode] = useState(initial?.status === 'Scheduled' ? 'schedule' : initial?.id ? 'draft' : 'send')
  const [schedule, setSchedule] = useState(() => scheduleInput(initial?.scheduleAt))
  const [minimumDate] = useState(() => localDate(new Date()))
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const confirmButton = useRef(null)
  const isScheduleEdit = initial?.id && initial.status === 'Scheduled'
  const matches = recipients.filter(person => normalize(`${person.name} ${person.username} ${person.email}`).includes(normalize(search)))
  useEffect(() => { if (confirming) confirmButton.current?.focus() }, [confirming])
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError('') }
  const toggle = (key, value) => change(key, form[key].includes(value) ? form[key].filter(item => item !== value) : [...form[key], value])
  const values = () => ({ ...form, scheduleAt: schedule ? `${schedule}:00+07:00` : '' })
  const submit = event => {
    event.preventDefault()
    const next = values()
    const issue = validateNotification(next, mode)
    if (issue) { setError(issue); return }
    if (mode === 'send') setConfirming(true)
    else onSave(next, mode)
  }
  const send = () => {
    const next = values()
    const issue = validateNotification(next, 'send')
    if (issue) { setConfirming(false); setError(issue); return }
    onSave(next, 'send')
  }
  const saveDraft = () => {
    const next = values()
    const issue = validateNotification(next, 'draft')
    if (issue) { setError(issue); return }
    onSave(next, 'draft')
  }
  return <DemoDialog title={confirming ? 'Xác nhận gửi thông báo mô phỏng' : isScheduleEdit ? "Chỉnh sửa lịch gửi hàng loạt" : initial?.id ? "Chỉnh sửa bản nháp" : "Tạo thông báo"} onClose={onClose}>
    <div className="nt-modal-content">
      <p className="nt-demo-note">Dữ liệu mẫu trong phiên hiện tại. Không gửi Email/thông báo đẩy thật, không tạo lịch gửi trên máy chủ.</p>
      {confirming ? <div className="nt-confirmation"><h3>{form.title}</h3><p>{form.message}</p><p>Tạo {resolveRecipients(form).length} thông báo mẫu · {adminDisplayLabels[form.audience] || form.audience} · {form.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ')}.</p><footer><button className="nt-button" onClick={() => setConfirming(false)}>Quay lại chỉnh sửa</button><button ref={confirmButton} className="nt-button primary" onClick={send}>Xác nhận gửi mô phỏng</button></footer></div> :
        <form className="nt-form" onSubmit={submit} noValidate>
          <label>Tiêu đề thông báo <span>*</span><input value={form.title} onChange={event => change('title', event.target.value)} maxLength={120} required /></label>
          <label>Nội dung thông báo <span>*</span><textarea tabIndex={0} rows={4} value={form.message} onChange={event => change('message', event.target.value)} maxLength={2000} required /><small>{form.message.length} / 2.000 ký tự</small></label>
          <div className="nt-form-row"><label>Loại thông báo<select value={form.type} onChange={event => change('type', event.target.value)}>{formTypes.map(value => <option key={value} value={value}>{adminDisplayLabels[value] || value}</option>)}</select></label><label>Đối tượng nhận<select value={adminDisplayLabels[form.audience] || form.audience} onChange={event => change('audience', event.target.value)}>{audiences.map(value => <option key={value} value={value}>{adminDisplayLabels[value] || value}</option>)}</select></label></div>
          {form.audience === 'Selected Users' && <fieldset><legend>Chọn người nhận mẫu ({form.selectedUsers.length})</legend><input aria-label="Tìm người nhận" placeholder="Tìm tên, tên đăng nhập, Email..." value={search} onChange={event => setSearch(event.target.value)} /><div className="nt-recipient-picker">{matches.map(person => <label className="nt-checkbox" key={person.id}><input type="checkbox" checked={form.selectedUsers.includes(person.id)} onChange={() => toggle('selectedUsers', person.id)} /><span>{person.name}<small>{person.email} · {adminDisplayLabels[person.role] || person.role}</small></span></label>)}{!matches.length && <p>Không tìm thấy người nhận.</p>}</div></fieldset>}
          <fieldset><legend>Kênh gửi <span>*</span></legend><div className="nt-channel-options">{channels.map(channel => <label key={channel} className="nt-checkbox"><input type="checkbox" checked={form.channels.includes(channel)} onChange={() => toggle('channels', channel)} />{adminDisplayLabels[channel] || channel}</label>)}</div></fieldset>
          <label>Lịch gửi<select value={mode} onChange={event => { setMode(event.target.value); setError('') }} disabled={Boolean(isScheduleEdit)}>{!initial?.id && <option value="send">Gửi ngay (mô phỏng)</option>}<option value="schedule">Gửi theo lịch (mô phỏng)</option>{!isScheduleEdit && <option value="draft">Lưu bản nháp</option>}</select></label>
          {mode === 'schedule' && <div className="nt-form-row"><label>Ngày gửi (UTC+7)<input type="date" min={minimumDate} value={schedule.split('T')[0] || ''} onChange={event => setSchedule(`${event.target.value}T${schedule.split('T')[1] || '09:00'}`)} /></label><label>Giờ gửi (UTC+7)<input type="time" value={schedule.split('T')[1] || ''} onChange={event => setSchedule(`${schedule.split('T')[0] || ''}T${event.target.value}`)} /></label></div>}
          <section className="nt-live-preview" aria-label="Xem trước trực tiếp"><small>XEM TRƯỚC · {resolveRecipients(form).length} NGƯỜI NHẬN MẪU</small><h3>{form.title || 'Tiêu đề thông báo'}</h3><p>{form.message || 'Nội dung thông báo của bạn sẽ hiển thị ở đây.'}</p><div className="nt-inline-badges"><NotificationBadge value={form.type} /><span>{adminDisplayLabels[form.audience] || form.audience} · {form.channels.map(channel => adminDisplayLabels[channel] || channel).join(' & ') || 'Chưa chọn kênh'}</span></div></section>
          {error && <p className="nt-error" role="alert">{error}</p>}
          <footer><button type="button" className="nt-button" onClick={onClose}>Hủy</button>{mode !== 'draft' && !isScheduleEdit && <button type="button" className="nt-button" onClick={saveDraft}>Lưu bản nháp</button>}<button className="nt-button primary" type="submit">{mode === 'send' ? <Send size={14} /> : mode === 'schedule' ? <CalendarClock size={14} /> : <FilePenLine size={14} />}{mode === 'send' ? "Gửi thông báo (mô phỏng)" : mode === 'schedule' ? "Lên lịch" : "Lưu bản nháp"}</button></footer>
        </form>}
    </div>
  </DemoDialog>
}
