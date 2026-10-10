import { LayoutDashboard, Users, UserRoundCheck, Building2, CalendarDays, Network, Trophy, CreditCard, ShieldAlert, Bell, Bot, Settings } from 'lucide-react'

// Enable an item only after its matching /admin/* route is registered in App.jsx.
// Enabled items automatically receive NavLink navigation and active styling.
export const adminMenu = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, enabled: true, end: true },
  { label: 'User Management', path: '/admin/users', icon: Users, enabled: true },
  { label: 'Court Owners', path: '/admin/court-owners', icon: UserRoundCheck, enabled: true },
  { label: 'Facilities', path: '/admin/facilities', icon: Building2, enabled: true },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays, enabled: true },
  { label: 'LFG Management', path: '/admin/lfg', icon: Network, enabled: true },
  { label: 'Tournaments', path: '/admin/tournaments', icon: Trophy, enabled: true },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard, enabled: true },
  { label: 'Reviews & Reports', path: '/admin/reviews-reports', icon: ShieldAlert, enabled: false },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell, enabled: false, count: 3 },
  { label: 'AI Management', path: '/admin/ai', icon: Bot, enabled: false },
  { label: 'System Settings', path: '/admin/settings', icon: Settings, enabled: false },
]
