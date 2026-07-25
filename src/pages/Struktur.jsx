import { useOutletContext } from "react-router-dom";
import { PageHero, Container } from "../components/ui.jsx";
import { IconBox, Icon } from "../components/icons.jsx";
import { kontakDarurat } from "../data/siteplan.js";
import { Crown, PenLine, HandCoins, ShieldCheck, Brush, UserRound } from "lucide-react";

// Pilih ikon berdasarkan jabatan (bukan emoji).
function iconFor(jabatan = "", isLead) {
  const j = jabatan.toLowerCase();
  if (isLead || j.includes("kepala") || j.includes("ketua")) return Crown;
  if (j.includes("sekret")) return PenLine;
  if (j.includes("bendahara") || j.includes("keuangan")) return HandCoins;
  if (j.includes("aman") || j.includes("satpam")) return ShieldCheck;
  if (j.includes("bersih")) return Brush;
  return UserRound;
}

export default function Struktur() {
  const { struktur } = useOutletContext();
  const sorted = [...struktur].sort((a, b) => (a.urutan || 99) - (b.urutan || 99));
  const lead = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div>
      <PageHero
        kicker="Organisasi"
        title="Struktur Organisasi"
        desc="Pengurus lingkungan Cluster Sigerland."
      />
      <Container className="space-y-14">
        <section>
          {lead && (
            <div className="mx-auto max-w-md card p-8 text-center">
              <IconBox Comp={iconFor(lead.jabatan, true)} size={26} className="mx-auto h-16 w-16" />
              <p className="mt-4 text-xl font-bold">{lead.jabatan}</p>
              <p className="muted">{lead.nama}</p>
            </div>
          )}
          <div className="mx-auto mt-6 grid max-w-3xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((s, i) => (
              <div key={i} className="card card-hover p-6 text-center">
                <IconBox Comp={iconFor(s.jabatan)} size={22} className="mx-auto h-14 w-14" tone="neutral" />
                <p className="mt-3 font-bold">{s.jabatan}</p>
                <p className="text-sm muted">{s.nama}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Kontak Darurat</h2>
          <p className="mb-5 muted">Simpan nomor penting ini — bisa langsung ditelepon.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kontakDarurat.map((k, i) => (
              <a
                key={i}
                href={`tel:${k.nomor.replace(/[^0-9]/g, "")}`}
                className="card card-hover flex items-center gap-4 p-5"
              >
                <IconBox name={k.icon} size={22} className="h-12 w-12" />
                <div>
                  <p className="font-semibold">{k.label}</p>
                  <p className="text-sm text-orange-400">{k.nomor}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
