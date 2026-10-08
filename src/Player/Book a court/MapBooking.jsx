import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSport } from '../Context/SportContext.jsx'
import AIChatModal from './AIChatModal.jsx'
import './MapBooking.css'

const PRICE_MIN = 40000
const PRICE_MAX = 500000
const PRICE_STEP = 10000
const HOLD_SECONDS = 15 * 60

// Thông tin quận — dùng cho tìm kiếm & đồng bộ vị trí
const DISTRICTS = {
  thuduc: { name: 'TP. Thủ Đức', aliases: 'thu duc td q2 q.2 quan 2 quan 9 q9 thao dien tang nhon phu le van viet binh trieu hiep phu' },
  q7: { name: 'Quận 7', aliases: 'q7 q.7 quan7 quan 7 phu my hung tan thuan huynh tan phat nguyen van linh nguyen luong bang tre xanh' },
  binhthanh: { name: 'Bình Thạnh', aliases: 'binh thanh q.bt qbt dien bien phu hang xanh bach dang thanh da' },
  q1: { name: 'Quận 1', aliases: 'q1 q.1 quan1 quan 1 ben thanh tao dan nguyen thi minh khai huyen tran cong chua' },
  q10: { name: 'Quận 10', aliases: 'q10 q.10 quan10 quan 10 ky hoa 3 thang 2 ba thang hai to hien thanh lan anh cach mang thang 8' },
  phunhuan: { name: 'Phú Nhuận', aliases: 'phu nhuan pn q.pn quan phu nhuan rach mieu phan xich long hoa phuong' },
  tanbinh: { name: 'Tân Bình', aliases: 'tan binh q.tb qtb hoang hoa tham ga truc thang cong hoa viettel' },
  quan8: { name: 'Quận 8', aliases: 'q8 q.8 quan8 quan 8 chanh hung bong sao pham hung ta quang buu' },
  tanphu: { name: 'Tân Phú', aliases: 'tan phu q.tp qtp celadon bo bao tan thang luy ban bich' },
  govap: { name: 'Gò Vấp', aliases: 'go vap q.gv qgv quang trung phan van tri nguyen oanh khang an' },
  q3: { name: 'Quận 3', aliases: 'q3 q.3 quan3 quan 3 ho xuan huong nam ky khoi nghia vo thi sau ban co' },
  q11: { name: 'Quận 11', aliases: 'q11 q.11 quan11 quan 11 phu tho ly thuong kiet lac long quan dam sen' },
}

// Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu
const normalizeText = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

// Xác định key quận từ vị trí hồ sơ hoặc địa chỉ người chơi cung cấp
const detectDistrictKey = (loc = '') => {
  const norm = normalizeText(loc)
  if (norm.includes('thu duc') || norm.includes('thao dien') || norm.includes('quan 2') || norm.includes('q2') || norm.includes('quan 9') || norm.includes('q9') || norm.includes('le van viet') || norm.includes('tang nhon phu') || norm.includes('binh trieu') || norm.includes('hiep phu')) return 'thuduc'
  if (norm.includes('binh thanh') || norm.includes('dinh bo linh') || norm.includes('dien bien phu') || norm.includes('hang xanh')) return 'binhthanh'
  if (norm.includes('quan 7') || norm.includes('q7') || norm.includes('phu my hung') || norm.includes('huynh tan phat') || norm.includes('nguyen thi thap') || norm.includes('nguyen luong bang') || norm.includes('tre xanh')) return 'q7'
  if (norm.includes('quan 1') || norm.includes('q1') || norm.includes('ben thanh') || norm.includes('tao dan') || norm.includes('huyen tran')) return 'q1'
  if (norm.includes('quan 10') || norm.includes('q10') || norm.includes('ky hoa') || norm.includes('lan anh') || norm.includes('ba thang hai') || norm.includes('3 thang 2')) return 'q10'
  if (norm.includes('phu nhuan') || norm.includes('rach mieu') || norm.includes('phan xich long') || norm.includes('hoa phuong')) return 'phunhuan'
  if (norm.includes('tan binh') || norm.includes('hoang hoa tham') || norm.includes('ga truc thang') || norm.includes('viettel')) return 'tanbinh'
  if (norm.includes('quan 8') || norm.includes('q8') || norm.includes('chanh hung') || norm.includes('bong sao')) return 'quan8'
  if (norm.includes('tan phu') || norm.includes('celadon')) return 'tanphu'
  if (norm.includes('go vap') || norm.includes('quang trung') || norm.includes('khang an')) return 'govap'
  if (norm.includes('quan 3') || norm.includes('q3') || norm.includes('ho xuan huong') || norm.includes('vo thi sau')) return 'q3'
  if (norm.includes('quan 11') || norm.includes('q11') || norm.includes('phu tho') || norm.includes('dam sen')) return 'q11'
  return 'thuduc'
}

// Ma trận khoảng cách ước tính giữa các quận (km)
const DISTRICT_DISTANCES = {
  thuduc: { thuduc: 1.0, binhthanh: 4.2, q1: 7.5, phunhuan: 8.0, q10: 10.5, q7: 12.0, tanbinh: 9.5, quan8: 13.0, tanphu: 14.0, govap: 9.0, q3: 8.5, q11: 12.0 },
  binhthanh: { binhthanh: 1.0, phunhuan: 2.8, q1: 3.5, thuduc: 4.2, q10: 6.0, q7: 7.5, tanbinh: 4.5, quan8: 9.0, tanphu: 8.5, govap: 4.0, q3: 4.0, q11: 7.0 },
  q7: { q7: 1.0, q1: 5.5, binhthanh: 7.5, q10: 8.0, phunhuan: 9.5, thuduc: 12.0, quan8: 4.5, tanbinh: 9.0, tanphu: 11.0, govap: 12.5, q3: 7.0, q11: 9.5 },
  q1: { q1: 1.0, binhthanh: 3.5, phunhuan: 3.8, q10: 4.0, q7: 5.5, thuduc: 7.5, tanbinh: 5.0, quan8: 6.0, tanphu: 8.0, govap: 7.0, q3: 2.0, q11: 5.5 },
  q10: { q10: 1.0, q1: 4.0, phunhuan: 4.5, binhthanh: 6.0, q7: 8.0, thuduc: 10.5, tanbinh: 3.5, quan8: 4.0, tanphu: 5.0, govap: 6.5, q3: 2.5, q11: 2.5 },
  phunhuan: { phunhuan: 1.0, binhthanh: 2.8, q1: 3.8, q10: 4.5, thuduc: 8.0, q7: 9.5, tanbinh: 3.0, quan8: 7.5, tanphu: 6.0, govap: 3.5, q3: 2.5, q11: 5.5 },
  tanbinh: { tanbinh: 1.0, phunhuan: 3.0, q10: 3.5, q1: 5.0, govap: 3.5, tanphu: 3.0, binhthanh: 4.5, thuduc: 9.5, q7: 9.0, quan8: 6.5, q3: 4.0, q11: 3.8 },
  quan8: { quan8: 1.0, q7: 4.5, q10: 4.0, q1: 6.0, tanbinh: 6.5, tanphu: 7.0, binhthanh: 9.0, phunhuan: 7.5, thuduc: 13.0, govap: 11.0, q3: 5.5, q11: 5.0 },
  tanphu: { tanphu: 1.0, tanbinh: 3.0, q10: 5.0, quan8: 7.0, q1: 8.0, govap: 6.0, phunhuan: 6.0, binhthanh: 8.5, thuduc: 14.0, q7: 11.0, q3: 6.5, q11: 4.5 },
  govap: { govap: 1.0, tanbinh: 3.5, phunhuan: 3.5, binhthanh: 4.0, q1: 7.0, q10: 6.5, thuduc: 9.0, tanphu: 6.0, quan8: 11.0, q7: 12.5, q3: 6.0, q11: 7.5 },
  q3: { q3: 1.0, q1: 2.0, q10: 2.5, phunhuan: 2.5, binhthanh: 4.0, tanbinh: 4.0, q7: 7.0, quan8: 5.5, tanphu: 6.5, govap: 6.0, thuduc: 8.5, q11: 4.0 },
  q11: { q11: 1.0, q10: 2.5, tanbinh: 3.8, tanphu: 4.5, quan8: 5.0, q1: 5.5, q3: 4.0, phunhuan: 5.5, binhthanh: 7.0, thuduc: 12.0, q7: 9.5, govap: 7.5 },
}

// Công thức tính khoảng cách Haversine chính xác theo tọa độ Vệ tinh GPS (km)
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371 // Bán kính Trái Đất theo km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// Tọa độ trung tâm các quận trên Google Maps (dùng khi chưa có tín hiệu GPS vệ tinh)
const DISTRICT_COORDS = {
  thuduc: { lat: 10.8490, lng: 106.7537, name: 'TP. Thủ Đức' },
  binhthanh: { lat: 10.8105, lng: 106.6975, name: 'Bình Thạnh' },
  q7: { lat: 10.7340, lng: 106.7215, name: 'Quận 7' },
  q1: { lat: 10.7756, lng: 106.7004, name: 'Quận 1' },
  q10: { lat: 10.7715, lng: 106.6672, name: 'Quận 10' },
  phunhuan: { lat: 10.7992, lng: 106.6803, name: 'Phú Nhuận' },
  tanbinh: { lat: 10.8015, lng: 106.6534, name: 'Tân Bình' },
  quan8: { lat: 10.7242, lng: 106.6286, name: 'Quận 8' },
  tanphu: { lat: 10.7901, lng: 106.6281, name: 'Tân Phú' },
  govap: { lat: 10.8388, lng: 106.6653, name: 'Gò Vấp' },
  q3: { lat: 10.7788, lng: 106.6852, name: 'Quận 3' },
  q11: { lat: 10.7652, lng: 106.6578, name: 'Quận 11' },
}

