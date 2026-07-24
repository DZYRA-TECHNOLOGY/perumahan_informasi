import { useEffect, useState } from 'react'
import { supabase, isSupabaseReady } from '../lib/supabase.js'
import CrudTable from './CrudTable.jsx'
import LeafletMap from './LeafletMap.jsx'
import * as local from '../data/siteplan.js'

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

/* ---------------- Login ---------------- */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setErr(error.message)
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="card p-7">
        <div className="mb-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-black text-white">S</div>
          <h2 className="mt-4 text-2xl font-bold">Login Pengurus</h2>
          <p className="mt-1 muted text-sm">Masuk untuk mengelola data warga Cluster Sigerland.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Email</span>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Password</span>
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button disabled={busy} className="btn-orange w-full">{busy ? 'Memproses…' : 'Masuk'}</button>
        </form>
        <p className="mt-4 text-xs muted">Akun dibuat di Supabase → Authentication → Users (centang Auto Confirm).</p>
      </div>
    </div>
  )
}

/* ---------------- Overview ---------------- */
function Overview() {
  // Selalu tampilkan data ASLI dari database (kosong = kosong), bukan data contoh.
  const [d, setD] = useState({ kas: [], transaksi: [], usaha: [], agenda: [] })
  useEffect(() => {
    if (!supabase) return
    ;(async () => {
      const t = async (n) => (await supabase.from(n).select('*')).data ?? []
      setD({
        kas: await t('kas'),
        transaksi: await t('transaksi'),
        usaha: await t('usaha'),
        agenda: await t('agenda'),
      })
    })()
  }, [])
  const totalKas = d.kas.reduce((s, k) => s + Number(k.saldo || 0), 0)
  const masuk = d.transaksi.filter((x) => x.tipe === 'masuk').reduce((s, x) => s + Number(x.nominal || 0), 0)
  const keluar = d.transaksi.filter((x) => x.tipe === 'keluar').reduce((s, x) => s + Number(x.nominal || 0), 0)
  const stats = [
    { l: 'Total Saldo Kas', v: rp(totalKas), c: 'text-emerald-600' },
    { l: 'Total Pemasukan', v: rp(masuk), c: 'text-orange-400' },
    { l: 'Total Pengeluaran', v: rp(keluar), c: 'text-rose-600' },
    { l: 'Usaha Warga', v: d.usaha.length, c: 'text-orange-500' },
  ]
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Ringkasan</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card p-5">
            <p className="text-sm muted">{s.l}</p>
            <p className={`mt-1 text-2xl font-extrabold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 card p-5">
        <p className="font-semibold">Agenda terdekat</p>
        <ul className="mt-3 space-y-2 text-sm">
          {d.agenda.slice(0, 5).map((a, i) => (
            <li key={i} className="flex justify-between border-b border-white/5 pb-2">
              <span>{a.judul}</span><span className="muted">{a.tgl}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------- Pengaturan Lokasi / Peta ---------------- */
function LokasiForm({ onChanged }) {
  const [f, setF] = useState(local.lokasi)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.from('pengaturan').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => { if (data) setF(data) })
  }, [])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    const payload = {
      id: 1,
      lat: Number(f.lat), lng: Number(f.lng), zoom: Number(f.zoom || 16),
      label: f.label || '', alamat: f.alamat || '', embed: f.embed || '',
    }
    const { error } = await supabase.from('pengaturan').upsert(payload)
    setBusy(false)
    if (error) setMsg('Gagal: ' + error.message)
    else { setMsg('Tersimpan ✓'); onChanged?.() }
  }

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold">Lokasi & Peta</h3>
      <p className="mb-5 text-sm muted">
        Atur titik peta yang tampil di beranda. Isi koordinat (lat/lng) — cari di Google Maps,
        klik kanan lokasi → angka pertama = latitude, kedua = longitude.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="card space-y-3 p-5">
          <div className="grid grid-cols-3 gap-3">
            <label className="block"><span className="mb-1 block text-xs font-medium muted">Latitude</span>
              <input className="field" type="number" step="any" value={f.lat ?? ''} onChange={set('lat')} required /></label>
            <label className="block"><span className="mb-1 block text-xs font-medium muted">Longitude</span>
              <input className="field" type="number" step="any" value={f.lng ?? ''} onChange={set('lng')} required /></label>
            <label className="block"><span className="mb-1 block text-xs font-medium muted">Zoom</span>
              <input className="field" type="number" min="1" max="20" value={f.zoom ?? 16} onChange={set('zoom')} /></label>
          </div>
          <label className="block"><span className="mb-1 block text-xs font-medium muted">Label</span>
            <input className="field" value={f.label ?? ''} onChange={set('label')} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium muted">Alamat</span>
            <input className="field" value={f.alamat ?? ''} onChange={set('alamat')} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium muted">Embed URL (opsional — dari Google Maps "Sematkan peta")</span>
            <input className="field" value={f.embed ?? ''} onChange={set('embed')} placeholder="Kosongkan untuk pakai koordinat" /></label>
          <div className="flex items-center gap-3 pt-1">
            <button disabled={busy} className="btn-orange">{busy ? 'Menyimpan…' : 'Simpan Lokasi'}</button>
            {msg && <span className={`text-sm ${msg.startsWith('Gagal') ? 'text-rose-400' : 'text-emerald-400'}`}>{msg}</span>}
          </div>
        </form>
        <div>
          <p className="mb-2 text-sm font-medium muted">Pilih lokasi — klik atau geser pin di peta</p>
          <LeafletMap
            lat={Number(f.lat) || -5.3581}
            lng={Number(f.lng) || 105.3149}
            zoom={Number(f.zoom) || 16}
            height={320}
            onPick={(la, ln) => setF((prev) => ({ ...prev, lat: la.toFixed(6), lng: ln.toFixed(6) }))}
          />
          <p className="mt-2 text-xs muted">Koordinat terpilih otomatis terisi di form kiri, lalu klik Simpan.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Dashboard shell ---------------- */
const MENU = [
  { key: 'ringkasan', label: 'Ringkasan', icon: '📊' },
  { key: 'transaksi', label: 'Transaksi Kas', icon: '💸' },
  { key: 'kas', label: 'Saldo Kas', icon: '🏦' },
  { key: 'iuran', label: 'Iuran', icon: '🧾' },
  { key: 'agenda', label: 'Agenda', icon: '📅' },
  { key: 'usaha', label: 'Usaha Warga', icon: '🏪' },
  { key: 'pengumuman', label: 'Pengumuman', icon: '📢' },
  { key: 'data_warga', label: 'Data Warga', icon: '👥' },
  { key: 'keuangan', label: 'Rekap Keuangan', icon: '📒' },
  { key: 'iuran_air', label: 'Iuran Air', icon: '💧' },
  { key: 'banjir_kontribusi', label: 'Dana Banjir (Masuk)', icon: '🌊' },
  { key: 'banjir_pengeluaran', label: 'Dana Banjir (Keluar)', icon: '🧾' },
  { key: 'struktur', label: 'Struktur Organisasi', icon: '🏛️' },
  { key: 'lokasi', label: 'Lokasi & Peta', icon: '🗺️' },
  { key: 'masukan', label: 'Kotak Masukan', icon: '📥' },
]

const PANELS = {
  transaksi: {
    title: 'Transaksi Kas', table: 'transaksi', fallback: local.transaksi,
    fields: [
      { name: 'tgl', label: 'Tanggal', type: 'date' },
      { name: 'ket', label: 'Keterangan' },
      { name: 'tipe', label: 'Tipe', options: ['masuk', 'keluar'] },
      { name: 'nominal', label: 'Nominal', type: 'number', money: true },
    ],
  },
  kas: {
    title: 'Saldo Kas', table: 'kas', fallback: local.kas,
    fields: [
      { name: 'nama', label: 'Nama Kas' },
      { name: 'saldo', label: 'Saldo', type: 'number', money: true },
    ],
  },
  iuran: {
    title: 'Iuran', table: 'iuran', fallback: local.iuran,
    fields: [
      { name: 'jenis', label: 'Jenis' },
      { name: 'nominal', label: 'Nominal', type: 'number', money: true },
      { name: 'periode', label: 'Periode', options: ['per bulan', 'per tahun', 'sekali'] },
    ],
  },
  agenda: {
    title: 'Agenda', table: 'agenda', fallback: local.agenda,
    fields: [
      { name: 'tgl', label: 'Tanggal', type: 'date' },
      { name: 'judul', label: 'Judul' },
      { name: 'kategori', label: 'Kategori', options: ['Kebersihan', 'Rapat', 'Kegiatan', 'Keamanan'] },
      { name: 'foto', label: 'Foto (opsional)', type: 'image', optional: true },
    ],
  },
  usaha: {
    title: 'Usaha Warga', table: 'usaha', fallback: local.usahaWarga,
    fields: [
      { name: 'nama', label: 'Nama Usaha' },
      { name: 'kategori', label: 'Kategori' },
      { name: 'blok', label: 'Blok' },
      { name: 'harga', label: 'Harga', type: 'number', money: true },
      { name: 'wa', label: 'No. WhatsApp' },
      { name: 'foto', label: 'Foto usaha', type: 'image', optional: true },
      { name: 'desc', label: 'Deskripsi' },
    ],
  },
  pengumuman: {
    title: 'Pengumuman', table: 'pengumuman', fallback: local.pengumuman,
    fields: [
      { name: 'tgl', label: 'Tanggal', type: 'date' },
      { name: 'judul', label: 'Judul' },
      { name: 'isi', label: 'Isi' },
      { name: 'tag', label: 'Kategori', options: ['Keamanan', 'Kesehatan', 'Keuangan', 'Umum'] },
      { name: 'foto', label: 'Foto (opsional)', type: 'image', optional: true },
    ],
  },
  data_warga: {
    title: 'Data Kavling & Warga', table: 'data_warga', fallback: local.dataWarga,
    fields: [
      { name: 'blok', label: 'Blok' },
      { name: 'pemilik', label: 'Nama Pemilik' },
      { name: 'penghuni', label: 'Penghuni Saat Ini' },
      { name: 'ket', label: 'Keterangan', options: ['Dihuni', 'Dikontrakkan', 'Kosong'] },
    ],
  },
  keuangan: {
    title: 'Rekap Keuangan', table: 'keuangan', fallback: local.keuanganRows,
    fields: [
      { name: 'periode', label: 'Periode', options: ['Periode 1', 'Periode 2', 'Periode 3', 'Periode 4'] },
      { name: 'tgl', label: 'Tanggal' },
      { name: 'blok', label: 'Blok', optional: true },
      { name: 'masuk', label: 'Iuran (Masuk)', type: 'number', money: true },
      { name: 'keluar', label: 'Dana Keluar', type: 'number', money: true },
      { name: 'ket', label: 'Keterangan', optional: true },
    ],
  },
  iuran_air: {
    title: 'Iuran Air', table: 'iuran_air', fallback: local.iuranAir,
    fields: [
      { name: 'blok', label: 'Blok' },
      { name: 'penghuni', label: 'Penghuni' },
      { name: 'periode', label: 'Periode' },
      { name: 'tagihan', label: 'Tagihan', type: 'number', money: true },
      { name: 'status', label: 'Status', options: ['Lunas', 'Belum Bayar'] },
    ],
  },
  banjir_kontribusi: {
    title: 'Dana Banjir — Kontribusi', table: 'banjir_kontribusi', fallback: local.banjirKontribusi,
    fields: [
      { name: 'blok', label: 'Blok' },
      { name: 'nama', label: 'Nama' },
      { name: 'jul', label: 'Juli', type: 'number', optional: true },
      { name: 'ags', label: 'Agustus', type: 'number', optional: true },
      { name: 'sep', label: 'September', type: 'number', optional: true },
      { name: 'okt', label: 'Oktober', type: 'number', optional: true },
      { name: 'nov', label: 'November', type: 'number', optional: true },
      { name: 'des', label: 'Desember', type: 'number', optional: true },
    ],
  },
  banjir_pengeluaran: {
    title: 'Dana Banjir — Pengeluaran', table: 'banjir_pengeluaran', fallback: local.banjirPengeluaran,
    fields: [
      { name: 'tgl', label: 'Tanggal', type: 'date' },
      { name: 'ket', label: 'Keterangan / Tahapan' },
      { name: 'persen', label: 'Persentase (%)', type: 'number' },
      { name: 'nominal', label: 'Nominal', type: 'number', money: true },
    ],
  },
  struktur: {
    title: 'Struktur Organisasi', table: 'struktur', fallback: local.struktur,
    fields: [
      { name: 'urutan', label: 'Urutan (1 = pimpinan)', type: 'number' },
      { name: 'jabatan', label: 'Jabatan' },
      { name: 'nama', label: 'Nama' },
      { name: 'icon', label: 'Ikon (emoji)', optional: true },
    ],
  },
  masukan: {
    title: 'Kotak Masukan Warga', table: 'masukan', fallback: [],
    fields: [
      { name: 'nama', label: 'Nama' },
      { name: 'blok', label: 'Blok' },
      { name: 'saran', label: 'Saran', optional: true },
      { name: 'masukan', label: 'Masukan' },
      { name: 'foto', label: 'Foto', type: 'image', optional: true },
    ],
  },
}

export default function Admin({ onChanged }) {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('ringkasan')

  useEffect(() => {
    if (!supabase) { setReady(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!isSupabaseReady) {
    return (
      <div className="mx-auto max-w-lg card p-6 text-center">
        <p>Supabase belum dikonfigurasi.</p>
        <p className="mt-1 text-sm muted">Isi <code>.env</code> untuk mengaktifkan panel admin.</p>
      </div>
    )
  }
  if (!ready) return <p className="text-center muted">Memuat…</p>
  if (!session) return <Login />

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="md:sticky md:top-24 md:h-fit">
        <div className="card p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide muted">Menu</p>
          <nav className="space-y-1">
            {MENU.map((m) => (
              <button key={m.key} onClick={() => setTab(m.key)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  tab === m.key ? 'bg-orange-500 text-white' : 'text-zinc-200 hover:bg-white/5'}`}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="btn-outline mt-3 w-full text-sm">Keluar</button>
      </aside>

      {/* Content */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Panel Pengurus</h2>
            <p className="text-sm muted">{session.user.email}</p>
          </div>
        </div>
        {tab === 'ringkasan' ? <Overview /> : tab === 'lokasi' ? (
          <LokasiForm onChanged={onChanged} />
        ) : (
          <CrudTable key={tab} {...PANELS[tab]} onChanged={onChanged} />
        )}
      </section>
    </div>
  )
}
