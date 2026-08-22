import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, detail, icon: Icon, accent = 'moss', onClick }) {
  const accentClass = accent === 'amber' ? 'text-amber' : accent === 'rose' ? 'text-rose' : 'text-moss';
  return (
    <button type="button" onClick={onClick} className="group w-full rounded-2xl border border-line bg-panel p-5 text-left shadow-glow transition hover:-translate-y-0.5 hover:border-moss/40">
      <div className="mb-8 flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-ink ${accentClass}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <ArrowUpRight size={17} className="text-muted transition group-hover:text-moss" />
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-cream">{value}</p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </button>
  );
}

