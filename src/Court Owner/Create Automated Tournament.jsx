import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Danh sách đội mẫu 8 đội để bốc thăm siêu tốc
const DEFAULT_TEAMS_8 = [
  { id: 't1', name: 'FC Hỏa Long (Hạt giống #1)', seed: 1, captain: 'Nguyễn Quang Hải', elo: 1850, logo: '🐉' },
  { id: 't2', name: 'Red Phoenix Badminton (Hạt giống #2)', seed: 2, captain: 'Phạm Hồng Nam', elo: 1820, logo: '🦅' },
  { id: 't3', name: 'Saigon Thunderbirds (Hạt giống #3)', seed: 3, captain: 'Trần Minh Quân', elo: 1780, logo: '⚡' },
  { id: 't4', name: 'Pickleball Masters VN (Hạt giống #4)', seed: 4, captain: 'Lê Hoàng Yến', elo: 1750, logo: '🏓' },
  { id: 't5', name: 'Blue Storm FC', seed: null, captain: 'Đỗ Tiến Đạt', elo: 1690, logo: '🌪️' },
  { id: 't6', name: 'Golden Knights Club', seed: null, captain: 'Vũ Đức Thịnh', elo: 1670, logo: '⚔️' },
  { id: 't7', name: 'Cyber Titans Team', seed: null, captain: 'Hoàng Anh Tuấn', elo: 1650, logo: '🤖' },
  { id: 't8', name: 'Vanguard Warriors', seed: null, captain: 'Phạm Đức Trọng', elo: 1630, logo: '🛡️' },
]

// Danh sách các giải đấu có sẵn trong hệ thống SportNexus
const INITIAL_TOURNAMENTS = [
  {
    id: 'tour-1',
    name: 'SportNexus Arena Open Championship 2026',
    sport: 'badminton',
    sportLabel: 'Cầu lông Đôi',
    sportIcon: 'sports_tennis',
    format: 'single_elimination',
    formatLabel: 'Loại trực tiếp (Knockout)',
    teamCount: 8,
    courtZone: 'Khu A — Sân Cầu Lông Quốc Tế BWF (Sân A1, A2)',
    entryFee: 500000,
    totalPrize: 15000000,
    startDate: '2026-10-25',
    endDate: '2026-10-26',
    matchTime: '08:00 - 18:00',
    regDeadline: '2026-10-22',
    drawMethod: 'auto_seed',
    status: 'in_progress',
    statusLabel: 'Đang diễn ra',
    description: 'Giải đấu cầu lông đôi chuyên nghiệp hệ thống SportNexus, tự động xếp hạt giống theo Elo và phân bổ sân thi đấu BWF tiêu chuẩn.',
    teams: DEFAULT_TEAMS_8,
    bracket: null,
    isDrawn: false,
    createdAt: '2026-10-10T08:00:00.000Z',
  },
  {
    id: 'tour-2',
    name: 'Giải Pickleball Vô Địch Mở Rộng Saigon Autumn 2026',
    sport: 'pickleball',
    sportLabel: 'Pickleball Đôi',
    sportIcon: 'sports_tennis',
    format: 'single_elimination',
    formatLabel: 'Loại trực tiếp (Knockout)',
    teamCount: 8,
    courtZone: 'Khu C — Cụm Sân Pickleball USAPA Pro (Sân C1 - C4)',
    entryFee: 400000,
    totalPrize: 20000000,
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    matchTime: '07:30 - 21:00',
    regDeadline: '2026-11-01',
    drawMethod: 'auto_seed',
    status: 'open',
    statusLabel: 'Đang mở đăng ký',
    description: 'Quy tụ các cặp VĐV phong trào và bán chuyên tại TP.HCM trên mặt sân Acrylic 8 lớp tiêu chuẩn USAPA.',
    teams: [
      { id: 'pk1', name: 'Saigon Pickleball Club', seed: 1, captain: 'Trần Văn Hùng', elo: 1800, logo: '🏓' },
      { id: 'pk2', name: 'Thủ Đức Dinking Kings', seed: 2, captain: 'Lê Tuấn Kiệt', elo: 1760, logo: '⚡' },
      { id: 'pk3', name: 'Dragon Smashers', seed: 3, captain: 'Ngô Thanh Sơn', elo: 1720, logo: '🐉' },
      { id: 'pk4', name: 'An Phú Masters', seed: 4, captain: 'Đặng Mai Phương', elo: 1690, logo: '🏆' },
    ],
    bracket: null,
    isDrawn: false,
    createdAt: '2026-10-08T10:30:00.000Z',
  },
  {
    id: 'tour-3',
    name: 'Cúp Bóng Đá Mini Tứ Hùng Doanh Nghiệp 2026',
    sport: 'football',
    sportLabel: 'Bóng đá Mini Sân 5',
    sportIcon: 'sports_soccer',
    format: 'single_elimination',
    formatLabel: 'Loại trực tiếp (Knockout)',
    teamCount: 8,
    courtZone: 'Khu B — Cụm Sân Bóng Đá Mini Cỏ Nhân Tạo (Sân B1, B2)',
    entryFee: 1200000,
    totalPrize: 25000000,
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    matchTime: '17:00 - 22:00',
    regDeadline: '2026-09-28',
    drawMethod: 'random',
    status: 'completed',
    statusLabel: 'Đã hoàn thành',
    description: 'Giải bóng đá phong trào các doanh nghiệp trên mặt cỏ nhân tạo FIFA Quality Pro tại cụm sân SportNexus.',
    teams: DEFAULT_TEAMS_8,
    bracket: null,
    isDrawn: true,
    createdAt: '2026-09-25T14:00:00.000Z',
  },
]

