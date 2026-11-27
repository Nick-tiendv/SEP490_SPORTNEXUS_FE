import { useEffect, useMemo, useState } from 'react'
import { Megaphone, PackageCheck, Building2, Trophy, Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, Search, CircleStop } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { useDebounced, usePagedList } from '../components/listHooks.js'
import { createPromotionPackage, deletePromotionPackage, endPromotion, listPromotionPackages, listSoldPromotions, updatePromotionPackage } from '../../api/admin/promotionApi.js'
import '../Users/users.css'
import '../LFG/lfg.css'

const TARGETS = { FACILITY: 'Cơ sở', TOURNAMENT: 'Giải đấu' }
const PROMOTION_STATUS = { ACTIVE: ['Confirmed', 'Đang chạy'], SCHEDULED: ['Pending', 'Chờ chạy'], EXPIRED: ['Completed', 'Hết hạn'], CANCELLED: ['Cancelled', 'Đã gỡ / hoàn tiền'] }
// Trạng thái mục được quảng bá (targetStatus)
const TARGET_STATUS = { LOCKED: 'Cơ sở bị khóa', DELETED: 'Đã xóa', CANCELLED: 'Giải đã hủy', FINISHED: 'Giải đã kết thúc' }
const number = value => (Number.isFinite(Number(value)) ? Number(value).toLocaleString('vi-VN') : '—')
const money = value => `${number(value)} Điểm`
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
    // Khớp kiểm tra của BE: tên ≤ 100, mô tả ≤ 500, thời hạn 1–365 ngày, giá > 0 và ≤ 100.000.000
    if (!form.name.trim()) return setError('Vui lòng nhập tên gói.')
    if (form.name.trim().length > 100) return setError('Tên gói tối đa 100 ký tự.')
    if ((form.description || '').trim().length > 500) return setError('Mô tả tối đa 500 ký tự.')
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) return setError('Thời hạn phải là số nguyên từ 1 đến 365 ngày.')
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) return setError('Giá gói phải lớn hơn 0 và không quá 100.000.000 Điểm.')
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
      <label>Tên gói<input maxLength={100} value={form.name} onChange={set('name')} placeholder="Ví dụ: Nổi bật 7 ngày" /></label>
      <label>Mô tả<textarea rows={2} maxLength={500} value={form.description || ''} onChange={set('description')} /></label>
      {/* Gói đã có lượt bán / đã gợi ý không đổi được loại áp dụng: khóa ô khi sửa */}
      <label>Áp dụng cho<select value={form.targetType} onChange={set('targetType')} disabled={Boolean(pkg)}>{Object.entries(TARGETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{pkg && <small>Không đổi loại áp dụng của gói đã tạo. Cần loại khác thì tạo gói mới.</small>}</label>
      <label>Thời hạn (ngày)<input type="number" min="1" max="365" value={form.durationDays} onChange={set('durationDays')} /></label>
      <label>Giá (Điểm)<input type="number" min="1" max="100000000" step="1000" value={form.price} onChange={set('price')} /></label>
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

// PATCH /api/v1/admin/promotions/{id}/end { reason }: gỡ ngay 1 lượt đẩy tin, hoàn phần ngày chưa dùng cho chủ sân.
function EndPromotionDialog({ item, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!reason.trim()) return setError('Vui lòng nhập lý do gỡ đẩy tin.')
    setSubmitting(true); setError('')
    try {
      const { message } = await endPromotion(item.id, reason.trim())
      onDone(message || `Đã gỡ lượt đẩy tin ${item.packageName}.`)
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }
  return <DemoDialog title="Gỡ đẩy tin" onClose={submitting ? noop : onClose}>
    <form className="users-form" noValidate onSubmit={submit}>
      <p style={{ margin: 0 }}>Gỡ lượt <strong>{item.packageName}</strong> của <strong>{item.targetName || '—'}</strong>? Lượt kết thúc ngay, chủ sân được hoàn phần ngày chưa dùng và nhận thông báo kèm lý do.</p>
      <label>Lý do<textarea rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: Ảnh quảng cáo sai sự thật" required /></label>
      {error && <p role="alert" className="users-form-error">{error}</p>}
      <footer><button type="button" className="users-button" onClick={onClose} disabled={submitting}>Hủy</button><button className="users-button users-danger" disabled={submitting}>{submitting ? 'Đang gỡ…' : 'Gỡ đẩy tin'}</button></footer>
    </form>
  </DemoDialog>
}

export default function PromotionManagement() {
  const [reload, setReload] = useState(0)
  const [packages, setPackages] = useState({ key: -1, items: [], error: '' })
  const [targetType, setTargetType] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const keyword = useDebounced(search.trim())
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
  const params = useMemo(() => ({ targetType, activeOnly: activeOnly || undefined, status, keyword, page, pageSize }), [targetType, activeOnly, status, keyword, page, pageSize])
  const sold = usePagedList(listSoldPromotions, params, reload)

  const loadingPackages = packages.key === -1
  const pkgs = packages.items
  // summary của BE: đếm toàn bộ lượt (theo loại + từ khóa), không phụ thuộc trang
  const summary = sold.summary || {}
  const kpis = [
    { icon: PackageCheck, className: 'total', label: 'Gói đang bán', value: pkgs.filter(pkg => pkg.isActive).length, note: `${number(pkgs.length)} gói trong danh mục` },
    { icon: Building2, className: 'open', label: 'Gói cho cơ sở', value: pkgs.filter(pkg => pkg.targetType === 'FACILITY').length, note: 'Đẩy cơ sở lên đầu tìm kiếm' },
    { icon: Trophy, className: 'full', label: 'Lượt đang chạy', value: summary.active ?? 0, note: `${number(summary.scheduled ?? 0)} chờ chạy · ${number(summary.cancelled ?? 0)} đã gỡ` },
    { icon: Megaphone, className: 'completed', label: 'Doanh thu gói ròng (Điểm)', value: summary.netRevenue ?? 0, note: `${number(sold.total)} lượt theo bộ lọc · đã hoàn ${money(summary.refundedAmount ?? 0)}` },
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

    <section className="lfg-toolbar" aria-label="Lọc lượt đã bán" style={{ marginTop: 20 }}><div className="lfg-filter-row"><label>Áp dụng cho<select value={targetType} onChange={event => { setTargetType(event.target.value); setPage(1) }}><option value="">Tất cả</option>{Object.entries(TARGETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="">Tất cả</option>{Object.entries(PROMOTION_STATUS).map(([value, [, label]]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="users-search"><Search size={14} /><input aria-label="Tìm lượt đẩy tin" placeholder="Chủ sân, gói, cơ sở / giải…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label><label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={activeOnly} onChange={event => { setActiveOnly(event.target.checked); setPage(1) }} />Chỉ lượt còn hạn</label></div></section>
    <section className="lfg-table-panel" aria-label="Lượt đã bán" aria-busy={sold.loading}><header><h2>Lượt đã bán <span>{number(sold.total)} lượt</span></h2></header><div className="lfg-table-scroll"><table><thead><tr>{['Gói', 'Chủ sân', 'Mục quảng bá', 'Thời gian', 'Giá', 'Trạng thái', ''].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={sold.loading ? { opacity: 0.5 } : undefined}>{sold.items.map(item => {
        const key = String(item.status).toUpperCase()
        const [tone, label] = PROMOTION_STATUS[key] || ['Pending', item.status || '—']
        const targetNote = TARGET_STATUS[String(item.targetStatus || '').toUpperCase()]
        return <tr key={item.id}><td><strong>{item.packageName}</strong></td><td>{item.ownerName || '—'}</td><td>{item.targetName || '—'}<small>{TARGETS[item.targetType] || item.targetType}{targetNote ? ` · ${targetNote}` : ''}</small></td><td>{formatDate(item.startAt)}<small>đến {formatDate(item.endAt)}</small></td><td>{money(item.price)}</td><td><StatusBadge status={tone} label={label} />{Number(item.refundedAmount) > 0 && <small>Đã hoàn {money(item.refundedAmount)}</small>}</td>
          <td>{(key === 'ACTIVE' || key === 'SCHEDULED') && <button className="users-button users-danger" onClick={() => setDialog({ type: 'end', item })}><CircleStop size={13} />Gỡ đẩy tin</button>}</td></tr>
      })}</tbody></table>
      {sold.loading && !sold.items.length && <p className="lfg-empty">Đang tải…</p>}
      {!sold.loading && !sold.items.length && <p className="lfg-empty">Chưa có lượt nào được bán.</p>}</div>
      <footer className="lfg-pagination"><span>Trang {page} / {pages} · {number(sold.total)} lượt</span><label>Số dòng mỗi trang<select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label><nav aria-label="Phân trang lượt đã bán"><button aria-label="Trang trước" disabled={sold.loading || page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /></button><button aria-label="Trang sau" disabled={sold.loading || page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={13} /></button></nav></footer>
    </section>

    {dialog?.type === 'edit' && <PackageDialog pkg={dialog.pkg} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'delete' && <DeletePackageDialog pkg={dialog.pkg} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'end' && <EndPromotionDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
