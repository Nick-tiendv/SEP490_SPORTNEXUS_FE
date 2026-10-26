import { useOutletContext } from 'react-router-dom'

// Cơ sở chủ sân đang chọn, lưu lại để các trang /owner/* dùng chung.
export const FACILITY_STORAGE_KEY = 'sportnexus_owner_facility_id'

// Dữ liệu dùng chung do CourtOwnerLayout cung cấp qua <Outlet context>:
// { profile, wallet, facilities, facilityId, facility, selectFacility, refreshProfile, refreshWallet, refreshFacilities, loading, error }
export const useOwnerContext = () => useOutletContext()
