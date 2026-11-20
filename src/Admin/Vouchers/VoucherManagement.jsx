import { useEffect, useState } from 'react'
import { TicketPercent, BadgeCheck, CircleCheckBig, CalendarX2, Plus, Pencil, Trash2, RefreshCw, Search } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { findAccountsByPhone } from '../../api/admin/accountApi.js'
import { VOUCHER_STATUSES, createAdminVoucher, deleteAdminVoucher, listAdminVouchers, updateAdminVoucher } from '../../api/admin/voucherApi.js'
import '../Users/users.css'
import '../LFG/lfg.css'

const STATUS_TONE = { ACTIVE: 'Confirmed', USED: 'Completed', EXPIRED: 'Cancelled' }
const number = value => (Number.isFinite(Number(value)) ? Number(value).toLocaleString('vi-VN') : '—')
const formatDate = value => (value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('vi-VN') : '—')
const noop = () => {}
// Ngày (yyyy-MM-dd) theo giờ Việt Nam để điền vào ô chọn ngày
const vnDay = value => {
  if (!value || Number.isNaN(new Date(value).getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
// Hạn dùng tính hết ngày đã chọn theo giờ Việt Nam
const endOfVnDay = day => `${day}T23:59:59+07:00`
const shortId = id => (id ? `${id.slice(0, 8)}…` : '—')

function VoucherFields({ form, set }) {
  return <>
    <label>Mức giảm (%)<input type="number" min="1" max="100" step="1" value={form.discountPercent} onChange={set('discountPercent')} placeholder="Ví dụ: 10" /></label>
    <label>Hạn dùng đến hết ngày<input type="date" min={vnDay(new Date())} value={form.expiredDay} onChange={set('expiredDay')} /></label>
    <label>Trạng thái<select value={form.status} onChange={set('status')}>{Object.entries(VOUCHER_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
  </>
}

const validate = form => {
  const percent = Number(form.discountPercent)
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) return 'Mức giảm phải là số nguyên từ 1 đến 100.'
  if (!form.expiredDay) return 'Vui lòng chọn hạn dùng.'
  return ''
}

function CreateVoucherDialog({ onClose, onDone }) {
  const [phone, setPhone] = useState('')
  const [search, setSearch] = useState({ loading: false, items: null, error: '' })
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ discountPercent: '10', expiredDay: '', status: 'ACTIVE' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = key => event => setForm(previous => ({ ...previous, [key]: event.target.value }))

  const findUser = async () => {
    if (!phone.trim()) return setSearch({ loading: false, items: null, error: 'Nhập số điện thoại người nhận.' })
    setSearch({ loading: true, items: null, error: '' }); setUser(null)
    try {
      const items = await findAccountsByPhone(phone.trim())
      setSearch({ loading: false, items, error: items.length ? '' : 'Không tìm thấy tài khoản với số điện thoại này.' })
      if (items.length === 1) setUser(items[0])
    } catch (err) {
      setSearch({ loading: false, items: null, error: err.message })
    }
  }

  const submit = async event => {
    event.preventDefault()
    if (!user) return setError('Vui lòng tìm và chọn người nhận voucher.')
    const invalid = validate(form)
    if (invalid) return setError(invalid)
    setSubmitting(true); setError('')
    try {
      await createAdminVoucher({ userId: user.id, discountPercent: Number(form.discountPercent), status: form.status, expiredDate: endOfVnDay(form.expiredDay) })
      onDone(`Đã tặng voucher giảm ${form.discountPercent}% cho ${user.name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }

  return <DemoDialog title="Tạo voucher" onClose={submitting ? noop : onClose}>
    <form className="users-form" noValidate onSubmit={submit}>
      <label>Số điện thoại người nhận
        <span style={{ display: 'flex', gap: 6 }}>
          <input value={phone} onChange={event => setPhone(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); findUser() } }} placeholder="Ví dụ: 0912345678" style={{ flex: 1 }} />
          <button type="button" className="users-button" onClick={findUser} disabled={search.loading}><Search size={13} />{search.loading ? 'Đang tìm…' : 'Tìm'}</button>
        </span>
      </label>
      {search.error && <p role="alert" className="users-form-error">{search.error}</p>}
      {search.items?.length > 1 && <label>Chọn tài khoản<select value={user?.id || ''} onChange={event => setUser(search.items.find(item => item.id === event.target.value) || null)}><option value="">-- Chọn --</option>{search.items.map(item => <option key={item.id} value={item.id}>{item.name} · {item.username || item.email}</option>)}</select></label>}
      {user && <p className="users-notice" role="status" style={{ margin: 0 }}><span>Người nhận: <strong>{user.name}</strong>{user.phone ? ` · ${user.phone}` : ''}{user.email ? ` · ${user.email}` : ''}</span></p>}
      <VoucherFields form={form} set={set} />
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang tạo…' : 'Tạo voucher'}</button></footer>
    </form>
  </DemoDialog>
}

function EditVoucherDialog({ voucher, onClose, onDone }) {
  const [form, setForm] = useState({ discountPercent: String(voucher.discountPercent ?? ''), expiredDay: vnDay(voucher.expiredDate), status: VOUCHER_STATUSES[voucher.status] ? voucher.status : 'ACTIVE' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = key => event => setForm(previous => ({ ...previous, [key]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    const invalid = validate(form)
    if (invalid) return setError(invalid)
    setSubmitting(true); setError('')
    try {
      await updateAdminVoucher(voucher.id, { discountPercent: Number(form.discountPercent), status: form.status, expiredDate: endOfVnDay(form.expiredDay) })
      onDone('Đã cập nhật voucher.')
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Sửa voucher" onClose={submitting ? noop : onClose}>
    <form className="users-form" noValidate onSubmit={submit}>
      <p style={{ margin: 0 }}>Người nhận: <strong>{voucher.userName || shortId(voucher.userId)}</strong></p>
      <VoucherFields form={form} set={set} />
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang lưu…' : 'Lưu thay đổi'}</button></footer>
    </form>
  </DemoDialog>
}

function DeleteVoucherDialog({ voucher, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setSubmitting(true); setError('')
    try {
      await deleteAdminVoucher(voucher.id)
      onDone('Đã xóa voucher.')
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Xóa voucher" onClose={submitting ? noop : onClose}>
    <p>Xóa voucher giảm <strong>{voucher.discountPercent}%</strong> của <strong>{voucher.userName || shortId(voucher.userId)}</strong>? Người chơi sẽ không còn thấy voucher này trong ví.</p>
    {error && <p role="alert" className="users-form-error">{error}</p>}
    <div className="users-form"><footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Giữ lại</button><button type="button" className="users-button users-danger" onClick={submit} disabled={submitting}>{submitting ? 'Đang xóa…' : 'Xóa voucher'}</button></footer></div>
  </DemoDialog>
}

export default function VoucherManagement() {
  const [reload, setReload] = useState(0)
  const [status, setStatus] = useState('')
  const [list, setList] = useState({ key: '', items: [], error: '' })
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const key = `${status}|${reload}`

  useEffect(() => {
    let cancelled = false
    listAdminVouchers({ status })
      .then(items => !cancelled && setList({ key, items, error: '' }))
      .catch(error => !cancelled && setList(previous => ({ ...previous, key, error: error.message })))
    return () => { cancelled = true }
  }, [status, key])

  const loading = list.key !== key
  const items = list.items
  const count = value => items.filter(item => item.status === value).length
  const kpis = [
    { icon: TicketPercent, className: 'total', label: 'Voucher trong danh sách', value: items.length, note: status ? `Đang lọc: ${VOUCHER_STATUSES[status]}` : 'Mọi trạng thái' },
    { icon: BadgeCheck, className: 'open', label: 'Còn hiệu lực', value: count('ACTIVE'), note: 'Người chơi dùng được khi đặt sân' },
    { icon: CircleCheckBig, className: 'completed', label: 'Đã dùng', value: count('USED'), note: 'Đã áp vào đơn đặt sân' },
    { icon: CalendarX2, className: 'full', label: 'Hết hạn', value: count('EXPIRED'), note: 'Quá hạn dùng' },
  ]
  const done = message => { setDialog(null); setNotice(message); setReload(value => value + 1) }

  return <div className="lfg-page"><header className="lfg-page-heading admin-page-header"><div><h1>Mã giảm giá <span>{loading ? '…' : `${number(items.length)} voucher`}</span></h1><p>Tặng voucher giảm giá đặt sân cho người chơi, theo dõi voucher đền bù khi chủ sân hủy đơn.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={13} />Làm mới</button><button className="users-button primary" onClick={() => setDialog({ type: 'create' })}><Plus size={13} />Tạo voucher</button></div></header>
    <div className="lfg-kpis">{kpis.map(({ icon: Icon, className, label, value, note }) => <article key={label} className={className}><div><small>{label}</small><Icon size={24} /></div><strong>{loading ? '…' : number(value)}</strong><p>{note}</p></article>)}</div>
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách voucher: {list.error}</span></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}

    <section className="lfg-toolbar" aria-label="Lọc voucher"><div className="lfg-filter-row"><label>Trạng thái<select value={status} onChange={event => setStatus(event.target.value)}><option value="">Tất cả</option>{Object.entries(VOUCHER_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></section>
    <section className="lfg-table-panel" aria-label="Danh sách voucher" aria-busy={loading}><header><h2>Danh sách voucher <span>{number(items.length)} voucher</span></h2></header><div className="lfg-table-scroll"><table><thead><tr>{['Người nhận', 'Mức giảm', 'Hạn dùng', 'Nguồn', 'Ngày tạo', 'Trạng thái', ''].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={loading ? { opacity: 0.5 } : undefined}>{items.map(item => <tr key={item.id}>
        <td><strong>{item.userName || shortId(item.userId)}</strong>{item.userPhone && <small>{item.userPhone}</small>}</td>
        <td><strong>{item.discountPercent != null ? `${item.discountPercent}%` : '—'}</strong></td>
        <td>{formatDate(item.expiredDate)}</td>
        <td>{item.sourceBookingId ? <>Đền bù đơn hủy<small>{shortId(String(item.sourceBookingId))}</small></> : 'Admin tặng'}</td>
        <td>{formatDate(item.createdAt)}</td>
        <td><StatusBadge status={STATUS_TONE[item.status] || 'Pending'} label={VOUCHER_STATUSES[item.status] || item.status || '—'} /></td>
        <td><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}><button className="users-button" onClick={() => setDialog({ type: 'edit', voucher: item })} aria-label="Sửa voucher"><Pencil size={13} />Sửa</button><button className="users-button users-danger" onClick={() => setDialog({ type: 'delete', voucher: item })} aria-label="Xóa voucher"><Trash2 size={13} /></button></div></td>
      </tr>)}</tbody></table>
      {loading && !items.length && <p className="lfg-empty">Đang tải…</p>}
      {!loading && !items.length && !list.error && <p className="lfg-empty">Chưa có voucher nào. Bấm "Tạo voucher" để tặng voucher cho người chơi.</p>}</div>
    </section>

    {dialog?.type === 'create' && <CreateVoucherDialog onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'edit' && <EditVoucherDialog voucher={dialog.voucher} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'delete' && <DeleteVoucherDialog voucher={dialog.voucher} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
