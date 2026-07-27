import { useEffect, useMemo, useState } from "react";
import { PageHero, Container, rp, Cover } from "../components/ui.jsx";
import { hunianTersedia, hunian, blok } from "../data/siteplan.js";
import { supabase } from "../lib/supabase.js";
import { uploadImage } from "../lib/upload.js";
import { CheckCircle2, Image as ImageIcon, Upload } from "lucide-react";

const RUMAH_FOTO = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
];

function toCard(row, i) {
  return {
    id: row.id ?? `local-${i}`,
    tipe: row.tipe || "Kontrak",
    judul: row.judul || "Hunian Tersedia",
    blok: row.blok || "-",
    kt: Number(row.kt || 0),
    km: Number(row.km || 0),
    harga: Number(row.harga || 0),
    satuan: row.satuan || "/bulan",
    wa: row.wa || "6281200000000",
    foto: row.foto || RUMAH_FOTO[i % RUMAH_FOTO.length],
    deskripsi: row.deskripsi || "",
    status: row.status || "Aktif",
  };
}

export default function Hunian() {
  const totalRumah = blok.reduce((s, b) => s + b.jumlah, 0);

  const fallbackListings = useMemo(
    () =>
      hunianTersedia.map((h, i) =>
        toCard(
          {
            tipe: h.tipe,
            judul: h.judul,
            blok: h.blok || h.kode || "-",
            kt: h.kt,
            km: h.km,
            harga: h.harga,
            satuan: h.satuan,
            wa: "6281200000000",
            foto: h.foto || RUMAH_FOTO[i % RUMAH_FOTO.length],
            deskripsi: h.deskripsi || "",
            status: "Aktif",
          },
          i,
        ),
      ),
    [],
  );

  const [items, setItems] = useState(fallbackListings);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    tipe: "Kontrak",
    judul: "",
    blok: "",
    kt: "",
    km: "",
    harga: "",
    satuan: "/bulan",
    wa: "",
    deskripsi: "",
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      if (!supabase) {
        setItems(fallbackListings);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("hunian_listing")
        .select("*")
        .neq("status", "Nonaktif")
        .order("id", { ascending: false });

      if (error) {
        setItems(fallbackListings);
      } else if (data && data.length > 0) {
        setItems(data.map(toCard));
      } else {
        setItems(fallbackListings);
      }

      setLoading(false);
    };

    load();
  }, [fallbackListings]);

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.value,
    }));

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg("");

    if (!file.type.startsWith("image/")) {
      setMsg("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setDone(false);

    try {
      if (!form.judul.trim()) throw new Error("Judul wajib diisi.");
      if (!form.blok.trim()) throw new Error("Blok wajib diisi.");
      if (!form.wa.trim()) throw new Error("Nomor WhatsApp wajib diisi.");

      let fotoUrl = "";

      if (foto) {
        fotoUrl = await uploadImage(foto, "hunian");
      }

      if (!supabase) {
        throw new Error("Supabase belum dikonfigurasi.");
      }

      const payload = {
        tipe: form.tipe,
        judul: form.judul.trim(),
        blok: form.blok.trim(),
        kt: Number(form.kt || 0),
        km: Number(form.km || 0),
        harga: Number(form.harga || 0),
        satuan: form.satuan,
        wa: form.wa.trim(),
        deskripsi: form.deskripsi.trim(),
        foto: fotoUrl || null,
        status: "Aktif",
      };

      const { error } = await supabase.from("hunian_listing").insert(payload);
      if (error) throw error;

      const newItem = toCard(
        {
          ...payload,
          foto: fotoUrl || RUMAH_FOTO[0],
        },
        0,
      );

      setItems((prev) => [newItem, ...prev]);
      setForm({
        tipe: "Kontrak",
        judul: "",
        blok: "",
        kt: "",
        km: "",
        harga: "",
        satuan: "/bulan",
        wa: "",
        deskripsi: "",
      });
      setFoto(null);
      setPreview("");
      setDone(true);
    } catch (err) {
      setMsg(err.message || "Gagal mengirim data.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHero
        kicker="Hunian"
        title="Hunian & Kavling"
        desc="Rumah yang dikontrakkan atau dijual di dalam cluster, serta rekap hunian per blok."
      />

      <Container className="space-y-14">
        <section className="card p-5 sm:p-6">
          <div className="mb-10 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Tambah Info Hunian</h2>
              <p className="text-sm muted">
                Warga bisa menambahkan unit yang ingin dikontrakkan atau dijual.
              </p>
              <div className="flex mt-14 items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs sm:text-sm">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>Batalkan atau edit? Hubungi pengurus</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs sm:text-sm">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Tayang langsung</span>
            </div>
          </div>

          {done && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 size={18} />
              Data hunian berhasil dikirim.
            </div>
          )}

          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Tipe</span>
              <select
                className="field"
                value={form.tipe}
                onChange={set("tipe")}
              >
                <option value="Kontrak">Kontrak</option>
                <option value="Dijual">Dijual</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Judul</span>
              <input
                className="field"
                value={form.judul}
                onChange={set("judul")}
                placeholder="Rumah Dikontrakkan Blok A21"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Blok / Unit
              </span>
              <input
                className="field"
                value={form.blok}
                onChange={set("blok")}
                placeholder="A21"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  KT (Kamar Tidur)
                </span>
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={form.kt}
                  onChange={set("kt")}
                  placeholder="2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  KM (Kamar Mandi)
                </span>
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={form.km}
                  onChange={set("km")}
                  placeholder="1"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Harga</span>
              <input
                className="field"
                type="number"
                min="0"
                value={form.harga}
                onChange={set("harga")}
                placeholder="12000000"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Satuan</span>
              <select
                className="field"
                value={form.satuan}
                onChange={set("satuan")}
              >
                <option value="/bulan">/bulan</option>
                <option value="/tahun">/tahun</option>
                <option value="total">total</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">WhatsApp</span>
              <input
                className="field"
                value={form.wa}
                onChange={set("wa")}
                placeholder="62812xxxxxxx"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium">Deskripsi</span>
              <textarea
                className="field"
                rows={3}
                value={form.deskripsi}
                onChange={set("deskripsi")}
                placeholder="2 KT, 1 KM, dekat gerbang utama, cocok untuk keluarga..."
              />
            </label>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Foto (opsional)</p>
              <label className="btn-outline flex cursor-pointer items-center justify-center gap-2 text-sm">
                <Upload size={16} />
                {foto ? "Ganti Foto" : "Pilih Foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={pick}
                  disabled={busy}
                />
              </label>

              {preview && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {msg && (
              <p className="md:col-span-2 text-sm text-rose-400">{msg}</p>
            )}

            <div className="md:col-span-2">
              <button disabled={busy} className="btn-green w-full">
                {busy ? "Mengirim…" : "Kirim ke Hunian"}
              </button>
            </div>
          </form>
        </section>

        {/* Kartu hunian tersedia */}
        <section>
          <h2 className="mb-5 text-xl font-bold">Tersedia Sekarang</h2>

          {loading ? (
            <p className="muted">Memuat data hunian…</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              {items.map((h, i) => (
                <div key={h.id ?? i} className="card-white overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Cover
                      foto={h.foto || RUMAH_FOTO[i % RUMAH_FOTO.length]}
                      emoji={h.emoji}
                      warna={h.warna}
                      className="h-full w-full"
                    />
                    <span className="absolute left-3 top-3 chip bg-white/90 text-zinc-900">
                      {h.tipe}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold leading-tight">{h.judul}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {h.kt} KT · {h.km} KM
                    </p>
                    <p className="mt-2">
                      <span className="text-lg font-extrabold text-orange-600">
                        {rp(h.harga)}
                      </span>
                      <span className="text-zinc-500">{h.satuan}</span>
                    </p>
                    {h.deskripsi && (
                      <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                        {h.deskripsi}
                      </p>
                    )}
                    <a
                      href={`https://wa.me/${String(h.wa).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-green mt-3 w-full"
                    >
                      Hubungi
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rekap per blok */}
        <section>
          <h2 className="mb-5 text-xl font-bold">Rekap Hunian per Blok</h2>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Ditempati", hunian.ditempati, "text-orange-500"],
              ["Dikontrakkan", hunian.dikontrakkan, "text-amber-400"],
              ["Kosong", hunian.kosong, "text-zinc-400"],
            ].map(([l, v, c]) => (
              <div key={l} className="card p-5">
                <p className="text-sm muted">{l}</p>
                <p className={`mt-1 text-3xl font-extrabold ${c}`}>{v}</p>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Blok</th>
                  <th className="px-4 py-3 font-medium">Rentang</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                  <th className="px-4 py-3 text-right font-medium">DP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blok.map((b, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-semibold">Blok {b.kode}</td>
                    <td className="px-4 py-3 muted">{b.rentang}</td>
                    <td className="px-4 py-3 text-right">{b.jumlah}</td>
                    <td className="px-4 py-3 text-right">{rp(b.dp)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/5 font-semibold">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right">{totalRumah}</td>
                  <td className="px-4 py-3 text-right muted">Hook +Rp 10 jt</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </Container>
    </div>
  );
}
