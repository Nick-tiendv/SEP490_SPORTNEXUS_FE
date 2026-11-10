import { del, get, getList, post, put, upload } from '../owner/request.js'

// ---------- Đội / cặp đôi: /api/v1/teams ----------
const ENDPOINT = '/api/v1/teams'
const id = value => encodeURIComponent(value)
const LOCAL_TEAM_LOGOS_KEY = 'sportnexus_team_logos'

export const readLocalTeamLogo = teamId => {
  if (!teamId) return null
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_TEAM_LOGOS_KEY) || '{}')
    return map?.[String(teamId)] || null
  } catch {
    return null
  }
}

export const saveLocalTeamLogo = (teamId, logoUrl) => {
  if (!teamId || !logoUrl) return
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_TEAM_LOGOS_KEY) || '{}')
    map[String(teamId)] = logoUrl
    localStorage.setItem(LOCAL_TEAM_LOGOS_KEY, JSON.stringify(map))
  } catch {
    // bỏ qua lỗi bộ nhớ
  }
}

const compressImageToDataUrl = (file, maxSize = 256, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'))
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        resolve(dataUrl)
        return
      }
      const img = new Image()
      img.onerror = () => resolve(dataUrl)
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > maxSize || height > maxSize) {
            if (width >= height) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            } else {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, width)
          canvas.height = Math.max(1, height)
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })

// TeamResponse: id, name, description, logoUrl, sportCategoryId, sportName, skillLevel (hệ thống tính từ Elo thành viên),
// createdById (đội trưởng), createdByName, totalMembers, members[], isLocked
export const toTeam = (raw = {}) => ({
  id: String(raw.id ?? ''),
  name: raw.name || 'Đội',
  sportCategoryId: raw.sportCategoryId ? String(raw.sportCategoryId) : '',
  sportName: raw.sportName || '',
  skillLevel: raw.skillLevel || '',
  description: raw.description || '',
  logoUrl: raw.logoUrl || readLocalTeamLogo(raw.id) || null,
  captainId: String(raw.captainId ?? raw.createdById ?? ''),
  captainName: raw.captainName || raw.createdByName || '',
  createdAt: raw.createAt || raw.createdAt || null,
  isLocked: raw.isLocked === true,
  lockedReason: raw.lockedReason || '',
  totalMembers: Number(raw.totalMembers ?? raw.members?.length ?? 0),
  members: (raw.members || []).map(m => ({
    accountId: String(m.accountId),
    fullName: m.fullName || '—',
    phone: m.phone || '',
    avatarUrl: m.avatarUrl || null,
    joinedAt: m.joinedAt || null,
  })),
})

export const getMyTeams = async () => (await getList(`${ENDPOINT}/my-teams`)).items.map(toTeam)
export const getTeam = async teamId => toTeam(await get(`${ENDPOINT}/${id(teamId)}`))
export const searchTeams = async ({ keyword, page = 1, pageSize = 20 } = {}) => {
  const { items, total } = await getList(ENDPOINT, { keyword, page, pageSize })
  return { items: items.map(toTeam), total }
}
// CreateTeamRequest: name, description, logoUrl, sportCategoryId (bắt buộc), memberAccountIds[], memberPhones[] (người được thêm sẽ nhận lời mời).
// skillLevel đã bỏ: trình độ / Elo đội = trung bình Elo cá nhân thành viên. Người tạo chưa có Elo môn này → 403 (mở khảo sát toàn diện).
export const createTeam = async ({ name, description, sportCategoryId, memberPhones = [] }) =>
  toTeam(await post(ENDPOINT, { name, description: description || null, sportCategoryId, memberPhones }))
