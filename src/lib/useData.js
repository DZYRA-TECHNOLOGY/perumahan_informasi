import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import * as local from "../data/siteplan.js";

// Ambil tabel. Fallback ke data contoh HANYA jika Supabase mati atau tabel belum
// dibuat (error). Kalau tabel ada tapi kosong → kembalikan kosong (data asli).
async function fetchTable(name, fallback, order = "id") {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from(name)
    .select("*")
    .order(order, { ascending: true });
  if (error) return fallback;
  return data || [];
}

const emptyState = {
  iuran: [],
  kas: [],
  transaksi: [],
  agenda: [],
  usaha: [],
  pengumuman: [],
  dataWarga: [],
  keuangan: [],
  iuranAir: [],
  struktur: [],
  lokasi: local.lokasi,
  kasMaster: [],
  kasTagihan: [],
  kasPembayaran: [],
  jadwal: local.jadwalSampah,
  source: "supabase",
};

const localState = {
  iuran: local.iuran,
  kas: local.kas,
  transaksi: local.transaksi,
  agenda: local.agenda,
  usaha: local.usahaWarga,
  pengumuman: local.pengumuman,
  dataWarga: local.dataWarga,
  keuangan: local.keuanganRows,
  iuranAir: local.iuranAir,
  struktur: local.struktur,
  lokasi: local.lokasi,
  kasMaster: local.kasMasterDemo,
  kasTagihan: [],
  kasPembayaran: [],
  jadwal: local.jadwalSampah,
  source: "lokal",
};

export function useData() {
  const [state, setState] = useState(supabase ? emptyState : localState);
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    if (!supabase) return;
    (async () => {
      const [
        iuran,
        kas,
        transaksi,
        agenda,
        usaha,
        pengumuman,
        dataWarga,
        keuangan,
        iuranAir,
        struktur,
        pengaturan,
        kasMaster,
        kasTagihan,
        kasPembayaran,
        jadwal,
      ] = await Promise.all([
        fetchTable("iuran", local.iuran),
        fetchTable("kas", local.kas),
        fetchTable("transaksi", local.transaksi),
        fetchTable("agenda", local.agenda),
        fetchTable("usaha", local.usahaWarga),
        fetchTable("pengumuman", local.pengumuman),
        fetchTable("data_warga", local.dataWarga),
        fetchTable("keuangan", local.keuanganRows),
        fetchTable("iuran_air", local.iuranAir),
        fetchTable("struktur", local.struktur, "urutan"),
        fetchTable("pengaturan", [local.lokasi]),
        fetchTable("kas_master", []),
        fetchTable("kas_tagihan", []),
        fetchTable("kas_pembayaran", []),
        fetchTable("jadwal_sampah", local.jadwalSampah),
      ]);
      if (alive)
        setState({
          iuran,
          kas,
          transaksi,
          agenda,
          usaha,
          pengumuman,
          dataWarga,
          keuangan,
          iuranAir,
          struktur,
          lokasi: pengaturan[0] || local.lokasi,
          kasMaster,
          kasTagihan,
          kasPembayaran,
          jadwal,
          source: "supabase",
        });
    })();
    return () => {
      alive = false;
    };
  }, [nonce]);

  useEffect(() => {
    const on = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", on);
    document.addEventListener("visibilitychange", on);
    return () => {
      window.removeEventListener("focus", on);
      document.removeEventListener("visibilitychange", on);
    };
  }, [reload]);

  return { ...state, reload };
}
