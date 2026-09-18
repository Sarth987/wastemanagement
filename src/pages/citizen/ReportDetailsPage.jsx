import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument } from '../../firebase/firestore';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateTime, formatReportId } from '../../utils/formatters';
import { WASTE_TYPES, REPORT_STATUS_LABELS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await getDocument('wasteReports', id);
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading report..." />;
  if (!report) return <div className="p-margin text-center text-body-md text-on-surface-variant">Report not found.</div>;

  const wasteTypeLabel = WASTE_TYPES.find((w) => w.id === report.wasteType)?.label || report.wasteType;

  // Timeline steps
  const timeline = [
    { label: 'Submitted', time: report.submittedAt || report.createdAt, icon: 'upload_file', done: true },
    { label: 'Verified', time: report.verifiedAt, icon: 'verified', done: !!report.verifiedAt },
    { label: 'Assigned', time: report.assignedAt, icon: 'assignment_ind', done: !!report.assignedAt },
    { label: 'Collected', time: report.collectedAt, icon: 'local_shipping', done: !!report.collectedAt },
    { label: 'Resolved', time: report.resolvedAt, icon: 'check_circle', done: !!report.resolvedAt },
  ];

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      <Link to="/my-reports" className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface mb-space-md">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to My Reports
      </Link>

      <div className="flex items-center gap-space-sm mb-space-lg flex-wrap">
        <h1 className="text-headline-lg text-on-surface">{formatReportId(report.id)}</h1>
        <StatusBadge status={report.status} />
        <PriorityBadge priority={report.priority} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-space-lg">
          {/* Photo */}
          {report.photoUrl && (
            <div className="rounded-2xl overflow-hidden shadow-surface-1">
              <img src={report.photoUrl} alt="Waste Report" className="w-full max-h-96 object-cover" />
            </div>
          )}

          {/* Details Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-surface-1 border border-outline-variant/20 p-space-md">
            <h2 className="text-headline-sm text-on-surface mb-space-md">Report Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Waste Type</span>
                <span className="text-body-md text-on-surface">{wasteTypeLabel}</span>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Priority</span>
                <PriorityBadge priority={report.priority} />
              </div>
              <div className="sm:col-span-2">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Location</span>
                <span className="text-body-md text-on-surface">{report.address}</span>
                {report.latitude && <p className="text-code-sm text-on-surface-variant">Lat: {report.latitude?.toFixed(6)} • Lng: {report.longitude?.toFixed(6)}</p>}
              </div>
              {report.description && (
                <div className="sm:col-span-2">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-body-md text-on-surface">{report.description}</p>
                </div>
              )}
              {report.adminNotes && (
                <div className="sm:col-span-2">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Admin Notes</span>
                  <p className="text-body-md text-on-surface">{report.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Timeline */}
        <div>
          <div className="bg-surface-container-lowest rounded-xl shadow-surface-1 border border-outline-variant/20 p-space-md">
            <h2 className="text-headline-sm text-on-surface mb-space-md">Dispatch Timeline</h2>
            <div className="space-y-space-xs">
              {timeline.map((step, idx) => (
                <div key={step.label} className="flex gap-space-sm">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${step.done ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    )}
                  </div>
                  <div className="pb-space-sm">
                    <p className={`text-label-md ${step.done ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                    <p className="text-code-sm text-on-surface-variant">{step.time ? formatDateTime(step.time) : 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
