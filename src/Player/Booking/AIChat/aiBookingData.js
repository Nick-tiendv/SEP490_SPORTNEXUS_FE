// aiBookingData.js — Cơ sở dữ liệu và bộ xử lý trả lời thông minh của Trợ lý AI SportNexus
// Thiết kế tối ưu: Trả lời chính xác, đầy đủ trọng tâm, không dư thừa, hỗ trợ chọn & đặt sân siêu tốc

export const DISTRICTS = [
  { key: 'all', label: 'Tất cả khu vực TP.HCM' },
  { key: 'q7', label: 'Quận 7' },
  { key: 'thuduc', label: 'TP. Thủ Đức' },
  { key: 'q10', label: 'Quận 10' },
  { key: 'tanbinh', label: 'Tân Bình' },
  { key: 'binhthanh', label: 'Bình Thạnh' },
  { key: 'phunhuan', label: 'Phú Nhuận' },
  { key: 'q1', label: 'Quận 1' },
  { key: 'q3', label: 'Quận 3' },
  { key: 'quan8', label: 'Quận 8' },
  { key: 'govap', label: 'Gò Vấp' },
  { key: 'tanphu', label: 'Tân Phú' },
  { key: 'q5', label: 'Quận 5' },
  { key: 'binhtan', label: 'Bình Tân' },
]

export const DISTRICT_CENTERS = {
  q7: { name: 'Quận 7', address: 'Nguyễn Thị Thập, P. Tân Quy, Quận 7', lat: 10.734, lng: 106.7215 },
  thuduc: { name: 'TP. Thủ Đức', address: 'Lê Văn Việt, P. Tăng Nhơn Phú, TP. Thủ Đức', lat: 10.849, lng: 106.7537 },
  q10: { name: 'Quận 10', address: 'Cách Mạng Tháng 8, P. 12, Quận 10', lat: 10.7715, lng: 106.6672 },
  tanbinh: { name: 'Tân Bình', address: 'Hoàng Hoa Thám, P. 12, Tân Bình', lat: 10.8015, lng: 106.6534 },
  binhthanh: { name: 'Bình Thạnh', address: 'Điện Biên Phủ, P. 15, Bình Thạnh', lat: 10.8105, lng: 106.6975 },
  phunhuan: { name: 'Phú Nhuận', address: 'Hoa Phượng, P. 2, Phú Nhuận', lat: 10.7992, lng: 106.6803 },
  q1: { name: 'Quận 1', address: 'Huyền Trân Công Chúa, P. Bến Thành, Quận 1', lat: 10.7756, lng: 106.7004 },
  q3: { name: 'Quận 3', address: 'Hồ Xuân Hương, P. Võ Thị Sáu, Quận 3', lat: 10.7788, lng: 106.6852 },
  quan8: { name: 'Quận 8', address: 'Phạm Hùng, P. 4, Quận 8', lat: 10.7242, lng: 106.6286 },
  govap: { name: 'Gò Vấp', address: 'Quang Trung, P. 11, Gò Vấp', lat: 10.8388, lng: 106.6653 },
  tanphu: { name: 'Tân Phú', address: 'Celadon City, P. Sơn Kỳ, Tân Phú', lat: 10.7901, lng: 106.6281 },
  q5: { name: 'Quận 5', address: 'Nguyễn Trãi, P. 11, Quận 5', lat: 10.7538, lng: 106.6621 },
  binhtan: { name: 'Bình Tân', address: 'Lê Trọng Tấn, P. Bình Hưng Hòa, Bình Tân', lat: 10.7825, lng: 106.6085 },
}

