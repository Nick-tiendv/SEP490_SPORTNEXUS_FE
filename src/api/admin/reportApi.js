import apiClient from '../apiClient.js'
import { pick, toList, unwrap } from './dashboardApi.js'

const toIsoDate = value => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
const toTime = value => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''
}
const asArray = value => (Array.isArray(value) ? value : [])
const clean = params => Object.fromEntries(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))

// Chuẩn hóa báo cáo. Swagger chưa mô tả schema response nên thử nhiều tên field.
export function toReport(raw) {
  const uuid = String(pick(raw, 'id', 'reportId') ?? '')
  const ownerResponse = pick(raw, 'ownerResponse', 'ownerResponseNote', 'ownerReply', 'ownerNote', 'ownerResponse.note')
  const rawPendingDelta = pick(raw, 'pendingFairPlayDelta', 'fairPlayPendingDelta', 'pendingDelta')
  const pendingFairPlayDelta =
    rawPendingDelta !== undefined && rawPendingDelta !== null && rawPendingDelta !== '' && Number.isFinite(Number(rawPendingDelta))
      ? Number(rawPendingDelta)
      : null
  return {
    uuid,
    id: String(pick(raw, 'reportCode', 'code') ?? (uuid.length > 12 ? uuid.slice(0, 8).toUpperCase() : uuid)),
    reporter: pick(raw, 'reporterName', 'reporterFullName', 'reporter.fullName', 'reporter.name', 'createdByName') || '—',
    reporterUsername: pick(raw, 'reporterUsername', 'reporter.username') || '',
    targetType: String(pick(raw, 'targetType', 'type') ?? '').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
    entity: pick(raw, 'targetName', 'targetUserName', 'targetUser.fullName', 'targetObjectName', 'facilityName', 'facility.name') || '—',
    targetUserId: String(pick(raw, 'targetUserId', 'targetUser.id') ?? ''),
    facility: pick(raw, 'facilityName', 'facility.name') || '',
    bookingId: pick(raw, 'bookingId', 'booking.id') || '',
    bookingCode: pick(raw, 'bookingCode', 'booking.bookingCode', 'booking.code') || '',
    reason: pick(raw, 'reason', 'reasonName') || '—',
    description: pick(raw, 'description', 'content', 'detail') || '',
    evidence: asArray(pick(raw, 'evidenceImageUrls', 'evidenceUrls', 'images')).filter(url => typeof url === 'string'),
    requestedRefund: pick(raw, 'requestedRefundPercentage'),
    // Đơn vãng lai trả tại quầy: BE không cho REFUND qua ví (400).
    isWalkInBooking: Boolean(pick(raw, 'isWalkInBooking')),
    // Hạn chủ sân phản hồi (createdAt + 48h), chỉ có với BOOKING / FACILITY.
    ownerResponseDeadline: toTime(pick(raw, 'ownerResponseDeadline')),
    isOwnerResponseOverdue: Boolean(pick(raw, 'isOwnerResponseOverdue')),
    refundedAmount: Number(pick(raw, 'refundedAmount')) || 0,
    pendingFairPlayDelta,
    hasOwnerResponded: Boolean(pick(raw, 'hasOwnerResponded') ?? ownerResponse),
    ownerResponse: ownerResponse || '',
    status: String(pick(raw, 'status', 'reportStatus') ?? 'PENDING').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
    decision: pick(raw, 'decision', 'adminDecision') || '',
    notes: pick(raw, 'adminNote', 'adminNotes', 'resolutionNote') || '',
    // Khiếu nại kết quả trận (targetType MATCH): targetObjectId = matchId; biên bản trọng tài → quyết định BTC → chuyển Admin
    targetObjectId: String(pick(raw, 'targetObjectId') ?? ''),
    refereeNote: pick(raw, 'refereeNote') || '',
    refereeAt: toTime(pick(raw, 'refereeSubmittedAt')),
    organizerNote: pick(raw, 'organizerDecisionNote') || '',
    organizerAt: toTime(pick(raw, 'organizerDecidedAt')),
    escalated: Boolean(pick(raw, 'isEscalatedToAdmin')),
    escalatedReason: pick(raw, 'escalatedReason') || '',
    escalatedAt: toTime(pick(raw, 'escalatedAt')),
    escalationClosed: Boolean(pick(raw, 'escalationClosedAt')),
    date: toIsoDate(pick(raw, 'createdAt', 'createdDate', 'reportedAt')),
    resolvedAt: toTime(pick(raw, 'resolvedAt', 'updatedAt')),
    history: asArray(pick(raw, 'history', 'histories', 'timeline', 'logs')).map(entry => ({
      text: pick(entry, 'note', 'action', 'description', 'message', 'status') || '',
      time: toTime(pick(entry, 'createdAt', 'time', 'timestamp')),
    })),
  }
}

