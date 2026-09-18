import { useState, useEffect, memo } from 'react';
import { Marker, Polyline } from '@react-google-maps/api';
import SmartWasteMap from './SmartWasteMap';

export default function DriverRouteMap({
  currentLocation = { lat: 28.6139, lng: 77.2090 },
  stops = [],
  currentStopIndex = 0,
}) {
  const currentStop = stops[currentStopIndex];

  // Build path coordinates
  const pathCoordinates = [
    currentLocation,
    ...stops.map((s) => ({
      lat: Number(s.location?.lat || s.lat || 28.6139),
      lng: Number(s.location?.lng || s.lng || 77.2090),
    })),
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
      <SmartWasteMap
        center={currentLocation}
        zoom={14}
        className="w-full h-full min-h-[400px]"
      >
        {/* Driver vehicle marker */}
        <Marker
          position={currentLocation}
          title="Your Vehicle"
          icon={
            window.google?.maps?.SymbolPath
              ? {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 7,
                  fillColor: '#06b6d4', // Cyan
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#ffffff',
                }
              : undefined
          }
        />

        {/* Route stops markers */}
        {stops.map((stop, index) => {
          const isCurrent = index === currentStopIndex;
          const isDone = index < currentStopIndex;
          const pos = {
            lat: Number(stop.location?.lat || stop.lat),
            lng: Number(stop.location?.lng || stop.lng),
          };

          return (
            <Marker
              key={stop.id || index}
              position={pos}
              label={{
                text: `${index + 1}`,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
              icon={
                window.google?.maps?.SymbolPath
                  ? {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: isCurrent ? 12 : 8,
                      fillColor: isCurrent ? '#f59e0b' : isDone ? '#10b981' : '#64748b',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#ffffff',
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Path line */}
        <Polyline
          path={pathCoordinates}
          options={{
            strokeColor: '#06b6d4',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      </SmartWasteMap>

      {/* Driver Cockpit Floating Heads-up Display */}
      {currentStop && (
        <div className="absolute top-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base">
              #{currentStopIndex + 1}
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
                Next Collection Waypoint
              </div>
              <div className="font-semibold text-sm line-clamp-1">
                {currentStop.wasteType || 'Waste Collection Stop'}
              </div>
              <div className="text-xs text-slate-400 line-clamp-1">
                {currentStop.location?.address || 'Municipal Coordinate Node'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-emerald-400 font-bold">
              PRIORITY: {currentStop.priority?.toUpperCase() || 'MEDIUM'}
            </div>
            <div className="text-[11px] text-slate-400">
              Stop {currentStopIndex + 1} of {stops.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
