// Data Cluster Sigerland — Desa Sabah Balau, Kec. Jati Agung, Kab. Lampung Selatan
// Diekstrak dari siteplan resmi. Angka iuran/kas adalah CONTOH untuk demo —
// ganti dengan data riil warga (atau tarik dari Supabase) saat produksi.

export const profil = {
  nama: "Cluster Sigerland",
  desa: "Desa Sabah Balau",
  kecamatan: "Kecamatan Jati Agung",
  kabupaten: "Kabupaten Lampung Selatan",
  tagline: "Bersama, Rukun, & Transparan",
};

// Status kavling sesuai legenda siteplan
export const STATUS = {
  AKAD: { label: "Sudah AKAD", color: "#2f4fd6" },
  TERJUAL: { label: "Terbooking / Terjual", color: "#e57373" },
  READY: { label: "Ready Belum Terjual", color: "#f5e6c8" },
  INDENT: { label: "Indent Belum Terjual", color: "#ffffff" },
  FASUM: { label: "Fasilitas Umum", color: "#39d353" },
  CONTOH: { label: "Rumah Contoh (Tidak Dijual)", color: "#e39ff6" },
};

// Ringkasan per blok (jumlah & DP sesuai catatan siteplan)
export const blok = [
  { kode: "A", rentang: "A1–A31", jumlah: 31, dp: 5_000_000 },
  { kode: "B", rentang: "B1–B28", jumlah: 28, dp: 5_000_000 },
  { kode: "B", rentang: "B29–B57", jumlah: 29, dp: 3_000_000 },
  { kode: "C", rentang: "Blok C", jumlah: 30, dp: 3_000_000 },
  { kode: "D", rentang: "Blok D", jumlah: 43, dp: 3_000_000 },
  { kode: "E", rentang: "Blok E", jumlah: 45, dp: 3_000_000 },
  { kode: "F", rentang: "Blok F", jumlah: 30, dp: 3_000_000 },
];

// Rekap hunian (contoh)
export const hunian = {
  ditempati: 148,
  dikontrakkan: 22,
  kosong: 66,
  get total() {
    return this.ditempati + this.dikontrakkan + this.kosong;
  },
};

// Iuran bulanan warga (contoh) — inti dari transparansi
export const iuran = [
  { jenis: "Iuran Sampah", nominal: 25_000, periode: "per bulan" },
  { jenis: "Iuran Keamanan", nominal: 30_000, periode: "per bulan" },
  { jenis: "Iuran Kebersihan", nominal: 15_000, periode: "per bulan" },
];

// Kas / saldo (contoh)
export const kas = [
  { nama: "Kas Umum", saldo: 4_250_000 },
  { nama: "Kas Keamanan", saldo: 1_980_000 },
  { nama: "Kas Kebersihan", saldo: 1_120_000 },
];

// Riwayat transaksi terbaru (contoh)
export const transaksi = [
  {
    tgl: "2026-07-20",
    ket: "Iuran keamanan 148 rumah",
    tipe: "masuk",
    nominal: 4_440_000,
  },
  {
    tgl: "2026-07-18",
    ket: "Gaji Satpam (Jul)",
    tipe: "keluar",
    nominal: 3_600_000,
  },
  {
    tgl: "2026-07-15",
    ket: "Iuran sampah 148 rumah",
    tipe: "masuk",
    nominal: 3_700_000,
  },
  {
    tgl: "2026-07-12",
    ket: "Angkut sampah TPS",
    tipe: "keluar",
    nominal: 2_100_000,
  },
  {
    tgl: "2026-07-05",
    ket: "Beli alat kebersihan taman",
    tipe: "keluar",
    nominal: 450_000,
  },
];

// Jadwal kebersihan & agenda (contoh)
export const agenda = [
  {
    tgl: "2026-07-27",
    judul: "Kerja bakti bulanan (semua blok)",
    kategori: "Kebersihan",
  },
  {
    tgl: "2026-07-30",
    judul: "Rapat pengurus & laporan kas Juli",
    kategori: "Rapat",
  },
  { tgl: "2026-08-17", judul: "Peringatan HUT RI ke-81", kategori: "Kegiatan" },
];

