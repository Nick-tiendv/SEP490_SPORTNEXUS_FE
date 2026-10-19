import { useEffect, useState } from 'react'
import { X, Network, Shuffle, Ban, MapPin, UserPlus, CheckCircle2, Lock, LockOpen } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import TournamentBracket from './TournamentBracket.jsx'
import { getBracket, getParticipants, getTournament } from '../../api/admin/tournamentApi.js'
import { statusLabels, sportLabels, categoryTypeLabels, formatLabels, matchLabels, money, number, date, isClosed, statusBadge } from './tournamentData.js'

// status (giai đoạn: OPEN…) và isLocked (admin khóa) là 2 field riêng; khi bị khóa thì "Đã khóa" là trạng thái chính.
export function TournamentStatus({ status, locked }) {
  if (locked) return <StatusBadge status="Cancelled" label="Đã khóa" />
  return <StatusBadge status={statusBadge(status)} label={statusLabels[status] || status || '—'} />
}
export function RegistrationProgress({ tournament }) {
  if (tournament.registered == null && tournament.capacity == null) return <span>—</span>
  return <div className="tournaments-progress"><div><span>{number(tournament.registered ?? 0)}{tournament.capacity != null && ` / ${number(tournament.capacity)}`}</span><small>người đăng ký</small></div>{tournament.capacity != null && <progress value={tournament.registered ?? 0} max={tournament.capacity || 1} aria-label="Số người đăng ký trên sức chứa" />}</div>
}

const tabs = [['bracket', 'Sơ đồ nhánh đấu'], ['participants', 'Người tham gia'], ['matches', 'Trận đấu'], ['categories', 'Hạng mục & giải thưởng']]
const settled = result => (result.status === 'fulfilled' ? result.value : null)

