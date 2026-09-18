import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function CreateMatch() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState(3)
  const [elo, setElo] = useState(1200)

  return (
    <div className="flex flex-col w-full px-margin-sm md:px-margin-lg py-space-xl relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-primary-container/15 via-primary-container/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-lg relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high shadow-inner text-primary-container">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00e5ff]"></span>
              <span className="font-label-sm text-label-sm tracking-widest uppercase font-bold">LFG Dispatch Beacon</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">radar</span>
            <span className="font-label-sm text-label-sm tracking-wide text-secondary-fixed">1,420 Active Players in Radius</span>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low/70 backdrop-blur-2xl shadow-xl p-space-lg md:p-space-xl flex flex-col gap-space-lg border border-outline-variant/20">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-space-sm">
              Host a New Match
              <span className="text-primary-container font-label-sm px-2 py-0.5 rounded bg-surface-container-high font-bold">LIVE SETUP</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Broadcast an open match beacon to the Kinetic network. Matched players are escrow-verified and skill-calibrated.</p>
          </div>

          <div className="flex flex-col gap-space-md">
            {/* Sport Select */}
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">sports_tennis</span> Sport Discipline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button className="flex flex-col items-center p-3 rounded-xl bg-primary-container text-on-primary-container font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                  <span className="material-symbols-outlined text-[24px] mb-1">sports_tennis</span> Badminton
                </button>
                <button className="flex flex-col items-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-all">
                  <span className="material-symbols-outlined text-[24px] mb-1">sports_soccer</span> Football
                </button>
                <button className="flex flex-col items-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-all">
                  <span className="material-symbols-outlined text-[24px] mb-1">sports_baseball</span> Tennis
                </button>
                <button className="flex flex-col items-center p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-all">
                  <span className="material-symbols-outlined text-[24px] mb-1">sports_basketball</span> Basketball
                </button>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-lg text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">calendar_month</span> Schedule & Window
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center bg-surface-container rounded-xl px-4 py-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3">event</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-on-surface-variant uppercase">Date</span>
                    <span className="text-on-surface">Tonight, Oct 24, 2025</span>
                  </div>
                </div>
                <div className="flex items-center bg-surface-container rounded-xl px-4 py-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3">schedule</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-on-surface-variant uppercase">Time</span>
                    <span className="text-on-surface">19:30 - 21:30 (2h)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Squad */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-lg text-on-surface uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">group_add</span> Missing Squad Members
                </span>
                <span className="text-secondary-fixed text-sm bg-surface-container px-2 py-1 rounded">{players} Needed</span>
              </label>
              <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-surface-container-high p-1 rounded-lg">
                    <button className="w-8 h-8 rounded-md bg-surface-container text-on-surface flex items-center justify-center hover:bg-surface-bright" onClick={() => setPlayers(Math.max(1, players - 1))}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-8 text-center font-bold text-primary-container">{players}</span>
                    <button className="w-8 h-8 rounded-md bg-surface-container text-on-surface flex items-center justify-center hover:bg-surface-bright" onClick={() => setPlayers(Math.min(10, players + 1))}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-on-surface font-bold">${(20 / (players + 1)).toFixed(2)}</span>
                    <span className="text-on-surface-variant text-sm"> / player</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ELO Setup */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-lg text-on-surface uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">speed</span> Minimum Skill
                </span>
                <span className="text-primary-container text-sm bg-primary-container/10 px-2 py-1 rounded">{elo}+ Elo</span>
              </label>
              <div className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                <input type="range" min="800" max="2000" step="50" value={elo} onChange={(e) => setElo(Number(e.target.value))} className="w-full accent-primary-container" />
                <div className="flex justify-between text-on-surface-variant text-xs mt-1">
                  <span>Beg (800)</span>
                  <span>Mid (1200)</span>
                  <span>Pro (2000)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-3">
              <button className="flex-1 py-3 rounded-xl bg-primary-container hover:brightness-110 text-on-primary-container font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all" onClick={() => navigate('/community')}>
                <span className="material-symbols-outlined">podcasts</span> Publish Match to Feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateMatch
