import { useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import {
  searchTournaments,
  getMyRegistrations,
  getTournament,
  joinTournament,
  cancelTournamentRegistration,
  getMyMatches,
  getCourtSchedule,
  getMatch,
  getTournamentBracket,
  getTournamentParticipants,
  getMyTournamentInvitations,
  respondTournamentInvitation,
} from '../../api/player/tournamentApi.js'
import { getMyTeams } from '../../api/player/teamApi.js'
import TeamsPanel from './TeamsPanel.jsx'
import ReportModal from '../../components/common/ReportModal.jsx'
import { TournamentWorkspace } from '../../CourtOwner/Tournament/CreateTournament.jsx'

// Trận hòa (chỉ vòng bảng / vòng tròn bóng đá): resultType = DRAW, winnerId / winnerName = null
const isDraw = (match) => String(match?.resultType || '').toUpperCase() === 'DRAW'
const TIER_LABEL = { AMATEUR: 'Phong trào', SEMI_PRO: 'Bán chuyên', PRO: 'Chuyên nghiệp' }
const money = (value) => (value ? `${new Intl.NumberFormat('vi-VN').format(value)} đ` : 'Miễn phí')
const date = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
// Ngày của giải chưa được ban tổ chức nhập
const dateOrTba = (value) => (value ? date(value) : 'Chưa công bố')
// Lệ phí theo từng nội dung thi đấu: hiện khoảng thấp nhất – cao nhất
const feeRange = (tournament) => {
  if (tournament.entryFee != null) return money(tournament.entryFee)
  const fees = (tournament.children || []).map((child) => child.entryFee).filter((fee) => fee != null)
  if (fees.length === 0) return 'Theo từng nội dung'
  const min = Math.min(...fees)
  const max = Math.max(...fees)
  return min === max ? money(min) : `${money(min)} – ${money(max)}`
}
const dateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—')

const STATUS = {
  OPEN: ['Đang mở đăng ký', 'green'],
  REGISTRATION: ['Đang mở đăng ký', 'green'],
  UPCOMING: ['Sắp diễn ra', 'blue'],
  ONGOING: ['Đang diễn ra', 'amber'],
  INPROGRESS: ['Đang diễn ra', 'amber'],
  COMPLETED: ['Đã kết thúc', 'gray'],
  FINISHED: ['Đã kết thúc', 'gray'],
  CANCELLED: ['Đã hủy', 'red'],
  PAID: ['Đã thanh toán', 'green'],
  PENDING: ['Chờ thanh toán', 'amber'],
  REFUNDED: ['Đã hoàn tiền', 'gray'],
}
function StatusBadge({ value }) {
  const [label, tone] = STATUS[String(value || '').toUpperCase().replace(/[_\s]/g, '')] || [value || '—', 'gray']
  return <span className={`snx-badge snx-badge--${tone}`}>{label}</span>
}

const TABS = [
  { key: 'open', label: 'Đang mở đăng ký', icon: 'event_available' },
  { key: 'mine', label: 'Giải của tôi', icon: 'how_to_reg' },
  { key: 'matches', label: 'Lịch thi đấu', icon: 'sports_score' },
  { key: 'teams', label: 'Đội của tôi', icon: 'groups' },
  { key: 'invitations', label: 'Lời mời giải', icon: 'mail' },
  { key: 'organize', label: 'Giải tôi tổ chức', icon: 'campaign' },
]

function TournamentCard({ tournament, actions, onOpen }) {
  return (
    <article className="snx-card snx-stack" style={{ gap: 12 }}>
      <div className="snx-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button type="button" onClick={onOpen} style={{ padding: 0, border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <h3 className="snx-card-title">{tournament.name}</h3>
          </button>
          <p className="snx-card-subtitle">{[tournament.sport, tournament.facility].filter(Boolean).join(' · ') || '—'}</p>
        </div>
        <StatusBadge value={tournament.registrationStatus || tournament.status} />
      </div>
      <dl className="snx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, margin: 0, fontSize: 13 }}>
        <div><dt className="snx-muted">Bắt đầu</dt><dd style={{ margin: 0, fontWeight: 600 }}>{dateOrTba(tournament.starts)}</dd></div>
        <div><dt className="snx-muted">Hạn đăng ký</dt><dd style={{ margin: 0, fontWeight: 600 }}>{dateOrTba(tournament.deadline)}</dd></div>
        <div><dt className="snx-muted">Lệ phí</dt><dd style={{ margin: 0, fontWeight: 600 }}>{feeRange(tournament)}</dd></div>
        {tournament.teamName && <div><dt className="snx-muted">Đội</dt><dd style={{ margin: 0, fontWeight: 600 }}>{tournament.teamName}</dd></div>}
      </dl>
      <div className="snx-row">
        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={onOpen}><span className="material-symbols-outlined">info</span>Chi tiết</button>
        <span className="snx-spacer" />
        {actions}
      </div>
    </article>
  )
}

// Chi tiết giải: các bảng đấu, giải thưởng, lịch các trận (court-schedule) và chi tiết trận
// Người tham gia + sơ đồ nhánh đấu của 1 bảng đấu (API công khai)
function CategoryInsight({ category, onClose }) {
  const [view, setView] = useState('participants')
  const participants = useApi(() => getTournamentParticipants(category.id), [category.id], { initialData: [] })
  const bracket = useApi(() => getTournamentBracket(category.id), [category.id], { initialData: [], enabled: view === 'bracket' })
  return (
    <section className="snx-card" style={{ padding: 16 }}>
      <div className="snx-row" style={{ marginBottom: 10 }}>
        <strong>{category.name}</strong>
        <span className="snx-spacer" />
        <div className="snx-tabs" role="tablist" aria-label="Thông tin bảng đấu">
          <button type="button" role="tab" aria-selected={view === 'participants'} className="snx-tab" onClick={() => setView('participants')}>Người tham gia</button>
          <button type="button" role="tab" aria-selected={view === 'bracket'} className="snx-tab" onClick={() => setView('bracket')}>Nhánh đấu</button>
        </div>
        <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
      </div>
      {view === 'participants' && (
        participants.error ? <div className="snx-alert snx-alert--error">{participants.error}</div>
          : participants.loading && !participants.data.length ? <p className="snx-muted">Đang tải…</p>
          : participants.data.length === 0 ? <p className="snx-muted" style={{ margin: 0 }}>Chưa có ai đăng ký nội dung này.</p>
          : (
            <div className="snx-list">
              {participants.data.map((p) => (
                <div key={p.participantId} className="snx-list-item">
                  <span className="snx-avatar-sm">{p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : (p.teamName || p.fullName || '?').slice(0, 1)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14 }}>{p.teamName || p.fullName}</strong>
                    {p.teamName && <div className="snx-muted">{(p.teamMembers || []).map((m) => m.fullName).join(', ') || p.fullName}</div>}
                  </div>
                  {p.isCheckedIn && <span className="snx-badge snx-badge--green">Đã check-in</span>}
                </div>
              ))}
            </div>
          )
      )}
      {view === 'bracket' && (
        bracket.error ? <div className="snx-alert snx-alert--error">{bracket.error}</div>
          : bracket.loading && !bracket.data.length ? <p className="snx-muted">Đang tải nhánh đấu…</p>
          : bracket.data.length === 0 ? <p className="snx-muted" style={{ margin: 0 }}>Ban tổ chức chưa chốt nhánh đấu.</p>
          : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {bracket.data.map((round) => (
                <div key={round.name} style={{ minWidth: 220, flex: '0 0 auto' }}>
                  <div className="snx-muted" style={{ fontWeight: 600, marginBottom: 6 }}>{round.name}</div>
                  <div className="snx-stack" style={{ gap: 8 }}>
                    {round.matches.map((m) => (
                      <div key={m.id} style={{ border: '1px solid #e2e8e6', borderRadius: 10, padding: '8px 10px', background: '#fff' }}>
                        {[['p1', 'scoreP1'], ['p2', 'scoreP2']].map(([side, scoreKey]) => (
                          <div key={side} className="snx-row" style={{ flexWrap: 'nowrap', fontWeight: m.winner && m.winner === m[side] ? 700 : 400 }}>
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m[side] === 'TBD' ? 'Chờ xác định' : m[side]}</span>
                            <span>{(m.scores || []).map((s) => s[scoreKey]).join(' ')}</span>
                          </div>
                        ))}
                        <div className="snx-muted" style={{ fontSize: 12, marginTop: 4 }}>{isDraw(m) ? 'Hòa · ' : ''}{m.courtName ? `${m.courtName} · ${dateTime(m.startTime)}` : 'Chưa xếp sân'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </section>
  )
}

function TournamentDetailModal({ id, onClose, onRegister }) {
  const detail = useApi(() => getTournament(id), [id])
  const schedule = useApi(() => getCourtSchedule(id), [id], { initialData: null })
  const [matchId, setMatchId] = useState(null)
  const [insightId, setInsightId] = useState(null)
  const [complainMatch, setComplainMatch] = useState(null)
  const match = useApi(() => getMatch(matchId), [matchId], { enabled: Boolean(matchId) })
  const t = detail.data

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="tournament-detail-title">
        <div className="snx-modal-head">
          <div>
            <h2 id="tournament-detail-title" className="snx-card-title">{t?.name || 'Đang tải…'}</h2>
            <p className="snx-card-subtitle">{[t?.sport, t?.facility, t?.format, TIER_LABEL[t?.tier], t?.organizer && `BTC: ${t.organizer}`].filter(Boolean).join(' · ')}</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        {detail.error && <div className="snx-alert snx-alert--error">{detail.error}</div>}
        {t && (
          <div className="snx-stack">
            <div className="snx-row"><StatusBadge value={t.status} /><span className="snx-muted">{t.starts || t.ends ? `${dateOrTba(t.starts)} – ${dateOrTba(t.ends)}` : 'Lịch thi đấu chưa công bố'} · Hạn đăng ký {dateOrTba(t.deadline)}</span></div>

            <section>
              <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>Nội dung thi đấu</h3>
              <div className="snx-list">
                {(t.children.length ? t.children : [t]).map((child) => (
                  <div key={child.id} className="snx-list-item">
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14 }}>{child.name}</strong>
                      <div className="snx-muted">{money(child.entryFee)} · {child.registered ?? 0}{child.capacity ? `/${child.capacity}` : ''} đã đăng ký</div>
                    </div>
                    <StatusBadge value={child.status} />
                    <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setInsightId(insightId === child.id ? null : child.id)}>{insightId === child.id ? 'Ẩn' : 'Người tham gia & nhánh đấu'}</button>
                  </div>
                ))}
              </div>
            </section>

            {insightId && (() => {
              const category = (t.children.length ? t.children : [t]).find((c) => c.id === insightId)
              return category ? <CategoryInsight key={category.id} category={category} onClose={() => setInsightId(null)} /> : null
            })()}

            {(t.minRating != null || t.maxRating != null || t.minRatedMatches != null) && (
              <p className="snx-muted" style={{ margin: 0 }}>
                Điều kiện Elo: {[t.minRating != null && `từ ${t.minRating}`, t.maxRating != null && `đến ${t.maxRating}`, t.minRatedMatches != null && `ít nhất ${t.minRatedMatches} trận giải`].filter(Boolean).join(', ')}
              </p>
            )}
            {t.prize > 0 && <p style={{ margin: 0, fontSize: 14 }}>Tổng giải thưởng: <strong>{money(t.prize)}</strong> <span className="snx-muted">(Ban tổ chức trao ngoài hệ thống)</span></p>}

            {schedule.data?.matches?.length > 0 && (
              <section>
                <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>Lịch các trận</h3>
                <div className="snx-list">
                  {schedule.data.matches.map((m) => (
                    <button key={m.matchId} type="button" className="snx-list-item" style={{ border: 0, borderBottom: '1px solid #eef2f1', background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onClick={() => setMatchId(m.matchId)}>
                      <span className="material-symbols-outlined" style={{ color: '#15803d' }}>sports_score</span>
                      <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{m.roundName || 'Trận đấu'}</strong><div className="snx-muted">{m.courtName || 'Chưa xếp sân'} · {dateTime(m.startTime)}</div></div>
                      <StatusBadge value={m.status} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {matchId && match.data && (
              <section className="snx-card" style={{ padding: 16 }}>
                <div className="snx-row"><strong>{match.data.roundName}</strong><span className="snx-spacer" /><button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setMatchId(null)}>Đóng</button></div>
                <p style={{ margin: '8px 0', fontSize: 15 }}>
                  <strong>{match.data.participant1Name || 'Chờ xác định'}</strong> <span className="snx-muted">vs</span> <strong>{match.data.participant2Name || 'Chờ xác định'}</strong>
                </p>
                {match.data.scores?.length > 0 && <p className="snx-muted" style={{ margin: 0 }}>Tỉ số: {match.data.scores.map((s) => `${s.scoreP1}-${s.scoreP2}`).join(', ')}</p>}
                {isDraw(match.data)
                  ? <p style={{ margin: '6px 0 0', fontSize: 14 }}><strong>Hòa</strong></p>
                  : match.data.winnerName && <p style={{ margin: '6px 0 0', fontSize: 14 }}>Thắng: <strong>{match.data.winnerName}</strong>{match.data.resultType === 'WALKOVER' ? ' (xử thắng)' : match.data.resultType === 'RETIRED' ? ' (đối thủ bỏ cuộc)' : ''}</p>}
                <p className="snx-muted" style={{ margin: '6px 0 0' }}>{match.data.courtName || 'Chưa xếp sân'} · {dateTime(match.data.startTime)}</p>
                {(match.data.winnerName || isDraw(match.data)) && (
                  <div className="snx-row" style={{ marginTop: 8 }}>
                    <span className="snx-muted">Kết quả sai? Khiếu nại trong 15 phút sau khi có kết quả.</span>
                    <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => setComplainMatch(match.data)}>Khiếu nại kết quả</button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
        {complainMatch && (
          <ReportModal targetType="MATCH" targetObjectId={complainMatch.matchId || complainMatch.id || matchId}
            subject={`${complainMatch.participant1Name || '—'} vs ${complainMatch.participant2Name || '—'}`} onClose={() => setComplainMatch(null)} />
        )}
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Đóng</button>
          {onRegister && t && <button type="button" className="snx-btn snx-btn--primary" onClick={() => onRegister(t)}>Đăng ký tham gia</button>}
        </div>
      </div>
    </div>
  )
}

function RegisterModal({ target, teams, onClose, onDone }) {
  const [categoryId, setCategoryId] = useState(target.children?.[0]?.id || target.id)
  const [teamId, setTeamId] = useState('')
  const [busy, setBusy] = useState(false)
  const children = target.children || []
  // Đội chỉ đăng ký giải đúng môn của đội
  const sportTeams = target.sportId ? teams.filter((team) => !team.sportCategoryId || team.sportCategoryId === target.sportId) : teams

  const confirm = async () => {
    setBusy(true)
    try {
      // POST /api/v1/tournaments/{id}/join?teamId= : trừ lệ phí và giữ trong ví.
      // Cần khảo sát người chơi + Elo môn này (cả đội) + đủ điều kiện Elo của cấp giải.
      await joinTournament(categoryId, teamId || undefined, target.sportId)
      toast.success('Đăng ký giải thành công! Lệ phí được giữ trong ví đến khi giải diễn ra.')
      window.dispatchEvent(new Event('escrow_balance_updated'))
      onDone()
    } catch (error) {
      toast.error(error?.message || 'Không đăng ký được giải.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <div className="snx-modal-head">
          <div><h2 id="register-title" className="snx-card-title">Đăng ký: {target.name}</h2><p className="snx-card-subtitle">Lệ phí được trừ từ ví và giữ ký quỹ đến khi giải diễn ra.</p></div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          {children.length > 0 && (
            <label className="snx-field">Nội dung thi đấu
              <select className="snx-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {children.map((child) => <option key={child.id} value={child.id}>{child.name} — {money(child.entryFee)}{child.capacity ? ` (${child.registered ?? 0}/${child.capacity})` : ''}</option>)}
              </select>
            </label>
          )}
          <label className="snx-field">Đội (bắt buộc với nội dung đôi / đội)
            <select className="snx-select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Đăng ký cá nhân</option>
              {sportTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>
          {sportTeams.length === 0 && <p className="snx-muted" style={{ margin: 0 }}>Chưa có đội môn này? Tạo đội ở tab “Đội của tôi”.</p>}
          <p className="snx-muted" style={{ margin: 0 }}>Đánh đơn đăng ký cá nhân; đôi môn vợt cần đội đúng 2 người; bóng đá / bóng rổ chỉ đấu theo đội. Bạn (và cả đội) cần có Elo môn này.</p>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Hủy</button>
          <button type="button" className="snx-btn snx-btn--primary" disabled={busy} onClick={confirm}>{busy ? 'Đang đăng ký…' : 'Xác nhận đăng ký'}</button>
        </div>
      </div>
    </div>
  )
}

// Lời mời vào giải nội bộ: chấp nhận = đăng ký thật (giữ lệ phí trong ví, kiểm tra khảo sát / Elo); lỗi thì lời mời vẫn chờ
const INVITATION_STATUS = { PENDING: ['Chờ phản hồi', 'amber'], ACCEPTED: ['Đã nhận', 'green'], DECLINED: ['Đã từ chối', 'gray'], CANCELLED: ['BTC đã thu hồi', 'gray'] }
function InvitationsPanel({ onChanged }) {
  const invitations = useApi(() => getMyTournamentInvitations(), [], { initialData: [] })
  const [busyId, setBusyId] = useState(null)
  const respond = async (invitation, accept) => {
    if (accept && invitation.entryFee > 0 && !(await confirmDialog(`Nhận lời mời và đóng lệ phí ${money(invitation.entryFee)} (giữ trong ví tới khi giải kết thúc)?`))) return
    setBusyId(invitation.id)
    try {
      await respondTournamentInvitation(invitation.id, accept)
      toast.success(accept ? 'Đã nhận lời mời và đăng ký bảng đấu.' : 'Đã từ chối lời mời.')
      invitations.refresh()
      if (accept) onChanged?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusyId(null)
    }
  }
  if (invitations.loading) return <p className="snx-muted">Đang tải…</p>
  if (invitations.error) return <div className="snx-alert snx-alert--error">{invitations.error}</div>
  if (!invitations.data.length) return <div className="snx-empty"><span className="material-symbols-outlined">mail</span>Bạn chưa có lời mời giải đấu nào.</div>
  return (
    <div className="snx-card">
      <div className="snx-list">
        {invitations.data.map((inv) => {
          const [label, tone] = INVITATION_STATUS[inv.status] || [inv.status, 'gray']
          return (
            <div key={inv.id} className="snx-list-item" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{inv.parentTournamentName ? `${inv.parentTournamentName} · ${inv.tournamentName}` : inv.tournamentName}</strong>
                <div className="snx-muted">
                  {[`Mời bởi ${inv.invitedByName}`, inv.teamName && `Đội ${inv.teamName}`, `Lệ phí ${money(inv.entryFee)}`, inv.startDate && `Thi đấu ${date(inv.startDate)}`, inv.registrationDeadline && `Hạn ${dateTime(inv.registrationDeadline)}`].filter(Boolean).join(' · ')}
                </div>
                {inv.message && <div style={{ fontSize: 13, marginTop: 4 }}>“{inv.message}”</div>}
              </div>
              <span className={`snx-badge snx-badge--${tone}`}>{label}</span>
              {inv.status === 'PENDING' && (
                <div className="snx-row" style={{ gap: 6 }}>
                  <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" disabled={busyId === inv.id} onClick={() => respond(inv, true)}>Nhận lời mời</button>
                  <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={busyId === inv.id} onClick={() => respond(inv, false)}>Từ chối</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MyMatches({ onBrowse }) {
  const matches = useApi(() => getMyMatches(), [], { initialData: [] })
  if (matches.loading) return <p className="snx-muted">Đang tải…</p>
  if (matches.error) return <div className="snx-alert snx-alert--error">{matches.error}</div>
  if (!matches.data.length) return <div className="snx-empty"><span className="material-symbols-outlined">sports_score</span>Bạn chưa có trận đấu nào được xếp lịch.<div className="snx-row" style={{ justifyContent: 'center', marginTop: 12 }}><button type="button" className="snx-btn snx-btn--primary" onClick={onBrowse}>Tìm giải đang mở</button></div></div>
  return (
    <div className="snx-card">
      <div className="snx-list">
        {matches.data.map((m) => (
          <div key={m.matchId} className="snx-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 92 }}><strong style={{ fontSize: 14 }}>{dateTime(m.startTime)}</strong><div className="snx-muted">{m.courtName || 'Chưa xếp sân'}</div></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{m.mySideName || 'Bạn'} <span className="snx-muted">vs</span> {m.opponentName || 'Chờ xác định'}</strong>
              <div className="snx-muted">{[m.parentTournamentName, m.tournamentName, m.roundName].filter(Boolean).join(' · ')} · {m.facilityName}</div>
              {isDraw(m)
                ? <div style={{ fontSize: 13, marginTop: 2 }}><strong>Hòa</strong></div>
                : m.winnerName && <div style={{ fontSize: 13, marginTop: 2 }}>Thắng: <strong>{m.winnerName}</strong></div>}
            </div>
            <StatusBadge value={m.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TournamentList() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'open'
  const setTab = (key) => setParams(key === 'open' ? {} : { tab: key })
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  // ?tournamentId= (từ gợi ý trang chủ / trợ lý AI) mở sẵn chi tiết giải
  const [detailId, setDetailId] = useState(() => params.get('tournamentId'))
  const [registerTarget, setRegisterTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)

  // GET /api/v1/tournaments/search?registrationOpen=true
  const openList = useApi(() => searchTournaments({ keyword: search || undefined, registrationOpen: true, pageSize: 50 }), [search], { initialData: { items: [] } })
  // GET /api/v1/tournaments/my-registrations
  const mine = useApi(getMyRegistrations, [], { initialData: [] })
  const teams = useApi(getMyTeams, [], { initialData: [] })
  const registeredIds = new Set((mine.data || []).map((t) => t.parentId))

  const openRegister = async (tournament) => {
    try {
      setRegisterTarget(tournament.children ? tournament : await getTournament(tournament.id))
      setDetailId(null)
    } catch (error) {
      toast.error(error?.message || 'Không tải được thông tin giải.')
    }
  }

  const cancelRegister = async (tournament) => {
    if (!(await confirmDialog(`Hủy đăng ký giải "${tournament.name}"?`))) return
    setBusyId(tournament.id)
    try {
      await cancelTournamentRegistration(tournament.id)
      toast.success('Đã hủy đăng ký. Lệ phí sẽ được hoàn theo quy định của giải.')
      mine.refresh()
      openList.refresh()
      window.dispatchEvent(new Event('escrow_balance_updated'))
    } catch (error) {
      toast.error(error?.message || 'Không hủy được đăng ký.')
    } finally {
      setBusyId(null)
    }
  }

  const list = tab === 'open' ? openList.data?.items || [] : mine.data || []
  const current = tab === 'open' ? openList : mine
  const counts = { mine: mine.data?.length || 0 }

  return (
    <div className="snx-page">
      <PageHeader
        eyebrow="Giải đấu"
        eyebrowIcon="emoji_events"
        title="Giải đấu & Đội"
        subtitle="Tìm giải đang mở đăng ký, theo dõi lịch thi đấu và quản lý đội của bạn."
      />

      <div className="snx-row" style={{ marginBottom: 16 }}>
        <div className="snx-tabs" role="tablist" aria-label="Mục giải đấu">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`snx-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <span className="material-symbols-outlined">{t.icon}</span>{t.label}
              {counts[t.key] > 0 && <span className="snx-tab-count">{counts[t.key]}</span>}
            </button>
          ))}
        </div>
        <span className="snx-spacer" />
        {tab === 'open' && (
          <form className="snx-row" style={{ flex: '0 1 420px' }} onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()) }}>
            <label className="snx-search"><span className="material-symbols-outlined">search</span><input className="snx-input" placeholder="Tìm theo tên giải…" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
            <button type="submit" className="snx-btn snx-btn--secondary">Tìm</button>
          </form>
        )}
      </div>

      {tab === 'teams' && <TeamsPanel />}
      {tab === 'invitations' && <InvitationsPanel onChanged={() => mine.refresh?.()} />}
      {tab === 'organize' && <TournamentWorkspace mode="player" embedded />}
      {tab === 'matches' && <MyMatches onBrowse={() => setTab('open')} />}

      {(tab === 'open' || tab === 'mine') && (
        <>
          {current.loading && <p className="snx-muted">Đang tải…</p>}
          {current.error && <div className="snx-alert snx-alert--error">{current.error}</div>}
          {!current.loading && !current.error && list.length === 0 && (
            <div className="snx-empty"><span className="material-symbols-outlined">emoji_events</span>{tab === 'open' ? 'Hiện chưa có giải nào mở đăng ký.' : 'Bạn chưa đăng ký giải nào.'}{tab !== 'open' && <div className="snx-row" style={{ justifyContent: 'center', marginTop: 12 }}><button type="button" className="snx-btn snx-btn--primary" onClick={() => setTab('open')}>Xem giải đang mở</button></div>}</div>
          )}
          <div className="snx-grid snx-grid--2">
            {list.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onOpen={() => setDetailId(tab === 'mine' ? tournament.parentId : tournament.id)}
                actions={
                  tab === 'open' ? (
                    registeredIds.has(tournament.id)
                      ? <span className="snx-badge snx-badge--green">Đã đăng ký</span>
                      : <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => openRegister(tournament)}>Đăng ký tham gia</button>
                  ) : (
                    <>
                      <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" disabled={busyId === tournament.id} onClick={() => cancelRegister(tournament)}>Hủy đăng ký</button>
                      <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => navigate(`/qr-pass?type=tournament&tournamentId=${encodeURIComponent(tournament.id)}`)}>
                        <span className="material-symbols-outlined">qr_code_2</span>Vé check-in
                      </button>
                    </>
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {detailId && (
        <TournamentDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onRegister={tab === 'open' && !registeredIds.has(detailId) ? openRegister : null}
        />
      )}
      {registerTarget && (
        <RegisterModal
          target={registerTarget}
          teams={teams.data || []}
          onClose={() => setRegisterTarget(null)}
          onDone={() => { setRegisterTarget(null); mine.refresh(); openList.refresh() }}
        />
      )}
    </div>
  )
}

export default TournamentList
