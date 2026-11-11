import { useAuth } from '../../context/authContext.js'
import { confirmDialog } from '../../components/common/confirm.js'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyProfile,
  updateMyProfile,
  logoutApi,
  logoutAllDevices,
  getMySports,
  updateMySports,
  getSportCategories,
  skillLabel,
  uploadAvatar,
  changePassword,
  updatePhone,
  sendEmailOtp,
  verifyEmail,
  setPassword,
  deleteMyAccount,
} from '../../api/player/profileApi.js'
import { getMyFairPlay } from '../../api/player/lfgApi.js'
import { getMyRatings, getMyAssessments } from '../../api/player/ratingApi.js'
import { initialsOf } from '../../hooks/useCurrentUser.js'
import { getMyBookings } from '../../api/player/bookingApi.js'
import { enrichPlayerBookings } from '../../api/player/bookingApi.js'
import { uploadImage } from '../../api/player/uploadApi.js'
import { clearPhoneVerification, confirmPhoneCode, isFirebasePhoneEnabled, sendPhoneCode } from '../../Auth/firebasePhone.js'
import {
  getMyFacilityReviews,
  getFacilityReviewById,
  updateFacilityReview,
  deleteFacilityReview,
} from '../../api/player/reviewApi.js'
import {
  getReportReasons,
  createReport,
  getMyReports,
  withdrawReport,
} from '../../api/player/reportApi.js'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../../api/player/notificationApi.js'

// Danh mục loại thông báo đồng bộ với GET/PUT /api/v1/notifications/settings (NotificationBell)
const NOTIFICATION_TYPES_CATALOG = [
  { code: 'BOOKING', label: 'Đặt sân & Lịch thi đấu', desc: 'Xác nhận đặt sân, đổi lịch và thông báo giờ chơi' },
  { code: 'PAYMENT', label: 'Giao dịch ví & Nạp rút Escrow', desc: 'Biến động số dư, hoàn tiền cọc và thanh toán chia tiền' },
  { code: 'CHECK_IN', label: 'Vé điện tử & Check-in QR', desc: 'Mã QR check-in, vé chia sẻ nhóm và cảnh báo giờ vào sân' },
  { code: 'FEEDBACK', label: 'Đánh giá & Điểm Fair Play', desc: 'Lời khen bạn chơi, cập nhật uy tín và mời đánh giá sau trận' },
  { code: 'COMMUNITY', label: 'Cộng đồng & Kèo LFG', desc: 'Lời mời ghép trận, bình luận bài viết và tương tác nhóm' },
  { code: 'SYSTEM', label: 'Thông báo hệ thống & Bảo trì', desc: 'Cập nhật tính năng mới, bảo trì cụm sân và cảnh báo bảo mật' },
]

// Kiểm tra mật khẩu theo AccountRules của BE (6-64 ký tự, khác mật khẩu cũ, xác nhận khớp)
const validateChangePasswordForm = (form) => {
  const errs = {}
  if (!form.oldPassword) {
    errs.oldPassword = 'Vui lòng nhập mật khẩu hiện tại.'
  }
  if (!form.newPassword) {
    errs.newPassword = 'Vui lòng nhập mật khẩu mới.'
  } else if (form.newPassword.length < 6 || form.newPassword.length > 64) {
    errs.newPassword = 'Mật khẩu mới phải từ 6 đến 64 ký tự.'
  } else if (form.oldPassword && form.newPassword === form.oldPassword) {
    errs.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.'
  }
  if (!form.confirmPassword) {
    errs.confirmPassword = 'Vui lòng nhập xác nhận mật khẩu mới.'
  } else if (form.confirmPassword !== form.newPassword) {
    errs.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }
  return errs
}

const validateSetPasswordForm = (form) => {
  const errs = {}
  if (!form.newPassword) {
    errs.newPassword = 'Vui lòng nhập mật khẩu mới.'
  } else if (form.newPassword.length < 6 || form.newPassword.length > 64) {
    errs.newPassword = 'Mật khẩu mới phải từ 6 đến 64 ký tự.'
  }
  if (!form.confirmPassword) {
    errs.confirmPassword = 'Vui lòng nhập xác nhận mật khẩu mới.'
  } else if (form.confirmPassword !== form.newPassword) {
    errs.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }
  return errs
}

