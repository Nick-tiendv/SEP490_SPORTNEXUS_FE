// Fictional, in-memory prototype records. KPI snapshots are not totals of this sample.
export const facilityStats = [
  { label: 'Tổng cơ sở sân', value: 3890, trend: '+15,2% so với tháng trước', icon: 'facilities' },
  { label: 'Cơ sở đang hoạt động', value: 3642, trend: '93,6% cơ sở hoạt động', icon: 'active' },
  { label: 'Đang bảo trì', value: 168, trend: '4,3% tổng cơ sở', icon: 'maintenance' },
  { label: 'Tổng số sân', value: 28450, trend: '+10,4% so với tháng trước', icon: 'courts' },
]
export const sportLabels = { Badminton: 'Cầu lông', Pickleball: 'Pickleball', Tennis: 'Quần vợt', Football: 'Bóng đá' }
export const statusLabels = { Active: 'Hoạt động', Maintenance: 'Đang bảo trì', Disabled: 'Vô hiệu hóa' }
export const courtStatusLabels = { Available: 'Sẵn sàng', InUse: 'Đang sử dụng', Maintenance: 'Bảo trì', Disabled: 'Tạm ngưng' }
export const facilityOwners = [
  { id: 'OWN-7721', name: 'Nguyễn Văn A', verified: true },
  { id: 'OWN-7719', name: 'Trần Quốc Bảo', verified: true },
  { id: 'OWN-7688', name: 'Lê Thị Mỹ Hương', verified: true },
  { id: 'OWN-7640', name: 'Đặng Minh Tuấn', verified: true },
  { id: 'OWN-7122', name: 'Hoàng Đình Khang', verified: false },
]
// Reuse the existing local asset. These crops are illustrative, not venue photographs.
export const facilityPhotos = [
  { src: '/sports-bg.jpg', position: '20% 55%', label: 'Toàn cảnh minh họa' },
  { src: '/sports-bg.jpg', position: '65% 70%', label: 'Khu thể thao minh họa' },
  { src: '/sports-bg.jpg', position: '90% 50%', label: 'Không gian minh họa' },
]
export const formatNumber = value => value.toLocaleString('vi-VN')
export function makeCourts(count, sports, existing = []) {
  return Array.from({ length: count }, (_, index) => ({
    id: `COURT-${index + 1}`, name: `Sân ${sportLabels[sports[index % sports.length]]} ${String(index + 1).padStart(2, '0')}`,
    sport: sports[index % sports.length], status: existing[index]?.status || 'Available',
  }))
}
const samples = [
  ['Trung tâm thể thao Sunrise Riverside', 0, 'Nhà Bè', ['Badminton', 'Pickleball'], 12, 'Active', 4.9, 420, 'Đường Nguyễn Hữu Thọ'],
  ['CLB Pickleball Phú Mỹ Hưng', 0, 'Quận 7', ['Pickleball'], 6, 'Active', 4.8, 215, 'Đường Tân Phú'],
  ['Sân cầu lông Bình Hưng Thiên An', 3, 'Bình Chánh', ['Badminton', 'Tennis'], 12, 'Active', 4.6, 180, 'Đường Nguyễn Văn Linh'],
  ['Trung tâm thể thao Thảo Điền', 1, 'Thủ Đức', ['Tennis', 'Pickleball'], 8, 'Maintenance', 4.7, 96, 'Đường Quốc Hương'],
  ['CLB cầu lông Sơn Trà Xanh', 4, 'Tân Bình', ['Badminton'], 10, 'Active', 4.3, 87, 'Đường Hoàng Hoa Thám'],
  ['Sân bóng đá Phú Thọ', 1, 'Quận 11', ['Football'], 4, 'Active', 4.5, 132, 'Đường Lý Thường Kiệt'],
  ['CLB quần vợt An Phú', 2, 'Thủ Đức', ['Tennis'], 6, 'Disabled', 4.1, 73, 'Đường Mai Chí Thọ'],
  ['Sân Pickleball Bình Thạnh', 2, 'Bình Thạnh', ['Pickleball'], 8, 'Active', 4.8, 156, 'Đường Điện Biên Phủ'],
  ['Trung tâm thể thao Gia Định', 3, 'Gò Vấp', ['Badminton', 'Football'], 10, 'Active', 4.2, 65, 'Đường Nguyễn Kiệm'],
  ['Sân cầu lông Phú Nhuận', 4, 'Phú Nhuận', ['Badminton'], 6, 'Maintenance', 3.9, 45, 'Đường Phan Xích Long'],
  ['CLB quần vợt Nam Sài Gòn', 0, 'Quận 7', ['Tennis'], 5, 'Active', 4.7, 104, 'Đường Nguyễn Lương Bằng'],
  ['Sân bóng đá Tân Phú', 1, 'Tân Phú', ['Football'], 3, 'Disabled', 3.8, 30, 'Đường Lũy Bán Bích'],
  ['CLB Pickleball Hòa Bình', 2, 'Quận 11', ['Pickleball'], 8, 'Active', 4.4, 92, 'Đường Hòa Bình'],
  ['Sân cầu lông Đông Hòa', 3, 'Thủ Đức', ['Badminton'], 6, 'Active', 4.6, 58, 'Đường Phạm Văn Đồng'],
  ['Trung tâm thể thao An Lạc', 4, 'Bình Tân', ['Badminton', 'Pickleball'], 10, 'Maintenance', 4, 39, 'Đường Kinh Dương Vương'],
]
export const initialFacilities = samples.map(([name, ownerIndex, location, sports, count, status, rating, reviews, street], index) => {
  const courts = makeCourts(count, sports)
  if (index === 0) { courts[1].status = 'Maintenance'; courts[2].status = 'InUse' }
  return { id: `DEMO-FAC-${String(index + 1).padStart(2, '0')}`, name, owner: facilityOwners[ownerIndex], location,
    sports, courts, status, rating, reviews, address: `${street}, ${location}, TP. Hồ Chí Minh`,
    opens: '05:30', closes: '23:00', category: 'Cơ sở thể thao tổng hợp', photos: facilityPhotos,
  }
})
export function getCourtStatus(facility, court) {
  return facility.status === 'Disabled' ? 'Disabled' : facility.status === 'Maintenance' ? 'Maintenance' : court.status
}
