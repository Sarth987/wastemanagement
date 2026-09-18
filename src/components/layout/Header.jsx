import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import { useState } from 'react';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WEo6r2k_a6UgctxbdcFURgPKDsGdYQufbxgN7ppTe1d7KlEcQmBQrEs8t25r2yS_lxzwdnCmtakn6e-0p1ln2GvkgoZJFNN4-1ZgeTQfVWjBKPE8lcBBP-Nx7snwaA778T0yh6_6NwZlt1_7CPYaUXAmqqPk8ELjw-STSeDqKULgRcyTfGNX4OqtJcHof27wUu1lw-wu03fszOEWRadArjrcabzxoUap0sekFEMO1U_gOZBPamwDvv_pQ';

export default function Header() {
  const { currentUser, userProfile, isAdmin, isDriver, isCitizen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Determine navigation links based on role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/reports', label: 'Reports' },
        { path: '/admin/map', label: 'Live Map' },
        { path: '/admin/routes', label: 'Routes' },
        { path: '/admin/fleet', label: 'Fleet' },
        { path: '/admin/analytics', label: 'Analytics' },
      ];
    }
    if (isDriver) {
      return [
        { path: '/driver/dashboard', label: 'Dashboard' },
        { path: '/driver/routes', label: 'My Routes' },
        { path: '/driver/profile', label: 'Profile' },
      ];
    }
    if (isCitizen) {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/report-waste', label: 'Report Waste' },
        { path: '/my-reports', label: 'My Reports' },
        { path: '/notifications', label: 'Notifications' },
      ];
    }
    // Public
    return [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-margin flex items-center justify-between gap-space-md">
        {/* Logo */}
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm">
            <img alt="Smart Waste Logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
            <div className="flex flex-col">
              <span className="text-headline-sm text-on-surface tracking-tight leading-tight">Smart Waste</span>
              <span className="text-label-sm text-on-surface-variant hidden xl:inline">
                Smarter Waste Collection. Cleaner Communities.
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-space-xs">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-space-sm py-space-xs text-label-md transition-colors rounded-lg ${
                isActive(link.path)
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm">
          {currentUser ? (
            <>
              {isCitizen && (
                <Link
                  to="/report-waste"
                  className="hidden sm:inline-flex items-center gap-space-xs h-10 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-surface-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                  <span className="text-label-md text-on-primary">Report Waste</span>
                </Link>
              )}
              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </button>
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-surface-container-lowest rounded-xl shadow-surface-3 border border-outline-variant/30 py-space-xs z-50 animate-slide-up">
                    <div className="px-space-md py-space-sm border-b border-surface-container-high">
                      <p className="text-label-md text-on-surface truncate">{userProfile?.name || currentUser.email}</p>
                      <p className="text-code-sm text-on-surface-variant capitalize">{userProfile?.role}</p>
                    </div>
                    <Link
                      to={isAdmin ? '/admin/dashboard' : isDriver ? '/driver/dashboard' : '/profile'}
                      className="flex items-center gap-space-sm px-space-md py-space-sm text-body-md text-on-surface hover:bg-surface-container transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      Profile
                    </Link>
                    {/* Mobile nav links */}
                    <div className="lg:hidden border-t border-surface-container-high mt-space-xs pt-space-xs">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="flex items-center gap-space-sm px-space-md py-space-sm text-body-md text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-space-sm px-space-md py-space-sm text-body-md text-error hover:bg-error-container transition-colors border-t border-surface-container-high mt-space-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/report-waste"
                className="hidden sm:inline-flex items-center gap-space-xs h-10 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-surface-1"
              >
                <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                <span className="text-label-md text-on-primary">Report Waste</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-space-xs h-10 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span className="text-label-md text-on-surface">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}
    </header>
  );
}
