import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function LiveQRPass() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(29)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev <= 0 ? 30 : prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col w-full px-margin-lg py-space-xl relative overflow-hidden">
      {/* Background FX */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary-container/15 via-primary-fixed-dim/5 to-transparent blur-3xl opacity-60"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-space-xl w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b-0 pb-2">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary-container font-label-sm text-label-sm uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
                Secure Beacon Active
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Your Access Pass</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Dynamic Rolling Cryptographic Token • Verified Gate Access
            </p>
          </div>
          <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-space-sm rounded-xl">
            <div className="flex flex-col items-start">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Terminal Node</span>
              <span className="font-label-md text-label-md text-primary-container font-mono">B3-NORTH-TX</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          
          {/* Left Col: QR Code */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary-container/30 via-primary-fixed-dim/10 to-transparent blur-md"></div>
              <div className="relative bg-surface-container-low/95 rounded-2xl p-space-lg shadow-2xl flex flex-col items-center backdrop-blur-2xl">
                
                {/* QR Code Container */}
                <div className="relative w-64 h-64 bg-surface-container-lowest rounded-xl p-space-md flex items-center justify-center overflow-hidden border border-outline-variant/30">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px]"></div>
                  
                  {/* Fake QR SVG */}
                  <svg className="w-52 h-52 text-primary-container relative z-10 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" fill="currentColor" viewBox="0 0 100 100">
                    <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="5" y="5"></rect>
                    <rect fill="currentColor" height="14" rx="2" width="14" x="11" y="11"></rect>
                    <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="69" y="5"></rect>
                    <rect fill="currentColor" height="14" rx="2" width="14" x="75" y="11"></rect>
                    <rect fill="none" height="26" rx="4" stroke="currentColor" strokeWidth="4" width="26" x="5" y="69"></rect>
                    <rect fill="currentColor" height="14" rx="2" width="14" x="11" y="75"></rect>
                    <rect height="6" rx="1" width="6" x="38" y="8"></rect>
                    <rect height="6" rx="1" width="10" x="52" y="18"></rect>
                    <rect height="12" rx="1" width="6" x="42" y="52"></rect>
                    <rect height="6" rx="1" width="12" x="80" y="38"></rect>
                    <rect height="12" rx="1" width="6" x="86" y="68"></rect>
                  </svg>
                  
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-container shadow-[0_0_12px_#00e5ff] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                </div>

                <div className="mt-space-md flex flex-col items-center text-center">
                  <span className="font-mono text-label-sm text-primary-container bg-surface-container px-space-md py-1 rounded-md tracking-wider">TOKEN #NX-8839-KYC-VERIFIED</span>
                </div>

                {/* Refresh Timer */}
                <div className="mt-space-md w-full flex items-center justify-between bg-surface-container rounded-xl px-space-md py-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary-container animate-spin">refresh</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface">Refreshes in <span className="text-primary-container font-mono">{seconds}s</span></span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">SHA-256 Synchronized</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary-container transition-colors" onClick={() => setSeconds(30)}>
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Details */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider">Booked Session</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">Kinetic Arena - Court 3</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-space-sm bg-surface-container rounded-lg p-space-md">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Time Slot</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface mt-1 font-mono">19:00 - 20:00</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Assigned Locker</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface mt-1 font-mono">#L-42</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <img className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI" alt="Profile" />
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1">Hoang An <span className="material-symbols-outlined text-primary-container text-[16px]">verified</span></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Tier 1 Verified Athlete</span>
                </div>
              </div>
            </div>
            
            <button className="py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LiveQRPass
