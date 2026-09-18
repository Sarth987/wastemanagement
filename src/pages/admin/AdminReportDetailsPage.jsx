import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getDocument,
  updateDocument,
  getVehicles,
  getDrivers,
  createNotification,
} from '../../firebase/firestore';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import SmartWasteMap from '../../components/maps/SmartWasteMap';
import { Marker } from '@react-google-maps/api';
import toast from 'react-hot-toast';

export default function AdminReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const docData = await getDocument('wasteReports', id);
        if (docData) {
          setReport(docData);
          setSelectedStatus(docData.status || 'pending_verification');
          setSelectedPriority(docData.priority || 'medium');
          setSelectedVehicle(docData.assignedVehicleId || '');
          setSelectedDriver(docData.assignedDriverId || '');
          setAdminNotes(docData.adminNotes || '');
        }

        const [vList, dList] = await Promise.all([getVehicles(), getDrivers()]);
        setVehicles(vList);
        setDrivers(dList);
      } catch (err) {
        console.error('Error fetching details:', err);
        toast.error('Failed to load incident details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSaveChanges = async () => {
    setUpdating(true);
    try {
      const updates = {
        status: selectedStatus,
        priority: selectedPriority,
        assignedVehicleId: selectedVehicle || null,
        assignedDriverId: selectedDriver || null,
        adminNotes,
      };

      await updateDocument('wasteReports', id, updates);

      // Create notification for citizen
      if (report.userId) {
        await createNotification({
          userId: report.userId,
          reportId: id,
          title: `Report Status Updated: ${selectedStatus.replace('_', ' ').toUpperCase()}`,
          message: `Your incident report #${id.substring(0, 8)} has been updated to ${selectedStatus}.`,
          type: 'status_update',
        });
      }

      setReport((prev) => ({ ...prev, ...updates }));
      toast.success('Incident updated and citizen notified');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-space-md flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading incident dossier...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 p-space-md text-center py-20">
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Report Not Found</h2>
        <p className="text-on-surface-variant mb-4">The requested incident record does not exist.</p>
        <Link to="/admin/reports" className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold">
          Return to Registry
        </Link>
      </div>
    );
  }

  const mapCenter = {
    lat: Number(report.location?.lat || 28.6139),
    lng: Number(report.location?.lng || 77.2090),
  };

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Link to="/admin/reports" className="hover:text-primary transition flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Incident Registry
          </Link>
          <span>/</span>
          <span className="font-mono text-on-surface font-semibold">#{report.id.substring(0, 8)}</span>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Media, Location & Citizen Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Dossier Card */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
              <div>
                <span className="text-code-sm text-primary font-mono font-bold uppercase tracking-wider">
                  Incident Classification
                </span>
                <h1 className="text-headline-md font-bold text-on-surface mt-1">
                  {report.wasteType || 'Unclassified Waste'}
                </h1>
                <div className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span>Submitted {formatDate(report.createdAt)} ({formatRelativeTime(report.createdAt)})</span>
                </div>
              </div>
              <PriorityBadge priority={report.priority} />
            </div>

            {/* Evidence Photo */}
            <div>
              <h3 className="text-label-md font-semibold text-on-surface mb-2">Visual Evidence</h3>
              {report.photoUrl ? (
                <div className="w-full h-80 rounded-xl overflow-hidden border border-surface-container bg-slate-950">
                  <img
                    src={report.photoUrl}
                    alt="Citizen Evidence"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-1">no_photography</span>
                  <span className="text-body-sm">No photo evidence submitted</span>
                </div>
              )}
            </div>

            {/* Spatial Location Map */}
            <div>
              <h3 className="text-label-md font-semibold text-on-surface mb-2">Geographic Telemetry</h3>
              <div className="h-64 rounded-xl overflow-hidden border border-surface-container">
                <SmartWasteMap center={mapCenter} zoom={15}>
                  <Marker position={mapCenter} />
                </SmartWasteMap>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
                <span>{report.location?.address || 'Municipal Coordinate Node'}</span>
                <span className="font-mono text-primary font-bold">
                  {mapCenter.lat.toFixed(5)}, {mapCenter.lng.toFixed(5)}
                </span>
              </div>
            </div>

            {/* Citizen Field Description */}
            <div>
              <h3 className="text-label-md font-semibold text-on-surface mb-2">Citizen Field Notes</h3>
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-body-md text-on-surface">
                {report.description || 'No additional field notes or description provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Municipal Control & Triage Panel */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-headline-sm font-bold text-on-surface pb-3 border-b border-surface-container flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              Triage Operations
            </h2>

            {/* Status Selector */}
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified (Queued)</option>
                <option value="assigned">Assigned to Driver</option>
                <option value="in_progress">In Transit / In Progress</option>
                <option value="resolved">Resolved (Certified Clean)</option>
                <option value="rejected">Rejected (Invalid/Duplicate)</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Urgency / Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="low">Low (Standard Routine)</option>
                <option value="medium">Medium (Scheduled Next Run)</option>
                <option value="high">High (Needs Rapid Dispatch)</option>
                <option value="critical">Critical (Immediate Hazard)</option>
              </select>
            </div>

            {/* Driver Allocation */}
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Assign Municipal Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">-- No Driver Assigned --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.driverName} ({d.phone || 'Driver'})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Allocation */}
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Assign Fleet Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm font-medium text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber} ({v.type || 'Compactor'} - {v.capacity || '5 Ton'})
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Audit Notes */}
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                Municipal Audit Notes
              </label>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal triage rationale, disposal facility details, or driver instructions..."
                className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={updating}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Incident...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Commit Triage Updates
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
