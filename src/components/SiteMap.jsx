import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

const rp = (n) => "Rp " + n.toLocaleString("id-ID");

// ✅ Status dan warna sesuai ketentuan baru
const STATUS = {
  TERJUAL: { label: "Terjual/Terbooking", color: "#ec4899" }, // Pink
  INDENT: { label: "Indent (Belum Terjual)", color: "#f8fafc" }, // Putih
  AKAD: { label: "Sudah Akad", color: "#3b82f6" }, // Biru
};

// ✅ Blok dan DP sesuai ketentuan
const BLOK_CONFIG = {
  A: {
    kode: "A",
    range: "A1-A31",
    dp: 5000000,
    count: 31,
    label: "Blok A (A1-A31)",
  },
  B1: {
    kode: "B1",
    range: "B1-B28",
    dp: 5000000,
    count: 28,
    label: "Blok B (B1-B28)",
  },
  B2: {
    kode: "B2",
    range: "B29-B57",
    dp: 3000000,
    count: 29,
    label: "Blok B (B29-B57)",
  },
  C: {
    kode: "C",
    range: "C",
    dp: 3000000,
    count: 0,
    label: "Blok C",
  },
  D: {
    kode: "D",
    range: "D",
    dp: 3000000,
    count: 0,
    label: "Blok D",
  },
  E: {
    kode: "E",
    range: "E",
    dp: 3000000,
    count: 0,
    label: "Blok E",
  },
  F: {
    kode: "F",
    range: "F",
    dp: 3000000,
    count: 0,
    label: "Blok F",
  },
};

