import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { MAX_USERS, blankBroadcast, broadcastAction, broadcastsCsv, formatTime, toBroadcastPayload, validateBroadcast, vnLocalInput, vnLocalToIso } from '../src/Admin/Notifications/notificationHelpers.js'

const now = Date.parse('2026-10-23T12:00:00+07:00')
const form = changes => ({ ...blankBroadcast, title: 'Bảo trì hệ thống', body: 'Hệ thống bảo trì lúc 23:00.', ...changes })
const uuid = '9456f421-b51b-4b45-8e30-5a91971fd072'
const raw = {
  id: uuid, title: 'Giải mới', body: 'Đăng ký ngay', target: 'player', targetUserCount: 120, status: 'sent',
  sentAt: '2026-10-23T02:00:00Z', recipientCount: 120, readCount: 30, readRate: 25, createdByName: 'Admin', createdAt: '2026-10-23T01:59:00Z',
}
// Dạng đã qua toBroadcast (kiểm riêng trong test chạy qua Vite vì apiClient cần import.meta.env).
const sample = { ...raw, target: 'PLAYER', status: 'SENT', referenceType: '', referenceId: '', scheduledAt: null, recalledAt: null }

test('validateBroadcast áp đúng các ràng buộc 400 của BE', () => {
  assert.equal(validateBroadcast(form(), now), '')
  assert.equal(validateBroadcast(form({ title: '  ' }), now), 'Vui lòng nhập tiêu đề và nội dung.')
  assert.match(validateBroadcast(form({ title: 'x'.repeat(256) }), now), /255/)
  assert.match(validateBroadcast(form({ body: 'x'.repeat(2001) }), now), /2\.000/)
  assert.equal(validateBroadcast(form({ target: 'USERS' }), now), 'Vui lòng chọn ít nhất 1 người nhận.')
  assert.match(validateBroadcast(form({ target: 'USERS', userIds: Array.from({ length: MAX_USERS + 1 }, (_, i) => String(i)) }), now), /1\.000/)
  assert.equal(validateBroadcast(form({ referenceType: 'TOURNAMENT' }), now), 'Vui lòng nhập ID đối tượng liên kết.')
  assert.equal(validateBroadcast(form({ referenceId: uuid }), now), 'Vui lòng chọn loại đối tượng liên kết.')
  assert.equal(validateBroadcast(form({ referenceType: 'TOURNAMENT', referenceId: 'abc' }), now), 'ID đối tượng liên kết phải là mã UUID.')
  assert.equal(validateBroadcast(form({ referenceType: 'TOURNAMENT', referenceId: uuid }), now), '')
})

test('hẹn giờ: tối thiểu 1 phút, tối đa 30 ngày, theo giờ Việt Nam', () => {
  assert.equal(validateBroadcast(form({ sendMode: 'later' }), now), 'Vui lòng chọn thời gian hẹn gửi.')
  assert.match(validateBroadcast(form({ sendMode: 'later', scheduledLocal: '2026-10-23T12:00' }), now), /ít nhất 1 phút/)
  assert.equal(validateBroadcast(form({ sendMode: 'later', scheduledLocal: '2026-10-23T12:05' }), now), '')
  assert.match(validateBroadcast(form({ sendMode: 'later', scheduledLocal: '2026-11-23T12:05' }), now), /30 ngày/)
  assert.equal(vnLocalToIso('2026-10-23T12:05'), '2026-10-23T12:05:00+07:00')
  assert.equal(vnLocalInput(now), '2026-10-23T12:00')
  const display = formatTime('2026-10-23T05:05:00Z')
  assert.ok(display.includes('12:05') && display.includes('23/10/2026'), display)
  assert.equal(formatTime(null), '—')
})

test('toBroadcastPayload chỉ gửi userIds / reference / scheduledAt khi cần', () => {
  assert.deepEqual(toBroadcastPayload(form({ userIds: ['a'], referenceId: ' ' })), { title: 'Bảo trì hệ thống', body: 'Hệ thống bảo trì lúc 23:00.', target: 'ALL', userIds: null, referenceType: null, referenceId: null, scheduledAt: null })
  const scheduled = toBroadcastPayload(form({ target: 'USERS', userIds: ['a'], referenceType: 'TOURNAMENT', referenceId: ` ${uuid} `, sendMode: 'later', scheduledLocal: '2026-10-24T09:00' }))
  assert.deepEqual(scheduled.userIds, ['a'])
  assert.equal(scheduled.referenceId, uuid)
  assert.equal(scheduled.scheduledAt, '2026-10-24T09:00:00+07:00')
})

test('thao tác theo trạng thái và xuất CSV', () => {
  assert.equal(broadcastAction('SCHEDULED'), 'cancel')
  assert.equal(broadcastAction('SENT'), 'recall')
  assert.equal(broadcastAction('CANCELLED'), null)
  assert.equal(broadcastAction('RECALLED'), null)
  const csv = broadcastsCsv([{ ...sample, title: 'Có "ngoặc"' }])
  assert.ok(csv.startsWith('﻿"ID"'))
  assert.ok(csv.includes('"Có ""ngoặc"""'))
  assert.ok(csv.includes('"Người chơi"'))
  assert.ok(csv.includes('"Đã gửi"'))
})

test('trang, chi tiết và form soạn thông báo render qua Vite', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { toBroadcast } = await server.ssrLoadModule('/src/api/admin/notificationApi.js')
    assert.deepEqual(toBroadcast(raw), { ...sample, createdByName: 'Admin' })
    assert.equal(toBroadcast({}).recipientCount, 0)
    const { default: Page } = await server.ssrLoadModule('/src/Admin/Notifications/NotificationManagement.jsx')
    const markup = renderToString(createElement(Page))
    for (const content of ['Quản lý thông báo', 'Tạo thông báo', 'Đã hẹn giờ', 'Đã thu hồi']) assert.ok(markup.includes(content), content)
    const { BroadcastInspector } = await server.ssrLoadModule('/src/Admin/Notifications/NotificationInspector.jsx')
    const sent = renderToString(createElement(BroadcastInspector, { broadcast: sample, onAction: () => {} }))
    assert.ok(sent.includes('Thu hồi khỏi hộp thư người nhận'))
    const scheduled = renderToString(createElement(BroadcastInspector, { broadcast: { ...sample, status: 'SCHEDULED', scheduledAt: '2026-10-24T02:00:00Z' }, onAction: () => {} }))
    assert.ok(scheduled.includes('Hủy đợt hẹn giờ'))
    const { default: Composer } = await server.ssrLoadModule('/src/Admin/Notifications/CreateNotificationModal.jsx')
    const composer = renderToString(createElement(Composer, { onClose: () => {}, onSubmit: async () => {} }))
    for (const content of ['Tạo thông báo hệ thống', 'XEM TRƯỚC', 'Gửi thông báo']) assert.ok(composer.includes(content), content)
  } finally {
    await server.close()
  }
})
