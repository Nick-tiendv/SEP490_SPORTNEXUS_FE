// AiSuggestions.jsx — Thẻ gợi ý sân / kèo / giải THẬT do Backend AI trả về (reply.facilities, reply.lfgCards, reply.tournaments)
// Mỗi ca là ca trống thật (courtSlotId):
// - Tìm sân: "Đặt ca này" → POST /api/v1/ai/messages/{messageId}/book (trừ ví, gửi vé QR) hoặc sang /split-payment để xem chi tiết.
// - Ý định CREATE_LFG: "Mở kèo ở ca này" → POST /api/v1/ai/messages/{messageId}/lfg (cần slotsNeeded; intent.slotsNeeded null thì hỏi người dùng).
import { useState } from 'react'
import { toast } from 'sonner'
import { formatVnd } from './aiBookingData.js'
import { vnClock, vnDayLabel } from './aiRealBooking.js'
import { LFG_SKILL_TAGS, lfgSkillLabel } from '../../../api/player/lfgApi.js'
import { confirmAiBooking, confirmAiLfg } from '../../../api/player/aiApi.js'

const cardStyle = { marginTop: 8, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }
const chipStyle = { padding: '6px 10px', borderRadius: 10, border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#065F46', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }
const activeChip = { ...chipStyle, border: '2px solid #059669', background: '#D1FAE5' }
const primaryBtn = { padding: '7px 12px', borderRadius: 10, border: 'none', background: '#15803D', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }
const ghostBtn = { padding: '7px 12px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
const inputStyle = { padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12 }
const TIER_TEXT = { AMATEUR: 'Phong trào', SEMI_PRO: 'Bán chuyên', PRO: 'Chuyên nghiệp' }
const isGuid = value => /^[0-9a-f-]{36}$/i.test(String(value || ''))

function SlotAction({ facility, slot, messageId, intent, onBookSlot, onDone }) {
  const createLfg = String(intent?.intent || '').toUpperCase() === 'CREATE_LFG'
  const [slotsNeeded, setSlotsNeeded] = useState(intent?.slotsNeeded ? String(intent.slotsNeeded) : '')
  const [skill, setSkill] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const canConfirm = isGuid(messageId)

  const book = async () => {
    setBusy(true)
    try {
      await confirmAiBooking(messageId, slot.courtSlotId)
      toast.success('Đặt sân thành công! Vé QR đã được gửi (kiểm tra email).')
      window.dispatchEvent(new Event('escrow_balance_updated'))
      onDone?.('booking')
    } catch (error) {
      toast.error(error?.message || 'Không đặt được ca này.')
    } finally {
      setBusy(false)
    }
  }
  const openLfg = async () => {
    const needed = Number(slotsNeeded)
    if (!Number.isInteger(needed) || needed < 1) { toast.error('Bạn cần tìm thêm bao nhiêu người?'); return }
    setBusy(true)
    try {
      await confirmAiLfg(messageId, { courtSlotId: slot.courtSlotId, slotsNeeded: needed, skillLevelTag: skill || null, description: description.trim() || null })
      toast.success('Đã mở kèo! Hệ thống báo cho những người chơi phù hợp.')
      window.dispatchEvent(new Event('escrow_balance_updated'))
      onDone?.('lfg')
    } catch (error) {
      toast.error(error?.message || 'Không mở được kèo ở ca này.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginTop: 8, padding: 8, borderRadius: 10, background: '#F9FAFB', border: '1px dashed #D1D5DB', display: 'grid', gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
        {slot.courtName} • {vnClock(slot.startTime)} - {vnClock(slot.endTime)} {vnDayLabel(slot.startTime)} • {formatVnd(slot.price)}
      </div>
      {createLfg ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <input style={{ ...inputStyle, width: 120 }} type="number" min={1} max={20} placeholder="Cần thêm (người)" value={slotsNeeded} onChange={e => setSlotsNeeded(e.target.value)} aria-label="Số người cần tìm thêm" />
            <select style={inputStyle} value={skill} onChange={e => setSkill(e.target.value)} aria-label="Trình độ">
              <option value="">Mọi trình độ</option>
              {LFG_SKILL_TAGS.map(tag => <option key={tag} value={tag}>{lfgSkillLabel(tag)}</option>)}
            </select>
            <input style={{ ...inputStyle, flex: '1 1 140px' }} maxLength={300} placeholder="Ghi chú (không bắt buộc)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" style={primaryBtn} disabled={busy || !canConfirm} onClick={openLfg}>{busy ? 'Đang mở kèo…' : 'Mở kèo ở ca này'}</button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {canConfirm && <button type="button" style={primaryBtn} disabled={busy} onClick={book}>{busy ? 'Đang đặt…' : 'Đặt ca này (trừ ví)'}</button>}
          <button type="button" style={ghostBtn} disabled={busy} onClick={() => onBookSlot(facility, slot)}>Xem chi tiết & thanh toán</button>
        </div>
      )}
    </div>
  )
}

export default function AiSuggestions({ facilities, lfgCards, tournaments, messageId, intent, onBookSlot, onOpenLfg, onOpenTournament, onDone }) {
  const courts = Array.isArray(facilities) ? facilities : []
  const cards = Array.isArray(lfgCards) ? lfgCards : []
  const events = Array.isArray(tournaments) ? tournaments : []
  const [picked, setPicked] = useState(null) // courtSlotId đang chọn
  if (!courts.length && !cards.length && !events.length) return null
  const createLfg = String(intent?.intent || '').toUpperCase() === 'CREATE_LFG'

  return (
    <div className="snx-ai-real-suggestions">
      {courts.map((f) => (
        <div key={f.facilityId} style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>{f.facilityName}</div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {f.sportName}
            {f.address ? ` • ${f.address}` : ''}
            {f.distanceKm != null ? ` • ${Number(f.distanceKm).toFixed(1)} km` : ''} • từ {formatVnd(f.minPrice)}/giờ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(f.slots || []).map((s) => (
              <button key={s.courtSlotId} type="button" style={picked === s.courtSlotId ? activeChip : chipStyle}
                onClick={() => setPicked(picked === s.courtSlotId ? null : s.courtSlotId)}
                title={createLfg ? 'Mở kèo ở ca này' : 'Đặt ca này'}>
                {vnClock(s.startTime)} - {vnClock(s.endTime)} • {vnDayLabel(s.startTime).slice(0, 5)}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#047857' }}>
                  {s.courtName} • {formatVnd(s.price)}
                </span>
              </button>
            ))}
          </div>
          {(f.slots || []).filter((s) => s.courtSlotId === picked).map((s) => (
            <SlotAction key={s.courtSlotId} facility={f} slot={s} messageId={messageId} intent={intent} onBookSlot={onBookSlot} onDone={onDone} />
          ))}
        </div>
      ))}
      {cards.map((c) => (
        <div key={c.lfgCardId} style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>
            {c.sportName} tại {c.facilityName}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {vnClock(c.startTime)} - {vnClock(c.endTime)} {vnDayLabel(c.startTime)} • còn {c.remainingSlots} suất • {formatVnd(c.pricePerPerson)}/người
            {c.skillLevelTag ? ` • ${lfgSkillLabel(c.skillLevelTag)}` : ''} • chủ kèo {c.hostName}
          </div>
          <button type="button" style={chipStyle} onClick={() => onOpenLfg(c)}>
            Xem kèo &amp; nhận suất
          </button>
        </div>
      ))}
      {events.map((t) => (
        <div key={t.tournamentId} style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>🏆 {t.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {[t.sportName, t.facilityName, TIER_TEXT[String(t.tier || '').toUpperCase()],
              t.startDate && `Khai mạc ${new Date(t.startDate).toLocaleDateString('vi-VN')}`,
              t.registrationDeadline && `Hạn đăng ký ${new Date(t.registrationDeadline).toLocaleDateString('vi-VN')}`,
              `Lệ phí từ ${formatVnd(t.minEntryFee)}`].filter(Boolean).join(' • ')}
          </div>
          {onOpenTournament && (
            <button type="button" style={chipStyle} onClick={() => onOpenTournament(t)}>Xem giải &amp; đăng ký</button>
          )}
        </div>
      ))}
    </div>
  )
}
