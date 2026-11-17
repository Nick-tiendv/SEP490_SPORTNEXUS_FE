import { useEffect, useState } from 'react'
import { getMyVouchers } from '../../api/player/walletApi.js'

// Trang tạm hiển thị voucher đền bù khi chủ sân hủy đơn: GET /api/v1/wallet/vouchers.
// BE chưa có API áp voucher khi đặt sân nên trang chỉ để xem.
const TABS = [
  { status: 'ACTIVE', label: 'Còn dùng được', icon: 'confirmation_number' },
  { status: 'USED', label: 'Đã dùng', icon: 'task_alt' },
  { status: 'EXPIRED', label: 'Hết hạn', icon: 'event_busy' },
]
const EMPTY_TEXT = {
  ACTIVE: 'Bạn chưa có voucher nào còn dùng được.',
  USED: 'Bạn chưa dùng voucher nào.',
  EXPIRED: 'Không có voucher hết hạn.',
}
const DAY_MS = 24 * 60 * 60 * 1000

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
const daysLeft = (value) => Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS)

function VoucherCard({ voucher }) {
  const active = voucher.status === 'ACTIVE'
  const left = active && voucher.expiredDate ? daysLeft(voucher.expiredDate) : null
  return (
    <article className={`flex overflow-hidden rounded-2xl border bg-white shadow-sm ${active ? 'border-emerald-200' : 'border-gray-200 opacity-75'}`}>
      <div className={`flex w-28 shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-5 text-white ${active ? 'bg-gradient-to-br from-[#15803D] to-[#0D9488]' : 'bg-gray-400'}`}>
        <span className="text-[11px] font-bold uppercase tracking-wider">Giảm</span>
        <span className="text-3xl font-black leading-none">{voucher.discountPercent}%</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-l border-dashed border-gray-200 px-4 py-3">
        <h3 className="text-sm font-extrabold text-[#111827]">Voucher giảm {voucher.discountPercent}% khi đặt sân</h3>
        <p className="text-xs text-[#6B7280]">Đền bù do chủ sân hủy đơn đặt sân của bạn.</p>
        <p className="text-xs text-[#374151]">
          Nhận ngày {formatDate(voucher.createdAt)} · HSD {formatDate(voucher.expiredDate)}
          {left != null && left >= 0 && <span className="ml-1 font-bold text-emerald-700">· Còn {left} ngày</span>}
        </p>
      </div>
    </article>
  )
}

export default function MyVouchers() {
  const [status, setStatus] = useState('ACTIVE')
  const [state, setState] = useState({ status: '' })

  useEffect(() => {
    let cancelled = false
    getMyVouchers(status)
      .then((items) => !cancelled && setState({ status, items }))
      .catch((error) => !cancelled && setState({ status, error: error.message || 'Không tải được danh sách voucher.' }))
    return () => { cancelled = true }
  }, [status])

  const loading = state.status !== status
  return (
    <div className="snx-page">
      <div className="snx-page-header">
        <div className="snx-page-header-copy">
          <h1 className="snx-page-title">Voucher của tôi</h1>
          <p className="snx-page-subtitle">Mã giảm giá hệ thống đền bù khi chủ sân hủy đơn của bạn, hạn dùng 30 ngày kể từ ngày nhận.</p>
        </div>
      </div>

      <div className="snx-tabs mb-4" role="tablist" aria-label="Trạng thái voucher">
        {TABS.map((tab) => (
          <button key={tab.status} type="button" role="tab" aria-selected={status === tab.status} className={`snx-tab ${status === tab.status ? 'active' : ''}`} onClick={() => setStatus(tab.status)}>
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <span className="material-symbols-outlined text-[18px]">info</span>
        Tính năng dùng voucher khi thanh toán đặt sân đang được hoàn thiện. Voucher của bạn vẫn được giữ tới hết hạn.
      </p>

      {loading ? (
        <div className="snx-empty">Đang tải voucher…</div>
      ) : state.error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{state.error}</p>
      ) : !state.items.length ? (
        <div className="snx-empty"><span className="material-symbols-outlined">confirmation_number</span>{EMPTY_TEXT[status]}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {state.items.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} />)}
        </div>
      )}
    </div>
  )
}
