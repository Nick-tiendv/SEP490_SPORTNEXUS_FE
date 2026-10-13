import { LayoutDashboard, Users, UserRoundCheck, Building2, CalendarDays, Network, Trophy, CreditCard, ShieldAlert, Bell, Bot, Settings } from 'lucide-react'

// Enable an item only after its matching /admin/* route is registered in App.jsx.
// Enabled items automatically receive NavLink navigation and active styling.
export const adminMenu = [
  { label: "Tổng quan", path: '/admin/dashboard', icon: LayoutDashboard, enabled: true, end: true },
  { label: "Quản lý người dùng", path: '/admin/users', icon: Users, enabled: true },
  { label: "Quản lý chủ sân", path: '/admin/court-owners', icon: UserRoundCheck, enabled: true },
  { label: "Quản lý cơ sở thể thao", path: '/admin/facilities', icon: Building2, enabled: true },
  { label: "Quản lý đặt sân", path: '/admin/bookings', icon: CalendarDays, enabled: true },
  { label: "Quản lý tìm nhóm chơi", path: '/admin/lfg', icon: Network, enabled: true },
  { label: "Quản lý giải đấu", path: '/admin/tournaments', icon: Trophy, enabled: true },
  { label: "Quản lý thanh toán", path: '/admin/payments', icon: CreditCard, enabled: true },
  { label: "Đánh giá & Báo cáo", path: '/admin/reviews-reports', icon: ShieldAlert, enabled: true },
  { label: "Quản lý thông báo", path: '/admin/notifications', icon: Bell, enabled: true, count: 3 },
  { label: "Quản lý AI", path: '/admin/ai', icon: Bot, enabled: false },
  { label: "Cài đặt hệ thống", path: '/admin/settings', icon: Settings, enabled: true },
]