export const updateTeam = async (teamId, { name, description, logoUrl }) => {
  const safeRemoteLogo = logoUrl && !String(logoUrl).startsWith('data:') ? logoUrl : undefined
  if (logoUrl) saveLocalTeamLogo(teamId, logoUrl)
  return toTeam(await put(`${ENDPOINT}/${id(teamId)}`, { name, description, ...(safeRemoteLogo ? { logoUrl: safeRemoteLogo } : {}) }))
}
export const deleteTeam = teamId => del(`${ENDPOINT}/${id(teamId)}`)
export async function uploadTeamLogo(teamId, file) {
  if (!file) throw new Error('Vui lòng chọn tệp ảnh hợp lệ.')
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Tệp tải lên vượt quá dung lượng cho phép (tối đa 5MB).')
  }
  try {
    const res = await upload(`${ENDPOINT}/${id(teamId)}/logo`, 'file', file)
    const url =
      typeof res === 'string'
        ? res
        : res?.logoUrl || res?.url || res?.data?.logoUrl || res?.data?.url || null
    if (url) saveLocalTeamLogo(teamId, url)
    return toTeam({ ...(res && typeof res === 'object' ? res : {}), id: teamId, logoUrl: url || res?.logoUrl })
  } catch (err) {
    try {
      const fallbackUpload = await upload('/api/v1/uploads/images?purpose=general', 'file', file)
      const fallbackUrl =
        typeof fallbackUpload === 'string'
          ? fallbackUpload
          : fallbackUpload?.url || fallbackUpload?.logoUrl || fallbackUpload?.data?.url || null
      if (fallbackUrl) {
        saveLocalTeamLogo(teamId, fallbackUrl)
        const current = await get(`${ENDPOINT}/${id(teamId)}`).catch(() => null)
        const updated = await put(`${ENDPOINT}/${id(teamId)}`, {
          name: current?.name || undefined,
          description: current?.description ?? undefined,
          sportCategoryId: current?.sportCategoryId || undefined,
          logoUrl: fallbackUrl,
        }).catch(() => current)
        return toTeam({ ...(updated || current || {}), id: teamId, logoUrl: fallbackUrl })
      }
    } catch {
      // bỏ qua để chuyển sang nén ảnh lưu cục bộ khi dịch vụ lưu trữ đám mây của BE gặp lỗi 500
    }
    if (!err?.status || err?.status >= 500) {
      const dataUrl = await compressImageToDataUrl(file)
      saveLocalTeamLogo(teamId, dataUrl)
      const current = await get(`${ENDPOINT}/${id(teamId)}`).catch(() => null)
      const updated = await put(`${ENDPOINT}/${id(teamId)}`, {
        name: current?.name || undefined,
        description: current?.description ?? undefined,
        sportCategoryId: current?.sportCategoryId || undefined,
        logoUrl: dataUrl,
      }).catch(() => current)
      return toTeam({ ...(updated || current || {}), id: teamId, logoUrl: dataUrl })
    }
    throw err
  }
}
export const removeTeamMember = (teamId, accountId) => del(`${ENDPOINT}/${id(teamId)}/members/${id(accountId)}`)
export const transferCaptain = async (teamId, newCaptainId) => toTeam(await put(`${ENDPOINT}/${id(teamId)}/captain`, { newCaptainId }))
export const leaveTeam = teamId => post(`${ENDPOINT}/${id(teamId)}/leave`)
export const getTeamMembers = async teamId => (await getList(`${ENDPOINT}/${id(teamId)}/members`)).items
// TeamTournamentHistoryResponse (1 dòng / bảng đấu): tournamentName, parentTournamentName, facilityName, tournamentStatus, paymentStatus, entryFee
export const getTeamTournaments = async teamId => (await getList(`${ENDPOINT}/${id(teamId)}/tournaments`)).items

// ---------- Lời mời vào đội ----------
// TeamInvitationResponse: id, teamId, teamName, teamLogoUrl, inviteeName, invitedByName, message, status, createdAt, expiresAt
const toInvitation = (inv = {}) => ({
  ...inv,
  teamLogoUrl: inv.teamLogoUrl || readLocalTeamLogo(inv.teamId) || null,
})
export const inviteToTeam = (teamId, { phone, message }) => post(`${ENDPOINT}/${id(teamId)}/invitations`, { phone, message: message || null })
export const getTeamInvitations = async (teamId, status = 'ALL') =>
  (await getList(`${ENDPOINT}/${id(teamId)}/invitations`, { status })).items.map(toInvitation)
export const getMyInvitations = async (status = 'PENDING') =>
  (await getList(`${ENDPOINT}/invitations/me`, { status })).items.map(toInvitation)
export const acceptInvitation = invitationId => post(`${ENDPOINT}/invitations/${id(invitationId)}/accept`)
export const declineInvitation = invitationId => post(`${ENDPOINT}/invitations/${id(invitationId)}/decline`)
export const cancelInvitation = invitationId => del(`${ENDPOINT}/invitations/${id(invitationId)}`)
