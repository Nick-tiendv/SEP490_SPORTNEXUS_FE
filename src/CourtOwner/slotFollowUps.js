import { toast } from 'sonner'
import { confirmDialog } from '../components/common/confirm.js'
import { bulkUpdateSlots, generateFacilitySlots, regenerateCourtSlotsFrom } from '../api/owner'

// Sửa sân con / giờ mở cửa mà BE trả slotConfigChanged = true: ca đã sinh vẫn giữ cấu hình cũ.
// Hỏi chủ sân có áp dụng lại từ ngày mai không → POST /courts/{id}/slots/regenerate-from cho từng sân.
export async function offerRegenerateSlots(courts) {
  if (!courts?.length) return
  const ok = await confirmDialog(
    'Cấu hình mới chỉ áp dụng cho các ca sinh từ bây giờ. Bạn có muốn áp dụng lại cho các ca còn trống từ ngày mai không? (Ca đã có khách đặt, đang khóa hoặc giữ cho giải được giữ nguyên)',
    { title: 'Áp dụng cho lịch đã sinh', confirmLabel: 'Áp dụng lại từ ngày mai', cancelLabel: 'Không', danger: false },
  )
  if (!ok) return
  const results = await Promise.allSettled(courts.map(court => regenerateCourtSlotsFrom(court.id)))
  const failed = results.filter(result => result.status === 'rejected')
  if (!failed.length) toast.success(`Đã sinh lại ca trống từ ngày mai cho ${courts.length > 1 ? `${courts.length} sân` : courts[0].name}.`)
  else toast.error(`Không sinh lại được ca cho ${failed.length}/${courts.length} sân: ${failed[0].reason?.message || 'lỗi không xác định'}`)
}

// Xóa ca mà BE trả willRegenerate = true: ngày đã hết ca sẽ bị job tự sinh lại.
// Hiện message của BE kèm nút "Đóng cửa các ngày này": sinh lại ca theo cấu hình sân rồi khóa cả ngày
// (ca đã khóa không bị job xóa / sinh thêm, khách không đặt được).
// courtIds: đúng danh sách sân đã dùng khi xóa (null = mọi sân đang dùng).
export function warnSlotsWillRegenerate(facilityId, { data, message }, courtIds, onDone) {
  const dates = (data?.regenerateDates || []).map(value => String(value).slice(0, 10))
  const closeDays = async () => {
    const toastId = toast.loading('Đang đóng cửa các ngày đã hết ca…')
    try {
      for (const date of dates) {
        await generateFacilitySlots(facilityId, { dateFrom: date, dateTo: date, courtIds })
        await bulkUpdateSlots(facilityId, { courtIds, dateFrom: date, dateTo: date, action: 'LOCK' })
      }
      toast.success(`Đã khóa toàn bộ ca của ${dates.length} ngày, khách không đặt được.`, { id: toastId })
    } catch (error) {
      toast.error(error.message, { id: toastId })
    } finally {
      onDone?.()
    }
  }
  toast.warning(message || 'Ngày đã hết ca sẽ được hệ thống tự sinh lại ca. Muốn nghỉ cả ngày, hãy dùng Khóa ca thay vì xóa.', {
    duration: 20000,
    action: dates.length ? { label: 'Đóng cửa các ngày này', onClick: closeDays } : undefined,
  })
}
