// Cóc mascot theo môn: chung 1 bộ khung (đầu, thân, chân, tay cùng tọa độ), mỗi môn 1 "bộ đồ" (kit).
// Bản gốc từng con: public/mascot/toad-*.svg. Chân trái/phải, tay trái/phải, vật dưới chân tách riêng để
// animation bằng CSS (mascot.css); vật cầm tay nằm trong nhóm tay phải nên vung theo tay.
const GREEN = '#8aa83f'
const GREEN_DARK = '#7d9a38'
const PINK = '#f06292'
const HOT = '#ec407a'
const NAVY = '#1d3557'

const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step)

// ---------- Áo + quần ----------
const Shorts = ({ fill = NAVY }) => (
  <>
    <path d="M58 176 Q110 192 162 176 L166 196 Q138 204 112 198 Q84 204 54 196 Z" fill={fill} stroke="#0f2238" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M110 188 L110 198" stroke="#0f2238" strokeWidth="2" />
  </>
)
// Áo cổ tròn có số (bóng đá, pickleball)
const CrewShirt = ({ color, number }) => (
  <>
    <path d="M62 120 Q110 106 158 120 L164 178 Q110 192 56 178 Z" fill={color} />
    <path d="M62 120 Q110 106 158 120 L156 130 Q110 118 64 130 Z" fill="#fff" />
    <path d="M94 112 Q110 126 126 112" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <text className="snx-m-number" x="110" y="162" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="800" fill="#fff">{number}</text>
  </>
)
// Áo polo (cầu lông, tennis)
const PoloShirt = ({ color, stroke }) => (
  <>
    <path d="M62 120 Q110 106 158 120 L164 178 Q110 192 56 178 Z" fill={color} stroke={stroke} strokeWidth={stroke ? 1.5 : undefined} />
    <path d="M92 110 L110 134 L128 110 L120 106 L110 118 L100 106 Z" fill="#fff" stroke={HOT} strokeWidth="2" />
    <path d="M110 134 L110 156" stroke={HOT} strokeWidth="2" />
    <circle cx="110" cy="142" r="1.6" fill={HOT} />
    <circle cx="110" cy="150" r="1.6" fill={HOT} />
    <circle cx="138" cy="146" r="5" fill={HOT} />
  </>
)
// Áo ba lỗ + quần dài (bóng rổ)
const TankKit = () => (
  <>
    <path d="M72 114 Q110 106 148 114 Q140 138 162 152 L164 178 Q110 192 56 178 L58 152 Q80 138 72 114 Z" fill={PINK} />
    <path d="M72 114 Q110 106 148 114 Q110 128 72 114 Z" fill="#fff" />
    <path d="M72 114 Q80 138 58 152 M148 114 Q140 138 162 152" fill="none" stroke="#fff" strokeWidth="4" />
    <text className="snx-m-number" x="110" y="164" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="28" fontWeight="800" fill="#fff">23</text>
    <path d="M54 176 Q110 192 166 176 L174 208 L116 206 L110 198 L104 206 L46 208 Z" fill={NAVY} stroke="#0f2238" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M110 188 L110 198" stroke="#0f2238" strokeWidth="2" />
    <path d="M56 182 L50 205 M164 182 L170 205" stroke={PINK} strokeWidth="4" strokeLinecap="round" />
  </>
)

// ---------- Mũ / băng đô ----------
const Cap = ({ color }) => (
  <>
    <path d="M86 44 Q110 14 134 44 Z" fill={color} />
    <path d="M84 44 Q110 52 150 44 Q150 40 136 40 L86 40 Z" fill={color} stroke="#fff" strokeWidth="1.5" />
  </>
)
const Headband = ({ color }) => (
  <>
    <path d="M52 72 Q110 84 168 72" fill="none" stroke={color} strokeWidth="9" />
    <path d="M52 76 Q110 88 168 76" fill="none" stroke="#fff" strokeWidth="2" opacity=".8" />
  </>
)

