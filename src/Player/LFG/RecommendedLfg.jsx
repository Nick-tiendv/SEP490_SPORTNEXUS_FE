import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { getRecommendedLfgs } from '../../api/player/recommendationApi.js'
import { lfgSkillLabel } from '../../api/player/lfgApi.js'

// Trang "Kèo phù hợp với bạn": GET /api/v1/lfgs/recommended → [{ card, score (0–100), reasons[] }]
// Điểm phù hợp tính theo khảo sát người chơi (môn, trình độ, lịch rảnh, khu vực, nội dung hay chơi) và hành vi.
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`
const when = (start, end) => {
  if (!start) return '—'
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const clock = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return `${clock(s)}${e ? ` – ${clock(e)}` : ''}, ${s.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}`
}
const scoreTone = (score) => (score >= 75 ? 'green' : score >= 50 ? 'blue' : 'amber')

export function RecommendedLfgCard({ item, compact = false }) {
  const navigate = useNavigate()
  const c = item.card || {}
  const score = Math.round(Number(item.score) || 0)
  return (
    <article className="snx-card snx-stack" style={{ gap: 8, padding: compact ? 14 : 18 }}>
      <div className="snx-row" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 15 }}>{c.sportName}{c.format ? ` · ${c.format}` : ''} tại {c.facilityName}</strong>
          <div className="snx-muted">{when(c.startTime, c.endTime)} · {c.courtName}{c.distanceKm != null ? ` · ${Number(c.distanceKm).toFixed(1)} km` : ''}</div>
        </div>
        <span className={`snx-badge snx-badge--${scoreTone(score)}`} title="Mức độ phù hợp">{score}% phù hợp</span>
      </div>
      <div className="snx-muted">
        Còn {c.remainingSlots}/{c.totalSlots} suất · {money(c.pricePerPerson)}/người{c.skillLevelTag ? ` · ${lfgSkillLabel(c.skillLevelTag)}` : ''} · Chủ kèo {c.hostName}
        {c.hostFairPlayScore != null ? ` (Fair Play ${c.hostFairPlayScore})` : ''}
      </div>
      {item.reasons?.length > 0 && (
        <div className="snx-row" style={{ gap: 6 }}>
          {(compact ? item.reasons.slice(0, 2) : item.reasons).map((reason) => <span key={reason} className="snx-chip" aria-pressed="true">{reason}</span>)}
        </div>
      )}
      <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => navigate(`/flash-claim?cardId=${encodeURIComponent(c.id)}`)}>
          {c.requireApproval ? 'Xin vào kèo' : 'Nhận suất'}
        </button>
      </div>
    </article>
  )
}

export default function RecommendedLfg() {
  const list = useApi(getRecommendedLfgs, [], { initialData: [] })
  const items = list.data || []
  return (
    <div className="snx-page">
      <PageHeader
        eyebrow="Ghép trận LFG"
        eyebrowIcon="auto_awesome"
        title="Kèo phù hợp với bạn"
        subtitle="Xếp theo mức độ phù hợp với môn, trình độ, lịch rảnh và khu vực bạn đã khai trong khảo sát người chơi."
      />
      <div className="snx-row" style={{ marginBottom: 12 }}>
        <Link className="snx-btn snx-btn--secondary snx-btn--sm" to="/onboarding">Cập nhật khảo sát người chơi</Link>
        <Link className="snx-btn snx-btn--ghost snx-btn--sm" to="/community">Xem tất cả kèo</Link>
        <span className="snx-spacer" />
        <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={list.refresh}>Làm mới</button>
      </div>
      {list.loading && <p className="snx-muted">Đang tìm kèo phù hợp…</p>}
      {list.error && <div className="snx-alert snx-alert--error">{list.error}</div>}
      {!list.loading && !list.error && items.length === 0 && (
        <div className="snx-empty"><span className="material-symbols-outlined">search_off</span>Chưa có kèo đang mở phù hợp với bạn. Thử mở kèo mới hoặc mở rộng khu vực / khung giờ trong khảo sát.</div>
      )}
      <div className="snx-grid snx-grid--2">
        {items.map((item) => <RecommendedLfgCard key={item.card?.id} item={item} />)}
      </div>
    </div>
  )
}
