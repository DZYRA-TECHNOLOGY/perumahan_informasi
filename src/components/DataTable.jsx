import { useMemo, useState } from 'react'

// Tabel ringkas: pencarian + pagination supaya tidak terlalu panjang.
// props: columns [{key,label,align,render}], rows, pageSize, searchKeys
export default function DataTable({ columns, rows, pageSize = 10, searchKeys, title }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const keys = searchKeys || columns.map((c) => c.key)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(s)))
  }, [q, rows, keys])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const cur = Math.min(page, pages)
  const slice = filtered.slice((cur - 1) * pageSize, cur * pageSize)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 no-print">
        {title && <h3 className="font-bold">{title}</h3>}
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
          placeholder="Cari…" className="field max-w-xs" />
      </div>

      {/* Versi cetak: semua baris hasil filter */}
      <table className="hidden w-full text-sm print:table">
        <thead><tr>{columns.map((c) => <th key={c.key} className="px-2 py-1 text-left">{c.label}</th>)}</tr></thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className="px-2 py-1">{c.render ? c.render(r, i) : String(r[c.key] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>

      <div className="card overflow-x-auto print:hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slice.length === 0 && <tr><td className="px-4 py-6 muted" colSpan={columns.length}>Tidak ada data.</td></tr>}
            {slice.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''}`}>
                    {c.render ? c.render(r, (cur - 1) * pageSize + i) : String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm no-print">
        <span className="muted">{filtered.length} data · hal {cur}/{pages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={cur <= 1}
            className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40">‹ Prev</button>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={cur >= pages}
            className="btn-outline px-3 py-1.5 text-sm disabled:opacity-40">Next ›</button>
        </div>
      </div>
    </div>
  )
}
