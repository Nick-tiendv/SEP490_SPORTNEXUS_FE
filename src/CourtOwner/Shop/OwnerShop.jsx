import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { confirmDialog } from '../../components/common/confirm.js'
import { uploadImage } from '../../api/player/uploadApi.js'
import {
  SHOP_ORDER_STATUS, createShopProduct, deleteShopProduct, getFacilityShopOrders, getShopProducts, updateShopOrderStatus, updateShopProduct,
} from '../../api/shopApi.js'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { formatDateTime, formatVND } from '../shared.js'

// Shop tại cơ sở: chủ sân bán nước, phụ kiện… Khách đặt trên app, trả tiền tại quầy (không qua ví).
const EMPTY = { name: '', description: '', price: '', stock: '', imageUrl: '', isActive: true }
// Bước tiếp theo của đơn: PENDING → READY → PICKED_UP
const NEXT_STATUS = { PENDING: ['READY', 'Báo đã chuẩn bị xong'], READY: ['PICKED_UP', 'Khách đã nhận & trả tiền'] }

function ProductModal({ facilityId, product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...product, price: String(product.price ?? ''), stock: String(product.stock ?? ''), description: product.description || '', imageUrl: product.imageUrl || '' } : EMPTY)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'general')
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } catch (error) {
      toast.error(error.message || 'Không tải được ảnh.')
    } finally {
      setUploading(false)
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    const price = Number(form.price), stock = Number(form.stock)
    if (!form.name.trim()) { toast.error('Nhập tên sản phẩm.'); return }
    if (!Number.isFinite(price) || price < 0) { toast.error('Giá không hợp lệ.'); return }
    if (!Number.isInteger(stock) || stock < 0) { toast.error('Tồn kho phải là số nguyên ≥ 0.'); return }
    setBusy(true)
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || null, price, stock, imageUrl: form.imageUrl || null, isActive: form.isActive }
      if (product) await updateShopProduct(product.id, payload)
      else await createShopProduct(facilityId, payload)
      toast.success(product ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.')
      onSaved()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="product-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <h2 id="product-title" className="snx-card-title">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          <label className="snx-field">Tên sản phẩm<input className="snx-input" maxLength={200} value={form.name} onChange={set('name')} placeholder="VD: Nước suối 500ml" /></label>
          <label className="snx-field">Mô tả<textarea className="snx-textarea" maxLength={1000} value={form.description} onChange={set('description')} /></label>
          <div className="snx-form-grid">
            <label className="snx-field">Giá (đ)<input className="snx-input" type="number" min="0" step="1000" value={form.price} onChange={set('price')} /></label>
            <label className="snx-field">Tồn kho<input className="snx-input" type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
          </div>
          <div className="snx-field">Ảnh
            <div className="snx-row">
              {form.imageUrl && <img src={form.imageUrl} alt="Ảnh sản phẩm" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />}
              <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
                {uploading ? 'Đang tải…' : form.imageUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(e) => { upload(e.target.files[0]); e.target.value = '' }} />
              </label>
            </div>
          </div>
          <label className="snx-row" style={{ gap: 8 }}><input type="checkbox" checked={form.isActive} onChange={set('isActive')} />Đang bán (khách thấy và đặt được)</label>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy || uploading}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </div>
  )
}

