import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserReports } from '../../firebase/firestore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { formatRelativeTime, formatReportId, formatDate } from '../../utils/formatters';
import { WASTE_TYPES, REPORT_STATUS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function MyReportsPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchReports() {
      if (!currentUser) return;
      try {
        const data = await getUserReports(currentUser.uid);
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [currentUser]);

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);
  const wasteTypeLabel = (id) => WASTE_TYPES.find((w) => w.id === id)?.label || id;

  if (loading) return <LoadingSpinner size="lg" text="Loading reports..." />;

  return (
    <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="text-headline-lg text-on-surface">My Reports</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{reports.length} total reports submitted</p>
        </div>
        <Link to="/report-waste"
          className="inline-flex items-center gap-space-xs h-10 px-space-md rounded-lg bg-primary text-on-primary text-label-md shadow-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span> New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-space-xs mb-space-lg overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending_verification', label: 'Pending' },
          { value: 'verified', label: 'Verified' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-label-md whitespace-nowrap transition-all ${
              filter === f.value ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="description" title="No reports found" description={filter === 'all' ? 'You haven\'t submitted any reports yet.' : `No reports with status "${filter}".`}
          action={<Link to="/report-waste" className="text-label-md text-primary hover:underline">Create a Report →</Link>} />
      ) : (
        <div className="space-y-space-sm">
          {filtered.map((report) => (
            <Link key={report.id} to={`/report/${report.id}`}
              className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-surface-1 border border-outline-variant/10 hover:shadow-surface-2 transition-all">
              {report.photoUrl ? (
                <img src={report.photoUrl} alt="Report" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-on-surface-variant">image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-label-lg text-on-surface">{formatReportId(report.id)}</span>
                  <StatusBadge status={report.status} />
                  <PriorityBadge priority={report.priority} />
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">{wasteTypeLabel(report.wasteType)} • {report.address || 'No address'}</p>
                <p className="text-code-sm text-on-surface-variant mt-0.5">{formatDate(report.createdAt)}</p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">chevron_right</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
