import LeafletMap from "./LeafletMap.jsx";
import { Navigation } from "lucide-react";

export default function MapEmbed({
  lokasi,
  height = 340,
  defaultLayer = "street",
  showLayerControl = true,
  scrollWheel = true,
  showHomeButton = true,
  popupData = null, // Data tambahan untuk popup
  autoOpenPopup = true,
}) {
  const l = lokasi || {};
  const lat = l.lat ?? -5.3581;
  const lng = l.lng ?? 105.3149;
  const zoom = l.zoom ?? 16;

  // Gabungkan data lokasi dengan data popup
  const mergedPopupData = {
    label: l.label || "Cluster Sigerland",
    alamat: l.alamat || "Jl. Contoh No. 123, Bandar Lampung",
    kategori: l.kategori || "Perumahan",
    kontak: l.kontak || "(0721) 123456",
    jamOperasional: l.jamOperasional || "08:00 - 17:00",
    lat: lat,
    lng: lng,
    ...popupData,
  };

  return (
    // PENTING: jangan pakai overflow-hidden di sini, karena popup di LeafletMap
    // butuh ruang bebas agar tidak kepotong (lihat perbaikan LeafletMap.jsx)
    <div className="card relative">
      <LeafletMap
        lat={lat}
        lng={lng}
        zoom={zoom}
        label={l.label || "Cluster Sigerland"}
        height={height}
        defaultLayer={defaultLayer}
        showLayerControl={showLayerControl}
        scrollWheel={scrollWheel}
        showHomeButton={showHomeButton}
        popupData={mergedPopupData}
        autoOpenPopup={autoOpenPopup}
      />
      {/* Tombol navigasi di bawah (opsional) */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white/90 backdrop-blur-sm text-sm font-medium px-4 py-2 rounded-lg shadow-lg border border-gray-200/50 hover:bg-white transition-colors flex items-center gap-2 text-gray-700"
        >
          <Navigation size={16} />
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}
