import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Dữ liệu GET /tournaments/{id}/bracket thật (loại trực tiếp 6 người, 2 người miễn đấu)
const raw = [
  { id: 'm7', matchIndex: 7, stage: 'KNOCKOUT', roundName: 'Tứ kết', p1: 'Trần Bình', p2: 'tưới cây xương rồng', winner: null, scores: [] },
  { id: 'm6', matchIndex: 6, stage: 'KNOCKOUT', roundName: 'Tứ kết (miễn đấu)', p1: 'Minh Minh', p2: 'TBD', winner: 'Minh Minh', scores: [] },
  { id: 'm5', matchIndex: 5, stage: 'KNOCKOUT', roundName: 'Tứ kết', p1: 'Phạm Dũng', p2: 'Hoàng Giang', winner: null, scores: [{ setNumber: 1, scoreP1: 21, scoreP2: 18 }] },
  { id: 'm4', matchIndex: 4, stage: 'KNOCKOUT', roundName: 'Tứ kết (miễn đấu)', p1: 'Lê Châu', p2: 'TBD', winner: 'Lê Châu', scores: [] },
  { id: 'm3', matchIndex: 3, stage: 'KNOCKOUT', roundName: 'Bán kết', p1: 'Minh Minh', p2: 'TBD', winner: null, scores: [] },
  { id: 'm2', matchIndex: 2, stage: 'KNOCKOUT', roundName: 'Bán kết', p1: 'Lê Châu', p2: 'TBD', winner: null, scores: [] },
  { id: 'm1', matchIndex: 1, stage: 'KNOCKOUT', roundName: 'Chung kết', p1: 'TBD', p2: 'TBD', winner: null, scores: [] },
]

test('bracket: danh sách phẳng p1/p2 gom đúng vòng và đọc tên đấu thủ', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { toBracket } = await server.ssrLoadModule('/src/api/admin/tournamentApi.js')
    const rounds = toBracket(raw)
    assert.deepEqual(rounds.map(round => round.label), ['Tứ kết', 'Bán kết', 'Chung kết'])
    assert.deepEqual(rounds[0].matches.map(match => match.id), ['m4', 'm5', 'm6', 'm7'], 'thứ tự cây: m4, m5 lên m2; m6, m7 lên m3')
    const [bye, played] = rounds[0].matches
    assert.equal(bye.a.name, 'Lê Châu')
    assert.equal(bye.b.name, '', 'TBD = chưa xác định')
    assert.equal(bye.isBye, true)
    assert.equal(bye.winnerName, 'Lê Châu')
    assert.equal(played.b.name, 'Hoàng Giang')
    assert.deepEqual(played.sets, [{ set: 1, a: 21, b: 18 }])
    assert.equal(rounds[2].matches[0].a.name, '')
  } finally {
    await server.close()
  }
})
