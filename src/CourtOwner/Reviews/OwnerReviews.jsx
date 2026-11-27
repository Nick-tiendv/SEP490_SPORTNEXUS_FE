import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { deleteReviewReply, getOwnerReviewStats, getOwnerReviews, getReviewReportReasons, replyReview, reportReview, updateReviewReply } from '../../api/owner'
import { uploadImage } from '../../api/player/uploadApi.js'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { formatDateTime } from '../shared.js'

const PAGE_SIZE = 10
const Stars = ({ value }) => (
  <span aria-label={`${value} sao`} style={{ color: '#f59e0b', letterSpacing: 1 }}>
    {'★'.repeat(Math.round(value) || 0)}<span style={{ color: '#d6dcda' }}>{'★'.repeat(5 - (Math.round(value) || 0))}</span>
  </span>
)

// Báo cáo đánh giá lên Admin (POST /reports, targetType FACILITY_REVIEW). Admin xác nhận thì đánh giá bị ẩn.
function ReportReviewModal({ review, onClose }) {
  const reasons = useApi(getReviewReportReasons, [], { initialData: [] })
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const reasonCode = reason || reasons.data[0]?.code || ''

  const addImages = async (files) => {
    const list = [...files].slice(0, 5 - evidence.length)
    if (!list.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(list.map((file) => uploadImage(file, 'report')))
      setEvidence((prev) => [...prev, ...urls.filter(Boolean)])
    } catch (error) {
      toast.error(error.message || 'Không tải được ảnh.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!reasonCode) { toast.error('Vui lòng chọn lý do báo cáo.'); return }
    if (!description.trim()) { toast.error('Vui lòng mô tả vấn đề của đánh giá.'); return }
    setBusy(true)
    try {
      await reportReview(review.id, { reason: reasonCode, description: description.trim(), evidenceImageUrls: evidence })
      toast.success('Đã gửi báo cáo, Admin sẽ xem xét. Theo dõi ở mục Khiếu nại.')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="report-review-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="report-review-title" className="snx-card-title">Báo cáo đánh giá</h2>
            <p className="snx-card-subtitle">Đánh giá của {review.userFullName || 'khách'} • {review.facilityName}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack" style={{ gap: 10 }}>
          {reasons.error && <div className="snx-alert snx-alert--error">{reasons.error}</div>}
          <label className="snx-field">Lý do
            <select className="snx-select" value={reasonCode} onChange={(e) => setReason(e.target.value)} disabled={!reasons.data.length}>
              {reasons.data.map((r) => <option key={r.code} value={r.code}>{r.title || r.label || r.code}</option>)}
            </select>
          </label>
          <label className="snx-field">Mô tả
            <textarea className="snx-textarea" rows={3} maxLength={2000} placeholder="VD: Khách chưa từng đến sân" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="snx-row">
            <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_photo_alternate</span>{uploading ? 'Đang tải…' : 'Thêm ảnh bằng chứng'}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading || evidence.length >= 5} onChange={(e) => { addImages(e.target.files); e.target.value = '' }} />
            </label>
            <span className="snx-muted">{evidence.length}/5 ảnh</span>
          </div>
          {evidence.length > 0 && (
            <div className="snx-thumb-grid">
              {evidence.map((url) => (
                <div key={url} className="snx-thumb"><img src={url} alt="Bằng chứng" />
                  <div className="snx-thumb-actions"><button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => setEvidence((prev) => prev.filter((u) => u !== url))}>Bỏ</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--danger" disabled={busy || uploading || !reasonCode}>{busy ? 'Đang gửi…' : 'Gửi báo cáo'}</button>
        </div>
      </form>
    </div>
  )
}

function ReviewItem({ review, onChanged }) {
  const [reporting, setReporting] = useState(false)
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
            {!review.isHidden && (
              <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setReporting(true)} title="Báo cáo đánh giá sai sự thật / xúc phạm">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>flag</span>Báo cáo
              </button>
            )}
          </div>
          {reporting && <ReportReviewModal review={review} onClose={() => setReporting(false)} />}
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
