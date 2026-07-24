// Donut chart sederhana pakai SVG (tanpa library).
// props: data [{label, value, color}]
export default function Donut({ data = [], size = 180, thickness = 28 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          )
          offset += len
          return el
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            <span className="muted">{d.label}</span>
            <span className="font-semibold">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
