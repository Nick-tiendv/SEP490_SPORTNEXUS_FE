import { useState } from 'react'
import { Bell, CalendarClock, CheckCircle2, Download, FilePenLine, Mail, Plus, Power, Send, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import '../Users/users.css'
import './notification.css'
import { audiences, deliveryStatuses, formTypes, initialBroadcasts, initialFilters, initialNotifications, initialTriggers, mockSummary, notificationTypes, roles, tabLabels } from './notificationData.js'
import { broadcastAction, createNotifications, filterManagement, filterNotifications, formatNumber, formatTime, localDate, managementCsv, notificationSummary, notificationsCsv, paginate, saveBroadcast, toggleTrigger as updateTrigger, validateNotification } from './notificationHelpers.js'
import { NotificationFilters, NotificationPagination } from './NotificationUI.jsx'
import NotificationTable from './NotificationTable.jsx'
import { BroadcastInspector, BroadcastPreview, NotificationInspector, TriggerInspector } from './NotificationInspector.jsx'
import CreateNotificationModal from './CreateNotificationModal.jsx'

const newTabState = () => Object.fromEntries(Object.keys(tabLabels).map(key => [key, { filters: { ...initialFilters }, page: 1, pageSize: 10, selectedId: null }]))

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState(() => initialNotifications)
  const [triggers, setTriggers] = useState(() => initialTriggers)
  const [broadcasts, setBroadcasts] = useState(() => initialBroadcasts)
  const [tab, setTab] = useState('history')
  const [tabState, setTabState] = useState(newTabState)
  const [composer, setComposer] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [today] = useState(() => localDate(new Date()))
  const state = tabState[tab]
  const summary = notificationSummary(notifications, today)
  const invalidRange = Boolean(state.filters.from && state.filters.to && state.filters.from > state.filters.to)
  const filtered = tab === 'history' ? invalidRange ? [] : filterNotifications(notifications, state.filters) : filterManagement(tab === 'triggers' ? triggers : broadcasts, state.filters, tab)
  const pagination = paginate(filtered, state.page, state.pageSize)
  const selected = pagination.rows.find(record => record.id === state.selectedId) || pagination.rows[0]

  const updateTab = changes => setTabState(current => ({ ...current, [tab]: { ...current[tab], ...changes } }))
  const changeFilter = (key, value) => updateTab({ filters: { ...state.filters, [key]: value }, page: 1, selectedId: null })
  const showRecord = (targetTab, id) => {
    setTab(targetTab)
    setTabState(current => ({ ...current, [targetTab]: { ...current[targetTab], filters: { ...initialFilters }, page: 1, selectedId: id } }))
  }
  const toggleTrigger = record => setConfirmation({ action: 'toggle', record })
  const handleBroadcast = (action, record) => {
    if (action === 'edit') { setComposer(record); return }
    if (action === 'duplicate') {
      const id = crypto.randomUUID()
      setBroadcasts(current => broadcastAction(current, record.id, 'duplicate', id))
      showRecord('broadcasts', `BCAST-${id}`)
      toast.success('Đã tạo bản sao Draft trong dữ liệu mẫu.')
      return
    }
    setConfirmation({ action, record })
  }
  const confirmAction = () => {
    const { action, record } = confirmation
    if (action === 'reset') {
      setNotifications(initialNotifications); setTriggers(initialTriggers); setBroadcasts(initialBroadcasts)
      setTabState(newTabState()); setTab('history')
    } else if (action === 'toggle') {
      setTriggers(current => updateTrigger(current, record.id))
    } else setBroadcasts(current => broadcastAction(current, record.id, action))
    setConfirmation(null)
    toast.success(action === 'reset' ? 'Đã khôi phục dữ liệu mẫu.' : 'Đã cập nhật trạng thái trong phiên dữ liệu mẫu.')
  }
  const saveNotification = (form, mode) => {
    const error = validateNotification(form, mode)
    if (error) { toast.error(error); return }
    if (mode === 'send') {
      const added = createNotifications(form)
      setNotifications(current => [...added, ...current])
      showRecord('history', added[0].id)
      toast.success(`Đã tạo ${added.length} thông báo Đã gửi mô phỏng; không gửi thật.`)
    } else {
      const id = form.id || `BCAST-${crypto.randomUUID()}`
      // New records get an ID after the helper has inserted them, rather than being treated as an edit.
      setBroadcasts(current => saveBroadcast(current, form, mode, id.replace(/^BCAST-/, '')))
      showRecord('broadcasts', id)
      toast.success(mode === 'draft' ? 'Đã lưu bản nháp mẫu.' : `Đã lên lịch mô phỏng: ${formatTime(form.scheduleAt)} (UTC+7).`)
    }
    setComposer(null)
  }
  const exportCsv = () => {
    setExporting(true)
    try {
      const contents = tab === 'history' ? notificationsCsv(filtered) : managementCsv(filtered, tab)
      const url = URL.createObjectURL(new Blob([contents], { type: 'text/csv;charset=utf-8;' }))
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = `sportnexus-notifications-${tab}-demo.csv`; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success(`Đã xuất ${filtered.length} bản ghi mẫu theo bộ lọc hiện tại.`)
    } catch { toast.error('Không thể xuất CSV. Vui lòng thử lại.') }
    finally { setExporting(false) }
  }

  const stats = tab === 'history' ? [
    ["Tổng thông báo", formatNumber(summary.total), Bell, 'Tổng quan minh họa, tách khỏi bảng mẫu'],
    ["Đã gửi hôm nay", formatNumber(summary.sentToday), Send, `${formatNumber(mockSummary.sentToday)} mẫu + thông báo tạo trong ngày`],
    ["Thông báo chưa đọc", formatNumber(summary.unread), Mail, 'Tổng quan chưa đọc (số liệu tổng hợp mẫu)'],
    ["Tỷ lệ gửi thành công", `${summary.rate.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, CheckCircle2, 'Đã giao / Đã đọc trên tổng số mẫu'],
  ] : tab === 'triggers' ? [
    ["Tổng sự kiện kích hoạt", triggers.length, Bell, 'Cấu hình sự kiện mẫu'],
    ["Sự kiện đang hoạt động", triggers.filter(item => item.status === 'Active').length, Power, 'Đang bật trong dữ liệu trong phiên'],
    ["Sự kiện ngừng hoạt động", triggers.filter(item => item.status === 'Inactive').length, ShieldCheck, 'Đang tắt trong dữ liệu trong phiên'],
    ["Số lần kích hoạt hôm nay", triggers.reduce((total, item) => total + item.triggeredToday, 0), Send, 'Lịch sử minh họa ngày 13/10/2026'],
  ] : [
    ["Tổng thông báo hàng loạt", broadcasts.length, Bell, 'Bản ghi chiến dịch mẫu'],
    ['Scheduled', broadcasts.filter(item => item.status === 'Scheduled').length, CalendarClock, 'Lịch minh họa; chưa có scheduler'],
    ['Draft', broadcasts.filter(item => item.status === 'Draft').length, FilePenLine, 'Bản nháp có thể chỉnh sửa'],
    ['Completed', broadcasts.filter(item => item.status === 'Completed').length, CheckCircle2, 'Lịch sử hoàn thành minh họa'],
  ]
  const filterOptions = tab === 'history' ? { type: notificationTypes, status: deliveryStatuses, audience: roles } : tab === 'triggers' ? { type: notificationTypes.filter(type => type !== 'Broadcast'), status: ['Active', 'Inactive'] } : { type: formTypes, status: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Cancelled'], audience: audiences }
  const confirmationText = confirmation?.action === 'reset' ? 'Khôi phục dữ liệu ban đầu? Các thông báo, bản nháp và lịch gửi vừa tạo trong phiên sẽ được xóa.' : confirmation?.action === 'toggle' ? `${confirmation.record.status === 'Active' ? 'Tắt' : 'Bật'} sự kiện kích hoạt “${confirmation.record.name}” trong dữ liệu mẫu?` : `${confirmation?.action === 'delete' ? 'Xóa bản nháp' : 'Hủy lịch gửi'} “${confirmation?.record.title}”?`

  return <div className="nt-page">
    <div className="nt-page-heading admin-page-header"><div><div className="nt-title-row"><h1>Quản lý thông báo</h1><span className="nt-overview-badge">{formatNumber(summary.total)} Thông báo</span></div><p>Theo dõi thông báo, trạng thái gửi và hoạt động truyền thông trên SportNexus.</p></div><div className="nt-heading-actions"><button className="nt-button" onClick={exportCsv} disabled={exporting || !filtered.length || invalidRange}><Download size={14} />{exporting ? "Đang xuất…" : "Xuất CSV"}</button><button className="nt-button primary" onClick={() => setComposer({})}><Plus size={15} />Tạo thông báo</button></div></div>
    <div className="nt-stats">{stats.map(([label, value, icon, trend]) => <StatCard key={label} label={label} value={value} icon={icon} trend={trend} />)}</div>
    <div className="nt-tabs" role="tablist" aria-label="Các mục quản lý thông báo">{Object.entries(tabLabels).map(([key, label]) => <button key={key} id={`nt-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls="nt-tab-panel" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}<span>{key === 'history' ? formatNumber(summary.total) : key === 'triggers' ? triggers.length : broadcasts.length}</span></button>)}</div>
    <div id="nt-tab-panel" role="tabpanel" aria-labelledby={`nt-tab-${tab}`}>
      <NotificationFilters tab={tab} filters={state.filters} options={filterOptions} onChange={changeFilter} onReset={() => updateTab({ filters: { ...initialFilters }, page: 1, selectedId: null })} />
      <div className="nt-data-caption"><span>{tab === 'history' ? `${notifications.length} bản ghi mẫu hiển thị · Tổng quan ${formatNumber(mockSummary.total)} là số liệu tổng hợp mẫu riêng.` : `${filtered.length} kết quả mẫu · Cấu hình chỉ lưu trong phiên hiện tại.`}</span><button className="nt-text-button" onClick={() => setConfirmation({ action: 'reset' })}>Khôi phục dữ liệu mẫu</button></div>
      <div className="nt-content-grid"><section className="nt-panel nt-list" aria-label={tabLabels[tab]}><NotificationTable tab={tab} rows={pagination.rows} selectedId={selected?.id} onSelect={selectedId => updateTab({ selectedId })} onToggle={toggleTrigger} onBroadcastAction={handleBroadcast} /><NotificationPagination total={filtered.length} page={pagination.page} pages={pagination.pages} pageSize={state.pageSize} onPage={page => updateTab({ page, selectedId: null })} onPageSize={pageSize => updateTab({ pageSize, page: 1, selectedId: null })} /></section>
        <div className="nt-inspector-column">{tab === 'history' ? <NotificationInspector notification={selected} /> : tab === 'triggers' ? <TriggerInspector trigger={selected} onToggle={toggleTrigger} /> : <BroadcastInspector broadcast={selected} onAction={handleBroadcast} />}<BroadcastPreview onCreate={setComposer} /></div>
      </div>
    </div>
    {composer && <CreateNotificationModal initial={composer} onClose={() => setComposer(null)} onSave={saveNotification} />}
    {confirmation && <DemoDialog title={confirmation.action === 'reset' ? 'Khôi phục dữ liệu mẫu' : 'Xác nhận thay đổi mẫu'} onClose={() => setConfirmation(null)}><div className="nt-modal-content"><p>{confirmationText}</p><p className="nt-demo-note">Thao tác chỉ áp dụng cho dữ liệu trong phiên; không thay đổi máy chủ hoặc gửi thông báo thật.</p><footer><button className="nt-button" onClick={() => setConfirmation(null)}>Hủy</button><button className="nt-button primary" onClick={confirmAction}>Xác nhận</button></footer></div></DemoDialog>}
  </div>
}
