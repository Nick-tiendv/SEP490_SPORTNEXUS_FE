import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { initialBroadcasts, initialFilters, initialNotifications, initialTriggers, mockSummary, recipients } from '../src/Admin/Notifications/notificationData.js'
import { broadcastAction, createNotifications, deliveryTimeline, filterManagement, filterNotifications, localDate, managementCsv, notificationSummary, notificationsCsv, paginate, resolveRecipients, saveBroadcast, scheduleInput, toggleTrigger, validateNotification } from '../src/Admin/Notifications/notificationHelpers.js'

const validForm = {
  title: 'Thông báo sân mới', message: 'Chào mừng bạn đến với SportNexus.', type: 'Announcement',
  audience: 'All Users', channels: ['In-App', 'Email'], selectedUsers: [], scheduleAt: '2026-10-20T09:00:00+07:00',
}
const testNow = Date.parse('2026-10-13T12:00:00+07:00')

test('sample IDs are unique; aggregate is explicitly separate from the sample', () => {
  for (const records of [initialNotifications, initialTriggers, initialBroadcasts]) {
    assert.equal(new Set(records.map(record => record.id)).size, records.length)
  }
  assert.equal(initialNotifications.length, 36)
  assert.equal(mockSummary.total, 18420)
  assert.deepEqual(notificationSummary(initialNotifications), { total: 18420, sentToday: 326, unread: 1284, rate: mockSummary.delivered / 18420 * 100 })
})

test('history combines accent-insensitive search, type, status, audience, and dates', () => {
  const filters = { ...initialFilters, search: 'le hoang nam', type: 'Booking', status: 'Read', audience: 'Player', from: '2026-10-13', to: '2026-10-13' }
  const results = filterNotifications(initialNotifications, filters)
  assert.equal(results.length, 1)
  assert.equal(results[0].id, initialNotifications[0].id)
  assert.equal(filterNotifications(initialNotifications, { ...filters, audience: 'Admin' }).length, 0)
  assert.equal(filterNotifications(initialNotifications, { ...initialFilters, search: 'nam@example.test' }).length, 5)
  assert.equal(filterNotifications(initialNotifications, { ...initialFilters, search: 'no-such-notification' }).length, 0)
  assert.equal(filterNotifications(initialNotifications, { ...initialFilters, from: '2026-10-20', to: '2026-10-10' }).length, 0)
})

test('pagination clamps stale pages and supports 10, 20 and 50 rows', () => {
  assert.equal(paginate(initialNotifications, 1).rows.length, 10)
  assert.equal(paginate(initialNotifications, 2).rows[0].id, initialNotifications[10].id)
  assert.equal(paginate(initialNotifications, 2, 20).rows.length, 16)
  assert.equal(paginate(initialNotifications, 3, 50).page, 1)
  assert.deepEqual(paginate([], 99), { rows: [], page: 1, pages: 1 })
})

test('timelines only include confirmed delivery/read steps', () => {
  for (const status of ['Failed', 'Pending', 'Sent', 'Delivered', 'Read']) {
    const entries = deliveryTimeline({ ...initialNotifications[0], status, error: 'timeout' })
    assert.equal(entries.some(entry => entry.title === 'Đã giao thông báo'), ['Delivered', 'Read'].includes(status))
    assert.equal(entries.some(entry => entry.title === 'Người nhận đã đọc thông báo'), status === 'Read')
    assert.equal(entries.some(entry => entry.title === 'Gửi thông báo thất bại'), status === 'Failed')
    assert.equal(entries.some(entry => entry.title === 'Đang chờ gửi'), status === 'Pending')
    if (status === 'Failed') assert.equal(entries.at(-1).detail, 'timeout')
  }
})

test('recipient targeting uses actual sample users and never treats All Users as a real mass send', () => {
  assert.equal(resolveRecipients(validForm).length, recipients.length)
  for (const [audience, role] of [['Players', 'Player'], ['Court Owners', 'Court Owner'], ['Admins', 'Admin']]) {
    assert.ok(resolveRecipients({ ...validForm, audience }).every(recipient => recipient.role === role))
  }
  assert.deepEqual(resolveRecipients({ ...validForm, audience: 'Selected Users', selectedUsers: ['USR-001', 'USR-006'] }).map(recipient => recipient.id), ['USR-001', 'USR-006'])
})

