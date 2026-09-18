import { useState, useCallback, memo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const defaultCenter = { lat: 28.6139, lng: 77.2090 };
const defaultZoom = 13;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

function FallbackMap({ center = defaultCenter, zoom = defaultZoom, children, message }) {
  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-slate-700 select-none">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px), radial-gradient(#3b82f6 1px, #0f172a 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-emerald-400 text-2xl">map</span>
        </div>
        <h4 className="text-white font-semibold text-base mb-1">Spatial Telemetry Map</h4>
        <p className="text-slate-400 text-xs mb-3">
          {message || 'Google Maps API key not configured. Operating in interactive telemetry preview mode.'}
        </p>
        <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-emerald-300">
          Lat: {center.lat?.toFixed ? center.lat.toFixed(4) : center.lat} | Lng: {center.lng?.toFixed ? center.lng.toFixed(4) : center.lng} | Zoom: {zoom}
        </div>
      </div>
      {children && (
        <div className="relative z-10 w-full mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

function SmartWasteMap({
  center = defaultCenter,
  zoom = defaultZoom,
  children,
  onMapClick,
  className = 'w-full h-full min-h-[350px] rounded-xl overflow-hidden',
  options = {},
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((m) => {
    setMap(m);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className={className}>
        <FallbackMap center={center} zoom={zoom}>
          {children}
        </FallbackMap>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={className}>
        <FallbackMap center={center} zoom={zoom} message={`Map load error: ${loadError.message}`}>
          {children}
        </FallbackMap>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center`}>
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Initializing Google Maps...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{ ...mapOptions, ...options }}
      >
        {children}
      </GoogleMap>
    </div>
  );
}

export default memo(SmartWasteMap);
