import { useNavigate } from 'react-router-dom'

function FlashClaim() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-surface">
      {/* Background Simulation */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-surface-container-lowest/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-secondary-fixed/15 via-primary-container/20 to-transparent rounded-full blur-[110px]"></div>
      </div>

      {/* Modal Centered */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 backdrop-blur-md">
        <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8">
          
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium uppercase bg-secondary-container/10 text-secondary-fixed border border-secondary-fixed/30">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
                Instant Escrow Lock
              </span>
              <span className="text-xs text-on-surface-variant font-mono">ID: #FL-8821</span>
            </div>
            <button className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => navigate('/community')}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-primary-container/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)] mb-4">
              <span className="material-symbols-outlined text-[32px] text-secondary-fixed">bolt</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline-lg font-bold text-on-surface">Secure Your Slot!</h2>
            <p className="text-on-surface-variant text-body-sm mt-1 max-w-sm">
              You are claiming the remaining spot in an active <span className="text-on-surface font-medium">Kinetic Verified Roster</span>.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-4 sm:p-5 mb-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">sports_tennis</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface tracking-wide">Badminton Doubles</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary-container/10 text-primary-container border border-primary-container/20">1200+ Elo</span>
                  </div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span> Kinetic Central Arena • Court 3
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-mono block">Entry Stake</span>
                <span className="text-xl font-mono font-bold text-secondary-fixed">$5.00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary-container text-[16px]">schedule</span>
                <div>
                  <span className="text-on-surface-variant text-[10px] block font-mono uppercase">Schedule</span>
                  <span className="font-semibold text-on-surface">Tonight, 20:00 - 21:30</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant/20">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center font-bold text-[10px] text-on-primary-container">K</div>
                <div>
                  <span className="text-on-surface-variant text-[10px] block font-mono uppercase">Match Host</span>
                  <span className="font-semibold text-on-surface">Kiro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 mb-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant px-1 flex items-center justify-between">
              <span>Eligibility & Escrow Status</span>
              <span className="text-secondary-fixed font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready
              </span>
            </div>
            <div className="flex items-center justify-between bg-secondary-fixed/10 border border-secondary-fixed/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">account_balance_wallet</span>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Wallet Balance Sufficient ($50.00)</div>
                  <div className="text-xs text-on-surface-variant">Post-claim balance: <span className="font-mono text-on-surface">$45.00</span></div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-secondary-fixed">PASS</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-error/10 border border-error/30 rounded-xl p-3.5 mb-6 text-xs text-error leading-relaxed">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <div>
              <span className="font-bold">Important Escrow Policy:</span> Clicking confirm will instantly deduct <span className="font-mono font-semibold">$5.00</span> from your wallet. No refunds for no-shows.
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3.5 rounded-xl bg-secondary-fixed text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(96,255,152,0.4)] transition-all" onClick={() => navigate('/qr-pass')}>
              <span className="material-symbols-outlined text-[20px]">check</span> Confirm & Pay $5
            </button>
            <button className="w-full py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" onClick={() => navigate('/community')}>
              Cancel & Keep Browsing
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default FlashClaim
