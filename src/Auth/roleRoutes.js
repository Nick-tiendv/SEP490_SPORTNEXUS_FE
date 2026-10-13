// Populate only with role strings verified by the backend team.
let mappings = {}
try {
  const parsed = JSON.parse(import.meta.env.VITE_AUTH_ROLE_ROUTES || '{}')
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) mappings = parsed
} catch { /* Deny access for invalid configuration. */ }
export function roleDestination(role) {
  const route = Object.hasOwn(mappings, role) ? mappings[role] : null
  return ['/dashboard', '/admin/dashboard'].includes(route) ? route : null
}