// Tham số theo swagger: FacilityId, OwnerId, ReporterId, TargetUserId, Status, TargetType, HasOwnerResponded, FromDate, ToDate, SearchKeyword, PageIndex, PageSize.
export async function listAdminReports(params) {
  const { items, total, totalPages } = toList(unwrap((await apiClient.get('/api/v1/reports/admin', { params: clean(params) })).data))
  return { items: items.map(toReport), total, totalPages }
}
// Ticket cảnh báo bạo lực mạng (review bombing) đang chờ: bộ lọc FairPlayHold=true (phiếu có điểm Fair Play đang treo).
export async function listFairPlayAlertReports() {
  return (await listAdminReports({ FairPlayHold: true, Status: 'PENDING', PageSize: 100 })).items
}
export async function countAdminReports(params) {
  return (await listAdminReports({ ...params, PageIndex: 1, PageSize: 1 })).total
}
export async function getAdminReport(reportId) {
  return toReport(unwrap((await apiClient.get(`/api/v1/reports/admin/${encodeURIComponent(reportId)}`)).data))
}
const sumDefined = (...values) => (values.some(Number.isFinite) ? values.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0) : undefined)
export async function getReportStatistics(params) {
  const data = unwrap((await apiClient.get('/api/v1/reports/admin/statistics', { params: clean(params) })).data) || {}
  const num = (...keys) => { const value = Number(pick(data, ...keys)); return Number.isFinite(value) ? value : undefined }
  return {
    total: num('totalReports', 'total', 'totalCount'),
    // openReports = PENDING + OWNER_RESPONDED: cùng số với badge menu
    pending: num('openReports', 'pendingReports', 'pending', 'pendingCount'),
    // BE tách đã giải quyết thành có hoàn tiền / không hoàn tiền.
    resolved: sumDefined(num('resolvedRefundedReports'), num('resolvedNoRefundReports')) ?? num('resolvedReports', 'resolved', 'resolvedCount'),
    rejected: num('rejectedReports', 'rejected', 'rejectedCount', 'dismissed'),
  }
}
// Body theo swagger AdminResolveReportRequest.
export async function resolveAdminReport(reportId, { decision, adminNote, refundPercentage, lockSlotForMaintenance, deductTargetUserFairPlayPoints, deleteCommunityPost }) {
  return unwrap((await apiClient.post(`/api/v1/reports/admin/${encodeURIComponent(reportId)}/resolve`, {
    decision,
    adminNote: adminNote || null,
    refundPercentage: refundPercentage ?? null,
    lockSlotForMaintenance: Boolean(lockSlotForMaintenance),
    deductTargetUserFairPlayPoints: deductTargetUserFairPlayPoints ?? null,
    deleteCommunityPost: Boolean(deleteCommunityPost),
  })).data)
}
// Khiếu nại kết quả trận: Admin sửa tỉ số và đóng trong 1 bước (phán quyết cuối, đóng yêu cầu phân xử).
// POST /api/v1/match-complaints/{id}/resolve { action: KEEP_SCORE | UPDATE_SCORE, score (như PUT /matches/{id}/score), note }
export async function resolveMatchComplaint(reportId, { action, score, note }) {
  return unwrap((await apiClient.post(`/api/v1/match-complaints/${encodeURIComponent(reportId)}/resolve`, {
    action,
    score: score || null,
    note: note || null,
  })).data)
}