export const jadwalSampah = [
  { hari: "Senin & Kamis", wilayah: "Blok A, B" },
  { hari: "Selasa & Jumat", wilayah: "Blok C, D" },
  { hari: "Rabu & Sabtu", wilayah: "Blok E, F" },
];

// Usaha & jasa warga (gaya listing)
export const usahaWarga = [
  {
    id: 1,
    nama: "Bisma Transporta",
    kategori: "Rental Mobil",
    blok: "B12",
    harga: 350_000,
    satuan: "/hari",
    rating: 4.9,
    ulasan: 37,
    emoji: "🚗",
    warna: "from-sky-400 to-blue-600",
    wa: "6281200000001",
    desc: "Rental mobil all unit + driver, siap antar Bandar Lampung & sekitarnya. Armada lengkap: Avanza, Innova, Hiace. Bisa harian atau mingguan.",
  },
  {
    id: 2,
    nama: "Kontrakan B7",
    kategori: "Kontrakan",
    blok: "B7",
    harga: 800_000,
    satuan: "/bulan",
    rating: 4.8,
    ulasan: 12,
    emoji: "🏠",
    warna: "from-emerald-400 to-teal-600",
    wa: "6281200000002",
    desc: "2 kamar tidur, sumur bor, listrik 1300W, full pagar, 10 menit ke ITERA. Sudah ada dapur, ruang tamu, bisa parkir mobil.",
  },
  {
    id: 3,
    nama: "Catering Bu Sri",
    kategori: "Makanan",
    blok: "A9",
    harga: 15_000,
    satuan: "/porsi",
    rating: 5.0,
    ulasan: 58,
    emoji: "🍲",
    warna: "from-orange-400 to-rose-500",
    wa: "6281200000003",
    desc: "Nasi box & prasmanan untuk acara warga, rasa rumahan. Melayani arisan, syukuran, dan rapat RT. Pesan minimal H-1.",
  },
  {
    id: 4,
    nama: "Laundry Kilat",
    kategori: "Jasa",
    blok: "C4",
    harga: 6_000,
    satuan: "/kg",
    rating: 4.7,
    ulasan: 41,
    emoji: "🧺",
    warna: "from-cyan-400 to-sky-600",
    wa: "6281200000004",
    desc: "Cuci-kering-lipat 1 hari jadi, antar-jemput dalam cluster gratis. Setrika rapi, wangi tahan lama.",
  },
  {
    id: 5,
    nama: "Warung Sembako Pak Har",
    kategori: "Toko",
    blok: "D2",
    harga: 0,
    satuan: "",
    rating: 4.9,
    ulasan: 26,
    emoji: "🛒",
    warna: "from-amber-400 to-orange-600",
    wa: "6281200000005",
    desc: "Kebutuhan harian, gas, galon, pulsa. Buka 06.00–22.00. Bisa pesan-antar untuk warga sekitar.",
  },
  {
    id: 6,
    nama: "Barbershop Siger",
    kategori: "Jasa",
    blok: "E6",
    harga: 25_000,
    satuan: "/cukur",
    rating: 4.8,
    ulasan: 33,
    emoji: "💈",
    warna: "from-violet-400 to-purple-600",
    wa: "6281200000006",
    desc: "Potong rambut anak-anak & dewasa, booking via WA agar tidak antre. Buka setiap hari 09.00–21.00.",
  },
];

// Hunian tersedia (dikontrakkan / dijual)
export const hunianTersedia = [
  {
    judul: "Rumah Dikontrakkan Blok A21",
    tipe: "Kontrak",
    harga: 12_000_000,
    satuan: "/tahun",
    kt: 2,
    km: 1,
    emoji: "🏡",
    warna: "from-emerald-400 to-green-600",
  },
  {
    judul: "Kos-kosan Blok B7",
    tipe: "Kontrak",
    harga: 800_000,
    satuan: "/bulan",
    kt: 2,
    km: 1,
    emoji: "🛏️",
    warna: "from-teal-400 to-cyan-600",
  },
  {
    judul: "Rumah Dijual Blok D15 (Hook)",
    tipe: "Dijual",
    harga: 285_000_000,
    satuan: "",
    kt: 3,
    km: 2,
    emoji: "🔑",
    warna: "from-amber-400 to-orange-600",
  },
];

