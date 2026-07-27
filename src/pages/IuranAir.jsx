import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PageHero,
  Container,
  rp,
  PrintButton,
  PrintHeader,
} from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { computeIuranAir } from "../lib/finance.js";

export default function IuranAir() {
  const { iuranAir = [] } = useOutletContext();

  // Daftar periode yang tersedia, urut menaik (sama seperti pola di Kas.jsx / Keuangan.jsx)
  const periodeList = useMemo(
    () => [...new Set(iuranAir.map((x) => x.periode).filter(Boolean))].sort(),
    [iuranAir],
  );

  const [aktif, setAktif] = useState(periodeList[periodeList.length - 1] || "");

  // PENTING: statistik dihitung dari data yang SUDAH difilter per periode,
  // bukan dari seluruh histori — supaya angka "Terkumpul"/"Tunggakan" mencerminkan
  // periode yang sedang dilihat, konsisten dengan halaman Kas & Iuran.
  const dataAktif = aktif
    ? iuranAir.filter((x) => x.periode === aktif)
    : iuranAir;

  const lunas = dataAktif.filter((x) => x.status === "Lunas").length;
  const belum = dataAktif.length - lunas;
  const { terkumpul, tunggakan } = computeIuranAir(dataAktif);

  return (
    <div>
      <PageHero
        kicker="Layanan"
        title="Data Iuran Air"
        desc="Status pembayaran iuran air tiap penghuni per periode."
      />
      <Container>
        <PrintHeader title={`Data Iuran Air — ${aktif || "Semua Periode"}`} />
        <div className="mb-4 flex justify-end no-print">
          <PrintButton />
        </div>

        {/* Tabs periode — konsisten dengan halaman Kas & Iuran, agar statistik tidak tercampur antar bulan */}
        <div className="mb-6 flex flex-wrap gap-2 no-print">
          {periodeList.length === 0 && (
            <span className="muted text-sm">Belum ada data iuran air.</span>
          )}
          {periodeList.map((p) => (
            <button
              key={p}
              onClick={() => setAktif(p)}
              className={`chip ring-1 transition ${p === aktif ? "bg-orange-500 text-white ring-orange-500" : "text-zinc-200 ring-white/15 hover:bg-white/5"}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-sm muted">Terkumpul (Lunas)</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {rp(terkumpul)}
            </p>
            <p className="text-xs muted">{lunas} rumah</p>
          </div>
          <div className="card p-5">
            <p className="text-sm muted">Tunggakan</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-400">
              {rp(tunggakan)}
            </p>
            <p className="text-xs muted">{belum} rumah</p>
          </div>
          <div className="card p-5">
            <p className="text-sm muted">Total Tagihan</p>
            <p className="mt-1 text-2xl font-extrabold">
              {rp(terkumpul + tunggakan)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm muted">Sudah Bayar</p>
            <p className="mt-1 text-2xl font-extrabold text-orange-400">
              {dataAktif.length
                ? Math.round((lunas / dataAktif.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        <DataTable
          rows={dataAktif}
          pageSize={10}
          searchKeys={["blok", "penghuni", "status"]}
          columns={[
            {
              key: "blok",
              label: "Blok",
              render: (r) => (
                <span className="font-semibold text-orange-400">{r.blok}</span>
              ),
            },
            { key: "penghuni", label: "Penghuni" },
            { key: "periode", label: "Periode" },
            {
              key: "tagihan",
              label: "Tagihan",
              align: "right",
              render: (r) => rp(r.tagihan),
            },
            {
              key: "status",
              label: "Status",
              align: "center",
              render: (r) => (
                <span
                  className={`chip ${r.status === "Lunas" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
                >
                  {r.status}
                </span>
              ),
            },
          ]}
        />
      </Container>
    </div>
  );
}
