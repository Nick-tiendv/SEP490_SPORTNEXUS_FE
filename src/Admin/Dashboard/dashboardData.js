import { Users, UserRoundCheck, Building2, CalendarDays, Wallet, Network, Flag, ShieldCheck, TriangleAlert, MessageSquareWarning, ClipboardCheck, CircleDollarSign } from 'lucide-react'

// Presentation-only mock data. No backend requests or payment operations.
export const stats = [
  { label: 'Total Users', value: '148,250', icon: Users, trend: '+12.4%', supporting: 'so với tháng trước' },
  { label: 'Active Court Owners', value: '1,420', icon: UserRoundCheck, trend: '+8.2%', supporting: 'so với tháng trước' },
  { label: 'Sports Facilities', value: '3,890', icon: Building2, trend: '+6.5%', supporting: 'đang hoạt động' },
  { label: 'Total Bookings', value: '94,620', icon: CalendarDays, trend: '+18.6%', supporting: 'so với tháng trước' },
  { label: 'Platform Revenue', value: '4.580.000.000 đ', icon: Wallet, trend: '+24.8%', supporting: 'doanh thu tháng này' },
  { label: 'Active LFG', value: '1,845', icon: Network, trend: '+15.2%', supporting: 'so với tháng trước' },
]
export const trends = {
  '7 ngày': [17, 30, 34, 33, 37, 43, 48],
  '30 ngày': [13, 22, 34, 40, 39, 42, 53, 51],
  '90 ngày': [15, 19, 27, 24, 35, 41, 45, 57],
}
export const sports = [
  { name: 'Cầu lông (Badminton)', count: '42.5%', bookings: '40,215 lượt đặt', width: 85 },
  { name: 'Pickleball', count: '28.0%', bookings: '26,894 lượt đặt', width: 65 },
  { name: 'Bóng đá mini (Football)', count: '16.0%', bookings: '15,140 lượt đặt', width: 43 },
  { name: 'Tennis', count: '10.0%', bookings: '9,462 lượt đặt', width: 29 },
  { name: 'Bóng rổ (Basketball)', count: '3.5%', bookings: '2,909 lượt đặt', width: 13 },
]
export const attention = [
  { title: '12 Chủ sân chờ KYC', text: 'Giấy tờ xác minh chưa đầy đủ hoặc đang chờ Admin phê duyệt.', icon: ClipboardCheck, tone: 'green', detail: 'High Priority', action: 'Duyệt ngay' },
  { title: '5 Báo cáo vi phạm', text: 'Có booking / review bị báo cáo cần được kiểm tra và xử lý.', icon: Flag, tone: 'red', detail: 'Cần kiểm tra', action: 'Kiểm tra' },
  { title: '3 Khiếu nại Escrow', text: 'Yêu cầu hoàn tiền / tranh chấp thanh toán đang chờ xác minh.', icon: CircleDollarSign, tone: 'green', detail: '23.000.000 đ', action: 'Xem xét' },
  { title: '8 Cơ sở mới đăng ký', text: 'Cần rà soát thông tin cơ sở và xác nhận trước khi hiển thị.', icon: Building2, tone: 'green', detail: 'Trong 24 giờ qua', action: 'Thẩm định' },
]
export const bookings = [
  { id: '#BK-88219', user: 'Lê Hoàng Nam', initials: 'HN', facility: 'Pro Arena', court: 'Pickleball Court 02', location: 'TP. HCM', date: '12/03/2025', time: '20:00 – 21:00', amount: '320.000 đ', sport: 'Pickleball', status: 'Confirmed', payment: 'Đã thanh toán' },
  { id: '#BK-88218', user: 'Nguyễn Mai Anh', initials: 'MA', facility: 'CLB Cầu Lông Thủ Đức', court: 'Sân 3', location: 'TP. HCM', date: '12/03/2025', time: '18:30 – 19:30', amount: '200.000 đ', sport: 'Cầu lông', status: 'Pending', payment: 'Chờ thanh toán' },
  { id: '#BK-88217', user: 'Trần Đức Khang', initials: 'DK', facility: 'Sân Bóng SportNexus', court: 'Sân 5 người', location: 'Bình Thạnh', date: '12/03/2025', time: '17:00 – 18:30', amount: '650.000 đ', sport: 'Bóng đá', status: 'Confirmed', payment: 'Đã thanh toán' },
  { id: '#BK-88216', user: 'Đặng Quốc Huy', initials: 'QH', facility: 'Tennis Club Lê Văn', court: 'Sân 02', location: 'TP. HCM', date: '12/03/2025', time: '08:00 – 09:00', amount: '450.000 đ', sport: 'Tennis', status: 'Completed', payment: 'Đã thanh toán' },
  { id: '#BK-88215', user: 'Phạm Thùy Linh', initials: 'TL', facility: 'D-Sports Basketball', court: 'Sân Indoor', location: 'TP. HCM', date: '12/03/2025', time: '21:00 – 22:00', amount: '180.000 đ', sport: 'Bóng rổ', status: 'Cancelled', payment: 'Đã hoàn tiền' },
]
export const activities = [
  { icon: UserRoundCheck, text: 'Nguyễn Minh đã đăng ký trở thành chủ sân mới.', meta: '2 phút trước • KYC đang chờ duyệt', tone: 'green' },
  { icon: CalendarDays, text: 'Cơ sở Sunshine đã xác nhận 23 bookings trong khung giờ 20:00.', meta: '5 phút trước • Tổng giá trị 4.2 triệu', tone: 'green' },
  { icon: MessageSquareWarning, text: 'Nhận báo cáo mới từ Nguyễn Hoàng về cơ sở Smash Club.', meta: '8 phút trước • Yêu cầu kiểm tra', tone: 'red' },
  { icon: ShieldCheck, text: 'Giao dịch Escrow Pickleball QUEEN 2.5 đã được hoàn tất.', meta: '12 phút trước • Đã thanh toán thành công', tone: 'green' },
  { icon: TriangleAlert, text: 'D-Sports Thảo Điền đã báo lịch bảo trì 2 sân vào cuối tuần.', meta: '15 phút trước • Đã cập nhật', tone: 'gray' },
]
