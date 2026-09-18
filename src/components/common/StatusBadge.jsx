import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../../utils/constants';

export function StatusBadge({ status }) {
  const colors = REPORT_STATUS_COLORS[status] || REPORT_STATUS_COLORS.pending_verification;
  const label = REPORT_STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  const label = PRIORITY_LABELS[priority] || priority;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}
