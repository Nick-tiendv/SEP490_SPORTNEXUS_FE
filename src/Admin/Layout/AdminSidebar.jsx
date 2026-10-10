import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { adminMenu } from '../adminMenu.js'

export default function AdminSidebar({ open, onClose }) {
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
      <NavLink className="admin-brand" to="/admin/dashboard" onClick={onClose}>
        <span className="admin-brand-mark"><span className="material-symbols-outlined" aria-hidden="true">bolt</span></span>
        <span><strong>SportNexus <i className="admin-brand-dot" aria-hidden="true" /></strong><small>Admin Management</small></span>
      </NavLink>
      <button className="admin-sidebar-close admin-icon-button" aria-label="Close navigation" onClick={onClose}><X size={20} /></button>
      <nav className="admin-navigation">
        <p className="admin-navigation-title">Admin Navigation</p>
        {adminMenu.map(({ label, path, icon: Icon, enabled, end, count }) => enabled ? (
          <NavLink key={path} to={path} end={end} onClick={onClose} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} /><span>{label}</span>{count && <span className="admin-nav-count">{count}</span>}
          </NavLink>
        ) : (
          <button key={path} type="button" className="admin-nav-item admin-nav-unavailable" disabled title={`${label} — Coming soon`}>
            <Icon size={17} /><span>{label}</span><span className="admin-coming-soon">Coming soon</span>
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-profile">
        <span className="admin-avatar">AT</span>
        <span className="admin-profile-copy"><strong>Alex Tran <span className="admin-online-dot" /></strong><small>Administrator</small></span>
        <button className="admin-icon-button" disabled aria-label="Sign out (not implemented)"><LogOut size={16} /></button>
      </div>
    </aside>
  )
}
