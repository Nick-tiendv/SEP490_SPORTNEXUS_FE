import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { deleteReviewReply, getOwnerReviewStats, getOwnerReviews, replyReview, updateReviewReply } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { formatDateTime } from '../shared.js'

const PAGE_SIZE = 10
const Stars = ({ value }) => (
  <span aria-label={`${value} sao`} style={{ color: '#f59e0b', letterSpacing: 1 }}>
    {'★'.repeat(Math.round(value) || 0)}<span style={{ color: '#d6dcda' }}>{'★'.repeat(5 - (Math.round(value) || 0))}</span>
  </span>
)

function ReviewItem({ review, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(review.ownerReply || '')
  const [busy, setBusy] = useState(false)
  const hasReply = !!review.ownerReply

  const save = async () => {
    if (!text.trim()) { toast.error('Vui lòng nhập nội dung phản hồi.'); return }
    setBusy(true)
    try {
      await (hasReply ? updateReviewReply(review.id, text.trim()) : replyReview(review.id, text.trim()))
      toast.success(hasReply ? 'Đã sửa phản hồi.' : 'Đã gửi phản hồi.')
      setEditing(false)
      onChanged()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (!(await confirmDialog('Xóa phản hồi này? Đánh giá của khách vẫn được giữ lại.'))) return
    setBusy(true)
    try {
      await deleteReviewReply(review.id)
      toast.success('Đã xóa phản hồi.')
      setText('')
      onChanged()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="snx-card" style={{ padding: 16 }}>
      <div className="snx-row" style={{ alignItems: 'flex-start' }}>
        <span className="snx-avatar-sm">{review.userAvatarUrl ? <img src={review.userAvatarUrl} alt="" /> : (review.userFullName || '?').slice(0, 1)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="snx-row">
            <strong>{review.userFullName || 'Khách'}</strong>
            <Stars value={review.rating} />
            {review.isHidden && <span className="snx-badge snx-badge--gray" title={review.hiddenReason || ''}>Đã bị ẩn</span>}
            <span className="snx-spacer" />
            <span className="snx-muted">{formatDateTime(review.createdAt)}</span>
          </div>
          <div className="snx-muted">{review.facilityName}</div>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{review.comment || <em className="snx-muted">Khách không để lại bình luận.</em>}</p>

          {hasReply && !editing && (
            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#f1f7f3' }}>
              <div className="snx-row">
                <strong style={{ fontSize: 13 }}>Phản hồi của bạn</strong>
                <span className="snx-muted">{formatDateTime(review.repliedAt)}</span>
                <span className="snx-spacer" />
                <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" disabled={busy} onClick={() => { setText(review.ownerReply); setEditing(true) }}>Sửa</button>
                <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" disabled={busy} onClick={remove}>Xóa</button>
              </div>
              <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{review.ownerReply}</p>
            </div>
          )}
          {(!hasReply || editing) && (
            <div className="snx-stack" style={{ gap: 8, marginTop: 10 }}>
              <textarea className="snx-textarea" rows={2} maxLength={1000} placeholder="Cảm ơn khách hoặc giải thích vấn đề…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Nội dung phản hồi" />
              <div className="snx-row">
                <span className="snx-spacer" />
                {editing && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setEditing(false)}>Hủy</button>}
                <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busy} onClick={save}>{hasReply ? 'Lưu phản hồi' : 'Gửi phản hồi'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function OwnerReviews() {
  const { facilities } = useOwnerContext()
  const [facilityId, setFacilityId] = useState('')
  const [rating, setRating] = useState('')
  const [replied, setReplied] = useState('')
  const [page, setPage] = useState(1)

  const stats = useApi(() => getOwnerReviewStats(facilityId || undefined), [facilityId])
  const list = useApi(
    () => getOwnerReviews({ facilityId, rating, replied, page, pageSize: PAGE_SIZE }),
    [facilityId, rating, replied, page],
    { initialData: { items: [], total: 0, totalPages: 0 } },
  )
  const refreshAll = () => { stats.refresh(); list.refresh() }
  const s = stats.data || {}
  const dist = s.ratingDistribution || {}
  const totalPages = list.data?.totalPages || Math.ceil((list.data?.total || 0) / PAGE_SIZE) || 1
  const setFilter = (setter) => (e) => { setter(e.target.value); setPage(1) }

  return (
    <div className="snx-stack">
      <PageHeader eyebrow="Khách hàng" eyebrowIcon="reviews" title="Đánh giá của khách" subtitle="Xem đánh giá về các cơ sở của bạn và phản hồi để giữ uy tín." />

      {stats.error && <div className="snx-alert snx-alert--error">{stats.error}</div>}
      <div className="snx-stats">
        <div className="snx-stat"><div className="snx-stat-label">Điểm trung bình</div><div className="snx-stat-value">{s.averageRating != null ? Number(s.averageRating).toFixed(1) : '—'} <span style={{ fontSize: 14 }}>/ 5</span></div></div>
        <div className="snx-stat"><div className="snx-stat-label">Tổng đánh giá</div><div className="snx-stat-value">{s.totalReviews ?? '—'}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Chưa phản hồi</div><div className="snx-stat-value">{s.unrepliedCount ?? '—'}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Tỉ lệ phản hồi</div><div className="snx-stat-value">{s.replyRate != null ? `${Math.round(Number(s.replyRate) <= 1 ? s.replyRate * 100 : s.replyRate)}%` : '—'}</div></div>
        <div className="snx-stat"><div className="snx-stat-label">Mới trong 30 ngày</div><div className="snx-stat-value">{s.newReviewsLast30Days ?? '—'}</div></div>
      </div>

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Phân bố số sao</h2>
        </div>
        <div className="snx-stack" style={{ gap: 6 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(dist[star] ?? dist[String(star)] ?? 0)
            const pct = s.totalReviews ? Math.round((count / s.totalReviews) * 100) : 0
            return (
              <div key={star} className="snx-row" style={{ flexWrap: 'nowrap' }}>
                <span style={{ width: 36, fontSize: 13 }}>{star} ★</span>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#eef2f1', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b' }} /></div>
                <span className="snx-muted" style={{ width: 48, textAlign: 'right' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="snx-row">
        <select className="snx-select" style={{ width: 'auto' }} value={facilityId} onChange={setFilter(setFacilityId)} aria-label="Lọc theo cơ sở">
          <option value="">Tất cả cơ sở</option>
          {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="snx-select" style={{ width: 'auto' }} value={rating} onChange={setFilter(setRating)} aria-label="Lọc theo số sao">
          <option value="">Mọi số sao</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}
        </select>
        <select className="snx-select" style={{ width: 'auto' }} value={replied} onChange={setFilter(setReplied)} aria-label="Lọc theo phản hồi">
          <option value="">Tất cả</option>
          <option value="false">Chưa phản hồi</option>
          <option value="true">Đã phản hồi</option>
        </select>
      </div>

      {list.error && <div className="snx-alert snx-alert--error">{list.error}</div>}
      {list.loading && !list.data.items.length ? (
        <p className="snx-muted">Đang tải đánh giá…</p>
      ) : list.data.items.length === 0 ? (
        <div className="snx-empty"><span className="material-symbols-outlined">rate_review</span>Chưa có đánh giá nào phù hợp.</div>
      ) : (
        <div className="snx-stack" style={{ gap: 12 }}>
          {list.data.items.map((review) => <ReviewItem key={`${review.id}|${review.ownerReply || ''}`} review={review} onChanged={refreshAll} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="snx-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <span className="snx-muted">Trang {page} / {totalPages}</span>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      )}
    </div>
  )
}
