import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import { useApi } from '../../hooks/useApi.js'
import { acceptRefundReport, getOwnerReport, getOwnerReports, respondReport } from '../../api/owner'
import { uploadImage } from '../../api/player/uploadApi.js'
import { useOwnerContext } from '../Layout/ownerContext.js'
import { formatDateTime, formatVND, statusBadge } from '../shared.js'

const PAGE_SIZE = 10
const STATUS_TABS = [
  { value: '', label: 'Tất cả', count: null },
  { value: 'PENDING', label: 'Chờ giải trình', count: 'pending' },
  { value: 'OWNER_RESPONDED', label: 'Đã giải trình', count: 'responded' },
  { value: 'RESOLVED_REFUNDED', label: 'Đã hoàn tiền', count: 'refunded' },
  { value: 'RESOLVED_NO_REFUND', label: 'Không hoàn tiền', count: 'noRefund' },
]

function Badge({ status }) {
  const b = statusBadge(status)
  return <span className={b.className}>{b.label}</span>
}

function ImageList({ urls }) {
  if (!urls?.length) return null
  return (
    <div className="snx-thumb-grid">
      {urls.map((url) => <a key={url} className="snx-thumb" href={url} target="_blank" rel="noreferrer"><img src={url} alt="Ảnh bằng chứng" /></a>)}
    </div>
  )
}

