import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/dashboard', icon: 'grid_view' },
  { label: 'Explore Courts', path: '/court-finder', icon: 'sports_tennis' },
  { label: 'Wallet', path: '/wallet', icon: 'account_balance_wallet' },
  { label: 'Community', path: '/community', icon: 'groups' },
  { label: 'Tournaments', path: '/tournament', icon: 'emoji_events' },
  { label: 'Profile', path: '/profile', icon: 'person' },
]

function TopSideBar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest/80 backdrop-blur-xl z-50 flex flex-col justify-between p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Logo */}
      <div className="flex flex-col gap-space-lg">
        <div className="flex items-center gap-space-sm px-space-xs py-space-xs">
          <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.5)]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">sports_tennis</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">The Kinetic</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-wider uppercase">Athletic OS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-space-xs">
          {navItems.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-space-sm px-space-md py-space-sm transition-all bg-primary-container text-on-primary-container font-label-lg text-label-lg rounded-xl shadow-[0_0_20px_-2px_rgba(0,229,255,0.45)]'
                  : 'flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer: System Status + Settings */}
      <div className="flex flex-col gap-space-sm">
        <div className="bg-surface-container-low/70 rounded-xl p-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">System Status</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface">Arena Node-01</span>
            <span className="font-label-sm text-label-sm text-secondary-container">ONLINE</span>
          </div>
        </div>
        <NavLink
          to="/settings"
          className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default TopSideBar
