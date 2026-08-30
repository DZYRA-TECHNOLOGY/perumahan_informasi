import { useEffect, useState } from "react";
import { supabase, isSupabaseReady } from "../lib/supabase.js";
import CrudTable from "./CrudTable.jsx";
import LeafletMap from "./LeafletMap.jsx";
import TagihanManager from "./TagihanManager.jsx";
import SaldoKasManager from "./SaldoKasManager.jsx";
import { Icon } from "./icons.jsx";
import { computeKas, computeKasByJenis, kasNameFor } from "../lib/finance.js";
import * as local from "../data/siteplan.js";
import { Printer, Store } from "lucide-react";
import Swal from "sweetalert2";

// Auto-logout setelah tidak ada aktivitas (menit). Ubah sesuai kebutuhan.
const IDLE_MINUTES = 30;
// Detik peringatan hitung mundur sebelum benar-benar keluar.
const WARN_SECONDS = 60;
import KasPembayaranForm from "./KasPembayaranForm.jsx";
import { Link } from "react-router-dom";
const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const fmtTgl = (t) => {
  const d = new Date(t);
  if (isNaN(d)) return { d: "--", m: "" };
  return {
    d: String(d.getDate()).padStart(2, "0"),
    m: [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MEI",
      "JUN",
      "JUL",
      "AGU",
      "SEP",
      "OKT",
      "NOV",
      "DES",
    ][d.getMonth()],
  };
};

