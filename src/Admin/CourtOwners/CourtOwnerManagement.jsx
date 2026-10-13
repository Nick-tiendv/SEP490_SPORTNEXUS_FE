import { useCallback, useState } from 'react'
import { Download, UserPlus, Search, BellRing, Building2, UserRoundCheck, Users, ClipboardCheck, ArrowRight, X } from 'lucide-react'
import { DemoDialog } from '../Users/UserDialogs.jsx'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'
import { initialOwners, ownerStats, emptyOwnerFilters, filterOwners, ownersCsv } from './courtOwnerData.js'
import CourtOwnerDetails, { VerificationBadge } from './CourtOwnerDetails.jsx'
import { OwnerFormDialog, OwnerReviewDialog, OwnerAccountDialog } from './OwnerDialogs.jsx'
import '../Users/users.css'
import './courtOwners.css'

const adminDisplayLabels = {
  "Admin": "Quản trị",
  "Administrator": "Quản trị viên",
  "Player": "Người chơi",
  "Court Owner": "Chủ sân",
  "CourtOwner": "Chủ sân",
  "Active": "Đang hoạt động",
  "Inactive": "Ngừng hoạt động",
  "Suspended": "Đã tạm khóa",
  "Verified": "Đã xác minh",
  "Pending": "Đang chờ xử lý",
  "Rejected": "Đã từ chối",
  "Unverified": "Chưa xác minh",
  "All": "Tất cả"
}


const statIcons = [Users, UserRoundCheck, ClipboardCheck, Building2]

