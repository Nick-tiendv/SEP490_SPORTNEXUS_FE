// Nhãn đợt giá đặc biệt trên ca (BE: slot.pricePeriodName, slot.basePrice = giá thường).
// Giá đợt thấp hơn giá thường (sale) thì gạch giá thường. Ca không thuộc đợt nào thì không hiện gì.
const points = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} Điểm`

export default function PricePeriodTag({ slot }) {
  const name = slot?.pricePeriodName
  if (!name) return null
  const base = Number(slot.basePrice)
  const isSale = base > 0 && base > Number(slot.price)
  return (
    <span
      title={`Giá áp dụng cho đợt "${name}" của sân`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 10.5, fontWeight: 700, color: isSale ? '#b91c1c' : '#b45309' }}
    >
      🎉 {name}
      {isSale && <s style={{ fontWeight: 500, color: '#64748b' }}>{points(base)}</s>}
    </span>
  )
}
