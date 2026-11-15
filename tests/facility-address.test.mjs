import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

test('Địa chỉ hành chính Việt Nam 2025 và đồng bộ form cơ sở', async t => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'silent',
  })

  try {
    const vnAddress = await server.ssrLoadModule('/src/utils/vnAddress.js')
    const ssMod = await server.ssrLoadModule('/src/components/common/SearchableSelect.jsx')
    const addrMod = await server.ssrLoadModule('/src/components/common/FacilityAddressFields.jsx')
    const dialogMod = await server.ssrLoadModule('/src/Admin/Facilities/FacilityDialogs.jsx')

    const SearchableSelect = ssMod.default || ssMod.SearchableSelect
    const FacilityAddressFields = addrMod.default || addrMod.FacilityAddressFields
    const { FacilityFormDialog } = dialogMod

    const hcm = 'Thành phố Hồ Chí Minh'
    const hn = 'Thành phố Hà Nội'
    const hcmWards = vnAddress.getWardOptions(hcm)
    const sampleHcmWard = hcmWards[0]?.value
    const sampleHnWard = vnAddress.getWardOptions(hn)[0]?.value

    await t.test('PROVINCE_OPTIONS và canonicalProvince hoạt động đúng', () => {
      assert.equal(vnAddress.PROVINCE_OPTIONS.length, 34)
      assert.equal(vnAddress.canonicalProvince(hcm), hcm)
      assert.equal(vnAddress.canonicalProvince('TP.HCM'), hcm)
      assert.equal(vnAddress.canonicalProvince('tp hcm'), hcm)
      assert.equal(vnAddress.canonicalProvince('Hà Nội'), hn)
      assert.equal(vnAddress.canonicalProvince('ha noi'), hn)
      assert.equal(vnAddress.canonicalProvince('Quận 1'), '')
      assert.equal(vnAddress.isValidProvince(hcm), true)
      assert.equal(vnAddress.isValidProvince('Không tồn tại'), false)
    })

    await t.test('canonicalWard phân biệt đúng phường/xã trùng âm và kiểm tra theo tỉnh', () => {
      assert.ok(sampleHcmWard)
      assert.ok(sampleHnWard)
      assert.equal(vnAddress.canonicalWard(hcm, sampleHcmWard), sampleHcmWard)
      assert.equal(vnAddress.canonicalWard(hcm, 'Xã Thanh An'), 'Xã Thanh An')
      assert.equal(vnAddress.canonicalWard(hcm, 'Xã Thạnh An'), 'Xã Thạnh An')

      const langSonWards = vnAddress.getWardOptions('Tỉnh Lạng Sơn').map(item => item.value)
      const bacSonExact = langSonWards.find(w => w.toLowerCase() === 'xã bắc sơn')
      assert.ok(bacSonExact)
      assert.equal(vnAddress.canonicalWard('Tỉnh Lạng Sơn', 'Xã Bắc Sơn'), bacSonExact)

      assert.equal(vnAddress.isValidWard(hcm, sampleHcmWard), true)
      assert.equal(vnAddress.isValidWard(hn, 'Xã Thạnh An'), false)
    })

    await t.test('parseFacilityAddress tách địa chỉ chuẩn và xử lý dữ liệu cũ không gộp trùng', () => {
      const parsedStandard = vnAddress.parseFacilityAddress({
        address: `123 Nguyễn Huệ, ${sampleHcmWard}, ${hcm}`,
        province: hcm,
        district: sampleHcmWard,
      })
      assert.equal(parsedStandard.province, hcm)
      assert.equal(parsedStandard.district, sampleHcmWard)
      assert.equal(parsedStandard.street, '123 Nguyễn Huệ')
      assert.equal(parsedStandard.legacyProvince, '')
      assert.equal(parsedStandard.legacyDistrict, '')

      const parsedInferred = vnAddress.parseFacilityAddress({
        address: `45 Lê Lợi, ${sampleHcmWard}, ${hcm}`,
        province: '',
        district: '',
      })
      assert.equal(parsedInferred.province, hcm)
      assert.equal(parsedInferred.district, sampleHcmWard)
      assert.equal(parsedInferred.street, '45 Lê Lợi')

      const parsedLegacy = vnAddress.parseFacilityAddress({
        address: '100 Pasteur, Phường Bến Nghé, Quận 1, TP.HCM',
        province: 'TP.HCM',
        district: 'Quận 1',
      })
      assert.equal(parsedLegacy.province, hcm)
      assert.equal(parsedLegacy.district, '')
      assert.equal(parsedLegacy.legacyDistrict, 'Quận 1')
      assert.equal(parsedLegacy.street, '100 Pasteur, Phường Bến Nghé')
    })

    await t.test('composeFacilityAddress và validateFacilityAddress bắt buộc chọn đủ 3 phần', () => {
      assert.equal(
        vnAddress.composeFacilityAddress({ street: '123 Nguyễn Huệ', district: sampleHcmWard, province: hcm }),
        `123 Nguyễn Huệ, ${sampleHcmWard}, ${hcm}`,
      )
      assert.notEqual(vnAddress.validateFacilityAddress({ province: '', district: '', street: '123' }), '')
      assert.notEqual(vnAddress.validateFacilityAddress({ province: 'Không hợp lệ', district: sampleHcmWard, street: '123' }), '')
      assert.notEqual(vnAddress.validateFacilityAddress({ province: hcm, district: '', street: '123' }), '')
      assert.notEqual(vnAddress.validateFacilityAddress({ province: hn, district: 'Xã Thạnh An', street: '123' }), '')
      assert.notEqual(vnAddress.validateFacilityAddress({ province: hcm, district: sampleHcmWard, street: '   ' }), '')
      assert.equal(vnAddress.validateFacilityAddress({ province: hcm, district: sampleHcmWard, street: '123 Nguyễn Huệ' }), '')
    })

    await t.test('SSR render SearchableSelect, FacilityAddressFields và FacilityFormDialog', () => {
      const ssHtml = renderToString(
        createElement(SearchableSelect, {
          value: hcm,
          options: vnAddress.PROVINCE_OPTIONS,
          onChange: () => {},
          placeholder: 'Chọn tỉnh/thành phố',
          searchPlaceholder: 'Tìm tỉnh/thành phố...',
        }),
      )
      assert.match(ssHtml, /aria-haspopup="listbox"/)
      assert.match(ssHtml, /aria-expanded="false"/)
      assert.match(ssHtml, /Thành phố Hồ Chí Minh/)

      const fieldsHtml = renderToString(
        createElement(FacilityAddressFields, {
          province: hcm,
          district: sampleHcmWard,
          street: '99 Trần Hưng Đạo',
          onChange: () => {},
        }),
      )
      assert.match(fieldsHtml, /Tỉnh \/ Thành phố/)
      assert.match(fieldsHtml, /Phường \/ Xã/)
      assert.match(fieldsHtml, /Số nhà, tên đường/)
      assert.match(fieldsHtml, /Địa chỉ đầy đủ:/)
      assert.match(fieldsHtml, /99 Trần Hưng Đạo/)

      const legacyHtml = renderToString(
        createElement(FacilityAddressFields, {
          province: '',
          district: '',
          street: '100 Pasteur',
          legacyProvince: 'TP.HCM cũ',
          legacyDistrict: 'Quận 1',
          onChange: () => {},
        }),
      )
      assert.match(legacyHtml, /Dữ liệu cũ:.*TP\.HCM cũ/)
      assert.match(legacyHtml, /Dữ liệu cũ:.*Quận 1/)

      const dialogHtml = renderToString(
        createElement(FacilityFormDialog, {
          facility: {
            id: 'fac-1',
            name: 'Sân Cầu Lông Demo',
            address: `99 Trần Hưng Đạo, ${sampleHcmWard}, ${hcm}`,
            province: hcm,
            district: sampleHcmWard,
            latitude: 10.77,
            longitude: 106.69,
            images: [],
            amenityIds: [],
            amenities: [],
          },
          onClose: () => {},
          onDone: () => {},
        }),
      )
      assert.match(dialogHtml, /Chỉnh sửa cơ sở/)
      assert.match(dialogHtml, /Tỉnh \/ Thành phố/)
      assert.match(dialogHtml, /Phường \/ Xã/)
      assert.match(dialogHtml, /Số nhà, tên đường/)
      assert.doesNotMatch(dialogHtml, />\s*(Active|Inactive|Pending|Confirmed|Completed|Draft|Court Owner|Verified|Select|Showing)\s*</)
    })
  } finally {
    await server.close()
  }
})