export default function SiteMap() {
  const [filter, setFilter] = useState(null);
  const [selected, setSelected] = useState(null);

  // ✅ State untuk data dari database
  const [dbKavling, setDbKavling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rekapStatus, setRekapStatus] = useState({});

  // ✅ Load data dari Supabase
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

        // Transform data warga ke format kavling
        const kavling = (warga || []).map((w) => {
          // Tentukan status berdasarkan keterangan
          let status = "INDENT"; // Default: putih (belum terjual)
          if (w.ket === "Dihuni" || w.ket === "Dikontrakkan") {
            status = "AKAD"; // Biru (sudah akad)
          } else if (
            w.status_kavling === "terjual" ||
            w.status_kavling === "terbooking"
          ) {
            status = "TERJUAL"; // Pink (terjual/terbooking)
          }

          // Ekstrak kode blok (A, B, C, D, E, F)
          const blokMatch = w.blok?.match(/^([A-F])/);
          const kodeBlok = blokMatch ? blokMatch[1] : "A";

          // Tentukan sub-blok untuk B
          let blokKey = kodeBlok;
          if (kodeBlok === "B") {
            const nomor = parseInt(w.blok?.replace(/[^0-9]/g, "") || "0");
            blokKey = nomor <= 28 ? "B1" : "B2";
          }

          const config = BLOK_CONFIG[blokKey];

          return {
            id: w.blok,
            blok: kodeBlok,
            blokKey,
            nomor: w.blok?.replace(/[^0-9]/g, "") || "",
            status,
            dp: config?.dp || 3000000,
            hook: w.hook || false,
            pemilik: w.pemilik,
            penghuni: w.penghuni,
            ket: w.ket,
            status_kavling: w.status_kavling,
          };
        });

        setDbKavling(kavling);

        // Hitung rekap status
        const rekap = {};
        kavling.forEach((k) => {
          rekap[k.status] = (rekap[k.status] || 0) + 1;
        });
        setRekapStatus(rekap);
      } catch (err) {
        console.error("Gagal memuat data kavling:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // ✅ Real-time subscription
    const channel = supabase
      .channel("kavling-changes")
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

  const kavlingList = dbKavling;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-7 w-24 bg-white/5 rounded-lg mb-3" />
            <div className="flex gap-1.5">
              {[...Array(10)].map((_, j) => (
                <div key={j} className="h-7 w-7 rounded-md bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Info DP */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(BLOK_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
          >
            <p className="text-xs font-semibold text-orange-400">
              {config.range}
            </p>
            <p className="text-xs muted mt-0.5">DP {rp(config.dp)}</p>
          </div>
        ))}
      </div>

      {/* ✅ Hook info */}
      <div className="mb-4 rounded-xl bg-yellow-500/10 px-4 py-2.5 ring-1 ring-yellow-500/20">
        <p className="text-sm text-yellow-300">
          💎 <span className="font-semibold">Posisi Hook +{rp(10000000)}</span>
          <span className="text-xs text-yellow-400/70 ml-2">
            dari harga DP normal
          </span>
        </p>
      </div>

      {/* ✅ Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`chip ring-1 transition ${!filter ? "bg-orange-500 text-white ring-orange-500" : "text-zinc-200 ring-white/15 hover:bg-white/5"}`}
        >
          Semua ({kavlingList.length})
        </button>
        {Object.entries(STATUS)
          .filter(([k]) => rekapStatus[k])
          .map(([k, s]) => (
            <button
              key={k}
              onClick={() => setFilter(filter === k ? null : k)}
              className={`chip ring-1 transition ${filter === k ? "bg-orange-500 text-white ring-orange-500" : "text-zinc-200 ring-white/15 hover:bg-white/5"}`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-black/20"
                style={{ background: s.color }}
              />
              {s.label} ({rekapStatus[k] || 0})
            </button>
          ))}
      </div>

      {/* ✅ Grid Blok */}
      <div className="space-y-5">
        {Object.entries(BLOK_CONFIG).map(([key, config]) => {
          const cells = kavlingList.filter((k) => k.blokKey === key);
          // Jika data kosong, generate placeholder
          const displayCells =
            cells.length > 0
              ? cells
              : Array.from({ length: config.count || 10 }, (_, i) => ({
                  id: `${config.kode}${i + 1}`,
                  blok: config.kode,
                  status: "INDENT",
                  dp: config.dp,
                  hook: false,
                }));

          return (
            <div key={key} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-black text-white">
                    {config.kode}
                  </span>
                  <div>
                    <span className="text-sm font-semibold">
                      {config.label}
                    </span>
                    <p className="text-xs muted">
                      {config.range} · DP {rp(config.dp)}
                    </p>
                  </div>
                </div>
                <span className="text-xs muted">
                  {displayCells.length} kavling
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {displayCells.map((k) => {
                  const s = STATUS[k.status] || {
                    color: "#f8fafc",
                    label: "Indent",
                  };
                  const dim = filter && filter !== k.status;
                  return (
                    <button
                      key={k.id}
                      title={`${k.id} — ${s.label}${k.hook ? " · Hook +Rp 10 jt" : ""}\nDP: ${rp(k.dp || config.dp)}`}
                      onClick={() => setSelected(k)}
                      className={`relative h-7 w-7 rounded-md text-[9px] font-bold ring-1 ring-black/10 transition hover:scale-110 ${
                        dim ? "opacity-25" : ""
                      } ${
                        k.status === "INDENT"
                          ? "text-slate-700 ring-slate-300"
                          : k.status === "AKAD"
                            ? "text-white"
                            : "text-white"
                      }`}
                      style={{ background: s.color }}
                    >
                      {k.id?.replace(k.blok, "") || ""}
                      {k.hook && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400 ring-1 ring-black/20" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ✅ Statistik per blok */}
              {cells.length > 0 && (
                <div className="mt-2 flex gap-3 text-[10px] text-zinc-400">
                  {Object.entries(STATUS).map(([k, s]) => {
                    const count = cells.filter((c) => c.status === k).length;
                    if (count === 0) return null;
                    return (
                      <span key={k} className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: s.color }}
                        />
                        {count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ Modal Detail */}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#17171b] p-6 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-xl ring-1 ring-white/20"
                style={{
                  background: STATUS[selected.status]?.color || "#f8fafc",
                }}
              />
              <div>
                <p className="text-lg font-bold">Kavling {selected.id}</p>
                <p className="text-sm muted">Blok {selected.blok}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="muted">Status</dt>
                <dd className="font-medium">
                  {STATUS[selected.status]?.label || "Indent"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="muted">DP</dt>
                <dd className="font-medium text-orange-400">
                  {rp(selected.dp || 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="muted">Posisi Hook</dt>
                <dd className="font-medium">
                  {selected.hook ? (
                    <span className="text-yellow-400">
                      Ya (+{rp(10000000)})
                    </span>
                  ) : (
                    "Tidak"
                  )}
                </dd>
              </div>
              {selected.pemilik && (
                <div className="flex justify-between">
                  <dt className="muted">Pemilik</dt>
                  <dd className="font-medium">{selected.pemilik}</dd>
                </div>
              )}
              {selected.penghuni && (
                <div className="flex justify-between">
                  <dt className="muted">Penghuni</dt>
                  <dd className="font-medium">{selected.penghuni}</dd>
                </div>
              )}
            </dl>
            <button
              onClick={() => setSelected(null)}
              className="btn-outline mt-5 w-full"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ec4899]" /> Pink:
            Terjual/Terbooking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#f8fafc] ring-1 ring-slate-300" />{" "}
            Putih: Indent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#3b82f6]" /> Biru: Sudah
            Akad
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" /> Hook +10jt
          </span>
        </div>
        <p className="text-xs text-emerald-400">✓ Data real-time</p>
      </div>
    </div>
  );
}
