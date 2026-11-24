import test from 'node:test'
import assert from 'node:assert/strict'
import { matchFacilities } from '../src/CourtOwner/Tournament/tournamentRules.js'

const facilities = [
  { id: '1', name: 'Gò Vấp Pickleball Club', address: '120 Quang Trung, Phường Sài Gòn, Thành phố Hồ Chí Minh' },
  { id: '2', name: 'Hà Nội Badminton Center', address: '36 Trần Duy Hưng, Phường Ba Đình, Thành phố Hà Nội' },
  { id: '3', name: 'Sân Thể Thao Cactus', address: '76, Nguyễn Xiển, Thành phố Hồ Chí Minh' },
  { id: '4', name: 'Sân Banh Cactus', address: '76, Lê Văn Việt, Thành phố Hồ Chí Minh' },
]

test('chọn cơ sở: gõ vài ký tự, không dấu, theo tên hoặc địa chỉ', () => {
  const ids = (query) => matchFacilities(facilities, query).map((f) => f.id)
  assert.deepEqual(ids('ha noi'), ['2'], 'không dấu')
  assert.deepEqual(ids('badm'), ['2'], 'vài ký tự')
  assert.deepEqual(ids('cactus'), ['3', '4'])
  assert.deepEqual(ids('cactus le van'), ['4'], 'tên + địa chỉ')
  assert.deepEqual(ids('tran duy hung'), ['2'], 'theo địa chỉ')
  assert.deepEqual(ids('san banh').at(0), '4', 'tên bắt đầu bằng chữ gõ lên trước')
  assert.equal(ids('').length, 4, 'chưa gõ thì hiện tất cả')
  assert.deepEqual(ids('xyz'), [])
})