export default function OwnerShop() {
  const { facilityId, facility, loading } = useOwnerContext()
  const [tab, setTab] = useState('orders')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (thêm) | product
  const products = useApi(() => getShopProducts(facilityId, true), [facilityId], { enabled: !!facilityId, initialData: [] })
  const orders = useApi(() => getFacilityShopOrders(facilityId, status), [facilityId, status], { enabled: !!facilityId, initialData: [] })
  const pendingCount = (orders.data || []).filter((o) => String(o.status).toUpperCase() === 'PENDING').length
  // Tự tải lại đơn mỗi 30 giây khi đang mở trang (đơn mới / đơn đổi trạng thái hiện ra không cần bấm Làm mới)
  const refreshOrders = orders.refresh
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refreshOrders() }, 30000)
    return () => clearInterval(timer)
  }, [refreshOrders])

  const act = async (action, success, after) => {
    try {
      await action()
      toast.success(success)
      after()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!loading && !facilityId) return <div className="snx-page"><NoFacilityState what="mở shop tại sân" /></div>

  return (
    <div className="snx-page">
      <header className="snx-page-header">
        <div className="snx-page-header-copy">
          <p className="snx-page-eyebrow">Kinh doanh · {facility?.name || ''}</p>
          <h1 className="snx-page-title">Shop tại sân</h1>
          <p className="snx-page-subtitle">Bán nước, phụ kiện, thuê vợt… Khách đặt trước trên app, nhận hàng và trả tiền tại quầy (không qua ví).</p>
        </div>
        <div className="snx-page-actions">
          <button type="button" className="snx-btn snx-btn--primary" onClick={() => setEditing({})}><span className="material-symbols-outlined">add</span>Thêm sản phẩm</button>
        </div>
      </header>

      <div className="snx-tabs" role="tablist" style={{ marginBottom: 16 }}>
        <button type="button" role="tab" aria-selected={tab === 'orders'} className={`snx-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <span className="material-symbols-outlined">receipt</span>Đơn của khách{pendingCount > 0 && <span className="snx-tab-count">{pendingCount}</span>}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'products'} className={`snx-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          <span className="material-symbols-outlined">inventory_2</span>Sản phẩm ({products.data?.length || 0})
        </button>
      </div>

      {tab === 'orders' && (
        <div className="snx-card" style={{ padding: 0 }}>
          <div className="snx-row" style={{ padding: 12 }}>
            <select className="snx-select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Trạng thái đơn">
              <option value="">Mọi trạng thái</option>
              {Object.entries(SHOP_ORDER_STATUS).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <span className="snx-spacer" />
            <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={orders.refresh}>Làm mới</button>
          </div>
          {orders.error && <div className="snx-alert snx-alert--error" style={{ margin: 12 }}>{orders.error}</div>}
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Khách</th><th>Sản phẩm</th><th>Tiền thu tại quầy</th><th>Thời gian</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {(orders.data || []).map((o) => {
                  const key = String(o.status).toUpperCase()
                  const [label, tone] = SHOP_ORDER_STATUS[key] || [o.status, 'gray']
                  const next = NEXT_STATUS[key]
                  return (
                    <tr key={o.id}>
                      <td><strong>{o.customerName || '—'}</strong><div className="snx-muted">{o.customerPhone}</div></td>
                      <td>{o.quantity} × {o.productName}{o.note && <div className="snx-muted">Ghi chú: {o.note}</div>}</td>
                      <td><strong>{formatVND(o.totalAmount)}</strong></td>
                      <td>{formatDateTime(o.createdAt)}</td>
                      <td><span className={`snx-badge snx-badge--${tone}`}>{label}</span></td>
                      <td>
                        <div className="snx-row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                          {next && <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => act(() => updateShopOrderStatus(o.id, next[0]), 'Đã cập nhật đơn.', orders.refresh)}>{next[1]}</button>}
                          {(key === 'PENDING' || key === 'READY') && (
                            <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={async () => (await confirmDialog(`Hủy đơn ${o.quantity} × ${o.productName} của ${o.customerName}?`)) && act(() => updateShopOrderStatus(o.id, 'CANCELLED'), 'Đã hủy đơn.', orders.refresh)}>Hủy</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!orders.loading && !orders.data?.length && <p className="snx-muted" style={{ padding: 16 }}>Chưa có đơn nào.</p>}
            {orders.loading && <p className="snx-muted" style={{ padding: 16 }}>Đang tải…</p>}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <>
          {products.error && <div className="snx-alert snx-alert--error">{products.error}</div>}
          {!products.loading && !products.data?.length && <div className="snx-empty"><span className="material-symbols-outlined">storefront</span>Chưa có sản phẩm. Bấm "Thêm sản phẩm" để bắt đầu bán.</div>}
          <div className="snx-grid snx-grid--3">
            {(products.data || []).map((p) => (
              <article key={p.id} className="snx-card snx-stack" style={{ gap: 8, opacity: p.isActive ? 1 : 0.65 }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />}
                <div className="snx-row"><strong style={{ fontSize: 15 }}>{p.name}</strong><span className="snx-spacer" />{!p.isActive && <span className="snx-badge snx-badge--gray">Đang ẩn</span>}</div>
                {p.description && <p className="snx-muted" style={{ margin: 0 }}>{p.description}</p>}
                <div className="snx-row"><strong>{formatVND(p.price)}</strong><span className="snx-spacer" /><span className={`snx-badge snx-badge--${p.stock > 0 ? 'green' : 'red'}`}>Còn {p.stock}</span></div>
                <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEditing(p)}>Sửa</button>
                  <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={async () => (await confirmDialog(`Xóa sản phẩm "${p.name}"?`)) && act(() => deleteShopProduct(p.id), 'Đã xóa sản phẩm.', products.refresh)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {editing && <ProductModal facilityId={facilityId} product={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); products.refresh() }} />}
    </div>
  )
}