export default function CourtOwnerManagement() {
  const [owners, setOwners] = useState(initialOwners)
  const [filters, setFilters] = useState(emptyOwnerFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(initialOwners[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])
  const filtered = filterOwners(owners, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detail = owners.find(owner => owner.id === detailId)
  const selectedOwners = owners.filter(owner => selected.includes(owner.id))
  const allVisibleSelected = visible.length > 0 && visible.every(owner => selected.includes(owner.id))
  const someVisibleSelected = visible.some(owner => selected.includes(owner.id))
  const verificationCandidates = selectedOwners.filter(owner => owner.verification !== 'Verified' && owner.registration && owner.legalName)
  const updateFilter = event => { setFilters({ ...filters, [event.target.name]: event.target.value }); setPage(1) }
  const reset = () => { setFilters(emptyOwnerFilters); setPage(1) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const toggleVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(owner => owner.id === id)) : [...new Set([...previous, ...visible.map(owner => owner.id)])])
  const reviewPending = () => {
    const pendingFilters = { ...emptyOwnerFilters, verification: 'Pending' }
    const pending = filterOwners(owners, pendingFilters)
    setFilters(pendingFilters); setPage(1); setSelected([]); setDetailId(pending[0]?.id || null)
    if (!pending.length) setNotice("Không còn chủ sân chờ xử lý trong dữ liệu mẫu.")
  }
  const exportCsv = records => {
    const url = URL.createObjectURL(new Blob([ownersCsv(records)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'sportnexus-demo-court-owners.csv'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${records.length} chủ sân mẫu ra CSV.`)
  }
  const saveOwner = values => {
    if (dialog.type === 'edit') {
      const original = dialog.owner
      const kycChanged = values.legalName !== (original.legalName || '') || values.registration !== (original.registration || '')
      setOwners(previous => previous.map(owner => owner.id === original.id ? { ...owner, ...values, phone: values.phone || null, registration: values.registration || null, verification: kycChanged ? 'Pending' : owner.verification, trust: kycChanged ? null : owner.trust } : owner))
      setNotice(`Đã cập nhật chủ sân mẫu trong phiên.${kycChanged ? ' Thông tin KYC thay đổi cần được xét duyệt lại trong bản mẫu.' : ''} Không thay đổi dữ liệu máy chủ.`)
    } else {
      const date = new Date()
      const joined = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const owner = { ...values, id: `DEMO-OWN-${crypto.randomUUID()}`, phone: values.phone || null, registration: values.registration || null, verification: 'Pending', status: 'Active', joined, trust: null, facilities: [], monthlyBookings: 0, monthlyGmv: 0 }
      setOwners(previous => [owner, ...previous]); setDetailId(owner.id); reset()
      setNotice("Đã thêm chủ sân trong bản mẫu. Không tạo tài khoản thực tế.")
    }
    closeDialog()
  }
  const verifyOwners = ids => {
    setOwners(previous => previous.map(owner => ids.includes(owner.id) ? { ...owner, verification: 'Verified' } : owner))
    setNotice(`Đã xác minh mẫu cho ${ids.length} chủ sân trong phiên. Không lưu phê duyệt KYC hoặc xác minh cơ sở.`)
    closeDialog()
  }
  const confirmAccount = () => {
    const ids = dialog.owners.map(owner => owner.id)
    setOwners(previous => previous.map(owner => ids.includes(owner.id) ? dialog.restore ? { ...owner, status: owner.previousStatus || 'Active', previousStatus: null } : { ...owner, previousStatus: owner.status === 'Suspended' ? owner.previousStatus : owner.status, status: 'Suspended' } : owner))
    setNotice(`Đã ${dialog.restore ? 'khôi phục hoạt động' : 'tạm khóa'} trong phiên. Cơ sở, đơn đặt sân và ví được giữ nguyên.`)
    closeDialog()
  }
  return <div className={`owners-page ${detail ? 'with-details' : ''}`}>
    <div className="owners-main-content">
      <header className="owners-page-heading"><div><h1>Quản lý<br />chủ sân <span>1.356 đang hoạt động</span></h1><p>Quản lý tài khoản chủ sân, xác minh KYC và các cơ sở thể thao trên SportNexus.</p></div><div className="owners-heading-actions"><button className="users-button" onClick={() => exportCsv(filtered)}><Download size={15} />Xuất CSV</button><button className="users-button primary" onClick={() => setDialog({ type: 'add' })}><UserPlus size={16} /><span>Thêm<br />chủ sân</span></button></div></header>
      <section className="owners-kpis" aria-label="Thống kê chủ sân">{ownerStats.map((stat, index) => { const Icon = statIcons[index]; return <article key={stat.label} className={stat.pending ? 'pending' : ''}><div><small>{stat.label}</small><Icon size={20} /></div><strong>{stat.value}<span>{stat.trend}</span></strong><p>{stat.detail}</p></article> })}</section>
      <div className="owners-demo-label">Bản mẫu tương tác • Chỉ số dùng để minh họa • {owners.length} bản ghi chủ sân mẫu</div>
      <section className="owners-pending-banner"><BellRing size={23} /><div><h2>18 chủ sân đang chờ<br />Xác minh KYC và cơ sở</h2><p>Hàng đợi mẫu: {owners.filter(owner => owner.verification === 'Pending').length} chủ sân đang chờ trong dữ liệu mẫu.</p></div><span>Cần duyệt gấp</span><button onClick={reviewPending}>Xem mục chờ xử lý <ArrowRight size={13} /></button></section>
      <section className="owners-toolbar" aria-label="Bộ lọc chủ sân"><div className="owners-filter-row"><label className="users-search"><Search size={14} /><input name="search" aria-label="Tìm kiếm chủ sân" value={filters.search} onChange={updateFilter} /></label><select aria-label="Lọc trạng thái xác minh" name="verification" value={filters.verification} onChange={updateFilter}><option value="All">Xác minh: Tất cả trạng thái</option>{['Verified', 'Pending', 'Rejected'].map(value => <option key={value} value={value}>{adminDisplayLabels[value] || value}</option>)}</select><select aria-label="Lọc trạng thái tài khoản" name="status" value={filters.status} onChange={updateFilter}><option value="All">Tài khoản: Tất cả trạng thái</option>{['Active', 'Inactive', 'Suspended'].map(value => <option key={value} value={value}>{adminDisplayLabels[value] || value}</option>)}</select><select aria-label="Lọc theo số cơ sở" name="facilities" value={filters.facilities} onChange={updateFilter}><option value="All">Cơ sở: Tất cả số lượng</option>{['0', '1', '2', '3+'].map(value => <option key={value} value={value}>{value} cơ sở</option>)}</select></div><div className="owners-filter-actions"><span>{selected.length} đã chọn</span><button onClick={() => setSelected(filtered.map(owner => owner.id))}>Chọn tất cả {filtered.length} chủ sân đã lọc</button><button onClick={reset}>Đặt lại</button><div><button className="users-button" disabled={!verificationCandidates.length} onClick={() => setDialog({ type: 'bulk-verify', owners: verificationCandidates })}>Xác minh hàng loạt</button><button className="users-button" disabled={!selected.length} onClick={() => exportCsv(selectedOwners)}>Xuất mục đã chọn</button></div></div></section>
      {notice && <div className="users-notice" role="status">{notice}<button aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={14} /></button></div>}
      <section className="owners-table-panel" aria-label="Danh sách chủ sân"><div className="owners-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả chủ sân trên trang" checked={allVisibleSelected} onChange={toggleVisible} ref={node => { if (node) node.indeterminate = someVisibleSelected && !allVisibleSelected }} /></th><th>Chủ sân</th><th>Liên hệ</th><th>Quản lý cơ sở thể thao</th><th>Xác minh</th><th>Tài khoản</th></tr></thead><tbody>{visible.map(owner => <tr key={owner.id} className={owner.id === detailId ? 'is-selected' : ''} onClick={() => setDetailId(owner.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${owner.name}`} checked={selected.includes(owner.id)} onChange={() => toggle(owner.id)} /></td><td><button className="owners-table-profile" aria-label={`Xem chi tiết ${owner.name}`} onClick={event => { event.stopPropagation(); setDetailId(owner.id) }}><UserAvatar user={owner} /><span><strong>{owner.name}{owner.status === 'Active' && <i />}</strong><small>@{owner.username}</small><small>#{owner.id}</small></span></button></td><td><strong className="owners-contact-email">{owner.email}</strong><small>{owner.phone || "Chưa có số điện thoại"}</small></td><td><span className="owners-facility-count"><Building2 size={11} />{owner.facilities.length}</span></td><td><VerificationBadge status={owner.verification} /></td><td><AccountStatus status={owner.status} /></td></tr>)}</tbody></table></div>{!visible.length && <div className="users-empty"><Building2 size={25} /><h3>Không có chủ sân phù hợp với bộ lọc</h3><p>Thử từ khóa khác hoặc đặt lại bộ lọc.</p><button className="users-button" onClick={reset}>Đặt lại bộ lọc</button></div>}<footer className="owners-pagination"><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} trên {filtered.length} chủ sân mẫu</span><label>Số dòng mỗi trang<select aria-label="Số chủ sân mỗi trang" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[5, 10, 15].map(size => <option key={size}>{size}</option>)}</select></label><nav aria-label="Phân trang chủ sân"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} className={number === currentPage ? 'current' : ''} aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Sau</button></nav></footer></section>
    </div>
    {detail && <CourtOwnerDetails owner={detail} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'edit', owner: detail })} onReview={() => setDialog({ type: 'review', owner: detail })} onSuspend={() => setDialog({ type: 'account', owners: [detail], restore: detail.status === 'Suspended' })} onFacility={facility => setNotice(`${facility.name}: Quản lý cơ sở thể thao sắp ra mắt. Chưa thực hiện thay đổi cơ sở.`)} />}
    {dialog && (dialog.type === 'add' || dialog.type === 'edit' ? <OwnerFormDialog key={dialog.owner?.id || 'add'} owner={dialog.owner} owners={owners} onClose={closeDialog} onSave={saveOwner} /> : dialog.type === 'review' ? <OwnerReviewDialog owner={dialog.owner} onClose={closeDialog} onConfirm={() => verifyOwners([dialog.owner.id])} /> : dialog.type === 'account' ? <OwnerAccountDialog owners={dialog.owners} restore={dialog.restore} onClose={closeDialog} onConfirm={confirmAccount} /> : <DemoDialog title="Xem xét KYC hàng loạt — Bản mẫu" onClose={closeDialog}><p className="users-demo-note">Chỉ bao gồm chủ sân đã chọn, chưa xác minh và có tên doanh nghiệp cùng mã đăng ký mẫu. Thao tác chỉ cập nhật trạng thái xác minh trong phiên, không thay đổi cơ sở hoặc dữ liệu máy chủ.</p><ul className="owners-bulk-list">{dialog.owners.map(owner => <li key={owner.id}><strong>{owner.name}</strong><span>{owner.legalName} • {owner.registration}</span></li>)}</ul><footer><button className="users-button" onClick={closeDialog}>Hủy</button><button className="users-button primary" onClick={() => verifyOwners(dialog.owners.map(owner => owner.id))}>Xác nhận xác minh hàng loạt trong bản mẫu</button></footer></DemoDialog>)}
  </div>
}