export const COURTS = [
  // ========== QUẬN 7 ==========
  {
    id: 'snx-q7',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'SportNexus Arena Q.7',
    address: '35 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7',
    district: 'q7',
    districtName: 'Quận 7',
    lat: 10.7485,
    lng: 106.7265,
    rating: 4.9,
    reviewsCount: 342,
    price: 220000,
    courtCount: 5,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX BWF 01',
    subCourtDesc: 'Thảm Yonex Tiêu Chuẩn Quốc Tế BWF',
    highlights: ['Thảm Yonex BWF chống chấn thương', 'Máy lạnh 21°C', 'Đèn LED 1200 Lux chống chói', 'Bãi đỗ ô tô & xe máy miễn phí'],
    amenities: { parking: 'Ô tô & xe máy miễn phí', ac: 'Máy lạnh 21°C', proFloor: 'Thảm Yonex BWF', showers: true, lighting: 'LED 1200 Lux chống chói' },
    route: { eta: '3 phút di chuyển qua Huỳnh Tấn Phát', note: 'Tuyến đường rộng thoáng • Bãi đỗ xe an toàn' },
    overrides: {},
  },
  {
    id: 'pmh-pb',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'Phú Mỹ Hưng Pickleball Club',
    address: '12 Nguyễn Lương Bằng, P. Tân Phú, Quận 7',
    district: 'q7',
    districtName: 'Quận 7',
    lat: 10.7295,
    lng: 106.7218,
    rating: 4.7,
    reviewsCount: 195,
    price: 180000,
    courtCount: 5,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball PMH 01',
    subCourtDesc: 'Sân ngoài trời có mái che cao cấp',
    highlights: ['Mặt sân acrylic chuẩn USAPA', 'Có mái che không lo nắng mưa', 'Bãi đỗ xe hơi thoải mái', 'Giá tốt nhất Q.7 chỉ 180k/h'],
    amenities: { parking: 'Bãi đỗ ô tô rộng', ac: 'Quạt trần & Mái che thoáng mát', proFloor: 'Mặt sân Acrylic chuẩn USAPA', showers: true, lighting: 'Đèn LED ban đêm' },
    route: { eta: '5 phút di chuyển qua Nguyễn Lương Bằng', note: 'Đường lớn nội khu Phú Mỹ Hưng' },
    overrides: { s2: 'available', s7: 'booked' },
  },
  {
    id: 'trexanh-q7',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'CLB Cầu Lông Tre Xanh Quận 7',
    address: '50/1 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7',
    district: 'q7',
    districtName: 'Quận 7',
    lat: 10.7412,
    lng: 106.7289,
    rating: 4.8,
    reviewsCount: 210,
    price: 180000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=400&h=300&fit=crop',
    subCourt: 'Sân Tre Xanh BWF 01',
    subCourtDesc: 'Thảm Yonex xanh cao cấp',
    highlights: ['Giá mềm chỉ 180k/h', 'Thảm Yonex xanh êm chân', 'Trần cao 10m', 'Giữ xe máy & ô tô thuận tiện'],
    amenities: { parking: 'Giữ xe có bảo vệ', ac: 'Quạt thông gió công nghiệp', proFloor: 'Thảm Yonex BWF', showers: true, lighting: 'Đèn chống chói' },
    route: { eta: '4 phút di chuyển', note: 'Gần khu chế xuất Tân Thuận' },
    overrides: {},
  },
  {
    id: 'longvien-q7',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông Long Viên Quận 7',
    address: '414/29 Nguyễn Thị Thập, P. Tân Quy, Quận 7',
    district: 'q7',
    districtName: 'Quận 7',
    lat: 10.7381,
    lng: 106.7085,
    rating: 4.8,
    reviewsCount: 180,
    price: 170000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&h=300&fit=crop',
    subCourt: 'Sân Long Viên 03',
    subCourtDesc: 'Sân rộng rãi trục Nguyễn Thị Thập',
    highlights: ['Nằm ngay trục Nguyễn Thị Thập trung tâm', 'Giá tốt 170k/h', '8 sân thảm rộng rãi', 'Bãi giữ xe hơi'],
    amenities: { parking: 'Bãi đỗ ô tô & xe máy', ac: 'Hệ thống quạt gió mát', proFloor: 'Thảm PU cao cấp', showers: true, lighting: 'Đèn LED 1000 Lux' },
    route: { eta: '2 phút di chuyển', note: 'Mặt tiền hẻm lớn Nguyễn Thị Thập' },
    overrides: {},
  },

  // ========== QUẬN 10 ==========
  {
    id: 'lananh-q10',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'CLB Thể Thao Lan Anh Quận 10',
    address: '291 Cách Mạng Tháng 8, P. 12, Quận 10',
    district: 'q10',
    districtName: 'Quận 10',
    lat: 10.7766,
    lng: 106.6775,
    rating: 4.9,
    reviewsCount: 380,
    price: 230000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
    subCourt: 'Sân Lan Anh VIP 01',
    subCourtDesc: 'Khu liên hợp thể thao danh tiếng, bãi giữ ô tô rộng',
    highlights: ['Khuôn viên VIP trung tâm', 'Bãi đỗ ô tô & xe máy cực rộng', 'Phòng thay đồ máy lạnh', 'Sàn gỗ lót thảm thi đấu BWF'],
    amenities: { parking: 'Bãi đỗ ô tô & xe máy có an ninh', ac: 'Phòng thay đồ & Sảnh máy lạnh', proFloor: 'Sàn gỗ lót thảm BWF', showers: true, lighting: 'Đèn thi đấu chuẩn' },
    route: { eta: '12 phút di chuyển', note: 'Gần vòng xoay Dân Chủ' },
    overrides: {},
  },
  {
    id: 'kyhoa-q10',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'Kỳ Hòa Pickleball & Sport Club',
    address: '238 Ba Tháng Hai, P. 12, Quận 10',
    district: 'q10',
    districtName: 'Quận 10',
    lat: 10.772,
    lng: 106.671,
    rating: 4.8,
    reviewsCount: 220,
    price: 240000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball Kỳ Hòa 02',
    subCourtDesc: 'Mặt sân chuẩn giải đấu USAPA quốc tế',
    highlights: ['Mặt sân chuẩn giải đấu USAPA', 'Khán đài có mái che thoáng mát', 'Bãi giữ ô tô rộng', 'Căng tin và dịch vụ vợt đầy đủ'],
    amenities: { parking: 'Bãi đỗ ô tô rộng', ac: 'Khán đài có mái che', proFloor: 'Mặt sân Acrylic chuẩn USAPA', showers: true, lighting: 'Hệ thống đèn LED ban đêm' },
    route: { eta: '11 phút di chuyển', note: 'Trong khuôn viên trung tâm Kỳ Hòa' },
    overrides: {},
  },
  {
    id: 'bachai-q10',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông C30 Bắc Hải Quận 10',
    address: 'C30 Thành Thái, P. 14, Quận 10',
    district: 'q10',
    districtName: 'Quận 10',
    lat: 10.7735,
    lng: 106.6592,
    rating: 4.8,
    reviewsCount: 260,
    price: 170000,
    courtCount: 10,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=400&h=300&fit=crop',
    subCourt: 'Sân C30 Bắc Hải 04',
    subCourtDesc: 'Trần cao 10m, thảm thi đấu chuẩn BWF êm ái',
    highlights: ['Trần cao 10m chuẩn BWF', '10 sân thảm rộng rãi', 'Giá tiết kiệm 170k/h', 'Có căng tin & thuê vợt'],
    amenities: { parking: 'Bãi giữ xe máy & ô tô', ac: 'Quạt trần công suất lớn', proFloor: 'Thảm BWF êm ái', showers: true, lighting: 'Đèn chống chói' },
    route: { eta: '14 phút di chuyển', note: 'Khu cư xá Bắc Hải - Thành Thái' },
    overrides: {},
  },

  // ========== TP. THỦ ĐỨC ==========
  {
    id: 'ddink-td',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'D-Dink Pickleball Hub Thảo Điền',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    lat: 10.8065,
    lng: 106.7381,
    rating: 4.9,
    reviewsCount: 410,
    price: 250000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=400&h=300&fit=crop',
    subCourt: 'Sân Pickleball Pro USAPA 02',
    subCourtDesc: 'Mặt sân acrylic chuẩn USAPA Pro Quốc Tế',
    highlights: ['Mặt sân acrylic thi đấu chuẩn USAPA Pro', 'Bãi đỗ ô tô rộng', 'Clubhouse phong cách hiện đại', 'Cộng đồng giao lưu sôi nổi'],
    amenities: { parking: 'Bãi đỗ ô tô rộng rãi', ac: 'Clubhouse có máy lạnh', proFloor: 'Acrylic USAPA Pro', showers: true, lighting: 'Đèn LED Pro Tour' },
    route: { eta: '18 phút di chuyển qua Cầu Thủ Thiêm 2', note: 'Khu Thảo Điền cao cấp' },
    overrides: { s1: 'available', s4: 'held' },
  },
  {
    id: 'sala-td',
    sport: 'pickleball',
    sportName: 'Pickleball',
    name: 'Sân Pickleball Sala Thủ Thiêm',
    address: 'Khu Đô Thị Sala, Mai Chí Thọ, P. An Lợi Đông, TP. Thủ Đức',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    lat: 10.7685,
    lng: 106.7214,
    rating: 4.9,
    reviewsCount: 290,
    price: 260000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=400&h=300&fit=crop',
    subCourt: 'Sân Sala Outdoor 01',
    subCourtDesc: 'Sân chuẩn thi đấu quốc tế, khuôn viên công viên Sala',
    highlights: ['Sân chuẩn thi đấu quốc tế', 'Khung cảnh công viên Sala thoáng đãng', 'Đỗ ô tô thoải mái', 'Hệ thống đèn LED cao cấp'],
    amenities: { parking: 'Hầm & bãi đỗ ô tô Sala', ac: 'Gió công viên thoáng mát', proFloor: 'Mặt sân USAPA quốc tế', showers: true, lighting: 'Đèn LED cao cấp' },
    route: { eta: '10 phút di chuyển qua Cầu Ba Son', note: 'Trục đại lộ Mai Chí Thọ' },
    overrides: {},
  },
  {
    id: 'huean-td',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông Huệ An Thủ Đức',
    address: '137 Đình Phong Phú, P. Tăng Nhơn Phú B, TP. Thủ Đức',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    lat: 10.8465,
    lng: 106.777,
    rating: 4.8,
    reviewsCount: 310,
    price: 140000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
    subCourt: 'Sân Huệ An 01',
    subCourtDesc: 'Thảm tiêu chuẩn thi đấu, giá rẻ nhất khu vực',
    highlights: ['Giá rẻ nhất hệ thống chỉ 140k/h', '8 sân thảm thi đấu rộng', 'Bãi giữ xe máy & ô tô an toàn', 'Phù hợp sinh viên & đánh nhóm'],
    amenities: { parking: 'Bãi giữ xe rộng an toàn', ac: 'Quạt thông gió trần cao', proFloor: 'Thảm thi đấu', showers: true, lighting: 'Đèn LED đầy đủ' },
    route: { eta: '20 phút di chuyển', note: 'Gần ngã tư Đình Phong Phú' },
    overrides: {},
  },
  {
    id: 'hiepphu-td',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông Hiệp Phú Thủ Đức',
    address: '50 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức',
    district: 'thuduc',
    districtName: 'TP. Thủ Đức',
    lat: 10.8492,
    lng: 106.7785,
    rating: 4.8,
    reviewsCount: 195,
    price: 150000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&h=300&fit=crop',
    subCourt: 'Sân Hiệp Phú BWF 02',
    subCourtDesc: 'Thảm tiêu chuẩn thi đấu, gần ngã tư Thủ Đức',
    highlights: ['Gần ngã tư Thủ Đức và Vincom', 'Giá chỉ 150k/h', 'Thảm thi đấu mới nâng cấp', 'Bãi xe rộng'],
    amenities: { parking: 'Bãi giữ xe thuận tiện', ac: 'Quạt trần công nghiệp', proFloor: 'Thảm BWF thi đấu', showers: true, lighting: 'Đèn LED' },
    route: { eta: '20 phút di chuyển', note: 'Trục chính Lê Văn Việt' },
    overrides: {},
  },

  // ========== TÂN BÌNH ==========
  {
    id: 'viettel-tb',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông Viettel Hoàng Hoa Thám',
    address: '158 Hoàng Hoa Thám, P. 12, Tân Bình',
    district: 'tanbinh',
    districtName: 'Tân Bình',
    lat: 10.8013,
    lng: 106.6493,
    rating: 4.8,
    reviewsCount: 420,
    price: 170000,
    courtCount: 12,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=400&h=300&fit=crop',
    subCourt: 'Sân Viettel Pro 06',
    subCourtDesc: 'Trần cao 11m, 12 sân thảm thi đấu chuẩn BWF',
    highlights: ['Quy mô khủng 12 sân BWF', 'Trần cao 11m chống ngộp', 'Bãi đỗ ô tô & xe máy cực rộng', 'Giá mềm 170k/h'],
    amenities: { parking: 'Bãi xe ô tô & xe máy cực lớn', ac: 'Hệ thống quạt trần cao thoáng', proFloor: 'Thảm thi đấu BWF', showers: true, lighting: 'Đèn chống chói 1200 Lux' },
    route: { eta: '18 phút di chuyển', note: 'Gần chợ Hoàng Hoa Thám' },
    overrides: {},
  },

  // ========== BÌNH THẠNH ==========
  {
    id: 'yonex-bt',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'CLB Cầu Lông YONEX Bình Thạnh',
    address: '128 Điện Biên Phủ, P. 15, Q. Bình Thạnh',
    district: 'binhthanh',
    districtName: 'Bình Thạnh',
    lat: 10.8105,
    lng: 106.6975,
    rating: 4.8,
    reviewsCount: 280,
    price: 160000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=400&h=300&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX 03',
    subCourtDesc: 'Sàn gỗ phủ thảm PU chống trơn trượt',
    highlights: ['Giá tiết kiệm chỉ 160k/h', '8 sân rộng rãi', 'Căng tin & cho thuê vợt', 'Giữ xe máy có bảo vệ'],
    amenities: { parking: 'Bãi giữ xe máy có bảo vệ', ac: 'Quạt thông gió mát mẻ', proFloor: 'Sàn gỗ lót thảm PU', showers: true, lighting: 'Đèn LED chống chói' },
    route: { eta: '14 phút di chuyển qua Nguyễn Hữu Cảnh', note: 'Trục Điện Biên Phủ cửa ngõ trung tâm' },
    overrides: { s3: 'available', s6: 'booked' },
  },

  // ========== PHÚ NHUẬN ==========
  {
    id: 'rachmieu-pn',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Trung Tâm Thể Thao Rạch Miễu Phú Nhuận',
    address: '1 Hoa Phượng, P. 2, Phú Nhuận',
    district: 'phunhuan',
    districtName: 'Phú Nhuận',
    lat: 10.7968,
    lng: 106.6885,
    rating: 4.8,
    reviewsCount: 350,
    price: 190000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
    subCourt: 'Sân Rạch Miễu BWF 05',
    subCourtDesc: 'Thảm Yonex xanh cao cấp, vị trí trung tâm Phú Nhuận',
    highlights: ['Vị trí đắc địa bờ kè Phan Xích Long', 'Thảm Yonex xanh chuẩn thi đấu', 'Bãi đỗ ô tô & xe máy', 'Khuôn viên TDTT quy mô lớn'],
    amenities: { parking: 'Bãi xe ô tô & xe máy Rạch Miễu', ac: 'Hệ thống thông gió nhà thi đấu', proFloor: 'Thảm Yonex BWF cao cấp', showers: true, lighting: 'Đèn chuẩn giải đấu' },
    route: { eta: '16 phút di chuyển', note: 'Khu ẩm thực Phan Xích Long' },
    overrides: {},
  },

  // ========== QUẬN 1 ==========
  {
    id: 'taodan-q1',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'CLB Cầu Lông Tao Đàn Quận 1',
    address: '1 Huyền Trân Công Chúa, P. Bến Thành, Quận 1',
    district: 'q1',
    districtName: 'Quận 1',
    lat: 10.7735,
    lng: 106.6917,
    rating: 4.9,
    reviewsCount: 390,
    price: 210000,
    courtCount: 10,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=400&h=300&fit=crop',
    subCourt: 'Sân Tao Đàn VIP 04',
    subCourtDesc: 'Thảm sàn Victor thi đấu, công viên xanh trung tâm',
    highlights: ['Trung tâm Quận 1 ngay công viên Tao Đàn', '10 sân thảm Victor cao cấp', 'Không gian xanh trong lành', 'Đỗ xe ô tô & xe máy thuận tiện'],
    amenities: { parking: 'Bãi đỗ ô tô & xe máy công viên Tao Đàn', ac: 'Quạt thông gió mát mẻ', proFloor: 'Thảm Victor thi đấu', showers: true, lighting: 'Đèn LED 1200 Lux' },
    route: { eta: '13 phút di chuyển', note: 'Gần chợ Bến Thành' },
    overrides: {},
  },

  // ========== QUẬN 8 ==========
  {
    id: 'bongsao-q8',
    sport: 'badminton',
    sportName: 'Cầu lông',
    name: 'Sân Cầu Lông Bông Sao Quận 8',
    address: 'Bông Sao, P. 5, Quận 8',
    district: 'quan8',
    districtName: 'Quận 8',
    lat: 10.7321,
    lng: 106.6675,
    rating: 4.7,
    reviewsCount: 160,
    price: 140000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=400&h=300&fit=crop',
    subCourt: 'Sân Bông Sao 01',
    subCourtDesc: 'Giá bình dân thân thiện chỉ 140k/h',
    highlights: ['Giá rẻ nhất chỉ 140.000 đ/h', 'Giờ giấc linh hoạt', 'Gửi xe tiện lợi', 'Thảm mới nâng cấp'],
    amenities: { parking: 'Bãi xe máy rộng', ac: 'Quạt mát', proFloor: 'Thảm PU', showers: true, lighting: 'Đèn LED' },
    route: { eta: '12 phút di chuyển', note: 'Trục Tạ Quang Bửu - Bông Sao' },
    overrides: {},
  },
]

