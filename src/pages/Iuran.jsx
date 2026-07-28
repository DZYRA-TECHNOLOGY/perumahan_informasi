import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PageHero, Container, rp } from "../components/ui.jsx";
import { computeKasTagihan } from "../lib/finance.js";
import KasPembayaranForm from "../components/KasPembayaranForm.jsx";

// Halaman Iuran = PENAGIHAN bulanan: daftar tagihan per warga + kirim bukti
// pembayaran + verifikasi pengurus. Pembayaran yang disetujui otomatis tercatat
// sebagai pemasukan di Buku Kas (lihat KasPembayaranForm.approve).
export default function Iuran() {
  const { kasTagihan = [], kasPembayaran = [], reload } = useOutletContext();

  const periodeList = useMemo(
    () => [...new Set(kasTagihan.map((t) => t.periode).filter(Boolean))].sort(),
    [kasTagihan],
  );
  const [aktif, setAktif] = useState("Semua");

  const tagihanAktif =
    aktif === "Semua"
      ? kasTagihan
      : kasTagihan.filter((t) => t.periode === aktif);

  const { totalTagihan, totalLunas, totalMenunggu, totalTunggakan } =
    computeKasTagihan(tagihanAktif, kasPembayaran);

  const badge = (s) =>
    s === "Lunas"
      ? "bg-emerald-500/10 text-emerald-400"
      : s === "Menunggu"
        ? "bg-amber-500/10 text-amber-400"
        : "bg-rose-500/10 text-rose-400";

  // ========== PAGINATION ==========
  const pageSize = 10;
  const [page, setPage] = useState(1);

  // Reset halaman saat filter periode berubah
  const handleFilterChange = (periode) => {
    setAktif(periode);
    setPage(1);
  };

  const totalData = tagihanAktif.length;
  const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return tagihanAktif.slice(start, end);
  }, [tagihanAktif, currentPage, pageSize]);

  // ========== RENDER PAGINATION CONTROLS ==========
  const renderPageNumbers = () => {
    const total = totalPages;
    const current = currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={
            current === p
              ? "btn-orange min-w-9 h-9 text-sm px-2 flex items-center justify-center"
              : "btn-outline min-w-9 h-9 text-sm px-2 flex items-center justify-center"
          }
        >
          {p}
        </button>
      ));
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pagesArray = [];
    if (start > 1) {
      pagesArray.push(1);
      if (start > 2) pagesArray.push("...");
    }
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    if (end < total) {
      if (end < total - 1) pagesArray.push("...");
      pagesArray.push(total);
    }

    return pagesArray.map((p, i) =>
      p === "..." ? (
        <span key={`ellipsis-${i}`} className="px-1 text-zinc-500 text-sm">
          …
        </span>
      ) : (
        <button
          key={p}
          onClick={() => setPage(p)} // ← FIX: tanpa "as number"
          className={
            current === p
              ? "btn-orange min-w-9 h-9 text-sm px-2 flex items-center justify-center"
              : "btn-outline min-w-9 h-9 text-sm px-2 flex items-center justify-center"
          }
        >
          {p}
        </button>
      ),
    );
  };

  return (
    <div>
      <PageHero
        kicker="Penagihan"
        title="Iuran Bulanan Warga"
        desc="Bayar iuran cukup pilih tagihan lalu unggah bukti — pengurus tinggal verifikasi. Yang disetujui otomatis masuk ke Buku Kas."
      />

      <Container className="space-y-8">
        {/* Filter periode */}
        <div className="flex flex-wrap gap-2">
          {["Semua", ...periodeList].map((p) => (
            <button
              key={p}
              onClick={() => handleFilterChange(p)}
              className={`chip ring-1 transition ${
                aktif === p
                  ? "bg-orange-500 text-white ring-orange-500"
                  : "text-zinc-200 ring-white/15 hover:bg-white/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Tagihan", totalTagihan, "text-orange-500"],
            ["Sudah Lunas", totalLunas, "text-emerald-400"],
            ["Menunggu Verifikasi", totalMenunggu, "text-amber-400"],
            ["Tunggakan", totalTunggakan, "text-rose-400"],
          ].map(([l, v, c]) => (
            <div key={l} className="card p-5">
              <p className="text-sm muted">{l}</p>
              <p className={`mt-1 text-2xl font-extrabold ${c}`}>{rp(v)}</p>
            </div>
          ))}
        </div>

        {/* Daftar tagihan + Pagination */}
        <div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Blok</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Periode</th>
                  <th className="px-4 py-3 text-right font-medium">Nominal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tagihanAktif.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 muted" colSpan={5}>
                      Belum ada tagihan.
                    </td>
                  </tr>
                )}
                {paginatedData.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium">{t.blok}</td>
                    <td className="px-4 py-3">{t.nama}</td>
                    <td className="px-4 py-3 muted">{t.periode}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {rp(t.nominal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${badge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalData > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-zinc-400 whitespace-nowrap">
                Menampilkan {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalData)} dari {totalData}{" "}
                data
              </span>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                  className="btn-outline w-9 h-9 text-sm flex items-center justify-center"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                >
                  «
                </button>
                <button
                  className="btn-outline w-9 h-9 text-sm flex items-center justify-center"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  ‹
                </button>

                {renderPageNumbers()}

                <button
                  className="btn-outline w-9 h-9 text-sm flex items-center justify-center"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  className="btn-outline w-9 h-9 text-sm flex items-center justify-center"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form bayar + verifikasi (komponen bersama) */}
        <KasPembayaranForm onChanged={reload} />
      </Container>
    </div>
  );
}
