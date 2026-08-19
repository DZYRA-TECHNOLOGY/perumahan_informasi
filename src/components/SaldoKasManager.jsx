import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import Swal from "sweetalert2";

const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
// "Iuran Keamanan" → "Kas Keamanan"; "Sumbangan HUT RI" → "Kas Sumbangan HUT RI"
const kasNameFor = (jenis) => "Kas " + String(jenis).replace(/^iuran\s+/i, "").trim();

// Daftar kas OTOMATIS mengikuti Jenis Iuran (kas_master). Tak perlu tambah manual —
// pengurus hanya mengisi/mengubah SALDO AWAL tiap kas.
export default function SaldoKasManager({ preview, onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    if (preview || !supabase) {
      setRows(
        ["Kas Umum", "Kas Keamanan", "Kas Kebersihan", "Kas Air"].map((nama) => ({
          nama,
          saldo_awal: 0,
        })),
      );
      setLoading(false);
      return;
    }
    const [{ data: fees }, { data: kasRows }] = await Promise.all([
      supabase.from("kas_master").select("*").eq("aktif", true),
      supabase.from("kas").select("*"),
    ]);
    const byName = new Map((kasRows || []).map((k) => [k.nama, k]));
    const seen = new Set();
    const list = [];
    for (const f of fees || []) {
      const nama = kasNameFor(f.nama);
      if (seen.has(nama)) continue;
      seen.add(nama);
      const ex = byName.get(nama);
      list.push({ nama, saldo_awal: ex?.saldo_awal ?? 0, id: ex?.id });
    }
    setRows(list);
    setLoading(false);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const setSaldo = (nama, val) =>
    setRows((rs) => rs.map((r) => (r.nama === nama ? { ...r, saldo_awal: val } : r)));

  const save = async () => {
    if (preview)
      return Swal.fire({
        icon: "info",
        title: "Mode Preview",
        text: "Klik Masuk untuk mengelola data asli.",
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
    setBusy(true);
    try {
      for (const r of rows) {
        const payload = { nama: r.nama, saldo_awal: Number(r.saldo_awal) || 0 };
        const { error } = r.id
          ? await supabase.from("kas").update(payload).eq("id", r.id)
          : await supabase.from("kas").insert(payload);
        if (error) throw error;
      }
      await load();
      onChanged?.();
      Swal.fire({
        icon: "success",
        title: "Saldo awal tersimpan",
        timer: 1500,
        showConfirmButton: false,
        background: "#17171b",
        color: "#fff",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: e.message,
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-bold">Saldo Kas</h3>
        <p className="text-xs muted">
          Daftar kas otomatis mengikuti <b>Jenis Iuran</b>. Untuk menambah kas baru,
          tambahkan jenis iuran di menu <b>Jenis Iuran</b>. Di sini cukup isi/ubah saldo awal.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nama Kas</th>
              <th className="px-4 py-3 font-medium">Saldo Awal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td className="px-4 py-6 muted" colSpan={2}>Memuat…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-6 muted" colSpan={2}>Belum ada jenis iuran. Tambahkan di menu Jenis Iuran.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.nama} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium">{r.nama}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs muted">Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={r.saldo_awal}
                      onChange={(e) => setSaldo(r.nama, e.target.value)}
                      className="field max-w-[180px] py-1.5"
                    />
                    <span className="hidden text-xs muted sm:inline">{rp(r.saldo_awal)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button onClick={save} disabled={busy || loading} className="btn-orange">
          {busy ? "Menyimpan…" : "Simpan Saldo Awal"}
        </button>
      </div>
    </div>
  );
}
