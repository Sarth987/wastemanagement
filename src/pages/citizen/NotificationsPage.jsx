import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationRead } from '../../firebase/firestore';
import { formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!currentUser) return;
      try {
        const data = await getUserNotifications(currentUser.uid);
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [currentUser]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading notifications..." />;

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <h1 className="text-headline-lg text-on-surface mb-space-lg">Notifications</h1>
      {notifications.length === 0 ? (
        <EmptyState icon="notifications" title="No notifications" description="You'll receive updates when your reports are verified, assigned, or resolved." />
      ) : (
        <div className="space-y-space-xs">
          {notifications.map((n) => (
            <div key={n.id}
              className={`p-space-md rounded-xl border transition-all ${
                n.read ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-primary-fixed/10 border-primary/20'
              }`}>
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-start gap-space-sm">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-surface-container' : 'bg-primary-container'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${n.read ? 'text-on-surface-variant' : 'text-primary'}`}>
                      {n.type === 'report_verified' ? 'verified' : n.type === 'report_assigned' ? 'local_shipping' : n.type === 'report_resolved' ? 'check_circle' : 'notifications'}
                    </span>
                  </div>
                  <div>
                    <p className={`text-label-md ${n.read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{n.title}</p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">{n.message}</p>
                    <p className="text-code-sm text-on-surface-variant mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
                {!n.read && (
                  <button onClick={() => handleMarkRead(n.id)} className="text-label-sm text-primary hover:underline shrink-0">Mark read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
