import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import '../../styles/app-shell.css'

// Khung giao diện dùng chung cho Player, Chủ sân (Admin dùng cùng kích thước qua admin-layout.css).
// AppSidebar · SidebarNav · AppTopbar · UserMenu · AppFooter · PageHeader

export function AppSidebar({ homeTo, roleLabel, open, onClose, children }) {
  const { pathname } = useLocation()
  // Đóng sidebar trên điện thoại mỗi khi chuyển trang
  useEffect(() => { onClose?.() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {open && <button type="button" className="snx-overlay" aria-label="Đóng menu" onClick={onClose} />}
      <aside className={`snx-sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng">
        <div className="snx-sidebar-top">
          <Link to={homeTo} className="snx-brand" title="Về trang chủ">
            <span className="snx-brand-mark"><span className="material-symbols-outlined" aria-hidden="true">bolt</span></span>
            <span className="snx-brand-copy">
              <strong>SportNexus <i className="snx-brand-dot" aria-hidden="true" /></strong>
              <small>{roleLabel}</small>
            </span>
          </Link>
          <button type="button" className="snx-sidebar-close" aria-label="Đóng menu" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="snx-sidebar-body">{children}</div>
      </aside>
    </>
  )
}

// items: [{ label, path, icon (tên Material Symbols), end, match: [đường dẫn khác cũng tính là đang chọn] }]
export function SidebarNav({ title, items }) {
  const { pathname } = useLocation()
  return (
    <nav className="snx-nav">
      {title && <p className="snx-nav-title">{title}</p>}
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          title={item.description || item.label}
          className={({ isActive }) => `snx-nav-item ${isActive || item.match?.includes(pathname) ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
          <span className="snx-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AppTopbar({ onMenu, rootLabel, rootTo, title, children, actions }) {
  return (
    <header className="snx-topbar">
      <button type="button" className="snx-menu-button" aria-label="Mở menu" onClick={onMenu}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      <nav className="snx-crumb" aria-label="Vị trí hiện tại">
        <Link className="snx-crumb-root" to={rootTo}>{rootLabel}</Link>
        <span className="snx-crumb-sep" aria-hidden="true">›</span>
        <strong className="snx-crumb-current" aria-current="page">{title}</strong>
        {children}
      </nav>
      <div className="snx-topbar-actions">{actions}</div>
    </header>
  )
}

const initials = (name) => (name || '?').trim().split(/\s+/).map((part) => part[0]).slice(-2).join('').toUpperCase()

export function UserMenu({ name, subtitle, avatarUrl, profileTo, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (!ref.current?.contains(event.target) || event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="snx-user" ref={ref}>
      <button type="button" className="snx-user-button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="snx-avatar">{avatarUrl ? <img src={avatarUrl} alt={name} /> : initials(name)}</span>
        <span className="snx-user-copy"><strong>{name}</strong><small>{subtitle}</small></span>
        <span className="material-symbols-outlined snx-hide-sm" style={{ fontSize: 18, color: '#6b7a75' }}>expand_more</span>
      </button>
      {open && (
        <div className="snx-user-menu" role="menu">
          <Link to={profileTo} role="menuitem" onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined">person</span>Hồ sơ cá nhân
          </Link>
          <button type="button" role="menuitem" className="snx-danger" onClick={() => { setOpen(false); onLogout() }}>
            <span className="material-symbols-outlined">logout</span>Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

export function AppFooter() {
  return (
    <footer className="snx-footer">
      <span className="snx-footer-brand">
        <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
        © {new Date().getFullYear()} SportNexus · Nền tảng đặt sân &amp; kết nối người chơi thể thao
      </span>
      <span className="snx-footer-links">
        <span><span className="material-symbols-outlined" aria-hidden="true">support_agent</span>Hotline 24/7: 0968950913</span>
        <span><span className="material-symbols-outlined" aria-hidden="true">verified_user</span>Thanh toán ký quỹ an toàn</span>
      </span>
    </footer>
  )
}

// meta: nội dung nhỏ cạnh nhãn (vd. tên cơ sở) · actions: nút / bộ lọc bên phải
export function PageHeader({ eyebrow, eyebrowIcon, meta, title, subtitle, actions, children }) {
  return (
    <header className="snx-page-header">
      <div className="snx-page-header-copy">
        {(eyebrow || meta) && (
          <div className="snx-page-eyebrow-row">
            {eyebrow && (
              <span className="snx-page-eyebrow">
                {eyebrowIcon && <span className="material-symbols-outlined" aria-hidden="true">{eyebrowIcon}</span>}
                {eyebrow}
              </span>
            )}
            {meta}
          </div>
        )}
        <h1 className="snx-page-title">{title}</h1>
        {subtitle && <p className="snx-page-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="snx-page-actions">{actions}</div>}
    </header>
  )
}
