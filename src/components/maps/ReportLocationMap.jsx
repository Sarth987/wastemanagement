import { useState, useCallback, useEffect } from 'react';
import { Marker } from '@react-google-maps/api';
import SmartWasteMap from './SmartWasteMap';

export default function ReportLocationMap({
  location = { lat: 28.6139, lng: 77.2090 },
  onLocationChange,
  address = '',
}) {
  const [markerPos, setMarkerPos] = useState(location);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (location && (location.lat !== markerPos.lat || location.lng !== markerPos.lng)) {
      setMarkerPos(location);
    }
  }, [location]);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      if (onLocationChange) onLocationChange(newPos);
    }
  }, [onLocationChange]);

  const handleMarkerDragEnd = useCallback((e) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      if (onLocationChange) onLocationChange(newPos);
    }
  }, [onLocationChange]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMarkerPos(newPos);
        if (onLocationChange) onLocationChange(newPos);
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <div className="h-72 w-full">
        <SmartWasteMap center={markerPos} zoom={15} onMapClick={handleMapClick}>
          <Marker
            position={markerPos}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        </SmartWasteMap>
      </div>

      {/* Map floating control bar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="material-symbols-outlined text-emerald-400 text-sm">pin_drop</span>
          <span className="font-mono text-emerald-400">
            {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
          </span>
          {address && <span className="text-slate-400 truncate max-w-xs">({address})</span>}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">
            {isLocating ? 'sync' : 'my_location'}
          </span>
          <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
        </button>
      </div>
    </div>
  );
}