// ---------- Vật cầm tay (tâm tại bàn tay phải 180,168) ----------
const BadmintonRacket = () => (
  <g transform="translate(180 168) rotate(20)">
    <rect x="-3" y="-38" width="6" height="38" rx="3" fill="#455a64" />
    <path d="M-3 -34 L-14 -48 M3 -34 L14 -48" stroke="#90a4ae" strokeWidth="3" />
    <ellipse cx="0" cy="-64" rx="17" ry="25" fill="#fff" fillOpacity=".35" stroke={HOT} strokeWidth="5" />
    <path d={[...range(-14, 14, 4).map((x) => `M${x} -88 V-36`), ...range(-82, -33, 7).map((y) => `M-16 ${y} H16`)].join(' ')} stroke="#cfd8dc" strokeWidth="1" />
    <rect x="-3.5" y="-30" width="7" height="22" rx="3" fill={HOT} />
  </g>
)
const TennisRacket = () => (
  <g transform="translate(180 168) rotate(20)">
    <rect x="-3.5" y="-40" width="7" height="40" rx="3" fill="#37474f" />
    <path d="M-3 -36 L-12 -46 M3 -36 L12 -46" stroke="#90a4ae" strokeWidth="3" />
    <ellipse cx="0" cy="-66" rx="21" ry="27" fill="#8bc34a" fillOpacity=".35" stroke={HOT} strokeWidth="5" />
    <path d={[...range(-16, 16, 4).map((x) => `M${x} -92 V-38`), ...range(-88, -40, 6).map((y) => `M-18 ${y} H18`)].join(' ')} stroke="#fff" strokeWidth="1" opacity=".9" />
    <rect x="-4" y="-30" width="8" height="24" rx="3" fill={HOT} />
  </g>
)
const Paddle = () => (
  <g transform="translate(180 168) rotate(18)">
    <rect x="-4" y="-40" width="8" height="40" rx="3" fill="#37474f" />
    <rect x="-22" y="-100" width="44" height="64" rx="18" fill="#26c6da" stroke={NAVY} strokeWidth="4" />
    <rect x="-16" y="-94" width="32" height="52" rx="13" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
    <circle cx="0" cy="-68" r="7" fill={PINK} stroke="#fff" strokeWidth="2" />
  </g>
)

// ---------- Vật dưới chân ----------
const SoccerBall = () => (
  <>
    <circle cx="188" cy="214" r="15" fill="#fff" stroke="#263238" strokeWidth="2" />
    <path d="M188 205 L195 210 L192 218 L184 218 L181 210 Z" fill="#263238" />
    <path d="M188 199 L188 205 M195 210 L202 208 M192 218 L197 224 M184 218 L179 224 M181 210 L174 208" stroke="#263238" strokeWidth="2" fill="none" />
  </>
)
const Basketball = () => (
  <>
    <circle cx="198" cy="212" r="16" fill="#f28c28" stroke="#5a2d0c" strokeWidth="2" />
    <path d="M198 196 V228 M182 212 H214 M187 201 Q196 212 187 223 M209 201 Q200 212 209 223" fill="none" stroke="#5a2d0c" strokeWidth="1.8" />
  </>
)
const PickleBall = () => (
  <>
    <circle cx="198" cy="212" r="13" fill="#d4e157" stroke="#9aa62a" strokeWidth="2" />
    {[[198, 204], [190, 209], [206, 209], [193, 217], [203, 217], [198, 212]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="#9aa62a" />)}
  </>
)
const TennisBall = () => (
  <>
    <circle cx="205" cy="212" r="12" fill="#d7e84a" stroke="#9aa62a" strokeWidth="2" />
    <path d="M195 206 Q205 214 195 219 M215 206 Q205 214 215 219" fill="none" stroke="#fff" strokeWidth="2" />
  </>
)
const Shuttle = () => (
  <g transform="translate(198 214) scale(0.28) translate(-60 -110)">
    <path d="M44 84 L22 14 Q60 4 98 14 L76 84 Z" fill="#fff" stroke="#9aa5b1" strokeWidth="5" strokeLinejoin="round" />
    <path d="M22 14 Q60 4 98 14" fill="none" stroke="#e63946" strokeWidth="8" />
    <path d="M30 40 Q60 48 90 40" fill="none" stroke="#e63946" strokeWidth="7" />
    <path d="M44 84 Q44 112 60 112 Q76 112 76 84 Z" fill="#f2d7a6" stroke="#b58a4a" strokeWidth="5" />
  </g>
)

