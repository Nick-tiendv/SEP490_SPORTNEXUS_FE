import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'
import AdminHeader from './AdminHeader.jsx'
// Shared Admin design system: tokens → shell & layout → components. Page CSS loads after these.
import '../styles/admin-theme.css'
import '../styles/admin-layout.css'
import '../styles/admin-components.css'
import '../styles/admin-patterns.css'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="sn-admin">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <button className="admin-menu-overlay" aria-label="Đóng điều hướng" onClick={() => setMenuOpen(false)} />}
      <div className="admin-workspace">
        <AdminHeader onMenuToggle={() => setMenuOpen(open => !open)} />
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  )
}
