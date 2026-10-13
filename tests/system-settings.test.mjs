import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { defaultSettings, initialChangeHistory, settingsStorageKey, settingsVersion } from '../src/Admin/Settings/settingsData.js'
import { cloneSettings, exportSettings, hasChanges, loadMockSettings, makeHistoryEntry, persistMockSettings, sanitizeSettings, settingsChanges, validateSettings } from '../src/Admin/Settings/settingsHelpers.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('default settings are complete and valid; cloned settings do not share nested values', () => {
  assert.deepEqual(validateSettings(defaultSettings), {})
  const current = cloneSettings(defaultSettings)
  current.tournament.formats.pop()
  current.general.platformName = 'A different platform'
  assert.equal(defaultSettings.tournament.formats.length, 4)
  assert.equal(defaultSettings.general.platformName, 'SportNexus')
  assert.equal(hasChanges(current, defaultSettings), true)
  assert.equal(hasChanges(cloneSettings(defaultSettings), defaultSettings), false)
})

test('text and email validation reject empty values, invalid emails and oversized fields', () => {
  for (const [name, value] of [['platformName', '  '], ['supportEmail', 'invalid'], ['supportEmail', 'name@example'], ['description', ''], ['description', 'x'.repeat(501)]]) {
    const current = cloneSettings(defaultSettings)
    current.general[name] = value
    assert.ok(validateSettings(current)[`general.${name}`])
  }
})

test('numeric ranges, percentages, positive integers and min/max duration are validated across groups', () => {
  for (const [group, name, value] of [
    ['booking', 'minDuration', 0], ['booking', 'maxDuration', -1], ['booking', 'advanceBookingDays', -1],
    ['booking', 'bufferMinutes', 1.5], ['booking', 'cancellationHours', -1],
    ['payment', 'serviceFee', 101], ['payment', 'serviceFee', -1], ['payment', 'refundPercentage', 101],
    ['payment', 'paymentTimeout', 0], ['payment', 'paymentTimeout', ''], ['payment', 'paymentTimeout', Infinity],
    ['tournament', 'maxTeams', 0], ['tournament', 'maxTeams', 3.5], ['tournament', 'registrationClosingHours', -1],
    ['notifications', 'bookingReminderMinutes', -1], ['notifications', 'retryLimit', 1.5], ['security', 'maxLoginAttempts', 0],
  ]) {
    const current = cloneSettings(defaultSettings)
    current[group][name] = value
    assert.ok(validateSettings(current)[`${group}.${name}`], `${group}.${name} must reject ${value}`)
  }
  const current = cloneSettings(defaultSettings)
  current.booking.minDuration = 3
  current.booking.maxDuration = 2
  assert.ok(validateSettings(current)['booking.maxDuration'])
  current.booking.maxDuration = 4
  current.payment.serviceFee = 0
  current.payment.refundPercentage = 100
  assert.deepEqual(validateSettings(current), {})
})

test('select values and toggles are allowlisted; at least one valid tournament format is required', () => {
  const current = cloneSettings(defaultSettings)
  for (const name of ['defaultLanguage', 'timezone', 'currency']) current.general[name] = 'invalid'
  current.security.sessionTimeout = '999'
  current.general.maintenanceMode = 'true'
  current.tournament.formats = []
  const errors = validateSettings(current)
  assert.ok(errors['general.defaultLanguage'])
  assert.ok(errors['general.timezone'])
  assert.ok(errors['general.currency'])
  assert.ok(errors['security.sessionTimeout'])
  assert.ok(errors['general.maintenanceMode'])
  assert.ok(errors['tournament.formats'])
  current.tournament.formats = ['single-elimination', 'unknown']
  assert.ok(validateSettings(current)['tournament.formats'])
  current.tournament.formats = ['single-elimination', 'single-elimination']
  assert.ok(validateSettings(current)['tournament.formats'])
})

