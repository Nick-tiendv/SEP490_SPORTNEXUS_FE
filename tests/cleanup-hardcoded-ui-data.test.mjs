import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC_ROOT = path.join(ROOT, 'src')

test('Tháo gỡ dữ liệu cứng và fallback giả trên UI', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('facilityApi.transformFacilityToCourt trả giá trị thật (null/0/rỗng) khi thiếu rating, reviewCount, giá, số sân, tiện ích', async () => {
    const facilityApi = await server.ssrLoadModule('/src/api/player/facilityApi.js')

    const court = facilityApi.transformFacilityToCourt({
      id: 'fac-empty',
      name: 'Sân Test',
      address: '10 Trần Phú, Nha Trang',
    })

    assert.equal(court.rating, null)
    assert.equal(court.reviewCount, 0)
    assert.equal(court.price, 0)
    assert.equal(court.courtCount, 0)
    assert.equal(court.subCourtDesc, '')
    assert.equal(court.image, '/sports-bg.jpg')
    assert.doesNotMatch(court.subCourtDesc, /Đèn ban đêm|Bãi giữ xe/)
  })

  await t.test('lfgSuggestionEngine không tự điền giá/số sân/đánh giá/giờ mở cửa giả cho cơ sở thiếu dữ liệu', async () => {
    const engine = await server.ssrLoadModule('/src/Player/LFG/lfgSuggestionEngine.js')

    const res = engine.buildPersonalizedLfgSuggestions({
      profileSports: [{ sportKey: 'badminton', sportName: 'Cầu lông', skillKey: 'all', skillLabel: 'Tất cả' }],
      activeFilters: { sport: 'all', distanceRangeKey: 'all', timeSlots: [] },
      facilities: [{ id: 'f1', name: 'Sân Cầu Lông Test', sports: ['badminton'] }],
      matches: [],
      communityPosts: [],
    })

    assert.equal(res.suggestedVenues.length, 1)
    const venue = res.suggestedVenues[0]
    assert.equal(venue.price, 0)
    assert.equal(venue.courtCount, 0)
    assert.equal(venue.rating, null)
    assert.equal(venue.reviewCount, 0)
    assert.equal(venue.openTime, '')
    assert.equal(venue.closeTime, '')
    assert.equal(venue.image, '/sports-bg.jpg')
  })

  await t.test('Không còn template ca giả, quy tắc giá giả, chỉ số LFG giả và file Wallet mock', async () => {
    const mapBooking = await readFile(path.join(SRC_ROOT, 'Player/Booking/FindCourt/MapBooking.jsx'), 'utf8')
    assert.doesNotMatch(mapBooking, /\b(SLOT_TEMPLATE|SLOT_TEMPLATE_FUTURE|buildSlots)\b/)

    const courtDetails = await readFile(path.join(SRC_ROOT, 'Player/Booking/CourtDetail/CourtDetails.jsx'), 'utf8')
    assert.doesNotMatch(courtDetails, /averageRating\s*>\s*0\s*\?\s*facility\.averageRating\s*:\s*4\.9/)
    assert.doesNotMatch(courtDetails, /reviewCount\s*\|\|\s*128/)
    assert.doesNotMatch(courtDetails, /picsum\.photos/)

    const createMatch = await readFile(path.join(SRC_ROOT, 'Player/LFG/CreateMatch.jsx'), 'utf8')
    assert.doesNotMatch(createMatch, /~ 4\.8 Phút|18 vận động viên cùng trình độ trực tuyến|>88%</)

    const communityFeed = await readFile(path.join(SRC_ROOT, 'Player/LFG/CommunityFeed.jsx'), 'utf8')
    assert.doesNotMatch(communityFeed, /\b(createMatchOpen|handleCreateMatchSubmit|newMatch)\b/)

    const courtManage = await readFile(path.join(SRC_ROOT, 'CourtOwner/Courts/CourtManage.jsx'), 'utf8')
    assert.doesNotMatch(courtManage, /\b(DEFAULT_PRICING_RULES|PEAK_MULTIPLIER)\b/)

    const dashboard = await readFile(path.join(SRC_ROOT, 'Player/Home/Dashboard.jsx'), 'utf8')
    assert.match(dashboard, /setApiSuggestedCourts\(all\.map\(toSuggestedCourt\)\)/)

    await assert.rejects(
      () => access(path.join(SRC_ROOT, 'Player/Wallet/Wallet.jsx'), fsConstants.F_OK),
      'File mock Player/Wallet/Wallet.jsx phải được xóa bỏ'
    )
  })
})
