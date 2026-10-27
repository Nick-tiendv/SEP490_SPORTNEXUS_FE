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
import { initialsOf } from '../../hooks/useCurrentUser.js'
import { getMyBookings } from '../../api/player/bookingApi.js'
import { uploadImage } from '../../api/player/uploadApi.js'
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

const PRESET_SPORTS_CATALOG = [
  { key: 'badminton', name: 'Cầu lông', icon: '🏸', color: '#15803D', bgColor: '#DCFCE7' },
  { key: 'pickleball', name: 'Pickleball', icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' },
  { key: 'football', name: 'Bóng đá', icon: '⚽', color: '#2563EB', bgColor: '#EFF6FF' },
  { key: 'basketball', name: 'Bóng rổ', icon: '🏀', color: '#EA580C', bgColor: '#FFF7ED' },
  { key: 'tennis', name: 'Quần vợt (Tennis)', icon: '🎾', color: '#65A30D', bgColor: '#F7FEE7' },
  { key: 'table_tennis', name: 'Bóng bàn', icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' },
  { key: 'volleyball', name: 'Bóng chuyền', icon: '🏐', color: '#F59E0B', bgColor: '#FEF3C7' },
  { key: 'swimming', name: 'Bơi lội', icon: '🏊', color: '#06B6D4', bgColor: '#CFFAFE' },
  { key: 'running', name: 'Chạy bộ / Điền kinh', icon: '🏃', color: '#10B981', bgColor: '#D1FAE5' },
  { key: 'billiards', name: 'Bi-a (Billiards)', icon: '🎱', color: '#4B5563', bgColor: '#F3F4F6' },
  { key: 'golf', name: 'Golf', icon: '⛳', color: '#059669', bgColor: '#D1FAE5' },
  { key: 'bowling', name: 'Bowling', icon: '🎳', color: '#7C3AED', bgColor: '#EDE9FE' },
  { key: 'cycling', name: 'Đạp xe', icon: '🚴', color: '#D97706', bgColor: '#FEF3C7' },
  { key: 'martial_arts', name: 'Võ thuật', icon: '🥋', color: '#DC2626', bgColor: '#FEE2E2' },
  { key: 'other', name: 'Môn thể thao khác (Tùy chỉnh)', icon: '🎯', color: '#15803D', bgColor: '#DCFCE7' },
]

// Chuyển một môn từ backend sang dạng thẻ hiển thị (icon/màu lấy theo danh mục có sẵn).
const toUiSport = (sport) => {
  const lower = (sport.name || '').toLowerCase()
  const preset = PRESET_SPORTS_CATALOG.find((p) => lower && (p.name.toLowerCase().startsWith(lower) || lower.startsWith(p.name.toLowerCase().split(' (')[0])))
  return {
    id: sport.sportCategoryId,
    sportCategoryId: sport.sportCategoryId,
    name: sport.name || preset?.name || 'Môn thể thao',
    icon: preset?.icon || '🎯',
    level: skillLabel(sport.skillLevel) || 'Chưa có đánh giá',
    field: 'Trình độ',
    ranked: true,
    matches: 0,
    winRate: '—',
    color: preset?.color || '#15803D',
    bgColor: preset?.bgColor || '#DCFCE7',
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

  // Thông tin người chơi: tên, SĐT, ảnh lấy từ GET /api/auth/me.
  // Khu vực và giới thiệu chưa có trên backend nên chỉ lưu trên máy (localStorage).
  const [profile, setProfile] = useState(() => {
    let local = {}
    try { local = JSON.parse(localStorage.getItem('player_profile_data') || '{}') } catch { /* bỏ qua */ }
    return {
      name: '',
      username: '',
      location: local.location || '',
      bio: local.bio || '',
      joinDate: '',
      phone: '',
      email: '',
      avatarUrl: null,
      reputationScore: 0,
      totalReviews: 0,
      matchesPlayed: 0,
      winRate: 0,
      punctualityRate: 0,
    }
  })

  // Môn thể thao & trình độ: GET/PUT /api/auth/me/sports
  const [sportsData, setSportsData] = useState([])
  const [sportCategories, setSportCategories] = useState([])

  // Lưu profile khi thay đổi
  useEffect(() => {
    localStorage.setItem('player_profile_data', JSON.stringify(profile))
  }, [profile])

  // Giữ bản sao môn đã chọn cho các trang khác đang đọc (SportContext, Onboarding)
  useEffect(() => {
    localStorage.setItem('player_sports_data', JSON.stringify(sportsData))
  }, [sportsData])

  // Trạng thái các Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showAddSportModal, setShowAddSportModal] = useState(false)
  const [selectedSportToEdit, setSelectedSportToEdit] = useState(null)
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false)
  const [showMatchesModal, setShowMatchesModal] = useState(false)
  // Lịch sử cộng / trừ điểm Fair Play của tôi (GET /api/v1/fair-play/me)
  const [fairPlayHistory, setFairPlayHistory] = useState([])
  const [showFavoriteCourtsModal, setShowFavoriteCourtsModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  /* ---------------- API States: Bookings, Reviews, Reports, Security ---------------- */
  // 1. Đặt sân của tôi (GET /api/v1/bookings/my-bookings)
  const [myBookings, setMyBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  // 2. Đánh giá sân của tôi (GET /api/v1/facility-reviews/my-reviews)
  const [myFacilityReviews, setMyFacilityReviews] = useState([])
  const [loadingFacilityReviews, setLoadingFacilityReviews] = useState(false)
  const [reviewTab, setReviewTab] = useState('fairplay') // 'fairplay' | 'facility'
  const [selectedFacilityReviewDetail, setSelectedFacilityReviewDetail] = useState(null)
  const [editingFacilityReview, setEditingFacilityReview] = useState(null)
  const [editFacilityComment, setEditFacilityComment] = useState('')
  const [editFacilityRating, setEditFacilityRating] = useState(5)

  // 3. Báo cáo / khiếu nại (GET /api/v1/reports/reasons & GET /reports/my-reports)
  const [reportReasons, setReportReasons] = useState([])
  const [myReports, setMyReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [supportTab, setSupportTab] = useState('info') // 'info' | 'create_report' | 'my_reports'
  const [newReportForm, setNewReportForm] = useState({ reasonId: '', description: '', bookingId: '', evidence: [] })
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)

  // 4. Tài khoản & Bảo mật (POST /change-password, POST /me/phone, POST /me/email/send-otp, POST /me/email/verify, POST /set-password, DELETE /api/auth/me)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [securityTab, setSecurityTab] = useState('password') // 'password' | 'phone' | 'email' | 'set_pwd' | 'delete'
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [phoneInput, setPhoneInput] = useState(profile.phone || '')
  const [emailOtp, setEmailOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [setPasswordFormData, setSetPasswordFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  // Tải đặt sân của tôi: GET /api/v1/bookings/my-bookings
  const loadMyBookings = async () => {
    setLoadingBookings(true)
    try {
      const data = await getMyBookings()
      if (Array.isArray(data)) setMyBookings(data)
    } catch (err) {
      console.warn('[Profile] Lỗi lấy bookings:', err)
    } finally {
      setLoadingBookings(false)
    }
  }

  // Tải đánh giá cơ sở của tôi: GET /api/v1/facility-reviews/my-reviews
  const loadMyFacilityReviews = async () => {
    setLoadingFacilityReviews(true)
    try {
      const res = await getMyFacilityReviews()
      const list = res?.items || res?.data || (Array.isArray(res) ? res : [])
      setMyFacilityReviews(list)
    } catch (err) {
      console.warn('[Profile] Lỗi lấy facility reviews:', err)
    } finally {
      setLoadingFacilityReviews(false)
    }
  }

  // Tải báo cáo / khiếu nại: GET /api/v1/reports/reasons & GET /reports/my-reports
  const loadReportData = async () => {
    setLoadingReports(true)
    try {
      const [reasons, reports] = await Promise.all([
        getReportReasons('BOOKING').catch(() => []),
        getMyReports().catch(() => []),
      ])
      if (Array.isArray(reasons)) setReportReasons(reasons)
      const rList = reports?.items || (Array.isArray(reports) ? reports : [])
      setMyReports(rList)
    } catch (err) {
      console.warn('[Profile] Lỗi tải dữ liệu khiếu nại:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    loadMyBookings()
    loadMyFacilityReviews()
    loadReportData()
  }, [])

  // Tải avatar lên: POST /api/auth/me/avatar
  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const res = await uploadAvatar(file)
      const newUrl = res?.avatarUrl || res?.url || URL.createObjectURL(file)
      setProfile((prev) => ({ ...prev, avatarUrl: newUrl }))
      setEditForm((prev) => ({ ...prev, avatarUrl: newUrl }))
      triggerToast('🎉 Tải ảnh đại diện thành công!')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể tải ảnh đại diện'}`)
    } finally {
      setAvatarUploading(false)
    }
  }

  // Đổi mật khẩu: POST /api/auth/change-password
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault()
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      triggerToast('⚠️ Vui lòng nhập đầy đủ mật khẩu cũ và mới!')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast('⚠️ Mật khẩu xác nhận không khớp!')
      return
    }
    setSubmittingPassword(true)
    try {
      await changePassword(passwordForm)
      triggerToast('🎉 Đổi mật khẩu thành công!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowSecurityModal(false)
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể đổi mật khẩu'}`)
    } finally {
      setSubmittingPassword(false)
    }
  }

  // Cập nhật số điện thoại: POST /api/auth/me/phone
  const handleUpdatePhone = async () => {
    if (!phoneInput.trim()) {
      triggerToast('⚠️ Vui lòng nhập số điện thoại')
      return
    }
    try {
      await updatePhone({ phone: phoneInput.trim() })
      setProfile((prev) => ({ ...prev, phone: phoneInput.trim() }))
      triggerToast('🎉 Đã cập nhật số điện thoại thành công!')
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Lỗi cập nhật số điện thoại'}`)
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

  // Thiết lập mật khẩu mới: POST /api/auth/set-password
  const handleSetPassword = async (e) => {
    if (e) e.preventDefault()
    if (!setPasswordFormData.newPassword) return
    if (setPasswordFormData.newPassword !== setPasswordFormData.confirmPassword) {
      triggerToast('⚠️ Mật khẩu xác nhận không khớp!')
      return
    }
    try {
      await setPassword(setPasswordFormData)
      triggerToast('🎉 Thiết lập mật khẩu thành công!')
      setSetPasswordFormData({ newPassword: '', confirmPassword: '' })
      setShowSecurityModal(false)
    } catch (err) {
      triggerToast(`⚠️ ${err?.message || 'Không thể thiết lập mật khẩu'}`)
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

  // Form cập nhật trình độ cho môn đã có
  const [skillForm, setSkillForm] = useState({
    level: 'Trung bình - Khá',
    matches: 0,
  })

  // Form thêm môn thể thao mới & tự đánh giá ban đầu
  const [newSportForm, setNewSportForm] = useState({
    sportKey: 'table_tennis',
    customName: '',
    customIcon: '🎯',
    level: 'Mới tập chơi',
    field: 'Trình độ',
    matches: 0,
  })

  // Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Tải hồ sơ, điểm Fair Play, số trận và danh sách môn từ backend khi mở trang
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getMyProfile(), getMyFairPlay(), getMyBookings()]).then(([me, fairPlay, bookings]) => {
      if (cancelled) return
      const u = me.status === 'fulfilled' ? me.value || {} : {}
      const fp = fairPlay.status === 'fulfilled' ? fairPlay.value || {} : {}
      const list = bookings.status === 'fulfilled' && Array.isArray(bookings.value) ? bookings.value : []
      const rating = Number(fp.averageRating)
      const created = u.createdAt ? new Date(u.createdAt) : null
      setProfile((prev) => ({
        ...prev,
        name: u.fullName || prev.name,
        username: u.username ? `@${u.username}` : prev.username,
        phone: u.phone || u.phoneNumber || prev.phone,
        email: u.email || prev.email,
        avatarUrl: u.avatarUrl || prev.avatarUrl,
        joinDate: created ? `Tháng ${String(created.getMonth() + 1).padStart(2, '0')}/${created.getFullYear()}` : prev.joinDate,
        // GET /api/v1/fair-play/me: averageRating (sao), ratingCount, fairPlayScore (thang 100)
        reputationScore: Number.isFinite(rating) ? Math.round(rating * 10) / 10 : prev.reputationScore,
        totalReviews: Number(fp.ratingCount) || 0,
        fairPlayScore: fp.fairPlayScore ?? u.fairPlayScore ?? null,
        matchesPlayed: list.filter((b) => /COMPLETED|CHECKED_IN/i.test(b.status || b.bookingStatus || '')).length,
      }))
      setFairPlayHistory(Array.isArray(fp.history?.items) ? fp.history.items : [])
      if (u.phone || u.phoneNumber) setPhoneInput(u.phone || u.phoneNumber)
      if (me.status === 'rejected') triggerToast(`⚠️ ${me.reason?.message || 'Không tải được hồ sơ.'}`)
    })
    Promise.all([getMySports(), getSportCategories()])
      .then(([mine, categories]) => {
        if (cancelled) return
        setSportCategories(categories)
        setSportsData(mine.map(toUiSport))
      })
      .catch(() => {})
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
      await updateMySports(next.map((s) => ({ sportCategoryId: s.sportCategoryId, skillLevel: s.level })))
      setSportsData(next)
      if (successText) triggerToast(successText)
      return true
    } catch (error) {
      triggerToast(`⚠️ ${error?.message || 'Không lưu được môn thể thao.'}`)
      return false
    }
  }

  // Danh sách sân yêu thích
  // Backend chưa có API sân yêu thích nên danh sách để trống.
  const favoriteCourts = []

  // Mở modal cập nhật trình độ & số trận
  const handleOpenSkillModal = (sport) => {
    setSelectedSportToEdit(sport)
    setSkillForm({
      level: sport.level.includes('Chưa có') ? 'Mới tập chơi' : sport.level,
      matches: sport.matches !== undefined ? sport.matches : 0,
    })
    setShowSkillModal(true)
  }

  // Lưu trình độ & số trận
  const handleSaveSkill = async () => {
    if (!selectedSportToEdit) return
    const numMatches = Math.max(0, parseInt(skillForm.matches, 10) || 0)
    const next = sportsData.map((s) =>
      s.id === selectedSportToEdit.id ? { ...s, level: skillForm.level, matches: numMatches, field: 'Trình độ', ranked: true } : s
    )
    if (await saveSports(next, `🎉 Đã cập nhật trình độ ${selectedSportToEdit.name} (${skillForm.level})!`)) {
      setShowSkillModal(false)
    }
  }

  // Mở modal thêm môn thể thao mới
  const handleOpenAddSportModal = () => {
    const available = PRESET_SPORTS_CATALOG.find(
      (p) => p.key !== 'other' && !sportsData.some((s) => s.id === p.key || s.name.toLowerCase() === p.name.toLowerCase())
    )
    setNewSportForm({
      sportKey: available ? available.key : 'other',
      customName: '',
      customIcon: '🎯',
      level: 'Mới tập chơi',
      field: 'Trình độ',
      matches: 0,
    })
    setShowAddSportModal(true)
  }

  // Lưu môn thể thao mới & tự đánh giá trình độ ban đầu
  const handleSaveNewSport = async () => {
    const isCustom = newSportForm.sportKey === 'other'
    const preset = PRESET_SPORTS_CATALOG.find((p) => p.key === newSportForm.sportKey)
    const sportName = isCustom ? newSportForm.customName.trim() : (preset ? preset.name : '')

    if (!sportName) {
      triggerToast('⚠️ Vui lòng nhập tên môn thể thao!')
      return
    }

    const isDuplicate = sportsData.some(
      (s) => s.id === newSportForm.sportKey || s.name.toLowerCase() === sportName.toLowerCase()
    )
    if (isDuplicate) {
      triggerToast(`⚠️ Môn "${sportName}" đã có sẵn trong danh sách kỹ năng của bạn!`)
      return
    }

    const baseName = sportName.toLowerCase().split(' (')[0]
    const category = sportCategories.find((c) => c.name.toLowerCase() === sportName.toLowerCase() || c.name.toLowerCase().includes(baseName))
    const newSport = {
      sportCategoryId: category?.id || null,
      id: category?.id || (isCustom ? `sport_${Date.now()}` : newSportForm.sportKey),
      name: sportName,
      icon: isCustom ? (newSportForm.customIcon.trim() || '🎯') : preset.icon,
      level: newSportForm.level,
      field: 'Trình độ',
      ranked: true,
      matches: Number(newSportForm.matches) || 0,
      winRate: '100%',
      color: preset?.color || '#15803D',
      bgColor: preset?.bgColor || '#DCFCE7',
    }

    if (await saveSports([...sportsData, newSport], `🎉 Đã thêm môn ${newSport.name} (${newSport.level}) vào hồ sơ!`)) {
      setShowAddSportModal(false)
    }
  }

  // Xóa môn thể thao khỏi danh sách kỹ năng: PUT /api/auth/me/sports
  const handleDeleteSport = async (sport) => {
    if (sportsData.length <= 1) {
      triggerToast('⚠️ Bạn cần giữ ít nhất một môn thể thao trong hồ sơ!')
      return
    }
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
    try {
      // Họ tên lưu lên backend (PUT /api/auth/me); khu vực & giới thiệu chỉ lưu trên máy.
      await updateMyProfile({ fullName: editForm.name.trim(), avatarUrl: profile.avatarUrl ?? null })
    } catch (error) {
      triggerToast(`⚠️ ${error?.message || 'Không cập nhật được hồ sơ.'}`)
      return
    }
    setProfile({ ...editForm, name: editForm.name.trim() })
    localStorage.setItem('player_profile_data', JSON.stringify({ location: editForm.location, bio: editForm.bio }))
    window.dispatchEvent(new CustomEvent('player-profile-updated', { detail: editForm }))
    setShowEditModal(false)
    triggerToast('✅ Cập nhật thông tin hồ sơ người chơi thành công!')
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

                {/* Badge: Người chơi uy tín 4.9 ★ (58) */}
                <div
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
                  }}
                >
                  <span style={{ color: '#EAB308' }}>★</span>
                  <span>Người chơi uy tín {profile.reputationScore} ★ ({profile.totalReviews})</span>
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

              {/* 3 THẺ THỐNG KÊ NHANH (48 Trận, 86% Tỷ lệ thắng, 99% Đúng giờ) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  background: '#F0FDF4',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  border: '1px solid #DCFCE7',
                }}
              >
                {/* 1. Trận đã đấu */}
                <div
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onClick={() => setShowMatchesModal(true)}
                  title="Nhấn để xem lịch sử 48 trận"
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

                {/* 2. Tỷ lệ thắng */}
                <div
                  style={{
                    textAlign: 'center',
                    borderLeft: '1px solid #D1FAE5',
                    borderRight: '1px solid #D1FAE5',
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

                {/* 3. Đúng giờ (Cao) */}
                <div style={{ textAlign: 'center' }}>
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
                    Đúng giờ (Cao)
                  </div>
                </div>
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
              {/* 1. Lịch sử trận đấu */}
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
                    Lịch sử trận đấu
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                    48 trận
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                    chevron_right
                  </span>
                </div>
              </div>

              {/* 2. Sân yêu thích */}
              <div
                onClick={() => setShowFavoriteCourtsModal(true)}
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
                      favorite
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                    Sân yêu thích
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                    5 địa điểm
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#9CA3AF' }}>
                    chevron_right
                  </span>
                </div>
              </div>

              {/* 3. Cài đặt thông báo */}
              <div
                onClick={() => setShowNotificationModal(true)}
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
                <span
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#15803D',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ĐÁNH GIÁ KỸ NĂNG
                </span>
                <button
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
                Tự đánh giá trình độ giúp SportNexus đề xuất đối thủ &amp; kèo ghép trận cân bằng nhất.
              </p>
            </div>

            {/* DANH SÁCH 4 MÔN THỂ THAO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sportsData.map((sport) => {
                const isTennis = sport.id === 'tennis'
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
                      border: isTennis
                        ? '1.5px dashed #86EFAC'
                        : '1px solid rgba(45, 95, 63, 0.12)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#15803D'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(21, 128, 61, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isTennis
                        ? '#86EFAC'
                        : 'rgba(45, 95, 63, 0.12)'
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
                        {/* Tên môn + Badge Trạng thái */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '15.5px',
                              fontWeight: 800,
                              color: '#1C3524',
                            }}
                          >
                            {sport.name}
                          </span>
                          {sport.ranked ? (
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
                              Đã xác nhận
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#F3F4F6',
                                color: '#6B7280',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Chưa xếp hạng
                            </span>
                          )}
                        </div>

                        {/* Subtext: Trình độ & Số trận đã chơi */}
                        <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>
                            {sport.field}: <strong style={{ color: sport.ranked ? '#1F2937' : '#9CA3AF' }}>{sport.level}</strong>
                          </span>
                          <span style={{ color: '#D1D5DB' }}>•</span>
                          <span style={{ background: '#F3F4F6', color: '#374151', padding: '1px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                            {sport.matches !== undefined ? sport.matches : 0} trận đã chơi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action buttons (Cập nhật & Xóa môn) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenSkillModal(sport)}
                        style={{
                          background: isTennis ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)' : '#FFFFFF',
                          color: isTennis ? '#FFFFFF' : '#15803D',
                          border: isTennis ? 'none' : '1px solid #86EFAC',
                          borderRadius: '12px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: isTennis ? '0 3px 10px rgba(21, 128, 61, 0.25)' : 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (isTennis) {
                            e.currentTarget.style.transform = 'scale(1.02)'
                          } else {
                            e.currentTarget.style.background = '#DCFCE7'
                            e.currentTarget.style.borderColor = '#15803D'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isTennis) {
                            e.currentTarget.style.transform = 'scale(1)'
                          } else {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#86EFAC'
                          }
                        }}
                      >
                        {isTennis && !sport.ranked ? 'Đánh giá ngay' : 'Cập nhật trình độ'}
                      </button>

                      {sportsData.length > 1 && (
                        <button
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
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Nút thêm môn thể thao dạng Card viền nét đứt */}
              <button
                onClick={handleOpenAddSportModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  background: '#F9FAFB',
                  border: '2px dashed #86EFAC',
                  color: '#15803D',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0FDF4'
                  e.currentTarget.style.borderColor = '#15803D'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = '#86EFAC'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add_circle</span>
                <span>+ Thêm môn thể thao mới &amp; Tự đánh giá trình độ ban đầu</span>
              </button>
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
                  Khu vực thi đấu ưa thích
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
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
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
                  Tổng số trận đã đấu
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({
                      ...prev,
                      matchesPlayed: Math.max(0, (parseInt(prev.matchesPlayed, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editForm.matchesPlayed === undefined ? '' : editForm.matchesPlayed}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setEditForm((prev) => ({
                        ...prev,
                        matchesPlayed: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (editForm.matchesPlayed === '' || isNaN(editForm.matchesPlayed)) {
                        setEditForm((prev) => ({ ...prev, matchesPlayed: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({
                      ...prev,
                      matchesPlayed: (parseInt(prev.matchesPlayed, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Giới thiệu bản thân (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
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

      {/* 2. MODAL CẬP NHẬT TRÌNH ĐỘ */}
      {showSkillModal && selectedSportToEdit && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>{selectedSportToEdit.icon}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Cập nhật trình độ người chơi: {selectedSportToEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setShowSkillModal(false)}
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
                  Trình độ người chơi
                </label>
                <select
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="Mới tập chơi">Mới tập chơi (Căn bản)</option>
                  <option value="Mới chơi - Đang tiến bộ">Mới chơi - Đang tiến bộ</option>
                  <option value="Trung bình">Trung bình (Giao lưu phong trào)</option>
                  <option value="Trung bình - Khá">Trung bình - Khá</option>
                  <option value="Khá - Đánh chắc tay">Khá - Đánh chắc tay</option>
                  <option value="Bán chuyên / Nâng cao">Bán chuyên / Nâng cao</option>
                  <option value="Chuyên nghiệp / Thi đấu giải">Chuyên nghiệp / Thi đấu giải</option>
                </select>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Thiết lập trình độ thực tế giúp hệ thống tự động ghép kèo cân bằng, đúng thực lực.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Số trận đã chơi ({selectedSportToEdit.name})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({
                      ...prev,
                      matches: Math.max(0, (parseInt(prev.matches, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={skillForm.matches === undefined ? '' : skillForm.matches}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setSkillForm((prev) => ({
                        ...prev,
                        matches: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (skillForm.matches === '' || isNaN(skillForm.matches)) {
                        setSkillForm((prev) => ({ ...prev, matches: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({
                      ...prev,
                      matches: (parseInt(prev.matches, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', marginRight: '4px' }}>Cộng nhanh:</span>
                  {[1, 5, 10].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setSkillForm((prev) => ({
                        ...prev,
                        matches: (parseInt(prev.matches, 10) || 0) + inc,
                      }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSkillForm((prev) => ({ ...prev, matches: 0 }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#6B7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    Đặt về 0
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  💡 Bạn có thể nhập trực tiếp số trận từ bàn phím hoặc dùng các nút tăng/giảm ở hai bên.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={() => setShowSkillModal(false)}
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
                onClick={handleSaveSkill}
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
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2B. MODAL THÊM MÔN THỂ THAO & TỰ ĐÁNH GIÁ TRÌNH ĐỘ BAN ĐẦU */}
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
                    Thêm môn thể thao &amp; Tự đánh giá
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                    Thiết lập trình độ ban đầu để ghép kèo chính xác
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
              {/* Chọn môn thể thao */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  1. Chọn môn thể thao
                </label>
                <select
                  value={newSportForm.sportKey}
                  onChange={(e) => {
                    const selected = PRESET_SPORTS_CATALOG.find(p => p.key === e.target.value)
                    setNewSportForm({
                      ...newSportForm,
                      sportKey: e.target.value,
                      customName: selected?.key !== 'other' ? selected?.name || '' : '',
                      customIcon: selected?.icon || '🎯',
                    })
                  }}
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
                  {PRESET_SPORTS_CATALOG.map((p) => {
                    const alreadyHas = sportsData.some(
                      (s) => s.id === p.key || s.name.toLowerCase() === p.name.toLowerCase()
                    )
                    return (
                      <option key={p.key} value={p.key} disabled={alreadyHas && p.key !== 'other'}>
                        {p.icon} {p.name} {alreadyHas && p.key !== 'other' ? '(Đã có trong hồ sơ)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Nếu chọn "other", cho phép tự nhập tên & icon */}
              {newSportForm.sportKey === 'other' && (
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                      Biểu tượng
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={newSportForm.customIcon}
                      onChange={(e) => setNewSportForm({ ...newSportForm, customIcon: e.target.value })}
                      placeholder="🎯"
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '18px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                      Tên môn thể thao tùy chỉnh *
                    </label>
                    <input
                      type="text"
                      value={newSportForm.customName}
                      onChange={(e) => setNewSportForm({ ...newSportForm, customName: e.target.value })}
                      placeholder="Ví dụ: Cầu mây, Leo núi, Bi lắc..."
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
                </div>
              )}

              {/* Tự đánh giá trình độ ban đầu */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  2. Tự đánh giá trình độ ban đầu của bạn
                </label>
                <select
                  value={newSportForm.level}
                  onChange={(e) => setNewSportForm({ ...newSportForm, level: e.target.value })}
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
                  <option value="Mới tập chơi">Mới tập chơi (Căn bản, làm quen môn thể thao)</option>
                  <option value="Mới chơi - Đang tiến bộ">Mới chơi - Đang tiến bộ (Nắm luật, phát bóng tốt)</option>
                  <option value="Trung bình">Trung bình (Giao lưu phong trào ổn định)</option>
                  <option value="Trung bình - Khá">Trung bình - Khá (Đỡ bóng chuẩn, phối hợp nhịp nhàng)</option>
                  <option value="Khá - Đánh chắc tay">Khá - Đánh chắc tay (Chiến thuật tốt, điều bóng khó)</option>
                  <option value="Bán chuyên / Nâng cao">Bán chuyên / Nâng cao (Tập luyện chuyên sâu)</option>
                  <option value="Chuyên nghiệp / Thi đấu giải">Chuyên nghiệp / Thi đấu giải (Vận động viên thi đấu)</option>
                </select>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
                  💡 Trình độ tự đánh giá ban đầu này sẽ hiển thị trên thẻ hồ sơ của bạn và làm mốc ghép kèo. Bạn có thể tự cập nhật lại bất kỳ khi nào trình độ được nâng cao.
                </p>
              </div>

              {/* Số trận thi đấu trước đây (Tùy chọn) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  3. Số trận đã chơi / kinh nghiệm giao lưu (Tùy chọn)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({
                      ...prev,
                      matches: Math.max(0, (parseInt(prev.matches, 10) || 0) - 1),
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    -
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newSportForm.matches === undefined ? '' : newSportForm.matches}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setNewSportForm((prev) => ({
                        ...prev,
                        matches: val === '' ? '' : parseInt(val, 10),
                      }))
                    }}
                    onBlur={() => {
                      if (newSportForm.matches === '' || isNaN(newSportForm.matches)) {
                        setNewSportForm((prev) => ({ ...prev, matches: 0 }))
                      }
                    }}
                    placeholder="0"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #15803D',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#15803D',
                      outline: 'none',
                      background: '#F0FDF4',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({
                      ...prev,
                      matches: (parseInt(prev.matches, 10) || 0) + 1,
                    }))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      background: '#F9FAFB',
                      color: '#374151',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', marginRight: '4px' }}>Cộng nhanh:</span>
                  {[1, 5, 10].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setNewSportForm((prev) => ({
                        ...prev,
                        matches: (parseInt(prev.matches, 10) || 0) + inc,
                      }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewSportForm((prev) => ({ ...prev, matches: 0 }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#6B7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    Đặt về 0
                  </button>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  💡 Bạn có thể nhập trực tiếp số trận từ bàn phím hoặc dùng các nút tăng/giảm ở hai bên.
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
                Thêm môn thể thao &amp; Lưu trình độ
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
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                  Trung tâm Đánh Giá ({reviewTab === 'fairplay' ? fairPlayHistory.length : myFacilityReviews.length})
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  {reviewTab === 'fairplay'
                    ? 'Lịch sử cộng / trừ điểm Fair Play của bạn (đánh giá, đến muộn, vắng mặt, huỷ muộn, hồi điểm)'
                    : 'Các nhận xét & đánh giá chất lượng cơ sở sân đấu bạn đã trải nghiệm'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      padding: '6px 12px',
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

                <button
                  onClick={() => setShowAllReviewsModal(false)}
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
                  Lịch sử thi đấu ({profile.matchesPlayed} trận)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Ghi nhận tự động từ Check-in QR &amp; Ghép trận SportNexus
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
                  <p style={{ margin: '8px 0 0 0' }}>Đang tải lịch đặt sân từ máy chủ (GET /api/v1/bookings/my-bookings)...</p>
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
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}
                        >
                          {b.status || 'CONFIRMED'}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#1F2937' }}>
                          {b.courtName || b.facilityName || 'Sân thể thao SportNexus'}
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {b.bookingDate || b.date || 'Hôm nay'} • {b.startTime || '08:00'} - {b.endTime || '09:00'}
                        {b.orderCode && <span className="font-mono"> • #{b.orderCode}</span>}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803D' }}>
                        {(Number(b.totalPrice) || 0).toLocaleString('vi-VN')} đ
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMatchesModal(false)
                          navigate('/check-in')
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
                [
                  {
                    id: 1,
                    sport: 'Cầu lông',
                    opponent: 'Lê Nam & Tuấn Kiệt',
                    court: 'Sân Q7 (Sân số 3)',
                    score: '21 - 18, 21 - 15',
                    result: 'Thắng',
                    date: 'Hôm qua, 18:30',
                  },
                  {
                    id: 2,
                    sport: 'Pickleball',
                    opponent: 'Trần Hùng & Bảo Long',
                    court: 'Sân Nam Sài Gòn (Sân 2)',
                    score: '11 - 8, 11 - 9',
                    result: 'Thắng',
                    date: '03/10/2026, 19:00',
                  },
                  {
                    id: 3,
                    sport: 'Cầu lông',
                    opponent: 'Đặng Tuấn (Khá)',
                    court: 'Sân Tân Phong Q7',
                    score: '19 - 21, 20 - 22',
                    result: 'Thua',
                    date: '28/09/2026, 20:00',
                  },
                ].map((m) => (
                  <div
                    key={m.id}
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
                            background: m.result === 'Thắng' ? '#DCFCE7' : '#FEE2E2',
                            color: m.result === 'Thắng' ? '#15803D' : '#DC2626',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}
                        >
                          {m.result}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#1F2937' }}>
                          {m.sport}: {m.opponent}
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {m.court} • {m.date}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1C3524' }}>
                        {m.score}
                      </div>
                    </div>
                  </div>
                ))
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

      {/* 5. MODAL SÂN YÊU THÍCH */}
      {showFavoriteCourtsModal && (
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
              maxWidth: '600px',
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Danh sách sân yêu thích (5 địa điểm)
              </h3>
              <button
                onClick={() => setShowFavoriteCourtsModal(false)}
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
              {favoriteCourts.length === 0 && (
                <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>Bạn chưa lưu sân yêu thích nào.</p>
              )}
              {favoriteCourts.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: '#FAFCFA',
                    border: '1px solid rgba(45, 95, 63, 0.12)',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#1F2937' }}>
                      {c.name}
                    </h4>
                    <p style={{ margin: '3px 0', fontSize: '12px', color: '#6B7280' }}>
                      {c.address}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#15803D', fontWeight: 600 }}>
                      <span>🏸 {c.sport}</span>
                      <span>•</span>
                      <span>⭐ {c.rating}</span>
                      <span>•</span>
                      <span>{c.courtsCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowFavoriteCourtsModal(false)
                      navigate('/court-finder')
                    }}
                    style={{
                      background: '#15803D',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Đặt sân
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowFavoriteCourtsModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  background: '#6B7280',
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

      {/* 6. MODAL CÀI ĐẶT THÔNG BÁO */}
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid rgba(45, 95, 63, 0.15)',
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1C3524' }}>
                Cài đặt thông báo SportNexus
              </h3>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Kèo ghép trận LFG phù hợp trình độ', desc: 'Nhận thông báo khi có kèo cùng quận & rank ngang bằng' },
                { title: 'Nhắc lịch đặt sân & Check-in QR', desc: 'Báo trước 60 phút và 15 phút trước giờ bóng lăn' },
                { title: 'Biến động số dư ví Escrow', desc: 'Thông báo khi nạp tiền, hoàn tiền cọc, giải ngân cọc sân' },
                { title: 'Đánh giá & Xếp hạng sau trận', desc: 'Nhận thông báo khi đối thủ hoặc đồng đội chấm điểm' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <div style={{ maxWidth: '320px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#15803D',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowNotificationModal(false)
                  triggerToast('✅ Đã lưu cài đặt thông báo!')
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#15803D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Lưu cấu hình
              </button>
            </div>
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
                    Hotline khẩn cấp 24/7
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>1900 8899</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Hỗ trợ trực tiếp sự cố cọc sân, tranh chấp slot giờ chơi hoặc xác thực vé check-in khẩn cấp.</div>
                </div>

                <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '14px', border: '1px solid #DBEAFE' }}>
                  <div style={{ fontWeight: 800, color: '#2563EB', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
                    Trợ lý AI SportNexus Concierge
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#4B5563' }}>
                    Nhấn nút biểu tượng robot ở góc dưới cùng bên phải màn hình để nhận tư vấn ghép trận, chính sách hoàn hủy cọc và tìm sân tự động.
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#FAF5FF', borderRadius: '14px', border: '1px solid #F3E8FF' }}>
                  <div style={{ fontWeight: 800, color: '#7E22CE', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                    Email tiếp nhận tranh chấp &amp; hợp tác
                  </div>
                  <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: 600 }}>support@sportnexus.vn</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Phản hồi văn bản chính thức trong vòng 4 - 8 giờ làm việc.</div>
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

            {/* Sub-tabs điều hướng */}
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
                { id: 'password', label: 'Đổi mật khẩu', icon: 'lock' },
                { id: 'phone', label: 'Số điện thoại', icon: 'call' },
                { id: 'email', label: 'Email OTP', icon: 'mark_email_read' },
                { id: 'set_pwd', label: 'Đặt MK mới', icon: 'key' },
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
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
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

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Mật khẩu mới (tối thiểu 6 ký tự):
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
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

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Xác nhận mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
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
                    onChange={(e) => setPhoneInput(e.target.value)}
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
                <button
                  type="button"
                  onClick={handleUpdatePhone}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Lưu số điện thoại
                </button>
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
                    Mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={setPasswordFormData.newPassword}
                    onChange={(e) => setSetPasswordFormData({ ...setPasswordFormData, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Nhập lại mật khẩu mới:
                  </label>
                  <input
                    type="password"
                    required
                    value={setPasswordFormData.confirmPassword}
                    onChange={(e) => setSetPasswordFormData({ ...setPasswordFormData, confirmPassword: e.target.value })}
                    placeholder="Xác nhận mật khẩu"
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
                <button
                  type="submit"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Thiết lập mật khẩu
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
