import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DEPOSIT_STATUS,
  clearPendingDeposit,
  getDepositByOrderCode,
  getWallet,
  normalizeDepositStatus,
  readPendingDeposit,
} from '../../api/player/walletApi.js'
import DepositResultCard, { PrimaryButton, SecondaryButton } from './DepositResultCard.jsx'
import { formatVND, resolveReturnTarget } from './depositUtils.js'

/**
 * Trang returnUrl của PayOS: /wallet/deposit-success?code=00&id=...&cancel=false&status=PAID&orderCode=...
 *
 * 1. Đọc orderCode trên URL.
 * 2. Gọi GET /api/v1/wallet/deposits/{orderCode} để kiểm tra.
 * 3. Nếu vẫn PENDING_PAYMENT (webhook đến chậm) → gọi lại mỗi 2–3 giây, tối đa ~30 giây.
 * 4. Khi SUCCESS → báo thành công, gọi GET /api/v1/wallet cập nhật số dư, rồi quay về màn đặt sân.
 *
 * ⚠️ KHÔNG tin tham số status=PAID trên URL — chỉ tin trạng thái lấy từ API BE.
 */
const POLL_INTERVAL_MS = 2500
const MAX_POLL_MS = 30000
const AUTO_RETURN_SECONDS = 5

// phase: CHECKING | PENDING | SUCCESS | CANCELLED | FAILED | TIMEOUT | NOT_FOUND | ERROR
export default function DepositSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Chốt giá trị ở lần render đầu (ngữ cảnh lệnh nạp sẽ bị xóa sau khi có kết quả)
  // Chỉ dùng `orderCode` (tham số `id` của PayOS là paymentLinkId, không phải orderCode)
  const [initial] = useState(() => {
    const pending = readPendingDeposit()
    const code = searchParams.get('orderCode') || pending?.orderCode || null
    return { orderCode: code ? String(code) : null, returnTarget: resolveReturnTarget(pending, code) }
  })
  const { orderCode } = initial

  const [phase, setPhase] = useState(orderCode ? 'CHECKING' : 'NOT_FOUND')
  const [deposit, setDeposit] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(MAX_POLL_MS / 1000))
  const [attempt, setAttempt] = useState(0)
  const [autoReturnIn, setAutoReturnIn] = useState(null)
  // Màn cần quay lại sau khi nạp: chốt 1 lần ở lần render đầu (không đổi)
  const returnTarget = initial.returnTarget

  const goBackToBooking = useCallback(() => {
    const target = returnTarget
    if (target) navigate(target.path, { state: target.state })
    else navigate('/court-finder')
  }, [navigate, returnTarget])

  // Bước 2 + 3: kiểm tra trạng thái và polling khi còn PENDING_PAYMENT
  useEffect(() => {
    if (!orderCode) return undefined
    let active = true
    let timer = null
    const startedAt = Date.now()

    const handleSuccess = async (data) => {
      setPhase('SUCCESS')
      clearPendingDeposit()
      // Bước 4: cập nhật số dư
      try {
        const w = await getWallet()
        if (active) setWallet(w)
      } catch { /* bỏ qua: không ảnh hưởng luồng chính */ }
      // Tránh báo trùng khi F5 trang
      const notifiedKey = `deposit_notified_${orderCode}`
      if (!sessionStorage.getItem(notifiedKey)) {
        sessionStorage.setItem(notifiedKey, '1')
        toast.success(`Nạp tiền thành công +${formatVND(data?.amount)} đ`)
        window.dispatchEvent(
          new CustomEvent('player_new_notification', {
            detail: {
              type: 'wallet',
              icon: 'account_balance_wallet',
              color: '#16A34A',
              bg: '#DCFCE7',
              title: 'Nạp tiền thành công!',
              message: `Đã nạp +${formatVND(data?.amount)} đ vào Ví Escrow.`,
              details: `Mã lệnh: #${orderCode}`,
              link: '/wallet',
              linkText: 'Xem số dư ví',
            },
          })
        )
      }
      if (active && returnTarget) setAutoReturnIn(AUTO_RETURN_SECONDS)
    }

    const tick = async () => {
      try {
        const data = await getDepositByOrderCode(orderCode)
        if (!active) return
        setDeposit(data)
        const status = normalizeDepositStatus(data?.status)

        if (status === DEPOSIT_STATUS.SUCCESS) return handleSuccess(data)
        if (status === DEPOSIT_STATUS.CANCELLED) {
          clearPendingDeposit()
          return setPhase('CANCELLED')
        }
        if (status === DEPOSIT_STATUS.FAILED) {
          clearPendingDeposit()
          return setPhase('FAILED')
        }
      } catch (err) {
        if (!active) return
        if (err?.status === 404) {
          setErrorMessage(err.message || 'Không tìm thấy yêu cầu nạp tiền')
          return setPhase('NOT_FOUND')
        }
        if (err?.status === 401) return // apiClient đã xử lý đăng xuất / chuyển về login
        // Lỗi mạng tạm thời → tiếp tục thử lại trong khung 30s
      }

      const elapsed = Date.now() - startedAt
      if (elapsed >= MAX_POLL_MS) return setPhase('TIMEOUT')
      setPhase('PENDING')
      setSecondsLeft(Math.max(0, Math.ceil((MAX_POLL_MS - elapsed) / 1000)))
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }

    tick()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [orderCode, attempt, returnTarget])

  // Tự quay về màn đặt sân sau khi thành công (nếu người dùng đến từ màn đặt sân)
  useEffect(() => {
    if (autoReturnIn === null) return undefined
    if (autoReturnIn <= 0) {
      goBackToBooking()
      return undefined
    }
    const t = setTimeout(() => setAutoReturnIn((s) => (s === null ? null : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [autoReturnIn, goBackToBooking])

  const amount = deposit?.amount
  const rows = [
    { label: 'Mã lệnh nạp', value: `#${orderCode || 'N/A'}`, className: 'font-mono font-bold text-gray-900' },
    ...(amount ? [{ label: 'Số tiền nạp', value: `+${formatVND(amount)} đ`, className: 'font-extrabold text-emerald-700 text-base' }] : []),
    ...(wallet
      ? [
          { label: 'Số dư ví', value: `${formatVND(wallet.balance)} đ` },
          { label: 'Số dư khả dụng', value: `${formatVND(wallet.availableBalance)} đ`, className: 'font-extrabold text-emerald-800' },
        ]
      : []),
  ]

  // Đặt lại trạng thái kiểm tra ngay khi bấm thử lại; lần đầu đã khởi tạo sẵn
  const retry = () => {
    setPhase('CHECKING')
    setSecondsLeft(Math.ceil(MAX_POLL_MS / 1000))
    setAttempt((n) => n + 1)
  }
  const savedTarget = returnTarget
  const backLabel = savedTarget?.label || (savedTarget ? 'Quay lại đặt sân' : 'Tiếp tục đặt sân')

  if (phase === 'SUCCESS') {
    return (
      <DepositResultCard
        tone="success"
        breadcrumb="Nạp tiền thành công"
        title="Nạp tiền thành công!"
        message="Tiền đã được cộng vào Ví Escrow của bạn."
        statusLabel="SUCCESS"
        rows={rows}
        footnote={
          autoReturnIn !== null && autoReturnIn > 0
            ? `Tự động quay lại màn đặt sân sau ${autoReturnIn} giây…`
            : null
        }
      >
        <PrimaryButton id="deposit-success-back-booking" icon="sports_tennis" onClick={goBackToBooking}>
          {backLabel}
        </PrimaryButton>
        <SecondaryButton
          id="deposit-success-view-wallet"
          icon="account_balance_wallet"
          onClick={() => {
            setAutoReturnIn(null)
            navigate('/wallet')
          }}
        >
          Xem ví
        </SecondaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'CHECKING' || phase === 'PENDING') {
    return (
      <DepositResultCard
        tone="loading"
        breadcrumb="Đang xác nhận"
        title="Đang xác nhận giao dịch…"
        message={
          phase === 'PENDING'
            ? `Đang chờ ngân hàng xác nhận thanh toán, tự kiểm tra lại mỗi vài giây (còn ~${secondsLeft}s).`
            : 'Đang kiểm tra trạng thái lệnh nạp với hệ thống…'
        }
        statusLabel="PENDING_PAYMENT"
        rows={rows}
        footnote="Vui lòng không đóng trang trong lúc hệ thống xác nhận."
      >
        <SecondaryButton id="deposit-success-goto-wallet" icon="account_balance_wallet" onClick={() => navigate('/wallet')}>
          Về ví
        </SecondaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'TIMEOUT') {
    return (
      <DepositResultCard
        tone="warning"
        breadcrumb="Đang chờ xử lý"
        title="Giao dịch đang chờ xác nhận"
        message="Ngân hàng phản hồi chậm hơn bình thường. Nếu bạn đã chuyển khoản, tiền sẽ tự động được cộng vào ví ngay khi có xác nhận."
        statusLabel="PENDING_PAYMENT"
        rows={rows}
      >
        <PrimaryButton id="deposit-success-retry" icon="refresh" onClick={retry}>
          Kiểm tra lại
        </PrimaryButton>
        <SecondaryButton id="deposit-success-goto-wallet" icon="account_balance_wallet" onClick={() => navigate('/wallet')}>
          Về ví
        </SecondaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'CANCELLED') {
    return (
      <DepositResultCard
        tone="cancelled"
        breadcrumb="Đã hủy"
        title="Lệnh nạp đã bị hủy"
        message="Lệnh nạp tiền này đã được hủy, ví của bạn không bị trừ tiền."
        statusLabel="CANCELLED"
        rows={rows}
      >
        <PrimaryButton id="deposit-success-redeposit" icon="replay" onClick={() => navigate('/wallet')}>
          Nạp lại
        </PrimaryButton>
      </DepositResultCard>
    )
  }

  if (phase === 'FAILED') {
    return (
      <DepositResultCard
        tone="error"
        breadcrumb="Thất bại"
        title="Nạp tiền không thành công"
        message={deposit?.reason || deposit?.message || 'Giao dịch qua cổng PayOS không thành công. Vui lòng thử lại.'}
        statusLabel="FAILED"
        rows={rows}
      >
        <PrimaryButton id="deposit-success-redeposit" icon="replay" onClick={() => navigate('/wallet')}>
          Nạp lại
        </PrimaryButton>
      </DepositResultCard>
    )
  }

  // NOT_FOUND / ERROR
  return (
    <DepositResultCard
      tone="error"
      breadcrumb="Không tìm thấy"
      title="Không tìm thấy yêu cầu nạp tiền"
      message={errorMessage || 'Đường dẫn không chứa mã lệnh nạp (orderCode) hợp lệ.'}
      rows={orderCode ? rows.slice(0, 1) : []}
    >
      <PrimaryButton id="deposit-success-goto-wallet" icon="account_balance_wallet" onClick={() => navigate('/wallet')}>
        Về ví
      </PrimaryButton>
    </DepositResultCard>
  )
}
