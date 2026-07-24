import { useOutletContext } from 'react-router-dom'
import { PageHero, Container, rp, PrintButton, PrintHeader } from '../components/ui.jsx'
import { banjirTarget, BANJIR_BULAN } from '../data/siteplan.js'

const LABEL_BULAN = { jul: 'Jul', ags: 'Ags', sep: 'Sep', okt: 'Okt', nov: 'Nov', des: 'Des' }

export default function Banjir() {
  const { banjirKontribusi, banjirPengeluaran } = useOutletContext()
  const totalPer = (row) => BANJIR_BULAN.reduce((s, b) => s + Number(row[b] || 0), 0)
  const terkumpul = banjirKontribusi.reduce((s, r) => s + totalPer(r), 0)
  const keluar = banjirPengeluaran.reduce((s, x) => s + Number(x.nominal || 0), 0)
  const saldo = terkumpul - keluar
  const persen = Math.min(100, Math.round((terkumpul / banjirTarget) * 100))
  const banjir = { target: banjirTarget, terkumpul, bulan: BANJIR_BULAN, kontribusi: banjirKontribusi, pengeluaran: banjirPengeluaran }

  return (
    <div>
      <PageHero kicker="Program" title="Dana Swadaya Penanggulangan Banjir"
        desc="Rincian dana swadaya warga untuk program penanggulangan banjir." />
      <Container className="space-y-10">
        <PrintHeader title="Dana Swadaya Penanggulangan Banjir" />
        <div className="flex justify-end no-print"><PrintButton /></div>
        {/* Kartu ringkasan */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-zinc-900">
            <p className="text-sm font-medium">TARGET DANA</p>
            <p className="mt-1 text-2xl font-extrabold">{rp(banjir.target)}</p>
            <div className="mt-3 h-2 rounded-full bg-black/20"><div className="h-full rounded-full bg-zinc-900" style={{ width: `${persen}%` }} /></div>
            <p className="mt-1 text-xs">Tercapai {persen}% (sisa {rp(banjir.target - banjir.terkumpul)})</p>
          </div>
          <div className="rounded-2xl bg-emerald-600 p-5 text-white"><p className="text-sm">TOTAL TERKUMPUL</p><p className="mt-1 text-2xl font-extrabold">{rp(banjir.terkumpul)}</p></div>
          <div className="rounded-2xl bg-rose-600 p-5 text-white"><p className="text-sm">TOTAL DANA KELUAR</p><p className="mt-1 text-2xl font-extrabold">{rp(keluar)}</p></div>
          <div className="rounded-2xl bg-blue-600 p-5 text-white"><p className="text-sm">SALDO BERSIH</p><p className="mt-1 text-2xl font-extrabold">{rp(saldo)}</p></div>
        </div>

        {/* Kontribusi bulanan */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Rincian Dana Terkumpul</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left muted">
                <tr>
                  <th className="px-4 py-3 font-medium">No</th><th className="px-4 py-3 font-medium">Blok</th><th className="px-4 py-3 font-medium">Nama</th>
                  {BANJIR_BULAN.map((b) => <th key={b} className="px-4 py-3 text-right font-medium">{LABEL_BULAN[b]}</th>)}
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {banjir.kontribusi.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 muted">{i + 1}</td>
                    <td className="px-4 py-3 uppercase text-orange-400">{r.blok}</td>
                    <td className="px-4 py-3">{r.nama}</td>
                    {BANJIR_BULAN.map((b) => <td key={b} className="px-4 py-3 text-right">{Number(r[b] || 0).toLocaleString('id-ID')}</td>)}
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">{totalPer(r).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pengeluaran */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Rincian Pengeluaran</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left muted">
                <tr><th className="px-4 py-3 font-medium">No</th><th className="px-4 py-3 font-medium">Tanggal</th><th className="px-4 py-3 font-medium">Keterangan / Tahapan</th><th className="px-4 py-3 text-right font-medium">Persentase</th><th className="px-4 py-3 text-right font-medium">Nominal</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {banjir.pengeluaran.length === 0 && <tr><td className="px-4 py-6 muted" colSpan={5}>Belum ada pengeluaran.</td></tr>}
                {banjir.pengeluaran.map((r, i) => (
                  <tr key={i}><td className="px-4 py-3 muted">{i + 1}</td><td className="px-4 py-3">{r.tgl}</td><td className="px-4 py-3">{r.ket}</td><td className="px-4 py-3 text-right">{r.persen}%</td><td className="px-4 py-3 text-right text-rose-400">{rp(r.nominal)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Container>
    </div>
  )
}
