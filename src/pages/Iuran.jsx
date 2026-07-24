import { useOutletContext } from 'react-router-dom'
import { PageHero, Container, rp } from '../components/ui.jsx'

export default function Iuran() {
  const { iuran } = useOutletContext()
  const total = iuran.reduce((s, i) => s + Number(i.nominal || 0), 0)
  return (
    <div>
      <PageHero kicker="Keuangan" title="Iuran Bulanan Warga"
        desc="Rincian iuran yang ditarik setiap bulan per rumah — transparan dan jelas." />
      <Container>
        <div className="grid gap-5 sm:grid-cols-3">
          {iuran.map((i, idx) => (
            <div key={idx} className="card card-hover p-6">
              <div className="text-3xl">{['🗑️', '🛡️', '🧹'][idx % 3]}</div>
              <p className="mt-3 text-sm muted">{i.jenis}</p>
              <p className="mt-1 text-4xl font-extrabold text-orange-500">{rp(i.nominal)}</p>
              <p className="mt-1 text-xs muted">{i.periode}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 card p-6">
          <p className="muted">Total iuran per rumah</p>
          <p className="text-3xl font-extrabold">{rp(total)} <span className="text-base font-normal muted">/ bulan</span></p>
          <p className="mt-3 text-sm muted">
            Pembayaran via transfer ke kas RT atau tunai ke pengurus blok. Bukti pembayaran
            dicatat pada halaman <b className="text-zinc-200">Kas</b>.
          </p>
        </div>
      </Container>
    </div>
  )
}