// Pengumuman / aktivitas warga
export const pengumuman = [
  {
    tgl: "2026-07-22",
    judul: "Perbaikan gerbang & CCTV pintu masuk",
    isi: "Pemasangan CCTV baru di gerbang utama selesai minggu ini.",
    tag: "Keamanan",
  },
  {
    tgl: "2026-07-19",
    judul: "Jadwal fogging DBD",
    isi: "Fogging serentak Sabtu 26 Juli pukul 07.00. Mohon buka pagar.",
    tag: "Kesehatan",
  },
  {
    tgl: "2026-07-14",
    judul: "Iuran Juli sudah bisa dibayar",
    isi: "Pembayaran via transfer ke kas RT atau tunai ke pengurus blok.",
    tag: "Keuangan",
  },
];

// Voting warga
export const voting = {
  pertanyaan: "Prioritas penggunaan kas warga bulan depan?",
  opsi: [
    { teks: "Tambah lampu penerangan jalan", suara: 34 },
    { teks: "Perbaikan taman & playground", suara: 21 },
    { teks: "Tambah armada angkut sampah", suara: 28 },
    { teks: "Portal/palang otomatis", suara: 17 },
  ],
};

export const statistik = {
  pengunjung: 351,
  updateTerakhir: "24 Jul 2026, 15:22 WIB",
  wargaAktif: 148,
  usaha: 6,
};

export const kontak = {
  ketuaRT: "Bpk. Sudirman",
  wa: "6281200000000",
  maps: "https://maps.google.com/?q=Sabah+Balau+Jati+Agung",
  alamat:
    "Cluster Sigerland, Desa Sabah Balau, Kec. Jati Agung, Lampung Selatan",
};

// Lokasi peta (bisa di-set dari dashboard admin → tabel "pengaturan").
export const lokasi = {
  id: 1,
  lat: -5.3581,
  lng: 105.3149,
  zoom: 16,
  label: "Cluster Sigerland",
  alamat: "Desa Sabah Balau, Kec. Jati Agung, Lampung Selatan",
  embed: "",
};

// ===== Data tambahan (meniru fitur griyamelati + ide baru) =====

const NAMA_POOL = [
  "Rasyid Haditya S",
  "Adi Nugroho",
  "Dwi Miftha Kurnia",
  "Abdul Irsadul Anam",
  "Tafrikan",
  "Riyadhotul Jinan",
  "Viky Raditia Delmi",
  "Linda Lauren",
  "Surya Tri Esthi",
  "Riduwansyah",
  "Chandra W.U",
  "Nopa Elinasari",
  "Novi Ardiansyah",
  "Hermawan Yusanto",
  "Dewa Gede Mahardika",
  "Ferry Setiawan",
  "Rahmat Ripai",
  "Dharmawanti",
  "Mohammad Kamaludin",
  "Bayu Dwi Laksono",
  "Miftahudin",
  "Irwan Wijaya",
  "Muhamad Syaifudin",
  "Made Adi Jaya",
  "Ari Wibowo",
];

// Data Kavling & Warga — diturunkan dari peta kavling.
export const dataWarga = (() => {
  const blokDef = [
    { kode: "A", count: 31 },
    { kode: "B", count: 57 },
    { kode: "C", count: 30 },
    { kode: "D", count: 43 },
    { kode: "E", count: 45 },
    { kode: "F", count: 30 },
  ];
  const rows = [];
  let no = 1;
  blokDef.forEach((b, bi) => {
    for (let i = 0; i < b.count; i++) {
      const seed = bi * 100 + i;
      const dihuni = (seed * 7) % 10 < 7;
      const pemilik = dihuni ? NAMA_POOL[(seed * 3) % NAMA_POOL.length] : "-";
      const dikontrak = dihuni && seed % 9 === 0;
      rows.push({
        no: no++,
        blok: `${b.kode}${i + 1}`,
        pemilik,
        penghuni: dikontrak ? "Penyewa" : pemilik,
        ket: dihuni ? (dikontrak ? "Dikontrakkan" : "Dihuni") : "Kosong",
      });
    }
  });
  return rows;
})();

