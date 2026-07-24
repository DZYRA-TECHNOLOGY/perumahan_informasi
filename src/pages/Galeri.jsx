import { PageHero, Container } from '../components/ui.jsx'
import { galeri } from '../data/siteplan.js'

export default function Galeri() {
  return (
    <div>
      <PageHero kicker="Kegiatan" title="Galeri Kegiatan"
        desc="Dokumentasi kegiatan dan kebersamaan warga Cluster Sigerland." />
      <Container>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {galeri.map((g, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img src={g.foto} alt={g.judul} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
              </div>
              <div className="p-4"><p className="font-semibold leading-tight">{g.judul}</p><p className="text-xs muted">{g.tgl}</p></div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
