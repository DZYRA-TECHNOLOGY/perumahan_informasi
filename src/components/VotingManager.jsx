import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import CrudTable from "./CrudTable.jsx";
import Swal from "sweetalert2";

const info = (title, text) =>
  Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#f97316",
    background: "#17171b",
    color: "#fff",
  });

// Kelola voting: pertanyaan (di pengaturan) + opsi jawaban (CRUD) + reset suara.
export default function VotingManager({ preview, onChanged }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("pengaturan")
      .select("voting_pertanyaan")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.voting_pertanyaan) setPertanyaan(data.voting_pertanyaan);
      });
  }, []);

  const savePertanyaan = async () => {
    if (preview) return info("Mode Preview", "Klik Masuk untuk mengubah data asli.");
    setBusy(true);
    const { error } = await supabase
      .from("pengaturan")
      .upsert({ id: 1, voting_pertanyaan: pertanyaan.trim() });
    setBusy(false);
    if (error)
      return Swal.fire({ icon: "error", title: "Gagal", text: error.message, confirmButtonColor: "#f97316", background: "#17171b", color: "#fff" });
    onChanged?.();
    Swal.fire({ icon: "success", title: "Pertanyaan disimpan", timer: 1500, showConfirmButton: false, background: "#17171b", color: "#fff" });
  };

  const resetSuara = async () => {
    if (preview) return info("Mode Preview", "Klik Masuk untuk mengubah data asli.");
    const res = await Swal.fire({
      title: "Reset semua suara?",
      text: "Semua perolehan suara akan dikembalikan ke 0.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Reset",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      background: "#17171b",
      color: "#fff",
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;
    const { error } = await supabase.from("voting_opsi").update({ suara: 0 }).gte("id", 0);
    if (error)
      return Swal.fire({ icon: "error", title: "Gagal", text: error.message, confirmButtonColor: "#f97316", background: "#17171b", color: "#fff" });
    setRefreshKey((k) => k + 1);
    onChanged?.();
    Swal.fire({ icon: "success", title: "Suara direset", timer: 1400, showConfirmButton: false, background: "#17171b", color: "#fff" });
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 lg:p-6">
        <h3 className="font-bold">Pertanyaan Voting</h3>
        <p className="mt-1 text-sm muted">Pertanyaan yang tampil di beranda & halaman warga.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="field min-w-[240px] flex-1"
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
            placeholder="Tulis pertanyaan polling…"
          />
          <button onClick={savePertanyaan} disabled={busy} className="btn-orange">
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
          <button onClick={resetSuara} className="btn-outline">
            Reset Suara
          </button>
        </div>
      </div>

      <CrudTable
        key={refreshKey}
        title="Opsi Jawaban"
        table="voting_opsi"
        fallback={[]}
        preview={preview}
        onChanged={onChanged}
        fields={[
          { name: "teks", label: "Opsi Jawaban" },
          { name: "suara", label: "Suara", type: "number" },
        ]}
      />
    </div>
  );
}
