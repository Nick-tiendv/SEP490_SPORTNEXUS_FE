import { useState } from 'react'
import { Bell, CalendarClock, Plus, RefreshCw, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { usePagedList } from '../components/listHooks.js'
import { useApi } from '../../hooks/useApi.js'
import { createBroadcast, deleteBroadcast, getNotificationStatistics, listBroadcasts } from '../../api/admin/notificationApi.js'
import '../Users/users.css'
import './notification.css'

// target theo BE: ALL (Player + Owner) | PLAYER | OWNER | USERS (kèm userIds)
const TARGETS = [
  { value: 'ALL', label: 'Tất cả người dùng' },
  { value: 'PLAYER', label: 'Người chơi' },
  { value: 'OWNER', label: 'Chủ sân' },
  { value: 'USERS', label: 'Người dùng cụ thể (nhập ID)' },
]
const STATUS_LABELS = { SCHEDULED: 'Đã hẹn giờ', SENT: 'Đã gửi', CANCELLED: 'Đã hủy', RECALLED: 'Đã thu hồi' }
const number = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
const time = value => (value ? new Date(value).toLocaleString('vi-VN') : '—')
const emptyForm = { title: '', body: '', target: 'ALL', userIds: '', scheduledAt: '' }

function ComposeDialog({ onClose, onSent }) {
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }))

  const submit = async event => {
    event.preventDefault()
    if (!form.title.trim() || !form.body.trim()) { toast.error('Vui lòng nhập tiêu đề và nội dung.'); return }
    const userIds = form.target === 'USERS' ? form.userIds.split(/[\s,;]+/).filter(Boolean) : []
    if (form.target === 'USERS' && userIds.length === 0) { toast.error('Vui lòng nhập ít nhất một ID người dùng.'); return }
    setSending(true)
    try {
      await createBroadcast({
        title: form.title.trim(),
        body: form.body.trim(),
        target: form.target,
        userIds,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      })
      toast.success(form.scheduledAt ? 'Đã lên lịch gửi thông báo.' : 'Đã gửi thông báo.')
      onSent()
    } catch (error) {
      toast.error(error?.message || 'Không gửi được thông báo.')
    } finally {
      setSending(false)
    }
  }

  return <DemoDialog title="Gửi thông báo hệ thống" onClose={onClose}>
    <form onSubmit={submit}>
      <div className="users-form">
        <label>Tiêu đề<input maxLength={255} value={form.title} onChange={event => change('title', event.target.value)} /></label>
        <label>Nội dung<textarea rows={5} maxLength={2000} value={form.body} onChange={event => change('body', event.target.value)} /></label>
        <label>Người nhận<select value={form.target} onChange={event => change('target', event.target.value)}>{TARGETS.map(target => <option key={target.value} value={target.value}>{target.label}</option>)}</select></label>
        {form.target === 'USERS' && <label>ID người dùng (cách nhau bởi dấu phẩy)<textarea rows={2} value={form.userIds} onChange={event => change('userIds', event.target.value)} /></label>}
        <label>Hẹn giờ gửi (để trống = gửi ngay)<input type="datetime-local" value={form.scheduledAt} onChange={event => change('scheduledAt', event.target.value)} /></label>
      </div>
      <div className="users-details-actions">
        <button type="button" className="users-button" onClick={onClose}>Hủy</button>
        <button type="submit" className="users-button users-primary" disabled={sending}><Send size={13} />{sending ? 'Đang gửi…' : form.scheduledAt ? 'Lên lịch' : 'Gửi ngay'}</button>
      </div>
    </form>
  </DemoDialog>
}

