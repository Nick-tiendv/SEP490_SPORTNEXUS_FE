import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { deleteBlockReason, filterMasterData, masterDataStats, usageCount, validateMasterData } from '../src/Admin/MasterData/masterDataHelpers.js'

// React SSR chèn <!-- --> giữa chữ tĩnh và biến; bỏ đi để so chuỗi.
const render = (type, props) => renderToString(createElement(type, props)).replaceAll('<!-- -->', '')

const sports = [
  { id: '1', name: 'Cầu lông', description: 'Luật BWF', isDeleted: false, courtCount: 3, tournamentCount: 1 },
  { id: '2', name: 'Bóng rổ', description: '', isDeleted: false, courtCount: 0, tournamentCount: 0 },
  { id: '3', name: 'Bi-a', description: '', isDeleted: true, courtCount: 0, tournamentCount: 0 },
]
const amenities = [
  { id: 'a', name: 'Wifi miễn phí', iconCode: 'wifi', isDeleted: false, facilityCount: 4 },
  { id: 'b', name: 'Căng tin', iconCode: 'canteen', isDeleted: false, facilityCount: 0 },
]

test('lọc bỏ dấu, ẩn/hiện mục đã xóa, mục đã xóa xếp cuối', () => {
  assert.deepEqual(filterMasterData(sports).map(item => item.id), ['2', '1'])
  assert.deepEqual(filterMasterData(sports, { showDeleted: true }).map(item => item.id), ['2', '1', '3'])
  assert.deepEqual(filterMasterData(sports, { search: 'cau long' }).map(item => item.id), ['1'])
  assert.deepEqual(filterMasterData(sports, { search: 'bwf' }).map(item => item.id), ['1'])
  assert.deepEqual(filterMasterData(amenities, { search: 'canteen' }).map(item => item.id), ['b'])
})

test('thống kê và số nơi đang dùng', () => {
  assert.deepEqual(masterDataStats('sports', sports), { active: 2, inUse: 1, deleted: 1 })
  assert.deepEqual(masterDataStats('amenities', amenities), { active: 2, inUse: 1, deleted: 0 })
  assert.equal(usageCount('sports', sports[0]), 4)
  assert.equal(usageCount('amenities', amenities[0]), 4)
})

test('validate theo SportCategoryRequest / AmenityRequest', () => {
  assert.equal(validateMasterData('sports', { name: 'Tennis', description: '' }, sports), '')
  assert.equal(validateMasterData('sports', { name: '  ', description: '' }, sports), 'Vui lòng nhập tên môn thể thao.')
  assert.match(validateMasterData('sports', { name: 'x'.repeat(101), description: '' }, sports), /100/)
  assert.match(validateMasterData('sports', { name: 'Tennis', description: 'x'.repeat(5001) }, sports), /5\.000/)
  assert.match(validateMasterData('sports', { name: 'cau long', description: '' }, sports), /đã tồn tại/)
  // Sửa chính nó, hoặc trùng tên với mục đã xóa thì không chặn (BE xử lý khi khôi phục).
  assert.equal(validateMasterData('sports', { name: 'Cầu lông', description: '' }, sports, '1'), '')
  assert.equal(validateMasterData('sports', { name: 'Bi-a', description: '' }, sports), '')
  assert.match(validateMasterData('amenities', { name: 'Sân phơi', iconCode: 'x'.repeat(51) }, amenities), /50/)
})

test('chặn xóa môn còn sân con đang dùng', () => {
  assert.match(deleteBlockReason('sports', sports[0]), /3 sân con/)
  assert.equal(deleteBlockReason('sports', sports[1]), '')
  assert.equal(deleteBlockReason('amenities', amenities[0]), '')
})

test('trang và hộp thoại render qua Vite', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { default: Page } = await server.ssrLoadModule('/src/Admin/MasterData/MasterDataManagement.jsx')
    const page = render(Page)
    for (const content of ['Danh mục dùng chung', 'Môn thể thao', 'Tiện ích', 'Thêm môn thể thao']) assert.ok(page.includes(content), content)
    const { MasterDataForm, DeleteMasterDataDialog } = await server.ssrLoadModule('/src/Admin/MasterData/MasterDataDialogs.jsx')
    const noop = () => {}
    assert.ok(render(MasterDataForm, { kind: 'amenities', item: amenities[0], items: amenities, onClose: noop, onDone: noop }).includes('Sửa tiện ích'))
    assert.ok(render(MasterDataForm, { kind: 'sports', item: null, items: sports, onClose: noop, onDone: noop }).includes('Mô tả luật chơi'))
    assert.ok(render(DeleteMasterDataDialog, { kind: 'sports', item: sports[0], onClose: noop, onDone: noop }).includes('không thể xóa'))
    assert.ok(render(DeleteMasterDataDialog, { kind: 'amenities', item: amenities[0], onClose: noop, onDone: noop }).includes('gỡ khỏi 4 cơ sở'))
  } finally {
    await server.close()
  }
})
