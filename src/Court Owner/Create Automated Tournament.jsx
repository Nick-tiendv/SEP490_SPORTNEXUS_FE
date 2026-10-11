import { useState } from 'react'
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

export default function CreateAutomatedTournament() {
  const [tournamentName, setTournamentName] = useState('SportNexus Arena Open Championship 2026')
  const [sport, setSport] = useState('badminton')
  const [format, setFormat] = useState('single_elimination')
  const [teamCount, setTeamCount] = useState(8)
  const [courtZone, setCourtZone] = useState('Khu A — Sân Cầu Lông Quốc Tế BWF')
  const [entryFee, setEntryFee] = useState(500000)
  const [totalPrize, setTotalPrize] = useState(15000000)

  // Danh sách đội đăng ký
  const [teams, setTeams] = useState(DEFAULT_TEAMS_8)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamCaptain, setNewTeamCaptain] = useState('')

  // Trạng thái bốc thăm & Sơ đồ nhánh đấu (Bracket Matches)
  const [isDrawn, setIsDrawn] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Dữ liệu nhánh đấu
  const [bracket, setBracket] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Tự động bốc thăm hạt giống & tạo nhánh đấu
  const handleAutoDraw = () => {
    setIsDrawing(true)

    setTimeout(() => {
      // Phân chia hạt giống: Hạt giống #1 ở nhánh trên (QF1), Hạt giống #2 ở nhánh dưới (QF4)
      // Hạt giống #3 ở QF3, Hạt giống #4 ở QF2
      const seed1 = teams.find((t) => t.seed === 1) || teams[0]
      const seed2 = teams.find((t) => t.seed === 2) || teams[1]
      const seed3 = teams.find((t) => t.seed === 3) || teams[2]
      const seed4 = teams.find((t) => t.seed === 4) || teams[3]

      // Các đội không hạt giống được xáo trộn ngẫu nhiên
      const unseeded = teams.filter((t) => !t.seed || t.seed > 4).sort(() => Math.random() - 0.5)

      // Cặp đấu Tứ kết (Quarter Finals - QF)
      const qf1 = { id: 'QF1', team1: seed1, team2: unseeded[0] || teams[4], score1: null, score2: null, court: 'Sân A1', time: '08:00' }
      const qf2 = { id: 'QF2', team1: seed4, team2: unseeded[1] || teams[5], score1: null, score2: null, court: 'Sân A2', time: '08:45' }
      const qf3 = { id: 'QF3', team1: seed3, team2: unseeded[2] || teams[6], score1: null, score2: null, court: 'Sân A1', time: '09:30' }
      const qf4 = { id: 'QF4', team1: seed2, team2: unseeded[3] || teams[7], score1: null, score2: null, court: 'Sân A2', time: '10:15' }

      // Bán kết (Semi Finals - SF)
      const sf1 = { id: 'SF1', team1: null, team2: null, score1: null, score2: null, court: 'Sân A1 (VIP)', time: '14:00' }
      const sf2 = { id: 'SF2', team1: null, team2: null, score1: null, score2: null, court: 'Sân A2 (VIP)', time: '15:00' }

      // Chung kết (Final)
      const finalMatch = { id: 'FINAL', team1: null, team2: null, score1: null, score2: null, court: 'Sân A1 (Center Court VIP)', time: '17:00' }

      setBracket({
        qf: [qf1, qf2, qf3, qf4],
        sf: [sf1, sf2],
        final: finalMatch,
        champion: null,
      })

      setIsDrawing(false)
      setIsDrawn(true)
      showToast('🎉 Bốc thăm tự động hoàn tất! Sơ đồ nhánh đấu đã được khởi tạo.')
    }, 1200)
  }

  // Cập nhật tỷ số trận đấu và đẩy đội thắng vào vòng tiếp theo
  const handleUpdateScore = (round, matchId, score1, score2) => {
    if (!bracket) return

    setBracket((prev) => {
      const copy = JSON.parse(JSON.stringify(prev))

      if (round === 'qf') {
        const m = copy.qf.find((item) => item.id === matchId)
        if (m) {
          m.score1 = score1 !== '' ? Number(score1) : null
          m.score2 = score2 !== '' ? Number(score2) : null

          // Xác định đội thắng Tứ kết
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
          m.score1 = score1 !== '' ? Number(score1) : null
          m.score2 = score2 !== '' ? Number(score2) : null

          let winner = null
          if (m.score1 !== null && m.score2 !== null) {
            if (m.score1 > m.score2) winner = m.team1
            else if (m.score2 > m.score1) winner = m.team2
          }

          if (matchId === 'SF1') copy.final.team1 = winner
          if (matchId === 'SF2') copy.final.team2 = winner
        }
      } else if (round === 'final') {
        copy.final.score1 = score1 !== '' ? Number(score1) : null
        copy.final.score2 = score2 !== '' ? Number(score2) : null

        if (copy.final.score1 !== null && copy.final.score2 !== null) {
          if (copy.final.score1 > copy.final.score2) copy.champion = copy.final.team1
          else if (copy.final.score2 > copy.final.score1) copy.champion = copy.final.team2
          else copy.champion = null
        }
      }

      return copy
    })
  }

  // Thêm đội mới
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

    setTeams([...teams, newTeam])
    setNewTeamName('')
    setNewTeamCaptain('')
    showToast(`Đã thêm đội "${newTeam.name}" vào danh sách thi đấu!`)
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Header section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
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

        {/* Action Button: Trigger Auto Draw */}
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
            fontSize: '15px',
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

      {/* Champion Banner when Final is won */}
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

      {/* Step 1: Tournament Setup & Participant Teams */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '22px' }}>
              settings
            </span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Cấu Hình Giải Đấu
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Tên Giải Đấu
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
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
                  onChange={(e) => setSport(e.target.value)}
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
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Quy Mô
                </label>
                <select
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                >
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
                onChange={(e) => setCourtZone(e.target.value)}
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
                  onChange={(e) => setEntryFee(Number(e.target.value))}
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
                  onChange={(e) => setTotalPrize(Number(e.target.value))}
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

        {/* Registered Teams Table */}
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
                      {t.logo} {t.name}
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

      {/* Step 2: Interactive Tournament Bracket Diagram */}
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
                      type="number"
                      min="0"
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
                      type="number"
                      min="0"
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
                      type="number"
                      disabled={!match.team1}
                      min="0"
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
                      type="number"
                      disabled={!match.team2}
                      min="0"
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
                    type="number"
                    disabled={!bracket.final.team1}
                    min="0"
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
                    type="number"
                    disabled={!bracket.final.team2}
                    min="0"
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
    </div>
  )
}
