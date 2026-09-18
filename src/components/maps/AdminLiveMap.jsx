import { useState, memo } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import SmartWasteMap from './SmartWasteMap';

export default function AdminLiveMap({
  reports = [],
  vehicles = [],
  onSelectReport,
  onSelectVehicle,
  center = { lat: 28.6139, lng: 77.2090 },
  zoom = 12,
  showReports = true,
  showVehicles = true,
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const getReportMarkerColor = (status, priority) => {
    if (priority === 'critical') return '#ef4444'; // Red
    if (status === 'pending_verification') return '#f59e0b'; // Amber
    if (status === 'verified') return '#3b82f6'; // Blue
    if (status === 'assigned') return '#8b5cf6'; // Purple
    if (status === 'resolved') return '#10b981'; // Green
    return '#6b7280';
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
      <SmartWasteMap center={center} zoom={zoom} className="w-full h-full min-h-[500px]">
        {/* Report Markers */}
        {showReports &&
          reports
            .filter((r) => r.location?.lat && r.location?.lng)
            .map((report) => (
              <Marker
                key={report.id || report.reportId}
                position={{
                  lat: Number(report.location.lat),
                  lng: Number(report.location.lng),
                }}
                onClick={() => {
                  setSelectedItem({ type: 'report', data: report });
                  if (onSelectReport) onSelectReport(report);
                }}
                icon={
                  window.google?.maps?.SymbolPath
                    ? {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: report.priority === 'critical' ? 9 : 7,
                        fillColor: getReportMarkerColor(report.status, report.priority),
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#ffffff',
                      }
                    : undefined
                }
              />
            ))}

        {/* Vehicle Markers */}
        {showVehicles &&
          vehicles
            .filter((v) => v.currentLatitude && v.currentLongitude)
            .map((vehicle) => (
              <Marker
                key={vehicle.id || vehicle.vehicleId}
                position={{
                  lat: Number(vehicle.currentLatitude),
                  lng: Number(vehicle.currentLongitude),
                }}
                onClick={() => {
                  setSelectedItem({ type: 'vehicle', data: vehicle });
                  if (onSelectVehicle) onSelectVehicle(vehicle);
                }}
                icon={
                  window.google?.maps?.SymbolPath
                    ? {
                        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: '#06b6d4', // Cyan
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#0f172a',
                      }
                    : undefined
                }
              />
            ))}

        {/* Info Window */}
        {selectedItem && (
          <InfoWindow
            position={{
              lat: Number(
                selectedItem.type === 'report'
                  ? selectedItem.data.location?.lat
                  : selectedItem.data.currentLatitude
              ),
              lng: Number(
                selectedItem.type === 'report'
                  ? selectedItem.data.location?.lng
                  : selectedItem.data.currentLongitude
              ),
            }}
            onCloseClick={() => setSelectedItem(null)}
          >
            <div className="p-2 max-w-xs text-slate-900 font-sans">
              {selectedItem.type === 'report' ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {selectedItem.data.wasteType || 'Incident Report'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedItem.data.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">
                    {selectedItem.data.location?.address || 'No address specified'}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {selectedItem.data.description || 'No description'}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400">
                    Priority: <span className="font-semibold capitalize">{selectedItem.data.priority}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {selectedItem.data.vehicleNumber || 'Municipal Vehicle'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      {selectedItem.data.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Type: {selectedItem.data.type || 'Compactor'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Driver: {selectedItem.data.driverName || 'Unassigned'}
                  </p>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </SmartWasteMap>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg pointer-events-auto flex flex-col gap-1.5 text-xs text-slate-300">
        <div className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span>Critical / High Urgency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Pending Verification</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span>Verified Queued</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          <span>Active Fleet Vehicle</span>
        </div>
      </div>
    </div>
  );
}
