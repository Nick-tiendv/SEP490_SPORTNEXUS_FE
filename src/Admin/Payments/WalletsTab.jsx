import { useEffect, useMemo, useState } from 'react'
import { X, Search, Download, SlidersHorizontal, ReceiptText, Mail, Phone } from 'lucide-react'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { adjustWallet, getWallet, listWallets } from '../../api/admin/walletApi.js'
import { PaymentStatus, Pager } from './PaymentShared.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { roleLabels, typeLabels, transactionStatusLabels, money, signedMoney, number, dateTime, shortId, downloadCsv } from './paymentData.js'

const noop = () => {}

// GET /api/v1/admin/wallets — tìm kiếm, lọc vai trò / ví âm, phân trang phía server.
export default function WalletsTab({ initialUserId, initialNegative, reload, onChanged, onTransactions, onNotice }) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [negative, setNegative] = useState(!!initialNegative)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [detailUserId, setDetailUserId] = useState(initialUserId || null)
  const [adjusting, setAdjusting] = useState(null)
  const keyword = useDebounced(search.trim())
  const params = useMemo(() => ({ Keyword: keyword, Role: role, Negative: negative, Page: page, PageSize: pageSize }), [keyword, role, negative, page, pageSize])
  const list = usePagedList(listWallets, params, reload)
  const exportCsv = () => {
    downloadCsv('vi-nguoi-dung.csv', ['Mã người dùng', 'Họ tên', 'Email', 'Số điện thoại', 'Vai trò', 'Số dư (đ)', 'Đóng băng (đ)', 'Số giao dịch', 'Giao dịch gần nhất', 'Trạng thái'],
      list.items.map(item => [item.userId, item.fullName, item.email, item.phone, roleLabels[item.role] || item.role, item.balance, item.frozenBalance, item.transactionCount, dateTime(item.lastTransactionAt), item.isActive ? 'Đang hoạt động' : 'Đã khóa']))
    onNotice(`Đã xuất ${list.items.length} ví của trang hiện tại ra CSV.`)
  }

  return <>
    <section className="payments-toolbar" aria-label="Bộ lọc ví"><div className="payments-filter-row">
      <label className="users-search"><Search size={14} /><input aria-label="Tìm ví" placeholder="Họ tên, email, số điện thoại…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
      <label>Vai trò<select value={role} onChange={event => { setRole(event.target.value); setPage(1) }}><option value="">Tất cả vai trò</option>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="payments-review-check"><input type="checkbox" checked={negative} onChange={event => { setNegative(event.target.checked); setPage(1) }} />Chỉ ví âm</label>
      <button className="users-button" onClick={exportCsv} disabled={!list.items.length}><Download size={13} />Xuất CSV</button>
    </div></section>
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách ví: {list.error}</span></div>}
    <div className={`payments-content-grid ${detailUserId ? 'with-details' : ''}`}>
      <section className="payments-table-panel" aria-label="Danh sách ví" aria-busy={list.loading}><div className="payments-table-scroll"><table><thead><tr>{['Người dùng', 'Vai trò', 'Số dư', 'Đóng băng', 'Số giao dịch', 'Giao dịch gần nhất', 'Tài khoản'].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.walletId || item.userId} className={detailUserId === item.userId ? 'is-selected' : ''} onClick={() => setDetailUserId(item.userId)}><td><div className="payments-table-user"><UserAvatar user={{ name: item.fullName }} /><span><strong>{item.fullName}</strong><small>{item.email || item.phone}</small></span></div></td><td>{roleLabels[item.role] || item.role || '—'}</td><td><strong style={item.balance < 0 ? { color: 'var(--sn-danger-text)' } : undefined}>{money(item.balance)}</strong></td><td>{money(item.frozenBalance)}</td><td>{number(item.transactionCount)}</td><td>{dateTime(item.lastTransactionAt)}</td><td><AccountStatus status={item.isActive ? 'Active' : 'Suspended'} /></td></tr>)}</tbody></table>
        {list.loading && !list.items.length && <p className="payments-empty">Đang tải danh sách ví…</p>}
        {!list.loading && !list.items.length && <p className="payments-empty">Không có ví phù hợp với bộ lọc.</p>}</div>
        <Pager label="ví" page={page} pageSize={pageSize} total={list.total} totalPages={list.totalPages} loading={list.loading} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1) }} />
      </section>
      {detailUserId && <WalletDetails key={`${detailUserId}#${reload}`} userId={detailUserId} base={list.items.find(item => item.userId === detailUserId)} onClose={() => setDetailUserId(null)} onAdjust={setAdjusting} onTransactions={onTransactions} />}
    </div>
    {adjusting && <AdjustDialog wallet={adjusting} onClose={() => setAdjusting(null)} onDone={message => { setAdjusting(null); onNotice(message); onChanged() }} />}
  </>
}

