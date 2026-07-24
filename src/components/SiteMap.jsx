import { useState } from 'react'
import { kavlingList, petaBlokMeta, STATUS, rekapStatus } from '../data/siteplan.js'

const rp = (n) => 'Rp ' + n.toLocaleString('id-ID')

export default function SiteMap() {
  const [filter, setFilter] = useState(null)
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter(null)}
          className={`chip ring-1 transition ${!filter ? 'bg-orange-500 text-white ring-orange-500' : 'text-zinc-200 ring-white/15 hover:bg-white/5'}`}>
          Semua ({kavlingList.length})
        </button>
        {Object.entries(STATUS).filter(([k]) => rekapStatus[k]).map(([k, s]) => (
          <button key={k} onClick={() => setFilter(filter === k ? null : k)}
            className={`chip ring-1 transition ${filter === k ? 'bg-orange-500 text-white ring-orange-500' : 'text-zinc-200 ring-white/15 hover:bg-white/5'}`}>
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/20" style={{ background: s.color }} />
            {s.label} ({rekapStatus[k] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {petaBlokMeta.map((b) => {
          const cells = kavlingList.filter((k) => k.blok === b.kode)
          return (
            <div key={b.kode} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-black text-white">{b.kode}</span>
                  <span className="text-sm font-semibold">Blok {b.kode}</span>
                </div>
                <span className="text-xs muted">{b.count} kavling · DP {rp(b.dp)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cells.map((k) => {
                  const s = STATUS[k.status]
                  const dim = filter && filter !== k.status
                  return (
                    <button key={k.id} title={`${k.id} — ${s.label}${k.hook ? ' · Hook +Rp 10 jt' : ''}`}
                      onClick={() => setSelected(k)}
                      className={`relative h-7 w-7 rounded-md text-[9px] font-bold ring-1 ring-black/10 transition hover:scale-110 ${dim ? 'opacity-25' : ''} ${['READY', 'INDENT'].includes(k.status) ? 'text-slate-700' : 'text-white/90'}`}
                      style={{ background: s.color }}>
                      {k.id.replace(k.blok, '')}
                      {k.hook && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400 ring-1 ring-black/20" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-[#17171b] p-6 shadow-2xl ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl ring-1 ring-white/20" style={{ background: STATUS[selected.status].color }} />
              <div>
                <p className="text-lg font-bold">Kavling {selected.id}</p>
                <p className="text-sm muted">Blok {selected.blok}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="muted">Status</dt><dd className="font-medium">{STATUS[selected.status].label}</dd></div>
              <div className="flex justify-between"><dt className="muted">DP</dt><dd className="font-medium">{rp(selected.dp)}</dd></div>
              <div className="flex justify-between"><dt className="muted">Posisi Hook</dt><dd className="font-medium">{selected.hook ? 'Ya (+Rp 10 jt)' : 'Tidak'}</dd></div>
            </dl>
            <button onClick={() => setSelected(null)} className="btn-outline mt-5 w-full">Tutup</button>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs muted">Klik kavling untuk detail. Titik kuning = posisi hook. Warna mengikuti legenda siteplan resmi.</p>
    </div>
  )
}
