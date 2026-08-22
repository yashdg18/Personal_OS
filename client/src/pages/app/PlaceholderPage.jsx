import { Construction } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export default function PlaceholderPage({ title, eyebrow, description }) {
  return <div className="animate-page"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{eyebrow || 'Coming next'}</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-cream">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{description || 'This section is part of the Personal OS roadmap and will be connected to its real data model in the next implementation phase.'}</p><div className="mt-10 max-w-2xl"><EmptyState icon={Construction} title="This space is ready for your data" description="No demo records are shown here. The module will be enabled as its phase is implemented." /></div></div>;
}