test('form rejects blank/oversized fields, missing channels, missing selected users and past schedules', () => {
  assert.equal(validateNotification(validForm, 'schedule', testNow), '')
  for (const changed of [{ title: '   ' }, { title: 'x'.repeat(121) }, { message: '\n ' }, { message: 'x'.repeat(2001) }, { channels: [] }, { audience: 'Selected Users', selectedUsers: [] }, { audience: '' }]) {
    assert.ok(validateNotification({ ...validForm, ...changed }, 'draft', testNow))
  }
  for (const scheduleAt of ['', 'invalid', '2026-10-12T09:00:00+07:00', '2026-10-13T12:00:00+07:00']) {
    assert.ok(validateNotification({ ...validForm, scheduleAt }, 'schedule', testNow))
  }
  assert.equal(validateNotification({ ...validForm, scheduleAt: '' }, 'draft', testNow), '')
})

test('mock send creates one Sent record per selected recipient and updates aggregate statistics', () => {
  const form = { ...validForm, audience: 'Selected Users', selectedUsers: ['USR-001', 'USR-006'] }
  const added = createNotifications(form, new Date(testNow), 'test-send')
  assert.equal(added.length, 2)
  assert.ok(added.every(record => record.status === 'Sent' && record.related === null && record.source === 'created'))
  assert.equal(added[0].type, 'Broadcast')
  assert.equal(added[0].subtype, 'Announcement')
  assert.equal(added[0].recipient.id, 'USR-001')
  assert.equal(new Set(added.map(record => record.id)).size, 2)
  const summary = notificationSummary([...added, ...initialNotifications])
  assert.equal(summary.total, 18422)
  assert.equal(summary.sentToday, 328)
  assert.equal(summary.unread, 1286)
  assert.equal(summary.rate, mockSummary.delivered / 18422 * 100)
  assert.equal(notificationSummary([...added, ...initialNotifications], '2026-10-14').sentToday, 326)
})

test('save draft and schedule create records without generating notifications', () => {
  const draft = saveBroadcast(initialBroadcasts, validForm, 'draft', 'new-draft')
  assert.equal(draft.length, initialBroadcasts.length + 1)
  assert.equal(draft[0].id, 'BCAST-new-draft')
  assert.equal(draft[0].status, 'Draft')
  assert.equal(draft[0].scheduleAt, '')
  assert.equal(draft[0].estimatedRecipients, recipients.length)
  const scheduled = saveBroadcast(initialBroadcasts, validForm, 'schedule', 'new-schedule')
  assert.equal(scheduled[0].status, 'Scheduled')
  assert.equal(scheduled[0].scheduleAt, validForm.scheduleAt)
  assert.equal(initialBroadcasts.length, 16)
  assert.equal(initialNotifications.length, 36)
})

test('editing draft or schedule replaces only the selected record', () => {
  const original = initialBroadcasts[0]
  const edited = saveBroadcast(initialBroadcasts, { ...original, title: 'Đã chỉnh sửa', message: 'Nội dung mới' }, 'draft', 'unused')
  assert.equal(edited.length, initialBroadcasts.length)
  assert.equal(edited[0].title, 'Đã chỉnh sửa')
  assert.equal(initialBroadcasts[0].title, original.title)
  const schedule = initialBroadcasts.find(record => record.status === 'Scheduled')
  const changed = saveBroadcast(initialBroadcasts, { ...schedule, scheduleAt: validForm.scheduleAt }, 'schedule')
  assert.equal(changed.find(record => record.id === schedule.id).scheduleAt, validForm.scheduleAt)
})

test('broadcast cancellation, draft deletion, and duplication preserve source data and enforce status rules', () => {
  const draft = initialBroadcasts.find(record => record.status === 'Draft')
  const scheduled = initialBroadcasts.find(record => record.status === 'Scheduled')
  const cancelled = broadcastAction(initialBroadcasts, scheduled.id, 'cancel', 'unused')
  assert.equal(cancelled.find(record => record.id === scheduled.id).status, 'Cancelled')
  assert.equal(scheduled.status, 'Scheduled')
  assert.equal(broadcastAction(initialBroadcasts, draft.id, 'delete', 'unused').length, 15)
  assert.equal(broadcastAction(initialBroadcasts, scheduled.id, 'delete', 'unused').length, 16)
  const duplicated = broadcastAction(initialBroadcasts, scheduled.id, 'duplicate', 'copy')
  assert.equal(duplicated[0].id, 'BCAST-copy')
  assert.equal(duplicated[0].status, 'Draft')
  assert.equal(duplicated[0].scheduleAt, '')
  assert.notEqual(duplicated[0].channels, scheduled.channels)
})

