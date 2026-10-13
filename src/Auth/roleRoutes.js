// Populate only with role strings verified by the backend team.
const defaultMappings = {
  Player: '/dashboard',
  player: '/dashboard',
  CourtOwner: '/owner/dashboard',
  court_owner: '/owner/dashboard',
  Owner: '/owner/dashboard',
  chusan: '/owner/dashboard',
  Admin: '/admin/dashboard',
  admin: '/admin/dashboard',
}

let mappings = { ...defaultMappings }
try {
  const parsed = JSON.parse(import.meta.env.VITE_AUTH_ROLE_ROUTES || '{}')
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    mappings = { ...defaultMappings, ...parsed }
  }
} catch { /* Use fallback mappings */ }

export function roleDestination(role) {
  if (!role) return null
  const route = Object.hasOwn(mappings, role)
    ? mappings[role]
    : Object.hasOwn(mappings, String(role).toLowerCase())
      ? mappings[String(role).toLowerCase()]
      : null
  return ['/dashboard', '/admin/dashboard', '/owner/dashboard'].includes(route) ? route : null
}
