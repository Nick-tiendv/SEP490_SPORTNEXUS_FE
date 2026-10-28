import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getMyPromotions, getMyTournaments, getPromotionPackages, purchasePromotion } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { formatDateTime, formatVND, statusBadge } from '../shared.js'

const TARGETS = [
  { value: 'FACILITY', label: 'Cơ sở', icon: 'domain' },
  { value: 'TOURNAMENT', label: 'Giải đấu', icon: 'emoji_events' },
]

function PurchaseModal({ pkg, targets, balance, onClose, onDone }) {
  const [targetId, setTargetId] = useState(targets[0]?.id || '')
  const [busy, setBusy] = useState(false)
  const enough = balance == null || Number(balance) >= Number(pkg.price)

  const submit = async (event) => {
    event.preventDefault()
    if (!targetId) { toast.error('Vui lòng chọn mục cần quảng bá.'); return }
    setBusy(true)
    try {
      await purchasePromotion({ packageId: pkg.id, targetId })
      toast.success(`Đã mua gói "${pkg.name}".`)
      onDone()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="buy-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="buy-title" className="snx-card-title">Mua gói {pkg.name}</h2>
            <p className="snx-card-subtitle">{pkg.durationDays} ngày • {formatVND(pkg.price)} • trừ vào số dư ví</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack" style={{ gap: 12 }}>
          {targets.length === 0 ? (
            <div className="snx-alert snx-alert--info">Bạn chưa có {pkg.targetType === 'TOURNAMENT' ? 'giải đấu' : 'cơ sở'} nào để quảng bá.</div>
          ) : (
            <label className="snx-field">{pkg.targetType === 'TOURNAMENT' ? 'Giải đấu' : 'Cơ sở'} được quảng bá
              <select className="snx-select" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                {targets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          )}
          <p className="snx-muted" style={{ margin: 0 }}>Nếu mục này đang có lượt quảng bá, thời hạn sẽ được cộng nối tiếp.</p>
          <div className="snx-row"><span className="snx-muted">Số dư ví hiện tại:</span><strong>{formatVND(balance)}</strong></div>
          {!enough && <div className="snx-alert snx-alert--error">Số dư không đủ. Vui lòng nạp thêm hoặc chờ tiền về ví.</div>}
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={busy || !enough || !targets.length}>Thanh toán {formatVND(pkg.price)}</button>
        </div>
      </form>
    </div>
  )
}

export default function OwnerPromotions() {
  const { facilities, wallet, refreshWallet } = useOwnerContext()
  const [targetType, setTargetType] = useState('FACILITY')
  const [activeOnly, setActiveOnly] = useState(false)
  const [buying, setBuying] = useState(null)

  const packages = useApi(() => getPromotionPackages(targetType), [targetType], { initialData: [] })
  const tournaments = useApi(() => getMyTournaments(), [], { initialData: [] })
  const mine = useApi(() => getMyPromotions({ activeOnly, page: 1, pageSize: 50 }), [activeOnly], { initialData: { items: [] } })

  const targets = targetType === 'TOURNAMENT'
    ? (tournaments.data || []).filter((t) => !['CANCELLED', 'FINISHED'].includes(String(t.status).toUpperCase())).map((t) => ({ id: String(t.id), name: t.name }))
    : facilities.filter((f) => f.approvalStatus === 'APPROVED' || !f.approvalStatus).map((f) => ({ id: f.id, name: f.name }))
  const balance = wallet?.availableBalance ?? wallet?.balance

  return (
    <div className="snx-stack">
      <PageHeader eyebrow="Kinh doanh" eyebrowIcon="campaign" title="Quảng bá" subtitle="Đẩy cơ sở hoặc giải đấu lên đầu kết quả tìm kiếm của người chơi." />

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 14 }}>
          <h2 className="snx-card-title">Gói đang bán</h2>
          <span className="snx-spacer" />
          <div className="snx-tabs" role="tablist" aria-label="Loại gói">
            {TARGETS.map((t) => (
              <button key={t.value} type="button" role="tab" aria-selected={targetType === t.value} className="snx-tab" onClick={() => setTargetType(t.value)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
        {packages.error && <div className="snx-alert snx-alert--error">{packages.error}</div>}
        {packages.loading && !packages.data.length ? (
          <p className="snx-muted">Đang tải gói…</p>
        ) : packages.data.length === 0 ? (
          <div className="snx-empty"><span className="material-symbols-outlined">inventory_2</span>Hiện chưa có gói quảng bá nào cho {targetType === 'TOURNAMENT' ? 'giải đấu' : 'cơ sở'}.</div>
        ) : (
          <div className="snx-grid snx-grid--3">
            {packages.data.map((pkg) => (
              <div key={pkg.id} className="snx-card" style={{ padding: 16, boxShadow: 'none' }}>
                <div className="snx-row"><strong style={{ fontSize: 16 }}>{pkg.name}</strong><span className="snx-spacer" /><span className="snx-badge snx-badge--blue">{pkg.durationDays} ngày</span></div>
                <p className="snx-muted" style={{ minHeight: 36 }}>{pkg.description || 'Ưu tiên hiển thị trong kết quả tìm kiếm.'}</p>
                <div className="snx-row">
                  <span className="snx-stat-value" style={{ fontSize: 20 }}>{formatVND(pkg.price)}</span>
                  <span className="snx-spacer" />
                  <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => setBuying(pkg)}>Mua gói</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="snx-card">
        <div className="snx-row" style={{ marginBottom: 12 }}>
          <h2 className="snx-card-title">Lượt quảng bá đã mua</h2>
          <span className="snx-spacer" />
          <label className="snx-row" style={{ fontSize: 13 }}><input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} /> Chỉ đang chạy</label>
        </div>
        {mine.error && <div className="snx-alert snx-alert--error">{mine.error}</div>}
        {mine.data.items.length === 0 ? (
          <div className="snx-empty"><span className="material-symbols-outlined">campaign</span>Bạn chưa mua lượt quảng bá nào.</div>
        ) : (
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Gói</th><th>Mục quảng bá</th><th>Thời gian</th><th>Giá</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {mine.data.items.map((p) => {
                  const b = statusBadge(p.status)
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.packageName}</strong></td>
                      <td>{p.targetName}<div className="snx-muted">{p.targetType === 'TOURNAMENT' ? 'Giải đấu' : 'Cơ sở'}</div></td>
                      <td>{formatDateTime(p.startAt)}<div className="snx-muted">đến {formatDateTime(p.endAt)}</div></td>
                      <td>{formatVND(p.price)}</td>
                      <td><span className={b.className}>{b.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {buying && (
        <PurchaseModal
          pkg={buying}
          targets={targets}
          balance={balance}
          onClose={() => setBuying(null)}
          onDone={() => { mine.refresh(); refreshWallet().catch(() => {}) }}
        />
      )}
    </div>
  )
}
