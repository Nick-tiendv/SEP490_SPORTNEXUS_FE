import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { confirmDialog } from '../../components/common/confirm.js'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { SHOP_ORDER_STATUS, cancelMyShopOrder, getMyShopOrders } from '../../api/shopApi.js'

// Đơn mua tại sân của tôi: GET /api/v1/shop/orders/me. Hủy được khi đơn còn PENDING.
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`
const dateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—')

export default function MyShopOrders() {
  const orders = useApi(getMyShopOrders, [], { initialData: [] })
  const cancel = async (order) => {
    if (!(await confirmDialog(`Hủy đơn ${order.quantity} × ${order.productName}?`))) return
    try {
      await cancelMyShopOrder(order.id)
      toast.success('Đã hủy đơn.')
      orders.refresh()
    } catch (error) {
      toast.error(error?.message || 'Không hủy được đơn.')
    }
  }
  return (
    <div className="snx-page snx-page--narrow">
      <PageHeader eyebrow="Của tôi" eyebrowIcon="storefront" title="Đơn mua tại sân" subtitle="Sản phẩm đặt trước ở shop của cơ sở. Nhận hàng và trả tiền tại quầy, không trừ ví." />
      {orders.loading && <p className="snx-muted">Đang tải…</p>}
      {orders.error && <div className="snx-alert snx-alert--error">{orders.error}</div>}
      {!orders.loading && !orders.error && !orders.data?.length && (
        <div className="snx-empty"><span className="material-symbols-outlined">shopping_bag</span>Bạn chưa đặt sản phẩm nào. Xem shop ở trang chi tiết sân.<div className="snx-row" style={{ justifyContent: 'center', marginTop: 12 }}><Link className="snx-btn snx-btn--primary" to="/court-finder">Tìm sân</Link></div></div>
      )}
      {orders.data?.length > 0 && (
        <div className="snx-card">
          <div className="snx-list">
            {orders.data.map((o) => {
              const key = String(o.status).toUpperCase()
              const [label, tone] = SHOP_ORDER_STATUS[key] || [o.status, 'gray']
              return (
                <div key={o.id} className="snx-list-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14 }}>{o.quantity} × {o.productName}</strong>
                    <div className="snx-muted">{o.facilityName} · {dateTime(o.createdAt)}{o.note ? ` · ${o.note}` : ''}</div>
                  </div>
                  <strong style={{ fontSize: 14 }}>{money(o.totalAmount)}</strong>
                  <span className={`snx-badge snx-badge--${tone}`}>{label}</span>
                  {key === 'PENDING' && <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => cancel(o)}>Hủy</button>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
