import { CalendarDays, CreditCard, Globe2, Mail, MessageSquare, ShieldCheck, Smartphone, TriangleAlert, Trophy, Users } from 'lucide-react'
import { useAuth } from '../../context/authContext.js'
import { roleDestination } from '../../Auth/roleRoutes.js'
import { accessRoles, mockAdministrator, notificationChannels, tournamentFormats } from './settingsData.js'
import { formatSettingsTime } from './settingsHelpers.js'
import { SettingsField, SettingsFields } from './SettingsFields.jsx'

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


export function GeneralSettings(props) {
  return <><div className="ss-two-columns"><div className="ss-subcard"><h3><Globe2 size={16} />Thông tin nền tảng</h3><SettingsFields {...props} group="general" names={['platformName', 'supportEmail']} className="one-column" /></div><div className="ss-subcard"><h3>Mô tả nền tảng</h3><SettingsField {...props} group="general" name="description" /></div></div>
    <div className="ss-regional-fields"><SettingsFields {...props} group="general" names={['defaultLanguage', 'timezone', 'currency']} className="three-columns" /></div>
    <div className="ss-subcard ss-operational"><h3>Tùy chọn vận hành</h3><SettingsFields {...props} group="general" names={['maintenanceMode', 'allowRegistrations', 'publicAccess']} className="three-columns" /></div>
  </>
}

export function BookingPaymentSettings(props) {
  return <><div className="ss-two-columns"><div className="ss-subcard"><h3><CalendarDays size={16} />Cấu hình đặt sân</h3><SettingsFields {...props} group="booking" names={['minDuration', 'maxDuration', 'advanceBookingDays', 'bufferMinutes']} /><SettingsField {...props} group="booking" name="autoExpirePending" /></div><div className="ss-subcard"><h3><CreditCard size={16} />Cấu hình thanh toán</h3><SettingsFields {...props} group="payment" names={['serviceFee', 'paymentTimeout']} /><SettingsFields {...props} group="payment" names={['onlinePayment', 'refundRequests']} className="one-column" /></div></div>
    <div className="ss-subcard ss-policy"><h3>Chính sách hủy và hoàn tiền</h3><SettingsFields {...props} group="booking" names={['cancellationHours', 'lateCancellation']} /><SettingsFields {...props} group="payment" names={['refundEligibility', 'refundPercentage']} /></div>
    <div className="ss-info-note"><ShieldCheck size={15} />Các chính sách mẫu này không thay đổi logic đặt sân hoặc thanh toán đang hoạt động.</div>
  </>
}

export function TournamentSettings(props) {
  const { settings, errors, onChange } = props
  const toggleFormat = id => onChange('tournament', 'formats', settings.tournament.formats.includes(id) ? settings.tournament.formats.filter(value => value !== id) : [...settings.tournament.formats, id])
  return <><div className="ss-two-columns"><div className="ss-subcard"><h3><Trophy size={16} />Đăng ký giải đấu</h3><SettingsFields {...props} group="tournament" names={['maxTeams', 'registrationClosingHours']} /><SettingsFields {...props} group="tournament" names={['allowCreation', 'requireApproval']} className="one-column" /></div><div className="ss-subcard"><h3>Vận hành giải đấu</h3><SettingsFields {...props} group="tournament" names={['allowScheduleModification', 'automaticBracket', 'allowResultUpdates', 'notifications']} className="one-column" /></div></div>
    <fieldset className="ss-formats"><legend>Hình thức thi đấu được phép</legend><p>Chọn ít nhất một hình thức được phép sử dụng trong cấu hình mẫu.</p><div>{tournamentFormats.map(([id, label]) => <label key={id} className={settings.tournament.formats.includes(id) ? 'checked' : ''}><input type="checkbox" checked={settings.tournament.formats.includes(id)} onChange={() => toggleFormat(id)} aria-describedby={errors['tournament.formats'] ? 'ss-formats-error' : undefined} />{label}</label>)}</div>{errors['tournament.formats'] && <p id="ss-formats-error" className="ss-field-error">{errors['tournament.formats']}</p>}</fieldset>
  </>
}