// Nhận diện biểu tượng và màu sắc hiển thị theo tên môn từ API danh mục (không dùng catalog môn cố định)
const getSportVisual = (sportName = '') => {
  const lower = String(sportName || '').toLowerCase()
  if (lower.includes('cầu lông') || lower.includes('badminton')) return { icon: '🏸', color: '#15803D', bgColor: '#DCFCE7' }
  if (lower.includes('pickleball') || lower.includes('bóng bàn')) return { icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' }
  if (lower.includes('bóng đá') || lower.includes('football') || lower.includes('futsal')) return { icon: '⚽', color: '#2563EB', bgColor: '#EFF6FF' }
  if (lower.includes('bóng rổ') || lower.includes('basketball')) return { icon: '🏀', color: '#EA580C', bgColor: '#FFF7ED' }
  if (lower.includes('tennis') || lower.includes('quần vợt')) return { icon: '🎾', color: '#65A30D', bgColor: '#F7FEE7' }
  if (lower.includes('bóng chuyền') || lower.includes('volleyball')) return { icon: '🏐', color: '#F59E0B', bgColor: '#FEF3C7' }
  return { icon: '🏅', color: '#15803D', bgColor: '#DCFCE7' }
}

// Chuyển một môn từ backend sang dạng thẻ hiển thị (trình độ hiển thị lấy từ khảo sát/Elo GET /api/v1/ratings/me).
const toUiSport = (sport) => {
  const visual = getSportVisual(sport.name)
  return {
    id: String(sport.sportCategoryId),
    sportCategoryId: String(sport.sportCategoryId),
    name: sport.name || 'Môn thể thao',
    icon: visual.icon,
    level: skillLabel(sport.skillLevel) || 'Mới tập chơi',
    skillLevelEnum: String(sport.skillLevel || 'BEGINNER').toUpperCase(),
    field: 'Trình độ',
    color: visual.color,
    bgColor: visual.bgColor,
  }
}


// Nhãn nguồn biến động điểm Fair Play (FairPlayAdjustment.Source)
const FAIR_PLAY_SOURCES = {
  RATING: { label: 'Đánh giá từ bạn chơi', icon: 'star' },
  LATE: { label: 'Check-in muộn', icon: 'schedule' },
  NO_SHOW: { label: 'Vắng mặt', icon: 'person_off' },
  CANCEL: { label: 'Huỷ muộn', icon: 'event_busy' },
  RECOVERY: { label: 'Hồi điểm hằng ngày', icon: 'autorenew' },
  REPORT: { label: 'Xử lý khiếu nại', icon: 'flag' },
  ADMIN: { label: 'Quản trị viên điều chỉnh', icon: 'admin_panel_settings' },
}

function FairPlayHistoryRow({ item }) {
  const delta = Number(item.delta) || 0
  const up = delta >= 0
  const src = FAIR_PLAY_SOURCES[item.source] || { label: item.source, icon: 'sports_score' }
  const when = item.createdAt
    ? new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '16px',
        padding: '12px 16px',
        background: '#FAFCFA',
        border: '1px solid rgba(45, 95, 63, 0.1)',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: up ? '#DCFCE7' : '#FEE2E2',
          color: up ? '#15803D' : '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{src.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{src.label}</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
          {item.reason}{when && ` • ${when}`}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: up ? '#15803D' : '#DC2626' }}>
          {up ? '+' : ''}{delta}
        </div>
        {item.scoreAfter != null && (
          <div style={{ fontSize: '11px', color: '#6B7280' }}>còn {Number(item.scoreAfter)}/100</div>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Thông tin người chơi: tên, tên định danh, giới thiệu, SĐT, ảnh, tổng số trận lấy từ GET /api/auth/me.
  // Khu vực lấy từ khảo sát người chơi (tọa độ lưu ở BE), không sửa ở đây.
  const [profile, setProfile] = useState(() => {
    let local = {}
    try { local = JSON.parse(localStorage.getItem('player_profile_data') || '{}') } catch { /* bỏ qua */ }
    return {
      name: '',
      username: '',
      location: local.location || '',
      bio: '',
      joinDate: '',
      phone: '',
      email: '',
      avatarUrl: local.avatarUrl || localStorage.getItem('sportnexus_local_avatar') || null,
      reputationScore: null,
      totalReviews: 0,
      fairPlayScore: 100,
      matchesPlayed: 0,
      winRate: null,
      punctualityRate: null,
      hasPassword: true,
    }
  })

  // Môn thể thao & trình độ: GET/PUT /api/auth/me/sports + Elo / Khảo sát: GET /api/v1/ratings/me & /assessments/me
  const [sportsData, setSportsData] = useState([])
  const [sportCategories, setSportCategories] = useState([])
  const [eloBySport, setEloBySport] = useState({})
  const [assessmentBySport, setAssessmentBySport] = useState({})

  // Lưu profile khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_profile_data', JSON.stringify(profile))
  }, [profile])

  // Giữ bản sao môn đã chọn cho các trang khác đang đọc (SportContext, Onboarding)
  useEffect(() => {
    localStorage.setItem('player_sports_data', JSON.stringify(sportsData))
    window.dispatchEvent(new CustomEvent('player-sports-updated', { detail: sportsData }))
  }, [sportsData])

  // Trạng thái các Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddSportModal, setShowAddSportModal] = useState(false)
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false)
  const [showMatchesModal, setShowMatchesModal] = useState(false)
  // Lịch sử cộng / trừ điểm Fair Play của tôi (GET /api/v1/fair-play/me)
  const [fairPlayHistory, setFairPlayHistory] = useState([])
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [disabledNotifTypes, setDisabledNotifTypes] = useState([])
  const [loadingNotifSettings, setLoadingNotifSettings] = useState(false)
  const [savingNotifSettings, setSavingNotifSettings] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  /* ---------------- API States: Bookings, Reviews, Reports, Security ---------------- */
  // 1. Đặt sân của tôi (GET /api/v1/bookings/my-bookings)
  const [myBookings, setMyBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  // 2. Đánh giá sân của tôi (GET /api/v1/facility-reviews/my-reviews)
  const [myFacilityReviews, setMyFacilityReviews] = useState([])
  const [loadingFacilityReviews, setLoadingFacilityReviews] = useState(true)
  const [reviewTab, setReviewTab] = useState('fairplay') // 'fairplay' | 'facility'
  const [selectedFacilityReviewDetail, setSelectedFacilityReviewDetail] = useState(null)
  const [editingFacilityReview, setEditingFacilityReview] = useState(null)
  const [editFacilityComment, setEditFacilityComment] = useState('')
  const [editFacilityRating, setEditFacilityRating] = useState(5)

  // 3. Báo cáo / khiếu nại (GET /api/v1/reports/reasons & GET /reports/my-reports)
  const [reportReasons, setReportReasons] = useState([])
  const [myReports, setMyReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [supportTab, setSupportTab] = useState('info') // 'info' | 'create_report' | 'my_reports'
  const [newReportForm, setNewReportForm] = useState({ reasonId: '', description: '', bookingId: '', evidence: [] })
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)

  // 4. Tài khoản & Bảo mật (POST /change-password, POST /me/phone, POST /me/email/send-otp, POST /me/email/verify, POST /set-password, DELETE /api/auth/me)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [securityTab, setSecurityTab] = useState('password') // 'password' | 'phone' | 'email' | 'set_pwd' | 'delete'
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [phoneInput, setPhoneInput] = useState(profile.phone || '')
  const [emailOtp, setEmailOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [setPasswordFormData, setSetPasswordFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [setPwdErrors, setSetPwdErrors] = useState({})
  const [submittingSetPassword, setSubmittingSetPassword] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  // Tải đặt sân của tôi: GET /api/v1/bookings/my-bookings
  // fetchX: chỉ gọi API và cập nhật state khi có kết quả; loadX: bật trạng thái đang tải rồi gọi fetchX
  const fetchMyBookings = () =>
    getMyBookings()
      .then((data) => (Array.isArray(data) ? enrichPlayerBookings(data) : null))
      .then((enriched) => {
        if (enriched) setMyBookings(enriched)
      })
      .catch((err) => console.warn('[Profile] Lỗi lấy bookings:', err))
      .finally(() => setLoadingBookings(false))

  // Tải đánh giá cơ sở của tôi: GET /api/v1/facility-reviews/my-reviews
  const fetchMyFacilityReviews = () =>
    getMyFacilityReviews()
      .then((res) => setMyFacilityReviews(res?.items || res?.data || (Array.isArray(res) ? res : [])))
      .catch((err) => console.warn('[Profile] Lỗi lấy facility reviews:', err))
      .finally(() => setLoadingFacilityReviews(false))
  const loadMyFacilityReviews = () => {
    setLoadingFacilityReviews(true)
    return fetchMyFacilityReviews()
  }

  // Tải báo cáo / khiếu nại: GET /api/v1/reports/reasons & GET /reports/my-reports
  const fetchReportData = () =>
    Promise.all([getReportReasons('BOOKING').catch(() => []), getMyReports().catch(() => [])])
      .then(([reasons, reports]) => {
        if (Array.isArray(reasons)) setReportReasons(reasons)
        setMyReports(reports?.items || (Array.isArray(reports) ? reports : []))
      })
      .catch((err) => console.warn('[Profile] Lỗi tải dữ liệu khiếu nại:', err))
      .finally(() => setLoadingReports(false))
  const loadReportData = () => {
    setLoadingReports(true)
    return fetchReportData()
  }

  useEffect(() => {
    fetchMyBookings()
    fetchMyFacilityReviews()
    fetchReportData()
  }, [])

  // Tải avatar lên: POST /api/auth/me/avatar
  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      triggerToast('⚠️ Chỉ hỗ trợ ảnh đại diện định dạng JPG, PNG hoặc WEBP!')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('⚠️ Dung lượng ảnh đại diện không được vượt quá 5MB!')
      return
    }
    setAvatarUploading(true)
    try {
      const res = await uploadAvatar(file)
      const newUrl = (typeof res === 'string' ? res : (res?.avatarUrl || res?.url || res?.data?.avatarUrl || res?.data?.url)) || URL.createObjectURL(file)
      setProfile((prev) => ({ ...prev, avatarUrl: newUrl }))
      setEditForm((prev) => ({ ...prev, avatarUrl: newUrl }))
      window.dispatchEvent(new CustomEvent('player-profile-updated', { detail: { ...profile, avatarUrl: newUrl } }))
      triggerToast('🎉 Tải ảnh đại diện thành công!')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể tải ảnh đại diện'}`)
    } finally {
      setAvatarUploading(false)
    }
  }

  // Đổi mật khẩu: POST /api/auth/change-password (kiểm tra theo AccountRules BE: 6-64 ký tự, khác mật khẩu cũ, xác nhận khớp)
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault()
    const errs = validateChangePasswordForm(passwordForm)
    setPasswordErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmittingPassword(true)
    try {
      await changePassword(passwordForm)
      triggerToast('🎉 Đổi mật khẩu thành công!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
      setShowSecurityModal(false)
    } catch (err) {
      const msg = err?.message || 'Không thể đổi mật khẩu'
      const lower = String(msg).toLowerCase()
      if (lower.includes('cũ') || lower.includes('hiện tại') || lower.includes('old') || lower.includes('current') || lower.includes('không đúng') || lower.includes('sai')) {
        setPasswordErrors({ oldPassword: msg })
      } else {
        setPasswordErrors({ general: msg })
      }
      triggerToast(`⚠️ ${msg}`)
    } finally {
      setSubmittingPassword(false)
    }
  }

  // Đổi số điện thoại: gửi OTP Firebase tới số MỚI → nhập mã → POST /api/auth/me/phone { phone, firebaseIdToken }
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [phoneBusy, setPhoneBusy] = useState(false)
  const handleSendPhoneCode = async () => {
    if (!phoneInput.trim()) {
      triggerToast('⚠️ Vui lòng nhập số điện thoại mới')
      return
    }
    if (!isFirebasePhoneEnabled) {
      triggerToast('⚠️ Chưa cấu hình xác thực số điện thoại (Firebase). Vui lòng liên hệ quản trị viên.')
      return
    }
    setPhoneBusy(true)
    try {
      await sendPhoneCode(phoneInput.trim())
      setPhoneCodeSent(true)
      triggerToast('📩 Đã gửi mã OTP tới số điện thoại mới.')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không gửi được mã OTP'}`)
    } finally {
      setPhoneBusy(false)
    }
  }
  const handleUpdatePhone = async () => {
    if (!phoneOtp.trim()) {
      triggerToast('⚠️ Vui lòng nhập mã OTP')
      return
    }
    setPhoneBusy(true)
    try {
      const firebaseIdToken = await confirmPhoneCode(phoneInput.trim(), phoneOtp.trim())
      const res = await updatePhone({ phone: phoneInput.trim(), firebaseIdToken })
      clearPhoneVerification()
      setProfile((prev) => ({ ...prev, phone: res?.phone || phoneInput.trim() }))
      setPhoneCodeSent(false)
      setPhoneOtp('')
      triggerToast('🎉 Đã đổi số điện thoại thành công!')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Lỗi cập nhật số điện thoại'}`)
    } finally {
      setPhoneBusy(false)
    }
  }

  // Gửi OTP email: POST /api/auth/me/email/send-otp
  const handleSendEmailOtp = async () => {
    try {
      await sendEmailOtp()
      setOtpSent(true)
      triggerToast('📧 Đã gửi mã OTP đến email của bạn!')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể gửi OTP'}`)
    }
  }

  // Xác thực email: POST /api/auth/me/email/verify
  const handleVerifyEmail = async () => {
    if (!emailOtp.trim()) return
    try {
      await verifyEmail({ otpCode: emailOtp.trim() })
      triggerToast('🎉 Xác thực email thành công!')
      setEmailOtp('')
      setOtpSent(false)
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Mã OTP không hợp lệ'}`)
    }
  }

  // Thiết lập mật khẩu mới cho tài khoản Google/Facebook chưa có mật khẩu: POST /api/auth/set-password
  const handleSetPassword = async (e) => {
    if (e) e.preventDefault()
    const errs = validateSetPasswordForm(setPasswordFormData)
    setSetPwdErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmittingSetPassword(true)
    try {
      await setPassword(setPasswordFormData)
      triggerToast('🎉 Thiết lập mật khẩu thành công!')
      setSetPasswordFormData({ newPassword: '', confirmPassword: '' })
      setSetPwdErrors({})
      setProfile((prev) => ({ ...prev, hasPassword: true }))
      setSecurityTab('password')
      setShowSecurityModal(false)
    } catch (err) {
      const msg = err?.message || 'Không thể thiết lập mật khẩu'
      setSetPwdErrors({ general: msg })
      triggerToast(`⚠️ ${msg}`)
    } finally {
      setSubmittingSetPassword(false)
    }
  }

  // Mở modal cài đặt thông báo: GET /api/v1/notifications/settings
  const handleOpenNotificationModal = async () => {
    setShowNotificationModal(true)
    setLoadingNotifSettings(true)
    try {
      const data = await getNotificationSettings()
      if (data && Array.isArray(data.disabledTypes)) {
        setDisabledNotifTypes(data.disabledTypes)
      } else {
        const saved = localStorage.getItem('sportnexus_disabled_notif_types')
        if (saved) setDisabledNotifTypes(JSON.parse(saved))
      }
    } catch (err) {
      console.warn('[Profile] getNotificationSettings error:', err)
      try {
        const saved = localStorage.getItem('sportnexus_disabled_notif_types')
        if (saved) setDisabledNotifTypes(JSON.parse(saved))
      } catch { /* bỏ qua */ }
    } finally {
      setLoadingNotifSettings(false)
    }
  }

  // Lưu cài đặt thông báo: PUT /api/v1/notifications/settings
  const handleSaveNotificationSettings = async () => {
    setSavingNotifSettings(true)
    try {
      await updateNotificationSettings({ disabledTypes: disabledNotifTypes })
      localStorage.setItem('sportnexus_disabled_notif_types', JSON.stringify(disabledNotifTypes))
      triggerToast('✅ Đã lưu cài đặt thông báo!')
      setShowNotificationModal(false)
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể lưu cài đặt thông báo'}`)
    } finally {
      setSavingNotifSettings(false)
    }
  }

  // Đăng xuất khỏi tất cả thiết bị: POST /api/auth/logout-all
  const handleLogoutAll = async () => {
    if (!(await confirmDialog('Đăng xuất tài khoản khỏi tất cả thiết bị (kể cả thiết bị này)?'))) return
    try {
      await logoutAllDevices()
      logout()
      navigate('/login')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể đăng xuất các thiết bị'}`)
    }
  }

  // Xóa tài khoản vĩnh viễn: DELETE /api/auth/me
  const handleDeleteAccount = async () => {
    if (!(await confirmDialog('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản SportNexus không? Dữ liệu không thể khôi phục!'))) return
    try {
      await deleteMyAccount()
      triggerToast('Tài khoản đã được xóa.')
      // Xóa phiên đăng nhập (AuthContext) rồi về trang đăng nhập
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể xóa tài khoản'}`)
    }
  }

  // Tạo báo cáo / khiếu nại: POST /api/v1/reports
  const handleCreateReport = async (e) => {
    if (e) e.preventDefault()
    if (!newReportForm.description || newReportForm.description.trim().length < 10) {
      triggerToast('⚠️ Vui lòng nhập mô tả khiếu nại tối thiểu 10 ký tự!')
      return
    }
    if (!newReportForm.bookingId) {
      triggerToast('⚠️ Vui lòng chọn đơn đặt sân cần khiếu nại!')
      return
    }
    const reason = newReportForm.reasonId || reportReasons[0]?.code
    if (!reason) {
      triggerToast('⚠️ Vui lòng chọn lý do khiếu nại!')
      return
    }
    setSubmittingReport(true)
    try {
      // POST /api/v1/reports: CreateReportRequest { targetType, bookingId, reason (mã lý do), description, evidenceImageUrls }
      await createReport({
        targetType: 'BOOKING',
        bookingId: newReportForm.bookingId,
        reason,
        description: newReportForm.description.trim(),
        evidenceImageUrls: newReportForm.evidence,
      })
      triggerToast('🎉 Đã gửi khiếu nại thành công tới Ban Quản Trị!')
      setNewReportForm({ reasonId: '', description: '', bookingId: '', evidence: [] })
      loadReportData()
      setSupportTab('my_reports')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể gửi khiếu nại'}`)
    } finally {
      setSubmittingReport(false)
    }
  }

  // Rút khiếu nại: POST /{reportId}/withdraw
  const handleWithdrawReport = async (reportId) => {
    if (!(await confirmDialog('Bạn có chắc chắn muốn rút khiếu nại này không?'))) return
    try {
      await withdrawReport(reportId)
      triggerToast('Đã rút khiếu nại thành công.')
      loadReportData()
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể rút khiếu nại'}`)
    }
  }

  // Xóa đánh giá cơ sở: DELETE /api/v1/facility-reviews/{reviewId}
  const handleDeleteFacilityReview = async (reviewId) => {
    if (!(await confirmDialog('Bạn có chắc chắn muốn xóa đánh giá cơ sở này không?'))) return
    try {
      await deleteFacilityReview(reviewId)
      triggerToast('Đã xóa đánh giá cơ sở.')
      loadMyFacilityReviews()
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể xóa đánh giá'}`)
    }
  }

  // Cập nhật đánh giá cơ sở: PUT /api/v1/facility-reviews/{reviewId}
  const handleUpdateFacilityReview = async (reviewId) => {
    if (!editFacilityComment || editFacilityComment.trim().length < 10) {
      triggerToast('⚠️ Vui lòng nhập nội dung đánh giá tối thiểu 10 ký tự!')
      return
    }
    try {
      await updateFacilityReview(reviewId, {
        rating: editFacilityRating,
        comment: editFacilityComment.trim(),
      })
      triggerToast('Đã cập nhật đánh giá cơ sở thành công!')
      setEditingFacilityReview(null)
      loadMyFacilityReviews()
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể cập nhật đánh giá'}`)
    }
  }

  // Xem chi tiết đánh giá cơ sở: GET /api/v1/facility-reviews/{reviewId}
  const handleViewFacilityReviewDetail = async (review) => {
    const rId = review.id || review.reviewId
    setSelectedFacilityReviewDetail(review)
    try {
      if (rId) {
        const detail = await getFacilityReviewById(rId)
        if (detail) setSelectedFacilityReviewDetail(detail)
      }
    } catch (e) {
      console.warn('[Profile] getFacilityReviewById notice:', e)
    }
  }

  // Form edit profile tạm thời
  const [editForm, setEditForm] = useState({ ...profile })

  // Form thêm môn thể thao mới (danh sách môn lấy từ API /api/v1/master-data/sports)
  const [newSportForm, setNewSportForm] = useState({
    sportCategoryId: '',
  })

  // Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Tải hồ sơ, điểm Fair Play, số trận, Elo và danh sách môn từ backend khi mở trang
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getMyProfile(), getMyFairPlay()]).then(([me, fairPlay]) => {
      if (cancelled) return
      const u = me.status === 'fulfilled' ? me.value || {} : {}
      const fp = fairPlay.status === 'fulfilled' ? fairPlay.value || {} : {}
      const rawRating = fp.averageRating ?? fp.avgRating ?? fp.ratingScore ?? u.averageRating ?? null
      const parsedRating = rawRating !== null && rawRating !== '' ? Number(rawRating) : NaN
      const ratingCount = Number(fp.ratingCount ?? fp.totalRatings ?? u.ratingCount) || 0
      const fpScore = fp.fairPlayScore ?? fp.score ?? u.fairPlayScore ?? null
      const created = u.createdAt ? new Date(u.createdAt) : null
      const hasPassword = u.hasPassword !== false
      setProfile((prev) => ({
        ...prev,
        name: u.fullName || prev.name,
        username: u.username ? `@${u.username}` : prev.username,
        bio: u.bio ?? prev.bio,
        phone: u.phone || u.phoneNumber || prev.phone,
        email: u.email || prev.email,
        avatarUrl: u.avatarUrl || prev.avatarUrl,
        joinDate: created ? `Tháng ${String(created.getMonth() + 1).padStart(2, '0')}/${created.getFullYear()}` : prev.joinDate,
        // GET /api/v1/fair-play/me: averageRating (sao 1-5 khi đã có lượt chấm), ratingCount, fairPlayScore (thang 100)
        reputationScore: ratingCount > 0 && Number.isFinite(parsedRating) && parsedRating > 0
          ? Math.round(parsedRating * 10) / 10
          : null,
        totalReviews: ratingCount,
        fairPlayScore: fpScore != null && Number.isFinite(Number(fpScore)) ? Math.round(Number(fpScore) * 10) / 10 : 100,
        // Tổng số trận = số lần đã check-in (đặt sân, kèo, giải), BE đếm
        matchesPlayed: Number(u.matchesPlayed) || 0,
        winRate: u.winRate != null && Number.isFinite(Number(u.winRate)) ? Number(u.winRate) : null,
        punctualityRate: u.punctualityRate != null && Number.isFinite(Number(u.punctualityRate)) ? Number(u.punctualityRate) : null,
        hasPassword,
      }))
      setSecurityTab((prev) => {
        if (!hasPassword && prev === 'password') return 'set_pwd'
        if (hasPassword && prev === 'set_pwd') return 'password'
        return prev
      })
      setFairPlayHistory(Array.isArray(fp.history?.items) ? fp.history.items : (Array.isArray(fp.adjustments) ? fp.adjustments : []))
      if (u.phone || u.phoneNumber) setPhoneInput(u.phone || u.phoneNumber)
      if (me.status === 'rejected') triggerToast(`⚠️ ${me.reason?.message || 'Không tải được hồ sơ.'}`)
    })
    Promise.allSettled([getMySports(), getSportCategories(), getMyRatings(), getMyAssessments()])
      .then(([mineRes, categoriesRes, ratingsRes, assessmentsRes]) => {
        if (cancelled) return
        const mine = mineRes.status === 'fulfilled' && Array.isArray(mineRes.value) ? mineRes.value : []
        const categories = categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value) ? categoriesRes.value : []
        const ratings = ratingsRes.status === 'fulfilled' && Array.isArray(ratingsRes.value) ? ratingsRes.value : []
        const assessments = assessmentsRes.status === 'fulfilled' && Array.isArray(assessmentsRes.value) ? assessmentsRes.value : []

        setSportCategories(categories)
        setSportsData(mine.map(toUiSport))
        setEloBySport(
          Object.fromEntries(
            ratings
              .filter((r) => String(r.ownerType).toUpperCase() !== 'TEAM' && String(r.ratingType).toUpperCase() !== 'TEAM')
              .map((r) => [String(r.sportCategoryId), r])
          )
        )
        setAssessmentBySport(
          Object.fromEntries(assessments.map((a) => [String(a.sportCategoryId), a]))
        )
      })
    return () => { cancelled = true }
  }, [])

  // Lưu danh sách môn lên backend; chỉ cập nhật giao diện khi lưu thành công.
  const saveSports = async (next, successText) => {
    const missing = next.find((s) => !s.sportCategoryId)
    if (missing) {
      triggerToast(`⚠️ Môn "${missing.name}" chưa có trong danh mục của hệ thống.`)
      return false
    }
    try {
      await updateMySports(
        next.map((s) => ({
          sportCategoryId: s.sportCategoryId,
          skillLevel: assessmentBySport[String(s.sportCategoryId)]?.skillLevel || s.skillLevelEnum || s.level || 'BEGINNER',
        }))
      )
      setSportsData(next)
      if (successText) triggerToast(successText)
      return true
    } catch (error) {
      triggerToast(`⚠️ ${error?.message || 'Không lưu được môn thể thao.'}`)
      return false
    }
  }

  // Mở modal thêm môn thể thao mới (lấy từ danh mục API sportCategories)
  const handleOpenAddSportModal = () => {
    const available = sportCategories.find(
      (c) => !sportsData.some((s) => String(s.sportCategoryId) === String(c.id))
    )
    setNewSportForm({
      sportCategoryId: available ? String(available.id) : (sportCategories[0]?.id ? String(sportCategories[0].id) : ''),
    })
    setShowAddSportModal(true)
  }

  // Lưu môn thể thao mới lên backend (PUT /api/auth/me/sports)
  const handleSaveNewSport = async () => {
    const category = sportCategories.find((c) => String(c.id) === String(newSportForm.sportCategoryId))
    if (!category) {
      triggerToast('⚠️ Vui lòng chọn một môn thể thao trong danh mục hệ thống!')
      return
    }

    const isDuplicate = sportsData.some(
      (s) => String(s.sportCategoryId) === String(category.id) || s.name.toLowerCase() === category.name.toLowerCase()
    )
    if (isDuplicate) {
      triggerToast(`⚠️ Môn "${category.name}" đã có sẵn trong danh sách kỹ năng của bạn!`)
      return
    }

    const assessed = assessmentBySport[String(category.id)]
    const visual = getSportVisual(category.name)
    const newSport = {
      sportCategoryId: String(category.id),
      id: String(category.id),
      name: category.name,
      icon: visual.icon,
      level: assessed?.skillLevel ? skillLabel(assessed.skillLevel) : 'Mới tập chơi',
      skillLevelEnum: String(assessed?.skillLevel || 'BEGINNER').toUpperCase(),
      field: 'Trình độ',
      color: visual.color,
      bgColor: visual.bgColor,
    }

    if (await saveSports([...sportsData, newSport], `🎉 Đã thêm môn ${newSport.name} vào hồ sơ!`)) {
      setShowAddSportModal(false)
    }
  }

  // Xóa môn thể thao khỏi danh sách kỹ năng: PUT /api/auth/me/sports (cho phép xóa cả môn cuối cùng)
  const handleDeleteSport = async (sport) => {
    if ((await confirmDialog(`Bạn có chắc chắn muốn xóa môn "${sport.name}" khỏi danh sách trình độ kỹ năng?`))) {
      saveSports(sportsData.filter((s) => s.id !== sport.id), `🗑️ Đã xóa môn ${sport.name} khỏi danh sách kỹ năng.`)
    }
  }

  // Lưu Form Edit Profile
  const handleSaveProfile = async () => {
    if (!editForm.name?.trim()) {
      triggerToast('⚠️ Vui lòng nhập họ tên.')
      return
    }
    // Họ tên, tên định danh (tên đăng nhập) và giới thiệu lưu lên backend (PUT /api/auth/me).
    // SĐT đổi ở "Bảo mật tài khoản" (xác thực OTP), tổng số trận do hệ thống đếm, khu vực lấy từ khảo sát.
    const username = (editForm.username || '').trim().replace(/^@/, '')
    let saved
    try {
      saved = await updateMyProfile({ fullName: editForm.name.trim(), avatarUrl: profile.avatarUrl ?? null, username: username || undefined, bio: editForm.bio ?? '' })
    } catch (error) {
      triggerToast(`⚠️ ${error?.message || 'Không cập nhật được hồ sơ.'}`)
      return
    }
    setProfile((prev) => ({
      ...prev,
      name: saved?.fullName || editForm.name.trim(),
      username: saved?.username ? `@${saved.username}` : prev.username,
      bio: saved?.bio ?? '',
    }))
    window.dispatchEvent(new CustomEvent('player-profile-updated', { detail: { name: saved?.fullName || editForm.name.trim() } }))
    setShowEditModal(false)
    const usernameChanged = saved?.username && `@${saved.username}` !== profile.username
    triggerToast(usernameChanged
      ? `✅ Đã lưu hồ sơ. Từ nay đăng nhập bằng tên đăng nhập mới: ${saved.username}`
      : '✅ Cập nhật thông tin hồ sơ người chơi thành công!')
  }

  return (
    <div className="snx-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            right: '28px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(21, 128, 61, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER THANH TIÊU ĐỀ: Đồng bộ hệ sinh thái SportNexus */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '14px 20px',
          borderRadius: '18px',
          border: '1px solid rgba(45, 95, 63, 0.12)',
          boxShadow: '0 4px 16px rgba(45, 95, 63, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowSecurityModal(true)}
            title="Bảo mật & Cài đặt tài khoản"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB'
              e.currentTarget.style.borderColor = '#15803D'
              e.currentTarget.style.color = '#15803D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF'
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.color = '#374151'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              settings
            </span>
          </button>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: '#1C3524',
                letterSpacing: '-0.4px',
              }}
            >
              Hồ sơ người chơi
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '12.5px',
                color: '#6B7280',
                fontWeight: 500,
              }}
            >
              Định danh vận động viên &amp; Hệ thống hồ sơ thể thao SportNexus
            </p>
          </div>
        </div>

        {/* Action Button: Chỉnh sửa hồ sơ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setEditForm({ ...profile })
              setShowEditModal(true)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 128, 61, 0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              edit_square
            </span>
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        </div>
      </div>

      {/* GRID 2 CỘT RESPONSIVE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 420px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
        className="profile-responsive-grid"
      >
        {/* ===================== CỘT BÊN TRÁI ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CARD 1: HERO PROFILE CARD */}
          <div
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F6FAF7 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 10px 30px rgba(45, 95, 63, 0.06)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Header dải màu trang trí phía trên - Đã xóa mục ID */}
            <div
              style={{
                height: '88px',
                background:
                  'linear-gradient(135deg, #15803D 0%, #22C55E 60%, #86EFAC 100%)',
                position: 'relative',
              }}
            />

            {/* Nội dung bên trong Hero Card */}
            <div style={{ padding: '0 22px 22px 22px', position: 'relative' }}>
              {/* Avatar + Badge uy tín */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: '-44px',
                  marginBottom: '14px',
                }}
              >
                {/* Avatar container - Đồng bộ avatar với TopBar và CommunityFeed */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileSelected}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    title="Nhấn để tải lên ảnh đại diện mới (POST /api/auth/me/avatar)"
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      padding: '4px',
                      background: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(45, 95, 63, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background:
                            'linear-gradient(135deg, #1B4D2E 0%, #2D5F3F 50%, #15803D 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '28px',
                          letterSpacing: '-0.5px',
                          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.25)',
                        }}
                      >
                        {initialsOf(profile.name)}
                      </div>
                    )}

                    {/* Camera icon overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: avatarUploading ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        color: '#fff',
                        borderRadius: '50%',
                      }}
                      onMouseEnter={(e) => {
                        if (!avatarUploading) e.currentTarget.style.background = 'rgba(0,0,0,0.38)'
                      }}
                      onMouseLeave={(e) => {
                        if (!avatarUploading) e.currentTarget.style.background = 'rgba(0,0,0,0)'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', opacity: avatarUploading ? 1 : 0.85 }}>
                        {avatarUploading ? 'progress_activity' : 'photo_camera'}
                      </span>
                    </div>
                  </div>
                  {/* Chấm tròn online / verified xanh lá góc dưới */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#10B981',
                      }}
                    />
                  </span>
                </div>

                {/* Badge: Người chơi uy tín (GET /api/v1/fair-play/me) */}
                <div
                  onClick={() => setShowAllReviewsModal(true)}
                  title="Nhấn để xem chi tiết điểm Fair Play & đánh giá"
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#15803D',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#EAB308' }}>★</span>
                  {profile.totalReviews > 0 && profile.reputationScore != null ? (
                    <span>Người chơi uy tín {profile.reputationScore} ★ ({profile.totalReviews})</span>
                  ) : (
                    <span>Người chơi uy tín • Chưa có đánh giá</span>
                  )}
                </div>
              </div>

              {/* Tên & Thông tin người chơi: Minh Minh Minh */}
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#1C3524',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {profile.name}
                </h2>
                <p
                  style={{
                    margin: '3px 0 10px 0',
                    fontSize: '13.5px',
                    color: '#15803D',
                    fontWeight: 600,
                  }}
                >
                  {profile.username}
                </p>

                {/* Meta info: Vị trí & Ngày gia nhập */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#4B5563',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6B7280' }}>
                      location_on
                    </span>
                    <span>{profile.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6B7280' }}>
                      calendar_month
                    </span>
                    <span>Gia nhập: {profile.joinDate}</span>
                  </div>
                </div>

                {/* Bio tóm tắt */}
                {profile.bio && (
                  <div
                    style={{
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#4B5563',
                      lineHeight: 1.45,
                      marginBottom: '18px',
                      borderLeft: '3px solid #15803D',
                    }}
                  >
                    {profile.bio}
                  </div>
                )}
              </div>

              {/* THẺ THỐNG KÊ NHANH (Ẩn Tỷ lệ thắng & Đúng giờ khi BE chưa trả thống kê) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${1 + (profile.winRate != null ? 1 : 0) + (profile.punctualityRate != null ? 1 : 0)}, 1fr)`,
                  gap: '10px',
                  background: '#F0FDF4',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  border: '1px solid #DCFCE7',
                }}
              >
                {/* 1. Trận đã đấu (lấy từ GET /api/auth/me matchesPlayed) */}
                <div
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onClick={() => setShowMatchesModal(true)}
                  title="Nhấn để xem lịch sử đặt sân"
                >
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.1,
                    }}
                  >
                    {profile.matchesPlayed}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4B5563',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    Trận đã đấu
                  </div>
                </div>

                {/* 2. Tỷ lệ thắng (chỉ hiển thị nếu BE trả về winRate) */}
                {profile.winRate != null && (
                  <div
                    style={{
                      textAlign: 'center',
                      borderLeft: '1px solid #D1FAE5',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#15803D',
                        lineHeight: 1.1,
                      }}
                    >
                      {profile.winRate}%
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#4B5563',
                        fontWeight: 600,
                        marginTop: '4px',
                      }}
                    >
                      Tỷ lệ thắng
                    </div>
                  </div>
                )}

                {/* 3. Đúng giờ (chỉ hiển thị nếu BE trả về punctualityRate) */}
                {profile.punctualityRate != null && (
                  <div
                    style={{
                      textAlign: 'center',
                      borderLeft: '1px solid #D1FAE5',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#15803D',
                        lineHeight: 1.1,
                      }}
                    >
                      {profile.punctualityRate}%
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#4B5563',
                        fontWeight: 600,
                        marginTop: '4px',
                      }}
                    >
                      Đúng giờ
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3: TÀI KHOẢN & TIỆN ÍCH */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(45, 95, 63, 0.12)',
              boxShadow: '0 4px 16px rgba(45, 95, 63, 0.04)',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: 800,
                color: '#1C3524',
              }}
            >
              Tài khoản &amp; Tiện ích
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. Lịch sử đặt sân */}
              <div
                onClick={() => setShowMatchesModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      flag
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Lịch sử đặt sân
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                    {myBookings.length} đơn
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                    chevron_right
                  </span>
                </div>
              </div>

              {/* 2. Cài đặt thông báo (GET/PUT /api/v1/notifications/settings) */}
              <div
                onClick={handleOpenNotificationModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      notifications
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Cài đặt thông báo
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                  chevron_right
                </span>
              </div>

              {/* 4. Trung tâm hỗ trợ */}
              <div
                onClick={() => setShowHelpModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      support_agent
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Trung tâm hỗ trợ
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                  chevron_right
                </span>
              </div>

              {/* 5. Bảo mật & Quản lý tài khoản */}
              <div
                onClick={() => setShowSecurityModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#86EFAC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      shield
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Bảo mật &amp; Quản lý tài khoản
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                  chevron_right
                </span>
              </div>

              {/* 6. Đăng xuất */}
              <div
                onClick={() => setShowLogoutModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#FEF2F2',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #FEE2E2',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEE2E2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEF2F2'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>
                      logout
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>
                    Đăng xuất
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#DC2626' }}>
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CỘT BÊN PHẢI ===================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PHẦN 1: TRÌNH ĐỘ KỸ NĂNG */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 8px 24px rgba(45, 95, 63, 0.05)',
            }}
          >
            {/* Header: Icon + Trình độ & Nút Thêm Môn Thể Thao */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#15803D' }}>
                  workspace_premium
                </span>
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1C3524',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Trình độ kỹ năng ({sportsData.length} môn)
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/assessment')}
                  title="Làm khảo sát câu hỏi theo môn để tính điểm Elo khởi đầu"
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#15803D',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ĐÁNH GIÁ KỸ NĂNG (ELO)
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddSportModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 5px 14px rgba(21, 128, 61, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Thêm môn thể thao
                </button>
              </div>
            </div>

            {/* Banner hướng dẫn (info box) */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: '#15803D', flexShrink: 0, marginTop: '1px' }}
              >
                info
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#166534',
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                Trình độ hiển thị và điểm Elo được lấy từ bài Khảo sát toàn diện theo môn (không tự chỉnh sửa thủ công; muốn thay đổi trình độ cần làm lại khảo sát sau 90 ngày).
              </p>
            </div>

            {/* DANH SÁCH MÔN THỂ THAO TỪ API GET /api/auth/me/sports & GET /api/v1/ratings/me */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sportsData.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    borderRadius: '18px',
                    background: '#F9FAFB',
                    border: '1.5px dashed #86EFAC',
                    color: '#6B7280',
                    fontSize: '13.5px',
                  }}
                >
                  Bạn chưa thêm môn thể thao nào vào hồ sơ. Nhấn <strong>&quot;+ Thêm môn thể thao&quot;</strong> ở góc trên để bắt đầu.
                </div>
              ) : (
                sportsData.map((sport) => {
                  const elo = eloBySport[String(sport.sportCategoryId)]
                  const assessed = assessmentBySport[String(sport.sportCategoryId)]
                  const hasElo = Boolean(elo || assessed)
                  const eloScore = elo?.rating ?? assessed?.assignedRating ?? null
                  const displayLevel = assessed?.skillLevel
                    ? skillLabel(assessed.skillLevel)
                    : (elo?.rank || (hasElo ? `Elo ${eloScore}` : 'Chưa khảo sát'))
                  const ratedMatchesCount = Number(elo?.ratedMatches) || 0

                  return (
                    <div
                      key={sport.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '18px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(45, 95, 63, 0.12)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#15803D'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 128, 61, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(45, 95, 63, 0.12)'
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Left: Sport Icon + Name & Level */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '14px',
                            background: sport.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          {sport.icon}
                        </div>

                        <div>
                          {/* Tên môn + Badge Trạng thái từ API Elo / Khảo sát */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '15.5px',
                                fontWeight: 800,
                                color: '#1C3524',
                              }}
                            >
                              {sport.name}
                            </span>
                            {hasElo ? (
                              <span
                                style={{
                                  background: '#DCFCE7',
                                  color: '#15803D',
                                  border: '1px solid #86EFAC',
                                  borderRadius: '12px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                }}
                              >
                                Elo {eloScore}{elo?.rank ? ` · ${elo.rank}` : ''}
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                  borderRadius: '12px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                Chưa khảo sát Elo
                              </span>
                            )}
                          </div>

                          {/* Subtext: Trình độ từ Khảo sát/Elo & Số trận tính Elo từ BE */}
                          <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>
                              {sport.field}: <strong style={{ color: hasElo ? '#1F2937' : '#6B7280' }}>{displayLevel}</strong>
                            </span>
                            <span style={{ color: '#D1D5DB' }}>•</span>
                            <span style={{ background: '#F3F4F6', color: '#374151', padding: '1px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                              {ratedMatchesCount} trận tính Elo
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action buttons (Khảo sát Elo & Xóa môn — cho phép xóa cả môn cuối cùng) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/assessment?sportId=${encodeURIComponent(sport.sportCategoryId)}`)}
                          title="Trình độ được xác định từ bài khảo sát toàn diện (làm lại sau 90 ngày)"
                          style={{
                            background: '#FFFFFF',
                            color: '#15803D',
                            border: '1px solid #86EFAC',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#DCFCE7'
                            e.currentTarget.style.borderColor = '#15803D'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#86EFAC'
                          }}
                        >
                          {hasElo ? 'Khảo sát lại (90 ngày)' : 'Làm khảo sát Elo'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSport(sport)}
                          title={`Xóa môn ${sport.name} khỏi danh sách kỹ năng`}
                          style={{
                            background: '#F9FAFB',
                            color: '#9CA3AF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEE2E2'
                            e.currentTarget.style.borderColor = '#FCA5A5'
                            e.currentTarget.style.color = '#DC2626'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F9FAFB'
                            e.currentTarget.style.borderColor = '#E5E7EB'
                            e.currentTarget.style.color = '#9CA3AF'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* PHẦN 2: ĐÁNH GIÁ SAU TRẬN */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(45, 95, 63, 0.14)',
              boxShadow: '0 8px 24px rgba(45, 95, 63, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#15803D' }}>
                  forum
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1C3524',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Đánh giá sau trận
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/post-match-rating')}
                  style={{
                    background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                    rate_review
                  </span>
                  <span>Viết đánh giá sau trận</span>
                </button>

                <button
                  onClick={() => setShowAllReviewsModal(true)}
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    borderRadius: '12px',
                    padding: '7px 12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Tất cả ({fairPlayHistory.length})</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* Banner quy định đánh giá sau trận */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#475569',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#15803D' }}>
                  verified_user
                </span>
                <span>
                  <strong>Quy chuẩn đánh giá:</strong> Bạn chỉ được <u>chấm sao Fair Play</u> cho người chơi <strong>đã cùng check-in trong trận</strong>; điểm Fair Play thay đổi theo đánh giá nhận được, đến muộn, vắng mặt và huỷ muộn.
                </span>
              </div>
              <span
                style={{
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  border: '1px solid #86EFAC',
                }}
              >
                ✓ Xác thực bằng Check-in
              </span>
            </div>

            {/* Lịch sử điểm Fair Play gần nhất */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {fairPlayHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '16px', fontSize: '13px', color: '#6B7280' }}>
                  Chưa có biến động điểm Fair Play nào.
                </div>
              ) : (
                fairPlayHistory.slice(0, 3).map((item) => <FairPlayHistoryRow key={item.id} item={item} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CÁC MODAL TƯƠNG TÁC ===================== */}

      {/* 1. MODAL CHỈNH SỬA HỒ SƠ */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Chỉnh sửa thông tin người chơi
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Tên định danh (Handle)
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Số điện thoại
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    background: '#F9FAFB',
                    color: '#4B5563',
                  }}
                >
                  {profile.phone || 'Chưa có số điện thoại'}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Đổi số trong mục "Bảo mật tài khoản" (cần xác thực mã OTP gửi tới số mới).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Tổng số trận đã đấu
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    background: '#F9FAFB',
                    color: '#4B5563',
                  }}
                >
                  {profile.matchesPlayed ?? 0}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Hệ thống tự đếm theo số lần check-in (đặt sân, kèo, giải đấu).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Giới thiệu bản thân (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  maxLength={500}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL THÊM MÔN THỂ THAO TỪ DANH MỤC API */}
      {showAddSportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  🏅
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                    Thêm môn thể thao
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                    Danh sách môn lấy trực tiếp từ danh mục hệ thống SportNexus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Chọn môn thể thao từ danh mục hệ thống */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  Chọn môn thể thao
                </label>
                <select
                  value={newSportForm.sportCategoryId}
                  onChange={(e) =>
                    setNewSportForm({
                      ...newSportForm,
                      sportCategoryId: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  {sportCategories.length === 0 && (
                    <option value="">Đang tải danh mục môn thể thao...</option>
                  )}
                  {sportCategories.map((cat) => {
                    const catId = String(cat.id ?? cat.sportCategoryId ?? '')
                    const catName = cat.name || cat.sportCategoryName || 'Môn thể thao'
                    const visual = getSportVisual(catName)
                    const alreadyHas = sportsData.some(
                      (s) =>
                        String(s.sportCategoryId ?? s.id) === catId ||
                        (s.name || '').toLowerCase() === catName.toLowerCase(),
                    )
                    return (
                      <option key={catId} value={catId} disabled={alreadyHas}>
                        {visual.icon} {catName} {alreadyHas ? '(Đã có trong hồ sơ)' : ''}
                      </option>
                    )
                  })}
                </select>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#6B7280', lineHeight: 1.45 }}>
                  💡 Trình độ và điểm Elo hiển thị trên hồ sơ được xác định từ bài <strong>Khảo sát toàn diện theo môn</strong> (không tự sửa thủ công; có thể làm lại khảo sát sau 90 ngày).
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddSportModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewSport}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                }}
              >
                Thêm môn thể thao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL XEM TẤT CẢ ĐÁNH GIÁ */}
      {showAllReviewsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                    Trung tâm Đánh Giá ({reviewTab === 'fairplay' ? fairPlayHistory.length : myFacilityReviews.length})
                  </h3>
                  {reviewTab === 'fairplay' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllReviewsModal(false)
                        navigate('/post-match-rating')
                      }}
                      style={{
                        background: '#15803D',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        rate_review
                      </span>
                      Viết đánh giá
                    </button>
                  )}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  {reviewTab === 'fairplay'
                    ? 'Lịch sử cộng / trừ điểm Fair Play của bạn (đánh giá, đến muộn, vắng mặt, huỷ muộn, hồi điểm)'
                    : 'Các nhận xét & đánh giá chất lượng cơ sở sân đấu bạn đã trải nghiệm'}
                </p>
              </div>

              <button
                onClick={() => setShowAllReviewsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* TAB CHUYỂN ĐỔI: Đánh giá người chơi vs Đánh giá sân đấu */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                background: '#F3F4F6',
                padding: '4px',
                borderRadius: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => setReviewTab('fairplay')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: reviewTab === 'fairplay' ? '#FFFFFF' : 'transparent',
                  color: reviewTab === 'fairplay' ? '#15803D' : '#6B7280',
                  boxShadow: reviewTab === 'fairplay' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  sports_score
                </span>
                Điểm Fair Play ({fairPlayHistory.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewTab('facility')
                  loadMyFacilityReviews()
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: reviewTab === 'facility' ? '#FFFFFF' : 'transparent',
                  color: reviewTab === 'facility' ? '#15803D' : '#6B7280',
                  boxShadow: reviewTab === 'facility' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  stadium
                </span>
                Đánh giá cơ sở sân ({myFacilityReviews.length})
              </button>
            </div>

            {/* TAB 1: REVIEW TỪ BẠN CHƠI FAIR PLAY */}
            {reviewTab === 'fairplay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fairPlayHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', background: '#F9FAFB', borderRadius: '16px', fontSize: '13px', color: '#6B7280' }}>
                    Chưa có biến động điểm Fair Play nào.
                  </div>
                ) : (
                  fairPlayHistory.map((item) => <FairPlayHistoryRow key={item.id} item={item} />)
                )}
              </div>
            )}

            {/* TAB 2: ĐÁNH GIÁ CƠ SỞ CỦA TÔI (GET/PUT/DELETE /api/v1/facility-reviews) */}
            {reviewTab === 'facility' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingFacilityReviews ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '28px' }}>
                      sync
                    </span>
                    <p style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải đánh giá cơ sở...</p>
                  </div>
                ) : myFacilityReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', background: '#F9FAFB', borderRadius: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#9CA3AF' }}>
                      rate_review
                    </span>
                    <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: '#374151' }}>
                      Chưa có đánh giá cơ sở sân nào
                    </h4>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                      Sau khi hoàn thành buổi chơi tại sân, bạn có thể gửi đánh giá chất lượng mặt sân, ánh sáng và tiện ích tại mục Đánh Giá Trận Đấu.
                    </p>
                  </div>
                ) : (
                  myFacilityReviews.map((rev, idx) => {
                    const rId = rev.id || rev.reviewId || idx
                    const facilityTitle = rev.facilityName || rev.facility?.name || 'Cơ sở SportNexus'
                    const ratingScore = rev.rating || rev.stars || 5
                    const commentText = rev.comment || rev.content || 'Đã đánh giá chất lượng sân tốt.'
                    const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'

                    return (
                      <div
                        key={rId}
                        style={{
                          borderRadius: '16px',
                          padding: '14px 16px',
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: '#E0F2FE',
                                color: '#0284C7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                stadium
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                                {facilityTitle}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                                Ngày đánh giá: {reviewDate}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', color: '#EAB308', fontSize: '13px' }}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: i < ratingScore ? '#EAB308' : '#D1D5DB' }}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937' }}>
                              {ratingScore}/5
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: '#374151', padding: '8px 12px', background: '#F9FAFB', borderRadius: '10px', marginBottom: '10px' }}>
                          “{commentText}”
                        </div>

                        {rev.response && (
                          <div style={{ fontSize: '12px', color: '#15803D', background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid #15803D' }}>
                            <strong>Phản hồi từ chủ sân:</strong> {rev.response}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleViewFacilityReviewDetail(rev)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid #D1D5DB',
                              background: '#FFFFFF',
                              color: '#374151',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              visibility
                            </span>
                            Xem chi tiết
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingFacilityReview(rev)
                              setEditFacilityRating(ratingScore)
                              setEditFacilityComment(commentText)
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid #93C5FD',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              edit
                            </span>
                            Chỉnh sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFacilityReview(rId)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: '1px solid #FECACA',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              delete
                            </span>
                            Xóa
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* MODAL CON: CHI TIẾT ĐÁNH GIÁ CƠ SỞ (GET /api/v1/facility-reviews/{id}) */}
            {selectedFacilityReviewDetail && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#15803D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      info
                    </span>
                    Chi Tiết Đánh Giá: {selectedFacilityReviewDetail.facilityName || 'Cơ sở'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedFacilityReviewDetail(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
                <div style={{ fontSize: '12.5px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Mã đánh giá:</strong> #{selectedFacilityReviewDetail.id || selectedFacilityReviewDetail.reviewId}</div>
                  <div><strong>Điểm sao:</strong> {selectedFacilityReviewDetail.rating || 5}/5 ⭐</div>
                  <div><strong>Nội dung:</strong> “{selectedFacilityReviewDetail.comment || selectedFacilityReviewDetail.content}”</div>
                  {selectedFacilityReviewDetail.tags && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {(Array.isArray(selectedFacilityReviewDetail.tags) ? selectedFacilityReviewDetail.tags : [selectedFacilityReviewDetail.tags]).map((t, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODAL CON: CHỈNH SỬA ĐÁNH GIÁ CƠ SỞ (PUT /api/v1/facility-reviews/{id}) */}
            {editingFacilityReview && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#EFF6FF',
                  border: '1px solid #93C5FD',
                }}
              >
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#1D4ED8' }}>
                  Chỉnh sửa đánh giá cơ sở #{editingFacilityReview.id || editingFacilityReview.reviewId}
                </h4>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                    Chọn số sao:
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditFacilityRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '22px',
                          color: star <= editFacilityRating ? '#EAB308' : '#D1D5DB',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                    Nội dung nhận xét (tối thiểu 10 ký tự):
                  </label>
                  <textarea
                    rows={3}
                    value={editFacilityComment}
                    onChange={(e) => setEditFacilityComment(e.target.value)}
                    placeholder="Nhập cảm nhận của bạn về mặt sân, ánh sáng, dịch vụ..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingFacilityReview(null)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      color: '#4B5563',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateFacilityReview(editingFacilityReview.id || editingFacilityReview.reviewId)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Lưu cập nhật
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL LỊCH SỬ TRẬN ĐẤU */}
      {showMatchesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '620px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Lịch sử đặt sân ({myBookings.length} đơn)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Danh sách các đơn đặt sân của bạn • Đã check-in: {profile.matchesPlayed} trận
                </p>
              </div>
              <button
                onClick={() => setShowMatchesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingBookings ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#15803D' }}>
                    progress_activity
                  </span>
                  <p style={{ margin: '8px 0 0 0' }}>Đang tải danh sách lịch đặt sân của bạn...</p>
                </div>
              ) : myBookings.length > 0 ? (
                myBookings.map((b) => (
                  <div
                    key={b.id || b.bookingId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7',
                            color: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? '#15803D' : '#B45309',
                            ...(['CONFIRMED', 'COMPLETED', 'PAID', 'CHECKED_IN'].includes(String(b.bookingStatus || b.status || '').toUpperCase())
                              ? { background: '#DCFCE7', color: '#15803D' }
                              : {}),
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}
                        >
                          {b.bookingStatus || b.status || 'CONFIRMED'}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#1F2937' }}>
                          {b.courtName || b.facilityName || 'Sân thể thao SportNexus'}
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {b.playDate || b.bookingDate || b.date || 'Hôm nay'} • {b.displayTimeRange || `${b.startTime || '08:00'} - ${b.endTime || '09:00'}`}
                        {b.orderCode && <span className="font-mono"> • #{b.orderCode}</span>}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803D' }}>
                        {(Number(b.totalAmount ?? b.totalPrice) || 0).toLocaleString('vi-VN')} đ
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMatchesModal(false)
                          navigate(`/qr-pass?type=booking&bookingId=${encodeURIComponent(b.bookingId || b.id || '')}`)
                        }}
                        style={{
                          marginTop: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #BBF7D0',
                          background: '#F0FDF4',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Vé QR →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '16px', fontSize: '13.5px', color: '#6B7280' }}>
                  Bạn chưa có đơn đặt sân nào.
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowMatchesModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CÀI ĐẶT THÔNG BÁO (GET/PUT /api/v1/notifications/settings) */}
      {showNotificationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    notifications
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                    Cài đặt thông báo SportNexus
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                    Đồng bộ trực tiếp với hệ thống thông báo SportNexus
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNotificationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {loadingNotifSettings ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '28px' }}>
                  sync
                </span>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải cài đặt thông báo...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#4B5563' }}>
                  Chọn các loại thông báo bạn muốn nhận qua hệ thống:
                </p>

                {NOTIFICATION_TYPES_CATALOG.map((item) => {
                  const isEnabled = !disabledNotifTypes.includes(item.code)
                  return (
                    <label
                      key={item.code}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: isEnabled ? '#BBF7D0' : '#E5E7EB',
                        background: isEnabled ? '#F0FDF4' : '#F9FAFB',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDisabledNotifTypes(disabledNotifTypes.filter((t) => t !== item.code))
                          } else {
                            setDisabledNotifTypes([...disabledNotifTypes, item.code])
                          }
                        }}
                        style={{
                          marginTop: '3px',
                          width: '18px',
                          height: '18px',
                          accentColor: '#15803D',
                          cursor: 'pointer',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: isEnabled ? '#1C3524' : '#9CA3AF' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', lineHeight: 1.4 }}>
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  )
                })}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      color: '#4B5563',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={savingNotifSettings}
                    onClick={handleSaveNotificationSettings}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: savingNotifSettings ? '#9CA3AF' : '#15803D',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: savingNotifSettings ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {savingNotifSettings ? (
                      <>
                        <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '16px' }}>
                          sync
                        </span>
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu cấu hình'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. MODAL TRUNG TÂM HỖ TRỢ & KHIẾU NẠI (POST /api/v1/reports, GET /api/v1/reports/reasons, GET /reports/my-reports, POST /{id}/withdraw) */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '620px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Trung tâm Trợ giúp &amp; Khiếu nại
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Tiếp nhận phản ánh, hỗ trợ sự cố đặt sân và giải quyết tranh chấp người chơi
                </p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* TAB CHUYỂN ĐỔI: Hotline/Thông tin vs Gửi Khiếu nại vs Khiếu nại của tôi */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                background: '#F3F4F6',
                padding: '4px',
                borderRadius: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => setSupportTab('info')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: supportTab === 'info' ? '#FFFFFF' : 'transparent',
                  color: supportTab === 'info' ? '#15803D' : '#6B7280',
                  boxShadow: supportTab === 'info' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Hotline &amp; Hỗ trợ
              </button>

              <button
                type="button"
                onClick={() => setSupportTab('create_report')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: supportTab === 'create_report' ? '#FFFFFF' : 'transparent',
                  color: supportTab === 'create_report' ? '#15803D' : '#6B7280',
                  boxShadow: supportTab === 'create_report' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Gửi Khiếu Nại Mới
              </button>

              <button
                type="button"
                onClick={() => {
                  setSupportTab('my_reports')
                  loadReportData()
                }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: supportTab === 'my_reports' ? '#FFFFFF' : 'transparent',
                  color: supportTab === 'my_reports' ? '#15803D' : '#6B7280',
                  boxShadow: supportTab === 'my_reports' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Khiếu nại của tôi ({myReports.length})
              </button>
            </div>

            {/* TAB 1: THÔNG TIN HỖ TRỢ & HOTLINE */}
            {supportTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#374151' }}>
                <div style={{ padding: '14px', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                  <div style={{ fontWeight: 800, color: '#15803D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                    Hotline Hỗ Trợ Kỹ Thuật &amp; Sự Cố Sân
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>0981 838 889</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Thời gian tiếp nhận: 07:00 – 23:00 tất cả các ngày trong tuần. Hỗ trợ giải quyết tranh chấp slot, sự cố thanh toán cọc hoặc trục trặc vé QR.
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '14px', border: '1px solid #DBEAFE' }}>
                  <div style={{ fontWeight: 800, color: '#2563EB', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
                    Trợ lý AI SportNexus Concierge (24/7)
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#4B5563' }}>
                    Nhấn biểu tượng trợ lý AI ở góc màn hình để được hỗ trợ tức thì về quy tắc ghép trận, chính sách hoàn hủy cọc và vị trí sân trống gần nhất.
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#FAF5FF', borderRadius: '14px', border: '1px solid #F3E8FF' }}>
                  <div style={{ fontWeight: 800, color: '#7E22CE', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                    Email Tiếp Nhận Khiếu Nại &amp; Hợp Tác
                  </div>
                  <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: 600 }}>support@sportnexus.vn</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Phản hồi văn bản chính thức từ Ban Quản Trị trong vòng 4 – 8 giờ làm việc.</div>
                </div>
              </div>
            )}

            {/* TAB 2: GỬI KHIẾU NẠI MỚI (POST /api/v1/reports) */}
            {supportTab === 'create_report' && (
              <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Lý do / Loại khiếu nại:
                  </label>
                  <select
                    value={newReportForm.reasonId}
                    onChange={(e) => setNewReportForm({ ...newReportForm, reasonId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="">-- Chọn lý do phản ánh --</option>
                    {reportReasons.length > 0 ? (
                      reportReasons.map((r) => (
                        <option key={r.code || r.id} value={r.code || r.id}>
                          {r.title || r.name || r.label || r.code}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="SERVICE_QUALITY">Chất lượng dịch vụ sân (Mặt sân xấu, ánh sáng yếu)</option>
                        <option value="UNAUTHORIZED_CANCEL">Chủ sân hủy lịch đột ngột / Trùng giờ</option>
                        <option value="UNSPORTSMANLIKE">Người chơi cùng sân có hành vi thiếu chuẩn mực</option>
                        <option value="PAYMENT_ISSUE">Sự cố thanh toán cọc / Hoàn tiền ví Escrow</option>
                        <option value="OTHER">Lý do khác</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Mã đặt sân liên quan (nếu có):
                  </label>
                  {myBookings.length > 0 ? (
                    <select
                      value={newReportForm.bookingId}
                      onChange={(e) => setNewReportForm({ ...newReportForm, bookingId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        outline: 'none',
                        background: '#FFFFFF',
                      }}
                    >
                      <option value="">-- Chọn đơn đặt sân --</option>
                      {myBookings.map((b) => (
                        <option key={b.bookingId || b.id} value={b.bookingId || b.id}>
                          {b.facilityName || 'Đặt sân'}{b.courtName ? ` · ${b.courtName}` : ''} ({b.startTime ? new Date(b.startTime).toLocaleString('vi-VN') : ''})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ví dụ: BK-2024-9988"
                      value={newReportForm.bookingId}
                      onChange={(e) => setNewReportForm({ ...newReportForm, bookingId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Nội dung mô tả chi tiết sự việc (tối thiểu 10 ký tự):
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newReportForm.description}
                    onChange={(e) => setNewReportForm({ ...newReportForm, description: e.target.value })}
                    placeholder="Mô tả cụ thể thời gian, địa điểm, sự việc đã xảy ra để BQT SportNexus xử lý và hỗ trợ kịp thời..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Ảnh bằng chứng: POST /api/v1/uploads/images?purpose=report */}
                <div>
                  <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Ảnh bằng chứng (không bắt buộc, tối đa 5 ảnh):
                  </span>
                  <div className="snx-row">
                    {newReportForm.evidence.map((url) => (
                      <span key={url} className="snx-feed-image" style={{ width: 72 }}>
                        <img src={url} alt="Bằng chứng" />
                        <button type="button" className="snx-feed-image-remove" aria-label="Bỏ ảnh" onClick={() => setNewReportForm((f) => ({ ...f, evidence: f.evidence.filter((u) => u !== url) }))}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </span>
                    ))}
                    {newReportForm.evidence.length < 5 && (
                      <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: uploadingEvidence ? 'wait' : 'pointer' }}>
                        <span className="material-symbols-outlined">add_photo_alternate</span>{uploadingEvidence ? 'Đang tải…' : 'Thêm ảnh'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          hidden
                          disabled={uploadingEvidence}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
    e.target.value = ''

                            if (!file) return
                            setUploadingEvidence(true)
                            try {
                              const url = await uploadImage(file, 'report')
                              if (url) setNewReportForm((f) => ({ ...f, evidence: [...f.evidence, url] }))
                            } catch (err) {
                              triggerToast(`⚠️ ${err?.message || 'Không tải được ảnh'}`)
                            } finally {
                              setUploadingEvidence(false)
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSupportTab('info')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      color: '#4B5563',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: submittingReport ? '#9CA3AF' : '#15803D',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: submittingReport ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {submittingReport ? (
                      <>
                        <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '16px' }}>
                          sync
                        </span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          send
                        </span>
                        Gửi Khiếu Nại
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: KHIẾU NẠI CỦA TÔI (GET /reports/my-reports, POST /{id}/withdraw) */}
            {supportTab === 'my_reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingReports ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '28px' }}>
                      sync
                    </span>
                    <p style={{ marginTop: '8px', fontSize: '13px' }}>Đang tải danh sách khiếu nại...</p>
                  </div>
                ) : myReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', background: '#F9FAFB', borderRadius: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#9CA3AF' }}>
                      verified_user
                    </span>
                    <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: '#374151' }}>
                      Bạn chưa có khiếu nại nào
                    </h4>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280' }}>
                      Tất cả các lượt trải nghiệm đặt sân của bạn đều diễn ra thuận lợi.
                    </p>
                  </div>
                ) : (
                  myReports.map((rpt, idx) => {
                    const rId = rpt.id || rpt.reportId || idx
                    const isPending = rpt.status === 'PENDING' || rpt.status === 'WAITING' || !rpt.status
                    const statusConfig = {
                      PENDING: { label: 'Đang chờ xử lý', bg: '#FEF3C7', color: '#D97706' },
                      WAITING: { label: 'Đang chờ xử lý', bg: '#FEF3C7', color: '#D97706' },
                      IN_REVIEW: { label: 'Đang thụ lý', bg: '#E0F2FE', color: '#0284C7' },
                      RESOLVED: { label: 'Đã giải quyết', bg: '#DCFCE7', color: '#15803D' },
                      REJECTED: { label: 'Đã từ chối', bg: '#FEE2E2', color: '#DC2626' },
                      WITHDRAWN: { label: 'Đã rút khiếu nại', bg: '#F3F4F6', color: '#6B7280' },
                    }
                    const st = statusConfig[rpt.status] || statusConfig.PENDING

                    return (
                      <div
                        key={rId}
                        style={{
                          borderRadius: '16px',
                          padding: '14px 16px',
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>
                              Khiếu nại #{rId}
                            </span>
                            {rpt.createdAt && (
                              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '8px' }}>
                                {new Date(rpt.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: st.bg,
                              color: st.color,
                            }}
                          >
                            {st.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#4B5563', marginBottom: '8px' }}>
                          <strong>Lý do:</strong> {rpt.reasonName || rpt.reasonId || rpt.category || 'Khiếu nại dịch vụ'}
                          {rpt.bookingId && <span> • <strong>Mã sân:</strong> #{rpt.bookingId}</span>}
                        </div>

                        <div style={{ fontSize: '13px', color: '#374151', padding: '8px 12px', background: '#F9FAFB', borderRadius: '10px', marginBottom: '8px' }}>
                          “{rpt.description || rpt.content}”
                        </div>

                        {rpt.resolution && (
                          <div style={{ fontSize: '12px', color: '#15803D', background: '#F0FDF4', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px' }}>
                            <strong>Kết quả xử lý từ BQT:</strong> {rpt.resolution}
                          </div>
                        )}

                        {isPending && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleWithdrawReport(rId)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                background: '#FFFFFF',
                                color: '#6B7280',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                undo
                              </span>
                              Rút khiếu nại
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7B. MODAL BẢO MẬT & QUẢN LÝ TÀI KHOẢN (POST /change-password, POST /me/phone, POST /me/email/send-otp, POST /me/email/verify, POST /set-password, DELETE /api/auth/me) */}
      {showSecurityModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    shield
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                    Bảo mật &amp; Quản lý tài khoản
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                    Quản lý mật khẩu, số điện thoại, xác thực OTP email và an toàn tài khoản
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSecurityModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Sub-tabs điều hướng: Chỉ hiển thị Đặt MK mới khi chưa có mật khẩu (tài khoản MXH), ngược lại chỉ hiện Đổi mật khẩu */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '18px',
                background: '#F3F4F6',
                padding: '4px',
                borderRadius: '12px',
                overflowX: 'auto',
              }}
            >
              {[
                ...(profile.hasPassword !== false
                  ? [{ id: 'password', label: 'Đổi mật khẩu', icon: 'lock' }]
                  : [{ id: 'set_pwd', label: 'Đặt MK mới', icon: 'key' }]),
                { id: 'phone', label: 'Số điện thoại', icon: 'call' },
                { id: 'email', label: 'Email OTP', icon: 'mark_email_read' },
                { id: 'delete', label: 'Xóa tài khoản', icon: 'delete_forever', danger: true },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSecurityTab(tab.id)}
                  style={{
                    flex: '1 0 auto',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: securityTab === tab.id ? '#FFFFFF' : 'transparent',
                    color: securityTab === tab.id ? (tab.danger ? '#DC2626' : '#15803D') : '#6B7280',
                    boxShadow: securityTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 1: ĐỔI MẬT KHẨU (POST /api/auth/change-password) */}
            {securityTab === 'password' && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Mật khẩu hiện tại:
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      if (passwordErrors.oldPassword) setPasswordErrors((prev) => ({ ...prev, oldPassword: null }))
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${passwordErrors.oldPassword ? '#EF4444' : '#D1D5DB'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.oldPassword && (
                    <p style={{ color: '#DC2626', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>
                      {passwordErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Mật khẩu mới (tối thiểu 6 ký tự):
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: null }))
                    }}
                    placeholder="Nhập mật khẩu mới (6 - 64 ký tự)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${passwordErrors.newPassword ? '#EF4444' : '#D1D5DB'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.newPassword && (
                    <p style={{ color: '#DC2626', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Xác nhận mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }))
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${passwordErrors.confirmPassword ? '#EF4444' : '#D1D5DB'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {passwordErrors.confirmPassword && (
                    <p style={{ color: '#DC2626', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {passwordErrors.general && (
                  <p style={{ color: '#DC2626', fontSize: '12px', margin: '2px 0 0 0', fontWeight: 600 }}>
                    ⚠️ {passwordErrors.general}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingPassword}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: submittingPassword ? '#9CA3AF' : '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: submittingPassword ? 'not-allowed' : 'pointer',
                    marginTop: '6px',
                  }}
                >
                  {submittingPassword ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu mới'}
                </button>
              </form>
            )}

            {/* SUB-TAB 2: CẬP NHẬT SỐ ĐIỆN THOẠI (POST /api/auth/me/phone) */}
            {securityTab === 'phone' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>
                  Số điện thoại được sử dụng để nhận mã OTP nhận diện tại quầy check-in sân bóng và thông báo chia tiền ví Escrow.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Số điện thoại di động:
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setPhoneCodeSent(false); setPhoneOtp('') }}
                    placeholder="Ví dụ: 0908 123 456"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {phoneCodeSent && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Mã OTP gửi tới số mới:
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6 chữ số"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  disabled={phoneBusy}
                  onClick={phoneCodeSent ? handleUpdatePhone : handleSendPhoneCode}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: phoneBusy ? 'not-allowed' : 'pointer',
                    opacity: phoneBusy ? 0.7 : 1,
                  }}
                >
                  {phoneBusy ? 'Đang xử lý...' : phoneCodeSent ? 'Xác nhận và lưu số mới' : 'Gửi mã OTP tới số mới'}
                </button>
                {phoneCodeSent && (
                  <button
                    type="button"
                    disabled={phoneBusy}
                    onClick={handleSendPhoneCode}
                    style={{ background: 'none', border: 'none', color: '#15803D', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
            )}

            {/* SUB-TAB 3: XÁC THỰC EMAIL BẰNG OTP (POST /api/auth/me/email/send-otp & POST /verify) */}
            {securityTab === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', fontSize: '13px' }}>
                  <strong>Email tài khoản:</strong> {profile.email || 'minh.nguyen@example.com'}
                </div>

                {!otpSent ? (
                  <div>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#4B5563' }}>
                      Nhấn nút bên dưới để hệ thống SportNexus gửi mã xác thực gồm 6 chữ số vào hộp thư điện tử của bạn.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        send
                      </span>
                      Gửi mã OTP qua Email
                    </button>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Nhập mã OTP 6 số nhận được trong email:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="123456"
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '14px',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#15803D',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Xác nhận
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '8px',
                        padding: 0,
                      }}
                    >
                      Chưa nhận được? Gửi lại mã OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: THIẾT LẬP MẬT KHẨU MỚI (POST /api/auth/set-password) */}
            {securityTab === 'set_pwd' && (
              <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#4B5563' }}>
                  Sử dụng khi tài khoản được tạo qua liên kết Google/Facebook và muốn tạo mật khẩu trực tiếp cho SportNexus.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Mật khẩu mới (tối thiểu 6 ký tự):
                  </label>
                  <input
                    type="password"
                    value={setPasswordFormData.newPassword}
                    onChange={(e) => {
                      setSetPasswordFormData({ ...setPasswordFormData, newPassword: e.target.value })
                      if (setPwdErrors.newPassword) setSetPwdErrors((prev) => ({ ...prev, newPassword: null }))
                    }}
                    placeholder="Nhập mật khẩu mới (6 - 64 ký tự)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${setPwdErrors.newPassword ? '#EF4444' : '#D1D5DB'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {setPwdErrors.newPassword && (
                    <p style={{ color: '#DC2626', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>
                      {setPwdErrors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Nhập lại mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    value={setPasswordFormData.confirmPassword}
                    onChange={(e) => {
                      setSetPasswordFormData({ ...setPasswordFormData, confirmPassword: e.target.value })
                      if (setPwdErrors.confirmPassword) setSetPwdErrors((prev) => ({ ...prev, confirmPassword: null }))
                    }}
                    placeholder="Xác nhận lại mật khẩu mới"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${setPwdErrors.confirmPassword ? '#EF4444' : '#D1D5DB'}`,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {setPwdErrors.confirmPassword && (
                    <p style={{ color: '#DC2626', fontSize: '12px', margin: '4px 0 0 0', fontWeight: 500 }}>
                      {setPwdErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {setPwdErrors.general && (
                  <p style={{ color: '#DC2626', fontSize: '12px', margin: '2px 0 0 0', fontWeight: 600 }}>
                    ⚠️ {setPwdErrors.general}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingSetPassword}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: submittingSetPassword ? '#9CA3AF' : '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: submittingSetPassword ? 'not-allowed' : 'pointer',
                    marginTop: '4px',
                  }}
                >
                  {submittingSetPassword ? 'Đang thiết lập...' : 'Thiết lập mật khẩu'}
                </button>
              </form>
            )}

            {/* SUB-TAB 5: XÓA TÀI KHOẢN VĨNH VIỄN (DELETE /api/auth/me) */}
            {securityTab === 'delete' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: '#FEF2F2', borderRadius: '14px', border: '1px solid #FECACA', color: '#991B1B' }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
                    Vùng nguy hiểm: Xóa tài khoản vĩnh viễn
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.5 }}>
                    Hành động này sẽ xóa toàn bộ lịch sử đấu, số dư ví SportNexus, thông tin môn thể thao và các đánh giá uy tín của bạn. Bạn sẽ không thể khôi phục tài khoản này sau khi xác nhận.
                  </p>
                </div>
                <button type="button" className="snx-btn snx-btn--secondary" onClick={handleLogoutAll}>
                  <span className="material-symbols-outlined">devices</span>
                  Đăng xuất khỏi tất cả thiết bị
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    delete_forever
                  </span>
                  Xác nhận xóa tài khoản vĩnh viễn
                </button>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowSecurityModal(false)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: '#6B7280',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL XÁC NHẬN ĐĂNG XUẤT (POST /api/auth/logout) */}
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                logout
              </span>
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
              Xác nhận đăng xuất?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#6B7280', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{profile.name}</strong> không?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    await logoutApi()
                  } catch (e) {
                    console.warn('[Profile] Logout API notice:', e)
                  }
                  try {
                    localStorage.removeItem('sportnexus_user_role')
                    localStorage.removeItem('sportnexus_current_user')
                    localStorage.removeItem('sportnexus_auth_token')
                    localStorage.removeItem('sportnexus_user_id')
                    localStorage.removeItem('sportnexus_user_fullname')
                  } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
                  setShowLogoutModal(false)
                  logoutApi().catch(() => {})
                  logout()
                  navigate('/login')
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style CSS Responsive nhúng */}
      <style>{`
        @media (max-width: 1024px) {
          .profile-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
