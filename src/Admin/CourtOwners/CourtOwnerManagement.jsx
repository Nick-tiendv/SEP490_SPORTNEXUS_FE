import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, UserPlus, Search, BellRing, Building2, UserRoundCheck, Users, ArrowRight, X, RefreshCw } from 'lucide-react'
import { UserAvatar, AccountStatus } from '../Users/UserDetails.jsx'
import { UserFormDialog, SuspensionDialog, DeleteUserDialog } from '../Users/UserDialogs.jsx'
import { roleOptions, statusLabels } from '../Users/usersData.js'
import { emptyOwnerFilters, filterOwners, ownerStats, ownersCsv, withFacilities } from './courtOwnerData.js'
import CourtOwnerDetails from './CourtOwnerDetails.jsx'
import OwnerVerifications, { VerificationBadge } from './OwnerVerifications.jsx'
import { listFacilities, listOwners } from '../../api/admin/ownerApi.js'
import { listOwnerVerifications } from '../../api/admin/ownerVerificationApi.js'
import { getMyAccount } from '../../api/admin/accountApi.js'
import { fetchAllPages } from '../../api/admin/dashboardApi.js'
import '../Users/users.css'
import './courtOwners.css'

const statIcons = [Users, UserRoundCheck, BellRing, Building2]
const settled = result => (result.status === 'fulfilled' ? result.value : undefined)
// Hồ sơ KYC mới nhất của mỗi chủ sân (theo userId).
const latestByUser = items => items.reduce((map, item) => (!map[item.userId] || item.createdAt > map[item.userId].createdAt ? { ...map, [item.userId]: item } : map), {})

