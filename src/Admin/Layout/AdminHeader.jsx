import { Search, Bell, Grid2X2, ChevronDown, Menu, MapPin } from 'lucide-react'

export default function AdminHeader({ onMenuToggle }) {
  return (
    <header className="admin-header">
      <button className="admin-mobile-menu admin-icon-button" aria-label="Toggle navigation" onClick={onMenuToggle}><Menu size={20} /></button>
      <div className="admin-header-context"><strong>SportNexus</strong><small>Admin</small></div>
      <span className="admin-breadcrumb"><span>›</span> Overview</span>
      <label className="admin-search"><Search size={15} /><input aria-label="Search dashboard" placeholder="Tìm kiếm users, chủ sân, cơ sở, bookings..." /></label>
      <span className="admin-platform"><MapPin size={14} /><span>Hệ thống Bình Thạnh<small>TP. HCM</small></span><ChevronDown size={12} /></span>
      <button className="admin-icon-button admin-notifications" disabled aria-label="Notifications (not implemented)"><Bell size={18} /><i /></button>
      <button className="admin-icon-button" disabled aria-label="Applications (not implemented)"><Grid2X2 size={18} /></button>
      <div className="admin-header-profile"><span className="admin-avatar admin-avatar-small">AT</span><span><strong>Alex Tran</strong><small>Super Admin</small></span><ChevronDown size={12} /></div>
    </header>
  )
}