// sock: màu sọc tất (null: không tất); sleeve: [màu tay áo, màu sọc] (null: áo ba lỗ); wrist: màu băng cổ tay
// ground.spin: bóng lăn khi chạy; quả cầu thì nảy
const KITS = {
  football: { outfit: <><CrewShirt color={PINK} number="10" /><Shorts /></>, sock: PINK, sleeve: [PINK, '#fff'], ground: { el: <SoccerBall />, origin: '188px 214px', spin: true } },
  badminton: { outfit: <><PoloShirt color={PINK} /><Shorts fill="#fff" /></>, sock: PINK, sleeve: [PINK, '#fff'], wrist: HOT, top: <Cap color="#ffd54f" />, held: <BadmintonRacket />, ground: { el: <Shuttle />, origin: '198px 214px', spin: false } },
  basketball: { outfit: <TankKit />, wrist: '#fff', band: <Headband color={PINK} />, ground: { el: <Basketball />, origin: '198px 212px', spin: true } },
  pickleball: { outfit: <><CrewShirt color="#ff8a3d" number="7" /><Shorts /></>, sock: PINK, sleeve: ['#ff8a3d', '#fff'], wrist: PINK, band: <Headband color="#26c6da" />, held: <Paddle />, ground: { el: <PickleBall />, origin: '198px 212px', spin: true } },
  tennis: { outfit: <><PoloShirt color="#fff" stroke="#b0bec5" /><Shorts /></>, sock: PINK, sleeve: ['#fff', HOT], wrist: HOT, top: <Cap color={PINK} />, held: <TennisRacket />, ground: { el: <TennisBall />, origin: '205px 212px', spin: true } },
}

const LEG_X = { l: 66, r: 130 }
const SHOES = {
  l: { d: 'M52 214 Q52 199 76 199 L96 202 Q108 206 106 214 Q106 222 78 222 L56 222 Q52 220 52 214 Z', cx: 78, lace: 'M70 204 L82 207 M68 209 L80 212' },
  r: { d: 'M168 214 Q168 199 144 199 L124 202 Q112 206 114 214 Q114 222 142 222 L164 222 Q168 220 168 214 Z', cx: 142, lace: 'M150 204 L138 207 M152 209 L140 212' },
}
const ARMS = {
  l: { arm: 'M64 126 Q36 142 40 164', hand: 40, wristRot: -8, sleeve: 'M68 122 Q50 128 44 146', stripe: 'M35 143 L53 149' },
  r: { arm: 'M156 126 Q184 142 180 164', hand: 180, wristRot: 8, sleeve: 'M152 122 Q170 128 176 146', stripe: 'M167 149 L185 143' },
}