export default function CourtOwnerManagement() {
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: -1, owners: [], facilities: [], error: '' })
  const [meId, setMeId] = useState('')
  const [filters, setFilters] = useState(emptyOwnerFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])
  // ?tab=kyc (từ Dashboard) → mở thẳng tab Xác minh KYC.
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => (searchParams.get('tab') === 'kyc' ? 'kyc' : 'owners'))
  const [kycId, setKycId] = useState(null)
  const [kycReload, setKycReload] = useState(0)
  const [verifications, setVerifications] = useState({ byUser: {}, pending: 0 })

  // GET /api/v1/admin/owner-verifications: trạng thái KYC hiển thị trong danh sách / chi tiết chủ sân.
  useEffect(() => {
    let cancelled = false
    fetchAllPages((page, pageSize) => listOwnerVerifications({ page, pageSize }))
      .then(items => !cancelled && setVerifications({ byUser: latestByUser(items), pending: items.filter(item => item.status === 'PENDING').length }))
      .catch(() => {})
    return () => { cancelled = true }
  }, [reload, kycReload])

  // Chủ sân: GET /api/accounts (lọc vai trò Owner). Cơ sở: GET /api/v1/facilities, gom theo ownerId.
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([listOwners(), listFacilities()]).then(([ownersResult, facilitiesResult]) => {
      if (cancelled) return
      const errors = [ownersResult, facilitiesResult].filter(result => result.status === 'rejected').map(result => result.reason?.message)
      setData(previous => ({ key: reload, owners: settled(ownersResult) ?? previous.owners, facilities: settled(facilitiesResult) ?? previous.facilities, error: errors.join(' · ') }))
    })
    return () => { cancelled = true }
  }, [reload])
  useEffect(() => {
    let cancelled = false
    getMyAccount().then(me => !cancelled && setMeId(me.id)).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const loading = data.key !== reload
  const owners = withFacilities(data.owners, data.facilities)
  const roles = roleOptions(data.owners)
  const filtered = filterOwners(owners, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detail = owners.find(owner => owner.id === detailId)
  const selectedOwners = owners.filter(owner => selected.includes(owner.id) && owner.id !== meId)
  const allVisibleSelected = visible.length > 0 && visible.every(owner => selected.includes(owner.id))
  const someVisibleSelected = visible.some(owner => selected.includes(owner.id))
  const withoutFacility = owners.filter(owner => !owner.facilities.length)
  const updateFilter = event => { setFilters({ ...filters, [event.target.name]: event.target.value }); setPage(1) }
  const reset = () => { setFilters(emptyOwnerFilters); setPage(1) }
  const toggle = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const toggleVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(owner => owner.id === id)) : [...new Set([...previous, ...visible.map(owner => owner.id)])])
  const showWithoutFacility = () => { setFilters({ ...emptyOwnerFilters, facilities: '0' }); setPage(1); setDetailId(withoutFacility[0]?.id || null) }
  const exportCsv = records => {
    const url = URL.createObjectURL(new Blob([ownersCsv(records)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'sportnexus-court-owners.csv'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${records.length} chủ sân ra CSV.`)
  }
  const done = (message, keepOpen = false) => {
    setReload(value => value + 1)
    if (keepOpen) return
    setDialog(null); setSelected([])
    if (message) setNotice(message)
  }
  const afterDelete = message => { setDetailId(null); done(message) }
  const openTab = (value, id = null) => { setKycId(id); setTab(value) }
  const tabs = <div className="admin-segmented owners-tabs" role="tablist" aria-label="Chế độ xem chủ sân">{[['owners', 'Chủ sân'], ['kyc', `Xác minh KYC${verifications.pending ? ` (${verifications.pending})` : ''}`]].map(([value, text]) => <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? 'selected' : ''} onClick={() => openTab(value)}>{text}</button>)}</div>
  if (tab === 'kyc') return <OwnerVerifications key={kycId || 'kyc'} tabs={tabs} initialId={kycId} onChanged={() => setKycReload(value => value + 1)} />

  return <div className={`owners-page ${detail ? 'with-details' : ''}`}>
    <div className="owners-main-content">
      <header className="owners-page-heading admin-page-header"><div><h1>Quản lý chủ sân <span>{owners.filter(owner => owner.status === 'Active').length.toLocaleString('vi-VN')} đang hoạt động</span></h1><p>Quản lý tài khoản chủ sân và các cơ sở thể thao trên SportNexus.</p></div><div className="owners-heading-actions">{tabs}<button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={15} />Làm mới</button><button className="users-button" onClick={() => exportCsv(filtered)} disabled={!filtered.length}><Download size={15} />Xuất CSV</button><button className="users-button primary" onClick={() => setDialog({ type: 'add' })} disabled={!roles.length} title={roles.length ? undefined : 'Cần ít nhất một tài khoản chủ sân để xác định roleId'}><UserPlus size={16} /><span>Thêm chủ sân</span></button></div></header>
      <section className="owners-kpis" aria-label="Thống kê chủ sân">{ownerStats(owners, data.facilities).map((stat, index) => { const Icon = statIcons[index]; return <article key={stat.label} className={stat.pending ? 'pending' : ''}><div><small>{stat.label}</small><Icon size={20} /></div><strong>{loading && !data.owners.length ? '…' : stat.value.toLocaleString('vi-VN')}<span>{stat.trend}</span></strong><p>{stat.detail}</p></article> })}</section>
      {data.error && <div className="users-notice" role="alert">Một số dữ liệu không tải được: {data.error}<button aria-label="Thử lại" onClick={() => setReload(value => value + 1)}>↻</button></div>}
      {verifications.pending > 0 && <section className="owners-pending-banner"><BellRing size={23} /><div><h2>{verifications.pending} hồ sơ KYC<br />đang chờ duyệt</h2><p>Chủ sân đã nộp giấy tờ xác minh và đang chờ quản trị viên phê duyệt.</p></div><span>Cần xử lý</span><button onClick={() => openTab('kyc')}>Duyệt ngay <ArrowRight size={13} /></button></section>}
      {withoutFacility.length > 0 && <section className="owners-pending-banner"><BellRing size={23} /><div><h2>{withoutFacility.length} chủ sân<br />chưa có cơ sở thể thao</h2><p>Chủ sân đã có tài khoản nhưng chưa đăng cơ sở nào lên nền tảng.</p></div><span>Cần theo dõi</span><button onClick={showWithoutFacility}>Xem danh sách <ArrowRight size={13} /></button></section>}
      <section className="owners-toolbar" aria-label="Bộ lọc chủ sân"><div className="owners-filter-row"><label className="users-search"><Search size={14} /><input name="search" aria-label="Tìm kiếm chủ sân" placeholder="Họ tên, tên đăng nhập, email, SĐT…" value={filters.search} onChange={updateFilter} /></label><select aria-label="Lọc trạng thái tài khoản" name="status" value={filters.status} onChange={updateFilter}><option value="All">Tài khoản: Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select><select aria-label="Lọc theo số cơ sở" name="facilities" value={filters.facilities} onChange={updateFilter}><option value="All">Cơ sở: Tất cả số lượng</option>{['0', '1', '2', '3+'].map(value => <option key={value} value={value}>{value} cơ sở</option>)}</select></div><div className="owners-filter-actions"><span>{selected.length} đã chọn</span><button onClick={() => setSelected(filtered.map(owner => owner.id))}>Chọn tất cả {filtered.length} chủ sân đã lọc</button><button onClick={reset}>Đặt lại</button><div><button className="users-button" disabled={!selectedOwners.length} onClick={() => setDialog({ type: 'account', owners: selectedOwners, restore: false })}>Tạm khóa hàng loạt</button><button className="users-button" disabled={!selectedOwners.length} onClick={() => setDialog({ type: 'account', owners: selectedOwners, restore: true })}>Khôi phục hàng loạt</button><button className="users-button" disabled={!selected.length} onClick={() => exportCsv(owners.filter(owner => selected.includes(owner.id)))}>Xuất mục đã chọn</button></div></div></section>
      {notice && <div className="users-notice" role="status">{notice}<button aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={14} /></button></div>}
      <section className="owners-table-panel" aria-label="Danh sách chủ sân" aria-busy={loading}><div className="owners-table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả chủ sân trên trang" checked={allVisibleSelected} onChange={toggleVisible} ref={node => { if (node) node.indeterminate = someVisibleSelected && !allVisibleSelected }} /></th><th>Chủ sân</th><th>Liên hệ</th><th>Cơ sở thể thao</th><th>Ngày tham gia</th><th>KYC</th><th>Tài khoản</th></tr></thead><tbody>{visible.map(owner => <tr key={owner.id} className={owner.id === detailId ? 'is-selected' : ''} onClick={() => setDetailId(owner.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${owner.name}`} checked={selected.includes(owner.id)} onChange={() => toggle(owner.id)} /></td><td><button className="owners-table-profile" aria-label={`Xem chi tiết ${owner.name}`} onClick={event => { event.stopPropagation(); setDetailId(owner.id) }}><UserAvatar user={owner} /><span><strong>{owner.name}{owner.status === 'Active' && <i />}</strong>{owner.username && <small>@{owner.username}</small>}</span></button></td><td><strong className="owners-contact-email">{owner.email || '—'}</strong><small>{owner.phone || "Chưa có số điện thoại"}</small></td><td><span className="owners-facility-count"><Building2 size={11} />{owner.facilities.length}</span></td><td>{owner.joined ? owner.joined.split('-').reverse().join('/') : '—'}</td><td>{verifications.byUser[owner.id] ? <VerificationBadge status={verifications.byUser[owner.id].status} /> : <span className="users-status inactive"><i />Chưa nộp</span>}</td><td><AccountStatus status={owner.status} /></td></tr>)}</tbody></table></div>
        {loading && !data.owners.length && <div className="users-empty"><Building2 size={25} /><h3>Đang tải chủ sân…</h3></div>}
        {!loading && !visible.length && <div className="users-empty"><Building2 size={25} /><h3>{owners.length ? 'Không có chủ sân phù hợp với bộ lọc' : 'Chưa có chủ sân nào'}</h3>{owners.length > 0 && <><p>Thử từ khóa khác hoặc đặt lại bộ lọc.</p><button className="users-button" onClick={reset}>Đặt lại bộ lọc</button></>}</div>}
        <footer className="owners-pagination"><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} trên {filtered.length} chủ sân</span><label>Số dòng mỗi trang<select aria-label="Số chủ sân mỗi trang" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size}>{size}</option>)}</select></label><nav aria-label="Phân trang chủ sân"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} className={number === currentPage ? 'current' : ''} aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Sau</button></nav></footer></section>
    </div>
    {detail && <CourtOwnerDetails owner={detail} verification={verifications.byUser[detail.id]} onKyc={id => openTab('kyc', id)} isSelf={detail.id === meId} onClose={() => setDetailId(null)} onSuspend={() => setDialog({ type: 'account', owners: [detail], restore: detail.status === 'Suspended' })} onDelete={() => setDialog({ type: 'delete', owner: detail })} />}
    {dialog?.type === 'add' && <UserFormDialog key="add" noun="chủ sân" users={data.owners} roles={roles} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'account' && <SuspensionDialog noun="chủ sân" users={dialog.owners} restore={dialog.restore} onClose={closeDialog} onDone={done} />}
    {dialog?.type === 'delete' && <DeleteUserDialog user={dialog.owner} onClose={closeDialog} onDone={afterDelete} />}
  </div>
}