export default function CreateAutomatedTournament() {
  // Quản lý danh sách toàn bộ giải đấu (lưu trữ localStorage)
  const [tournaments, setTournaments] = useState(() => {
    try {
      const saved = localStorage.getItem('sportnexus_owner_tournaments')
      if (saved) return JSON.parse(saved)
    } catch {}
    return INITIAL_TOURNAMENTS
  })

  // Giải đấu hiện đang được chọn và kích hoạt bốc thăm / quản lý trên trang
  const [activeTournamentId, setActiveTournamentId] = useState(() => {
    return INITIAL_TOURNAMENTS[0].id
  })

  // Đồng bộ lưu localStorage khi tournaments thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('sportnexus_owner_tournaments', JSON.stringify(tournaments))
    } catch (e) {
      console.error(e)
    }
  }, [tournaments])

  // Lấy giải đấu hiện hành
  const currentTournament = tournaments.find((t) => t.id === activeTournamentId) || tournaments[0]

  // State thông số cấu hình giải đấu (có thể chỉnh sửa trực tiếp)
  const [tournamentName, setTournamentName] = useState(currentTournament?.name || '')
  const [sport, setSport] = useState(currentTournament?.sport || 'badminton')
  const [format, setFormat] = useState(currentTournament?.format || 'single_elimination')
  const [teamCount, setTeamCount] = useState(currentTournament?.teamCount || 8)
  const [courtZone, setCourtZone] = useState(currentTournament?.courtZone || 'Khu A — Sân Cầu Lông Quốc Tế BWF')
  const [entryFee, setEntryFee] = useState(currentTournament?.entryFee || 500000)
  const [totalPrize, setTotalPrize] = useState(currentTournament?.totalPrize || 15000000)

  // Danh sách đội của giải hiện hành
  const [teams, setTeams] = useState(currentTournament?.teams || DEFAULT_TEAMS_8)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamCaptain, setNewTeamCaptain] = useState('')

  // Trạng thái bốc thăm & Bracket
  const [isDrawn, setIsDrawn] = useState(currentTournament?.isDrawn || false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [bracket, setBracket] = useState(currentTournament?.bracket || null)
  const [toastMessage, setToastMessage] = useState(null)

  // Khi người dùng chuyển sang giải đấu khác trong danh sách
  useEffect(() => {
    if (currentTournament) {
      setTournamentName(currentTournament.name)
      setSport(currentTournament.sport)
      setFormat(currentTournament.format)
      setTeamCount(currentTournament.teamCount)
      setCourtZone(currentTournament.courtZone)
      setEntryFee(currentTournament.entryFee)
      setTotalPrize(currentTournament.totalPrize)
      setTeams(currentTournament.teams?.length > 0 ? currentTournament.teams : DEFAULT_TEAMS_8)
      setBracket(currentTournament.bracket || null)
      setIsDrawn(currentTournament.isDrawn || false)
    }
  }, [activeTournamentId])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // ==================== POPUP MODAL TẠO GIẢI ĐẤU MỚI ====================
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTourForm, setNewTourForm] = useState({
    name: '',
    sport: 'badminton',
    format: 'single_elimination',
    teamCount: 8,
    courtZone: 'Khu A — Sân Cầu Lông Quốc Tế BWF (Sân A1, A2)',
    entryFee: 500000,
    totalPrize: 15000000,
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    matchTime: '08:00 - 18:00',
    regDeadline: '2026-10-28',
    drawMethod: 'auto_seed',
    description: '',
  })

  // State hiển thị tiền tệ có phân cách chấm và đơn vị đ
  const [entryFeeDisplay, setEntryFeeDisplay] = useState('500.000đ')
  const [totalPrizeDisplay, setTotalPrizeDisplay] = useState('15.000.000đ')

  // Xử lý gõ số tiền: tự động thêm dấu chấm và đ, cho phép xóa toàn bộ hoặc từng số
  const handleCurrencyChange = (val, setDisplay, formKey) => {
    const rawDigits = val.replace(/\D/g, '')
    if (!rawDigits) {
      setDisplay('')
      setNewTourForm((prev) => ({ ...prev, [formKey]: 0 }))
      return
    }
    const num = parseInt(rawDigits, 10)
    const formatted = new Intl.NumberFormat('vi-VN').format(num) + 'đ'
    setDisplay(formatted)
    setNewTourForm((prev) => ({ ...prev, [formKey]: num }))
  }

  // Bắt phím Backspace / Delete để xóa lùi từng chữ số mượt mà
  const handleCurrencyKeyDown = (e, setDisplay, formKey) => {
    const input = e.target
    const { selectionStart, selectionEnd, value } = input

    if (e.key === 'Backspace') {
      // Nếu bôi đen toàn bộ rồi bấm xóa -> Xóa sạch
      if (selectionStart === 0 && selectionEnd === value.length) {
        e.preventDefault()
        setDisplay('')
        setNewTourForm((prev) => ({ ...prev, [formKey]: 0 }))
        return
      }

      // Nếu con trỏ ở cuối chuỗi (trước hoặc sau chữ 'đ')
      if (selectionStart === selectionEnd && selectionStart >= value.length - 1) {
        e.preventDefault()
        const rawDigits = value.replace(/\D/g, '')
        if (rawDigits.length <= 1) {
          setDisplay('')
          setNewTourForm((prev) => ({ ...prev, [formKey]: 0 }))
        } else {
          const remainingDigits = rawDigits.slice(0, -1)
          const num = parseInt(remainingDigits, 10)
          const formatted = new Intl.NumberFormat('vi-VN').format(num) + 'đ'
          setDisplay(formatted)
          setNewTourForm((prev) => ({ ...prev, [formKey]: num }))
        }
      }
    } else if (e.key === 'Delete') {
      if (selectionStart === 0 && selectionEnd === value.length) {
        e.preventDefault()
        setDisplay('')
        setNewTourForm((prev) => ({ ...prev, [formKey]: 0 }))
      }
    }
  }

  // Đổi cụm sân khi đổi bộ môn trong popup
  const handleModalSportChange = (sportVal) => {
    let defaultCourt = 'Khu A — Sân Cầu Lông Quốc Tế BWF (Sân A1, A2)'
    if (sportVal === 'football') defaultCourt = 'Khu B — Cụm Sân Bóng Đá Mini Cỏ Nhân Tạo (Sân B1, B2)'
    else if (sportVal === 'pickleball') defaultCourt = 'Khu C — Cụm Sân Pickleball USAPA Pro (Sân C1 - C4)'
    else if (sportVal === 'tennis') defaultCourt = 'Khu D — Cụm Sân Quần Vợt Tiêu Chuẩn ITF (Sân T1, T2)'
    else if (sportVal === 'basketball') defaultCourt = 'Khu E — Sân Bóng Rổ Trong Nhà FIBA (Sân R1)'

    setNewTourForm((prev) => ({
      ...prev,
      sport: sportVal,
      courtZone: defaultCourt,
    }))
  }

  // Xác nhận tạo giải đấu từ popup modal
  const handleConfirmCreateTournament = (e) => {
    e.preventDefault()

    if (!newTourForm.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên giải đấu!')
      return
    }

    const sportLabelMap = {
      badminton: 'Cầu lông Đôi',
      football: 'Bóng đá mini Sân 5',
      pickleball: 'Pickleball Đôi',
      tennis: 'Tennis Đơn Nam',
      basketball: 'Bóng rổ 3x3',
    }

    const sportIconMap = {
      badminton: 'sports_tennis',
      football: 'sports_soccer',
      pickleball: 'sports_tennis',
      tennis: 'sports_tennis',
      basketball: 'sports_basketball',
    }

    const formatLabelMap = {
      single_elimination: 'Loại trực tiếp (Knockout)',
      round_robin: 'Vòng tròn tính điểm',
      group_knockout: 'Vòng bảng + Knockout',
    }

    const newTournament = {
      id: `tour-${Date.now()}`,
      name: newTourForm.name.trim(),
      sport: newTourForm.sport,
      sportLabel: sportLabelMap[newTourForm.sport] || 'Thể thao',
      sportIcon: sportIconMap[newTourForm.sport] || 'emoji_events',
      format: newTourForm.format,
      formatLabel: formatLabelMap[newTourForm.format] || 'Loại trực tiếp',
      teamCount: Number(newTourForm.teamCount),
      courtZone: newTourForm.courtZone.trim() || 'Cụm sân SportNexus',
      entryFee: Number(newTourForm.entryFee) || 0,
      totalPrize: Number(newTourForm.totalPrize) || 0,
      startDate: newTourForm.startDate,
      endDate: newTourForm.endDate,
      matchTime: newTourForm.matchTime || '08:00 - 18:00',
      regDeadline: newTourForm.regDeadline,
      drawMethod: newTourForm.drawMethod,
      description: newTourForm.description.trim() || 'Giải đấu tự động được khởi tạo trên nền tảng SportNexus.',
      status: 'open',
      statusLabel: 'Đang mở đăng ký',
      isJustCreated: true,
      createdAt: new Date().toISOString(),
      teams: DEFAULT_TEAMS_8,
      bracket: null,
      isDrawn: false,
    }

    // Thêm giải đấu mới vào danh sách
    const updatedTournaments = [newTournament, ...tournaments]
    setTournaments(updatedTournaments)

    // Tự động kích hoạt giải đấu mới tạo làm giải đấu đang hiển thị trên trang chính
    setActiveTournamentId(newTournament.id)

    // Đóng popup ngay lập tức
    setShowCreateModal(false)

    // Reset form
    setNewTourForm({
      name: '',
      sport: 'badminton',
      format: 'single_elimination',
      teamCount: 8,
      courtZone: 'Khu A — Sân Cầu Lông Quốc Tế BWF (Sân A1, A2)',
      entryFee: 500000,
      totalPrize: 15000000,
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      matchTime: '08:00 - 18:00',
      regDeadline: '2026-10-28',
      drawMethod: 'auto_seed',
      description: '',
    })
    setEntryFeeDisplay('500.000đ')
    setTotalPrizeDisplay('15.000.000đ')

    showToast(`🎉 Đã tạo thành công giải đấu "${newTournament.name}"!`)
  }

  // ==================== TỰ ĐỘNG BỐC THĂM & TẠO SƠ ĐỒ NHÁNH ĐẤU (BRACKET) ====================
  const handleAutoDraw = () => {
    setIsDrawing(true)

    setTimeout(() => {
      const activeTeams = teams.length >= 8 ? teams : DEFAULT_TEAMS_8

      // Phân chia hạt giống: Hạt giống #1 ở QF1, Hạt giống #2 ở QF4 (2 nhánh đối diện)
      const seed1 = activeTeams.find((t) => t.seed === 1) || activeTeams[0]
      const seed2 = activeTeams.find((t) => t.seed === 2) || activeTeams[1]
      const seed3 = activeTeams.find((t) => t.seed === 3) || activeTeams[2]
      const seed4 = activeTeams.find((t) => t.seed === 4) || activeTeams[3]

      // Các đội không hạt giống được xáo trộn ngẫu nhiên
      const unseeded = activeTeams.filter((t) => !t.seed || t.seed > 4).sort(() => Math.random() - 0.5)

      // Cặp đấu Tứ kết (Quarter Finals - QF)
      const qf1 = { id: 'QF1', team1: seed1, team2: unseeded[0] || activeTeams[4], score1: null, score2: null, court: 'Sân A1', time: '08:00' }
      const qf2 = { id: 'QF2', team1: seed4, team2: unseeded[1] || activeTeams[5], score1: null, score2: null, court: 'Sân A2', time: '08:45' }
      const qf3 = { id: 'QF3', team1: seed3, team2: unseeded[2] || activeTeams[6], score1: null, score2: null, court: 'Sân A1', time: '09:30' }
      const qf4 = { id: 'QF4', team1: seed2, team2: unseeded[3] || activeTeams[7], score1: null, score2: null, court: 'Sân A2', time: '10:15' }

      // Bán kết (Semi Finals - SF)
      const sf1 = { id: 'SF1', team1: null, team2: null, score1: null, score2: null, court: 'Sân A1 (VIP)', time: '14:00' }
      const sf2 = { id: 'SF2', team1: null, team2: null, score1: null, score2: null, court: 'Sân A2 (VIP)', time: '15:00' }

      // Chung kết (Final)
      const finalMatch = { id: 'FINAL', team1: null, team2: null, score1: null, score2: null, court: 'Sân A1 (Center Court VIP)', time: '17:00' }

      const newBracket = {
        qf: [qf1, qf2, qf3, qf4],
        sf: [sf1, sf2],
        final: finalMatch,
        champion: null,
      }

      setBracket(newBracket)
      setIsDrawing(false)
      setIsDrawn(true)

      // Cập nhật lại trong tournaments list
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === activeTournamentId
            ? { ...t, bracket: newBracket, isDrawn: true, status: 'in_progress', statusLabel: 'Đang diễn ra' }
            : t
        )
      )

      showToast('🎉 Bốc thăm tự động hoàn tất! Sơ đồ nhánh đấu đã được khởi tạo.')
    }, 1200)
  }

  // Chuẩn hóa tỷ số: nhập tự do với điều kiện trên 0 và dưới 50 (tức từ 1 đến 49)
  const sanitizeScore = (rawVal) => {
    if (rawVal === '' || rawVal === null || rawVal === undefined) return null
    const clean = String(rawVal).replace(/\D/g, '')
    if (!clean) return null
    let n = parseInt(clean, 10)
    if (n <= 0) return null
    if (n >= 50) return 49
    return n
  }

  // Cập nhật tỷ số trận đấu và tự động đẩy đội thắng vào vòng tiếp theo
  const handleUpdateScore = (round, matchId, score1, score2) => {
    if (!bracket) return

    const s1 = sanitizeScore(score1)
    const s2 = sanitizeScore(score2)

    setBracket((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))

      if (round === 'qf') {
        const m = copy.qf.find((item) => item.id === matchId)
        if (m) {
          m.score1 = s1
          m.score2 = s2

          let winner = null
          if (m.score1 !== null && m.score2 !== null) {
            if (m.score1 > m.score2) winner = m.team1
            else if (m.score2 > m.score1) winner = m.team2
          }

          if (matchId === 'QF1') copy.sf[0].team1 = winner
          if (matchId === 'QF2') copy.sf[0].team2 = winner
          if (matchId === 'QF3') copy.sf[1].team1 = winner
          if (matchId === 'QF4') copy.sf[1].team2 = winner
        }
      } else if (round === 'sf') {
        const m = copy.sf.find((item) => item.id === matchId)
        if (m) {
          m.score1 = s1
          m.score2 = s2

          let winner = null
          if (m.score1 !== null && m.score2 !== null) {
            if (m.score1 > m.score2) winner = m.team1
            else if (m.score2 > m.score1) winner = m.team2
          }

          if (matchId === 'SF1') copy.final.team1 = winner
          if (matchId === 'SF2') copy.final.team2 = winner
        }
      } else if (round === 'final') {
        copy.final.score1 = s1
        copy.final.score2 = s2

        if (copy.final.score1 !== null && copy.final.score2 !== null) {
          if (copy.final.score1 > copy.final.score2) copy.champion = copy.final.team1
          else if (copy.final.score2 > copy.final.score1) copy.champion = copy.final.team2
          else copy.champion = null
        } else {
          copy.champion = null
        }
      }

      // Lưu lại vào tournament
      setTournaments((tourList) =>
        tourList.map((t) => (t.id === activeTournamentId ? { ...t, bracket: copy } : t))
      )

      return copy
    })
  }

  // Thêm đội mới vào giải
  const handleAddTeam = (e) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    const newTeam = {
      id: `t-${Date.now()}`,
      name: newTeamName.trim(),
      seed: null,
      captain: newTeamCaptain.trim() || 'Đang cập nhật',
      elo: 1600,
      logo: '🏅',
    }

    const updatedTeams = [...teams, newTeam]
    setTeams(updatedTeams)
    setNewTeamName('')
    setNewTeamCaptain('')

    setTournaments((prev) =>
      prev.map((t) => (t.id === activeTournamentId ? { ...t, teams: updatedTeams } : t))
    )

    showToast(`Đã thêm đội "${newTeam.name}" vào danh sách thi đấu!`)
  }

  // Xóa giải đấu khỏi danh sách
  const handleDeleteTournament = (tourId, tourName) => {
    if (tournaments.length <= 1) {
      showToast('⚠️ Không thể xóa giải đấu cuối cùng trong cơ sở!')
      return
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa giải đấu "${tourName}" không?`)) {
      const remaining = tournaments.filter((t) => t.id !== tourId)
      setTournaments(remaining)
      if (activeTournamentId === tourId) {
        setActiveTournamentId(remaining[0].id)
      }
      showToast(`Đã xóa giải đấu "${tourName}" khỏi hệ thống!`)
    }
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: '#F8FAFC' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #10B981',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#10B981' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER SECTION: NÚT TẠO GIẢI ĐẤU & KÍCH HOẠT BỐC THĂM TỰ ĐỘNG */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '26px 32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              AI Automated Tournament Engine
            </span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Tự động bốc thăm, xếp sân & tạo sơ đồ nhánh đấu
            </span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Tạo Giải Đấu Tự Động & Sơ Đồ Nhánh Đấu (Bracket)
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>
            Hệ thống tự động xếp hạt giống, bốc thăm ngẫu nhiên công bằng và gán khung giờ sân thi đấu trong cụm cơ sở.
          </p>
        </div>

        {/* Action Buttons: Nút Tạo Giải Đấu Mới & Nút Kích Hoạt Bốc Thăm Tự Động */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* NÚT TẠO GIẢI ĐẤU - MỞ POPUP MODAL ĐIỀN THÔNG TIN */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#FFFFFF',
              color: '#D97706',
              border: '2px solid #F59E0B',
              borderRadius: '14px',
              padding: '13px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFFBEB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              add_circle
            </span>
            TẠO GIẢI ĐẤU MỚI
          </button>

          {/* NÚT KÍCH HOẠT BỐC THĂM TỰ ĐỘNG */}
          <button
            onClick={handleAutoDraw}
            disabled={isDrawing}
            style={{
              background: isDrawing
                ? '#94A3B8'
                : 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: isDrawing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
              transition: 'transform 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              {isDrawing ? 'sync' : 'shuffle'}
            </span>
            {isDrawing ? 'Đang Tự Động Bốc Thăm...' : 'KÍCH HOẠT BỐC THĂM TỰ ĐỘNG'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THANH DANH SÁCH CÁC GIẢI ĐẤU CỦA CƠ SỞ (CHUYỂN ĐỔI NHANH GIẢI ĐẤU) */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '20px' }}>
              list_alt
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
              Danh Sách Giải Đấu Của Cơ Sở ({tournaments.length})
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              (Bấm vào giải để xem cấu hình & sơ đồ nhánh đấu)
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#F59E0B' }}>
              add
            </span>
            Thêm giải đấu
          </button>
        </div>

        {/* Thanh cuộn ngang các giải đấu */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
          {tournaments.map((tour) => {
            const isSelected = tour.id === activeTournamentId
            const isJustCreated = tour.isJustCreated

            return (
              <div
                key={tour.id}
                onClick={() => setActiveTournamentId(tour.id)}
                style={{
                  minWidth: '280px',
                  maxWidth: '320px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '2px solid #F59E0B'
                    : isJustCreated
                    ? '2px solid #38BDF8'
                    : '1px solid #E2E8F0',
                  background: isSelected ? '#FFFBEB' : '#FFFFFF',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        background: isSelected ? '#FEF3C7' : '#F1F5F9',
                        color: isSelected ? '#B45309' : '#475569',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {tour.sportLabel || tour.sport}
                    </span>

                    {isJustCreated && (
                      <span
                        style={{
                          background: '#ECFDF5',
                          color: '#059669',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        MỚI TẠO ✨
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: tour.status === 'open' ? '#10B981' : tour.status === 'in_progress' ? '#F59E0B' : '#64748B',
                    }}
                  >
                    {tour.status === 'open' ? '● Mở ĐK' : tour.status === 'in_progress' ? '⚡ Thi đấu' : '✓ Xong'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: isSelected ? '#B45309' : '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tour.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                  <span>{tour.courtZone?.split('(')[0] || 'SportNexus'}</span>
                  <span style={{ fontWeight: 700, color: '#D97706' }}>{formatVND(tour.totalPrize)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHAMPION BANNER: VINH DANH NHÀ VÔ ĐỊCH NẾU ĐÃ KẾT THÚC CHUNG KẾT */}
      {/* ========================================================================= */}
      {bracket?.champion && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
            borderRadius: '16px',
            padding: '24px 32px',
            border: '2px solid #F59E0B',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '56px', lineHeight: 1 }}>🏆</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                VINH DANH NHÀ VÔ ĐỊCH GIẢI ĐẤU
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#78350F', margin: '4px 0' }}>
                {bracket.champion.name}
              </h2>
              <div style={{ fontSize: '14px', color: '#92400E' }}>
                Đội trưởng: <strong>{bracket.champion.captain}</strong> • Nhận cúp vô địch & giải thưởng <strong>{formatVND(totalPrize * 0.6)}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>HẠNG MỤC</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706' }}>CHAMPION #1</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: TOURNAMENT SETUP & PARTICIPANT TEAMS (CẤU HÌNH & DANH SÁCH ĐỘI) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Tournament Parameters Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '22px' }}>
                settings
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Cấu Hình Giải Đấu
              </h3>
            </div>

            <button
              onClick={() => handleDeleteTournament(activeTournamentId, tournamentName)}
              title="Xóa giải đấu này"
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                delete
              </span>
              Xóa giải
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tên Giải Đấu
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => {
                  setTournamentName(e.target.value)
                  setTournaments((prev) =>
                    prev.map((t) => (t.id === activeTournamentId ? { ...t, name: e.target.value } : t))
                  )
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Bộ Môn
                </label>
                <select
                  value={sport}
                  onChange={(e) => {
                    setSport(e.target.value)
                    setTournaments((prev) =>
                      prev.map((t) => (t.id === activeTournamentId ? { ...t, sport: e.target.value } : t))
                    )
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                >
                  <option value="badminton">Cầu lông Đôi</option>
                  <option value="football">Bóng đá mini</option>
                  <option value="pickleball">Pickleball Open</option>
                  <option value="tennis">Tennis Đơn</option>
                  <option value="basketball">Bóng rổ 3x3</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Quy Mô
                </label>
                <select
                  value={teamCount}
                  onChange={(e) => {
                    const cnt = Number(e.target.value)
                    setTeamCount(cnt)
                    setTournaments((prev) =>
                      prev.map((t) => (t.id === activeTournamentId ? { ...t, teamCount: cnt } : t))
                    )
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                >
                  <option value={4}>4 Đội (Bán kết)</option>
                  <option value={8}>8 Đội (Tứ kết)</option>
                  <option value={16}>16 Đội (Vòng 1/8)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Sân Phân Bổ Trong Cụm
              </label>
              <input
                type="text"
                value={courtZone}
                onChange={(e) => {
                  setCourtZone(e.target.value)
                  setTournaments((prev) =>
                    prev.map((t) => (t.id === activeTournamentId ? { ...t, courtZone: e.target.value } : t))
                  )
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Lệ Phí / Đội
                </label>
                <input
                  type="number"
                  step="50000"
                  value={entryFee}
                  onChange={(e) => {
                    const fee = Number(e.target.value)
                    setEntryFee(fee)
                    setTournaments((prev) =>
                      prev.map((t) => (t.id === activeTournamentId ? { ...t, entryFee: fee } : t))
                    )
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Tổng Giải Thưởng
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={totalPrize}
                  onChange={(e) => {
                    const pz = Number(e.target.value)
                    setTotalPrize(pz)
                    setTournaments((prev) =>
                      prev.map((t) => (t.id === activeTournamentId ? { ...t, totalPrize: pz } : t))
                    )
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#D97706',
                  }}
                />
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#64748B' }}>
              💡 Hệ thống sẽ tự động gán hạt giống #1 và #2 vào 2 nhánh đối diện để gặp nhau ở chung kết.
            </div>
          </div>
        </div>

        {/* Registered Teams Table Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Danh Sách Đội Tham Gia ({teams.length}/{teamCount})
            </h3>

            <button
              onClick={() => {
                setTeams(DEFAULT_TEAMS_8)
                setTournaments((prev) =>
                  prev.map((t) => (t.id === activeTournamentId ? { ...t, teams: DEFAULT_TEAMS_8 } : t))
                )
                showToast('Đã tải danh sách 8 đội mẫu chuyên nghiệp!')
              }}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Tải lại 8 đội mẫu
            </button>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>Hạt Giống</th>
                  <th style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>Tên Đội</th>
                  <th style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>Đội Trưởng</th>
                  <th style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>Elo Rate</th>
                  <th style={{ padding: '8px 12px', fontSize: '12px', color: '#64748B' }}>Trạng Thái Cọc</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px' }}>
                      {t.seed ? (
                        <span
                          style={{
                            background: '#FEF3C7',
                            color: '#B45309',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          #{t.seed}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>Bốc ngẫu nhiên</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {t.logo || '🏅'} {t.name}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#475569' }}>
                      {t.captain}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
                      {t.elo}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Đã Đóng Escrow
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Add Team Form */}
          <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Tên đội mới..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
              }}
            />
            <input
              type="text"
              placeholder="Đội trưởng..."
              value={newTeamCaptain}
              onChange={(e) => setNewTeamCaptain(e.target.value)}
              style={{
                width: '140px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Thêm
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 2: INTERACTIVE TOURNAMENT BRACKET DIAGRAM (SƠ ĐỒ NHÁNH ĐẤU BRACKET) */}
      {/* ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Sơ Đồ Nhánh Đấu Trực Quan (Tournament Bracket Diagram)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '13px' }}>
              Nhập tỷ số tại các trận để tự động đẩy đội chiến thắng vào các vòng tiếp theo
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => showToast('Đang xuất sơ đồ thi đấu dưới định dạng PDF/PNG...')}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                print
              </span>
              In Sơ Đồ
            </button>
          </div>
        </div>

        {/* Bracket Columns: Tứ Kết -> Bán Kết -> Chung Kết */}
        {bracket ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '40px',
              alignItems: 'center',
              position: 'relative',
              overflowX: 'auto',
              padding: '10px 0',
            }}
          >
            {/* ROUND 1: QUARTER FINALS (4 Matches) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', textAlign: 'center', textTransform: 'uppercase' }}>
                Vòng Tứ Kết (Quarter-Finals)
              </div>

              {bracket.qf.map((match) => (
                <div
                  key={match.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#2563EB' }}>{match.id}</span>
                    <span>{match.court} • {match.time}</span>
                  </div>

                  {/* Team 1 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: match.score1 !== null && match.score2 !== null && match.score1 > match.score2 ? '#DCFCE7' : '#F8FAFC',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {match.team1?.name || 'TBD'}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={match.score1 ?? ''}
                      onChange={(e) => handleUpdateScore('qf', match.id, e.target.value, match.score2)}
                      style={{
                        width: '38px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Team 2 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: match.score1 !== null && match.score2 !== null && match.score2 > match.score1 ? '#DCFCE7' : '#F8FAFC',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {match.team2?.name || 'TBD'}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={match.score2 ?? ''}
                      onChange={(e) => handleUpdateScore('qf', match.id, match.score1, e.target.value)}
                      style={{
                        width: '38px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ROUND 2: SEMI FINALS (2 Matches) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '90px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', textAlign: 'center', textTransform: 'uppercase' }}>
                Vòng Bán Kết (Semi-Finals)
              </div>

              {bracket.sf.map((match) => (
                <div
                  key={match.id}
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid #93C5FD',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#2563EB' }}>{match.id}</span>
                    <span>{match.court} • {match.time}</span>
                  </div>

                  {/* Team 1 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: match.score1 !== null && match.score2 !== null && match.score1 > match.score2 ? '#DCFCE7' : '#F8FAFC',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: match.team1 ? '#0F172A' : '#94A3B8' }}>
                      {match.team1?.name || '(Chờ thắng QF)'}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      disabled={!match.team1}
                      value={match.score1 ?? ''}
                      onChange={(e) => handleUpdateScore('sf', match.id, e.target.value, match.score2)}
                      style={{
                        width: '38px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Team 2 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: match.score1 !== null && match.score2 !== null && match.score2 > match.score1 ? '#DCFCE7' : '#F8FAFC',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: match.team2 ? '#0F172A' : '#94A3B8' }}>
                      {match.team2?.name || '(Chờ thắng QF)'}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      disabled={!match.team2}
                      value={match.score2 ?? ''}
                      onChange={(e) => handleUpdateScore('sf', match.id, match.score1, e.target.value)}
                      style={{
                        width: '38px',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ROUND 3: GRAND FINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#D97706', textAlign: 'center', textTransform: 'uppercase' }}>
                Trận Chung Kết (Grand Final 🏆)
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '2px solid #F59E0B',
                  borderRadius: '14px',
                  padding: '16px',
                  boxShadow: '0 6px 18px rgba(245, 158, 11, 0.15)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#92400E', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800 }}>CHUNG KẾT VÔ ĐỊCH</span>
                  <span>{bracket.final.court}</span>
                </div>

                {/* Team 1 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: bracket.final.score1 !== null && bracket.final.score2 !== null && bracket.final.score1 > bracket.final.score2 ? '#DCFCE7' : '#FFFFFF',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 800, color: bracket.final.team1 ? '#0F172A' : '#94A3B8' }}>
                    {bracket.final.team1?.name || '(Chờ thắng Bán kết 1)'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    disabled={!bracket.final.team1}
                    value={bracket.final.score1 ?? ''}
                    onChange={(e) => handleUpdateScore('final', 'FINAL', e.target.value, bracket.final.score2)}
                    style={{
                      width: '44px',
                      padding: '4px',
                      borderRadius: '6px',
                      border: '2px solid #F59E0B',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Team 2 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: bracket.final.score1 !== null && bracket.final.score2 !== null && bracket.final.score2 > bracket.final.score1 ? '#DCFCE7' : '#FFFFFF',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 800, color: bracket.final.team2 ? '#0F172A' : '#94A3B8' }}>
                    {bracket.final.team2?.name || '(Chờ thắng Bán kết 2)'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    disabled={!bracket.final.team2}
                    value={bracket.final.score2 ?? ''}
                    onChange={(e) => handleUpdateScore('final', 'FINAL', bracket.final.score1, e.target.value)}
                    style={{
                      width: '44px',
                      padding: '4px',
                      borderRadius: '6px',
                      border: '2px solid #F59E0B',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '12px' }}>
              account_tree
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
              Chưa Bốc Thăm Nhánh Đấu
            </div>
            <p style={{ margin: '6px 0 16px 0', fontSize: '13px' }}>
              Hãy nhấn nút <strong>"KÍCH HOẠT BỐC THĂM TỰ ĐỘNG"</strong> ở góc trên để tạo sơ đồ bracket thi đấu ngay lập tức.
            </p>
            <button
              onClick={handleAutoDraw}
              style={{
                background: '#F59E0B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Bốc Thăm Ngay
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: TẠO GIẢI ĐẤU MỚI (VỚI ĐẦY ĐỦ THÔNG TIN CẦN THIẾT) */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    emoji_events
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Tạo Giải Đấu Tự Động Mới
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Điền đầy đủ thông tin để khởi tạo giải đấu và kích hoạt hệ thống bốc thăm tự động
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmCreateTournament}>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Tên Giải Đấu */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Tên Giải Đấu <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: SportNexus Arena Cup Mùa Đông 2026..."
                    value={newTourForm.name}
                    onChange={(e) => setNewTourForm({ ...newTourForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </div>

                {/* 2. Bộ Môn & Thể Thức & Quy Mô */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  {/* Bộ môn */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Bộ Môn Thể Thao <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={newTourForm.sport}
                      onChange={(e) => handleModalSportChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="badminton">🏸 Cầu lông Đôi</option>
                      <option value="pickleball">🏓 Pickleball Đôi</option>
                      <option value="football">⚽ Bóng đá mini Sân 5</option>
                      <option value="tennis">🎾 Tennis Đơn Nam</option>
                      <option value="basketball">🏀 Bóng rổ 3x3</option>
                    </select>
                  </div>

                  {/* Thể thức */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Thể Thức Thi Đấu
                    </label>
                    <select
                      value={newTourForm.format}
                      onChange={(e) => setNewTourForm({ ...newTourForm, format: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="single_elimination">Loại trực tiếp (Knockout)</option>
                      <option value="round_robin">Vòng tròn tính điểm</option>
                      <option value="group_knockout">Đấu bảng + Knockout</option>
                    </select>
                  </div>

                  {/* Quy mô đội */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Quy Mô Số Đội Tham Gia
                    </label>
                    <select
                      value={newTourForm.teamCount}
                      onChange={(e) => setNewTourForm({ ...newTourForm, teamCount: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <option value={4}>4 Đội (Bán kết + Chung kết)</option>
                      <option value={8}>8 Đội (Tứ kết - Tiêu chuẩn)</option>
                      <option value={16}>16 Đội (Vòng 1/8)</option>
                      <option value={32}>32 Đội (Mở rộng)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Cụm Sân & Sân Phân Bổ */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Sân Thi Đấu / Cụm Sân Phân Bổ
                  </label>
                  <input
                    type="text"
                    value={newTourForm.courtZone}
                    onChange={(e) => setNewTourForm({ ...newTourForm, courtZone: e.target.value })}
                    placeholder="Ví dụ: Khu A — Cụm Sân Cầu Lông Quốc Tế BWF (Sân A1, A2)..."
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* 4. Thời Gian Tổ Chức */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Ngày Bắt Đầu
                    </label>
                    <input
                      type="date"
                      value={newTourForm.startDate}
                      onChange={(e) => setNewTourForm({ ...newTourForm, startDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Ngày Kết Thúc
                    </label>
                    <input
                      type="date"
                      value={newTourForm.endDate}
                      onChange={(e) => setNewTourForm({ ...newTourForm, endDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Hạn Chót Đăng Ký
                    </label>
                    <input
                      type="date"
                      value={newTourForm.regDeadline}
                      onChange={(e) => setNewTourForm({ ...newTourForm, regDeadline: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                {/* 5. Lệ Phí & Giải Thưởng (CHO PHÉP CHỈNH SỬA TÙY Ý, XÓA TỪNG SỐ HOẶC TOÀN BỘ, TỰ ĐỘNG CHẤM VÀ Đ) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Lệ phí tham gia */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Lệ Phí Tham Gia / Đội <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      {entryFeeDisplay && (
                        <button
                          type="button"
                          onClick={() => {
                            setEntryFeeDisplay('')
                            setNewTourForm((prev) => ({ ...prev, entryFee: 0 }))
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                          title="Xóa toàn bộ số tiền"
                        >
                          ✕ Xóa sạch
                        </button>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Nhập số tiền (VD: 50.000đ)..."
                        value={entryFeeDisplay}
                        onChange={(e) => handleCurrencyChange(e.target.value, setEntryFeeDisplay, 'entryFee')}
                        onKeyDown={(e) => handleCurrencyKeyDown(e, setEntryFeeDisplay, 'entryFee')}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#0F172A',
                          outline: 'none',
                          background: '#FFFFFF',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
                        onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </div>
                  </div>

                  {/* Tổng giá trị giải thưởng */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Tổng Giá Trị Giải Thưởng
                      </label>
                      {totalPrizeDisplay && (
                        <button
                          type="button"
                          onClick={() => {
                            setTotalPrizeDisplay('')
                            setNewTourForm((prev) => ({ ...prev, totalPrize: 0 }))
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                          title="Xóa toàn bộ số tiền"
                        >
                          ✕ Xóa sạch
                        </button>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Nhập giải thưởng (VD: 15.000.000đ)..."
                        value={totalPrizeDisplay}
                        onChange={(e) => handleCurrencyChange(e.target.value, setTotalPrizeDisplay, 'totalPrize')}
                        onKeyDown={(e) => handleCurrencyKeyDown(e, setTotalPrizeDisplay, 'totalPrize')}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#D97706',
                          outline: 'none',
                          background: '#FFFFFF',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
                        onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Thuật toán bốc thăm */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Thuật Toán Bốc Thăm & Nhánh Đấu (AI Engine)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label
                      style={{
                        border: newTourForm.drawMethod === 'auto_seed' ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                        background: newTourForm.drawMethod === 'auto_seed' ? '#FFFBEB' : '#FFFFFF',
                        padding: '12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <input
                        type="radio"
                        name="drawMethod"
                        checked={newTourForm.drawMethod === 'auto_seed'}
                        onChange={() => setNewTourForm({ ...newTourForm, drawMethod: 'auto_seed' })}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          ⚡ Tự Động Xếp Hạt Giống (Elo)
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Hạt giống #1 và #2 tách 2 nhánh đối diện
                        </div>
                      </div>
                    </label>

                    <label
                      style={{
                        border: newTourForm.drawMethod === 'random' ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                        background: newTourForm.drawMethod === 'random' ? '#FFFBEB' : '#FFFFFF',
                        padding: '12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <input
                        type="radio"
                        name="drawMethod"
                        checked={newTourForm.drawMethod === 'random'}
                        onChange={() => setNewTourForm({ ...newTourForm, drawMethod: 'random' })}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          🎲 Bốc Thăm Hoàn Toàn Ngẫu Nhiên
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Xáo trộn ngẫu nhiên tất cả các đội
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 7. Mô tả ngắn */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Quy Định & Mô Tả Giải Đấu
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Quy định trang phục, trọng tài, cách thức tính điểm hoặc nhà tài trợ giải đấu..."
                    value={newTourForm.description}
                    onChange={(e) => setNewTourForm({ ...newTourForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '18px 28px',
                  borderTop: '1px solid #F1F5F9',
                  background: '#F8FAFC',
                  borderRadius: '0 0 24px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>

                {/* Nút Xác Nhận Tạo */}
                <button
                  type="submit"
                  style={{
                    padding: '11px 26px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    check_circle
                  </span>
                  Xác Nhận Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
