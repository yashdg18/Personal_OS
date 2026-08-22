import { Plus } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/60 px-6 text-center">
      {Icon && <Icon size={22} className="mb-3 text-muted" strokeWidth={1.6} />}
      <p className="font-display text-base font-medium text-cream">{title}</p>
      <p className="mt-1 max-w-xs text-sm leading-6 text-muted">{description}</p>
      {actionLabel && (
        <button type="button" onClick={onAction} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-cream transition hover:border-moss/60 hover:text-moss">
          <Plus size={14} /> {actionLabel}
        </button>
      )}
    </div>
  );
}

