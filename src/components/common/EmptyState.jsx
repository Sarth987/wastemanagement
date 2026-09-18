export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-space-md text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-space-md">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">{icon}</span>
      </div>
      <h3 className="text-headline-sm text-on-surface mb-space-xs">{title}</h3>
      {description && <p className="text-body-md text-on-surface-variant max-w-sm">{description}</p>}
      {action && <div className="mt-space-md">{action}</div>}
    </div>
  );
}
