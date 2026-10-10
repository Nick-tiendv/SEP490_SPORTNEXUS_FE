// Fictional demonstration data. IDs and registration fields are not real identities.
const seeds = [
  ['Nguyễn Văn A', 'owner_phumyhung', 'Verified', 'Active', 3],
  ['Trần Quốc Bảo', 'baosport_thaodien', 'Pending', 'Active', 1],
  ['Lê Thị Mỹ Hương', 'huong_pickleball_q7', 'Verified', 'Active', 2],
  ['Đặng Minh Tuấn', 'tuan_arena_binhthanh', 'Pending', 'Active', 2],
  ['Hoàng Đình Khang', 'khang_badminton_club', 'Verified', 'Inactive', 1],
  ['Phạm Thanh Bình', 'binh_courts', 'Rejected', 'Suspended', 0],
  ['Vũ Ngọc Lan', 'lan_sports', 'Verified', 'Active', 4],
  ['Lê Gia Bảo', 'giabao_tennis', 'Pending', 'Active', 1],
  ['Trần Hoài An', 'hoai_an_sports', 'Verified', 'Active', 3],
  ['Đỗ Minh Phúc', 'phuc_arena', 'Verified', 'Active', 2],
  ['Nguyễn Thùy Linh', 'linh_pickleball', 'Pending', 'Inactive', 1],
  ['Bùi Quốc Huy', 'huy_football', 'Verified', 'Active', 2],
  ['Võ Mai Anh', 'mai_anh_sports', 'Verified', 'Active', 1],
  ['Lý Đức Long', 'long_sport', 'Rejected', 'Active', 0],
  ['Trần Khánh Vy', 'vy_courts', 'Verified', 'Active', 3],
]

const firstFacilities = [
  { id: 'DEMO-FAC-01', name: 'Sunrise Riverside Sport Hub', location: 'Nhà Nam Sài Gòn, Q.7', courts: 12, sports: 'Cầu lông, Pickleball', status: 'Active', rating: '4.9 (420 đánh giá)' },
  { id: 'DEMO-FAC-02', name: 'CLB Pickleball Phú Mỹ Hưng Pro', location: 'Đường Tân Phú, Q.7', courts: 6, sports: 'Pickleball tiêu chuẩn', status: 'Active', rating: null },
  { id: 'DEMO-FAC-03', name: 'Sunrise Tennis Garden', location: 'Phú Mỹ Hưng, Q.7', courts: 12, sports: 'Tennis', status: 'Active', rating: null },
]

export const initialOwners = seeds.map(([name, username, verification, status, count], index) => {
  const facilities = index === 0 ? firstFacilities : Array.from({ length: count }, (_, facility) => ({
    id: `DEMO-FAC-${index}-${facility}`, name: `${name} Sport Center ${facility + 1}`, location: 'TP. Hồ Chí Minh • Demo location', courts: 4 + facility * 2, sports: index % 2 ? 'Pickleball, Tennis' : 'Cầu lông', status: status === 'Suspended' ? 'Inactive' : 'Active', rating: null,
  }))
  return { id: `OWN-${7721 - index}`, name, username, email: `${username}@example.com`, phone: null,
    verification, status, joined: `2024-10-${String(index + 1).padStart(2, '0')}`,
    legalName: index === 0 ? 'Sunrise Sports JSC (Demo)' : `${name} Sports (Demo)`,
    registration: verification === 'Rejected' ? null : `DEMO-REG-${1000 + index}`,
    trust: verification === 'Verified' ? 99.8 : null, facilities,
    monthlyBookings: index === 0 ? 3840 : count * 160,
    monthlyGmv: index === 0 ? 412500000 : count * 18000000,
  }
})

export const ownerStats = [
  { label: 'Total Court Owners', value: '1,420', trend: '+8.1%', detail: 'so với tháng trước' },
  { label: 'Active Court Owners', value: '1,356', trend: '95.5%', detail: 'đang hoạt động trên hệ thống' },
  { label: 'Pending Verification', value: '18', trend: 'Action Needed', detail: 'Awaiting KYC & Facility Review', pending: true },
  { label: 'Total Facilities', value: '3,890', trend: '+15.2%', detail: 'cơ sở thể thao trên toàn quốc' },
]
export const emptyOwnerFilters = { search: '', verification: 'All', status: 'All', facilities: 'All' }

export function filterOwners(owners, filters) {
  const query = filters.search.trim().toLocaleLowerCase()
  return owners.filter(owner => (!query || [owner.name, owner.username, owner.email, owner.id].some(value => value.toLocaleLowerCase().includes(query))) &&
    (filters.verification === 'All' || owner.verification === filters.verification) &&
    (filters.status === 'All' || owner.status === filters.status) &&
    (filters.facilities === 'All' || (filters.facilities === '3+' ? owner.facilities.length >= 3 : owner.facilities.length === Number(filters.facilities))))
}

export function ownersCsv(owners) {
  const escape = value => {
    let text = String(value ?? '')
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return '\uFEFF' + [['Owner ID', 'Name', 'Username', 'Email', 'Phone', 'Facilities', 'Verification', 'Account status'],
    ...owners.map(owner => [owner.id, owner.name, owner.username, owner.email, owner.phone, owner.facilities.length, owner.verification, owner.status])].map(row => row.map(escape).join(',')).join('\r\n')
}
