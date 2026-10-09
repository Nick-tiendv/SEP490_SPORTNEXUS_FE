import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function PostMatchRating() {
  const navigate = useNavigate()
  const [rating, setRating] = useState(5)
  const [calibrated, setCalibrated] = useState(true)

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Simulation */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-sm">
        <div className="p-margin-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary">Match Concluded • Arena 04</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container rounded-2xl p-6 flex flex-col items-center">
              <span className="font-headline-md text-on-surface">Alex Rivera (You)</span>
              <span className="text-secondary-container text-sm mt-1">WINNER (+32 ELO)</span>
              <span className="text-5xl text-primary-container mt-2">2</span>
            </div>
            <div className="bg-surface-container rounded-2xl p-6 flex flex-col items-center">
              <span className="font-headline-md text-on-surface">Marcus Vance</span>
              <span className="text-on-surface-variant text-sm mt-1">RUNNER UP (-18 ELO)</span>
              <span className="text-5xl text-on-surface-variant mt-2">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Centered */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 backdrop-blur-xl bg-surface-container-lowest/80">
        <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/20 rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.15)] overflow-hidden flex flex-col p-6 sm:p-8">
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 text-primary-container font-label-sm uppercase tracking-widest mb-3 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[16px]">emoji_events</span>
              Victory Report
            </div>
            <h2 className="font-headline-lg text-on-surface">Rate Opponent Sportsmanship</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Your verification calibrates the Kinetic Elo engine.</p>
          </div>

          {/* Opponent Info */}
          <div className="bg-surface-container/80 rounded-2xl p-4 flex items-center justify-between shadow-inner mb-6">
            <div className="flex items-center gap-3">
              <img className="w-12 h-12 rounded-full ring-2 ring-primary-container/40" src="https://lh3.googleusercontent.com/aida/AEtjO1VTDSuxPicidjFrzzsYgv3tNKxjzEQjIMahLArl7fHdsfN8tXQFyPlRlKyVAxoPut8hCqp30D12sikwxMQYQNEEUQ-BTKat7n6asbZ-KaLdW-jSTpEcngbx4hLO1a1pLRcXMgPSaEHceJBfMCeIVJ5FDim_pJ78-6UMaRE20XIuZ6He8dyMIir-FoAYBlk2IH3jYTt7oxzlFO_ZcpSwMWem7g7BI1R--zd0DSQNgI69xvw8wsELCkwSyuI" alt="Opponent" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-on-surface">Marcus Vance</span>
                <span className="text-body-sm text-on-surface-variant">1,385 Elo • Elite III</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-secondary-fixed text-sm">2 - 1 Defeat</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center bg-surface-container/40 rounded-2xl p-4 mb-4 border border-outline-variant/10">
            <span className="font-label-md uppercase tracking-wider text-on-surface mb-2">Fairplay & Etiquette</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className={`material-symbols-outlined text-[40px] transition-colors ${star <= rating ? 'text-[#FFB800] fill-current' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}>
                  star
                </button>
              ))}
            </div>
          </div>

          {/* Elo Calibration */}
          <div className="flex flex-col gap-3 mb-6">
            <span className="font-label-md uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary-container">tune</span> Elo Skill Calibration
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button className={`p-3 rounded-xl flex flex-col items-center border transition-all ${calibrated ? 'bg-secondary-fixed/10 border-secondary-fixed/30 text-secondary-fixed' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`} onClick={() => setCalibrated(true)}>
                <span className="material-symbols-outlined mb-1">thumb_up</span>
                <span className="font-bold text-sm">Accurate (~1385)</span>
              </button>
              <button className={`p-3 rounded-xl flex flex-col items-center border transition-all ${!calibrated ? 'bg-error/10 border-error/30 text-error' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`} onClick={() => setCalibrated(false)}>
                <span className="material-symbols-outlined mb-1">thumb_down</span>
                <span className="font-bold text-sm">Miscalibrated</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,229,255,0.4)] hover:brightness-110 transition-all" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined">verified</span> Submit Rating & Claim XP
            </button>
            <button className="text-center text-on-surface-variant hover:text-on-surface transition-colors font-label-md py-2" onClick={() => navigate('/dashboard')}>
              Skip for now
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PostMatchRating
