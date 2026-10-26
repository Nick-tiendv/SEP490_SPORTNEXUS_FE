import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'
import AdminHeader from './AdminHeader.jsx'
import { AppFooter } from '../../components/layout/AppShell.jsx'
import { getMyAccount } from '../../api/admin/accountApi.js'
import { getAdminDashboard } from '../../api/admin/dashboardApi.js'
import { lastDaysRange, toApiDate } from '../Dashboard/dashboardData.js'
// Shared Admin design system: tokens → shell & layout → components. Page CSS loads after these.
import '../styles/admin-theme.css'
import '../styles/admin-layout.css'
import '../styles/admin-components.css'
import '../styles/admin-patterns.css'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [badges, setBadges] = useState({})
  const { pathname } = useLocation()

  useEffect(() => {
    let cancelled = false
    getMyAccount().then(account => !cancelled && setProfile(account)).catch(() => {})
    return () => { cancelled = true }
  }, [])
  // Số mục chờ xử lý trên menu (dashboard.pending); tải lại khi chuyển trang để cập nhật sau khi duyệt.
  // Lần đầu dùng cùng khoảng 30 ngày với biểu đồ Tổng quan để dùng chung request (cache trong dashboardApi).
  const firstBadgeLoad = useRef(true)
  useEffect(() => {
    let cancelled = false
    const { from, to } = lastDaysRange(30)
    getAdminDashboard({ fromDate: toApiDate(from), toDate: toApiDate(to) }, { fresh: !firstBadgeLoad.current })
      .then(({ pending }) => !cancelled && setBadges(pending)).catch(() => {})
    firstBadgeLoad.current = false
    return () => { cancelled = true }
  }, [pathname])

  return (
    <div className="sn-admin">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} badges={badges} />
      {menuOpen && <button className="admin-menu-overlay" aria-label="Đóng điều hướng" onClick={() => setMenuOpen(false)} />}
      <div className="admin-workspace">
        <AdminHeader onMenuToggle={() => setMenuOpen(open => !open)} profile={profile} badges={badges} />
        <main className="admin-main"><Outlet context={{ profile }} /></main>
        <AppFooter />
      </div>
    </div>
  )
}
