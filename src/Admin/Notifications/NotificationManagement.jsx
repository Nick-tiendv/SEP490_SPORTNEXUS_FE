import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarClock, Download, Eye, Megaphone, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { usePagedList } from '../components/listHooks.js'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { cancelBroadcast, createBroadcast, getBroadcast, getNotificationStatistics, listBroadcasts } from '../../api/admin/notificationApi.js'
import { STATS_PERIODS, broadcastsCsv, formatNumber, formatPercent, statusFilters, statusLabels, targetLabels } from './notificationHelpers.js'
import { NotificationPagination } from './NotificationUI.jsx'
import NotificationTable from './NotificationTable.jsx'
import { BroadcastInspector, TypeStats } from './NotificationInspector.jsx'
import CreateNotificationModal from './CreateNotificationModal.jsx'
import '../Users/users.css'
import './notification.css'

export default function NotificationManagement() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [reload, setReload] = useState(0)
  const [days, setDays] = useState(30)
  const [selectedId, setSelectedId] = useState(null)
  const [composing, setComposing] = useState(false)
  const [confirmation, setConfirmation] = useState(null) // { action: 'cancel' | 'recall', broadcast }
  const [busy, setBusy] = useState(false)

  // GET /api/v1/admin/notifications/broadcasts — lọc trạng thái, phân trang phía server.
  const params = useMemo(() => ({ Status: status, Page: page, PageSize: pageSize }), [status, page, pageSize])
  const list = usePagedList(listBroadcasts, params, reload)
  const rows = list.items
  const pages = Math.max(1, list.totalPages || Math.ceil(list.total / pageSize))

  // GET /api/v1/admin/notifications/statistics?days
  const statsKey = `${days}|${reload}`
  const [stats, setStats] = useState({ key: '', data: null, error: '' })
  useEffect(() => {
    let cancelled = false
    const key = `${days}|${reload}`
    getNotificationStatistics(days)
      .then(data => !cancelled && setStats({ key, data, error: '' }))
      .catch(error => !cancelled && setStats(previous => ({ ...previous, key, error: error.message })))
    return () => { cancelled = true }
  }, [days, reload])
  const statsLoading = stats.key !== statsKey
  const s = stats.data

  // Chi tiết đợt đang chọn: GET /broadcasts/{id} (mặc định chọn dòng đầu tiên của trang).
  const activeId = rows.some(row => row.id === selectedId) ? selectedId : rows[0]?.id || null
  const detailKey = activeId ? `${activeId}|${reload}` : ''
  const [detail, setDetail] = useState({ key: '', data: null, error: '' })
  useEffect(() => {
    if (!detailKey) return
    let cancelled = false
    getBroadcast(detailKey.split('|')[0])
      .then(data => !cancelled && setDetail({ key: detailKey, data, error: '' }))
      .catch(error => !cancelled && setDetail({ key: detailKey, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [detailKey])
  const selected = (detail.key === detailKey && detail.data) || rows.find(row => row.id === activeId) || null

  const refresh = () => setReload(value => value + 1)
  const changeStatus = value => { setStatus(value); setPage(1); setSelectedId(null) }

  const submitBroadcast = async payload => {
    const { data, message } = await createBroadcast(payload)
    toast.success(message || 'Đã tạo đợt thông báo.')
    setComposing(false)
    setStatus(''); setPage(1); setSelectedId(data.id)
    refresh()
  }

  // DELETE /broadcasts/{id}: hủy đợt hẹn giờ hoặc thu hồi đợt đã gửi.
  const confirmAction = async () => {
    setBusy(true)
    try {
      const message = await cancelBroadcast(confirmation.broadcast.id)
      toast.success(message || (confirmation.action === 'cancel' ? 'Đã hủy đợt thông báo hẹn giờ.' : 'Đã thu hồi thông báo.'))
      setConfirmation(null)
      refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([broadcastsCsv(rows)], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `sportnexus-thong-bao-trang-${page}.csv`; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`Đã xuất ${rows.length} đợt thông báo của trang hiện tại.`)
  }

  const show = value => (statsLoading ? '…' : stats.error && !s ? '—' : value)
  const cards = [
    ['Thông báo đã gửi', show(formatNumber(s?.totalSent)), Bell, `Mọi loại thông báo, ${days} ngày gần nhất`],
    ['Đã đọc', show(formatNumber(s?.totalRead)), Eye, s ? `Tỷ lệ đọc ${formatPercent(s.readRate)}` : ''],
    ['Đợt hệ thống đã gửi', show(formatNumber(s?.broadcastsSent)), Megaphone, 'Do quản trị viên gửi'],
    ['Đợt đang hẹn giờ', show(formatNumber(s?.broadcastsScheduled)), CalendarClock, 'Chờ đến giờ gửi'],
  ]
  const target = confirmation?.broadcast

  return <div className="nt-page">
    <div className="nt-page-heading admin-page-header">
      <div><div className="nt-title-row"><h1>Quản lý thông báo</h1><span className="nt-overview-badge">{list.loading && !list.total ? '…' : `${formatNumber(list.total)} đợt`}</span></div><p>Gửi thông báo hệ thống tới người chơi và chủ sân, hẹn giờ, theo dõi tỷ lệ đọc và thu hồi khi cần.</p></div>
      <div className="nt-heading-actions">
        <label className="nt-muted">Thống kê <select value={days} onChange={event => setDays(Number(event.target.value))}>{STATS_PERIODS.map(value => <option key={value} value={value}>{value} ngày</option>)}</select></label>
        <button className="nt-button" onClick={refresh} disabled={list.loading}><RefreshCw size={14} />Làm mới</button>
        <button className="nt-button" onClick={exportCsv} disabled={!rows.length}><Download size={14} />Xuất CSV</button>
        <button className="nt-button primary" onClick={() => setComposing(true)}><Plus size={15} />Tạo thông báo</button>
      </div>
    </div>
    {stats.error && !statsLoading && <p className="nt-error" role="alert">Không tải được thống kê: {stats.error}</p>}
    <div className="nt-stats">{cards.map(([label, value, icon, trend]) => <StatCard key={label} label={label} value={value} icon={icon} trend={trend} />)}</div>

    <div className="nt-tabs" role="tablist" aria-label="Lọc theo trạng thái">
      {['', ...statusFilters].map(value => <button key={value || 'all'} role="tab" aria-selected={status === value} className={status === value ? 'active' : ''} onClick={() => changeStatus(value)}>{value ? statusLabels[value].label : 'Tất cả'}</button>)}
    </div>

    <div className="nt-content-grid">
      <section className="nt-panel nt-list" aria-label="Lịch sử đợt thông báo">
        <NotificationTable rows={rows} loading={list.loading} error={list.error} selectedId={activeId} onSelect={setSelectedId} onAction={(action, broadcast) => setConfirmation({ action, broadcast })} />
        <NotificationPagination total={list.total} page={page} pages={pages} pageSize={pageSize} loading={list.loading} onPage={value => { setPage(value); setSelectedId(null) }} onPageSize={value => { setPageSize(value); setPage(1); setSelectedId(null) }} />
      </section>
      <div className="nt-inspector-column">
        <BroadcastInspector broadcast={selected} loading={list.loading} error={detail.key === detailKey ? detail.error : ''} onAction={(action, broadcast) => setConfirmation({ action, broadcast })} />
        <TypeStats stats={s} loading={statsLoading} error={stats.error} />
      </div>
    </div>

    {composing && <CreateNotificationModal onClose={() => setComposing(false)} onSubmit={submitBroadcast} />}
    {confirmation && <DemoDialog title={confirmation.action === 'cancel' ? 'Hủy đợt hẹn giờ' : 'Thu hồi thông báo'} onClose={busy ? () => {} : () => setConfirmation(null)}>
      <div className="nt-modal-content">
        <p>{confirmation.action === 'cancel'
          ? <>Hủy đợt “<strong>{target.title}</strong>”? Thông báo sẽ không được gửi.</>
          : <>Thu hồi đợt “<strong>{target.title}</strong>” khỏi hộp thư của {formatNumber(target.recipientCount)} người nhận ({targetLabels[target.target] || target.target})? Không thể hoàn tác.</>}</p>
        <footer><button className="nt-button" onClick={() => setConfirmation(null)} disabled={busy}>Quay lại</button><button className="nt-button danger" onClick={confirmAction} disabled={busy}>{busy ? 'Đang xử lý…' : confirmation.action === 'cancel' ? 'Hủy đợt' : 'Thu hồi'}</button></footer>
      </div>
    </DemoDialog>}
  </div>
}