// ===== LOGIN =====
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="mx-auto max-w-sm py-10 px-4">
      <div className="card p-7">
        <div className="mb-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-black text-white shadow-lg shadow-teal-500/20">
            S
          </div>
          <h2 className="mt-4 text-2xl font-bold">Login Pengurus</h2>
          <p className="mt-1 muted text-sm">
            Masuk untuk mengelola data warga Cluster Sigerland.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Email</span>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">
              Password
            </span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button disabled={busy} className="btn-teal w-full">
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== OVERVIEW =====
function Overview({ preview }) {
  const demoMaster = [
    { nama: "Iuran Umum", aktif: true },
    { nama: "Iuran Keamanan", aktif: true },
    { nama: "Iuran Kebersihan", aktif: true },
    { nama: "Iuran Air", aktif: true },
  ];
  const demo = {
    kas: local.kas,
    transaksi: local.transaksi,
    usaha: local.usahaWarga,
    agenda: local.agenda,
    kasMaster: demoMaster,
  };
  const [d, setD] = useState(
    preview
      ? demo
      : { kas: [], transaksi: [], usaha: [], agenda: [], kasMaster: [] },
  );

  useEffect(() => {
    if (preview || !supabase) return;
    (async () => {
      const t = async (n) => (await supabase.from(n).select("*")).data ?? [];
      setD({
        kas: await t("kas"),
        transaksi: await t("transaksi"),
        usaha: await t("usaha"),
        agenda: await t("agenda"),
        kasMaster: await t("kas_master"),
      });
    })();
  }, [preview]);

  const {
    rows: kasRows,
    total,
    totalMasuk,
    totalKeluar,
  } = computeKasByJenis(d.kasMaster, d.kas, d.transaksi);
  const maxSaldo = Math.max(1, ...kasRows.map((k) => Math.abs(k.saldo)));

  const stats = [
    {
      l: "Total Saldo Kas",
      v: rp(total),
      c: "text-emerald-400",
      ring: "ring-emerald-500/20 bg-emerald-500/10",
      icon: "Landmark",
      sub: "Saldo berjalan",
    },
    {
      l: "Total Pemasukan",
      v: rp(totalMasuk),
      c: "text-teal-300",
      ring: "ring-teal-500/20 bg-teal-500/10",
      icon: "ArrowDownCircle",
      sub: "Seluruh periode",
    },
    {
      l: "Total Pengeluaran",
      v: rp(totalKeluar),
      c: "text-rose-400",
      ring: "ring-rose-500/20 bg-rose-500/10",
      icon: "ArrowUpCircle",
      sub: "Seluruh periode",
    },
    {
      l: "Usaha Warga",
      v: d.usaha.length,
      c: "text-sky-300",
      ring: "ring-sky-500/20 bg-sky-500/10",
      icon: "Store",
      sub: "Terdaftar",
    },
  ];

  const recent = [...d.transaksi].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid - Responsive */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.l}
            className="card p-4 sm:p-5 transition hover:-translate-y-0.5 hover:ring-white/20"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs sm:text-sm muted">{s.l}</p>
              <span
                className={`grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl ring-1 ${s.ring}`}
              >
                <Icon
                  name={s.icon}
                  size={16}
                  strokeWidth={1.9}
                  className={s.c}
                />
              </span>
            </div>
            <p
              className={`mt-2 text-xl sm:text-2xl lg:text-[26px] font-extrabold ${s.c}`}
            >
              {s.v}
            </p>
            <p className="mt-0.5 text-xs muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Saldo per Kas */}
        <div className="card p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base">Saldo per Kas</h3>
            <span className="text-xs muted">{kasRows.length} kas</span>
          </div>
          <div className="mt-4 space-y-4">
            {kasRows.length === 0 && (
              <p className="text-sm muted">Belum ada kas.</p>
            )}
            {kasRows.map((k) => (
              <div key={k.nama}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{k.nama}</span>
                  <span className="font-semibold text-emerald-400">
                    {rp(k.saldo)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{
                      width: `${Math.max(4, (Math.abs(k.saldo) / maxSaldo) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/5 pt-5">
            <h4 className="mb-3 font-bold text-sm sm:text-base">
              Transaksi terbaru
            </h4>
            <ul className="space-y-1">
              {recent.length === 0 && (
                <li className="text-sm muted">Belum ada transaksi.</li>
              )}
              {recent.map((t, i) => {
                const masuk = t.tipe === "masuk";
                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 sm:gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]"
                  >
                    <span
                      className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg ring-1 ${masuk ? "bg-emerald-500/10 ring-emerald-500/20" : "bg-rose-500/10 ring-rose-500/20"}`}
                    >
                      <Icon
                        name={masuk ? "ArrowDownLeft" : "ArrowUpRight"}
                        size={15}
                        className={masuk ? "text-emerald-400" : "text-rose-400"}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm font-medium">
                        {t.ket || "Transaksi"}
                      </p>
                      <p className="text-xs muted">
                        {t.tgl} · {t.kas || "-"}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs sm:text-sm font-semibold ${masuk ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {masuk ? "+" : "−"} {rp(t.nominal)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Agenda */}
        <div className="card h-fit p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base">Agenda terdekat</h3>
            <Icon name="CalendarDays" size={16} className="muted" />
          </div>
          <ul className="mt-4 space-y-3">
            {d.agenda.length === 0 && (
              <li className="text-sm muted">Belum ada agenda.</li>
            )}
            {d.agenda.slice(0, 5).map((a, i) => {
              const { d: dd, m } = fmtTgl(a.tgl);
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <span className="text-[10px] font-semibold text-teal-300">
                      {m}
                    </span>
                    <span className="-mt-0.5 text-sm font-extrabold leading-none">
                      {dd}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.judul}</p>
                    <p className="text-xs muted">{a.kategori}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ===== LOKASI FORM =====
function LokasiForm({ onChanged }) {
  const [f, setF] = useState(local.lokasi);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("pengaturan")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setF(data);
      });
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const payload = {
      id: 1,
      lat: Number(f.lat),
      lng: Number(f.lng),
      zoom: Number(f.zoom || 16),
      label: f.label || "",
      alamat: f.alamat || "",
      embed: f.embed || "",
    };
    const { error } = await supabase.from("pengaturan").upsert(payload);
    setBusy(false);
    if (error) setMsg("Gagal: " + error.message);
    else {
      setMsg("Tersimpan ✓");
      onChanged?.();
    }
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-bold lg:text-xl">Lokasi & Peta</h3>
      <p className="mb-5 text-sm muted">
        Atur titik peta yang tampil di beranda.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
        <form onSubmit={save} className="card space-y-3 p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium muted">
                Latitude
              </span>
              <input
                className="field"
                type="number"
                step="any"
                value={f.lat ?? ""}
                onChange={set("lat")}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium muted">
                Longitude
              </span>
              <input
                className="field"
                type="number"
                step="any"
                value={f.lng ?? ""}
                onChange={set("lng")}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium muted">Zoom</span>
              <input
                className="field"
                type="number"
                min="1"
                max="20"
                value={f.zoom ?? 16}
                onChange={set("zoom")}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Label</span>
            <input
              className="field"
              value={f.label ?? ""}
              onChange={set("label")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">Alamat</span>
            <input
              className="field"
              value={f.alamat ?? ""}
              onChange={set("alamat")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium muted">
              Embed URL (opsional)
            </span>
            <input
              className="field"
              value={f.embed ?? ""}
              onChange={set("embed")}
              placeholder="Kosongkan untuk pakai koordinat"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button disabled={busy} className="btn-teal">
              {busy ? "Menyimpan…" : "Simpan Lokasi"}
            </button>
            {msg && (
              <span
                className={`text-sm ${msg.startsWith("Gagal") ? "text-rose-400" : "text-emerald-400"}`}
              >
                {msg}
              </span>
            )}
          </div>
        </form>

        <div>
          <p className="mb-2 text-sm font-medium muted">
            Pilih lokasi — klik atau geser pin di peta
          </p>
          <LeafletMap
            lat={Number(f.lat) || -5.3581}
            lng={Number(f.lng) || 105.3149}
            zoom={Number(f.zoom) || 16}
            height={300}
            onPick={(la, ln) =>
              setF((prev) => ({
                ...prev,
                lat: la.toFixed(6),
                lng: ln.toFixed(6),
              }))
            }
          />
          <p className="mt-2 text-xs muted">
            Koordinat terpilih otomatis terisi di form kiri, lalu klik Simpan.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== MENU & PANELS =====
const SECTIONS = [
  {
    label: "Beranda",
    items: [{ key: "ringkasan", label: "Ringkasan", icon: "LayoutDashboard" }],
  },
  {
    label: "Keuangan",
    items: [
      { key: "transaksi", label: "Transaksi Kas", icon: "ArrowRightLeft" },
      { key: "kas", label: "Saldo Kas", icon: "Landmark" },
      { key: "kas_master", label: "Jenis Iuran", icon: "ReceiptText" },
      { key: "kas_tagihan", label: "Tagihan Kas", icon: "ClipboardList" },
      { key: "kas_pembayaran", label: "Pembayaran Masuk", icon: "Wallet" },
    ],
  },
  {
    label: "Informasi",
    items: [
      { key: "agenda", label: "Agenda", icon: "CalendarDays" },
      { key: "pengumuman", label: "Pengumuman", icon: "Megaphone" },
      { key: "usaha", label: "Usaha Warga", icon: "Store" },
      { key: "struktur", label: "Struktur Organisasi", icon: "Building2" },
      { key: "jadwal_sampah", label: "Jadwal Sampah", icon: "Trash2" },
      { key: "hunian_listing", label: "Hunian Tersedia", icon: "Home" },
    ],
  },
  {
    label: "Data",
    items: [
      { key: "data_warga", label: "Data Warga", icon: "Users" },
      { key: "masukan", label: "Kotak Masukan", icon: "Inbox" },
    ],
  },
  {
    label: "Pengaturan",
    items: [{ key: "lokasi", label: "Lokasi & Peta", icon: "MapPin" }],
  },
];

const MENU = SECTIONS.flatMap((s) => s.items);

const PANELS = {
  transaksi: {
    title: "Transaksi Kas",
    table: "transaksi",
    fallback: local.transaksi,
    fields: [
      { name: "tgl", label: "Tanggal", type: "date" },
      {
        name: "periode",
        label: "Periode",
        options: ["Periode 1", "Periode 2", "Periode 3", "Periode 4"],
      },
      {
        name: "kas",
        label: "Masuk ke Kas",
        options: ["Kas Umum", "Kas Keamanan", "Kas Kebersihan"],
      },
      { name: "tipe", label: "Tipe", options: ["masuk", "keluar"] },
      { name: "nominal", label: "Nominal", type: "number", money: true },
      { name: "ket", label: "Keterangan" },
    ],
  },
  kas: {
    title: "Kas (Saldo Awal)",
    table: "kas",
    fallback: local.kas,
    fields: [
      { name: "nama", label: "Nama Kas" },
      { name: "saldo_awal", label: "Saldo Awal", type: "number", money: true },
    ],
  },
  iuran: {
    title: "Iuran",
    table: "iuran",
    fallback: local.iuran,
    fields: [
      { name: "jenis", label: "Jenis" },
      { name: "nominal", label: "Nominal", type: "number", money: true },
      {
        name: "periode",
        label: "Periode",
        options: ["per bulan", "per tahun", "sekali"],
      },
    ],
  },
  agenda: {
    title: "Agenda",
    table: "agenda",
    fallback: local.agenda,
    fields: [
      { name: "tgl", label: "Tanggal", type: "date" },
      { name: "judul", label: "Judul" },
      {
        name: "kategori",
        label: "Kategori",
        options: ["Kebersihan", "Rapat", "Kegiatan", "Keamanan"],
      },
      { name: "foto", label: "Foto (opsional)", type: "image", optional: true },
    ],
  },
  usaha: {
    title: "Usaha Warga",
    table: "usaha",
    fallback: local.usahaWarga,
    fields: [
      { name: "nama", label: "Nama Usaha" },
      { name: "kategori", label: "Kategori" },
      { name: "blok", label: "Blok" },
      { name: "harga", label: "Harga", type: "number", money: true },
      { name: "wa", label: "No. WhatsApp" },
      { name: "foto", label: "Foto usaha", type: "image", optional: true },
      { name: "desc", label: "Deskripsi" },
    ],
  },
  pengumuman: {
    title: "Pengumuman",
    table: "pengumuman",
    fallback: local.pengumuman,
    fields: [
      { name: "tgl", label: "Tanggal", type: "date" },
      { name: "judul", label: "Judul" },
      { name: "isi", label: "Isi" },
      {
        name: "tag",
        label: "Kategori",
        options: ["Keamanan", "Kesehatan", "Keuangan", "Umum"],
      },
      { name: "foto", label: "Foto (opsional)", type: "image", optional: true },
    ],
  },
  data_warga: {
    title: "Data Kavling & Warga",
    table: "data_warga",
    fallback: local.dataWarga,
    fields: [
      { name: "blok", label: "Blok" },
      { name: "pemilik", label: "Nama Pemilik" },
      { name: "penghuni", label: "Penghuni Saat Ini" },
      {
        name: "ket",
        label: "Keterangan",
        options: ["Dihuni", "Dikontrakkan", "Kosong"],
      },
    ],
  },
  iuran_air: {
    title: "Iuran Air",
    table: "iuran_air",
    fallback: local.iuranAir,
    fields: [
      { name: "blok", label: "Blok" },
      { name: "penghuni", label: "Penghuni" },
      { name: "periode", label: "Periode" },
      { name: "tagihan", label: "Tagihan", type: "number", money: true },
      { name: "status", label: "Status", options: ["Lunas", "Belum Bayar"] },
    ],
  },
  struktur: {
    title: "Struktur Organisasi",
    table: "struktur",
    fallback: local.struktur,
    fields: [
      { name: "urutan", label: "Urutan (1 = pimpinan)", type: "number" },
      { name: "jabatan", label: "Jabatan" },
      { name: "nama", label: "Nama" },
      { name: "icon", label: "Ikon (emoji)", optional: true },
    ],
  },
  masukan: {
    title: "Kotak Masukan Warga",
    table: "masukan",
    fallback: [],
    fields: [
      { name: "nama", label: "Nama" },
      { name: "blok", label: "Blok" },
      { name: "saran", label: "Saran", optional: true },
      { name: "masukan", label: "Masukan" },
      { name: "foto", label: "Foto", type: "image", optional: true },
    ],
  },
  hunian_listing: {
    title: "Hunian Tersedia",
    table: "hunian_listing",
    fallback: [],
    fields: [
      { name: "tipe", label: "Tipe", options: ["Kontrak", "Dijual"] },
      { name: "judul", label: "Judul" },
      { name: "blok", label: "Blok / Unit" },
      { name: "kt", label: "KT (Kamar Tidur)", type: "number" },
      { name: "km", label: "KM (Kamar Mandi)", type: "number" },
      { name: "harga", label: "Harga", type: "number", money: true },
      { name: "satuan", label: "Satuan" },
      { name: "wa", label: "WhatsApp" },
      { name: "deskripsi", label: "Deskripsi" },
      { name: "foto", label: "Foto", type: "image", optional: true },
      {
        name: "status",
        label: "Status",
        options: ["Aktif", "Selesai", "Nonaktif"],
      },
    ],
  },
  kas_master: {
    title: "Jenis Iuran",
    table: "kas_master",
    fallback: [],
    fields: [
      { name: "nama", label: "Nama Iuran (mis. Iuran Air)" },
      {
        name: "nominal",
        label: "Nominal default",
        type: "number",
        money: true,
      },
      { name: "wajib", label: "Wajib? (false = sumbangan)", options: ["true", "false"] },
      { name: "aktif", label: "Aktif", options: ["true", "false"] },
    ],
  },
  jadwal_sampah: {
    title: "Jadwal Kebersihan & Sampah",
    table: "jadwal_sampah",
    fallback: [],
    fields: [
      { name: "hari", label: "Hari (mis. Senin & Kamis)" },
      { name: "wilayah", label: "Wilayah (mis. Blok A, B)" },
      { name: "keterangan", label: "Keterangan", optional: true },
    ],
  },
  kas_tagihan: {
    title: "Tagihan Bulanan",
    table: "kas_tagihan",
    fallback: [],
    fields: [
      { name: "blok", label: "Blok" },
      { name: "nama", label: "Nama" },
      { name: "periode", label: "Periode" },
      { name: "nominal", label: "Nominal", type: "number", money: true },
      {
        name: "jatuh_tempo",
        label: "Jatuh Tempo",
        type: "date",
        optional: true,
      },
      {
        name: "status",
        label: "Status",
        options: ["Belum Bayar", "Menunggu", "Lunas", "Terlambat"],
      },
      { name: "catatan", label: "Catatan", optional: true },
    ],
  },
  kas_pembayaran: {
    title: "Pembayaran Masuk",
    table: "kas_pembayaran",
    fallback: [],
    fields: [
      { name: "tagihan_id", label: "ID Tagihan", type: "number" },
      { name: "blok", label: "Blok" },
      { name: "nama", label: "Nama" },
      { name: "periode", label: "Periode" },
      { name: "nominal", label: "Nominal", type: "number", money: true },
      { name: "metode", label: "Metode" },
      { name: "bukti", label: "Bukti", type: "image", optional: true },
      {
        name: "status",
        label: "Status",
        options: ["Menunggu", "Disetujui", "Ditolak"],
      },
      { name: "catatan", label: "Catatan", optional: true },
      { name: "diverifikasi_oleh", label: "Diverifikasi Oleh", optional: true },
    ],
  },
};

// ===== NAV LIST =====
function NavList({ tab, setTab, onNavigate }) {
  return (
    <nav className="space-y-3">
      {SECTIONS.map((sec) => (
        <div key={sec.label}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {sec.label}
          </p>
          <div className="space-y-0.5">
            {sec.items.map((m) => {
              const active = tab === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    setTab(m.key);
                    onNavigate?.();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    name={m.icon}
                    size={16}
                    strokeWidth={1.75}
                    className={`shrink-0 ${active ? "" : "text-zinc-400"}`}
                  />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ===== MAIN ADMIN =====
export default function Admin({ onChanged }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("ringkasan");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  // Opsi kas untuk form Transaksi — DINAMIS mengikuti Jenis Iuran aktif.
  const [kasOptions, setKasOptions] = useState([
    "Kas Umum",
    "Kas Keamanan",
    "Kas Kebersihan",
  ]);

  useEffect(() => {
    if (!supabase || tab !== "transaksi") return;
    supabase
      .from("kas_master")
      .select("nama,aktif")
      .then(({ data, error }) => {
        if (error) return; // koneksi/tabel bermasalah → biarkan default
        const opts = [
          ...new Set(
            (data || [])
              .filter((m) => m.aktif !== false && m.aktif !== "false")
              .map((m) => kasNameFor(m.nama)),
          ),
        ];
        setKasOptions(opts); // SELALU update, termasuk kosong (semua jenis dihapus)
      });
  }, [tab]);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Auto-logout saat idle, dengan peringatan hitung mundur dulu.
  useEffect(() => {
    if (!session || !supabase) return;
    let idleTimer;
    let warningOpen = false;

    const doLogout = async () => {
      await supabase.auth.signOut();
      Swal.fire({
        icon: "info",
        title: "Sesi berakhir",
        text: `Anda otomatis keluar setelah ${IDLE_MINUTES} menit tidak aktif.`,
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
    };

    const showWarning = () => {
      warningOpen = true;
      let iv;
      Swal.fire({
        icon: "warning",
        title: "Masih di sana?",
        html: `Sesi akan berakhir dalam <b>${WARN_SECONDS}</b> detik karena tidak ada aktivitas.`,
        timer: WARN_SECONDS * 1000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Tetap Login",
        confirmButtonColor: "#f97316",
        allowOutsideClick: false,
        background: "#17171b",
        color: "#fff",
        didOpen: () => {
          const b = Swal.getHtmlContainer()?.querySelector("b");
          iv = setInterval(() => {
            const left = Math.ceil((Swal.getTimerLeft() || 0) / 1000);
            if (b) b.textContent = left;
          }, 250);
        },
        willClose: () => clearInterval(iv),
      }).then((res) => {
        warningOpen = false;
        if (res.isConfirmed) reset(); // pengurus memilih tetap login
        else if (res.dismiss === Swal.DismissReason.timer) doLogout();
      });
    };

    const reset = () => {
      if (warningOpen) return; // jangan reset saat dialog peringatan tampil
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showWarning, (IDLE_MINUTES * 60 - WARN_SECONDS) * 1000);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(idleTimer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [session]);

  if (!isSupabaseReady) {
    return (
      <div className="mx-auto max-w-lg card p-6 text-center">
        <p>Supabase belum dikonfigurasi.</p>
        <p className="mt-1 text-sm muted">
          Isi <code>.env</code> untuk mengaktifkan panel admin.
        </p>
      </div>
    );
  }
  if (!ready) return <p className="text-center muted">Memuat…</p>;
  // if (showLogin && !session) return <Login />;
  if (!session) return <Login />;

  const preview = !session;
  const activeMenu = MENU.find((m) => m.key === tab);
  const activeSection = SECTIONS.find((s) =>
    s.items.some((i) => i.key === tab),
  )?.label;
  const subtitle =
    {
      ringkasan: "Snapshot kondisi cluster saat ini.",
    }[tab] || `Kelola data ${activeMenu?.label?.toLowerCase()}.`;

  const UserChip = () => (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 font-black text-white shadow-lg shadow-teal-500/20">
        S
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {preview ? "Tamu" : session.user.email.split("@")[0]}
        </p>
        <p className="text-xs muted">{preview ? "Preview" : "Pengurus"}</p>
      </div>
    </div>
  );

  const ActionButton = () =>
    preview ? (
      <button
        onClick={() => setShowLogin(true)}
        className="btn-teal mt-3 w-full text-sm"
      >
        <Icon name="LogIn" size={15} strokeWidth={2} /> Masuk
      </button>
    ) : (
      <button
        onClick={() => supabase.auth.signOut()}
        className="btn-outline mt-3 w-full text-sm"
      >
        <Icon name="LogOut" size={15} strokeWidth={2} /> Keluar
      </button>
    );
  return (
    <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-6 lg:px-8 xl:px-10">
      {/* Mobile Header */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div>
          <h2 className="text-xl font-bold">Panel Pengurus</h2>
          <p className="text-xs muted">
            {preview ? "Mode preview" : session.user.email}
          </p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 active:scale-95"
        >
          <Icon name="Menu" size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* Preview Banner */}
      {preview && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-amber-200">
            <Icon name="Eye" size={16} strokeWidth={1.9} /> Mode preview —
            menampilkan data contoh tanpa login.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="btn-teal text-sm"
          >
            <Icon name="LogIn" size={15} strokeWidth={2} /> Masuk
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-zinc-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"
              >
                <Icon name="X" size={18} strokeWidth={1.75} />
              </button>
            </div>
            <UserChip />
            <NavList
              tab={tab}
              setTab={setTab}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <ActionButton />
          </div>
        </div>
      )}

      {/* Main Grid - Lebih lebar di desktop */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] 2xl:grid-cols-[320px_1fr]">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block md:sticky md:top-24 md:h-fit">
          <div className="card p-3 lg:p-4">
            <UserChip />
            <NavList tab={tab} setTab={setTab} />
          </div>
          <ActionButton />
        </aside>

        {/* Content */}
        <section className="min-w-0 pb-10">
          {/* Breadcrumb & Title */}
          <div className="mb-4 sm:mb-5">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-extrabold">Panel Pengurus</h1>
              <Link to="/" className="text-sm font-semibold text-orange-400">
                ← Beranda
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs muted">
              <Icon name="Home" size={13} />
              <span>Panel</span>
              <Icon name="ChevronRight" size={13} />
              <span className="text-zinc-300">{activeSection}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
                <Icon
                  name={activeMenu?.icon || "LayoutDashboard"}
                  size={18}
                  strokeWidth={1.8}
                  className="text-teal-400"
                />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold">
                  {activeMenu?.label}
                </h2>
                <p className="text-xs sm:text-sm muted">{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="lg:max-w-none">
            {tab === "ringkasan" ? (
              <Overview preview={preview} />
            ) : tab === "lokasi" ? (
              <LokasiForm onChanged={onChanged} />
            ) : tab === "kas_pembayaran" ? (
              <KasPembayaranForm
                onChanged={onChanged}
                verifierEmail={session?.user?.email}
              />
            ) : tab === "kas_tagihan" ? (
              <TagihanManager preview={preview} onChanged={onChanged} />
            ) : tab === "kas" ? (
              <SaldoKasManager preview={preview} onChanged={onChanged} />
            ) : tab === "transaksi" ? (
              <CrudTable
                key={tab}
                {...PANELS.transaksi}
                fields={PANELS.transaksi.fields.map((f) =>
                  f.name === "kas"
                    ? { ...f, label: "Kas", options: kasOptions }
                    : f,
                )}
                preview={preview}
                onChanged={onChanged}
              />
            ) : (
              <CrudTable
                key={tab}
                {...PANELS[tab]}
                preview={preview}
                onChanged={onChanged}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
