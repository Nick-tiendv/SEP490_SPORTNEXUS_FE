import { useEffect, useMemo, useState } from 'react'
import { confirmDialog } from '../../components/common/confirm.js'
import { toast } from 'sonner'
import { createCourt, deleteCourt, getCourts, getFacility, getSports, updateCourt, updateFacility } from '../../api/owner'
import { useOwnerContext } from '../Layout/ownerContext.js'
import NoFacilityState from '../NoFacilityState.jsx'
import { PageHeader } from '../../components/layout/AppShell.jsx'
import CourtFormModal from './CourtFormModal.jsx'

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
// Giá cao điểm mặc định = giá chuẩn x hệ số này (BE chưa lưu giá cao điểm riêng).
const PEAK_MULTIPLIER = 1.35

// Quy tắc định giá động: chưa có API lưu riêng, sẽ áp dụng qua priceRules khi sinh slot.
const DEFAULT_PRICING_RULES = [
  {
    id: 'rule-peak-evening',
    name: 'Giờ cao điểm buổi tối (Peak Hours)',
    type: 'time_window',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    timeRange: '17:00 - 22:00',
    multiplier: 1.35,
    active: true,
    badge: 'Giờ vàng',
    badgeColor: '#EF4444',
    description: 'Áp dụng cho các ca tối đông khách trong tuần (tăng 35% so với giá cơ sở)',
  },
  {
    id: 'rule-weekend',
    name: 'Cuối tuần cao điểm (Weekend Premium)',
    type: 'weekend',
    days: ['Thứ 7', 'Chủ nhật'],
    timeRange: '06:00 - 10:30 & 16:00 - 22:30',
    multiplier: 1.45,
    active: true,
    badge: 'Cuối tuần',
    badgeColor: '#F97316',
    description: 'Lượng khách tập trung cao nhất tuần (tăng 45% hoặc định giá cố định)',
  },
  {
    id: 'rule-offpeak',
    name: 'Giờ vắng khách (Happy hours / giảm giá)',
    type: 'discount',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    timeRange: '09:00 - 15:00',
    multiplier: 0.8,
    active: true,
    badge: 'Giảm 20%',
    badgeColor: '#10B981',
    description: 'Kích cầu khung giờ trưa vắng khách cho học sinh, sinh viên, người làm việc tự do',
  },
  {
    id: 'rule-lastminute',
    name: 'Khuyến mãi đặt cận giờ (Flash Fill)',
    type: 'last_minute',
    days: ['Hàng ngày'],
    timeRange: 'Trước giờ chơi 90 phút nếu sân còn trống',
    multiplier: 0.75,
    active: true,
    badge: 'Flash 25%',
    badgeColor: '#8B5CF6',
    description: 'Tự động mở bán giảm 25% cho các slot trống chuẩn bị đến giờ chơi',
  },
]