export default function NotificationManagement() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [composing, setComposing] = useState(false)
  const refresh = () => setReload(value => value + 1)

  // GET /api/v1/admin/notifications/statistics?days=30
  const stats = useApi(() => getNotificationStatistics(30), [reload], { initialData: {} })
  // GET /api/v1/admin/notifications/broadcasts
  const list = usePagedList(listBroadcasts, { status, page, pageSize: 20, PageSize: 20 }, reload)
  const s = stats.data || {}
  const show = value => (stats.loading ? '…' : number(value))

  const remove = async broadcast => {
    const action = broadcast.status === 'SCHEDULED' ? 'Hủy đợt hẹn giờ' : 'Thu hồi thông báo (ẩn khỏi hộp thư người nhận)'
    if (!window.confirm(`${action}: "${broadcast.title}"?`)) return
    try {
      await deleteBroadcast(broadcast.id)
      toast.success(broadcast.status === 'SCHEDULED' ? 'Đã hủy đợt hẹn giờ.' : 'Đã thu hồi thông báo.')
      refresh()
    } catch (error) {
      toast.error(error?.message || 'Không xóa được thông báo.')
    }
  }

  return <div className="users-page">
    <header className="users-page-heading admin-page-header">
      <div><h1>Quản lý thông báo</h1><p>Gửi và theo dõi các thông báo hệ thống tới người dùng SportNexus.</p></div>
      <div className="users-heading-actions">
        <button className="users-button" onClick={refresh}><RefreshCw size={13} />Làm mới</button>
        <button className="users-button users-primary" onClick={() => setComposing(true)}><Plus size={13} />Tạo thông báo</button>
      </div>
    </header>

    <div className="users-kpis">
      <StatCard label="Thông báo đã gửi (30 ngày)" value={show(s.totalSent)} icon={Send} supporting={`Đã đọc ${show(s.totalRead)} · ${stats.loading ? '…' : `${Math.round(Number(s.readRate) || 0)}%`}`} />
      <StatCard label="Đợt thông báo đã gửi" value={show(s.broadcastsSent)} icon={Bell} />
      <StatCard label="Đợt đang hẹn giờ" value={show(s.broadcastsScheduled)} icon={CalendarClock} />
    </div>
    {stats.error && <div className="users-notice" role="alert"><span>Không tải được thống kê: {stats.error}</span></div>}
    {list.error && <div className="users-notice" role="alert"><span>Không tải được danh sách: {list.error}</span></div>}

    <section className="users-toolbar" aria-label="Bộ lọc">
      <label>Trạng thái<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}>
        <option value="">Tất cả</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
    </section>

    <section className="users-table-panel">
      <div className="users-table-scroll">
        <table>
          <thead><tr><th>Tiêu đề</th><th>Người nhận</th><th>Trạng thái</th><th>Số người nhận</th><th>Hẹn giờ / Đã gửi</th><th /></tr></thead>
          <tbody>
            {list.loading && <tr><td colSpan={6}>Đang tải…</td></tr>}
            {!list.loading && list.items.length === 0 && <tr><td colSpan={6} className="users-empty">Chưa có thông báo nào.</td></tr>}
            {!list.loading && list.items.map(broadcast => <tr key={broadcast.id}>
              <td><strong>{broadcast.title}</strong><br /><small>{broadcast.body.slice(0, 80)}</small></td>
              <td>{TARGETS.find(target => target.value === broadcast.target)?.label || broadcast.target}</td>
              <td>{STATUS_LABELS[broadcast.status] || broadcast.status || '—'}</td>
              <td>{number(broadcast.recipients)} · đọc {number(broadcast.readCount)}</td>
              <td>{time(broadcast.sentAt || broadcast.scheduledAt || broadcast.createdAt)}</td>
              <td><button className="users-button" aria-label={`Xóa ${broadcast.title}`} onClick={() => remove(broadcast)}><Trash2 size={13} /></button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="users-pagination">
        <button className="users-button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Trước</button>
        <span>Trang {page} / {list.totalPages || 1}</span>
        <button className="users-button" disabled={page >= (list.totalPages || 1)} onClick={() => setPage(value => value + 1)}>Sau</button>
      </div>
    </section>

    {composing && <ComposeDialog onClose={() => setComposing(false)} onSent={() => { setComposing(false); setPage(1); refresh() }} />}
  </div>
}
