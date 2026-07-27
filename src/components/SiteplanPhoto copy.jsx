import { useState } from "react";
import {
  petaBlokMeta,
  kavlingList,
  STATUS,
  rekapStatus,
} from "../data/siteplan.js";

// Posisi hotspot tiap blok dalam persen (x,y) relatif terhadap gambar siteplan.
// Nilai awal perkiraan — pakai tombol "Kalibrasi" untuk menyesuaikan ke gambarmu,
// lalu salin angka yang muncul ke sini.
const HOTSPOTS = {
  A: { x: 34, y: 55 },
  B: { x: 55, y: 60 },
  C: { x: 44, y: 30 },
  D: { x: 68, y: 30 },
  E: { x: 86, y: 40 },
  F: { x: 74, y: 78 },
};

const rp = (n) => "Rp " + n.toLocaleString("id-ID");

export default function SiteplanPhoto() {
  const [active, setActive] = useState(null);
  const [kalibrasi, setKalibrasi] = useState(false);
  const [coord, setCoord] = useState(null);
  const [imgOk, setImgOk] = useState(true);

  const onImgClick = (e) => {
    if (!kalibrasi) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
    const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
    setCoord({ x, y });
  };

  const blokInfo = (kode) => {
    const meta = petaBlokMeta.find((b) => b.kode === kode);
    const cells = kavlingList.filter((k) => k.blok === kode);
    const byStatus = cells.reduce(
      (a, c) => ((a[c.status] = (a[c.status] || 0) + 1), a),
      {},
    );
    return { meta, byStatus, total: cells.length };
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setKalibrasi((v) => !v)}
          className={`chip ring-1 transition ${
            kalibrasi
              ? "bg-orange-500 text-white ring-orange-500"
              : "text-zinc-200 ring-white/15 hover:bg-white/5"
          }`}
        >
          {kalibrasi
            ? "✓ Mode Kalibrasi (klik gambar)"
            : "Kalibrasi posisi hotspot"}
        </button>
        {coord && (
          <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-xs text-emerald-400 ring-1 ring-white/10">
            x: {coord.x}, y: {coord.y} — salin ke HOTSPOTS
          </span>
        )}
      </div>

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
                </code>{" "}
                lalu muat ulang halaman.
              </p>
            </div>
          </div>
        )}

        {/* Hotspot marker tiap blok */}
        {imgOk &&
          Object.entries(HOTSPOTS).map(([kode, pos]) => (
            <button
              key={kode}
              onClick={() => setActive(kode)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              title={`Blok ${kode}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-black text-slate-900 shadow-lg ring-2 ring-white/70 transition group-hover:scale-125">
                {kode}
              </span>
              <span className="absolute left-1/2 top-1/2 -z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan-400/50" />
            </button>
          ))}
      </div>

      {/* Panel info blok */}
      {active &&
        (() => {
          const { meta, byStatus, total } = blokInfo(active);
          return (
            <div className="mt-4 flex flex-col gap-4 card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold">Blok {active}</p>
                <p className="text-sm muted">
                  {total} kavling · DP {rp(meta.dp)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS)
                  .filter(([k]) => byStatus[k])
                  .map(([k, s]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      {s.label}: {byStatus[k]}
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setActive(null)}
                className="text-xs muted hover:text-zinc-100"
              >
                Tutup ✕
              </button>
            </div>
          );
        })()}

      <p className="mt-3 text-xs muted">
        Klik titik blok (A–F) di atas gambar untuk melihat rekap status. Total
        terpetakan: {kavlingList.length} kavling. Distribusi:{" "}
        {Object.entries(rekapStatus)
          .map(([k, v]) => `${k} ${v}`)
          .join(" · ")}
        .
      </p>
    </div>
  );
}
