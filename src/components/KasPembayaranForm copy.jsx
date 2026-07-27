import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { uploadImage } from "../lib/upload.js";
import { rp } from "../components/ui.jsx";
import {
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  CircleCheck,
  CircleX,
  Clock3,
} from "lucide-react";

export default function KasPembayaranForm({ onChanged, verifierEmail = "" }) {
  const [tagihanList, setTagihanList] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPengurus, setIsPengurus] = useState(false);

  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // bisa satu / banyak / semua
  const [metode, setMetode] = useState("Transfer");
  const [catatan, setCatatan] = useState("");
  const [bukti, setBukti] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [actionBusy, setActionBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    if (!supabase) return setLoading(false);
    const [tRes, pRes] = await Promise.all([
      supabase
        .from("kas_tagihan")
        .select("*")
        .order("id", { ascending: false }),
      supabase
        .from("kas_pembayaran")
        .select("*")
        .order("id", { ascending: false }),
    ]);
    if (tRes.error) setErr(tRes.error.message);
    else setTagihanList(tRes.data || []);
    if (!pRes.error) setPaymentList(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setIsPengurus(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setIsPengurus(!!s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // Tagihan yang bisa dibayar (belum lunas) + filter pencarian.
  const belumLunas = useMemo(
    () => tagihanList.filter((t) => t.status !== "Lunas"),
    [tagihanList],
  );
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return belumLunas;
    return belumLunas.filter((t) =>
      [t.blok, t.nama, t.jenis, t.periode].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(s),
      ),
    );
  }, [belumLunas, q]);

  const selected = tagihanList.filter((t) => selectedIds.includes(t.id));
  const totalBayar = selected.reduce((s, t) => s + Number(t.nominal || 0), 0);

  const toggle = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const selectAllVisible = () => setSelectedIds(filtered.map((t) => t.id));
  const clearSel = () => setSelectedIds([]);

  const reset = () => {
    setSelectedIds([]);
    setMetode("Transfer");
    setCatatan("");
    setBukti(null);
    setPreview("");
    setErr("");
    setDone(false);
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setErr("Bukti harus berupa gambar.");
    if (file.size > 5 * 1024 * 1024)
      return setErr("Ukuran bukti maksimal 5 MB.");
    setErr("");
    setBukti(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) return setErr("Pilih minimal satu tagihan.");
    setBusy(true);
    setErr("");
    setDone(false);
    try {
      if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
      let buktiUrl = null;
      if (bukti) buktiUrl = await uploadImage(bukti, "bukti");
      // Satu bukti untuk banyak tagihan → satu baris pembayaran per tagihan.
      const rows = selected.map((t) => ({
        tagihan_id: Number(t.id),
        blok: t.blok || "",
        nama: t.nama || "",
        periode: t.periode || "",
        nominal: Number(t.nominal || 0),
        metode,
        bukti: buktiUrl,
        status: "Menunggu",
        catatan: `${t.jenis || "Iuran"}${catatan ? " — " + catatan.trim() : ""}`,
      }));
      const { error } = await supabase.from("kas_pembayaran").insert(rows);
      if (error) throw error;
      setDone(true);
      reset();
      await load();
      onChanged?.();
    } catch (e2) {
      setErr(e2.message || "Gagal mengirim pembayaran.");
    } finally {
      setBusy(false);
    }
  };

  const setVerif = async (row, status, tagihanStatus) => {
    if (!isPengurus) return;
    setActionBusy(row.id);
    setErr("");
    try {
      const verifier = verifierEmail || "pengurus";
      const { error: e1 } = await supabase
        .from("kas_pembayaran")
        .update({
          status,
          diverifikasi_oleh: verifier,
          diverifikasi_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (e1) throw e1;
      const tId = Number(row.tagihan_id);
      if (Number.isFinite(tId)) {
        const { error: e2 } = await supabase
          .from("kas_tagihan")
          .update({ status: tagihanStatus })
          .eq("id", tId);
        if (e2) throw e2;
      }
      if (status === "Disetujui") {
        await supabase.from("transaksi").insert({
          tgl: new Date().toISOString().slice(0, 10),
          periode: row.periode || "",
          kas: "Kas Umum",
          tipe: "masuk",
          nominal: Number(row.nominal || 0),
          ket: `${row.catatan || "Iuran"} — ${row.nama || ""} (${row.blok || ""})`,
        });
      }
      await load();
      onChanged?.();
    } catch (e2) {
      setErr(e2.message || "Gagal memverifikasi.");
    } finally {
      setActionBusy(null);
    }
  };

  const menunggu = paymentList.filter((p) => p.status === "Menunggu");
  const approved = paymentList.filter((p) => p.status === "Disetujui");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      {/* FORM BAYAR */}
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Bayar Iuran</h3>
            <p className="mt-1 text-sm muted">
              Centang tagihan (boleh satu atau semua), unggah bukti, lalu kirim.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {done && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={18} /> Pembayaran terkirim, menunggu verifikasi
            pengurus.
          </div>
        )}

        {loading ? (
          <p className="muted">Memuat tagihan…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="field flex-1"
                placeholder="Cari blok / nama…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="button"
                onClick={selectAllVisible}
                className="btn-outline text-sm"
              >
                Pilih semua
              </button>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearSel}
                  className="btn-outline text-sm"
                >
                  Kosongkan
                </button>
              )}
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/10 p-2">
              {filtered.length === 0 && (
                <p className="p-3 text-sm muted">
                  Tidak ada tagihan belum lunas.
                </p>
              )}
              {filtered.map((t) => {
                const on = selectedIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 ring-1 transition ${on ? "bg-teal-500/10 ring-teal-500/40" : "ring-white/10 hover:bg-white/5"}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4 accent-teal-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t.jenis || "Iuran"} · {t.blok}
                      </p>
                      <p className="text-xs muted">
                        {t.nama} · {t.periode} · {t.status}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {rp(t.nominal)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <span className="text-sm muted">
                {selected.length} tagihan dipilih
              </span>
              <span className="text-lg font-extrabold text-orange-400">
                {rp(totalBayar)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Metode</span>
                <select
                  className="field"
                  value={metode}
                  onChange={(e) => setMetode(e.target.value)}
                >
                  <option>Transfer</option>
                  <option>Tunai</option>
                  <option>E-Wallet</option>
                </select>
              </label>
              <div>
                <span className="mb-1 block text-sm font-medium">
                  Bukti (opsional)
                </span>
                <label className="btn-outline flex cursor-pointer items-center justify-center gap-2 text-sm">
                  <Upload size={16} /> {bukti ? "Ganti Bukti" : "Pilih Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={pick}
                    disabled={busy}
                  />
                </label>
              </div>
            </div>

            {preview && (
              <img
                src={preview}
                alt="bukti"
                className="h-40 w-full rounded-xl object-cover"
              />
            )}
            {bukti && (
              <p className="flex items-center gap-2 text-xs muted">
                <ImageIcon size={14} /> {bukti.name} (
                {(bukti.size / 1024).toFixed(0)} KB)
              </p>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Catatan</span>
              <textarea
                className="field"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="mis. transfer via BCA jam 10"
              />
            </label>

            {err && <p className="text-sm text-rose-400">{err}</p>}
            <button disabled={busy} className="btn-orange w-full">
              {busy
                ? "Mengirim…"
                : `Bayar ${selected.length || ""} tagihan · ${rp(totalBayar)}`}
            </button>
          </form>
        )}
      </div>

      {/* VERIFIKASI + DISETUJUI */}
      <div className="space-y-6">
        <div className="card p-5 sm:p-6">
          <h3 className="text-lg font-bold">Menunggu Verifikasi</h3>
          <p className="mt-1 text-sm muted">
            {isPengurus
              ? "Klik setujui / tolak untuk verifikasi."
              : "Diverifikasi oleh pengurus."}
          </p>
          <div className="mt-4 space-y-3">
            {menunggu.length === 0 ? (
              <p className="text-sm muted">Tidak ada pembayaran menunggu.</p>
            ) : (
              menunggu.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {p.nama} — {p.blok}
                      </p>
                      <p className="text-xs muted">
                        {p.periode} · {p.metode}
                      </p>
                      {p.catatan && (
                        <p className="mt-1 text-xs muted">{p.catatan}</p>
                      )}
                      {p.bukti && (
                        <img
                          src={p.bukti}
                          alt="bukti"
                          className="mt-2 h-32 w-full rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <p className="font-bold text-orange-400">{rp(p.nominal)}</p>
                  </div>
                  {isPengurus ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setVerif(p, "Disetujui", "Lunas")}
                        disabled={actionBusy === p.id}
                        className="btn-teal inline-flex items-center gap-2 text-sm"
                      >
                        <CircleCheck size={16} /> Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerif(p, "Ditolak", "Belum Bayar")}
                        disabled={actionBusy === p.id}
                        className="btn-outline inline-flex items-center gap-2 text-sm"
                      >
                        <CircleX size={16} /> Tolak
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                      <Clock3 size={13} /> Menunggu verifikasi pengurus
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-lg font-bold">Disetujui Terbaru</h3>
          <div className="mt-4 space-y-3">
            {approved.length === 0 ? (
              <p className="text-sm muted">Belum ada pembayaran disetujui.</p>
            ) : (
              approved.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {p.nama} — {p.blok}
                    </p>
                    <p className="text-xs text-emerald-300/80">
                      {p.periode} · {p.catatan}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <Clock3 size={12} /> {rp(p.nominal)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
