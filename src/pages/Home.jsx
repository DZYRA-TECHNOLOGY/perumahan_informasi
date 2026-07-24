import { Link, useOutletContext } from "react-router-dom";
import {
  profil,
  blok,
  hunian,
  jadwalSampah,
  dataWarga,
  banjirKontribusi,
  BANJIR_BULAN,
} from "../data/siteplan.js";
import { rp } from "../components/ui.jsx";
import Voting from "../components/Voting.jsx";
import Donut from "../components/Donut.jsx";
import MapEmbed from "../components/MapEmbed.jsx";

function DashCard({ to, emoji, label, value, unit, cta }) {
  return (
    <Link to={to} className="card card-hover flex flex-col p-5 text-center">
      <div className="text-3xl">{emoji}</div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {unit && <p className="text-xs muted">{unit}</p>}
      <span className="btn-outline mt-3 py-1.5 text-xs">{cta || "Detail"}</span>
    </Link>
  );
}

function Feature({ to, emoji, title, desc, cta }) {
  return (
    <Link to={to} className="card card-hover group flex flex-col p-6">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500/15 text-2xl">
        {emoji}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 flex-1 text-sm muted">{desc}</p>
      <span className="mt-4 text-sm font-semibold text-orange-400 group-hover:translate-x-1 transition inline-block">
        {cta} →
      </span>
    </Link>
  );
}

export default function Home() {
  const { iuran, kas, usaha, pengumuman, agenda, lokasi } = useOutletContext();
  const totalRumah = blok.reduce((s, b) => s + b.jumlah, 0);
  const totalKas = kas.reduce((s, k) => s + Number(k.saldo || 0), 0);
  const iuranTotal = iuran.reduce((s, i) => s + Number(i.nominal || 0), 0);

  const dihuni = dataWarga.filter((w) => w.ket === "Dihuni").length;
  const kontrak = dataWarga.filter((w) => w.ket === "Dikontrakkan").length;
  const kosong = dataWarga.filter((w) => w.ket === "Kosong").length;
  const kasBanjir = banjirKontribusi.reduce(
    (s, r) => s + BANJIR_BULAN.reduce((a, b) => a + Number(r[b] || 0), 0),
    0,
  );
  const donutData = [
    { label: "Dihuni", value: dihuni, color: "#f97316" },
    { label: "Dikontrakkan", value: kontrak, color: "#22c55e" },
    { label: "Kosong", value: kosong, color: "#3b82f6" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background foto perumahan + overlay gelap agar teks tetap terbaca */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-100"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d10]/75 via-[#0d0d10]/85 to-[#0d0d10]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d10]/90 to-transparent" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="chip bg-white/5 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {profil.desa} · {profil.kecamatan} · {profil.kabupaten}
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] sm:text-7xl">
            Ruang Digital <span className="text-orange-500">Warga</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl muted">
            Solusi cerdas mengelola lingkungan, menjaga transparansi keuangan,
            serta mempromosikan usaha warga {profil.nama}.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/kas" className="btn-orange">
              📊 Status Kas & Iuran
            </Link>
            <Link to="/hunian" className="btn-outline">
              🏠 Hunian Tersedia
            </Link>
          </div>

          {/* stat strip */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Total Kavling", totalRumah, "🏘️"],
              ["Ditempati", hunian.ditempati, "🏠"],
              ["Dikontrakkan", hunian.dikontrakkan, "🔑"],
              ["Saldo Kas", rp(totalKas), "🏦"],
            ].map(([l, v, e]) => (
              <div key={l} className="card p-5">
                <div className="text-2xl">{e}</div>
                <p className="mt-2 text-2xl font-extrabold">{v}</p>
                <p className="text-xs muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD RINGKAS (ala griyamelati) */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <DashCard
            to="/data-warga"
            emoji="👥"
            label="Warga"
            value={totalRumah}
            unit="Rumah"
          />
          <DashCard
            to="/kas"
            emoji="💧"
            label="Saldo Kas"
            value={rp(totalKas)}
          />
          <DashCard
            to="/banjir"
            emoji="⛩️"
            label="Kas Banjir"
            value={rp(kasBanjir)}
          />
          <DashCard
            to="/warga"
            emoji="📅"
            label="Agenda"
            value={agenda.length}
            unit="Agenda aktif"
          />
          <DashCard
            to="/usaha"
            emoji="🏪"
            label="Usaha"
            value={usaha.length}
            cta="Jelajahi"
          />
        </div>
      </section>

      {/* VOTING + STATISTIK */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
        <Voting />
        <div className="card p-6">
          <h3 className="text-center text-lg font-bold">Statistik Hunian</h3>
          <div className="mt-4 grid place-items-center">
            <Donut data={donutData} />
          </div>
        </div>
      </section>

      {/* FEATURE GRID -> routes */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-2xl font-bold">Jelajahi Portal</h2>
        <p className="muted">Setiap bagian punya halamannya sendiri.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            to="/iuran"
            emoji="🧾"
            title="Iuran Warga"
            desc={`Sampah, keamanan, kebersihan. Total ${rp(iuranTotal)}/bulan per rumah.`}
            cta="Lihat rincian iuran"
          />
          <Feature
            to="/kas"
            emoji="🏦"
            title="Transparansi Kas"
            desc="Saldo kas & seluruh riwayat pemasukan/pengeluaran."
            cta="Lihat kas"
          />
          <Feature
            to="/siteplan"
            emoji="🗺️"
            title="Siteplan & Peta Kavling"
            desc="Peta interaktif status tiap kavling di semua blok."
            cta="Buka peta"
          />
          <Feature
            to="/usaha"
            emoji="🏪"
            title="Usaha Warga"
            desc={`${usaha.length} usaha & jasa warga siap dihubungi.`}
            cta="Jelajahi usaha"
          />
          <Feature
            to="/hunian"
            emoji="🔑"
            title="Hunian Tersedia"
            desc="Rumah dikontrakkan & dijual di dalam cluster."
            cta="Cari hunian"
          />
          <Feature
            to="/warga"
            emoji="📢"
            title="Suara & Pengumuman"
            desc="Voting warga dan info kegiatan terbaru."
            cta="Ikut berpartisipasi"
          />
        </div>
      </section>

      {/* PENGUMUMAN singkat */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Pengumuman Terbaru</h2>
          <Link to="/warga" className="text-sm font-semibold text-orange-400">
            Semua →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {pengumuman.slice(0, 3).map((p, i) => (
            <div key={i} className="card overflow-hidden">
              {p.foto && (
                <img src={p.foto} alt="" className="h-36 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="chip bg-orange-500/15 text-orange-300">
                    {p.tag}
                  </span>
                  <span className="text-xs muted">{p.tgl}</span>
                </div>
                <h3 className="mt-3 font-bold">{p.judul}</h3>
                <p className="mt-1 text-sm muted">{p.isi}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* JADWAL KEBERSIHAN */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl font-bold">Jadwal Kebersihan & Sampah</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {jadwalSampah.map((j) => (
            <div key={j.wilayah} className="card p-5">
              <p className="text-sm font-medium text-orange-400">{j.hari}</p>
              <p className="mt-1 text-lg font-bold">{j.wilayah}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOKASI */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold">Lokasi {profil.nama}</h2>
        <p className="muted">Klik untuk rute langsung ke Google Maps.</p>
        <div className="mt-6">
          <MapEmbed lokasi={lokasi} />
        </div>
      </section>
    </div>
  );
}
