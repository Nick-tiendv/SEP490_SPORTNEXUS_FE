import { isOtherReason } from './lfgReason.js'

// Chọn lý do hủy / rời kèo từ danh sách BE (GET /api/v1/lfgs/cancel-reasons).
// Chọn "Lý do khác" (hoặc BE không trả danh sách) thì nhập lý do tự do.

export default function LfgReasonPicker({ label, reasons, picked, onPick, custom, onCustom, required = false, placeholder = 'Nhập lý do chi tiết...' }) {
  const hasList = Array.isArray(reasons) && reasons.length > 0
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-700">
        {label}{required ? '' : ' (tùy chọn)'}:
      </label>
      {hasList && (
        <select
          value={picked}
          onChange={(e) => onPick(e.target.value)}
          className="p-2.5 rounded-xl border border-gray-300 text-xs bg-white text-gray-800 focus:outline-none focus:border-[#3B6817]"
        >
          <option value="">— Chọn lý do —</option>
          {reasons.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      )}
      {(!hasList || (picked && isOtherReason(picked))) && (
        <textarea
          rows={2}
          maxLength={500}
          placeholder={placeholder}
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
          className="p-2.5 rounded-xl border border-gray-300 text-xs w-full focus:outline-none focus:border-[#3B6817] resize-none"
        />
      )}
    </div>
  )
}
