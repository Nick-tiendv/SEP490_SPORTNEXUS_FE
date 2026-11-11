import { useEffect, useState } from 'react'
import { getMyGivenRatings } from '../../api/player/reviewApi.js'

// Đánh giá Fair Play tôi đã chấm cho người chơi cùng: GET /api/v1/fair-play/my-given-ratings
const PAGE_SIZE = 10
const when = (v) => (v ? new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }) : '')
const clock = (v) => (v ? new Date(v).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }) : '')

export default function MyGivenRatings() {
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ page: 0, data: null, error: '' })

  useEffect(() => {
    let cancelled = false
    getMyGivenRatings(page, PAGE_SIZE)
      .then((data) => !cancelled && setState({ page, data, error: '' }))
      .catch((error) => !cancelled && setState({ page, data: null, error: error.message || 'Không tải được đánh giá đã viết.' }))
    return () => { cancelled = true }
  }, [page])

  const items = state.data?.items || []
  const totalPages = Math.max(1, Math.ceil((state.data?.totalItems || 0) / PAGE_SIZE))
  const loading = state.page !== page

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {state.error && <div className="snx-alert snx-alert--error" role="alert">{state.error}</div>}
      {loading && !state.data && <p style={{ textAlign: 'center', color: '#64748B' }}>Đang tải…</p>}
      {state.data && items.length === 0 && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px dashed #CBD5E1', padding: '32px', textAlign: 'center', color: '#64748B' }}>
          Bạn chưa đánh giá người chơi nào.
        </div>
      )}
      {items.map((r) => (
        <article key={r.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px 18px', opacity: loading ? 0.5 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {r.revieweeAvatarUrl
              ? <img src={r.revieweeAvatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              : <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{(r.revieweeName || '?').charAt(0)}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ color: '#0F172A' }}>{r.revieweeName || 'Người chơi'}</strong>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                {[r.sportName, r.facilityName && `${r.facilityName}${r.courtName ? ` – ${r.courtName}` : ''}`, r.startTime && `${clock(r.startTime)} – ${clock(r.endTime)} ${new Date(r.startTime).toLocaleDateString('vi-VN')}`, r.contextType === 'LFG' ? 'Kèo LFG' : r.contextType === 'BOOKING' ? 'Đặt sân' : null].filter(Boolean).join(' • ')}
              </div>
            </div>
            <span aria-label={`${r.score} sao`} style={{ color: '#EAB308', fontSize: '16px', whiteSpace: 'nowrap' }}>{'★'.repeat(r.score)}<span style={{ color: '#CBD5E1' }}>{'★'.repeat(Math.max(0, 5 - r.score))}</span></span>
          </div>
          {r.comment && <p style={{ margin: '10px 0 0', color: '#1F2937', fontSize: '14px' }}>{r.comment}</p>}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#94A3B8' }}>
            Đã chấm lúc {when(r.createdAt)}
            {r.isHidden && <span style={{ marginLeft: 8, color: '#B91C1C', fontWeight: 700 }}>• Đã bị Admin ẩn{r.hiddenReason ? `: ${r.hiddenReason}` : ''}</span>}
          </div>
        </article>
      ))}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Trước</button>
          <span style={{ fontSize: '13px', color: '#475569' }}>Trang {page}/{totalPages}</span>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Sau</button>
        </div>
      )}
    </div>
  )
}
