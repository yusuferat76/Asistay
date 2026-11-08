import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, MapPin, Search, DownloadCloud, WifiOff } from 'lucide-react';

// Fix Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const OfflineMapModule: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([41.0082, 28.9784], 12); // Istanbul

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    // Initial marker
    L.marker([41.0082, 28.9784]).addTo(mapInstance.current)
      .bindPopup('OSINT Takip Noktası: İstanbul');

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const toggleOffline = () => {
    setIsOfflineMode(!isOfflineMode);
    // Simulate offline mode by disabling tile loading
    if (!isOfflineMode) {
      mapInstance.current?.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          layer.setUrl('');
        }
      });
    } else {
      mapInstance.current?.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          layer.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        }
      });
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl border border-blue-900/60 overflow-hidden bg-black">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Overlay Actions */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleOffline}
          className={`flex items-center gap-2 p-2 rounded-xl backdrop-blur-md border ${
            isOfflineMode 
              ? 'bg-red-950/80 border-red-500 text-red-200' 
              : 'bg-blue-950/80 border-blue-500 text-blue-200'
          }`}
          title="Çevrimdışı Modu Aç/Kapat"
        >
          {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase">{isOfflineMode ? 'Çevrimdışı' : 'Çevrimiçi'}</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-blue-900/40 text-[10px] text-white font-mono">
        OSINT TRACKER v2.0 | OFFLINE STORAGE: ACTIVE
      </div>
    </div>
  );
};
