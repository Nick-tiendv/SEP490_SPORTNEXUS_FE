// aiBookingData.js — Cơ sở dữ liệu và bộ xử lý trả lời thông minh của Trợ lý AI SportNexus

export const DISTRICTS = [
  { key: 'all', label: 'Tất cả khu vực' },
  { key: 'q7', label: 'Quận 7 (Gần bạn: 0.8 km)' },
  { key: 'binhthanh', label: 'Bình Thạnh (5.2 km)' },
  { key: 'thuduc', label: 'TP. Thủ Đức (6.4 km)' },
]

export const COURTS = [
  {
    id: 'snx-q7',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'SportNexus Arena Q.7',
    address: '35 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7',
    mapQuery: '35 Huỳnh Tấn Phát, Tân Thuận Đông, Quận 7, Hồ Chí Minh',
    district: 'q7',
    districtName: 'Quận 7',
    distance: 0.8,
    rating: 4.9,
    reviewsCount: 342,
    price: 220000,
    courtCount: 5,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX BWF 01',
    subCourtDesc: 'Thảm Yonex Tiêu Chuẩn Quốc Tế BWF',
    highlights: ['Cách bạn 0.8 km (3 phút di chuyển)', 'Thảm Yonex giảm chấn cao cấp', 'Đỗ xe ô tô & xe máy miễn phí', 'Máy lạnh 21°C & Đèn 1200 Lux'],
    route: { eta: '3 phút di chuyển qua Huỳnh Tấn Phát', note: 'Tuyến đường thông thoáng • Đỗ xe máy & ô tô miễn phí' },
    overrides: {},
  },
  {
    id: 'yonex-bt',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'CLB Cầu Lông YONEX',
    address: '128 Điện Biên Phủ, P. 15, Q. Bình Thạnh',
    mapQuery: '128 Điện Biên Phủ, Bình Thạnh, Hồ Chí Minh',
    district: 'binhthanh',
    districtName: 'Bình Thạnh',
    distance: 5.2,
    rating: 4.8,
    reviewsCount: 280,
    price: 160000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=400&h=300&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX 03',
    subCourtDesc: 'Sàn gỗ phủ thảm PU chống trơn',
    highlights: ['Giá tiết kiệm chỉ 160k/h', '8 sân rộng rãi', 'Phù hợp nhóm bạn & giao lưu', 'Có quầy nước & căng tin'],
    route: { eta: '14 phút di chuyển qua Nguyễn Hữu Cảnh', note: 'Giờ cao điểm hơi đông • Có bãi giữ xe máy' },
    overrides: { s3: 'available', s6: 'booked' },
  },
  {
    id: 'pmh-pb',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'Phú Mỹ Hưng Pickleball Club',
    address: '12 Nguyễn Lương Bằng, P. Tân Phú, Quận 7',
    mapQuery: '12 Nguyễn Lương Bằng, Tân Phú, Quận 7, Hồ Chí Minh',
    district: 'q7',
    districtName: 'Quận 7',
    distance: 1.2,
    rating: 4.7,
    reviewsCount: 195,
    price: 180000,
    courtCount: 4,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball PMH 01',
    subCourtDesc: 'Sân ngoài trời có mái che & đèn chiếu sáng LED',
    highlights: ['Gần Quận 7 (cách 1.2 km)', 'Giá tốt 180k/h', 'Có mái che không lo mưa nắng', 'Đỗ xe thoải mái'],
    route: { eta: '5 phút di chuyển qua Nguyễn Văn Linh', note: 'Tuyến đường thông thoáng • Đỗ xe miễn phí' },
    overrides: { s2: 'available', s7: 'booked' },
  },
  {
    id: 'ddink-td',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'D-Dink Pickleball Hub',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    mapQuery: '28 Thảo Điền, Thủ Đức, Hồ Chí Minh',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    distance: 6.4,
    rating: 4.9,
    reviewsCount: 410,
    price: 250000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball Pro USAPA 02',
    subCourtDesc: 'Mặt sân acrylic chuẩn USAPA Pro Quốc Tế',
    highlights: ['Sân acrylic thi đấu chuẩn USAPA Pro', 'Đánh giá cao 4.9★', 'Bãi đỗ ô tô rộng rãi', 'Cộng đồng người chơi năng động'],
    route: { eta: '18 phút di chuyển qua Cầu Thủ Thiêm 2', note: 'Tuyến đường thông thoáng • Bãi đỗ ô tô rộng' },
    overrides: { s1: 'available', s4: 'held' },
  },
]

