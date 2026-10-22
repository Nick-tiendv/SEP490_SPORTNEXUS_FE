import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi.js'
import {
  searchTournaments,
  getMyRegistrations,
  getTournament,
  joinTournament,
  cancelTournamentRegistration,
  getMyTeams,
} from '../../api/player/tournamentApi.js'

const money = (value) => (value ? `${new Intl.NumberFormat('vi-VN').format(value)} đ` : 'Miễn phí')
const date = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')

const STATUS_LABELS = {
  OPEN: 'Đang mở đăng ký',
  REGISTRATION: 'Đang mở đăng ký',
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  INPROGRESS: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  FINISHED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}
const statusLabel = (status) => STATUS_LABELS[String(status).toUpperCase().replace(/[_\s]/g, '')] || status || '—'

function TournamentCard({ tournament, actions }) {
  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{tournament.name}</h3>
          <p className="text-sm text-slate-500">
            {[tournament.sport, tournament.facility].filter(Boolean).join(' • ') || '—'}
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {statusLabel(tournament.registrationStatus || tournament.status)}
        </span>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div><dt className="text-slate-500">Bắt đầu</dt><dd className="font-semibold">{date(tournament.starts)}</dd></div>
        <div><dt className="text-slate-500">Hạn đăng ký</dt><dd className="font-semibold">{date(tournament.deadline)}</dd></div>
        <div><dt className="text-slate-500">Lệ phí</dt><dd className="font-semibold">{tournament.entryFee == null ? 'Xem chi tiết' : money(tournament.entryFee)}</dd></div>
        <div>
          <dt className="text-slate-500">Đã đăng ký</dt>
          <dd className="font-semibold">{tournament.registered ?? '—'}{tournament.capacity ? ` / ${tournament.capacity}` : ''}</dd>
        </div>
      </dl>
      {tournament.prize > 0 && <p className="text-sm text-slate-600">Tổng giải thưởng: <strong>{money(tournament.prize)}</strong></p>}
      <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
    </article>
  )
}

function TournamentList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('open')
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [registerTarget, setRegisterTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)

  // GET /api/v1/tournaments/search?RegistrationOpen=true
  const openList = useApi(() => searchTournaments({ keyword: search || undefined, registrationOpen: true, pageSize: 50 }), [search], { initialData: { items: [] } })
  // GET /api/v1/tournaments/my-registrations
  const mine = useApi(getMyRegistrations, [], { initialData: [] })
  const teams = useApi(getMyTeams, [], { initialData: [] })

  // Đăng ký nằm ở bảng con, danh sách tìm kiếm là giải mẹ: so theo id giải mẹ
  const registeredIds = new Set((mine.data || []).map((t) => t.parentId))
  const list = tab === 'open' ? openList.data?.items || [] : mine.data || []
  const current = tab === 'open' ? openList : mine

  // Mở form đăng ký: tải chi tiết để biết các nội dung thi đấu (giải con) nếu có
  const openRegister = async (tournament) => {
    try {
      const detail = await getTournament(tournament.id)
      setRegisterTarget({ tournament: detail, categoryId: detail.children?.[0]?.id || detail.id, teamId: '' })
    } catch (error) {
      toast.error(error?.message || 'Không tải được thông tin giải.')
    }
  }

  const confirmRegister = async () => {
    const { categoryId, teamId } = registerTarget
    setBusyId(categoryId)
    try {
      await joinTournament(categoryId, teamId || undefined)
      toast.success('Đăng ký giải thành công! Lệ phí được giữ trong ví đến khi giải diễn ra.')
      setRegisterTarget(null)
      mine.refresh()
      openList.refresh()
      window.dispatchEvent(new Event('escrow_balance_updated'))
    } catch (error) {
      toast.error(error?.message || 'Không đăng ký được giải.')
    } finally {
      setBusyId(null)
    }
  }

  const cancelRegister = async (tournament) => {
    if (!window.confirm(`Hủy đăng ký giải "${tournament.name}"?`)) return
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

  const children = registerTarget?.tournament.children || []

  return (
    <div className="w-full min-h-screen text-[#1e293b] flex flex-col font-sans">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6 md:px-10 md:py-8 flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-900">Giải đấu</h1>
          <p className="text-sm text-slate-500">Tìm giải đang mở đăng ký và quản lý các giải bạn đã tham gia.</p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1">
            {[['open', 'Đang mở đăng ký'], ['mine', `Giải của tôi (${(mine.data || []).length})`]].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === value ? 'bg-[#15803D] text-white' : 'text-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'open' && (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setSearch(keyword.trim()) }}>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên giải…"
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold">Tìm</button>
            </form>
          )}
        </div>

        {current.loading && <p className="text-slate-500">Đang tải…</p>}
        {current.error && <p className="text-red-600">{current.error}</p>}
        {!current.loading && !current.error && list.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            {tab === 'open' ? 'Hiện chưa có giải nào mở đăng ký.' : 'Bạn chưa đăng ký giải nào.'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              actions={
                tab === 'open' ? (
                  registeredIds.has(tournament.id) ? (
                    <span className="text-sm font-semibold text-emerald-700">Bạn đã đăng ký giải này</span>
                  ) : (
                    <button type="button" onClick={() => openRegister(tournament)} className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-sm font-bold">
                      Đăng ký tham gia
                    </button>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/qr-pass?type=tournament&tournamentId=${encodeURIComponent(tournament.id)}`)}
                      className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-sm font-bold"
                    >
                      Vé check-in
                    </button>
                    <button
                      type="button"
                      disabled={busyId === tournament.id}
                      onClick={() => cancelRegister(tournament)}
                      className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-bold disabled:opacity-50"
                    >
                      Hủy đăng ký
                    </button>
                  </>
                )
              }
            />
          ))}
        </div>
      </div>

      {registerTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-lg font-black">Đăng ký: {registerTarget.tournament.name}</h2>
            {children.length > 0 && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Nội dung thi đấu</span>
                <select
                  value={registerTarget.categoryId}
                  onChange={(e) => setRegisterTarget({ ...registerTarget, categoryId: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-slate-200"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} — {money(child.entryFee)}{child.capacity ? ` (${child.registered ?? 0}/${child.capacity})` : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Đội (bắt buộc với nội dung đôi / đội)</span>
              <select
                value={registerTarget.teamId}
                onChange={(e) => setRegisterTarget({ ...registerTarget, teamId: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Đăng ký cá nhân</option>
                {(teams.data || []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <p className="text-xs text-slate-500">Lệ phí được trừ từ ví và giữ ký quỹ đến khi giải diễn ra.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRegisterTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold">Đóng</button>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={confirmRegister}
                className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-sm font-bold disabled:opacity-50"
              >
                {busyId ? 'Đang đăng ký…' : 'Xác nhận đăng ký'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentList
