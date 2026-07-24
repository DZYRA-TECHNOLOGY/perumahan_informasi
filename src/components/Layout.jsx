import { useEffect, useState, useRef } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useData } from '../lib/useData.js'
import { profil, statistik, kontak } from '../data/siteplan.js'

const MENU = [
  { label: 'Beranda', to: '/', end: true },
  {
    label: 'Menu Warga', items: [
      { to: '/data-warga', label: 'Data Kavling & Warga' },
      { to: '/struktur', label: 'Struktur Organisasi' },
      { to: '/siteplan', label: 'Siteplan & Peta' },
    ],
  },
  {
    label: 'Keuangan', items: [
      { to: '/kas', label: 'Saldo Kas & Transaksi' },
      { to: '/keuangan', label: 'Rekap Laporan Keuangan' },
      { to: '/iuran', label: 'Iuran Warga' },
      { to: '/iuran-air', label: 'Iuran Air' },
      { to: '/banjir', label: 'Dana Banjir' },
    ],
  },
  {
    label: 'Layanan', items: [
      { to: '/usaha', label: 'Usaha Warga' },
      { to: '/hunian', label: 'Hunian Tersedia' },
      { to: '/masukan', label: 'Masukan & Saran' },
    ],
  },
  {
    label: 'Kegiatan', items: [
      { to: '/warga', label: 'Agenda & Voting' },
      { to: '/galeri', label: 'Galeri Kegiatan' },
    ],
  },
]

function Dropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const on = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', on)
    return () => document.removeEventListener('mousedown', on)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="link-nav flex items-center gap-1">
        {label} <span className="text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl bg-[#17171b] p-1 shadow-2xl ring-1 ring-white/10">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} onClick={() => { setOpen(false); onNavigate?.() }}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-orange-500/15 text-orange-400' : 'text-zinc-200 hover:bg-white/5'}`}>
              {it.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const data = useData()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => { data.reload() }, [loc.pathname]) // eslint-disable-line
  useEffect(() => { setOpen(false) }, [loc.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0d10]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 font-black text-white">S</div>
            <div>
              <p className="font-extrabold leading-tight tracking-tight"><span className="text-white">Siger</span><span className="text-orange-500">land</span></p>
              <p className="text-[11px] muted">Portal Transparansi Warga</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {MENU.map((m) => m.items
              ? <Dropdown key={m.label} label={m.label} items={m.items} />
              : <NavLink key={m.label} to={m.to} end={m.end} className={({ isActive }) => `link-nav ${isActive ? 'text-orange-400' : ''}`}>{m.label}</NavLink>
            )}
            <Link to="/admin" className="btn-orange text-sm">Login Pengurus</Link>
          </nav>

          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 ring-1 ring-white/15 lg:hidden" aria-label="Menu">
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-white/10 bg-[#0d0d10] lg:hidden">
            <nav className="mx-auto max-w-6xl px-4 py-3">
              {MENU.map((m) => m.items ? (
                <div key={m.label} className="py-1">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide muted">{m.label}</p>
                  {m.items.map((it) => (
                    <NavLink key={it.to} to={it.to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-orange-500/15 text-orange-400' : 'text-zinc-200 hover:bg-white/5'}`}>{it.label}</NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={m.label} to={m.to} end={m.end} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-orange-500/15 text-orange-400' : 'text-zinc-200 hover:bg-white/5'}`}>{m.label}</NavLink>
              ))}
              <Link to="/admin" className="btn-orange mt-3 w-full text-sm">Login Pengurus</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div key={loc.pathname} className="animate-[fadeIn_.25s_ease]">
          <Outlet context={data} />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0c]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-sm">
              <p className="text-lg font-extrabold"><span className="text-white">Siger</span><span className="text-orange-500">land</span></p>
              <p className="mt-1 text-sm muted">{kontak.alamat}</p>
              <p className="mt-1 text-sm muted">Ketua RT: {kontak.ketuaRT}</p>
            </div>
            <div className="flex gap-8">
              {[['Pengunjung', statistik.pengunjung], ['Warga aktif', statistik.wargaAktif], ['Usaha', statistik.usaha]].map(([l, v]) => (
                <div key={l}><p className="text-2xl font-extrabold text-orange-500">{v}</p><p className="text-xs muted">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-center text-xs muted sm:flex-row">
            <p>© 2026 {profil.nama} — {profil.tagline}.</p>
            <p>Sumber data: {data.source === 'supabase' ? 'Supabase (live)' : 'data lokal (demo)'} · Update {statistik.updateTerakhir}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
