// AiSuggestions.jsx — Thẻ gợi ý sân / kèo THẬT do Backend AI trả về (reply.facilities, reply.lfgCards)
// Mỗi ca là ca trống thật (courtSlotId); bấm ca để sang trang thanh toán /split-payment với đúng ca và đúng ngày.
import { formatVnd } from './aiBookingData.js'
import { vnClock, vnDayLabel } from './aiRealBooking.js'

const cardStyle = { marginTop: 8, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }
const chipStyle = { padding: '6px 10px', borderRadius: 10, border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#065F46', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }

export default function AiSuggestions({ facilities, lfgCards, onBookSlot, onOpenLfg }) {
  const courts = Array.isArray(facilities) ? facilities : []
  const cards = Array.isArray(lfgCards) ? lfgCards : []
  if (!courts.length && !cards.length) return null

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
              <button key={s.courtSlotId} type="button" style={chipStyle} onClick={() => onBookSlot(f, s)} title="Đặt ca này và chuyển sang thanh toán">
                {vnClock(s.startTime)} - {vnClock(s.endTime)} • {vnDayLabel(s.startTime).slice(0, 5)}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#047857' }}>
                  {s.courtName} • {formatVnd(s.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {cards.map((c) => (
        <div key={c.lfgCardId} style={cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>
            {c.sportName} tại {c.facilityName}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {vnClock(c.startTime)} - {vnClock(c.endTime)} {vnDayLabel(c.startTime)} • còn {c.remainingSlots} suất • {formatVnd(c.pricePerPerson)}/người
            {c.skillLevelTag ? ` • ${c.skillLevelTag}` : ''} • chủ kèo {c.hostName}
          </div>
          <button type="button" style={chipStyle} onClick={() => onOpenLfg(c)}>
            Xem kèo &amp; nhận suất
          </button>
        </div>
      ))}
    </div>
  )
}
