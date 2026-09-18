import { Link } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import TopSideBar from './TopSideBar.jsx'

function PlayerDashboard() {
  return (
    <div className="player-dashboard-shell">
      <TopBar />
      <TopSideBar />
      <main className="player-dashboard-content">
        <h1>SportNexus Player Dashboard</h1>
        <p>Choose a destination from the navigation.</p>
        <div className="player-dashboard-actions">
          <Link to="/court">Explore Court</Link>
          <Link to="/ai-chat">AI Chat</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </main>
    </div>
  )
}

export default PlayerDashboard