test('management filters search event keys and combine category/status or audience/status', () => {
  assert.equal(filterManagement(initialTriggers, { ...initialFilters, search: 'booking.confirmed', type: 'Booking', status: 'Inactive' }, 'triggers').length, 1)
  const broadcasts = filterManagement(initialBroadcasts, { ...initialFilters, status: 'Draft', audience: 'All Users' }, 'broadcasts')
  assert.ok(broadcasts.length)
  assert.ok(broadcasts.every(record => record.status === 'Draft' && record.audience === 'All Users'))
})

test('CSV is UTF-8 with BOM, has required columns, escapes quotes/newlines and neutralizes spreadsheet formulas', () => {
  const records = [{ ...initialNotifications[0], title: '=SUM(1,2)' }, { ...initialNotifications[1], title: 'Nội dung "mới"\nDòng hai' }]
  const csv = notificationsCsv(records)
  assert.ok(csv.startsWith('\uFEFF"ID thông báo","Tiêu đề","Loại","Người nhận","Trạng thái","Thời gian gửi"\r\n'))
  assert.ok(csv.includes('"\'=SUM(1,2)"'))
  assert.ok(csv.includes('Nội dung ""mới""\nDòng hai'))
  assert.ok(csv.includes('Lê Hoàng Nam'))
  assert.equal(notificationsCsv([]).split('\r\n').length, 1)
  assert.ok(managementCsv(initialTriggers, 'triggers').includes('booking.confirmed'))
  assert.ok(managementCsv(initialBroadcasts, 'broadcasts').includes('Scheduled'))
})

test('date filters and schedule inputs use UTC+7 independently of the execution host timezone', () => {
  assert.equal(localDate('2026-10-12T18:30:00Z'), '2026-10-13')
  assert.equal(scheduleInput('2026-10-12T18:30:00Z'), '2026-10-13T01:30')
})

test('toggling a trigger updates only local status without fabricating new events', () => {
  const original = initialTriggers[0]
  const enabled = toggleTrigger(initialTriggers, original.id)
  assert.equal(enabled[0].status, 'Active')
  assert.equal(original.status, 'Inactive')
  assert.equal(enabled[0].lastTriggered, original.lastTriggered)
  assert.equal(enabled[0].triggeredToday, original.triggeredToday)
  assert.equal(toggleTrigger(enabled, original.id)[0].status, 'Inactive')
})

test('React page, delivery inspectors, trigger/broadcast details and composer render through Vite', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { default: Page } = await server.ssrLoadModule('/src/Admin/Notifications/NotificationManagement.jsx')
    const markup = renderToString(createElement(Page))
    for (const content of ['Quản lý thông báo', 'Lịch sử thông báo', 'Chi tiết thông báo', 'Đã xác nhận đặt sân', 'Xem trước thông báo hàng loạt', '18.420']) assert.ok(markup.includes(content))
    const { NotificationInspector, TriggerInspector, BroadcastInspector } = await server.ssrLoadModule('/src/Admin/Notifications/NotificationInspector.jsx')
    const { default: Composer } = await server.ssrLoadModule('/src/Admin/Notifications/CreateNotificationModal.jsx')
    for (const status of ['Read', 'Delivered', 'Failed', 'Pending', 'Sent']) {
      const rendered = renderToString(createElement(NotificationInspector, { notification: { ...initialNotifications[0], status } }))
      assert.ok(rendered.includes('Chi tiết thông báo'))
      assert.equal(rendered.includes('Đã giao thông báo'), ['Read', 'Delivered'].includes(status))
    }
    assert.ok(renderToString(createElement(TriggerInspector, { trigger: initialTriggers[0], onToggle: () => {} })).includes('Xem trước mẫu thông báo'))
    assert.ok(renderToString(createElement(BroadcastInspector, { broadcast: initialBroadcasts[0], onAction: () => {} })).includes('Chỉnh sửa bản nháp'))
    assert.ok(renderToString(createElement(Composer, { onClose: () => {}, onSave: () => {} })).includes('XEM TRƯỚC'))
    assert.ok(renderToString(createElement(Composer, { initial: initialBroadcasts[1], onClose: () => {}, onSave: () => {} })).includes('Chỉnh sửa lịch gửi hàng loạt'))
  } finally { await server.close() }
})
