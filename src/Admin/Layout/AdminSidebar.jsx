import { useAuth } from '../../context/authContext.js'
import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { adminMenu } from '../adminMenu.js'

// Group consecutive menu items by their display-only `group` label.
const menuGroups = adminMenu.reduce((groups, item) => {
  const last = groups.at(-1)
  if (last && last.label === item.group) last.items.push(item)
  else groups.push({ label: item.group, items: [item] })
  return groups
}, [])

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth()
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar-top">
        <NavLink className="admin-brand" to="/admin/dashboard" onClick={onClose} title="SportNexus — Quản trị hệ thống">
          <span className="admin-brand-mark"><span className="material-symbols-outlined" aria-hidden="true">bolt</span></span>
          <span className="admin-brand-copy"><strong>SportNexus <i className="admin-brand-dot" aria-hidden="true" /></strong><small>Quản trị hệ thống</small></span>
        </NavLink>
        <button className="admin-sidebar-close admin-icon-button" aria-label="Đóng điều hướng" onClick={onClose}><X size={20} /></button>
      </div>
      <nav className="admin-navigation">
        {menuGroups.map(group => (
          <div key={group.label || 'default'} className="admin-nav-group">
            {group.label && <p className="admin-navigation-title">{group.label}</p>}
            {group.items.map(({ label, path, icon: Icon, enabled, end, count }) => enabled ? (
              <NavLink key={path} to={path} end={end} onClick={onClose} title={label} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} /><span className="admin-nav-label">{label}</span>{count && <span className="admin-nav-count" aria-label={`${count} mục mới`}>{count}</span>}
              </NavLink>
            ) : (
              <button key={path} type="button" className="admin-nav-item admin-nav-unavailable" disabled title={`${label} — Sắp ra mắt`}>
                <Icon size={18} /><span className="admin-nav-label">{label}</span><span className="admin-coming-soon">Sắp ra mắt</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-profile">
        <span className="admin-avatar">AT</span>
        <span className="admin-profile-copy"><strong>Alex Tran <span className="admin-online-dot" aria-hidden="true" /></strong><small>Quản trị viên</small></span>
        <button className="admin-icon-button admin-logout" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={16} /></button>
      </div>
    </aside>
  )
}
