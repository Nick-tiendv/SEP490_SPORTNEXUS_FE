import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { roleDestination } from './roleRoutes.js'
export default function ProtectedRoute({ destination, requiredRole }) {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const home = roleDestination(role)
  if (requiredRole && role !== requiredRole) return <Navigate to={home && home !== destination ? home : '/login'} replace />
  if (!home || home !== destination) return <Navigate to={home || '/login'} replace />
  return <Outlet />
}
