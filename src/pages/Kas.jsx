import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PageHero, Container, rp, PrintButton, PrintHeader } from "../components/ui.jsx";
import { computeKasByJenis, computeKeuangan } from "../lib/finance.js";

// Halaman Kas = BUKU KAS: pemasukan + pengeluaran → saldo (dihitung otomatis
// dari tabel transaksi). Pembayaran iuran yang sudah diverifikasi otomatis
// masuk ke sini sebagai transaksi "masuk".
export default function Kas() {
  const { kas = [], transaksi = [], kasMaster = [] } = useOutletContext();

  const { periodeList } = computeKeuangan(transaksi);
  const [periode, setPeriode] = useState("Semua");

  const tx = useMemo(
    () => (periode === "Semua" ? transaksi : transaksi.filter((t) => t.periode === periode)),
    [transaksi, periode],
  );

  const { rows, total, totalMasuk, totalKeluar, totalAwal } = computeKasByJenis(
    kasMaster,
    kas,
    tx,
  );
  const maxSaldo = Math.max(1, ...rows.map((k) => Math.abs(k.saldo)));

  return (
    <div>
      <PageHero
        kicker="Transparansi"
        title="Saldo Kas & Transaksi"
        desc="Buku kas warga — saldo dihitung otomatis dari seluruh pemasukan dikurangi pengeluaran."
      />
      <Container className="space-y-8">
        <PrintHeader title="Buku Kas Warga" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["Semua", ...periodeList].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`chip ring-1 transition ${
                  periode === p
                    ? "bg-orange-500 text-white ring-orange-500"
                    : "text-zinc-200 ring-white/15 hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <PrintButton />
        </div>

        {/* Ringkasan */}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Saldo per kas */}
          <div className="space-y-4">
            <h3 className="font-bold">Saldo per Kas</h3>
            {rows.length === 0 && <p className="text-sm muted">Belum ada kas.</p>}
            {rows.map((k) => (
              <div key={k.nama} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm muted">{k.nama}</p>
                  <p className="text-lg font-extrabold text-emerald-400">{rp(k.saldo)}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.max(4, (Math.abs(k.saldo) / maxSaldo) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs muted">
                  Awal {rp(k.saldo_awal)} · Masuk {rp(k.masuk)} · Keluar {rp(k.keluar)}
                </p>
              </div>
            ))}
            <p className="text-xs muted">Saldo awal keseluruhan: {rp(totalAwal)}</p>
          </div>

          {/* Riwayat transaksi */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 font-bold">Riwayat Transaksi</h3>
            <div className="card overflow-x-auto">
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
                  {tx.length === 0 && (
                    <tr><td className="px-4 py-6 muted" colSpan={4}>Belum ada transaksi pada periode ini.</td></tr>
                  )}
                  {[...tx].reverse().map((t, i) => (
                    <tr key={t.id ?? i} className="hover:bg-white/[0.03]">
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
