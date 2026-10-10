import { useState } from 'react'
import { X, Pencil, Network, Shuffle, Ban, MapPin } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { UserAvatar } from '../Users/UserDetails.jsx'
import TournamentBracket from './TournamentBracket.jsx'
import { statusLabels, sportLabels, formatLabels, matchLabels, money, date } from './tournamentData.js'

export function TournamentStatus({ status }) {
  const style = { Registration: 'Confirmed', Upcoming: 'Pending', Ongoing: 'Pending', Completed: 'Completed', Cancelled: 'Cancelled' }[status]
  return <StatusBadge status={style} label={statusLabels[status]} />
}
export function RegistrationProgress({ tournament }) {
  return <div className="tournaments-progress"><div><span>{tournament.participants.length} / {tournament.capacity}</span><small>người đăng ký</small></div><progress value={tournament.participants.length} max={tournament.capacity} aria-label="Số người đăng ký trên sức chứa" /></div>
}
const tabs = [['bracket', 'Sơ đồ nhánh đấu'], ['participants', 'Người tham gia'], ['matches', 'Trận đấu'], ['timeline', 'Dòng thời gian']]
export default function TournamentDetails({ tournament, onClose, onEdit, onGenerate, onPair, onCancel, onParticipant }) {
  const [tab, setTab] = useState('bracket')
  const locked = ['Completed', 'Cancelled'].includes(tournament.status)
  const matches = tournament.bracket?.rounds.flatMap(round => round.matches.map(match => ({ ...match, round: round.label }))) || []
  const playerName = id => tournament.participants.find(player => player.id === id)?.name || 'Chờ kết quả'
  const participants = <ul className="tournaments-roster">{tournament.participants.map(player => <li key={player.id}><button onClick={() => onParticipant(player)}><UserAvatar user={player} /><span><strong>{player.name}</strong><small>Hạt giống {player.seed} · {player.rating}</small></span><i>{player.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</i></button></li>)}</ul>
  return <aside className="tournaments-details" aria-label="Chi tiết giải đấu"><header><div><p><span className="tournaments-id">#{tournament.id}</span><TournamentStatus status={tournament.status} /></p><h2>{tournament.name}</h2><small><MapPin size={11} />{tournament.facility} · {date(tournament.starts)} – {date(tournament.ends)}</small></div><button aria-label="Đóng chi tiết giải đấu" onClick={onClose}><X size={17} /></button></header>
    <div className="tournaments-detail-body"><div className="tournaments-detail-actions"><button className="users-button" disabled={locked} onClick={onEdit}><Pencil size={12} />Chỉnh sửa giải</button><button className="users-button primary" disabled={locked} onClick={onGenerate}><Network size={12} />{tournament.bracket ? 'Tạo lại nhánh đấu' : 'Tạo nhánh đấu'}</button></div>
      <section className="tournaments-registration"><h3>Số lượng đăng ký <small>Hạn: {date(tournament.deadline)}</small></h3><RegistrationProgress tournament={tournament} /><dl><div><dt>Phí tham gia</dt><dd>{money(tournament.entryFee)}</dd></div><div><dt>Giải thưởng</dt><dd>{money(tournament.prize)}</dd></div><div><dt>Thể thức</dt><dd>{formatLabels[tournament.format]}</dd></div><div><dt>Môn thể thao</dt><dd>{sportLabels[tournament.sport]}</dd></div></dl></section>
      <div className="tournaments-tabs" role="tablist" aria-label="Nội dung giải đấu">{tabs.map(([value, label], index) => <button key={value} role="tab" id={`tournament-tab-${value}`} aria-selected={tab === value} aria-controls={`tournament-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => {
        if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[next][0]); document.getElementById(`tournament-tab-${tabs[next][0]}`)?.focus() }
      }}>{label}</button>)}</div>
      <section className="tournaments-tab-panel" role="tabpanel" id={`tournament-panel-${tab}`} aria-labelledby={`tournament-tab-${tab}`} tabIndex={0}>
        {tab === 'bracket' && <><div className="tournaments-section-heading"><h3>Nhánh đấu minh họa</h3><span>{tournament.bracket?.pairing === 'Random' || tournament.pairingOrder ? 'Thứ tự bốc thăm mẫu' : 'Theo hạt giống mẫu'}</span></div><TournamentBracket tournament={tournament} onParticipant={onParticipant} /><h3>Người tham gia ({tournament.participants.length}) <button className="tournaments-text-button" onClick={() => setTab('participants')}>Xem tất cả</button></h3><ul className="tournaments-roster compact">{tournament.participants.slice(0, 4).map(player => <li key={player.id}><button onClick={() => onParticipant(player)}><UserAvatar user={player} /><span><strong>{player.name}</strong><small>Hạt giống {player.seed} · {player.rating}</small></span><i>{player.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</i></button></li>)}</ul></>}
        {tab === 'participants' && <><h3>Danh sách đã đăng ký · {tournament.participants.length} người</h3>{tournament.participants.length ? participants : <p className="tournaments-empty">Chưa có người đăng ký trong dữ liệu mẫu.</p>}</>}
        {tab === 'matches' && <><h3>Trận đấu minh họa</h3><p className="tournaments-demo-note">Khoảng thi đấu mẫu: {date(tournament.starts)} – {date(tournament.ends)}. Bản mẫu chưa xếp giờ riêng cho từng trận.</p><div className="tournaments-matches-list">{matches.map(match => <article key={match.id}><strong>{match.round} · {match.id}</strong><span>{matchLabels[match.status]}</span><p>{playerName(match.a)} — {match.b ? playerName(match.b) : match.status === 'Bye' ? 'Miễn vòng' : 'Chờ kết quả'}</p>{match.score && <p>Tỷ số mẫu: {match.score.join(' – ')}</p>}{match.winnerId && <small>{match.status === 'Bye' ? 'Đi tiếp' : 'Người thắng'}: {playerName(match.winnerId)}</small>}</article>)}</div>{!matches.length && <p className="tournaments-empty">Chưa có trận đấu. Hãy tạo nhánh đấu minh họa.</p>}</>}
        {tab === 'timeline' && <><h3>Dòng thời gian bản mẫu</h3><ol className="tournaments-history">{tournament.history.map(event => <li key={event.id}>{event.text}</li>)}</ol>{tournament.cancellationReason && <p className="tournaments-demo-note">Lý do hủy: {tournament.cancellationReason}</p>}</>}
      </section>
      <p className="tournaments-demo-note">Dữ liệu giả lập; không kết nối máy chủ. Hạt giống, tỷ số và khoản tiền không phải thông tin thi đấu hoặc giao dịch thực tế.</p>
    </div><footer><button className="users-button users-danger" disabled={locked} onClick={onCancel}><Ban size={12} />{tournament.status === 'Cancelled' ? 'Giải đã hủy' : tournament.status === 'Completed' ? 'Giải đã hoàn thành' : 'Hủy giải — Bản mẫu'}</button><button className="users-button primary" disabled={locked} onClick={onPair}><Shuffle size={12} />Bốc thăm ngẫu nhiên</button></footer></aside>
}
