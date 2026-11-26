// AiSuggestions.jsx — Thẻ gợi ý sân / kèo / giải THẬT do Backend AI trả về (reply.facilities, reply.lfgCards, reply.tournaments)
// Mỗi ca là ca trống thật (courtSlotId):
// - Tìm sân: "Đặt ca này" → POST /api/v1/ai/messages/{messageId}/book (trừ ví, gửi vé QR) hoặc sang /split-payment để xem chi tiết.
// - Ý định CREATE_LFG: "Mở kèo ở ca này" → POST /api/v1/ai/messages/{messageId}/lfg (cần slotsNeeded; intent.slotsNeeded null thì hỏi người dùng).
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatVnd } from './aiBookingData.js'
import { bookingTotalOf, isSplitBookingResult, vnClock, vnDayLabel } from './aiRealBooking.js'
import { LFG_SKILL_TAGS, lfgSkillLabel } from '../../../api/player/lfgApi.js'
import { confirmAiBooking, confirmAiLfg } from '../../../api/player/aiApi.js'
import { getWalletVouchers, VOUCHER_STATUS } from '../../../api/player/walletApi.js'
import { lookupAccountByPhone } from '../../../api/player/bookingApi.js'

const cardStyle = { marginTop: 8, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }
const chipStyle = { padding: '6px 10px', borderRadius: 10, border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#065F46', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }
const activeChip = { ...chipStyle, border: '2px solid #059669', background: '#D1FAE5' }
// Ca / kèo / giải BE báo isAvailable = false (tính lại khi tải lịch sử): làm mờ, không bấm được
const goneChip = { ...chipStyle, opacity: 0.5, cursor: 'not-allowed', textDecoration: 'line-through', border: '1px solid #D1D5DB', background: '#F3F4F6', color: '#6B7280' }
const goneCard = { ...cardStyle, opacity: 0.6 }
const isGone = (item) => item?.isAvailable === false
const primaryBtn = { padding: '7px 12px', borderRadius: 10, border: 'none', background: '#15803D', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }
const ghostBtn = { padding: '7px 12px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
const inputStyle = { padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12 }
const TIER_TEXT = { AMATEUR: 'Phong trào', SEMI_PRO: 'Bán chuyên', PRO: 'Chuyên nghiệp' }
const isGuid = value => /^[0-9a-f-]{36}$/i.test(String(value || ''))

const MAX_SLOT_CHIPS = 6 // mỗi card sân hiện tối đa 6 ca (mục 5.2)
const MAX_CONSECUTIVE = 8
const MAX_SPLIT_FRIENDS = 7 // tối đa 8 người / đơn (giống trang thanh toán)

// Xác nhận đặt sân từ gợi ý AI (FE_AI_CHATBOT_CAP_NHAT_26-11, mục 3.4): số ca liên tiếp, voucher, chia tiền
function BookingForm({ facility, slot, messageId, onBookSlot, onDone, onRefresh }) {
  const [numberOfSlots, setNumberOfSlots] = useState(1)
  const [vouchers, setVouchers] = useState({ loaded: false, items: [], error: '' })
  const [voucherId, setVoucherId] = useState('')
  const [split, setSplit] = useState(false)
  const [friends, setFriends] = useState([])
  const [phone, setPhone] = useState('')
  const [looking, setLooking] = useState(false)
  const [busy, setBusy] = useState(false)
  const canConfirm = isGuid(messageId)

  // Voucher còn dùng được (GET /api/v1/wallet/vouchers?status=ACTIVE), lọc như trang thanh toán
  useEffect(() => {
    if (!canConfirm) return undefined
    let cancelled = false
    getWalletVouchers({ status: 'ACTIVE' })
      .then((items) => {
        if (cancelled) return
        const now = Date.now()
        setVouchers({
          loaded: true,
          error: '',
          items: items.filter((v) => v.id && v.status === VOUCHER_STATUS.AVAILABLE && Number(v.discountPercent) > 0 &&
            (!v.expiresAt || Number.isNaN(Date.parse(v.expiresAt)) || Date.parse(v.expiresAt) > now)),
        })
      })
      .catch((err) => { if (!cancelled) setVouchers({ loaded: true, items: [], error: err?.message || 'Không tải được voucher.' }) })
    return () => { cancelled = true }
  }, [canConfirm])

  // Giá dự kiến: các ca liên tiếp coi như cùng giá ca gốc; BE tính giá chính thức lúc đặt
  const slotMs = new Date(slot.endTime) - new Date(slot.startTime)
  const endAt = new Date(new Date(slot.endTime).getTime() + (numberOfSlots - 1) * slotMs).toISOString()
  const voucher = vouchers.items.find((v) => v.id === voucherId) || null
  const estimate = Number(slot.price) * numberOfSlots
  const estimateAfterVoucher = voucher ? Math.max(0, estimate - Math.round((estimate * Number(voucher.discountPercent)) / 100)) : estimate

  const toggleSplit = (on) => {
    setSplit(on)
    // BE không cho dùng voucher với đơn chia tiền
    if (on && voucherId) {
      setVoucherId('')
      toast.info('Voucher không áp dụng cho đơn chia tiền, đã bỏ chọn voucher.')
    }
  }

  const addFriend = async () => {
    const clean = phone.replace(/[\s.-]/g, '')
    if (!/^(0|\+84)[0-9]{9}$/.test(clean)) { toast.error('Số điện thoại phải gồm 10 chữ số (ví dụ: 0912345678).'); return }
    if (friends.length >= MAX_SPLIT_FRIENDS) { toast.warning('Tối đa 8 người cùng thanh toán cho 1 đơn đặt sân.'); return }
    setLooking(true)
    try {
      const data = await lookupAccountByPhone(clean)
      const id = data?.id || data?.userId
      if (!id) { toast.error('Không tìm thấy tài khoản với số điện thoại này.'); return }
      if (friends.some((f) => f.id === id)) { toast.warning('Người này đã có trong danh sách cùng thanh toán.'); return }
      setFriends((prev) => [...prev, { id, fullName: data.fullName || data.name || 'Bạn chơi', phone: data.phoneMasked || '' }])
      setPhone('')
    } catch (err) {
      toast.error(err?.message || 'Không tìm thấy tài khoản với số điện thoại này.')
    } finally {
      setLooking(false)
    }
  }

  const book = async () => {
    if (split && friends.length === 0) { toast.error('Thêm ít nhất 1 người cùng góp tiền, hoặc tắt "Chia tiền".'); return }
    setBusy(true)
    try {
      const result = await confirmAiBooking(messageId, {
        courtSlotId: slot.courtSlotId,
        numberOfSlots,
        voucherId: split ? null : voucherId || null,
        isSplitPayment: split,
        participantIds: friends.map((f) => f.id),
      })
      // Giá có thể đã đổi so với lúc AI gợi ý: lấy tổng tiền từ kết quả đặt sân
      const total = bookingTotalOf(result)
      const isSplit = isSplitBookingResult(result)
      if (isSplit) {
        toast.success(`Đã tạo đơn chia tiền${total ? ` (tổng ${formatVnd(total)})` : ''}. Mỗi người có 30 phút để góp phần của mình.`, { duration: 7000 })
      } else {
        toast.success(`Đặt sân thành công!${total ? ` Đã trừ ${formatVnd(total)} từ ví.` : ''} Vé QR đã được gửi (kiểm tra email).`, { duration: 6000 })
        if (split) toast.warning('Hệ thống đã tạo đơn thường (không chia tiền) và trừ đủ tiền sân của bạn.', { duration: 8000 })
      }
      window.dispatchEvent(new Event('escrow_balance_updated'))
      onDone?.(isSplit ? 'split' : 'booking')
    } catch (error) {
      toast.error(error?.message || 'Không đặt được ca này.')
      // Ca vừa bị người khác đặt / gợi ý không còn: tải lại tin để cập nhật ca còn trống
      onRefresh?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {canConfirm && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <select style={inputStyle} value={numberOfSlots} onChange={(e) => setNumberOfSlots(Number(e.target.value))} aria-label="Số ca liên tiếp">
              {Array.from({ length: MAX_CONSECUTIVE }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} ca liên tiếp{n > 1 ? ` (đến ${vnClock(new Date(new Date(slot.endTime).getTime() + (n - 1) * slotMs).toISOString())})` : ''}</option>
              ))}
            </select>
            <select style={{ ...inputStyle, flex: '1 1 140px' }} value={voucherId} disabled={split || !vouchers.items.length} onChange={(e) => setVoucherId(e.target.value)} aria-label="Voucher">
              <option value="">{!vouchers.loaded ? 'Đang tải voucher…' : vouchers.error ? 'Không tải được voucher' : vouchers.items.length ? 'Không dùng voucher' : 'Chưa có voucher'}</option>
              {vouchers.items.map((v) => <option key={v.id} value={v.id}>{v.code} · {v.title}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={split} onChange={(e) => toggleSplit(e.target.checked)} />
            Chia tiền với bạn bè
          </label>
          {split && (
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} type="tel" placeholder="Số điện thoại bạn chơi" value={phone} onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFriend() } }} aria-label="Số điện thoại bạn chơi" />
                <button type="button" style={ghostBtn} disabled={looking || !phone.trim()} onClick={addFriend}>{looking ? 'Đang tìm…' : 'Thêm'}</button>
              </div>
              {friends.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {friends.map((f) => (
                    <span key={f.id} style={{ ...chipStyle, cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {f.fullName}{f.phone ? ` · ${f.phone}` : ''}
                      <button type="button" aria-label={`Bỏ ${f.fullName}`} onClick={() => setFriends((prev) => prev.filter((x) => x.id !== f.id))}
                        style={{ border: 'none', background: 'transparent', color: '#065F46', cursor: 'pointer', fontWeight: 800 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                Chia đều cho {friends.length + 1} người. Mỗi người có 30 phút để góp, chưa góp đủ thì đơn bị hủy theo quy định chia tiền.
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#374151' }}>
            Dự kiến: <strong>{formatVnd(estimateAfterVoucher)}</strong>
            {numberOfSlots > 1 ? ` • ${vnClock(slot.startTime)} - ${vnClock(endAt)}` : ''}
            <span style={{ color: '#6B7280' }}> (giá chính thức do hệ thống tính lúc đặt)</span>
          </div>
        </>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {canConfirm && <button type="button" style={primaryBtn} disabled={busy} onClick={book}>{busy ? 'Đang đặt…' : split ? 'Đặt & chia tiền' : 'Đặt ca này (trừ ví)'}</button>}
        <button type="button" style={ghostBtn} disabled={busy} onClick={() => onBookSlot(facility, slot)}>Xem chi tiết & thanh toán</button>
      </div>
    </>
  )
}

function SlotAction({ facility, slot, messageId, intent, onBookSlot, onDone, onRefresh }) {
  const createLfg = String(intent?.intent || '').toUpperCase() === 'CREATE_LFG'
  const [slotsNeeded, setSlotsNeeded] = useState(intent?.slotsNeeded ? String(intent.slotsNeeded) : '')
  const [skill, setSkill] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const canConfirm = isGuid(messageId)

  const openLfg = async () => {
    const needed = Number(slotsNeeded)
    if (!Number.isInteger(needed) || needed < 1 || needed > 30) { toast.error('Bạn cần tìm thêm bao nhiêu người? (1–30)'); return }
    setBusy(true)
    try {
      await confirmAiLfg(messageId, { courtSlotId: slot.courtSlotId, slotsNeeded: needed, skillLevelTag: skill || null, description: description.trim() || null })
      toast.success('Đã mở kèo! Hệ thống báo cho những người chơi phù hợp.')
      window.dispatchEvent(new Event('escrow_balance_updated'))
      onDone?.('lfg')
    } catch (error) {
      if (error?.errorCode === 'AI_SLOTS_NEEDED_REQUIRED') {
        setSlotsNeeded('')
        toast.error('Bạn chọn số người cần tìm thêm (1–30) rồi mở kèo lại nhé.')
        return
      }
      toast.error(error?.message || 'Không mở được kèo ở ca này.')
      onRefresh?.()
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
            <input style={{ ...inputStyle, width: 120 }} type="number" min={1} max={30} placeholder="Cần thêm (người)" value={slotsNeeded} onChange={e => setSlotsNeeded(e.target.value)} aria-label="Số người cần tìm thêm" />
            <select style={inputStyle} value={skill} onChange={e => setSkill(e.target.value)} aria-label="Trình độ">
              <option value="">Mọi trình độ</option>
              {LFG_SKILL_TAGS.map(tag => <option key={tag} value={tag}>{lfgSkillLabel(tag)}</option>)}
            </select>
            <input style={{ ...inputStyle, flex: '1 1 140px' }} maxLength={300} placeholder="Ghi chú (không bắt buộc)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Kèo phải mở trước giờ chơi một khoảng tối thiểu. Tới mốc chốt mà chưa đủ người thì kèo tự hủy và hoàn tiền.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" style={primaryBtn} disabled={busy || !canConfirm} onClick={openLfg}>{busy ? 'Đang mở kèo…' : 'Mở kèo ở ca này'}</button>
          </div>
        </>
      ) : (
        <BookingForm facility={facility} slot={slot} messageId={messageId} onBookSlot={onBookSlot} onDone={onDone} onRefresh={onRefresh} />
      )}
    </div>
  )
}

export default function AiSuggestions({ facilities, lfgCards, tournaments, messageId, intent, onBookSlot, onOpenLfg, onOpenTournament, onDone, onRefresh }) {
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
            {f.distanceKm != null ? ` • ${Number(f.distanceKm).toFixed(1)} km` : ''} • từ {formatVnd(f.minPricePerHour ?? f.minPrice)}/giờ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(f.slots || []).slice(0, MAX_SLOT_CHIPS).map((s) => (
              <button key={s.courtSlotId} type="button" style={isGone(s) ? goneChip : picked === s.courtSlotId ? activeChip : chipStyle}
                disabled={isGone(s)}
                onClick={() => setPicked(picked === s.courtSlotId ? null : s.courtSlotId)}
                title={isGone(s) ? 'Ca này không còn trống' : createLfg ? 'Mở kèo ở ca này' : 'Đặt ca này'}>
                {vnClock(s.startTime)}–{vnClock(s.endTime)} {vnDayLabel(s.startTime).slice(0, 5)}
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#047857' }}>
                  {s.courtName} • {formatVnd(s.price)}
                </span>
              </button>
            ))}
          </div>
          {(f.slots || []).filter((s) => s.courtSlotId === picked && !isGone(s)).map((s) => (
            <SlotAction key={s.courtSlotId} facility={f} slot={s} messageId={messageId} intent={intent} onBookSlot={onBookSlot} onDone={onDone} onRefresh={onRefresh} />
          ))}
        </div>
      ))}
      {cards.map((c) => (
        <div key={c.lfgCardId} style={isGone(c) ? goneCard : cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>
            {c.sportName} tại {c.facilityName}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {vnClock(c.startTime)} - {vnClock(c.endTime)} {vnDayLabel(c.startTime)} • còn {c.remainingSlots} suất • {formatVnd(c.pricePerPerson)}/người
            {c.skillLevelTag ? ` • ${lfgSkillLabel(c.skillLevelTag)}` : ''} • chủ kèo {c.hostName}
          </div>
          {isGone(c) ? (
            <button type="button" style={goneChip} disabled>Hết suất</button>
          ) : (
            <button type="button" style={chipStyle} onClick={() => onOpenLfg(c)}>
              Xem kèo &amp; nhận suất
            </button>
          )}
        </div>
      ))}
      {events.map((t) => (
        <div key={t.tournamentId} style={isGone(t) ? goneCard : cardStyle}>
          <div style={{ fontWeight: 800, color: '#111827' }}>🏆 {t.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8px' }}>
            {[t.sportName, t.facilityName, TIER_TEXT[String(t.tier || '').toUpperCase()],
              t.startDate && `Khai mạc ${vnDayLabel(t.startDate)}`,
              t.registrationDeadline && `Hạn đăng ký ${vnDayLabel(t.registrationDeadline)}`,
              t.minEntryFee != null && (Number(t.minEntryFee) > 0 ? `Lệ phí từ ${formatVnd(t.minEntryFee)}` : 'Miễn phí đăng ký')].filter(Boolean).join(' • ')}
          </div>
          {isGone(t) ? (
            <button type="button" style={goneChip} disabled>Đã đóng đăng ký</button>
          ) : onOpenTournament && (
            <button type="button" style={chipStyle} onClick={() => onOpenTournament(t)}>Xem giải &amp; đăng ký</button>
          )}
        </div>
      ))}
    </div>
  )
}
