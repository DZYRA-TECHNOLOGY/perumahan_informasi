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
  const awal = Object.fromEntries(kasList.map((k) => [k.nama, n(k.saldo_awal)]));

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
