import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserReports } from '../../firebase/firestore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatRelativeTime, formatReportId } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CitizenDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!currentUser) return;
      try {
        const data = await getUserReports(currentUser.uid);
        setReports(data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [currentUser]);

  const reportList = Array.isArray(reports) ? reports : [];
  const stats = {
    total: reportList.length,
    pending: reportList.filter((r) => r.status === 'pending_verification').length,
    inProgress: reportList.filter((r) => ['verified', 'assigned', 'in_progress'].includes(r.status)).length,
    resolved: reportList.filter((r) => r.status === 'resolved').length,
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">
            Welcome back, <span className="text-primary">{userProfile?.name || 'Citizen'}</span>
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">Your waste reporting dashboard</p>
        </div>
        <Link
          to="/report-waste"
          className="inline-flex items-center gap-space-xs h-11 px-space-lg rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
          Report Waste
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mb-space-xl">
        {[
          { label: 'Total Reports', value: stats.total, icon: 'description', color: 'text-on-surface' },
          { label: 'Pending', value: stats.pending, icon: 'pending', color: 'text-status-warning' },
          { label: 'In Progress', value: stats.inProgress, icon: 'sync', color: 'text-status-info' },
          { label: 'Resolved', value: stats.resolved, icon: 'check_circle', color: 'text-status-success' },
        ].map((stat) => (
          <div key={stat.label} className="p-space-md rounded-xl bg-surface-container-lowest shadow-surface-1 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <span className={`text-headline-lg ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-surface-container-lowest rounded-xl shadow-surface-1 border border-outline-variant/20">
        <div className="flex items-center justify-between px-space-md py-space-sm border-b border-surface-container-high">
          <h2 className="text-headline-sm text-on-surface">Recent Reports</h2>
          <Link to="/my-reports" className="text-label-md text-primary hover:underline">View All →</Link>
        </div>
        {reports.length === 0 ? (
          <div className="p-space-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-surface-container-highest mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">No reports yet. Start by reporting waste in your area!</p>
            <Link to="/report-waste" className="inline-flex items-center gap-1 text-label-md text-primary mt-2 hover:underline">
              <span className="material-symbols-outlined text-[16px]">add</span> Create Report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-container-high">
            {reportList.slice(0, 5).map((report) => (
              <Link key={report.id} to={`/report/${report.id}`}
                className="flex items-center gap-space-md px-space-md py-space-sm hover:bg-surface-container-low transition-colors">
                {report.photoUrl ? (
                  <img src={report.photoUrl} alt="Report" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-label-md text-on-surface">{formatReportId(report.id)}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-body-sm text-on-surface-variant truncate">{report.address || report.wasteType || 'Report'}</p>
                </div>
                <span className="text-code-sm text-on-surface-variant shrink-0">{formatRelativeTime(report.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