const channelIcons = { email: Mail, inApp: MessageSquare, push: Smartphone }
export function NotificationSettings(props) {
  return <><div className="ss-three-columns">{notificationChannels.map(channel => {
    const Icon = channelIcons[channel.id]
    const enabled = props.settings.notifications[channel.enabled]
    return <div key={channel.id} className="ss-subcard ss-channel-card"><header><h3><Icon size={16} />{channel.title}</h3><span className={`ss-status ${enabled ? '' : 'muted'}`}>{enabled ? "ĐÃ BẬT" : "ĐÃ TẮT"}</span></header><SettingsField {...props} group="notifications" name={channel.enabled} /><SettingsFields {...props} group="notifications" names={channel.fields} className="one-column" disabled={!enabled} /></div>
  })}</div><div className="ss-subcard ss-timing"><h3>Thời điểm gửi thông báo</h3><SettingsFields {...props} group="notifications" names={['bookingReminderMinutes', 'retryLimit']} /></div><div className="ss-info-note">Không gửi Email hoặc thông báo đẩy thật. Các lựa chọn con được giữ nguyên khi tắt kênh.</div></>
}

export function SecurityAccessSettings({ onOpen, ...props }) {
  const auth = useAuth()
  const profile = auth.profile || auth.user
  const profileName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : typeof profile?.name === 'string' ? profile.name.trim() : ''
  const name = profileName || mockAdministrator.name
  const isMock = !profileName
  return <><div className="ss-security-grid"><div className="ss-subcard ss-admin-profile"><div className="ss-profile-top"><span className="ss-avatar">{name.split(' ').slice(-2).map(part => part[0]).join('')}</span><div><h3>{name}</h3><p>{isMock ? mockAdministrator.role : "Quản trị viên"}</p><span className="ss-status">{adminDisplayLabels[mockAdministrator.status] || mockAdministrator.status}</span></div></div><small className="ss-profile-source">{isMock ? 'HỒ SƠ MẪU' : 'HỒ SƠ TỪ PHIÊN ĐĂNG NHẬP'}</small><dl><dt>Vai trò trong phiên</dt><dd>{adminDisplayLabels[auth.role] || auth.role || 'Không khả dụng'}</dd><dt>Đăng nhập lần cuối (mẫu)</dt><dd>{formatSettingsTime(mockAdministrator.lastLogin)}</dd></dl><button type="button" className="ss-button" onClick={() => onOpen('sessions')}>Xem phiên đang hoạt động</button></div><div className="ss-subcard"><h3><ShieldCheck size={16} />Bảo mật tài khoản</h3><SettingsFields {...props} group="security" names={['sessionTimeout', 'maxLoginAttempts']} /><SettingsFields {...props} group="security" names={['strongPasswords', 'requireTwoFactor', 'suspiciousLoginAlerts']} className="one-column" /><div className="ss-security-actions"><button type="button" className="ss-button" onClick={() => onOpen('policy')}>Xem chính sách bảo mật</button><button type="button" className="ss-button" onClick={() => onOpen('password')}>Đổi mật khẩu</button></div></div></div>
    <div className="ss-access-control"><h3><Users size={16} />Phân quyền truy cập · Chỉ xem</h3><div className="ss-three-columns">{accessRoles.map(item => <div className="ss-role-card" key={item.role}><strong>{item.label}</strong><span>{adminDisplayLabels[item.role] || item.role}</span><p>{item.description}</p><small>{roleDestination(item.role) || 'Chưa có route tương ứng'}</small></div>)}</div></div>
    <div className="ss-info-note"><ShieldCheck size={15} />Đây là cấu hình bảo mật mẫu. JWT, thời hạn phiên thực tế và phân quyền hiện có không được thay đổi.</div>
  </>
}

export function DangerZone({ onReset }) {
  return <><div className="ss-danger-action"><div><h3>Khôi phục cấu hình nền tảng</h3><p>Khôi phục cài đặt nền tảng về cấu hình mặc định.</p><small>Chỉ đưa form cấu hình mẫu về mặc định dưới dạng thay đổi chưa lưu. Chọn Lưu tất cả thay đổi để lưu, hoặc Bỏ thay đổi để khôi phục bản đã lưu.</small></div><button type="button" className="ss-button danger" onClick={onReset}><TriangleAlert size={14} />Khôi phục mặc định</button></div><div className="ss-danger-note">Thay đổi cài đặt quan trọng có thể ảnh hưởng đến hoạt động hệ thống. Vui lòng kiểm tra kỹ trước khi lưu.</div></>
}
