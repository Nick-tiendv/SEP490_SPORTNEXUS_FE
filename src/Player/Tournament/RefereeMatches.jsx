import { useState } from 'react'
import { toast } from 'sonner'
import { checkInTournament, getTournamentParticipants, updateMatchScore } from '../../api/player/tournamentApi.js'
import { useApi } from '../../hooks/useApi.js'
import MatchScoreModal from '../../components/common/MatchScoreModal.jsx'

const dateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Chưa xếp giờ')
const ROLE_LABEL = { REFEREE: 'Trọng tài', SCORER: 'Người nhập điểm', OTHER: 'Nhân sự' }

// Điểm danh thủ công của trọng tài (BE 25/11 mở quyền POST /tournaments/{id}/check-in cho trọng tài có tài khoản của giải)
function CheckInList({ tournamentId }) {
  const participants = useApi(() => getTournamentParticipants(tournamentId), [tournamentId], { initialData: [] })
  const [busyId, setBusyId] = useState('')
  const [query, setQuery] = useState('')
  const list = participants.data || []
  const fold = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  const shown = list
    .filter((p) => !query.trim() || fold(`${p.teamName || ''} ${p.fullName || ''} ${p.username || ''}`).includes(fold(query.trim())))
    .sort((a, b) => Number(!!a.isCheckedIn) - Number(!!b.isCheckedIn))
  const done = list.filter((p) => p.isCheckedIn).length

  const checkIn = async (p) => {
    setBusyId(p.participantId)
    try {
      await checkInTournament(tournamentId, { participantId: p.participantId })
      toast.success(`Đã điểm danh ${p.teamName || p.fullName}.`)
      participants.refresh()
    } catch (error) {
      toast.error(error?.message || 'Không điểm danh được.')
    } finally {
      setBusyId('')
    }
  }

  if (participants.loading && !list.length) return <p className="snx-muted">Đang tải người tham gia…</p>
  if (participants.error) return <div className="snx-alert snx-alert--error">{participants.error}</div>
  if (!list.length) return <p className="snx-muted">Giải chưa có người tham gia.</p>
  return (
    <div className="snx-stack" style={{ gap: 10 }}>
      <div className="snx-row">
        <span className="snx-muted">Đã điểm danh {done}/{list.length}. Người chưa đóng lệ phí không điểm danh được.</span>
        <span className="snx-spacer" />
        <input className="snx-input" style={{ width: 220 }} placeholder="Tìm tên / tên đội" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm người tham gia" />
      </div>
      <div className="snx-list">
        {shown.map((p) => (
          <div key={p.participantId} className="snx-list-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{p.teamName || p.fullName}</strong>
              <div className="snx-muted">{p.teamName ? (p.teamMembers || []).map((m) => m.fullName).join(', ') : p.username ? `@${p.username}` : ''}</div>
            </div>
            {p.isCheckedIn
              ? <span className="snx-badge snx-badge--green">Đã điểm danh</span>
              : <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busyId === p.participantId} onClick={() => checkIn(p)}>{busyId === p.participantId ? 'Đang điểm danh…' : 'Điểm danh'}</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Trận tôi được nhập tỉ số (GET /tournaments/my-staff-matches): trận chưa đá + trận đã xong trong 72 giờ của giải tôi là
// nhân sự có tài khoản. Trọng tài chỉ nhập tỉ số (nhóm + BE chốt 23/11, không chấm Fair Play).
// Hết giải thì danh sách rỗng, tài khoản trở lại như người chơi thường.
export default function RefereeMatches({ matches }) {
  const [scoring, setScoring] = useState(null)
  const [openId, setOpenId] = useState(null) // giải đang mở
  const [view, setView] = useState('score') // 'score' | 'checkin'
  // Trận miễn đấu tự có kết quả, không có gì để nhập
  const list = (matches.data || []).filter((m) => !/miễn đấu/i.test(m.roundName || ''))

  if (matches.loading && !list.length) return <p className="snx-muted">Đang tải…</p>
  if (matches.error) return <div className="snx-alert snx-alert--error">{matches.error}</div>
  if (!list.length) {
    return (
      <div className="snx-card">
        <div className="snx-empty" style={{ paddingBottom: 8 }}>
          <span className="material-symbols-outlined">sports</span>
          <strong>Chưa có trận nào cần bạn nhập tỉ số</strong>
        </div>
        <ol className="snx-muted" style={{ margin: '0 auto', maxWidth: 520, paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Ban tổ chức thêm bạn làm trọng tài / người nhập điểm của giải (bằng số điện thoại tài khoản của bạn).</li>
          <li>Khi giải chốt danh sách và sinh sơ đồ, các trận của giải hiện ở đây.</li>
          <li>Tại sân, bạn điểm danh hai bên rồi nhập tỉ số; sửa được tỉ số trận đã xong trong 72 giờ.</li>
        </ol>
        <p className="snx-muted" style={{ textAlign: 'center', fontSize: 12.5 }}>Quyền nhập tỉ số hết khi giải kết thúc.</p>
      </div>
    )
  }

  // Gom theo giải; mỗi giải một thẻ, bấm vào mới hiện lịch nhập tỉ số (rootTournament… chỉ còn ở BE cũ)
  const finished = (m) => String(m.status).toUpperCase() === 'FINISHED'
  const ready = (m) => !finished(m) && m.participant1Name && m.participant2Name && m.participant1Name !== 'TBD' && m.participant2Name !== 'TBD'
  const groups = []
  for (const m of list) {
    const id = String(m.rootTournamentId || m.tournamentId)
    let group = groups.find((g) => g.id === id)
    if (!group) groups.push(group = { id, name: m.rootTournamentName || m.tournamentName, facilityName: m.facilityName, matches: [] })
    group.matches.push(m)
  }
  const open = groups.find((g) => g.id === openId)

  if (!open) {
    return (
      <div className="snx-card">
        <p className="snx-muted" style={{ marginTop: 0 }}>Bạn là trọng tài / người nhập điểm của {groups.length} giải. Chọn giải để xem lịch và nhập tỉ số.</p>
        <div className="snx-grid snx-grid--2">
          {groups.map((g) => {
            const waiting = g.matches.filter(ready).length
            const done = g.matches.filter(finished).length
            return (
              <button key={g.id} type="button" onClick={() => setOpenId(g.id)} className="snx-list-item" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #E2E8F0', borderRadius: 12, background: '#FFFFFF', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#15803D' }}>emoji_events</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14.5, display: 'block' }}>{g.name}</strong>
                  <span className="snx-muted" style={{ fontSize: 12.5 }}>{g.facilityName}</span>
                  <span style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {waiting > 0 && <span className="snx-badge snx-badge--amber">{waiting} trận chờ nhập tỉ số</span>}
                    <span className="snx-badge snx-badge--gray">{done}/{g.matches.length} trận đã có kết quả</span>
                  </span>
                </span>
                <span className="material-symbols-outlined snx-muted">chevron_right</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Trận chờ nhập tỉ số lên trước, rồi trận chưa đủ hai bên, rồi trận đã xong; cùng nhóm thì trận được phân công trước, rồi theo giờ
  const rank = (m) => (ready(m) ? 0 : finished(m) ? 2 : 1)
  const sorted = [...open.matches].sort((x, y) => rank(x) - rank(y) || Number(!!y.isAssignedOfficial) - Number(!!x.isAssignedOfficial) || String(x.startTime || '').localeCompare(String(y.startTime || '')))

  return (
    <div className="snx-card">
      <div className="snx-row" style={{ marginBottom: 8 }}>
        <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setOpenId(null)}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>Tất cả giải
        </button>
        <div>
          <h3 className="snx-card-title" style={{ margin: 0 }}>{open.name}</h3>
          <div className="snx-muted" style={{ fontSize: 12.5 }}>{open.facilityName}</div>
        </div>
      </div>
      <div className="snx-row" style={{ gap: 6, marginBottom: 10 }}>
        {[['score', 'Nhập tỉ số'], ['checkin', 'Điểm danh']].map(([key, label]) => (
          <button key={key} type="button" className={`snx-btn snx-btn--sm ${view === key ? 'snx-btn--primary' : 'snx-btn--secondary'}`} onClick={() => setView(key)}>{label}</button>
        ))}
      </div>
      {view === 'checkin' ? <CheckInList key={open.id} tournamentId={open.id} /> : (<>
      <p className="snx-muted" style={{ marginTop: 0 }}>Bạn nhập được tỉ số các trận của giải tới khi giải kết thúc. Hai bên phải điểm danh trước khi thi đấu: bên vắng mặt bị xử thua. Sửa tỉ số trận đã xong sẽ tính lại Elo và mở lại thời gian khiếu nại.</p>
      <div className="snx-list">
        {sorted.map((m) => (
          <div key={m.matchId} className="snx-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 92 }}><strong style={{ fontSize: 14 }}>{dateTime(m.startTime)}</strong><div className="snx-muted">{m.courtName || 'Chưa xếp sân'}</div></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{m.participant1Name || 'Chờ xác định'} <span className="snx-muted">vs</span> {m.participant2Name || 'Chờ xác định'}</strong>
              <div className="snx-muted">{[m.rootTournamentName !== m.tournamentName && m.tournamentName, m.roundName].filter(Boolean).join(' · ')}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="snx-badge snx-badge--blue">{ROLE_LABEL[String(m.staffRole || '').toUpperCase()] || m.staffRole}</span>
                {m.isAssignedOfficial && <span className="snx-badge snx-badge--green">Được phân công trận này</span>}
                {String(m.status).toUpperCase() === 'FINISHED' && <span className="snx-badge snx-badge--gray">Đã có kết quả</span>}
              </div>
            </div>
            <button
              type="button"
              className="snx-btn snx-btn--primary snx-btn--sm"
              disabled={!m.participant1Name || !m.participant2Name || m.participant1Name === 'TBD' || m.participant2Name === 'TBD'}
              title={!m.participant1Name || !m.participant2Name ? 'Trận chưa đủ hai bên' : undefined}
              onClick={() => setScoring(m)}
            >
              {String(m.status).toUpperCase() === 'FINISHED' ? 'Sửa tỉ số' : 'Nhập tỉ số'}
            </button>
          </div>
        ))}
      </div>
      </>)}
      {scoring && (
        <MatchScoreModal
          matchId={scoring.matchId}
          title={`Tỉ số: ${scoring.participant1Name} vs ${scoring.participant2Name}`}
          requireCheckIn
          onClose={() => setScoring(null)}
          onSubmit={async (payload) => {
            await updateMatchScore(scoring.matchId, payload)
            toast.success('Đã lưu tỉ số. Elo được tính sau khi hết thời gian khiếu nại.')
            setScoring(null)
            matches.refresh?.()
          }}
        />
      )}
    </div>
  )
}
