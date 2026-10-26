import { get, path, post, toList } from './request.js'

// ---------- Khiếu nại của khách tại cơ sở của tôi: /api/v1/reports/owner ----------
// Query: facilityId, courtId, status, targetType, fromDate, toDate, searchKeyword, pageIndex, pageSize.
// OwnerReportListResponse: totalCount, pendingCount, ownerRespondedCount, resolvedRefundedCount, resolvedNoRefundCount, rejectedOrWithdrawnCount, items[].
export async function getOwnerReports(params) {
  const data = await get('/api/v1/reports/owner', params)
  const { items } = toList(data)
  return {
    items,
    total: Number(data?.totalCount) || items.length,
    counts: {
      pending: Number(data?.pendingCount) || 0,
      responded: Number(data?.ownerRespondedCount) || 0,
      refunded: Number(data?.resolvedRefundedCount) || 0,
      noRefund: Number(data?.resolvedNoRefundCount) || 0,
      closed: Number(data?.rejectedOrWithdrawnCount) || 0,
    },
  }
}
export const getOwnerReport = reportId => get(`/api/v1/reports/owner/${path(reportId)}`)
// OwnerRespondReportRequest: ownerResponse, ownerEvidenceUrls. Chuyển sang OWNER_RESPONDED để Admin xem xét.
export const respondReport = (reportId, { ownerResponse, ownerEvidenceUrls = [] }) =>
  post(`/api/v1/reports/owner/${path(reportId)}/respond`, { ownerResponse, ownerEvidenceUrls })
// OwnerAcceptRefundReportRequest: ownerResponse, ownerEvidenceUrls, refundPercentage, lockSlotForMaintenance. Hoàn tiền ngay cho khách.
export const acceptRefundReport = (reportId, { ownerResponse, ownerEvidenceUrls = [], refundPercentage, lockSlotForMaintenance = false }) =>
  post(`/api/v1/reports/owner/${path(reportId)}/accept-refund`, { ownerResponse, ownerEvidenceUrls, refundPercentage, lockSlotForMaintenance })
