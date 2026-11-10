import { useEffect, useState } from 'react'
import { getLfgById, lfgSkillLabel } from '../../api/player/lfgApi.js'
import { vnClock } from '../../utils/vnTime.js'

// Chi tiết một kèo LFG (GET /api/v1/lfgs/{cardId}): thông tin sân, giờ, giá, trạng thái và người tham gia.
// Chủ kèo thấy cả người đang chờ duyệt / đã rời; người khác chỉ thấy người đã vào kèo (theo BE).

const formatVnd = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)} đ`
const dateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—')
const dateTimeVN = (value) => (value ? `${vnClock(value)} ${dateVN(value)}` : '—')

const CARD_STATUS = {
  PENDING: { label: 'Đang tuyển', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OPEN: { label: 'Đang tuyển', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FILLED: { label: 'Đã đủ người', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
}
const PARTICIPANT_STATUS = {
  PENDING: 'Chờ duyệt',
  ACCEPTED: 'Đã vào kèo',
  REJECTED: 'Bị từ chối',
  LEFT: 'Đã rời kèo',
  REMOVED: 'Bị loại',
  CANCELLED: 'Đã hủy',
}
const PAYMENT_STATUS = {
  PENDING: 'Chưa trừ tiền',
  HELD: 'Đang tạm giữ',
  RELEASED: 'Đã chuyển cho chủ kèo',
  REFUNDED: 'Đã hoàn tiền',
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 font-semibold shrink-0">{label}</span>
      <span className="text-[#111827] font-bold text-right">{children}</span>
    </div>
  )
}

export default function LfgDetailModal({ cardId, onClose }) {
  const [result, setResult] = useState(null) // { id, data, error }
  useEffect(() => {
    let cancelled = false
    getLfgById(cardId)
      .then((data) => { if (!cancelled) setResult({ id: cardId, data, error: '' }) })
      .catch((error) => { if (!cancelled) setResult({ id: cardId, data: null, error: error?.message || 'Không tải được chi tiết kèo.' }) })
    return () => { cancelled = true }
  }, [cardId])

  const loading = result?.id !== cardId
  const card = loading ? null : result.data
  const error = loading ? '' : result.error
  const status = CARD_STATUS[String(card?.status || '').toUpperCase()]
  const participants = Array.isArray(card?.participants) ? card.participants : []
  const sideSize = Number(card?.sideSize) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 flex flex-col gap-4" role="dialog" aria-modal="true" aria-labelledby="lfg-detail-title">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#15803D] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">info</span>
            </div>
            <h3 id="lfg-detail-title" className="font-black text-base text-[#111827]">Chi tiết kèo ghép</h3>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Đang tải chi tiết kèo…</p>
        ) : error ? (
          <p className="text-sm text-red-600 font-semibold text-center py-8">{error}</p>
        ) : card ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase text-[#15803D] tracking-wider">{card.sportName || 'Kèo ghép'}</p>
                <p className="font-black text-[#111827] text-base leading-snug">{card.description || `Kèo ${card.sportName || 'ghép trận'}`}</p>
              </div>
              {status && <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black border ${status.className}`}>{status.label}</span>}
            </div>

            {card.status === 'CANCELLED' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                Kèo đã hủy lúc {dateTimeVN(card.cancelledAt)}{card.cancelReason ? `. Lý do: ${card.cancelReason}` : ''}
              </div>
            )}

            <div className="text-xs bg-[#FAFBF9] rounded-xl p-3 border border-gray-100">
              <Row label="Sân">{[card.courtName, card.facilityName].filter(Boolean).join(' • ') || '—'}</Row>
              <Row label="Địa chỉ">{card.facilityAddress || '—'}</Row>
              <Row label="Giờ chơi">{card.startTime ? `${vnClock(card.startTime)} - ${vnClock(card.endTime)}, ${dateVN(card.startTime)}` : '—'}</Row>
              <Row label="Chủ kèo">{card.hostName || '—'}{card.hostFairPlayScore != null ? ` (Fair Play ${card.hostFairPlayScore})` : ''}</Row>
              <Row label="Trình độ">{lfgSkillLabel(card.skillLevelTag) || 'Mọi trình độ'}</Row>
              <Row label="Thể thức">{sideSize > 0 ? `${sideSize} vs ${sideSize}` : 'Giao lưu'}</Row>
              <Row label="Số người">{card.totalSlots != null ? `Cần ${card.totalSlots} • còn ${card.remainingSlots ?? '—'} suất` : '—'}</Row>
              <Row label="Giá mỗi người">{card.pricePerPerson != null ? formatVnd(card.pricePerPerson) : '—'}</Row>
              {card.bookingTotalAmount != null && <Row label="Tiền sân">{formatVnd(card.bookingTotalAmount)}</Row>}
              <Row label="Duyệt người tham gia">{card.requireApproval ? 'Cần chủ kèo duyệt' : 'Vào kèo ngay'}</Row>
              <Row label="Tạo lúc">{dateTimeVN(card.createdAt)}</Row>
            </div>

            <div>
              <p className="text-xs font-black text-gray-700 mb-2">
                Người tham gia ({card.acceptedCount ?? participants.filter((p) => String(p.status).toUpperCase() === 'ACCEPTED').length} đã vào
                {card.pendingCount ? `, ${card.pendingCount} chờ duyệt` : ''})
              </p>
              {participants.length === 0 ? (
                <p className="text-xs text-gray-500">Chưa có người tham gia.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {participants.map((p) => {
                    const st = String(p.status || '').toUpperCase()
                    return (
                      <li key={p.userId} className={`flex items-center justify-between gap-2 text-xs p-2 rounded-lg border ${st === 'ACCEPTED' ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100 bg-gray-50 opacity-80'}`}>
                        <span className="font-bold text-[#111827]">{p.fullName || 'Người chơi'}</span>
                        <span className="text-gray-600 text-right">
                          {PARTICIPANT_STATUS[st] || st || '—'}
                          {p.paymentStatus ? ` • ${PAYMENT_STATUS[String(p.paymentStatus).toUpperCase()] || p.paymentStatus}` : ''}
                          {p.isCheckedIn ? ' • Đã check-in' : ''}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        ) : null}

        <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#3B6817] hover:bg-[#315613] text-white text-xs font-bold cursor-pointer">
          Đóng
        </button>
      </div>
    </div>
  )
}
