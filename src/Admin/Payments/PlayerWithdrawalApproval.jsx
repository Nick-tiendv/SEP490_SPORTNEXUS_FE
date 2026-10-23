import { useState, useEffect, useMemo } from 'react'
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CircleX,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  Building,
  User,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react'
import {
  getWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  formatVND,
  MIN_MAINTENANCE_FEE,
  WITHDRAW_STATUS,
  POPULAR_BANKS,
} from '../../api/player/withdrawApi.js'

export default function PlayerWithdrawalApproval() {
  const [requests, setRequests] = useState(() => getWithdrawalRequests())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [bankFilter, setBankFilter] = useState('ALL')
  const [toastMessage, setToastMessage] = useState(null)

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [modalType, setModalType] = useState(null) // 'APPROVE' | 'REJECT' | 'DETAIL'
  const [adminNote, setAdminNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  // Load and listen to updates
  const reloadData = () => {
    setRequests(getWithdrawalRequests())
  }

  useEffect(() => {
    const handleUpdate = () => {
      setRequests(getWithdrawalRequests())
    }
    window.addEventListener('sportnexus_withdraw_requests_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('sportnexus_withdraw_requests_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Statistics
  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === WITHDRAW_STATUS.PENDING).length
    const approved = requests.filter((r) => r.status === WITHDRAW_STATUS.APPROVED).length
    const rejected = requests.filter((r) => r.status === WITHDRAW_STATUS.REJECTED).length
    const pendingAmount = requests
      .filter((r) => r.status === WITHDRAW_STATUS.PENDING)
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
    return { total, pending, approved, rejected, pendingAmount }
  }, [requests])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !searchTerm.trim() ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        r.player?.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        r.player?.email?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        r.bank?.accountNumber?.includes(searchTerm.trim()) ||
        r.bank?.accountHolder?.toLowerCase().includes(searchTerm.toLowerCase().trim())

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
      const matchBank = bankFilter === 'ALL' || r.bank?.bankName?.includes(bankFilter)

      return matchSearch && matchStatus && matchBank
    })
  }, [requests, searchTerm, statusFilter, bankFilter])

  // Handle Approve
  const handleConfirmApprove = () => {
    if (!selectedRequest) return
    try {
      approveWithdrawalRequest(selectedRequest.id, adminNote)
      triggerToast(`✅ Đã phê duyệt yêu cầu rút ${formatVND(selectedRequest.amount)}đ của ${selectedRequest.player.name}`)
      setModalType(null)
      setSelectedRequest(null)
      setAdminNote('')
      reloadData()
    } catch (err) {
      triggerToast(err.message || 'Lỗi khi phê duyệt yêu cầu', 'error')
    }
  }

  // Handle Reject
  const handleConfirmReject = () => {
    if (!selectedRequest) return
    if (!rejectReason.trim()) {
      triggerToast('Vui lòng nhập lý do từ chối yêu cầu rút tiền!', 'error')
      return
    }
    try {
      rejectWithdrawalRequest(selectedRequest.id, rejectReason)
      triggerToast(`⚠️ Đã từ chối yêu cầu rút tiền #${selectedRequest.id} và hoàn tiền lại ví người chơi`)
      setModalType(null)
      setSelectedRequest(null)
      setRejectReason('')
      reloadData()
    } catch (err) {
      triggerToast(err.message || 'Lỗi khi từ chối yêu cầu', 'error')
    }
  }

  return (
    <div className="player-withdraw-approval-container" style={{ marginTop: '16px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '28px',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#991B1B' : '#065F46',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={20} color="#FCA5A5" /> : <CheckCircle2 size={20} color="#86EFAC" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Banner Quy Định Phí Duy Trì 50.000đ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          border: '1.5px solid #A7F3D0',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#15803D',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Quy định rút tiền role Player
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                Phí duy trì tài khoản tối thiểu: 50.000đ
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#374151', lineHeight: 1.5 }}>
              Người chơi có role <strong>Player</strong> chỉ được yêu cầu rút tiền khi số dư tài khoản đạt tối thiểu{' '}
              <strong>50.000đ</strong>. Hệ thống bắt buộc giữ lại đúng <strong>50.000đ</strong> làm phí duy trì tài khoản trong ví.
              Admin kiểm tra đối soát thông tin tài khoản ngân hàng trước khi bấm Duyệt chi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reloadData}
          style={{
            background: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#1E293B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <RefreshCw size={15} color="#15803D" />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        {/* Card 1: Chờ duyệt */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
              Chờ Admin Duyệt
            </span>
            <Clock3 size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#B45309', marginTop: '8px' }}>
            {stats.pending} <span style={{ fontSize: '14px', fontWeight: 700 }}>yêu cầu</span>
          </div>
          <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px', fontWeight: 600 }}>
            Tổng số tiền chờ duyệt: <strong>{formatVND(stats.pendingAmount)}đ</strong>
          </div>
        </div>

        {/* Card 2: Đã duyệt */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
              Đã Duyệt &amp; Giải Ngân
            </span>
            <CheckCircle2 size={20} color="#16A34A" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#15803D', marginTop: '8px' }}>
            {stats.approved} <span style={{ fontSize: '14px', fontWeight: 700 }}>yêu cầu</span>
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: 600 }}>
            Đã chuyển khoản thành công tới Player
          </div>
        </div>

        {/* Card 3: Đã từ chối */}
        <div
          style={{
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
              Từ Chối Yêu Cầu
            </span>
            <CircleX size={20} color="#DC2626" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#DC2626', marginTop: '8px' }}>
            {stats.rejected} <span style={{ fontSize: '14px', fontWeight: 700 }}>yêu cầu</span>
          </div>
          <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '4px', fontWeight: 600 }}>
            Đã hoàn lại tiền vào ví người chơi
          </div>
        </div>

        {/* Card 4: Tổng yêu cầu */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Tổng Yêu Cầu Rút
            </span>
            <Banknote size={20} color="#64748B" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1E293B', marginTop: '8px' }}>
            {stats.total} <span style={{ fontSize: '14px', fontWeight: 700 }}>yêu cầu</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
            Phí duy trì giữ lại: {formatVND(MIN_MAINTENANCE_FEE)}đ/Player
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <Search
              size={18}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên Player, Email, STK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Lọc trạng thái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#1E293B',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="ALL">Tất cả ({requests.length})</option>
              <option value={WITHDRAW_STATUS.PENDING}>Chờ duyệt ({stats.pending})</option>
              <option value={WITHDRAW_STATUS.APPROVED}>Đã duyệt ({stats.approved})</option>
              <option value={WITHDRAW_STATUS.REJECTED}>Đã từ chối ({stats.rejected})</option>
            </select>
          </div>

          {/* Lọc ngân hàng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Ngân hàng:</span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#1E293B',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="ALL">Tất cả ngân hàng</option>
              {POPULAR_BANKS.map((b) => (
                <option key={b.id} value={b.shortName}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Mã Yêu Cầu</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Người Chơi (Player)</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Số Tiền Rút</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Số Dư Còn Lại</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Ngân Hàng Thụ Hưởng</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Thời Gian Gửi</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Trạng Thái</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>Hành Động Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#CBD5E1' }}>
                        inbox
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>Không tìm thấy yêu cầu rút tiền nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === WITHDRAW_STATUS.PENDING
                  const isApproved = req.status === WITHDRAW_STATUS.APPROVED
                  const isRejected = req.status === WITHDRAW_STATUS.REJECTED

                  return (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: isPending ? '#FFFDF7' : '#ffffff',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isPending ? '#FEFCE8' : '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isPending ? '#FFFDF7' : '#ffffff')}
                    >
                      {/* Mã đơn */}
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
                        #{req.id}
                      </td>

                      {/* Người chơi */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={req.player?.avatar}
                            alt=""
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#111827' }}>{req.player?.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {req.player?.phone} • {req.player?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số tiền rút */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#DC2626' }}>
                          -{formatVND(req.amount)} đ
                        </span>
                      </td>

                      {/* Số dư còn lại & phí duy trì */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#166534' }}>
                          {formatVND(req.remainingBalance)} đ
                        </div>
                        <div
                          style={{
                            fontSize: '10.5px',
                            color: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>Giữ lại {formatVND(req.maintenanceFeeHeld || MIN_MAINTENANCE_FEE)}đ phí</span>
                        </div>
                      </td>

                      {/* Ngân hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#1E293B' }}>{req.bank?.bankName}</div>
                        <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#475569', fontWeight: 700 }}>
                          STK: {req.bank?.accountNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          {req.bank?.accountHolder}
                        </div>
                      </td>

                      {/* Thời gian */}
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {req.createdAt}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '14px 16px' }}>
                        {isPending && (
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#B45309',
                              border: '1px solid #FCD34D',
                              padding: '4px 9px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Clock3 size={13} />
                            Chờ duyệt
                          </span>
                        )}
                        {isApproved && (
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              padding: '4px 9px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Đã duyệt
                          </span>
                        )}
                        {isRejected && (
                          <span
                            style={{
                              background: '#FEE2E2',
                              color: '#DC2626',
                              border: '1px solid #FCA5A5',
                              padding: '4px 9px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CircleX size={13} />
                            Bị từ chối
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                title="Phê duyệt yêu cầu rút tiền"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setAdminNote(`Đã chuyển khoản thành công ${formatVND(req.amount)}đ qua Napas 24/7`)
                                  setModalType('APPROVE')
                                }}
                                style={{
                                  background: '#15803D',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                                }}
                              >
                                <Check size={14} />
                                <span>Duyệt</span>
                              </button>

                              <button
                                type="button"
                                title="Từ chối yêu cầu rút tiền"
                                onClick={() => {
                                  setSelectedRequest(req)
                                  setRejectReason('')
                                  setModalType('REJECT')
                                }}
                                style={{
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FCA5A5',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <X size={14} />
                                <span>Từ chối</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req)
                                setModalType('DETAIL')
                              }}
                              style={{
                                background: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={14} />
                              <span>Chi tiết</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL 1: DUYỆT RÚT TIỀN ===================== */}
      {modalType === 'APPROVE' && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                background: '#F0FDF4',
                borderBottom: '1px solid #BBF7D0',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                    Xác Nhận Phê Duyệt Rút Tiền
                  </h3>
                  <div style={{ fontSize: '12px', color: '#15803D' }}>Mã yêu cầu: #{selectedRequest.id}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>Người yêu cầu:</span>
                  <span style={{ fontWeight: 800, color: '#111827', fontSize: '13px' }}>
                    {selectedRequest.player.name} ({selectedRequest.player.phone})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>Số tiền yêu cầu rút:</span>
                  <span style={{ fontWeight: 900, color: '#DC2626', fontSize: '16px' }}>
                    {formatVND(selectedRequest.amount)} đ
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748B', fontSize: '12.5px' }}>Số dư ví giữ lại tối thiểu:</span>
                  <span style={{ fontWeight: 800, color: '#166534', fontSize: '13px' }}>
                    {formatVND(selectedRequest.remainingBalance)} đ (≥ {formatVND(MIN_MAINTENANCE_FEE)}đ phí duy trì)
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '3px' }}>
                    <strong>Ngân hàng thụ hưởng:</strong> {selectedRequest.bank.bankName}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
                    STK: {selectedRequest.bank.accountNumber}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1E293B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Chủ thẻ: {selectedRequest.bank.accountHolder}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Ghi chú Admin / Mã đối soát chuyển khoản (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập mã FT chuyển khoản hoặc ghi chú đối soát..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#15803D',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                  }}
                >
                  Xác Nhận Duyệt &amp; Giải Ngân
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: TỪ CHỐI RÚT TIỀN ===================== */}
      {modalType === 'REJECT' && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                background: '#FEF2F2',
                borderBottom: '1px solid #FECACA',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircleX size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#991B1B' }}>
                    Từ Chối Yêu Cầu Rút Tiền
                  </h3>
                  <div style={{ fontSize: '12px', color: '#DC2626' }}>Mã yêu cầu: #{selectedRequest.id}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#374151', lineHeight: 1.5 }}>
                Khi từ chối, số tiền <strong>{formatVND(selectedRequest.amount)}đ</strong> sẽ được tự động{' '}
                <strong style={{ color: '#15803D' }}>hoàn trả lại vào ví</strong> của người chơi{' '}
                <strong>{selectedRequest.player.name}</strong>.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Lý do từ chối (Bắt buộc gửi tới Player):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Tên chủ tài khoản không khớp với hồ sơ cá nhân / Số tài khoản không đúng..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Gợi ý lý do nhanh */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                  Gợi ý lý do từ chối nhanh:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'Tên chủ tài khoản không khớp hồ sơ Player',
                    'Số tài khoản ngân hàng không tồn tại',
                    'Vi phạm quy định giữ lại 50.000đ phí duy trì ví',
                    'Tài khoản đang có tranh chấp khiếu nại trận đấu',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        fontSize: '11px',
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#DC2626',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  }}
                >
                  Xác Nhận Từ Chối &amp; Hoàn Tiền Ví
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: CHI TIẾT YÊU CẦU ===================== */}
      {modalType === 'DETAIL' && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                  Hồ Sơ Yêu Cầu Rút Tiền #{selectedRequest.id}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Khởi tạo lúc: {selectedRequest.createdAt}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalType(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Trạng thái:</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color:
                        selectedRequest.status === WITHDRAW_STATUS.APPROVED
                          ? '#15803D'
                          : selectedRequest.status === WITHDRAW_STATUS.REJECTED
                          ? '#DC2626'
                          : '#D97706',
                    }}
                  >
                    {selectedRequest.status === WITHDRAW_STATUS.APPROVED
                      ? '✓ Đã phê duyệt'
                      : selectedRequest.status === WITHDRAW_STATUS.REJECTED
                      ? '✗ Đã từ chối'
                      : '⏳ Đang chờ duyệt'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Người chơi:</span>
                  <span style={{ fontWeight: 800, color: '#111827' }}>{selectedRequest.player.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Số tiền rút:</span>
                  <span style={{ fontWeight: 900, color: '#DC2626', fontSize: '16px' }}>
                    {formatVND(selectedRequest.amount)} đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Số dư ví trước khi rút:</span>
                  <span style={{ fontWeight: 700, color: '#334155' }}>
                    {formatVND(selectedRequest.playerBalanceBefore)} đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Phí duy trì tài khoản giữ lại:</span>
                  <span style={{ fontWeight: 800, color: '#15803D' }}>
                    {formatVND(selectedRequest.maintenanceFeeHeld || MIN_MAINTENANCE_FEE)} đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Số dư còn lại:</span>
                  <span style={{ fontWeight: 800, color: '#166534' }}>
                    {formatVND(selectedRequest.remainingBalance)} đ
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '6px' }}>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
                    <strong>Ngân hàng nhận:</strong> {selectedRequest.bank.bankName}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
                    STK: {selectedRequest.bank.accountNumber}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#1E293B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Chủ tài khoản: {selectedRequest.bank.accountHolder}
                  </div>
                </div>

                {selectedRequest.adminNote && (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#166534',
                    }}
                  >
                    <strong>Ghi chú Admin:</strong> {selectedRequest.adminNote}
                  </div>
                )}

                {selectedRequest.rejectReason && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#991B1B',
                    }}
                  >
                    <strong>Lý do từ chối:</strong> {selectedRequest.rejectReason}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#15803D',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
