import './auth-pages.css'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// Hàm chuẩn hóa số điện thoại Việt Nam (xóa ký tự đặc biệt, chuẩn hóa 0xxx hoặc +84xxx)
export const normalizePhone = (phoneStr) => {
  if (!phoneStr) return ''
  const digits = String(phoneStr).replace(/\D/g, '')
  if (digits.startsWith('84') && digits.length >= 11) {
    return '0' + digits.slice(2)
  }
  if (digits.length === 9) {
    return '0' + digits
  }
  return digits
}

// Hàm nhận diện vai trò tài khoản dựa trên dữ liệu hệ thống
export const detectUserRole = (rawInput) => {
  if (!rawInput) return null
  const cleanId = String(rawInput).trim().toLowerCase()
  const normInput = normalizePhone(cleanId)

  // 1. Kiểm tra trong danh sách người dùng đã đăng ký (sportnexus_users map)
  try {
    const usersMap = JSON.parse(localStorage.getItem('sportnexus_users') || '{}')
    if (usersMap[cleanId] && usersMap[cleanId].role) {
      return usersMap[cleanId].role
    }
    if (normInput && usersMap[normInput] && usersMap[normInput].role) {
      return usersMap[normInput].role
    }
    // Duyệt tìm kiếm mảng người dùng
    const found = Object.values(usersMap).find((u) => {
      const uEmail = (u.email || '').trim().toLowerCase()
      const uPhone = (u.phone || '').trim()
      const uNormPhone = normalizePhone(uPhone)
      return (
        (uEmail && uEmail === cleanId) ||
        (uPhone && uPhone === cleanId) ||
        (normInput && uNormPhone && normInput === uNormPhone)
      )
    })
    if (found && found.role) {
      return found.role
    }
  } catch (err) {}

  // 2. Kiểm tra trong mảng lịch sử đăng ký (sportnexus_user_records)
  try {
    const records = JSON.parse(localStorage.getItem('sportnexus_user_records') || '[]')
    const foundRecord = records.find((u) => {
      const uEmail = (u.email || '').trim().toLowerCase()
      const uNormPhone = normalizePhone(u.phone || '')
      return (
        (uEmail && uEmail === cleanId) ||
        (normInput && uNormPhone && normInput === uNormPhone)
      )
    })
    if (foundRecord && foundRecord.role) {
      return foundRecord.role
    }
  } catch (err) {}

  // 3. Kiểm tra Profile Chủ Sân đã lưu trong hệ thống (sportnexus_owner_profile)
  try {
    const ownerSaved = localStorage.getItem('sportnexus_owner_profile')
    if (ownerSaved) {
      const ownerData = JSON.parse(ownerSaved)
      const ownerEmail = (ownerData.email || '').trim().toLowerCase()
      const ownerPhoneNorm = normalizePhone(ownerData.phone || '')
      const ownerName = (ownerData.fullName || '').trim().toLowerCase()
      if (
        (ownerEmail && ownerEmail === cleanId) ||
        (normInput && ownerPhoneNorm && normInput === ownerPhoneNorm) ||
        cleanId === ownerName ||
        cleanId === 'nguyen van duc' ||
        cleanId === 'nguyenvanduc'
      ) {
        return 'court_owner'
      }
    }
  } catch (err) {}

  // 4. Danh sách tài khoản demo có sẵn (Seed Accounts)
  const courtOwnerSeedList = [
    'owner@sportnexus.com',
    'chusan@sportnexus.com',
    'chusan@gmail.com',
    'chusan@sportnexus.vn',
    'duc.nguyen@sportnexus.vn',
    'courtowner@sportnexus.com',
    'owner',
    'chusan',
    '0908123456',
    '0908 123 456'
  ]
  const adminSeedList = [
    'admin@sportnexus.com',
    'admin@sportnexus.vn',
    'quantri@sportnexus.com',
    'admin',
    'quantri'
  ]
  const playerSeedList = [
    'player@sportnexus.com',
    'player@sportnexus.vn',
    'nguoichoi@gmail.com',
    'minh.nguyen@sportnexus.vn',
    'minh@sportnexus.vn',
    'player',
    'nguoichoi',
    '0901234567',
    '0901 123 456'
  ]

  if (courtOwnerSeedList.some(s => s.toLowerCase() === cleanId || normalizePhone(s) === normInput)) {
    return 'court_owner'
  }
  if (adminSeedList.some(s => s.toLowerCase() === cleanId || normalizePhone(s) === normInput)) {
    return 'admin'
  }
  if (playerSeedList.some(s => s.toLowerCase() === cleanId || normalizePhone(s) === normInput)) {
    return 'player'
  }

  // 5. Nhận diện từ khóa thông minh (Keywords)
  if (
    cleanId.includes('owner') ||
    cleanId.includes('chusan') ||
    cleanId.includes('court') ||
    cleanId.includes('manager') ||
    cleanId.includes('quanly') ||
    cleanId.includes('facility') ||
    cleanId.includes('san')
  ) {
    return 'court_owner'
  }
  if (cleanId.includes('admin') || cleanId.includes('quantri')) {
    return 'admin'
  }
  if (
    cleanId.includes('player') ||
    cleanId.includes('nguoichoi') ||
    cleanId.includes('member') ||
    cleanId.includes('vdv')
  ) {
    return 'player'
  }

  return null
}

