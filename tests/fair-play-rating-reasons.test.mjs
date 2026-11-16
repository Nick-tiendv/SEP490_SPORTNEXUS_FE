import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

test('Đánh giá Fair Play 1 - 2 sao: GET /reviews/fair-play/reasons, Radio UI, reasonId payload và validation Lý do 4 (Khác)', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('fairPlayReasons chuẩn hóa danh sách lý do và kiểm tra hợp lệ 1 - 2 sao & Lý do 4 (Khác)', async () => {
    const {
      normalizeFairPlayReasons,
      isOtherFairPlayReason,
      hasTextLetters,
      validateFairPlayRating,
    } = await server.ssrLoadModule('/src/Player/Rating/fairPlayReasons.js')

    const normalized = normalizeFairPlayReasons({
      statusCode: 200,
      data: [
        { id: 1, name: 'Đến trễ / Không đúng giờ' },
        { id: 2, name: 'Thái độ thiếu tôn trọng' },
        { id: 3, name: 'Không tuân thủ luật chơi' },
        { id: 4, name: 'Khác' },
      ],
    })
    assert.equal(normalized.length, 4)
    assert.equal(normalized[3].id, 4)
    assert.equal(normalized[3].label, 'Khác')
    assert.equal(isOtherFairPlayReason(normalized[0]), false)
    assert.equal(isOtherFairPlayReason(normalized[3]), true)

    assert.equal(hasTextLetters(''), false)
    assert.equal(hasTextLetters('   1234567890   '), false)
    assert.equal(hasTextLetters('Thái độ chưa chuẩn mực'), true)

    // 1 - 2 sao không chọn reasonId -> không hợp lệ
    const missingReason = validateFairPlayRating({
      score: 1,
      reasonId: null,
      reasons: normalized,
      comment: 'Người chơi không đúng giờ hẹn',
    })
    assert.equal(missingReason.valid, false)
    assert.match(missingReason.error, /1 - 2 sao/)

    // Chọn Lý do 4 (Khác) mà ô Nhận xét để trống hoặc toàn số/ký tự -> bị chặn
    const otherEmpty = validateFairPlayRating({
      score: 1,
      reasonId: 4,
      reasons: normalized,
      comment: '   ',
    })
    assert.equal(otherEmpty.valid, false)
    assert.equal(otherEmpty.isOtherReason, true)
    assert.match(otherEmpty.error, /Lý do 4 \(Khác\).*nhập chữ/)

    const otherDigitsOnly = validateFairPlayRating({
      score: 2,
      reasonId: 4,
      reasons: normalized,
      comment: '123456789012',
    })
    assert.equal(otherDigitsOnly.valid, false)
    assert.match(otherDigitsOnly.error, /Lý do 4 \(Khác\)/)

    // Chọn Lý do 4 (Khác) và nhập chữ hợp lệ -> đạt validation
    const otherValid = validateFairPlayRating({
      score: 1,
      reasonId: 4,
      reasons: normalized,
      comment: 'Bỏ về giữa trận không báo trước cho đồng đội',
    })
    assert.equal(otherValid.valid, true)
    assert.equal(otherValid.reasonId, 4)

    // Chọn Lý do 1 và nhập nhận xét hợp lệ -> đạt validation
    const reason1Valid = validateFairPlayRating({
      score: 1,
      reasonId: 1,
      reasons: normalized,
      comment: 'Đến sân trễ 30 phút khiến cả nhóm phải chờ',
    })
    assert.equal(reason1Valid.valid, true)
    assert.equal(reason1Valid.reasonId, 1)

    // Chấm 3 - 5 sao không yêu cầu reasonId
    const highRatingValid = validateFairPlayRating({
      score: 5,
      reasonId: 1,
      reasons: normalized,
      comment: 'Chơi rất fairplay và đúng giờ hẹn trên sân',
    })
    assert.equal(highRatingValid.valid, true)
    assert.equal(highRatingValid.reasonId, null)
  })

  await t.test('PostMatchRating.jsx gọi GET /api/v1/reviews/fair-play/reasons, render Radio UI 1-2 sao và SSR an toàn', async () => {
    const [{ default: PostMatchRating }, postMatchSrc] = await Promise.all([
      server.ssrLoadModule('/src/Player/Rating/PostMatchRating.jsx'),
      readFile(new URL('../src/Player/Rating/PostMatchRating.jsx', import.meta.url), 'utf8'),
    ])

    // Đầu file gọi API GET /api/v1/reviews/fair-play/reasons
    const headerSlice = postMatchSrc.slice(0, 1200)
    assert.match(headerSlice, /\/api\/v1\/reviews\/fair-play\/reasons/)

    // Render list Radio Buttons khi 1-2 sao và truyền reasonId
    assert.match(postMatchSrc, /type="radio"/)
    assert.match(postMatchSrc, /name="fairPlayReason"/)
    assert.match(postMatchSrc, /reasonId:\s*validation\.reasonId/)
    assert.match(postMatchSrc, /Lý do 4 \(Khác\)/)

    const html = renderToString(createElement(MemoryRouter, null, createElement(PostMatchRating)))
    assert.ok(html.includes('Đánh Giá Sau Trận Đấu Cho Người Chơi Cùng Sân'))
  })

  await t.test('rateFairPlay truyền reasonId khi chấm 1 sao để BE không trả 400 và chặn nếu thiếu reasonId', async () => {
    const [{ rateFairPlay }, clientMod] = await Promise.all([
      server.ssrLoadModule('/src/api/player/lfgApi.js'),
      server.ssrLoadModule('/src/api/apiClient.js'),
    ])

    await assert.rejects(
      () =>
        rateFairPlay({
          revieweeId: 'user-2',
          contextId: 'match-1',
          score: 1,
          comment: 'Thiếu lý do bắt buộc',
        }),
      /reasonId/
    )

    const prevAdapter = clientMod.default.defaults.adapter
    const requests = []
    clientMod.default.defaults.adapter = async (config) => {
      const parsed = config.data ? JSON.parse(config.data) : null
      requests.push({ method: config.method?.toUpperCase(), url: config.url, data: parsed })

      // Mô phỏng ràng buộc BE: 1-2 sao thiếu reasonId trả 400, đủ reasonId trả 200
      if ((parsed?.score === 1 || parsed?.score === 2) && (parsed?.reasonId == null || parsed?.reasonId === '')) {
        return {
          status: 400,
          data: { statusCode: 400, message: 'ReasonId is required for 1-2 star rating' },
          headers: {},
          config,
        }
      }

      return {
        status: 200,
        data: { statusCode: 200, message: 'OK', data: { id: 'rating-1', ...parsed } },
        headers: {},
        config,
      }
    }
    t.after(() => {
      clientMod.default.defaults.adapter = prevAdapter
    })

    const res1Star = await rateFairPlay({
      revieweeId: 'user-2',
      contextId: 'match-1',
      score: 1,
      reasonId: 1,
      comment: 'Đến muộn 30 phút và không báo trước',
    })
    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, 'POST')
    assert.equal(requests[0].url, '/api/v1/reviews/fair-play')
    assert.deepEqual(requests[0].data, {
      revieweeId: 'user-2',
      contextId: 'match-1',
      score: 1,
      comment: 'Đến muộn 30 phút và không báo trước',
      reasonId: 1,
    })
    assert.equal(res1Star.reasonId, 1)
    assert.equal(res1Star.score, 1)

    const resOther = await rateFairPlay({
      revieweeId: 'user-3',
      contextId: 'match-1',
      score: 1,
      reasonId: 4,
      comment: 'Thái độ thiếu tôn trọng bạn chơi cùng sân',
    })
    assert.equal(requests[1].data.reasonId, 4)
    assert.equal(resOther.reasonId, 4)
  })
})