test('saving sanitizes editable values and records only changes in known configuration groups', () => {
  const current = cloneSettings(defaultSettings)
  current.general.platformName = '  SportNexus Plus  '
  current.payment.serviceFee = '7.5'
  current.notifications.emailEnabled = false
  const saved = sanitizeSettings(current)
  assert.equal(saved.general.platformName, 'SportNexus Plus')
  assert.equal(saved.payment.serviceFee, 7.5)
  const entry = makeHistoryEntry(defaultSettings, saved, 'Admin mẫu', '2026-10-13T10:00:00+07:00', 'test-change')
  assert.equal(entry.changes.length, 3)
  assert.deepEqual(entry.groups, ['general', 'payment', 'notifications'])
  assert.equal(entry.actor, 'Admin mẫu')
  assert.equal(settingsChanges(defaultSettings, cloneSettings(defaultSettings)).length, 0)
})

test('save persists configuration and history across reloads with an isolated storage key', () => {
  const storage = memoryStorage()
  storage.setItem('sportnexus.auth.session', 'existing-auth-data')
  const current = cloneSettings(defaultSettings)
  current.booking.advanceBookingDays = 45
  const entry = makeHistoryEntry(defaultSettings, current, 'Admin mẫu', '2026-10-13T10:00:00+07:00', 'test-history')
  assert.equal(persistMockSettings(current, [entry], storage).persisted, true)
  const loaded = loadMockSettings(storage)
  assert.equal(loaded.settings.booking.advanceBookingDays, 45)
  assert.equal(loaded.history[0].id, 'test-history')
  assert.equal(loaded.notice, '')
  assert.equal(storage.getItem('sportnexus.auth.session'), 'existing-auth-data')
  assert.ok(storage.getItem(settingsStorageKey))
})

test('discard and reset restore independent snapshots; reset stays unsaved until an explicit save', () => {
  const saved = cloneSettings(defaultSettings)
  saved.general.platformName = 'Saved Name'
  let current = cloneSettings(saved)
  current.general.platformName = 'Unsaved Name'
  assert.ok(hasChanges(current, saved))
  current = cloneSettings(saved)
  assert.equal(current.general.platformName, 'Saved Name')
  assert.equal(hasChanges(current, saved), false)
  current = cloneSettings(defaultSettings)
  assert.ok(hasChanges(current, saved))
  assert.equal(saved.general.platformName, 'Saved Name')
})

test('invalid, malformed, outdated and incomplete stored data fall back to defaults', () => {
  const storage = memoryStorage()
  for (const raw of ['invalid-json', 'null', JSON.stringify({ version: 0, settings: defaultSettings }), JSON.stringify({ version: settingsVersion, settings: {} }), JSON.stringify({ version: settingsVersion, settings: { ...defaultSettings, payment: { ...defaultSettings.payment, serviceFee: -20 } } })]) {
    storage.setItem(settingsStorageKey, raw)
    const loaded = loadMockSettings(storage)
    assert.deepEqual(loaded.settings, defaultSettings)
    assert.ok(loaded.notice)
  }
})

test('unavailable storage falls back safely without claiming persistent saves', () => {
  const storage = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('quota exceeded') } }
  assert.deepEqual(loadMockSettings(storage).settings, defaultSettings)
  assert.equal(persistMockSettings(defaultSettings, initialChangeHistory, storage).persisted, false)
  assert.ok(persistMockSettings(defaultSettings, initialChangeHistory, storage).notice)
  assert.equal(persistMockSettings(defaultSettings, initialChangeHistory, null).persisted, false)
})

