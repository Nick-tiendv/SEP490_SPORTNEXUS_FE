import { Clock3, ShieldCheck, TriangleAlert } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { mockSessions, settingsFields } from './settingsData.js'
import { formatSettingsTime } from './settingsHelpers.js'

const adminDisplayLabels = {
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Enabled": "Đã bật",
  "Disabled": "Đã tắt"
}


const showValue = (value, field) => typeof value === 'boolean' ? value ? 'Đã bật' : 'Đã tắt' : Array.isArray(value) ? value.map(item => showValue(item, field)).join(', ') : field?.options?.find(([key]) => key === value)?.[1] || (typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value))
const groupLabels = { general: 'Cài đặt chung', booking: 'Đặt sân', payment: 'Thanh toán', tournament: 'Giải đấu', notifications: 'Thông báo', security: 'Bảo mật' }
const titles = { history: "Lịch sử thay đổi cài đặt — Mẫu", sessions: "Phiên đang hoạt động — Dữ liệu mẫu", policy: "Chính sách bảo mật — Mẫu giao diện", password: "Đổi mật khẩu", critical: 'Xác nhận thay đổi cấu hình quan trọng', reset: "Khôi phục cấu hình nền tảng" }

export default function SettingsDialogs({ dialog, history, settings, onClose, onConfirm }) {
  return <DemoDialog title={titles[dialog.type]} onClose={onClose}><div className="ss-dialog-content">
    {dialog.type === 'history' && <><p className="ss-modal-note">Lịch sử minh họa được lưu cùng cấu hình mẫu. Đây không phải nhật ký kiểm toán từ máy chủ.</p>{history.length ? <ol className="ss-history">{history.map(entry => <li key={entry.id}><div className="ss-history-heading"><Clock3 size={15} /><strong>{formatSettingsTime(entry.at)} (UTC+7)</strong></div><small>{entry.actor} · {entry.groups.map(group => groupLabels[group] || group).join(' / ')}</small><ul>{entry.changes.map(change => <li key={change.path}><strong>{change.label}</strong><span>{showValue(change.before, settingsFields[change.path.split('.')[0]]?.[change.path.split('.')[1]])} → {showValue(change.after, settingsFields[change.path.split('.')[0]]?.[change.path.split('.')[1]])}</span></li>)}</ul></li>)}</ol> : <div className="ss-empty"><Clock3 size={25} /><h3>Chưa có lịch sử thay đổi</h3><p>Lịch sử sẽ xuất hiện sau khi lưu cấu hình mẫu.</p></div>}</>}
    {dialog.type === 'sessions' && <><p className="ss-modal-note">Danh sách phiên mẫu, chưa kết nối API quản lý phiên. Không phản ánh thiết bị đang đăng nhập thực tế.</p><div className="ss-session-list">{mockSessions.map(session => <article key={session.id}><strong>{session.device}</strong><span className="ss-status">{adminDisplayLabels[session.status] || session.status} (mẫu)</span><p>{session.location}</p><small>{formatSettingsTime(session.time)} (UTC+7) · {session.id}</small></article>)}</div></>}
    {dialog.type === 'policy' && <><p className="ss-modal-note">Hướng dẫn giao diện mẫu, chưa phải chính sách bảo mật chính thức của SportNexus.</p><ul className="ss-policy-list"><li>Thời gian hết hạn phiên: {settings.security.sessionTimeout} phút.</li><li>Giới hạn đăng nhập sai: {settings.security.maxLoginAttempts} lần.</li><li>Yêu cầu mật khẩu mạnh: {showValue(settings.security.strongPasswords)}.</li><li>Yêu cầu xác thực hai yếu tố: {showValue(settings.security.requireTwoFactor)}.</li><li>Thông báo đăng nhập đáng ngờ: {showValue(settings.security.suspiciousLoginAlerts)}.</li></ul><div className="ss-modal-note"><ShieldCheck size={16} />Các giá trị này không được áp dụng vào xác thực đang hoạt động.</div></>}
    {dialog.type === 'password' && <><p>Chưa có trang hoặc API đổi mật khẩu được xác nhận trong dự án.</p><div className="ss-modal-note">Thao tác này chỉ hiển thị thông tin mô phỏng. Mật khẩu tài khoản không được thay đổi. Việc tích hợp sẽ dùng chức năng máy chủ được xác nhận sau.</div></>}
    {dialog.type === 'critical' && <><div className="ss-modal-warning"><TriangleAlert size={20} /><p>Thay đổi “{settingsFields[dialog.group][dialog.name].label}” sang <strong>{showValue(dialog.value)}</strong>?</p></div><p>Thiết lập này có ảnh hưởng lớn khi được áp dụng trong hệ thống thật. Trong trang mẫu, xác nhận chỉ cập nhật form và vẫn cần Lưu tất cả thay đổi để lưu.</p></>}
    {dialog.type === 'reset' && <><div className="ss-modal-warning"><TriangleAlert size={20} /><p>Khôi phục toàn bộ cấu hình mẫu về mặc định?</p></div><p>Form hiện tại sẽ được thay thế bằng giá trị mặc định. Bản đã lưu gần nhất vẫn được giữ cho đến khi bạn chọn Lưu tất cả thay đổi.</p><p className="ss-modal-note">Thao tác không xóa người dùng, đơn đặt sân, giải đấu hoặc cơ sở dữ liệu.</p></>}
    <footer><button type="button" className="ss-button" onClick={onClose}>{['critical', 'reset'].includes(dialog.type) ? "Hủy" : 'Đóng'}</button>{['critical', 'reset'].includes(dialog.type) && <button type="button" className={`ss-button ${dialog.type === 'reset' ? 'danger' : 'primary'}`} onClick={onConfirm}>{dialog.type === 'reset' ? "Xác nhận khôi phục" : 'Xác nhận thay đổi mẫu'}</button>}</footer>
  </div></DemoDialog>
}