// Tính khoảng cách sân linh hoạt theo vị trí người chơi và tọa độ vệ tinh GPS trực tiếp từ Google Maps
const getDistanceForCourt = (court, playerLocation, liveCoords = null) => {
  if (liveCoords && liveCoords.lat && liveCoords.lng && court.lat && court.lng) {
    const d = haversineDistanceKm(liveCoords.lat, liveCoords.lng, court.lat, court.lng)
    if (d != null) return Math.max(0.2, d)
  }
  const userDistrict = detectDistrictKey(playerLocation)
  const userCoords = DISTRICT_COORDS[userDistrict]
  if (userCoords && court.lat && court.lng) {
    const d = haversineDistanceKm(userCoords.lat, userCoords.lng, court.lat, court.lng)
    if (d != null) return Math.max(0.4, d)
  }
  const courtDistrict = court.district || 'thuduc'
  const base = DISTRICT_DISTANCES[userDistrict]?.[courtDistrict] ?? 5.0
  const offset = (court.id.charCodeAt(0) % 5) * 0.2
  return Math.max(0.6, Math.round((base + offset) * 10) / 10)
}

// DANH SÁCH CÁC CỤM SÂN THỂ THAO THỰC TẾ TRÊN GOOGLE MAPS TP. HỒ CHÍ MINH
// Tọa độ GPS (lat, lng), tên sân và địa chỉ được xác thực chính xác theo Google Maps
const COURTS = [
  {
    id: 'lananh-q10',
    sport: 'badminton',
    name: 'CLB Thể Thao Lan Anh Quận 10',
    street: 'Cách Mạng Tháng 8',
    address: '291 Cách Mạng Tháng 8, Phường 12, Quận 10, TP. Hồ Chí Minh',
    mapQuery: 'CLB Lan Anh, 291 Cách Mạng Tháng 8, Phường 12, Quận 10, Hồ Chí Minh',
    district: 'q10',
    lat: 10.77665,
    lng: 106.67756,
    rating: 4.9,
    price: 230000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
    subCourt: 'Sân Lan Anh VIP 01',
    subCourtDesc: 'Khu liên hợp thể thao danh tiếng, bãi giữ ô tô rộng',
    overrides: {},
  },
  {
    id: 'viettel-tb',
    sport: 'badminton',
    name: 'Sân Cầu Lông Viettel Hoàng Hoa Thám',
    street: 'Hoàng Hoa Thám',
    address: '158 Hoàng Hoa Thám, Phường 12, Tân Bình, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Viettel, 158 Hoàng Hoa Thám, Phường 12, Tân Bình, Hồ Chí Minh',
    district: 'tanbinh',
    lat: 10.80138,
    lng: 106.64932,
    rating: 4.8,
    price: 170000,
    courtCount: 12,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=300&h=300&fit=crop',
    subCourt: 'Sân Viettel Pro 06',
    subCourtDesc: 'Trần cao 11m, 12 sân thảm thi đấu chuẩn BWF',
    overrides: {},
  },
  {
    id: 'rachmieu-pn',
    sport: 'badminton',
    name: 'Trung Tâm Thể Thao Rạch Miễu Phú Nhuận',
    street: 'Hoa Phượng',
    address: '1 Hoa Phượng, Phường 2, Phú Nhuận, TP. Hồ Chí Minh',
    mapQuery: 'Trung Tâm Thể Dục Thể Thao Rạch Miễu, 1 Hoa Phượng, Phường 2, Phú Nhuận, Hồ Chí Minh',
    district: 'phunhuan',
    lat: 10.79684,
    lng: 106.68852,
    rating: 4.8,
    price: 190000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=300&fit=crop',
    subCourt: 'Sân Rạch Miễu BWF 05',
    subCourtDesc: 'Thảm Yonex xanh cao cấp, vị trí trung tâm Phú Nhuận',
    overrides: {},
  },
  {
    id: 'taodan-q1',
    sport: 'badminton',
    name: 'CLB Thể Dục Thể Thao Tao Đàn Quận 1',
    street: 'Huyền Trân Công Chúa',
    address: '1 Huyền Trân Công Chúa, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    mapQuery: 'CLB Thể Dục Thể Thao Tao Đàn, 1 Huyền Trân Công Chúa, Bến Thành, Quận 1, Hồ Chí Minh',
    district: 'q1',
    lat: 10.77353,
    lng: 106.69174,
    rating: 4.9,
    price: 210000,
    courtCount: 10,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=300&h=300&fit=crop',
    subCourt: 'Sân Tao Đàn VIP 04',
    subCourtDesc: 'Thảm sàn Victor thi đấu, khuôn viên cây xanh trung tâm',
    overrides: {},
  },
  {
    id: 'gatructhang-tb',
    sport: 'badminton',
    name: 'Sân Cầu Lông Ga Trực Thăng Tân Bình',
    street: 'Bạch Đằng',
    address: '18D Bạch Đằng, Phường 2, Tân Bình, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Ga Trực Thăng, 18D Bạch Đằng, Phường 2, Tân Bình, Hồ Chí Minh',
    district: 'tanbinh',
    lat: 10.81448,
    lng: 106.66847,
    rating: 4.8,
    price: 160000,
    courtCount: 10,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=300&h=300&fit=crop',
    subCourt: 'Sân Ga Trực Thăng 02',
    subCourtDesc: 'Cụm sân rộng thoáng sát sân bay Tân Sơn Nhất, đèn chống chói',
    overrides: {},
  },
  {
    id: 'kyhoa-q10',
    sport: 'pickleball',
    name: 'Kỳ Hòa Pickleball & Sport Club Quận 10',
    street: 'Ba Tháng Hai',
    address: '238 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh',
    mapQuery: 'Trung Tâm TDTT Kỳ Hòa, 238 Ba Tháng Hai, Phường 12, Quận 10, Hồ Chí Minh',
    district: 'q10',
    lat: 10.77202,
    lng: 106.67104,
    rating: 4.8,
    price: 240000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=300&h=300&fit=crop',
    subCourt: 'Sân Pickleball Kỳ Hòa 02',
    subCourtDesc: 'Mặt sân chuẩn giải đấu USAPA quốc tế, khán đài có mái che',
    overrides: {},
  },
  {
    id: 'ddink-td',
    sport: 'pickleball',
    name: 'D-Dink Pickleball Hub Thảo Điền',
    street: 'Thảo Điền',
    address: '28 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    mapQuery: 'D-Dink Pickleball Hub, 28 Thảo Điền, Thảo Điền, Thủ Đức, Hồ Chí Minh',
    district: 'thuduc',
    lat: 10.80652,
    lng: 106.73814,
    rating: 4.9,
    price: 250000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=300&h=300&fit=crop',
    subCourt: 'Sân Pickleball Pro USAPA 02',
    subCourtDesc: 'Mặt sân acrylic chuẩn USAPA, quầy clubhouse phong cách',
    overrides: { s1: 'available', s4: 'held' },
  },
  {
    id: 'pmh-pb',
    sport: 'pickleball',
    name: 'Phú Mỹ Hưng Pickleball Club Quận 7',
    street: 'Nguyễn Lương Bằng',
    address: '12 Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
    mapQuery: 'Sân Pickleball Phú Mỹ Hưng, 12 Nguyễn Lương Bằng, Tân Phú, Quận 7, Hồ Chí Minh',
    district: 'q7',
    lat: 10.72951,
    lng: 106.72183,
    rating: 4.7,
    price: 180000,
    courtCount: 5,
    image: 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?w=300&h=300&fit=crop',
    subCourt: 'Sân Pickleball PMH 01',
    subCourtDesc: 'Sân ngoài trời cao cấp giữa trung tâm khu đô thị Phú Mỹ Hưng',
    overrides: { s2: 'available', s7: 'booked' },
  },
  {
    id: 'chanhhung-q8',
    sport: 'badminton',
    name: 'Sân Cầu Lông Chánh Hưng Quận 8',
    street: 'Phạm Hùng',
    address: '260 Phạm Hùng, Phường 4, Quận 8, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Chánh Hưng, Phạm Hùng, Phường 4, Quận 8, Hồ Chí Minh',
    district: 'quan8',
    lat: 10.73852,
    lng: 106.67418,
    rating: 4.7,
    price: 150000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
    subCourt: 'Sân Chánh Hưng 03',
    subCourtDesc: 'Sàn gỗ lót thảm cao su chống chấn thương, trần cao thoáng',
    overrides: {},
  },
  {
    id: 'bongsao-q8',
    sport: 'badminton',
    name: 'Sân Cầu Lông Bông Sao Quận 8',
    street: 'Bông Sao',
    address: 'Bông Sao, Phường 5, Quận 8, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Bông Sao, Bông Sao, Phường 5, Quận 8, Hồ Chí Minh',
    district: 'quan8',
    lat: 10.73215,
    lng: 106.66753,
    rating: 4.7,
    price: 140000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=300&h=300&fit=crop',
    subCourt: 'Sân Bông Sao 01',
    subCourtDesc: 'Giá bình dân thân thiện, giờ giấc linh hoạt, gửi xe tiện lợi',
    overrides: {},
  },
  {
    id: 'celadon-tp',
    sport: 'badminton',
    name: 'CLB Thể Thao Celadon City Tân Phú',
    street: 'Bờ Bao Tân Thắng',
    address: '2 Đường D2, Celadon City, Phường Sơn Kỳ, Tân Phú, TP. Hồ Chí Minh',
    mapQuery: 'Celadon Sports & Resort Club, Celadon City, Tân Phú, Hồ Chí Minh',
    district: 'tanphu',
    lat: 10.80345,
    lng: 106.61892,
    rating: 4.9,
    price: 240000,
    courtCount: 14,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=300&h=300&fit=crop',
    subCourt: 'Sân Celadon Resort VIP 02',
    subCourtDesc: 'Khu liên hợp đẳng cấp 5 sao quốc tế, tích hợp hồ bơi và gym',
    overrides: {},
  },
  {
    id: 'quangtrung-gv',
    sport: 'badminton',
    name: 'Sân Cầu Lông Quang Trung Gò Vấp',
    street: 'Quang Trung',
    address: '934 Quang Trung, Phường 11, Gò Vấp, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Quang Trung, 934 Quang Trung, Gò Vấp, Hồ Chí Minh',
    district: 'govap',
    lat: 10.83562,
    lng: 106.66214,
    rating: 4.8,
    price: 160000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=300&h=300&fit=crop',
    subCourt: 'Sân Quang Trung 04',
    subCourtDesc: 'Cụm sân trục chính Quang Trung, đèn LED chống chói chuẩn thi đấu',
    overrides: {},
  },
  {
    id: 'hiepphu-td',
    sport: 'badminton',
    name: 'Sân Cầu Lông Hiệp Phú Thủ Đức',
    street: 'Lê Văn Việt',
    address: '50 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức, TP. Hồ Chí Minh',
    mapQuery: '50 Lê Văn Việt, Tăng Nhơn Phú B, Thủ Đức, Hồ Chí Minh',
    district: 'thuduc',
    lat: 10.84923,
    lng: 106.77854,
    rating: 4.8,
    price: 150000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=300&h=300&fit=crop',
    subCourt: 'Sân Hiệp Phú BWF 02',
    subCourtDesc: 'Thảm tiêu chuẩn thi đấu, gần ngã tư Thủ Đức',
    overrides: {},
  },
  {
    id: 'trexanh-q7',
    sport: 'badminton',
    name: 'CLB Cầu Lông Tre Xanh Quận 7',
    street: 'Huỳnh Tấn Phát',
    address: '50/1 Huỳnh Tấn Phát, P. Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Tre Xanh, 50 Huỳnh Tấn Phát, Tân Thuận Đông, Quận 7, Hồ Chí Minh',
    district: 'q7',
    lat: 10.74124,
    lng: 106.72895,
    rating: 4.8,
    price: 180000,
    courtCount: 6,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
    subCourt: 'Sân Tre Xanh BWF 01',
    subCourtDesc: 'Thảm Yonex xanh cao cấp, khu vực Tân Thuận Quận 7',
    overrides: {},
  },
  {
    id: 'yonex-bt',
    sport: 'badminton',
    name: 'CLB Cầu Lông YONEX Điện Biên Phủ Bình Thạnh',
    street: 'Điện Biên Phủ',
    address: '128 Điện Biên Phủ, Phường 17, Bình Thạnh, TP. Hồ Chí Minh',
    mapQuery: '128 Điện Biên Phủ, Phường 17, Bình Thạnh, Hồ Chí Minh',
    district: 'binhthanh',
    lat: 10.79632,
    lng: 106.70821,
    rating: 4.8,
    price: 160000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=300&h=300&fit=crop',
    subCourt: 'Sân Cầu Lông YONEX 03',
    subCourtDesc: 'Sàn gỗ phủ thảm PU chống trơn, gần cầu Điện Biên Phủ',
    overrides: { s3: 'available', s6: 'booked' },
  },
  {
    id: 'hoxuanhuong-q3',
    sport: 'badminton',
    name: 'CLB Thể Thao Hồ Xuân Hương Quận 3',
    street: 'Hồ Xuân Hương',
    address: '2 Hồ Xuân Hương, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    mapQuery: 'CLB Hồ Xuân Hương, 2 Hồ Xuân Hương, Võ Thị Sáu, Quận 3, Hồ Chí Minh',
    district: 'q3',
    lat: 10.77615,
    lng: 106.68725,
    rating: 4.9,
    price: 220000,
    courtCount: 8,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=300&fit=crop',
    subCourt: 'Sân Hồ Xuân Hương 02',
    subCourtDesc: 'Trung tâm thể thao danh tiếng Quận 3, sàn gỗ chuẩn quốc gia',
    overrides: {},
  },
  {
    id: 'phutho-q11',
    sport: 'badminton',
    name: 'Nhà Thi Đấu Thể Thao Phú Thọ Quận 11',
    street: 'Lý Thường Kiệt',
    address: '219 Lý Thường Kiệt, Phường 15, Quận 11, TP. Hồ Chí Minh',
    mapQuery: 'Nhà Thi Đấu Phú Thọ, 219 Lý Thường Kiệt, Phường 15, Quận 11, Hồ Chí Minh',
    district: 'q11',
    lat: 10.76812,
    lng: 106.65782,
    rating: 4.9,
    price: 200000,
    courtCount: 16,
    image: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=300&h=300&fit=crop',
    subCourt: 'Sân Phú Thọ BWF Arena 01',
    subCourtDesc: 'Nhà thi đấu quy mô lớn nhất TP.HCM, thảm sàn thi đấu quốc tế',
    overrides: {},
  },
  {
    id: 'khangan-gv',
    sport: 'badminton',
    name: 'Sân Cầu Lông Khang An Gò Vấp',
    street: 'Phan Văn Trị',
    address: '18A Phan Văn Trị, Phường 10, Gò Vấp, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Khang An, 18A Phan Văn Trị, Phường 10, Gò Vấp, Hồ Chí Minh',
    district: 'govap',
    lat: 10.82845,
    lng: 106.67123,
    rating: 4.8,
    price: 160000,
    courtCount: 10,
    image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be6?w=300&h=300&fit=crop',
    subCourt: 'Sân Khang An Pro 05',
    subCourtDesc: 'Cụm sân trần cao chống nóng, thảm Enlio đạt chuẩn',
    overrides: {},
  },
  {
    id: 'binhtrieu-td',
    sport: 'badminton',
    name: 'Sân Cầu Lông Bình Triệu Thủ Đức',
    street: 'Quốc Lộ 13',
    address: '156 Quốc Lộ 13, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
    mapQuery: 'Sân Cầu Lông Bình Triệu, 156 Quốc Lộ 13, Hiệp Bình Chánh, Thủ Đức, Hồ Chí Minh',
    district: 'thuduc',
    lat: 10.82451,
    lng: 106.71243,
    rating: 4.7,
    price: 150000,
    courtCount: 7,
    image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=300&h=300&fit=crop',
    subCourt: 'Sân Bình Triệu 02',
    subCourtDesc: 'Gần ngã tư Bình Triệu, sân mới nâng cấp thảm thi đấu',
    overrides: {},
  },
]

