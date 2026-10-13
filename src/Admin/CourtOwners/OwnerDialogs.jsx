import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'

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


export function OwnerFormDialog({ owner, owners, onClose, onSave }) {
  const [values, setValues] = useState({ name: owner?.name || '', username: owner?.username || '', email: owner?.email || '', phone: owner?.phone || '', legalName: owner?.legalName || '', registration: owner?.registration || '' })
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))
    if (clean.name.length < 2) return setError("Họ và tên phải có ít nhất 2 ký tự.")
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(clean.username)) return setError("Tên đăng nhập phải có 3–30 ký tự gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return setError("Vui lòng nhập địa chỉ Email hợp lệ.")
    if (clean.phone && !/^[+\d\s()-]{7,20}$/.test(clean.phone)) return setError("Vui lòng nhập số điện thoại hợp lệ hoặc để trống.")
    if (clean.legalName.length < 2) return setError("Vui lòng nhập tên pháp nhân cho hồ sơ mẫu.")
    if (owners.some(item => item.id !== owner?.id && (item.username.toLowerCase() === clean.username.toLowerCase() || item.email.toLowerCase() === clean.email.toLowerCase()))) return setError("Tên đăng nhập hoặc Email đã tồn tại trong dữ liệu mẫu.")
    onSave(clean)
  }
  return <DemoDialog title={`${owner ? "Chỉnh sửa" : "Thêm"} chủ sân — Bản mẫu`} onClose={onClose}><p className="users-demo-note">Đây là bản mẫu trong phiên. Thay đổi được đặt lại khi tải trang. Chỉ dùng thông tin mẫu; không lưu tài khoản hoặc đăng ký doanh nghiệp lên máy chủ.</p><form className="users-form" onSubmit={submit}>{[['name', "Họ và tên"], ['username', "Tên đăng nhập"], ['email', 'Email'], ['phone', "Số điện thoại (không bắt buộc)"], ['legalName', "Tên pháp nhân (mẫu)"], ['registration', "Mã đăng ký / mã số thuế (không bắt buộc, mẫu)"]].map(([key, label]) => <label key={key}>{label}<input name={key} value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} required={!['phone', 'registration'].includes(key)} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} maxLength={key === 'username' ? 30 : 120} /></label>)}{error && <p className="users-form-error" role="alert">{error}</p>}<footer><button className="users-button" type="button" onClick={onClose}>Hủy</button><button className="users-button primary">{owner ? "Lưu thay đổi mẫu" : "Thêm chủ sân mẫu"}</button></footer></form></DemoDialog>
}

export function OwnerReviewDialog({ owner, onClose, onConfirm }) {
  return <DemoDialog title="Xem xét KYC — Bản mẫu" onClose={onClose}><p className="users-demo-note">Xem thông tin KYC mẫu bên dưới. Xác nhận chỉ cập nhật nhãn xác minh của chủ sân trong phiên; không lưu phê duyệt KYC hoặc xác minh cơ sở trên máy chủ.</p><dl className="owners-review-fields">{[['Chủ sân', owner.name], ["Doanh nghiệp", owner.legalName || "Chưa có thông tin"], ['Mã đăng ký', owner.registration || "Chưa có thông tin"], ['Trạng thái hiện tại', adminDisplayLabels[owner.verification] || owner.verification], ["Số cơ sở", owner.facilities.length]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{!owner.registration && <p className="users-form-error">Chưa có mã đăng ký. Vui lòng thêm mã mẫu qua mục Chỉnh sửa chủ sân trước khi xác minh.</p>}<footer><button className="users-button" onClick={onClose}>Hủy</button><button className="users-button primary" disabled={owner.verification === 'Verified' || !owner.registration || !owner.legalName} onClick={onConfirm}>{owner.verification === 'Verified' ? "Đã xác minh (mẫu)" : "Xác nhận xác minh trong bản mẫu"}</button></footer></DemoDialog>
}

export function OwnerAccountDialog({ owners, restore, onClose, onConfirm }) {
  return <DemoDialog title={`${restore ? "Khôi phục hoạt động" : "Tạm khóa"} ${owners.length === 1 ? 'chủ sân' : `${owners.length} chủ sân`} — Bản mẫu`} onClose={onClose}><p className="users-demo-note">Thao tác chỉ cập nhật trạng thái tài khoản trong phiên. Không thay đổi tài khoản, cơ sở, đơn đặt sân, ví hoặc thanh toán thực tế.</p><p>{restore ? "Khôi phục hoạt động" : "Tạm khóa"} {owners.map(owner => owner.name).join(', ')}?</p><footer><button className="users-button" onClick={onClose}>Hủy</button><button className={`users-button ${restore ? 'primary' : 'users-danger'}`} onClick={onConfirm}>Xác nhận thao tác mẫu {restore ? 'khôi phục hoạt động' : 'tạm khóa'}</button></footer></DemoDialog>
}
