import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import { useCurrentUser } from '../../hooks/useCurrentUser.js'
import {
  acceptInvitation,
  cancelInvitation,
  createTeam,
  declineInvitation,
  deleteTeam,
  getMyInvitations,
  getMyTeams,
  getTeam,
  getTeamInvitations,
  getTeamTournaments,
  inviteToTeam,
  leaveTeam,
  removeTeamMember,
  searchTeams,
  transferCaptain,
  updateTeam,
  uploadTeamLogo,
} from '../../api/player/teamApi.js'

const initials = (name) => (name || '?').trim().split(/\s+/).map((p) => p[0]).slice(-2).join('').toUpperCase()
const dateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
const INVITE_STATUS = {
  PENDING: ['Chờ phản hồi', 'amber'],
  ACCEPTED: ['Đã nhận', 'green'],
  DECLINED: ['Đã từ chối', 'gray'],
  CANCELLED: ['Đã hủy', 'gray'],
  EXPIRED: ['Hết hạn', 'gray'],
}

function Avatar({ name, url, large }) {
  return <span className={`snx-avatar-sm ${large ? 'snx-avatar-sm--lg' : ''}`}>{url ? <img src={url} alt={name} /> : initials(name)}</span>
}

// Gọi một thao tác API, báo kết quả bằng toast; trả true nếu thành công
async function run(action, success) {
  try {
    await action()
    if (success) toast.success(success)
    return true
  } catch (error) {
    toast.error(error?.message || 'Thao tác không thành công.')
    return false
  }
}

function CreateTeamModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', phones: '' })
  const [saving, setSaving] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên đội.'); return }
    setSaving(true)
    const memberPhones = form.phones.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean)
    // POST /api/v1/teams: thành viên nhập số điện thoại sẽ nhận lời mời
    const ok = await run(() => createTeam({ name: form.name.trim(), description: form.description.trim(), memberPhones }), 'Đã tạo đội. Lời mời đã được gửi tới các thành viên.')
    setSaving(false)
    if (ok) onCreated()
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="create-team-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="create-team-title" className="snx-card-title">Tạo đội mới</h2>
            <p className="snx-card-subtitle">Bạn là đội trưởng. Thành viên cần chấp nhận lời mời mới vào đội.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          <label className="snx-field">Tên đội<input className="snx-input" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="snx-field">Giới thiệu<textarea className="snx-textarea" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="snx-field">Mời thành viên (số điện thoại, cách nhau bởi dấu phẩy)<input className="snx-input" placeholder="0901234567, 0912345678" value={form.phones} onChange={(e) => setForm({ ...form, phones: e.target.value })} /></label>
        </div>
        <div className="snx-modal-foot">
          <button type="button" className="snx-btn snx-btn--secondary" onClick={onClose}>Hủy</button>
          <button type="submit" className="snx-btn snx-btn--primary" disabled={saving}>{saving ? 'Đang tạo…' : 'Tạo đội'}</button>
        </div>
      </form>
    </div>
  )
}

