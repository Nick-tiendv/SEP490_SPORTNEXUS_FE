import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const adminDisplayLabels = {
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Suspended": "Đã tạm khóa",
  "Verified": "Đã xác minh",
  "Pending": "Đang chờ xử lý",
  "Rejected": "Đã từ chối",
  "Unverified": "Chưa xác minh",
  "All": "Tất cả"
}


export function DemoDialog({ title, onClose, children, closeLabel = "Đóng hộp thoại" }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const node = dialog.current
    const focusable = () => [...node.querySelectorAll('button:not(:disabled), input, select, [tabindex="0"]')]
    focusable()[0]?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const items = focusable()
        const first = items[0], last = items.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    node.addEventListener('keydown', handleKey)
    return () => { node.removeEventListener('keydown', handleKey); previous?.focus() }
  }, [onClose])
  return <div className="users-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}><div className="users-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="users-dialog-title"><header><h2 id="users-dialog-title">{title}</h2><button onClick={onClose} aria-label={closeLabel}><X size={20} /></button></header>{children}</div></div>
}

export function UserFormDialog({ user, users, onClose, onSave }) {
  const [values, setValues] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '', phone: user?.phone || '', role: user?.role || 'Player' })
  const [error, setError] = useState('')
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 2) return setError("Họ và tên phải có ít nhất 2 ký tự.")
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(clean.username)) return setError("Tên đăng nhập phải có 3–30 ký tự gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return setError("Vui lòng nhập địa chỉ Email hợp lệ.")
    if (clean.phone && !/^[+\d\s()-]{7,20}$/.test(clean.phone)) return setError("Vui lòng nhập số điện thoại hợp lệ hoặc để trống.")
    if (users.some(item => item.id !== user?.id && (item.username.toLowerCase() === clean.username.toLowerCase() || item.email.toLowerCase() === clean.email.toLowerCase()))) return setError("Tên đăng nhập hoặc Email đã tồn tại trong dữ liệu mẫu.")
    onSave(clean)
  }
  return <DemoDialog title={`${user ? "Chỉnh sửa" : "Thêm"} người dùng — Bản mẫu`} onClose={onClose}><p className="users-demo-note">Đây là bản mẫu. Thay đổi chỉ lưu trong phiên và được đặt lại khi tải trang. Không tạo hoặc cập nhật tài khoản trên máy chủ.</p><form onSubmit={submit} className="users-form">
    {[['name', "Họ và tên"], ['username', "Tên đăng nhập"], ['email', 'Email'], ['phone', "Số điện thoại (không bắt buộc)"]].map(([name, label]) => <label key={name}>{label}<input name={name} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} value={values[name]} onChange={change} required={name !== 'phone'} maxLength={name === 'name' ? 80 : 120} /></label>)}
    <label>Vai trò<select name="role" value={values.role} onChange={change}>{['Player', 'Court Owner', 'Administrator'].map(role => <option key={role} value={role}>{adminDisplayLabels[role] || role}</option>)}</select></label>
    {error && <p className="users-form-error" role="alert">{error}</p>}<footer><button type="button" className="users-button" onClick={onClose}>Hủy</button><button className="users-button primary" type="submit">{user ? "Lưu thay đổi mẫu" : "Thêm người dùng mẫu"}</button></footer>
  </form></DemoDialog>
}

export function SuspensionDialog({ users, restore, onClose, onConfirm }) {
  return <DemoDialog title={`${restore ? "Khôi phục" : "Tạm khóa"} ${users.length === 1 ? 'người dùng' : `${users.length} người dùng`} — Bản mẫu`} onClose={onClose}><p className="users-demo-note">Thao tác chỉ cập nhật trạng thái trong bản mẫu. Không thay đổi tài khoản, ví, đơn đặt sân hoặc dữ liệu máy chủ thực tế.</p><p>{restore ? "Khôi phục quyền truy cập cho" : "Tạm khóa"} {users.map(user => user.name).join(', ')}?</p><footer><button className="users-button" onClick={onClose}>Hủy</button><button className={`users-button ${restore ? 'primary' : 'users-danger'}`} onClick={onConfirm}>Xác nhận thao tác mẫu {restore ? 'khôi phục' : 'tạm khóa'}</button></footer></DemoDialog>
}
