// Fictional records. Platform snapshots are independent of the small demo directory.
export const tournamentStats = [
  { label: 'Tổng giải đấu', value: 84, note: '+12,5% so với tháng trước', icon: 'total' },
  { label: 'Đang mở đăng ký', value: 18, note: 'Đang nhận người tham gia', icon: 'open' },
  { label: 'Sắp diễn ra', value: 6, note: 'Chuẩn bị thi đấu', icon: 'upcoming' },
  { label: 'Đã hoàn thành', value: 58, note: 'Đã có kết quả minh họa', icon: 'completed' },
  { label: 'Tổng người tham gia', value: 2450, note: 'Số liệu toàn nền tảng mẫu', icon: 'participants' },
]
export const statusLabels = { Registration: 'Đang mở đăng ký', Upcoming: 'Sắp diễn ra', Ongoing: 'Đang diễn ra', Completed: 'Đã hoàn thành', Cancelled: 'Đã hủy' }
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt' }
export const formatLabels = { Knockout: 'Loại trực tiếp · Đơn', RoundRobin: 'Vòng tròn · Đơn' }
export const matchLabels = { Scheduled: 'Đã xếp lịch', Ongoing: 'Đang thi đấu', Completed: 'Đã kết thúc', Bye: 'Miễn vòng', Waiting: 'Chờ kết quả vòng trước' }
export const number = value => value.toLocaleString('vi-VN')
export const money = value => `${number(value)} đ`
export const date = value => value.split('-').reverse().join('/')
export const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
export function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const iso = `${match[3]}-${match[2]}-${match[1]}`, parsed = new Date(`${iso}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null
}
export const facilities = ['Sunrise Riverside', 'CLB Phú Mỹ Hưng', 'Bình Thạnh Arena', 'CLB Thảo Điền']
const names = ['Lê Hoàng Nam', 'Minh Minh Minh', 'Trần Đình Khang', 'Vũ Thị Mai Anh', 'Nguyễn Minh Trí', 'Nguyễn Văn An', 'Trần Quốc Bảo', 'Lê Thị Mỹ Hương']
export function makeParticipants(count, prefix) {
  return Array.from({ length: count }, (_, index) => ({ id: `${prefix}-P${index + 1}`, name: names[index] || `Vận động viên mẫu ${index + 1}`, seed: index + 1, paid: index < Math.ceil(count * .8), rating: `Elo ${number(1650 - index * 10)}`, registered: '2026-10-01' }))
}

// Bracket generation is pure and deterministic for the same ordered participant IDs.
export function generateBracket(tournament, order = tournament.participants.map(player => player.id)) {
  if (order.length < 2) return null
  if (tournament.format === 'RoundRobin') {
    const rotating = [...order]
    if (rotating.length % 2) rotating.push(null)
    const rounds = []
    for (let round = 0; round < rotating.length - 1; round++) {
      const matches = []
      for (let match = 0; match < rotating.length / 2; match++) {
        const a = rotating[match], b = rotating[rotating.length - 1 - match]
        if (a && b) matches.push({ id: `R${round + 1}-M${match + 1}`, a, b, status: 'Scheduled', winnerId: null, score: null })
      }
      rounds.push({ label: `Lượt ${round + 1}`, matches })
      rotating.splice(1, 0, rotating.pop())
    }
    return { format: tournament.format, order: [...order], rounds, pairing: 'Seeded' }
  }
  const size = 2 ** Math.ceil(Math.log2(order.length))
  let positions = [1, 2]
  while (positions.length < size) positions = positions.flatMap(seed => [seed, positions.length * 2 + 1 - seed])
  const rounds = []
  for (let round = 0, matchCount = size / 2; matchCount >= 1; round++, matchCount /= 2) {
    const matches = Array.from({ length: matchCount }, (_, index) => {
      const a = round === 0 ? order[positions[index * 2] - 1] || null : rounds[round - 1].matches[index * 2].winnerId
      const b = round === 0 ? order[positions[index * 2 + 1] - 1] || null : rounds[round - 1].matches[index * 2 + 1].winnerId
      const bye = round === 0 && (!a || !b)
      return { id: `R${round + 1}-M${index + 1}`, a, b, status: bye ? 'Bye' : a && b ? 'Scheduled' : 'Waiting', winnerId: bye ? a || b : null, score: null }
    })
    rounds.push({ label: matchCount === 1 ? 'Chung kết' : matchCount === 2 ? 'Bán kết' : matchCount === 4 ? 'Tứ kết' : `Vòng ${round + 1}`, matches })
  }
  return { format: tournament.format, order: [...order], rounds, pairing: 'Seeded' }
}
export function randomOrder(participants) {
  const order = participants.map(player => player.id)
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }
  return order
}
function fixtureBracket(tournament) {
  const bracket = generateBracket(tournament)
  if (!['Ongoing', 'Completed'].includes(tournament.status)) return bracket
  if (tournament.format === 'RoundRobin') {
    bracket.rounds.forEach((round, roundIndex) => round.matches.forEach((match, index) => {
      if (tournament.status === 'Completed' || (roundIndex === 0 && index === 0)) { match.status = 'Completed'; match.winnerId = match.a; match.score = [21, 17] }
    }))
    return bracket
  }
  bracket.rounds.forEach((round, roundIndex) => round.matches.forEach((match, index) => {
    if (roundIndex > 0) {
      match.a = bracket.rounds[roundIndex - 1].matches[index * 2].winnerId
      match.b = bracket.rounds[roundIndex - 1].matches[index * 2 + 1].winnerId
      match.status = match.a && match.b ? 'Scheduled' : 'Waiting'
    }
    if (match.a && match.b && (tournament.status === 'Completed' || (roundIndex === 0 && index < 3))) { match.status = 'Completed'; match.winnerId = match.a; match.score = [21, 17] }
    else if (match.a && match.b && tournament.status === 'Ongoing' && roundIndex === 0) { match.status = 'Ongoing'; match.score = [10, 8] }
  }))
  return bracket
}
const samples = [
  ['SportNexus Badminton Open 2026', 'Badminton', 0, '2026-10-24', '2026-10-26', 24, 32, 'Registration', 'Knockout'],
  ['HCMC Pickleball Master Cup 2026', 'Pickleball', 1, '2026-10-28', '2026-10-30', 8, 8, 'Upcoming', 'RoundRobin'],
  ['Bình Thạnh Tennis Open', 'Tennis', 2, '2026-11-02', '2026-11-05', 12, 16, 'Registration', 'Knockout'],
  ['Thảo Điền Autumn Badminton', 'Badminton', 3, '2026-10-15', '2026-10-20', 16, 16, 'Ongoing', 'Knockout'],
  ['Junior Pickleball Championship', 'Pickleball', 0, '2026-11-10', '2026-11-12', 8, 16, 'Registration', 'Knockout'],
  ['Cầu lông giao lưu Phú Mỹ Hưng', 'Badminton', 1, '2026-10-04', '2026-10-06', 8, 8, 'Completed', 'Knockout'],
  ['Giải quần vợt mùa thu', 'Tennis', 3, '2026-11-14', '2026-11-15', 6, 8, 'Upcoming', 'RoundRobin'],
  ['Pickleball cộng đồng', 'Pickleball', 2, '2026-10-08', '2026-10-09', 6, 8, 'Cancelled', 'Knockout'],
  ['Cúp cầu lông cuối tuần', 'Badminton', 0, '2026-11-18', '2026-11-20', 1, 16, 'Registration', 'Knockout'],
  ['Quần vợt Bình Thạnh', 'Tennis', 2, '2026-10-10', '2026-10-12', 8, 8, 'Completed', 'RoundRobin'],
  ['Cúp Pickleball Thảo Điền', 'Pickleball', 3, '2026-11-22', '2026-11-24', 10, 16, 'Registration', 'Knockout'],
  ['Cầu lông mở rộng', 'Badminton', 1, '2026-11-26', '2026-11-28', 14, 16, 'Upcoming', 'Knockout'],
]
export const initialTournaments = samples.map(([name, sport, venueIndex, starts, ends, count, capacity, status, format], index) => {
  const id = `TRN-2026-${String(42 - index).padStart(3, '0')}`
  const deadline = new Date(`${starts}T00:00:00Z`); deadline.setUTCDate(deadline.getUTCDate() - 2)
  const tournament = { id, name, sport, facility: facilities[venueIndex], organizer: 'Ban tổ chức SportNexus (minh họa)', starts, ends, deadline: deadline.toISOString().slice(0, 10), status, format, capacity, entryFee: 150000, prize: 15000000,
    participants: makeParticipants(count, id), bracket: null, pairingOrder: null, cancellationReason: status === 'Cancelled' ? 'Thay đổi lịch tổ chức trong dữ liệu minh họa.' : null,
    history: [{ id: 'created', text: 'Tạo giải đấu minh họa.' }, { id: 'registered', text: `Ghi nhận ${count} người đăng ký minh họa.` }],
  }
  if ([0, 1, 3, 5, 6, 9].includes(index)) {
    tournament.bracket = fixtureBracket(tournament)
    tournament.history.push({ id: 'bracket', text: 'Nhánh đấu và kết quả có sẵn trong dữ liệu mẫu; không phải thi đấu thực tế.' })
    const finished = tournament.bracket.rounds.flatMap(round => round.matches).filter(match => match.status === 'Completed')
    if (finished.length) tournament.history.push({ id: 'results', text: `Ghi nhận ${finished.length} kết quả trận đấu mẫu; tỷ số được hiển thị trong mục Trận đấu.` })
  }
  tournament.history.push({ id: 'status', text: `Trạng thái trong dữ liệu mẫu: ${statusLabels[status]}.` })
  return tournament
})
export function exportTournaments(tournaments) {
  const escape = value => { const text = String(value); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
  const rows = [['Mã giải', 'Tên giải', 'Môn thể thao', 'Cơ sở', 'Ban tổ chức', 'Ngày bắt đầu', 'Ngày kết thúc', 'Hạn đăng ký', 'Trạng thái', 'Đã đăng ký', 'Sức chứa', 'Phí tham gia (đ)', 'Giải thưởng (đ)', 'Thể thức'], ...tournaments.map(t => [t.id, t.name, sportLabels[t.sport], t.facility, t.organizer, date(t.starts), date(t.ends), date(t.deadline), statusLabels[t.status], t.participants.length, t.capacity, t.entryFee, t.prize, formatLabels[t.format]])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'giai-dau-minh-hoa.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
