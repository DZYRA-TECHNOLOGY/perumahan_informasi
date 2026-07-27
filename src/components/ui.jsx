import { Printer, Store } from "lucide-react";

export const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

// Foto default per kategori (Unsplash). Dipakai kalau item tak punya `foto` sendiri.
const KAT_FOTO = {
  "Rental Mobil":
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop",
  Makanan:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
  Jasa: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80&auto=format&fit=crop",
  Toko: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop",
  Kontrakan:
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop",
};
const KAT_EMOJI = {
  "Rental Mobil": "🚗",
  Makanan: "🍲",
  Jasa: "🧺",
  Toko: "🛒",
  Kontrakan: "🏠",
};
const KAT_WARNA = {
  "Rental Mobil": "from-sky-400 to-blue-600",
  Makanan: "from-orange-400 to-rose-500",
  Jasa: "from-cyan-400 to-sky-600",
  Toko: "from-amber-400 to-orange-600",
  Kontrakan: "from-emerald-400 to-teal-600",
};

// Lengkapi item dengan foto/emoji/warna default berdasarkan kategori.
export function coverProps(item = {}) {
  return {
    foto: item.foto || KAT_FOTO[item.kategori],
    emoji: item.emoji || KAT_EMOJI[item.kategori] || "🏪",
    warna:
      item.warna || KAT_WARNA[item.kategori] || "from-orange-400 to-orange-600",
  };
}

// Cover dengan foto di atas gradient; kalau foto gagal dimuat, ikon netral tampil.
export function Cover({ foto, warna, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${warna} ${className}`}
    >
      <span className="absolute inset-0 grid place-items-center text-white/60">
        <Store size={40} strokeWidth={1.5} />
      </span>
      {foto && (
        <img
          src={foto}
          alt=""
          loading="lazy"
          className="relative h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

// Header band di atas tiap halaman detail.
export function PageHero({ kicker, title, desc, children }) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-orange-500/[0.08] to-transparent">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {kicker && (
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            {kicker}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-lg muted">{desc}</p>}
        {children}
      </div>
    </div>
  );
}

export function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto max-w-6xl px-4 py-12 ${className}`}>
      {children}
    </div>
  );
}

export function ContainerAdmin({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full px-4 py-12 ${className}`}>{children}</div>
  );
}

// Tombol cetak (hanya di layar). Judul khusus cetak muncul saat print.
export function PrintButton({ label = "Cetak Laporan" }) {
  return (
    <button
      onClick={() => window.print()}
      className="btn-outline no-print text-sm"
    >
      <Printer size={16} /> {label}
    </button>
  );
}

// Kop laporan yang hanya tampil ketika dicetak.
export function PrintHeader({ title }) {
  return (
    <div className="print-title mb-4 border-b border-black pb-3">
      <h1 className="text-xl font-bold">Cluster Sigerland — {title}</h1>
      <p className="text-sm">
        Portal Transparansi Warga · Desa Sabah Balau, Jati Agung, Lampung
        Selatan
      </p>
    </div>
  );
}
