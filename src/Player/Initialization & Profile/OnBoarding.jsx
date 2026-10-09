import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function OnBoarding() {
  const navigate = useNavigate()
  const [selectedSports, setSelectedSports] = useState(['badminton'])
  const [elo, setElo] = useState(1450)

  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport))
    } else {
      setSelectedSports([...selectedSports, sport])
    }
  }

  const getTier = (val) => {
    if (val <= 1000) return 'Beginner'
    if (val <= 1250) return 'Novice'
    if (val <= 1500) return 'Intermediate'
    if (val <= 1800) return 'Advanced'
    return 'Pro Circuit'
  }

  return (
    <div className="sport-animated-bg flex flex-col w-full h-screen overflow-y-auto pt-space-xl px-margin">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-[140px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto pb-space-xl">
        <div className="relative rounded-2xl bg-surface-container-low/75 backdrop-blur-xl shadow-2xl p-space-md sm:p-space-lg">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-secondary-fixed to-primary-fixed-dim"></div>
          
          {/* Header */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="inline-flex items-center self-start gap-2 px-3 py-1 rounded-full bg-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
              <span className="font-label-sm uppercase tracking-wider text-secondary-fixed">Calibration Protocol</span>
            </div>
            <h1 className="font-headline-lg text-on-surface">
              Welcome to SportNexus. Let's calibrate.
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-2xl">
              Personalize your athletic passport to unlock algorithmic matchmaking and smart venue dispatching.
            </p>
          </div>

          {/* Step 1 */}
          <div className="mb-10">
            <h2 className="font-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-sm">1</span>
              Select Your Disciplines
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['badminton', 'football', 'tennis', 'basketball'].map(sport => {
                const isSelected = selectedSports.includes(sport)
                return (
                  <button key={sport} onClick={() => toggleSport(sport)} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${isSelected ? 'bg-surface-container-high/80 border-primary-container text-primary-container shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined text-[32px]">{sport === 'football' ? 'sports_soccer' : sport === 'tennis' ? 'sports_baseball' : sport === 'basketball' ? 'sports_basketball' : 'sports_tennis'}</span>
                    <span className="font-headline-sm capitalize">{sport}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10 bg-surface-container/40 p-6 rounded-xl border border-outline-variant/10">
            <h2 className="font-headline-sm text-on-surface mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-sm">2</span>
              Self-Assess Skill Matrix
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-headline-sm text-primary-container">{getTier(elo)}</span>
                <span className="font-bold text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">{elo} Elo</span>
              </div>
              <input type="range" min="800" max="2200" step="25" value={elo} onChange={(e) => setElo(Number(e.target.value))} className="w-full accent-primary-container" />
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Beginner</span>
                <span>Pro Circuit</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button className="py-3 px-8 rounded-xl bg-gradient-to-r from-primary-container to-secondary-fixed text-on-primary-container font-headline-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all" onClick={() => navigate('/dashboard')}>
              <span>Complete Setup & Enter Hub</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default OnBoarding
