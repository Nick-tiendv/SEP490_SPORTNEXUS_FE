import './auth-pages.css'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { loginUser } from '../api/auth/authApi.js'
import { finishLogin } from './finishLogin.js'
import SocialLoginButtons from './SocialLoginButtons.jsx'
import { useAuth } from '../context/authContext.js'


function Login() {
  const { login: contextLogin } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()


  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const data = await loginUser({ username: identifier.trim(), password })
      const targetRoute = finishLogin(data, { contextLogin, identifier: identifier.trim() })
      const { fullName } = data
      try { localStorage.removeItem('sportnexus_auth_token') } catch { /* bỏ qua */ }

      const successText = 'Đăng nhập thành công! Chào mừng ' + (fullName || identifier) + '.'
      setSuccessMessage(successText)
      toast.success(successText)
      navigate(targetRoute, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      const msg = err.message || 'Tài khoản hoặc mật khẩu không chính xác!'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-standalone auth-login flex flex-col">


      {/* Main Content */}
      <main className="auth-standalone-main">
        <div className="auth-login-form">
          {/* Login Card */}
          <div className="auth-login-card">
            {/* Logo Icon */}
            <div className="flex justify-center mb-5 sm:mb-6">
              <Link to="/" title="Về trang chủ" className="auth-login-logo flex items-center justify-center hover:scale-105 transition-transform">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white"/>
                </svg>
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1.5 sm:mb-2">
              Đăng Nhập SportNexus
            </h1>
            <p className="text-gray-600 text-center mb-6 text-[10px] min-[360px]:text-[11.5px] min-[390px]:text-xs sm:text-sm">
              Chào mừng bạn trở lại với nền tảng đặt sân thể thao đa môn
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              {/* Thông báo lỗi khi call API */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-red-700 animate-fadeIn">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Thông báo thành công */}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-800 animate-fadeIn">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* Username / Email / SĐT Input */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Tên đăng nhập, Email hoặc SĐT
                </label>
                <input
                  type="text"
                  id="email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="Ví dụ: User1, email hoặc số điện thoại..."
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent text-sm sm:text-base text-gray-900"
                  required
                  disabled={isLoading}
                />

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
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorMessage) setErrorMessage('')
                    }}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent text-sm sm:text-base text-gray-900"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    disabled={isLoading}
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
                disabled={isLoading}
                className="w-full bg-[#2D5F3F] hover:bg-[#234a32] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-3.5 px-6 rounded-lg transition-all duration-200 uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>ĐANG ĐĂNG NHẬP...</span>
                  </>
                ) : (
                  <span>ĐĂNG NHẬP</span>
                )}
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

            {/* Đăng nhập Google / Facebook (POST /api/auth/google | /api/auth/facebook) */}
            <SocialLoginButtons mode="login" />

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

    </div>
  )
}

export default Login
