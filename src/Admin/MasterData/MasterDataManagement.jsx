import { useEffect, useState } from 'react'
import { ArchiveRestore, Layers, Pencil, Plus, RefreshCw, Search, Trash2, Volleyball } from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '../components/StatCard.jsx'
import { listMasterData, restoreMasterData } from '../../api/admin/masterDataApi.js'
import { filterMasterData, formatNumber, kinds, masterDataStats } from './masterDataHelpers.js'
import { AmenityIcon, DeleteMasterDataDialog, MasterDataForm } from './MasterDataDialogs.jsx'
import '../Users/users.css'
import './masterData.css'

const columns = {
  sports: ['Môn thể thao', 'Mô tả luật chơi', 'Sân con', 'Giải đấu', 'Trạng thái', ''],
  amenities: ['Tiện ích', 'Mã icon', 'Cơ sở đang gắn', 'Trạng thái', ''],
}

export default function MasterDataManagement() {
  const [kind, setKind] = useState('sports')
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [reload, setReload] = useState(0)
  const [dialog, setDialog] = useState(null) // { type: 'form' | 'delete', item }
  const [restoringId, setRestoringId] = useState(null)

  // GET /api/v1/admin/master-data/{sports|amenities}?includeDeleted=true — tải cả mục đã xóa để đếm và khôi phục.
  const [data, setData] = useState({ key: -1, sports: [], amenities: [], errors: {} })
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([listMasterData('sports', { includeDeleted: true }), listMasterData('amenities', { includeDeleted: true })]).then(([sports, amenities]) => {
      if (cancelled) return
      setData({ key: reload, sports: sports.value || [], amenities: amenities.value || [], errors: { sports: sports.reason?.message, amenities: amenities.reason?.message } })
    })
    return () => { cancelled = true }
  }, [reload])
  const loading = data.key !== reload
  const items = data[kind]
  const error = data.errors[kind]
  const rows = filterMasterData(items, { search, showDeleted })
  const stats = masterDataStats(kind, items)
  const { label, noun } = kinds[kind]

  const refresh = () => setReload(value => value + 1)
  const done = message => { setDialog(null); toast.success(message || 'Đã cập nhật danh mục.'); refresh() }
  const switchKind = value => { setKind(value); setSearch('') }

  // PATCH /api/v1/admin/master-data/{sports|amenities}/{id}/restore
  const restore = async item => {
    setRestoringId(item.id)
    try {
      const { message } = await restoreMasterData(kind, item.id)
      toast.success(message || `Đã khôi phục ${noun}.`)
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRestoringId(null)
    }
  }

  const statusBadge = item => <span className={`admin-badge ${item.isDeleted ? 'admin-badge--neutral' : 'admin-badge--success'}`}>{item.isDeleted ? 'Đã xóa' : 'Đang dùng'}</span>
  const actions = item => <div className="md-actions">{item.isDeleted
    ? <button className="users-button" onClick={() => restore(item)} disabled={restoringId === item.id}><ArchiveRestore size={13} />{restoringId === item.id ? 'Đang khôi phục…' : 'Khôi phục'}</button>
    : <><button className="users-button" onClick={() => setDialog({ type: 'form', item })} aria-label={`Sửa ${item.name}`}><Pencil size={13} />Sửa</button><button className="users-button md-danger-outline" onClick={() => setDialog({ type: 'delete', item })} aria-label={`Xóa ${item.name}`}><Trash2 size={13} />Xóa</button></>}</div>

  return <div className="md-page">
    <header className="md-page-heading admin-page-header">
      <div><h1>Danh mục dùng chung</h1><p>Quản lý môn thể thao và tiện ích mà chủ sân chọn khi tạo cơ sở, sân con và giải đấu. Xóa là xóa mềm, có thể khôi phục.</p></div>
      <div className="md-heading-actions">
        <button className="users-button" onClick={refresh} disabled={loading}><RefreshCw size={13} />Làm mới</button>
        <button className="users-button primary" onClick={() => setDialog({ type: 'form', item: null })} disabled={loading}><Plus size={13} />Thêm {noun}</button>
      </div>
    </header>

    <div className="admin-tabs md-tabs" role="tablist" aria-label="Loại danh mục">
      {Object.entries(kinds).map(([key, meta]) => <button key={key} role="tab" aria-selected={kind === key} className={kind === key ? 'active' : ''} onClick={() => switchKind(key)}>{key === 'sports' ? <Volleyball size={15} /> : <Layers size={15} />}{meta.label} <span className="md-count">{loading ? '…' : formatNumber(masterDataStats(key, data[key]).active)}</span></button>)}
    </div>

    <div className="md-stats">
      <StatCard label={`${label} đang dùng`} value={loading ? '…' : formatNumber(stats.active)} icon={kind === 'sports' ? Volleyball : Layers} supporting="Hiển thị cho chủ sân và người chơi" />
      <StatCard label="Đang được sử dụng" value={loading ? '…' : formatNumber(stats.inUse)} icon={Layers} supporting={kind === 'sports' ? 'Có sân con hoặc giải đấu' : 'Đang gắn với ít nhất 1 cơ sở'} />
      <StatCard label="Đã xóa" value={loading ? '…' : formatNumber(stats.deleted)} icon={Trash2} supporting="Có thể khôi phục" />
    </div>

    <section className="admin-card md-panel">
      <div className="md-toolbar">
        <label className="admin-search-field"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={kind === 'sports' ? 'Tìm tên môn, mô tả luật…' : 'Tìm tên tiện ích, mã icon…'} aria-label={`Tìm ${noun}`} /></label>
        <label className="md-toggle"><input type="checkbox" checked={showDeleted} onChange={event => setShowDeleted(event.target.checked)} />Hiện mục đã xóa ({formatNumber(stats.deleted)})</label>
      </div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr>{columns[kind].map(title => <th key={title || 'actions'} className={/Sân con|Giải đấu|Cơ sở/.test(title) ? 'is-num' : undefined}>{title}</th>)}</tr></thead>
        <tbody>{rows.map(item => <tr key={item.id} className={item.isDeleted ? 'md-deleted' : undefined}>
          {kind === 'sports' ? <>
            <td><strong>{item.name}</strong></td>
            <td><span className="md-excerpt" title={item.description}>{item.description || <em className="md-muted">Chưa có mô tả</em>}</span></td>
            <td className="is-num">{formatNumber(item.courtCount)}</td>
            <td className="is-num">{formatNumber(item.tournamentCount)}</td>
          </> : <>
            <td><span className="md-amenity"><span className="md-icon-preview"><AmenityIcon code={item.iconCode} /></span><strong>{item.name}</strong></span></td>
            <td>{item.iconCode ? <code>{item.iconCode}</code> : <em className="md-muted">—</em>}</td>
            <td className="is-num">{formatNumber(item.facilityCount)}</td>
          </>}
          <td>{statusBadge(item)}</td>
          <td>{actions(item)}</td>
        </tr>)}</tbody>
      </table></div>
      {loading && !items.length && <p className="md-empty">Đang tải danh mục… Lần tải đầu có thể mất 30–60 giây khi máy chủ khởi động.</p>}
      {!loading && error && <p className="md-empty users-form-error">Không tải được danh sách {noun}: {error}</p>}
      {!loading && !error && !rows.length && <p className="md-empty">{search ? `Không tìm thấy ${noun} phù hợp.` : `Chưa có ${noun} nào. Bấm “Thêm ${noun}” để tạo mới.`}</p>}
    </section>

    {dialog?.type === 'form' && <MasterDataForm kind={kind} item={dialog.item} items={items} onClose={() => setDialog(null)} onDone={done} />}
    {dialog?.type === 'delete' && <DeleteMasterDataDialog kind={kind} item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
  </div>
}