export const SLOT_TEMPLATE = [
  { id: 's1', start: '16:00', end: '17:00', hours: 1, factor: 1, status: 'booked', note: 'Đã kín lịch' },
  { id: 's2', start: '17:00', end: '18:00', hours: 1, factor: 1, status: 'booked', note: 'FC Sài Gòn Đặt' },
  { id: 's3', start: '18:00', end: '19:00', hours: 1, factor: 1, status: 'held', note: 'Đang giữ chỗ' },
  { id: 's4', start: '19:00', end: '19:30', hours: 0.5, factor: 1, status: 'available', note: 'Khung 30p warm-up' },
  { id: 's5', start: '19:30', end: '21:00', hours: 1.5, factor: 1, status: 'available', note: 'Giờ vàng chính thức' },
  { id: 's6', start: '21:00', end: '22:00', hours: 1, factor: 0.91, status: 'available', note: 'Giảm 9% giờ đêm' },
  { id: 's7', start: '22:00', end: '23:00', hours: 1, factor: 0.82, status: 'available', note: 'Giảm 18% giờ muộn' },
]

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`
export const roundTo10k = (n) => Math.round(n / 10000) * 10000

export function buildSlotsForCourt(court) {
  if (!court) return []
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides?.[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : status === 'held' ? 'Đang giữ chỗ' : t.note,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}

// Bộ phân tích câu hỏi người chơi và đưa ra câu trả lời + gợi ý ưu tiên
export function processAIChatQuery(rawQuery, currentCourtId = 'snx-q7') {
  const query = (rawQuery || '').trim().toLowerCase()
  const currentCourt = COURTS.find((c) => c.id === currentCourtId) || COURTS[0]

  // Gợi ý câu hỏi tiếp theo
  const defaultQuickReplies = [
    '📍 Tìm sân gần tôi nhất (Quận 7)',
    '💰 Sân cầu lông giá rẻ nhất',
    '🏓 Sân Pickleball tốt nhất',
    '⏰ Giờ trống tối nay từ 19:30',
    '🛡️ Cơ chế giữ chỗ và bảo chứng Escrow',
  ]

  // 1. Phân loại câu hỏi về khoảng cách / vị trí gần nhất
  if (
    query.includes('gần') ||
    query.includes('quận 7') ||
    query.includes('q7') ||
    query.includes('khu vực') ||
    query.includes('vị trí') ||
    query.includes('địa chỉ')
  ) {
    const isPickleball = query.includes('pickle') || query.includes('pickleball')
    const bestCourt = isPickleball
      ? COURTS.find((c) => c.id === 'pmh-pb')
      : COURTS.find((c) => c.id === 'snx-q7')
    const slots = buildSlotsForCourt(bestCourt)
    const availableSlot = slots.find((s) => s.id === 's5') || slots.find((s) => s.status === 'available')

    return {
      title: 'Gợi ý sân gần bạn nhất',
      text: `Dựa trên định vị của bạn tại **Nguyễn Thị Thập, Quận 7**, sân gần bạn nhất hiện tại là **${bestCourt.name}**:\n\n` +
        `• **Khoảng cách**: Chỉ cách bạn **${bestCourt.distance} km** (${bestCourt.route.eta}).\n` +
        `• **Địa chỉ**: ${bestCourt.address}.\n` +
        `• **Đặc điểm**: ${bestCourt.subCourt} (${bestCourt.subCourtDesc}). ${bestCourt.route.note}.\n` +
        `• **Khung giờ đẹp còn trống**: **${availableSlot.start} - ${availableSlot.end}** (Giá: **${formatVnd(availableSlot.price)}**).\n\n` +
        `Tôi đã ưu tiên lựa chọn sân này để bạn tiết kiệm thời gian di chuyển tối đa!`,
      recommendedCourt: bestCourt,
      recommendedSlot: availableSlot,
      priorityBadge: '⭐ LỰA CHỌN ƯU TIÊN SỐ 1 • GẦN BẠN NHẤT',
      priorityReason: `Chỉ cách vị trí hiện tại 0.8 km • Tiết kiệm 15-20 phút di chuyển • Sẵn sàng giữ chỗ ngay`,
      quickReplies: ['Chọn sân này ngay', 'Xem thêm sân Pickleball gần Q7', 'Khung giờ khác của sân này', 'Chỉ đường qua Google Maps'],
    }
  }

  // 2. Phân loại câu hỏi về giá rẻ / tiết kiệm chi phí
  if (
    query.includes('rẻ') ||
    query.includes('giá') ||
    query.includes('tiết kiệm') ||
    query.includes('sinh viên') ||
    query.includes('chi phí') ||
    query.includes('200k') ||
    query.includes('dưới 200')
  ) {
    const isPickle = query.includes('pickle') || query.includes('pickleball')
    const bestCourt = isPickle
      ? COURTS.find((c) => c.id === 'pmh-pb') // 180k
      : COURTS.find((c) => c.id === 'yonex-bt') // 160k
    const slots = buildSlotsForCourt(bestCourt)
    const cheapSlot = slots.find((s) => s.id === 's7' && s.status === 'available') || slots.find((s) => s.status === 'available')

    return {
      title: 'Gợi ý cụm sân giá tiết kiệm nhất',
      text: `Nếu bạn muốn tối ưu ngân sách, lựa chọn có mức giá tốt nhất trên hệ thống hiện tại là **${bestCourt.name}**:\n\n` +
        `• **Giá niêm yết**: Chỉ **${formatVnd(bestCourt.price)}/giờ** (Mức giá tốt nhất cho môn ${bestCourt.sportName}).\n` +
        `• **Khung giờ giảm giá đặc biệt**: Từ 21:00 - 22:00 (giảm 9%) và 22:00 - 23:00 (giảm 18%).\n` +
        `• **Cơ sở vật chất**: ${bestCourt.courtCount} sân rộng rãi, ${bestCourt.subCourtDesc}.\n` +
        `• **Đánh giá**: ${bestCourt.rating}★ từ hơn ${bestCourt.reviewsCount} người chơi.\n\n` +
        `Bạn cũng có thể chia đều chi phí cho nhóm bạn qua tính năng **Split Payment** chỉ từ 30.000 - 50.000 đ/người!`,
      recommendedCourt: bestCourt,
      recommendedSlot: cheapSlot,
      priorityBadge: '💰 LỰA CHỌN TIẾT KIỆM NHẤT • GIÁ TỐT NHẤT',
      priorityReason: `Giá chỉ từ ${formatVnd(bestCourt.price)}/h • Hỗ trợ giảm giá giờ muộn • Phù hợp sinh viên & đánh tập`,
      quickReplies: ['Chọn sân giá rẻ này', 'Xem khung giờ 19:30 - 21:00', 'So sánh với SportNexus Q7', 'Cách chia tiền Split Payment'],
    }
  }

  // 3. Phân loại câu hỏi về Pickleball
  if (
    query.includes('pickleball') ||
    query.includes('pickle') ||
    query.includes('d-dink') ||
    query.includes('dink')
  ) {
    const isPro = query.includes('pro') || query.includes('chuẩn') || query.includes('thủ đức') || query.includes('thảo điền') || query.includes('cao cấp')
    const bestCourt = isPro ? COURTS.find((c) => c.id === 'ddink-td') : COURTS.find((c) => c.id === 'pmh-pb')
    const slots = buildSlotsForCourt(bestCourt)
    const availableSlot = slots.find((s) => s.id === 's5') || slots.find((s) => s.status === 'available')

    return {
      title: 'Gợi ý sân Pickleball hàng đầu',
      text: `Hệ thống SportNexus hiện có 2 cụm sân Pickleball tiêu chuẩn cực kỳ sôi động:\n\n` +
        `1. **${bestCourt.name}** (${isPro ? 'Chuẩn USAPA Pro thi đấu đỉnh cao' : 'Gần Quận 7, giá tốt, có mái che'}):\n` +
        `   • Địa chỉ: ${bestCourt.address} (Cách ${bestCourt.distance} km).\n` +
        `   • Giá: **${formatVnd(bestCourt.price)}/h** • Đánh giá: **${bestCourt.rating}★**.\n` +
        `   • Khung giờ sẵn sàng: **${availableSlot.start} - ${availableSlot.end}** (${formatVnd(availableSlot.price)}).\n` +
        `2. Lựa chọn đối ứng: **${isPro ? 'Phú Mỹ Hưng Pickleball Club' : 'D-Dink Pickleball Hub Thảo Điền'}**.\n\n` +
        `Tất cả sân Pickleball đều áp dụng **Khóa giữ chỗ độc quyền 15 phút** chống trùng lịch 100%!`,
      recommendedCourt: bestCourt,
      recommendedSlot: availableSlot,
      priorityBadge: isPro ? '🏆 SÂN THI ĐẤU CHUẨN USAPA PRO' : '⭐ GỢI Ý PICKLEBALL ƯU TIÊN GẦN Q.7',
      priorityReason: isPro ? 'Mặt sân acrylic chuẩn quốc tế • Đèn LED cao cấp • Đánh giá 4.9★' : 'Khoảng cách gần 1.2km • Có mái che thời tiết • Giá hợp lý 180k/h',
      quickReplies: ['Chọn sân Pickleball này', 'Xem sân D-Dink Thảo Điền', 'Xem sân Phú Mỹ Hưng Q.7', 'Tìm bạn ghép kèo LFG Pickleball'],
    }
  }

  // 4. Phân loại câu hỏi về Cầu lông / Badminton
  if (
    query.includes('cầu lông') ||
    query.includes('badminton') ||
    query.includes('yonex') ||
    query.includes('đánh cầu')
  ) {
    const bestCourt = COURTS.find((c) => c.id === 'snx-q7')
    const slots = buildSlotsForCourt(bestCourt)
    const slot = slots.find((s) => s.id === 's5') || slots.find((s) => s.status === 'available')

    return {
      title: 'Gợi ý sân Cầu Lông chất lượng cao',
      text: `Đối với môn Cầu lông, lựa chọn ưu tiên hàng đầu được cộng đồng đánh giá cao nhất là **${bestCourt.name}**:\n\n` +
        `• **Mặt sân**: ${bestCourt.subCourt} (${bestCourt.subCourtDesc}). Đạt chuẩn thi đấu quốc tế BWF, bảo vệ tối đa khớp gối và cổ chân.\n` +
        `• **Vị trí**: 35 Huỳnh Tấn Phát, Quận 7 (chỉ cách bạn **0.8 km**, 3 phút đi xe).\n` +
        `• **Tiện ích**: Hệ thống đèn chống chói 1200 Lux, máy lạnh điều hòa 21°C, giữ xe miễn phí.\n` +
        `• **Khung giờ tối nay**: Đang trống slot đẹp **${slot.start} - ${slot.end}** (1.5h - ${formatVnd(slot.price)}).\n\n` +
        `Nếu muốn giá mềm hơn, bạn có thể tham khảo thêm **CLB Cầu Lông YONEX Bình Thạnh** (160k/h).`,
      recommendedCourt: bestCourt,
      recommendedSlot: slot,
      priorityBadge: '🏸 LỰA CHỌN CẦU LÔNG ĐẠT CHUẨN BWF PRO',
      priorityReason: 'Thảm Yonex chuẩn BWF • Gần nhất (0.8km) • Giờ đẹp 19:30 - 21:00 còn trống',
      quickReplies: ['Chọn sân Cầu lông Q7', 'Xem CLB Cầu lông Bình Thạnh', 'Kiểm tra slot 19:00 - 19:30', 'Đặt ngay & chia tiền'],
    }
  }

  // 5. Phân loại câu hỏi về thời gian / khung giờ trống / tối nay
  if (
    query.includes('giờ') ||
    query.includes('tối nay') ||
    query.includes('lịch') ||
    query.includes('slot') ||
    query.includes('trống') ||
    query.includes('19h') ||
    query.includes('20h') ||
    query.includes('hôm nay')
  ) {
    const court = currentCourt || COURTS[0]
    const slots = buildSlotsForCourt(court)
    const availableSlots = slots.filter((s) => s.status === 'available')

    return {
      title: `Lịch trống tối nay tại ${court.name}`,
      text: `Hiện tại cụm sân **${court.name}** đang có các khung giờ mở cho bạn đặt trực tuyến:\n\n` +
        availableSlots
          .map(
            (s) =>
              `• **${s.start} - ${s.end}** (${s.hours}h): **${formatVnd(s.price)}** — *${s.note || 'Sẵn sàng'}*`
          )
          .join('\n') +
        `\n\n📌 **Khung giờ gợi ý ưu tiên**: **19:30 - 21:00** (Khung 1.5 tiếng vàng, vừa đủ thời gian thi đấu trọn vẹn và không lo thiếu giờ).\n` +
        `Hệ thống sẽ **khóa giữ chỗ 15 phút** ngay khi bạn bấm chọn!`,
      recommendedCourt: court,
      recommendedSlot: slots.find((s) => s.id === 's5' && s.status === 'available') || availableSlots[0],
      priorityBadge: '⏰ KHUNG GIỜ VÀNG ƯU TIÊN: 19:30 - 21:00',
      priorityReason: 'Thời lượng 1.5 giờ lý tưởng • Khung giờ thể thao cao điểm • Sẵn sàng đặt',
      quickReplies: ['Khóa slot 19:30 - 21:00 ngay', 'Chọn slot 19:00 - 19:30', 'Xem lịch cụm sân khác', 'Chuyển sang thanh toán'],
    }
  }

  // 6. Phân loại câu hỏi về Giữ chỗ & Khóa bí quan (Pessimistic Lock) & Escrow
  if (
    query.includes('khóa') ||
    query.includes('giữ chỗ') ||
    query.includes('pessimistic') ||
    query.includes('trùng') ||
    query.includes('escrow') ||
    query.includes('bảo chứng') ||
    query.includes('an toàn') ||
    query.includes('hủy')
  ) {
    return {
      title: 'Cơ chế Khóa Giữ Chỗ & Bảo Chứng Escrow',
      text: `Hệ thống SportNexus áp dụng công nghệ độc quyền bảo vệ tối đa người chơi:\n\n` +
        `1. 🔒 **Khóa Giữ Chỗ Bí Quan (Pessimistic Locking 15 phút)**:\n` +
        `   • Ngay khi bạn click chọn một khung giờ còn trống, hệ thống sẽ tự động khóa cứng slot đó trong **15:00 phút**.\n` +
        `   • Không người chơi nào khác có thể đặt đè hoặc thanh toán trùng giờ.\n` +
        `   • Nếu quá 15 phút bạn chưa thanh toán, slot sẽ tự động nhả lại để đảm bảo công bằng.\n\n` +
        `2. 🛡️ **Bảo Chứng Ký Quỹ Escrow 24/7**:\n` +
        `   • Toàn bộ số tiền đặt cọc/thanh toán được lưu giữ an toàn tại tài khoản Escrow trung gian.\n` +
        `   • Tiền chỉ chuyển giao cho chủ sân sau khi bạn quét mã **QR Pass** check-in thành công tại sân.\n` +
        `   • Nếu sân có sự cố kỹ thuật hoặc hủy lịch, bạn được hoàn tiền 100% tự động ngay lập tức!`,
      recommendedCourt: COURTS[0],
      recommendedSlot: buildSlotsForCourt(COURTS[0]).find((s) => s.id === 's5'),
      priorityBadge: '🛡️ BẢO CHỨNG GIAO DỊCH AN TOÀN 100%',
      priorityReason: 'Khóa slot tức thì 15:00 phút • Không sợ bị cướp sân • Hoàn tiền nếu có sự cố',
      quickReplies: ['Tôi muốn đặt sân ngay', 'Tìm hiểu về Split Payment', 'Làm sao để nhận mã QR Pass?'],
    }
  }

  // 7. Phân loại câu hỏi về Chia tiền (Split Payment) & Thanh toán
  if (
    query.includes('chia tiền') ||
    query.includes('split') ||
    query.includes('thanh toán') ||
    query.includes('bạn bè') ||
    query.includes('qr') ||
    query.includes('tiền cọc')
  ) {
    return {
      title: 'Tính năng Chia Tiền Thông Minh (Split Payment)',
      text: `Không còn cảnh một người ứng tiền rồi phải đi đòi nợ từng thành viên! Với SportNexus Split Payment:\n\n` +
        `• **Chia đều tự động**: Hệ thống tự động chia đều tổng tiền sân cho 2, 4 hoặc nhiều người chơi.\n` +
        `• **Mã VietQR cá nhân hóa**: Tạo mã QR thanh toán riêng biệt cho từng bạn bè với đúng số tiền lẻ.\n` +
        `• **Theo dõi tiến độ realtime**: Bạn có thể theo dõi xem ai đã thanh toán, ai chưa ngay trên màn hình.\n` +
        `• **Hỗ trợ cọc linh hoạt**: Trưởng nhóm chỉ cần cọc trước hoặc chia link cho các bạn cùng góp cọc qua ví Escrow!`,
      recommendedCourt: COURTS[0],
      recommendedSlot: buildSlotsForCourt(COURTS[0]).find((s) => s.id === 's5'),
      priorityBadge: '⚡ TÍNH NĂNG SPLIT PAYMENT THÔNG MINH',
      priorityReason: 'Chia tiền tự động theo đầu người • Xuất mã VietQR nhanh • Không sợ quên đòi nợ',
      quickReplies: ['Trải nghiệm Split Payment', 'Chọn sân và tạo nhóm chia tiền', 'Quay lại xem sân trống'],
    }
  }

  // 8. Chào hỏi hoặc yêu cầu tư vấn tổng quan
  const topCourt = COURTS[0] // SportNexus Q7
  const slots = buildSlotsForCourt(topCourt)
  const topSlot = slots.find((s) => s.id === 's5')

  return {
    title: 'Gợi ý lựa chọn tối ưu từ SportNexus AI',
    text: `Chào bạn! Tôi đã phân tích toàn bộ dữ liệu sân bãi và lịch trống thời gian thực trên hệ thống:\n\n` +
      `Hiện tại khu vực TP.HCM đang có **4 cụm sân lớn** (Cầu Lông & Pickleball) sẵn sàng tiếp nhận đặt chỗ. Dựa trên vị trí của bạn tại **Quận 7**, đây là **2 lựa chọn ưu tiên sáng giá nhất** hôm nay:\n\n` +
      `🥇 **Lựa chọn 1 (Cầu Lông)**: **SportNexus Arena Q.7** (Cách 0.8 km)\n` +
      `   • Thảm thi đấu Yonex BWF chuẩn Olympic • Giá 220.000 đ/h • Trống slot vàng **19:30 - 21:00**.\n\n` +
      `🥈 **Lựa chọn 2 (Pickleball)**: **Phú Mỹ Hưng Pickleball Club** (Cách 1.2 km)\n` +
      `   • Sân ngoài trời có mái che • Giá chỉ 180.000 đ/h • Đánh giá 4.7★.\n\n` +
      `Bạn muốn tôi giúp bạn giữ chỗ cụm sân nào ngay bây giờ?`,
    recommendedCourt: topCourt,
    recommendedSlot: topSlot,
    priorityBadge: '⭐ LỰA CHỌN ƯU TIÊN SỐ 1 TOÀN DIỆN',
    priorityReason: 'Chỉ cách 0.8 km • Đạt chuẩn Yonex BWF • Đang mở slot vàng 19:30 - 21:00',
    quickReplies: defaultQuickReplies,
  }
}
