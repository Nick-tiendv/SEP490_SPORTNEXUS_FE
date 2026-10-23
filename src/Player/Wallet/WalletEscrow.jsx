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
} from '../../api/player/walletApi.js'
import { MIN_MAINTENANCE_FEE, POPULAR_BANKS, WITHDRAW_STATUS } from '../../api/player/withdrawApi.js'
import { createWithdrawal, getBankAccount, getMyWithdrawals, updateBankAccount } from '../../api/owner/walletApi.js'

// Yêu cầu rút tiền từ GET /api/v1/wallet/withdrawals -> dạng hiển thị trong lịch sử
const toWithdrawalItem = (raw) => {
  const status = String(raw.status || 'PENDING').toUpperCase()
  return {
    id: String(raw.id || raw.withdrawalId || ''),
    amount: Number(raw.amount) || 0,
    status: status === 'COMPLETED' || status === 'APPROVED' ? WITHDRAW_STATUS.APPROVED : status === 'REJECTED' || status === 'CANCELLED' ? WITHDRAW_STATUS.REJECTED : WITHDRAW_STATUS.PENDING,
    createdAt: raw.createdAt || raw.requestedAt || null,
    note: raw.note || '',
    adminNote: raw.rejectReason || raw.adminNote || raw.reason || '',
    remainingBalance: raw.balanceAfter ?? null,
    bank: { bankName: raw.bankName || '', accountNumber: raw.bankAccountNumber || '', accountHolder: raw.bankAccountHolder || '' },
  }
}
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

  /* ---------------------- Yêu cầu rút tiền (Role Player) ---------------------- */
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showIneligibleModal, setShowIneligibleModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(100000)
  const [withdrawBank, setWithdrawBank] = useState(POPULAR_BANKS[0].name)
  const [withdrawAccount, setWithdrawAccount] = useState('')
  const [withdrawHolder, setWithdrawHolder] = useState('')
  const [withdrawNote, setWithdrawNote] = useState('')
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
  const [withdrawReceipt, setWithdrawReceipt] = useState(null)
  const [historyTab, setHistoryTab] = useState('transactions') // 'transactions' | 'withdrawals'
  // Lịch sử rút tiền: GET /api/v1/wallet/withdrawals; tài khoản ngân hàng: GET /api/v1/wallet/bank-account
  const [myWithdrawals, setMyWithdrawals] = useState([])
  const loadWithdrawals = useCallback(() => {
    getMyWithdrawals({ page: 1, pageSize: 50 })
      .then(({ items }) => setMyWithdrawals(items.map(toWithdrawalItem)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isAuthenticated || isMockSession) return
    loadWithdrawals()
    getBankAccount()
      .then((bank) => {
        if (!bank) return
        if (bank.bankName) setWithdrawBank(bank.bankName)
        if (bank.bankAccountNumber) setWithdrawAccount(bank.bankAccountNumber)
        if (bank.bankAccountHolder) setWithdrawHolder(bank.bankAccountHolder)
      })
      .catch(() => {})
  }, [isAuthenticated, isMockSession, loadWithdrawals])

  const currentAvailableBalance = useMemo(() => {
    if (wallet && typeof wallet.availableBalance === 'number') {
      return wallet.availableBalance
    }
    const local = localStorage.getItem('available_balance')
    if (local !== null && !isNaN(Number(local))) {
      return Number(local)
    }
    return 0
  }, [wallet])

  const maxWithdrawable = Math.max(0, currentAvailableBalance - MIN_MAINTENANCE_FEE)

  const handleOpenWithdrawModal = () => {
    if (currentAvailableBalance < MIN_MAINTENANCE_FEE) {
      setShowIneligibleModal(true)
      return
    }
    setWithdrawAmount(Math.min(100000, maxWithdrawable || 50000))
    setShowWithdrawModal(true)
  }

  const handleExecuteWithdraw = async (e) => {
    if (e) e.preventDefault()
    if (currentAvailableBalance < MIN_MAINTENANCE_FEE) {
      toast.error(
        `Số dư của bạn (${formatVND(
          currentAvailableBalance
        )}đ) chưa đủ mức tối thiểu 50.000đ (phí duy trì ví Player bắt buộc).`
      )
      return
    }
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Vui lòng nhập số tiền muốn rút hợp lệ.')
      return
    }
    if (withdrawAmount > maxWithdrawable) {
      toast.error(
        `Số tiền rút tối đa là ${formatVND(
          maxWithdrawable
        )}đ (Quy định: bắt buộc giữ lại tối thiểu 50.000đ phí duy trì ví của Player).`
      )
      return
    }
    if (!withdrawAccount.trim() || !withdrawHolder.trim()) {
      toast.error('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản ngân hàng.')
      return
    }

    setWithdrawSubmitting(true)
    try {
      // BE chỉ lưu 1 tài khoản nhận tiền: cập nhật trước, rồi tạo lệnh rút (POST /api/v1/wallet/withdrawals)
      await updateBankAccount({ bankName: withdrawBank, bankAccountNumber: withdrawAccount.trim(), bankAccountHolder: withdrawHolder.trim() })
      const created = await createWithdrawal(withdrawAmount)
      const receipt = toWithdrawalItem({
        ...(created || {}),
        amount: created?.amount ?? withdrawAmount,
        bankName: withdrawBank,
        bankAccountNumber: withdrawAccount.trim(),
        bankAccountHolder: withdrawHolder.trim(),
      })
      setShowWithdrawModal(false)
      setWithdrawReceipt({ ...receipt, remainingBalance: receipt.remainingBalance ?? currentAvailableBalance - withdrawAmount })
      toast.success(`🎉 Đã gửi yêu cầu rút ${formatVND(withdrawAmount)}đ tới Admin xét duyệt!`)
      loadWallet()
      reloadTransactions()
      loadWithdrawals()
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi gửi yêu cầu rút tiền.')
    } finally {
      setWithdrawSubmitting(false)
    }
  }

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
        <section aria-label="Tổng quan ví" className="mb-8">
          <div className="rounded-3xl p-6 sm:p-7 text-white shadow-xl bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#0D9488] relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -right-2 bottom-0 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

            {/* Left: Số dư & thông tin */}
            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  Số dư khả dụng
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-50 border border-white/25">
                  Phí duy trì: 50.000đ
                </span>
                {Number(wallet?.frozenBalance) > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-100 border border-amber-300/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    Tạm giữ: {formatVND(wallet?.frozenBalance)} đ
                  </span>
                )}
              </div>

              <p className="mt-1 text-3xl sm:text-4xl font-black tracking-tight">
                {walletLoading && !wallet ? '—' : `${formatVND(wallet?.availableBalance ?? currentAvailableBalance)} đ`}
              </p>
            </div>

            {/* Right: Nút Yêu Cầu Rút Tiền */}
            <div className="relative z-10 shrink-0 flex flex-col items-stretch sm:items-end gap-1.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/20">
              <button
                id="player-request-withdraw-btn"
                type="button"
                onClick={handleOpenWithdrawModal}
                className="py-3 px-6 rounded-2xl bg-white text-[#15803D] hover:bg-emerald-50 active:scale-[0.98] text-sm font-black flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
                <span>Yêu Cầu Rút Tiền</span>
              </button>
              <div className="text-[11px] text-emerald-100/85 text-center sm:text-right flex items-center justify-center sm:justify-end gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Yêu cầu số dư tối thiểu 50.000đ</span>
              </div>
            </div>
          </div>

          {walletError && (
            <p role="alert" className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
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

        {/* ---------- Switcher Lịch sử giao dịch ví & Yêu cầu rút tiền ---------- */}
        <section aria-labelledby="tx-history-title" className="mt-10 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F1F5F9] bg-[#FAFAFA]">
            {/* Tab switchers */}
            <div className="flex flex-wrap items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setHistoryTab('transactions')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                  historyTab === 'transactions'
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                <span>Lịch sử giao dịch ví ({txData.totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryTab('withdrawals')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                  historyTab === 'withdrawals'
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">account_balance</span>
                <span>Yêu cầu rút tiền ({myWithdrawals.length})</span>
                {myWithdrawals.filter((w) => w.status === WITHDRAW_STATUS.PENDING).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {myWithdrawals.filter((w) => w.status === WITHDRAW_STATUS.PENDING).length} chờ
                  </span>
                )}
              </button>
            </div>

            {historyTab === 'transactions' ? (
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
            ) : (
              <button
                type="button"
                onClick={handleOpenWithdrawModal}
                className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Tạo yêu cầu rút mới</span>
              </button>
            )}
          </div>

          {historyTab === 'transactions' ? (
            <>
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
            </>
          ) : (
            /* Tab Yêu cầu rút tiền */
            <div className="divide-y divide-[#F1F5F9]">
              {/* Alert quy định 50k */}
              <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/70 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">Quy định rút tiền cho Player: </span>
                  Hệ thống bắt buộc giữ lại tối thiểu <span className="font-extrabold text-emerald-700">50.000đ</span> trong ví làm phí duy trì tài khoản. 
                  Yêu cầu rút tiền sau khi gửi sẽ được Admin SportNexus đối soát và giải ngân qua tài khoản ngân hàng trong vòng 24 giờ làm việc.
                </div>
              </div>

              {myWithdrawals.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <span className="material-symbols-outlined text-[28px]">payments</span>
                  </div>
                  <p className="text-sm text-[#111827] font-bold">Bạn chưa có yêu cầu rút tiền nào</p>
                  <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                    Khi số dư khả dụng trên 50.000đ, bạn có thể tạo yêu cầu rút số tiền khả dụng về tài khoản ngân hàng cá nhân.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenWithdrawModal}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tạo yêu cầu rút tiền
                  </button>
                </div>
              ) : (
                myWithdrawals.map((item) => {
                  const isPending = item.status === WITHDRAW_STATUS.PENDING
                  const isApproved = item.status === WITHDRAW_STATUS.APPROVED
                  const isRejected = item.status === WITHDRAW_STATUS.REJECTED

                  return (
                    <div key={item.id} className="p-5 sm:p-6 hover:bg-[#FAFAFA] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span className="material-symbols-outlined text-[22px]">
                            {isApproved ? 'check_circle' : isRejected ? 'cancel' : 'hourglass_top'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-[#111827]">#{item.id}</span>
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Chờ Admin duyệt
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="material-symbols-outlined text-[13px]">done</span>
                                Đã duyệt & giải ngân
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="material-symbols-outlined text-[13px]">close</span>
                                Bị từ chối
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#334155] font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-[#64748B]">account_balance</span>
                            <span>{item.bank?.bankName}</span>
                            <span className="text-gray-300">•</span>
                            <span className="font-mono font-bold text-gray-900">{item.bank?.accountNumber}</span>
                            <span className="text-gray-300">•</span>
                            <span className="uppercase text-gray-700">{item.bank?.accountHolder}</span>
                          </p>

                          <p className="text-[11px] text-[#94A3B8]">
                            Tạo lúc: {item.createdAt}
                            {item.note && <span className="text-[#64748B]"> • Ghi chú: "{item.note}"</span>}
                          </p>

                          {/* Phản hồi từ Admin */}
                          {isApproved && item.adminNote && (
                            <div className="mt-1.5 text-xs text-emerald-800 bg-emerald-50/80 rounded-lg px-2.5 py-1.5 border border-emerald-200/60 flex items-start gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-emerald-600 shrink-0 mt-0.5">verified</span>
                              <span>Admin ghi chú: {item.adminNote}</span>
                            </div>
                          )}

                          {isRejected && (
                            <div className="mt-1.5 text-xs text-rose-800 bg-rose-50 rounded-lg px-2.5 py-1.5 border border-rose-200 flex items-start gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-rose-600 shrink-0 mt-0.5">info</span>
                              <div>
                                <p className="font-bold">Lý do từ chối: {item.rejectReason || 'Không hợp lệ'}</p>
                                <p className="text-[11px] text-rose-600 mt-0.5">Tiền đã được hoàn lại đầy đủ vào số dư ví của bạn.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-gray-200 sm:pl-4">
                        <p className="text-base font-black text-rose-600">
                          - {formatVND(item.amount)} đ
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Số dư giữ lại: <span className="font-bold text-[#15803D]">50.000 đ</span>
                        </p>
                        <p className="text-[10.5px] text-[#94A3B8]">
                          Số dư sau rút: {formatVND(item.remainingBalance ?? 0)} đ
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
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
      {/* ==================== MODAL CẢNH BÁO: CHƯA ĐỦ ĐIỀU KIỆN RÚT TIỀN (<50k) ==================== */}
      {showIneligibleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-amber-100">
            <button
              type="button"
              onClick={() => setShowIneligibleModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="text-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border-2 border-amber-200 shadow-sm">
                <span className="material-symbols-outlined text-[36px]">shield</span>
              </div>

              <h3 className="text-xl font-black text-gray-900">Chưa Đủ Điều Kiện Rút Tiền</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed px-2">
                Theo quy định của hệ thống SportNexus, tài khoản của role <strong className="text-emerald-700">Player</strong> phải duy trì số dư khả dụng tối thiểu <strong className="text-gray-900">50.000đ</strong> làm phí duy trì tài khoản.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Số dư khả dụng hiện tại:</span>
                  <span className="font-extrabold text-rose-600 text-sm">{formatVND(currentAvailableBalance)} đ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Mức phí duy trì bắt buộc:</span>
                  <span className="font-bold text-gray-800 text-sm">50.000 đ</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Cần có thêm tối thiểu:</span>
                  <span className="font-black text-amber-600">
                    {formatVND(Math.max(0, MIN_MAINTENANCE_FEE - currentAvailableBalance))} đ
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowIneligibleModal(false)
                    const el = document.getElementById('deposit-amount-input')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      el.focus()
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_card</span>
                  <span>Nạp thêm tiền vào ví</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowIneligibleModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                >
                  Đã hiểu quy định
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL FORM: YÊU CẦU RÚT TIỀN ==================== */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 border border-gray-100 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <span className="material-symbols-outlined text-[26px]">account_balance</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#111827]">Tạo Yêu Cầu Rút Tiền</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Role Player • Admin SportNexus sẽ duyệt yêu cầu</p>
              </div>
            </div>

            {/* Balance Overview & Maintenance Fee Notice */}
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#334155] font-medium">Số dư khả dụng hiện tại:</span>
                <span className="font-extrabold text-gray-900">{formatVND(currentAvailableBalance)} đ</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#334155] font-medium flex items-center gap-1">
                  <span>Phí duy trì bắt buộc:</span>
                  <span className="material-symbols-outlined text-[14px] text-emerald-700" title="Bắt buộc giữ lại làm phí duy trì ví Player">shield</span>
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">50.000 đ</span>
              </div>
              <div className="h-px bg-emerald-200/60 my-1" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-950 font-bold">Số tiền tối đa có thể rút:</span>
                <span className="font-black text-[#15803D] text-sm">{formatVND(maxWithdrawable)} đ</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleExecuteWithdraw} className="space-y-4">
              {/* Ngân hàng */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 bg-white"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.logo} {b.name} ({b.shortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Số tài khoản & Tên chủ thẻ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Số tài khoản <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="VD: 0071001234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-bold text-gray-900 outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Chủ tài khoản <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={withdrawHolder}
                    onChange={(e) => setWithdrawHolder(e.target.value.toUpperCase())}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 uppercase outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                    required
                  />
                </div>
              </div>

              {/* Số tiền muốn rút */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Số tiền muốn rút (VND) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(maxWithdrawable)}
                    className="text-[11px] font-bold text-[#15803D] hover:underline cursor-pointer"
                  >
                    Rút tối đa ({formatVND(maxWithdrawable)}đ)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={1000}
                    min={10000}
                    max={maxWithdrawable}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className={`w-full px-3.5 py-3 rounded-xl border text-lg font-black outline-none transition pr-10 ${
                      withdrawAmount > maxWithdrawable
                        ? 'border-rose-400 bg-rose-50/40 text-rose-700 focus:ring-2 focus:ring-rose-200'
                        : 'border-gray-300 text-gray-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20'
                    }`}
                    placeholder="Nhập số tiền..."
                    required
                  />
                  <span className="absolute right-3.5 top-3.5 font-bold text-gray-400 text-sm">đ</span>
                </div>

                {/* Quick amount chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[50000, 100000, 200000, 500000]
                    .filter((val) => val <= maxWithdrawable)
                    .map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setWithdrawAmount(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          withdrawAmount === val
                            ? 'bg-[#15803D] text-white border-[#15803D]'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {formatVND(val)} đ
                      </button>
                    ))}
                </div>

                {/* Validation warnings */}
                {withdrawAmount > maxWithdrawable ? (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    <span>Số tiền rút vượt quá hạn mức! Phải giữ lại tối thiểu 50.000đ phí duy trì ví.</span>
                  </p>
                ) : (
                  <div className="mt-2 text-xs text-[#64748B] flex items-center justify-between px-1">
                    <span>Số dư ví còn lại sau rút:</span>
                    <span className="font-bold text-[#111827]">
                      {formatVND(Math.max(0, currentAvailableBalance - withdrawAmount))} đ (≥ 50.000đ phí duy trì)
                    </span>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Ghi chú cho Admin (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="VD: Rút tiền dư sau giải đấu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 outline-none focus:border-[#15803D]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={
                    withdrawSubmitting ||
                    !withdrawAmount ||
                    withdrawAmount <= 0 ||
                    withdrawAmount > maxWithdrawable
                  }
                  className="flex-2 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {withdrawSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span>Đang gửi yêu cầu…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Gửi Yêu Cầu Cho Admin Duyệt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL BIÊN LAI: GỬI YÊU CẦU RÚT TIỀN THÀNH CÔNG ==================== */}
      {withdrawReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center mx-auto mb-3 text-emerald-700">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <h3 className="text-xl font-black text-gray-900">Đã Gửi Yêu Cầu Rút Tiền!</h3>
            <p className="text-xs text-gray-500 mt-1">
              Admin SportNexus đã nhận được yêu cầu của bạn và sẽ tiến hành đối soát, giải ngân trong 24 giờ làm việc.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mã yêu cầu:</span>
                <span className="font-mono font-bold text-gray-900">#{withdrawReceipt.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tiền rút:</span>
                <span className="font-extrabold text-rose-600 text-sm">- {formatVND(withdrawReceipt.amount)} đ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Phí duy trì giữ lại:</span>
                <span className="font-bold text-[#15803D]">50.000 đ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số dư còn lại:</span>
                <span className="font-bold text-gray-800">{formatVND(withdrawReceipt.remainingBalance)} đ</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-bold text-gray-800">{withdrawReceipt.bank?.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-gray-800">{withdrawReceipt.bank?.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Chủ tài khoản:</span>
                <span className="font-bold text-gray-800 uppercase">{withdrawReceipt.bank?.accountHolder}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setWithdrawReceipt(null)
                  setHistoryTab('withdrawals')
                  const el = document.getElementById('tx-history-title')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-extrabold text-xs transition shadow-sm cursor-pointer"
              >
                Xem danh sách yêu cầu rút tiền
              </button>
              <button
                type="button"
                onClick={() => setWithdrawReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
