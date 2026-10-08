import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function FlashClaim() {
  const navigate = useNavigate()

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('escrow_balance')
    return saved !== null ? Number(saved) : 2450000
  })

  const depositFee = 55000

  const handleConfirm = () => {
    if (walletBalance < depositFee) {
      alert('Số dư ví hiện tại không đủ để giữ slot. Vui lòng nạp thêm tiền!')
      return
    }

    const newBal = walletBalance - depositFee
    setWalletBalance(newBal)
    localStorage.setItem('escrow_balance', newBal.toString())
    window.dispatchEvent(new Event('escrow_balance_updated'))

    alert('Giữ slot thành công! Hệ thống đã ghi nhận bạn tham gia trận đấu.')
    navigate('/community')
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
                  Xác nhận chọn Slot nhanh
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">Bảo chứng giữ chỗ an toàn qua Hợp đồng Escrow</p>
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
                  PICKLEBALL ĐÔI
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  DUPR 3.5 - 4.0
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                Còn trống 1 chỗ
              </span>
            </div>

            <h4 className="font-extrabold text-[#111827] text-sm sm:text-base leading-snug mb-3">
              [Pickleball Đôi] Cần 1 tay vợt giao lưu nâng cao (DUPR 3.5 - 4.0)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">location_on</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Địa điểm sân</span>
                  <span className="text-gray-800 font-medium leading-tight">Sân SportNexus Arena, Huỳnh Tấn Phát, Quận 7</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#2D5F3F] shrink-0 mt-0.5">schedule</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Thời gian thi đấu</span>
                  <span className="text-gray-800 font-semibold">Tối nay, 20:30 - 22:00</span>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2 pt-1 border-t border-gray-200/40">
                <span className="material-symbols-outlined text-[17px] text-gray-400 shrink-0 mt-0.5">group</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Người tạo / Host</span>
                  <span className="text-gray-700">Hoàng Bách (Chỉ số Fair Play 99.8)</span>
                </div>
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

          {/* Protection Guarantee Note */}
          <div className="flex items-start gap-2.5 bg-[#EAF7EE] border border-[#C6E7BE] rounded-xl p-3 mb-5 text-xs text-[#1C3524] leading-relaxed">
            <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">shield</span>
            <div>
              <span className="font-bold">Bảo chứng Escrow:</span> Khoản cọc được lưu giữ an toàn. Bạn sẽ được hoàn trả hoặc quyết toán ngay khi check-in QR đúng giờ tại sân.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/community')}
            >
              Huỷ bỏ
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl bg-[#2D5F3F] hover:bg-[#234A31] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              onClick={handleConfirm}
            >
              <span className="material-symbols-outlined text-[17px]">check_circle</span>
              <span>Xác nhận giữ slot</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default FlashClaim
