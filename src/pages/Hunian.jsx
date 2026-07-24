import { PageHero, Container, rp, Cover } from '../components/ui.jsx'
import { hunianTersedia, hunian, blok } from '../data/siteplan.js'

const RUMAH_FOTO = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop',
]

export default function Hunian() {
  const totalRumah = blok.reduce((s, b) => s + b.jumlah, 0)
  return (
    <div>
      <PageHero kicker="Hunian" title="Hunian & Kavling"
        desc="Rumah yang dikontrakkan atau dijual di dalam cluster, serta rekap hunian per blok." />
      <Container className="space-y-14">
        {/* Kartu hunian tersedia */}
        <section>
          <h2 className="mb-5 text-xl font-bold">Tersedia Sekarang</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {hunianTersedia.map((h, i) => (
              <div key={i} className="card-white overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Cover foto={h.foto || RUMAH_FOTO[i % RUMAH_FOTO.length]} emoji={h.emoji} warna={h.warna} className="h-full w-full" />
                  <span className="absolute left-3 top-3 chip bg-white/90 text-zinc-900">{h.tipe}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold leading-tight">{h.judul}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{h.kt} KT · {h.km} KM</p>
                  <p className="mt-2"><span className="text-lg font-extrabold text-orange-600">{rp(h.harga)}</span><span className="text-zinc-500">{h.satuan}</span></p>
                  <a href="https://wa.me/6281200000000" target="_blank" rel="noreferrer" className="btn-green mt-3 w-full">Hubungi</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rekap per blok */}
        <section>
          <h2 className="mb-5 text-xl font-bold">Rekap Hunian per Blok</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[['Ditempati', hunian.ditempati, 'text-orange-500'], ['Dikontrakkan', hunian.dikontrakkan, 'text-amber-400'], ['Kosong', hunian.kosong, 'text-zinc-400']].map(([l, v, c]) => (
              <div key={l} className="card p-5"><p className="text-sm muted">{l}</p><p className={`mt-1 text-3xl font-extrabold ${c}`}>{v}</p></div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left muted">
                <tr><th className="px-4 py-3 font-medium">Blok</th><th className="px-4 py-3 font-medium">Rentang</th><th className="px-4 py-3 text-right font-medium">Jumlah</th><th className="px-4 py-3 text-right font-medium">DP</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blok.map((b, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-semibold">Blok {b.kode}</td>
                    <td className="px-4 py-3 muted">{b.rentang}</td>
                    <td className="px-4 py-3 text-right">{b.jumlah}</td>
                    <td className="px-4 py-3 text-right">{rp(b.dp)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/5 font-semibold">
                <tr><td className="px-4 py-3" colSpan={2}>Total</td><td className="px-4 py-3 text-right">{totalRumah}</td><td className="px-4 py-3 text-right muted">Hook +Rp 10 jt</td></tr>
              </tfoot>
            </table>
          </div>
        </section>
      </Container>
    </div>
  )
}
