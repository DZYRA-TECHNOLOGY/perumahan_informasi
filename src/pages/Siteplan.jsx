import { PageHero, Container } from '../components/ui.jsx'
import SiteplanPhoto from '../components/SiteplanPhoto.jsx'
import SiteMap from '../components/SiteMap.jsx'

export default function Siteplan() {
  return (
    <div>
      <PageHero kicker="Siteplan" title="Siteplan & Peta Kavling"
        desc="Gambar siteplan resmi yang interaktif, plus peta status tiap kavling di semua blok." />
      <Container className="space-y-16">
        <section>
          <h2 className="mb-4 text-xl font-bold">Siteplan Resmi (Interaktif)</h2>
          <SiteplanPhoto />
        </section>
        <section>
          <h2 className="mb-1 text-xl font-bold">Peta Kavling per Rumah</h2>
          <p className="mb-5 muted">Klik kavling untuk detail, atau filter berdasarkan status.</p>
          <SiteMap />
        </section>
      </Container>
    </div>
  )
}
