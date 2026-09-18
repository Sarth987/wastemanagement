import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export default function ProfilePage() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <h1 className="text-headline-lg text-on-surface mb-space-lg">My Profile</h1>
      <div className="bg-surface-container-lowest rounded-2xl shadow-surface-1 border border-outline-variant/20 p-space-lg">
        <div className="flex items-center gap-space-md mb-space-lg">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-headline-lg font-bold">
            {userProfile?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <h2 className="text-headline-sm text-on-surface">{userProfile?.name || 'Citizen'}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm capitalize">{userProfile?.role}</span>
          </div>
        </div>
        <div className="space-y-space-md">
          <div>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Email</span>
            <p className="text-body-md text-on-surface">{currentUser?.email || '—'}</p>
          </div>
          <div>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Phone</span>
            <p className="text-body-md text-on-surface">{userProfile?.phone || currentUser?.phoneNumber || '—'}</p>
          </div>
          <div>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Member Since</span>
            <p className="text-body-md text-on-surface">{formatDate(userProfile?.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
