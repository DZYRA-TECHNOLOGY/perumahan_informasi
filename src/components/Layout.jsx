import { useEffect, useState, useRef } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
import { useData } from "../lib/useData.js";
import { profil, statistik, kontak } from "../data/siteplan.js";

const LOGO = "/Gemini_Generated_Image_plrfr5plrfr5plrf-removebg-preview.png";

const MENU = [
  { label: "Beranda", to: "/", end: true },
  {
    label: "Menu Warga",
    items: [
      { to: "/data-warga", label: "Data Kavling & Warga" },
      { to: "/struktur", label: "Struktur Organisasi" },
      { to: "/siteplan", label: "Siteplan & Peta" },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { to: "/kas", label: "Saldo Kas & Transaksi" },
      { to: "/keuangan", label: "Rekap Laporan Keuangan" },
      { to: "/iuran", label: "Iuran Warga" },
      // { to: "/iuran-air", label: "Iuran Air" },
      { to: "/banjir", label: "Dana Banjir" },
    ],
  },
  {
    label: "Layanan",
    items: [
      { to: "/usaha", label: "Usaha Warga" },
      { to: "/hunian", label: "Hunian Tersedia" },
      { to: "/masukan", label: "Masukan & Saran" },
    ],
  },
  {
    label: "Kegiatan",
    items: [
      { to: "/warga", label: "Agenda & Voting" },
      { to: "/galeri", label: "Galeri Kegiatan" },
    ],
  },
];

function Dropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const on = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="link-nav flex items-center gap-1"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition ${open ? "rotate-180 text-orange-400" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl bg-[#17171b] p-1 shadow-2xl ring-1 ring-white/10">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-orange-500/15 text-orange-400" : "text-zinc-200 hover:bg-white/5"}`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const data = useData();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    data.reload();
  }, [loc.pathname]); // eslint-disable-line
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 no-print">
        <div className="mx-auto max-w-7xl transform-gpu rounded-2xl border border-white/10 bg-[#111114]/92 shadow-[0_15px_50px_rgba(0,0,0,.35)] backdrop-blur-md lg:rounded-full">
          {/* ===== DESKTOP: logo di tengah, menu terbelah ===== */}
          <div className="hidden grid-cols-[1fr_auto_1fr] items-center px-8 py-2.5 lg:grid">
            <nav className="flex items-center justify-end gap-8 pr-8">
              {MENU.slice(0, 3).map((m) =>
                m.items ? (
                  <Dropdown key={m.label} label={m.label} items={m.items} />
                ) : (
                  <NavLink
                    key={m.label}
                    to={m.to}
                    end={m.end}
                    className={({ isActive }) =>
                      `link-nav ${isActive ? "text-orange-400" : ""}`
                    }
                  >
                    {m.label}
                  </NavLink>
                ),
              )}
            </nav>

            <Link to="/" className="flex justify-center">
              <img
                src={LOGO}
                alt="Sigerland"
                className="h-20 w-auto object-contain transition duration-300 hover:scale-105"
              />
            </Link>

            <nav className="flex items-center justify-start gap-8 pl-8">
              {MENU.slice(3).map((m) =>
                m.items ? (
                  <Dropdown key={m.label} label={m.label} items={m.items} />
                ) : (
                  <NavLink
                    key={m.label}
                    to={m.to}
                    end={m.end}
                    className={({ isActive }) =>
                      `link-nav ${isActive ? "text-orange-400" : ""}`
                    }
                  >
                    {m.label}
                  </NavLink>
                ),
              )}
              <Link to="/admin" className="btn-orange text-sm">
                Login Pengurus
              </Link>
            </nav>
          </div>

          {/* ===== MOBILE BAR: hamburger | logo | login ===== */}
          <div className="grid grid-cols-3 items-center px-3 py-2 lg:hidden">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="justify-self-start rounded-xl p-2.5 text-zinc-100 ring-1 ring-white/15 transition active:scale-95"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="justify-self-center">
              <img
                src={LOGO}
                alt="Sigerland"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <Link
              to="/admin"
              aria-label="Login Pengurus"
              className="justify-self-end rounded-xl bg-orange-500/15 p-2.5 text-orange-400 ring-1 ring-orange-500/30 transition active:scale-95"
            >
              <LogIn size={18} />
            </Link>
          </div>

          {/* ===== MOBILE PANEL (slide-down) ===== */}
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-out lg:hidden ${
              open ? "max-h-[80vh]" : "max-h-0"
            }`}
          >
            <nav className="max-h-[74vh] space-y-1 overflow-y-auto border-t border-white/10 px-3 py-3">
              {MENU.map((m) =>
                m.items ? (
                  <div key={m.label} className="pb-1 pt-2">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-orange-400/80">
                      {m.label}
                    </p>
                    {m.items.map((it) => (
                      <NavLink
                        key={it.to}
                        to={it.to}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-3 text-[15px] transition ${
                            isActive
                              ? "bg-orange-500/15 font-semibold text-orange-400"
                              : "text-zinc-200 hover:bg-white/5"
                          }`
                        }
                      >
                        {it.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink
                    key={m.label}
                    to={m.to}
                    end={m.end}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400"
                          : "text-zinc-200 hover:bg-white/5"
                      }`
                    }
                  >
                    {m.label}
                  </NavLink>
                ),
              )}
              <Link
                to="/admin"
                className="btn-orange mt-3 w-full justify-center"
              >
                <LogIn size={17} /> Login Pengurus
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div key={loc.pathname} className="animate-[fadeIn_.25s_ease]">
          <Outlet context={data} />
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0c]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-sm">
              <p className="text-lg font-extrabold">
                <span className="text-white">Siger</span>
                <span className="text-orange-500">land</span>
              </p>
              <p className="mt-1 text-sm muted">{kontak.alamat}</p>
              <p className="mt-1 text-sm muted">Ketua RT: {kontak.ketuaRT}</p>
            </div>
            <div className="flex gap-8">
              {[
                ["Pengunjung", statistik.pengunjung],
                ["Warga aktif", statistik.wargaAktif],
                ["Usaha", statistik.usaha],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-2xl font-extrabold text-orange-500">{v}</p>
                  <p className="text-xs muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-center text-xs muted sm:flex-row">
            <p>
              © 2026 {profil.nama} — {profil.tagline} - {profil.author}.
            </p>
            <p>
              Sumber data:{" "}
              {data.source === "supabase"
                ? "Supabase (live)"
                : "data lokal (demo)"}{" "}
              · Update {statistik.updateTerakhir}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
