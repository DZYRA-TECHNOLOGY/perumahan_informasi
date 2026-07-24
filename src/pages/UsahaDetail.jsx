import { useParams, useOutletContext, Link } from "react-router-dom";
import { Container, rp, Cover, coverProps } from "../components/ui.jsx";

export default function UsahaDetail() {
  const { id } = useParams();
  const { usaha } = useOutletContext();
  const u = usaha.find((x) => String(x.id) === String(id));

  if (!u) {
    return (
      <Container>
        <p className="muted">Usaha tidak ditemukan.</p>
        <Link to="/usaha" className="btn-orange mt-4">
          ← Kembali ke Usaha Warga
        </Link>
      </Container>
    );
  }

  const lain = usaha.filter((x) => x.id !== u.id).slice(0, 3);

  return (
    <div>
      {/* Cover */}

      <Container>
        <Link to="/usaha" className="text-sm font-semibold text-orange-400">
          ← Semua usaha
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="chip bg-orange-500/15 text-orange-300">
              {u.kategori}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold">{u.nama}</h1>
            <Cover {...coverProps(u)} className="h-56 w-full sm:h-80" />
            <div className="mt-2 flex items-center gap-3 text-sm muted">
              {u.rating != null && (
                <span>
                  ★ {u.rating} ({u.ulasan ?? 0} ulasan)
                </span>
              )}
              {u.blok && <span>· Blok {u.blok}</span>}
            </div>
            <p className="mt-6 leading-relaxed text-zinc-300">{u.desc}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Kategori", u.kategori],
                ["Lokasi", u.blok ? `Blok ${u.blok}` : "—"],
                ["Tarif", u.harga ? rp(u.harga) + (u.satuan || "") : "Hubungi"],
                ["Kontak", u.wa ? "+" + u.wa : "—"],
              ].map(([l, v]) => (
                <div key={l} className="card p-4">
                  <p className="text-xs muted">{l}</p>
                  <p className="mt-1 font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar aksi */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6">
              <p className="text-sm muted">Tarif mulai</p>
              <p className="text-3xl font-extrabold text-orange-500">
                {u.harga ? rp(u.harga) : "Hubungi"}
                <span className="text-base font-normal muted">{u.satuan}</span>
              </p>
              {u.wa && (
                <a
                  href={`https://wa.me/${u.wa}?text=Halo,%20saya%20warga%20Sigerland%20tertarik%20dengan%20${encodeURIComponent(u.nama)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-green mt-5 w-full"
                >
                  💬 Hubungi via WhatsApp
                </a>
              )}
              <p className="mt-3 text-center text-xs muted">
                Sebutkan dari portal warga untuk harga terbaik.
              </p>
            </div>
          </div>
        </div>

        {/* Usaha lain */}
        {lain.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-bold">Usaha lain</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {lain.map((x) => (
                <Link
                  key={x.id}
                  to={`/usaha/${x.id}`}
                  className="card-white card-hover overflow-hidden"
                >
                  <Cover {...coverProps(x)} className="aspect-[4/3] w-full" />
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900">{x.nama}</h3>
                    <p className="text-sm text-zinc-500">{x.kategori}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
