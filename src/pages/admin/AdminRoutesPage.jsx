import { useState, useEffect } from 'react';
import {
  queryDocuments,
  getVehicles,
  getDrivers,
  createRoute,
  updateReportStatus,
} from '../../firebase/firestore';
import RouteMap from '../../components/maps/RouteMap';
import { PriorityBadge } from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function AdminRoutesPage() {
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeMetrics, setRouteMetrics] = useState({ distanceMeters: 0, durationSeconds: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch verified reports ready for dispatch
    queryDocuments('wasteReports', [{ field: 'status', operator: '==', value: 'verified' }])
      .then(setReports)
      .catch(console.error);

    getVehicles().then(setVehicles).catch(console.error);
    getDrivers().then(setDrivers).catch(console.error);
  }, []);

  const toggleReportSelection = (report) => {
    if (selectedReports.find((r) => r.id === report.id)) {
      setSelectedReports(selectedReports.filter((r) => r.id !== report.id));
    } else {
      setSelectedReports([...selectedReports, report]);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (selectedReports.length === 0) {
      toast.error('Please select at least 1 verified stop for this route');
      return;
    }
    if (!selectedDriver) {
      toast.error('Please select a driver for route dispatch');
      return;
    }
    if (!selectedVehicle) {
      toast.error('Please assign a vehicle for route execution');
      return;
    }

    setSaving(true);
    try {
      const driverObj = drivers.find((d) => d.id === selectedDriver);
      const vehicleObj = vehicles.find((v) => v.id === selectedVehicle);

      const routeId = await createRoute({
        name: routeName || `Route-${new Date().toISOString().substring(0, 10)}-${selectedReports.length}Stops`,
        driverId: selectedDriver,
        driverName: driverObj?.name || 'Driver',
        vehicleId: selectedVehicle,
        vehicleNumber: vehicleObj?.vehicleNumber || 'Municipal Truck',
        stops: selectedReports.map((r, idx) => ({
          reportId: r.id,
          stopIndex: idx,
          wasteType: r.wasteType,
          priority: r.priority,
          location: r.location,
          collected: false,
        })),
        totalStops: selectedReports.length,
        completedStops: 0,
        estimatedDistanceKm: (routeMetrics.distanceMeters / 1000).toFixed(1),
        estimatedDurationMin: Math.round(routeMetrics.durationSeconds / 60),
      });

      // Update reports status to assigned
      for (const report of selectedReports) {
        await updateReportStatus(report.id, 'assigned', {
          assignedRouteId: routeId,
          assignedDriverId: selectedDriver,
          assignedVehicleId: selectedVehicle,
        });
      }

      toast.success('Dynamic route created & dispatched to driver cockpit!');
      setSelectedReports([]);
      setRouteName('');
      // Refresh available reports
      const remaining = await queryDocuments('wasteReports', [
        { field: 'status', operator: '==', value: 'verified' },
      ]);
      setReports(remaining);
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch route');
    } finally {
      setSaving(false);
    }
  };

  const km = (routeMetrics.distanceMeters / 1000).toFixed(1);
  const mins = Math.round(routeMetrics.durationSeconds / 60);

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
          Dynamic Route Optimization & Dispatch
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Synthesize verified incidents into algorithmic collection corridors with TSP waypoint scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidate Stops & Dispatch Settings */}
        <div className="space-y-6">
          {/* Dispatch Config Form */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span>
              Dispatch Config
            </h3>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Route Identifier
              </label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Sector 4 Morning Express"
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Assign Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose Field Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.driverName} ({d.phone || 'Driver'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Assign Fleet Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} ({v.type || 'Compactor'})
                  </option>
                ))}
              </select>
            </div>

            {/* Metrics summary */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-on-surface-variant block">Stops</span>
                <span className="font-bold text-sm text-primary">{selectedReports.length}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Distance</span>
                <span className="font-bold text-sm text-on-surface">{km} km</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Est. Time</span>
                <span className="font-bold text-sm text-on-surface">{mins} min</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoute}
              disabled={saving || selectedReports.length === 0}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Deploy Route to Driver
                </>
              )}
            </button>
          </div>

          {/* Candidate Incident Stops Selector */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h4 className="text-label-lg font-bold text-on-surface">
                Verified Incident Queue ({reports.length})
              </h4>
              <span className="text-xs text-on-surface-variant">Click to toggle stop</span>
            </div>

            {reports.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                No verified incidents pending dispatch.
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {reports.map((report) => {
                  const isSelected = selectedReports.some((r) => r.id === report.id);
                  return (
                    <div
                      key={report.id}
                      onClick={() => toggleReportSelection(report)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-primary-container/10 border-primary text-on-surface'
                          : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 rounded text-primary focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-xs text-on-surface">
                            {report.wasteType}
                          </div>
                          <div className="text-[11px] text-on-surface-variant line-clamp-1">
                            {report.location?.address || 'Node coordinates'}
                          </div>
                        </div>
                      </div>
                      <PriorityBadge priority={report.priority} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Dynamic Route Map Preview */}
        <div className="lg:col-span-2 h-[600px] rounded-2xl overflow-hidden shadow-sm">
          <RouteMap
            stops={selectedReports}
            onRouteCalculated={(m) => setRouteMetrics(m)}
          />
        </div>
      </div>
    </div>
  );
}
