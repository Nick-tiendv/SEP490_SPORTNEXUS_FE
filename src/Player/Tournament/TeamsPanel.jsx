import { useRef, useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
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
import { getSportCategories, skillLabel } from '../../api/player/profileApi.js'

const initials = (name) => (name || '?').trim().split(/\s+/).map((p) => p[0]).slice(-2).join('').toUpperCase()
const dateVN = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
const INVITE_STATUS = {
  PENDING: ['Chờ phản hồi', 'amber'],
  ACCEPTED: ['Đã nhận', 'green'],
  DECLINED: ['Đã từ chối', 'gray'],
  CANCELLED: ['Đã hủy', 'gray'],
  EXPIRED: ['Hết hạn', 'gray'],
}

const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const LOGO_MAX_BYTES = 5 * 1024 * 1024

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

// BE bỏ qua lặng lẽ các SĐT không có tài khoản hợp lệ (vẫn trả "Success"),
// nên đếm lời mời thực tế đã tạo để báo đúng cho người dùng.
async function reportInvitations(teamId, requested) {
  let sent
  try {
    sent = (await getTeamInvitations(teamId)).filter((inv) => String(inv.status || '').toUpperCase() === 'PENDING').length
  } catch {
    toast.warning('Không kiểm tra được lời mời. Vui lòng mở chi tiết đội để xem các lời mời đã gửi.')
    return
  }
  if (sent >= requested) toast.success(`Đã gửi ${sent} lời mời tới các thành viên.`)
  else if (sent === 0) toast.warning('Chưa gửi được lời mời nào: các số điện thoại chưa có tài khoản SportNexus hợp lệ.')
  else toast.warning(`Chỉ gửi được ${sent}/${requested} lời mời: ${requested - sent} số điện thoại chưa có tài khoản SportNexus hợp lệ.`)
}

function CreateTeamModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', phones: '', sportCategoryId: '' })
  const [saving, setSaving] = useState(false)
  const sports = useApi(getSportCategories, [], { initialData: [] })
  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên đội.'); return }
    if (!form.sportCategoryId) { toast.error('Vui lòng chọn môn của đội.'); return }
    setSaving(true)
    // Tách theo dấu phẩy / chấm phẩy / xuống dòng (không theo dấu cách: "0912 345 678" là 1 số); BE tự chuẩn hóa +84, dấu cách
    const memberPhones = [...new Set(form.phones.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean))]
    // POST /api/v1/teams: sportCategoryId bắt buộc; thành viên nhập số điện thoại sẽ nhận lời mời.
    // Chưa có Elo môn này → BE trả 403, app tự mở khảo sát toàn diện của môn.
    const ok = await run(async () => {
      const team = await createTeam({ name: form.name.trim(), description: form.description.trim(), sportCategoryId: form.sportCategoryId, memberPhones })
      toast.success('Đã tạo đội.')
      if (memberPhones.length > 0) await reportInvitations(team.id, memberPhones.length)
    })
    setSaving(false)
    if (ok) onCreated()
  }
  return (
    <div className="snx-modal-backdrop" role="presentation">
      <form className="snx-modal" role="dialog" aria-modal="true" aria-labelledby="create-team-title" onSubmit={submit}>
        <div className="snx-modal-head">
          <div>
            <h2 id="create-team-title" className="snx-card-title">Tạo đội mới</h2>
            <p className="snx-card-subtitle">Bạn là đội trưởng. Thành viên cần chấp nhận lời mời mới vào đội. Trình độ đội = trung bình Elo cá nhân các thành viên.</p>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="snx-stack">
          <label className="snx-field">Tên đội<input className="snx-input" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="snx-field">Môn của đội
            <select className="snx-select" value={form.sportCategoryId} onChange={(e) => setForm({ ...form, sportCategoryId: e.target.value })}>
              <option value="">— Chọn môn —</option>
              {sports.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span className="snx-muted">Đội chỉ đăng ký được giải của môn này. Bạn và thành viên cần có Elo môn này (khảo sát toàn diện).</span>
          </label>
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
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const refresh = () => { team.refresh(); sent.refresh(); onChanged() }
  const act = async (action, success, closeAfter) => {
    if (await run(action, success)) { if (closeAfter) { onChanged(); onClose() } else refresh() }
  }

  // Đổi logo: kiểm tra định dạng / dung lượng theo BE (JPG/PNG/WEBP ≤ 5MB) trước khi gửi.
  const changeLogo = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // reset để chọn lại cùng file (vd thử lại sau khi lỗi) vẫn kích hoạt onChange
    if (!file) return
    if (!LOGO_TYPES.includes(file.type)) { toast.error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'); return }
    if (file.size > LOGO_MAX_BYTES) { toast.error('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.'); return }
    setUploadingLogo(true)
    await act(() => uploadTeamLogo(teamId, file), 'Đã cập nhật logo.')
    setUploadingLogo(false)
  }

  return (
    <div className="snx-modal-backdrop" role="presentation">
      <div className="snx-modal snx-modal--wide" role="dialog" aria-modal="true" aria-labelledby="team-detail-title">
        <div className="snx-modal-head">
          <div className="snx-row" style={{ gap: 12 }}>
            <Avatar name={t?.name} url={t?.logoUrl} large />
            <div>
              <h2 id="team-detail-title" className="snx-card-title">{t?.name || 'Đang tải…'}</h2>
              <p className="snx-card-subtitle">{t?.sportName ? `${t.sportName} · ` : ''}{t?.skillLevel ? `Trình độ ${skillLabel(t.skillLevel)} · ` : ''}Đội trưởng: {t?.captainName || '—'} · {t?.totalMembers ?? 0} thành viên · Tạo ngày {dateVN(t?.createdAt)}</p>
            </div>
          </div>
          <button type="button" className="snx-btn snx-btn--ghost snx-btn--icon" aria-label="Đóng" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>

        {team.error && <div className="snx-alert snx-alert--error">{team.error}</div>}
        {t?.isLocked && <div className="snx-alert snx-alert--error">Đội đang bị khóa{t.lockedReason ? `: ${t.lockedReason}` : ''}.</div>}
        {t && <p className="snx-muted" style={{ margin: 0 }}>Khi đội đang có giải chưa kết thúc: không nhận thêm, không rời / xóa thành viên.</p>}

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
                <button type="button" className="snx-btn snx-btn--secondary snx-btn--sm" disabled={uploadingLogo} onClick={() => logoRef.current?.click()}><span className="material-symbols-outlined">image</span>{uploadingLogo ? 'Đang tải logo…' : 'Đổi logo'}</button>
                <input ref={logoRef} type="file" accept={LOGO_TYPES.join(',')} hidden onChange={changeLogo} />
                <span className="snx-spacer" />
                <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={async () => (await confirmDialog(`Giải tán đội "${t.name}"?`)) && act(() => deleteTeam(teamId), 'Đã giải tán đội.', true)}><span className="material-symbols-outlined">delete</span>Giải tán đội</button>
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
                        <button type="button" className="snx-btn snx-btn--ghost snx-btn--sm" onClick={async () => (await confirmDialog(`Chuyển quyền đội trưởng cho ${m.fullName}?`)) && act(() => transferCaptain(teamId, m.accountId), 'Đã chuyển quyền đội trưởng.')}>Chuyển đội trưởng</button>
                        <button type="button" className="snx-btn snx-btn--danger snx-btn--sm" onClick={async () => (await confirmDialog(`Xóa ${m.fullName} khỏi đội?`)) && act(() => removeTeamMember(teamId, m.accountId), 'Đã xóa thành viên.')}>Xóa</button>
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
                <button type="button" className="snx-btn snx-btn--danger" onClick={async () => (await confirmDialog(`Rời đội "${t.name}"?`)) && act(() => leaveTeam(teamId), 'Bạn đã rời đội.', true)}>Rời đội</button>
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
          <p className="snx-card-subtitle">Mỗi đội thuộc 1 môn. Đôi môn vợt = đội đúng 2 người; bóng đá / bóng rổ chỉ đấu theo đội; đánh đơn đăng ký cá nhân.</p>
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
                <span className="snx-muted">{[team.sportName, team.skillLevel && skillLabel(team.skillLevel), `${team.totalMembers} thành viên`].filter(Boolean).join(' · ')}</span>
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
                <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{team.name}</strong><div className="snx-muted">{team.sportName ? `${team.sportName} · ` : ''}Đội trưởng {team.captainName} · {team.totalMembers} thành viên</div></div>
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
