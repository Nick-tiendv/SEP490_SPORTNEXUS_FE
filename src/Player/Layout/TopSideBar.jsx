import { useSport } from '../Context/SportContext.jsx'
import { AppSidebar, SidebarNav } from '../../components/layout/AppShell.jsx'

// Khám phá: tìm sân, tìm người chơi, cộng đồng, giải đấu (Đội nằm trong Giải đấu)
const exploreItems = [
  { label: 'Trang chủ', path: '/dashboard', icon: 'home' },
  { label: 'Đặt sân', path: '/court-finder', icon: 'calendar_month', match: ['/court', '/split-payment', '/ai-chat'] },
  { label: 'Ghép trận LFG', path: '/community', icon: 'group', match: ['/create-match', '/flash-claim'] },
  { label: 'Cộng đồng', path: '/feed', icon: 'forum' },
  { label: 'Giải đấu & Đội', path: '/tournament', icon: 'emoji_events' },
]
// Của tôi: vé, đánh giá, ví, hồ sơ
const myItems = [
  { label: 'Vé check-in QR', path: '/qr-pass', icon: 'qr_code_scanner', match: ['/check-in', '/live-qr'] },
  { label: 'Đánh giá sau trận', path: '/post-match-rating', icon: 'star' },
  { label: 'Ví Escrow', path: '/wallet', icon: 'account_balance_wallet', match: ['/wallet/deposit-success', '/wallet/deposit-cancel'] },
  { label: 'Hồ sơ cá nhân', path: '/profile', icon: 'badge' },
]

// Bộ lọc môn thể thao dùng chung cho Trang chủ, Đặt sân, Ghép trận
function SportFilter() {
  const { selectedSports, toggleSport, selectAllSports, isSportActive, isAllActive, SPORTS_LIST } = useSport()
  const status = isAllActive
    ? `Tất cả ${SPORTS_LIST.length} môn`
    : selectedSports.length === 1
    ? `Chỉ ${SPORTS_LIST.find((s) => s.key === selectedSports[0])?.label || ''}`
    : `${selectedSports.length} môn đang chọn`

  return (
    <section className="snx-sport-filter" aria-label="Lọc theo môn">
      <div className="snx-sport-filter-head">
        <p className="snx-nav-title" style={{ padding: 0 }}>Lọc theo môn</p>
        <span className="snx-sport-filter-status">{status}</span>
      </div>
      <div className="snx-sport-grid">
        {SPORTS_LIST.map((s) => {
          const active = isSportActive(s.key)
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSport(s.key)}
              className={`snx-sport-chip ${active ? 'active' : ''}`}
              aria-pressed={active}
              title={isAllActive ? `Chỉ hiển thị ${s.label}` : active ? `Đang hiển thị ${s.label}` : `Thêm ${s.label}`}
            >
              <span aria-hidden="true">{s.emoji}</span>
              <span className="snx-sport-chip-label">{s.label}</span>
            </button>
          )
        })}
      </div>
      {!isAllActive && (
        <button type="button" className="snx-sport-all" onClick={selectAllSports}>Xem tất cả môn</button>
      )}
    </section>
  )
}

function TopSideBar({ open, onClose }) {
  return (
    <AppSidebar homeTo="/dashboard" roleLabel="Người chơi" open={open} onClose={onClose}>
      <SportFilter />
      <SidebarNav title="Khám phá" items={exploreItems} />
      <SidebarNav title="Của tôi" items={myItems} />
    </AppSidebar>
  )
}

export default TopSideBar
