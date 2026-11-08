import { useAuth } from '../../context/authContext.js'
import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { adminMenu } from '../adminMenu.js'
import { initialsOf } from './initials.js'

// Group consecutive menu items by their display-only `group` label.
const menuGroups = adminMenu.reduce((groups, item) => {
  const last = groups.at(-1)
  if (last && last.label === item.group) last.items.push(item)
  else groups.push({ label: item.group, items: [item] })
  return groups
}, [])

export default function AdminSidebar({ open, onClose, profile, badges }) {
  const { logout } = useAuth()
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar-top">
        <NavLink className="admin-brand" to="/admin/dashboard" onClick={onClose} title="SportNexus — Quản trị hệ thống">
          <span className="admin-brand-mark"><img src="/logo-mark.png" alt="SportNexus" className="admin-brand-mark-img" /></span>
          <span className="admin-brand-copy"><strong><img src="/logo-wordmark.png" alt="SportNexus" className="admin-brand-wordmark" /></strong><small>Quản trị hệ thống</small></span>
        </NavLink>
        <button className="admin-sidebar-close admin-icon-button" aria-label="Đóng điều hướng" onClick={onClose}><X size={20} /></button>
      </div>
      <nav className="admin-navigation">
        {menuGroups.map(group => (
          <div key={group.label || 'default'} className="admin-nav-group">
            {group.label && <p className="admin-navigation-title">{group.label}</p>}
            {group.items.map(({ label, path, icon: Icon, enabled, end, badge }) => { const count = badges?.[badge]; return enabled ? (
              <NavLink key={path} to={path} end={end} onClick={onClose} title={label} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} /><span className="admin-nav-label">{label}</span>{count > 0 && <span className="admin-nav-count" aria-label={`${count} mục chờ xử lý`}>{count}</span>}
              </NavLink>
            ) : (
              <button key={path} type="button" className="admin-nav-item admin-nav-unavailable" disabled title={`${label} — Sắp ra mắt`}>
                <Icon size={18} /><span className="admin-nav-label">{label}</span><span className="admin-coming-soon">Sắp ra mắt</span>
              </button>
            ) })}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-profile">
        <span className="admin-avatar">{profile ? initialsOf(profile.name) : '…'}</span>
        <span className="admin-profile-copy"><strong>{profile?.name || 'Đang tải…'} <span className="admin-online-dot" aria-hidden="true" /></strong><small>{profile?.email || 'Quản trị viên'}</small></span>
        <button className="admin-icon-button admin-logout" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={16} /></button>
      </div>
    </aside>
  )
}
