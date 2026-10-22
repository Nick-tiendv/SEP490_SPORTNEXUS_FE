import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DEPOSIT_STATUS,
  cancelDeposit,
  clearPendingDeposit,
  getDepositByOrderCode,
  getWallet,
  normalizeDepositStatus,
  readPendingDeposit,
} from '../../api/walletApi.js'
import DepositResultCard, { PrimaryButton, SecondaryButton, formatVND } from './DepositResultCard.jsx'

/**
 * Trang cancelUrl của PayOS: /wallet/deposit-cancel?code=00&id=...&cancel=true&status=CANCELLED&orderCode=...
 *
 * 1. Đọc orderCode.
 * 2. Gọi POST /api/v1/wallet/deposits/{orderCode}/cancel.
 * 3. Báo "Đã hủy nạp tiền" và quay lại màn ví.
 *
 * Nếu BE trả 400 (lệnh đã thanh toán / đã hủy) → đọc lại trạng thái thật từ BE để hiển thị đúng.
 */
const AUTO_BACK_SECONDS = 4

// Gộp các request hủy trùng (React StrictMode chạy effect 2 lần ở môi trường dev)
const inflightCancels = new Map()
function cancelOnce(orderCode) {
  if (!inflightCancels.has(orderCode)) {
    const p = cancelDeposit(orderCode).finally(() => {
      setTimeout(() => inflightCancels.delete(orderCode), 2000)
    })
    inflightCancels.set(orderCode, p)
  }
  return inflightCancels.get(orderCode)
}

// phase: CANCELLING | CANCELLED | ALREADY_PAID | ALREADY_CANCELLED | NOT_FOUND | ERROR
export default function DepositCancel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orderCode] = useState(() => {
    const code = searchParams.get('orderCode') || readPendingDeposit()?.orderCode || null
    return code ? String(code) : null
  })

  const [phase, setPhase] = useState(orderCode ? 'CANCELLING' : 'NOT_FOUND')
  const [deposit, setDeposit] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [autoBackIn, setAutoBackIn] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!orderCode) return undefined
    let active = true
    setPhase('CANCELLING')

    const run = async () => {
      try {
        const res = await cancelOnce(orderCode)
        if (!active) return
        setDeposit(res)
        clearPendingDeposit()
        setPhase('CANCELLED')
        toast.info('Đã hủy nạp tiền')
        setAutoBackIn(AUTO_BACK_SECONDS)
      } catch (err) {
        if (!active) return
        if (err?.status === 404) {
          clearPendingDeposit()
          setErrorMessage(err.message || 'Không tìm thấy yêu cầu nạp tiền')
          return setPhase('NOT_FOUND')
        }
        if (err?.status === 400) {
          // Lệnh không còn ở trạng thái chờ → lấy trạng thái thật để báo đúng cho người dùng
          try {
            const data = await getDepositByOrderCode(orderCode)
            if (!active) return
            setDeposit(data)
            const status = normalizeDepositStatus(data?.status)
            clearPendingDeposit()
            if (status === DEPOSIT_STATUS.SUCCESS) {
              try {
                const w = await getWallet()
                if (active) setWallet(w)
              } catch {}
              return setPhase('ALREADY_PAID')
            }
            if (status === DEPOSIT_STATUS.CANCELLED || status === DEPOSIT_STATUS.FAILED) {
              setAutoBackIn(AUTO_BACK_SECONDS)
              return setPhase('ALREADY_CANCELLED')
            }
          } catch {}
        }
        if (err?.status === 401) return
        setErrorMessage(err?.message || 'Không thể hủy lệnh nạp. Vui lòng thử lại.')
        setPhase('ERROR')
      }
    }

    run()
    return () => {
      active = false
    }
  }, [orderCode, attempt])

  // Tự quay về màn ví
  useEffect(() => {
    if (autoBackIn === null) return undefined
    if (autoBackIn <= 0) {
      navigate('/wallet', { replace: true })
      return undefined
    }
    const t = setTimeout(() => setAutoBackIn((s) => (s === null ? null : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [autoBackIn, navigate])

  const rows = [
    { label: 'Mã lệnh nạp', value: `#${orderCode || 'N/A'}`, className: 'font-mono font-bold text-gray-900' },
    ...(deposit?.amount ? [{ label: 'Số tiền', value: `${formatVND(deposit.amount)} đ` }] : []),
    ...(wallet ? [{ label: 'Số dư khả dụng', value: `${formatVND(wallet.availableBalance)} đ`, className: 'font-extrabold text-emerald-800' }] : []),
  ]
  const backFootnote = autoBackIn !== null && autoBackIn > 0 ? `Tự động quay lại màn ví sau ${autoBackIn} giây…` : null
  const goWallet = () => navigate('/wallet', { replace: true })

  if (phase === 'CANCELLING') {
    return (
      <DepositResultCard tone="loading" breadcrumb="Đang hủy" title="Đang hủy lệnh nạp…" message="Vui lòng chờ trong giây lát." rows={rows} />
    )
  }

  if (phase === 'CANCELLED' || phase === 'ALREADY_CANCELLED') {
    return (
      <DepositResultCard
        tone="cancelled"
        breadcrumb="Đã hủy nạp tiền"
        title="Đã hủy nạp tiền"
        message={
          phase === 'CANCELLED'
            ? 'Lệnh nạp tiền đã được hủy. Ví của bạn không bị trừ tiền.'
            : 'Lệnh nạp này đã được hủy trước đó.'
        }
        statusLabel="CANCELLED"
        rows={rows}
        footnote={backFootnote}
      >
        <PrimaryButton id="deposit-cancel-back-wallet" icon="account_balance_wallet" onClick={goWallet}>
          Quay lại ví
        </PrimaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'ALREADY_PAID') {
    return (
      <DepositResultCard
        tone="success"
        breadcrumb="Đã thanh toán"
        title="Lệnh nạp đã được thanh toán"
        message="Giao dịch này đã thanh toán thành công nên không thể hủy. Tiền đã được cộng vào ví của bạn."
        statusLabel="SUCCESS"
        rows={rows}
      >
        <PrimaryButton id="deposit-cancel-view-wallet" icon="account_balance_wallet" onClick={goWallet}>
          Xem ví
        </PrimaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'ERROR') {
    return (
      <DepositResultCard tone="error" breadcrumb="Lỗi" title="Chưa hủy được lệnh nạp" message={errorMessage} rows={rows}>
        <PrimaryButton id="deposit-cancel-retry" icon="refresh" onClick={() => setAttempt((n) => n + 1)}>
          Thử lại
        </PrimaryButton>
        <SecondaryButton id="deposit-cancel-back-wallet" icon="account_balance_wallet" onClick={goWallet}>
          Về ví
        </SecondaryButton>
      </DepositResultCard>
    )
  }

  return (
    <DepositResultCard
      tone="error"
      breadcrumb="Không tìm thấy"
      title="Không tìm thấy yêu cầu nạp tiền"
      message={errorMessage || 'Đường dẫn không chứa mã lệnh nạp (orderCode) hợp lệ.'}
      rows={orderCode ? rows.slice(0, 1) : []}
    >
      <PrimaryButton id="deposit-cancel-back-wallet" icon="account_balance_wallet" onClick={goWallet}>
        Về ví
      </PrimaryButton>
    </DepositResultCard>
  )
}
