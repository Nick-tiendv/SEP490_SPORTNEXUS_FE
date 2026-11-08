import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { createShopOrder, getShopProducts } from '../../api/shopApi.js'

// Shop của cơ sở trên trang chi tiết sân: đặt trước, nhận hàng và trả tiền tại quầy (không qua ví).
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`

function OrderModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const max = Math.min(50, Number(product.stock) || 0)
  const submit = async (event) => {
    event.preventDefault()
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > max) { toast.error(`Số lượng từ 1 đến ${max}.`); return }
    setBusy(true)
    try {
      await createShopOrder({ productId: product.id, quantity: qty, note: note.trim() })
      toast.success(`Đã đặt ${qty} × ${product.name}. Nhận hàng và thanh toán tại quầy.`)
      onClose(true)
    } catch (error) {
      toast.error(error?.message || 'Không đặt được sản phẩm.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="shop-order-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="shop-order-title" className="snx-card-title">Đặt {product.name}</h2>
            <p className="snx-card-subtitle">{money(product.price)} / sản phẩm · còn {product.stock}. Trả tiền tại quầy khi nhận hàng.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={() => onClose(false)}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          <label className="snx-field">Số lượng<input className="snx-input" type="number" min="1" max={max} value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
          <label className="snx-field">Ghi chú (không bắt buộc)<input className="snx-input" maxLength={300} placeholder="VD: lấy lúc 19h, sân 2" value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <p style={{ margin: 0 }}>Tạm tính: <strong>{money((Number(quantity) || 0) * Number(product.price || 0))}</strong></p>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={() => onClose(false)}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy}>{busy ? 'Đang đặt…' : 'Đặt trước'}</button>
        </div>
      </form>
    </div>
  )
}

export default function FacilityShop({ facilityId }) {
  const products = useApi(() => getShopProducts(facilityId), [facilityId], { enabled: Boolean(facilityId), initialData: [] })
  const [ordering, setOrdering] = useState(null)
  const items = (products.data || []).filter((p) => p.isActive !== false)
  if (products.error || !items.length) return null

  return (
    <div className="snx-card snx-stack" style={{ gap: 10 }}>
      <div className="snx-row">
        <h3 className="snx-card-title" style={{ fontSize: 17 }}>Shop tại sân</h3>
        <span className="snx-spacer" />
        <Link className="snx-btn snx-btn--ghost snx-btn--sm" to="/shop-orders">Đơn mua của tôi</Link>
      </div>
      <p className="snx-muted" style={{ margin: 0 }}>Đặt trước nước, phụ kiện… nhận và trả tiền tại quầy, không trừ ví.</p>
      <div className="snx-list">
        {items.map((p) => (
          <div key={p.id} className="snx-list-item">
            {p.imageUrl
              ? <img src={p.imageUrl} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
              : <span className="material-symbols-outlined" style={{ color: '#15803d' }}>storefront</span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{p.name}</strong>
              <div className="snx-muted">{money(p.price)}{p.description ? ` · ${p.description}` : ''}</div>
            </div>
            {p.stock > 0
              ? <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setOrdering(p)}>Đặt</button>
              : <span className="snx-badge snx-badge--gray">Hết hàng</span>}
          </div>
        ))}
      </div>
      {ordering && <OrderModal product={ordering} onClose={(done) => { setOrdering(null); if (done) products.refresh() }} />}
    </div>
  )
}
