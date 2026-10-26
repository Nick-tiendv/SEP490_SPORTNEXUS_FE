import { Search, Bell, Grid2X2, ChevronRight, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { initialsOf } from './initials.js'

export default function AdminHeader({ onMenuToggle, profile }) {
  const { pathname } = useLocation()
  const pageTitles = {
    dashboard: 'Tổng quan', users: 'Quản lý người dùng', 'court-owners': 'Quản lý chủ sân',
    facilities: 'Quản lý cơ sở thể thao', bookings: 'Quản lý đặt sân', lfg: 'Quản lý tìm nhóm chơi',
    tournaments: 'Quản lý giải đấu', payments: 'Quản lý thanh toán', 'reviews-reports': 'Đánh giá & Báo cáo',
    notifications: 'Quản lý thông báo', ai: 'Quản lý AI', settings: 'Cài đặt hệ thống',
  }
  const title = pageTitles[pathname.split('/')[2]] || 'Tổng quan'
  return (
    <header className="admin-header">
      <button className="admin-mobile-menu admin-icon-button" aria-label="Mở hoặc đóng điều hướng" onClick={onMenuToggle}><Menu size={20} /></button>
      <nav className="admin-breadcrumb" aria-label="Vị trí hiện tại">
        <span className="admin-breadcrumb-root">Quản trị</span>
        <ChevronRight size={14} aria-hidden="true" />
        <strong aria-current="page">{title}</strong>
      </nav>
      <label className="admin-search"><Search size={16} /><input aria-label="Tìm kiếm trong trang quản trị" placeholder="Tìm kiếm trong trang quản trị…" /></label>
      <div className="admin-header-actions">
        <button className="admin-icon-button admin-notifications" disabled aria-label="Thông báo (chưa triển khai)" title="Thông báo (chưa triển khai)"><Bell size={18} /><i /></button>
        <button className="admin-icon-button" disabled aria-label="Ứng dụng (chưa triển khai)" title="Ứng dụng (chưa triển khai)"><Grid2X2 size={18} /></button>
      </div>
      <div className="admin-header-profile"><span className="admin-avatar admin-avatar-small">{profile ? initialsOf(profile.name) : '…'}</span><span className="admin-header-profile-copy"><strong>{profile?.name || 'Đang tải…'}</strong><small>{profile?.username ? `@${profile.username} · Quản trị viên` : 'Quản trị viên'}</small></span></div>
    </header>
  )
}
