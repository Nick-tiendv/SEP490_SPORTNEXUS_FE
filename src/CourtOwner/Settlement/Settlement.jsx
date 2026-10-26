import { useEffect, useState } from 'react'
import {
  cancelWithdrawal,
  createWithdrawal,
  getBankAccount,
  getMyTransactions,
  getMyWithdrawals,
  getOwnerEarnings,
  updateBankAccount,
} from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const daysAgoVN = (days) => new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIME_ZONE }).format(new Date(Date.now() - days * 86400000))
const formatDateTimeVN = (value) =>
  value ? new Date(value).toLocaleString('vi-VN', { timeZone: VN_TIME_ZONE, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const formatVND = (num) => (num === null || num === undefined ? '—' : new Intl.NumberFormat('vi-VN').format(Number(num) || 0) + ' đ')
const parseAmount = (text) => Number(String(text).replace(/\D/g, '')) || 0

const PERIOD_OPTIONS = [7, 30, 90]
const MIN_WITHDRAWAL = 50000
const PAGE_SIZE = 10
const COMMON_BANKS = ['Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank', 'MB Bank', 'ACB', 'VPBank', 'TPBank', 'Sacombank', 'VIB', 'HDBank', 'SHB', 'OCB', 'MSB', 'SeABank']

const TXN_TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PAYOUT', label: 'Chi trả' },
  { key: 'RELEASE', label: 'Chuyển tiền giữ' },
  { key: 'REFUND', label: 'Hoàn tiền' },
  { key: 'FREEZE', label: 'Tạm giữ' },
  { key: 'DEPOSIT', label: 'Nạp tiền' },
]
const TXN_TYPE_LABEL = Object.fromEntries(TXN_TABS.filter((tab) => tab.key).map((tab) => [tab.key, tab.label]))

const WITHDRAWAL_STATUS = {
  PENDING: { label: 'Chờ duyệt', bg: '#FEF3C7', color: '#B45309' },
  COMPLETED: { label: 'Đã chuyển', bg: '#DCFCE7', color: '#15803D' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', color: '#B91C1C' },
  CANCELLED: { label: 'Đã hủy', bg: '#F1F5F9', color: '#475569' },
}

// Tải dữ liệu theo khóa: đổi khóa (bộ lọc / trang / lần tải lại) thì tải lại; giữ dữ liệu cũ trong lúc chờ.
function useLoad(load, key) {
  const [state, setState] = useState(null) // { key, data, error }
  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => !cancelled && setState({ key, data, error: '' }))
      .catch((error) => !cancelled && setState({ key, data: null, error: error.message }))
    return () => { cancelled = true }
    // `key` mã hóa mọi tham số của `load`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return { data: state?.data ?? null, error: state?.key === key ? state.error : '', loading: state?.key !== key }
}

export default function Settlement() {
  const { wallet, refreshWallet } = useOwnerContext()
  const [periodDays, setPeriodDays] = useState(30)
  const [reloadToken, setReloadToken] = useState(0)
  const [txnType, setTxnType] = useState('')
  const [txnPage, setTxnPage] = useState(1)
  const [withdrawalPage, setWithdrawalPage] = useState(1)

  const earnings = useLoad(() => getOwnerEarnings({ from: daysAgoVN(periodDays - 1), to: daysAgoVN(0) }), `${periodDays}|${reloadToken}`)
  const bank = useLoad(() => getBankAccount(), `${reloadToken}`)
  const withdrawals = useLoad(() => getMyWithdrawals({ page: withdrawalPage, pageSize: PAGE_SIZE }), `${withdrawalPage}|${reloadToken}`)
  const transactions = useLoad(
    () => getMyTransactions({ type: txnType || undefined, page: txnPage, pageSize: PAGE_SIZE }),
    `${txnType}|${txnPage}|${reloadToken}`,
  )

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: '', bankAccountNumber: '', bankAccountHolder: '' })
  const [busy, setBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const reloadAll = () => {
    setReloadToken((value) => value + 1)
    refreshWallet().catch(() => {})
  }

  const e = earnings.data
  const availableBalance = Number(wallet?.availableBalance ?? wallet?.balance ?? 0)
  const bankAccount = bank.data?.bankAccountNumber ? bank.data : null
  const withdrawalItems = withdrawals.data?.items || []
  const pendingWithdrawal = withdrawalItems.find((item) => String(item.status).toUpperCase() === 'PENDING')
  const txnItems = transactions.data?.items || []
  const txnTotalPages = transactions.data ? Math.max(1, transactions.data.totalPages || Math.ceil((transactions.data.total || 0) / PAGE_SIZE)) : 1
  const withdrawalTotalPages = withdrawals.data ? Math.max(1, withdrawals.data.totalPages || Math.ceil((withdrawals.data.total || 0) / PAGE_SIZE)) : 1

  const openBankModal = () => {
    setBankForm({
      bankName: bank.data?.bankName || '',
      bankAccountNumber: bank.data?.bankAccountNumber || '',
      bankAccountHolder: bank.data?.bankAccountHolder || '',
    })
    setShowBankModal(true)
  }

  const openWithdrawModal = () => {
    if (!bankAccount) {
      showToast('Vui lòng lưu tài khoản ngân hàng trước khi rút tiền.', 'error')
      openBankModal()
      return
    }
    setWithdrawAmount('')
    setShowWithdrawModal(true)
  }

  // PUT /wallet/bank-account
  const handleSaveBank = async (event) => {
    event.preventDefault()
    const payload = {
      bankName: bankForm.bankName.trim(),
      bankAccountNumber: bankForm.bankAccountNumber.replace(/\s/g, ''),
      bankAccountHolder: bankForm.bankAccountHolder.trim().toUpperCase(),
    }
    if (!/^\d{6,20}$/.test(payload.bankAccountNumber)) {
      showToast('Số tài khoản chỉ gồm 6 đến 20 chữ số.', 'error')
      return
    }
    setBusy(true)
    try {
      await updateBankAccount(payload)
      showToast('Đã lưu tài khoản ngân hàng.')
      setShowBankModal(false)
      setReloadToken((value) => value + 1)
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  // POST /wallet/withdrawals — tiền bị giữ tạm tới khi Admin duyệt
  const handleWithdraw = async (event) => {
    event.preventDefault()
    const amount = parseAmount(withdrawAmount)
    if (amount < MIN_WITHDRAWAL) {
      showToast(`Số tiền rút tối thiểu ${formatVND(MIN_WITHDRAWAL)}.`, 'error')
      return
    }
    if (amount > availableBalance) {
      showToast(`Số dư không đủ (hiện có ${formatVND(availableBalance)}).`, 'error')
      return
    }
    setBusy(true)
    try {
      await createWithdrawal(amount)
      showToast('Đã gửi yêu cầu rút tiền, vui lòng chờ Quản trị viên xử lý.')
      setShowWithdrawModal(false)
      setWithdrawalPage(1)
      reloadAll()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleCancelWithdrawal = async (item) => {
    if (!window.confirm(`Hủy yêu cầu rút ${formatVND(item.amount)}? Tiền sẽ được trả lại ví.`)) return
    setBusy(true)
    try {
      await cancelWithdrawal(item.id)
      showToast('Đã hủy yêu cầu rút tiền, tiền đã trả lại ví.')
      reloadAll()
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  // Xuất CSV các giao dịch đang hiển thị
  const handleExportCsv = () => {
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['Thời gian', 'Loại', 'Mô tả', 'Số tiền', 'Biến động số dư', 'Trạng thái'],
      ...txnItems.map((txn) => [formatDateTimeVN(txn.createdAt), TXN_TYPE_LABEL[txn.type] || txn.type, txn.description, txn.amount, txn.balanceChange, txn.status]),
    ]
    const blob = new Blob(['﻿' + rows.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `giao-dich-trang-${txnPage}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const panelStyle = {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(45, 95, 63, 0.16)',
    padding: '24px',
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
  }
  const cardStyle = { ...panelStyle, padding: '22px 24px' }
  const labelStyle = { fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }
  const pagerButton = (disabled) => ({ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, color: '#334155', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 })
  const value = (v) => (e ? formatVND(v) : earnings.error ? '—' : '...')

  // Chi tiết thu nhập trong kỳ: dòng âm là khoản trừ
  const breakdown = e
    ? [
        ['Tiền đặt sân đã nhận', e.bookingEarnings, 'Đơn đã chơi xong, đã trừ phí nền tảng và phần hoàn cho khách'],
        ['Phí hủy đơn', e.cancellationFeeEarnings],
        ['Phí tham gia giải đấu', e.tournamentFeeEarnings],
        ['Tiền thưởng giải đã trả', -Math.abs(Number(e.prizesPaid) || 0)],
        ['Mua gói đẩy tin', -Math.abs(Number(e.promotionSpending) || 0)],
      ]
    : []
  const facilityItems = (e?.byFacility || []).map((item) => ({ ...item, total: (Number(item.bookingEarnings) || 0) + (Number(item.cancellationFeeEarnings) || 0) }))
  const facilityMax = Math.max(1, ...facilityItems.map((item) => item.total))

  return (
    <div className="snx-page">
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
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toastMessage.msg}
        </div>
      )}

      {/* Header section */}
      <div className="snx-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="snx-page-eyebrow">
              FINANCIAL SETTLEMENT HUB
            </span>
            <select
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
              title="Kỳ báo cáo"
              style={{ padding: '4px 10px', borderRadius: '20px', border: '1px solid #86EFAC', background: '#DCFCE7', color: '#15803D', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
            >
              {PERIOD_OPTIONS.map((days) => (
                <option key={days} value={days}>{days} ngày gần nhất</option>
              ))}
            </select>
          </div>
          <h1 className="snx-page-title">
            Báo Cáo Doanh Thu &amp; Rút Tiền
          </h1>
          <p className="snx-page-subtitle">
            Theo dõi thu nhập vào ví, tiền đặt sân đang giữ và gửi yêu cầu rút tiền về tài khoản ngân hàng (Quản trị viên duyệt thủ công).
          </p>
          {earnings.error && <p style={{ margin: '6px 0 0 0', color: '#B91C1C', fontSize: '13px', fontWeight: 700 }}>Không tải được báo cáo: {earnings.error}</p>}
        </div>

        <button
          onClick={openWithdrawModal}
          disabled={!!pendingWithdrawal}
          title={pendingWithdrawal ? 'Bạn đang có 1 yêu cầu rút tiền chờ xử lý' : undefined}
          style={{
            background: pendingWithdrawal ? '#94A3B8' : 'linear-gradient(135deg, #15803D 0%, #047857 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '15px 26px',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: pendingWithdrawal ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: pendingWithdrawal ? 'none' : '0 6px 20px rgba(21, 128, 61, 0.32)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>payments</span>
          <span>{pendingWithdrawal ? 'ĐANG CHỜ DUYỆT RÚT TIỀN' : 'TẠO YÊU CẦU RÚT TIỀN'}</span>
        </button>
      </div>

      {/* 4 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #15803D 55%, #047857 100%)', borderRadius: '20px', padding: '22px 24px', color: '#FFFFFF', boxShadow: '0 12px 30px -4px rgba(21, 128, 61, 0.35)' }}>
          <div style={{ ...labelStyle, color: '#A7F3D0' }}>Số dư khả dụng</div>
          <div style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0' }}>{formatVND(availableBalance)}</div>
          <div style={{ fontSize: '12.5px', color: '#D1FAE5', fontWeight: 600 }}>Đang tạm giữ: {formatVND(wallet?.frozenBalance)}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#B45309' }}>Tiền đặt sân chờ chuyển</div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#B45309' }}>{value(e?.pendingBookingAmount)}</div>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
            {e ? `${e.pendingBookings} đơn • chuyển vào ví sau giờ chơi + ${e.settlementHoldHours} giờ` : 'Tiền nền tảng đang giữ cho bạn'}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#1D4ED8' }}>Thực nhận ({periodDays} ngày)</div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#0F172A' }}>{value(e?.netIncome)}</div>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
            {e ? `Tiền mặt tại quầy (ngoài ví): ${formatVND(e.walkInCashRevenue)}` : 'Tiền vào ví trong kỳ'}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#6D28D9' }}>Phí nền tảng ({periodDays} ngày)</div>
          <div style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0', color: '#6D28D9' }}>{value(e?.platformFees)}</div>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>{e ? `Đã rút về ngân hàng: ${formatVND(e.withdrawn)}` : 'Phí SportNexus thu trên đơn'}</div>
        </div>
      </div>

      {/* Chi tiết thu nhập & theo cơ sở */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div style={panelStyle}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Chi Tiết Thu Nhập Trong Kỳ</h3>
          <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '13px', fontWeight: 600 }}>Các khoản cộng / trừ tạo nên số thực nhận</p>
          {!e ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{earnings.error ? '—' : 'Đang tải...'}</div>
          ) : (
            <>
              {breakdown.map(([label, amount, hint]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{label}</div>
                    {hint && <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>{hint}</div>}
                  </div>
                  <strong style={{ fontSize: '14px', color: Number(amount) < 0 ? '#B91C1C' : '#0F172A', whiteSpace: 'nowrap' }}>
                    {Number(amount) > 0 ? '+' : ''}{formatVND(amount)}
                  </strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', fontSize: '15px', fontWeight: 900, color: '#047857' }}>
                <span>Thực nhận vào ví</span>
                <span>{formatVND(e.netIncome)}</span>
              </div>
              {Number(e.prizeFundsHeld) > 0 && (
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '6px' }}>
                  Quỹ thưởng đang giữ cho giải chưa kết thúc: <strong>{formatVND(e.prizeFundsHeld)}</strong>
                </div>
              )}
            </>
          )}
        </div>

        <div style={panelStyle}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Thu Nhập Theo Cơ Sở</h3>
          <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '13px', fontWeight: 600 }}>Tiền đặt sân + phí hủy đã nhận trong kỳ</p>
          {!e ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{earnings.error ? '—' : 'Đang tải...'}</div>
          ) : facilityItems.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Chưa có thu nhập trong kỳ.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {facilityItems.map((item) => (
                <div key={item.facilityId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                    <span>{item.facilityName}</span>
                    <span>{formatVND(item.total)}</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: '#E2E8F0', margin: '6px 0 4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(item.total / facilityMax) * 100}%`, height: '100%', background: '#059669', borderRadius: '999px' }} />
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Đặt sân {formatVND(item.bookingEarnings)} • Phí hủy {formatVND(item.cancellationFeeEarnings)} • Chờ chuyển {formatVND(item.pendingBookingAmount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tài khoản ngân hàng & lịch sử rút tiền */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px', alignItems: 'start' }}>
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Tài Khoản Nhận Tiền</h3>
            <button onClick={openBankModal} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
              {bankAccount ? 'Sửa' : 'Thêm tài khoản'}
            </button>
          </div>
          {bank.loading && !bank.data ? (
            <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải...</div>
          ) : bankAccount ? (
            <div style={{ borderRadius: '14px', padding: '16px 18px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
              <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 700 }}>{bankAccount.bankName}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1.5px', margin: '6px 0', fontFamily: 'monospace' }}>{bankAccount.bankAccountNumber}</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{bankAccount.bankAccountHolder}</div>
            </div>
          ) : (
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              Chưa lưu tài khoản ngân hàng. Cần lưu trước khi rút tiền.
            </div>
          )}
          <ul style={{ margin: '14px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#475569', fontWeight: 600, lineHeight: 1.7 }}>
            <li>Rút tối thiểu {formatVND(MIN_WITHDRAWAL)}, mỗi lúc chỉ 1 yêu cầu chờ duyệt.</li>
            <li>Tiền rút bị giữ tạm tới khi Quản trị viên chuyển khoản hoặc từ chối.</li>
            <li>Không rút được khi ví đang âm (do hoàn tiền cho khách).</li>
          </ul>
        </div>

        <div style={panelStyle}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Lịch Sử Rút Tiền</h3>
          {withdrawals.error ? (
            <div style={{ color: '#B91C1C', fontWeight: 700 }}>{withdrawals.error}</div>
          ) : !withdrawals.data ? (
            <div style={{ color: '#475569', fontWeight: 600 }}>Đang tải...</div>
          ) : withdrawalItems.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Chưa có yêu cầu rút tiền nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {withdrawalItems.map((item) => {
                const status = WITHDRAWAL_STATUS[String(item.status).toUpperCase()] || WITHDRAWAL_STATUS.PENDING
                return (
                  <div key={item.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '15px', color: '#0F172A' }}>{formatVND(item.amount)}</strong>
                      <span style={{ background: status.bg, color: status.color, fontSize: '11.5px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>{status.label}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
                      {item.bankName} • {item.bankAccountNumber} • Gửi lúc {formatDateTimeVN(item.createdAt)}
                    </div>
                    {item.processedAt && (
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        Xử lý lúc {formatDateTimeVN(item.processedAt)}{item.bankTransactionRef ? ` • Mã GD: ${item.bankTransactionRef}` : ''}
                      </div>
                    )}
                    {item.rejectReason && <div style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 700 }}>Lý do từ chối: {item.rejectReason}</div>}
                    {String(item.status).toUpperCase() === 'PENDING' && (
                      <button
                        onClick={() => handleCancelWithdrawal(item)}
                        disabled={busy}
                        style={{ marginTop: '8px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#B91C1C', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Hủy yêu cầu
                      </button>
                    )}
                  </div>
                )
              })}
              {withdrawalTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                  <button style={pagerButton(withdrawalPage <= 1)} disabled={withdrawalPage <= 1} onClick={() => setWithdrawalPage((p) => p - 1)}>‹ Trước</button>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>{withdrawalPage}/{withdrawalTotalPages}</span>
                  <button style={pagerButton(withdrawalPage >= withdrawalTotalPages)} disabled={withdrawalPage >= withdrawalTotalPages} onClick={() => setWithdrawalPage((p) => p + 1)}>Sau ›</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lịch sử giao dịch ví */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>Biến Động Số Dư Ví</h3>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '13px', fontWeight: 600 }}>Mỗi giao dịch kèm biến động số dư khả dụng (+ vào / − ra)</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
            {TXN_TABS.map((tab) => (
              <button
                key={tab.key || 'all'}
                onClick={() => { setTxnType(tab.key); setTxnPage(1) }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: txnType === tab.key ? '#ECFDF5' : '#F1F5F9',
                  color: txnType === tab.key ? '#047857' : '#334155',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleExportCsv}
              disabled={txnItems.length === 0}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: txnItems.length ? 1 : 0.5 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Xuất CSV
            </button>
          </div>
        </div>

        {transactions.error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#B91C1C', fontWeight: 700 }}>{transactions.error}</div>
        ) : !transactions.data ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Đang tải giao dịch...</div>
        ) : txnItems.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Chưa có giao dịch nào.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', opacity: transactions.loading ? 0.6 : 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #CBD5E1', background: '#F8FAFC' }}>
                    {['Thời gian', 'Loại', 'Mô tả', 'Số tiền', 'Biến động số dư', 'Trạng thái'].map((head) => (
                      <th key={head} style={{ padding: '12px 14px', fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txnItems.map((txn) => {
                    const change = Number(txn.balanceChange) || 0
                    return (
                      <tr key={txn.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDateTimeVN(txn.createdAt)}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#F1F5F9', color: '#334155', fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            {TXN_TYPE_LABEL[txn.type] || txn.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                          {txn.description || '—'}
                          {txn.note && <div style={{ fontSize: '11.5px', color: '#64748B' }}>{txn.note}</div>}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatVND(txn.amount)}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', color: change > 0 ? '#047857' : change < 0 ? '#B91C1C' : '#64748B' }}>
                          {change > 0 ? '+' : ''}{formatVND(change)}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#475569', fontWeight: 700 }}>{txn.status || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
              <button style={pagerButton(txnPage <= 1)} disabled={txnPage <= 1} onClick={() => setTxnPage((p) => p - 1)}>‹ Trước</button>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>Trang {txnPage}/{txnTotalPages}</span>
              <button style={pagerButton(txnPage >= txnTotalPages)} disabled={txnPage >= txnTotalPages} onClick={() => setTxnPage((p) => p + 1)}>Sau ›</button>
            </div>
          </>
        )}
      </div>

      {/* Modal: Tài khoản ngân hàng */}
      {showBankModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleSaveBank} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Tài Khoản Ngân Hàng Nhận Tiền</h3>
              <button type="button" onClick={() => setShowBankModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Ngân hàng</label>
            <input list="sportnexus-banks" required maxLength={100} placeholder="VD: Vietcombank" value={bankForm.bankName} onChange={(event) => setBankForm((f) => ({ ...f, bankName: event.target.value }))} style={{ ...inputStyle, marginBottom: '14px' }} />
            <datalist id="sportnexus-banks">
              {COMMON_BANKS.map((name) => <option key={name} value={name} />)}
            </datalist>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Số tài khoản (6–20 chữ số)</label>
            <input required inputMode="numeric" placeholder="VD: 0071000987654" value={bankForm.bankAccountNumber} onChange={(event) => setBankForm((f) => ({ ...f, bankAccountNumber: event.target.value.replace(/[^\d]/g, '') }))} style={{ ...inputStyle, marginBottom: '14px', fontFamily: 'monospace' }} />
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Tên chủ tài khoản</label>
            <input required maxLength={100} placeholder="VD: NGUYEN VAN A" value={bankForm.bankAccountHolder} onChange={(event) => setBankForm((f) => ({ ...f, bankAccountHolder: event.target.value.toUpperCase() }))} style={{ ...inputStyle, marginBottom: '20px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowBankModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#15803D', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang lưu...' : 'Lưu Tài Khoản'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Tạo yêu cầu rút tiền */}
      {showWithdrawModal && bankAccount && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleWithdraw} style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Tạo Yêu Cầu Rút Tiền</h3>
              <button type="button" onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Số dư khả dụng</span>
              <strong style={{ fontSize: '18px', color: '#14532D' }}>{formatVND(availableBalance)}</strong>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginBottom: '14px' }}>
              Chuyển về: <strong>{bankAccount.bankName}</strong> • {bankAccount.bankAccountNumber} • {bankAccount.bankAccountHolder}
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>Số tiền muốn rút</label>
            <input
              required
              inputMode="numeric"
              placeholder={`Tối thiểu ${formatVND(MIN_WITHDRAWAL)}`}
              value={withdrawAmount}
              onChange={(event) => {
                const amount = parseAmount(event.target.value)
                setWithdrawAmount(amount ? new Intl.NumberFormat('vi-VN').format(amount) : '')
              }}
              style={{ ...inputStyle, fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[['50%', 0.5], ['Toàn bộ', 1]].map(([label, ratio]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setWithdrawAmount(new Intl.NumberFormat('vi-VN').format(Math.floor(availableBalance * ratio)))}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowWithdrawModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button type="submit" disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#15803D', color: '#FFFFFF', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Đang gửi...' : 'Gửi Yêu Cầu Rút Tiền'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
