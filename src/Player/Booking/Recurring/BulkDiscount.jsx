import { BULK_DISCOUNT_PERCENT, BULK_MIN_WEEKS, bulkDiscount } from './recurringBooking.js'
import './bulkDiscount.css'

const points = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} Điểm`

// Nhãn đỏ trên thẻ cơ sở có bật giảm giá gói định kỳ (isBulkDiscountEnabled)
export function BulkDiscountBadge() {
  return (
    <span className="snx-bulk-badge" title={`Giảm ${BULK_DISCOUNT_PERCENT}% khi đặt cùng ca, cùng sân ${BULK_MIN_WEEKS} tuần liên tiếp`}>
      🔥 -{BULK_DISCOUNT_PERCENT}% Đặt Cố Định
    </span>
  )
}

// Banner ở khu đặt sân của cơ sở có bật giảm giá gói định kỳ
export function BulkDiscountBanner() {
  return (
    <div className="snx-bulk-banner" role="note">
      <span aria-hidden="true">🔥</span>
      <span>
        Cơ sở này hỗ trợ <strong>giảm {BULK_DISCOUNT_PERCENT}% tổng hóa đơn</strong> khi bạn đặt cố định cùng ca, cùng sân từ {BULK_MIN_WEEKS} tuần liên tiếp (tick "Lặp lại vào giờ này mỗi tuần")!
      </span>
    </div>
  )
}

// Dòng giá của đơn: gói định kỳ + cơ sở bật giảm giá thì gạch giá cũ, giá mới màu đỏ;
// chưa là gói thì gợi ý lặp lại đủ số tuần. Gói định kỳ luôn nhắc thanh toán trước, không chia tiền.
export function BulkDiscountNote({ total, isPackage, enabled }) {
  const discount = bulkDiscount(total, isPackage, enabled)
  return (
    <>
      {discount.applies && (
        <div className="snx-bulk-note">
          <div className="snx-bulk-prices">
            <s>{points(total)}</s>
            <strong>{points(discount.payable)}</strong>
          </div>
          <span>✅ Đã áp dụng giảm {BULK_DISCOUNT_PERCENT}% Đặt lịch cố định (−{points(discount.amount)})</span>
        </div>
      )}
      {enabled && !isPackage && (
        <p className="snx-bulk-hint">
          💡 Đặt cố định cùng ca, cùng sân <strong>{BULK_MIN_WEEKS} tuần liên tiếp</strong> (tick "Lặp lại vào giờ này mỗi tuần", chọn từ {BULK_MIN_WEEKS} tuần) để được giảm {BULK_DISCOUNT_PERCENT}% toàn bộ đơn!
        </p>
      )}
      {isPackage && (
        <p className="snx-bulk-package">📌 Gói định kỳ: thanh toán trước toàn bộ, không áp dụng chia tiền.</p>
      )}
    </>
  )
}