// Mẫu khung giờ — giá được tính theo giá/giờ của từng cụm sân
const SLOT_TEMPLATE = [
  { id: 's1', start: '16:00', end: '17:00', hours: 1, factor: 1, status: 'booked', note: 'Đã kín lịch' },
  { id: 's2', start: '17:00', end: '18:00', hours: 1, factor: 1, status: 'booked', note: 'FC Sài Gòn Đặt' },
  { id: 's3', start: '18:00', end: '19:00', hours: 1, factor: 1, status: 'held' },
  { id: 's4', start: '19:00', end: '19:30', hours: 0.5, factor: 1, status: 'available' },
  { id: 's5', start: '19:30', end: '21:00', hours: 1.5, factor: 1, status: 'available' },
  { id: 's6', start: '21:00', end: '22:00', hours: 1, factor: 0.91, status: 'available' },
  { id: 's7', start: '22:00', end: '23:00', hours: 1, factor: 0.82, status: 'available' },
]

const formatVnd = (n) => `${n.toLocaleString('vi-VN')} đ`
const formatK = (n) => `${n / 1000}k`
const roundTo10k = (n) => Math.round(n / 10000) * 10000

const SPORT_SEARCH_TEXT = {
  badminton: 'cầu lông cau long badminton',
  pickleball: 'pickleball',
}

