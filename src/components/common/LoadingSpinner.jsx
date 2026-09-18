export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-space-sm py-space-xl">
      <div className={`${sizeClasses[size]} border-2 border-surface-container-high border-t-primary rounded-full animate-spin`} />
      {text && <p className="text-body-sm text-on-surface-variant">{text}</p>}
    </div>
  );
}
