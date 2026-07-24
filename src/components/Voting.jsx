import { useState } from 'react'
import { voting } from '../data/siteplan.js'

export default function Voting() {
  const [opsi, setOpsi] = useState(voting.opsi)
  const [voted, setVoted] = useState(null)
  const total = opsi.reduce((s, o) => s + o.suara, 0)

  const pilih = (i) => {
    if (voted !== null) return
    setOpsi((prev) => prev.map((o, idx) => (idx === i ? { ...o, suara: o.suara + 1 } : o)))
    setVoted(i)
  }

  return (
    <div className="card p-6">
      <p className="text-sm font-semibold text-orange-500">POLLING WARGA</p>
      <h3 className="mt-1 text-xl font-bold">{voting.pertanyaan}</h3>
      <div className="mt-5 space-y-3">
        {opsi.map((o, i) => {
          const pct = total ? Math.round((o.suara / total) * 100) : 0
          const active = voted === i
          return (
            <button key={i} onClick={() => pilih(i)} disabled={voted !== null}
              className={`relative block w-full overflow-hidden rounded-xl p-3 text-left ring-1 transition ${
                active ? 'ring-orange-500' : 'ring-white/10'} ${voted === null ? 'hover:ring-orange-500/60' : ''}`}>
              <div className="absolute inset-y-0 left-0 bg-orange-500/20" style={{ width: `${voted !== null ? pct : 0}%` }} />
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium">{o.teks}</span>
                {voted !== null && <span className="text-sm font-bold text-orange-400">{pct}%</span>}
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs muted">
        {voted !== null ? `Terima kasih! Total ${total} suara.` : 'Klik salah satu untuk memberi suara.'}
      </p>
    </div>
  )
}