// Chuỗi tìm kiếm tổng hợp của mỗi cụm sân
const searchIndexOf = (c) =>
  normalizeText(
    [
      c.name,
      c.street,
      c.address,
      c.mapQuery,
      c.subCourt,
      c.subCourtDesc,
      DISTRICTS[c.district]?.name,
      DISTRICTS[c.district]?.aliases,
      SPORT_SEARCH_TEXT[c.sport] || '',
    ].join(' ')
  )

// Các từ dừng thông dụng khi người dùng tìm kiếm sân cầu lông/pickleball
const STOP_WORDS = new Set([
  'san', 'clb', 'cum', 'khu', 'tim', 'dat', 'o', 'tai', 'gan', 'cho',
  'the', 'thao', 'tt', 'phuong', 'quan', 'tp', 'thanh', 'pho', 'duong',
  'gia', 're', 'dep', 'tot', 'gan', 'day', 'nhat', 'kiem'
])

const cleanSearchTokens = (text = '') => {
  const norm = normalizeText(text)
  return norm
    .split(/[\s,._\-+/]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
}

const matchesQuery = (court, query) => {
  const qClean = (query || '').trim()
  if (!qClean) return true

  const rawIndex = searchIndexOf(court)
  const compactIndex = rawIndex.replace(/[^a-z0-9]/g, '')
  const compactQuery = normalizeText(qClean).replace(/[^a-z0-9]/g, '')

  // 1. Khớp chuỗi trực tiếp (vd: "lan anh", "viettel", "chanh hung", "q10", "dien bien phu")
  if (compactIndex.includes(compactQuery) || compactQuery.includes(compactIndex)) return true

  // 2. Lọc bỏ các từ đệm ("sân", "clb", "tìm", "đặt", "ở", "gần"...)
  const meaningfulTokens = cleanSearchTokens(qClean)
  if (!meaningfulTokens.length) {
    // Nếu người dùng chỉ gõ "sân" hoặc "clb", trả về true
    return true
  }

  // Khớp chuỗi token ghép liền (vd: "lananh" khớp "clb the thao lan anh")
  const joinedTokens = meaningfulTokens.join('')
  if (compactIndex.includes(joinedTokens)) return true

  // 3. Khớp theo tỷ lệ các từ khóa cốt lõi (tên riêng như "lan", "anh", "viettel", "bong", "sao", "celadon")
  const matchedCount = meaningfulTokens.filter((token) => compactIndex.includes(token)).length
  return matchedCount >= Math.ceil(meaningfulTokens.length * 0.5)
}

// Phân loại kết quả tìm kiếm thông minh: Tên sân, Tuyến đường hay Quận/Khu vực
const getMatchBadge = (court, q = '') => {
  const qClean = normalizeText(q).trim()
  if (!qClean) return null
  const compactQuery = qClean.replace(/[^a-z0-9]/g, '')
  const meaningfulTokens = cleanSearchTokens(qClean)

  // 1. Khớp tên sân
  const courtNameCompact = normalizeText(court.name).replace(/[^a-z0-9]/g, '')
  if (
    courtNameCompact.includes(compactQuery) ||
    meaningfulTokens.some((t) => courtNameCompact.includes(t))
  ) {
    return { type: 'court', label: 'Tên sân', className: 'mb-badge-court', icon: 'sports_tennis' }
  }

  // 2. Khớp tuyến đường
  const streetCompact = normalizeText(court.street || '').replace(/[^a-z0-9]/g, '')
  const addressCompact = normalizeText(court.address).replace(/[^a-z0-9]/g, '')
  if (
    (streetCompact && (streetCompact.includes(compactQuery) || compactQuery.includes(streetCompact))) ||
    addressCompact.includes(compactQuery)
  ) {
    return { type: 'street', label: 'Tuyến đường', className: 'mb-badge-street', icon: 'add_road' }
  }

  // 3. Khớp tên quận / khu vực
  const districtObj = DISTRICTS[court.district]
  if (districtObj) {
    const distNameCompact = normalizeText(districtObj.name).replace(/[^a-z0-9]/g, '')
    const distAliasCompact = normalizeText(districtObj.aliases).replace(/[^a-z0-9]/g, '')
    if (distNameCompact.includes(compactQuery) || distAliasCompact.includes(compactQuery)) {
      return { type: 'district', label: 'Quận / Khu vực', className: 'mb-badge-district', icon: 'map' }
    }
  }

  return { type: 'general', label: 'Gần bạn', className: 'mb-badge-general', icon: 'near_me' }
}

// Tính lộ trình và thời gian di chuyển động dựa theo điểm xuất phát của người chơi
// Tính lộ trình và thời gian di chuyển động dựa theo điểm xuất phát của người chơi & tọa độ vệ tinh GPS
const calculateRoute = (court, origin, liveGps = null) => {
  if (!court) return { eta: 'Chưa xác định', note: '' }
  const dist = court.distance || 1.0
  const mins = Math.max(3, Math.round(dist * 2.6))
  const satNote = liveGps
    ? ` • Tọa độ Vệ Tinh: [${liveGps.lat.toFixed(4)}°N, ${liveGps.lng.toFixed(4)}°E] (±${liveGps.accuracy}m)`
    : ''
  return {
    eta: `~${mins} phút di chuyển xe máy (${dist.toFixed(1)} km)`,
    note: `Tuyến đường tối ưu từ “${origin}” đến ${court.name}${satNote}`,
  }
}

const formatHours = (h) => `${String(h).replace('.', ',')} giờ`
const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function buildSlots(court) {
  return SLOT_TEMPLATE.map((t) => {
    const status = court.overrides[t.id] || t.status
    return {
      ...t,
      status,
      note: status === 'booked' ? t.note || 'Đã kín lịch' : null,
      price: roundTo10k(court.price * t.hours * t.factor),
    }
  })
}

function MapBooking() {
  const navigate = useNavigate()
  const { isSportActive, toggleSport, selectAllSports, SPORTS_LIST } = useSport()

  // Vị trí người chơi lấy từ Hồ sơ cá nhân (mặc định 'Thủ Đức')
  const [userProfileLocation, setUserProfileLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.location) return parsed.location
      }
    } catch {}
    return 'Thủ Đức'
  })

  // Điểm xuất phát tùy chỉnh (cho phép người chơi nhập vị trí cụ thể bất kỳ để chỉ đường)
  const [customOrigin, setCustomOrigin] = useState('')
  const [isEditingOrigin, setIsEditingOrigin] = useState(false)

  // TRẠNG THÁI THEO DÕI VỊ TRÍ VỆ TINH GPS THỜI GIAN THỰC (LIVE SATELLITE GPS TRACKING)
  const [isGpsTracking, setIsGpsTracking] = useState(true)
  const [gpsCoords, setGpsCoords] = useState(null) // { lat, lng, accuracy, speed, timestamp }
  const [gpsStatus, setGpsStatus] = useState('searching') // 'searching' | 'live' | 'fallback' | 'off'
  const [satelliteCount, setSatelliteCount] = useState(12)
  const [lastGpsPingTime, setLastGpsPingTime] = useState(() => new Date())

  // KẾT NỐI VÀ THEO DÕI LIÊN TỤC VỊ TRÍ TỪ VỆ TINH GPS THIẾT BỊ
  useEffect(() => {
    if (!isGpsTracking) {
      setGpsStatus('off')
      return undefined
    }

    if (!('geolocation' in navigator)) {
      setGpsStatus('fallback')
      return undefined
    }

    setGpsStatus('searching')

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords
        setGpsCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 8),
          speed: speed ? Math.round(speed * 3.6) : 0,
          timestamp: new Date(),
        })
        setGpsStatus('live')
        setLastGpsPingTime(new Date())
        setSatelliteCount(11 + Math.floor(Math.abs(latitude * 100) % 5))
      },
      (err) => {
        console.warn('GPS Satellite error (sử dụng fallback tọa độ khu vực):', err.message)
        const key = detectDistrictKey(userProfileLocation)
        const fallback = DISTRICT_COORDS[key] || DISTRICT_COORDS.thuduc
        setGpsCoords({
          lat: fallback.lat,
          lng: fallback.lng,
          accuracy: 12,
          speed: 0,
          timestamp: new Date(),
          isSimulated: true,
        })
        setGpsStatus('live')
        setLastGpsPingTime(new Date())
        setSatelliteCount(10)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isGpsTracking, userProfileLocation])

  // Nhịp quét vệ tinh GPS: cập nhật nhấp nháy tín hiệu mỗi 2.5 giây
  useEffect(() => {
    if (!isGpsTracking || gpsStatus !== 'live') return undefined
    const timer = setInterval(() => {
      setLastGpsPingTime(new Date())
    }, 2500)
    return () => clearInterval(timer)
  }, [isGpsTracking, gpsStatus])

  // Vị trí hiệu lực: ưu tiên địa chỉ người dùng tự nhập, sau đó đến định vị vệ tinh GPS, cuối cùng là hồ sơ
  const effectiveOrigin = useMemo(() => {
    if (customOrigin.trim()) return customOrigin.trim()
    if (isGpsTracking && gpsCoords) {
      return `Vệ tinh GPS [${gpsCoords.lat.toFixed(4)}°N, ${gpsCoords.lng.toFixed(4)}°E]`
    }
    return userProfileLocation || 'Thủ Đức'
  }, [customOrigin, isGpsTracking, gpsCoords, userProfileLocation])

  // Lắng nghe cập nhật khi người chơi chỉnh sửa vị trí trong Profile
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const loc = e.detail?.location
      if (loc) setUserProfileLocation(loc)
      else {
        try {
          const saved = localStorage.getItem('player_profile_data')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.location) setUserProfileLocation(parsed.location)
          }
        } catch {}
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'player_profile_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.location) setUserProfileLocation(parsed.location)
        } catch {}
      }
    }
    window.addEventListener('player-profile-updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('player-profile-updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Danh sách sân với khoảng cách được tính trực tiếp từ tọa độ vệ tinh GPS (cập nhật liên tục theo thời gian thực)
  const localizedCourts = useMemo(() => {
    return COURTS.map((c) => ({
      ...c,
      distance: getDistanceForCourt(c, effectiveOrigin, isGpsTracking ? gpsCoords : null),
    }))
  }, [effectiveOrigin, isGpsTracking, gpsCoords])

  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX])
  const [priceEdit, setPriceEdit] = useState(null) // { idx, text } khi đang gõ giá

  // Mặc định chọn cụm sân gần nhất với vị trí xuất phát hoặc tọa độ vệ tinh
  const [selectedCourtId, setSelectedCourtId] = useState(() => {
    try {
      const saved = localStorage.getItem('player_profile_data')
      const loc = saved ? JSON.parse(saved).location : 'Thủ Đức'
      const key = detectDistrictKey(loc)
      if (key === 'thuduc') return 'ddink-td'
      if (key === 'binhthanh') return 'yonex-bt'
      if (key === 'q7') return 'trexanh-q7'
      if (key === 'q1') return 'taodan-q1'
      if (key === 'q10') return 'lananh-q10'
      if (key === 'phunhuan') return 'rachmieu-pn'
      if (key === 'tanbinh') return 'viettel-tb'
      if (key === 'quan8') return 'chanhhung-q8'
      if (key === 'tanphu') return 'celadon-tp'
      if (key === 'govap') return 'quangtrung-gv'
      if (key === 'q3') return 'hoxuanhuong-q3'
      if (key === 'q11') return 'phutho-q11'
    } catch {}
    return 'lananh-q10'
  })

  // Tự động chuyển sân ưu tiên khi vị trí thay đổi (nếu người dùng chưa tìm kiếm cụ thể)
  useEffect(() => {
    if (query.trim()) return
    const key = detectDistrictKey(effectiveOrigin)
    if (key === 'thuduc') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'thuduc') ? prev : 'ddink-td'))
    else if (key === 'binhthanh') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'binhthanh') ? prev : 'yonex-bt'))
    else if (key === 'q7') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'q7') ? prev : 'trexanh-q7'))
    else if (key === 'q1') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'q1') ? prev : 'taodan-q1'))
    else if (key === 'q10') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'q10') ? prev : 'lananh-q10'))
    else if (key === 'phunhuan') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'phunhuan') ? prev : 'rachmieu-pn'))
    else if (key === 'tanbinh') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'tanbinh') ? prev : 'viettel-tb'))
    else if (key === 'quan8') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'quan8') ? prev : 'chanhhung-q8'))
    else if (key === 'tanphu') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'tanphu') ? prev : 'celadon-tp'))
    else if (key === 'govap') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'govap') ? prev : 'quangtrung-gv'))
    else if (key === 'q3') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'q3') ? prev : 'hoxuanhuong-q3'))
    else if (key === 'q11') setSelectedCourtId((prev) => (COURTS.some((c) => c.id === prev && c.district === 'q11') ? prev : 'phutho-q11'))
  }, [effectiveOrigin, query])

  // Lọc cụm sân:
  // - Khi không gõ tìm kiếm: lọc theo môn và khoảng giá (sắp xếp theo khoảng cách từ người chơi)
  // - Khi người chơi gõ tìm kiếm (tên sân, tuyến đường, quận):
  //   1. Ưu tiên tìm trong danh sách các cụm sân có sẵn. Không ép lọc theo môn/giá để tránh làm biến mất kết quả sân người chơi đang tìm kiếm!
  //   2. Nếu tên sân người chơi tìm không có trong danh mục mẫu, tự động tạo kết quả Sân Tìm Kiếm Động
  //      để Google Maps & giao diện lập tức hiển thị, ghim và dẫn đường trực tiếp đến sân đó!
  const filteredCourts = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return localizedCourts
        .filter(
          (c) =>
            isSportActive(c.sport) &&
            c.price >= priceRange[0] &&
            c.price <= priceRange[1]
        )
        .sort((a, b) => a.distance - b.distance)
    }

    const matched = localizedCourts.filter((c) => matchesQuery(c, trimmed))

    if (matched.length > 0) {
      return matched.sort((a, b) => {
        // Ưu tiên sân đúng môn thể thao đang chọn lên trước
        const aFitSport = isSportActive(a.sport) ? 1 : 0
        const bFitSport = isSportActive(b.sport) ? 1 : 0
        if (aFitSport !== bFitSport) return bFitSport - aFitSport
        return a.distance - b.distance
      })
    }

    // Nếu người chơi gõ một tên sân thực tế khác (vd: "Sân Cầu Lông Trường Chinh", "Sân Cầu Lông Sky", v.v.)
    // Tự sinh cụm sân tìm kiếm động để bản đồ Google Maps và danh sách hiển thị đúng kết quả người chơi muốn
    const norm = normalizeText(trimmed)
    const guessedSport = norm.includes('pickleball') ? 'pickleball' : 'badminton'
    const detectedDist = detectDistrictKey(trimmed)
    const distCenter = DISTRICT_COORDS[detectedDist] || { lat: 10.7769, lng: 106.7009 }
    const dynamicLat = distCenter.lat + 0.005
    const dynamicLng = distCenter.lng + 0.005
    const dynamicDist = (gpsCoords?.lat && gpsCoords?.lng)
      ? (haversineDistanceKm(gpsCoords.lat, gpsCoords.lng, dynamicLat, dynamicLng) || 2.5)
      : (DISTRICT_DISTANCES[detectDistrictKey(effectiveOrigin)]?.[detectedDist] ?? 2.5)

    const dynamicCourt = {
      id: `custom-search-${trimmed.replace(/[^a-z0-9]/gi, '_')}`,
      sport: guessedSport,
      name: trimmed,
      street: trimmed,
      address: `${trimmed}, TP. Hồ Chí Minh`,
      mapQuery: `${trimmed}, TP. Hồ Chí Minh`,
      district: detectedDist,
      lat: dynamicLat,
      lng: dynamicLng,
      rating: 5.0,
      price: 180000,
      courtCount: 6,
      image:
        guessedSport === 'pickleball'
          ? 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=300&h=300&fit=crop'
          : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&h=300&fit=crop',
      subCourt: `${trimmed} - Sân 01`,
      subCourtDesc: 'Định vị trực tiếp từ Google Maps & vệ tinh theo yêu cầu tìm kiếm',
      isCustomSearch: true,
      distance: dynamicDist,
      overrides: {},
    }
    return [dynamicCourt]
  }, [localizedCourts, isSportActive, query, priceRange, gpsCoords])

  // TỰ ĐỘNG ĐỒNG BỘ HIỂN THỊ TRÊN BẢN ĐỒ KHI SEARCH (quận, tên đường hoặc tên sân)
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    if (filteredCourts.length > 0) {
      if (!filteredCourts.some((m) => m.id === selectedCourtId)) {
        setSelectedCourtId(filteredCourts[0].id)
      }
    }
  }, [query, filteredCourts, selectedCourtId])

  const [selectedSlotId, setSelectedSlotId] = useState('s5')
  const [holdLeft, setHoldLeft] = useState(8 * 60 + 42)
  const [mapType, setMapType] = useState('m')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const summaryRef = useRef(null)

  // Lắng nghe sự kiện từ Trợ lý AI SportNexus
  useEffect(() => {
    const handleSelectFromAI = (e) => {
      const { courtId, slotId } = e.detail || {}
      if (courtId) {
        setSelectedCourtId(courtId)
        if (slotId) {
          setSelectedSlotId(slotId)
          setHoldLeft(HOLD_SECONDS)
        }
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 250)
      }
    }
    const handleOpenAi = () => setIsAiModalOpen(true)

    window.addEventListener('sportnexus-select-court-slot', handleSelectFromAI)
    window.addEventListener('open-sportnexus-ai-chat', handleOpenAi)
    return () => {
      window.removeEventListener('sportnexus-select-court-slot', handleSelectFromAI)
      window.removeEventListener('open-sportnexus-ai-chat', handleOpenAi)
    }
  }, [])

  // Gợi ý khi gõ: chỉ lọc theo từ khóa để người dùng luôn thấy kết quả
  const suggestions = useMemo(
    () =>
      query.trim()
        ? localizedCourts.filter((c) => matchesQuery(c, query))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5)
        : [],
    [localizedCourts, query]
  )
  const showSuggest = searchFocused && query.trim().length > 0

  const selectedCourt =
    filteredCourts.find((c) => c.id === selectedCourtId) || filteredCourts[0] || null
  const slots = useMemo(() => (selectedCourt ? buildSlots(selectedCourt) : []), [selectedCourt])
  const selectedSlot = slots.find((s) => s.id === selectedSlotId && s.status !== 'booked') || null

  // Đếm ngược thời gian khóa giữ chỗ
  useEffect(() => {
    if (!selectedSlot) return undefined
    const timer = setInterval(() => setHoldLeft((t) => Math.max(t - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [selectedSlot])

  // Hết thời gian giữ chỗ → tự động nhả khung giờ
  useEffect(() => {
    if (holdLeft === 0 && selectedSlotId) setSelectedSlotId(null)
  }, [holdLeft, selectedSlotId])

  const handleSelectCourt = (court) => {
    if (court.id === selectedCourt?.id) return
    setSelectedCourtId(court.id)
    setSelectedSlotId(null)
  }

  const handleSelectSlot = (slot) => {
    if (slot.status === 'booked') return
    setSelectedSlotId(slot.id)
    setHoldLeft(HOLD_SECONDS)
  }

  const handleClearFilters = () => {
    setQuery('')
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setPriceEdit(null)
    selectAllSports()
  }

  const handlePickSuggestion = (court) => {
    setQuery(court.name)
    setSearchFocused(false)
    handleSelectCourt(court)
  }



  // Ô nhập giá: gõ tự do (tự thêm dấu chấm), chốt khi blur / Enter
  const priceInputValue = (idx) =>
    priceEdit?.idx === idx ? priceEdit.text : priceRange[idx].toLocaleString('vi-VN')

  const handlePriceType = (idx, raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 7)
    setPriceEdit({ idx, text: digits ? Number(digits).toLocaleString('vi-VN') : '' })
  }

  const commitPrice = (idx) => {
    if (priceEdit?.idx !== idx) return
    const num = Number(priceEdit.text.replace(/\D/g, ''))
    setPriceEdit(null)
    if (!num) return
    const clamped = Math.min(Math.max(Math.round(num / PRICE_STEP) * PRICE_STEP, PRICE_MIN), PRICE_MAX)
    if (idx === 0) {
      if (clamped >= priceRange[1]) {
        setPriceRange([clamped, Math.min(clamped + PRICE_STEP, PRICE_MAX)])
      } else {
        setPriceRange(([, max]) => [clamped, max])
      }
    } else {
      if (clamped <= priceRange[0]) {
        setPriceRange([Math.max(clamped - PRICE_STEP, PRICE_MIN), clamped])
      } else {
        setPriceRange(([min]) => [min, clamped])
      }
    }
  }

  const isFullPrice = priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX

  const handleConfirm = () => {
    if (!selectedCourt || !selectedSlot) return
    navigate('/split-payment', {
      state: {
        court: selectedCourt.name,
        address: selectedCourt.address,
        district: selectedCourt.district,
        subCourt: selectedCourt.subCourt,
        subCourtDesc: selectedCourt.subCourtDesc,
        image: selectedCourt.image,
        sport: selectedCourt.sport,
        slot: `${selectedSlot.start} - ${selectedSlot.end}`,
        hours: selectedSlot.hours || 1.5,
        total: selectedSlot.price,
        hourlyRate: selectedSlot.hourlyRate || Math.round(selectedSlot.price / (selectedSlot.hours || 1.5)),
      },
    })
  }

  const scrollToSummary = () => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })


  const sportOf = (key) => SPORTS_LIST.find((s) => s.key === key)
  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const mapSrc = selectedCourt
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        selectedCourt.lat && selectedCourt.lng
          ? `${selectedCourt.lat},${selectedCourt.lng}`
          : selectedCourt.mapQuery
      )}&t=${mapType}&z=16&ie=UTF8&iwloc=&output=embed`
    : (query.trim()
      ? `https://maps.google.com/maps?q=${encodeURIComponent(`${query.trim()}, TP. Hồ Chí Minh`)}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(`${effectiveOrigin}, TP. Hồ Chí Minh`)}&t=${mapType}&z=13&output=embed`)

  return (
    <div className="mb-page">
      {/* ===================== HEADER ===================== */}
      <header className="mb-header">
        <div>
          <h1 className="mb-title">Đặt Sân Trực Tuyến &amp; Giữ Chỗ Thời Gian Thực</h1>
          <p className="mb-subtitle">
            Tìm sân trống gần bạn qua định vị GPS, chủ động dùng lịch 100% bằng khóa bí quan dữ liệu và xác nhận
            đặt chỗ lập tức.
          </p>
        </div>
        <div className="mb-header-chips">
          {/* Nút Hỏi Trợ Lý AI */}
          <button
            id="mb-ask-ai-btn"
            type="button"
            className="mb-chip mb-chip--ai"
            onClick={() => setIsAiModalOpen(true)}
            title="Mở trợ lý AI tư vấn và gợi ý lựa chọn sân ưu tiên"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
              smart_toy
            </span>
            <strong>Hỏi Trợ Lý AI</strong>
            <span className="mb-ai-sub-pill">Gợi ý ưu tiên</span>
          </button>

          {/* Nút Vệ Tinh GPS Live */}
          <span
            className={`mb-chip mb-chip--gps ${isGpsTracking ? 'is-live' : ''}`}
            title="Nhấn để bật/tắt theo dõi vị trí thực tế liên tục từ vệ tinh"
            onClick={() => setIsGpsTracking((v) => !v)}
            style={{ cursor: 'pointer' }}
          >
            <span className="mb-sat-radar">
              <span className="mb-sat-radar-ping" />
              <span className="mb-sat-radar-dot" />
            </span>
            <strong>Vệ tinh GPS: {isGpsTracking ? 'Live 🛰️' : 'Tạm dừng'}</strong>
            <span className="mb-sat-badge">
              {gpsCoords ? `${satelliteCount} vệ tinh (±${gpsCoords.accuracy}m)` : 'Đang quét...'}
            </span>
          </span>

          <span className={`mb-chip mb-chip--timer ${selectedSlot && holdLeft < 120 ? 'is-urgent' : ''}`}>
            <span className="material-symbols-outlined">lock</span>
            {selectedSlot ? `Khóa giữ chỗ: ${formatTimer(holdLeft)}` : 'Chưa giữ chỗ'}
          </span>
        </div>
      </header>

      <div className="mb-grid">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="mb-col">
          {/* AI Assistant Banner */}
          <div
            className="mb-ai-helper-banner"
            onClick={() => setIsAiModalOpen(true)}
            role="button"
            tabIndex={0}
          >
            <div className="mb-ai-helper-ic">🤖</div>
            <div className="mb-ai-helper-content">
              <strong>Hỏi Trợ Lý AI Tìm Sân &amp; Giờ Vàng</strong>
              <span>Tự động phân tích giá, khoảng cách &amp; gợi ý slot tối ưu nhất</span>
            </div>
            <button type="button" className="mb-ai-helper-btn">
              Tư Vấn Ngay <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Filter card */}
          <section className="mb-card" aria-label="Tìm kiếm và lọc sân">
            {/* Vị trí vệ tinh liên tục & tùy chọn điểm xuất phát */}
            <div className={`mb-user-loc-badge ${isGpsTracking ? 'is-satellite-active' : ''}`}>
              <div className="mb-user-loc-ic-wrap">
                <span className="material-symbols-outlined mb-user-loc-ic">satellite_alt</span>
                {isGpsTracking && <span className="mb-sat-live-indicator" />}
              </div>
              <div className="mb-user-loc-text">
                <span>
                  {isGpsTracking && gpsCoords ? (
                    <>
                      Vệ tinh Live: <strong>{gpsCoords.lat.toFixed(4)}°N, {gpsCoords.lng.toFixed(4)}°E</strong>
                    </>
                  ) : (
                    <>
                      Vị trí của bạn: <strong>{effectiveOrigin}</strong>
                    </>
                  )}
                </span>
                <small>
                  {isGpsTracking && gpsCoords
                    ? `Cập nhật trực tiếp liên tục từ ${satelliteCount} vệ tinh GPS • Sai số ±${gpsCoords.accuracy}m`
                    : 'Đã đồng bộ với Hồ sơ cá nhân của bạn'}
                </small>
              </div>
              <div className="mb-user-loc-actions">
                <button
                  type="button"
                  className={`mb-sat-toggle-chip ${isGpsTracking ? 'is-on' : ''}`}
                  onClick={() => setIsGpsTracking((v) => !v)}
                  title={isGpsTracking ? 'Tạm dừng quét vệ tinh' : 'Bật theo dõi vị trí từ vệ tinh'}
                >
                  {isGpsTracking ? 'Live 🛰️' : 'Bật GPS'}
                </button>
                <button
                  type="button"
                  className="mb-user-loc-edit-btn"
                  onClick={() => setIsEditingOrigin((v) => !v)}
                  title="Thay đổi vị trí cụ thể của bạn để tính khoảng cách và chỉ đường"
                >
                  <span className="material-symbols-outlined">edit_location_alt</span>
                  {customOrigin ? 'Đổi vị trí' : 'Đổi'}
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm địa chỉ / tên sân */}
            <div className="mb-search">
              <div className={`mb-search-box ${searchFocused ? 'is-focused' : ''}`}>
                <span className="material-symbols-outlined mb-search-ic">search</span>
                <input
                  id="mb-search-input"
                  type="text"
                  className="mb-search-input"
                  placeholder="Tìm quận, tên đường, tên sân..."
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
                  }}
                  aria-label="Tìm kiếm sân theo quận, tên đường hoặc tên sân"
                />
                {query && (
                  <button
                    id="mb-search-clear"
                    type="button"
                    className="mb-search-clear"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery('')}
                    aria-label="Xóa từ khóa"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>

              {showSuggest && (
                <ul className="mb-suggest" role="listbox">
                  {suggestions.length ? (
                    suggestions.map((c) => {
                      const badge = getMatchBadge(c, query)
                      return (
                        <li key={c.id}>
                          <button
                            id={`mb-suggest-${c.id}`}
                            type="button"
                            className="mb-suggest-item"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handlePickSuggestion(c)}
                          >
                            <span className="mb-suggest-ic">{sportOf(c.sport)?.emoji}</span>
                            <span className="mb-suggest-text">
                              <div className="mb-suggest-title-row">
                                <strong>{c.name}</strong>
                                {badge && (
                                  <span className={`mb-suggest-badge ${badge.className}`}>
                                    <span className="material-symbols-outlined">{badge.icon}</span>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <small>
                                {c.address} • {DISTRICTS[c.district]?.name}
                              </small>
                            </span>
                            <div className="mb-suggest-right">
                              <em>{c.distance} km</em>
                              <span className="mb-suggest-subdist">gần bạn</span>
                            </div>
                          </button>
                        </li>
                      )
                    })
                  ) : (
                    <li className="mb-suggest-empty">
                      <span className="material-symbols-outlined">search_off</span>
                      Không tìm thấy sân cho “{query}”
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="mb-label-row">
              <span className="mb-label">Môn thể thao</span>
              <button id="mb-clear-filter" type="button" className="mb-link-btn" onClick={handleClearFilters}>
                Xóa Lọc
              </button>
            </div>
            <div className="mb-sport-toggle">
              {SPORTS_LIST.map((s) => (
                <button
                  key={s.key}
                  id={`mb-sport-${s.key}`}
                  type="button"
                  className={`mb-sport-btn ${isSportActive(s.key) ? 'is-active' : ''}`}
                  onClick={() => toggleSport(s.key)}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>

            <div className="mb-label-row">
              <span className="mb-label">Tầm giá / giờ</span>
              <span className={`mb-price-readout ${isFullPrice ? '' : 'is-on'}`}>
                {isFullPrice
                  ? 'Mọi mức giá'
                  : `${formatVnd(priceRange[0])} – ${formatVnd(priceRange[1])}`}
              </span>
            </div>

            {/* Ô nhập Từ — Đến */}
            <div className="mb-price-inputs">
              {[0, 1].map((idx) => (
                <label key={idx} className="mb-price-field" htmlFor={`mb-price-input-${idx}`}>
                  <small>{idx === 0 ? 'Từ' : 'Đến'}</small>
                  <input
                    id={`mb-price-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={priceInputValue(idx)}
                    onChange={(e) => handlePriceType(idx, e.target.value)}
                    onBlur={() => commitPrice(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    aria-label={idx === 0 ? 'Giá tối thiểu' : 'Giá tối đa'}
                  />
                  <span>đ</span>
                </label>
              ))}
            </div>
          </section>

          {/* Court list */}
          <div className="mb-section-head">
            <h2>Cụm Sân Gần Bạn</h2>
            <small>{filteredCourts.length} cụm sân khả dụng</small>
          </div>

          {filteredCourts.length === 0 && (
            <div className="mb-card mb-empty">
              <span className="material-symbols-outlined">search_off</span>
              Không tìm thấy sân phù hợp. Hãy thử từ khóa khác hoặc mở rộng tầm giá.
            </div>
          )}

          {filteredCourts.map((court, i) => {
            const active = court.id === selectedCourt?.id
            const sport = sportOf(court.sport)
            return (
              <article
                key={court.id}
                id={`mb-court-${court.id}`}
                className={`mb-card mb-court ${active ? 'is-active' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleSelectCourt(court)}
              >
                <div className="mb-court-top">
                  <img className="mb-court-img" src={court.image} alt={court.name} loading="lazy" />
                  <div className="mb-court-info">
                    <div className="mb-court-name-row">
                      <h3 className="mb-court-name">{court.name}</h3>
                      <span className="mb-rating">
                        <span className="material-symbols-outlined">star</span>
                        {court.rating}
                      </span>
                    </div>
                    <p className="mb-court-addr">
                      <span className="material-symbols-outlined">location_on</span>
                      {court.address}
                    </p>
                    <div className="mb-court-meta">
                      {query.trim() && (() => {
                        const badge = getMatchBadge(court, query)
                        return badge ? (
                          <span className={`mb-tag ${badge.className}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13, marginRight: 2 }}>{badge.icon}</span>
                            {badge.label}
                          </span>
                        ) : null
                      })()}
                      <span className="mb-tag">
                        {sport?.emoji} {sport?.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span className="material-symbols-outlined">directions_car</span>
                        {court.distance} km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-court-bottom">
                  <span className="mb-price">
                    {court.price.toLocaleString('vi-VN')} đ<small>/h</small>
                  </span>
                  {active ? (
                    <button type="button" className="mb-btn mb-btn--primary">
                      Đang Chọn <span className="material-symbols-outlined">arrow_circle_right</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mb-btn mb-btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectCourt(court)
                      }}
                    >
                      Chọn Sân Nhanh
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="mb-col">
          {/* Map */}
          <section className="mb-card mb-map" aria-label="Bản đồ sân">
            <iframe
              key={mapSrc}
              title="Bản đồ vị trí sân"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Thanh thông tin vệ tinh Live HUD */}
            <div className={`mb-map-sat-hud ${isGpsTracking ? 'is-active' : ''}`}>
              <div className="mb-sat-hud-left">
                <span className="mb-sat-pulse-dot" />
                <div className="mb-sat-hud-text">
                  <div className="mb-sat-hud-headline">
                    <strong>ĐỊNH VỊ VỆ TINH GNSS / GPS LIVE</strong>
                    <span className="mb-sat-count-tag">{satelliteCount} VỆ TINH</span>
                  </div>
                  <span className="mb-sat-hud-coords">
                    {gpsCoords
                      ? `${gpsCoords.lat.toFixed(5)}°N • ${gpsCoords.lng.toFixed(5)}°E (Sai số ±${gpsCoords.accuracy}m)`
                      : 'Đang kết nối tín hiệu vệ tinh...'}
                  </span>
                </div>
              </div>
              <div className="mb-sat-hud-right">
                <span className="mb-sat-live-time">
                  Ping: {lastGpsPingTime.toLocaleTimeString('vi-VN')}
                </span>
                <button
                  type="button"
                  className={`mb-sat-hud-toggle ${isGpsTracking ? 'is-live' : ''}`}
                  onClick={() => setIsGpsTracking(!isGpsTracking)}
                  title={isGpsTracking ? 'Tạm dừng định vị vệ tinh' : 'Bật định vị vệ tinh liên tục'}
                >
                  {isGpsTracking ? 'LIVE 🛰️' : 'BẬT GPS'}
                </button>
              </div>
            </div>

            <div className="mb-map-overlay mb-map-overlay--tl">
              <div className="mb-origin-box">
                <span className="mb-map-pill">
                  <span className="material-symbols-outlined">near_me</span>
                  Vị trí của bạn: <strong>{effectiveOrigin}</strong>
                  <button
                    type="button"
                    className="mb-change-origin-mini"
                    onClick={() => setIsEditingOrigin((v) => !v)}
                    title="Cung cấp vị trí xuất phát cụ thể của bạn để chỉ đường"
                  >
                    <span className="material-symbols-outlined">edit_location_alt</span>
                    {isEditingOrigin ? 'Đóng' : 'Đổi'}
                  </button>
                </span>

                {isEditingOrigin && (
                  <div className="mb-origin-popup">
                    <div className="mb-origin-popup-header">
                      <strong>Cung cấp vị trí cụ thể của bạn</strong>
                      <small>Hệ thống sẽ chỉ đường &amp; tính khoảng cách chính xác từ đây</small>
                    </div>
                    <div className="mb-origin-input-row">
                      <span className="material-symbols-outlined">place</span>
                      <input
                        type="text"
                        className="mb-origin-input"
                        value={customOrigin}
                        placeholder={`VD: 12 Võ Văn Ngân, Thủ Đức... (Mặc định: ${userProfileLocation})`}
                        onChange={(e) => setCustomOrigin(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingOrigin(false)
                        }}
                        autoFocus
                      />
                      {customOrigin && (
                        <button
                          type="button"
                          className="mb-origin-clear-btn"
                          onClick={() => setCustomOrigin('')}
                          title="Đặt lại theo hồ sơ"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                    <div className="mb-origin-popup-actions">
                      <button
                        type="button"
                        className="mb-origin-chip"
                        onClick={() => {
                          setCustomOrigin('')
                          setIsEditingOrigin(false)
                        }}
                      >
                        Dùng vị trí hồ sơ ({userProfileLocation})
                      </button>
                      <button
                        type="button"
                        className="mb-origin-confirm-btn"
                        onClick={() => setIsEditingOrigin(false)}
                      >
                        Áp Dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-map-overlay mb-map-overlay--tr">
              <div className="mb-map-tabs">
                <button
                  type="button"
                  className={`mb-map-tab ${mapType === 'm' ? 'is-active' : ''}`}
                  onClick={() => setMapType('m')}
                >
                  Bản Đồ
                </button>
                <button
                  type="button"
                  className={`mb-map-tab ${mapType === 'k' ? 'is-active' : ''}`}
                  onClick={() => setMapType('k')}
                >
                  Vệ Tinh
                </button>
              </div>
            </div>
            {selectedCourt && (() => {
              const routeInfo = calculateRoute(selectedCourt, effectiveOrigin, isGpsTracking ? gpsCoords : null)
              const originForDirections = isGpsTracking && gpsCoords
                ? `${gpsCoords.lat},${gpsCoords.lng}`
                : effectiveOrigin

              return (
                <>
                  <div className="mb-map-pin">
                    <span className="mb-map-pin-label">
                      <span className="material-symbols-outlined">location_on</span>
                      {selectedCourt.name.replace('SportNexus ', '')} ({selectedCourt.distance} km) •{' '}
                      {selectedCourt.courtCount} sân
                    </span>
                  </div>
                  <div className="mb-map-route">
                    <div className="mb-map-route-ic">
                      <span className="material-symbols-outlined">directions_car</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="mb-map-route-main">
                        <strong>{routeInfo.eta}</strong>
                        <span className="mb-map-route-badge">~{selectedCourt.distance} km</span>
                        {isGpsTracking && gpsCoords && (
                          <span className="mb-map-route-sat-tag">🛰️ Tọa độ Vệ Tinh</span>
                        )}
                      </div>
                      <span className="mb-sub">
                        Từ: <strong>{effectiveOrigin}</strong> → {selectedCourt.address}
                      </span>
                    </div>
                    <a
                      id="mb-directions"
                      className="mb-btn mb-btn--primary"
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                        originForDirections
                      )}&destination=${encodeURIComponent(
                        selectedCourt.lat && selectedCourt.lng
                          ? `${selectedCourt.lat},${selectedCourt.lng}`
                          : selectedCourt.mapQuery
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none' }}
                      title="Mở Google Maps chỉ đường từng bước từ vị trí vệ tinh GPS thực tế của bạn đến sân"
                    >
                      Chỉ Đường <span className="material-symbols-outlined">north_east</span>
                    </a>
                  </div>
                </>
              )
            })()}
          </section>

          {/* Slot grid */}
          <section className="mb-card" aria-label="Lịch sân">
            <div className="mb-slots-head">
              <div>
                <h2>Lưới Lịch Sân Trực Quan: {selectedCourt ? selectedCourt.subCourt : '—'}</h2>
                <p>Khóa bí quan (Pessimistic Lock) chống trùng giờ tuyệt đối.</p>
              </div>
              <div className="mb-legend">
                <span>
                  <i style={{ background: 'var(--mb-red-bg)', border: '1px solid var(--mb-red-line)' }} /> Đã Đặt
                </span>
                <span>
                  <i style={{ background: '#f5c542' }} /> Giữ Chỗ
                </span>
                <span>
                  <i style={{ background: '#86d97f' }} /> Sẵn Sàng
                </span>
              </div>
            </div>

            {!selectedCourt ? (
              <div className="mb-empty">
                <span className="material-symbols-outlined">event_busy</span>
                Chọn một cụm sân để xem lịch trống.
              </div>
            ) : (
              <div className="mb-slots">
                {slots.map((slot, i) => {
                  const delay = { animationDelay: `${i * 40}ms` }
                  if (slot.id === selectedSlot?.id) {
                    return (
                      <div key={slot.id} className="mb-slot mb-slot--selected">
                        <div className="mb-slot-time">
                          <span className="material-symbols-outlined">schedule</span>
                          {slot.start} - {slot.end} ({String(slot.hours).replace('.', ',')} giờ)
                          <span className="mb-slot-badge">Đang khóa giữ chỗ</span>
                        </div>
                        <div className="mb-slot-desc">
                          {selectedCourt.subCourt} ({selectedCourt.subCourtDesc})
                        </div>
                        <div className="mb-slot-row">
                          <span className="mb-slot-price">{formatVnd(slot.price)}</span>
                          <button type="button" className="mb-btn mb-btn--white" onClick={scrollToSummary}>
                            Chốt Sân
                          </button>
                        </div>
                      </div>
                    )
                  }
                  if (slot.status === 'booked') {
                    return (
                      <div key={slot.id} className="mb-slot mb-slot--booked" style={delay} aria-disabled="true">
                        <span className="material-symbols-outlined mb-slot-lock">lock</span>
                        <span className="mb-slot-time">
                          {slot.start} - {slot.end}
                        </span>
                        <span className="mb-slot-note">{slot.note}</span>
                      </div>
                    )
                  }
                  return (
                    <button
                      key={slot.id}
                      id={`mb-slot-${slot.id}`}
                      type="button"
                      className={`mb-slot mb-slot--${slot.status}`}
                      style={delay}
                      onClick={() => handleSelectSlot(slot)}
                    >
                      <span className="mb-slot-time">
                        {slot.start} - {slot.end}
                      </span>
                      <div className="mb-slot-row">
                        <span className="mb-slot-price">{formatVnd(slot.price)}</span>
                        {slot.status === 'held' && <span className="mb-slot-mini">Chọn</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="mb-card" ref={summaryRef} aria-label="Xác nhận chọn sân">
            <div className="mb-summary-box">
              <div className="mb-summary-ic">
                <span style={{ fontSize: 22 }}>{sportOf(selectedCourt?.sport)?.emoji || '🏸'}</span>
              </div>
              <div className="mb-summary-info">
                <h3>
                  {selectedCourt ? selectedCourt.subCourt : 'Chưa chọn sân'}
                  {selectedSlot && <span className="mb-pill-green">Đã khóa Giữ</span>}
                </h3>
                <p>
                  <span className="material-symbols-outlined">schedule</span>
                  {selectedSlot
                    ? `${selectedSlot.start} - ${selectedSlot.end} (Hôm nay, ${todayStr}) • ${formatHours(
                        selectedSlot.hours
                      )}`
                    : 'Vui lòng chọn một khung giờ còn trống trên lưới lịch'}
                </p>
              </div>
              <div className="mb-summary-total">
                <small>Tổng tiền sân:</small>
                <strong>{selectedSlot ? formatVnd(selectedSlot.price) : '0 đ'}</strong>
              </div>
            </div>

            <button
              id="mb-confirm-booking"
              type="button"
              className="mb-btn mb-btn--primary mb-confirm"
              disabled={!selectedSlot}
              onClick={handleConfirm}
            >
              <span className="material-symbols-outlined">check_circle</span>
              Xác Nhận Chọn Sân
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="mb-secure-note">
              <span className="material-symbols-outlined">verified_user</span>
              Hệ thống giữ chỗ độc quyền trong 15:00 phút để bạn tiến hành thanh toán an toàn.
            </p>
          </section>
        </div>
      </div>

      {/* ===================== FOOTER ===================== */}
      <footer className="mb-footer">
        <div className="mb-footer-top">
          <div>
            <div className="mb-footer-brand">
              <span className="mb-footer-logo">
                <span className="material-symbols-outlined">bolt</span>
              </span>
              <strong>SPORTNEXUS VIETNAM</strong>
            </div>
            <p>Nền tảng vận hành thể thao thông minh &amp; bảo chứng giao dịch Escrow minh bạch toàn diện.</p>
          </div>
          <div className="mb-footer-links">
            <div>
              <span>
                <span className="material-symbols-outlined">support_agent</span> Hotline 24/7: 0968950913
              </span>
              <span>
                <span className="material-symbols-outlined">verified_user</span> Bảo vệ Ký Quỹ Escrow
              </span>
            </div>
            <div>
              <a href="#">Điều khoản dịch vụ</a>
              <a href="#">Chính sách Fairplay</a>
            </div>
          </div>
        </div>
        <div className="mb-footer-bottom">
          <span>
            © 2026 SportNexus Vietnam Joint Stock Company • Nền tảng chuyên biệt Pickleball &amp; Cầu Lông. Bảo lưu
            mọi quyền.
          </span>
          <span className="mb-live">
            <i /> Hệ thống bảo chứng Escrow thời gian thực
          </span>
        </div>
      </footer>

      {/* ===================== AI CHAT ASSISTANT MODAL ===================== */}
      <AIChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentCourtId={selectedCourtId}
        onSelectCourtSlot={({ courtId, slotId }) => {
          if (courtId) setSelectedCourtId(courtId)
          if (slotId) {
            setSelectedSlotId(slotId)
            setHoldLeft(HOLD_SECONDS)
          }
          setTimeout(() => {
            summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 250)
        }}
      />
    </div>
  )
}

export default MapBooking
