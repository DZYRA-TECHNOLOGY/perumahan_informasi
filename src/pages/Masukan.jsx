import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PageHero, Container } from '../components/ui.jsx'
import { supabase } from '../lib/supabase.js'

export default function Masukan() {
  const { dataWarga } = useOutletContext()
  const [form, setForm] = useState({ nama: '', blok: '', saran: '', masukan: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    // Validasi ringan anti-spam.
    if (form.masukan.trim().length < 5) { setErr('Masukan terlalu pendek.'); return }
    if (form.masukan.length > 1000 || form.nama.length > 100) { setErr('Teks terlalu panjang.'); return }
    setBusy(true); setErr('')
    if (!supabase) { setDone(true); setBusy(false); return }
    const { error } = await supabase.from('masukan').insert({
      nama: form.nama.trim(), blok: form.blok, saran: form.saran.trim(), masukan: form.masukan.trim(),
    })
    setBusy(false)
    if (error) {
      setErr(error.message.includes('masukan')
        ? 'Fitur belum aktif — pengurus perlu menjalankan setup.sql (tabel "masukan").'
        : 'Gagal mengirim: ' + error.message)
    } else { setDone(true); setForm({ nama: '', blok: '', saran: '', masukan: '' }) }
  }

  const blokOptions = [...new Set(dataWarga.map((w) => w.blok))].slice(0, 80)

  return (
    <div>
      <PageHero kicker="Partisipasi" title="Kotak Masukan & Saran"
        desc="Suara Anda berarti bagi kemajuan lingkungan. Bagikan ide, aspirasi, atau masukan di sini." />
      <Container>
        <div className="mx-auto max-w-xl card p-6 sm:p-8">
          {done ? (
            <div className="text-center">
              <div className="text-5xl">✅</div>
              <h3 className="mt-3 text-xl font-bold">Terima kasih!</h3>
              <p className="mt-1 muted">Masukan Anda sudah kami terima.</p>
              <button onClick={() => setDone(false)} className="btn-orange mt-5">Kirim lagi</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block"><span className="mb-1 block text-sm font-medium">Nama</span>
                <input className="field" value={form.nama} onChange={set('nama')} maxLength={100} required /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium">Blok</span>
                <select className="field" value={form.blok} onChange={set('blok')} required>
                  <option value="" disabled>Pilih blok…</option>
                  {blokOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select></label>
              <label className="block"><span className="mb-1 block text-sm font-medium">Saran</span>
                <textarea className="field" rows={2} maxLength={1000} value={form.saran} onChange={set('saran')} /></label>
              <label className="block"><span className="mb-1 block text-sm font-medium">Masukan</span>
                <textarea className="field" rows={3} maxLength={1000} value={form.masukan} onChange={set('masukan')} required /></label>
              {err && <p className="text-sm text-rose-400">{err}</p>}
              <button disabled={busy} className="btn-orange w-full">{busy ? 'Mengirim…' : 'Kirim Masukan'}</button>
              <p className="text-center text-xs muted">Masukan dikirim anonim ke pengurus. Mohon gunakan bahasa yang sopan.</p>
            </form>
          )}
        </div>
      </Container>
    </div>
  )
}
