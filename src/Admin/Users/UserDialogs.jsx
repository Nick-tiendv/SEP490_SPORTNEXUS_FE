import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { createAccount, deleteAccount, findAccountsByPhone, toggleAccountStatus, updateAccount } from '../../api/admin/accountApi.js'
import { compactPhone, isVietnamPhone, phoneKey, roleLabel } from './usersData.js'

export function DemoDialog({ title, onClose, children, closeLabel = "Đóng hộp thoại" }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const node = dialog.current
    const focusable = () => [...node.querySelectorAll('button:not(:disabled), input, select, textarea, [tabindex="0"]')]
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

const noop = () => {}

// Thêm: POST /api/accounts. Sửa: PUT /api/accounts/{id}.
// isSelf: đang sửa chính tài khoản đăng nhập → khóa ô vai trò để admin không tự hạ quyền.
export function UserFormDialog({ user, users, roles, onClose, onDone, noun = 'người dùng', isSelf = false }) {
  const [values, setValues] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '', phone: user?.phone || '', roleId: user?.roleId || roles.find(role => /player/i.test(role.name))?.id || roles[0]?.id || '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = async event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 2) return setError("Họ và tên phải có ít nhất 2 ký tự.")
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(clean.username)) return setError("Tên đăng nhập phải có 3–30 ký tự gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return setError("Vui lòng nhập địa chỉ Email hợp lệ.")
    if (clean.phone && !isVietnamPhone(clean.phone)) return setError('Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678 hoặc +84912345678).')
    // PUT coi phone = null là giữ nguyên, nên không thể xóa số đã có bằng cách để trống.
    if (user?.phone && !clean.phone) return setError('Không thể xóa số điện thoại đã có. Hãy nhập số mới hoặc giữ số cũ.')
    if (!clean.roleId) return setError("Không xác định được vai trò. BE chưa trả về roleId trong danh sách tài khoản.")
    if (!user && clean.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự.")
    if (user && clean.password && clean.password.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự hoặc để trống.")
    if (users.some(item => item.id !== user?.id && (item.username.toLowerCase() === clean.username.toLowerCase() || (item.email && item.email.toLowerCase() === clean.email.toLowerCase())))) return setError("Tên đăng nhập hoặc Email đã tồn tại.")
    if (clean.phone && users.some(item => item.id !== user?.id && item.phone && phoneKey(item.phone) === phoneKey(clean.phone))) return setError('Số điện thoại này đã được sử dụng bởi một tài khoản khác.')
    setSubmitting(true); setError('')
    try {
      const payload = { username: clean.username, fullName: clean.name, email: clean.email, phone: compactPhone(clean.phone), roleId: clean.roleId, password: clean.password }
      if (user) await updateAccount(user.id, payload)
      else await createAccount(payload)
      onDone(user ? `Đã cập nhật tài khoản ${clean.name}.` : `Đã tạo tài khoản ${clean.name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={`${user ? "Chỉnh sửa" : "Thêm"} ${noun}`} onClose={submitting ? noop : onClose}><form onSubmit={submit} className="users-form">
    {[['name', "Họ và tên"], ['username', "Tên đăng nhập"], ['email', 'Email'], ['phone', "Số điện thoại (không bắt buộc)"]].map(([name, label]) => <label key={name}>{label}<input name={name} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} value={values[name]} onChange={change} required={name !== 'phone'} maxLength={name === 'name' ? 80 : name === 'phone' ? 16 : 120} placeholder={name === 'phone' ? '0912345678' : undefined} /></label>)}
    <label>{user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}<input name="password" type="password" autoComplete="new-password" value={values.password} onChange={change} required={!user} maxLength={100} /></label>
    <label>Vai trò<select name="roleId" value={values.roleId} onChange={change} disabled={!roles.length || isSelf}>{roles.map(role => <option key={role.id || role.name} value={role.id}>{roleLabel(role.name)}</option>)}</select>{isSelf && <small className="users-field-hint">Không thể tự đổi vai trò của tài khoản đang đăng nhập.</small>}</label>
    {error && <p className="users-form-error" role="alert">{error}</p>}<footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" type="submit" disabled={submitting}>{submitting ? 'Đang lưu…' : user ? "Lưu thay đổi" : `Thêm ${noun}`}</button></footer>
  </form></DemoDialog>
}

// PATCH /api/accounts/{id}/toggle-status cho từng tài khoản. Chỉ gửi cho tài khoản cần đổi trạng thái.
export function SuspensionDialog({ users, restore, onClose, onDone, noun = 'người dùng' }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const targets = users.filter(user => (restore ? user.status === 'Suspended' : user.status === 'Active'))
  const confirm = async () => {
    setSubmitting(true); setError('')
    const results = await Promise.allSettled(targets.map(user => toggleAccountStatus(user.id)))
    const failed = results.map((result, index) => result.status === 'rejected' && `${targets[index].name}: ${result.reason?.message}`).filter(Boolean)
    const ok = targets.length - failed.length
    if (failed.length) { setError(`Thành công ${ok}/${targets.length}. Lỗi — ${failed.join(' · ')}`); setSubmitting(false); if (ok) onDone(null, true); return }
    onDone(`Đã ${restore ? 'khôi phục' : 'tạm khóa'} ${ok} tài khoản.`)
  }
  return <DemoDialog title={`${restore ? "Khôi phục" : "Tạm khóa"} ${users.length === 1 ? noun : `${users.length} ${noun}`}`} onClose={submitting ? noop : onClose}>
    {targets.length ? <p>{restore ? "Khôi phục quyền truy cập cho" : "Tạm khóa"} {targets.map(user => user.name).join(', ')}?</p> : <p>Không có tài khoản nào cần {restore ? 'khôi phục' : 'tạm khóa'} trong danh sách đã chọn.</p>}
    {targets.length < users.length && targets.length > 0 && <p className="users-demo-note">Bỏ qua {users.length - targets.length} tài khoản đã ở trạng thái {restore ? 'hoạt động' : 'tạm khóa'}.</p>}
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${restore ? 'primary' : 'users-danger'}`} onClick={confirm} disabled={submitting || !targets.length}>{submitting ? 'Đang xử lý…' : `Xác nhận ${restore ? 'khôi phục' : 'tạm khóa'}`}</button></footer>
  </DemoDialog>
}

// DELETE /api/accounts/{id}
export function DeleteUserDialog({ user, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const confirm = async () => {
    setSubmitting(true); setError('')
    try {
      await deleteAccount(user.id)
      onDone(`Đã xóa tài khoản ${user.name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Xóa tài khoản" onClose={submitting ? noop : onClose}>
    <p>Xóa vĩnh viễn tài khoản <strong>{user.name}</strong>{user.username && ` (@${user.username})`}? Thao tác này không thể hoàn tác.</p>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button users-danger" onClick={confirm} disabled={submitting}>{submitting ? 'Đang xóa…' : 'Xóa tài khoản'}</button></footer>
  </DemoDialog>
}

// Tra cứu tài khoản theo SĐT: GET /api/accounts/admin/by-phone (Admin xem đủ thông tin, gồm số dư ví).
export function PhoneLookupDialog({ onClose, onOpen }) {
  const [phone, setPhone] = useState('')
  const [state, setState] = useState({ loading: false, error: '', items: null })
  const submit = async event => {
    event.preventDefault()
    const value = compactPhone(phone)
    if (!value) return setState({ loading: false, error: 'Vui lòng nhập số điện thoại.', items: null })
    setState({ loading: true, error: '', items: null })
    try {
      setState({ loading: false, error: '', items: await findAccountsByPhone(value) })
    } catch (err) {
      setState({ loading: false, error: err.message, items: null })
    }
  }
  return <DemoDialog title="Tra cứu tài khoản theo SĐT" onClose={onClose}>
    <form className="users-form" noValidate onSubmit={submit}>
      <label>Số điện thoại<input type="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="0901234567" /></label>
      {state.error && <p role="alert" className="users-form-error">{state.error}</p>}
      {state.items && (state.items.length ? <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>{state.items.map(account => <li key={account.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--sn-gray-200, #e5e7eb)', borderRadius: 10 }}>
        <span style={{ flex: 1, minWidth: 0 }}><strong>{account.name}</strong><small style={{ display: 'block', color: 'var(--sn-gray-500, #6b7280)' }}>{[account.username && `@${account.username}`, roleLabel(account.role), account.email, account.wallet != null && `Ví ${account.wallet.toLocaleString('vi-VN')} ₫`].filter(Boolean).join(' · ')}</small></span>
        <button type="button" className="users-button" onClick={() => onOpen(account.id)}>Xem chi tiết</button>
      </li>)}</ul> : <p>Không tìm thấy tài khoản nào với số điện thoại này.</p>)}
      <footer><button type="button" className="users-button" onClick={onClose}>Đóng</button><button className="users-button primary" disabled={state.loading}>{state.loading ? 'Đang tra cứu…' : 'Tra cứu'}</button></footer>
    </form>
  </DemoDialog>
}
