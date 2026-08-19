import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import CrudTable from "./CrudTable.jsx";
import { Icon } from "./icons.jsx";

// Generate tagihan ITEMIZED: tiap warga × tiap jenis iuran aktif (dari kas_master).
export default function TagihanManager({ onChanged, preview }) {
  const [periode, setPeriode] = useState("");
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const generate = async () => {
    if (preview) return alert("Masuk dulu untuk membuat tagihan.");
    if (!periode.trim()) return setMsg("Isi periode dulu, mis. 'Agustus 2026'.");
    setBusy(true);
    setMsg("");
    try {
      const [{ data: warga }, { data: fees }, { data: existing }] = await Promise.all([
        supabase.from("data_warga").select("*"),
        supabase.from("kas_master").select("*").eq("aktif", true).eq("wajib", true),
        supabase.from("kas_tagihan").select("blok,jenis").eq("periode", periode.trim()),
      ]);
      const wl = (warga || []).filter((w) => w.ket !== "Kosong");
      const fl = fees || [];
      if (wl.length === 0) return setMsg("Belum ada data warga (dihuni/dikontrakkan).");
      if (fl.length === 0) return setMsg("Belum ada jenis iuran aktif. Isi menu 'Jenis Iuran' dulu.");

      const sudah = new Set((existing || []).map((e) => `${e.blok}|${e.jenis}`));
      const rows = [];
      for (const w of wl)
        for (const f of fl) {
          if (sudah.has(`${w.blok}|${f.nama}`)) continue;
          rows.push({
            blok: w.blok,
            nama: w.penghuni || w.pemilik || "-",
            periode: periode.trim(),
            jenis: f.nama,
            nominal: Number(f.nominal) || 0,
            status: "Belum Bayar",
            jatuh_tempo: jatuhTempo || null,
          });
        }
      if (rows.length === 0) return setMsg(`Semua tagihan untuk "${periode.trim()}" sudah dibuat.`);

      const { error } = await supabase.from("kas_tagihan").insert(rows);
      if (error) throw error;
      setMsg(`✓ Berhasil membuat ${rows.length} tagihan (${wl.length} warga × ${fl.length} jenis).`);
      setRefreshKey((k) => k + 1);
      onChanged?.();
    } catch (e) {
      setMsg("Gagal: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={18} className="text-teal-400" />
          <h3 className="font-bold">Generate Tagihan Massal</h3>
        </div>
        <p className="mt-1 text-sm muted">
          Membuat tagihan untuk semua warga × semua jenis iuran aktif (Umum, Keamanan,
          Kebersihan, Air). Nominal diambil dari menu <b>Jenis Iuran</b>. Yang sudah ada dilewati.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Periode</span>
            <input className="field" placeholder="Agustus 2026" value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Jatuh tempo (opsional)</span>
            <input className="field" type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} />
          </label>
          <div className="flex items-end">
            <button onClick={generate} disabled={busy} className="btn-teal w-full">
              {busy ? "Membuat…" : "Generate"}
            </button>
          </div>
        </div>
        {msg && <p className={`mt-3 text-sm ${msg.startsWith("Gagal") ? "text-rose-400" : "text-emerald-400"}`}>{msg}</p>}
      </div>

      <CrudTable
        key={refreshKey}
        title="Daftar Tagihan"
        table="kas_tagihan"
        fallback={[]}
        preview={preview}
        onChanged={onChanged}
        fields={[
          { name: "blok", label: "Blok" },
          { name: "nama", label: "Nama" },
          { name: "periode", label: "Periode" },
          { name: "jenis", label: "Jenis" },
          { name: "nominal", label: "Nominal", type: "number", money: true },
          { name: "status", label: "Status", options: ["Belum Bayar", "Menunggu", "Lunas"] },
          { name: "jatuh_tempo", label: "Jatuh Tempo", type: "date", optional: true },
        ]}
      />
    </div>
  );
}
