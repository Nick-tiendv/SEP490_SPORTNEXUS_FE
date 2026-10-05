import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth-pages.css'

function ResetPassword() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password criteria - More detailed
  const criteria = [
    { id: 'length', label: 'Ít nhất 8 ký tự', regex: /.{8,}/, points: 1 },
    { id: 'uppercase', label: 'Chứa ít nhất 1 chữ cái viết hoa (A-Z)', regex: /[A-Z]/, points: 1 },
    { id: 'lowercase', label: 'Chứa ít nhất 1 chữ cái viết thường (a-z)', regex: /[a-z]/, points: 1 },
    { id: 'number', label: 'Chứa ít nhất 1 chữ số (0-9)', regex: /\d/, points: 1 },
    { id: 'special', label: 'Chứa ít nhất 1 ký tự đặc biệt (@, #, $, !, %, v.v.)', regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, points: 2 },
    { id: 'match', label: 'Khớp với mật khẩu xác nhận', check: () => newPassword === confirmPassword && newPassword.length > 0, points: 1 }
  ]

  // Check which criteria are met
  const checkCriteria = () => {
    const met = []
    criteria.forEach(criterion => {
      if (criterion.regex) {
        if (criterion.regex.test(newPassword)) {
          met.push(criterion.id)
        }
      } else if (criterion.check) {
        if (criterion.check()) {
          met.push(criterion.id)
        }
      }
    })
    return met
  }

  const metCriteria = checkCriteria()
  const allCriteriaMet = metCriteria.length === criteria.length

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, label: '', color: '', percentage: 0 }
    
    const score = criteria.reduce((total, criterion) => {
      if (criterion.check) {
        return total + (criterion.check() ? criterion.points : 0)
      }
      return total + (criterion.regex.test(newPassword) ? criterion.points : 0)
    }, 0)
    
    const maxScore = criteria.reduce((total, criterion) => total + criterion.points, 0)
    const percentage = (score / maxScore) * 100
    
    if (percentage < 30) {
      return { level: 1, label: 'Yếu', color: 'bg-red-500', textColor: 'text-red-600', percentage }
    } else if (percentage < 60) {
      return { level: 2, label: 'Trung bình', color: 'bg-orange-500', textColor: 'text-orange-600', percentage }
    } else if (percentage < 85) {
      return { level: 3, label: 'Tốt', color: 'bg-blue-500', textColor: 'text-blue-600', percentage }
    } else {
      return { level: 4, label: 'Mạnh', color: 'bg-green-500', textColor: 'text-green-600', percentage }
    }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async () => {
    if (!allCriteriaMet) return

    // TODO: Call API to reset password
    console.log('Resetting password:', { newPassword })
    
    // Navigate to login or success page
    navigate('/login', { state: { message: 'Mật khẩu đã được đặt lại thành công!' } })
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex flex-col pastel-animated-bg">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm py-3 px-6">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4A7C3E] rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900">SportNexus</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-wide">Tournament Engine</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {/* Trang chủ */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              TRANG CHỦ
            </button>

            {/* Language & User */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  VI / EN
                </span>
              </button>
              <button className="w-8 h-8 bg-[#4A7C3E] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </button>

          {/* Help Button */}
          <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-gray-600">help_outline</span>
          </button>

          {/* Logo - SportNexus branding */}
          <div className="flex justify-center mb-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4A7C3E] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="white"/>
                  <circle cx="12" cy="12" r="3" fill="#4A7C3E"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">SportNexus</span>
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span className="text-sm font-bold text-green-800 uppercase tracking-wide">Bảo mật tài khoản</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Đặt lại mật khẩu
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Tạo một khẩu mới an toàn cho tài khoản SportNexus của bạn.
          </p>

          {/* New Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#4A7C3E] focus:bg-white transition-all text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showNewPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#4A7C3E] focus:bg-white transition-all text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showConfirmPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Độ mạnh mật khẩu:</span>
                <span className={`text-xs font-bold uppercase ${passwordStrength.textColor}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${passwordStrength.color} transition-all duration-500 ease-out`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                />
              </div>
              {/* Strength indicators */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      passwordStrength.level >= level 
                        ? passwordStrength.color 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Password Criteria */}
          <div className="mb-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 17.93c-3.95-.49-7-3.85-7-7.93V6.3l7-3.11v16.74z"/>
                </svg>
                <span className="text-sm font-bold text-gray-800">Tiêu chuẩn mật khẩu an toàn</span>
              </div>
              <div className="flex items-center gap-2">
                {allCriteriaMet ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      ĐẠT
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      CHƯA ĐẠT
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">Tiến độ hoàn thành</span>
                <span className="text-xs font-bold text-gray-700">{metCriteria.length}/{criteria.length}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    allCriteriaMet ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(metCriteria.length / criteria.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Criteria list */}
            <div className="space-y-2.5">
              {criteria.map((criterion, index) => {
                const isMet = metCriteria.includes(criterion.id)
                return (
                  <div 
                    key={criterion.id} 
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                      isMet 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300 ${
                      isMet 
                        ? 'bg-green-500 border-green-500 scale-110' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isMet ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm leading-relaxed transition-all duration-300 ${
                        isMet 
                          ? 'text-green-700 font-semibold' 
                          : 'text-gray-700'
                      }`}>
                        {criterion.label}
                      </span>
                      {isMet && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                          <span className="text-xs text-green-600 font-medium">Đã đạt yêu cầu</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tips */}
            {!allCriteriaMet && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Mẹo:</strong> Mật khẩu mạnh giúp bảo vệ tài khoản của bạn tốt hơn. Hãy sử dụng sự kết hợp của chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>
            )}

            {/* Success message */}
            {allCriteriaMet && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse-slow">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-green-800">Xuất sắc! Mật khẩu đạt chuẩn bảo mật</p>
                    <p className="text-xs text-green-700 mt-1">Tài khoản của bạn sẽ được bảo vệ tốt với mật khẩu này.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!allCriteriaMet}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]
              ${allCriteriaMet 
                ? 'bg-[#4A7C3E] hover:bg-[#3d6634]' 
                : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/60 backdrop-blur-sm py-4">
        <div className="w-full px-6 flex items-center justify-between text-xs">
          <div className="text-gray-600">
            © 2024 SPORTNEXUS VIETNAM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Cam kết bảo mật
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Chính sách Fairplay
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium uppercase tracking-wide">
              Điều khoản dịch vụ
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ResetPassword
