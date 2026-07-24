import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PageHero, Container } from '../components/ui.jsx'
import UsahaGrid from '../components/UsahaGrid.jsx'

const KAT = ['Semua', 'Makanan', 'Jasa', 'Toko', 'Kontrakan', 'Rental Mobil']

export default function Usaha() {
  const { usaha } = useOutletContext()
  const [kat, setKat] = useState('Semua')
  const list = kat === 'Semua' ? usaha : usaha.filter((u) => u.kategori === kat)

  return (
    <div>
      <PageHero kicker="Ekonomi" title="Usaha & Jasa Warga"
        desc="Dukung ekonomi lingkungan — jelajahi produk & jasa unggulan warga Sigerland." />
      <Container>
        <div className="mb-8 flex flex-wrap gap-2">
          {KAT.map((k) => (
            <button key={k} onClick={() => setKat(k)}
              className={`chip ring-1 transition ${kat === k ? 'bg-orange-500 text-white ring-orange-500' : 'text-zinc-200 ring-white/15 hover:bg-white/5'}`}>
              {k}
            </button>
          ))}
        </div>
        {list.length ? <UsahaGrid usaha={list} /> : <p className="muted">Belum ada usaha pada kategori ini.</p>}
      </Container>
    </div>
  )
}
