import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, updateDocument, updateReportStatus } from '../../firebase/firestore';
import DriverRouteMap from '../../components/maps/DriverRouteMap';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function DriverRouteDetailsPage() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  useEffect(() => {
    async function loadRoute() {
      try {
        const docData = await getDocument('routes', id);
        setRoute(docData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load route details');
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [id]);

  const handleMarkStopDone = async (stopIdx) => {
    if (!route || !route.stops) return;
    const stop = route.stops[stopIdx];
    try {
      if (stop.reportId) {
        await updateReportStatus(stop.reportId, 'resolved', {
          driverNotes: 'Stop confirmed cleared and collected.',
        });
      }

      const updatedStops = [...route.stops];
      updatedStops[stopIdx] = { ...stop, collected: true };
      const completedCount = updatedStops.filter((s) => s.collected).length;
      const isFinished = completedCount === updatedStops.length;

      const updates = {
        stops: updatedStops,
        completedStops: completedCount,
        status: isFinished ? 'completed' : 'in_progress',
      };

      await updateDocument('routes', id, updates);
      setRoute({ ...route, ...updates });
      toast.success(`Stop #${stopIdx + 1} marked collected`);
    } catch (err) {
      toast.error('Failed to update stop status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-on-surface-variant">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm">Loading route itinerary...</span>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-headline-md font-bold text-on-surface">Route Not Found</h3>
        <Link to="/driver/routes" className="mt-4 inline-block px-4 py-2 bg-primary text-on-primary rounded-xl">
          Return to Routes
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
            <Link to="/driver/routes" className="hover:text-primary transition flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Routes
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-on-surface">#{route.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {route.name || 'Collection Route Run'}
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Vehicle: <span className="font-semibold text-on-surface">{route.vehicleNumber}</span>
            {' | '}Created {formatDate(route.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/driver/dashboard"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">navigation</span>
            Launch Cockpit HUD
          </Link>
        </div>
      </div>

      {/* Grid: Map + Stop Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden border border-surface-container-high shadow-sm">
          <DriverRouteMap
            stops={route.stops || []}
            currentStopIndex={activeStopIndex}
          />
        </div>

        {/* Stops sequence */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <h3 className="font-bold text-on-surface text-base">Collection Waypoints</h3>
            <span className="text-xs text-on-surface-variant font-mono">
              {route.completedStops || 0} / {route.stops?.length || 0} Cleared
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {route.stops?.map((stop, index) => (
              <div
                key={stop.reportId || index}
                onClick={() => setActiveStopIndex(index)}
                className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                  activeStopIndex === index
                    ? 'border-primary bg-primary-container/10'
                    : stop.collected
                    ? 'border-emerald-200 bg-emerald-50/40 opacity-75'
                    : 'border-surface-container bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        stop.collected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {stop.collected ? '✓' : index + 1}
                    </span>
                    <span className="font-semibold text-xs text-on-surface">{stop.wasteType}</span>
                  </div>
                  <PriorityBadge priority={stop.priority} />
                </div>

                <div className="text-[11px] text-on-surface-variant flex items-start gap-1">
                  <span className="material-symbols-outlined text-xs mt-0.5">pin_drop</span>
                  <span className="line-clamp-1">{stop.location?.address || 'Node Coordinates'}</span>
                </div>

                {!stop.collected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkStopDone(index);
                    }}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Confirm Collection Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
