import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { createCourt, deleteCourt, getCourt, getCourts, getFacility, getSports, regenerateCourtSlotsFrom, updateCourt, updateFacility } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import CourtFormModal from './CourtFormModal.jsx'
import TimeInput24 from '../../components/common/TimeInput24.jsx'

// Màu & icon theo môn (scoringRule của master-data/sports).
const SPORT_STYLES = {
  BADMINTON: { color: '#10B981', icon: 'sports_tennis' },
  FOOTBALL: { color: '#3B82F6', icon: 'sports_soccer' },
  PICKLEBALL: { color: '#F59E0B', icon: 'sports_tennis' },
  TENNIS: { color: '#EC4899', icon: 'sports_tennis' },
  VOLLEYBALL: { color: '#8B5CF6', icon: 'sports_volleyball' },
  BASKETBALL: { color: '#EF4444', icon: 'sports_basketball' },
}
const DEFAULT_SPORT_STYLE = { color: '#64748B', icon: 'sports' }

const toClock = value => (value && /^\d{1,2}:\d{2}/.test(value) ? value.slice(0, 5).padStart(5, '0') : '')
const toMinutes = clock => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}
const fromMinutes = total => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
// Thời lượng 1 ca chủ sân chọn cho từng sân (BE: bội số 15 phút, 15 - 480)
const SLOT_MINUTE_OPTIONS = [30, 45, 60, 90, 120, 150, 180, 240]

function toCourt(raw) {
  return {
    id: String(raw.id),
    categoryId: String(raw.categoryId ?? ''),
    categoryName: raw.categoryName || 'Khác',
    name: raw.name || '—',
    status: String(raw.status || 'ACTIVE').toUpperCase(),
    defaultPrice: Number(raw.defaultPrice) || 0,
    courtType: raw.courtType ?? null,
    isIndoor: raw.isIndoor ?? null,
    surfaceType: raw.surfaceType ?? null,
    maxPlayers: raw.maxPlayers ?? null,
    teamSize: raw.teamSize ?? null,
    // null = theo thời lượng mặc định của môn
    slotMinutes: raw.slotMinutes ?? null,
    effectiveSlotMinutes: Number(raw.effectiveSlotMinutes) || 120,
  }
}

function toFacility(raw) {
  return {
    id: String(raw.id),
    name: raw.name || '—',
    address: raw.address || '',
    phone: raw.phone || '',
    openTime: toClock(raw.openTime) || '06:00',
    closeTime: toClock(raw.closeTime) || '22:00',
    status: raw.status || '',
    approvalStatus: raw.approvalStatus || '',
    amenities: (raw.amenities || []).map(item => item.name).filter(Boolean),
  }
}

// Body PUT court cần đủ field, chỉ thay phần thay đổi.
const courtPayload = (court, changes) => ({
  categoryId: court.categoryId,
  name: court.name,
  status: court.status,
  defaultPrice: court.defaultPrice,
  courtType: court.courtType,
  isIndoor: court.isIndoor,
  surfaceType: court.surfaceType,
  maxPlayers: court.maxPlayers,
  teamSize: court.teamSize,
  // null = giữ nguyên thời lượng ca; 0 = về theo môn
  slotMinutes: court.slotMinutes,
  ...changes,
})

