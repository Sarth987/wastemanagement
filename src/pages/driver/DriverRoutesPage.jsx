import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { queryDocuments } from '../../firebase/firestore';
import { formatDate } from '../../utils/formatters';

export default function DriverRoutesPage() {
  const { currentUser } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        let list = [];
        if (currentUser?.uid) {
          list = await queryDocuments('routes', [
            { field: 'driverId', operator: '==', value: currentUser.uid },
          ]);
        }
        if (list.length === 0) {
          list = await queryDocuments('routes', []);
        }
        setRoutes(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, [currentUser]);

  return (
    <div className="w-full max-w-7xl mx-auto px-space-md lg:px-margin py-8 space-y-6">
      <div>
        <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
          Assigned Collection Corridors
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Complete dispatch archive of active, scheduled, and historical collection routes.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-on-surface-variant">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm">Loading route archive...</span>
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-12 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
            route
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface">No Routes Dispatched</h3>
          <p className="text-body-sm text-on-surface-variant mt-1">
            There are currently no routes assigned to your operator profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <span className="font-mono text-xs text-primary font-bold">
                  #{route.id.substring(0, 8)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    route.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : route.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {route.status || 'planned'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-on-surface line-clamp-1">
                  {route.name || 'Municipal Collection Run'}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Vehicle: <span className="font-medium text-on-surface">{route.vehicleNumber || 'Compactor'}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Stops</span>
                  <span className="font-bold text-on-surface">
                    {route.completedStops || 0} / {route.totalStops || route.stops?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Distance</span>
                  <span className="font-bold text-on-surface">
                    {route.estimatedDistanceKm || '12'} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Est. Time</span>
                  <span className="font-bold text-on-surface">
                    {route.estimatedDurationMin || '45'} m
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">{formatDate(route.createdAt)}</span>
                <Link
                  to={`/driver/route/${route.id}`}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold flex items-center gap-1"
                >
                  View Itinerary
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
