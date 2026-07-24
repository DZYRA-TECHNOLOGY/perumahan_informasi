import { useOutletContext } from 'react-router-dom'
import { PageHero, Container, rp, PrintButton, PrintHeader } from '../components/ui.jsx'

export default function Kas() {
  const { kas, transaksi } = useOutletContext()
  const totalKas = kas.reduce((s, k) => s + Number(k.saldo || 0), 0)
  const masuk = transaksi.filter((t) => t.tipe === 'masuk').reduce((s, t) => s + Number(t.nominal || 0), 0)
  const keluar = transaksi.filter((t) => t.tipe === 'keluar').reduce((s, t) => s + Number(t.nominal || 0), 0)

  return (
    <div>
      <PageHero kicker="Transparansi" title="Saldo Kas & Transaksi"
        desc="Saldo kas terkini serta seluruh riwayat pemasukan dan pengeluaran warga." />
      <Container>
        <PrintHeader title="Saldo Kas & Transaksi" />
        <div className="mb-4 flex justify-end no-print"><PrintButton /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[['Total Saldo', totalKas, 'text-orange-500'], ['Pemasukan', masuk, 'text-emerald-400'], ['Pengeluaran', keluar, 'text-rose-400']].map(([l, v, c]) => (
            <div key={l} className="card p-6"><p className="text-sm muted">{l}</p><p className={`mt-1 text-3xl font-extrabold ${c}`}>{rp(v)}</p></div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-bold">Rincian Kas</h3>
            {kas.map((k, i) => (
              <div key={i} className="card p-5"><p className="text-sm muted">{k.nama}</p><p className="mt-1 text-2xl font-extrabold text-emerald-400">{rp(k.saldo)}</p></div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <h3 className="mb-4 font-bold">Riwayat Transaksi</h3>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left muted">
                  <tr><th className="px-4 py-3 font-medium">Tanggal</th><th className="px-4 py-3 font-medium">Keterangan</th><th className="px-4 py-3 text-right font-medium">Nominal</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transaksi.map((t, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 muted">{t.tgl}</td>
                      <td className="px-4 py-3">{t.ket}</td>
                      <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${t.tipe === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.tipe === 'masuk' ? '+' : '−'} {rp(t.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
