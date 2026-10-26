import { useMemo, useState } from 'react'
import { Search, Check, Ban, Landmark } from 'lucide-react'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { completeWithdrawal, listWithdrawals, rejectWithdrawal } from '../../api/admin/walletApi.js'
import { PaymentStatus, Pager } from './PaymentShared.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { withdrawalStatusLabels, roleLabels, money, dateTime } from './paymentData.js'

const noop = () => {}

// GET /api/v1/admin/withdrawals — mặc định hiện yêu cầu chờ duyệt.
export default function WithdrawalsTab({ reload, onChanged, onNotice }) {
  const [status, setStatus] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null)
  const keyword = useDebounced(search.trim())
  const params = useMemo(() => ({ Status: status, Keyword: keyword, Page: page, PageSize: 20 }), [status, keyword, page])
  const list = usePagedList(listWithdrawals, params, reload)

  return <>
    <section className="payments-toolbar" aria-label="Bộ lọc yêu cầu rút tiền"><div className="payments-filter-row">
      <label className="users-search"><Search size={14} /><input aria-label="Tìm yêu cầu rút tiền" placeholder="Họ tên, email…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
      <label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{Object.entries(withdrawalStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div></section>
    {list.error && <div className="users-notice" role="alert"><span>Không tải được yêu cầu rút tiền: {list.error}</span></div>}
    <section className="payments-table-panel" aria-label="Danh sách yêu cầu rút tiền" aria-busy={list.loading}><div className="payments-table-scroll"><table><thead><tr>{['Người yêu cầu', 'Số tiền', 'Tài khoản nhận', 'Trạng thái', 'Ngày yêu cầu', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => <tr key={item.id}><td><div className="payments-table-user"><UserAvatar user={{ name: item.fullName }} /><span><strong>{item.fullName}</strong><small>{item.email || roleLabels[item.role] || item.role}</small></span></div></td><td><strong>{money(item.amount)}</strong></td><td>{item.bankAccountNumber ? <><strong><Landmark size={11} /> {item.bankName || 'Ngân hàng'}</strong><small>{item.bankAccountNumber}{item.bankAccountName ? ` · ${item.bankAccountName}` : ''}</small></> : '—'}</td><td><PaymentStatus status={item.status} labels={withdrawalStatusLabels} />{item.status === 'REJECTED' && item.rejectReason && <small title={item.rejectReason}>{item.rejectReason}</small>}{item.status === 'COMPLETED' && item.bankTransactionRef && <small>Mã CK: {item.bankTransactionRef}</small>}</td><td>{dateTime(item.createdAt)}{item.processedAt && <small>Xử lý: {dateTime(item.processedAt)}</small>}</td>
        <td>{item.status === 'PENDING' ? <div style={{ display: 'flex', gap: 6 }}><button className="users-button primary" onClick={() => setDialog({ type: 'complete', item })}><Check size={12} />Đã chuyển</button><button className="users-button users-danger" onClick={() => setDialog({ type: 'reject', item })}><Ban size={12} />Từ chối</button></div> : '—'}</td></tr>)}</tbody></table>
      {list.loading && !list.items.length && <p className="payments-empty">Đang tải yêu cầu rút tiền…</p>}
      {!list.loading && !list.items.length && <p className="payments-empty">{status === 'PENDING' && !keyword ? 'Không có yêu cầu rút tiền nào đang chờ duyệt.' : 'Không có yêu cầu phù hợp với bộ lọc.'}</p>}</div>
      <Pager label="yêu cầu" page={page} total={list.total} totalPages={list.totalPages} loading={list.loading} onPage={setPage} />
    </section>
    {dialog && <WithdrawalDialog {...dialog} onClose={() => setDialog(null)} onDone={message => { setDialog(null); onNotice(message); onChanged() }} />}
  </>
}

// PATCH /api/v1/admin/withdrawals/{id}/complete { bankTransactionRef } | reject { reason }.
function WithdrawalDialog({ type, item, onClose, onDone }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const reject = type === 'reject'
  const confirm = async () => {
    if (reject && !text.trim()) return setError('Vui lòng nhập lý do từ chối.')
    setSubmitting(true); setError('')
    try {
      if (reject) await rejectWithdrawal(item.id, text.trim())
      else await completeWithdrawal(item.id, text.trim())
      onDone(reject ? `Đã từ chối yêu cầu rút ${money(item.amount)} của ${item.fullName}.` : `Đã xác nhận chuyển ${money(item.amount)} cho ${item.fullName}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={reject ? 'Từ chối yêu cầu rút tiền' : 'Xác nhận đã chuyển tiền'} onClose={submitting ? noop : onClose}>
    <p>{reject ? 'Từ chối' : 'Xác nhận đã chuyển khoản'} <strong>{money(item.amount)}</strong> cho <strong>{item.fullName}</strong>{item.bankAccountNumber ? ` (${item.bankName} · ${item.bankAccountNumber})` : ''}?</p>
    {!reject && <p className="payments-muted">Chỉ xác nhận sau khi đã chuyển khoản thực tế cho người dùng.</p>}
    <div className="users-form"><label>{reject ? 'Lý do từ chối' : 'Mã giao dịch ngân hàng (không bắt buộc)'}{reject ? <textarea rows={3} maxLength={500} value={text} onChange={event => setText(event.target.value)} placeholder="Ví dụ: Thông tin tài khoản nhận không khớp…" /> : <input value={text} onChange={event => setText(event.target.value)} maxLength={100} placeholder="Ví dụ: FT26292123456" />}</label></div>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${reject ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}
