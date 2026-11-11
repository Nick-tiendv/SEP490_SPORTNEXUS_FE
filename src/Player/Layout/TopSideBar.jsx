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
  { label: 'Đơn mua tại sân', path: '/shop-orders', icon: 'shopping_bag' },
  { label: 'Ví Escrow', path: '/wallet', icon: 'account_balance_wallet', match: ['/wallet/deposit-success', '/wallet/deposit-cancel'] },
  { label: 'Elo & khảo sát trình độ', path: '/assessment', icon: 'military_tech' },
  { label: 'Hồ sơ cá nhân', path: '/profile', icon: 'badge' },
]

function TopSideBar({ open, onClose }) {
  return (
    <AppSidebar homeTo="/dashboard" roleLabel="Người chơi" open={open} onClose={onClose}>
      <SidebarNav title="Khám phá" items={exploreItems} />
      <SidebarNav title="Của tôi" items={myItems} />
    </AppSidebar>
  )
}

export default TopSideBar
