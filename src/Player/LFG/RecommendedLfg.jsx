import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { getRecommendedLfgs } from '../../api/player/recommendationApi.js'
import { lfgSkillLabel } from '../../api/player/lfgApi.js'

// "Kèo phù hợp với bạn": GET /api/v1/lfgs/recommended → [{ card, score (0–100), reasons[] }]
// Điểm phù hợp tính theo khảo sát người chơi (môn, trình độ, lịch rảnh, khu vực, nội dung hay chơi) và hành vi.
// Nhúng trong trang Ghép trận LFG (/community), Bảng tin cộng đồng (/feed) và trang chủ — không có trang riêng.
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

// Khối gợi ý ở đầu tab "Sàn Ghép Trận" (/community): 3 kèo hợp nhất, bấm "Xem thêm" để hiện hết.
// Ẩn hẳn khi lỗi hoặc không có kèo phù hợp để không chiếm chỗ của danh sách kèo.
export function RecommendedLfgSection() {
  const list = useApi(getRecommendedLfgs, [], { initialData: [] })
  const [expanded, setExpanded] = useState(false)
  const items = list.error ? [] : list.data || []
  if (list.loading || !items.length) return null
  const shown = expanded ? items : items.slice(0, 3)
  return (
    <section className="snx-card snx-stack" style={{ gap: 12, padding: 18, border: '1px solid #C6E7BE', background: '#F6FBF4' }} aria-labelledby="recommended-lfg-title">
      <div className="snx-row">
        <div>
          <h2 id="recommended-lfg-title" className="snx-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
            <span className="material-symbols-outlined" style={{ color: '#15803d' }}>auto_awesome</span>Kèo phù hợp với bạn
          </h2>
          <p className="snx-card-subtitle">Theo môn, trình độ, lịch rảnh và khu vực trong khảo sát của bạn. <Link to="/onboarding">Cập nhật khảo sát</Link></p>
        </div>
      </div>
      <div className="snx-grid snx-grid--3">
        {shown.map((item) => <RecommendedLfgCard key={item.card?.id} item={item} compact />)}
      </div>
      {items.length > 3 && (
        <div className="snx-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Thu gọn' : `Xem thêm ${items.length - 3} kèo phù hợp`}
          </button>
        </div>
      )}
    </section>
  )
}

// Khung nhỏ ở cột bên của Bảng tin cộng đồng (/feed): 3 kèo hợp nhất, dạng danh sách gọn.
export function RecommendedLfgWidget() {
  const navigate = useNavigate()
  const list = useApi(getRecommendedLfgs, [], { initialData: [] })
  const items = (list.error ? [] : list.data || []).slice(0, 3)
  if (list.loading || !items.length) return null
  return (
    <section className="snx-card snx-stack" style={{ gap: 10 }}>
      <h2 className="snx-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
        <span className="material-symbols-outlined" style={{ color: '#15803d' }}>auto_awesome</span>Kèo phù hợp với bạn
      </h2>
      <div className="snx-list">
        {items.map(({ card: c = {}, score, reasons }) => (
          <button key={c.id} type="button" className="snx-list-item" style={{ border: 0, borderBottom: '1px solid #eef2f1', background: 'transparent', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start' }}
            onClick={() => navigate(`/flash-claim?cardId=${encodeURIComponent(c.id)}`)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 13.5 }}>{c.sportName} · {c.facilityName}</strong>
              <div className="snx-muted">{when(c.startTime, c.endTime)} · còn {c.remainingSlots} suất</div>
              {reasons?.[0] && <div style={{ fontSize: 12, color: '#15803d' }}>{reasons[0]}</div>}
            </div>
            <span className={`snx-badge snx-badge--${scoreTone(Math.round(Number(score) || 0))}`}>{Math.round(Number(score) || 0)}%</span>
          </button>
        ))}
      </div>
      <Link className="snx-btn snx-btn--secondary snx-btn--sm" to="/community">Xem trên sàn ghép trận</Link>
    </section>
  )
}
