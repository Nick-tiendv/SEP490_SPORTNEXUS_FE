import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Biểu đồ cột ngang xếp hạng (số đơn theo sân / theo cơ sở). items: [{ name, value, hint? }]
const PALETTE = ['#15803d', '#0d9488', '#0284c7', '#7c3aed', '#d97706', '#e11d48']
const ROW_HEIGHT = 34

const number = (value) => Number(value || 0).toLocaleString('vi-VN')
const shorten = (text, max = 18) => (String(text).length > max ? `${String(text).slice(0, max - 1)}…` : String(text))

export default function RankBarChart({ items, unit = 'đơn', valueLabel = 'Số đơn' }) {
  const height = Math.max(160, items.length * ROW_HEIGHT + 24)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={items} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }} barCategoryGap={8}>
        <CartesianGrid stroke="#eef2f0" strokeDasharray="3 4" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={124} tick={{ fontSize: 12, fill: '#1e293b' }} tickLine={false} axisLine={false} tickFormatter={(name) => shorten(name)} />
        <Tooltip
          cursor={{ fill: 'rgba(21, 128, 61, 0.06)' }}
          formatter={(value, _name, entry) => [`${number(value)} ${unit}`, entry?.payload?.hint ? `${valueLabel} · ${entry.payload.hint}` : valueLabel]}
          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12.5 }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
          {items.map((item, index) => <Cell key={item.name + index} fill={PALETTE[index % PALETTE.length]} />)}
          <LabelList dataKey="value" position="right" formatter={number} style={{ fontSize: 12, fontWeight: 700, fill: '#0f172a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
