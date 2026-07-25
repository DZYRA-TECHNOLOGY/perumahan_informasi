import { useEffect, useState } from "react";
import { supabase, isSupabaseReady } from "../lib/supabase.js";
import CrudTable from "./CrudTable.jsx";
import LeafletMap from "./LeafletMap.jsx";
import { Icon } from "./icons.jsx";
import { computeKas } from "../lib/finance.js";
import * as local from "../data/siteplan.js";

const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

/* ---------------- Login ---------------- */
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
        <p className="mt-4 text-xs muted">
          Akun dibuat di Supabase → Authentication → Users (centang Auto
          Confirm).
        </p>
      </div>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview() {
  // Selalu tampilkan data ASLI dari database (kosong = kosong), bukan data contoh.
  const [d, setD] = useState({ kas: [], transaksi: [], usaha: [], agenda: [] });
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const t = async (n) => (await supabase.from(n).select("*")).data ?? [];
      setD({
        kas: await t("kas"),
        transaksi: await t("transaksi"),
        usaha: await t("usaha"),
        agenda: await t("agenda"),
      });
    })();
  }, []);
  // Saldo total dihitung otomatis dari saldo awal + transaksi.
  const { total: totalKas, totalMasuk: masuk, totalKeluar: keluar } = computeKas(
    d.kas,
    d.transaksi,
  );
  const stats = [
    {
      l: "Total Saldo Kas",
      v: rp(totalKas),
      c: "text-emerald-500",
      icon: "Landmark",
    },
    {
      l: "Total Pemasukan",
      v: rp(masuk),
      c: "text-teal-500",
      icon: "ArrowDownCircle",
    },
    {
      l: "Total Pengeluaran",
      v: rp(keluar),
      c: "text-rose-500",
      icon: "ArrowUpCircle",
    },
    { l: "Usaha Warga", v: d.usaha.length, c: "text-sky-500", icon: "Store" },
  ];
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold lg:text-xl">Ringkasan</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.l}
            className="card p-5 lg:p-6 transition hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm muted">{s.l}</p>
              <Icon
                name={s.icon}
                size={18}
                strokeWidth={1.75}
                className={`shrink-0 opacity-60 ${s.c}`}
              />
            </div>
            <p className={`mt-1 text-2xl font-extrabold lg:text-3xl ${s.c}`}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 card p-5 lg:p-6">
        <p className="font-semibold">Agenda terdekat</p>
        <ul className="mt-3 space-y-2 text-sm">
          {d.agenda.slice(0, 5).map((a, i) => (
            <li
              key={i}
              className="flex justify-between border-b border-white/5 pb-2"
            >
              <span>{a.judul}</span>
              <span className="muted">{a.tgl}</span>
            </li>
          ))}
          {d.agenda.length === 0 && (
            <li className="muted">Belum ada agenda.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Pengaturan Lokasi / Peta ---------------- */
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
        Atur titik peta yang tampil di beranda. Isi koordinat (lat/lng) — cari
        di Google Maps, klik kanan lokasi → angka pertama = latitude, kedua =
        longitude.
      </p>
      <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
        <form onSubmit={save} className="card space-y-3 p-5 lg:p-6">
          <div className="grid grid-cols-3 gap-3">
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
              Embed URL (opsional — dari Google Maps "Sematkan peta")
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
            height={320}
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

/* ---------------- Dashboard shell ---------------- */
const MENU = [
  { key: "ringkasan", label: "Ringkasan", icon: "LayoutDashboard" },
  { key: "transaksi", label: "Transaksi Kas", icon: "ArrowRightLeft" },
  { key: "kas", label: "Saldo Kas", icon: "Landmark" },
  { key: "iuran", label: "Iuran", icon: "ReceiptText" },
  { key: "agenda", label: "Agenda", icon: "CalendarDays" },
  { key: "usaha", label: "Usaha Warga", icon: "Store" },
  { key: "pengumuman", label: "Pengumuman", icon: "Megaphone" },
  { key: "data_warga", label: "Data Warga", icon: "Users" },
  { key: "iuran_air", label: "Iuran Air", icon: "Droplets" },
  { key: "banjir_kontribusi", label: "Dana Banjir (Masuk)", icon: "Waves" },
  {
    key: "banjir_pengeluaran",
    label: "Dana Banjir (Keluar)",
    icon: "HandCoins",
  },
  { key: "struktur", label: "Struktur Organisasi", icon: "Building2" },
  { key: "lokasi", label: "Lokasi & Peta", icon: "MapPin" },
  { key: "masukan", label: "Kotak Masukan", icon: "Inbox" },
];

const PANELS = {
  transaksi: {
    title: "Transaksi Kas",
    table: "transaksi",
    fallback: local.transaksi,
    fields: [
      { name: "tgl", label: "Tanggal", type: "date" },
      { name: "periode", label: "Periode", options: ["Periode 1", "Periode 2", "Periode 3", "Periode 4"] },
      { name: "kas", label: "Masuk ke Kas", options: ["Kas Umum", "Kas Keamanan", "Kas Kebersihan"] },
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
  banjir_kontribusi: {
    title: "Dana Banjir — Kontribusi",
    table: "banjir_kontribusi",
    fallback: local.banjirKontribusi,
    fields: [
      { name: "blok", label: "Blok" },
      { name: "nama", label: "Nama" },
      { name: "jul", label: "Juli", type: "number", optional: true },
      { name: "ags", label: "Agustus", type: "number", optional: true },
      { name: "sep", label: "September", type: "number", optional: true },
      { name: "okt", label: "Oktober", type: "number", optional: true },
      { name: "nov", label: "November", type: "number", optional: true },
      { name: "des", label: "Desember", type: "number", optional: true },
    ],
  },
  banjir_pengeluaran: {
    title: "Dana Banjir — Pengeluaran",
    table: "banjir_pengeluaran",
    fallback: local.banjirPengeluaran,
    fields: [
      { name: "tgl", label: "Tanggal", type: "date" },
      { name: "ket", label: "Keterangan / Tahapan" },
      { name: "persen", label: "Persentase (%)", type: "number" },
      { name: "nominal", label: "Nominal", type: "number", money: true },
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
};

/* ---------------- Sidebar / navigasi ---------------- */
function NavList({ tab, setTab, onNavigate }) {
  return (
    <nav className="space-y-1">
      {MENU.map((m) => (
        <button
          key={m.key}
          onClick={() => {
            setTab(m.key);
            onNavigate?.();
          }}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            tab === m.key
              ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
              : "text-zinc-200 hover:bg-white/5"
          }`}
        >
          <Icon
            name={m.icon}
            size={16}
            strokeWidth={1.75}
            className="shrink-0"
          />
          {m.label}
        </button>
      ))}
    </nav>
  );
}

export default function Admin({ onChanged }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("ringkasan");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Kunci scroll body saat drawer mobile terbuka
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
  if (!session) return <Login />;

  const activeMenu = MENU.find((m) => m.key === tab);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8 2xl:px-10">
      {/* Header mobile: judul + tombol menu */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div>
          <h2 className="text-xl font-bold">Panel Pengurus</h2>
          <p className="text-xs muted">{session.user.email}</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-100 active:scale-95"
          aria-label="Buka menu"
        >
          <Icon name="Menu" size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs overflow-y-auto bg-zinc-950 p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="mb-4 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide muted">
                Menu
              </p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"
                aria-label="Tutup menu"
              >
                <Icon name="X" size={18} strokeWidth={1.75} />
              </button>
            </div>
            <NavList
              tab={tab}
              setTab={setTab}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <button
              onClick={() => supabase.auth.signOut()}
              className="btn-outline mt-4 w-full text-sm"
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[230px_1fr] lg:grid-cols-[260px_1fr] lg:gap-8 xl:grid-cols-[280px_1fr]">
        {/* Sidebar desktop */}
        <aside className="hidden md:block md:sticky md:top-24 md:h-fit">
          <div className="card p-3 lg:p-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide muted">
              Menu
            </p>
            <NavList tab={tab} setTab={setTab} />
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-outline mt-3 w-full text-sm"
          >
            Keluar
          </button>
        </aside>

        {/* Content */}
        <section className="min-w-0 pb-10">
          <div className="mb-5 hidden items-center justify-between md:flex">
            <div>
              <h2 className="text-2xl font-bold lg:text-3xl">Panel Pengurus</h2>
              <p className="text-sm muted">{session.user.email}</p>
            </div>
          </div>

          {/* Label tab aktif di mobile */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <Icon
              name={activeMenu?.icon || "LayoutDashboard"}
              size={18}
              strokeWidth={1.75}
              className="text-teal-500"
            />
            <h3 className="text-base font-bold">{activeMenu?.label}</h3>
          </div>

          <div className="lg:max-w-none">
            {tab === "ringkasan" ? (
              <Overview />
            ) : tab === "lokasi" ? (
              <LokasiForm onChanged={onChanged} />
            ) : (
              <CrudTable key={tab} {...PANELS[tab]} onChanged={onChanged} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
