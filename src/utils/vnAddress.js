import { VN_ADMIN_UNITS } from '../data/vnAdministrativeUnits.js'

// Bỏ dấu tiếng Việt và đưa về chữ thường để tìm kiếm / đối chiếu không phân biệt dấu.
export const normalizeVi = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()

const normalizeAreaKey = value =>
  normalizeVi(value)
    .replace(/^\s*(thanh pho|tinh|tp\.?)\s*/, '')
    .replace(/[^a-z0-9]/g, '')

const stripWardPrefix = value =>
  String(value || '')
    .trim()
    .replace(/^(phường|xã|thị trấn|đặc khu|p\.|x\.|tt\.)\s+/i, '')
    .trim()

const stripProvincePrefix = value =>
  String(value || '')
    .trim()
    .replace(/^(thành phố|tỉnh|tp\.?)\s+/i, '')
    .trim()

const PROVINCE_ALIASES = {
  hcm: 'Thành phố Hồ Chí Minh',
  tphcm: 'Thành phố Hồ Chí Minh',
  hochiminhcity: 'Thành phố Hồ Chí Minh',
  saigon: 'Thành phố Hồ Chí Minh',
  sg: 'Thành phố Hồ Chí Minh',
  hn: 'Thành phố Hà Nội',
  hanoi: 'Thành phố Hà Nội',
  dn: 'Thành phố Đà Nẵng',
  danang: 'Thành phố Đà Nẵng',
  hp: 'Thành phố Hải Phòng',
  haiphong: 'Thành phố Hải Phòng',
  ct: 'Thành phố Cần Thơ',
  cantho: 'Thành phố Cần Thơ',
  hue: 'Thành phố Huế',
  thuathienhue: 'Thành phố Huế',
}

const PROVINCE_SEARCH_KEYWORDS = {
  'Thành phố Hồ Chí Minh': 'hcm tphcm tp hcm sai gon saigon sg',
  'Thành phố Hà Nội': 'hn ha noi hanoi',
  'Thành phố Đà Nẵng': 'dn da nang danang',
  'Thành phố Hải Phòng': 'hp hai phong haiphong',
  'Thành phố Cần Thơ': 'ct can tho cantho',
  'Thành phố Huế': 'hue thua thien hue',
}

export const PROVINCE_OPTIONS = VN_ADMIN_UNITS.map(unit => ({
  value: unit.name,
  label: unit.name,
  keywords: [stripProvincePrefix(unit.name), PROVINCE_SEARCH_KEYWORDS[unit.name] || ''].filter(Boolean).join(' '),
}))

export const findProvinceUnit = provinceName => VN_ADMIN_UNITS.find(unit => unit.name === provinceName) || null

export const getWardOptions = provinceName => {
  const unit = findProvinceUnit(provinceName)
  if (!unit) return []
  return unit.wards.map(ward => ({
    value: ward,
    label: ward,
    keywords: stripWardPrefix(ward),
  }))
}

export const canonicalProvince = value => {
  const key = normalizeAreaKey(value)
  if (!key) return ''
  return VN_ADMIN_UNITS.find(unit => normalizeAreaKey(unit.name) === key)?.name || PROVINCE_ALIASES[key] || ''
}

export const canonicalWard = (provinceOrUnit, value) => {
  const unit = typeof provinceOrUnit === 'string' ? findProvinceUnit(canonicalProvince(provinceOrUnit) || provinceOrUnit) : provinceOrUnit
  const raw = String(value || '').trim()
  if (!unit || !raw) return ''
  const wards = unit.wards || []

  if (wards.includes(raw)) return raw

  const lower = raw.toLowerCase()
  const caseInsensitive = wards.find(ward => ward.toLowerCase() === lower)
  if (caseInsensitive) return caseInsensitive

  const noPrefixLower = stripWardPrefix(raw).toLowerCase()
  if (noPrefixLower) {
    const accentedMatches = wards.filter(ward => stripWardPrefix(ward).toLowerCase() === noPrefixLower)
    if (accentedMatches.length === 1) return accentedMatches[0]
  }

  const normFull = normalizeVi(raw)
  const normMatches = wards.filter(ward => normalizeVi(ward) === normFull)
  if (normMatches.length === 1) return normMatches[0]

  const normNoPrefix = normalizeVi(stripWardPrefix(raw))
  if (normNoPrefix) {
    const bareMatches = wards.filter(ward => normalizeVi(stripWardPrefix(ward)) === normNoPrefix)
    if (bareMatches.length === 1) return bareMatches[0]
  }

  return ''
}

export const isValidProvince = value => Boolean(findProvinceUnit(value))

export const isValidWard = (provinceName, wardName) => {
  const unit = findProvinceUnit(provinceName)
  return Boolean(unit && wardName && unit.wards.includes(wardName))
}

export const composeFacilityAddress = ({ street, district, province }) => {
  const cleanStreet = String(street || '')
    .trim()
    .replace(/,+$/, '')
    .trim()
  return [cleanStreet, String(district || '').trim(), String(province || '').trim()].filter(Boolean).join(', ')
}

export const parseFacilityAddress = ({ address, province, district } = {}) => {
  const rawAddress = String(address || '').trim()
  const rawProvince = String(province || '').trim()
  const rawDistrict = String(district || '').trim()

  const parts = rawAddress
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  let resolvedProvince = canonicalProvince(rawProvince)
  if (!resolvedProvince && parts.length > 0) {
    resolvedProvince = canonicalProvince(parts[parts.length - 1])
  }

  const provinceUnit = findProvinceUnit(resolvedProvince)
  let resolvedDistrict = provinceUnit ? canonicalWard(provinceUnit, rawDistrict) : ''

  if (!resolvedDistrict && provinceUnit && parts.length >= 2) {
    const lastIsProvince = canonicalProvince(parts[parts.length - 1]) === resolvedProvince
    const wardCandidate = lastIsProvince ? parts[parts.length - 2] : parts[parts.length - 1]
    resolvedDistrict = canonicalWard(provinceUnit, wardCandidate)
  }

  // Tách phần tỉnh và phường ở cuối chuỗi địa chỉ (nếu đã có) để ô số nhà/tên đường không bị lặp khi lưu lại.
  const streetParts = [...parts]
  if (streetParts.length > 0) {
    const last = streetParts[streetParts.length - 1]
    const lastMatchesProvince =
      (resolvedProvince && canonicalProvince(last) === resolvedProvince) || (rawProvince && normalizeAreaKey(last) === normalizeAreaKey(rawProvince))
    if (lastMatchesProvince) streetParts.pop()
  }
  if (streetParts.length > 0) {
    const last = streetParts[streetParts.length - 1]
    const lastMatchesWard =
      (provinceUnit && resolvedDistrict && canonicalWard(provinceUnit, last) === resolvedDistrict) ||
      (rawDistrict && normalizeVi(last) === normalizeVi(rawDistrict))
    if (lastMatchesWard) streetParts.pop()
  }

  return {
    province: resolvedProvince,
    district: resolvedDistrict,
    street: streetParts.join(', '),
    legacyProvince: rawProvince && !resolvedProvince ? rawProvince : '',
    legacyDistrict: rawDistrict && !resolvedDistrict ? rawDistrict : '',
  }
}

export const validateFacilityAddress = ({ province, district, street }) => {
  if (!isValidProvince(province)) return 'Vui lòng chọn Tỉnh / Thành phố.'
  if (!isValidWard(province, district)) return 'Vui lòng chọn Phường / Xã.'
  if (!String(street || '').trim()) return 'Vui lòng nhập số nhà, tên đường.'
  return ''
}
