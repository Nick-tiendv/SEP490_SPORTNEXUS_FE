import { BULK_MIN_WEEKS, bulkDiscount } from './recurringBooking.js'
import './bulkDiscount.css'

const points = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} Điểm`

// Nhãn đỏ trên thẻ cơ sở có giảm giá gói định kỳ. percent = % chủ sân đặt (facilityDiscountPercent); 0 thì không hiện.
export function BulkDiscountBadge({ percent }) {
  if (!(percent > 0)) return null
  return (
    <span className="snx-bulk-badge" title={`Giảm ${percent}% khi đặt cùng ca, cùng sân ${BULK_MIN_WEEKS} tuần liên tiếp`}>
      🔥 -{percent}% Đặt Cố Định
    </span>
  )
}

// Banner ở khu đặt sân của cơ sở có giảm giá gói định kỳ
export function BulkDiscountBanner({ percent }) {
  if (!(percent > 0)) return null
  return (
    <div className="snx-bulk-banner" role="note">
      <span aria-hidden="true">🔥</span>
      <span>
        Cơ sở này hỗ trợ <strong>giảm {percent}% tổng hóa đơn</strong> khi bạn đặt cố định cùng ca, cùng sân từ {BULK_MIN_WEEKS} tuần liên tiếp (tick "Lặp lại vào giờ này mỗi tuần")!
      </span>
    </div>
  )
}

// Dòng giá của đơn: gói định kỳ + cơ sở bật giảm giá thì gạch giá cũ, giá mới màu đỏ;
// chưa là gói thì gợi ý lặp lại đủ số tuần. Gói định kỳ luôn nhắc thanh toán trước, không chia tiền.
export function BulkDiscountNote({ total, isPackage, percent }) {
  const discount = bulkDiscount(total, isPackage, percent)
  return (
    <>
      {discount.applies && (
        <div className="snx-bulk-note">
          <div className="snx-bulk-prices">
            <s>{points(total)}</s>
            <strong>{points(discount.payable)}</strong>
          </div>
          <span>✅ Đã áp dụng giảm {percent}% Đặt lịch cố định (−{points(discount.amount)})</span>
        </div>
      )}
      {percent > 0 && !isPackage && (
        <p className="snx-bulk-hint">
          💡 Đặt cố định cùng ca, cùng sân <strong>{BULK_MIN_WEEKS} tuần liên tiếp</strong> (tick "Lặp lại vào giờ này mỗi tuần", chọn từ {BULK_MIN_WEEKS} tuần) để được giảm {percent}% toàn bộ đơn!
        </p>
      )}
      {isPackage && (
        <p className="snx-bulk-package">📌 Gói định kỳ: thanh toán trước toàn bộ, không áp dụng chia tiền.</p>
      )}
    </>
  )
}
