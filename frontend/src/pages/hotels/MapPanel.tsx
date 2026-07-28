import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { Hotel } from '@shared/types';

// Vite bundles Leaflet's default marker icons under a hashed path that the
// library can't resolve on its own — point it at the imported asset URLs.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightedIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [34, 56],
  iconAnchor: [17, 56],
  popupAnchor: [1, -46],
  shadowSize: [56, 56],
  className: 'hotel-marker-highlighted',
});

const DEFAULT_CENTER: LatLngExpression = [50.4501, 30.5234]; // Kyiv

function FitBounds({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [32, 32] });
    }
  }, [positions, map]);

  return null;
}

interface Props {
  hotels: Hotel[];
  hoveredHotelId?: number | null;
}

export function MapPanel({ hotels, hoveredHotelId }: Props) {
  const located = useMemo(
    () => hotels.filter((h): h is Hotel & { latitude: number; longitude: number } =>
      h.latitude != null && h.longitude != null),
    [hotels],
  );

  const positions = useMemo<LatLngExpression[]>(
    () => located.map((h) => [h.latitude, h.longitude]),
    [located],
  );

  const containerStyle = {
    position: 'sticky' as const,
    top: 88,
    height: 'calc(100vh - 120px)',
    borderRadius: 8,
    overflow: 'hidden' as const,
    border: '1px solid var(--border)',
  };

  if (located.length === 0) {
    return (
      <div style={{
        ...containerStyle,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--text)',
      }}>
        <EnvironmentOutlined style={{ fontSize: 32 }} />
        <span>No locations to show</span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {located.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={h.id === hoveredHotelId ? highlightedIcon : defaultIcon}
          >
            <Popup>{h.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
