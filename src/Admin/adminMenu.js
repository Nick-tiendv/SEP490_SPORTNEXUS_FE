import { LayoutDashboard, Users, UserRoundCheck, Building2, CalendarDays, Network, Trophy, Shield, CreditCard, Megaphone, ShieldAlert, Tags, Bell, Bot, Settings } from 'lucide-react'

// Enable an item only after its matching /admin/* route is registered in App.jsx.
// Enabled items automatically receive NavLink navigation and active styling.
// `badge` = key in dashboard.pending whose count is shown next to the item.
// `group` is display-only: consecutive items with the same group render under one sidebar heading.
export const adminMenu = [
  { label: "Tổng quan", path: '/admin/dashboard', icon: LayoutDashboard, enabled: true, end: true, group: "Tổng quan" },
  { label: "Quản lý người dùng", path: '/admin/users', icon: Users, enabled: true, group: "Người dùng" },
  { label: "Quản lý chủ sân", path: '/admin/court-owners', icon: UserRoundCheck, enabled: true, badge: 'ownerVerifications', group: "Người dùng" },
  { label: "Quản lý cơ sở thể thao", path: '/admin/facilities', icon: Building2, enabled: true, badge: 'facilityApprovals', group: "Vận hành" },
  { label: "Quản lý đặt sân", path: '/admin/bookings', icon: CalendarDays, enabled: true, group: "Vận hành" },
  { label: "Quản lý tìm nhóm chơi", path: '/admin/lfg', icon: Network, enabled: true, group: "Vận hành" },
  { label: "Quản lý giải đấu", path: '/admin/tournaments', icon: Trophy, enabled: true, group: "Vận hành" },
  { label: "Quản lý đội", path: '/admin/teams', icon: Shield, enabled: true, group: "Vận hành" },
  { label: "Quản lý thanh toán", path: '/admin/payments', icon: CreditCard, enabled: true, badge: 'withdrawals', group: "Tài chính & kiểm duyệt" },
  { label: "Gói quảng bá", path: '/admin/promotions', icon: Megaphone, enabled: true, group: "Tài chính & kiểm duyệt" },
  { label: "Đánh giá & Báo cáo", path: '/admin/reviews-reports', icon: ShieldAlert, enabled: true, badge: 'openReports', group: "Tài chính & kiểm duyệt" },
  { label: "Danh mục dùng chung", path: '/admin/master-data', icon: Tags, enabled: true, group: "Hệ thống" },
  { label: "Quản lý thông báo", path: '/admin/notifications', icon: Bell, enabled: true, group: "Hệ thống" },
  { label: "Quản lý AI", path: '/admin/ai', icon: Bot, enabled: false, group: "Hệ thống" },
  { label: "Cài đặt hệ thống", path: '/admin/settings', icon: Settings, enabled: true, group: "Hệ thống" },
]
