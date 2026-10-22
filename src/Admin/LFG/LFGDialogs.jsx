import { useState } from 'react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { cancelLfg } from '../../api/admin/lfgApi.js'
import { titleOf, shortId } from './lfgData.js'

const noop = () => {}

// POST /api/v1/admin/lfgs/{cardId}/cancel { reason, cancelBooking, bookingRefundPercentage }.
export default function CancelLfgDialog({ lfg, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [cancelBooking, setCancelBooking] = useState(false)
  const [refund, setRefund] = useState('100')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    const refundValue = Number(refund)
    if (!reason.trim()) return setError('Vui lòng nhập lý do hủy kèo.')
    if (cancelBooking && (!Number.isFinite(refundValue) || refundValue < 0 || refundValue > 100)) return setError('Tỉ lệ hoàn tiền phải từ 0 đến 100%.')
    setSubmitting(true); setError('')
    try {
      await cancelLfg(lfg.id, { reason: reason.trim(), cancelBooking, bookingRefundPercentage: refundValue })
      onDone(`Đã hủy kèo ${shortId(lfg.id)}${cancelBooking ? ` và đơn đặt sân (hoàn ${refundValue}%)` : ''}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Hủy kèo ghép trận" onClose={submitting ? noop : onClose}>
    <p>Hủy kèo {shortId(lfg.id)}: <strong>{titleOf(lfg)}</strong>? Người tham gia sẽ không thể chơi theo kèo này nữa.</p>
    <form className="users-form" noValidate onSubmit={submit}>
      <label>Lý do hủy<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Kèo vi phạm quy định cộng đồng…" required /></label>
      <label className="payments-review-check" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={cancelBooking} onChange={event => setCancelBooking(event.target.checked)} />Hủy luôn đơn đặt sân của kèo</label>
      {cancelBooking && <label>Tỉ lệ hoàn tiền đơn đặt sân (%)<input type="number" min="0" max="100" value={refund} onChange={event => setRefund(event.target.value)} /></label>}
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Giữ nguyên kèo</button><button className="users-button users-danger" disabled={submitting}>{submitting ? 'Đang hủy…' : 'Xác nhận hủy kèo'}</button></footer>
    </form>
  </DemoDialog>
}
