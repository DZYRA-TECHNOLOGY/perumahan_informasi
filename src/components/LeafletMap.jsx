import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker pin oranye pakai divIcon (hindari masalah gambar marker default Leaflet).
const pinIcon = L.divIcon({
  html: '<div style="font-size:30px;line-height:1">📍</div>',
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

// Peta OpenStreetMap (gratis, tanpa API key).
// Jika `onPick` diberikan → mode admin: klik/geser marker untuk memilih lokasi.
export default function LeafletMap({
  lat = -5.3581,
  lng = 105.3149,
  zoom = 16,
  onPick,
  label,
  height = 340,
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    if (mapRef.current || !elRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView(
      [Number(lat) || -5.3581, Number(lng) || 105.3149],
      Number(zoom) || 16,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([Number(lat) || -5.3581, Number(lng) || 105.3149], {
      icon: pinIcon,
      draggable: !!onPick,
    }).addTo(map);
    if (label) marker.bindPopup(label);

    if (onPick) {
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        pickRef.current?.(e.latlng.lat, e.latlng.lng);
      });
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        pickRef.current?.(p.lat, p.lng);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 250);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sinkronkan saat lat/lng/zoom berubah dari luar (mis. input di admin).
  useEffect(() => {
    if (!mapRef.current) return;
    const ll = [Number(lat), Number(lng)];
    if (Number.isFinite(ll[0]) && Number.isFinite(ll[1])) {
      markerRef.current.setLatLng(ll);
      mapRef.current.setView(ll, Number(zoom) || 16);
    }
  }, [lat, lng, zoom]);

  return (
    <div
      ref={elRef}
      style={{ height }}
      className="relative z-0 w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
    />
  );
}
