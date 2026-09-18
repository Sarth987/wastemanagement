import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WEo6r2k_a6UgctxbdcFURgPKDsGdYQufbxgN7ppTe1d7KlEcQmBQrEs8t25r2yS_lxzwdnCmtakn6e-0p1ln2GvkgoZJFNN4-1ZgeTQfVWjBKPE8lcBBP-Nx7snwaA778T0yh6_6NwZlt1_7CPYaUXAmqqPk8ELjw-STSeDqKULgRcyTfGNX4OqtJcHof27wUu1lw-wu03fszOEWRadArjrcabzxoUap0sekFEMO1U_gOZBPamwDvv_pQ';

const sidebarLinks = [
  { path: '/admin/dashboard', label: 'Overview Dashboard', icon: 'dashboard', filled: true },
  { path: '/admin/reports', label: 'Incident Reports', icon: 'assignment_late', badge: null },
  { path: '/admin/map', label: 'Live City Map', icon: 'map', indicator: 'sensors' },
  { path: '/admin/routes', label: 'Dynamic Routing', icon: 'alt_route', badge: null },
  { path: '/admin/fleet', label: 'Fleet Management', icon: 'local_shipping' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { divider: true, label: 'Administration' },
  { path: '/admin/drivers', label: 'Municipal Drivers', icon: 'badge' },
  { path: '/admin/vehicles', label: 'Vehicles', icon: 'directions_car' },
];

export default function AdminLayout() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-space-md lg:px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface">menu</span>
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-space-sm">
              <img alt="Smart Waste Logo" className="h-7 w-auto object-contain" src={LOGO_URL} />
              <div className="flex flex-col">
                <span className="text-headline-sm text-on-surface tracking-tight leading-tight">Smart Waste</span>
                <span className="text-code-sm text-on-surface-variant uppercase tracking-wider">Admin Console</span>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-space-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search by Report ID, Geofence, Vehicle, or Ward..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low border border-surface-container-high text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-sm py-space-xs rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-label-md font-bold">
                {userProfile?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-label-sm text-on-surface">{userProfile?.name || 'Admin'}</span>
                <span className="text-code-sm text-on-surface-variant">Administrator</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-error transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40
          w-72 bg-surface-container-low flex-shrink-0 flex flex-col py-space-md px-space-md shadow-sm overflow-y-auto
          transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map((link, idx) => {
              if (link.divider) {
                return (
                  <div key={idx} className="mt-space-md mb-space-xs">
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider px-space-sm">{link.label}</span>
                  </div>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-space-sm py-space-sm rounded-lg text-label-md transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={link.filled && isActive(link.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-code-sm font-bold">
                      {link.badge}
                    </span>
                  )}
                  {link.indicator && (
                    <span className="material-symbols-outlined text-secondary text-[16px]">{link.indicator}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-on-surface/20 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
