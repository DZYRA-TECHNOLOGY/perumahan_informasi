// Semua perhitungan uang terpusat di sini — dihitung dari tabel transaksi,
// bukan diinput manual.

const n = (v) => Number(v || 0);
const sum = (arr, tipe) =>
  arr.filter((x) => x.tipe === tipe).reduce((s, x) => s + n(x.nominal), 0);

// Saldo tiap kas = saldo awal + total masuk − total keluar (dari transaksi).
export function computeKas(kasList = [], transaksi = []) {
  const names = [
    ...new Set([
      ...kasList.map((k) => k.nama),
      ...transaksi.map((t) => t.kas).filter(Boolean),
    ]),
  ];
  const awal = Object.fromEntries(
    kasList.map((k) => [k.nama, n(k.saldo_awal)]),
  );

  const rows = names.map((nama) => {
    const t = transaksi.filter((x) => (x.kas || "") === nama);
    const masuk = sum(t, "masuk");
    const keluar = sum(t, "keluar");
    return {
      nama,
      saldo_awal: awal[nama] || 0,
      masuk,
      keluar,
      saldo: (awal[nama] || 0) + masuk - keluar,
    };
  });

  const totalAwal = kasList.reduce((s, k) => s + n(k.saldo_awal), 0);
  const totalMasuk = sum(transaksi, "masuk");
  const totalKeluar = sum(transaksi, "keluar");
  return {
    rows,
    totalAwal,
    totalMasuk,
    totalKeluar,
    total: totalAwal + totalMasuk - totalKeluar,
  };
}

// "Iuran Keamanan" → "Kas Keamanan"
export const kasNameFor = (jenis) =>
  "Kas " + String(jenis).replace(/^iuran\s+/i, "").trim();

// Saldo kas yang MENGIKUTI Jenis Iuran aktif (kas_master). Kalau sebuah jenis
// dihapus/nonaktif, kasnya otomatis hilang dari ringkasan & landing.
// Fallback ke computeKas biasa bila katalog jenis belum ada (mis. mode demo).
export function computeKasByJenis(kasMaster = [], kasList = [], transaksi = []) {
  const active = (kasMaster || []).filter(
    (m) => m.aktif !== false && m.aktif !== "false",
  );
  // Tidak ada jenis iuran aktif → tidak ada kas sama sekali (bukan fallback lama).
  if (active.length === 0)
    return { rows: [], totalAwal: 0, totalMasuk: 0, totalKeluar: 0, total: 0 };

  const awal = Object.fromEntries(
    (kasList || []).map((k) => [k.nama, n(k.saldo_awal)]),
  );
  const names = [...new Set(active.map((m) => kasNameFor(m.nama)))];

  const rows = names.map((nama) => {
    const t = transaksi.filter((x) => (x.kas || "") === nama);
    const masuk = sum(t, "masuk");
    const keluar = sum(t, "keluar");
    const a = awal[nama] || 0;
    return { nama, saldo_awal: a, masuk, keluar, saldo: a + masuk - keluar };
  });

  const totalAwal = rows.reduce((s, r) => s + r.saldo_awal, 0);
  const totalMasuk = rows.reduce((s, r) => s + r.masuk, 0);
  const totalKeluar = rows.reduce((s, r) => s + r.keluar, 0);
  return {
    rows,
    totalAwal,
    totalMasuk,
    totalKeluar,
    total: totalAwal + totalMasuk - totalKeluar,
  };
}

// Rekap keuangan per periode — dikelompokkan otomatis dari transaksi.
export function computeKeuangan(transaksi = []) {
  const periodeList = [
    ...new Set(transaksi.map((t) => t.periode).filter(Boolean)),
  ].sort();
  const byPeriode = (p) => transaksi.filter((t) => (t.periode || "") === p);
  return { periodeList, byPeriode };
}

// Rekap iuran air (rupiah) dari status Lunas / Belum Bayar.
export function computeIuranAir(rows = []) {
  const terkumpul = rows
    .filter((r) => r.status === "Lunas")
    .reduce((s, r) => s + n(r.tagihan), 0);
  const tunggakan = rows
    .filter((r) => r.status !== "Lunas")
    .reduce((s, r) => s + n(r.tagihan), 0);
  return { terkumpul, tunggakan, total: terkumpul + tunggakan };
}
// const n = (v) => Number(v || 0);

export function computeKasTagihan(kasTagihan = [], kasPembayaran = []) {
  const totalTagihan = kasTagihan.reduce((s, r) => s + n(r.nominal), 0);

  const totalLunas = kasTagihan
    .filter((r) => r.status === "Lunas")
    .reduce((s, r) => s + n(r.nominal), 0);

  const totalMenunggu = kasPembayaran
    .filter((r) => r.status === "Menunggu")
    .reduce((s, r) => s + n(r.nominal), 0);

  const totalDisetujui = kasPembayaran
    .filter((r) => r.status === "Disetujui")
    .reduce((s, r) => s + n(r.nominal), 0);

  const totalTunggakan = kasTagihan
    .filter((r) => r.status !== "Lunas")
    .reduce((s, r) => s + n(r.nominal), 0);

  return {
    totalTagihan,
    totalLunas,
    totalMenunggu,
    totalDisetujui,
    totalTunggakan,
    sisaTagihan: Math.max(0, totalTagihan - totalDisetujui),
  };
}