export const SLOT_TEMPLATE = [
  // Khung giờ sáng (06:00 - 12:00)
  { id: 's_m1', start: '06:00', end: '08:00', hours: 2, factor: 0.85, status: 'available', note: 'Sáng sớm trong lành' },
  { id: 's_m2', start: '08:00', end: '10:00', hours: 2, factor: 0.9, status: 'available', note: 'Khung giờ sáng mát mẻ' },
  { id: 's_m3', start: '10:00', end: '12:00', hours: 2, factor: 0.85, status: 'available', note: 'Khung trưa vắng người' },

  // Khung giờ chiều (12:00 - 17:00)
  { id: 's_a0', start: '12:00', end: '14:00', hours: 2, factor: 0.85, status: 'available', note: 'Đầu giờ chiều yên tĩnh' },
  { id: 's_a1', start: '14:00', end: '16:00', hours: 2, factor: 0.95, status: 'available', note: 'Khung giờ chiều mát mẻ' },
  { id: 's1', start: '16:00', end: '17:00', hours: 1, factor: 1, status: 'booked', note: 'Đã kín lịch' },

  // Khung giờ tối & đêm (17:00 - 23:00)
  { id: 's2', start: '17:00', end: '18:00', hours: 1, factor: 1, status: 'booked', note: 'FC Sài Gòn Đặt' },
  { id: 's3', start: '18:00', end: '19:00', hours: 1, factor: 1, status: 'held', note: 'Đang giữ chỗ 15p' },
  { id: 's4', start: '19:00', end: '19:30', hours: 0.5, factor: 1, status: 'available', note: 'Khung 30p khởi động' },
  { id: 's5', start: '19:30', end: '21:00', hours: 1.5, factor: 1, status: 'available', note: 'Khung giờ vàng tối lý tưởng' },
  { id: 's6', start: '21:00', end: '22:00', hours: 1, factor: 0.91, status: 'available', note: 'Giảm 9% giờ đêm' },
  { id: 's7', start: '22:00', end: '23:00', hours: 1, factor: 0.82, status: 'available', note: 'Giảm 18% giờ muộn' },
]

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`
export const roundTo10k = (n) => Math.round(n / 10000) * 10000

// Phân tích câu hỏi người dùng để nhận diện yêu cầu về khung giờ (cụ thể hoặc theo buổi)
export function parseTimeRequirement(query) {
  if (!query) return null
  const q = query.toLowerCase()

  // 1. Khoảng giờ cụ thể (vd: "14:00 - 16:00", "14h - 16h", "14-16h", "14h đến 16h", "từ 14:00 đến 16:00")
  const rangeMatch = q.match(/(\d{1,2})(?:[:h](\d{2}))?\s*(?:h)?\s*(?:-|đến|tới)\s*(\d{1,2})(?:[:h](\d{2}))?\s*(?:h)?/)
  if (rangeMatch) {
    const startHour = parseInt(rangeMatch[1], 10)
    const endHour = parseInt(rangeMatch[3], 10)
    const startMin = rangeMatch[2] || '00'
    const endMin = rangeMatch[4] || '00'
    const startStr = `${String(startHour).padStart(2, '0')}:${startMin}`
    const endStr = `${String(endHour).padStart(2, '0')}:${endMin}`
    return {
      type: 'range',
      startHour,
      endHour,
      label: `${startStr} - ${endStr}`,
      isAfternoon: startHour >= 12 && startHour < 18,
      isMorning: startHour < 12,
      isEvening: startHour >= 18,
    }
  }

  // 2. Giờ cụ thể đơn lẻ (vd: "14:00", "14h", "2h chiều", "15:00", "16h")
  const singleHourMatch = q.match(/(\d{1,2})(?:[:](\d{2})|\s*h(?:(\d{2}))?)/)
  if (singleHourMatch) {
    let hour = parseInt(singleHourMatch[1], 10)
    if (q.includes('chiều') && hour < 12) hour += 12
    if (q.includes('tối') && hour < 12 && hour <= 11) hour += 12
    return {
      type: 'hour',
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      isAfternoon: hour >= 12 && hour < 18,
      isMorning: hour < 12,
      isEvening: hour >= 18,
    }
  }

  // 3. Theo buổi trong ngày
  if (q.includes('chiều') || q.includes('buổi chiều') || q.includes('chiều nay') || q.includes('chiều mai')) {
    return { type: 'period', period: 'afternoon', label: 'buổi chiều (13:30 - 17:00)', startHour: 13, endHour: 17, isAfternoon: true }
  }
  if (q.includes('sáng') || q.includes('buổi sáng') || q.includes('sáng sớm')) {
    return { type: 'period', period: 'morning', label: 'buổi sáng (06:00 - 12:00)', startHour: 6, endHour: 12, isMorning: true }
  }
  if (q.includes('trưa') || q.includes('buổi trưa')) {
    return { type: 'period', period: 'noon', label: 'buổi trưa (11:30 - 14:00)', startHour: 11, endHour: 14, isNoon: true }
  }
  if (q.includes('tối') || q.includes('buổi tối') || q.includes('tối nay') || q.includes('tối mai') || q.includes('đêm')) {
    return { type: 'period', period: 'evening', label: 'buổi tối (17:30 - 23:00)', startHour: 17, endHour: 23, isEvening: true }
  }

  return null
}

// Tìm ca sân khớp tối ưu với yêu cầu thời gian của người chơi
export function findBestMatchingSlot(slots, timeReq) {
  if (!slots || slots.length === 0) return null

  if (!timeReq) {
    return slots.find((s) => s.id === 's5' && s.status === 'available') || slots.find((s) => s.status === 'available') || slots[0]
  }

  const getH = (tStr) => {
    if (!tStr) return 0
    return parseInt(tStr.split(':')[0], 10)
  }

  let candidates = []

  if (timeReq.type === 'range') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      const eH = getH(s.end)
      return (sH >= timeReq.startHour && sH < timeReq.endHour) ||
             (eH > timeReq.startHour && eH <= timeReq.endHour) ||
             (sH <= timeReq.startHour && eH >= timeReq.endHour)
    })
  } else if (timeReq.type === 'hour') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      const eH = getH(s.end)
      return (timeReq.hour >= sH && timeReq.hour < eH) || Math.abs(sH - timeReq.hour) <= 1
    })
  } else if (timeReq.type === 'period') {
    candidates = slots.filter((s) => {
      const sH = getH(s.start)
      return sH >= timeReq.startHour && sH < timeReq.endHour
    })
  }

  const availableMatch = candidates.find((s) => s.status === 'available')
  if (availableMatch) return availableMatch
  if (candidates.length > 0) return candidates[0]

  return slots.find((s) => s.status === 'available') || slots[0]
}

// Công thức Haversine tính khoảng cách chuẩn theo tọa độ GPS (km)
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(0.3, Math.round(R * c * 10) / 10)
}

// Tính khoảng cách từ sân đến vị trí người chơi
export function calculateCourtDistance(court, userLocation) {
  if (!court) return 1.5
  if (userLocation?.lat != null && userLocation?.lng != null && court.lat != null && court.lng != null) {
    const dist = haversineDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)
    if (dist != null) return dist
  }
  return 1.8
}

// Nhận diện quận gần nhất từ GPS
export function detectClosestDistrict(lat, lng) {
  if (lat == null || lng == null) return DISTRICT_CENTERS.q7
  let closest = DISTRICT_CENTERS.q7
  let minDist = Infinity
  for (const key of Object.keys(DISTRICT_CENTERS)) {
    const item = DISTRICT_CENTERS[key]
    const d = haversineDistance(lat, lng, item.lat, item.lng) || 999
    if (d < minDist) {
      minDist = d
      closest = item
    }
  }
  return closest
}

// Xây dựng danh sách slot thời gian cho sân
export function buildSlotsForCourt(court) {
  if (!court) return []
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides?.[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : status === 'held' ? 'Đang giữ chỗ 15p' : t.note,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}

// Tạo thông điệp chào mừng đồng bộ theo vị trí mới của người chơi
export function buildWelcomeMessage(userLocation) {
  const loc = userLocation || DISTRICT_CENTERS.q7
  const addressName = loc.address || loc.name || 'Quận 7, TP.HCM'
  const nowTime = loc.updatedAt || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  // Tìm sân gần vị trí mới nhất
  const courtsWithDist = COURTS.map((c) => ({
    ...c,
    distance: calculateCourtDistance(c, loc),
  })).sort((a, b) => a.distance - b.distance)

  const topCourt = courtsWithDist[0] || COURTS[0]
  const slots = buildSlotsForCourt(topCourt)
  const goldenSlot = slots.find((s) => s.id === 's5' && s.status === 'available') || slots.find((s) => s.status === 'available') || slots[0]

  return {
    id: `welcome-${Date.now()}`,
    sender: 'bot',
    time: nowTime,
    text:
      `Xin chào! Tôi là **SportNexus AI Concierge** — trợ lý đặt sân thể thao thời gian thực.\n\n` +
      `📍 **Vị trí hiện tại của bạn**: **${addressName}** *(Cập nhật lúc ${nowTime})*.\n\n` +
      `• **Sân gần nhất**: **${topCourt.name}** (Chỉ cách **${topCourt.distance} km** • ${topCourt.sportName}).\n` +
      `• **Khung giờ vàng sẵn sàng**: **${goldenSlot.start} - ${goldenSlot.end}** (Giá: **${formatVnd(goldenSlot.price)}**).\n` +
      `• **Chính sách**: Khóa slot độc quyền **15 phút** chống trùng lịch & Bảo chứng ký quỹ Escrow 24/7 an toàn 100%.\n\n` +
      `Bạn có thể nhập câu hỏi hoặc bấm **Micro** để nói yêu cầu (ví dụ: *"tìm sân pickleball gần đây"*, *"sân cầu lông nào dưới 180k"*, *"đặt sân lúc 19h30"*).`,
    recommendedCourt: topCourt,
    recommendedSlot: goldenSlot,
    priorityBadge: `📍 GẦN BẠN NHẤT HIỆN TẠI (${topCourt.distance} KM)`,
    priorityReason: `Khoảng cách tối ưu từ vị trí ${loc.name || addressName} • Khung giờ đẹp sẵn sàng`,
    quickReplies: [
      `Đặt nhanh ${topCourt.name}`,
      '💰 Sân cầu lông giá rẻ nhất',
      '🏓 Sân Pickleball tốt nhất',
      '⏰ Khung giờ trống tối nay',
      '🛡️ Cơ chế giữ chỗ 15p & Escrow',
    ],
  }
}

export const DISTRICT_MATCHERS = [
  { key: 'q10', name: 'Quận 10', terms: ['quận 10', 'q10', 'q.10', 'thành thái', 'bắc hải', 'cách mạng tháng 8'] },
  { key: 'thuduc', name: 'TP. Thủ Đức', terms: ['thủ đức', 'thu duc', 'tp thủ đức', 'thảo điền', 'tăng nhơn phú', 'lê văn việt', 'đình phong phú'] },
  { key: 'tanbinh', name: 'Tân Bình', terms: ['tân bình', 'tan binh', 'hoàng hoa thám', 'sân bay', 'bạch đằng'] },
  { key: 'q7', name: 'Quận 7', terms: ['quận 7', 'q7', 'q.7', 'tân thuận', 'tân quy', 'phú mỹ hưng', 'nguyễn thị thập', 'huỳnh tấn phát'] },
  { key: 'binhthanh', name: 'Bình Thạnh', terms: ['bình thạnh', 'binh thanh', 'điện biên phủ', 'nguyễn hữu cảnh'] },
  { key: 'phunhuan', name: 'Phú Nhuận', terms: ['phú nhuận', 'phu nhuan', 'phan xích long', 'hoa phượng'] },
  { key: 'q1', name: 'Quận 1', terms: ['quận 1', 'q1', 'q.1', 'bến thành', 'tao đàn', 'huyền trân công chúa'] },
  { key: 'quan8', name: 'Quận 8', terms: ['quận 8', 'q8', 'q.8', 'phạm hùng', 'bông sao'] },
  { key: 'q3', name: 'Quận 3', terms: ['quận 3', 'q3', 'q.3', 'hồ xuân hương'] },
]

// =========================================================================
// BỘ PHÂN TÍCH VÀ TRẢ LỜI CÂU HỎI CHÍNH XÁC, ĐẦY ĐỦ, KHÔNG TRÙNG LẶP
// =========================================================================
export function processAIChatQuery(rawQuery, currentCourtId = 'snx-q7', userLocation = null) {
  const query = (rawQuery || '').trim().toLowerCase()
  const loc = userLocation || DISTRICT_CENTERS.q7
  const currentCourt = COURTS.find((c) => c.id === currentCourtId) || COURTS[0]

  // Nhận diện yêu cầu về khung giờ (vd: 14:00 - 16:00, chiều, sáng, tối...)
  const timeReq = parseTimeRequirement(query)

  // Gắn khoảng cách động tính theo vị trí hiện tại của người chơi
  const localizedCourts = COURTS.map((c) => ({
    ...c,
    distance: calculateCourtDistance(c, loc),
  }))

  // -------------------------------------------------------------------------
  // 1. KIỂM TRA TÊN SÂN CỤ THỂ (CHỈ MATCH TÊN RIÊNG ĐẶC TRƯNG, TUYỆT ĐỐI KHÔNG MATCH CHỮ CHUNG)
  // -------------------------------------------------------------------------
  const SPECIFIC_COURT_MAP = [
    { id: 'lananh-q10', keywords: ['lan anh'] },
    { id: 'kyhoa-q10', keywords: ['kỳ hòa', 'ky hoa'] },
    { id: 'ddink-td', keywords: ['d-dink', 'ddink', 'dink'] },
    { id: 'sala-td', keywords: ['sala', 'thủ thiêm', 'thu thiem'] },
    { id: 'huean-td', keywords: ['huệ an', 'hue an', 'đình phong phú'] },
    { id: 'hiepphu-td', keywords: ['hiệp phú', 'hiep phu'] },
    { id: 'viettel-tb', keywords: ['viettel', 'hoàng hoa thám', 'hoang hoa tham'] },
    { id: 'rachmieu-pn', keywords: ['rạch miễu', 'rach mieu'] },
    { id: 'taodan-q1', keywords: ['tao đàn', 'tao dan', 'huyền trân'] },
    { id: 'trexanh-q7', keywords: ['tre xanh'] },
    { id: 'longvien-q7', keywords: ['long viên', 'long vien'] },
    { id: 'bongsao-q8', keywords: ['bông sao', 'bong sao'] },
    { id: 'bachai-q10', keywords: ['bắc hải', 'bac hai', 'c30'] },
    { id: 'pmh-pb', keywords: ['phú mỹ hưng', 'phu my hung', 'pmh'] },
    { id: 'snx-q7', keywords: ['sportnexus', 'arena q7', 'arena q.7'] },
    { id: 'yonex-bt', keywords: ['clb yonex', 'yonex bình thạnh', 'yonex binh thanh'] },
  ]

  let specificCourtMatch = null
  for (const item of SPECIFIC_COURT_MAP) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      specificCourtMatch = localizedCourts.find((c) => c.id === item.id)
      break
    }
  }

  // -------------------------------------------------------------------------
  // 0. NGƯỜI CHƠI TÌM SÂN THEO KHUNG GIỜ CỤ THỂ (VD: 14:00 - 16:00, CHIỀU, SÁNG...)
  // -------------------------------------------------------------------------
  const isGeneralQuestion =
    query.includes('hủy sân') ||
    query.includes('hoàn tiền') ||
    query.includes('escrow') ||
    query.includes('chia tiền') ||
    query.includes('split') ||
    query.includes('mã qr') ||
    query.includes('vietqr')

  if (timeReq && !isGeneralQuestion) {
    let pool = localizedCourts

    // Lọc theo môn thể thao nếu có nhắc đến
    if (query.includes('pickle') || query.includes('pickleball')) {
      const pCourts = pool.filter((c) => c.sport === 'pickleball')
      if (pCourts.length > 0) pool = pCourts
    } else if (query.includes('cầu lông') || query.includes('badminton')) {
      const bCourts = pool.filter((c) => c.sport === 'badminton')
      if (bCourts.length > 0) pool = bCourts
    }

    // Lọc theo quận nếu có nhắc đến
    for (const d of DISTRICT_MATCHERS) {
      if (d.terms.some((term) => query.includes(term))) {
        const inDistrict = pool.filter((c) => c.district === d.key)
        if (inDistrict.length > 0) {
          pool = inDistrict
        }
        break
      }
    }

    // Nếu người chơi hỏi đích danh 1 sân cụ thể
    if (specificCourtMatch) {
      pool = [specificCourtMatch]
    }

    // Sắp xếp các sân theo khoảng cách gần nhất
    const sortedCourts = [...pool].sort((a, b) => a.distance - b.distance)

    // Tìm sân gần nhất có slot khả dụng (available) khớp với timeReq
    let bestCourt = null
    let bestSlot = null

    for (const c of sortedCourts) {
      const slots = buildSlotsForCourt(c)
      const slot = findBestMatchingSlot(slots, timeReq)
      if (slot && slot.status === 'available') {
        bestCourt = c
        bestSlot = slot
        break
      }
    }

    if (!bestCourt) {
      bestCourt = sortedCourts[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(bestCourt)
      bestSlot = findBestMatchingSlot(slots, timeReq)
    }

    // Tìm 2-3 sân lân cận cũng có slot khớp
    const otherCourts = sortedCourts
      .filter((c) => c.id !== bestCourt.id)
      .slice(0, 3)
      .map((c) => {
        const slots = buildSlotsForCourt(c)
        const s = findBestMatchingSlot(slots, timeReq)
        return { court: c, slot: s }
      })

    const timeLabel = bestSlot ? `${bestSlot.start} - ${bestSlot.end}` : timeReq.label
    const sessionName = timeReq.isAfternoon ? 'chiều' : timeReq.isMorning ? 'sáng' : timeReq.isEvening ? 'tối' : ''

    return {
      title: `Sân còn trống khung giờ ${sessionName ? `${sessionName} ` : ''}${timeLabel}`,
      text:
        `Dựa trên vị trí hiện tại của bạn tại **${loc.address || loc.name}**, các cụm sân **đang còn trống đúng khung giờ ${sessionName ? `${sessionName} ` : ''}${timeLabel}** theo yêu cầu:\n\n` +
        `• **Gợi ý hàng đầu (Gần bạn nhất)**: **${bestCourt.name}** (${bestCourt.sportName})\n` +
        `  - **Khoảng cách**: Chỉ cách bạn **${bestCourt.distance} km** (${bestCourt.route.eta}).\n` +
        `  - **Địa chỉ**: ${bestCourt.address}.\n` +
        `  - **Khung giờ trống**: **${bestSlot.start} - ${bestSlot.end}** (${bestSlot.hours} tiếng thi đấu • *${bestSlot.note}*).\n` +
        `  - **Giá thuê**: **${formatVnd(bestSlot.price)}** (Đã gồm bảo chứng Escrow & giữ chỗ độc quyền 15 phút).\n` +
        `  - **Đặc điểm sân**: ${bestCourt.subCourtDesc}.\n\n` +
        (otherCourts.length > 0
          ? `• **Các cụm sân lân cận khác cũng còn slot ${timeLabel}**:\n` +
            otherCourts
              .map(
                (item, idx) =>
                  `  ${idx + 1}. **${item.court.name}** (Cách **${item.court.distance} km**): Khung **${item.slot.start} - ${item.slot.end}** (Giá: **${formatVnd(item.slot.price)}**).`
              )
              .join('\n') + '\n\n'
          : '') +
        `📌 Bấm **"Chọn Sân Này"** hoặc **"Đặt & Chia Tiền Ngay"** bên dưới để khóa giữ slot **${bestSlot.start} - ${bestSlot.end}** ngay lập tức!`,
      recommendedCourt: bestCourt,
      recommendedSlot: bestSlot,
      priorityBadge: `⏰ CÒN TRỐNG KHUNG GIỜ: ${bestSlot.start} - ${bestSlot.end}`,
      priorityReason: `Khớp chính xác yêu cầu khung giờ ${timeLabel} của bạn • Cách bạn ${bestCourt.distance} km • Sân chuẩn thi đấu`,
      quickReplies: [
        `Chọn Sân ${bestCourt.name}`,
        `Đặt Slot ${bestSlot.start} - ${bestSlot.end}`,
        'Xem Sân Gần Khác',
        'Tìm Kèo Ghép Trận LFG',
      ],
    }
  }

  // Nếu người chơi hỏi riêng về tiện ích (xe, máy lạnh, tắm) của một sân cụ thể
  if (specificCourtMatch && (query.includes('xe') || query.includes('ô tô') || query.includes('máy lạnh') || query.includes('tắm') || query.includes('tiện ích') || query.includes('đèn'))) {
    const slots = buildSlotsForCourt(specificCourtMatch)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Tiện ích tại ${specificCourtMatch.name}`,
      text:
        `Thông tin tiện ích thực tế tại **${specificCourtMatch.name}**:\n\n` +
        `• **Bãi giữ xe**: ${specificCourtMatch.amenities.parking}.\n` +
        `• **Điều hòa & Không khí**: ${specificCourtMatch.amenities.ac}.\n` +
        `• **Mặt sân thi đấu**: ${specificCourtMatch.amenities.proFloor}.\n` +
        `• **Hệ thống chiếu sáng**: ${specificCourtMatch.amenities.lighting}.\n` +
        `• **Phòng tắm & Vệ sinh**: ${specificCourtMatch.amenities.showers ? 'Có phòng tắm nóng lạnh & phòng thay đồ riêng biệt' : 'Có phòng thay đồ'}.\n\n` +
        `Khung giờ còn trống gần nhất: **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: specificCourtMatch,
      recommendedSlot: slot,
      priorityBadge: `✅ TIỆN ÍCH CHUẨN • ${specificCourtMatch.sportName.toUpperCase()}`,
      priorityReason: `${specificCourtMatch.amenities.parking} • ${specificCourtMatch.amenities.proFloor}`,
      quickReplies: [`Chọn Sân ${specificCourtMatch.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // Nếu người chơi hỏi về một sân cụ thể
  if (specificCourtMatch) {
    const slots = buildSlotsForCourt(specificCourtMatch)
    const availableSlots = slots.filter((s) => s.status === 'available')
    const bestSlot = findBestMatchingSlot(slots, timeReq) || availableSlots[0] || slots[0]

    return {
      title: `Thông tin chi tiết: ${specificCourtMatch.name}`,
      text:
        `Thông tin cụm sân **${specificCourtMatch.name}**:\n\n` +
        `• **Môn thi đấu**: ${specificCourtMatch.sportName} (${specificCourtMatch.courtCount} sân tiêu chuẩn).\n` +
        `• **Địa chỉ**: ${specificCourtMatch.address} (Cách bạn **${specificCourtMatch.distance} km** • ${specificCourtMatch.route.eta}).\n` +
        `• **Giá thuê**: **${formatVnd(specificCourtMatch.price)}/giờ**.\n` +
        `• **Đặc điểm nổi bật**: ${specificCourtMatch.subCourtDesc}. ${specificCourtMatch.highlights.join(' • ')}.\n` +
        `• **Đánh giá**: **${specificCourtMatch.rating}★** (${specificCourtMatch.reviewsCount} đánh giá từ người chơi).\n` +
        `• **Khung giờ trống sẵn sàng**: **${bestSlot.start} - ${bestSlot.end}** (${formatVnd(bestSlot.price)}).\n\n` +
        `Bạn có thể bấm **Chọn Sân Này** để áp dụng lên lịch hoặc **Đặt & Chia Tiền** ngay bên dưới!`,
      recommendedCourt: specificCourtMatch,
      recommendedSlot: bestSlot,
      priorityBadge: `⭐ SÂN THEO YÊU CẦU: ${specificCourtMatch.name.toUpperCase()}`,
      priorityReason: `Khớp đúng sân bạn yêu cầu • Cách bạn ${specificCourtMatch.distance} km • Giờ vàng ${bestSlot.start}-${bestSlot.end} sẵn sàng`,
      quickReplies: [`Chọn Sân ${specificCourtMatch.name}`, 'Đặt & Chia Tiền Ngay', 'Kiểm Tra Slot Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 2. NGƯỜI CHƠI HỎI THEO QUẬN / KHU VỰC
  // -------------------------------------------------------------------------
  let matchedDistrict = null
  for (const d of DISTRICT_MATCHERS) {
    if (d.terms.some((term) => query.includes(term))) {
      matchedDistrict = d
      break
    }
  }

  if (matchedDistrict) {
    let courtsInDistrict = localizedCourts.filter((c) => c.district === matchedDistrict.key)
    
    // Nếu người chơi còn yêu cầu môn cụ thể
    if (query.includes('pickle') || query.includes('pickleball')) {
      const pCourts = courtsInDistrict.filter((c) => c.sport === 'pickleball')
      if (pCourts.length > 0) courtsInDistrict = pCourts
    } else if (query.includes('cầu lông') || query.includes('badminton')) {
      const bCourts = courtsInDistrict.filter((c) => c.sport === 'badminton')
      if (bCourts.length > 0) courtsInDistrict = bCourts
    }

    if (courtsInDistrict.length > 0) {
      const bestCourt = [...courtsInDistrict].sort((a, b) => b.rating - a.rating)[0]
      const bestSlots = buildSlotsForCourt(bestCourt)
      const targetSlot = findBestMatchingSlot(bestSlots, timeReq) || bestSlots.find((s) => s.status === 'available') || bestSlots[0]

      return {
        title: `Danh sách sân tại ${matchedDistrict.name}`,
        text:
          `Hệ thống hiện có **${courtsInDistrict.length} cụm sân** tại khu vực **${matchedDistrict.name}**:\n\n` +
          courtsInDistrict
            .map(
              (c, idx) =>
                `${idx + 1}. **${c.name}** (${c.sportName})\n` +
                `   • Địa chỉ: ${c.address} (Cách bạn **${c.distance} km**)\n` +
                `   • Giá niêm yết: **${formatVnd(c.price)}/h** • Đánh giá: **${c.rating}★**\n` +
                `   • Đặc điểm: ${c.subCourtDesc}`
            )
            .join('\n\n') +
          `\n\n📌 **Lựa chọn gợi ý số 1**: **${bestCourt.name}** đang trống khung giờ vàng **${targetSlot.start} - ${targetSlot.end}** (Giá: **${formatVnd(targetSlot.price)}**).`,
        recommendedCourt: bestCourt,
        recommendedSlot: targetSlot,
        priorityBadge: `🏆 SÂN TỐT NHẤT TẠI ${matchedDistrict.name.toUpperCase()}`,
        priorityReason: `Đánh giá cao ${bestCourt.rating}★ • Giá ${formatVnd(bestCourt.price)}/h • Cách bạn ${bestCourt.distance} km`,
        quickReplies: [`Chọn ${bestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    }
  }

  // -------------------------------------------------------------------------
  // 3. NGƯỜI CHƠI HỎI VỀ GIÁ SÂN / TIẾT KIỆM / RẺ NHẤT / SINH VIÊN
  // -------------------------------------------------------------------------
  if (
    query.includes('giá') ||
    query.includes('bao nhiêu') ||
    query.includes('tiền') ||
    query.includes('rẻ') ||
    query.includes('tiết kiệm') ||
    query.includes('chi phí') ||
    query.includes('sinh viên') ||
    query.includes('bảng giá') ||
    query.includes('dưới 200') ||
    query.includes('dưới 150')
  ) {
    const isPickle = query.includes('pickle') || query.includes('pickleball')
    const pool = isPickle
      ? localizedCourts.filter((c) => c.sport === 'pickleball')
      : localizedCourts.filter((c) => c.sport === 'badminton')

    const sortedByPrice = [...pool].sort((a, b) => a.price - b.price)
    const cheapestCourt = sortedByPrice[0] || localizedCourts[0]
    const slots = buildSlotsForCourt(cheapestCourt)
    const cheapSlot = slots.find((s) => s.id === 's7' && s.status === 'available') || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Bảng giá sân ${isPickle ? 'Pickleball' : 'Cầu lông'} tốt nhất`,
      text:
        `Thông tin giá thuê sân ${isPickle ? 'Pickleball' : 'Cầu lông'} trên hệ thống:\n\n` +
        `• **Mức giá Cầu lông**: Dao động từ **140.000 đ - 230.000 đ/giờ**.\n` +
        `  - Giá rẻ nhất: **Sân Huệ An Thủ Đức** (140k/h), **Sân Bông Sao Q.8** (140k/h), **Sân Hiệp Phú Thủ Đức** (150k/h).\n` +
        `  - Phổ thông BWF: **CLB YONEX Bình Thạnh** (160k/h), **Sân Long Viên Q.7** (170k/h), **Sân Viettel Tân Bình** (170k/h).\n` +
        `  - VIP trung tâm: **CLB Tao Đàn Q.1** (210k/h), **SportNexus Arena Q.7** (220k/h), **CLB Lan Anh Q.10** (230k/h).\n` +
        `• **Mức giá Pickleball**: Dao động từ **180.000 đ - 260.000 đ/giờ**.\n` +
        `  - Giá tốt nhất: **Phú Mỹ Hưng Pickleball Club Q.7** (180k/h có mái che).\n` +
        `  - Chuẩn USAPA Pro: **Kỳ Hòa Q.10** (240k/h), **D-Dink Thảo Điền** (250k/h), **Sala Thủ Thiêm** (260k/h).\n\n` +
        `💡 **Ưu đãi giảm giá giờ muộn**: Khung sau 21:00 giảm 9%, sau 22:00 giảm 18%.\n` +
        `Lựa chọn tối ưu ngân sách nhất cho bạn: **${cheapestCourt.name}** (**${formatVnd(cheapestCourt.price)}/h**).`,
      recommendedCourt: cheapestCourt,
      recommendedSlot: cheapSlot,
      priorityBadge: '💰 LỰA CHỌN GIÁ TỐT NHẤT HỆ THỐNG',
      priorityReason: `Giá chỉ từ ${formatVnd(cheapestCourt.price)}/h • Hỗ trợ giảm giá giờ muộn • Phù hợp sinh viên`,
      quickReplies: [`Chọn ${cheapestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Sân Gần Hơn'],
    }
  }

  // -------------------------------------------------------------------------
  // 4. NGƯỜI CHƠI HỎI VỀ SÂN GẦN NHẤT / KHOẢNG CÁCH / VỊ TRÍ
  // -------------------------------------------------------------------------
  if (
    query.includes('gần nhất') ||
    query.includes('gần tôi') ||
    query.includes('gần đây') ||
    query.includes('khoảng cách') ||
    query.includes('bao xa') ||
    query.includes('ở đâu') ||
    query.includes('chỉ đường') ||
    query.includes('gần')
  ) {
    const isPickle = query.includes('pickle') || query.includes('pickleball')
    const pool = isPickle
      ? localizedCourts.filter((c) => c.sport === 'pickleball')
      : localizedCourts

    const sortedByDistance = [...pool].sort((a, b) => a.distance - b.distance)
    const nearestCourt = sortedByDistance[0] || localizedCourts[0]
    const slots = buildSlotsForCourt(nearestCourt)
    const availableSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Sân gần vị trí hiện tại của bạn nhất',
      text:
        `Dựa trên vị trí hiện tại của bạn tại **${loc.address || loc.name}**, sân gần bạn nhất là:\n\n` +
        `• **Tên sân**: **${nearestCourt.name}** (${nearestCourt.sportName}).\n` +
        `• **Khoảng cách**: Chỉ cách bạn **${nearestCourt.distance} km** (${nearestCourt.route.eta}).\n` +
        `• **Địa chỉ**: ${nearestCourt.address}.\n` +
        `• **Giá thuê**: **${formatVnd(nearestCourt.price)}/giờ** • Đánh giá: **${nearestCourt.rating}★**.\n` +
        `• **Khung giờ trống sẵn sàng**: **${availableSlot.start} - ${availableSlot.end}** (Giá: **${formatVnd(availableSlot.price)}**).\n\n` +
        `Bạn có thể bấm **Chọn Sân Này** hoặc **Đặt & Chia Tiền** bên dưới để giữ chỗ ngay!`,
      recommendedCourt: nearestCourt,
      recommendedSlot: availableSlot,
      priorityBadge: `📍 GẦN NHẤT: CÁCH BẠN ${nearestCourt.distance} KM`,
      priorityReason: `Tiết kiệm thời gian di chuyển (${nearestCourt.route.eta}) • Khung giờ đẹp sẵn sàng`,
      quickReplies: [`Chọn Sân ${nearestCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 5. NGƯỜI CHƠI HỎI VỀ THỜI GIAN / LỊCH TRỐNG / TỐI NAY / GIỜ VÀNG / MỞ CỬA
  // -------------------------------------------------------------------------
  if (
    query.includes('giờ') ||
    query.includes('tối nay') ||
    query.includes('chiều nay') ||
    query.includes('lịch') ||
    query.includes('slot') ||
    query.includes('trống') ||
    query.includes('mở cửa') ||
    query.includes('đóng cửa') ||
    query.includes('19h') ||
    query.includes('20h') ||
    query.includes('21h')
  ) {
    const court = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(court)
    const availableSlots = slots.filter((s) => s.status === 'available')
    const goldenSlot = findBestMatchingSlot(slots, timeReq) || availableSlots[0] || slots[0]

    return {
      title: `Lịch khung giờ trống tại ${court.name}`,
      text:
        `Thông tin thời gian và lịch trống tại **${court.name}**:\n\n` +
        `• **Giờ mở cửa hoạt động**: **06:00 - 23:00** tất cả các ngày trong tuần.\n` +
        `• **Trạng thái khung giờ khả dụng**:\n` +
        availableSlots
          .map((s) => `  - **${s.start} - ${s.end}** (${s.hours}h): **${formatVnd(s.price)}** — *${s.note}*`)
          .join('\n') +
        `\n\n📌 **Khung giờ tối ưu gợi ý**: **${goldenSlot.start} - ${goldenSlot.end}** (${goldenSlot.hours}h thi đấu lý tưởng).\n` +
        `Khi bấm chọn, slot sẽ được **khóa độc quyền 15:00 phút** chống trùng lịch ngay lập tức.`,
      recommendedCourt: court,
      recommendedSlot: goldenSlot,
      priorityBadge: `⏰ KHUNG GIỜ: ${goldenSlot.start} - ${goldenSlot.end}`,
      priorityReason: 'Khung giờ phù hợp tiêu chí • Thời lượng thi đấu trọn vẹn • Sẵn sàng giữ chỗ',
      quickReplies: [`Khóa Slot ${goldenSlot.start} - ${goldenSlot.end}`, 'Đặt & Chia Tiền Ngay', 'Xem Sân Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 6. NGƯỜI CHƠI YÊU CẦU ĐẶT SÂN / CHỌN SÂN NHANH
  // -------------------------------------------------------------------------
  if (
    query.includes('đặt sân') ||
    query.includes('chọn sân') ||
    query.includes('đặt ngay') ||
    query.includes('book') ||
    query.includes('giữ slot') ||
    query.includes('giúp tôi đặt') ||
    query.includes('muốn đặt')
  ) {
    const courtToBook = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(courtToBook)
    const targetSlot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Sẵn sàng đặt sân nhanh: ${courtToBook.name}`,
      text:
        `Tôi đã chuẩn bị sẵn thông tin đặt sân cho bạn:\n\n` +
        `• **Cụm sân**: **${courtToBook.name}** (${courtToBook.sportName}).\n` +
        `• **Địa chỉ**: ${courtToBook.address} (Cách bạn **${courtToBook.distance} km**).\n` +
        `• **Khung giờ**: **${targetSlot.start} - ${targetSlot.end}** (${targetSlot.hours} tiếng thi đấu).\n` +
        `• **Tổng tiền**: **${formatVnd(targetSlot.price)}** (Đã gồm phí đặt & bảo chứng Escrow).\n\n` +
        `Bấm **"Chọn Sân Này"** để hiển thị trên lưới lịch hoặc bấm **"Đặt & Chia Tiền Ngay"** để thanh toán tức thì!`,
      recommendedCourt: courtToBook,
      recommendedSlot: targetSlot,
      priorityBadge: '⚡ SẴN SÀNG ĐẶT & KHÓA GIỮ CHỖ',
      priorityReason: `Khung giờ vàng ${targetSlot.start} - ${targetSlot.end} còn trống • Khóa 15 phút chống trùng lịch`,
      quickReplies: ['Chọn Sân Này Ngay', 'Đặt & Chia Tiền Ngay', 'Chọn Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 7. NGƯỜI CHƠI HỎI VỀ TIỆN ÍCH (MÁY LẠNH, XE Ô TÔ, MẶT SÂN, PHÒNG TẮM)
  // -------------------------------------------------------------------------
  if (
    query.includes('xe') ||
    query.includes('ô tô') ||
    query.includes('máy lạnh') ||
    query.includes('điều hòa') ||
    query.includes('thảm') ||
    query.includes('phòng tắm') ||
    query.includes('tắm') ||
    query.includes('đèn') ||
    query.includes('vợt')
  ) {
    // Nếu người chơi hỏi riêng về sân có máy lạnh
    if (query.includes('máy lạnh') || query.includes('điều hòa')) {
      const acCourts = localizedCourts.filter(
        (c) => c.amenities.ac.toLowerCase().includes('máy lạnh') || c.highlights.some((h) => h.toLowerCase().includes('máy lạnh'))
      )
      const topAcCourt = acCourts.sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(topAcCourt)
      const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

      return {
        title: 'Các cụm sân trang bị máy lạnh điều hòa',
        text:
          `Danh sách các cụm sân có **điều hòa / máy lạnh 21°C** mát mẻ:\n\n` +
          acCourts
            .map(
              (c) =>
                `• **${c.name}** (${c.districtName}): ${c.amenities.ac} • Giá **${formatVnd(c.price)}/h** • Cách bạn **${c.distance} km**.`
            )
            .join('\n\n') +
          `\n\n📌 **Lựa chọn gần bạn nhất**: **${topAcCourt.name}** đang trống khung giờ **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
        recommendedCourt: topAcCourt,
        recommendedSlot: slot,
        priorityBadge: '❄️ SÂN CÓ MÁY LẠNH ĐIỀU HÒA 21°C',
        priorityReason: `Trang bị máy lạnh mát mẻ • Thảm thi đấu chuẩn • Cách bạn ${topAcCourt.distance} km`,
        quickReplies: [`Chọn Sân ${topAcCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    }

    // Nếu người chơi hỏi về chỗ đỗ xe ô tô
    if (query.includes('ô tô') || query.includes('oto') || query.includes('xe hơi') || query.includes('bãi đỗ')) {
      const carCourts = localizedCourts.filter(
        (c) => c.amenities.parking.toLowerCase().includes('ô tô') || c.highlights.some((h) => h.toLowerCase().includes('ô tô'))
      )
      const topCarCourt = carCourts.sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
      const slots = buildSlotsForCourt(topCarCourt)
      const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

      return {
        title: 'Các cụm sân có bãi đỗ xe ô tô & xe máy',
        text:
          `Danh sách các sân có **bãi đỗ xe ô tô rộng rãi, an toàn có bảo vệ trông giữ**:\n\n` +
          carCourts
            .map(
              (c) =>
                `• **${c.name}** (${c.districtName}): ${c.amenities.parking} • Giá **${formatVnd(c.price)}/h** • Cách bạn **${c.distance} km**.`
            )
            .join('\n\n') +
          `\n\n📌 **Gợi ý sân gần bạn nhất**: **${topCarCourt.name}** đang trống slot **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
        recommendedCourt: topCarCourt,
        recommendedSlot: slot,
        priorityBadge: '🚗 CÓ BÃI ĐỖ XE Ô TÔ & XE MÁY',
        priorityReason: `${topCarCourt.amenities.parking} • An ninh 24/7 • Cách bạn ${topCarCourt.distance} km`,
        quickReplies: [`Chọn Sân ${topCarCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
      }
    }

    const targetCourt = currentCourt || localizedCourts[0]
    const slots = buildSlotsForCourt(targetCourt)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: `Tiện ích cụm sân ${targetCourt.name}`,
      text:
        `Thông tin tiện ích thực tế tại **${targetCourt.name}**:\n\n` +
        `• **Bãi đỗ xe**: ${targetCourt.amenities.parking}.\n` +
        `• **Nhiệt độ & Không khí**: ${targetCourt.amenities.ac}.\n` +
        `• **Mặt sân thi đấu**: ${targetCourt.amenities.proFloor}.\n` +
        `• **Ánh sáng**: ${targetCourt.amenities.lighting}.\n` +
        `• **Phòng tắm & Vệ sinh**: ${targetCourt.amenities.showers ? 'Có phòng tắm nóng lạnh & thay đồ' : 'Có phòng thay đồ'}.\n\n` +
        `Sân đang trống khung giờ **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: targetCourt,
      recommendedSlot: slot,
      priorityBadge: '✅ TIỆN ÍCH ĐẦY ĐỦ ĐẠT CHUẨN',
      priorityReason: `${targetCourt.amenities.parking} • ${targetCourt.amenities.proFloor}`,
      quickReplies: [`Chọn Sân ${targetCourt.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 8. NGƯỜI CHƠI HỎI VỀ CHÍNH SÁCH KHÓA GIỮ CHỖ 15P & BẢO CHỨNG ESCROW
  // -------------------------------------------------------------------------
  if (
    query.includes('khóa') ||
    query.includes('giữ chỗ') ||
    query.includes('pessimistic') ||
    query.includes('trùng') ||
    query.includes('escrow') ||
    query.includes('bảo chứng') ||
    query.includes('hủy') ||
    query.includes('hoàn tiền') ||
    query.includes('an toàn')
  ) {
    return {
      title: 'Chính sách Khóa Giữ Chỗ & Bảo Chứng Escrow',
      text:
        `Hệ thống SportNexus áp dụng công nghệ bảo vệ người chơi 100%:\n\n` +
        `1. 🔒 **Khóa Giữ Chỗ Độc Quyền (Pessimistic Locking 15 phút)**:\n` +
        `   • Ngay khi bạn bấm chọn một khung giờ còn trống, slot sẽ tự động khóa cứng trong **15:00 phút**.\n` +
        `   • Không người chơi nào khác có thể đặt đè hoặc thanh toán trùng giờ.\n` +
        `   • Nếu quá 15 phút chưa thanh toán, slot tự động mở lại cho cộng đồng.\n\n` +
        `2. 🛡️ **Bảo Chứng Ký Quỹ Escrow 24/7**:\n` +
        `   • Toàn bộ tiền đặt sân được lưu giữ an toàn tại tài khoản bảo chứng trung gian.\n` +
        `   • Tiền chỉ chuyển cho chủ sân sau khi bạn quét mã **QR Pass** check-in thành công tại sân.\n` +
        `   • Hoàn tiền **100% tự động** ngay lập tức nếu sân gặp sự cố hoặc hủy lịch!`,
      recommendedCourt: localizedCourts[0],
      recommendedSlot: buildSlotsForCourt(localizedCourts[0]).find((s) => s.id === 's5'),
      priorityBadge: '🛡️ BẢO CHỨNG GIAO DỊCH AN TOÀN 100%',
      priorityReason: 'Khóa slot 15 phút • Không sợ bị cướp sân • Hoàn tiền 100% khi có sự cố',
      quickReplies: ['Tôi muốn đặt sân ngay', 'Tìm hiểu Split Payment', 'Xem sân gần tôi'],
    }
  }

  // -------------------------------------------------------------------------
  // 9. NGƯỜI CHƠI HỎI VỀ CHIA TIỀN (SPLIT PAYMENT) & VIETQR
  // -------------------------------------------------------------------------
  if (
    query.includes('chia tiền') ||
    query.includes('split') ||
    query.includes('thanh toán') ||
    query.includes('bạn bè') ||
    query.includes('vietqr') ||
    query.includes('mã qr') ||
    query.includes('tiền cọc')
  ) {
    return {
      title: 'Tính năng Chia Tiền Tự Động (Split Payment)',
      text:
        `Tính năng **Split Payment** giúp nhóm bạn chia tiền sân công bằng và nhanh chóng:\n\n` +
        `• **Chia đều tự động**: Nhập số lượng người (2, 4 hoặc nhiều người), hệ thống tự chia đều tổng tiền sân chính xác đến từng đồng.\n` +
        `• **Mã VietQR riêng biệt**: Xuất mã QR thanh toán cá nhân cho từng người kèm nội dung chuyển khoản.\n` +
        `• **Theo dõi realtime**: Theo dõi trực tiếp ai đã thanh toán, ai chưa ngay trên màn hình.\n` +
        `• **Cấp vé QR Pass**: Hoàn tất thanh toán là nhận mã QR Pass để quét vào cổng sân.`,
      recommendedCourt: localizedCourts[0],
      recommendedSlot: buildSlotsForCourt(localizedCourts[0]).find((s) => s.id === 's5'),
      priorityBadge: '⚡ TÍNH NĂNG CHIA TIỀN VIETQR',
      priorityReason: 'Chia tự động theo đầu người • Xuất mã VietQR nhanh • Không sợ quên đòi nợ',
      quickReplies: ['Chọn sân & tạo nhóm chia tiền', 'Xem sân gần tôi', 'Kiểm tra slot trống'],
    }
  }

  // -------------------------------------------------------------------------
  // 10. NGƯỜI CHƠI HỎI VỀ MÔN PICKLEBALL
  // -------------------------------------------------------------------------
  if (query.includes('pickleball') || query.includes('pickle')) {
    const pickleCourts = localizedCourts.filter((c) => c.sport === 'pickleball')
    const bestPickle = pickleCourts.sort((a, b) => a.distance - b.distance)[0] || pickleCourts[0]
    const slots = buildSlotsForCourt(bestPickle)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Các cụm sân Pickleball tiêu chuẩn',
      text:
        `Hệ thống hiện có các cụm sân **Pickleball** chuẩn thi đấu tại TP.HCM:\n\n` +
        pickleCourts
          .map(
            (c) =>
              `• **${c.name}** (${c.districtName}): Giá **${formatVnd(c.price)}/h** • Đánh giá **${c.rating}★** • Cách bạn **${c.distance} km**.\n` +
              `  *Đặc điểm*: ${c.subCourtDesc}.`
          )
          .join('\n\n') +
        `\n\n📌 **Gợi ý sân gần bạn nhất**: **${bestPickle.name}** (Cách **${bestPickle.distance} km**), đang trống slot **${slot.start} - ${slot.end}**.`,
      recommendedCourt: bestPickle,
      recommendedSlot: slot,
      priorityBadge: '🏓 SÂN PICKLEBALL ƯU TIÊN GẦN BẠN',
      priorityReason: `Chỉ cách bạn ${bestPickle.distance} km • Mặt sân acrylic chuẩn USAPA • Giá ${formatVnd(bestPickle.price)}/h`,
      quickReplies: [`Chọn Sân ${bestPickle.name}`, 'Đặt & Chia Tiền Ngay', 'Sân D-Dink Thảo Điền'],
    }
  }

  // -------------------------------------------------------------------------
  // 11. NGƯỜI CHƠI HỎI VỀ MÔN CẦU LÔNG
  // -------------------------------------------------------------------------
  if (query.includes('cầu lông') || query.includes('badminton')) {
    const badCourts = localizedCourts.filter((c) => c.sport === 'badminton')
    const nearestBad = badCourts.sort((a, b) => a.distance - b.distance)[0] || badCourts[0]
    const slots = buildSlotsForCourt(nearestBad)
    const slot = findBestMatchingSlot(slots, timeReq) || slots.find((s) => s.status === 'available') || slots[0]

    return {
      title: 'Các cụm sân Cầu Lông chất lượng cao',
      text:
        `Hệ thống SportNexus có đầy đủ các cụm sân **Cầu Lông thảm thi đấu chuẩn BWF**:\n\n` +
        `• **Gần bạn nhất**: **${nearestBad.name}** (Cách **${nearestBad.distance} km** • Giá **${formatVnd(nearestBad.price)}/h**).\n` +
        `• **Phân khúc tiết kiệm**: Sân Huệ An Thủ Đức (140k/h), Sân Bông Sao Q.8 (140k/h), CLB YONEX Bình Thạnh (160k/h).\n` +
        `• **Phân khúc chuẩn thi đấu**: SportNexus Arena Q.7 (220k/h), CLB Lan Anh Q.10 (230k/h), CLB Tao Đàn Q.1 (210k/h).\n\n` +
        `Khung giờ còn trống tại **${nearestBad.name}**: **${slot.start} - ${slot.end}** (Giá: **${formatVnd(slot.price)}**).`,
      recommendedCourt: nearestBad,
      recommendedSlot: slot,
      priorityBadge: '🏸 SÂN CẦU LÔNG GẦN BẠN NHẤT',
      priorityReason: `Thảm thi đấu BWF • Cách bạn ${nearestBad.distance} km • Đang mở slot ${slot.start} - ${slot.end}`,
      quickReplies: [`Chọn Sân ${nearestBad.name}`, 'Đặt & Chia Tiền Ngay', 'Xem Khung Giờ Khác'],
    }
  }

  // -------------------------------------------------------------------------
  // 12. PHẢN HỒI MẶC ĐỊNH / CHÀO HỎI TỔNG QUÁT THEO VỊ TRÍ HIỆN TẠI
  // -------------------------------------------------------------------------
  const topNearest = [...localizedCourts].sort((a, b) => a.distance - b.distance)[0] || localizedCourts[0]
  const topSlots = buildSlotsForCourt(topNearest)
  const topSlot = findBestMatchingSlot(topSlots, timeReq) || topSlots.find((s) => s.status === 'available') || topSlots[0]

  return {
    title: 'Gợi ý sân thể thao tối ưu từ Trợ lý AI',
    text:
      `Dựa trên vị trí hiện tại của bạn tại **${loc.address || loc.name}**, tôi xin cung cấp thông tin tóm tắt:\n\n` +
      `• **Sân gần bạn nhất**: **${topNearest.name}** (Chỉ cách **${topNearest.distance} km** • ${topNearest.sportName}).\n` +
      `• **Địa chỉ**: ${topNearest.address}.\n` +
      `• **Giá thuê**: **${formatVnd(topNearest.price)}/giờ** • Đánh giá: **${topNearest.rating}★**.\n` +
      `• **Khung giờ trống**: **${topSlot.start} - ${topSlot.end}** (Giá: **${formatVnd(topSlot.price)}**).\n\n` +
      `Bạn có thể yêu cầu tôi tìm kiếm theo: khu vực cụ thể (VD: *Quận 10, Thủ Đức*), mức giá (VD: *dưới 180k*), môn thể thao, tiện ích bãi đỗ xe hoặc bấm **Chọn Sân Này** để đặt nhanh!`,
    recommendedCourt: topNearest,
    recommendedSlot: topSlot,
    priorityBadge: `⭐ ĐỀ XUẤT TỐI ƯU • CÁCH BẠN ${topNearest.distance} KM`,
    priorityReason: `Sân gần nhất từ ${loc.name || 'vị trí hiện tại'} • Chuẩn thi đấu chất lượng cao • Slot ${topSlot.start} - ${topSlot.end} sẵn sàng`,
    quickReplies: [
      `Chọn Sân ${topNearest.name}`,
      '💰 Sân cầu lông giá rẻ nhất',
      '🏓 Sân Pickleball tốt nhất',
      '⏰ Khung giờ trống tối nay',
    ],
  }
}