// Rekapitulasi Laporan Keuangan — 4 periode.
export const keuanganPeriode = [
  {
    nama: "Periode 1",
    rows: [
      {
        tgl: "01/07/2025",
        blok: "",
        masuk: 500000,
        keluar: 0,
        ket: "Saldo awal kas",
      },
      { tgl: "05/07/2025", blok: "A1", masuk: 100000, keluar: 0, ket: "" },
      {
        tgl: "10/07/2025",
        blok: "",
        masuk: 0,
        keluar: 150000,
        ket: "Beli peralatan kebersihan",
      },
      { tgl: "15/07/2025", blok: "A3", masuk: 100000, keluar: 0, ket: "" },
    ],
  },
  {
    nama: "Periode 2",
    rows: [
      {
        tgl: "01/10/2025",
        blok: "",
        masuk: 650000,
        keluar: 0,
        ket: "Sisa saldo periode 1",
      },
      { tgl: "08/10/2025", blok: "B5", masuk: 100000, keluar: 0, ket: "" },
      {
        tgl: "20/10/2025",
        blok: "",
        masuk: 0,
        keluar: 200000,
        ket: "Gaji petugas kebersihan",
      },
    ],
  },
  {
    nama: "Periode 3",
    rows: [
      {
        tgl: "18/01/2026",
        blok: "",
        masuk: 885000,
        keluar: 0,
        ket: "Sisa saldo periode 2",
      },
      {
        tgl: "20/01/2026",
        blok: "",
        masuk: 0,
        keluar: 145000,
        ket: "Pembelian kabel & fitting lampu jalan",
      },
      { tgl: "01/02/2026", blok: "A3", masuk: 100000, keluar: 0, ket: "" },
      { tgl: "08/02/2026", blok: "A4", masuk: 100000, keluar: 0, ket: "" },
      {
        tgl: "09/02/2026",
        blok: "",
        masuk: 0,
        keluar: 135000,
        ket: "Konsumsi gotong royong (6 orang)",
      },
      {
        tgl: "01/03/2026",
        blok: "",
        masuk: 0,
        keluar: 500000,
        ket: "Isi token listrik fasum",
      },
      {
        tgl: "05/03/2026",
        blok: "",
        masuk: 0,
        keluar: 175500,
        ket: "Pembelian kunci portal",
      },
    ],
  },
  {
    nama: "Periode 4",
    rows: [
      {
        tgl: "01/04/2026",
        blok: "",
        masuk: 1029000,
        keluar: 0,
        ket: "Sisa saldo periode 3",
      },
      { tgl: "12/04/2026", blok: "D1", masuk: 100000, keluar: 0, ket: "" },
      { tgl: "18/04/2026", blok: "D5", masuk: 100000, keluar: 0, ket: "" },
    ],
  },
];

// Data Iuran Air — status Lunas / Belum Bayar.
export const iuranAir = dataWarga
  .filter((w) => w.ket !== "Kosong")
  .slice(0, 16)
  .map((w, i) => ({
    blok: w.blok,
    penghuni: w.pemilik,
    periode: [
      "31 Mei 2026",
      "14 Juni 2026",
      "2026-06-21",
      "2026-06-28",
      "2026-07-05",
      "2026-07-12",
      "2026-07-19",
      "2026-07-26",
    ][i % 8],
    tagihan: 100000,
    status: i % 3 === 0 ? "Belum Bayar" : "Lunas",
  }));

// Dana swadaya penanggulangan banjir.
export const BANJIR_BULAN = ["jul", "ags", "sep", "okt", "nov", "des"];
export const banjirTarget = 80_000_000;
export const banjirKontribusi = [
  {
    blok: "B5",
    nama: "Chandra",
    jul: 1000000,
    ags: 0,
    sep: 0,
    okt: 0,
    nov: 0,
    des: 0,
  },
  {
    blok: "A1",
    nama: "Rasyid",
    jul: 500000,
    ags: 500000,
    sep: 0,
    okt: 0,
    nov: 0,
    des: 0,
  },
  {
    blok: "C7",
    nama: "Syaifudin",
    jul: 0,
    ags: 400000,
    sep: 0,
    okt: 0,
    nov: 0,
    des: 0,
  },
];
export const banjirPengeluaran = [
  {
    tgl: "2026-07-15",
    ket: "Normalisasi selokan tahap 1",
    persen: 15,
    nominal: 1860000,
  },
];

