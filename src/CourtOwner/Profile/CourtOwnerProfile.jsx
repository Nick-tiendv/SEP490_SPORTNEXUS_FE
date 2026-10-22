import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  changePassword,
  getBankAccount,
  getMyVerification,
  logout as logoutApi,
  submitVerification,
  updateMyProfile,
  uploadMyAvatar,
  uploadVerificationImage,
} from '../../api/owner'
import { useAuth } from '../../context/authContext.js'
import { useOwnerContext } from '../Layout/ownerContext.js'

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const formatDateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN', { timeZone: VN_TIME_ZONE }) : '—')

const KYC_STATUS = {
  NOT_SUBMITTED: { label: 'Chưa xác minh', bg: '#F1F5F9', color: '#475569', icon: 'gpp_maybe' },
  PENDING: { label: 'Đang chờ duyệt', bg: '#FEF3C7', color: '#B45309', icon: 'hourglass_top' },
  APPROVED: { label: 'Đã xác minh', bg: '#DCFCE7', color: '#15803D', icon: 'verified_user' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', color: '#B91C1C', icon: 'gpp_bad' },
}
const KYC_IMAGES = [
  { key: 'idFrontImageUrl', label: 'Ảnh CCCD mặt trước', required: true },
  { key: 'idBackImageUrl', label: 'Ảnh CCCD mặt sau', required: true },
  { key: 'selfieImageUrl', label: 'Ảnh chân dung cầm CCCD', required: true },
  { key: 'businessLicenseUrl', label: 'Giấy phép kinh doanh (nếu có)', required: false },
]
const emptyKyc = { fullName: '', idNumber: '', dateOfBirth: '', address: '', idFrontImageUrl: '', idBackImageUrl: '', selfieImageUrl: '', businessLicenseUrl: '' }

// Kiểm tra ảnh trước khi tải lên (BE cũng kiểm tra lại).
const imageError = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'
  if (file.size > MAX_IMAGE_SIZE) return 'Ảnh không được vượt quá 5MB.'
  return ''
}
const isAdult = (date) => {
  const birth = new Date(date)
  const adult = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate())
  return adult <= new Date()
}

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { profile, refreshProfile } = useOwnerContext()
  const avatarInputRef = useRef(null)

  const [toastMessage, setToastMessage] = useState(null)
  const [busy, setBusy] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')

  const [verification, setVerification] = useState({ loaded: false, data: null, error: '' })
  const [kycToken, setKycToken] = useState(0)
  const [showKycForm, setShowKycForm] = useState(false)
  const [kycForm, setKycForm] = useState(emptyKyc)

  const [bankAccount, setBankAccount] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    let cancelled = false
    getMyVerification()
      .then((data) => !cancelled && setVerification({ loaded: true, data: data || null, error: '' }))
      .catch((error) => !cancelled && setVerification({ loaded: true, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [kycToken])

  useEffect(() => {
    getBankAccount().then((data) => setBankAccount(data?.bankAccountNumber ? data : null)).catch(() => {})
  }, [])

  const run = async (key, action, successMessage) => {
    setBusy(key)
    try {
      const result = await action()
      if (successMessage) showToast(successMessage)
      return result ?? true
    } catch (error) {
      showToast(error.message, 'error')
      return null
    } finally {
      setBusy('')
    }
  }

  // ---------- Thông tin cá nhân: PUT /api/auth/me (chỉ fullName / avatarUrl) ----------
  const startEditing = () => {
    setFullName(profile?.fullName || '')
    setIsEditing(true)
  }
  const handleSaveProfile = async (event) => {
    event.preventDefault()
    if (!fullName.trim()) {
      showToast('Họ và tên không được để trống.', 'error')
      return
    }
    const ok = await run('profile', () => updateMyProfile({ fullName: fullName.trim(), avatarUrl: profile?.avatarUrl ?? null }), 'Đã cập nhật thông tin cá nhân.')
    if (ok) {
      setIsEditing(false)
      refreshProfile().catch(() => {})
    }
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const error = imageError(file)
    if (error) {
      showToast(error, 'error')
      return
    }
    const ok = await run('avatar', () => uploadMyAvatar(file), 'Đã cập nhật ảnh đại diện.')
    if (ok) refreshProfile().catch(() => {})
  }

  // ---------- eKYC ----------
  const kycStatus = profile?.ownerVerificationStatus || verification.data?.status || 'NOT_SUBMITTED'
  const kycInfo = KYC_STATUS[String(kycStatus).toUpperCase()] || KYC_STATUS.NOT_SUBMITTED
  const canSubmitKyc = ['NOT_SUBMITTED', 'REJECTED'].includes(String(kycStatus).toUpperCase())

  const openKycForm = () => {
    const previous = verification.data
    setKycForm({
      ...emptyKyc,
      fullName: previous?.fullName || profile?.fullName || '',
      address: previous?.address || '',
      dateOfBirth: previous?.dateOfBirth ? String(previous.dateOfBirth).slice(0, 10) : '',
    })
    setShowKycForm(true)
  }

  const handleKycImage = async (key, file) => {
    if (!file) return
    const error = imageError(file)
    if (error) {
      showToast(error, 'error')
      return
    }
    const result = await run(`kyc-${key}`, () => uploadVerificationImage(file))
    if (result?.url) setKycForm((prev) => ({ ...prev, [key]: result.url }))
  }

  const handleSubmitKyc = async (event) => {
    event.preventDefault()
    if (!/^\d{12}$/.test(kycForm.idNumber)) {
      showToast('Số CCCD phải gồm đúng 12 chữ số.', 'error')
      return
    }
    if (!kycForm.dateOfBirth || !isAdult(kycForm.dateOfBirth)) {
      showToast('Chủ sân phải từ 18 tuổi trở lên.', 'error')
      return
    }
    const missing = KYC_IMAGES.find((image) => image.required && !kycForm[image.key])
    if (missing) {
      showToast(`Vui lòng tải lên ${missing.label.toLowerCase()}.`, 'error')
      return
    }
    const ok = await run(
      'kyc',
      () =>
        submitVerification({
          fullName: kycForm.fullName.trim(),
          idNumber: kycForm.idNumber,
          dateOfBirth: kycForm.dateOfBirth,
          address: kycForm.address.trim() || null,
          idFrontImageUrl: kycForm.idFrontImageUrl,
          idBackImageUrl: kycForm.idBackImageUrl,
          selfieImageUrl: kycForm.selfieImageUrl,
          businessLicenseUrl: kycForm.businessLicenseUrl || null,
        }),
      'Đã gửi hồ sơ xác minh, vui lòng chờ Quản trị viên duyệt.',
    )
    if (ok) {
      setShowKycForm(false)
      setKycToken((value) => value + 1)
      refreshProfile().catch(() => {})
    }
  }

  // ---------- Đổi mật khẩu ----------
  const handleChangePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp.', 'error')
      return
    }
    const ok = await run('password', () => changePassword(passwordForm), 'Đổi mật khẩu thành công. Hãy dùng mật khẩu mới cho lần đăng nhập sau.')
    if (ok) setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  // ---------- Đăng xuất: thu hồi phiên trên máy chủ rồi xóa phiên ở trình duyệt ----------
  const handleLogout = async () => {
    setBusy('logout')
    await logoutApi().catch(() => {})
    logout()
    navigate('/login', { replace: true })
  }

  const panelStyle = {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    padding: '26px',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
    marginBottom: '24px',
  }
  const labelStyle = { display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', background: '#FFFFFF' }
  const readonlyStyle = { ...inputStyle, background: '#F8FAFC', color: '#475569' }
  const primaryButton = (disabled) => ({ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#15803D', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1 })
  const secondaryButton = { padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
  const displayName = profile?.fullName || profile?.username || 'Chủ sân'

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '420px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{toastMessage.type === 'error' ? 'error' : 'check_circle'}</span>
          {toastMessage.msg}
        </div>
      )}

      {/* THẺ HỒ SƠ */}
      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '110px', background: 'linear-gradient(135deg, #064E3B 0%, #15803D 55%, #10B981 100%)' }} />
        <div style={{ padding: '0 28px 26px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '20px', marginTop: '-48px' }}>
          <div style={{ position: 'relative' }}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} style={{ width: '104px', height: '104px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #FFFFFF', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }} />
            ) : (
              <div style={{ width: '104px', height: '104px', borderRadius: '50%', border: '4px solid #FFFFFF', background: 'linear-gradient(135deg, #2D5F3F 0%, #15803D 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800, boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={busy === 'avatar'}
              title="Đổi ảnh đại diện (JPG/PNG/WEBP, tối đa 5MB)"
              style={{ position: 'absolute', right: 0, bottom: 4, width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #FFFFFF', background: '#15803D', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{busy === 'avatar' ? 'hourglass_top' : 'photo_camera'}</span>
            </button>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: '220px', paddingBottom: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>{profile ? displayName : 'Đang tải...'}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 700 }}>@{profile?.username || '—'} • Chủ Cơ Sở</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: kycInfo.bg, color: kycInfo.color, fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{kycInfo.icon}</span>
                {kycInfo.label}
              </span>
              {profile && !profile.isActive && (
                <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>Tài khoản bị khóa</span>
              )}
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600, paddingBottom: '4px' }}>Tham gia từ {formatDateVN(profile?.createdAt)}</div>
        </div>
      </div>

      {/* THÔNG TIN CÁ NHÂN */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Thông Tin Tài Khoản</h3>
          {!isEditing && profile && (
            <button onClick={startEditing} style={{ ...secondaryButton, padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              Sửa họ tên
            </button>
          )}
        </div>
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              {isEditing ? (
                <input autoFocus maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} style={inputStyle} />
              ) : (
                <input readOnly value={profile?.fullName || ''} style={readonlyStyle} />
              )}
            </div>
            <div>
              <label style={labelStyle}>Tên đăng nhập</label>
              <input readOnly value={profile?.username || ''} style={readonlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input readOnly value={profile?.email || ''} style={readonlyStyle} />
            </div>
            <div>
              <label style={labelStyle}>Số điện thoại {profile?.isPhoneVerified ? '✓ đã xác thực' : ''}</label>
              <input readOnly value={profile?.phone || ''} style={readonlyStyle} />
            </div>
          </div>
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={() => setIsEditing(false)} style={secondaryButton}>Hủy</button>
              <button type="submit" disabled={busy === 'profile'} style={primaryButton(busy === 'profile')}>{busy === 'profile' ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          )}
        </form>
      </div>

      {/* XÁC MINH DANH TÍNH (eKYC) */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Xác Minh Danh Tính (eKYC)</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              Chủ sân phải được Quản trị viên duyệt hồ sơ mới tạo được cơ sở thể thao.
            </p>
          </div>
          {canSubmitKyc && !showKycForm && (
            <button onClick={openKycForm} style={primaryButton(false)}>
              {String(kycStatus).toUpperCase() === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ xác minh'}
            </button>
          )}
        </div>

        {verification.error && <div style={{ color: '#B91C1C', fontWeight: 700, marginBottom: '10px' }}>{verification.error}</div>}

        {String(kycStatus).toUpperCase() === 'REJECTED' && verification.data?.rejectReason && !showKycForm && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '13.5px', fontWeight: 700, marginBottom: '14px' }}>
            Lý do từ chối: {verification.data.rejectReason}
          </div>
        )}

        {showKycForm ? (
          <form onSubmit={handleSubmitKyc}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={labelStyle}>Họ tên đúng như trên CCCD</label>
                <input required maxLength={100} value={kycForm.fullName} onChange={(event) => setKycForm((prev) => ({ ...prev, fullName: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Số CCCD (12 chữ số)</label>
                <input required inputMode="numeric" maxLength={12} value={kycForm.idNumber} onChange={(event) => setKycForm((prev) => ({ ...prev, idNumber: event.target.value.replace(/\D/g, '') }))} style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={labelStyle}>Ngày sinh</label>
                <input required type="date" value={kycForm.dateOfBirth} onChange={(event) => setKycForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Địa chỉ thường trú</label>
                <input maxLength={300} value={kycForm.address} onChange={(event) => setKycForm((prev) => ({ ...prev, address: event.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              {KYC_IMAGES.map((image) => (
                <label
                  key={image.key}
                  style={{ display: 'block', borderRadius: '14px', border: `1.5px dashed ${kycForm[image.key] ? '#86EFAC' : '#CBD5E1'}`, background: '#F8FAFC', padding: '10px', cursor: 'pointer', textAlign: 'center' }}
                >
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(event) => { handleKycImage(image.key, event.target.files?.[0]); event.target.value = '' }} />
                  {kycForm[image.key] ? (
                    <img src={kycForm[image.key]} alt={image.label} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px' }} />
                  ) : (
                    <div style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{busy === `kyc-${image.key}` ? 'hourglass_top' : 'add_a_photo'}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{busy === `kyc-${image.key}` ? 'Đang tải lên...' : 'Bấm để chọn ảnh'}</span>
                    </div>
                  )}
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                    {image.label}{image.required ? ' *' : ''}
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowKycForm(false)} style={secondaryButton}>Hủy</button>
              <button type="submit" disabled={!!busy} style={primaryButton(busy === 'kyc')}>{busy === 'kyc' ? 'Đang gửi...' : 'Gửi hồ sơ cho Quản trị viên'}</button>
            </div>
          </form>
        ) : !verification.loaded ? (
          <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải hồ sơ xác minh...</div>
        ) : verification.data ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', padding: '16px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            {[
              ['Họ tên trên CCCD', verification.data.fullName],
              ['Số CCCD', verification.data.idNumber],
              ['Ngày sinh', formatDateVN(verification.data.dateOfBirth)],
              ['Địa chỉ', verification.data.address || '—'],
              ['Ngày gửi', formatDateVN(verification.data.createdAt)],
              ['Ngày duyệt', formatDateVN(verification.data.reviewedAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#475569', fontSize: '13.5px', fontWeight: 600, textAlign: 'center' }}>
            Bạn chưa gửi hồ sơ xác minh. Chuẩn bị ảnh CCCD 2 mặt và ảnh chân dung cầm CCCD (JPG/PNG/WEBP, tối đa 5MB).
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* TÀI KHOẢN NGÂN HÀNG */}
        <div style={{ ...panelStyle, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Tài Khoản Nhận Tiền</h3>
            <Link to="/owner/settlement" style={{ fontSize: '13px', fontWeight: 700, color: '#15803D', textDecoration: 'none' }}>Quản lý →</Link>
          </div>
          {bankAccount ? (
            <div style={{ borderRadius: '14px', padding: '16px 18px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
              <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 700 }}>{bankAccount.bankName}</div>
              <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '1.5px', margin: '6px 0', fontFamily: 'monospace' }}>{bankAccount.bankAccountNumber}</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{bankAccount.bankAccountHolder}</div>
            </div>
          ) : (
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              Chưa lưu tài khoản ngân hàng. Thêm tại trang Báo cáo & Rút tiền.
            </div>
          )}
        </div>

        {/* ĐỔI MẬT KHẨU */}
        <div style={{ ...panelStyle, marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Đổi Mật Khẩu</h3>
          {profile && !profile.hasPassword ? (
            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              Tài khoản đăng nhập bằng Google/Facebook chưa có mật khẩu.
            </div>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['oldPassword', 'Mật khẩu hiện tại', 'current-password'],
                ['newPassword', 'Mật khẩu mới (tối thiểu 6 ký tự)', 'new-password'],
                ['confirmPassword', 'Nhập lại mật khẩu mới', 'new-password'],
              ].map(([key, placeholder, autoComplete]) => (
                <input
                  key={key}
                  required
                  type="password"
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  value={passwordForm[key]}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  style={inputStyle}
                />
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={busy === 'password'} style={primaryButton(busy === 'password')}>{busy === 'password' ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ĐĂNG XUẤT */}
      <div style={{ ...panelStyle, marginTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', border: '1px solid #FECACA' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#B91C1C' }}>Đăng Xuất</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', fontWeight: 600 }}>Kết thúc phiên làm việc trên thiết bị này.</p>
        </div>
        <button onClick={() => setShowLogoutModal(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#DC2626', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Đăng xuất
        </button>
      </div>

      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#DC2626' }}>logout</span>
            <h3 style={{ margin: '8px 0 6px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Đăng xuất khỏi SportNexus?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>Bạn sẽ cần đăng nhập lại để quản lý cơ sở.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ ...secondaryButton, flex: 1 }}>Ở lại</button>
              <button onClick={handleLogout} disabled={busy === 'logout'} style={{ flex: 1, padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#DC2626', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy === 'logout' ? 0.6 : 1 }}>
                {busy === 'logout' ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
