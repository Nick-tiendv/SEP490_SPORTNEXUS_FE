import { useState } from 'react'
import { toast } from 'sonner'
import { updateMatchScore } from '../../api/player/tournamentApi.js'
import MatchScoreModal from '../../components/common/MatchScoreModal.jsx'

const dateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Chưa xếp giờ')
const ROLE_LABEL = { REFEREE: 'Trọng tài', SCORER: 'Người nhập điểm', OTHER: 'Nhân sự' }

// Trận tôi được nhập tỉ số (GET /tournaments/my-staff-matches): trận chưa đá + trận đã xong trong 72 giờ của giải tôi là
// nhân sự có tài khoản. Trọng tài chỉ nhập tỉ số (nhóm + BE chốt 23/11, không chấm Fair Play).
// Hết giải thì danh sách rỗng, tài khoản trở lại như người chơi thường.
export default function RefereeMatches({ matches }) {
  const [scoring, setScoring] = useState(null)
  const list = matches.data || []

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
          <li>Bạn nhập tỉ số trận chưa đá và sửa tỉ số trận đã xong trong 72 giờ.</li>
        </ol>
        <p className="snx-muted" style={{ textAlign: 'center', fontSize: 12.5 }}>Quyền nhập tỉ số hết khi giải kết thúc.</p>
      </div>
    )
  }

  // Trận được phân công đích danh lên trước, rồi theo giờ
  const sorted = [...list].sort((x, y) => Number(!!y.isAssignedOfficial) - Number(!!x.isAssignedOfficial) || String(x.startTime || '').localeCompare(String(y.startTime || '')))

  return (
    <div className="snx-card">
      <p className="snx-muted" style={{ marginTop: 0 }}>Bạn nhập được tỉ số các trận của giải tới khi giải kết thúc. Sửa tỉ số trận đã xong sẽ tính lại Elo và mở lại thời gian khiếu nại.</p>
      <div className="snx-list">
        {sorted.map((m) => (
          <div key={m.matchId} className="snx-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 92 }}><strong style={{ fontSize: 14 }}>{dateTime(m.startTime)}</strong><div className="snx-muted">{m.courtName || 'Chưa xếp sân'}</div></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{m.participant1Name || 'Chờ xác định'} <span className="snx-muted">vs</span> {m.participant2Name || 'Chờ xác định'}</strong>
              <div className="snx-muted">{[m.rootTournamentName, m.rootTournamentName !== m.tournamentName && m.tournamentName, m.roundName, m.facilityName].filter(Boolean).join(' · ')}</div>
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
      {scoring && (
        <MatchScoreModal
          matchId={scoring.matchId}
          title={`Tỉ số: ${scoring.participant1Name} vs ${scoring.participant2Name}`}
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
