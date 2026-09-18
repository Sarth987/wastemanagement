import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DriverProfilePage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out of driver cockpit');
    navigate('/login');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-space-md py-10 space-y-6">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-surface-container">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl">
            {userProfile?.name?.[0]?.toUpperCase() || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-code-sm text-primary uppercase font-mono font-bold tracking-wider">
                Field Operations Personnel
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active On Duty
              </span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface mt-0.5">
              {userProfile?.name || 'Municipal Driver'}
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              {userProfile?.email || currentUser?.email || 'driver@smartwaste.gov'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="text-code-sm text-on-surface-variant uppercase">Operator ID</span>
            <div className="font-mono font-bold text-sm text-on-surface mt-1">
              OP-{currentUser?.uid?.substring(0, 8).toUpperCase() || '784291'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="text-code-sm text-on-surface-variant uppercase">Phone Contact</span>
            <div className="font-mono font-bold text-sm text-on-surface mt-1">
              {userProfile?.phone || '+91 98765 43210'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="text-code-sm text-on-surface-variant uppercase">Safety Rating</span>
            <div className="font-bold text-sm text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">star</span>
              4.95 / 5.0 (Certified)
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <span className="text-code-sm text-on-surface-variant uppercase">Shift Assignment</span>
            <div className="font-bold text-sm text-on-surface mt-1">
              06:00 - 14:00 (Morning Run)
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Municipal Department of Environmental Services & Logistics
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error/10 text-xs font-semibold transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
