import { Search, Bell, Grid2X2, ChevronDown, Menu, MapPin } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function AdminHeader({ onMenuToggle }) {
  const { pathname } = useLocation()
  const pageTitles = {
    dashboard: 'Tổng quan', users: 'Quản lý người dùng', 'court-owners': 'Quản lý chủ sân',
    facilities: 'Quản lý cơ sở thể thao', bookings: 'Quản lý đặt sân', lfg: 'Quản lý tìm nhóm chơi',
    tournaments: 'Quản lý giải đấu', payments: 'Quản lý thanh toán', 'reviews-reports': 'Đánh giá & Báo cáo',
    notifications: 'Quản lý thông báo', ai: 'Quản lý AI', settings: 'Cài đặt hệ thống',
  }
  return (
    <header className="admin-header">
      <button className="admin-mobile-menu admin-icon-button" aria-label="Mở hoặc đóng điều hướng" onClick={onMenuToggle}><Menu size={20} /></button>
      <div className="admin-header-context"><strong>SportNexus</strong><small>Quản trị</small></div>
      <span className="admin-breadcrumb"><span>›</span> {pageTitles[pathname.split('/')[2]] || 'Tổng quan'}</span>
      <label className="admin-search"><Search size={15} /><input aria-label="Tìm kiếm trong trang quản trị" /></label>
      <span className="admin-platform"><MapPin size={14} /><span>Hệ thống Bình Thạnh<small>TP. HCM</small></span><ChevronDown size={12} /></span>
      <button className="admin-icon-button admin-notifications" disabled aria-label="Thông báo (chưa triển khai)"><Bell size={18} /><i /></button>
      <button className="admin-icon-button" disabled aria-label="Ứng dụng (chưa triển khai)"><Grid2X2 size={18} /></button>
      <div className="admin-header-profile"><span className="admin-avatar admin-avatar-small">AT</span><span><strong>Alex Tran</strong><small>Quản trị viên cấp cao</small></span><ChevronDown size={12} /></div>
    </header>
  )
}
