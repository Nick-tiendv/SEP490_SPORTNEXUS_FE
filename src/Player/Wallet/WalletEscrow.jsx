import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { useAuth } from '../../context/authContext.js'
import {
  DEPOSIT_MAX,
  DEPOSIT_MIN,
  DEPOSIT_STATUS,
  TRANSACTION_TYPES,
  cancelDeposit,
  clearPendingDeposit,
  createDeposit,
  getDepositByOrderCode,
  getWallet,
  getWalletTransactions,
  normalizeDepositStatus,
  readPendingDeposit,
  savePendingDeposit,
  validateDepositAmount,
} from '../../api/walletApi.js'
import { isSafeInternalPath } from './DepositResultCard.jsx'

/**
 * Màn Ví Escrow — luồng nạp tiền PayOS
 *
 * FE ──POST /wallet/deposit──▶ BE ──tạo link──▶ PayOS
 * FE ◀── checkoutUrl / qrCode ── BE
 * Người dùng chuyển khoản trên trang PayOS / app ngân hàng
 * PayOS ──webhook──▶ BE (cộng tiền vào ví)            ← FE không gọi bước này
 * PayOS ──chuyển trình duyệt về──▶ returnUrl / cancelUrl (trang của FE)
 * FE ──GET /wallet/deposits/{orderCode}──▶ BE (xem đã cộng tiền chưa)
 *
 * Màn này có thể nhận `location.state = { returnTo: { path, state, label }, suggestedAmount }`
 * từ màn đặt sân để sau khi nạp xong quay lại đúng màn đó.
 */

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000]
const QR_POLL_INTERVAL_MS = 3000
const PAGE_SIZE = 10
const PENDING_MAX_AGE_MS = 30 * 60 * 1000

const TX_META = {
  DEPOSIT: { label: 'Nạp tiền', icon: 'south_west', sign: '+', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  FREEZE: { label: 'Tạm giữ', icon: 'lock', sign: '−', color: 'text-amber-700', bg: 'bg-amber-50' },
  PAYOUT: { label: 'Thanh toán', icon: 'north_east', sign: '−', color: 'text-rose-700', bg: 'bg-rose-50' },
  REFUND: { label: 'Hoàn tiền', icon: 'undo', sign: '+', color: 'text-sky-700', bg: 'bg-sky-50' },
  RELEASE: { label: 'Giải phóng', icon: 'lock_open', sign: '+', color: 'text-teal-700', bg: 'bg-teal-50' },
}

const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(Number(val) || 0)
const formatDateTime = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return Number.isNaN(d.getTime())
    ? String(val)
    : d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}
/** expiredAt từ PayOS có thể là unix giây hoặc chuỗi ISO */
const toExpiryMs = (val) => {
  if (!val) return null
  if (typeof val === 'number') return val < 1e12 ? val * 1000 : val
  const t = Date.parse(val)
  return Number.isNaN(t) ? null : t
}

