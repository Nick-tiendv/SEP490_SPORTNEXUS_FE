import { NavLink } from 'react-router-dom'

const navigationItems = [
  ['Dashboard', '/dashboard'],
  ['AI Chat', '/ai-chat'],
  ['Community', '/community'],
  ['Court', '/court'],
  ['QR Pass', '/qr-pass'],
  ['Tournament', '/tournament'],
]

function TopSideBar() {
  return (
    <aside className="player-side-bar" aria-label="Player navigation">
      {navigationItems.map(([label, path]) => (
        <NavLink key={path} to={path} className="player-side-link">
          {label}
        </NavLink>
      ))}
    </aside>
  )
}

export default TopSideBar
