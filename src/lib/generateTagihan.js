import { supabase } from "./supabase";

export async function generateTagihan() {
  const bulan = new Date().toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // cek apakah bulan ini sudah pernah dibuat
  const { data: cek } = await supabase
    .from("kas_tagihan")
    .select("id")
    .eq("periode", bulan)
    .limit(1);

  if (cek?.length) {
    throw new Error("Tagihan bulan ini sudah dibuat.");
  }

  // data warga
  const { data: warga, error: errWarga } = await supabase
    .from("data_warga")
    .select("*")
    .neq("ket", "Kosong");

  if (errWarga) throw errWarga;

  // daftar iuran
  const { data: iuran, error: errIuran } = await supabase
    .from("iuran")
    .select("*");

  if (errIuran) throw errIuran;

  const nominal = iuran.reduce((s, x) => s + Number(x.nominal || 0), 0);

  const rows = warga.map((w) => ({
    blok: w.blok,
    penghuni: w.penghuni,
    periode: bulan,
    nominal,
    status: "Belum Bayar",
  }));

  const { error } = await supabase.from("kas_tagihan").insert(rows);

  if (error) throw error;

  return rows.length;
}