function TeamDetailModal({ teamId, meId, onClose, onChanged }) {
  const team = useApi(() => getTeam(teamId), [teamId])
  const history = useApi(() => getTeamTournaments(teamId), [teamId], { initialData: [] })
  const t = team.data
  const isCaptain = t && t.captainId === String(meId)
  const sent = useApi(() => getTeamInvitations(teamId), [teamId], { initialData: [], enabled: Boolean(isCaptain) })
  const [edit, setEdit] = useState(null)
  const [invite, setInvite] = useState({ phone: '', message: '' })
  const logoRef = useRef(null)

  const refresh = () => { team.refresh(); sent.refresh(); onChanged() }
  const act = async (action, success, closeAfter) => {
    if (await run(action, success)) { if (closeAfter) { onChanged(); onClose() } else refresh() }
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="team-detail-title">
        <div className="snx-modal-head">
          <div className="snx-row" style={{ gap: 12 }}>
            <Avatar name={t?.name} url={t?.logoUrl} large />
            <div>
              <h2 id="team-detail-title" className="snx-card-title">{t?.name || 'Đang tải…'}</h2>
              <p className="snx-card-subtitle">Đội trưởng: {t?.captainName || '—'} · {t?.totalMembers ?? 0} thành viên · Tạo ngày {dateVN(t?.createdAt)}</p>
            </div>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>

        {team.error && <div className="snx-alert snx-alert--error">{team.error}</div>}
        {t?.isLocked && <div className="snx-alert snx-alert--error">Đội đang bị khóa{t.lockedReason ? `: ${t.lockedReason}` : ''}.</div>}

        {t && (
          <div className="snx-stack">
            {edit ? (
              <div className="snx-card snx-stack" style={{ padding: 16 }}>
                <label className="snx-field">Tên đội<input className="snx-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
                <label className="snx-field">Giới thiệu<textarea className="snx-textarea" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
                <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEdit(null)}>Hủy</button>
                  <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => act(() => updateTeam(teamId, edit), 'Đã cập nhật đội.').then(() => setEdit(null))}>Lưu</button>
                </div>
              </div>
            ) : (
              t.description && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{t.description}</p>
            )}

            {isCaptain && !edit && (
              <div className="snx-row">
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => setEdit({ name: t.name, description: t.description })}><span className="material-symbols-outlined">edit</span>Sửa thông tin</button>
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => logoRef.current?.click()}><span className="material-symbols-outlined">image</span>Đổi logo</button>
                <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && act(() => uploadTeamLogo(teamId, e.target.files[0]), 'Đã cập nhật logo.')} />
                <span className="snx-spacer" />
                <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => window.confirm(`Giải tán đội "${t.name}"?`) && act(() => deleteTeam(teamId), 'Đã giải tán đội.', true)}><span className="material-symbols-outlined">delete</span>Giải tán đội</button>
              </div>
            )}

            <section>
              <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>Thành viên</h3>
              <div className="snx-list">
                {t.members.map((m) => (
                  <div key={m.accountId} className="snx-list-item">
                    <Avatar name={m.fullName} url={m.avatarUrl} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: 14 }}>{m.fullName}</strong>
                      {m.accountId === t.captainId && <span className="snx-badge snx-badge--green" style={{ marginLeft: 8 }}>Đội trưởng</span>}
                      <div className="snx-muted">{m.phone} · Vào đội {dateVN(m.joinedAt)}</div>
                    </div>
                    {isCaptain && m.accountId !== t.captainId && (
                      <>
                        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => window.confirm(`Chuyển quyền đội trưởng cho ${m.fullName}?`) && act(() => transferCaptain(teamId, m.accountId), 'Đã chuyển quyền đội trưởng.')}>Chuyển đội trưởng</button>
                        <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={() => window.confirm(`Xóa ${m.fullName} khỏi đội?`) && act(() => removeTeamMember(teamId, m.accountId), 'Đã xóa thành viên.')}>Xóa</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {isCaptain && (
              <section className="snx-card" style={{ padding: 16 }}>
                <h3 className="snx-card-title" style={{ fontSize: 15 }}>Mời thành viên</h3>
                <div className="snx-row" style={{ marginTop: 10 }}>
                  <input className="snx-input" style={{ flex: '1 1 160px' }} placeholder="Số điện thoại" value={invite.phone} onChange={(e) => setInvite({ ...invite, phone: e.target.value })} />
                  <input className="snx-input" style={{ flex: '2 1 220px' }} placeholder="Lời nhắn (không bắt buộc)" value={invite.message} onChange={(e) => setInvite({ ...invite, message: e.target.value })} />
                  <button type="button" className="snx-btn snx-btn--primary" disabled={!invite.phone.trim()} onClick={() => act(() => inviteToTeam(teamId, { phone: invite.phone.trim(), message: invite.message.trim() }), 'Đã gửi lời mời.').then(() => setInvite({ phone: '', message: '' }))}>Gửi lời mời</button>
                </div>
                {sent.data?.length > 0 && (
                  <div className="snx-list" style={{ marginTop: 10 }}>
                    {sent.data.map((inv) => {
                      const [label, tone] = INVITE_STATUS[String(inv.status).toUpperCase()] || [inv.status, 'gray']
                      return (
                        <div key={inv.id} className="snx-list-item">
                          <Avatar name={inv.inviteeName} url={inv.inviteeAvatarUrl} />
                          <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{inv.inviteeName || '—'}</strong><div className="snx-muted">Gửi {dateVN(inv.createdAt)} · Hết hạn {dateVN(inv.expiresAt)}</div></div>
                          <span className={`snx-badge snx-badge--${tone}`}>{label}</span>
                          {String(inv.status).toUpperCase() === 'PENDING' && (
                            <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={() => act(() => cancelInvitation(inv.id), 'Đã hủy lời mời.')}>Hủy</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            <section>
              <h3 className="snx-card-title" style={{ fontSize: 15, marginBottom: 6 }}>Lịch sử giải đấu</h3>
              {history.data?.length ? (
                <div className="snx-list">
                  {history.data.map((h) => (
                    <div key={h.participantId || h.tournamentId} className="snx-list-item">
                      <span className="material-symbols-outlined" style={{ color: '#ca8a04' }}>emoji_events</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 14 }}>{h.parentTournamentName ? `${h.parentTournamentName} — ${h.tournamentName}` : h.tournamentName}</strong>
                        <div className="snx-muted">{h.facilityName}</div>
                      </div>
                      <span className="snx-badge snx-badge--gray">{h.tournamentStatus}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="snx-muted">Đội chưa tham gia giải nào.</p>}
            </section>

            {!isCaptain && (
              <div className="snx-row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="snx-btn snx-btn--danger" onClick={() => window.confirm(`Rời đội "${t.name}"?`) && act(() => leaveTeam(teamId), 'Bạn đã rời đội.', true)}>Rời đội</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Tab "Đội của tôi" trong trang Giải đấu: đội của tôi, lời mời nhận được, tìm đội
export default function TeamsPanel() {
  const me = useCurrentUser()
  const teams = useApi(getMyTeams, [], { initialData: [] })
  const invitations = useApi(() => getMyInvitations('PENDING'), [], { initialData: [] })
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const found = useApi(() => searchTeams({ keyword: search }), [search], { initialData: { items: [] }, enabled: Boolean(search) })
  const [creating, setCreating] = useState(false)
  const [openTeamId, setOpenTeamId] = useState(null)
  const refreshAll = () => { teams.refresh(); invitations.refresh() }

  const respond = async (inv, accept) => {
    if (await run(() => (accept ? acceptInvitation(inv.id) : declineInvitation(inv.id)), accept ? `Đã vào đội ${inv.teamName}.` : 'Đã từ chối lời mời.')) refreshAll()
  }

  return (
    <div className="snx-stack">
      {invitations.data?.length > 0 && (
        <section className="snx-card">
          <h3 className="snx-card-title">Lời mời vào đội ({invitations.data.length})</h3>
          <div className="snx-list" style={{ marginTop: 8 }}>
            {invitations.data.map((inv) => (
              <div key={inv.id} className="snx-list-item">
                <Avatar name={inv.teamName} url={inv.teamLogoUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{inv.teamName}</strong>
                  <div className="snx-muted">{inv.invitedByName} mời bạn{inv.message ? `: “${inv.message}”` : ''} · Hết hạn {dateVN(inv.expiresAt)}</div>
                </div>
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" onClick={() => respond(inv, false)}>Từ chối</button>
                <button type="button" className="snx-btn snx-btn--primary snx-btn--sm" onClick={() => respond(inv, true)}>Tham gia</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="snx-card snx-row" style={{ padding: '14px 20px' }}>
        <div>
          <h3 className="snx-card-title" style={{ fontSize: 17 }}>Đội của tôi</h3>
          <p className="snx-card-subtitle">Tạo đội để đăng ký các nội dung đôi / đồng đội. Thành viên nhận lời mời qua thông báo.</p>
        </div>
        <span className="snx-spacer" />
        <button type="button" className="snx-btn snx-btn--primary" onClick={() => setCreating(true)}><span className="material-symbols-outlined">group_add</span>Tạo đội</button>
      </div>
      {teams.loading && <p className="snx-muted">Đang tải…</p>}
      {teams.error && <div className="snx-alert snx-alert--error">{teams.error}</div>}
      {!teams.loading && !teams.error && teams.data.length === 0 && (
        <div className="snx-empty"><span className="material-symbols-outlined">groups</span>Bạn chưa có đội nào. Tạo đội để đăng ký các nội dung thi đấu đôi hoặc đồng đội.</div>
      )}
      <div className="snx-grid snx-grid--3">
        {teams.data.map((team) => (
          <button key={team.id} type="button" className="snx-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpenTeamId(team.id)}>
            <div className="snx-row" style={{ gap: 12 }}>
              <Avatar name={team.name} url={team.logoUrl} large />
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 15 }}>{team.name}</strong>
                <span className="snx-muted">{team.totalMembers} thành viên</span>
              </div>
            </div>
            <div className="snx-row" style={{ marginTop: 12 }}>
              {team.captainId === String(me.id) && <span className="snx-badge snx-badge--green">Bạn là đội trưởng</span>}
              {team.isLocked && <span className="snx-badge snx-badge--red">Đang bị khóa</span>}
            </div>
          </button>
        ))}
      </div>

      <section className="snx-card">
        <h3 className="snx-card-title" style={{ fontSize: 15 }}>Tìm đội</h3>
        <form className="snx-row" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()) }}>
          <label className="snx-search"><span className="material-symbols-outlined">search</span><input className="snx-input" placeholder="Tên đội hoặc tên đội trưởng" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
          <button type="submit" className="snx-btn snx-btn--secondary">Tìm</button>
        </form>
        {search && (
          <div className="snx-list" style={{ marginTop: 8 }}>
            {found.loading && <p className="snx-muted">Đang tìm…</p>}
            {!found.loading && found.data.items.length === 0 && <p className="snx-muted">Không tìm thấy đội nào.</p>}
            {found.data.items.map((team) => (
              <button key={team.id} type="button" className="snx-list-item" style={{ border: 0, borderBottom: '1px solid #eef2f1', background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onClick={() => setOpenTeamId(team.id)}>
                <Avatar name={team.name} url={team.logoUrl} />
                <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{team.name}</strong><div className="snx-muted">Đội trưởng {team.captainName} · {team.totalMembers} thành viên</div></div>
                <span className="material-symbols-outlined" style={{ color: '#9aa8a3' }}>chevron_right</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {creating && <CreateTeamModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); teams.refresh() }} />}
      {openTeamId && <TeamDetailModal teamId={openTeamId} meId={me.id} onClose={() => setOpenTeamId(null)} onChanged={refreshAll} />}
    </div>
  )
}
