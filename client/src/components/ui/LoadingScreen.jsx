export default function LoadingScreen({ label = 'Loading your workspace…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-cream">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="h-3 w-3 animate-pulse rounded-full bg-moss" />
        {label}
      </div>
    </div>
  );
}

