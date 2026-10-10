import { useState } from 'react'
import { Trophy, UserRoundPlus, Clock3, BadgeCheck, Users, Download, ListFilter, Plus, Search, Filter } from 'lucide-react'
import TournamentTable from './TournamentTable.jsx'
import TournamentDetails from './TournamentDetails.jsx'
import { TournamentForm, TournamentActionDialog, ParticipantDialog } from './TournamentDialogs.jsx'
import { initialTournaments, tournamentStats, facilities, statusLabels, sportLabels, normalize, parseDate, number, exportTournaments, generateBracket, randomOrder } from './tournamentData.js'
import '../Users/users.css'
import './tournament.css'

const emptyFilters = { search: '', status: '', sport: '', facility: '', from: '', to: '' }
const icons = { total: Trophy, open: UserRoundPlus, upcoming: Clock3, completed: BadgeCheck, participants: Users }

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState(initialTournaments)
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [detailId, setDetailId] = useState(initialTournaments[0].id)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const from = parseDate(filters.from), to = parseDate(filters.to)
  const filtered = tournaments.filter(t => normalize(`${t.name} ${t.id} ${t.facility} ${t.organizer}`).includes(normalize(filters.search.trim()))
    && (!filters.status || t.status === filters.status) && (!filters.sport || t.sport === filters.sport) && (!filters.facility || t.facility === filters.facility)
    && (!from || t.ends >= from) && (!to || t.starts <= to))
  const detail = tournaments.find(t => t.id === detailId)
  const change = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })); setError('') }
  const apply = event => {
    event.preventDefault()
    const start = parseDate(draft.from), end = parseDate(draft.to)
    if ((draft.from && !start) || (draft.to && !end)) return setError('Nhập ngày hợp lệ theo định dạng ngày/tháng/năm.')
    if (start && end && start > end) return setError('Ngày kết thúc bộ lọc phải bằng hoặc sau ngày bắt đầu.')
    setFilters(draft); setPage(1); setError('')
  }
  const reset = () => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(1); setError('') }
  const quick = () => {
    const status = filters.status === 'Registration' ? '' : 'Registration'
    setDraft(previous => ({ ...previous, status })); setFilters(previous => ({ ...previous, status })); setPage(1)
  }
  const save = values => {
    const existing = dialog.tournament
    const id = existing?.id || `TRN-2026-${String(Math.max(...tournaments.map(t => Number(t.id.split('-').at(-1)))) + 1).padStart(3, '0')}`
    const changedFormat = existing && existing.format !== values.format
    const updated = { ...(existing || { id, status: 'Registration', participants: [], bracket: null, pairingOrder: null, cancellationReason: null, history: [] }), ...values,
      ...(changedFormat ? { bracket: null, pairingOrder: null } : {}), history: [...(existing?.history || []), { id: `edit-${existing?.history.length || 0}`, text: existing ? `Chỉnh sửa giải trong phiên hiện tại.${changedFormat ? ' Đổi thể thức; xóa nhánh đấu và bốc thăm mẫu cũ.' : ''}` : 'Tạo giải mới trong phiên hiện tại; chưa có người đăng ký.' }],
    }
    setTournaments(previous => existing ? previous.map(t => t.id === id ? updated : t) : [updated, ...previous])
    setDetailId(id); if (!existing) reset(); setDialog(null); setNotice(existing ? 'Đã chỉnh sửa giải trong bản mẫu; không lưu lên máy chủ.' : 'Đã tạo giải trong bản mẫu. Không tạo giải hoặc thu tiền trên máy chủ.')
  }
  const action = type => {
    if (['Completed', 'Cancelled'].includes(detail.status)) return
    if (type !== 'cancel' && detail.participants.length < 2) { setNotice('Cần ít nhất 2 người đăng ký để tạo nhánh đấu hoặc bốc thăm minh họa.'); return }
    setDialog({ type, tournament: detail })
  }
  const confirm = reason => {
    const selected = dialog.tournament, type = dialog.type
    const order = type === 'pair' ? randomOrder(selected.participants) : selected.pairingOrder || selected.participants.map(player => player.id)
    setTournaments(previous => previous.map(t => {
      if (t.id !== selected.id) return t
      if (type === 'cancel') return { ...t, status: 'Cancelled', cancellationReason: reason, history: [...t.history, { id: `cancel-${t.history.length}`, text: `Hủy giải trong bản mẫu: ${reason}. Không thực hiện hoàn tiền.` }] }
      const bracket = type === 'generate' || t.bracket ? { ...generateBracket(t, order), pairing: type === 'pair' || t.pairingOrder ? 'Random' : 'Seeded' } : null
      return { ...t, bracket, ...(type === 'pair' ? { pairingOrder: order } : {}), history: [...t.history, { id: `${type}-${t.history.length}`, text: type === 'pair' ? `Bốc thăm thứ tự minh họa.${t.bracket ? ' Thay nhánh đấu cho khớp bốc thăm mới; xóa tỷ số mẫu.' : ' Chưa tạo nhánh đấu.'}` : 'Tạo nhánh đấu minh họa theo thứ tự hiện tại; không lưu lên máy chủ.' }] }
    }))
    setDialog(null); setNotice(type === 'cancel' ? 'Đã hủy giải trong bản mẫu; không hoàn tiền hoặc thay đổi dữ liệu máy chủ.' : type === 'pair' ? `Đã bốc thăm minh họa; giữ nguyên hạt giống. ${selected.bracket ? 'Nhánh đấu được cập nhật theo thứ tự mới.' : 'Chưa tạo nhánh đấu.'}` : 'Đã tạo nhánh đấu minh họa; không thay đổi kết quả thi đấu thực tế.')
  }
  return <div className="tournaments-page"><header className="tournaments-page-heading"><div><h1>Quản lý giải đấu <span>84 giải mẫu</span></h1><p>Theo dõi đăng ký, nhánh đấu và tiến độ các giải thể thao trên SportNexus.</p></div><div><button className="users-button" onClick={() => { exportTournaments(filtered); setNotice(`Đã xuất ${number(filtered.length)} giải đang được lọc ra CSV minh họa.`) }}><Download size={13} />Xuất CSV</button><button className="users-button" onClick={quick} aria-pressed={filters.status === 'Registration'}><ListFilter size={13} />Bộ lọc nhanh</button><button className="users-button primary" onClick={() => setDialog({ type: 'form', tournament: null })}><Plus size={13} />Tạo giải đấu</button></div></header>
    <div className="tournaments-kpis">{tournamentStats.map(stat => { const Icon = icons[stat.icon]; return <article key={stat.label} className={stat.icon}><div><small>{stat.label}</small><Icon size={24} /></div><strong>{number(stat.value)}</strong><p>{stat.note}</p></article> })}</div><p className="tournaments-demo-label">Chỉ số nền tảng độc lập, không tính từ {tournaments.length} giải mẫu và không cộng các nhóm thành tổng. Dữ liệu sẽ khôi phục khi tải lại trang.</p>
    {notice && <div className="users-notice" role="status"><span>{notice}</span><button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <form className="tournaments-toolbar" onSubmit={apply} noValidate aria-label="Bộ lọc giải đấu"><div className="tournaments-filter-row"><label className="users-search"><Search size={14} /><input aria-label="Tìm kiếm giải đấu" placeholder="Tìm tên giải, cơ sở, ban tổ chức…" value={draft.search} onChange={event => change('search', event.target.value)} /></label><label>Trạng thái<select value={draft.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Môn thể thao<select value={draft.sport} onChange={event => change('sport', event.target.value)}><option value="">Tất cả môn</option>{Object.entries(sportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="tournaments-filter-row"><label>Cơ sở<select value={draft.facility} onChange={event => change('facility', event.target.value)}><option value="">Tất cả cơ sở</option>{facilities.map(facility => <option key={facility}>{facility}</option>)}</select></label>{[['from', 'Từ ngày'], ['to', 'Đến ngày']].map(([key, label]) => <label key={key}>{label}<input value={draft[key]} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} onChange={event => change(key, event.target.value)} aria-describedby={error ? 'tournament-filter-error' : undefined} /></label>)}<button className="users-button primary"><Filter size={12} />Áp dụng bộ lọc</button><button type="button" className="tournaments-text-button" onClick={reset}>Đặt lại</button></div>{error && <p className="users-form-error" id="tournament-filter-error" role="alert">{error}</p>}<p className="tournaments-filter-hint">{Object.keys(emptyFilters).some(key => draft[key] !== filters[key]) ? 'Nhấn “Áp dụng bộ lọc” để cập nhật kết quả và CSV.' : filters.status === 'Registration' ? 'Bộ lọc nhanh: chỉ hiện giải đang mở đăng ký.' : 'Lọc ngày theo khoảng diễn ra giải; bao gồm giải giao với khoảng ngày đã chọn.'}</p></form>
    <div className={`tournaments-content-grid ${detail ? 'with-details' : ''}`}><TournamentTable tournaments={filtered} detailId={detailId} onDetail={setDetailId} page={page} pageSize={pageSize} onPage={setPage} onPageSize={value => { setPageSize(value); setPage(1) }} />{detail && <TournamentDetails key={detail.id} tournament={detail} onClose={() => setDetailId(null)} onEdit={() => setDialog({ type: 'form', tournament: detail })} onGenerate={() => action('generate')} onPair={() => action('pair')} onCancel={() => action('cancel')} onParticipant={participant => setDialog({ type: 'participant', participant })} />}</div>
    {dialog?.type === 'form' && <TournamentForm tournament={dialog.tournament} tournaments={tournaments} onClose={() => setDialog(null)} onSave={save} />}
    {dialog?.type === 'participant' && <ParticipantDialog participant={dialog.participant} onClose={() => setDialog(null)} />}
    {['generate', 'pair', 'cancel'].includes(dialog?.type) && <TournamentActionDialog type={dialog.type} tournament={dialog.tournament} onClose={() => setDialog(null)} onConfirm={confirm} />}
  </div>
}
