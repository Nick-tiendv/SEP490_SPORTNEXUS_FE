import { Link } from 'react-router-dom'

/**
 * Khung giao diện dùng chung cho trang kết quả nạp tiền PayOS
 * (returnUrl: /wallet/deposit-success, cancelUrl: /wallet/deposit-cancel)
 */
const TONES = {
  loading: {
    ring: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600 animate-spin',
    glyph: 'progress_activity',
    pill: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  success: {
    ring: 'bg-emerald-100 border-emerald-300',
    icon: 'text-emerald-700',
    glyph: 'check_circle',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  warning: {
    ring: 'bg-amber-100 border-amber-300',
    icon: 'text-amber-700',
    glyph: 'schedule',
    pill: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  cancelled: {
    ring: 'bg-slate-100 border-slate-300',
    icon: 'text-slate-600',
    glyph: 'cancel',
    pill: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  error: {
    ring: 'bg-rose-100 border-rose-300',
    icon: 'text-rose-600',
    glyph: 'error',
    pill: 'bg-rose-100 text-rose-800 border-rose-300',
  },
}

export const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(Number(val) || 0)

/** Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng "/" và không phải "//") để tránh open-redirect */
export const isSafeInternalPath = (path) => typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')

/**
 * Lấy màn cần quay lại sau khi nạp (vd: màn đặt sân) từ ngữ cảnh lệnh nạp đã lưu.
 * @returns {{path:string, state?:object, label?:string} | null}
 */
export function resolveReturnTarget(pending, orderCode) {
  if (!pending?.returnTo) return null
  if (orderCode && pending.orderCode && String(pending.orderCode) !== String(orderCode)) return null
  const rt = pending.returnTo
  return isSafeInternalPath(rt.path) ? rt : null
}

export default function DepositResultCard({
  tone = 'loading',
  icon,
  breadcrumb = 'Kết quả nạp tiền',
  title,
  message,
  statusLabel,
  rows = [],
  footnote,
  children,
}) {
  const t = TONES[tone] || TONES.loading
  return (
    <div className="w-full min-h-screen text-[#1E293B] pb-16 pt-6">
      <div className="max-w-[720px] mx-auto px-4">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
          <Link to="/wallet" className="hover:text-emerald-700 transition">Ví Escrow</Link>
          <span>/</span>
          <span className="text-emerald-800">{breadcrumb}</span>
        </nav>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400" />
          <div className="p-6 md:p-10 text-center">
            <div className="flex justify-center mb-5">
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${t.ring}`}>
                <span className={`material-symbols-outlined text-[46px] ${t.icon}`}>{icon || t.glyph}</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">{title}</h1>
            {message && (
              <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto mb-6 font-medium" aria-live="polite">
                {message}
              </p>
            )}

            {(rows.length > 0 || statusLabel) && (
              <dl className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 max-w-md mx-auto mb-8 text-left space-y-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                    <dt className="text-gray-500 font-medium">{row.label}</dt>
                    <dd className={`text-right ${row.className || 'font-bold text-gray-900'}`}>{row.value}</dd>
                  </div>
                ))}
                {statusLabel && (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <dt className="text-gray-500 font-medium">Trạng thái</dt>
                    <dd>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${t.pill}`}>
                        {statusLabel}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            )}

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-md mx-auto">{children}</div>

            {footnote && <p className="mt-6 text-xs text-gray-500 max-w-md mx-auto">{footnote}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

export function PrimaryButton({ icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`flex-1 py-3.5 px-6 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[19px]">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export function SecondaryButton({ icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`flex-1 py-3.5 px-6 rounded-xl bg-white border border-[#CBD5E1] hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-bold text-sm flex items-center justify-center gap-2 transition ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[19px]">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
