import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Download, UserPlus, Filter, Users, UserRoundCheck, UserRoundPlus, UserRoundX, RefreshCw } from 'lucide-react'
import { emptyFilters, filterUsers, usersCsv, userStats, roleOptions, roleLabel, roleTone, statusLabels } from './usersData.js'
import UserDetails, { UserAvatar, AccountStatus } from './UserDetails.jsx'
import { UserFormDialog, SuspensionDialog, DeleteUserDialog } from './UserDialogs.jsx'
import { getAccount, getMyAccount, listAccounts } from '../../api/admin/accountApi.js'
import './users.css'

const statIcons = [Users, UserRoundCheck, UserRoundPlus, UserRoundX]

function RowSelection({ checked, mixed, onChange }) {
  const ref = useRef(null)
  return <input type="checkbox" aria-label="Chọn tất cả người dùng trên trang" checked={checked} onChange={onChange} ref={node => { ref.current = node; if (node) node.indeterminate = mixed }} />
}

export default function UserManagement() {
  const [reload, setReload] = useState(0)
  const [data, setData] = useState({ key: -1, users: [], error: '' })
  const [meId, setMeId] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [detailState, setDetailState] = useState({ key: '', user: null, error: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])

  // GET /api/accounts không hỗ trợ lọc/phân trang nên tải toàn bộ rồi xử lý ở FE.
  useEffect(() => {
    let cancelled = false
    listAccounts()
      .then(users => !cancelled && setData({ key: reload, users, error: '' }))
      .catch(error => !cancelled && setData(previous => ({ key: reload, users: previous.users, error: error.message })))
    return () => { cancelled = true }
  }, [reload])
  useEffect(() => {
    let cancelled = false
    getMyAccount().then(me => !cancelled && setMeId(me.id)).catch(() => {})
    return () => { cancelled = true }
  }, [])
  const detailKey = detailId ? `${detailId}#${reload}` : ''
  useEffect(() => {
    if (!detailKey) return
    let cancelled = false
    getAccount(detailKey.split('#')[0])
      .then(user => !cancelled && setDetailState({ key: detailKey, user, error: '' }))
      .catch(error => !cancelled && setDetailState({ key: detailKey, user: null, error: error.message }))
    return () => { cancelled = true }
  }, [detailKey])

  const loading = data.key !== reload
  const users = data.users
  const roles = roleOptions(users)
  const filtered = filterUsers(users, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const listUser = users.find(user => user.id === detailId)
  // Gộp chi tiết từ GET /api/accounts/{id} với bản ghi trong danh sách (giữ field nào API chi tiết thiếu).
  const fetched = detailState.key === detailKey ? detailState.user : null
  const detailUser = listUser ? { ...listUser, ...Object.fromEntries(Object.entries(fetched || {}).filter(([, value]) => value !== '' && value != null)) } : null
  const selectedUsers = users.filter(user => selected.includes(user.id) && user.id !== meId)
  const allVisibleSelected = visible.length > 0 && visible.every(user => selected.includes(user.id))
  const someVisibleSelected = visible.some(user => selected.includes(user.id))
  const activeFilters = Object.entries(filters).filter(([key, value]) => key === 'role' || key === 'status' ? value !== 'All' : Boolean(value)).length
  const updateFilter = event => { setFilters({ ...filters, [event.target.name]: event.target.value }); setPage(1) }
  const reset = () => { setFilters(emptyFilters); setPage(1) }
  const toggleRow = id => setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])
  const toggleVisible = () => setSelected(previous => allVisibleSelected ? previous.filter(id => !visible.some(user => user.id === id)) : [...new Set([...previous, ...visible.map(user => user.id)])])
  const exportCsv = records => {
    const url = URL.createObjectURL(new Blob([usersCsv(records)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'sportnexus-users.csv'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${records.length} người dùng ra CSV.`)
  }
  // Sau mỗi thao tác ghi: tải lại danh sách; keepOpen = giữ hộp thoại để hiện lỗi một phần.
  const done = (message, keepOpen = false) => {
    setReload(value => value + 1)
    if (keepOpen) return
    setDialog(null); setSelected([])
    if (message) setNotice(message)
  }
  const afterDelete = message => { setDetailId(null); done(message) }

  return (
    <div className={`users-page ${detailUser ? 'with-details' : ''}`}>
      <div className="users-main-content">
        <header className="users-page-heading admin-page-header"><div><h1>Quản lý người dùng <span>Tổng cộng {users.length.toLocaleString('vi-VN')}</span></h1><p>Quản lý người dùng đã đăng ký, vai trò và trạng thái tài khoản trên SportNexus.</p></div><div className="users-heading-actions"><button className="users-button" onClick={() => setReload(value => value + 1)} disabled={loading}><RefreshCw size={16} /><span>Làm mới</span></button><button className="users-button" onClick={() => exportCsv(filtered)} disabled={!filtered.length}><Download size={16} /><span>Xuất CSV</span></button><button className="users-button primary" onClick={() => setDialog({ type: 'add' })} disabled={!roles.length}><UserPlus size={18} /><span>Thêm người dùng</span></button></div></header>
        <div className="users-kpis">{userStats(users).map((stat, index) => { const Icon = statIcons[index]; return <article key={stat.label} className={`users-kpi ${stat.tone}`}><small>{stat.label}</small><div><strong>{loading && !users.length ? '…' : stat.value.toLocaleString('vi-VN')}</strong><Icon size={23} /></div><p>{stat.trend}</p></article> })}</div>
        {data.error && <div className="users-notice" role="alert">Không tải được danh sách người dùng: {data.error}<button onClick={() => setReload(value => value + 1)} aria-label="Thử lại">↻</button></div>}
        <section className="users-toolbar" aria-label="Bộ lọc người dùng">
          <div className="users-filter-top"><label className="users-search"><Search size={15} /><input aria-label="Tìm theo họ tên, tên đăng nhập, Email hoặc số điện thoại" placeholder="Họ tên, tên đăng nhập, email, SĐT…" name="search" value={filters.search} onChange={updateFilter} /></label><select aria-label="Lọc theo vai trò" name="role" value={filters.role} onChange={updateFilter}><option value="All">Tất cả vai trò</option>{roles.map(role => <option key={role.name} value={role.name}>{roleLabel(role.name)}</option>)}</select><select aria-label="Lọc theo trạng thái tài khoản" name="status" value={filters.status} onChange={updateFilter}><option value="All">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div className="users-date-filter"><span>Ngày tham gia</span><label>Từ ngày<input type="date" name="from" aria-label="Ngày tham gia từ" value={filters.from} onChange={updateFilter} max={filters.to || undefined} /></label><label>Đến ngày<input type="date" name="to" aria-label="Ngày tham gia đến" value={filters.to} onChange={updateFilter} min={filters.from || undefined} /></label></div>
          {filters.from && filters.to && filters.from > filters.to && <p className="users-form-error" role="alert">Ngày bắt đầu phải bằng hoặc trước ngày kết thúc.</p>}
          <div className="users-filter-actions"><span className="users-filter-count"><Filter size={13} />Bộ lọc <b>{activeFilters}</b></span><button onClick={reset}>Đặt lại</button><span className="users-toolbar-divider" /><button className="users-button" disabled={!selected.length} onClick={() => exportCsv(users.filter(user => selected.includes(user.id)))}>Xuất mục đã chọn</button><button className="users-button" disabled={!selectedUsers.length} onClick={() => setDialog({ type: 'suspend', users: selectedUsers, restore: false })}>Tạm khóa hàng loạt</button><button className="users-button" disabled={!selectedUsers.length} onClick={() => setDialog({ type: 'suspend', users: selectedUsers, restore: true })}>Khôi phục hàng loạt</button><small>{selected.length} đã chọn</small></div>
        </section>
        {notice && <div className="users-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
        <section className="users-table-panel" aria-label="Người dùng đã đăng ký" aria-busy={loading}>
          <div className="users-table-scroll"><table><thead><tr><th><RowSelection checked={allVisibleSelected} mixed={someVisibleSelected && !allVisibleSelected} onChange={toggleVisible} /></th><th>Người dùng</th><th>Tên đăng nhập</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>{visible.map(user => <tr key={user.id} className={detailId === user.id ? 'is-selected' : ''} onClick={() => setDetailId(user.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${user.name}`} checked={selected.includes(user.id)} onChange={() => toggleRow(user.id)} /></td><td><button className="users-table-profile" onClick={event => { event.stopPropagation(); setDetailId(user.id) }} aria-label={`Xem chi tiết ${user.name}`}><UserAvatar user={user} /><span><strong>{user.name}{user.id === meId && ' (bạn)'}</strong><small>{user.phone || roleLabel(user.role)}</small></span></button></td><td className="users-username">{user.username ? `@${user.username}` : '—'}</td><td className="users-email">{user.email || '—'}</td><td><span className={`users-role ${roleTone(user.role)}`}>{roleLabel(user.role)}</span></td><td><AccountStatus status={user.status} /></td></tr>)}</tbody></table></div>
          {loading && !users.length && <div className="users-empty"><Users size={26} /><h3>Đang tải người dùng…</h3></div>}
          {!loading && !visible.length && <div className="users-empty"><Users size={26} /><h3>{users.length ? 'Không có người dùng phù hợp với bộ lọc' : 'Chưa có người dùng'}</h3>{users.length > 0 && <><p>Thử từ khóa hoặc khoảng ngày khác.</p><button className="users-button" onClick={reset}>Đặt lại bộ lọc</button></>}</div>}
          <footer className="users-pagination"><div><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} trên {filtered.length} người dùng</span><label>Số dòng mỗi trang<select aria-label="Số dòng mỗi trang" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50].map(size => <option key={size}>{size}</option>)}</select></label></div><nav aria-label="Phân trang người dùng"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} aria-current={number === currentPage ? 'page' : undefined} className={number === currentPage ? 'current' : ''} onClick={() => setPage(number)}>{number}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Sau</button></nav></footer>
        </section>
      </div>
      {detailUser && <UserDetails user={detailUser} loading={detailState.key !== detailKey} error={detailState.key === detailKey ? detailState.error : ''} isSelf={detailUser.id === meId} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'edit', user: detailUser })} onSuspend={() => setDialog({ type: 'suspend', users: [detailUser], restore: detailUser.status === 'Suspended' })} onDelete={() => setDialog({ type: 'delete', user: detailUser })} />}
      {dialog?.type === 'suspend' && <SuspensionDialog users={dialog.users} restore={dialog.restore} onClose={closeDialog} onDone={done} />}
      {dialog?.type === 'delete' && <DeleteUserDialog user={dialog.user} onClose={closeDialog} onDone={afterDelete} />}
      {(dialog?.type === 'add' || dialog?.type === 'edit') && <UserFormDialog key={dialog.user?.id || 'add'} user={dialog.user} users={users} roles={roles} onClose={closeDialog} onDone={done} />}
    </div>
  )
}
