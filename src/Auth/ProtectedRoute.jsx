import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { roleDestination } from './roleRoutes.js'
export default function ProtectedRoute({ destination }) {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const home = roleDestination(role)
  if (!home || home !== destination) return <Navigate to={home || '/login'} replace />
  return <Outlet />
}
