import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import TopBar from './TopBar.jsx'
import TopSideBar from './TopSideBar.jsx'
import { SportProvider } from '../Context/SportContext.jsx'

function PlayerLayout() {
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <SportProvider>
      <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }} className="pastel-animated-bg">
      {/* Fixed Sidebar */}
      <TopSideBar />

      {/* Main area: offset by sidebar width */}
      <div style={{ paddingLeft: '240px' }}>
        {/* Fixed Topbar */}
        <TopBar />

        {/* Page content */}
        <main style={{ width: '100%', paddingTop: '56px', minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>

      {/* ===================== FLOATING AI BUTTON ===================== */}
      {/* Tooltip label */}
      {!aiOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '28px',
            background: '#1b5e20',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            opacity: 0,
            animation: 'fadeInTooltip 0.4s ease 1.2s forwards',
          }}
        >
          🤖 Hỏi trợ lý AI
          <span
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '18px',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #1b5e20',
            }}
          />
        </div>
      )}

      {/* Chat panel (simple placeholder) */}
      {aiOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '320px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid #e8f5e9',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideUpPanel 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#2e7d32',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                Trợ lý SportNexus AI
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>
                Sẵn sàng hỗ trợ bạn
              </p>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>
          </div>

          {/* Chat body */}
          <div
            style={{
              padding: '16px',
              height: '220px',
              overflowY: 'auto',
              background: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Bot message */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px 12px 12px 4px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#374151',
                  maxWidth: '220px',
                  lineHeight: 1.5,
                }}
              >
                Xin chào! Tôi có thể giúp bạn đặt sân, tìm đối thủ hoặc giải đáp thắc mắc về SportNexus. 🏸
              </div>
            </div>
            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {['Đặt sân nhanh', 'Tìm kèo LFG', 'Kiểm tra ví Escrow'].map((chip) => (
                <button
                  key={chip}
                  style={{
                    background: '#e8f5e9',
                    border: '1px solid #c8e6c9',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    color: '#2e7d32',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: '#fff',
            }}
          >
            <input
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '7px 14px',
                fontSize: '13px',
                outline: 'none',
                color: '#374151',
              }}
            />
            <button
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#2e7d32',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>
                send
              </span>
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setAiOpen((v) => !v)}
        title="Hỏi trợ lý AI"
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
        @keyframes pastelGradient {
          0%   { background: linear-gradient(135deg, #E8F5E3 0%, #D4EBD0 100%); }
          16%  { background: linear-gradient(135deg, #FFE5E5 0%, #FFD1D1 100%); }
          33%  { background: linear-gradient(135deg, #E5F3FF 0%, #D1E7FF 100%); }
          50%  { background: linear-gradient(135deg, #FFF5E5 0%, #FFE8D1 100%); }
          66%  { background: linear-gradient(135deg, #F5E5FF 0%, #E8D1FF 100%); }
          83%  { background: linear-gradient(135deg, #E5FFF5 0%, #D1FFE8 100%); }
          100% { background: linear-gradient(135deg, #E8F5E3 0%, #D4EBD0 100%); }
        }
        .pastel-animated-bg {
          animation: pastelGradient 30s ease-in-out infinite;
        }
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
