import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  cancelOwnerBooking,
  getCancellationReasons,
  getOwnerBooking,
  previewOwnerBookingCancel,
} from '../../api/owner'
import { formatDateTime, formatTime, formatVND } from '../shared.js'
import {
  buildOwnerCancelPenaltyPreview,
  formatOwnerCancelResultMessage,
} from './ownerCancelPenalty.js'

/**
 * Popup cảnh báo và xác nhận Chủ sân hủy đơn đặt sân.
 * Tự động gọi API Preview Hủy (nếu BE có); nếu BE trả lỗi (vd 400/404) tự kiểm tra mốc 48h
 * và hiển thị cảnh báo phạt tiền + trừ uy tín theo quy tắc trước khi gọi POST /cancel.
 */
export default function OwnerCancelBookingModal({ booking, onClose, onSuccess }) {
  const bookingId = booking?.bookingId ? String(booking.bookingId) : ''

  const [reasons, setReasons] = useState([])
  const [reasonCode, setReasonCode] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [lockSlotAfterCancel, setLockSlotAfterCancel] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Gắn kết quả preview với bookingId để không chớp dữ liệu cũ và tránh setState đồng bộ trong effect
  const [previewState, setPreviewState] = useState({
    bookingId: '',
    preview: null,
    detail: null,
    previewFallback: false,
  })

  useEffect(() => {
    let cancelled = false
    getCancellationReasons()
      .then((items) => {
        if (cancelled) return
        const list = Array.isArray(items) ? items : []
        setReasons(list)
        setReasonCode((prev) => prev || String(list[0]?.code ?? ''))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false

    const needDetail = booking?.totalAmount == null || booking?.startTime == null
    Promise.allSettled([
      previewOwnerBookingCancel(bookingId),
      needDetail ? getOwnerBooking(bookingId) : Promise.resolve(null),
    ]).then(([previewRes, detailRes]) => {
      if (cancelled) return
      const preview = previewRes.status === 'fulfilled' ? previewRes.value : null
      const detail = detailRes.status === 'fulfilled' ? detailRes.value : null
      setPreviewState({
        bookingId,
        preview,
        detail,
        previewFallback: previewRes.status === 'rejected' || !preview,
      })
    })

    return () => { cancelled = true }
  }, [bookingId, booking?.totalAmount, booking?.startTime])

  if (!bookingId) return null

  const loadingPreview = previewState.bookingId !== bookingId
  const resolvedDetail = loadingPreview ? null : previewState.detail
  const resolvedPreview = loadingPreview ? null : previewState.preview
  const previewFallback = loadingPreview ? false : previewState.previewFallback

  const startTime = resolvedDetail?.startTime ?? booking.startTime
  const endTime = resolvedDetail?.endTime ?? booking.endTime
  const totalAmount = resolvedDetail?.totalAmount ?? booking.totalAmount ?? booking.fallbackAmount
  const isWalkIn = resolvedDetail?.isWalkIn ?? booking.isWalkIn

  const penaltyInfo = buildOwnerCancelPenaltyPreview({
    startTime,
    totalAmount,
    isWalkIn,
    preview: resolvedPreview,
    previewFallback,
  })

  const pickedReason = reasons.find((item) => String(item.code) === String(reasonCode)) || null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (pickedReason?.isCustom && !reasonText.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn.')
      return
    }
    setSubmitting(true)
    try {
      const result = await cancelOwnerBooking(bookingId, {
        reasonCode: pickedReason ? pickedReason.code : null,
        reason: pickedReason?.isCustom
          ? reasonText.trim()
          : pickedReason?.label || reasonText.trim() || null,
        lockSlotAfterCancel,
      })
      toast.success(formatOwnerCancelResultMessage(result, formatVND))
      onSuccess?.(result)
      onClose?.()
    } catch (error) {
      toast.error(error?.message || 'Không thể hủy đơn đặt sân.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation" style={{ zIndex: 1100 }}>
      <div
        className="snx-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="owner-cancel-warning-title"
        style={{
          maxWidth: 480,
          border: penaltyInfo.hasPenalty ? '2px solid #EF4444' : '1px solid #CBD5E1',
        }}
      >
        <div className="snx-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: penaltyInfo.hasPenalty ? '#DC2626' : '#15803D',
              }}
            >
              {penaltyInfo.hasPenalty ? 'warning' : 'info'}
            </span>
            <div>
              <h2 id="owner-cancel-warning-title" className="snx-card-title" style={{ margin: 0 }}>
                Cảnh báo hủy đơn đặt sân
              </h2>
              <p className="snx-card-subtitle" style={{ margin: 0 }}>
                {[booking.courtName, booking.customerName, startTime && `${formatDateTime(startTime)}${endTime ? ` – ${formatTime(endTime)}` : ''}`]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="snx-btn snx-btn--ghost snx-btn--icon"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="snx-stack">
          {loadingPreview ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: 13,
                fontWeight: 600,
                color: '#475569',
              }}
            >
              Đang kiểm tra mức phạt hủy đơn…
            </div>
          ) : (
            <div
              role="alert"
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: penaltyInfo.hasPenalty ? '#FEF2F2' : '#ECFDF5',
                border: penaltyInfo.hasPenalty ? '1.5px solid #FCA5A5' : '1px solid #A7F3D0',
                color: penaltyInfo.hasPenalty ? '#991B1B' : '#065F46',
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>
                {penaltyInfo.warningMessage}
              </div>

              {penaltyInfo.hasPenalty && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#FFFFFF',
                      border: '1px solid #FECACA',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>
                      Tiền phạt dự kiến
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#B91C1C' }}>
                      {penaltyInfo.ownerPenaltyAmount != null
                        ? `${formatVND(penaltyInfo.ownerPenaltyAmount)} (${penaltyInfo.penaltyPercent}%)`
                        : `${penaltyInfo.penaltyPercent}% giá trị đơn`}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#FFFFFF',
                      border: '1px solid #FECACA',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>
                      Điểm uy tín (Fair Play)
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#B91C1C' }}>
                      {penaltyInfo.fairPlayDeducted > 0
                        ? `-${penaltyInfo.fairPlayDeducted} điểm`
                        : '0 điểm'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, fontWeight: 600 }}>
                Người đặt được hoàn 100% và nhận voucher 10%. Hủy dưới 48h phạt 20% + trừ 10 điểm Fair Play; từ 48h trở lên phạt 10%; đơn vãng lai tại quầy không phạt.
              </div>
              {previewFallback && (
                <div style={{ fontSize: 11.5, marginTop: 4, opacity: 0.85 }}>
                  (Hiển thị theo quy tắc 48h của hệ thống do API preview không khả dụng.)
                </div>
              )}
            </div>
          )}

          {reasons.length > 0 && (
            <div>
              <label
                htmlFor="owner-cancel-reason"
                style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}
              >
                Lý do hủy đơn:
              </label>
              <select
                id="owner-cancel-reason"
                className="snx-select"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
              >
                {reasons.map((reason) => (
                  <option key={reason.code} value={String(reason.code)}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(pickedReason?.isCustom || reasons.length === 0) && (
            <input
              type="text"
              className="snx-input"
              placeholder="Nhập lý do hủy đơn..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
            <input
              type="checkbox"
              checked={lockSlotAfterCancel}
              onChange={(e) => setLockSlotAfterCancel(e.target.checked)}
            />
            Khóa ca này để bảo trì sau khi hủy
          </label>

          <div className="snx-modal-foot" style={{ padding: 0, borderTop: 'none' }}>
            <button
              type="button"
              className="snx-btn snx-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="snx-btn snx-btn--danger"
              disabled={submitting || loadingPreview}
            >
              {submitting ? 'Đang hủy...' : penaltyInfo.hasPenalty ? 'Chấp nhận phạt & Hủy đơn' : 'Xác nhận hủy đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
