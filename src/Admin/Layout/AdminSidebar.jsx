import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserRoundCheck, Building2, CalendarDays, Network, Trophy, CreditCard, ShieldAlert, Bell, Bot, Settings, Leaf, LogOut, X } from 'lucide-react'

const navigation = [
  ['Dashboard', LayoutDashboard], ['User Management', Users],
  ['Court Owners', UserRoundCheck], ['Facilities', Building2],
  ['Bookings', CalendarDays], ['LFG Management', Network],
  ['Tournaments', Trophy], ['Payments', CreditCard],
  ['Reviews & Reports', ShieldAlert], ['Notifications', Bell],
  ['AI Management', Bot], ['System Settings', Settings],
]

export default function AdminSidebar({ open, onClose }) {
  return (
    <aside className={`admin-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
      <NavLink className="admin-brand" to="/admin/dashboard" onClick={onClose}>
        <span className="admin-brand-mark"><Leaf size={22} fill="currentColor" /></span>
        <span><strong>SportNexus</strong><small>Management System</small></span>
      </NavLink>
      <button className="admin-sidebar-close admin-icon-button" aria-label="Close navigation" onClick={onClose}><X size={20} /></button>
      <nav className="admin-navigation">
        {navigation.map(([label, Icon], index) => index === 0 ? (
          <NavLink key={label} to="/admin/dashboard" end onClick={onClose} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} /><span>{label}</span>
          </NavLink>
        ) : (
          <button key={label} className="admin-nav-item" disabled title="Not implemented yet">
            <Icon size={17} /><span>{label}</span>{label === 'Notifications' && <span className="admin-nav-count">3</span>}
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
