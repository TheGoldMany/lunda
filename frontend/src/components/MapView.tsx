import { useEffect, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapPinSvgMarkup, type MapPinIconKey } from "../lib/icons";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapMarkerSpec extends LatLng {
  id: string;
  icon: MapPinIconKey;
  label: string;
  variant?: "primary" | "default";
  popup?: ReactNode;
}

function pinIcon(icon: MapPinIconKey, variant: "primary" | "default" = "default") {
  return L.divIcon({
    html: `<span class="map-pin ${variant === "primary" ? "map-pin-primary" : ""}">${mapPinSvgMarkup(icon)}</span>`,
    className: "map-pin-wrapper",
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
  });
}

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapView({
  center,
  zoom = 13,
  height = 260,
  markers = [],
  onPick,
  pickedLocation,
  onPickedDrag,
  recenterOnCenterChange = false,
}: {
  center: LatLng;
  zoom?: number;
  height?: number | string;
  markers?: MapMarkerSpec[];
  onPick?: (lat: number, lng: number) => void;
  pickedLocation?: LatLng | null;
  onPickedDrag?: (lat: number, lng: number) => void;
  recenterOnCenterChange?: boolean;
}) {
  return (
    <div className="map-view" style={{ height }}>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködői'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {recenterOnCenterChange && <Recenter center={center} />}
        {onPick && <ClickHandler onPick={onPick} />}

        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={pinIcon(m.icon, m.variant)} title={m.label}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}

        {pickedLocation && (
          <Marker
            position={[pickedLocation.latitude, pickedLocation.longitude]}
            icon={pinIcon("pin", "primary")}
            draggable={Boolean(onPickedDrag)}
            eventHandlers={
              onPickedDrag
                ? {
                    dragend: (e) => {
                      const marker = e.target as L.Marker;
                      const pos = marker.getLatLng();
                      onPickedDrag(pos.lat, pos.lng);
                    },
                  }
                : undefined
            }
          />
        )}
      </MapContainer>
    </div>
  );
}
