import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { roleDestination } from './roleRoutes.js'
export default function ProtectedRoute({ destination, requiredRole }) {
  const { isAuthenticated, role } = useAuth()
  const localToken = localStorage.getItem('sportnexus_auth_token')
  const localRole = localStorage.getItem('sportnexus_user_role')

  const authed = isAuthenticated || Boolean(localToken)
  const currentRole = role || localRole

  if (!authed) return <Navigate to="/login" replace />

  const home = roleDestination(currentRole)
  const roleMatches = !requiredRole || (currentRole && currentRole.toLowerCase() === requiredRole.toLowerCase())

  if (!roleMatches) {
    return <Navigate to={home && home !== destination ? home : '/login'} replace />
  }

  if (destination && home && home !== destination) {
    return <Navigate to={home || '/login'} replace />
  }

  return <Outlet />
}
