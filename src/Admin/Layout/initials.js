// Chữ cái viết tắt từ họ tên (2 từ cuối) cho avatar.
export const initialsOf = name => String(name || '?').split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join('').toUpperCase()
