import { useMemo, useState } from 'react'
import { X, Wallet, Download } from 'lucide-react'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { listTransactions } from '../../api/admin/walletApi.js'
import { PaymentStatus, Pager } from './PaymentShared.jsx'
import { usePagedList } from '../components/listHooks.js'
import { typeLabels, transactionStatusLabels, roleLabels, money, signedMoney, dateTime, shortId, downloadCsv } from './paymentData.js'

const emptyFilters = { type: '', status: '', from: '', to: '', minAmount: '' }

// GET /api/v1/admin/wallets/transactions — lọc và phân trang phía server.
export default function TransactionsTab({ user, onClearUser, onOpenWallet, reload, onNotice }) {
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [detailId, setDetailId] = useState(null)
  const params = useMemo(() => ({ UserId: user?.id, Type: filters.type, Status: filters.status, From: filters.from, To: filters.to, MinAmount: filters.minAmount, Page: page, PageSize: pageSize }), [user, filters, page, pageSize])
  const list = usePagedList(listTransactions, params, reload)
  const invalidRange = filters.from && filters.to && filters.from > filters.to
  const detail = list.items.find(item => item.id === detailId)
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1); onClearUser() }
  const exportCsv = () => {
    downloadCsv('giao-dich.csv', ['Mã giao dịch', 'Người dùng', 'Vai trò', 'Loại', 'Mô tả', 'Số tiền (đ)', 'Biến động số dư (đ)', 'Trạng thái', 'Mã tham chiếu', 'Thời gian'],
      list.items.map(item => [item.id, item.fullName, roleLabels[item.role] || item.role, typeLabels[item.type] || item.type, item.description, item.amount, item.balanceChange, transactionStatusLabels[item.status] || item.status, item.referenceId, dateTime(item.createdAt)]))
    onNotice(`Đã xuất ${list.items.length} giao dịch của trang hiện tại ra CSV.`)
  }

  return <>
    <section className="payments-toolbar" aria-label="Bộ lọc giao dịch"><div className="payments-filter-row">
      <label>Loại giao dịch<select value={filters.type} onChange={event => change('type', event.target.value)}><option value="">Tất cả loại</option>{Object.entries(typeLabels).filter(([value]) => value !== 'WITHDRAW').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Trạng thái<select value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(transactionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Từ ngày<input type="date" value={filters.from} onChange={event => change('from', event.target.value)} /></label>
      <label>Đến ngày<input type="date" value={filters.to} onChange={event => change('to', event.target.value)} /></label>
      <label>Số tiền tối thiểu<input type="number" min="0" step="1000" value={filters.minAmount} onChange={event => change('minAmount', event.target.value)} placeholder="0" /></label>
      <button className="payments-text-button" onClick={reset}>Đặt lại</button>
      <button className="users-button" onClick={exportCsv} disabled={!list.items.length}><Download size={13} />Xuất CSV</button>
    </div>
      {invalidRange && <p role="alert" className="users-form-error">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</p>}
      {user && <div className="payments-filter-chips"><button onClick={onClearUser} aria-label={`Bỏ lọc theo ${user.name}`}>Người dùng: {user.name}<X size={11} /></button></div>}
    </section>
    {list.error && <div className="users-notice" role="alert"><span>Không tải được giao dịch: {list.error}</span></div>}
    <div className={`payments-content-grid ${detail ? 'with-details' : ''}`}>
      <section className="payments-table-panel" aria-label="Danh sách giao dịch" aria-busy={list.loading}><div className="payments-table-scroll"><table><thead><tr>{['Mã giao dịch', 'Người dùng', 'Loại', 'Mô tả', 'Số tiền', 'Biến động số dư', 'Trạng thái', 'Thời gian'].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.id} className={detailId === item.id ? 'is-selected' : ''} onClick={() => setDetailId(item.id)}><td><button className="payments-id-button" onClick={() => setDetailId(item.id)} aria-expanded={detailId === item.id}>{shortId(item.id)}</button></td><td><div className="payments-table-user"><UserAvatar user={{ name: item.fullName }} /><span><strong>{item.fullName}</strong><small>{roleLabels[item.role] || item.role}</small></span></div></td><td><span className={`payments-type ${item.type.toLowerCase()}`}>{typeLabels[item.type] || item.type}</span></td><td>{item.description || '—'}</td><td><strong>{money(item.amount)}</strong></td><td>{signedMoney(item.balanceChange)}</td><td><PaymentStatus status={item.status} labels={transactionStatusLabels} /></td><td>{dateTime(item.createdAt)}</td></tr>)}</tbody></table>
        {list.loading && !list.items.length && <p className="payments-empty">Đang tải giao dịch…</p>}
        {!list.loading && !list.items.length && <p className="payments-empty">Không có giao dịch phù hợp với bộ lọc.</p>}</div>
        <Pager label="giao dịch" page={page} pageSize={pageSize} total={list.total} totalPages={list.totalPages} loading={list.loading} onPage={setPage} onPageSize={size => { setPageSize(size); setPage(1) }} />
      </section>
      {detail && <aside className="payments-details" aria-label="Chi tiết giao dịch"><header><div><small>Chi tiết giao dịch</small><h2>{shortId(detail.id)} <PaymentStatus status={detail.status} labels={transactionStatusLabels} /></h2></div><div><strong>{money(detail.amount)}</strong><button onClick={() => setDetailId(null)} aria-label="Đóng chi tiết giao dịch"><X size={17} /></button></div></header>
        <div className="payments-detail-body">
          <section className="payments-detail-section"><h3>Thông tin giao dịch</h3><dl className="payments-metadata">{[['Mã giao dịch', detail.id], ['Loại', typeLabels[detail.type] || detail.type], ['Mô tả', detail.description || '—'], ['Số tiền', money(detail.amount)], ['Biến động số dư', signedMoney(detail.balanceChange)], ['Mã tham chiếu', detail.referenceId || 'Không có'], ['Ghi chú', detail.note || '—'], ['Thời gian', dateTime(detail.createdAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
          <section className="payments-detail-section"><h3>Người dùng <button onClick={() => onOpenWallet(detail.userId)}>Xem ví</button></h3><div className="payments-user"><UserAvatar user={{ name: detail.fullName }} /><div><strong>{detail.fullName}</strong><small>{roleLabels[detail.role] || detail.role}</small><p><Wallet size={11} /> {shortId(detail.walletId)}</p></div></div></section>
        </div>
      </aside>}
    </div>
  </>
}
