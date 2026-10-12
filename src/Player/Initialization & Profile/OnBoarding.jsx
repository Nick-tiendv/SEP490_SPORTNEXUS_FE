import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function OnBoarding() {
  const navigate = useNavigate()
  const [selectedSports, setSelectedSports] = useState(['badminton'])
  const SKILL_TIERS = [
    { label: 'Mới tập chơi', sub: 'Căn bản, làm quen môn thể thao' },
    { label: 'Mới chơi - Đang tiến bộ', sub: 'Nắm chắc luật, giao lưu vui vẻ' },
    { label: 'Trung bình', sub: 'Đánh đều tay phong trào' },
    { label: 'Trung bình - Khá', sub: 'Điều cầu/bóng tốt, phối hợp ăn ý' },
    { label: 'Khá - Đánh chắc tay', sub: 'Chiến thuật tốt, phản xạ nhanh' },
    { label: 'Bán chuyên / Nâng cao', sub: 'Tập luyện thường xuyên, kỹ thuật chuẩn' },
    { label: 'Chuyên nghiệp / Thi đấu giải', sub: 'Vận động viên thi đấu giải' },
  ]
  const [skillIndex, setSkillIndex] = useState(2)

  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter(s => s !== sport))
      }
    } else {
      setSelectedSports([...selectedSports, sport])
    }
  }

  const handleCompleteSetup = () => {
    // Lưu các môn đã chọn kèm trình độ ban đầu vào localStorage
    const sportMetadata = {
      badminton: { name: 'Cầu Lông', icon: '🏸', color: '#15803D', bgColor: '#DCFCE7' },
      pickleball: { name: 'Pickleball', icon: '🏓', color: '#0284C7', bgColor: '#E0F2FE' },
      football: { name: 'Bóng Đá', icon: '⚽', color: '#2563EB', bgColor: '#EFF6FF' },
      basketball: { name: 'Bóng Rổ', icon: '🏀', color: '#EA580C', bgColor: '#FFF7ED' },
      tennis: { name: 'Tennis', icon: '🎾', color: '#65A30D', bgColor: '#F7FEE7' },
    }
    const currentTier = SKILL_TIERS[skillIndex].label
    const newSportsData = selectedSports.map((key) => {
      const meta = sportMetadata[key] || { name: key, icon: '🎯', color: '#15803D', bgColor: '#DCFCE7' }
      return {
        id: key,
        name: meta.name,
        icon: meta.icon,
        level: currentTier,
        field: 'Trình độ',
        ranked: true,
        matches: 0,
        winRate: '100%',
        color: meta.color,
        bgColor: meta.bgColor,
      }
    })
    localStorage.setItem('player_sports_data', JSON.stringify(newSportsData))
    localStorage.setItem('sportnexus_selected_sports', JSON.stringify(selectedSports))
    navigate('/dashboard')
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['badminton', 'pickleball', 'football', 'basketball', 'tennis'].map(sport => {
                const isSelected = selectedSports.includes(sport)
                const sportLabels = {
                  badminton: { label: 'Cầu Lông', icon: '🏸' },
                  pickleball: { label: 'Pickleball', icon: '🏓' },
                  football: { label: 'Bóng Đá', icon: '⚽' },
                  basketball: { label: 'Bóng Rổ', icon: '🏀' },
                  tennis: { label: 'Tennis', icon: '🎾' },
                }
                const info = sportLabels[sport] || { label: sport, icon: '🎯' }
                return (
                  <button key={sport} onClick={() => toggleSport(sport)} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${isSelected ? 'bg-surface-container-high/80 border-primary-container text-primary-container shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}>
                    <span className="text-[28px] leading-none">{info.icon}</span>
                    <span className="font-headline-sm text-sm font-bold">{info.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10 bg-surface-container/40 p-6 rounded-xl border border-outline-variant/10">
            <h2 className="font-headline-sm text-on-surface mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-sm">2</span>
              Tự Đánh Giá Trình Độ Ban Đầu
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-headline-sm text-primary-container font-bold text-lg">
                    {SKILL_TIERS[skillIndex].label}
                  </span>
                  <p className="text-xs text-on-surface-variant m-0 mt-0.5">
                    {SKILL_TIERS[skillIndex].sub}
                  </p>
                </div>
                <span className="font-bold text-primary-container bg-primary-container/10 px-3 py-1 rounded-full text-xs">
                  Cấp {skillIndex + 1}/{SKILL_TIERS.length}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={SKILL_TIERS.length - 1}
                step="1"
                value={skillIndex}
                onChange={(e) => setSkillIndex(Number(e.target.value))}
                className="w-full accent-primary-container cursor-pointer"
              />
              <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                <span>Mới tập chơi</span>
                <span>Chuyên nghiệp / Thi đấu giải</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-primary-container to-secondary-fixed text-on-primary-container font-headline-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
              onClick={handleCompleteSetup}
            >
              <span>Hoàn tất &amp; Vào trang chủ</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default OnBoarding
