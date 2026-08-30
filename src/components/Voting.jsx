import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Voting() {
  const {
    votingOpsi = [],
    votingPertanyaan = "",
    reload,
  } = useOutletContext();

  const pollKey = "voted:" + (votingPertanyaan || "poll");
  const [voted, setVoted] = useState(() => {
    try {
      return localStorage.getItem(pollKey);
    } catch {
      return null;
    }
  });
  const [busy, setBusy] = useState(false);
  const hasVoted = voted != null;
  const total = votingOpsi.reduce((s, o) => s + Number(o.suara || 0), 0);

  const pilih = async (o) => {
    if (hasVoted || busy) return;
    setBusy(true);
    try {
      if (supabase && o.id != null) {
        await supabase
          .from("voting_opsi")
          .update({ suara: Number(o.suara || 0) + 1 })
          .eq("id", o.id);
        await reload?.();
      }
      const key = String(o.id ?? o.teks);
      try {
        localStorage.setItem(pollKey, key);
      } catch {
        /* abaikan */
      }
      setVoted(key);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-6">
      <p className="text-sm font-semibold text-orange-500">POLLING WARGA</p>
      <h3 className="mt-1 text-xl font-bold">
        {votingPertanyaan || "Belum ada polling"}
      </h3>
      <div className="mt-5 space-y-3">
        {votingOpsi.length === 0 && (
          <p className="text-sm muted">Belum ada opsi voting.</p>
        )}
        {votingOpsi.map((o, i) => {
          const pct = total ? Math.round((Number(o.suara || 0) / total) * 100) : 0;
          const mine = voted === String(o.id ?? o.teks);
          return (
            <button
              key={o.id ?? i}
              onClick={() => pilih(o)}
              disabled={hasVoted || busy}
              className={`relative block w-full overflow-hidden rounded-xl p-3 text-left ring-1 transition ${
                mine ? "ring-orange-500" : "ring-white/10"
              } ${!hasVoted ? "hover:ring-orange-500/60" : ""}`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-orange-500/20 transition-all"
                style={{ width: `${hasVoted ? pct : 0}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium">
                  {o.teks} {mine && "✓"}
                </span>
                {hasVoted && (
                  <span className="text-sm font-bold text-orange-400">{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs muted">
        {hasVoted
          ? `Terima kasih! Total ${total} suara.`
          : busy
            ? "Menyimpan suara…"
            : "Klik salah satu untuk memberi suara."}
      </p>
    </div>
  );
}
