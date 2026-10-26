import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Bell, Grid2X2, ChevronRight, ChevronDown, Menu, LogOut, Settings, UserRoundCheck, Building2, CreditCard, ShieldAlert } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext.js'
import { adminMenu } from '../adminMenu.js'
import { initialsOf } from './initials.js'

const enabledPages = adminMenu.filter(item => item.enabled)

// Các mục chờ xử lý lấy từ dashboard.pending (cùng nguồn với badge trên sidebar).
const pendingItems = [
  { key: 'ownerVerifications', label: 'Chủ sân chờ xác minh', path: '/admin/court-owners', icon: UserRoundCheck },
  { key: 'facilityApprovals', label: 'Cơ sở chờ duyệt', path: '/admin/facilities', icon: Building2 },
  { key: 'withdrawals', label: 'Yêu cầu rút tiền chờ xử lý', path: '/admin/payments', icon: CreditCard },
  { key: 'openReports', label: 'Báo cáo vi phạm đang mở', path: '/admin/reviews-reports', icon: ShieldAlert },
]

// Bỏ dấu để tìm "quan ly" khớp "Quản lý".
const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim()

// Đóng popover khi bấm ra ngoài hoặc nhấn Escape.
function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined
    const onPointer = event => { if (ref.current && !ref.current.contains(event.target)) onClose() }
    const onKey = event => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, onClose])
}

export default function AdminHeader({ onMenuToggle, profile, badges }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [openMenu, setOpenMenu] = useState(null) // 'search' | 'notifications' | 'apps' | 'profile' | null
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const headerRef = useRef(null)
  const closeMenu = useCallback(() => setOpenMenu(null), [])
  useDismiss(headerRef, openMenu !== null, closeMenu)

  const current = adminMenu.find(item => item.path.split('/')[2] === pathname.split('/')[2])
  const title = current?.label || 'Tổng quan'

  const results = query.trim() ? enabledPages.filter(item => normalize(item.label).includes(normalize(query))) : enabledPages
  const pending = pendingItems.map(item => ({ ...item, count: badges?.[item.key] || 0 })).filter(item => item.count > 0)
  const pendingTotal = pending.reduce((sum, item) => sum + item.count, 0)
  const toggle = name => setOpenMenu(open => (open === name ? null : name))

  const go = path => {
    closeMenu()
    setQuery('')
    navigate(path)
  }
  const onSearchKeyDown = event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpenMenu('search'); setActiveIndex(index => Math.min(index + 1, results.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)) }
    else if (event.key === 'Enter' && results[activeIndex]) { event.preventDefault(); go(results[activeIndex].path); event.currentTarget.blur() }
  }

  return (
    <header className="admin-header" ref={headerRef}>
      <button className="admin-mobile-menu admin-icon-button" aria-label="Mở hoặc đóng điều hướng" onClick={onMenuToggle}><Menu size={20} /></button>
      <nav className="admin-breadcrumb" aria-label="Vị trí hiện tại">
        <Link className="admin-breadcrumb-root" to="/admin/dashboard">Quản trị</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <strong aria-current="page">{title}</strong>
      </nav>

      <div className="admin-header-search-wrap">
        <label className="admin-search">
          <Search size={16} />
          <input
            aria-label="Tìm kiếm trong trang quản trị"
            placeholder="Tìm kiếm trong trang quản trị…"
            value={query}
            role="combobox"
            aria-expanded={openMenu === 'search'}
            aria-controls="admin-search-results"
            onFocus={() => setOpenMenu('search')}
            onChange={event => { setQuery(event.target.value); setActiveIndex(0); setOpenMenu('search') }}
            onKeyDown={onSearchKeyDown}
          />
        </label>
        {openMenu === 'search' && (
          <div className="admin-header-popover admin-search-results" id="admin-search-results" role="listbox">
            <p className="admin-header-popover-title">{query.trim() ? 'Kết quả' : 'Đi tới trang'}</p>
            {results.length === 0 && <p className="admin-header-popover-empty">Không tìm thấy trang phù hợp.</p>}
            {results.map(({ path, label, icon: Icon }, index) => (
              <button key={path} type="button" role="option" aria-selected={index === activeIndex} className={`admin-header-popover-item ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => go(path)}>
                <Icon size={16} /><span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="admin-header-actions">
        <div className="admin-header-menu">
          <button className="admin-icon-button admin-notifications" aria-label={`Việc cần xử lý${pendingTotal ? ` (${pendingTotal})` : ''}`} title="Việc cần xử lý" aria-expanded={openMenu === 'notifications'} onClick={() => toggle('notifications')}>
            <Bell size={18} />{pendingTotal > 0 && <i />}
          </button>
          {openMenu === 'notifications' && (
            <div className="admin-header-popover admin-header-popover--right">
              <p className="admin-header-popover-title">Việc cần xử lý</p>
              {pending.length === 0 && <p className="admin-header-popover-empty">Không có mục nào đang chờ xử lý.</p>}
              {pending.map(({ key, label, path, icon: Icon, count }) => (
                <button key={key} type="button" className="admin-header-popover-item" onClick={() => go(path)}>
                  <Icon size={16} /><span>{label}</span><b className="admin-header-popover-count">{count}</b>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="admin-header-menu">
          <button className="admin-icon-button" aria-label="Truy cập nhanh" title="Truy cập nhanh" aria-expanded={openMenu === 'apps'} onClick={() => toggle('apps')}><Grid2X2 size={18} /></button>
          {openMenu === 'apps' && (
            <div className="admin-header-popover admin-header-popover--right admin-header-apps">
              <p className="admin-header-popover-title">Truy cập nhanh</p>
              <div className="admin-header-apps-grid">
                {enabledPages.map(({ path, label, icon: Icon }) => (
                  <button key={path} type="button" className={`admin-header-app ${current?.path === path ? 'is-active' : ''}`} onClick={() => go(path)} title={label}>
                    <Icon size={18} /><span>{label.replace(/^Quản lý /, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-header-menu">
        <button type="button" className="admin-header-profile" aria-expanded={openMenu === 'profile'} aria-label="Tài khoản" onClick={() => toggle('profile')}>
          <span className="admin-avatar admin-avatar-small">{profile ? initialsOf(profile.name) : '…'}</span>
          <span className="admin-header-profile-copy"><strong>{profile?.name || 'Đang tải…'}</strong><small>{profile?.username ? `@${profile.username} · Quản trị viên` : 'Quản trị viên'}</small></span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {openMenu === 'profile' && (
          <div className="admin-header-popover admin-header-popover--right">
            {profile?.email && <p className="admin-header-popover-title">{profile.email}</p>}
            <button type="button" className="admin-header-popover-item" onClick={() => go('/admin/settings')}><Settings size={16} /><span>Cài đặt hệ thống</span></button>
            <button type="button" className="admin-header-popover-item admin-header-popover-item--danger" onClick={() => { closeMenu(); logout() }}><LogOut size={16} /><span>Đăng xuất</span></button>
          </div>
        )}
      </div>
    </header>
  )
}