// Giải có thể có nhiều hạng mục con (children). Người tham gia / nhánh đấu / thao tác dùng id của hạng mục đang chọn.
export default function TournamentDetails({ tournament: base, onClose, onAction }) {
  const [tab, setTab] = useState('bracket')
  const [childId, setChildId] = useState('')
  const [info, setInfo] = useState({ id: '', data: null })
  const [lists, setLists] = useState({ key: '', participants: [], rounds: [], errors: '' })

  useEffect(() => {
    let cancelled = false
    getTournament(base.id).then(data => !cancelled && setInfo({ id: base.id, data })).catch(() => !cancelled && setInfo({ id: base.id, data: null }))
    return () => { cancelled = true }
  }, [base.id])
  const tournament = info.id === base.id && info.data ? { ...base, ...Object.fromEntries(Object.entries(info.data).filter(([, value]) => value !== '' && value != null && !(Array.isArray(value) && !value.length))) } : base
  const children = tournament.children
  const activeChild = children.find(child => child.id === childId) || (children.length === 1 ? children[0] : null)
  const targetId = activeChild?.id || tournament.id
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getParticipants(targetId), getBracket(targetId)]).then(([participants, rounds]) => {
      if (cancelled) return
      const errors = [participants, rounds].filter(result => result.status === 'rejected').map(result => result.reason?.message).join(' · ')
      setLists({ key: targetId, participants: settled(participants) || [], rounds: settled(rounds) || [], errors })
    })
    return () => { cancelled = true }
  }, [targetId])

  const loading = lists.key !== targetId
  const closed = isClosed(tournament)
  const matches = lists.rounds.flatMap(round => round.matches.map(match => ({ ...match, roundLabel: round.label })))
  const act = (type, payload) => onAction(type, { tournament, targetId, targetName: activeChild ? `${tournament.name} · ${activeChild.name}` : tournament.name, participants: lists.participants, ...payload })
  const roster = list => <ul className={`tournaments-roster ${list.length < lists.participants.length ? 'compact' : ''}`}>{list.map(player => <li key={player.id}><button onClick={() => act('participant', { participant: player })}><UserAvatar user={player} /><span><strong>{player.name}</strong><small>{[player.seed != null && `Hạt giống ${player.seed}`, player.phone].filter(Boolean).join(' · ') || 'Người tham gia'}</small></span><i>{player.checkedIn ? 'Đã check-in' : player.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</i></button></li>)}</ul>

  return <aside className="tournaments-details" aria-label="Chi tiết giải đấu"><header><div><p><span className="tournaments-id" title={tournament.id}>#{tournament.id.slice(0, 8).toUpperCase()}</span><TournamentStatus status={tournament.status} locked={tournament.locked} /></p><h2>{tournament.name}</h2><small><MapPin size={11} />{tournament.facility || 'Chưa rõ cơ sở'}{tournament.starts && ` · ${date(tournament.starts)}${tournament.ends ? ` – ${date(tournament.ends)}` : ''}`}</small></div><button aria-label="Đóng chi tiết giải đấu" onClick={onClose}><X size={17} /></button></header>
    <div className="tournaments-detail-body">
      {children.length > 1 && <label className="tournaments-reason">Hạng mục<select value={activeChild?.id || ''} onChange={event => setChildId(event.target.value)}><option value="">Toàn giải</option>{children.map(child => <option key={child.id} value={child.id}>{child.name}{categoryTypeLabels[child.categoryType] ? ` (${categoryTypeLabels[child.categoryType]})` : ''}</option>)}</select></label>}
      <div className="tournaments-detail-actions"><button className="users-button" disabled={closed} onClick={() => act('add')}><UserPlus size={12} />Thêm người tham gia</button><button className="users-button primary" disabled={closed} onClick={() => act('generate', { hasBracket: lists.rounds.length > 0 })}><Network size={12} />{lists.rounds.length ? 'Tạo lại nhánh đấu' : 'Tạo nhánh đấu'}</button></div>
      <section className="tournaments-registration"><h3>Số lượng đăng ký {tournament.deadline && <small>Hạn: {date(tournament.deadline)}</small>}</h3><RegistrationProgress tournament={activeChild || tournament} /><dl><div><dt>Phí tham gia</dt><dd>{money((activeChild || tournament).entryFee)}</dd></div><div><dt>Giải thưởng</dt><dd>{money(tournament.prize)}</dd></div><div><dt>Ban tổ chức</dt><dd>{tournament.organizer || '—'}</dd></div><div><dt>Môn thể thao</dt><dd>{sportLabels[tournament.sport] || tournament.sport || '—'}</dd></div>{tournament.format && <div><dt>Thể thức</dt><dd>{formatLabels[tournament.format] || tournament.format}{categoryTypeLabels[tournament.categoryType] ? ` · ${categoryTypeLabels[tournament.categoryType]}` : ''}</dd></div>}{tournament.prizePaid > 0 && <div><dt>Đã trả thưởng</dt><dd>{money(tournament.prizePaid)}</dd></div>}</dl></section>
      {tournament.locked && <p className="users-form-error" role="status"><Lock size={12} /> Giải đang bị khóa{tournament.lockReason ? `: ${tournament.lockReason}` : ''}. Trạng thái trước khi khóa: {statusLabels[tournament.status] || tournament.status}.</p>}
      {lists.errors && <p className="users-form-error" role="alert">Không tải được đầy đủ dữ liệu: {lists.errors}</p>}
      <div className="tournaments-tabs" role="tablist" aria-label="Nội dung giải đấu">{tabs.map(([value, label], index) => <button key={value} role="tab" id={`tournament-tab-${value}`} aria-selected={tab === value} aria-controls={`tournament-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => {
        if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[next][0]); document.getElementById(`tournament-tab-${tabs[next][0]}`)?.focus() }
      }}>{label}</button>)}</div>
      <section className="tournaments-tab-panel" role="tabpanel" id={`tournament-panel-${tab}`} aria-labelledby={`tournament-tab-${tab}`} tabIndex={0}>
        {loading && tab !== 'categories' && <p className="tournaments-demo-note">Đang tải…</p>}
        {!loading && tab === 'bracket' && <><TournamentBracket rounds={lists.rounds} onMatch={match => act('score', { match })} /><h3>Người tham gia ({lists.participants.length}) {lists.participants.length > 4 && <button className="tournaments-text-button" onClick={() => setTab('participants')}>Xem tất cả</button>}</h3>{roster(lists.participants.slice(0, 4))}</>}
        {!loading && tab === 'participants' && <><h3>Danh sách đã đăng ký · {lists.participants.length} người</h3>{lists.participants.length ? roster(lists.participants) : <p className="tournaments-empty">Chưa có người đăng ký.</p>}</>}
        {!loading && tab === 'matches' && <><h3>Trận đấu</h3><div className="tournaments-matches-list">{matches.map((match, index) => <article key={match.id || index}><strong>{match.roundLabel} · Trận {match.order || index + 1}</strong><span>{matchLabels[match.status] || match.status || '—'}</span><p>{match.a.name || 'Chờ xác định'} — {match.b.name || 'Chờ xác định'}</p>{(match.scoreA != null || match.scoreB != null) && <p>Tỷ số: {match.scoreA ?? 0} – {match.scoreB ?? 0}</p>}{(match.court || match.time) && <small>{[match.court, match.time && new Date(match.time).toLocaleString('vi-VN')].filter(Boolean).join(' · ')}</small>}{match.a.name && match.b.name && !closed && <button className="tournaments-text-button" onClick={() => act('score', { match })}>Cập nhật tỷ số</button>}</article>)}</div>{!matches.length && <p className="tournaments-empty">Chưa có trận đấu. Hãy tạo nhánh đấu.</p>}</>}
        {tab === 'categories' && <>{children.length ? children.map(child => <section key={child.id} className="tournaments-registration"><h3>{child.name} <small>{categoryTypeLabels[child.categoryType] || ''}</small></h3><RegistrationProgress tournament={child} /><dl><div><dt>Phí tham gia</dt><dd>{money(child.entryFee)}</dd></div>{child.prizes.map(prize => <div key={prize.position}><dt>Giải {prize.position}</dt><dd>{money(prize.amount)}</dd></div>)}</dl></section>) : <p className="tournaments-empty">Giải không có hạng mục con.</p>}{tournament.cancellationReason && <p className="tournaments-demo-note">Lý do hủy: {tournament.cancellationReason}</p>}</>}
      </section>
    </div><footer><button className="users-button users-danger" disabled={closed} onClick={() => act('cancel')}><Ban size={12} />{/cancel/i.test(tournament.status) ? 'Giải đã hủy' : /complete/i.test(tournament.status) ? 'Giải đã hoàn thành' : 'Hủy giải'}</button><button className="users-button primary" disabled={closed || lists.participants.length < 2} onClick={() => act('pair')}><Shuffle size={12} />Bốc thăm ngẫu nhiên</button>{lists.participants.some(player => !player.checkedIn) && !closed && <span className="tournaments-demo-note"><CheckCircle2 size={12} /> {lists.participants.filter(player => player.checkedIn).length}/{lists.participants.length} đã check-in</span>}<button className="users-button" disabled={closed && !tournament.locked} onClick={() => act(tournament.locked ? 'unlock' : 'lock')}>{tournament.locked ? <><LockOpen size={12} />Mở khóa giải</> : <><Lock size={12} />Khóa giải</>}</button></footer></aside>
}
