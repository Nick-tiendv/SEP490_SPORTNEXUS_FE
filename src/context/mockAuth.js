
export const mockAuthEnabled =
  import.meta.env.DEV === true &&
  import.meta.env.VITE_ALLOW_MOCK_AUTH === 'true'

// Chỉ nhận diện định dạng token mock của backend để test UI.
// Không dùng để xác thực người dùng hoặc cấp quyền backend.
export function isBackendMockToken(token) {
  if (!mockAuthEnabled || typeof token !== 'string') {
    return false
  }

  const parts = token.split('.')

  if (parts.length !== 3) return false

  const [headerPart, payloadPart, signaturePart] = parts

  if (payloadPart !== 'MockPayload') return false

  if (!/^MockSignature_[a-fA-F0-9]{32}$/.test(signaturePart)) {
    return false
  }

  try {
    const header = JSON.parse(
      atob(
        headerPart
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    )

    return header?.typ === 'JWT' && header?.alg === 'HS256'
  } catch {
    return false
  }
}
