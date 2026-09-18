import { useState, useEffect } from 'react';
import { subscribeToCollection, getVehicles } from '../../firebase/firestore';
import AdminLiveMap from '../../components/maps/AdminLiveMap';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export default function AdminLiveMapPage() {
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showReports, setShowReports] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    const unsub = subscribeToCollection('wasteReports', [], null, (docs) => {
      setReports(docs);
    });

    getVehicles().then(setVehicles).catch(console.error);

    return () => unsub();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="flex-1 w-full h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-950">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 shadow-xl pointer-events-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Spatial Telemetry
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showReports}
                onChange={(e) => setShowReports(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span>Incidents ({filteredReports.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span>Fleet ({vehicles.length})</span>
            </label>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-3 py-2 shadow-xl pointer-events-auto flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending_verification">Pending Audit</option>
            <option value="verified">Verified Queue</option>
            <option value="assigned">Dispatched</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Map View */}
      <div className="w-full h-full">
        <AdminLiveMap
          reports={filteredReports}
          vehicles={vehicles}
          showReports={showReports}
          showVehicles={showVehicles}
          onSelectReport={(r) => setSelectedEntity({ type: 'report', data: r })}
          onSelectVehicle={(v) => setSelectedEntity({ type: 'vehicle', data: v })}
        />
      </div>

      {/* Selected Entity Drawer */}
      {selectedEntity && (
        <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              {selectedEntity.type === 'report' ? 'Incident Telemetry Node' : 'Fleet Vehicle Asset'}
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="w-6 h-6 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="py-3 space-y-3">
            {selectedEntity.type === 'report' ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-white">
                      {selectedEntity.data.wasteType || 'Incident Report'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedEntity.data.location?.address || 'Municipal Coordinate Node'}
                    </p>
                  </div>
                  <PriorityBadge priority={selectedEntity.data.priority} />
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedEntity.data.status} />
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatRelativeTime(selectedEntity.data.createdAt)}
                  </span>
                </div>

                {selectedEntity.data.description && (
                  <p className="text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 line-clamp-3">
                    {selectedEntity.data.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <Link
                    to={`/admin/reports/${selectedEntity.data.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1"
                  >
                    Open Full Dossier
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-white">
                      {selectedEntity.data.vehicleNumber || 'Municipal Truck'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type: {selectedEntity.data.type || 'Compactor'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-500/30">
                    {selectedEntity.data.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Assigned Driver: <span className="text-white font-medium">{selectedEntity.data.driverName || 'Unassigned'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
