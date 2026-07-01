import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint, Order } from "../data/types";
import { deliveringProgress } from "../lib/simulation";

const ROUTE_GREEN = "#228B22";

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

type LatLng = [number, number];

function lerp(a: number, b: number, f: number) {
  return a + (b - a) * f;
}

function segLen(a: LatLng, b: LatLng) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function pathAt(
  path: LatLng[],
  t: number,
): { driver: LatLng; travelled: LatLng[] } {
  if (path.length === 1) return { driver: path[0], travelled: [path[0]] };
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const l = segLen(path[i], path[i + 1]);
    lengths.push(l);
    total += l;
  }
  if (total === 0) return { driver: path[0], travelled: [path[0]] };
  const target = Math.min(1, Math.max(0, t)) * total;
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) {
    if (acc + lengths[i] >= target) {
      const f = lengths[i] === 0 ? 0 : (target - acc) / lengths[i];
      const driver: LatLng = [
        lerp(path[i][0], path[i + 1][0], f),
        lerp(path[i][1], path[i + 1][1], f),
      ];
      return { driver, travelled: [...path.slice(0, i + 1), driver] };
    }
    acc += lengths[i];
  }
  return { driver: path[path.length - 1], travelled: [...path] };
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(points, { padding: [44, 44], maxZoom: 16 });
    }, 320);
    return () => clearTimeout(id);
  }, [map, points]);
  return null;
}

function useRoute(storeLoc: GeoPoint, dropLoc: GeoPoint): LatLng[] {
  const straight: LatLng[] = [
    [storeLoc.lat, storeLoc.lng],
    [dropLoc.lat, dropLoc.lng],
  ];
  const [route, setRoute] = useState<LatLng[]>(straight);

  useEffect(() => {
    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${storeLoc.lng},${storeLoc.lat};${dropLoc.lng},${dropLoc.lat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates as
          [number, number][] | undefined;
        if (!cancelled && coords && coords.length > 1) {
          setRoute(coords.map(([lng, lat]) => [lat, lng] as LatLng));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [storeLoc.lat, storeLoc.lng, dropLoc.lat, dropLoc.lng]);

  return route;
}

export default function DeliveryMap({
  order,
  now,
}: {
  order: Order;
  now: number;
}) {
  const { storeLoc, dropLoc } = order;
  const delivered = order.status === "delivered";
  const showDriver = order.status !== "preparing";

  const route = useRoute(storeLoc, dropLoc);
  const t = deliveringProgress(order, now);
  const { driver: driverPos, travelled } = pathAt(route, t);

  const driverIcon = emojiPin(delivered ? "✅" : "🛵", ROUTE_GREEN);

  return (
    <div className="grayscale-map h-56 w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[dropLoc.lat, dropLoc.lng]}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <Polyline
          positions={route}
          pathOptions={{ color: ROUTE_GREEN, weight: 5, opacity: 0.4 }}
        />
        {showDriver && (
          <Polyline
            positions={travelled}
            pathOptions={{ color: ROUTE_GREEN, weight: 5, opacity: 1 }}
          />
        )}

        <Marker position={[storeLoc.lat, storeLoc.lng]} icon={STORE_ICON} />
        <Marker position={[dropLoc.lat, dropLoc.lng]} icon={HOME_ICON} />
        {showDriver && <Marker position={driverPos} icon={driverIcon} />}

        <FitBounds points={route} />
      </MapContainer>
    </div>
  );
}
