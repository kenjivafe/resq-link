import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tuguegarao City coordinates (17.6138° N, 121.7270° E)
const DEFAULT_POSITION: [number, number] = [17.6138, 121.7270];

// Fix for default marker icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  className?: string;
}

function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return <Marker position={position} icon={defaultIcon} />;
}

export default function LocationMap({
  onLocationSelect,
  initialPosition = DEFAULT_POSITION,
  className = ''
}: LocationMapProps) {
  // Use initialPosition if it has valid coordinates, otherwise use DEFAULT_POSITION
  const initialCoords = (initialPosition[0] !== 0 && initialPosition[1] !== 0) 
    ? initialPosition 
    : DEFAULT_POSITION;
    
  const [position, setPosition] = useState<[number, number]>(initialCoords);
  const mapRef = useRef<L.Map>(null);
  const isFirstRender = useRef(true);

  // Update position when initialPosition changes (but not on first render)
  useEffect(() => {
    if (!isFirstRender.current && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
      setPosition(initialPosition);
    }
    isFirstRender.current = false;
  }, [initialPosition]);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    // Only update if we have valid coordinates
    if (lat !== 0 && lng !== 0) {
      const newPosition: [number, number] = [lat, lng];
      setPosition(newPosition);
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect]);

  // Set up click handler when component mounts
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => handleMapClick(e);
    
    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [handleMapClick]);

  if (typeof window === 'undefined') {
    return <div className={`h-64 w-full bg-gray-100 ${className}`} />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={position}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker position={position} />
      </MapContainer>
    </div>
  );
}