function WalletDetails({ userId, base, onClose, onAdjust, onTransactions }) {
  const [state, setState] = useState({ wallet: null, error: '' })
  useEffect(() => {
    let cancelled = false
    getWallet(userId)
      .then(wallet => !cancelled && setState({ wallet, error: '' }))
      .catch(error => !cancelled && setState({ wallet: null, error: error.message }))
    return () => { cancelled = true }
  }, [userId])
  // Ưu tiên dữ liệu chi tiết; field nào API chi tiết không có thì giữ từ dòng danh sách.
  const detail = state.wallet
  const wallet = base && detail ? { ...base, ...Object.fromEntries(Object.entries(detail).filter(([, value]) => value !== '' && value !== '—' && value != null)) } : detail || base
  if (!wallet) return <aside className="payments-details"><header><div><small>Chi tiết ví</small></div><button onClick={onClose} aria-label="Đóng chi tiết ví"><X size={17} /></button></header><div className="payments-detail-body"><p className="payments-muted">{state.error || 'Đang tải ví…'}</p></div></aside>
  const transactions = detail?.transactions || []
  return <aside className="payments-details" aria-label={`Ví của ${wallet.fullName}`}>
    <header><div><small>Chi tiết ví</small><h2>{wallet.fullName}</h2></div><div><strong>{money(wallet.balance)}</strong><button onClick={onClose} aria-label="Đóng chi tiết ví"><X size={17} /></button></div></header>
    <div className="payments-detail-body">
      {state.error && <p className="users-form-error" role="alert">Không tải được đầy đủ chi tiết: {state.error}</p>}
      <section className="payments-detail-section"><div className="payments-user"><UserAvatar user={{ name: wallet.fullName }} /><div><strong>{wallet.fullName}</strong><small>{roleLabels[wallet.role] || wallet.role}</small>{wallet.email && <p><Mail size={11} /> {wallet.email}</p>}{wallet.phone && <p><Phone size={11} /> {wallet.phone}</p>}</div></div></section>
      <section className="payments-detail-section"><h3>Số dư</h3><dl className="payments-metadata">{[['Số dư khả dụng', money(wallet.balance)], ['Đang đóng băng', money(wallet.frozenBalance)], ['Số giao dịch', number(wallet.transactionCount)], ['Giao dịch gần nhất', dateTime(wallet.lastTransactionAt)], ['Mã ví', shortId(wallet.walletId)], ['Tài khoản', wallet.isActive ? 'Đang hoạt động' : 'Đã khóa']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      {transactions.length > 0 && <section className="payments-detail-section"><h3>Giao dịch gần đây</h3><ol className="payments-history">{transactions.slice(0, 8).map(item => <li key={item.id}><strong>{signedMoney(item.balanceChange || item.amount)}</strong> · {typeLabels[item.type] || item.type} · <PaymentStatus status={item.status} labels={transactionStatusLabels} /><br /><small>{dateTime(item.createdAt)}{item.description ? ` · ${item.description}` : ''}</small></li>)}</ol></section>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="users-button primary" onClick={() => onAdjust(wallet)}><SlidersHorizontal size={13} />Điều chỉnh số dư</button><button className="users-button" onClick={() => onTransactions({ id: wallet.userId, name: wallet.fullName })}><ReceiptText size={13} />Xem tất cả giao dịch</button></div>
    </div>
  </aside>
}

// POST /api/v1/admin/wallets/{userId}/adjust { amount, reason } — amount dương cộng tiền, âm trừ tiền.
function AdjustDialog({ wallet, onClose, onDone }) {
  const [direction, setDirection] = useState('add')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const value = Number(amount)
  const signed = direction === 'add' ? value : -value
  const submit = async event => {
    event.preventDefault()
    if (!Number.isFinite(value) || value <= 0) return setError('Nhập số tiền lớn hơn 0.')
    if (!reason.trim()) return setError('Vui lòng nhập lý do điều chỉnh.')
    setSubmitting(true); setError('')
    try {
      await adjustWallet(wallet.userId, { amount: signed, reason: reason.trim() })
      onDone(`Đã ${direction === 'add' ? 'cộng' : 'trừ'} ${money(value)} vào ví của ${wallet.fullName}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Điều chỉnh số dư ví" onClose={submitting ? noop : onClose}>
    <p>Ví của <strong>{wallet.fullName}</strong> · số dư hiện tại {money(wallet.balance)}</p>
    <form className="users-form" onSubmit={submit} noValidate>
      <label>Loại điều chỉnh<select value={direction} onChange={event => setDirection(event.target.value)}><option value="add">Cộng tiền vào ví</option><option value="subtract">Trừ tiền khỏi ví</option></select></label>
      <label>Số tiền (₫)<input type="number" min="0" step="1000" value={amount} onChange={event => setAmount(event.target.value)} required /></label>
      <label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Bồi hoàn do lỗi hệ thống…" required /></label>
      {Number.isFinite(value) && value > 0 && <p className="payments-muted">Số dư sau điều chỉnh: {money(wallet.balance + signed)}</p>}
      {error && <p className="users-form-error" role="alert">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${direction === 'add' ? 'primary' : 'users-danger'}`} disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Xác nhận điều chỉnh'}</button></footer>
    </form>
  </DemoDialog>
}
