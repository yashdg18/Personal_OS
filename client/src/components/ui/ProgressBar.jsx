export default function ProgressBar({ value = 0, tone = 'moss', className = '' }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const toneClass = tone === 'amber' ? 'bg-amber' : tone === 'rose' ? 'bg-rose' : 'bg-moss';
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-line ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${toneClass}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}

