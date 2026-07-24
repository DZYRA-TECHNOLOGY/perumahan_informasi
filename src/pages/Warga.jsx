import { useOutletContext, Link } from 'react-router-dom'
import { PageHero, Container } from '../components/ui.jsx'
import Voting from '../components/Voting.jsx'

export default function Warga() {
  const { pengumuman, agenda } = useOutletContext()
  return (
    <div>
      <PageHero kicker="Partisipasi" title="Suara & Pengumuman Warga"
        desc="Ikut menentukan prioritas kas, dan pantau pengumuman serta agenda kegiatan." />
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Voting />
          <div className="card p-6">
            <p className="text-sm font-semibold text-orange-500">PENGUMUMAN</p>
            <div className="mt-4 space-y-4">
              {pengumuman.map((p, i) => (
                <div key={i} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  {p.foto && <img src={p.foto} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />}
                  <div className="flex items-center justify-between">
                    <span className="chip bg-orange-500/15 text-orange-300">{p.tag}</span>
                    <span className="text-xs muted">{p.tgl}</span>
                  </div>
                  <h4 className="mt-2 font-bold">{p.judul}</h4>
                  <p className="text-sm muted">{p.isi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="mt-12 text-xl font-bold">Agenda & Kegiatan</h3>
        <div className="mt-5 space-y-3">
          {agenda.map((a, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              {a.foto ? (
                <img src={a.foto} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-400">
                  <span className="text-xs font-bold">{String(a.tgl).slice(8)}/{String(a.tgl).slice(5, 7)}</span>
                </div>
              )}
              <div className="flex-1"><p className="font-semibold">{a.judul}</p><p className="text-xs muted">{a.tgl}</p></div>
              <span className="chip bg-white/5">{a.kategori}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white sm:p-10">
          <h3 className="text-2xl font-bold">Punya usaha atau properti?</h3>
          <p className="mt-2 text-orange-50">Pasarkan ke sesama warga lewat portal ini.</p>
          <Link to="/usaha" className="mt-5 inline-block rounded-xl bg-white px-5 py-2.5 font-semibold text-orange-600">Lihat Usaha Warga</Link>
        </div>
      </Container>
    </div>
  )
}
