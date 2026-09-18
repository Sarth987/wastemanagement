import { useState, useEffect, useCallback, memo } from 'react';
import { DirectionsRenderer, Marker } from '@react-google-maps/api';
import SmartWasteMap from './SmartWasteMap';

export default function RouteMap({
  depot = { lat: 28.6139, lng: 77.2090, name: 'Central Municipal Depot' },
  stops = [],
  onRouteCalculated,
}) {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);

  const calculateRoute = useCallback(() => {
    if (!window.google || !stops || stops.length === 0) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    const origin = { lat: Number(depot.lat), lng: Number(depot.lng) };
    const destination = origin; // Round-trip back to depot

    // Filter valid stops
    const validStops = stops.filter(
      (s) => s.location && s.location.lat && s.location.lng
    );

    if (validStops.length === 0) {
      setDirections(null);
      return;
    }

    const waypoints = validStops.slice(0, 24).map((stop) => ({
      location: new window.google.maps.LatLng(
        Number(stop.location.lat),
        Number(stop.location.lng)
      ),
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setError(null);
          if (onRouteCalculated) {
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;
            route.legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });
            onRouteCalculated({
              distanceMeters: totalDistance,
              durationSeconds: totalDuration,
              waypointOrder: route.waypoint_order,
              legs: route.legs,
            });
          }
        } else {
          setError(`Route calculation failed: ${status}`);
        }
      }
    );
  }, [depot, stops, onRouteCalculated]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
      <SmartWasteMap center={depot} zoom={13} className="w-full h-full min-h-[450px]">
        {/* Depot marker */}
        <Marker
          position={depot}
          title={depot.name}
          icon={
            window.google?.maps?.SymbolPath
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#10b981',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#ffffff',
                }
              : undefined
          }
        />

        {/* Directions polyline & waypoints */}
        {directions ? (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#10b981',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: false,
            }}
          />
        ) : (
          // Render individual markers when directions are not loaded
          stops.map((stop, index) => (
            <Marker
              key={stop.id || index}
              position={{
                lat: Number(stop.location?.lat || stop.lat),
                lng: Number(stop.location?.lng || stop.lng),
              }}
              label={{
                text: `${index + 1}`,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            />
          ))
        )}
      </SmartWasteMap>

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-950/80 border border-red-800 backdrop-blur-md rounded-xl p-3 text-red-200 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
