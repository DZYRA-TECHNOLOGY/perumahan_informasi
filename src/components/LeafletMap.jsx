import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Home,
  Plus,
  Minus,
  X,
  MapPin,
  Navigation,
  Info,
  Clock,
  Phone,
  Tag,
  Star,
  Share2,
  Heart,
} from "lucide-react";

// Marker pin oranye dengan animasi
const pinIcon = L.divIcon({
  html: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#f97316" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,.3)); animation: bounce 1.5s infinite;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"/></svg>
  <style>@keyframes bounce {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}</style>`,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 36],
});

// Layer peta
const LAYERS = {
  street: {
    name: "🗺️ Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  },
  satellite: {
    name: "🛰️ Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    maxZoom: 19,
  },
  hybrid: {
    name: "🌍 Hybrid",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "© Google",
    maxZoom: 20,
  },
};

// Komponen Popup Premium seperti Google Maps
const CustomPopup = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="relative w-[320px] max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-250 pointer-events-auto">
      {/* Card Popup */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 backdrop-blur-sm max-h-[min(80vh,520px)] overflow-y-auto">
        {/* Header dengan gradient dan gambar */}
        <div className="relative h-28 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shrink-0">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Icon besar di tengah */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30 shadow-lg">
              <MapPin className="text-white" size={30} />
            </div>
          </div>

          {/* Tombol close */}
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm z-10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight break-words">
                {data.label || "Lokasi"}
              </h3>
              {data.kategori && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                  <Tag size={12} />
                  {data.kategori}
                </span>
              )}
            </div>
            {data.rating && (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg shrink-0">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900">
                  {data.rating}
                </span>
              </div>
            )}
          </div>

          {/* Alamat */}
          {data.alamat && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
              <MapPin
                size={14}
                className="text-orange-500 mt-0.5 flex-shrink-0"
              />
              <span className="flex-1">{data.alamat}</span>
            </div>
          )}

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {data.kontak && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                <Phone size={12} className="text-orange-500 shrink-0" />
                <span className="truncate">{data.kontak}</span>
              </div>
            )}
            {data.jamOperasional && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                <Clock size={12} className="text-orange-500 shrink-0" />
                <span className="truncate">{data.jamOperasional}</span>
              </div>
            )}
          </div>

          {/* Status & Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50 flex-wrap gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-green-700">Buka</span>
            </div>
            <span className="flex items-center gap-1">
              <Info size={12} />
              {data.lat?.toFixed(6)}, {data.lng?.toFixed(6)}
            </span>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Navigasi
            </a>
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`;
                window.open(url, "_blank");
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Detail
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100/50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">© Google Maps</span>
          <button
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Simpan"
          >
            <Heart size={14} />
          </button>
        </div>
      </div>

      {/* Pointer segitiga di bawah */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100/50"></div>
    </div>
  );
};

export default function LeafletMap({
  lat = -5.3581,
  lng = 105.3149,
  zoom = 16,
  onPick,
  label,
  height = 340,
  defaultLayer = "street",
  showLayerControl = true,
  scrollWheel = true,
  showHomeButton = true,
  popupData = null,
  onPopupClose = null,
  autoOpenPopup = true,
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pickRef = useRef(onPick);
  const [currentLayer, setCurrentLayer] = useState(defaultLayer);
  const tileLayerRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const initialLat = Number(lat) || -5.3581;
  const initialLng = Number(lng) || 105.3149;
  const initialZoom = Number(zoom) || 16;

  pickRef.current = onPick;

  const defaultPopupData = {
    label: label || "Cluster Sigerland",
    alamat: popupData?.alamat || "Jl. Soekarno-Hatta No. 123, Bandar Lampung",
    kategori: popupData?.kategori || "Perumahan Mewah",
    kontak: popupData?.kontak || "(0721) 7890123",
    jamOperasional: popupData?.jamOperasional || "08:00 - 20:00",
    rating: popupData?.rating || "4.8",
    lat: initialLat,
    lng: initialLng,
    ...popupData,
  };

  const flyToInitial = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([initialLat, initialLng], Math.max(initialZoom, 17), {
      duration: 1.5,
      easeLinearity: 0.25,
    });
    setTimeout(() => {
      setShowPopup(true);
      setPopupInfo(defaultPopupData);
    }, 500);
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    const currentZoom = mapRef.current.getZoom();
    mapRef.current.setZoom(Math.min(currentZoom + 1, 20));
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    const currentZoom = mapRef.current.getZoom();
    mapRef.current.setZoom(Math.max(currentZoom - 1, 3));
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPopupInfo(null);
    if (onPopupClose) onPopupClose();
  };

  const openPopupAt = (info) => {
    setPopupInfo(info);
    setShowPopup(true);
  };

  // Tutup popup dengan tombol Escape
  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e) => {
      if (e.key === "Escape") handlePopupClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPopup]);

  useEffect(() => {
    if (mapRef.current || !elRef.current) return;

    const map = L.map(elRef.current, {
      scrollWheelZoom: scrollWheel,
      zoomControl: false,
    }).setView([initialLat, initialLng], initialZoom);

    const defaultTile = LAYERS[defaultLayer] || LAYERS.street;
    tileLayerRef.current = L.tileLayer(defaultTile.url, {
      attribution: defaultTile.attribution,
      maxZoom: defaultTile.maxZoom || 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: !!onPick,
    }).addTo(map);

    marker.on("click", () => {
      map.flyTo([initialLat, initialLng], Math.max(map.getZoom(), 18), {
        duration: 0.8,
      });
      setShowPopup((prev) => {
        // toggle: klik marker lagi saat popup terbuka -> tutup
        if (prev) {
          setPopupInfo(null);
          return false;
        }
        setPopupInfo(defaultPopupData);
        return true;
      });
    });

    if (onPick) {
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        pickRef.current?.(e.latlng.lat, e.latlng.lng);
        openPopupAt({
          ...defaultPopupData,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      });
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        pickRef.current?.(p.lat, p.lng);
        openPopupAt({
          ...defaultPopupData,
          lat: p.lat,
          lng: p.lng,
        });
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    requestAnimationFrame(() => {
      map.invalidateSize();
      setMapReady(true);
    });

    if (autoOpenPopup) {
      setTimeout(() => {
        setShowPopup(true);
        setPopupInfo(defaultPopupData);
      }, 500);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const ll = [Number(lat), Number(lng)];
    if (Number.isFinite(ll[0]) && Number.isFinite(ll[1])) {
      markerRef.current?.setLatLng(ll);
      mapRef.current.setView(ll, Number(zoom) || 16);
    }
  }, [lat, lng, zoom]);

  const switchLayer = (layerKey) => {
    if (!mapRef.current || layerKey === currentLayer) return;

    const map = mapRef.current;
    const layer = LAYERS[layerKey];
    if (!layer) return;

    if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom || 19,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    setCurrentLayer(layerKey);
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <div
        ref={elRef}
        style={{ height }}
        className="relative z-0 w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
      />

      {/* Kontrol layer */}
      {showLayerControl && mapReady && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200/50">
          {Object.entries(LAYERS).map(([key, layer]) => (
            <button
              key={key}
              onClick={() => switchLayer(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                currentLayer === key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      )}

      {/* Kontrol zoom & home */}
      {mapReady && (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
          {showHomeButton && (
            <button
              onClick={flyToInitial}
              className="bg-white hover:bg-gray-50 text-gray-700 hover:text-orange-600 p-2.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200/50"
              title="Kembali ke lokasi"
            >
              <Home size={18} />
            </button>
          )}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            <button
              onClick={zoomIn}
              className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors duration-150 border-b border-gray-200/50"
              title="Perbesar"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={zoomOut}
              className="p-2.5 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
              title="Perkecil"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Overlay gelap saat popup muncul */}
      {showPopup && (
        <div
          className="absolute inset-0 z-[999] bg-black/20 backdrop-blur-[2px] transition-all duration-300 rounded-2xl"
          onClick={handlePopupClose}
        />
      )}

      {/* Popup dipusatkan penuh di dalam area peta -> tidak pernah kepotong */}
      {showPopup && popupInfo && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
          <CustomPopup data={popupInfo} onClose={handlePopupClose} />
        </div>
      )}
    </div>
  );
}
