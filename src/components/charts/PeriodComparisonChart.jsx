import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Biểu đồ đường: số đơn cộng dồn theo ngày của kỳ trước và kỳ này (dữ liệu từ utils/periodCompare.js).
const COMPARE_COLORS ={ previous: '#94a3b8', current: '#15803d' }

const number = (value) => Number(value || 0).toLocaleString('vi-VN')

export default function PeriodComparisonChart({ rows, previousLabel, currentLabel, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
        <CartesianGrid stroke="#e5ece8" strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} interval="preserveStartEnd" minTickGap={14} tickFormatter={(day) => `N${day}`} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          labelFormatter={(day) => `Ngày thứ ${day} của kỳ`}
          formatter={(value, name) => [`${number(value)} đơn`, name]}
          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12.5 }}
        />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12.5, paddingTop: 6 }} />
        <Line type="monotone" dataKey="previous" name={previousLabel} stroke={COMPARE_COLORS.previous} strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="current" name={currentLabel} stroke={COMPARE_COLORS.current} strokeWidth={3} dot={false} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