test('export and storage include only known settings, never unexpected secrets or auth properties', () => {
  const current = cloneSettings(defaultSettings)
  current.general.apiKey = 'must-not-export'
  current.security.password = 'must-not-export'
  current.security.token = 'must-not-export'
  current.secret = { password: 'must-not-export' }
  const exported = exportSettings(current)
  assert.ok(!exported.includes('must-not-export'))
  assert.deepEqual(JSON.parse(exported).settings, defaultSettings)
  assert.equal(JSON.parse(exported).mode, 'mock')
  const storage = memoryStorage()
  const unsafeHistory = [{ id: 'bad', at: '2026-10-13T10:00:00+07:00', actor: 'Admin', changes: [{ path: 'security.token', before: 'old', after: 'must-not-export' }, { path: 'general.platformName', before: 'SportNexus', after: { secret: 'must-not-export' } }] }]
  persistMockSettings(current, unsafeHistory, storage)
  assert.ok(!storage.getItem(settingsStorageKey).includes('must-not-export'))
  assert.equal(loadMockSettings(storage).history.length, 0)
})

test('invalid configuration cannot be exported; empty history remains empty on reload', () => {
  const current = cloneSettings(defaultSettings)
  current.general.supportEmail = 'invalid'
  assert.throws(() => exportSettings(current), /chưa hợp lệ/)
  const storage = memoryStorage()
  persistMockSettings(defaultSettings, [], storage)
  assert.deepEqual(loadMockSettings(storage).history, [])
})

test('channel child preferences are retained when the channel is disabled and restored', () => {
  const current = cloneSettings(defaultSettings)
  current.notifications.emailEnabled = false
  const saved = sanitizeSettings(current)
  assert.equal(saved.notifications.emailBooking, true)
  assert.equal(saved.notifications.emailPayment, true)
  saved.notifications.emailEnabled = true
  assert.equal(saved.notifications.emailBooking, true)
})

test('Cài đặt hệ thống route and enabled menu match the existing protected Admin route', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const menu = await readFile(new URL('../src/Admin/adminMenu.js', import.meta.url), 'utf8')
  assert.ok(app.includes('<Route path="settings" element={<SystemSettings />} />'))
  assert.ok(app.indexOf('<Route path="settings"') > app.indexOf('<Route path="/admin" element={<AdminLayout />}'))
  assert.ok(menu.includes("path: '/admin/settings', icon: Settings, enabled: true"))
})

test('React page, profile, disabled channel controls and all dialogs render through Vite without auth changes', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { AuthContext } = await server.ssrLoadModule('/src/context/authContext.js')
    const { default: Page } = await server.ssrLoadModule('/src/Admin/Settings/SystemSettings.jsx')
    const markup = renderToString(createElement(AuthContext.Provider, { value: { role: 'Admin' } }, createElement(Page)))
    for (const content of ['Cài đặt hệ thống', 'Cài đặt chung', 'Đặt sân &amp; Thanh toán', 'Cài đặt giải đấu', 'Cài đặt thông báo', 'Bảo mật &amp; Truy cập', 'Khu vực thao tác nhạy cảm', 'Lưu tất cả thay đổi', 'Hệ thống hoạt động bình thường', 'HỒ SƠ MẪU']) assert.ok(markup.includes(content), content)
    const { NotificationSettings } = await server.ssrLoadModule('/src/Admin/Settings/SettingsSections.jsx')
    const off = cloneSettings(defaultSettings)
    off.notifications.emailEnabled = false
    const disabledMarkup = renderToString(createElement(NotificationSettings, { settings: off, errors: {}, onChange: () => {} }))
    assert.match(disabledMarkup, /id="ss-notifications-emailBooking"[^>]*disabled=""/)
    const { default: Dialogs } = await server.ssrLoadModule('/src/Admin/Settings/SettingsDialogs.jsx')
    for (const type of ['history', 'sessions', 'policy', 'password', 'reset', 'critical']) {
      const rendered = renderToString(createElement(Dialogs, { dialog: { type, group: 'general', name: 'maintenanceMode', value: true }, history: initialChangeHistory, settings: defaultSettings, onClose: () => {}, onConfirm: () => {} }))
      assert.ok(rendered.includes('role="dialog"'))
    }
    const empty = renderToString(createElement(Dialogs, { dialog: { type: 'history' }, history: [], settings: defaultSettings, onClose: () => {} }))
    assert.ok(empty.includes('Chưa có lịch sử thay đổi'))
  } finally { await server.close() }
})
