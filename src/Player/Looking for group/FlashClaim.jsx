import { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { claimLfgSlot } from '../../api/lfgApi.js'

function FlashClaim() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const matchFromState = location.state?.match || null
  const cardId = searchParams.get('cardId') || matchFromState?.id || 'demo-claim-card-1'
  const isRequireApproval = Boolean(matchFromState?.requireApproval)

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  const [selectedSide, setSelectedSide] = useState('any')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)

  const depositFee = matchFromState?.price || 55000

  // 2.6 Người tham gia Bước 2: POST /api/v1/lfgs/{cardId}/claim
  const handleConfirm = async () => {
    setErrorMessage(null)
    setSuccessInfo(null)

    if (walletBalance < depositFee) {
      setErrorMessage('Số dư ví Escrow hiện tại không đủ để giữ slot. Vui lòng nạp thêm tiền!')
      return
    }

    setIsSubmitting(true)
    try {
      await claimLfgSlot(cardId, {
        side: selectedSide,
        friendIds: [],
        friendPayMode: 'me',
      })

      // Image 2:
      // Kèo không cần duyệt: trừ tiền ngay, vào kèo luôn.
      // Kèo cần duyệt: chỉ gửi yêu cầu, tiền bị giữ khi chủ kèo duyệt.
      if (!isRequireApproval) {
        const newBal = Math.max(0, walletBalance - depositFee)
        setWalletBalance(newBal)
        localStorage.setItem('escrow_balance', newBal.toString())
        window.dispatchEvent(new Event('escrow_balance_updated'))
      }

      setSuccessInfo(
        isRequireApproval
          ? 'Đã gửi yêu cầu tham gia kèo thành công! Tiền cọc được giữ trong ví của bạn cho đến khi chủ kèo xét duyệt.'
          : 'Giữ slot thành công! Tiền cọc đã được chuyển vào quỹ Escrow đảm bảo. Bạn đã vào kèo!'
      )

      setTimeout(() => {
        navigate('/community?tab=joined')
      }, 1500)
    } catch (err) {
      console.warn('[FlashClaim] Lỗi nhận suất:', err)
      // Image 2: Nhận suất có thể bị từ chối 403 khi điểm Fair Play thấp hơn ngưỡng Admin đặt (mặc định 50/100) hoặc đang bị Admin cấm nhận suất. Hiện nguyên câu message (có điểm hiện tại và ngưỡng).
      const msg = err?.message || 'Không thể nhận suất tham gia kèo này.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Simulation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-[#EAF7EE] via-[#DCFCE7]/60 to-transparent rounded-full blur-[110px]"></div>
      </div>

      {/* Modal Centered */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 backdrop-blur-md">
        <div className="w-full max-w-lg bg-white border border-gray-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] flex items-center justify-center text-[#15803D]">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#111827] leading-tight">
                  Xác nhận chọn Slot nhanh (Claim Slot)
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isRequireApproval
                    ? 'Kèo cần duyệt: Gửi yêu cầu, tiền cọc bảo lưu trong ví bạn'
                    : 'Kèo không cần duyệt: Trừ tiền ngay, vào kèo luôn qua Escrow'}
                </p>
              </div>
            </div>
            <button
              className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => navigate('/community')}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Chi Tiết Thông Tin Trận Đấu */}
          <div className="bg-[#F8FAF9] border border-gray-200/80 rounded-2xl p-4 my-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF]">
                  {matchFromState?.sportBadge || 'PICKLEBALL ĐÔI'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {matchFromState?.levelTag || 'Trình Khá'}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                isRequireApproval ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100/70 text-emerald-800'
              }`}>
                {isRequireApproval ? 'Cần Chủ Duyệt' : 'Vào Kèo Luôn'}
              </span>
            </div>

            <h4 className="font-extrabold text-[#111827] text-sm sm:text-base leading-snug mb-3">
              {matchFromState?.title || '[Pickleball Đôi] Cần 1 tay vợt giao lưu nâng cao (Trình Khá)'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">location_on</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Địa điểm sân</span>
                  <span className="text-gray-800 font-medium leading-tight">
                    {matchFromState?.location || 'Sân SportNexus Arena, Huỳnh Tấn Phát, Quận 7'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">schedule</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thời gian thi đấu</span>
                  <span className="text-gray-800 font-semibold">{matchFromState?.time || 'Tối nay, 20:30 - 22:00'}</span>
                </div>
              </div>
            </div>

            {/* Chọn Phe / Bên (Side selection) */}
            <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-bold">Chọn vị trí thi đấu:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'any', label: 'Bất kỳ' },
                  { id: 'A', label: 'Bên A (Đội 1)' },
                  { id: 'B', label: 'Bên B (Đội 2)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSide(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSide === s.id
                        ? 'bg-[#2D5F3F] text-white shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Summary: Khung tiền */}
          <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-gray-200/80 flex flex-col gap-2.5 mb-4">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span className="font-medium">Số dư ví hiện tại:</span>
              <span className="font-bold text-[#111827]">
                {new Intl.NumberFormat('vi-VN').format(walletBalance)} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-[#111827] pt-1.5 border-t border-gray-200/60">
              <span>Phí cọc giữ slot:</span>
              <span className="text-[#15803D] font-extrabold text-base">
                {new Intl.NumberFormat('vi-VN').format(depositFee)} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600 pt-1.5 border-t border-gray-200/60">
              <span className="font-medium">Số dư còn lại:</span>
              <span className={`font-bold ${walletBalance - depositFee < 0 ? 'text-red-600' : 'text-[#111827]'}`}>
                {new Intl.NumberFormat('vi-VN').format(walletBalance - depositFee)} đ
              </span>
            </div>
          </div>

          {/* Fair Play & Rejection Notice */}
          <div className="flex items-start gap-2.5 bg-[#EAF7EE] border border-[#C6E7BE] rounded-xl p-3 mb-4 text-xs text-[#1C3524] leading-relaxed">
            <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">verified_user</span>
            <div>
              <span className="font-bold">Quy chuẩn Fair Play:</span> Điểm Fair Play của bạn phải đạt từ ngưỡng tối thiểu (mặc định 50/100) và không bị cấm nhận suất để tham gia.
            </div>
          </div>

          {/* Error Banner: 403 Fair Play or other */}
          {errorMessage && (
            <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">gpp_bad</span>
              <div className="leading-relaxed">
                <strong className="block font-bold">Từ chối nhận suất:</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">check_circle</span>
              <div className="leading-relaxed">{successInfo}</div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/community')}
              disabled={isSubmitting}
            >
              Huỷ bỏ
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              onClick={handleConfirm}
              disabled={isSubmitting || walletBalance < depositFee}
            >
              <span className="material-symbols-outlined text-[17px]">
                {isSubmitting ? 'sync' : 'check_circle'}
              </span>
              <span>
                {isSubmitting
                  ? 'Đang gửi...'
                  : isRequireApproval
                  ? 'Gửi yêu cầu vào kèo'
                  : 'Xác nhận giữ slot ngay'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashClaim
