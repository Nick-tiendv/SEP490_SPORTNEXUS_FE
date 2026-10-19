import { money } from './paymentData.js'

const groups = [
  ['Đang giữ', [['bookingEscrowHeld', 'Tiền đặt sân đang giữ (escrow)', '#287b4c'], ['prizeFundsHeld', 'Quỹ giải thưởng đang giữ', '#60b582'], ['totalFrozenBalance', 'Số dư bị đóng băng', '#a1d9b8']]],
  ['Doanh thu', [['bookingCommissionRevenue', 'Hoa hồng đặt sân', '#287b4c'], ['promotionRevenue', 'Gói quảng bá', '#60b582'], ['ownerBookingEarnings', 'Chủ sân nhận từ đặt sân', '#a1d9b8'], ['tournamentFeesToOwners', 'Phí giải đấu trả chủ sân', '#d2eadb']]],
  ['Chi ra', [['bookingRefunds', 'Hoàn tiền đặt sân', '#f5a6b0'], ['withdrawalsCompleted', 'Rút tiền đã chuyển', '#efb63e'], ['prizesPaid', 'Tiền thưởng đã trả', '#efb63e'], ['adminAdjustments', 'Điều chỉnh của quản trị viên', '#9baaa3']]],
]

// Phân bổ dòng tiền từ GET /api/v1/admin/wallets/statistics.
export default function TransactionBreakdown({ stats, loading }) {
  return <section className="payments-breakdown"><h2>Phân bổ dòng tiền</h2><p>Số dư đang giữ, doanh thu và các khoản chi trong khoảng đang xem.</p>
    {groups.map(([title, items]) => <div key={title}><h3 className="payments-muted" style={{ marginTop: 12, fontWeight: 600 }}>{title}</h3><ul>{items.map(([key, label, color]) => <li key={key}><div><i style={{ background: color }} /><span>{label}</span><strong>{loading ? '…' : money(stats[key])}</strong></div></li>)}</ul></div>)}
  </section>
}