function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const navigate = useNavigate()

  // Xác định trước vai trò hiển thị trực tiếp khi người dùng gõ
  const previewRole = detectUserRole(identifier)

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const detected = detectUserRole(identifier)

    // Nếu không nhận diện được qua các quy tắc trên, mặc định là player
    const finalRole = detected || 'player'

    // Lưu role phiên hiện tại vào localStorage
    try {
      localStorage.setItem('sportnexus_user_role', finalRole)
      localStorage.setItem('sportnexus_auth_token', 'sportnexus_token_' + Date.now())

      // Cập nhật thông tin phiên đăng nhập
      const cleanId = (identifier || '').trim().toLowerCase()
      const usersMap = JSON.parse(localStorage.getItem('sportnexus_users') || '{}')
      if (usersMap[cleanId]) {
        localStorage.setItem('sportnexus_current_user', JSON.stringify(usersMap[cleanId]))
      } else if (finalRole === 'court_owner' || finalRole === 'admin') {
        const ownerSaved = localStorage.getItem('sportnexus_owner_profile')
        if (ownerSaved) {
          localStorage.setItem('sportnexus_current_user', ownerSaved)
        }
      }
    } catch (err) {}

    // Tự động điều hướng đến trang đúng với vai trò
    if (finalRole === 'court_owner' || finalRole === 'admin') {
      navigate('/owner/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen sport-animated-bg flex flex-col">
      {/* Header - Bấm vào logo để tự động về trang chủ */}
      <header className="w-full px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100">
        {/* Logo Clickable về Trang Chủ */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-[#2D5F3F] rounded-2xl flex items-center justify-center ring-2 ring-white ring-opacity-20 shadow-sm group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[#2D5F3F] font-bold text-lg leading-tight tracking-tight">SportNexus</span>
            <span className="text-[#2D5F3F] text-[10px] uppercase tracking-wider font-semibold">Tournament Engine</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-3.5 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
            {/* Logo Icon */}
            <div className="flex justify-center mb-5 sm:mb-6">
              <Link to="/" title="Về trang chủ" className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D5F3F] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white ring-opacity-20 hover:scale-105 transition-transform">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
                </svg>
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1.5 sm:mb-2">
              Đăng Nhập SportNexus
            </h1>
            <p className="text-gray-600 text-center mb-6 text-xs sm:text-sm">
              Chào mừng bạn trở lại với nền tảng thể thao đa môn SportNexus
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              {/* Email / SĐT Input */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Email hoặc Số điện thoại
                </label>
                <input
                  type="text"
                  id="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc số điện thoại..."
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent text-sm sm:text-base text-gray-900"
                  required
                />

                {/* Badge thông báo nhận diện vai trò tự động */}
                {identifier.trim().length > 1 && previewRole === 'court_owner' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">domain</span>
                    <span>Tài khoản Chủ Sân (Court Owner) • Sẽ vào Trang Quản Trị Cơ Sở</span>
                  </div>
                )}
                {identifier.trim().length > 1 && previewRole === 'admin' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-300 px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">admin_panel_settings</span>
                    <span>Tài khoản Quản Trị Viên (Admin) • Sẽ vào Trang Quản Trị Hệ Thống</span>
                  </div>
                )}
                {identifier.trim().length > 1 && previewRole === 'player' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 border border-green-300 px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-green-600">sports_tennis</span>
                    <span>Tài khoản Người Chơi (Player) • Sẽ vào Trang Đặt Sân &amp; Ghép Kèo</span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent text-sm sm:text-base text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-[#2D5F3F] border-gray-300 rounded focus:ring-[#2D5F3F]"
                  />
                  <span className="ml-2 text-gray-700">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="text-[#2D5F3F] font-semibold hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#2D5F3F] hover:bg-[#234a32] text-white font-bold py-3 sm:py-3.5 px-6 rounded-lg transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] text-sm sm:text-base"
              >
                <span>ĐĂNG NHẬP</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 uppercase tracking-wider">
                  Hoặc đăng nhập bằng
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#2D5F3F] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <p>© 2026 SportNexus Vietnam. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="opacity-60">•</span>
          <a href="#" className="hover:text-gray-900">Cam kết bảo mật</a>
          <span className="opacity-60">•</span>
          <a href="#" className="hover:text-gray-900">Điều khoản dịch vụ</a>
        </div>
      </footer>
    </div>
  )
}

export default Login
