import { useMemo, useState } from 'react'
import { Search, Check, Ban, Landmark } from 'lucide-react'
import { UserAvatar } from '../Users/UserDetails.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { completeWithdrawal, listWithdrawals, rejectWithdrawal } from '../../api/admin/walletApi.js'
import { PaymentStatus, Pager } from './PaymentShared.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { withdrawalStatusLabels, roleLabels, money, dateTime } from './paymentData.js'

const noop = () => {}
const tag = (color, text) => <small style={{ display: 'block', color, fontWeight: 600 }}>{text}</small>

// GET /api/v1/admin/withdrawals — mặc định hiện yêu cầu chờ duyệt.
export default function WithdrawalsTab({ reload, onChanged, onNotice }) {
  const [status, setStatus] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null)
  const keyword = useDebounced(search.trim())
  const invalidRange = fromDate && toDate && fromDate > toDate
  const params = useMemo(() => ({ Status: status, Keyword: keyword, FromDate: invalidRange ? '' : fromDate, ToDate: invalidRange ? '' : toDate, Page: page, PageSize: 20 }), [status, keyword, fromDate, toDate, invalidRange, page])
  const list = usePagedList(listWithdrawals, params, reload)

  return <>
    <section className="payments-toolbar" aria-label="Bộ lọc yêu cầu rút tiền"><div className="payments-filter-row">
      <label className="users-search"><Search size={14} /><input aria-label="Tìm yêu cầu rút tiền" placeholder="Họ tên, email…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
      <label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{Object.entries(withdrawalStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Từ ngày<input type="date" value={fromDate} max={toDate || undefined} onChange={event => { setFromDate(event.target.value); setPage(1) }} /></label>
      <label>Đến ngày<input type="date" value={toDate} min={fromDate || undefined} onChange={event => { setToDate(event.target.value); setPage(1) }} /></label>
    </div>{invalidRange && <p className="users-form-error" role="alert">Ngày bắt đầu phải bằng hoặc trước ngày kết thúc.</p>}</section>
    {list.error && <div className="users-notice" role="alert"><span>Không tải được yêu cầu rút tiền: {list.error}</span></div>}
    <section className="payments-table-panel" aria-label="Danh sách yêu cầu rút tiền" aria-busy={list.loading}><div className="payments-table-scroll"><table><thead><tr>{['Người yêu cầu', 'Số tiền', 'Phí / Thực nhận', 'Tài khoản nhận', 'Trạng thái', 'Ngày yêu cầu', 'Thao tác'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={list.loading ? { opacity: 0.5 } : undefined}>{list.items.map(item => {
        // Tài khoản bị khóa / có cơ sở tạm ngưng: BE không cho xác nhận chuyển, chỉ từ chối
        const blocked = !item.userIsActive || item.facilitySuspended
        return <tr key={item.id}>
          <td><div className="payments-table-user"><UserAvatar user={{ name: item.fullName }} /><span><strong>{item.fullName}</strong><small>{[roleLabels[item.role] || item.role, item.email || item.phone].filter(Boolean).join(' · ')}</small>
            {!item.userIsActive && tag('#dc2626', 'Tài khoản bị khóa')}
            {item.facilitySuspended && tag('#c2410c', 'Cơ sở tạm ngưng')}
          </span></div></td>
          <td><strong>{money(item.amount)}</strong></td>
          <td>{item.fee > 0 ? <>Phí {money(item.fee)}<small>Chuyển {money(item.netAmount)}</small></> : <small>Không phí · chuyển {money(item.netAmount)}</small>}</td>
          <td>{item.bankAccountNumber ? <><strong><Landmark size={11} /> {item.bankName || 'Ngân hàng'}</strong><small>{item.bankAccountNumber}{item.bankAccountName ? ` · ${item.bankAccountName}` : ''}</small>{item.holderMatchesKyc === false && tag('#b45309', 'Tên chủ TK khác eKYC')}</> : '—'}</td>
          <td><PaymentStatus status={item.status} labels={withdrawalStatusLabels} />{item.status === 'REJECTED' && item.rejectReason && <small title={item.rejectReason}>{item.rejectReason}</small>}{item.status === 'COMPLETED' && item.bankTransactionRef && <small>Mã CK: {item.bankTransactionRef}</small>}{item.processedByName && <small>Người xử lý: {item.processedByName}</small>}</td>
          <td>{dateTime(item.createdAt)}{item.processedAt && <small>Xử lý: {dateTime(item.processedAt)}</small>}</td>
          <td>{item.status === 'PENDING' ? <div style={{ display: 'flex', gap: 6 }}>{!blocked && <button className="users-button primary" onClick={() => setDialog({ type: 'complete', item })}><Check size={12} />Đã chuyển</button>}<button className="users-button users-danger" onClick={() => setDialog({ type: 'reject', item })}><Ban size={12} />Từ chối</button></div> : '—'}</td>
        </tr>
      })}</tbody></table>
      {list.loading && !list.items.length && <p className="payments-empty">Đang tải yêu cầu rút tiền…</p>}
      {!list.loading && !list.items.length && <p className="payments-empty">{status === 'PENDING' && !keyword ? 'Không có yêu cầu rút tiền nào đang chờ duyệt.' : 'Không có yêu cầu phù hợp với bộ lọc.'}</p>}</div>
      <Pager label="yêu cầu" page={page} total={list.total} totalPages={list.totalPages} loading={list.loading} onPage={setPage} />
    </section>
    {dialog && <WithdrawalDialog {...dialog} onClose={() => setDialog(null)} onDone={message => { setDialog(null); onNotice(message); onChanged() }} />}
  </>
}

// PATCH /api/v1/admin/withdrawals/{id}/complete { bankTransactionRef (bắt buộc) } | reject { reason }.
function WithdrawalDialog({ type, item, onClose, onDone }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const reject = type === 'reject'
  const confirm = async () => {
    if (!text.trim()) return setError(reject ? 'Vui lòng nhập lý do từ chối.' : 'Vui lòng nhập mã giao dịch ngân hàng.')
    setSubmitting(true); setError('')
    try {
      if (reject) await rejectWithdrawal(item.id, text.trim())
      else await completeWithdrawal(item.id, text.trim())
      onDone(reject ? `Đã từ chối yêu cầu rút ${money(item.amount)} của ${item.fullName}.` : `Đã xác nhận chuyển ${money(item.netAmount)} cho ${item.fullName}.`)
    } catch (err) {
      // 400: tài khoản vừa bị khóa / cơ sở tạm ngưng / mã CK trùng → hiện message, giữ hộp thoại
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={reject ? 'Từ chối yêu cầu rút tiền' : 'Xác nhận đã chuyển tiền'} onClose={submitting ? noop : onClose}>
    {reject
      ? <p>Từ chối yêu cầu rút <strong>{money(item.amount)}</strong> của <strong>{item.fullName}</strong>? Toàn bộ số tiền (kể cả phí) được trả lại ví.</p>
      : <p>Chuyển khoản <strong>{money(item.netAmount)}</strong>{item.fee > 0 ? ` (đã trừ phí ${money(item.fee)})` : ''} cho <strong>{item.fullName}</strong>{item.bankAccountNumber ? ` (${item.bankName} · ${item.bankAccountNumber})` : ''}.</p>}
    {!reject && item.holderMatchesKyc === false && <p className="users-form-error">Tên chủ tài khoản khác tên đã xác minh eKYC. Kiểm tra kỹ trước khi chuyển.</p>}
    {!reject && <p className="payments-muted">Chỉ xác nhận sau khi đã chuyển khoản thực tế cho người dùng.</p>}
    <div className="users-form"><label>{reject ? 'Lý do từ chối' : 'Mã giao dịch ngân hàng'}{reject ? <textarea rows={3} maxLength={500} value={text} onChange={event => setText(event.target.value)} placeholder="Ví dụ: Thông tin tài khoản nhận không khớp…" /> : <input value={text} onChange={event => setText(event.target.value)} maxLength={100} required placeholder="Ví dụ: FT26292123456" />}</label></div>
    {error && <p className="users-form-error" role="alert">{error}</p>}
    <footer><button className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className={`users-button ${reject ? 'users-danger' : 'primary'}`} onClick={confirm} disabled={submitting || !text.trim()}>{submitting ? 'Đang xử lý…' : 'Xác nhận'}</button></footer>
  </DemoDialog>
}