export default function WalletEscrow() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMockSession, isAuthenticated } = useAuth()

  // Màn cần quay lại sau khi nạp (vd: màn đặt sân)
  const returnTarget = useMemo(() => {
    const rt = location.state?.returnTo
    return rt && isSafeInternalPath(rt.path) ? rt : null
  }, [location.state])

  const rawSuggestedAmount = useMemo(() => {
    const s = Math.ceil(Number(location.state?.suggestedAmount) || 0)
    return s > 0 ? s : null
  }, [location.state])

  const initialAmount = useMemo(() => {
    if (!rawSuggestedAmount) return 100000
    return Math.min(DEPOSIT_MAX, Math.max(DEPOSIT_MIN, Math.ceil(rawSuggestedAmount / 1000) * 1000))
  }, [rawSuggestedAmount])

  /* ------------------------------ Ví ------------------------------ */
  const [wallet, setWallet] = useState(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState('')

  const loadWallet = useCallback(async () => {
    setWalletLoading(true)
    setWalletError('')
    try {
      const w = await getWallet()
      setWallet(w)
      return w
    } catch (err) {
      setWalletError(err?.message || 'Không thể tải thông tin ví.')
      return null
    } finally {
      setWalletLoading(false)
    }
  }, [])

  /* ------------------------- Lịch sử giao dịch ------------------------- */
  const [txFilters, setTxFilters] = useState({ type: '', from: '', to: '' })
  const [txPage, setTxPage] = useState(1)
  const [txData, setTxData] = useState({ items: [], totalPages: 1, totalCount: 0 })
  const [txLoading, setTxLoading] = useState(true)
  const [txError, setTxError] = useState('')
  const [txReloadKey, setTxReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setTxLoading(true)
    setTxError('')
    getWalletTransactions({ ...txFilters, page: txPage, pageSize: PAGE_SIZE })
      .then((res) => active && setTxData(res))
      .catch((err) => active && setTxError(err?.message || 'Không thể tải lịch sử giao dịch.'))
      .finally(() => active && setTxLoading(false))
    return () => {
      active = false
    }
  }, [txFilters, txPage, txReloadKey])

  const reloadTransactions = () => setTxReloadKey((k) => k + 1)
  const updateFilter = (key, value) => {
    setTxPage(1)
    setTxFilters((f) => ({ ...f, [key]: value }))
  }

  useEffect(() => {
    loadWallet()
  }, [loadWallet])

  /* ----------------------- Lệnh nạp còn dang dở ----------------------- */
  const [pendingDeposit, setPendingDeposit] = useState(() => {
    const p = readPendingDeposit()
    if (!p?.orderCode) return null
    if (Date.now() - (p.createdAt || 0) > PENDING_MAX_AGE_MS) {
      clearPendingDeposit()
      return null
    }
    return p
  })

  /* --------------------------- Form nạp tiền --------------------------- */
  const [amount, setAmount] = useState(initialAmount)
  const [touched, setTouched] = useState(false)
  const [payMode, setPayMode] = useState('qr') // Mặc định hiển thị VietQR tại chỗ để thuận tiện trên mọi thiết bị
  const [submitting, setSubmitting] = useState(false)
  const amountError = validateDepositAmount(amount)

  const handleAmountInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    const num = digits ? Number(digits) : 0
    setAmount(num)
    setTouched(true)
  }

  /* ----------------------------- QR modal ----------------------------- */
  const [qrSession, setQrSession] = useState(null) // { orderCode, checkoutUrl, qrCode, amount, expiresAt }
  const [qrPhase, setQrPhase] = useState(DEPOSIT_STATUS.PENDING)
  const [cancelling, setCancelling] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [now, setNow] = useState(Date.now())

  const handleSubmit = async () => {
    setTouched(true)
    if (amount > DEPOSIT_MAX) {
      toast.error(`Số tiền nạp (${formatVND(amount)}đ) vượt quá hạn mức tối đa 2.000.000đ. Không thể thực hiện giao dịch!`)
      return
    }
    if (amount < DEPOSIT_MIN) {
      toast.error(`Số tiền nạp tối thiểu là ${formatVND(DEPOSIT_MIN)}đ.`)
      return
    }
    if (amountError || submitting) return

    if (isMockSession) {
      toast.error('Chế độ DEV Mock không thể nạp tiền thật qua PayOS. Vui lòng đăng nhập bằng tài khoản người dùng thật.')
      return
    }

    setSubmitting(true)
    try {
      // POST /api/v1/wallet/deposit → 201 { orderCode, checkoutUrl, qrCode, status: PENDING_PAYMENT }
      const res = await createDeposit({ amount })
      const orderCode = res?.orderCode ?? res?.data?.orderCode
      if (!orderCode) throw new Error('Máy chủ không trả về mã lệnh nạp (orderCode).')

      // Lưu ngữ cảnh để trang returnUrl/cancelUrl biết lệnh nào & quay lại đâu
      savePendingDeposit({ orderCode, amount: res?.amount ?? amount, returnTo: returnTarget })

      // Luôn kích hoạt phiên QR modal để tự động polling trạng thái ngay trên màn hình này
      setQrPhase(DEPOSIT_STATUS.PENDING)
      setQrSession({
        orderCode: String(orderCode),
        checkoutUrl: res?.checkoutUrl || '',
        qrCode: res?.qrCode || '',
        amount: res?.amount ?? amount,
        accountName: res?.accountName,
        accountNumber: res?.accountNumber,
        description: res?.description,
        expiresAt: toExpiryMs(res?.expiredAt ?? res?.expiresAt),
      })

      if (payMode === 'redirect' && res?.checkoutUrl) {
        // Mở trang PayOS trong tab mới, giữ tab hiện tại tiếp tục polling kết quả
        window.open(res.checkoutUrl, '_blank')
      }
    } catch (err) {
      console.error('[WalletEscrow] Tạo lệnh nạp thất bại:', err)
      toast.error(err?.message || 'Tạo yêu cầu nạp tiền thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  // Polling trạng thái khi đang hiển thị QR
  useEffect(() => {
    if (!qrSession || qrPhase !== DEPOSIT_STATUS.PENDING) return undefined
    let active = true
    let timer = null
    const tick = async () => {
      try {
        const data = await getDepositByOrderCode(qrSession.orderCode)
        if (!active) return
        const status = normalizeDepositStatus(data?.status)
        if (status === DEPOSIT_STATUS.SUCCESS) {
          setQrPhase(DEPOSIT_STATUS.SUCCESS)
          clearPendingDeposit()
          setPendingDeposit(null)
          toast.success(`Nạp tiền thành công +${formatVND(data?.amount ?? qrSession.amount)} đ`)
          loadWallet()
          reloadTransactions()
          return
        }
        if (status === DEPOSIT_STATUS.CANCELLED || status === DEPOSIT_STATUS.FAILED) {
          setQrPhase(status)
          clearPendingDeposit()
          return
        }
      } catch (err) {
        if (!active) return
        if (err?.status === 404 || err?.status === 401) return
      }
      timer = setTimeout(tick, QR_POLL_INTERVAL_MS)
    }
    timer = setTimeout(tick, QR_POLL_INTERVAL_MS)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [qrSession, qrPhase, loadWallet])

  // Đồng hồ đếm ngược hạn QR
  useEffect(() => {
    if (!qrSession?.expiresAt || qrPhase !== DEPOSIT_STATUS.PENDING) return undefined
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [qrSession, qrPhase])

  /** Hủy lệnh nạp chưa trả: POST /api/v1/wallet/deposits/{orderCode}/cancel */
  const cancelOrder = async (orderCode, { silent = false } = {}) => {
    try {
      await cancelDeposit(orderCode)
      clearPendingDeposit()
      setPendingDeposit(null)
      if (!silent) toast.info('Đã hủy nạp tiền')
      reloadTransactions()
      return DEPOSIT_STATUS.CANCELLED
    } catch (err) {
      if (err?.status === 400 || err?.status === 404) {
        // Lệnh không còn chờ thanh toán → đọc trạng thái thật
        try {
          const data = await getDepositByOrderCode(orderCode)
          const status = normalizeDepositStatus(data?.status)
          clearPendingDeposit()
          setPendingDeposit(null)
          if (status === DEPOSIT_STATUS.SUCCESS) {
            toast.success('Lệnh nạp này đã được thanh toán, tiền đã vào ví.')
            loadWallet()
            reloadTransactions()
          } else {
            toast.info('Lệnh nạp đã được hủy trước đó.')
          }
          return status
        } catch {
          clearPendingDeposit()
          setPendingDeposit(null)
        }
      }
      toast.error(err?.message || 'Không thể hủy lệnh nạp.')
      return null
    }
  }

  const handleCheckStatusNow = async () => {
    if (!qrSession?.orderCode || checkingStatus) return
    setCheckingStatus(true)
    try {
      const data = await getDepositByOrderCode(qrSession.orderCode)
      const status = normalizeDepositStatus(data?.status)
      if (status === DEPOSIT_STATUS.SUCCESS) {
        setQrPhase(DEPOSIT_STATUS.SUCCESS)
        clearPendingDeposit()
        setPendingDeposit(null)
        toast.success(`Nạp tiền thành công +${formatVND(data?.amount ?? qrSession.amount)} đ`)
        loadWallet()
        reloadTransactions()
      } else if (status === DEPOSIT_STATUS.CANCELLED || status === DEPOSIT_STATUS.FAILED) {
        setQrPhase(status)
        clearPendingDeposit()
      } else {
        toast.info('Hệ thống chưa nhận được tiền từ ngân hàng. Vui lòng kiểm tra lại app ngân hàng hoặc đợi trong giây lát.')
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể kiểm tra trạng thái lệnh nạp.')
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleCancelQr = async () => {
    if (!qrSession || cancelling) return
    setCancelling(true)
    const status = await cancelOrder(qrSession.orderCode)
    setCancelling(false)
    if (status === DEPOSIT_STATUS.SUCCESS) setQrPhase(DEPOSIT_STATUS.SUCCESS)
    else if (status) setQrSession(null)
  }

  const closeQrModal = () => {
    setQrSession(null)
    setQrPhase(DEPOSIT_STATUS.PENDING)
  }

  const goBackToBooking = () => {
    if (returnTarget) navigate(returnTarget.path, { state: returnTarget.state })
    else navigate('/court-finder')
  }

  const expiresIn = qrSession?.expiresAt ? Math.max(0, Math.floor((qrSession.expiresAt - now) / 1000)) : null
  const formatTimer = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  /* ============================== RENDER ============================== */
  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 pt-6 pb-12">
        {/* ---------- Header ---------- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/60">
                Cổng thanh toán PayOS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/60">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                VietQR • Napas 24/7
              </span>
            </div>
            <h1 className="text-2xl md:text-[32px] font-extrabold text-[#111827] tracking-tight leading-snug">Ví Escrow &amp; Nạp tiền</h1>
          </div>
          <button
            id="wallet-refresh-btn"
            type="button"
            onClick={() => {
              loadWallet()
              reloadTransactions()
            }}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-sm font-bold text-[#374151] transition"
          >
            <span className={`material-symbols-outlined text-[18px] ${walletLoading ? 'animate-spin' : ''}`}>refresh</span>
            Làm mới
          </button>
        </header>

        {/* ---------- Banner cảnh báo DEV Mock Session ---------- */}
        {isMockSession && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-[24px] shrink-0">warning</span>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Chế độ xem trước (Mock Session)</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Bạn đang sử dụng phiên DEV Mock. Để gọi cổng thanh toán thật PayOS và cập nhật số dư ví vào cơ sở dữ liệu hệ thống, vui lòng đăng nhập bằng tài khoản người dùng thật.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Banner số tiền đặt sân vượt 2M ---------- */}
        {rawSuggestedAmount && rawSuggestedAmount > DEPOSIT_MAX && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-700 text-[24px] shrink-0">info</span>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Đơn đặt sân cần thanh toán {formatVND(rawSuggestedAmount)} đ</h4>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                Do quy định hạn mức mỗi giao dịch PayOS tối đa là {formatVND(DEPOSIT_MAX)} đ, số tiền đã được tự động điền {formatVND(DEPOSIT_MAX)} đ. Bạn có thể nạp trước 2.000.000đ, sau đó nạp thêm phần còn lại để hoàn tất đặt sân.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Banner quay lại đặt sân ---------- */}
        {returnTarget && (
          <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-sky-700 text-[22px]">info</span>
              <p className="text-sm text-sky-900 font-medium">
                Bạn đang nạp tiền để hoàn tất đặt sân. Nạp xong hệ thống sẽ đưa bạn quay lại màn đặt sân.
              </p>
            </div>
            <button
              id="wallet-back-booking-banner"
              type="button"
              onClick={goBackToBooking}
              className="shrink-0 text-sm font-bold text-sky-800 hover:text-sky-950 underline underline-offset-2"
            >
              {returnTarget.label || 'Quay lại đặt sân'}
            </button>
          </div>
        )}

        {/* ---------- Lệnh nạp đang dang dở ---------- */}
        {pendingDeposit && !qrSession && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 text-[22px]">pending</span>
              <p className="text-sm text-amber-900 font-medium">
                Bạn có lệnh nạp <strong className="font-mono">#{pendingDeposit.orderCode}</strong>
                {pendingDeposit.amount ? <> ({formatVND(pendingDeposit.amount)} đ)</> : null} chưa hoàn tất.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                id="wallet-pending-check"
                type="button"
                onClick={() => navigate(`/wallet/deposit-success?orderCode=${encodeURIComponent(pendingDeposit.orderCode)}`)}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
              >
                Kiểm tra trạng thái
              </button>
              <button
                id="wallet-pending-cancel"
                type="button"
                onClick={() => cancelOrder(pendingDeposit.orderCode)}
                className="px-3.5 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-bold transition"
              >
                Hủy lệnh
              </button>
            </div>
          </div>
        )}

        {/* ---------- Tổng quan ví: GET /api/v1/wallet ---------- */}
        <section aria-label="Tổng quan ví" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-1 rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#0D9488] relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">Số dư khả dụng</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">
              {walletLoading && !wallet ? '—' : `${formatVND(wallet?.availableBalance)} đ`}
            </p>
            <p className="mt-1 text-xs text-emerald-100/90">Dùng được để đặt sân, giữ slot, đóng lệ phí</p>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              <span className="material-symbols-outlined text-[18px] text-[#15803D]">account_balance_wallet</span>
              Tổng số dư
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#111827]">
              {walletLoading && !wallet ? '—' : `${formatVND(wallet?.balance)} đ`}
            </p>
          </div>
          <div className="rounded-2xl p-6 bg-white border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
              <span className="material-symbols-outlined text-[18px] text-amber-600">lock</span>
              Đang tạm giữ
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#111827]">
              {walletLoading && !wallet ? '—' : `${formatVND(wallet?.frozenBalance)} đ`}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">Tiền ký quỹ cho các booking chưa hoàn tất</p>
          </div>
          {walletError && (
            <p role="alert" className="md:col-span-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
              {walletError}
            </p>
          )}
        </section>

        {/* ---------- Form nạp tiền ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Số tiền */}
            <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <label htmlFor="deposit-amount-input" className="text-xs font-extrabold uppercase tracking-wider text-[#1F2937] block mb-4">
                Số tiền muốn nạp (VND)
              </label>
              <div
                className={`border rounded-2xl px-5 py-4 flex items-center gap-4 transition-all focus-within:ring-2 ${
                  amount > DEPOSIT_MAX
                    ? 'bg-rose-50/60 border-2 border-rose-500 focus-within:ring-rose-200'
                    : amountError
                    ? 'bg-rose-50/30 border border-rose-400 focus-within:ring-rose-200'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] focus-within:border-[#10B981] focus-within:ring-[#10B981]/20'
                }`}
              >
                <span className={`material-symbols-outlined text-[28px] shrink-0 ${amount > DEPOSIT_MAX ? 'text-rose-600' : 'text-[#15803D]'}`}>
                  {amount > DEPOSIT_MAX ? 'warning' : 'payments'}
                </span>
                <input
                  id="deposit-amount-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount ? formatVND(amount) : ''}
                  placeholder="0"
                  onChange={handleAmountInput}
                  onBlur={() => setTouched(true)}
                  aria-invalid={Boolean(amountError)}
                  aria-describedby="deposit-amount-hint"
                  className={`w-full bg-transparent text-2xl md:text-[28px] font-extrabold outline-none tracking-tight ${
                    amount > DEPOSIT_MAX ? 'text-rose-700' : 'text-[#111827]'
                  }`}
                />
                <span className={`text-lg font-extrabold ${amount > DEPOSIT_MAX ? 'text-rose-500' : 'text-[#94A3B8]'}`}>đ</span>
                {amount > 0 && (
                  <button
                    id="deposit-amount-clear"
                    type="button"
                    onClick={() => {
                      setAmount(0)
                      setTouched(true)
                    }}
                    title="Xóa số tiền"
                    className="w-7 h-7 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#64748B] flex items-center justify-center transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {amount > DEPOSIT_MAX && (
                <div className="mt-3 p-3.5 rounded-xl bg-rose-100/80 border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                    <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">block</span>
                    <span>Số tiền nạp tối đa là {formatVND(DEPOSIT_MAX)}đ. Bạn đang nhập dư {formatVND(amount - DEPOSIT_MAX)}đ.</span>
                  </div>
                  <button
                    id="deposit-fix-max-btn"
                    type="button"
                    onClick={() => {
                      setAmount(DEPOSIT_MAX)
                      setTouched(true)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition shadow-sm self-start sm:self-auto"
                  >
                    Chỉnh về 2.000.000đ
                  </button>
                </div>
              )}

              <p id="deposit-amount-hint" className={`mt-2 text-xs font-semibold ${amountError ? 'text-rose-600' : 'text-[#6B7280]'}`}>
                {amountError ? amountError : `Tối thiểu ${formatVND(DEPOSIT_MIN)}đ, tối đa ${formatVND(DEPOSIT_MAX)}đ.`}
              </p>

              <div className="mt-5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280] block mb-2.5">Chọn nhanh:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {QUICK_AMOUNTS.map((val) => {
                    const selected = amount === val
                    return (
                      <button
                        key={val}
                        id={`deposit-quick-${val}`}
                        type="button"
                        onClick={() => {
                          setAmount(val)
                          setTouched(true)
                        }}
                        className={`py-2.5 px-1 rounded-xl text-xs sm:text-[13px] font-bold transition-all text-center ${
                          selected
                            ? 'border-2 border-[#15803D] bg-[#F0FDF4] text-[#15803D] shadow-sm scale-[1.02]'
                            : 'border border-[#E2E8F0] bg-white text-[#374151] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Cách thanh toán */}
            <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1F2937] mb-4">Cách thanh toán qua PayOS</h2>
              <div className="space-y-3" role="radiogroup" aria-label="Cách thanh toán">
                {[
                  {
                    key: 'redirect',
                    icon: 'open_in_new',
                    title: 'Chuyển sang trang thanh toán PayOS',
                    desc: 'Quét QR hoặc chuyển khoản trên trang PayOS, xong tự quay lại SportNexus',
                    iconBg: 'bg-[#DCFCE7] text-[#15803D]',
                  },
                  {
                    key: 'qr',
                    icon: 'qr_code_2',
                    title: 'Hiện mã VietQR ngay tại đây',
                    desc: 'Mở app ngân hàng quét mã, hệ thống tự xác nhận khi tiền vào ví',
                    iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
                  },
                ].map((opt) => {
                  const selected = payMode === opt.key
                  return (
                    <div
                      key={opt.key}
                      id={`deposit-mode-${opt.key}`}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onClick={() => setPayMode(opt.key)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPayMode(opt.key)}
                      className={`rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                        selected ? 'border-2 border-[#10B981] bg-[#F0FDF4] shadow-sm' : 'border border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-[#10B981]' : 'border-[#CBD5E1]'}`}>
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
                      </div>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                        <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-[#111827]">{opt.title}</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{opt.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Tóm tắt */}
          <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-4 px-5 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#15803D] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[18px]">check</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14532D]">Phí giao dịch: Miễn phí</h4>
                <p className="text-xs text-[#166534] mt-0.5 font-medium">Tiền vào ví ngay khi ngân hàng xác nhận</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <div className="flex items-center justify-between pb-5 border-b border-[#F1F5F9]">
                <h3 className="text-base font-extrabold text-[#111827]">Chi tiết nạp ví</h3>
                <span className="text-xs font-bold text-[#10B981]">PayOS</span>
              </div>
              <dl className="py-4 space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[#6B7280] font-medium">Số tiền nạp</dt>
                  <dd className={`font-bold ${amount > DEPOSIT_MAX ? 'text-rose-600' : 'text-[#111827]'}`}>
                    {formatVND(amount)} đ {amount > DEPOSIT_MAX ? '(Vượt hạn mức)' : ''}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#6B7280] font-medium">Hình thức</dt>
                  <dd className="font-bold text-[#111827]">{payMode === 'redirect' ? 'Trang PayOS' : 'VietQR tại chỗ'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#6B7280] font-medium">Phí dịch vụ</dt>
                  <dd className="font-bold text-[#10B981]">Miễn phí</dd>
                </div>
                {wallet && (
                  <div className="flex items-center justify-between">
                    <dt className="text-[#6B7280] font-medium">Khả dụng sau khi nạp</dt>
                    <dd className={`font-bold ${amount > DEPOSIT_MAX ? 'text-rose-600' : 'text-[#15803D]'}`}>
                      {amount > DEPOSIT_MAX ? 'Không hợp lệ' : `${formatVND((wallet.availableBalance || 0) + (amountError ? 0 : amount))} đ`}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="pt-4 border-t border-[#F1F5F9] flex items-end justify-between mb-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">Tổng thanh toán</span>
                <span className={`text-2xl font-extrabold tracking-tight ${amount > DEPOSIT_MAX ? 'text-rose-600' : 'text-[#111827]'}`}>
                  {formatVND(amount)} đ
                </span>
              </div>

              <button
                id="deposit-submit-btn"
                type="button"
                disabled={Boolean(amountError) || submitting || amount > DEPOSIT_MAX || amount < DEPOSIT_MIN}
                onClick={handleSubmit}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
                  !amountError && !submitting && amount <= DEPOSIT_MAX && amount >= DEPOSIT_MIN
                    ? 'bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white cursor-pointer'
                    : 'bg-rose-100 border border-rose-300 text-rose-600 cursor-not-allowed opacity-90'
                }`}
              >
                <span className={`material-symbols-outlined text-[19px] ${submitting ? 'animate-spin' : ''}`}>
                  {submitting
                    ? 'progress_activity'
                    : amount > DEPOSIT_MAX
                    ? 'block'
                    : amount < DEPOSIT_MIN
                    ? 'info'
                    : payMode === 'redirect'
                    ? 'open_in_new'
                    : 'qr_code_2'}
                </span>
                <span>
                  {submitting
                    ? 'Đang tạo lệnh nạp…'
                    : amount > DEPOSIT_MAX
                    ? `Vượt quá hạn mức 2.000.000 đ (Không thể nạp)`
                    : amount < DEPOSIT_MIN
                    ? `Số tiền nạp tối thiểu là 10.000 đ`
                    : payMode === 'redirect'
                    ? `Thanh toán qua PayOS (${formatVND(amount)} đ)`
                    : `Tạo mã VietQR (${formatVND(amount)} đ)`}
                </span>
              </button>

              <button
                id="deposit-back-btn"
                type="button"
                onClick={() => (returnTarget ? goBackToBooking() : navigate(-1))}
                className="w-full mt-3 py-3 px-4 rounded-xl text-sm font-bold text-[#374151] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
              >
                Quay lại
              </button>
            </div>
          </aside>
        </div>

        {/* ---------- Lịch sử giao dịch: GET /api/v1/wallet/transactions ---------- */}
        <section aria-labelledby="tx-history-title" className="mt-10 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="p-6 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#F1F5F9]">
            <div>
              <h2 id="tx-history-title" className="text-lg font-extrabold text-[#111827]">Lịch sử giao dịch</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">{txData.totalCount} giao dịch</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-bold text-[#6B7280] flex flex-col gap-1">
                Loại
                <select
                  id="tx-filter-type"
                  value={txFilters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#111827] outline-none focus:border-[#10B981]"
                >
                  <option value="">Tất cả</option>
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TX_META[t]?.label || t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[#6B7280] flex flex-col gap-1">
                Từ ngày
                <input
                  id="tx-filter-from"
                  type="date"
                  value={txFilters.from}
                  max={txFilters.to || undefined}
                  onChange={(e) => updateFilter('from', e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#111827] outline-none focus:border-[#10B981]"
                />
              </label>
              <label className="text-xs font-bold text-[#6B7280] flex flex-col gap-1">
                Đến ngày
                <input
                  id="tx-filter-to"
                  type="date"
                  value={txFilters.to}
                  min={txFilters.from || undefined}
                  onChange={(e) => updateFilter('to', e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#111827] outline-none focus:border-[#10B981]"
                />
              </label>
              {(txFilters.type || txFilters.from || txFilters.to) && (
                <button
                  id="tx-filter-reset"
                  type="button"
                  onClick={() => {
                    setTxPage(1)
                    setTxFilters({ type: '', from: '', to: '' })
                  }}
                  className="h-10 px-3 rounded-xl text-sm font-bold text-[#64748B] hover:text-[#111827]"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {txLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              ))
            ) : txError ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-rose-700 font-medium">{txError}</p>
                <button id="tx-retry" type="button" onClick={reloadTransactions} className="mt-3 text-sm font-bold text-[#15803D] hover:underline">
                  Thử lại
                </button>
              </div>
            ) : txData.items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-gray-300">receipt_long</span>
                <p className="mt-2 text-sm text-[#6B7280] font-medium">Chưa có giao dịch nào.</p>
              </div>
            ) : (
              txData.items.map((tx, idx) => {
                const type = String(tx.type || tx.transactionType || '').toUpperCase()
                const meta = TX_META[type] || { label: type || 'Giao dịch', icon: 'swap_horiz', sign: '', color: 'text-gray-700', bg: 'bg-gray-50' }
                const amt = Math.abs(Number(tx.amount) || 0)
                const when = tx.createdAt || tx.createdDate || tx.transactionDate || tx.timestamp
                const desc = tx.description || tx.note || tx.content
                const ref = tx.orderCode || tx.referenceCode || tx.referenceId || tx.bookingId
                return (
                  <div key={tx.id || tx.transactionId || `${type}-${when}-${idx}`} className="px-6 py-4 flex items-center gap-4 hover:bg-[#FAFAFA] transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                      <span className={`material-symbols-outlined text-[20px] ${meta.color}`}>{meta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">
                        {meta.label}
                        {desc ? <span className="font-medium text-[#6B7280]"> • {desc}</span> : null}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {formatDateTime(when)}
                        {ref ? <span className="font-mono"> • #{String(ref).slice(0, 18)}</span> : null}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-extrabold ${meta.color}`}>
                        {meta.sign}
                        {formatVND(amt)} đ
                      </p>
                      {tx.balanceAfter != null && <p className="text-[11px] text-[#94A3B8]">Số dư: {formatVND(tx.balanceAfter)} đ</p>}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {txData.totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-[#F1F5F9]">
              <button
                id="tx-prev-page"
                type="button"
                disabled={txPage <= 1 || txLoading}
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-sm font-bold text-[#374151] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                ← Trước
              </button>
              <span className="text-xs font-bold text-[#6B7280]">
                Trang {txPage} / {txData.totalPages}
              </span>
              <button
                id="tx-next-page"
                type="button"
                disabled={txPage >= txData.totalPages || txLoading}
                onClick={() => setTxPage((p) => p + 1)}
                className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-sm font-bold text-[#374151] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                Sau →
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ==================== MODAL VIETQR (qrCode từ BE) ==================== */}
      {qrSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            {qrPhase === DEPOSIT_STATUS.SUCCESS ? (
              <div className="text-center py-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[46px] text-emerald-700">check_circle</span>
                </div>
                <h3 id="qr-modal-title" className="text-xl font-extrabold text-[#111827]">Nạp tiền thành công!</h3>
                <p className="mt-1 text-sm text-[#6B7280]">+{formatVND(qrSession.amount)} đ đã vào Ví Escrow.</p>
                {wallet && (
                  <p className="mt-3 text-sm font-bold text-[#15803D]">Số dư khả dụng: {formatVND(wallet.availableBalance)} đ</p>
                )}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {returnTarget && (
                    <button
                      id="qr-success-back-booking"
                      type="button"
                      onClick={goBackToBooking}
                      className="flex-1 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-sm transition"
                    >
                      {returnTarget.label || 'Quay lại đặt sân'}
                    </button>
                  )}
                  <button
                    id="qr-success-close"
                    type="button"
                    onClick={closeQrModal}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${
                      returnTarget ? 'bg-white border border-[#CBD5E1] text-gray-800 hover:bg-gray-50' : 'bg-[#15803D] hover:bg-[#166534] text-white'
                    }`}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : qrPhase === DEPOSIT_STATUS.CANCELLED || qrPhase === DEPOSIT_STATUS.FAILED ? (
              <div className="text-center py-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[46px] text-slate-600">cancel</span>
                </div>
                <h3 id="qr-modal-title" className="text-xl font-extrabold text-[#111827]">
                  {qrPhase === DEPOSIT_STATUS.FAILED ? 'Nạp tiền không thành công' : 'Lệnh nạp đã bị hủy'}
                </h3>
                <button id="qr-closed-close" type="button" onClick={closeQrModal} className="mt-6 w-full py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-sm">
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h3 id="qr-modal-title" className="text-lg font-extrabold text-[#111827]">Quét mã VietQR để nạp tiền</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">Mở app ngân hàng bất kỳ và quét mã. Vui lòng chuyển đúng số tiền.</p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    {qrSession.qrCode ? (
                      <QRCodeSVG value={qrSession.qrCode} size={208} level="M" marginSize={1} />
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center text-xs text-gray-500 text-center px-4">
                        Không có mã QR, vui lòng mở trang PayOS.
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#15803D]" aria-live="polite">
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>
                      Đang chờ thanh toán
                      {expiresIn !== null ? ` • Hết hạn sau ${formatTimer(expiresIn)}` : ''}
                    </span>
                  </div>
                </div>

                <dl className="mt-4 bg-[#F8FAFC] rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500 font-medium">Mã lệnh nạp</dt>
                    <dd className="font-mono font-bold text-gray-900">#{qrSession.orderCode}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500 font-medium">Số tiền</dt>
                    <dd className="font-extrabold text-emerald-800">{formatVND(qrSession.amount)} đ</dd>
                  </div>
                  {qrSession.accountName && (
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500 font-medium">Chủ tài khoản</dt>
                      <dd className="font-bold text-gray-900">{qrSession.accountName}</dd>
                    </div>
                  )}
                  {qrSession.description && (
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500 font-medium">Nội dung CK</dt>
                      <dd className="font-bold text-gray-900">{qrSession.description}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    id="qr-check-now"
                    type="button"
                    disabled={checkingStatus}
                    onClick={handleCheckStatusNow}
                    className="w-full py-3.5 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60"
                  >
                    <span className={`material-symbols-outlined text-[19px] ${checkingStatus ? 'animate-spin' : ''}`}>
                      {checkingStatus ? 'progress_activity' : 'verified'}
                    </span>
                    {checkingStatus ? 'Đang kiểm tra giao dịch…' : 'Tôi đã chuyển tiền xong (Kiểm tra ngay)'}
                  </button>

                  {qrSession.checkoutUrl && (
                    <button
                      id="qr-open-payos"
                      type="button"
                      onClick={() => window.open(qrSession.checkoutUrl, '_blank')}
                      className="w-full py-3 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] font-bold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Mở trang thanh toán PayOS (tab mới)
                    </button>
                  )}

                  <button
                    id="qr-cancel-order"
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelQr}
                    className="w-full py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    {cancelling ? 'Đang hủy…' : 'Hủy lệnh nạp này'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
