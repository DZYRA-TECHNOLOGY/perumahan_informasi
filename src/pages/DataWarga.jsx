import { useOutletContext } from "react-router-dom";
import {
  PageHero,
  Container,
  PrintButton,
  PrintHeader,
} from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";

const ketBadge = (k) => {
  const map = {
    Dihuni: "bg-emerald-500/15 text-emerald-300",
    Dikontrakkan: "bg-amber-500/15 text-amber-300",
    Kosong: "bg-white/10 text-zinc-400",
  };
  return <span className={`chip ${map[k] || "bg-white/10"}`}>{k}</span>;
};

export default function DataWarga() {
  const { dataWarga } = useOutletContext();
  const dihuni = dataWarga.filter((w) => w.ket === "Dihuni").length;
  const kontrak = dataWarga.filter((w) => w.ket === "Dikontrakkan").length;
  const kosong = dataWarga.filter((w) => w.ket === "Kosong").length;

  return (
    <div>
      <PageHero
        kicker="Menu Warga"
        title="Data Kavling & Warga"
        desc="Daftar seluruh blok perumahan beserta pemilik, penghuni, dan status huniannya."
      />
      <Container>
        <PrintHeader title="Data Kavling & Warga" />
        <div className="mb-4 flex justify-end no-print">
          <PrintButton />
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Dihuni", dihuni, "text-emerald-400"],
            ["Dikontrakkan", kontrak, "text-amber-400"],
            ["Kosong", kosong, "text-zinc-400"],
          ].map(([l, v, c]) => (
            <div key={l} className="card p-5">
              <p className="text-sm muted">{l}</p>
              <p className={`mt-1 text-3xl font-extrabold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <DataTable
          rows={dataWarga}
          pageSize={12}
          searchKeys={["blok", "pemilik", "penghuni", "ket"]}
          columns={[
            {
              key: "no",
              label: "No",
              align: "center",
              render: (_r, idx) => idx + 1,
            },
            {
              key: "blok",
              label: "Blok",
              render: (r) => (
                <span className="font-semibold text-orange-400">{r.blok}</span>
              ),
            },
            { key: "pemilik", label: "Nama Pemilik" },
            { key: "penghuni", label: "Penghuni Saat Ini" },
            { key: "ket", label: "Keterangan", render: (r) => ketBadge(r.ket) },
          ]}
        />
      </Container>
    </div>
  );
}
