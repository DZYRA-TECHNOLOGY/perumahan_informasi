import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PageHero, Container } from "../components/ui.jsx";
import { supabase } from "../lib/supabase.js";
import { uploadImage } from "../lib/upload.js";
import { CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";

export default function Masukan() {
  const { dataWarga } = useOutletContext();

  const [form, setForm] = useState({
    nama: "",
    blok: "",
    saran: "",
    masukan: "",
  });

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.value,
    }));

  const pick = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setErr("");

    if (!file.type.startsWith("image/")) {
      setErr("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErr("Ukuran maksimal 5 MB.");
      return;
    }

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.masukan.trim().length < 5) {
      setErr("Masukan terlalu pendek.");
      return;
    }

    if (form.masukan.length > 1000 || form.nama.length > 100) {
      setErr("Teks terlalu panjang.");
      return;
    }

    setBusy(true);
    setErr("");

    try {
      let fotoUrl = null;

      if (supabase && foto) {
        fotoUrl = await uploadImage(foto);
      }

      if (!supabase) {
        setDone(true);
        setBusy(false);
        return;
      }

      const { error } = await supabase.from("masukan").insert({
        nama: form.nama.trim(),
        blok: form.blok,
        saran: form.saran.trim(),
        masukan: form.masukan.trim(),
        foto: fotoUrl,
      });

      if (error) throw error;

      setDone(true);

      setForm({
        nama: "",
        blok: "",
        saran: "",
        masukan: "",
      });

      setFoto(null);
      setPreview("");
    } catch (e) {
      setErr(
        e.message.includes("masukan")
          ? 'Fitur belum aktif — jalankan setup.sql (tabel "masukan").'
          : e.message,
      );
    }

    setBusy(false);
  };

  const blokOptions = [...new Set(dataWarga.map((w) => w.blok))].slice(0, 80);

  return (
    <div>
      <PageHero
        kicker="Partisipasi"
        title="Kotak Masukan & Saran"
        desc="Suara Anda berarti bagi kemajuan lingkungan."
      />

      <Container>
        <div className="card mx-auto max-w-xl p-6 sm:p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={56} className="mx-auto text-emerald-400" />

              <h3 className="mt-3 text-xl font-bold">Terima kasih!</h3>

              <p className="mt-1 muted">Masukan Anda berhasil dikirim.</p>

              <button
                onClick={() => setDone(false)}
                className="btn-orange mt-5"
              >
                Kirim Lagi
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label>
                <span className="mb-1 block text-sm font-medium">Nama</span>

                <input
                  className="field"
                  required
                  value={form.nama}
                  onChange={set("nama")}
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Blok</span>

                <select
                  className="field"
                  required
                  value={form.blok}
                  onChange={set("blok")}
                >
                  <option value="">Pilih blok...</option>

                  {blokOptions.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Saran</span>

                <textarea
                  className="field"
                  rows={2}
                  value={form.saran}
                  onChange={set("saran")}
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Masukan</span>

                <textarea
                  className="field"
                  rows={4}
                  required
                  value={form.masukan}
                  onChange={set("masukan")}
                />
              </label>

              <div className="space-y-3">
                <p className="text-sm font-medium">Lampiran Foto (Opsional)</p>

                <label className="btn-outline flex cursor-pointer items-center justify-center gap-2">
                  <Upload size={16} />

                  {foto ? "Ganti Foto" : "Pilih Foto"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={pick}
                    disabled={busy}
                  />
                </label>

                {preview && (
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <img src={preview} className="h-52 w-full object-cover" />
                  </div>
                )}

                {foto && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <ImageIcon size={18} />

                    <div>
                      <p className="text-sm font-medium">{foto.name}</p>

                      <p className="text-xs text-zinc-400">
                        {(foto.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {err && <p className="text-sm text-rose-400">{err}</p>}

              <button disabled={busy} className="btn-orange w-full">
                {busy ? "Mengirim..." : "Kirim Masukan"}
              </button>

              <p className="text-center text-xs muted">
                Masukan dikirim anonim kepada pengurus.
              </p>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
