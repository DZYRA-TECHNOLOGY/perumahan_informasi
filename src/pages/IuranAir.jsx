import { useOutletContext } from 'react-router-dom'
import { PageHero, Container, rp, PrintButton, PrintHeader } from '../components/ui.jsx'
import DataTable from '../components/DataTable.jsx'

export default function IuranAir() {
  const { iuranAir } = useOutletContext()
  const lunas = iuranAir.filter((x) => x.status === 'Lunas').length
  const belum = iuranAir.length - lunas
  return (
    <div>
      <PageHero kicker="Layanan" title="Data Iuran Air"
        desc="Status pembayaran iuran air tiap penghuni per periode." />
      <Container>
        <PrintHeader title="Data Iuran Air" />
        <div className="mb-4 flex justify-end no-print"><PrintButton /></div>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5"><p className="text-sm muted">Sudah Lunas</p><p className="mt-1 text-3xl font-extrabold text-emerald-400">{lunas}</p></div>
          <div className="card p-5"><p className="text-sm muted">Belum Bayar</p><p className="mt-1 text-3xl font-extrabold text-rose-400">{belum}</p></div>
          <div className="card p-5"><p className="text-sm muted">Tagihan / rumah</p><p className="mt-1 text-3xl font-extrabold">{rp(100000)}</p></div>
        </div>
        <DataTable
          rows={iuranAir}
          pageSize={10}
          searchKeys={['blok', 'penghuni', 'status']}
          columns={[
            { key: 'blok', label: 'Blok', render: (r) => <span className="font-semibold text-orange-400">{r.blok}</span> },
            { key: 'penghuni', label: 'Penghuni' },
            { key: 'periode', label: 'Periode' },
            { key: 'tagihan', label: 'Tagihan', align: 'right', render: (r) => rp(r.tagihan) },
            {
              key: 'status', label: 'Status', align: 'center',
              render: (r) => <span className={`chip ${r.status === 'Lunas' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{r.status}</span>,
            },
          ]}
        />
      </Container>
    </div>
  )
}
