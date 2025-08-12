import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

// Fix default marker icons (Vite + Leaflet)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type MapViewProps = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number | string;
  popup?: string;
};

export default function MapView({ lat, lng, zoom = 15, height = 360, popup }: MapViewProps) {
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  return (
    <div style={{ height }} className="rounded overflow-hidden border">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          {popup ? <Popup>{popup}</Popup> : null}
        </Marker>
      </MapContainer>
    </div>
  );
}
