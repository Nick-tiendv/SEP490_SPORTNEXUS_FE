import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DEFAULT_PROFILE = {
  fullName: 'Nguyễn Văn Đức',
  email: 'duc.nguyen@sportnexus.vn',
  phone: '0908 123 456',
  dob: '1988-06-15',
  gender: 'Nam',
  idCard: '079088001234',
  idIssueDate: '2021-04-20',
  idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
  address: '35 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  // Thông tin doanh nghiệp & cơ sở
  businessName: 'SportNexus Arena Q.7 (Công ty TNHH Thể Thao & Sự Kiện Nexus Saigon)',
  taxId: '0316892345',
  businessLicense: 'GP-2024/TDTT-HCM-9921 (Đã phê duyệt)',
  bankName: 'Vietcombank — CN Nam Sài Gòn',
  bankAccount: '0071000987654',
  bankHolder: 'NGUYEN VAN DUC',
  roleTitle: 'Chủ Cơ Sở',
  kycStatus: 'verified', // 'verified' | 'pending'
}

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Đọc thông tin từ localStorage hoặc mặc định
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_owner_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.roleTitle) {
          parsed.roleTitle = parsed.roleTitle.replace(/\s*•\s*Đối Tác Kim Cương/g, '').trim()
        }
        return parsed
      }
    } catch (e) {}
    return DEFAULT_PROFILE
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(profile)
  const [toastMessage, setToastMessage] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Tự động làm sạch '• Đối Tác Kim Cương' trong localStorage và cập nhật state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sportnexus_owner_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.roleTitle && (parsed.roleTitle.includes('Kim Cương') || parsed.roleTitle.includes('VIP'))) {
          parsed.roleTitle = 'Chủ Cơ Sở'
          localStorage.setItem('sportnexus_owner_profile', JSON.stringify(parsed))
          setProfile(parsed)
          setFormData(parsed)
          window.dispatchEvent(new Event('sportnexus_owner_profile_updated'))
        }
      }
    } catch (e) {}
  }, [])

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Lưu thông tin cập nhật
  const handleSave = (e) => {
    e.preventDefault()
    const cleanData = { ...formData, roleTitle: 'Chủ Cơ Sở' }
    setProfile(cleanData)
    localStorage.setItem('sportnexus_owner_profile', JSON.stringify(cleanData))
    // Bắn event để TopBar cập nhật tức thì
    window.dispatchEvent(new Event('sportnexus_owner_profile_updated'))
    setIsEditing(false)
    showToast('🎉 Đã cập nhật thông tin hồ sơ Chủ Sân thành công!')
  }

  // Xử lý tải ảnh đại diện từ thiết bị của chủ sân (chỉ khi đang ở chế độ chỉnh sửa)
  const handleFileUpload = (e) => {
    if (!isEditing) return
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('❌ Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, JPEG)!')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('❌ Dung lượng ảnh tối đa cho phép là 10MB!')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target.result
      setFormData((prev) => ({ ...prev, avatar: base64Data }))
      setShowAvatarModal(false)
      showToast('🎉 Đã tải lên ảnh mới! Hãy bấm "Lưu Thay Đổi" để áp dụng.')
    }
    reader.readAsDataURL(file)
  }

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  // Xử lý Đăng xuất
  const handleLogout = () => {
    try {
      localStorage.removeItem('sportnexus_user_role')
      localStorage.removeItem('sportnexus_auth_token')
    } catch (e) {}
    navigate('/login')
  }

  // Danh sách avatar mẫu để đổi nhanh
  const SAMPLE_AVATARS = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  ]

  return (
    <div style={{ padding: '24px 32px 60px 32px', minHeight: 'calc(100vh - 60px)', background: '#F8FAFC' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Header breadcrumb & title */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/owner/dashboard" style={{ color: '#15803D', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
              ← Quay lại Dashboard
            </Link>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Hồ Sơ Cá Nhân & Doanh Nghiệp Chủ Sân
          </h1>
        </div>

        {/* Edit / Save Action Button */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'transform 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              edit
            </span>
            Chỉnh Sửa Hồ Sơ
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCancel}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                save
              </span>
              Lưu Thay Đổi
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Showcase Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          marginBottom: '28px',
        }}
      >
        {/* Decorative Top Banner */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #1C3524 0%, #2D5F3F 50%, #15803D 100%)',
            position: 'relative',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#86EFAC' }}>
              verified
            </span>
            ĐÃ XÁC MINH DANH TÍNH (KYC LEVEL 3)
          </div>
        </div>

        {/* Avatar & Header Summary */}
        <div style={{ padding: '0 32px 28px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '24px', marginTop: '-60px', marginBottom: '24px' }}>
            {/* Avatar with click to change and upload from device */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.avatar}
                  alt={formData.fullName}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '5px solid #FFFFFF',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    objectFit: 'cover',
                    background: '#FFFFFF',
                  }}
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Tải ảnh cá nhân từ máy tính"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      photo_camera
                    </span>
                  </button>
                )}
              </div>

              {/* Quick direct upload button - chỉ hiển thị khi bấm Chỉnh sửa hồ sơ */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    marginTop: '8px',
                    background: '#ECFDF5',
                    color: '#047857',
                    border: '1px solid #A7F3D0',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    upload_file
                  </span>
                  Tải Ảnh Từ Máy
                </button>
              )}
            </div>

            {/* Title & Badges */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {formData.fullName}
                </h2>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    border: '1px solid #86EFAC',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Chủ Cơ Sở
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
                {formData.email} • {formData.phone}
              </p>
            </div>

            {/* Quick Facility Tag */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '12px 18px',
                borderRadius: '14px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                CƠ SỞ TRỰC THUỘC
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C3524', marginTop: '2px' }}>
                SportNexus Arena Q.7
              </div>
              <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                14 Sân thi đấu hoạt động
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave}>
            {/* Section 1: Thông Tin Cá Nhân */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '22px' }}>
                  person
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  1. Thông Tin Cá Nhân & Liên Hệ
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {/* Họ và tên */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Họ và Tên Chủ Sân <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Số Điện Thoại (Liên kết Smart OTP) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Email Nhận Quyết Toán <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    disabled={!isEditing}
                    value={formData.dob}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Giới tính */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Giới Tính
                  </label>
                  <select
                    name="gender"
                    disabled={!isEditing}
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Số CCCD / CMND */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Số Căn Cước Công Dân (CCCD 12 số)
                  </label>
                  <input
                    type="text"
                    name="idCard"
                    disabled={!isEditing}
                    value={formData.idCard}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Địa chỉ thường trú */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Liên Hệ / Thường Trú
                  </label>
                  <input
                    type="text"
                    name="address"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pháp Lý Doanh Nghiệp & Ngân Hàng Quyết Toán */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '22px' }}>
                  assured_workload
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  2. Thông Tin Doanh Nghiệp & Tài Khoản Ngân Hàng Nhận Tiền
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {/* Tên doanh nghiệp */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Đơn Vị / Công Ty Đăng Ký Vận Hành Cơ Sở
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    disabled={!isEditing}
                    value={formData.businessName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Mã số thuế */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Mã Số Thuế (MST)
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    disabled={!isEditing}
                    value={formData.taxId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Giấy phép thể thao */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Giấy Phép Kinh Doanh Hoạt Động Thể Thao
                  </label>
                  <input
                    type="text"
                    name="businessLicense"
                    disabled={!isEditing}
                    value={formData.businessLicense}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#059669',
                    }}
                  />
                </div>

                {/* Ngân hàng */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Ngân Hàng Thụ Hưởng Mặc Định
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    disabled={!isEditing}
                    value={formData.bankName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                </div>

                {/* Số tài khoản */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Số Tài Khoản Nhận Quyết Toán
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    disabled={!isEditing}
                    value={formData.bankAccount}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#2563EB',
                    }}
                  />
                </div>

                {/* Chủ tài khoản */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Chủ Tài Khoản (In hoa không dấu)
                  </label>
                  <input
                    type="text"
                    name="bankHolder"
                    disabled={!isEditing}
                    value={formData.bankHolder}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isEditing ? '1px solid #10B981' : '1px solid #E2E8F0',
                      background: isEditing ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* If in edit mode, show save button inside form */}
            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  Lưu Thông Tin Cập Nhật
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* DƯỚI CÙNG: KHU VỰC NGUY HIỂM & NÚT ĐĂNG XUẤT TÀI KHOẢN (LOGOUT) */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #FEE2E2',
          padding: '24px 32px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: '22px' }}>
              logout
            </span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#991B1B' }}>
              Đăng Xuất Khỏi Hệ Thống Quản Trị
            </h3>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => setShowLogoutModal(true)}
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(220, 38, 38, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(220, 38, 38, 0.25)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            power_settings_new
          </span>
          ĐĂNG XUẤT TÀI KHOẢN
        </button>
      </div>

      {/* Modal: Xác nhận Đăng Xuất */}
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '34px' }}>
                logout
              </span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>
              Xác Nhận Đăng Xuất?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: '14px', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn đăng xuất tài khoản Chủ Cơ Sở khỏi thiết bị này? Bạn sẽ cần đăng nhập lại để tiếp tục quản lý sân.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Đăng Xuất Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Đổi Ảnh Đại Diện */}
      {showAvatarModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Thay Đổi Ảnh Đại Diện Chủ Sân
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Khung Tải Ảnh Trực Tiếp Từ Máy Tính */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #10B981',
                borderRadius: '16px',
                padding: '22px 16px',
                textAlign: 'center',
                background: '#F0FDF4',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DCFCE7'
                e.currentTarget.style.borderColor = '#059669'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F0FDF4'
                e.currentTarget.style.borderColor = '#10B981'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                  cloud_upload
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Bấm Để Tải Lên Ảnh Cá Nhân Từ Thiết Bị
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Hỗ trợ các định dạng PNG, JPG, JPEG, WEBP (Tối đa 10MB)
              </div>
              <div
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  file_upload
                </span>
                Chọn Tệp Từ Máy Tính
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
              — HOẶC CHỌN ẢNH ĐẠI DIỆN MẪU CÓ SẴN —
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
              {SAMPLE_AVATARS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar sample ${idx}`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, avatar: url }))
                    setShowAvatarModal(false)
                    showToast('Đã chọn ảnh đại diện mới! Hãy bấm "Lưu Thay Đổi" để áp dụng.')
                    setIsEditing(true)
                  }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: formData.avatar === url ? '3px solid #10B981' : '2px solid #E2E8F0',
                    transition: 'transform 0.2s',
                  }}
                />
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Hoặc dán URL hình ảnh từ internet:
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.avatar}
                onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowAvatarModal(false)
                  setIsEditing(true)
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Xác Nhận Chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