export const struktur = [
  { urutan: 1, jabatan: "Kepala Lingkungan", nama: "Bapak Ari", icon: "🧑‍💼" },
  { urutan: 2, jabatan: "Sekretaris", nama: "Hamba Allah", icon: "🖊️" },
  { urutan: 3, jabatan: "Bendahara", nama: "Hamba Allah", icon: "💰" },
  { urutan: 4, jabatan: "Keamanan", nama: "Tim Satpam", icon: "🛡️" },
  { urutan: 5, jabatan: "Kebersihan", nama: "Tim Kebersihan", icon: "🧹" },
];

// Versi flat untuk keuangan (satu baris = satu transaksi, ada kolom periode).
export const keuanganRows = keuanganPeriode.flatMap((p) =>
  p.rows.map((r) => ({ periode: p.nama, ...r })),
);

// IDE BARU: kontak darurat.
export const kontakDarurat = [
  { label: "Pos Satpam / Keamanan", nomor: "0812-0000-1111", icon: "🛡️" },
  { label: "Ketua RT", nomor: "0812-0000-0000", icon: "🧑‍💼" },
  { label: "Ambulans / Puskesmas", nomor: "119", icon: "🚑" },
  { label: "Pemadam Kebakaran", nomor: "113", icon: "🚒" },
  { label: "PLN Gangguan", nomor: "123", icon: "⚡" },
];

// IDE BARU: galeri kegiatan.
export const galeri = [
  {
    judul: "Kerja Bakti Bulanan",
    tgl: "2026-06-15",
    foto: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&q=80&auto=format&fit=crop",
  },
  {
    judul: "Rapat Warga",
    tgl: "2026-05-30",
    foto: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop",
  },
  {
    judul: "Peringatan HUT RI",
    tgl: "2025-08-17",
    foto: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80&auto=format&fit=crop",
  },
  {
    judul: "Posyandu Balita",
    tgl: "2026-04-10",
    foto: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop",
  },
];

// ---- Peta kavling (petakan tiap rumah sesuai status di siteplan) ----
// Definisi blok untuk peta: kode, jumlah, DP.
const petaBlok = [
  { kode: "A", count: 31, dp: 5_000_000 },
  { kode: "B", count: 57, dp: 4_000_000 },
  { kode: "C", count: 30, dp: 3_000_000 },
  { kode: "D", count: 43, dp: 3_000_000 },
  { kode: "E", count: 45, dp: 3_000_000 },
  { kode: "F", count: 30, dp: 3_000_000 },
];

// Pseudo-random deterministik (stabil tiap reload) supaya distribusi status konsisten.
const statusUrut = [
  "AKAD",
  "AKAD",
  "AKAD",
  "AKAD",
  "TERJUAL",
  "TERJUAL",
  "READY",
  "INDENT",
];
function statusFor(seed) {
  const h = (seed * 2654435761) % 2 ** 32;
  return statusUrut[Math.floor((h / 2 ** 32) * statusUrut.length)];
}

export const kavlingList = petaBlok.flatMap((b, bi) =>
  Array.from({ length: b.count }, (_, i) => {
    const seed = bi * 1000 + i + 7;
    const isHook = statusFor(seed + 500) === "INDENT" && i % 9 === 0;
    return {
      id: `${b.kode}${i + 1}`,
      blok: b.kode,
      status: statusFor(seed),
      dp: b.dp,
      hook: isHook,
    };
  }),
);

export const petaBlokMeta = petaBlok;

// Rekap jumlah per status (untuk ringkasan peta)
export const rekapStatus = kavlingList.reduce((acc, k) => {
  acc[k.status] = (acc[k.status] || 0) + 1;
  return acc;
}, {});
