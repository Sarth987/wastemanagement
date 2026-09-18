import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToCollection, updateReportStatus } from '../../firebase/firestore';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      'wasteReports',
      [],
      { field: 'createdAt', direction: 'desc' },
      (docs) => {
        setReports(docs);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredReports = reports.filter((report) => {
    // Search query
    const matchesSearch =
      !searchQuery ||
      report.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.wasteType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    // Priority filter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

    // Waste type filter
    const matchesWasteType = wasteTypeFilter === 'all' || report.wasteType === wasteTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesWasteType;
  });

  const handleQuickStatus = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      toast.success(`Updated status to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
            Incident Reports Registry
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Comprehensive log of all citizen reports, status transitions, and triage telemetry.
          </p>
        </div>
        <div className="text-label-md font-medium text-on-surface-variant bg-surface-container px-3.5 py-1.5 rounded-lg">
          Showing {filteredReports.length} of {reports.length} incidents
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search ID, address, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Waste type filter */}
          <div>
            <select
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Waste Classifications</option>
              <option value="Overflowing Public Bin">Overflowing Public Bin</option>
              <option value="Illegal Dump Site">Illegal Dump Site</option>
              <option value="Hazardous / Chemical">Hazardous / Chemical</option>
              <option value="Uncollected Residential">Uncollected Residential</option>
              <option value="Bulk Appliance / Furniture">Bulk Appliance / Furniture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low/60 text-code-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Incident Ref</th>
                <th className="py-3 px-4 font-semibold">Visual Evidence</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Address / Ward</th>
                <th className="py-3 px-4 font-semibold">Submitted</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading incident streams...
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    No matching incident reports.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-surface-container-low/50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-primary text-xs">
                      #{report.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      {report.photoUrl ? (
                        <img
                          src={report.photoUrl}
                          alt="Evidence"
                          className="w-10 h-10 rounded-lg object-cover border border-surface-container-high"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-lg">image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {report.wasteType || 'General Waste'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant max-w-[220px] truncate">
                      {report.location?.address || 'GPS Coordinate Node'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant text-xs">
                      <div>{formatDate(report.createdAt)}</div>
                      <div className="text-[11px] text-on-surface-variant/70 font-mono">
                        {formatRelativeTime(report.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={report.priority || 'medium'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'pending_verification' && (
                          <button
                            onClick={() => handleQuickStatus(report.id, 'verified')}
                            className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs transition cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
