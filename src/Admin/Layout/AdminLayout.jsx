import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'
import AdminHeader from './AdminHeader.jsx'
import '../admin.css'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="sn-admin">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <button className="admin-menu-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="admin-workspace">
        <AdminHeader onMenuToggle={() => setMenuOpen(open => !open)} />
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  )
}
