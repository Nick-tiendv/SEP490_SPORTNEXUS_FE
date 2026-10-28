import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { confirmDialog, confirmSnapshot, subscribeConfirm } from '../src/components/common/confirm.js'

// Trang Cài đặt hệ thống (Admin) giờ đọc / ghi cấu hình thật qua API (hoa hồng nền tảng, Fair Play, đối soát).
test('trang Cài đặt hệ thống render đủ các nhóm cấu hình', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { default: SystemSettings } = await server.ssrLoadModule('/src/Admin/Settings/SystemSettings.jsx')
    const markup = renderToString(createElement(MemoryRouter, null, createElement(SystemSettings)))
    assert.ok(markup.includes('Cài đặt hệ thống'))
    for (const id of ['ss-heading-booking', 'ss-heading-fairplay', 'ss-heading-danger']) assert.ok(markup.includes(`id="${id}"`), id)
    assert.ok(markup.includes('Chạy đối soát'))
  } finally { await server.close() }
})

// Hộp thoại xác nhận dùng chung thay window.confirm
test('confirmDialog trả true / false theo lựa chọn và tự nhận câu hỏi nguy hiểm', async () => {
  const seen = []
  const unsubscribe = subscribeConfirm(() => seen.push(confirmSnapshot()))

  const first = confirmDialog('Xóa bài viết này?')
  const open = confirmSnapshot()
  assert.equal(open.message, 'Xóa bài viết này?')
  assert.equal(open.danger, true)
  open.resolve(true)
  assert.equal(await first, true)
  assert.equal(confirmSnapshot(), null)

  const second = confirmDialog('Góp tiền cho đơn này?', { confirmLabel: 'Góp tiền' })
  assert.equal(confirmSnapshot().danger, false)
  assert.equal(confirmSnapshot().confirmLabel, 'Góp tiền')
  // Mở hộp thoại mới khi hộp cũ chưa trả lời: hộp cũ được coi là Hủy
  const third = confirmDialog('Rời đội?')
  assert.equal(await second, false)
  confirmSnapshot().resolve(false)
  assert.equal(await third, false)

  unsubscribe()
  assert.ok(seen.length >= 4)
})
