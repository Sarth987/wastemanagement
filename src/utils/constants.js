// ─── Status Constants ───
export const REPORT_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const REPORT_STATUS_LABELS = {
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const REPORT_STATUS_COLORS = {
  pending_verification: { bg: 'bg-status-warning-bg', text: 'text-amber-800', border: 'border-status-warning-border', dot: 'bg-status-warning' },
  verified: { bg: 'bg-status-info-bg', text: 'text-sky-800', border: 'border-status-info-border', dot: 'bg-status-info' },
  assigned: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-status-success-bg', text: 'text-emerald-800', border: 'border-status-success-border', dot: 'bg-status-success' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  rejected: { bg: 'bg-status-danger-bg', text: 'text-rose-800', border: 'border-status-danger-border', dot: 'bg-status-danger' },
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PRIORITY_LABELS = {
  low: 'Low Priority',
  medium: 'Standard',
  high: 'Urgent',
  critical: 'Critical',
};

export const PRIORITY_COLORS = {
  low: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' },
  medium: { bg: 'bg-status-info-bg', text: 'text-sky-700', dot: 'bg-status-info' },
  high: { bg: 'bg-status-warning-bg', text: 'text-amber-700', dot: 'bg-status-warning' },
  critical: { bg: 'bg-status-danger-bg', text: 'text-rose-700', dot: 'bg-status-danger' },
};

export const WASTE_TYPES = [
  { id: 'overflowing_bin', label: 'Overflowing Bin', sublabel: 'Volumetric Spill', icon: 'delete' },
  { id: 'uncollected_waste', label: 'Uncollected Waste', sublabel: 'Missed Scheduled Leg', icon: 'inventory_2' },
  { id: 'illegal_dumping', label: 'Illegal Dumping', sublabel: 'Bylaw Enforcement', icon: 'warning' },
  { id: 'roadside_waste', label: 'Roadside Waste', sublabel: 'Curb & Median Debris', icon: 'yard' },
  { id: 'hazardous', label: 'Hazardous / Other', sublabel: 'Chemical / Bio-hazard', icon: 'skull' },
  { id: 'bulk_appliance', label: 'Bulk Appliance', sublabel: 'White Goods / Metal', icon: 'kitchen' },
];

export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  ON_ROUTE: 'on_route',
  COLLECTING: 'collecting',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
};

export const DRIVER_STATUS = {
  AVAILABLE: 'available',
  ON_ROUTE: 'on_route',
  COLLECTING: 'collecting',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
};

export const ROUTE_STATUS = {
  PLANNED: 'planned',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ─── Map defaults ───
export const DEFAULT_MAP_CENTER = { lat: 21.1458, lng: 79.0882 }; // Nagpur, India as default
export const DEFAULT_MAP_ZOOM = 13;
