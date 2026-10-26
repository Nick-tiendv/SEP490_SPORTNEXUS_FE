import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { adminMenu } from '../src/Admin/adminMenu.js'
import { filterUsers, isVietnamPhone, phoneKey, roleLabel } from '../src/Admin/Users/usersData.js'
import { bookingStatusLabels, canCancel } from '../src/Admin/Bookings/bookingData.js'
import { decisionOptions, reportStatusLabels, toEnumKey } from '../src/Admin/Reviews/reviewsData.js'

test('menu Admin tiếng Việt, đủ trang và giữ đường dẫn', () => {
  assert.deepEqual(adminMenu.map(item => item.label), [
    'Tổng quan', 'Quản lý người dùng', 'Quản lý chủ sân', 'Quản lý cơ sở thể thao',
    'Quản lý đặt sân', 'Quản lý tìm nhóm chơi', 'Quản lý giải đấu', 'Quản lý đội', 'Quản lý thanh toán', 'Gói quảng bá',
    'Đánh giá & Báo cáo', 'Danh mục dùng chung', 'Quản lý thông báo', 'Quản lý AI', 'Cài đặt hệ thống',
  ])
  assert.equal(adminMenu.find(item => item.path === '/admin/ai').enabled, false)
  for (const item of adminMenu) assert.match(item.path, /^\/admin\//)
})

test('lọc người dùng và kiểm tra số điện thoại Việt Nam', () => {
  const users = [
    { name: 'Nguyễn Văn A', username: 'nva', email: 'a@x.vn', phone: '0912345678', role: 'Player', status: 'Active', joined: '2026-10-01' },
    { name: 'Trần Thị B', username: 'ttb', email: 'b@x.vn', phone: '0987654321', role: 'Owner', status: 'Suspended', joined: '2026-10-20' },
  ]
  const base = { search: '', role: 'All', status: 'All', from: '', to: '' }
  assert.equal(filterUsers(users, { ...base, search: 'nguyen' }).length, 1, 'tìm không dấu')
  assert.equal(filterUsers(users, { ...base, role: 'Owner' })[0].username, 'ttb')
  assert.equal(filterUsers(users, { ...base, from: '2026-10-10' }).length, 1)
  assert.equal(isVietnamPhone('+84 912 345 678'), true)
  assert.equal(isVietnamPhone('12345'), false)
  assert.equal(phoneKey('+84912345678'), '0912345678')
  assert.equal(roleLabel('Player'), 'Người chơi')
})

test('enum trạng thái khớp backend (đặt sân, khiếu nại)', () => {
  // BookingStatus của BE: PENDING | PAID | CHECKED_IN | CANCELLED
  assert.deepEqual(Object.keys(bookingStatusLabels), ['PENDING', 'PAID', 'CHECKED_IN', 'CANCELLED'])
  assert.equal(canCancel({ status: 'PAID' }), true)
  assert.equal(canCancel({ status: 'CHECKED_IN' }), false)
  // ReportStatus + Decision của AdminResolveReportRequest
  assert.deepEqual(Object.keys(reportStatusLabels), ['PENDING', 'OWNER_RESPONDED', 'RESOLVED_REFUNDED', 'RESOLVED_NO_REFUND', 'REJECTED', 'WITHDRAWN'])
  assert.deepEqual(decisionOptions.map(option => option.value), ['REFUND', 'RESOLVE_NO_REFUND', 'REJECT'])
  assert.equal(toEnumKey('OwnerResponded'), 'OWNER_RESPONDED')
})

test('các trang Admin render tiếng Việt, không lộ giá trị enum tiếng Anh', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const pages = [
      ['Dashboard/AdminDashboard', 'Tổng quan'], ['Users/UserManagement', 'Quản lý người dùng'],
      ['CourtOwners/CourtOwnerManagement', 'Quản lý'], ['Facilities/FacilityManagement', 'Quản lý cơ sở'],
      ['Bookings/BookingManagement', 'Quản lý đặt sân'], ['LFG/LFGManagement', 'Quản lý'],
      ['Tournaments/TournamentManagement', 'Quản lý giải đấu'], ['Teams/TeamManagement', 'Quản lý đội'],
      ['Payments/PaymentManagement', 'Quản lý thanh toán'], ['Promotions/PromotionManagement', 'Gói quảng bá'],
      ['Reviews/ReviewsReportsPage', 'Đánh giá'], ['Notifications/NotificationManagement', 'Quản lý thông báo'],
      ['Settings/SystemSettings', 'Cài đặt hệ thống'],
    ]
    for (const [file, title] of pages) {
      const { default: Page } = await server.ssrLoadModule(`/src/Admin/${file}.jsx`)
      const markup = renderToString(createElement(MemoryRouter, null, createElement(Page)))
      assert.ok(markup.includes(title), file)
      assert.doesNotMatch(markup, />\s*(Active|Inactive|Pending|Confirmed|Completed|Draft|Court Owner|Verified|Select|Showing)\s*</, file)
    }
    const { default: Header } = await server.ssrLoadModule('/src/Admin/Layout/AdminHeader.jsx')
    // AdminHeader dùng useAuth: cấp sẵn giá trị context tối thiểu (cùng module instance qua Vite)
    const { AuthContext } = await server.ssrLoadModule('/src/context/authContext.js')
    const auth = { isAuthenticated: true, role: 'Admin', logout: () => {} }
    for (const item of adminMenu.filter(entry => entry.enabled)) {
      const markup = renderToString(createElement(AuthContext.Provider, { value: auth }, createElement(MemoryRouter, { initialEntries: [item.path] }, createElement(Header))))
      assert.ok(markup.includes(item.label.replaceAll('&', '&amp;')), item.path)
    }
  } finally { await server.close() }
})
