import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { adminMenu } from '../src/Admin/adminMenu.js'
import { initialUsers } from '../src/Admin/Users/usersData.js'
import { initialOwners } from '../src/Admin/CourtOwners/courtOwnerData.js'

test('Vietnamese navigation keeps existing paths and AI availability', () => {
  assert.deepEqual(adminMenu.map(item => item.label), [
    'Tổng quan', 'Quản lý người dùng', 'Quản lý chủ sân', 'Quản lý cơ sở thể thao',
    'Quản lý đặt sân', 'Quản lý tìm nhóm chơi', 'Quản lý giải đấu', 'Quản lý thanh toán',
    'Đánh giá & Báo cáo', 'Quản lý thông báo', 'Quản lý AI', 'Cài đặt hệ thống',
  ])
  assert.equal(adminMenu.find(item => item.path === '/admin/ai').enabled, false)
  assert.equal(initialUsers[0].role, 'Player')
  assert.equal(initialUsers[0].status, 'Active')
  assert.equal(initialOwners[0].verification, 'Verified')
})

test('localized Admin pages and dropdowns render with original enum values', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const pages = [
      ['Dashboard/AdminDashboard', 'Tổng quan'], ['Users/UserManagement', 'Quản lý người dùng'],
      ['CourtOwners/CourtOwnerManagement', 'Quản lý'], ['Facilities/FacilityManagement', 'Quản lý cơ sở'],
      ['Bookings/BookingManagement', 'Quản lý đặt sân'], ['LFG/LFGManagement', 'Quản lý'],
      ['Tournaments/TournamentManagement', 'Quản lý giải đấu'], ['Payments/PaymentManagement', 'Quản lý thanh toán'],
      ['Reviews/ReviewsReportsPage', 'Đánh giá'], ['Notifications/NotificationManagement', 'Quản lý thông báo'],
    ]
    for (const [file, title] of pages) {
      const { default: Page } = await server.ssrLoadModule(`/src/Admin/${file}.jsx`)
      const markup = renderToString(createElement(MemoryRouter, null, createElement(Page)))
      assert.ok(markup.includes(title), file)
      assert.doesNotMatch(markup, />\s*(Active|Inactive|Pending|Confirmed|Completed|Read|Draft|Player|Court Owner|Verified|Select|Showing)\s*</, file)
      if (file === 'Users/UserManagement') {
        assert.match(markup, /value="Player">Người chơi<\/option>/)
        assert.match(markup, /value="Active">Đang hoạt động<\/option>/)
        assert.ok(markup.includes('148.250'))
      }
      if (file === 'CourtOwners/CourtOwnerManagement') assert.match(markup, /value="Verified">Đã xác minh<\/option>/)
    }
    const { default: Header } = await server.ssrLoadModule('/src/Admin/Layout/AdminHeader.jsx')
    for (const item of adminMenu) {
      const markup = renderToString(createElement(MemoryRouter, { initialEntries: [item.path] }, createElement(Header)))
      assert.ok(markup.includes(item.label.replaceAll('&', '&amp;')), item.path)
    }
  } finally { await server.close() }
})
