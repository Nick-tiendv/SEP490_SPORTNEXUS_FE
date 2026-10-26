import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './auth-pages.css'

import { toast } from 'sonner'
import { getPublicSports, registerUser, sendOtp } from '../api/auth/authApi.js'

// Trình độ theo BE: BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL
const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Mới chơi' },
  { value: 'INTERMEDIATE', label: 'Trung bình' },
  { value: 'ADVANCED', label: 'Khá' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp' },
]
const sportEmoji = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('cầu lông') || n.includes('badminton')) return '🏸'
  if (n.includes('pickle')) return '🏓'
  if (n.includes('bóng rổ') || n.includes('basket')) return '🏀'
  if (n.includes('bóng đá') || n.includes('football') || n.includes('soccer')) return '⚽'
  if (n.includes('tennis') || n.includes('quần vợt')) return '🎾'
  if (n.includes('bóng chuyền') || n.includes('volley')) return '🏐'
  return '🏅'
}

function Register() {
  const [role, setRole] = useState('player') // 'player' | 'court_owner'
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Xác thực SĐT bắt buộc: gửi mã qua send-otp (REGISTER) rồi gửi kèm otpCode khi đăng ký.
  // Không gọi verify-otp trước, vì BE sẽ đánh dấu mã đã dùng và đăng ký sẽ báo mã sai.
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpBusy, setOtpBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const submitting = useRef(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  // Môn yêu thích lấy từ /api/v1/master-data/sports; chọn môn kèm trình độ (BE: sports[{ sportCategoryId, skillLevel }])
  const [sportOptions, setSportOptions] = useState([])
  const [sportsLoading, setSportsLoading] = useState(true)
  const [selectedSports, setSelectedSports] = useState({}) // { [sportCategoryId]: skillLevel }
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting.current) return

    const payload = {
      username: username.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      // Vai trò theo BE: Player | Owner
      role: role === 'court_owner' ? 'Owner' : 'Player',
      otpCode: otpCode.trim() || undefined,
      sports: Object.entries(selectedSports).map(([sportCategoryId, skillLevel]) => ({ sportCategoryId, skillLevel })),
    }

    const nextErrors = {}
    for (const key of ['username', 'fullName', 'phone', 'email']) {
      if (!payload[key]) nextErrors[key] = 'Vui lòng điền thông tin này.'
    }
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      nextErrors.email = 'Email không hợp lệ.'
    }
    if (!payload.otpCode) {
      nextErrors.otp = otpSent ? 'Vui lòng nhập mã OTP đã gửi tới số điện thoại.' : 'Vui lòng bấm "Gửi mã OTP" để xác thực số điện thoại.'
    }
    if (!password.trim()) nextErrors.password = 'Vui lòng nhập mật khẩu.'
    if (!confirmPassword || password !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    }
    if (!event.currentTarget.elements.terms?.checked) {
      nextErrors.terms = 'Vui lòng đồng ý với điều khoản dịch vụ.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    submitting.current = true
    setLoading(true)
    try {
      await registerUser(payload)
      try {
        localStorage.setItem('sportnexus_user_role', role)
        localStorage.setItem('sportnexus_registered_role', role)
      } catch { /* bỏ qua khi localStorage bị chặn */ }
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phone.trim()) { toast.error('Vui lòng nhập số điện thoại trước.'); return }
    setOtpBusy(true)
    try {
      const res = await sendOtp(phone.trim(), 'REGISTER')
      setOtpSent(true)
      setOtpCode('')
      setErrors((prev) => ({ ...prev, otp: undefined }))
      toast.success(res?.devOtp ? `Đã gửi mã OTP (môi trường thử nghiệm: ${res.devOtp}).` : 'Đã gửi mã OTP tới số điện thoại.')
    } catch (error) {
      toast.error(error?.message || 'Không gửi được mã OTP.')
    } finally {
      setOtpBusy(false)
    }
  }

  useEffect(() => {
    let alive = true
    getPublicSports()
      .then((list) => { if (alive) setSportOptions(list) })
      .catch(() => { if (alive) setSportOptions([]) })
      .finally(() => { if (alive) setSportsLoading(false) })
    return () => { alive = false }
  }, [])

  const toggleSport = (id) => {
    setSelectedSports((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = 'BEGINNER'
      return next
    })
  }
  const setSportLevel = (id, level) => setSelectedSports((prev) => ({ ...prev, [id]: level }))

  // Tính độ mạnh mật khẩu
  const calculatePasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.length >= 12) strength++
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
    if (/\d/.test(pass)) strength++
    if (/[^a-zA-Z0-9]/.test(pass)) strength++
    return strength
  }

  const getPasswordStrength = () => {
    const strength = calculatePasswordStrength(password)
    if (strength === 0 || password.length === 0) return { level: 0, text: '', color: 'bg-gray-200' }
    if (strength <= 2) return { level: 1, text: 'Yếu', color: 'bg-red-500' }
    if (strength <= 3) return { level: 2, text: 'Trung bình', color: 'bg-yellow-500' }
    return { level: 3, text: 'Mạnh', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="auth-standalone auth-register sport-animated-bg flex flex-col">


      <main className="auth-standalone-main relative text-gray-900">
        <section className="auth-register-intro" aria-label="Giới thiệu SportNexus">
          <div className="auth-register-intro-content">
            <div className="auth-register-intro-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="8" r="3" />
                <path strokeLinecap="round" d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-4-5.65" />
              </svg>
              <span>CỘNG ĐỒNG VẬN ĐỘNG VIÊN</span>
            </div>
            <h2 className="auth-register-intro-title">Bứt Phá Đam Mê<br />Cùng <span>SportNexus</span></h2>
            <p className="auth-register-intro-description">Hơn <strong>45.000</strong> tay vợt Cầu lông &amp; Pickleball đang kết nối, đặt sân và giao lưu thi đấu mỗi ngày.</p>
          </div>
        </section>
        <section aria-label="Registration Portal" className="auth-register-panel bg-white/80 backdrop-blur-sm">
          <div className="w-full max-w-xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2D5F3F] mb-2">
                Đăng ký tài khoản
              </h1>
              <p className="text-[#6B7280]">
                Gia nhập cộng đồng thể thao SportNexus ngay hôm nay.
              </p>
            </header>
            
            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-busy={loading}>
              {/* Role Selection Field (Người chơi / Chủ sân) */}
              <div>
                <label className="block text-sm font-medium text-[#2D5F3F] mb-2">
                  Vai trò đăng ký <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Player Card */}
                  <button
                    type="button"
                    aria-pressed={role === 'player'}
                    onClick={() => setRole('player')}
                    className={`w-full text-left cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative ${
                      role === 'player'
                        ? 'border-[#4A7C59] bg-[#E8F5E3] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      role === 'player' ? 'bg-[#4A7C59] text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-xl">🏃‍♂️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 font-bold text-[#2D5F3F] text-sm sm:text-base">
                        <span>Người chơi</span>
                        <span className="text-xs text-gray-500 font-normal">(Player)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Đặt sân nhanh, tìm bạn ghép trận giao lưu &amp; tham gia giải đấu
                      </p>
                    </div>
                    {role === 'player' && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#4A7C59] rounded-full flex items-center justify-center shadow-xs">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Court Owner Card */}
                  <button
                    type="button"
                    aria-pressed={role === 'court_owner'}
                    onClick={() => setRole('court_owner')}
                    className={`w-full text-left cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 relative ${
                      role === 'court_owner'
                        ? 'border-[#4A7C59] bg-[#E8F5E3] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      role === 'court_owner' ? 'bg-[#4A7C59] text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-xl">🏟️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 font-bold text-[#2D5F3F] text-sm sm:text-base">
                        <span>Chủ sân</span>
                        <span className="text-xs text-gray-500 font-normal">(Court Owner)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Quản lý cụm sân, biểu phí, lịch đặt sân &amp; doanh thu tự động
                      </p>
                    </div>
                    {role === 'court_owner' && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#4A7C59] rounded-full flex items-center justify-center shadow-xs">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#2D5F3F] mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  aria-invalid={!!errors.username}
                  aria-describedby="username-error"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none"
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && <p id="username-error" role="alert" className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="full-name">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                    id="full-name"
                    name="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    aria-describedby="fullName-error"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required 
                    type="text" 
                  />
                    {errors.fullName && <p id="fullName-error" role="alert" className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>
              </div>
              
              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-600 text-sm font-medium">+84</span>
                    </div>
                    <input 
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                      aria-describedby="phone-error"
                      placeholder="0912 345 678"
                      required 
                      type="tel" 
                    />
                    {errors.phone && <p id="phone-error" role="alert" className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div className="snx-row" style={{ marginTop: 8 }}>
                    <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={otpBusy || !phone.trim()} onClick={handleSendOtp}>
                      {otpSent ? 'Gửi lại mã OTP' : 'Gửi mã OTP'}
                    </button>
                    {otpSent && (
                        <input className="snx-input" style={{ flex: '1 1 110px', minHeight: 32, height: 32 }} inputMode="numeric" maxLength={6} placeholder="Mã OTP" aria-label="Mã OTP" value={otpCode} aria-invalid={!!errors.otp} onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setErrors((prev) => ({ ...prev, otp: undefined })) }} />
                    )}
                  </div>
                  {errors.otp && <p role="alert" className="mt-1 text-sm text-red-600">{errors.otp}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-[#2D5F3F] mb-2" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="email"
                      name="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-error"
                      placeholder="email@example.com"
                      required 
                      type="email" 
                    />
                    {errors.email && <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Môn thể thao quan tâm (không bắt buộc) */}
              <div>
                <label className="block text-sm font-medium text-[#2D5F3F] mb-2">
                  Bộ môn thể thao quan tâm
                </label>
                <div className="text-xs text-gray-500 mb-3">(Không bắt buộc, có thể chọn nhiều môn và trình độ của bạn)</div>
                {sportsLoading ? (
                  <p className="text-xs text-gray-500">Đang tải danh sách môn...</p>
                ) : sportOptions.length === 0 ? (
                  <p className="text-xs text-gray-500">Chưa tải được danh sách môn, bạn có thể chọn sau trong Hồ sơ.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sportOptions.map((sport) => {
                      const active = !!selectedSports[sport.id]
                      return (
                        <div
                          key={sport.id}
                          className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all ${
                            active ? 'border-[#4A7C59] bg-[#E8F5E3]' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <button type="button" aria-pressed={active} onClick={() => toggleSport(sport.id)} className="flex items-center gap-2.5 text-left">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-[#4A7C59] text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <span className="text-lg">{sportEmoji(sport.name)}</span>
                            </div>
                            <span className="font-semibold text-xs text-[#2D5F3F] truncate">{sport.name}</span>
                          </button>
                          {active && (
                            <select
                              className="snx-select"
                              style={{ minHeight: 30, height: 30, fontSize: 12 }}
                              aria-label={`Trình độ ${sport.name}`}
                              value={selectedSports[sport.id]}
                              onChange={(e) => setSportLevel(sport.id, e.target.value)}
                            >
                              {SKILL_LEVELS.map((lv) => <option key={lv.value} value={lv.value}>{lv.label}</option>)}
                            </select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#2D5F3F]" htmlFor="password">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    {password.length > 0 && (
                      <span className={`text-xs font-semibold ${
                        passwordStrength.level === 1 ? 'text-red-500' : 
                        passwordStrength.level === 2 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all" 
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      aria-describedby="password-error"
                      placeholder="Nhập mật khẩu an toàn"
                      required 
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    <button 
                      aria-label="Toggle password visibility" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A7C59]" 
                      onClick={(e) => { e.preventDefault(); setPasswordVisible(!passwordVisible) }} 
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {passwordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'
                        }`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#2D5F3F]" htmlFor="confirm-password">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    {confirmPassword.length > 0 && (
                      <span className={`text-xs font-semibold ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordsMatch ? '✓ Khớp' : '✗ Không khớp'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input 
                      className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                        confirmPassword.length > 0 
                          ? passwordsMatch 
                            ? 'border-green-500 focus:border-green-600 focus:ring-green-500/20' 
                            : 'border-red-500 focus:border-red-600 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-[#4A7C59] focus:ring-[#4A7C59]/20'
                      } focus:ring-2 outline-none transition-all`}
                      id="confirm-password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby="confirmPassword-error"
                      placeholder="Nhập lại mật khẩu"
                      required 
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {errors.confirmPassword && <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    <button 
                      aria-label="Toggle confirm password visibility" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#4A7C59]" 
                      onClick={(e) => { e.preventDefault(); setConfirmPasswordVisible(!confirmPasswordVisible) }} 
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {confirmPasswordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input 
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-[#4A7C59] focus:ring-[#4A7C59] cursor-pointer" 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required
                />
                <label className="text-sm text-gray-600 leading-relaxed cursor-pointer" htmlFor="terms">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-[#4A7C59] hover:underline font-medium">Điều khoản dịch vụ</a>
                  {' '}và{' '}
                  <a href="#" className="text-[#4A7C59] hover:underline font-medium">Chính sách bảo mật</a>
                  {' '}của SportNexus.
                </label>
              </div>
              
              {errors.terms && <p role="alert" className="text-sm text-red-600">{errors.terms}</p>}
              {/* Primary Create Account Button */}
              <div className="pt-2">
                <button 
                  className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-[#4A7C59] hover:bg-[#3D6549] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl" 
                  type="submit" disabled={loading}
                >
                  {loading ? 'Đang đăng ký...' : 'TẠO TÀI KHOẢN NGAY'}
                </button>
              </div>
            </form>
            
            {/* Social Divider */}
            <div className="my-6 relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="flex-shrink mx-4 text-sm text-gray-500 uppercase tracking-wider">
                Hoặc đăng ký nhanh bằng
              </span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            
            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" fill="#EA4335" />
                  <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4" />
                  <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" fill="#FBBC05" />
                  <path d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" fill="#34A853" />
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
            
            {/* Bottom Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Bạn đã có tài khoản?{' '}
                <Link className="text-[#4A7C59] font-semibold hover:underline" to="/login">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  )
}

export default Register
