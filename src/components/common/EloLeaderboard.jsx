import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { getPublicSports } from '../../api/auth/authApi.js'
import { getLeaderboard } from '../../api/player/ratingApi.js'

// Bảng xếp hạng Elo theo môn: GET /api/v1/ratings/leaderboard?sportCategoryId&ratingType=PERSONAL|TEAM
// (không còn SINGLES / DOUBLES). Dùng chung cho người chơi và Admin.
const RANK_TONE = { 'Kim cương': 'blue', 'Bạch kim': 'blue', 'Vàng': 'amber', 'Bạc': 'gray', 'Đồng': 'amber' }
const PAGE_SIZE = 20

export default function EloLeaderboard({ initialSportId = '', title = 'Bảng xếp hạng Elo' }) {
  const sports = useApi(getPublicSports, [], { initialData: [] })
  const [sportId, setSportId] = useState(initialSportId)
  const [ratingType, setRatingType] = useState('PERSONAL')
  const [page, setPage] = useState(1)
  const activeSport = sportId || sports.data?.[0]?.id || ''
  const board = useApi(() => getLeaderboard({ sportCategoryId: activeSport, ratingType, page, pageSize: PAGE_SIZE }), [activeSport, ratingType, page], { enabled: Boolean(activeSport), initialData: { items: [], total: 0, totalPages: 0 } })
  const items = board.data?.items || []
  const totalPages = Math.max(1, board.data?.totalPages || 1)

  return (
    <section className="snx-card" style={{ padding: 16 }}>
      <div className="snx-row" style={{ gap: 8 }}>
        <h2 className="snx-card-title" style={{ fontSize: 16 }}>{title}</h2>
        <span className="snx-spacer" />
        <select className="snx-select" style={{ width: 'auto' }} value={activeSport} onChange={(e) => { setSportId(e.target.value); setPage(1) }} aria-label="Môn">
          {(sports.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="snx-tabs" role="tablist" aria-label="Loại Elo">
          {[['PERSONAL', 'Cá nhân'], ['TEAM', 'Đội']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={ratingType === key} className={`snx-tab ${ratingType === key ? 'active' : ''}`} onClick={() => { setRatingType(key); setPage(1) }}>{label}</button>
          ))}
        </div>
      </div>
      {board.error && <div className="snx-alert snx-alert--error" style={{ marginTop: 10 }}>{board.error}</div>}
      <div className="snx-table-wrap" style={{ marginTop: 10 }}>
        <table className="snx-table">
          <thead><tr><th>#</th><th>{ratingType === 'TEAM' ? 'Đội' : 'Người chơi'}</th><th>Elo</th><th>Hạng</th><th>Trận giải</th></tr></thead>
          <tbody>
            {items.map((r, index) => (
              <tr key={r.ownerId || index}>
                <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td><strong>{r.ownerName || '—'}</strong></td>
                <td><strong>{r.rating}</strong>{r.isProvisional && <span className="snx-muted"> (tạm tính)</span>}</td>
                <td><span className={`snx-badge snx-badge--${RANK_TONE[r.rank] || 'gray'}`}>{r.rank || '—'}</span></td>
                <td>{r.ratedMatches ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!board.loading && !items.length && <p className="snx-muted" style={{ padding: 12 }}>Chưa có ai trên bảng xếp hạng môn này.</p>}
        {board.loading && <p className="snx-muted" style={{ padding: 12 }}>Đang tải…</p>}
      </div>
      {totalPages > 1 && (
        <div className="snx-row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <span className="snx-muted">Trang {page} / {totalPages}</span>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      )}
      <p className="snx-muted" style={{ marginTop: 8 }}>Elo sau trận giải được cập nhật sau 15 – 20 phút (chờ hết hạn khiếu nại).</p>
    </section>
  )
}