export default function CourtManage() {
  // Cơ sở đang chọn lấy từ CourtOwnerLayout (dropdown ở sidebar).
  const { facilityId, loading: layoutLoading, error: layoutError, refreshFacilities } = useOwnerContext()
  const [sports, setSports] = useState([])
  // Chi tiết của cơ sở nào thì gắn kèm facilityId đó, để khi đổi cơ sở không hiện nhầm dữ liệu cũ.
  const [detail, setDetail] = useState(null) // { facilityId, facility, courts }
  const [detailError, setDetailError] = useState(null) // { facilityId, message }
  const [busyId, setBusyId] = useState(null)

  const facility = detail?.facilityId === facilityId ? detail.facility : null
  const courts = useMemo(() => (detail?.facilityId === facilityId ? detail.courts : []), [detail, facilityId])
  const setCourts = (updater) => setDetail(prev => prev && { ...prev, courts: typeof updater === 'function' ? updater(prev.courts) : updater })
  const setFacility = (updater) => setDetail(prev => prev && { ...prev, facility: updater(prev.facility) })
  const loadError = layoutError || (detailError?.facilityId === facilityId ? detailError.message : '')
  const loading = layoutLoading || (!!facilityId && !facility && !loadError)

  const [activeTab, setActiveTab] = useState('zones') // 'zones' | 'pricing' | 'timegrid'
  const [selectedZoneId, setSelectedZoneId] = useState(null)
  // Hộp thoại thêm / sửa sân: null | { court (null = thêm mới), sportId, price }
  const [courtForm, setCourtForm] = useState(null)

  // Giá chỉnh tay theo khu: { [categoryId]: { basePrice } }
  const [zonePrices, setZonePrices] = useState({})
  const [gridConfig, setGridConfig] = useState({ openingTime: '06:00', closingTime: '22:00' })
  // Sân đang xem mô phỏng lưới giờ (theo thời lượng ca của sân đó)
  const [previewCourtId, setPreviewCourtId] = useState(null)

  const showToast = (msg, type = 'success') => (type === 'error' ? toast.error(msg) : toast.success(msg))

  // Master data môn thể thao
  useEffect(() => {
    getSports().then(setSports).catch(() => {})
  }, [])

  // Chi tiết cơ sở + danh sách sân khi đổi cơ sở
  useEffect(() => {
    if (!facilityId) return
    let cancelled = false
    Promise.all([getFacility(facilityId), getCourts(facilityId)])
      .then(([facilityData, courtList]) => {
        if (cancelled) return
        const mapped = toFacility(facilityData)
        setDetail({ facilityId, facility: mapped, courts: courtList.map(toCourt) })
        setSelectedZoneId(null)
        setZonePrices({})
        setGridConfig(prev => ({ ...prev, openingTime: mapped.openTime, closingTime: mapped.closeTime }))
      })
      .catch(error => !cancelled && setDetailError({ facilityId, message: error.message }))
    return () => { cancelled = true }
  }, [facilityId])

  // Cập nhật số sân ở sidebar sau khi thêm / đổi trạng thái sân.
  const syncLayout = () => refreshFacilities().catch(() => {})

  // Gom sân theo môn thể thao thành các "Khu"
  const zones = useMemo(() => {
    const groups = new Map()
    for (const court of courts) {
      if (!groups.has(court.categoryId)) groups.set(court.categoryId, [])
      groups.get(court.categoryId).push(court)
    }
    return [...groups.entries()].map(([categoryId, zoneCourts]) => {
      const sport = sports.find(item => String(item.id) === categoryId)
      const style = SPORT_STYLES[sport?.scoringRule] || DEFAULT_SPORT_STYLE
      const label = sport?.name || zoneCourts[0].categoryName
      const basePrice = zonePrices[categoryId]?.basePrice ?? Math.min(...zoneCourts.map(court => court.defaultPrice))
      return {
        id: categoryId,
        name: `Khu ${label}`,
        sportLabel: label,
        color: style.color,
        icon: style.icon,
        description: sport?.rulesDescription || '',
        basePrice,
        courts: zoneCourts,
      }
    })
  }, [courts, sports, zonePrices])

  const selectedZone = zones.find(zone => zone.id === selectedZoneId) || zones[0] || null

  const reloadCourts = async () => setCourts((await getCourts(facilityId)).map(toCourt))

  // Sau khi đổi thời lượng ca / giá: hỏi có áp dụng cho các ca trống từ ngày mai không.
  // Có thì gọi POST /courts/{id}/slots/regenerate-from cho từng sân (BE giữ nguyên ca đã có khách đặt).
  const offerRegenerateSlots = async (changedCourts) => {
    if (!changedCourts.length) return
    const ok = await confirmDialog(
      'Bạn có muốn áp dụng cấu hình mới này cho các ca trống từ ngày mai không? (Các đơn khách đã đặt sẽ được giữ nguyên)',
      { title: 'Áp dụng cho lịch đã sinh', confirmLabel: 'Có, áp dụng', cancelLabel: 'Không', danger: false },
    )
    if (!ok) return
    const results = await Promise.allSettled(changedCourts.map(court => regenerateCourtSlotsFrom(court.id)))
    const failed = results.filter(result => result.status === 'rejected')
    if (!failed.length) showToast(`Đã sinh lại ca trống từ ngày mai cho ${changedCourts.length > 1 ? `${changedCourts.length} sân` : changedCourts[0].name}.`)
    else showToast(`Không sinh lại được ca cho ${failed.length}/${changedCourts.length} sân: ${failed[0].reason?.message || 'lỗi không xác định'}`, 'error')
  }

  // Bật / tạm ngưng sân: PUT court với status ACTIVE | INACTIVE
  const handleToggleCourtStatus = async (court) => {
    const nextStatus = court.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setBusyId(court.id)
    try {
      await updateCourt(facilityId, court.id, courtPayload(court, { status: nextStatus }))
      setCourts(prev => prev.map(item => (item.id === court.id ? { ...item, status: nextStatus } : item)))
      syncLayout()
      showToast(`Đã ${nextStatus === 'ACTIVE' ? 'mở lại' : 'tạm ngưng'} ${court.name}!`)
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  // Đổi thời lượng ca của 1 sân: PUT court { slotMinutes } ("" = về theo môn → gửi 0)
  const handleChangeSlotMinutes = async (court, value) => {
    setBusyId(court.id)
    setPreviewCourtId(court.id)
    try {
      await updateCourt(facilityId, court.id, courtPayload(court, { slotMinutes: value === '' ? 0 : Number(value) }))
      await reloadCourts()
      showToast(`Đã đổi thời lượng ca ${court.name}: ${value === '' ? 'theo môn' : `${value} phút`}.`)
    } catch (error) {
      showToast(error.message, 'error')
      return
    } finally {
      setBusyId(null)
    }
    await offerRegenerateSlots([court])
  }

  // Xóa sân: DELETE /facilities/{facilityId}/courts/{courtId} (BE xóa luôn các ca tương lai chưa đặt)
  const handleDeleteCourt = async (court) => {
    if (!(await confirmDialog(`Xóa ${court.name}? Các ca tương lai chưa có người đặt của sân này cũng bị xóa.`))) return
    setBusyId(court.id)
    try {
      const result = await deleteCourt(facilityId, court.id)
      await reloadCourts()
      syncLayout()
      showToast(`Đã xóa ${court.name}${result?.removedFutureSlots ? ` và ${result.removedFutureSlots} ca tương lai` : ''}.`)
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  // Mở hộp thoại thêm sân: mặc định môn của khu đang chọn (hoặc môn chưa có khu)
  const openAddCourtModal = (sportId) => {
    const sportZone = zones.find(zone => zone.id === sportId)
    setCourtForm({ court: null, sportId: sportId || sports[0]?.id || '', price: sportZone ? sportZone.basePrice : '' })
  }
  const openEditCourtModal = (court) => {
    setCourtForm({ court, sportId: court.categoryId, price: court.defaultPrice, detailLoading: true })
    getCourt(facilityId, court.id)
      .then((detail) => {
        if (!detail) return
        setCourtForm((prev) => {
          if (!prev?.court || String(prev.court.id) !== String(court.id)) return prev
          return { ...prev, court: { ...prev.court, ...detail }, detailLoading: false }
        })
      })
      .catch(() => {
        setCourtForm((prev) => (prev ? { ...prev, detailLoading: false } : prev))
      })
  }

  // Thêm: POST /facilities/{facilityId}/courts · Sửa: PUT /facilities/{facilityId}/courts/{courtId}
  const handleSaveCourt = async (payload) => {
    if (busyId) return
    const editing = courtForm?.court
    setBusyId('court-form')
    try {
      if (editing) await updateCourt(facilityId, editing.id, { ...courtPayload(editing), ...payload, status: editing.status })
      else await createCourt(facilityId, payload)
      await reloadCourts()
      syncLayout()
      setSelectedZoneId(payload.categoryId)
      showToast(editing ? `Đã cập nhật ${payload.name}.` : `Đã thêm sân "${payload.name}".`)
      setCourtForm(null)
    } catch (error) {
      showToast(error.message, 'error')
      return
    } finally {
      setBusyId(null)
    }
    // Sửa sân mà đổi thời lượng ca hoặc giá chuẩn thì hỏi áp dụng cho ca đã sinh
    const pricingChanged = editing && (
      (payload.slotMinutes || null) !== (editing.slotMinutes || null) ||
      Number(payload.defaultPrice) !== Number(editing.defaultPrice)
    )
    if (pricingChanged) await offerRegenerateSlots([editing])
  }

  // Sửa giá chuẩn của Khu trên giao diện (lưu về defaultPrice khi rời ô nhập)
  const handleUpdateZonePrice = (zoneId, field, value) => {
    const zone = zones.find(item => item.id === zoneId)
    setZonePrices(prev => ({
      ...prev,
      [zoneId]: { basePrice: zone.basePrice, ...prev[zoneId], [field]: Number(value) || 0 },
    }))
  }

  // Lưu giá chuẩn của Khu vào defaultPrice của từng sân trong khu
  const handleSaveZoneBasePrice = async (zone) => {
    const changed = zone.courts.filter(court => court.defaultPrice !== zone.basePrice)
    if (!changed.length) return
    setBusyId(zone.id)
    try {
      await Promise.all(changed.map(court => updateCourt(facilityId, court.id, courtPayload(court, { defaultPrice: zone.basePrice }))))
      setCourts(prev => prev.map(court => (court.categoryId === zone.id ? { ...court, defaultPrice: zone.basePrice } : court)))
      showToast(`Đã cập nhật giá chuẩn ${zone.name}: ${formatVND(zone.basePrice)}/h`)
    } catch (error) {
      showToast(error.message, 'error')
      await reloadCourts().catch(() => {})
      return
    } finally {
      setBusyId(null)
    }
    await offerRegenerateSlots(changed)
  }

  // Lưu giờ mở / đóng cửa: PUT /facilities/{id} (field null thì BE giữ nguyên)
  const handleSaveTimeGrid = async () => {
    if (toMinutes(gridConfig.closingTime) <= toMinutes(gridConfig.openingTime)) {
      showToast('Giờ đóng cửa phải sau giờ mở cửa.', 'error')
      return
    }
    setBusyId('timegrid')
    try {
      await updateFacility(facilityId, {
        name: null, address: null, latitude: null, longitude: null, description: null, phone: null,
        openTime: `${gridConfig.openingTime}:00`, closeTime: `${gridConfig.closingTime}:00`,
        status: null, amenityIds: null, imageUrls: null,
      })
      setFacility(prev => ({ ...prev, openTime: gridConfig.openingTime, closeTime: gridConfig.closingTime }))
      showToast('Đã lưu giờ mở cửa / đóng cửa của cơ sở!')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' Điểm'

  // Các ca trong ngày theo giờ mở/đóng cửa và thời lượng ca của sân đang xem
  const previewCourt = courts.find((c) => c.id === previewCourtId) || courts[0] || null
  const previewMinutes = previewCourt?.effectiveSlotMinutes || 120
  const gridSlots = useMemo(() => {
    const slots = []
    const end = toMinutes(gridConfig.closingTime)
    for (let start = toMinutes(gridConfig.openingTime); start + previewMinutes <= end && slots.length < 96; start += previewMinutes) {
      slots.push(start)
    }
    return slots
  }, [gridConfig, previewMinutes])

  // Tổng số sân trong cụm
  const totalCourts = courts.length
  const activeCourts = courts.filter((c) => c.status === 'ACTIVE').length

  if (loading || loadError || !facility) {
    return (
      <div className="snx-page">
        <NoFacilityState loading={loading} error={loadError} what="thêm sân và đặt giá" />
      </div>
    )
  }

  return (
    <div className="snx-page">

      <PageHeader
        eyebrow="Cơ sở & sân"
        eyebrowIcon="sports_tennis"
        meta={facility.approvalStatus && facility.approvalStatus !== 'APPROVED'
          ? <span className={`snx-badge ${facility.approvalStatus === 'REJECTED' ? 'snx-badge--red' : 'snx-badge--amber'}`}>{facility.approvalStatus === 'REJECTED' ? 'Cơ sở bị từ chối' : 'Cơ sở chờ Admin duyệt'}</span>
          : undefined}
        title="Sân & giá"
        subtitle={`${facility.name} • ${zones.length} khu vực • ${activeCourts}/${totalCourts} sân đang phục vụ`}
        actions={<button type="button" className="snx-btn snx-btn--primary" onClick={() => openAddCourtModal(selectedZone?.id || '')}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Thêm sân</button>}
      />

      <div className="snx-tabs" role="tablist" aria-label="Mục quản lý sân" style={{ marginBottom: 20 }}>
        {[
          ['zones', 'view_quilt', 'Sân theo khu vực'],
          ['pricing', 'trending_up', 'Bảng giá'],
          ['timegrid', 'schedule', 'Giờ mở cửa'],
        ].map(([key, icon, label]) => (
          <button key={key} type="button" role="tab" aria-selected={activeTab === key} className="snx-tab" onClick={() => setActiveTab(key)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* TAB 1: QUẢN LÝ CỤM SÂN & KHU VỰC */}
      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)', gap: '24px' }}>
          {/* Zone Selector Sidebar */}
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '18px',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                  Danh sách khu vực
                </h3>
                <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
                  {zones.length} khu
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {zones.length === 0 && (
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, textAlign: 'center', padding: '12px 0' }}>
                    Cơ sở chưa có sân nào.
                  </div>
                )}
                {zones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${zone.color}` : '1px solid #CBD5E1',
                        background: isSelected ? `${zone.color}0D` : '#FFFFFF',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: `${zone.color}20`,
                            color: zone.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                            {zone.icon}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                            {zone.name.split('—')[0].trim()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '2px' }}>
                            {zone.sportLabel} • {zone.courts.length} sân
                          </div>
                        </div>
                      </div>

                      <span className="material-symbols-outlined" style={{ color: isSelected ? zone.color : '#94A3B8', fontSize: '20px' }}>
                        chevron_right
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Add Zone prompt */}
              <button
                onClick={() => openAddCourtModal(String(sports.find((sport) => !zones.some((zone) => zone.id === String(sport.id)))?.id || ''))}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px dashed #CBD5E1',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  add_circle
                </span>
                Thêm khu thể thao mới
              </button>
            </div>
          </div>

          {/* Zone Detail & Courts View */}
          {selectedZone && (
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
              }}
            >
              {/* Zone Top Info Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #E2E8F0',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${selectedZone.color}20`,
                        color: selectedZone.color,
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {selectedZone.sportLabel}
                    </span>
                    <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>
                      Tổng: {selectedZone.courts.length} sân đấu
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedZone.name}
                  </h2>
                  <p style={{ margin: '6px 0 0 0', color: '#1E293B', fontSize: '13.5px', fontWeight: 600, maxWidth: '650px' }}>
                    {selectedZone.description}
                  </p>
                </div>

                <button
                  onClick={() => openAddCourtModal(selectedZone.id)}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    add
                  </span>
                  Thêm sân con
                </button>
              </div>

              {/* Amenities tags */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                  Tiện ích của cơ sở:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {facility.amenities.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Chưa cập nhật tiện ích.</span>
                  )}
                  {facility.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#F1F5F9',
                        color: '#0F172A',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>
                        verified
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Overview for Zone */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  border: '1px solid #CBD5E1',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>
                    Mức giá áp dụng cho khu này
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>Giá mặc định: </span>
                      <strong style={{ fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>
                        {formatVND(selectedZone.basePrice)}/h
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('pricing')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    edit
                  </span>
                  Chỉnh sửa giá
                </button>
              </div>

              {/* Courts Grid */}
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                Danh sách các sân con trong {selectedZone.name.split('—')[0].trim()}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {selectedZone.courts.map((court) => {
                  const isActive = court.status === 'ACTIVE'
                  return (
                    <div
                      key={court.id}
                      style={{
                        background: '#FFFFFF',
                        border: isActive ? '1.5px solid #CBD5E1' : '1.5px solid #FED7AA',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        transition: 'transform 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isActive ? '#DCFCE7' : '#FEF3C7',
                            color: isActive ? '#15803D' : '#B45309',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isActive ? '#16A34A' : '#D97706',
                            }}
                          />
                          {isActive ? 'Hoạt động tốt' : 'Tạm ngưng / Bảo trì'}
                        </span>

                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                          ID: {court.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        {court.name}
                      </div>

                      <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>
                          layers
                        </span>
                        {court.surfaceType || court.courtType || 'Chưa cập nhật mặt sân'}
                        <span style={{ marginLeft: 'auto', color: '#047857', fontWeight: 600 }}>{formatVND(court.defaultPrice)}/h</span>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        <button
                          onClick={() => handleToggleCourtStatus(court)}
                          disabled={busyId === court.id}
                          style={{
                            background: isActive ? '#FFF7ED' : '#F0FDF4',
                            border: isActive ? '1px solid #FFEDD5' : '1px solid #DCFCE7',
                            color: isActive ? '#C2410C' : '#15803D',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: busyId === court.id ? 'wait' : 'pointer',
                            opacity: busyId === court.id ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            {isActive ? 'pause_circle' : 'play_circle'}
                          </span>
                          {isActive ? 'Tạm ngưng sân' : 'Mở lại sân'}
                        </button>

                        <button
                          type="button"
                          className="snx-btn snx-btn--secondary snx-btn--sm"
                          onClick={() => openEditCourtModal(court)}
                          disabled={busyId === court.id}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDeleteCourt(court)}
                          disabled={busyId === court.id}
                          title={`Xóa ${court.name}`}
                          aria-label={`Xóa ${court.name}`}
                          style={{
                            background: 'none',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#B91C1C',
                            cursor: busyId === court.id ? 'wait' : 'pointer',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* TAB 2: BẢNG GIÁ CƠ SỞ & ĐỊNH GIÁ CA SÂN */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="snx-alert snx-alert--info">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
            <span>
              Giá chuẩn của từng khu được lưu trực tiếp lên sân (<code>defaultPrice</code>). Hiện hệ thống chưa có API lưu quy tắc định giá động tự động — để áp dụng giá riêng cho giờ cao điểm / cuối tuần, vui lòng dùng chức năng &ldquo;Đổi giá&rdquo; ở trang{' '}
              <Link to="/owner/slots">Ca sân</Link>.
            </span>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.90)',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>
              Bảng giá cơ sở theo từng cụm sân (Điểm/Giờ)
            </h3>

            {zones.length === 0 ? (
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                Cơ sở chưa có sân nào. Hãy thêm sân ở tab &ldquo;Sân theo khu vực&rdquo;.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #CBD5E1', background: '#F8FAFC' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Khu vực &amp; bộ môn
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Số sân
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Giá mặc định (Điểm/Giờ)
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: `${zone.color}20`,
                                color: zone.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {zone.icon}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                {zone.name.split('—')[0].trim()}
                              </div>
                              <div style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700 }}>{zone.sportLabel}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                          {zone.courts.length} sân
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="number"
                            step="10000"
                            value={zone.basePrice}
                            onChange={(e) => handleUpdateZonePrice(zone.id, 'basePrice', e.target.value)}
                            onBlur={() => handleSaveZoneBasePrice(zone)}
                            disabled={busyId === zone.id}
                            style={{
                              width: '150px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#0F172A',
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            type="button"
                            className="snx-btn snx-btn--secondary snx-btn--sm"
                            disabled={busyId === zone.id}
                            onClick={() => handleSaveZoneBasePrice(zone)}
                          >
                            {busyId === zone.id ? 'Đang lưu...' : 'Lưu giá'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CẤU HÌNH LƯỚI THỜI GIAN (TIME GRID CONFIGURATION) */}
      {activeTab === 'timegrid' && (
        <div style={{ background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.90)', padding: '24px', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>
              Cấu hình khung giờ hoạt động & lưới thời gian (Time Grid Slots)
            </h2>
            <p style={{ margin: 0, color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
              Thiết lập giờ mở cửa, đóng cửa của cơ sở và thời lượng mỗi ca cho từng sân.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Giờ mở cửa */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Giờ mở cửa cơ sở
              </label>
              <TimeInput24
                label="Giờ mở cửa cơ sở"
                value={gridConfig.openingTime}
                onChange={(v) => setGridConfig((prev) => ({ ...prev, openingTime: v }))}
                selectClassName=""
                selectStyle={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', fontWeight: 700, color: '#0F172A', background: '#fff' }}
              />
              <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                Bắt đầu nhận ca đặt sân đầu tiên
              </span>
            </div>

            {/* Giờ đóng cửa */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Giờ đóng cửa cơ sở
              </label>
              <TimeInput24
                label="Giờ đóng cửa cơ sở"
                value={gridConfig.closingTime}
                onChange={(v) => setGridConfig((prev) => ({ ...prev, closingTime: v }))}
                selectClassName=""
                selectStyle={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', fontWeight: 700, color: '#0F172A', background: '#fff' }}
              />
              <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                Ca chơi cuối cùng kết thúc
              </span>
            </div>

            {/* Thời lượng ca theo từng sân (PUT court slotMinutes; ca đã sinh giữ nguyên) */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1', gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Thời lượng mỗi ca theo từng sân
              </label>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                Áp dụng cho các ca sinh sau khi đổi (sinh ca hàng loạt và tự sinh hằng ngày). Ca đã sinh giữ nguyên: xóa ca trống ở trang Ca sân rồi sinh lại nếu muốn đổi.
                Người chơi đặt nhiều ca liền nhau trên cùng sân sẽ được gộp thành 1 đơn, 1 mã QR.
              </span>
              {courts.length === 0 && <span style={{ fontSize: '13px', color: '#64748B' }}>Cơ sở chưa có sân.</span>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {courts.map((court) => (
                  <label key={court.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    {court.name} <span style={{ fontWeight: 600, color: '#64748B' }}>{court.categoryName}</span>
                    <select
                      value={court.slotMinutes == null ? '' : String(court.slotMinutes)}
                      disabled={busyId === court.id}
                      onChange={(e) => handleChangeSlotMinutes(court, e.target.value)}
                      onFocus={() => setPreviewCourtId(court.id)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}
                    >
                      <option value="">Theo môn ({court.effectiveSlotMinutes} phút)</option>
                      {court.slotMinutes != null && !SLOT_MINUTE_OPTIONS.includes(court.slotMinutes) && <option value={String(court.slotMinutes)}>{court.slotMinutes} phút</option>}
                      {SLOT_MINUTE_OPTIONS.map((m) => <option key={m} value={String(m)}>{m} phút</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Time Grid Preview */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
              Mô Phỏng Trực Quan Lưới Thời Gian Trong Ngày ({gridConfig.openingTime} - {gridConfig.closingTime}) • {previewCourt ? `${previewCourt.name}: ` : ''}{previewMinutes} phút / ca
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gridSlots.map((start) => {
                const end = start + previewMinutes
                return (
                  <div
                    key={start}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      textAlign: 'center',
                      minWidth: '105px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      {fromMinutes(start)} - {fromMinutes(end)}
                    </div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        marginTop: '4px',
                        color: '#1E293B',
                      }}
                    >
                      Ca {previewMinutes >= 60 && previewMinutes % 60 === 0 ? `${previewMinutes / 60} giờ` : `${previewMinutes} phút`}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveTimeGrid}
                disabled={busyId === 'timegrid'}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                {busyId === 'timegrid' ? 'Đang lưu...' : 'Lưu giờ mở / đóng cửa cơ sở'}
              </button>
            </div>
          </div>
        </div>
      )}

      {courtForm && (
        <CourtFormModal
          court={courtForm.court}
          sports={sports}
          defaultSportId={courtForm.sportId}
          defaultPrice={courtForm.price}
          busy={busyId === 'court-form'}
          onClose={() => setCourtForm(null)}
          onSubmit={handleSaveCourt}
        />
      )}
    </div>
  )
}
