import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TopBar from './TopBar.jsx'
import TopSideBar from './TopSideBar.jsx'
import { SportProvider } from '../Context/SportContext.jsx'
import AIChatModal from '../Book a court/AIChatModal.jsx'

function PlayerLayout() {
  const [aiOpen, setAiOpen] = useState(false)

  // Lắng nghe sự kiện mở chat AI từ các trang con
  useEffect(() => {
    const handleOpenAi = () => setAiOpen(true)
    window.addEventListener('open-sportnexus-ai-chat', handleOpenAi)
    return () => window.removeEventListener('open-sportnexus-ai-chat', handleOpenAi)
  }, [])

  return (
    <SportProvider>
      <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} className="sport-animated-bg">
      {/* Fixed Sidebar */}
      <TopSideBar />

      {/* Main area: offset by sidebar width */}
      <div style={{ paddingLeft: '260px' }}>
        {/* Fixed Topbar */}
        <TopBar />

        {/* Page content */}
        <main style={{ width: '100%', paddingTop: '56px', minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>

      {/* Full-featured SportNexus AI Concierge Modal */}
      <AIChatModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />

      {/* FAB button */}
      <button
        onClick={() => setAiOpen((v) => !v)}
        title="Trợ lý AI SportNexus"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(46,125,50,0.5)',
          zIndex: 1001,
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: 'pulseFAB 2.5s ease-in-out infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(46,125,50,0.65)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,50,0.5)'
        }}
      >
        {aiOpen ? (
          <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '26px' }}>
            close
          </span>
        ) : (
          <span style={{ fontSize: '26px', lineHeight: 1 }}>🤖</span>
        )}

        {/* Pulse ring animation */}
        {!aiOpen && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(46,125,50,0.5)',
              animation: 'rippleFAB 2s ease-out infinite',
            }}
          />
        )}
      </button>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pulseFAB {
          0%, 100% { box-shadow: 0 4px 20px rgba(45,95,63,0.5); }
          50% { box-shadow: 0 4px 28px rgba(45,95,63,0.75), 0 0 0 8px rgba(45,95,63,0.12); }
        }
        @keyframes rippleFAB {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInTooltip {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
    </SportProvider>
  )
}

export default PlayerLayout