const toClock = value => (value && /^\d{1,2}:\d{2}/.test(value) ? value.slice(0, 5).padStart(5, '0') : '')
const toMinutes = clock => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}
const fromMinutes = total => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
const roundPrice = value => Math.round(value / 10000) * 10000

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

  // Giá chỉnh tay theo khu: { [categoryId]: { basePrice, peakPrice } }
  const [zonePrices, setZonePrices] = useState({})
  const [pricingRules, setPricingRules] = useState(DEFAULT_PRICING_RULES)
  const [gridConfig, setGridConfig] = useState({ openingTime: '06:00', closingTime: '22:00', slotDuration: 60, bufferTime: 0 })

  // Bộ mô phỏng tính giá động trực quan
  const [simZoneId, setSimZoneId] = useState('')
  const [simDay, setSimDay] = useState('weekday') // 'weekday' | 'weekend'
  const [simHour, setSimHour] = useState(18) // 18h tối

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
        peakPrice: zonePrices[categoryId]?.peakPrice ?? roundPrice(basePrice * PEAK_MULTIPLIER),
        courts: zoneCourts,
      }
    })
  }, [courts, sports, zonePrices])

  const selectedZone = zones.find(zone => zone.id === selectedZoneId) || zones[0] || null

  const reloadCourts = async () => setCourts((await getCourts(facilityId)).map(toCourt))

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
  const openEditCourtModal = (court) => setCourtForm({ court, sportId: court.categoryId, price: court.defaultPrice })

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
    } finally {
      setBusyId(null)
    }
  }

  // Toggle quy tắc định giá động (lưu cục bộ)
  const handleToggleRule = (ruleId) => {
    setPricingRules(prev => prev.map(rule => (rule.id === ruleId ? { ...rule, active: !rule.active } : rule)))
  }

  // Sửa giá của Khu trên giao diện
  const handleUpdateZonePrice = (zoneId, field, value) => {
    const zone = zones.find(item => item.id === zoneId)
    setZonePrices(prev => ({
      ...prev,
      [zoneId]: { basePrice: zone.basePrice, peakPrice: zone.peakPrice, ...prev[zoneId], [field]: Number(value) || 0 },
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
    } finally {
      setBusyId(null)
    }
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

  const isRuleActive = id => pricingRules.find(rule => rule.id === id)?.active

  // Tính giá mô phỏng theo giờ
  const calculateSimulatedPrice = () => {
    const zone = zones.find((z) => z.id === simZoneId) || zones[0]
    if (!zone) return null
    let base = zone.basePrice
    let multiplier = 1.0
    let appliedRule = 'Giá tiêu chuẩn (Giờ thường)'

    if (simDay === 'weekend') {
      if (isRuleActive('rule-weekend') && ((simHour >= 6 && simHour < 11) || (simHour >= 16 && simHour <= 22))) {
        multiplier = 1.45
        appliedRule = 'Quy tắc cuối tuần cao điểm (+45%)'
      }
    } else {
      if (isRuleActive('rule-peak-evening') && simHour >= 17 && simHour <= 22) {
        multiplier = 1.35
        appliedRule = 'Quy tắc giờ cao điểm buổi tối (+35%)'
      } else if (isRuleActive('rule-offpeak') && simHour >= 9 && simHour < 15) {
        multiplier = 0.8
        appliedRule = 'Quy tắc giờ vắng khách / happy hours (-20%)'
      }
    }

    const finalPrice = Math.round(base * multiplier)
    return { base, multiplier, finalPrice, appliedRule, zone }
  }

  const simResult = calculateSimulatedPrice()

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + ' đ'

  // Các ca trong ngày theo giờ mở/đóng cửa, thời lượng slot và thời gian đệm
  const gridSlots = useMemo(() => {
    const slots = []
    const end = toMinutes(gridConfig.closingTime)
    const step = gridConfig.slotDuration + gridConfig.bufferTime
    for (let start = toMinutes(gridConfig.openingTime); start + gridConfig.slotDuration <= end && slots.length < 48; start += step) {
      slots.push(start)
    }
    return slots
  }, [gridConfig])

  // Tổng số sân trong cụm
  const totalCourts = courts.length
  const activeCourts = courts.filter((c) => c.status === 'ACTIVE').length
  const activeRuleCount = pricingRules.filter(rule => rule.active).length

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
                      <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>Giờ chuẩn: </span>
                      <strong style={{ fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>
                        {formatVND(selectedZone.basePrice)}/h
                      </strong>
                    </div>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <div>
                      <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>Giờ cao điểm: </span>
                      <strong style={{ fontSize: '16px', color: '#EF4444', fontWeight: 700 }}>
                        {formatVND(selectedZone.peakPrice)}/h
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

      {/* TAB 2: ĐỊNH GIÁ ĐỘNG (DYNAMIC PRICING ENGINE) */}
      {activeTab === 'pricing' && (
        <>
        <div className="snx-alert snx-alert--info" style={{ marginBottom: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          <span>Giá chuẩn của từng khu được lưu vào sân. Các quy tắc giờ cao điểm bên dưới hiện chỉ để mô phỏng, chưa lưu lên hệ thống. Muốn áp giá thật theo khung giờ, dùng "Đổi giá" ở trang <a href="/owner/slots">Ca sân</a>.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 380px)', gap: '24px' }}>
          {/* Rules list & base config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Banner AI Engine */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10B981',
                      color: '#34D399',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}
                  >
                    DYNAMIC PRICING ENGINE v2.4
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>• Tự động tối ưu doanh thu</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 6px 0' }}>
                  Hệ thống định giá thông minh theo khung giờ
                </h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', maxWidth: '580px' }}>
                  Tự động điều chỉnh giá giờ cao điểm (Peak Hours), giảm giá giờ vắng khách (Off-peak Happy Hours) và kích cầu đặt sân cận giờ thông qua cơ chế Smart Escrow.
                </p>
              </div>

              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                  auto_graph
                </span>
              </div>
            </div>

            {/* Base Rates table for each Zone */}
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
                Bảng giá cơ sở theo từng cụm sân (VND/Giờ)
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #CBD5E1', background: '#F8FAFC' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Khu vực & bộ môn
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Giá giờ thường (Base Rate)
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Giá giờ cao điểm (Peak Rate)
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        Chênh lệch
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
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="number"
                            step="10000"
                            value={zone.basePrice}
                            onChange={(e) => handleUpdateZonePrice(zone.id, 'basePrice', e.target.value)}
                            onBlur={() => handleSaveZoneBasePrice(zone)}
                            disabled={busyId === zone.id}
                            style={{
                              width: '140px',
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
                          <input
                            type="number"
                            step="10000"
                            value={zone.peakPrice}
                            onChange={(e) => handleUpdateZonePrice(zone.id, 'peakPrice', e.target.value)}
                            style={{
                              width: '140px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#EF4444',
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#16A34A',
                              background: '#DCFCE7',
                              padding: '4px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            +{zone.basePrice ? Math.round(((zone.peakPrice - zone.basePrice) / zone.basePrice) * 100) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Rules Configuration */}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Quy tắc định giá động đang áp dụng
                </h3>
                <span style={{ fontSize: '13px', color: '#047857', fontWeight: 600 }}>
                  ● {activeRuleCount}/{pricingRules.length} quy tắc đang hoạt động
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px',
                      background: rule.active ? '#FFFFFF' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: `${rule.badgeColor}15`,
                          color: rule.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                          {rule.multiplier > 1 ? 'trending_up' : 'trending_down'}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                            {rule.name}
                          </span>
                          <span
                            style={{
                              background: `${rule.badgeColor}20`,
                              color: rule.badgeColor,
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {rule.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13.5px', color: '#1E293B', fontWeight: 600 }}>{rule.description}</p>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                          <span>
                            <strong style={{ color: '#0F172A' }}>Khung giờ:</strong> {rule.timeRange}
                          </span>
                          <span>•</span>
                          <span>
                            <strong style={{ color: '#0F172A' }}>Ngày áp dụng:</strong> {rule.days.join(', ')}
                          </span>
                          <span>•</span>
                          <span>
                            <strong style={{ color: '#0F172A' }}>Hệ số:</strong>{' '}
                            <span style={{ color: rule.multiplier >= 1 ? '#DC2626' : '#047857', fontWeight: 600 }}>
                              {rule.multiplier}x
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        style={{
                          background: rule.active ? '#10B981' : '#CBD5E1',
                          border: 'none',
                          borderRadius: '999px',
                          width: '48px',
                          height: '26px',
                          padding: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'background 0.2s',
                          justifyContent: rule.active ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Realtime Pricing Simulator Widget */}
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.90)',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
                position: 'sticky',
                top: '84px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '24px' }}>
                  calculate
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                  Trình mô phỏng giá thời gian thực
                </h3>
              </div>

              {/* Select sport */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Chọn bộ môn / khu vực
                </label>
                <select
                  value={simResult?.zone.id || ''}
                  onChange={(e) => setSimZoneId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0F172A',
                    background: '#F8FAFC',
                  }}
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name} (Gốc: {formatVND(zone.basePrice)})</option>
                  ))}
                </select>
              </div>

              {/* Select Day Type */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Ngày trong tuần
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setSimDay('weekday')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: simDay === 'weekday' ? '2px solid #047857' : '1px solid #CBD5E1',
                      background: simDay === 'weekday' ? '#ECFDF5' : '#FFFFFF',
                      color: simDay === 'weekday' ? '#065F46' : '#1E293B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Ngày thường (T2 - T6)
                  </button>
                  <button
                    onClick={() => setSimDay('weekend')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: simDay === 'weekend' ? '2px solid #F97316' : '1px solid #CBD5E1',
                      background: simDay === 'weekend' ? '#FFF7ED' : '#FFFFFF',
                      color: simDay === 'weekend' ? '#9A3412' : '#1E293B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cuối tuần (T7 - CN)
                  </button>
                </div>
              </div>

              {/* Slider for Hours */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                    Khung giờ thi đấu:
                  </label>
                  <strong style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                    {simHour.toString().padStart(2, '0')}:00 - {(simHour + 1).toString().padStart(2, '0')}:00
                  </strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="23"
                  value={simHour}
                  onChange={(e) => setSimHour(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#047857', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#1E293B', fontWeight: 700, marginTop: '2px' }}>
                  <span>05:00</span>
                  <span>12:00</span>
                  <span>18:00 (Peak)</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Simulator Calculation Result Card */}
              {simResult && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #BBF7D0',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Kết quả tính giá người chơi trả
                </div>
                <div style={{ fontSize: '28px', fontWeight: 600, color: '#14532D', margin: '6px 0' }}>
                  {formatVND(simResult.finalPrice)}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#166534' }}> / giờ</span>
                </div>

                <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', lineHeight: 1.4 }}>
                  ⚡ Áp dụng: <strong>{simResult.appliedRule}</strong>
                </div>

                <div
                  style={{
                    paddingTop: '10px',
                    borderTop: '1px dashed #86EFAC',
                    fontSize: '12px',
                    color: '#15803D',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Giá gốc ban đầu:</span>
                  <span>{formatVND(simResult.base)}</span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#15803D',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                  }}
                >
                  <span>Hệ số điều chỉnh:</span>
                  <span>{simResult.multiplier}x</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}

      {/* TAB 3: CẤU HÌNH LƯỚI THỜI GIAN (TIME GRID CONFIGURATION) */}
      {activeTab === 'timegrid' && (
        <div style={{ background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.90)', padding: '24px', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>
              Cấu hình khung giờ hoạt động & lưới thời gian (Time Grid Slots)
            </h2>
            <p style={{ margin: 0, color: '#1E293B', fontSize: '14px', fontWeight: 600 }}>
              Thiết lập khung giờ mở cửa, đóng cửa, bước nhảy thời lượng đặt sân và thời gian đệm vệ sinh sân giữa các ca.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Giờ mở cửa */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Giờ mở cửa cơ sở
              </label>
              <input
                type="time"
                value={gridConfig.openingTime}
                onChange={(e) => setGridConfig((prev) => ({ ...prev, openingTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
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
              <input
                type="time"
                value={gridConfig.closingTime}
                onChange={(e) => setGridConfig((prev) => ({ ...prev, closingTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              />
              <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                Ca chơi cuối cùng kết thúc
              </span>
            </div>

            {/* Bước nhảy khung giờ */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Thời lượng mỗi slot (Bước nhảy)
              </label>
              <select
                value={gridConfig.slotDuration}
                onChange={(e) => setGridConfig((prev) => ({ ...prev, slotDuration: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <option value={30}>30 phút / slot (Linh hoạt cao)</option>
                <option value={60}>60 phút / slot (Khuyến nghị chuẩn)</option>
                <option value={90}>90 phút / slot (Bóng đá trận dài)</option>
                <option value={120}>120 phút / slot (2 tiếng)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                Quy định độ dài mỗi ô đặt lịch
              </span>
            </div>

            {/* Thời gian đệm vệ sinh */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                Thời gian đệm vệ sinh / lau sân
              </label>
              <select
                value={gridConfig.bufferTime}
                onChange={(e) => setGridConfig((prev) => ({ ...prev, bufferTime: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                <option value={0}>0 phút (Nối ca liền mạch)</option>
                <option value={5}>5 phút nghỉ giữa các ca</option>
                <option value={10}>10 phút lau sàn BWF & nhặt bóng</option>
                <option value={15}>15 phút</option>
              </select>
              <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                Tránh chồng chéo người chơi đến ca sau
              </span>
            </div>
          </div>

          {/* Time Grid Preview */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>
              Mô phỏng trực quan lưới thời gian trong ngày ({gridConfig.openingTime} - {gridConfig.closingTime})
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gridSlots.map((start) => {
                const hour = Math.floor(start / 60)
                const isPeak = hour >= 17 && hour <= 22
                const isOffpeak = hour >= 9 && hour <= 14
                return (
                  <div
                    key={start}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: isPeak ? '1px solid #FCA5A5' : isOffpeak ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                      background: isPeak ? '#FEF2F2' : isOffpeak ? '#ECFDF5' : '#FFFFFF',
                      textAlign: 'center',
                      minWidth: '85px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isPeak ? '#DC2626' : '#0F172A' }}>
                      {fromMinutes(start)}
                    </div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        marginTop: '4px',
                        color: isPeak ? '#DC2626' : isOffpeak ? '#047857' : '#1E293B',
                      }}
                    >
                      {isPeak ? 'Giờ vàng 🔥' : isOffpeak ? 'Happy Hour' : 'Chuẩn'}
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
