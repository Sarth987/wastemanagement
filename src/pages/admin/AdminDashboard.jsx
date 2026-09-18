import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  queryDocuments,
  updateReportStatus,
  subscribeToCollection,
  getVehicles,
  getDrivers,
} from '../../firebase/firestore';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTriageReport, setActiveTriageReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Real-time subscription to wasteReports
    const unsubscribe = subscribeToCollection(
      'wasteReports',
      [],
      { field: 'createdAt', direction: 'desc' },
      (docs) => {
        setReports(docs);
        setLoading(false);
      }
    );

    // Fetch vehicles & drivers
    getVehicles().then(setVehicles).catch(console.error);
    getDrivers().then(setDrivers).catch(console.error);

    return () => unsubscribe();
  }, []);

  // Compute live stats
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending_verification').length,
    verified: reports.filter((r) => r.status === 'verified').length,
    inProgress: reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    critical: reports.filter((r) => r.priority === 'critical' && r.status !== 'resolved').length,
    activeFleet: vehicles.filter((v) => v.status === 'active' || v.status === 'in_transit').length,
  };

  const filteredReports = reports.filter((report) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return report.status === 'pending_verification';
    if (selectedFilter === 'verified') return report.status === 'verified';
    if (selectedFilter === 'in_progress') return report.status === 'assigned' || report.status === 'in_progress';
    if (selectedFilter === 'resolved') return report.status === 'resolved';
    return true;
  });

  const handleVerify = async (reportId) => {
    setActionLoading(true);
    try {
      await updateReportStatus(reportId, 'verified');
      toast.success('Incident verified & queued for dispatch');
      setActiveTriageReport(null);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId) => {
    if (!confirm('Are you sure you want to reject this report?')) return;
    setActionLoading(true);
    try {
      await updateReportStatus(reportId, 'rejected', {
        adminNotes: 'Rejected by municipal audit team: Duplicate or insufficient verification.',
      });
      toast.success('Report marked as rejected');
      setActiveTriageReport(null);
    } catch (err) {
      toast.error('Failed to reject report');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
            Municipal Operations Command
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Live incident telemetry, autonomous dispatch queue, and municipal resource allocation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/routes"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
            Optimize Routes
          </Link>
          <Link
            to="/admin/map"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-label-md font-semibold hover:bg-surface-container-highest transition"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            Live Spatial Map
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-on-surface-variant">Total Incidents</span>
            <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
          </div>
          <div className="text-headline-md font-bold text-on-surface">{stats.total}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Logged to system</div>
        </div>

        <div className="bg-surface-container-lowest border border-amber-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-amber-600">Pending Audit</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">pending_actions</span>
          </div>
          <div className="text-headline-md font-bold text-amber-600">{stats.pending}</div>
          <div className="text-[11px] text-amber-700 mt-1">Awaiting verification</div>
        </div>

        <div className="bg-surface-container-lowest border border-blue-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-blue-600">Verified Queued</span>
            <span className="material-symbols-outlined text-blue-500 text-lg">verified</span>
          </div>
          <div className="text-headline-md font-bold text-blue-600">{stats.verified}</div>
          <div className="text-[11px] text-blue-700 mt-1">Ready for dispatch</div>
        </div>

        <div className="bg-surface-container-lowest border border-purple-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-purple-600">In Progress</span>
            <span className="material-symbols-outlined text-purple-500 text-lg">local_shipping</span>
          </div>
          <div className="text-headline-md font-bold text-purple-600">{stats.inProgress}</div>
          <div className="text-[11px] text-purple-700 mt-1">Trucks in transit</div>
        </div>

        <div className="bg-surface-container-lowest border border-emerald-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-emerald-600">Resolved</span>
            <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
          </div>
          <div className="text-headline-md font-bold text-emerald-600">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Cleared & certified</div>
        </div>

        <div className="bg-surface-container-lowest border border-red-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-code-sm uppercase font-semibold text-red-600">Critical / Haz</span>
            <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
          </div>
          <div className="text-headline-md font-bold text-red-600">{stats.critical}</div>
          <div className="text-[11px] text-red-700 mt-1">Priority escalation</div>
        </div>
      </div>

      {/* Main Incident Command Table Section */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-sm overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 border-b border-surface-container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Incidents', count: stats.total },
              { id: 'pending', label: 'Pending Audit', count: stats.pending },
              { id: 'verified', label: 'Verified Queue', count: stats.verified },
              { id: 'in_progress', label: 'Dispatched', count: stats.inProgress },
              { id: 'resolved', label: 'Resolved', count: stats.resolved },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-label-sm font-medium transition flex items-center gap-2 cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Link
            to="/admin/reports"
            className="text-label-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Full Incident Registry
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low/60 text-code-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Incident Ref</th>
                <th className="py-3 px-4 font-semibold">Visual Evidence</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Geofence / Ward</th>
                <th className="py-3 px-4 font-semibold">Reported</th>
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
                    No incident reports found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredReports.slice(0, 10).map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-surface-container-low/50 transition cursor-pointer"
                    onClick={() => setActiveTriageReport(report)}
                  >
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
                    <td className="py-3.5 px-4 text-on-surface-variant max-w-[200px] truncate">
                      {report.location?.address || 'GPS Coordinate Node'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono text-xs">
                      {formatRelativeTime(report.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={report.priority || 'medium'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'pending_verification' && (
                          <button
                            onClick={() => handleVerify(report.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs transition cursor-pointer"
                            title="Verify and Queue"
                          >
                            Verify
                          </button>
                        )}
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition"
                          title="Open Full Dossier"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
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

      {/* Triage Detail Drawer / Modal */}
      {activeTriageReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div>
                <span className="text-code-sm uppercase tracking-wider text-primary font-bold">
                  Quick Incident Triage
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  {activeTriageReport.wasteType || 'Waste Report'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTriageReport(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Evidence Photo */}
              {activeTriageReport.photoUrl && (
                <div className="w-full h-56 rounded-xl overflow-hidden border border-surface-container bg-slate-950">
                  <img
                    src={activeTriageReport.photoUrl}
                    alt="Citizen Evidence"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="text-code-sm text-on-surface-variant uppercase">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={activeTriageReport.status} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="text-code-sm text-on-surface-variant uppercase">Priority Level</span>
                  <div className="mt-1">
                    <PriorityBadge priority={activeTriageReport.priority} />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-code-sm text-on-surface-variant uppercase">Address / Coordinates</span>
                <p className="text-body-md text-on-surface mt-1 font-medium">
                  {activeTriageReport.location?.address || 'Coordinates only'}
                </p>
                <div className="text-xs font-mono text-primary mt-0.5">
                  {activeTriageReport.location?.lat}, {activeTriageReport.location?.lng}
                </div>
              </div>

              <div>
                <span className="text-code-sm text-on-surface-variant uppercase">Citizen Description</span>
                <p className="text-body-sm text-on-surface mt-1 bg-surface-container-low p-3 rounded-xl border border-surface-container">
                  {activeTriageReport.description || 'No additional field notes provided.'}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-surface-container flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(activeTriageReport.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error/10 text-label-md font-semibold transition cursor-pointer"
                >
                  Reject Report
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/admin/reports/${activeTriageReport.id}`}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-label-md font-semibold transition"
                >
                  Full Dossier
                </Link>
                {activeTriageReport.status === 'pending_verification' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(activeTriageReport.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition cursor-pointer"
                  >
                    Verify & Queue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