function Leg({ side, sock }) {
  const x = LEG_X[side]
  const shoe = SHOES[side]
  return (
    <g className={`snx-m-leg snx-m-leg--${side}`}>
      <rect x={x} y="176" width="24" height="36" rx="10" fill={GREEN} />
      {sock && (
        <>
          <rect x={x} y="192" width="24" height="12" fill="#f1f1f1" stroke="#cfd8dc" />
          <rect x={x} y="196" width="24" height="4" fill={sock} />
        </>
      )}
      <path d={shoe.d} fill={PINK} />
      <ellipse cx={shoe.cx} cy="222" rx="28" ry="4.5" fill="#fff" stroke="#e0e0e0" />
      <path d={shoe.lace} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

function Sleeve({ side, sleeve }) {
  if (!sleeve) return null
  return (
    <>
      <path d={ARMS[side].sleeve} fill="none" stroke={sleeve[0]} strokeWidth="22" />
      <path d={ARMS[side].stripe} stroke={sleeve[1]} strokeWidth="4" />
    </>
  )
}

function Arm({ side, kit }) {
  const a = ARMS[side]
  return (
    <g className={`snx-m-arm snx-m-arm--${side}`}>
      <path d={a.arm} fill="none" stroke={GREEN} strokeWidth="16" strokeLinecap="round" />
      <circle cx={a.hand} cy="166" r="9" fill={GREEN_DARK} />
      {kit.wrist && <rect x={a.hand - 9} y="152" width="18" height="8" rx="3" fill={kit.wrist} stroke="#fff" strokeWidth="1.5" transform={`rotate(${a.wristRot} ${a.hand} 156)`} />}
      <Sleeve side={side} sleeve={kit.sleeve} />
      {side === 'r' && kit.held && (
        <>
          {kit.held}
          <circle cx="180" cy="166" r="9" fill={GREEN_DARK} />
        </>
      )}
    </g>
  )
}

// sulk: khoanh tay (cất vợt), mắt lim dim, mày nhíu, môi bĩu, có dấu giận
export default function MascotToad({ kit: kitName = 'football', sulk = false }) {
  const kit = KITS[kitName] || KITS.football
  return (
    <svg className="snx-mascot__svg" viewBox="0 0 240 240" aria-hidden="true">
      <ellipse cx="110" cy="230" rx="66" ry="8" fill="#000" opacity="0.15" />
      <Leg side="l" sock={kit.sock} />
      <Leg side="r" sock={kit.sock} />

      <ellipse cx="110" cy="148" rx="56" ry="52" fill={GREEN} />
      {kit.outfit}

      {sulk ? (
        <g>
          <Sleeve side="l" sleeve={kit.sleeve} />
          <Sleeve side="r" sleeve={kit.sleeve} />
          <path d="M56 140 Q70 160 140 150" fill="none" stroke={GREEN} strokeWidth="16" strokeLinecap="round" />
          <path d="M164 140 Q150 166 82 156" fill="none" stroke={GREEN_DARK} strokeWidth="16" strokeLinecap="round" />
        </g>
      ) : (
        <>
          <Arm side="l" kit={kit} />
          <Arm side="r" kit={kit} />
        </>
      )}

      <g className="snx-m-head">
        <ellipse cx="110" cy="88" rx="64" ry="42" fill={GREEN} />
        {kit.band}
        <circle cx="74" cy="56" r="22" fill={GREEN} />
        <circle cx="146" cy="56" r="22" fill={GREEN} />
        <circle cx="74" cy="56" r="15" fill="#fff" />
        <circle cx="146" cy="56" r="15" fill="#fff" />
        {/* Đang dỗi thì liếc sang một bên */}
        <g transform={sulk ? 'translate(-5 2)' : undefined}>
          <circle cx="76" cy="58" r="9" fill="#f4b942" />
          <circle cx="144" cy="58" r="9" fill="#f4b942" />
          <ellipse cx="76" cy="58" rx="5" ry="6.5" fill="#222" />
          <ellipse cx="144" cy="58" rx="5" ry="6.5" fill="#222" />
          <circle cx="73" cy="55" r="2.2" fill="#fff" />
          <circle cx="141" cy="55" r="2.2" fill="#fff" />
        </g>
        {sulk && (
          <>
            <path d="M58 56 A16 16 0 0 1 90 56 Z" fill={GREEN} />
            <path d="M130 56 A16 16 0 0 1 162 56 Z" fill={GREEN} />
          </>
        )}
        <circle cx="101" cy="80" r="2.4" fill="#4d6420" />
        <circle cx="119" cy="80" r="2.4" fill="#4d6420" />
        {sulk ? (
          <path d="M94 106 Q110 94 126 106" fill="none" stroke="#5a1f2a" strokeWidth="5" strokeLinecap="round" />
        ) : (
          <>
            <path d="M62 94 Q110 124 158 94" fill="#5a1f2a" stroke="#4d6420" strokeWidth="3" strokeLinecap="round" />
            <path d="M80 104 Q110 118 140 104 Q110 110 80 104 Z" fill="#ef8a95" />
          </>
        )}
        <ellipse cx="62" cy="92" rx="9" ry="6" fill="#f08a8a" opacity={sulk ? 0.95 : 0.55} />
        <ellipse cx="158" cy="92" rx="9" ry="6" fill="#f08a8a" opacity={sulk ? 0.95 : 0.55} />
        <g fill="#6f8a2f">
          <circle cx="96" cy="66" r="3.6" />
          <circle cx="124" cy="68" r="4" />
          <circle cx="110" cy="58" r="3" />
          <circle cx="52" cy="80" r="3.4" />
          <circle cx="168" cy="80" r="3.4" />
          <circle cx="88" cy="86" r="2.6" />
          <circle cx="132" cy="87" r="2.6" />
        </g>
        {kit.top}
        {sulk && (
          <>
            <path d="M56 30 L90 42 M164 30 L130 42" stroke="#4d6420" strokeWidth="5" strokeLinecap="round" />
            <path className="snx-m-anger" d="M178 14 Q184 22 192 14 M178 36 Q184 28 192 36 M174 18 Q182 25 174 32 M196 18 Q188 25 196 32" stroke="#e53935" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>

      <g className={`snx-m-ball${kit.ground.spin ? '' : ' snx-m-ball--hop'}`} style={{ transformOrigin: kit.ground.origin }}>
        {kit.ground.el}
      </g>
    </svg>
  )
}
