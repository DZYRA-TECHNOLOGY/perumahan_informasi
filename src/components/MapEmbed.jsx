import LeafletMap from "./LeafletMap.jsx";

// Peta lokasi publik (OpenStreetMap via Leaflet — gratis, tanpa API key).
export default function MapEmbed({ lokasi, height = 340 }) {
  const l = lokasi || {};
  const lat = l.lat ?? -5.3581;
  const lng = l.lng ?? 105.3149;
  const zoom = l.zoom ?? 16;

  return (
    <div className="card overflow-hidden">
      <LeafletMap
        lat={lat}
        lng={lng}
        zoom={zoom}
        label={l.label || "Cluster Sigerland"}
        height={height}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold">{l.label || "Cluster Sigerland"}</p>
          <p className="text-sm muted">{l.alamat}</p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="btn-orange text-sm no-print"
        >
          📍 Rute di Google Maps
        </a>
      </div>
    </div>
  );
}
