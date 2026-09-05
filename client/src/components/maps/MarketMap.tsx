import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { RecommendedOption } from '../../types';

// Fix Leaflet marker icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const farmerIcon = L.divIcon({
  className: 'custom-farmer-icon',
  html: `<div style="background-color: #16a34a; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); font-weight: bold; font-size: 16px;">🌱</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const recommendedIcon = L.divIcon({
  className: 'custom-recommended-icon',
  html: `<div style="background-color: #eab308; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 18px;">🏆</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const marketIcon = L.divIcon({
  className: 'custom-market-icon',
  html: `<div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">🏪</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MarketMapProps {
  farmerLocation: { latitude: number; longitude: number; city: string };
  options: RecommendedOption[];
}

export const MarketMap: React.FC<MarketMapProps> = ({ farmerLocation, options }) => {
  const center: [number, number] = [farmerLocation.latitude, farmerLocation.longitude];

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 25 km Radius Circle around Farm */}
        <Circle center={center} radius={25000} pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.1, weight: 1.5 }} />

        {/* Farmer Marker */}
        <Marker position={center} icon={farmerIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <strong className="text-agri-700 block text-sm">Your Farm Location</strong>
              <p className="text-xs text-gray-600">{farmerLocation.city}</p>
            </div>
          </Popup>
        </Marker>

        {/* Market & Buyer Markers */}
        {options.map((opt) => {
          // Offsets based on location or default scatter for simulation
          const isRec = opt.isRecommended;
          const icon = isRec ? recommendedIcon : marketIcon;

          // Lat/lng simulation offset around farmer center based on distanceKm
          const angle = opt.name.length * 0.8;
          const latOffset = (opt.distanceKm / 111) * Math.cos(angle);
          const lngOffset = (opt.distanceKm / 111) * Math.sin(angle);
          const pos: [number, number] = [farmerLocation.latitude + latOffset, farmerLocation.longitude + lngOffset];

          return (
            <Marker key={opt.id} position={pos} icon={icon}>
              <Popup>
                <div className="p-1 font-sans">
                  {isRec && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">🏆 BEST CHOICE</span>}
                  <strong className="block text-sm text-gray-900">{opt.name}</strong>
                  <p className="text-xs font-bold text-agri-700 mt-1">Expected Net Revenue: ₹{opt.expectedNetRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">Price: ₹{opt.unitPrice}/kg • Distance: {opt.distanceKm} km</p>
                  <p className="text-xs text-slate-600 font-medium">Est. Transport: ₹{opt.transportCost}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
