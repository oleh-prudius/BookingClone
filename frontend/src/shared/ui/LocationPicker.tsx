import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { type LatLngExpression, type LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite bundles Leaflet's default marker icons under a hashed path that the
// library can't resolve on its own — point it at the imported asset URLs.
const pickerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickToMove({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnExternalChange({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
    // Only re-run when the position actually changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(position) ? position[0] : undefined, Array.isArray(position) ? position[1] : undefined]);
  return null;
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  height?: number | string;
  zoom?: number;
}

export function LocationPicker({ latitude, longitude, onChange, height = 300, zoom = 6 }: LocationPickerProps) {
  const position: LatLngExpression = [latitude, longitude];

  return (
    <div style={{ height, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <RecenterOnExternalChange position={position} />
        <ClickToMove onChange={onChange} />
        <Marker
          position={position}
          icon={pickerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latLng = e.target.getLatLng();
              onChange(latLng.lat, latLng.lng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
