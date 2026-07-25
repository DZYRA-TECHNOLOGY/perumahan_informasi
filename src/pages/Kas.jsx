import { useOutletContext } from "react-router-dom";
import { PageHero, Container, rp, PrintButton, PrintHeader } from "../components/ui.jsx";
import { computeKas } from "../lib/finance.js";

export default function Kas() {
  const { kas, transaksi } = useOutletContext();
  // Semua angka DIHITUNG dari transaksi (bukan input manual).
  const { rows, total, totalMasuk, totalKeluar, totalAwal } = computeKas(kas, transaksi);

  return (
    <div>
      <PageHero
        kicker="Transparansi"
        title="Saldo Kas & Transaksi"
        desc="Saldo dihitung otomatis: saldo awal + seluruh pemasukan − pengeluaran."
      />
      <Container>
        <PrintHeader title="Saldo Kas & Transaksi" />
        <div className="mb-4 flex justify-end no-print"><PrintButton /></div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Saldo", total, "text-orange-500"],
            ["Total Pemasukan", totalMasuk, "text-emerald-400"],
            ["Total Pengeluaran", totalKeluar, "text-rose-400"],
          ].map(([l, v, c]) => (
            <div key={l} className="card p-6">
              <p className="text-sm muted">{l}</p>
              <p className={`mt-1 text-3xl font-extrabold ${c}`}>{rp(v)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Rincian per kas — semuanya terhitung otomatis */}
          <div className="space-y-4">
            <h3 className="font-bold">Rincian per Kas</h3>
            {rows.map((k, i) => (
              <div key={i} className="card p-5">
                <p className="text-sm muted">{k.nama}</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-400">{rp(k.saldo)}</p>
                <p className="mt-2 text-xs muted">
                  Awal {rp(k.saldo_awal)} · Masuk {rp(k.masuk)} · Keluar {rp(k.keluar)}
                </p>
              </div>
            ))}
            <p className="text-xs muted">Saldo awal keseluruhan: {rp(totalAwal)}</p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 font-bold">Riwayat Transaksi</h3>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium">Kas</th>
                    <th className="px-4 py-3 text-right font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transaksi.length === 0 && (
                    <tr><td className="px-4 py-6 muted" colSpan={4}>Belum ada transaksi.</td></tr>
                  )}
                  {transaksi.map((t, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 muted">{t.tgl}</td>
                      <td className="px-4 py-3">{t.ket}</td>
                      <td className="px-4 py-3 text-xs muted">{t.kas || "-"}</td>
                      <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${t.tipe === "masuk" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.tipe === "masuk" ? "+" : "−"} {rp(t.nominal)}
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
  );
}
