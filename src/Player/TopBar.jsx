import { Link } from 'react-router-dom'

function TopBar() {
  return (
    <header className="player-top-bar">
      <Link to="/dashboard" className="player-brand">SPORTNEXUS</Link>
      <nav className="player-top-nav" aria-label="Account navigation">
        <Link to="/wallet">Wallet</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </header>
  )
}

export default TopBar
