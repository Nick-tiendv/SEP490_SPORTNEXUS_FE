import { useEffect, useState } from 'react'
import { ShieldCheck, ReceiptText } from 'lucide-react'
import { UserAvatar } from '../Users/UserDetails.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getWalletReconciliation } from '../../api/admin/walletApi.js'
import { roleLabels, money, signedMoney, dateTime } from './paymentData.js'

// Đối soát ví (chỉ đọc, không sửa dữ liệu): GET /api/v1/admin/wallets/reconciliation
// So Balance với sổ giao dịch, FrozenBalance với tiền đang giữ thật (đơn sân, kèo, lệ phí giải, rút tiền chờ duyệt).
const n = value => (value === null || value === undefined || value === '' ? null : Number(value))
const ISSUE_LABELS = {
  BALANCE_LEDGER_MISMATCH: 'Số dư lệch sổ giao dịch',
  FROZEN_HOLDINGS_MISMATCH: 'Tiền đóng băng lệch khoản đang giữ',
  NEGATIVE_BALANCE: 'Ví âm',
  NEGATIVE_BALANCE_ALLOWED: 'Ví âm (được phép, vd hoàn tiền)',
  NEGATIVE_FROZEN: 'Tiền đóng băng âm',
  STUCK_HOLD: 'Khoản giữ bị treo',
}
const HOLDINGS = [
  ['bookingHeld', 'Đơn đặt sân'],
  ['lfgHeld', 'Suất kèo LFG'],
  ['tournamentFeesHeld', 'Lệ phí giải'],
  ['prizeFundHeld', 'Quỹ thưởng (cũ)'],
  ['pendingWithdrawals', 'Rút tiền chờ duyệt'],
]

export default function ReconciliationTab({ reload, onTransactions, onNotice }) {
  const [includeAll, setIncludeAll] = useState(false)
  const [run, setRun] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: '' })
  const [openId, setOpenId] = useState(null)
  const key = `${includeAll}|${reload}|${run}`

  useEffect(() => {
    let cancelled = false
    getWalletReconciliation({ includeAll })
      .then(data => !cancelled && setState({ key, data, error: '' }))
      .catch(error => !cancelled && setState({ key, data: null, error: error.message }))
    return () => { cancelled = true }
  }, [includeAll, key])

  const loading = state.key !== key
  const data = state.data
  const wallets = data?.wallets || []
  const recheck = () => { setRun(value => value + 1); onNotice('Đang đối soát lại toàn bộ ví…') }

  return <>
    <section className="payments-toolbar" aria-label="Đối soát ví"><div className="payments-filter-row">
      <label className="payments-review-check"><input type="checkbox" checked={includeAll} onChange={event => setIncludeAll(event.target.checked)} />Hiện cả ví không có vấn đề</label>
      <button className="users-button primary" onClick={recheck} disabled={loading}><ShieldCheck size={13} />{loading ? 'Đang đối soát…' : 'Đối soát lại'}</button>
      {data?.checkedAt && <small>Lần đối soát: {dateTime(data.checkedAt)}</small>}
    </div></section>
    {state.error && <div className="users-notice" role="alert"><span>Không đối soát được: {state.error}</span></div>}

    {data && <div className="payments-kpis" style={{ marginBottom: 16 }}>
      {[
        ['Tổng số ví', data.totalWallets, ''],
        ['Ví có lỗi', data.mismatchedWallets, 'Lệch sổ hoặc lệch tiền giữ'],
        ['Ví chỉ cảnh báo', data.warningWallets, 'Vd chủ sân âm ví do hoàn tiền'],
        ['Tổng lệch số dư', signedMoney(n(data.totalBalanceDifference)), 'Thực tế − theo sổ'],
        ['Tổng lệch đóng băng', signedMoney(n(data.totalFrozenDifference)), 'Thực tế − đang giữ thật'],
      ].map(([label, value, note]) => <article key={label}><div><small>{label}</small></div><strong>{value ?? 0}</strong>{note && <p>{note}</p>}</article>)}
    </div>}

    <section className="payments-table-panel" aria-label="Kết quả đối soát" aria-busy={loading}><div className="payments-table-scroll"><table>
      <thead><tr>{['Người dùng', 'Vai trò', 'Số dư / theo sổ', 'Đóng băng / đang giữ', 'Vấn đề', ''].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody style={loading ? { opacity: 0.5 } : undefined}>{wallets.map(w => {
        const errors = (w.issues || []).filter(issue => issue.severity === 'ERROR').length
        const open = openId === w.walletId
        return [
          <tr key={w.walletId} className={open ? 'is-selected' : ''} onClick={() => setOpenId(open ? null : w.walletId)}>
            <td><div className="payments-table-user"><UserAvatar user={{ name: w.fullName }} /><span><strong>{w.fullName || '—'}</strong><small>{w.email}</small></span></div></td>
            <td>{roleLabels[w.roleName] || w.roleName || '—'}</td>
            <td><strong>{money(n(w.balance))}</strong><small>Sổ: {money(n(w.ledgerBalance))}{n(w.balanceDifference) ? ` · lệch ${signedMoney(n(w.balanceDifference))}` : ''}</small></td>
            <td><strong>{money(n(w.frozenBalance))}</strong><small>Đang giữ: {money(n(w.expectedFrozenBalance))}{n(w.frozenDifference) ? ` · lệch ${signedMoney(n(w.frozenDifference))}` : ''}</small></td>
            <td>{w.issues?.length
              ? <StatusBadge status={errors ? 'Cancelled' : 'Pending'} label={`${errors ? `${errors} lỗi` : ''}${errors && w.issues.length > errors ? ', ' : ''}${w.issues.length > errors ? `${w.issues.length - errors} cảnh báo` : ''}`} />
              : <StatusBadge status="Confirmed" label="Khớp" />}</td>
            <td><button className="users-button" onClick={event => { event.stopPropagation(); onTransactions({ id: w.userId, name: w.fullName }) }}><ReceiptText size={13} />Giao dịch</button></td>
          </tr>,
          open && <tr key={`${w.walletId}-detail`}><td colSpan={6}>
            <div style={{ display: 'grid', gap: 8, padding: '4px 0' }}>
              {(w.issues || []).map((issue, index) => <div key={`${issue.code}-${index}`}>
                <StatusBadge status={issue.severity === 'ERROR' ? 'Cancelled' : 'Pending'} label={ISSUE_LABELS[issue.code] || issue.code} />{' '}
                {issue.message}
                {(issue.expected != null || issue.actual != null) && <small> (đúng ra {money(n(issue.expected))}, thực tế {money(n(issue.actual))}{issue.difference != null ? `, lệch ${signedMoney(n(issue.difference))}` : ''})</small>}
              </div>)}
              <div><strong>Khoản đang giữ:</strong> {HOLDINGS.map(([field, label]) => `${label} ${money(n(w.holdings?.[field]) ?? 0)}`).join(' · ')} · {w.transactionCount ?? 0} giao dịch</div>
            </div>
          </td></tr>,
        ]
      })}</tbody></table>
      {loading && !wallets.length && <p className="payments-empty">Đang đối soát ví…</p>}
      {!loading && !state.error && !wallets.length && <p className="payments-empty">{includeAll ? 'Chưa có ví nào.' : 'Tất cả ví đều khớp sổ giao dịch và khoản đang giữ.'}</p>}
    </div></section>
  </>
}
