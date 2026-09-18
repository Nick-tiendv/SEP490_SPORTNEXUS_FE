import { Outlet } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import TopSideBar from './TopSideBar.jsx'

function PlayerLayout() {
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      {/* Fixed Sidebar */}
      <TopSideBar />

      {/* Main area: offset by sidebar width */}
      <div className="pl-64">
        {/* Fixed Topbar */}
        <TopBar />

        {/* Page content */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PlayerLayout
