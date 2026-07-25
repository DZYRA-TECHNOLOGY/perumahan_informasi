import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PageHero, Container, rp, PrintButton, PrintHeader } from "../components/ui.jsx";
import { computeKeuangan } from "../lib/finance.js";

export default function Keuangan() {
  const { transaksi } = useOutletContext();
  // Rekap dihitung otomatis dari transaksi, dikelompokkan per periode.
  const { periodeList, byPeriode } = computeKeuangan(transaksi);
  const [aktif, setAktif] = useState(periodeList[periodeList.length - 1] || "");
  const rows = byPeriode(aktif);
  const masuk = rows.reduce((s, r) => s + Number(r.masuk || (r.tipe === "masuk" ? r.nominal : 0)), 0);
  const keluar = rows.reduce((s, r) => s + Number(r.keluar || (r.tipe === "keluar" ? r.nominal : 0)), 0);

  return (
    <div>
      <PageHero
        kicker="Transparansi"
        title="Rekapitulasi Laporan Keuangan"
        desc="Otomatis dari data transaksi — dikelompokkan per periode. Tidak perlu input rekap manual."
      />
      <Container>
        <PrintHeader title={`Rekap Keuangan — ${aktif || "-"}`} />
        <div className="mb-4 flex justify-end no-print"><PrintButton /></div>

        {/* Tabs periode */}
        <div className="mb-6 flex flex-wrap gap-2 no-print">
          {periodeList.length === 0 && <span className="muted text-sm">Belum ada transaksi.</span>}
          {periodeList.map((per) => (
            <button
              key={per}
              onClick={() => setAktif(per)}
              className={`chip ring-1 transition ${per === aktif ? "bg-orange-500 text-white ring-orange-500" : "text-zinc-200 ring-white/15 hover:bg-white/5"}`}
            >
              {per}
            </button>
          ))}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5"><p className="text-sm muted">Total Masuk</p><p className="mt-1 text-2xl font-extrabold text-emerald-400">{rp(masuk)}</p></div>
          <div className="card p-5"><p className="text-sm muted">Total Keluar</p><p className="mt-1 text-2xl font-extrabold text-rose-400">{rp(keluar)}</p></div>
          <div className="card p-5"><p className="text-sm muted">Saldo Periode</p><p className="mt-1 text-2xl font-extrabold text-orange-400">{rp(masuk - keluar)}</p></div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left muted">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Kas</th>
                <th className="px-4 py-3 text-right font-medium">Masuk</th>
                <th className="px-4 py-3 text-right font-medium">Keluar</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length === 0 && (
                <tr><td className="px-4 py-6 muted" colSpan={6}>Tidak ada transaksi pada periode ini.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 muted">{i + 1}</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.tgl}</td>
                  <td className="px-4 py-3 text-xs muted">{r.kas || "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-emerald-400">{r.tipe === "masuk" ? rp(r.nominal) : ""}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-rose-400">{r.tipe === "keluar" ? rp(r.nominal) : ""}</td>
                  <td className="px-4 py-3 muted">{r.ket}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white/5 font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                <td className="px-4 py-3 text-right text-emerald-400">{rp(masuk)}</td>
                <td className="px-4 py-3 text-right text-rose-400">{rp(keluar)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Container>
    </div>
  );
}
