import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

const rp = (n) => "Rp " + n.toLocaleString("id-ID");

// ✅ Status dan warna
const STATUS = {
  TERJUAL: { label: "Terjual/Terbooking", color: "#ec4899" },
  INDENT: { label: "Indent (Belum Terjual)", color: "#f8fafc" },
  AKAD: { label: "Sudah Akad", color: "#3b82f6" },
};

// ✅ Blok config
const BLOK_CONFIG = {
  A: { kode: "A", range: "A1-A31", dp: 5000000, count: 31 },
  B1: { kode: "B1", range: "B1-B28", dp: 5000000, count: 28 },
  B2: { kode: "B2", range: "B29-B57", dp: 3000000, count: 29 },
  C: { kode: "C", range: "C", dp: 3000000, count: 0 },
  D: { kode: "D", range: "D", dp: 3000000, count: 0 },
  E: { kode: "E", range: "E", dp: 3000000, count: 0 },
  F: { kode: "F", range: "F", dp: 3000000, count: 0 },
};

// Hotspot posisi blok di gambar
const HOTSPOTS = {
  A: { x: 34, y: 55 },
  B1: { x: 52, y: 60 },
  B2: { x: 60, y: 58 },
  C: { x: 44, y: 30 },
  D: { x: 68, y: 30 },
  E: { x: 86, y: 40 },
  F: { x: 74, y: 78 },
};

export default function SiteplanPhoto() {
  const [active, setActive] = useState(null);
  const [kalibrasi, setKalibrasi] = useState(false);
  const [coord, setCoord] = useState(null);
  const [imgOk, setImgOk] = useState(true);

  const [dbKavling, setDbKavling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rekapStatus, setRekapStatus] = useState({});

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const { data: warga, error } = await supabase
          .from("data_warga")
          .select("*")
          .order("blok", { ascending: true });

        if (error) throw error;

        const kavling = (warga || []).map((w) => {
          let status = "INDENT";
          if (w.ket === "Dihuni" || w.ket === "Dikontrakkan") {
            status = "AKAD";
          } else if (
            w.status_kavling === "terjual" ||
            w.status_kavling === "terbooking"
          ) {
            status = "TERJUAL";
          }

          const blokMatch = w.blok?.match(/^([A-F])/);
          const kodeBlok = blokMatch ? blokMatch[1] : "A";

          let blokKey = kodeBlok;
          if (kodeBlok === "B") {
            const nomor = parseInt(w.blok?.replace(/[^0-9]/g, "") || "0");
            blokKey = nomor <= 28 ? "B1" : "B2";
          }

          return {
            id: w.blok,
            blok: kodeBlok,
            blokKey,
            status,
            dp: BLOK_CONFIG[blokKey]?.dp || 3000000,
            hook: w.hook || false,
            pemilik: w.pemilik,
            penghuni: w.penghuni,
            ket: w.ket,
          };
        });

        setDbKavling(kavling);

        const rekap = {};
        kavling.forEach((k) => {
          rekap[k.status] = (rekap[k.status] || 0) + 1;
        });
        setRekapStatus(rekap);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const channel = supabase
      .channel("siteplan-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "data_warga" },
        () => loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onImgClick = (e) => {
    if (!kalibrasi) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
    const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
    setCoord({ x, y });
  };

  const blokInfo = (blokKey) => {
    const config = BLOK_CONFIG[blokKey];
    const cells = dbKavling.filter((k) => k.blokKey === blokKey);
    const byStatus = {};
    cells.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    return { config, cells, byStatus, total: cells.length };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 bg-white/5 rounded-lg" />
        <div className="aspect-[16/10] bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* DP Info */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.values(BLOK_CONFIG)
          .slice(0, 6)
          .map((config, i) => (
            <div
              key={i}
              className="rounded-lg bg-white/5 px-3 py-2 text-center ring-1 ring-white/10"
            >
              <p className="text-xs font-semibold text-orange-400">
                {config.range}
              </p>
              <p className="text-[10px] muted">DP {rp(config.dp)}</p>
            </div>
          ))}
      </div>

      {/* Hook + Kalibrasi */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setKalibrasi((v) => !v)}
          className={`chip ring-1 transition ${kalibrasi ? "bg-orange-500 text-white ring-orange-500" : "text-zinc-200 ring-white/15 hover:bg-white/5"}`}
        >
          {kalibrasi ? "✓ Mode Kalibrasi" : "Kalibrasi"}
        </button>
        {coord && (
          <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-xs text-emerald-400 ring-1 ring-white/10">
            x: {coord.x}, y: {coord.y}
          </span>
        )}
        <div className="ml-auto rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-300">
          💎 Hook +{rp(10000000)}
        </div>
      </div>

      {/* Gambar Siteplan */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
        {imgOk ? (
          <img
            src="/siteplan.png"
            alt="Siteplan Cluster Sigerland"
            onError={() => setImgOk(false)}
            onClick={onImgClick}
            className="block w-full select-none"
            draggable={false}
          />
        ) : (
          <div className="grid aspect-[16/10] place-items-center bg-white/[0.03] p-8 text-center">
            <div>
              <p className="text-zinc-200">Gambar siteplan belum ada.</p>
              <p className="mt-1 text-sm muted">
                Simpan file siteplan sebagai{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-orange-400">
                  public/siteplan.png
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Hotspot */}
        {imgOk &&
          Object.entries(HOTSPOTS).map(([key, pos]) => {
            const { total } = blokInfo(key);
            const config = BLOK_CONFIG[key];
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                title={`${config?.label || key} — ${total} kavling`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-black text-slate-900 shadow-lg ring-2 ring-white/70 transition group-hover:scale-125">
                  {config?.kode || key}
                </span>
                <span className="absolute left-1/2 top-1/2 -z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan-400/50" />
              </button>
            );
          })}
      </div>

      {/* Panel Info */}
      {active &&
        (() => {
          const { config, cells, byStatus, total } = blokInfo(active);
          return (
            <div className="mt-4 card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {config?.label || `Blok ${active}`}
                  </p>
                  <p className="text-sm muted">
                    {config?.range} · {total} kavling · DP {rp(config?.dp || 0)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([k, s]) => {
                    const count = byStatus[k] || 0;
                    if (count === 0) return null;
                    return (
                      <span
                        key={k}
                        className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        {s.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="mt-3 text-xs muted hover:text-zinc-100"
              >
                Tutup ✕
              </button>
            </div>
          );
        })()}

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ec4899]" />{" "}
          Terjual/Terbooking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#f8fafc] ring-1 ring-slate-300" />{" "}
          Indent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#3b82f6]" /> Sudah Akad
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-yellow-400" /> Hook +10jt
        </span>
        <span className="ml-auto text-emerald-400">✓ Real-time</span>
      </div>
    </div>
  );
}