function ReportDetailModal({ reportId, onClose, onChanged }) {
  const detail = useApi(() => getOwnerReport(reportId), [reportId])
  const r = detail.data
  const [mode, setMode] = useState('respond') // respond | refund
  const [response, setResponse] = useState('')
  const [evidence, setEvidence] = useState([])
  const [refundPct, setRefundPct] = useState(100)
  const [lockSlot, setLockSlot] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const canAct = ['PENDING', 'OWNER_RESPONDED'].includes(String(r?.status || '').toUpperCase())

  const addImages = async (files) => {
    const list = [...files].slice(0, 5 - evidence.length)
    if (!list.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(list.map((file) => uploadImage(file, 'report')))
      setEvidence((prev) => [...prev, ...urls.filter(Boolean)])
    } catch (error) {
      toast.error(error.message || 'Không tải được ảnh.')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!response.trim()) { toast.error('Vui lòng nhập nội dung giải trình.'); return }
    if (mode === 'refund' && !(await confirmDialog(`Đồng ý hoàn ${refundPct}% tiền cho khách ngay? Thao tác này không hoàn tác được.`))) return
    setBusy(true)
    try {
      if (mode === 'refund') {
        await acceptRefundReport(reportId, { ownerResponse: response.trim(), ownerEvidenceUrls: evidence, refundPercentage: Number(refundPct), lockSlotForMaintenance: lockSlot })
        toast.success('Đã đồng ý hoàn tiền cho khách.')
      } else {
        await respondReport(reportId, { ownerResponse: response.trim(), ownerEvidenceUrls: evidence })
        toast.success('Đã gửi giải trình, Admin sẽ xem xét.')
      }
      onChanged()
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div className="snx-modal-head">
          <div>
            <h2 id="report-title" className="snx-card-title">Khiếu nại của {r?.reporterName || '…'}</h2>
            <p className="snx-card-subtitle">{r ? `${r.facilityName} • ${r.courtName || ''} • gửi lúc ${formatDateTime(r.createdAt)}` : 'Đang tải…'}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" onClick={onClose} aria-label="Đóng"><span className="material-symbols-outlined">close</span></button>
        </div>

        {detail.error && <div className="snx-alert snx-alert--error">{detail.error}</div>}
        {r && (
          <div className="snx-stack">
            <div className="snx-row"><Badge status={r.status} />{r.bookingStatus && <span className="snx-muted">Đơn đặt: <Badge status={r.bookingStatus} /></span>}</div>
            <div className="snx-form-grid">
              <div><div className="snx-muted">Lý do</div><strong>{r.reason || '—'}</strong></div>
              <div><div className="snx-muted">Ca đặt</div><strong>{formatDateTime(r.bookingStartTime)}</strong></div>
              <div><div className="snx-muted">Giá trị đơn</div><strong>{formatVND(r.bookingTotalAmount)}</strong></div>
              <div><div className="snx-muted">Khách yêu cầu hoàn</div><strong>{r.requestedRefundPercentage != null ? `${r.requestedRefundPercentage}%` : '—'}</strong></div>
              <div><div className="snx-muted">Liên hệ</div><strong>{r.reporterPhone || r.reporterEmail || '—'}</strong></div>
            </div>
            <div><div className="snx-muted">Mô tả của khách</div><p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{r.description || '—'}</p></div>
            <ImageList urls={r.evidenceImageUrls} />

            {r.ownerResponse && (
              <div style={{ padding: 12, borderRadius: 10, background: '#f1f7f3' }}>
                <strong>Giải trình của bạn</strong> <span className="snx-muted">{formatDateTime(r.ownerRespondedAt)}</span>
                <p style={{ margin: '4px 0 8px', whiteSpace: 'pre-wrap' }}>{r.ownerResponse}</p>
                <ImageList urls={r.ownerEvidenceUrls} />
              </div>
            )}
            {(r.adminNote || r.resolvedAt) && (
              <div className="snx-alert snx-alert--info">
                Admin {r.resolvedByAdminName || ''}: {r.adminNote || 'đã xử lý'}{r.refundedAmount ? ` • Hoàn ${formatVND(r.refundedAmount)} (${r.appliedRefundPercentage}%)` : ''}
              </div>
            )}

            {canAct && (
              <form className="snx-stack" style={{ gap: 10, borderTop: '1px solid #eef2f1', paddingTop: 14 }} onSubmit={submit}>
                <div className="snx-tabs" role="tablist" aria-label="Cách xử lý">
                  <button type="button" role="tab" aria-selected={mode === 'respond'} className="snx-tab" onClick={() => setMode('respond')}>Gửi giải trình cho Admin</button>
                  <button type="button" role="tab" aria-selected={mode === 'refund'} className="snx-tab" onClick={() => setMode('refund')}>Đồng ý hoàn tiền ngay</button>
                </div>
                <label className="snx-field">Nội dung {mode === 'refund' ? 'gửi khách' : 'giải trình'}
                  <textarea className="snx-textarea" rows={3} maxLength={2000} value={response} onChange={(e) => setResponse(e.target.value)} />
                </label>
                {mode === 'refund' && (
                  <div className="snx-row">
                    <label className="snx-field" style={{ width: 160 }}>Tỉ lệ hoàn (%)
                      <input className="snx-input" type="number" min={1} max={100} value={refundPct} onChange={(e) => setRefundPct(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} />
                    </label>
                    <label className="snx-row" style={{ fontSize: 13 }}><input type="checkbox" checked={lockSlot} onChange={(e) => setLockSlot(e.target.checked)} /> Khóa ca này để bảo trì sân</label>
                  </div>
                )}
                <div className="snx-row">
                  <label className="snx-btn snx-btn--secondary snx-btn--sm" style={{ cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_photo_alternate</span>{uploading ? 'Đang tải…' : 'Thêm ảnh bằng chứng'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading || evidence.length >= 5} onChange={(e) => { addImages(e.target.files); e.target.value = '' }} />
                  </label>
                  <span className="snx-muted">{evidence.length}/5 ảnh</span>
                </div>
                {evidence.length > 0 && (
                  <div className="snx-thumb-grid">
                    {evidence.map((url) => (
                      <div key={url} className="snx-thumb"><img src={url} alt="Bằng chứng" />
                        <div className="snx-thumb-actions"><button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => setEvidence((prev) => prev.filter((u) => u !== url))}>Bỏ</button></div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="snx-modal-foot">
                  <button type="button" className="snx-btn snx-btn--ghost" onClick={onClose}>Đóng</button>
                  <button type="submit" className={`snx-btn ${mode === 'refund' ? 'snx-btn--danger' : 'snx-btn--primary'}`} disabled={busy || uploading}>{mode === 'refund' ? 'Hoàn tiền cho khách' : 'Gửi giải trình'}</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OwnerReports() {
  const { facilities } = useOwnerContext()
  const [status, setStatus] = useState('')
  const [facilityId, setFacilityId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)

  const list = useApi(
    () => getOwnerReports({ status, facilityId, searchKeyword: search, pageIndex: page, pageSize: PAGE_SIZE }),
    [status, facilityId, search, page],
    { initialData: { items: [], total: 0, counts: {} } },
  )
  const { items, total, counts } = list.data
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="snx-stack">
      <PageHeader eyebrow="Khách hàng" eyebrowIcon="report" title="Khiếu nại của khách" subtitle="Giải trình với Admin hoặc chủ động hoàn tiền cho các khiếu nại tại cơ sở của bạn." />

      <div className="snx-row">
        <div className="snx-tabs" role="tablist" aria-label="Trạng thái khiếu nại">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} type="button" role="tab" aria-selected={status === tab.value} className="snx-tab" onClick={() => { setStatus(tab.value); setPage(1) }}>
              {tab.label}{tab.count && counts[tab.count] ? <span className="snx-tab-count">{counts[tab.count]}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <form className="snx-row" onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()); setPage(1) }}>
        <select className="snx-select" style={{ width: 'auto' }} value={facilityId} onChange={(e) => { setFacilityId(e.target.value); setPage(1) }} aria-label="Lọc theo cơ sở">
          <option value="">Tất cả cơ sở</option>
          {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <input className="snx-input" style={{ width: 240 }} placeholder="Tìm theo tên khách, lý do…" value={keyword} onChange={(e) => setKeyword(e.target.value)} aria-label="Từ khóa" />
        <button type="submit" className="snx-btn snx-btn--secondary snx-btn--sm">Tìm</button>
      </form>

      {list.error && <div className="snx-alert snx-alert--error">{list.error}</div>}
      <div className="snx-card" style={{ padding: 0 }}>
        {list.loading && !items.length ? (
          <p className="snx-muted" style={{ padding: 20 }}>Đang tải khiếu nại…</p>
        ) : items.length === 0 ? (
          <div className="snx-empty" style={{ border: 0 }}><span className="material-symbols-outlined">verified</span>Không có khiếu nại nào.</div>
        ) : (
          <div className="snx-table-wrap">
            <table className="snx-table">
              <thead><tr><th>Khách</th><th>Cơ sở / sân</th><th>Lý do</th><th>Ca đặt</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.reporterName}</strong><div className="snx-muted">{formatDateTime(r.createdAt)}</div></td>
                    <td>{r.facilityName}<div className="snx-muted">{r.courtName}</div></td>
                    <td>{r.reason}</td>
                    <td>{formatDateTime(r.bookingStartTime)}<div className="snx-muted">{formatVND(r.bookingTotalAmount)}</div></td>
                    <td><Badge status={r.status} /></td>
                    <td><button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setOpenId(r.id)}>{String(r.status).toUpperCase() === 'PENDING' ? 'Xử lý' : 'Xem'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="snx-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <span className="snx-muted">Trang {page} / {totalPages}</span>
          <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      )}

      {openId && <ReportDetailModal reportId={openId} onClose={() => setOpenId(null)} onChanged={list.refresh} />}
    </div>
  )
}
