import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  queryDocuments,
  updateDocument,
  updateReportStatus,
} from '../../firebase/firestore';
import DriverRouteMap from '../../components/maps/DriverRouteMap';
import { PriorityBadge } from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [activeRoute, setActiveRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [driverLocation, setDriverLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadDriverRoute() {
      try {
        // Fetch active route assigned to this driver or first planned route
        let routes = [];
        if (currentUser?.uid) {
          routes = await queryDocuments('routes', [
            { field: 'driverId', operator: '==', value: currentUser.uid },
          ]);
        }

        // Fallback: If no route specific to currentUser, get any active or planned route for demo
        if (routes.length === 0) {
          routes = await queryDocuments('routes', []);
        }

        if (routes.length > 0) {
          const route = routes.find((r) => r.status === 'in_progress') || routes[0];
          setActiveRoute(route);
          if (route.stops) {
            setStops(route.stops);
            const firstUncollected = route.stops.findIndex((s) => !s.collected);
            setCurrentStopIndex(firstUncollected !== -1 ? firstUncollected : 0);
          }
        }
      } catch (err) {
        console.error('Error fetching driver route:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDriverRoute();

    // Get current driver GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setDriverLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, [currentUser]);

  const handleStartRoute = async () => {
    if (!activeRoute) return;
    setActionLoading(true);
    try {
      await updateDocument('routes', activeRoute.id, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      });
      setActiveRoute({ ...activeRoute, status: 'in_progress' });
      toast.success('Route started! Navigation HUD activated.');
    } catch (err) {
      toast.error('Failed to start route');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!activeRoute || stops.length === 0) return;
    const currentStop = stops[currentStopIndex];
    if (!currentStop) return;

    setActionLoading(true);
    try {
      // 1. Mark report resolved in Firestore
      if (currentStop.reportId) {
        await updateReportStatus(currentStop.reportId, 'resolved', {
          driverNotes: 'Waste collected and cleared by municipal truck crew.',
          collectedByDriverId: currentUser?.uid || null,
        });
      }

      // 2. Update route stops in Firestore
      const updatedStops = [...stops];
      updatedStops[currentStopIndex] = { ...currentStop, collected: true };
      const completedCount = updatedStops.filter((s) => s.collected).length;
      const isComplete = completedCount === updatedStops.length;

      await updateDocument('routes', activeRoute.id, {
        stops: updatedStops,
        completedStops: completedCount,
        status: isComplete ? 'completed' : 'in_progress',
      });

      setStops(updatedStops);
      toast.success(`Stop #${currentStopIndex + 1} marked collected!`);

      if (isComplete) {
        toast.success('All stops completed! Route run finished.', { icon: '🎉' });
        setActiveRoute((prev) => ({ ...prev, status: 'completed' }));
      } else {
        setCurrentStopIndex((prev) => Math.min(prev + 1, updatedStops.length - 1));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark collected');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportBlocked = async () => {
    const currentStop = stops[currentStopIndex];
    if (!confirm('Report road/access blocked for this waypoint to municipal dispatch?')) return;
    try {
      if (currentStop?.reportId) {
        await updateReportStatus(currentStop.reportId, 'verified', {
          adminNotes: 'Driver reported blocked access. Needs alternate vehicle or reschedule.',
        });
      }
      toast.success('Dispatched access blockage alert to Admin Operations Command');
      setCurrentStopIndex((prev) => Math.min(prev + 1, stops.length - 1));
    } catch (err) {
      toast.error('Failed to report issue');
    }
  };

  const currentStop = stops[currentStopIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-6 space-y-6">
      {/* Top Driver Cockpit HUD Header */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                Driver Navigation HUD
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-headline-md font-bold tracking-tight">
              {userProfile?.name || 'Municipal Field Operator'}
            </h1>
            <div className="text-xs text-slate-400 mt-0.5">
              Asset: <span className="text-white font-mono">{activeRoute?.vehicleNumber || 'Compactor #DL-01-AX'}</span>
              {' | '}
              Route: <span className="text-white">{activeRoute?.name || 'Sector Morning Corridor'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/driver/routes"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            All Routes
          </Link>
          <Link
            to="/driver/profile"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            Operator Profile
          </Link>
        </div>
      </div>

      {/* Main Cockpit Body */}
      {loading ? (
        <div className="py-20 flex items-center justify-center text-on-surface-variant">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm">Loading field dispatch itinerary...</span>
        </div>
      ) : !activeRoute || stops.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">done_all</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">No Active Dispatches</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            You currently have no assigned waste collection runs queued. Stand by for municipal operations command dispatches.
          </p>
          <Link
            to="/driver/routes"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md"
          >
            Check Route Archive
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Live Route Navigation Map */}
          <div className="lg:col-span-2 h-[550px] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <DriverRouteMap
              currentLocation={driverLocation}
              stops={stops}
              currentStopIndex={currentStopIndex}
            />
          </div>

          {/* Right Column: Next Stop Action HUD */}
          <div className="space-y-4">
            {/* Active Stop Action Card */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <span className="text-code-sm text-primary font-bold uppercase tracking-wider">
                  Active Collection Task
                </span>
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  Stop {currentStopIndex + 1} of {stops.length}
                </span>
              </div>

              {currentStop ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-headline-sm font-bold text-on-surface">
                        {currentStop.wasteType || 'General Waste'}
                      </h3>
                      <PriorityBadge priority={currentStop.priority} />
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1 flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm mt-0.5 text-primary">
                        pin_drop
                      </span>
                      <span>{currentStop.location?.address || 'Node Coordinates'}</span>
                    </p>
                  </div>

                  {activeRoute.status === 'planned' ? (
                    <button
                      onClick={handleStartRoute}
                      disabled={actionLoading}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-md transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Start Route Run
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleMarkCollected}
                        disabled={actionLoading || currentStop.collected}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-label-md transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        {currentStop.collected ? 'Stop Collected' : 'Mark Collected & Advance'}
                      </button>

                      <button
                        onClick={handleReportBlocked}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl border border-amber-500/40 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">block</span>
                        Report Blocked Access / Issue
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-emerald-600 font-bold">
                  All collection stops completed!
                </div>
              )}
            </div>

            {/* Stop Checklist Queue */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-label-lg font-bold text-on-surface">
                Stop Queue Sequence ({stops.filter((s) => s.collected).length}/{stops.length})
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {stops.map((stop, idx) => {
                  const isCurrent = idx === currentStopIndex;
                  return (
                    <div
                      key={stop.reportId || idx}
                      onClick={() => setCurrentStopIndex(idx)}
                      className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-primary bg-primary-container/10 font-semibold text-on-surface'
                          : stop.collected
                          ? 'border-emerald-200 bg-emerald-50/50 text-slate-500'
                          : 'border-surface-container bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                            stop.collected
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-primary text-white'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {stop.collected ? '✓' : idx + 1}
                        </span>
                        <div className="truncate max-w-[170px]">
                          <div>{stop.wasteType}</div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            {stop.location?.address || 'Node coordinates'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          stop.collected
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCurrent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stop.collected ? 'Done' : isCurrent ? 'Next' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
