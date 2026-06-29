import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Order } from "../data/types";
import { deliveringProgress } from "../lib/simulation";

// A real OpenStreetMap (via Leaflet). Geolocation isn't used — every order
// delivers to a fixed real drop-off with the store placed a short distance
// away.

/** Build an emoji map pin as a Leaflet divIcon (avoids bundling marker images). */
function emojiPin(emoji: string, ring: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px;background:${ring};box-shadow:0 2px 6px rgba(0,0,0,.35);font-size:18px;border:2px solid #fff">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const STORE_ICON = emojiPin("🏪", "#ffffff");
const HOME_ICON = emojiPin("📍", "#ffffff");

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    // Wait out the page's enter animation, then size + frame the route.
    const id = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(points, { padding: [44, 44], maxZoom: 16 });
    }, 320);
    return () => clearTimeout(id);
  }, [map, points]);
  return null;
}

export default function DeliveryMap({ order, now }: { order: Order; now: number }) {
  const { storeLoc, dropLoc } = order;
  const delivered = order.status === "delivered";
  const showDriver = order.status !== "preparing";

  const t = deliveringProgress(order, now);
  const driverPos: [number, number] = [
    storeLoc.lat + (dropLoc.lat - storeLoc.lat) * t,
    storeLoc.lng + (dropLoc.lng - storeLoc.lng) * t,
  ];

  const bounds: [number, number][] = [
    [storeLoc.lat, storeLoc.lng],
    [dropLoc.lat, dropLoc.lng],
  ];

  const driverIcon = emojiPin(delivered ? "✅" : "🛵", "#0d9488");

  return (
    <div className="grayscale-map h-56 w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[dropLoc.lat, dropLoc.lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Planned route store → drop-off */}
        <Polyline
          positions={bounds}
          pathOptions={{ color: "#0d9488", weight: 4, dashArray: "6 8", opacity: 0.8 }}
        />
        {/* Travelled portion (store → driver), only while delivering */}
        {showDriver && (
          <Polyline
            positions={[[storeLoc.lat, storeLoc.lng], driverPos]}
            pathOptions={{ color: "#0d9488", weight: 4, opacity: 0.95 }}
          />
        )}

        <Marker position={[storeLoc.lat, storeLoc.lng]} icon={STORE_ICON} />
        <Marker position={[dropLoc.lat, dropLoc.lng]} icon={HOME_ICON} />
        {showDriver && <Marker position={driverPos} icon={driverIcon} />}

        <FitBounds points={bounds} />
      </MapContainer>
    </div>
  );
}
