import { useEffect, useMemo, useRef, useState } from "react";
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
  ChevronDown,
  X,
  Trash2,
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

  // Dropdown pilih tagihan — supaya tidak makan tempat, daftar tagihan
  // cuma tampil saat tombol ini diklik, bukan list panjang yang selalu terbuka.
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Grup per rumah (blok+nama+periode) yang sedang di-expand untuk lihat jenis iuran lainnya.
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const load = async () => {
    setLoading(true);
    setErr("");
    if (!supabase) return setLoading(false);
    const [tRes, pRes] = await Promise.all([
      // Tagihan belum lunas biasanya tidak banyak, tapi tetap dibatasi untuk jaga-jaga.
      supabase
        .from("kas_tagihan")
        .select("*")
        .order("id", { ascending: false })
        .limit(500),
      // PENTING: dibatasi 200 baris terbaru — tanpa ini, tabel akan ditarik PENUH
      // setiap kali form dibuka dan makin lambat seiring waktu karena data historis menumpuk.
      // Kalau butuh lihat histori lama, sebaiknya buat halaman rekap terpisah dengan
      // filter periode + pagination, bukan menarik semuanya di sini.
      supabase
        .from("kas_pembayaran")
        .select("*")
        .order("id", { ascending: false })
        .limit(200),
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

  // Satu rumah (blok+nama+periode) sering punya beberapa jenis iuran sekaligus
  // (Kebersihan, Keamanan, Umum, dst). Supaya hemat ruang, tagihan-tagihan itu
  // digabung jadi satu grup — baris utama pakai jenis pertama sebagai label,
  // sisanya disembunyikan di dalam expand.
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const key = `${t.blok}|${t.nama}|${t.periode}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [filtered]);

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
    setDropdownOpen(false);
    setQ("");
    setOpenGroups({});
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

  // Inti logika verifikasi satu baris (TANPA reload/onChanged di dalamnya),
  // supaya bisa dipakai ulang oleh versi single maupun bulk tanpa reload berkali-kali.
  const applyVerif = async (row, status, tagihanStatus) => {
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
  };

  const setVerif = async (row, status, tagihanStatus) => {
    if (!isPengurus) return;
    setActionBusy(row.id);
    setErr("");
    try {
      await applyVerif(row, status, tagihanStatus);
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

  // Grup "Menunggu Verifikasi" per rumah juga — kalau ada puluhan/ratusan pembayaran
  // masuk bersamaan (mis. awal bulan), daftar tidak numpuk memanjang ke bawah tanpa batas.
  const [openMenunggu, setOpenMenunggu] = useState({});
  const menungguGrouped = useMemo(() => {
    const map = new Map();
    menunggu.forEach((p) => {
      const key = `${p.blok}|${p.nama}|${p.periode}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [menunggu]);

  // Setujui/tolak SEMUA tagihan dalam satu grup rumah sekaligus —
  // supaya pengurus tidak perlu klik satu-satu kalau satu rumah bayar banyak iuran bareng.
  const setVerifBulk = async (items, status, tagihanStatus) => {
    if (!isPengurus) return;
    const groupKey = items.map((i) => i.id).join(",");
    setActionBusy(groupKey);
    setErr("");
    try {
      for (const row of items) {
        // eslint-disable-next-line no-await-in-loop
        await applyVerif(row, status, tagihanStatus);
      }
      await load();
      onChanged?.();
    } catch (e2) {
      setErr(e2.message || "Gagal memverifikasi sebagian/semua pembayaran.");
    } finally {
      setActionBusy(null);
    }
  };

  // Hapus record pembayaran — khusus pengurus. Dipakai untuk membersihkan data
  // yang salah input/duplikat, BUKAN cara rutin "merapikan" riwayat pembayaran
  // (riwayat yang sah sebaiknya tetap disimpan untuk transparansi/audit kas).
  const removePayment = async (row) => {
    if (!isPengurus) return;
    const ok = window.confirm(
      `Hapus catatan pembayaran ${row.nama} — ${row.blok} (${row.catatan || "Iuran"})?\n\nTindakan ini permanen dan menghapus jejak riwayat pembayaran ini.`,
    );
    if (!ok) return;
    setActionBusy(row.id);
    setErr("");
    try {
      const { error } = await supabase
        .from("kas_pembayaran")
        .delete()
        .eq("id", row.id);
      if (error) throw error;
      await load();
      onChanged?.();
    } catch (e2) {
      setErr(e2.message || "Gagal menghapus pembayaran.");
    } finally {
      setActionBusy(null);
    }
  };

  // Grup "Disetujui Terbaru" per rumah (blok+nama+periode) supaya tidak numpuk
  // satu baris per jenis iuran — sama seperti pola grouping di dropdown pilih tagihan.
  const [openApproved, setOpenApproved] = useState({});
  const approvedGrouped = useMemo(() => {
    const map = new Map();
    approved.forEach((p) => {
      const key = `${p.blok}|${p.nama}|${p.periode}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    // urut berdasarkan pembayaran terbaru di tiap grup (paymentList sudah order id desc)
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }, [approved]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      {/* FORM BAYAR */}
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Bayar Iuran</h3>
            <p className="mt-1 text-sm muted">
              Pilih tagihan lewat dropdown, unggah bukti, lalu kirim.
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
            {/* Dropdown pilih tagihan */}
            <div>
              <span className="mb-1 block text-sm font-medium">
                Pilih Tagihan
              </span>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="field flex w-full items-center justify-between text-left"
                >
                  <span className={selected.length ? "" : "muted"}>
                    {selected.length === 0
                      ? "Pilih tagihan…"
                      : `${selected.length} tagihan dipilih · ${rp(totalBayar)}`}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#17171b] p-3 shadow-2xl">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <input
                        className="field flex-1"
                        placeholder="Cari blok / nama / jenis…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={selectAllVisible}
                        className="btn-outline px-2.5 py-1.5 text-xs"
                      >
                        Pilih semua
                      </button>
                      {selectedIds.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSel}
                          className="btn-outline px-2.5 py-1.5 text-xs"
                        >
                          Kosongkan
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 space-y-1.5 overflow-y-auto">
                      {grouped.length === 0 && (
                        <p className="p-3 text-sm muted">
                          Tidak ada tagihan belum lunas.
                        </p>
                      )}
                      {grouped.map(({ key, items }) => {
                        const allOn = items.every((i) =>
                          selectedIds.includes(i.id),
                        );
                        const someOn = items.some((i) =>
                          selectedIds.includes(i.id),
                        );
                        const isOpen = !!openGroups[key];
                        const first = items[0];
                        const totalGroup = items.reduce(
                          (s, i) => s + Number(i.nominal || 0),
                          0,
                        );
                        const hasMore = items.length > 1;

                        const toggleGroup = () => {
                          if (allOn) {
                            setSelectedIds((prev) =>
                              prev.filter(
                                (id) => !items.some((i) => i.id === id),
                              ),
                            );
                          } else {
                            setSelectedIds((prev) => [
                              ...new Set([...prev, ...items.map((i) => i.id)]),
                            ]);
                          }
                        };

                        return (
                          <div
                            key={key}
                            className="overflow-hidden rounded-lg ring-1 ring-white/10"
                          >
                            {/* Baris ringkas: 1 rumah = 1 baris, jenis pertama jadi label */}
                            <div
                              className={`flex items-center gap-3 p-2.5 transition ${someOn ? "bg-teal-500/10" : "hover:bg-white/5"}`}
                            >
                              <input
                                type="checkbox"
                                checked={allOn}
                                ref={(el) => {
                                  if (el) el.indeterminate = someOn && !allOn;
                                }}
                                onChange={toggleGroup}
                                className="h-4 w-4 shrink-0 accent-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  hasMore &&
                                  setOpenGroups((o) => ({
                                    ...o,
                                    [key]: !o[key],
                                  }))
                                }
                                className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {first.jenis || "Iuran"} · {first.blok}
                                  </p>
                                  <p className="truncate text-xs muted">
                                    {first.nama} · {first.periode}
                                    {hasMore
                                      ? ` · ${items.length} tagihan`
                                      : ""}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="text-sm font-semibold">
                                    {rp(totalGroup)}
                                  </span>
                                  {hasMore && (
                                    <ChevronDown
                                      size={14}
                                      className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                    />
                                  )}
                                </div>
                              </button>
                            </div>

                            {/* Expand: jenis iuran lain dalam rumah yang sama */}
                            {hasMore && isOpen && (
                              <div className="space-y-1 border-t border-white/10 bg-white/[0.02] p-2 pl-9">
                                {items.map((t) => {
                                  const on = selectedIds.includes(t.id);
                                  return (
                                    <label
                                      key={t.id}
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 ring-1 transition ${on ? "bg-teal-500/10 ring-teal-500/40" : "ring-white/5 hover:bg-white/5"}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={on}
                                        onChange={() => toggle(t.id)}
                                        className="h-3.5 w-3.5 accent-teal-500"
                                      />
                                      <span className="flex-1 truncate text-xs">
                                        {t.jenis || "Iuran"}
                                      </span>
                                      <span className="text-xs font-semibold">
                                        {rp(t.nominal)}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="btn-teal px-3 py-1.5 text-xs"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Ringkasan tagihan terpilih sebagai chip kecil, bisa dihapus per item */}
              {selected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 py-1 pl-2.5 pr-1.5 text-xs text-teal-300 ring-1 ring-teal-500/30"
                    >
                      {t.jenis || "Iuran"} · {t.blok}
                      <button
                        type="button"
                        onClick={() => toggle(t.id)}
                        className="rounded-full p-0.5 hover:bg-teal-500/20 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold">Menunggu Verifikasi</h3>
            {menungguGrouped.length > 0 && (
              <span className="shrink-0 text-xs muted">
                {menunggu.length} pembayaran
              </span>
            )}
          </div>
          <p className="mt-1 text-sm muted">
            {isPengurus
              ? "Klik setujui / tolak untuk verifikasi."
              : "Diverifikasi oleh pengurus."}
          </p>

          {/* PENTING: dibatasi tinggi + scroll internal — kalau ada puluhan/ratusan
              pembayaran menunggu sekaligus (mis. awal bulan), panel ini tidak akan
              memanjang ke bawah tanpa batas dan bikin seluruh halaman jadi sangat panjang. */}
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {menungguGrouped.length === 0 ? (
              <p className="text-sm muted">Tidak ada pembayaran menunggu.</p>
            ) : (
              menungguGrouped.map(({ key, items }) => {
                const first = items[0];
                const totalGroup = items.reduce(
                  (s, p) => s + Number(p.nominal || 0),
                  0,
                );
                const hasMore = items.length > 1;
                const isOpen = !!openMenunggu[key];
                const bulkKey = items.map((i) => i.id).join(",");
                const bulkBusy = actionBusy === bulkKey;

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        hasMore &&
                        setOpenMenunggu((o) => ({ ...o, [key]: !o[key] }))
                      }
                      className="flex w-full items-start justify-between gap-3 p-4 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {first.nama} — {first.blok}
                        </p>
                        <p className="truncate text-xs muted">
                          {first.periode}
                          {hasMore
                            ? ` · ${items.length} pembayaran`
                            : ` · ${first.metode}`}
                        </p>
                        {!hasMore && first.catatan && (
                          <p className="mt-1 truncate text-xs muted">
                            {first.catatan}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="font-bold text-orange-400">
                          {rp(totalGroup)}
                        </p>
                        {hasMore && (
                          <ChevronDown
                            size={14}
                            className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Aksi: kalau cuma 1 pembayaran, tombol setujui/tolak langsung.
                        Kalau grup (>1), tampilkan tombol "Setujui/Tolak Semua" biar tidak klik satu-satu. */}
                    {isPengurus && (
                      <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {!hasMore ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setVerif(first, "Disetujui", "Lunas")
                              }
                              disabled={actionBusy === first.id}
                              className="btn-teal inline-flex items-center gap-2 text-sm"
                            >
                              <CircleCheck size={16} /> Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setVerif(first, "Ditolak", "Belum Bayar")
                              }
                              disabled={actionBusy === first.id}
                              className="btn-outline inline-flex items-center gap-2 text-sm"
                            >
                              <CircleX size={16} /> Tolak
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setVerifBulk(items, "Disetujui", "Lunas")
                              }
                              disabled={bulkBusy}
                              className="btn-teal inline-flex items-center gap-2 text-sm"
                            >
                              <CircleCheck size={16} /> Setujui Semua (
                              {items.length})
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setVerifBulk(items, "Ditolak", "Belum Bayar")
                              }
                              disabled={bulkBusy}
                              className="btn-outline inline-flex items-center gap-2 text-sm"
                            >
                              <CircleX size={16} /> Tolak Semua
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {!isPengurus && !hasMore && (
                      <p className="mx-4 mb-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                        <Clock3 size={13} /> Menunggu verifikasi pengurus
                      </p>
                    )}

                    {/* Expand: rincian per pembayaran dalam grup, dengan aksi per item juga */}
                    {hasMore && isOpen && (
                      <div className="space-y-2 border-t border-white/10 bg-black/10 p-3 pl-4">
                        {items.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-xl bg-white/[0.03] p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {p.catatan || "Iuran"}
                                </p>
                                <p className="text-xs muted">{p.metode}</p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold text-orange-400">
                                {rp(p.nominal)}
                              </span>
                            </div>
                            {p.bukti && (
                              <img
                                src={p.bukti}
                                alt="bukti"
                                className="mt-2 h-24 w-full rounded-lg object-cover"
                              />
                            )}
                            {isPengurus && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVerif(p, "Disetujui", "Lunas")
                                  }
                                  disabled={actionBusy === p.id}
                                  className="btn-teal px-2.5 py-1 text-xs"
                                >
                                  Setujui
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVerif(p, "Ditolak", "Belum Bayar")
                                  }
                                  disabled={actionBusy === p.id}
                                  className="btn-outline px-2.5 py-1 text-xs"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-lg font-bold">Disetujui Terbaru</h3>
          <div className="mt-4 space-y-2">
            {approvedGrouped.length === 0 ? (
              <p className="text-sm muted">Belum ada pembayaran disetujui.</p>
            ) : (
              approvedGrouped.slice(0, 6).map(({ key, items }) => {
                const first = items[0];
                const totalGroup = items.reduce(
                  (s, p) => s + Number(p.nominal || 0),
                  0,
                );
                const hasMore = items.length > 1;
                const isOpen = !!openApproved[key];

                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10"
                  >
                    <div className="flex w-full items-center justify-between gap-3 p-4">
                      <button
                        type="button"
                        onClick={() =>
                          hasMore &&
                          setOpenApproved((o) => ({ ...o, [key]: !o[key] }))
                        }
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {first.nama} — {first.blok}
                          </p>
                          <p className="truncate text-xs text-emerald-300/80">
                            {first.periode}
                            {hasMore
                              ? ` · ${items.length} iuran lunas`
                              : ` · ${first.catatan || "Iuran"}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <Clock3 size={12} /> {rp(totalGroup)}
                          </span>
                          {hasMore && (
                            <ChevronDown
                              size={14}
                              className={`text-emerald-300/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </button>

                      {!hasMore && isPengurus && (
                        <button
                          type="button"
                          onClick={() => removePayment(first)}
                          disabled={actionBusy === first.id}
                          title="Hapus catatan pembayaran ini"
                          className="shrink-0 rounded-lg p-1.5 text-emerald-300/60 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {hasMore && isOpen && (
                      <div className="space-y-1.5 border-t border-emerald-500/20 bg-black/10 p-3 pl-4">
                        {items.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="truncate text-emerald-100/90">
                              {p.catatan || "Iuran"}
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="font-medium text-emerald-300">
                                {rp(p.nominal)}
                              </span>
                              {isPengurus && (
                                <button
                                  type="button"
                                  onClick={() => removePayment(p)}
                                  disabled={actionBusy === p.id}
                                  title="Hapus catatan pembayaran ini"
                                  className="rounded-lg p-1 text-emerald-300/60 hover:bg-rose-500/10 hover:text-rose-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
