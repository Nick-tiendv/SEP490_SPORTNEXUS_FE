import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { checkInBooking, getOwnerBookings, scanQrCode } from '../../api/owner'
import { pick } from '../../api/owner/request.js'
import { useOwnerContext } from '../Layout/ownerContext.js'

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const todayVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date())
const toClockVN = (value) =>
  value ? new Intl.DateTimeFormat('en-GB', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : '—'
const nowClock = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
// Giảm kích thước khung hình trước khi giải mã QR cho nhẹ.
const SCAN_MAX_WIDTH = 640

const toBooking = (raw) => ({
  id: String(raw.bookingId),
  status: String(raw.bookingStatus || '').toUpperCase(),
  isWalkIn: raw.isWalkIn === true,
  courtName: raw.courtName || '—',
  sportName: raw.sportName || '',
  startTime: raw.startTime,
  endTime: raw.endTime,
  totalAmount: Number(raw.totalAmount) || 0,
  customerName: raw.customerName || '—',
  customerPhone: raw.customerPhone || '',
  participantCount: Number(raw.participantCount) || 0,
  checkedInCount: Number(raw.checkedInCount) || 0,
})

export default function CheckQR() {
  const { facilityId, facility, wallet, refreshWallet } = useOwnerContext()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const frameRef = useRef(null)
  const inputRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const [manualCode, setManualCode] = useState('')
  const [pendingCode, setPendingCode] = useState(null)
  const [result, setResult] = useState(null) // { ok, code, message, data, time }
  const [busy, setBusy] = useState(false)
  const [sessionLogs, setSessionLogs] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  // Đơn trong ngày: chờ check-in (PAID) và đã check-in (CHECKED_IN)
  const [listTab, setListTab] = useState('waiting')
  const [reloadKey, setReloadKey] = useState(0)
  const [today, setToday] = useState(null) // { key, waiting, checkedIn }
  const [todayError, setTodayError] = useState(null) // { key, message }
  const todayKey = `${facilityId}|${reloadKey}`

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    const key = `${facilityId}|${reloadKey}`
    const date = todayVN()
    const load = (status) => getOwnerBookings({ facilityId, date, status, page: 1, pageSize: 100 }).then(({ items }) => items.map(toBooking))
    Promise.all([load('PAID'), load('CHECKED_IN')])
      .then(([waiting, checkedIn]) => !cancelled && setToday({ key, waiting, checkedIn }))
      .catch((error) => !cancelled && setTodayError({ key, message: error.message }))
    return () => { cancelled = true }
  }, [facilityId, reloadKey])

  const reloadToday = () => setReloadKey((value) => value + 1)
  const todayData = today?.key.split('|')[0] === facilityId ? today : null
  const todayLoadError = todayError?.key === todayKey ? todayError.message : ''

  // ---------- Camera ----------
  const stopCamera = () => {
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }

  // Tắt camera khi rời trang
  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!streamRef.current || !video || !canvas) return
    if (video.readyState >= 2 && video.videoWidth) {
      const scale = Math.min(1, SCAN_MAX_WIDTH / video.videoWidth)
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const qr = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
      if (qr?.data) {
        stopCamera()
        setPendingCode(qr.data.trim())
        setResult(null)
        return
      }
    }
    frameRef.current = requestAnimationFrame(scanFrame)
  }

  const startCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ camera. Hãy nhập mã hoặc dùng máy quét cầm tay.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraOn(true)
      setPendingCode(null)
      setResult(null)
      frameRef.current = requestAnimationFrame(scanFrame)
    } catch (error) {
      stopCamera()
      setCameraError(
        error?.name === 'NotAllowedError'
          ? 'Bạn đã chặn quyền camera. Hãy cho phép camera trên trình duyệt rồi thử lại.'
          : 'Không mở được camera. Hãy nhập mã hoặc dùng máy quét cầm tay.',
      )
    }
  }

  // ---------- Check-in ----------
  // Máy quét QR cầm tay hoạt động như bàn phím: gõ mã rồi Enter vào ô nhập.
  const handleManualSubmit = (e) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    setPendingCode(code)
    setResult(null)
  }

  const handleConfirmCheckIn = async () => {
    if (!pendingCode || !facilityId || busy) return
    const code = pendingCode
    setBusy(true)
    try {
      const { data, message } = await scanQrCode({ facilityId, qrCode: code })
      const entry = { ok: true, code, message: message || 'Check-in thành công!', data, time: nowClock() }
      setResult(entry)
      setSessionLogs((prev) => [entry, ...prev].slice(0, 20))
      showToast(entry.message)
      refreshWallet().catch(() => {})
      reloadToday()
    } catch (error) {
      const entry = { ok: false, code, message: error.message, data: null, time: nowClock() }
      setResult(entry)
      setSessionLogs((prev) => [entry, ...prev].slice(0, 20))
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
      setPendingCode(null)
      setManualCode('')
    }
  }

  const handleManualBookingCheckIn = async (booking) => {
    setBusy(true)
    try {
      await checkInBooking(booking.id, { checkInAllParticipants: true })
      showToast(`Đã check-in cho ${booking.customerName} (${booking.courtName}).`)
      refreshWallet().catch(() => {})
      reloadToday()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleResetScanner = () => {
    setPendingCode(null)
    setResult(null)
    setManualCode('')
    inputRef.current?.focus()
  }

  const formatVND = (num) => (num === null || num === undefined ? '—' : new Intl.NumberFormat('vi-VN').format(num) + ' đ')
  const panelStyle = {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.90)',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
  }
  const listItems = listTab === 'waiting' ? todayData?.waiting || [] : todayData?.checkedIn || []

  // Thông tin hiển thị từ data trả về khi quét (BE chưa mô tả schema, thử vài tên field).
  const resultDetails = result?.ok && result.data && typeof result.data === 'object'
    ? [
        ['Khách hàng', pick(result.data, 'customerName', 'hostName', 'fullName', 'playerName', 'userName')],
        ['Sân', pick(result.data, 'courtName')],
        ['Giờ chơi', pick(result.data, 'startTime') ? `${toClockVN(pick(result.data, 'startTime'))} - ${toClockVN(pick(result.data, 'endTime'))}` : null],
        ['Số tiền', pick(result.data, 'totalAmount', 'amountPaid', 'amount') != null ? formatVND(Number(pick(result.data, 'totalAmount', 'amountPaid', 'amount'))) : null],
      ].filter(([, value]) => value)
    : []

  return (
    <div style={{ padding: '24px 32px', minHeight: 'calc(100vh - 60px)', background: 'transparent' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '420px',
            animation: 'fadeInSlide 0.3s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toastMessage.msg}
        </div>
      )}

      {/* Header section */}
      <div
        style={{
          ...panelStyle,
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Smart Escrow Check-in Terminal
            </span>
            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>{facility?.name || ''}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Quét Mã QR Check-in Người Chơi
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
            Quét vé QR đặt sân hoặc kèo LFG khi người chơi tới sân. Tiền giữ của đơn được chuyển cho chủ sân sau giờ chơi.
          </p>
        </div>

        {/* Available Balance Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.94) 0%, rgba(6, 95, 70, 0.94) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(6, 78, 59, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#34D399' }}>account_balance_wallet</span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#A7F3D0', fontWeight: 600 }}>Số Dư Khả Dụng</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>{formatVND(wallet?.availableBalance ?? wallet?.balance)}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner on Left, Result on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        {/* Left Column: QR Scanner */}
        <div
          style={{
            background: '#0F172A',
            borderRadius: '20px',
            padding: '24px',
            color: '#FFFFFF',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cameraOn ? '#10B981' : '#64748B', boxShadow: cameraOn ? '0 0 10px #10B981' : 'none' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0' }}>{cameraOn ? 'Camera đang quét...' : 'Camera đang tắt'}</span>
            </div>
            <button
              onClick={cameraOn ? stopCamera : startCamera}
              disabled={!facilityId}
              style={{
                background: cameraOn ? '#EF4444' : '#10B981',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: facilityId ? 1 : 0.5,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{cameraOn ? 'videocam_off' : 'videocam'}</span>
              {cameraOn ? 'Tắt Camera' : 'Bật Camera'}
            </button>
          </div>

          {/* Viewfinder Frame */}
          <div
            style={{
              width: '100%',
              height: '320px',
              borderRadius: '16px',
              background: '#1E293B',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <video ref={videoRef} muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: cameraOn ? 'block' : 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {cameraOn && (
              <div
                style={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)',
                  boxShadow: '0 0 16px 4px #10B981',
                  animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                  zIndex: 10,
                }}
              />
            )}

            <div
              style={{
                width: '210px',
                height: '210px',
                border: '2px solid rgba(16, 185, 129, 0.6)',
                borderRadius: '18px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: cameraOn ? 'transparent' : 'rgba(0,0,0,0.25)',
                zIndex: 5,
              }}
            >
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981', borderTopLeftRadius: '14px' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10B981', borderRight: '4px solid #10B981', borderTopRightRadius: '14px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981', borderBottomLeftRadius: '14px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981', borderBottomRightRadius: '14px' }} />

              {!cameraOn && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>qr_code_scanner</span>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                    Bấm "Bật Camera" rồi đưa mã QR vé người chơi vào giữa khung hình
                  </div>
                </div>
              )}
            </div>

            <style>{`
              @keyframes scanLaser {
                0% { top: 15%; opacity: 0.3; }
                50% { opacity: 1; }
                100% { top: 85%; opacity: 0.3; }
              }
            `}</style>
          </div>

          {cameraError && (
            <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', fontWeight: 600 }}>
              {cameraError}
            </div>
          )}

          {/* Manual Code / Handheld scanner input */}
          <form onSubmit={handleManualSubmit} style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
              HOẶC NHẬP MÃ VÉ / DÙNG MÁY QUÉT CẦM TAY:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Mã QR trên vé của người chơi..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                  flex: 1,
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              />
              <button
                type="submit"
                disabled={!facilityId}
                style={{ background: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Kiểm Tra
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Confirm & Result */}
        <div style={{ ...panelStyle, borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!facilityId ? (
            <div style={{ textAlign: 'center', color: '#475569', fontWeight: 600 }}>Chưa có cơ sở để check-in.</div>
          ) : pendingCode ? (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: '8px' }}>Đã đọc được mã vé</div>
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all', marginBottom: '14px' }}>
                {pendingCode}
              </div>
              <p style={{ fontSize: '13.5px', color: '#1E293B', fontWeight: 600, margin: '0 0 20px 0' }}>
                Xác nhận check-in vé này tại <strong>{facility?.name}</strong>? Hệ thống sẽ kiểm tra vé đúng cơ sở, chưa bị hủy và chưa được điểm danh.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleResetScanner}
                  style={{ flex: 1, background: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={busy}
                  style={{ flex: 2, background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
                  {busy ? 'Đang check-in...' : 'Xác Nhận Check-in'}
                </button>
              </div>
            </div>
          ) : result ? (
            <div style={{ textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: result.ok ? '#10B981' : '#EF4444' }}>
                {result.ok ? 'verified' : 'cancel'}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: result.ok ? '#047857' : '#B91C1C', margin: '8px 0 6px' }}>
                {result.ok ? 'Check-in Thành Công' : 'Check-in Thất Bại'}
              </h3>
              <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 600, margin: '0 0 16px 0' }}>{result.message}</p>
              {resultDetails.length > 0 && (
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', border: '1px solid #CBD5E1', marginBottom: '16px', textAlign: 'left' }}>
                  {resultDetails.map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#475569', fontWeight: 700 }}>{label}:</span>
                      <strong style={{ color: '#0F172A' }}>{value}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginBottom: '18px', wordBreak: 'break-all' }}>Mã: {result.code}</div>
              <button
                onClick={handleResetScanner}
                style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                Quét Vé Tiếp Theo
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#CBD5E1' }}>confirmation_number</span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '8px 0 6px' }}>Chờ quét vé</h3>
              <p style={{ fontSize: '13.5px', fontWeight: 600, margin: 0 }}>
                Bật camera, nhập mã, hoặc bấm vào ô nhập rồi dùng máy quét cầm tay. Có thể check-in thủ công ở danh sách bên dưới.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách đơn hôm nay */}
      <div style={{ ...panelStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Đơn Đặt Sân Hôm Nay</h3>
            <p style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '13.5px', fontWeight: 600 }}>
              Khách quên vé QR? Check-in thủ công ngay tại danh sách chờ.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              ['waiting', `Chờ check-in (${todayData?.waiting.length ?? 0})`],
              ['checked', `Đã check-in (${todayData?.checkedIn.length ?? 0})`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setListTab(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: listTab === key ? '#ECFDF5' : '#F1F5F9',
                  color: listTab === key ? '#047857' : '#334155',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
            <button onClick={reloadToday} title="Tải lại" style={{ padding: '7px 9px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#334155' }}>refresh</span>
            </button>
          </div>
        </div>

        {todayLoadError ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#B91C1C', fontWeight: 700 }}>{todayLoadError}</div>
        ) : !todayData ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{facilityId ? 'Đang tải danh sách đơn...' : 'Chưa có cơ sở.'}</div>
        ) : listItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
            {listTab === 'waiting' ? 'Không còn đơn nào chờ check-in hôm nay.' : 'Chưa có lượt check-in nào hôm nay.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #CBD5E1', background: '#F8FAFC' }}>
                  {['Khách hàng', 'Sân', 'Giờ chơi', 'Người chơi', 'Tổng tiền', ''].map((head) => (
                    <th key={head} style={{ padding: '12px 14px', fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listItems.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        {booking.customerName}{booking.isWalkIn ? ' (Vãng lai)' : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{booking.customerPhone || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {booking.courtName}
                      {booking.sportName && <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{booking.sportName}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {toClockVN(booking.startTime)} - {toClockVN(booking.endTime)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {booking.checkedInCount}/{booking.participantCount || 1} đã vào sân
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 800, color: '#047857' }}>{formatVND(booking.totalAmount)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {listTab === 'waiting' ? (
                        <button
                          onClick={() => handleManualBookingCheckIn(booking)}
                          disabled={busy}
                          style={{ background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
                        >
                          Check-in thủ công
                        </button>
                      ) : (
                        <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>Đã vào sân</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nhật ký quét trong phiên làm việc */}
      {sessionLogs.length > 0 && (
        <div style={panelStyle}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>Nhật Ký Quét Trong Phiên</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessionLogs.map((log, idx) => (
              <div
                key={`${log.time}-${idx}`}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: log.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${log.ok ? '#BBF7D0' : '#FECACA'}` }}
              >
                <span className="material-symbols-outlined" style={{ color: log.ok ? '#16A34A' : '#DC2626', fontSize: '20px' }}>{log.ok ? 'check_circle' : 'error'}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', minWidth: '64px' }}>{log.time}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', flex: 1 }}>{log.message}</span>
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
