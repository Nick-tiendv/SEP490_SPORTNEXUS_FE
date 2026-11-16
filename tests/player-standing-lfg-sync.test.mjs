import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC_ROOT = path.join(ROOT, 'src')

test('Đồng bộ Elo, Rank và Môn thể thao từ Hồ sơ cá nhân sang LFG & UI', async (t) => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })

  t.after(async () => {
    await server.close()
  })

  await t.test('buildProfileStandings đồng bộ đúng theo danh sách môn ở Hồ sơ cá nhân và loại TEAM/môn đã xóa', async () => {
    const { buildProfileStandings, findStandingForSport, eloText } = await server.ssrLoadModule(
      '/src/hooks/usePlayerStanding.js',
    )

    const result = buildProfileStandings({
      useMySports: true,
      mySports: [
        { sportCategoryId: 'sport-1', name: 'Cầu lông', skillLevel: 'INTERMEDIATE' },
        { sportCategoryId: 'sport-2', name: 'Pickleball', skillLevel: 'BEGINNER' },
        { sportCategoryId: 'sport-3', name: 'Bóng đá', skillLevel: 'INTERMEDIATE' },
      ],
      ratings: [
        {
          ownerType: 'PLAYER',
          ratingType: 'SINGLES',
          sportCategoryId: 'sport-1',
          sportName: 'Cầu lông',
          rating: 1228,
          rank: 'Bạc',
          ratedMatches: 4,
          isProvisional: true,
        },
        {
          ownerType: 'TEAM',
          ratingType: 'TEAM',
          sportCategoryId: 'sport-1',
          sportName: 'Cầu lông',
          rating: 1999,
          rank: 'Kim cương',
          ratedMatches: 12,
          isProvisional: false,
        },
        // Môn không còn trong mySports phải bị loại khi đồng bộ từ Hồ sơ cá nhân
        {
          ownerType: 'PLAYER',
          ratingType: 'SINGLES',
          sportCategoryId: 'sport-99',
          sportName: 'Tennis',
          rating: 1600,
          rank: 'Vàng',
          ratedMatches: 9,
          isProvisional: false,
        },
      ],
      assessments: [
        {
          sportCategoryId: 'sport-2',
          sportName: 'Pickleball',
          assignedRating: 1120,
          rank: 'Đồng',
          skillLevel: 'BEGINNER',
        },
      ],
    })

    assert.equal(result.sports.length, 3)
    assert.equal(result.personal.length, 2)
    assert.equal(result.best?.sportName, 'Cầu lông')
    assert.equal(result.best?.rating, 1228)
    assert.equal(result.ratedMatches, 4)

    const badminton = findStandingForSport(result.sports, 'badminton')
    assert.equal(badminton?.rating, 1228)
    assert.equal(badminton?.rank, 'Bạc')
    assert.equal(eloText(badminton, 'Cầu Lông'), 'Elo 1228 (tạm tính) · Bạc · Cầu lông')

    const pickleball = findStandingForSport(result.sports, 'pickleball')
    assert.equal(pickleball?.rating, 1120)
    assert.equal(pickleball?.rank, 'Đồng')
    assert.equal(eloText(pickleball, 'Pickleball'), 'Elo 1120 (tạm tính) · Đồng · Pickleball')

    const football = findStandingForSport(result.sports, 'sport-3')
    assert.equal(football?.hasRating, false)
    assert.equal(football?.rating, null)
    assert.equal(eloText(football, 'Bóng Đá'), 'Chưa có Elo · Bóng đá')

    // Môn đã bị gỡ khỏi Hồ sơ cá nhân không được trả ra
    const tennis = findStandingForSport(result.sports, 'tennis')
    assert.equal(tennis, null)
    assert.equal(eloText(tennis, 'Tennis'), 'Chưa có Elo · Tennis')
    assert.equal(eloText(null), 'Chưa có Elo')
  })

  await t.test('buildProfileStandings fallback về ratings cá nhân khi useMySports = false', async () => {
    const { buildProfileStandings, eloText } = await server.ssrLoadModule('/src/hooks/usePlayerStanding.js')

    const result = buildProfileStandings({
      useMySports: false,
      ratings: [
        {
          ownerType: 'PLAYER',
          ratingType: 'SINGLES',
          sportCategoryId: 'sport-2',
          sportName: 'Pickleball',
          rating: 1450,
          rank: 'Vàng',
          ratedMatches: 6,
          isProvisional: false,
        },
      ],
    })

    assert.equal(result.personal.length, 1)
    assert.equal(eloText(result.best), 'Elo 1450 · Vàng · Pickleball')
  })

  await t.test('CommunityFeed chỉ hiển thị dòng xanh biển Elo khi pick 1 môn cụ thể và đồng bộ với SportContext', async () => {
    const feedCode = await readFile(path.join(SRC_ROOT, 'Player/LFG/CommunityFeed.jsx'), 'utf8')
    assert.match(feedCode, /useSport\s*\(\)/)
    assert.match(feedCode, /pickedSportMeta\?\.label/)
    assert.match(feedCode, /pickedSportKey\s*\?\s*standing\.forSport\(pickedSportKey\)\s*:\s*null/)
    assert.match(feedCode, /\{pickedSportKey\s*&&\s*\([\s\S]{0,160}bg-\[#E0F2FE\][\s\S]{0,160}eloText\(pickedStanding,\s*pickedSportName\)/)
    assert.doesNotMatch(feedCode, /bg-\[#E0F2FE\][\s\S]{0,120}standing\.best/)
  })

  await t.test('CreateMatch, Dashboard và SplitPayment dùng standing.forSport theo môn đang chọn và bỏ email/SĐT cứng', async () => {
    const createMatchCode = await readFile(path.join(SRC_ROOT, 'Player/LFG/CreateMatch.jsx'), 'utf8')
    const dashboardCode = await readFile(path.join(SRC_ROOT, 'Player/Home/Dashboard.jsx'), 'utf8')
    const splitPaymentCode = await readFile(path.join(SRC_ROOT, 'Player/Booking/Payment/SplitPayment.jsx'), 'utf8')

    assert.match(createMatchCode, /standing\.forSport\(sport\)/)
    assert.match(dashboardCode, /standing\.forSport\(selectedSports\[0\]\)[\s\S]{0,80}\?\.label/)
    assert.match(splitPaymentCode, /standing\.forSport\(state\.sport\)/)
    assert.doesNotMatch(splitPaymentCode, /minhm@domain\.vn|0908 ••• 888/)
  })
})
