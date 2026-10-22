import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Banknote, CheckCircle2, Clock3, RotateCcw, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react'
import PaymentOverviewChart from './PaymentOverviewChart.jsx'
import TransactionBreakdown from './TransactionBreakdown.jsx'
import TransactionsTab from './TransactionsTab.jsx'
import WalletsTab from './WalletsTab.jsx'
import WithdrawalsTab from './WithdrawalsTab.jsx'
import { getWalletStatistics } from '../../api/admin/walletApi.js'
import { CHART_RANGES, lastDays, money, number } from './paymentData.js'
import '../Users/users.css'
import './payment.css'

const tabs = { transactions: 'Giao dịch', wallets: 'Ví người dùng', withdrawals: 'Yêu cầu rút tiền' }
const icons = { volume: Banknote, successful: CheckCircle2, pending: Clock3, refunded: RotateCcw }

export default function PaymentManagement() {
  // ?tab=withdrawals (từ Dashboard) → mở thẳng tab tương ứng.
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => (tabs[searchParams.get('tab')] ? searchParams.get('tab') : 'transactions'))
  const [range, setRange] = useState('30 ngày')
  const [reload, setReload] = useState(0)
  const [stats, setStats] = useState({ key: '', value: { byDay: [] }, error: '' })
  const [transactionUser, setTransactionUser] = useState(null)
  const [walletFocus, setWalletFocus] = useState({ userId: null, negative: false, key: 0 })
  const [notice, setNotice] = useState('')

  // GET /api/v1/admin/wallets/statistics?from&to — KPI, biểu đồ, phân bổ.
  const statsKey = `${range}#${reload}`
  const statsLoading = stats.key !== statsKey
  useEffect(() => {
    let cancelled = false
    getWalletStatistics(lastDays(CHART_RANGES[range]))
      .then(value => !cancelled && setStats({ key: statsKey, value, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key: statsKey, error: error.message })))
    return () => { cancelled = true }
  }, [statsKey, range])

  const s = stats.value
  const show = value => (statsLoading ? '…' : value)
  const kpis = [
    { icon: 'volume', label: 'Tổng số dư ví', value: show(money(s.totalBalance)), note: `${number(s.walletCount)} ví · đóng băng ${money(s.totalFrozenBalance)}` },
    { icon: 'successful', label: `Nạp tiền (${range})`, value: show(money(s.totalDeposits)), note: `Đang chờ: ${money(s.pendingDeposits)}` },
    { icon: 'pending', label: 'Rút tiền chờ duyệt', value: show(money(s.withdrawalsPending)), note: `Đã chuyển: ${money(s.withdrawalsCompleted)}` },
    { icon: 'refunded', label: `Doanh thu nền tảng (${range})`, value: show(money(s.platformRevenue)), note: `Phí đặt sân ${number(s.currentBookingFeePercent)}% · hoàn tiền ${money(s.bookingRefunds)}` },
  ]
  const refresh = () => setReload(value => value + 1)
  const openTab = value => { setTab(value); setNotice('') }
  const openWallet = (userId, negative = false) => { setWalletFocus(previous => ({ userId, negative, key: previous.key + 1 })); openTab('wallets') }
  const openTransactions = user => { setTransactionUser(user); openTab('transactions') }
  const tabProps = { reload, onNotice: setNotice, onChanged: refresh }

  return <div className="payments-page">
    <header className="payments-page-heading admin-page-header"><div><h1>Quản lý thanh toán</h1><p>Theo dõi ví, giao dịch và duyệt yêu cầu rút tiền trên SportNexus.</p></div><div><button className="users-button" onClick={refresh}><RefreshCw size={13} />Làm mới</button></div></header>
    <div className="payments-kpis">{kpis.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{stat.value}</strong><p>{stat.note}</p></article> })}</div>
    {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê ví: {stats.error}</span></div>}
    <div className="payments-analytics"><PaymentOverviewChart byDay={s.byDay} range={range} onRange={setRange} loading={statsLoading} error={stats.error} /><TransactionBreakdown stats={s} loading={statsLoading} /></div>
    {s.negativeWallets > 0 && <section className="payments-warning"><AlertTriangle size={22} /><div><h2>{number(s.negativeWallets)} ví đang âm tiền</h2><p>Tổng số âm {money(s.negativeAmount)}. Cần kiểm tra giao dịch và điều chỉnh nếu có sai sót.</p></div><button onClick={() => openWallet(null, true)}>Xem các ví âm <ChevronRight size={14} /></button></section>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <div className="admin-segmented" role="tablist" aria-label="Chế độ xem thanh toán" style={{ marginBottom: 16 }}>{Object.entries(tabs).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? 'selected' : ''} onClick={() => openTab(value)}>{label}</button>)}</div>
    {tab === 'transactions' && <TransactionsTab key={transactionUser?.id || 'all'} user={transactionUser} onClearUser={() => setTransactionUser(null)} onOpenWallet={openWallet} {...tabProps} />}
    {tab === 'wallets' && <WalletsTab key={walletFocus.key} initialUserId={walletFocus.userId} initialNegative={walletFocus.negative} onTransactions={openTransactions} {...tabProps} />}
    {tab === 'withdrawals' && <WithdrawalsTab {...tabProps} />}
  </div>
}
