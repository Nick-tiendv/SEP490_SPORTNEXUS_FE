import { useId, useMemo } from 'react'
import SearchableSelect from './SearchableSelect.jsx'
import { PROVINCE_OPTIONS, composeFacilityAddress, getWardOptions, isValidProvince, isValidWard } from '../../utils/vnAddress.js'

// Khối nhập địa chỉ chuẩn dùng chung cho Form Chủ sân & Form Admin:
// Dropdown tìm kiếm Tỉnh -> Dropdown tìm kiếm Phường (theo tỉnh) -> Ô nhập số nhà / tên đường.
export default function FacilityAddressFields({
  province = '',
  district = '',
  street = '',
  legacyProvince = '',
  legacyDistrict = '',
  onChange,
  disabled = false,
  errors = {},
}) {
  const baseId = useId()
  const provinceLabelId = `${baseId}-province-label`
  const districtLabelId = `${baseId}-district-label`

  const hasValidProvince = isValidProvince(province)
  const wardOptions = useMemo(() => getWardOptions(province), [province])
  const hasValidDistrict = isValidWard(province, district)
  const preview = composeFacilityAddress({ street, district, province })

  const handleProvinceChange = nextProvince => {
    onChange({
      province: nextProvince,
      district: '',
      legacyProvince: '',
      legacyDistrict: '',
    })
  }

  const handleDistrictChange = nextDistrict => {
    onChange({
      district: nextDistrict,
      legacyDistrict: '',
    })
  }

  return (
    <div className="snx-addr-block">
      <div className="snx-addr-grid">
        <div className="snx-addr-field">
          <span id={provinceLabelId} className="snx-addr-label">
            Tỉnh / Thành phố *
          </span>
          <SearchableSelect
            id={`${baseId}-province`}
            ariaLabelledBy={provinceLabelId}
            value={province}
            options={PROVINCE_OPTIONS}
            placeholder="— Chọn tỉnh / thành phố —"
            searchPlaceholder="Tìm tỉnh / thành phố…"
            emptyText="Không tìm thấy tỉnh / thành phố."
            disabled={disabled}
            invalid={Boolean(errors.province)}
            onChange={handleProvinceChange}
          />
          {legacyProvince && !hasValidProvince && <span className="snx-addr-hint">Dữ liệu cũ: “{legacyProvince}” — vui lòng chọn lại theo danh mục mới.</span>}
        </div>

        <div className="snx-addr-field">
          <span id={districtLabelId} className="snx-addr-label">
            Phường / Xã *
          </span>
          <SearchableSelect
            id={`${baseId}-district`}
            ariaLabelledBy={districtLabelId}
            value={district}
            options={wardOptions}
            placeholder={hasValidProvince ? '— Chọn phường / xã —' : 'Chọn tỉnh / thành phố trước'}
            searchPlaceholder="Tìm phường / xã…"
            emptyText="Không tìm thấy phường / xã."
            disabled={disabled || !hasValidProvince}
            invalid={Boolean(errors.district)}
            onChange={handleDistrictChange}
          />
          {legacyDistrict && !hasValidDistrict && <span className="snx-addr-hint">Dữ liệu cũ: “{legacyDistrict}” — vui lòng chọn lại Phường / Xã.</span>}
        </div>
      </div>

      <label className="snx-addr-field">
        <span className="snx-addr-label">Số nhà, tên đường *</span>
        <input
          type="text"
          className="snx-input"
          value={street}
          maxLength={180}
          disabled={disabled}
          aria-invalid={Boolean(errors.street) || undefined}
          placeholder="Ví dụ: 123 Nguyễn Văn Linh"
          onChange={event => onChange({ street: event.target.value })}
        />
      </label>

      {preview && (
        <div className="snx-addr-preview" aria-live="polite">
          Địa chỉ đầy đủ: <strong>{preview}</strong>
        </div>
      )}
    </div>
  )
}
