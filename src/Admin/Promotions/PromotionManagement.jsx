import { useEffect, useMemo, useState } from 'react'
import { Megaphone, PackageCheck, Building2, Trophy, Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { usePagedList } from '../components/listHooks.js'
import { createPromotionPackage, deletePromotionPackage, listPromotionPackages, listSoldPromotions, updatePromotionPackage } from '../../api/admin/promotionApi.js'
import '../Users/users.css'
import '../LFG/lfg.css'

const TARGETS = { FACILITY: 'Cơ sở', TOURNAMENT: 'Giải đấu' }
const PROMOTION_STATUS = { ACTIVE: ['Confirmed', 'Đang chạy'], SCHEDULED: ['Pending', 'Chờ chạy'], EXPIRED: ['Completed', 'Hết hạn'] }
const number = value => (Number.isFinite(Number(value)) ? Number(value).toLocaleString('vi-VN') : '—')
const money = value => `${number(value)} ₫`
const formatDate = value => (value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('vi-VN') : '—')
const noop = () => {}
const EMPTY = { name: '', description: '', targetType: 'FACILITY', durationDays: '7', price: '', isActive: true }

function PackageDialog({ pkg, onClose, onDone }) {
  const [form, setForm] = useState(pkg ? { ...pkg, durationDays: String(pkg.durationDays), price: String(pkg.price) } : EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = key => event => setForm(previous => ({ ...previous, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async event => {
    event.preventDefault()
    const durationDays = Number(form.durationDays), price = Number(form.price)
    if (!form.name.trim()) return setError('Vui lòng nhập tên gói.')
    if (!Number.isInteger(durationDays) || durationDays < 1) return setError('Số ngày phải là số nguyên từ 1 trở lên.')
    if (!Number.isFinite(price) || price < 0) return setError('Giá gói không hợp lệ.')
    setSubmitting(true); setError('')
    const payload = { name: form.name.trim(), description: form.description.trim() || null, targetType: form.targetType, durationDays, price, isActive: form.isActive }
    try {
      if (pkg) await updatePromotionPackage(pkg.id, payload)
      else await createPromotionPackage(payload)
      onDone(pkg ? `Đã cập nhật gói ${payload.name}.` : `Đã tạo gói ${payload.name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title={pkg ? 'Sửa gói quảng bá' : 'Tạo gói quảng bá'} onClose={submitting ? noop : onClose}>
    <form className="users-form" noValidate onSubmit={submit}>
      <label>Tên gói<input maxLength={200} value={form.name} onChange={set('name')} placeholder="Ví dụ: Nổi bật 7 ngày" /></label>
      <label>Mô tả<textarea rows={2} maxLength={1000} value={form.description || ''} onChange={set('description')} /></label>
      <label>Áp dụng cho<select value={form.targetType} onChange={set('targetType')}>{Object.entries(TARGETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Thời hạn (ngày)<input type="number" min="1" value={form.durationDays} onChange={set('durationDays')} /></label>
      <label>Giá (₫)<input type="number" min="0" step="1000" value={form.price} onChange={set('price')} /></label>
      <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.isActive} onChange={set('isActive')} />Đang bán (chủ sân thấy và mua được)</label>
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button primary" disabled={submitting}>{submitting ? 'Đang lưu…' : pkg ? 'Lưu thay đổi' : 'Tạo gói'}</button></footer>
    </form>
  </DemoDialog>
}

function DeletePackageDialog({ pkg, onClose, onDone }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setSubmitting(true); setError('')
    try {
      await deletePromotionPackage(pkg.id)
      onDone(`Đã xóa gói ${pkg.name}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Xóa gói quảng bá" onClose={submitting ? noop : onClose}>
    <p>Xóa gói <strong>{pkg.name}</strong>? Các lượt đã bán vẫn chạy đến hết hạn. Nếu chỉ muốn ngừng bán, hãy sửa gói và bỏ chọn "Đang bán".</p>
    {error && <p role="alert" className="users-form-error">{error}</p>}
    <div className="users-form"><footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Giữ lại</button><button type="button" className="users-button users-danger" onClick={submit} disabled={submitting}>{submitting ? 'Đang xóa…' : 'Xóa gói'}</button></footer></div>
  </DemoDialog>
}

export default function PromotionManagement() {
  const [reload, setReload] = useState(0)
  const [packages, setPackages] = useState({ key: -1, items: [], error: '' })
  const [targetType, setTargetType] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    listPromotionPackages()
      .then(items => !cancelled && setPackages({ key: reload, items, error: '' }))
      .catch(error => !cancelled && setPackages(previous => ({ ...previous, key: reload, error: error.message })))
    return () => { cancelled = true }
  }, [reload])
  const params = useMemo(() => ({ targetType, activeOnly: activeOnly || undefined, page, pageSize }), [targetType, activeOnly, page, pageSize])
  const sold = usePagedList(listSoldPromotions, params, reload)

  const loadingPackages = packages.key === -1
  const pkgs = packages.items
  const activeCount = sold.items.filter(item => String(item.status).toUpperCase() === 'ACTIVE').length
  const kpis = [
    { icon: PackageCheck, className: 'total', label: 'Gói đang bán', value: pkgs.filter(pkg => pkg.isActive).length, note: `${number(pkgs.length)} gói trong danh mục` },
    { icon: Building2, className: 'open', label: 'Gói cho cơ sở', value: pkgs.filter(pkg => pkg.targetType === 'FACILITY').length, note: 'Đẩy cơ sở lên đầu tìm kiếm' },
    { icon: Trophy, className: 'full', label: 'Gói cho giải đấu', value: pkgs.filter(pkg => pkg.targetType === 'TOURNAMENT').length, note: 'Đẩy giải lên đầu danh sách' },
    { icon: Megaphone, className: 'completed', label: 'Lượt đã bán', value: sold.total, note: `${number(activeCount)} lượt đang chạy (trang này)` },
  ]
  const pages = Math.max(1, sold.totalPages)
  const done = message => { setDialog(null); setNotice(message); setReload(value => value + 1) }

  return <div className="lfg-page"><header className="lfg-page-heading admin-page-header"><div><h1>Gói quảng bá <span>{loadingPackages ? '…' : `${number(pkgs.length)} gói`}</span></h1><p>Quản lý các gói đẩy tin chủ sân mua cho cơ sở hoặc giải đấu, và theo dõi các lượt đã bán.</p></div><div><button className="users-button" onClick={() => setReload(value => value + 1)}><RefreshCw size={13} />Làm mới</button><button className="users-button primary" onClick={() => setDialog({ type: 'edit', pkg: null })}><Plus size={13} />Tạo gói</button></div></header>
    <div className="lfg-kpis">{kpis.map(({ icon: Icon, className, label, value, note }) => <article key={label} className={className}><div><small>{label}</small><Icon size={24} /></div><strong>{loadingPackages ? '…' : number(value)}</strong><p>{note}</p></article>)}</div>
    {packages.error && <div className="users-notice" role="alert"><span>Không tải được danh sách gói: {packages.error}</span></div>}
    {sold.error && <div className="users-notice" role="alert"><span>Không tải được lượt đã bán: {sold.error}</span></div>}
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}

    <section className="lfg-table-panel" aria-label="Danh mục gói"><header><h2>Danh mục gói <span>{number(pkgs.length)} gói</span></h2></header><div className="lfg-table-scroll"><table><thead><tr>{['Tên gói', 'Áp dụng', 'Thời hạn', 'Giá', 'Trạng thái', ''].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{pkgs.map(pkg => <tr key={pkg.id}><td><strong>{pkg.name}</strong><small>{pkg.description}</small></td><td>{TARGETS[pkg.targetType] || pkg.targetType}</td><td>{number(pkg.durationDays)} ngày</td><td><strong>{money(pkg.price)}</strong></td><td>{pkg.isActive ? <StatusBadge status="Confirmed" label="Đang bán" /> : <StatusBadge status="Cancelled" label="Ngừng bán" />}</td><td><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}><button className="users-button" onClick={() => setDialog({ type: 'edit', pkg })} aria-label={`Sửa gói ${pkg.name}`}><Pencil size={13} />Sửa</button><button className="users-button users-danger" onClick={() => setDialog({ type: 'delete', pkg })} aria-label={`Xóa gói ${pkg.name}`}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table>
      {!loadingPackages && !pkgs.length && <p className="lfg-empty">Chưa có gói nào. Bấm "Tạo gói" để bắt đầu.</p>}</div></section>

    <section className="lfg-toolbar" aria-label="Lọc lượt đã bán" style={{ marginTop: 20 }}><div className="lfg-filter-row"><label>Áp dụng cho<select value={targetType} onChange={event => { setTargetType(event.target.value); setPage(1) }}><option value="">Tất cả</option>{Object.entries(TARGETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={activeOnly} onChange={event => { setActiveOnly(event.target.checked); setPage(1) }} />Chỉ lượt đang chạy</label></div></section>
    <section className="lfg-table-panel" aria-label="Lượt đã bán" aria-busy={sold.loading}><header><h2>Lượt đã bán <span>{number(sold.total)} lượt</span></h2></header><div className="lfg-table-scroll"><table><thead><tr>{['Gói', 'Chủ sân', 'Mục quảng bá', 'Thời gian', 'Giá', 'Trạng thái'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={sold.loading ? { opacity: 0.5 } : undefined}>{sold.items.map(item => { const [tone, label] = PROMOTION_STATUS[String(item.status).toUpperCase()] || ['Pending', item.status || '—']; return <tr key={item.id}><td><strong>{item.packageName}</strong></td><td>{item.ownerName || '—'}</td><td>{item.targetName || '—'}<small>{TARGETS[item.targetType] || item.targetType}</small></td><td>{formatDate(item.startAt)}<small>đến {formatDate(item.endAt)}</small></td><td>{money(item.price)}</td><td><StatusBadge status={tone} label={label} /></td></tr> })}</tbody></table>
      {sold.loading && !sold.items.length && <p className="lfg-empty">Đang tải…</p>}
      {!sold.loading && !sold.items.length && <p className="lfg-empty">Chưa có lượt nào được bán.</p>}</div>
      <footer className="lfg-pagination"><span>Trang {page} / {pages} · {number(sold.total)} lượt</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang lượt đã bán"><button aria-label="Trang trước" disabled={sold.loading || page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /></button><button aria-label="Trang sau" disabled={sold.loading || page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={13} /></button></nav></footer>
    </section>

    {dialog?.type === 'edit' && <PackageDialog pkg={dialog.pkg} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'delete' && <DeletePackageDialog pkg={dialog.pkg} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
