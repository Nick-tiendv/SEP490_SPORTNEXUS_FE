import { Link } from 'react-router-dom'

function TopBar() {
  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
        {/* Search Box */}
        <div className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-space-sm text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container-low/60 rounded-xl pl-10 pr-space-md py-space-xs text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
              placeholder="Search courts, players, tournaments..."
              type="text"
            />
          </div>
        </div>

        {/* Right Side: Latency badge + Notifications + Avatar */}
        <div className="flex items-center gap-space-md">
          {/* Latency Badge */}
          <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low/60 rounded-full">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(52,255,140,0.8)]"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">24ms</span>
            <span className="font-label-sm text-label-sm text-outline">•</span>
            <span className="font-label-sm text-label-sm text-secondary-container uppercase">Ultra Latency</span>
          </div>

          {/* Notification Bell */}
          <button className="relative p-space-xs rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.9)]"></span>
          </button>

          {/* User Avatar */}
          <Link to="/profile" className="flex items-center gap-space-sm pl-space-xs">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-lg text-label-lg text-on-surface">Hoàng Ân</span>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container font-label-sm text-label-sm uppercase tracking-wide">Pro</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Challenger Lvl 4</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default TopBar
