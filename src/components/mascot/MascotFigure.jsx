import MascotToad from './MascotToad.jsx'

// Sprite sheet: mỗi hàng 1 trạng thái; khung chạy bằng background-position + steps()
function Sprite({ asset, action }) {
  const st = asset.states[action] || asset.states.idle
  const cols = Math.max(asset.columns, 2)
  const rows = Math.max(asset.rows, 1)
  return (
    <div
      className="snx-mascot__sprite"
      style={{
        backgroundImage: `url(${asset.src})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPositionY: rows > 1 ? `${(st.row / (rows - 1)) * 100}%` : '0%',
        '--snx-sprite-end': `${(st.frames / (cols - 1)) * 100}%`,
        '--snx-sprite-steps': st.frames,
        '--snx-sprite-dur': `${st.frames / (st.fps || 10)}s`,
      }}
    />
  )
}

// asset lấy từ MASCOT_ASSETS (mascotConfig.js): svg (cóc dựng sẵn theo kit), image hoặc sprite
export default function MascotFigure({ asset, action }) {
  if (asset.type === 'image') return <img className="snx-mascot__img" src={asset.src} alt="" draggable={false} />
  if (asset.type === 'sprite') return <Sprite asset={asset} action={action} />
  return <MascotToad kit={asset.kit} sulk={action === 'sulk'} />
}
