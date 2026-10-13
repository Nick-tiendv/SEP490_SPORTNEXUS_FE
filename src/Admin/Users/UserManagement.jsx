import { useCallback, useRef, useState } from 'react'
import { Search, Download, UserPlus, Filter, Users, UserRoundCheck, UserRoundPlus, UserRoundX } from 'lucide-react'
import { initialUsers, userStats, emptyFilters, filterUsers, usersCsv } from './usersData.js'
import UserDetails, { UserAvatar, AccountStatus } from './UserDetails.jsx'
import { UserFormDialog, SuspensionDialog } from './UserDialogs.jsx'
import './users.css'

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


const statIcons = [Users, UserRoundCheck, UserRoundPlus, UserRoundX]

function RowSelection({ checked, mixed, onChange }) {
  const ref = useRef(null)
  return <input type="checkbox" aria-label="Chọn tất cả người dùng trên trang" checked={checked} onChange={onChange} ref={node => { ref.current = node; if (node) node.indeterminate = mixed }} />
}

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState([])
  const [detailId, setDetailId] = useState(initialUsers[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(7)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const closeDialog = useCallback(() => setDialog(null), [])
  const filtered = filterUsers(users, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const detailUser = users.find(user => user.id === detailId)
  const selectedUsers = users.filter(user => selected.includes(user.id))
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
    link.href = url; link.download = 'sportnexus-demo-users.csv'
    document.body.appendChild(link); link.click(); link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`Đã xuất ${records.length} người dùng mẫu ra CSV.`)
  }
  const saveUser = values => {
    if (dialog.type === 'edit') {
      setUsers(previous => previous.map(user => user.id === dialog.user.id ? { ...user, ...values, phone: values.phone || null } : user))
      setNotice("Đã cập nhật hồ sơ mẫu trong phiên hiện tại. Không thay đổi dữ liệu máy chủ.")
    } else {
      const user = { ...values, id: `DEMO-${crypto.randomUUID()}`, status: 'Active', joined: new Date().toLocaleDateString('en-CA'), phone: values.phone || null, lastActive: null, sport: null, dupr: null, elo: null, fairplay: null, bookings: 0, lfg: 0, tournaments: 0, reviews: 0, wallet: null, totalSpent: null, activities: [], disputes: 0 }
      setUsers(previous => [user, ...previous]); setDetailId(user.id); reset()
      setNotice("Đã thêm người dùng mẫu trong phiên hiện tại. Không tạo tài khoản trên máy chủ.")
    }
    closeDialog()
  }
  const confirmSuspension = () => {
    const ids = dialog.users.map(user => user.id)
    setUsers(previous => previous.map(user => ids.includes(user.id) ? dialog.restore ? { ...user, status: user.previousStatus || 'Active', previousStatus: null } : { ...user, previousStatus: user.status === 'Suspended' ? user.previousStatus : user.status, status: 'Suspended' } : user))
    setNotice(`Đã ${dialog.restore ? 'khôi phục' : 'tạm khóa'} ${ids.length} users locally. Không thay đổi dữ liệu máy chủ.`)
    closeDialog()
  }
  return (
    <div className={`users-page ${detailUser ? 'with-details' : ''}`}>
      <div className="users-main-content">
        <header className="users-page-heading"><div><h1>Quản lý người dùng <span>Tổng cộng 148,2 nghìn</span></h1><p>Quản lý người dùng đã đăng ký, điểm đánh giá vận động viên và trạng thái tài khoản trên SportNexus.</p></div><div className="users-heading-actions"><button className="users-button" onClick={() => exportCsv(filtered)}><Download size={16} /><span>Xuất<br />CSV</span></button><button className="users-button primary" onClick={() => setDialog({ type: 'add' })}><UserPlus size={18} /><span>Thêm<br />Người dùng</span></button></div></header>
        <div className="users-kpis">{userStats.map((stat, index) => { const Icon = statIcons[index]; return <article key={stat.label} className={`users-kpi ${stat.tone}`}><small>{stat.label}</small><div><strong>{stat.value}</strong><Icon size={23} /></div><p>{stat.trend}</p></article> })}</div>
        <div className="users-prototype-label">Bản mẫu tương tác • Chỉ số chỉ dùng để minh họa; bảng có {users.length} bản ghi trong phiên hiện tại.</div>
        <section className="users-toolbar" aria-label="Bộ lọc người dùng">
          <div className="users-filter-top"><label className="users-search"><Search size={15} /><input aria-label="Tìm theo họ tên, tên đăng nhập hoặc Email" name="search" value={filters.search} onChange={updateFilter} /></label><select aria-label="Lọc theo vai trò" name="role" value={filters.role} onChange={updateFilter}><option value="All">Tất cả vai trò</option>{['Player', 'Court Owner', 'Administrator'].map(role => <option key={role} value={role}>{adminDisplayLabels[role] || role}</option>)}</select><select aria-label="Lọc theo trạng thái tài khoản" name="status" value={filters.status} onChange={updateFilter}><option value="All">Tất cả trạng thái</option>{['Active', 'Inactive', 'Suspended'].map(status => <option key={status} value={status}>{adminDisplayLabels[status] || status}</option>)}</select></div>
          <div className="users-date-filter"><span>Ngày tham gia</span><label>Từ ngày<input type="date" name="from" aria-label="Ngày tham gia từ" value={filters.from} onChange={updateFilter} max={filters.to || undefined} /></label><label>Đến ngày<input type="date" name="to" aria-label="Ngày tham gia đến" value={filters.to} onChange={updateFilter} min={filters.from || undefined} /></label></div>
          {filters.from && filters.to && filters.from > filters.to && <p className="users-form-error" role="alert">Ngày bắt đầu phải bằng hoặc trước ngày kết thúc.</p>}
          <div className="users-filter-actions"><span className="users-filter-count"><Filter size={13} />Bộ lọc <b>{activeFilters}</b></span><button onClick={reset}>Đặt lại</button><span className="users-toolbar-divider" /><button className="users-button" disabled={!selected.length} onClick={() => exportCsv(selectedUsers)}>Xuất mục đã chọn</button><button className="users-button" disabled={!selected.length} onClick={() => setDialog({ type: 'suspend', users: selectedUsers, restore: false })}>Tạm khóa hàng loạt</button><small>{selected.length} đã chọn</small></div>
        </section>
        {notice && <div className="users-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
        <section className="users-table-panel" aria-label="Người dùng đã đăng ký">
          <div className="users-table-scroll"><table><thead><tr><th><RowSelection checked={allVisibleSelected} mixed={someVisibleSelected && !allVisibleSelected} onChange={toggleVisible} /></th><th>Người dùng</th><th>Tên đăng nhập</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>{visible.map(user => <tr key={user.id} className={detailId === user.id ? 'is-selected' : ''} onClick={() => setDetailId(user.id)}><td onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${user.name}`} checked={selected.includes(user.id)} onChange={() => toggleRow(user.id)} /></td><td><button className="users-table-profile" onClick={event => { event.stopPropagation(); setDetailId(user.id) }} aria-label={`Xem chi tiết ${user.name}`}><UserAvatar user={user} /><span><strong>{user.name}</strong><small>{user.role === 'Player' ? user.sport || 'Người chơi' : adminDisplayLabels[user.role] || user.role}</small>{user.elo && <small>• Elo {user.elo}</small>}</span></button></td><td className="users-username">@{user.username}</td><td className="users-email">{user.email}</td><td><span className={`users-role ${user.role === 'Court Owner' ? 'owner' : user.role === 'Administrator' ? 'administrator' : ''}`}>{adminDisplayLabels[user.role] || user.role}</span></td><td><AccountStatus status={user.status} /></td></tr>)}</tbody></table></div>
          {!visible.length && <div className="users-empty"><Users size={26} /><h3>Không có người dùng phù hợp với bộ lọc</h3><p>Thử từ khóa hoặc khoảng ngày khác.</p><button className="users-button" onClick={reset}>Đặt lại bộ lọc</button></div>}
          <footer className="users-pagination"><div><span>Hiển thị {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} trên {filtered.length} người dùng mẫu</span><label>Số dòng mỗi trang<select aria-label="Số dòng mỗi trang" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }}>{[7, 10, 15].map(size => <option key={size}>{size}</option>)}</select></label></div><nav aria-label="Phân trang người dùng"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trước</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} aria-current={number === currentPage ? 'page' : undefined} className={number === currentPage ? 'current' : ''} onClick={() => setPage(number)}>{number}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Sau</button></nav></footer>
        </section>
      </div>
      {detailUser && <UserDetails user={detailUser} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'edit', user: detailUser })} onSuspend={() => setDialog({ type: 'suspend', users: [detailUser], restore: detailUser.status === 'Suspended' })} />}
      {dialog && (dialog.type === 'suspend' ? <SuspensionDialog users={dialog.users} restore={dialog.restore} onClose={closeDialog} onConfirm={confirmSuspension} /> : <UserFormDialog key={dialog.user?.id || 'add'} user={dialog.user} users={users} onClose={closeDialog} onSave={saveUser} />)}
    </div>
  )
}
