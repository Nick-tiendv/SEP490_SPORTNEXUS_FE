import { roleDestination } from './roleRoutes.js'

// Bước chung sau khi BE trả LoginResponse (đăng nhập mật khẩu / Google / Facebook):
// lưu phiên vào AuthContext, ghi vài thông tin hiển thị cũ, trả đường dẫn trang chủ theo vai trò.
export function finishLogin(data, { contextLogin, identifier = '' }) {
  const { token, refreshToken, userId, fullName, role } = data
  const targetRoute = roleDestination(role)
  if (!targetRoute) throw new Error('Vai trò tài khoản chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
  contextLogin({ token, role, refreshToken })

  const profileRole = targetRoute === '/owner/dashboard' ? 'court_owner' : targetRoute === '/admin/dashboard' ? 'admin' : 'player'
  try {
    localStorage.setItem('sportnexus_user_role', profileRole)
    localStorage.setItem('sportnexus_user_id', userId ?? '')
    localStorage.setItem('sportnexus_user_fullname', fullName || '')
    localStorage.setItem('sportnexus_current_user', JSON.stringify({
      userId, fullName, username: data.username || identifier, role: profileRole, rawRole: role,
    }))
  } catch { /* AuthProvider vẫn giữ phiên khi localStorage bị chặn */ }
  return targetRoute
}
