import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, Check, Circle, Edit3, FileText, ListChecks, Plus, Search, Sparkles, Target, Trash2, X,
} from 'lucide-react';
import api, { getApiError } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';

const inputClass = 'field';

function newPlan() {
  return {
    title: '', description: '', category: 'Personal', priority: 'medium', status: 'planned', startDate: '', endDate: '', currentProgress: 0,
    data: { planType: 'future', wayToComplete: '', notes: '', todos: [] },
  };
}

function formFromPlan(item) {
  return { ...newPlan(), ...item, startDate: item.startDate ? String(item.startDate).slice(0, 10) : '', endDate: item.endDate ? String(item.endDate).slice(0, 10) : '', data: { ...newPlan().data, ...(item.data || {}) } };
}

function planProgress(plan) {
  const todos = plan.data?.todos || [];
  if (todos.length) return Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100);
  return Math.max(0, Math.min(100, Number(plan.currentProgress || 0)));
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export default function FuturePlanPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(newPlan());
  const [todoDrafts, setTodoDrafts] = useState({});

  async function loadPlans() {
    setLoading(true);
    try {
      const { data } = await api.get('/workspace/plan');
      setPlans((data.data.items || []).filter((item) => item.data?.planType === 'future'));
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not load future plans.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPlans(); }, []);

  const visiblePlans = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return plans;
    return plans.filter((plan) => `${plan.title} ${plan.description || ''} ${plan.category || ''} ${plan.data?.notes || ''}`.toLowerCase().includes(needle));
  }, [plans, query]);

  const totalTodos = plans.reduce((sum, plan) => sum + (plan.data?.todos?.length || 0), 0);
  const completedTodos = plans.reduce((sum, plan) => sum + (plan.data?.todos || []).filter((todo) => todo.completed).length, 0);
  const activePlans = plans.filter((plan) => !plan.completed && plan.status !== 'completed').length;

  function openNew() { setEditing(null); setForm(newPlan()); setModalOpen(true); }
  function openEdit(plan) { setEditing(plan); setForm(formFromPlan(plan)); setModalOpen(true); }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!form.title.trim()) throw new Error('A future plan needs a title.');
      const payload = {
        title: form.title.trim(), description: form.description, category: form.category, priority: form.priority, status: form.status,
        startDate: form.startDate || undefined, endDate: form.endDate || undefined, currentProgress: Number(form.currentProgress || 0),
        data: { ...form.data, planType: 'future', todos: form.data.todos || [] },
      };
      if (editing) {
        const { data } = await api.patch(`/workspace/plan/${editing.id}`, payload);
        setPlans((current) => current.map((plan) => plan.id === editing.id ? data.data.item : plan));
      } else {
        const { data } = await api.post('/workspace/plan', payload);
        setPlans((current) => [data.data.item, ...current]);
      }
      setModalOpen(false);
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not save this future plan.'));
    } finally {
      setSaving(false);
    }
  }

  async function removePlan(plan) {
    if (!window.confirm(`Delete “${plan.title}”?`)) return;
    try {
      await api.delete(`/workspace/plan/${plan.id}`);
      setPlans((current) => current.filter((item) => item.id !== plan.id));
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not delete this future plan.'));
    }
  }

  async function updatePlan(plan, todos, extra = {}) {
    const nextProgress = todos.length ? Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100) : Number(plan.currentProgress || 0);
    const allComplete = todos.length > 0 && todos.every((todo) => todo.completed);
    try {
      const { data } = await api.patch(`/workspace/plan/${plan.id}`, {
        ...extra,
        currentProgress: nextProgress,
        completed: allComplete,
        status: allComplete ? 'completed' : plan.status === 'completed' ? 'active' : plan.status,
        data: { ...(plan.data || {}), todos, planType: 'future' },
      });
      setPlans((current) => current.map((item) => item.id === plan.id ? data.data.item : item));
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update this plan.'));
    }
  }

  async function addTodo(plan) {
    const title = (todoDrafts[plan.id] || '').trim();
    if (!title) return;
    const todos = [...(plan.data?.todos || []), { id: `todo-${Date.now()}`, title, completed: false, createdAt: new Date().toISOString() }];
    setTodoDrafts((current) => ({ ...current, [plan.id]: '' }));
    await updatePlan(plan, todos);
  }

  async function toggleTodo(plan, todoId) {
    const todos = (plan.data?.todos || []).map((todo) => todo.id === todoId ? { ...todo, completed: !todo.completed } : todo);
    await updatePlan(plan, todos);
  }

  async function removeTodo(plan, todoId) {
    await updatePlan(plan, (plan.data?.todos || []).filter((todo) => todo.id !== todoId));
  }

  return <div className="animate-page space-y-7">
    <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Planner · Future</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">Plan the life ahead.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Turn future intentions into a clear path with notes, next actions, and a practical way to complete each plan.</p></div>
      <button type="button" onClick={openNew} className="button-primary self-start md:self-auto"><Plus size={16} /> Add future plan</button>
    </section>
    {error && <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
    <section className="grid gap-4 sm:grid-cols-3"><Stat label="Future plans" value={plans.length} detail="Ideas with a direction" /><Stat label="Active plans" value={activePlans} detail="Still moving forward" tone="moss" /><Stat label="To-dos complete" value={`${completedTodos}/${totalTodos || 0}`} detail="Small steps finished" tone="amber" /></section>
    <section className="flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" placeholder="Search future plans…" /></div><button type="button" onClick={loadPlans} className="button-secondary"><CalendarDays size={15} /> Refresh</button></section>
    {loading ? <div className="grid gap-4 xl:grid-cols-2">{[1, 2].map((number) => <div className="skeleton h-[430px] rounded-2xl" key={number} />)}</div> : visiblePlans.length ? <div className="grid gap-5 xl:grid-cols-2">{visiblePlans.map((plan) => <FuturePlanCard key={plan.id} plan={plan} draft={todoDrafts[plan.id] || ''} onDraftChange={(value) => setTodoDrafts((current) => ({ ...current, [plan.id]: value }))} onAddTodo={() => addTodo(plan)} onToggleTodo={(todoId) => toggleTodo(plan, todoId)} onRemoveTodo={(todoId) => removeTodo(plan, todoId)} onEdit={() => openEdit(plan)} onDelete={() => removePlan(plan)} />)}</div> : <EmptyState icon={Target} title="No future plans yet" description={query ? 'Try a different search.' : 'Give a meaningful future idea a title, a path, and a few next actions.'} actionLabel={query ? undefined : 'Add future plan'} onAction={openNew} />}
    {modalOpen && <FuturePlanModal form={form} editing={editing} saving={saving} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))} onDataChange={(field, value) => setForm((current) => ({ ...current, data: { ...current.data, [field]: value } }))} onClose={() => setModalOpen(false)} onSubmit={submit} />}
  </div>;
}

function Stat({ label, value, detail, tone = 'cream' }) { return <div className="rounded-2xl border border-line bg-panel p-5"><p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p><p className={`mt-3 font-display text-3xl font-semibold ${tone === 'moss' ? 'text-moss' : tone === 'amber' ? 'text-amber' : 'text-cream'}`}>{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></div>; }

function FuturePlanCard({ plan, draft, onDraftChange, onAddTodo, onToggleTodo, onRemoveTodo, onEdit, onDelete }) {
  const todos = plan.data?.todos || [];
  const progress = planProgress(plan);
  return <article className="overflow-hidden rounded-2xl border border-line bg-panel shadow-glow"><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-moss"><Sparkles size={18} /></span><div className="min-w-0"><h2 className={`font-display text-xl font-semibold ${plan.completed ? 'text-muted line-through' : 'text-cream'}`}>{plan.title}</h2><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">{plan.category && <span className="rounded-full border border-line px-2 py-1">{plan.category}</span>}{plan.priority && <span className="rounded-full border border-line px-2 py-1">{plan.priority}</span>}{plan.endDate && <span className="rounded-full border border-line px-2 py-1">Due {formatDate(plan.endDate)}</span>}</div></div></div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={onEdit} className="rounded-lg p-2 text-muted transition hover:bg-ink hover:text-cream" aria-label={`Edit ${plan.title}`}><Edit3 size={15} /></button><button type="button" onClick={onDelete} className="rounded-lg p-2 text-muted transition hover:bg-rose/10 hover:text-rose" aria-label={`Delete ${plan.title}`}><Trash2 size={15} /></button></div></div>{plan.description && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted">{plan.description}</p>}<div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-muted">Plan progress</span><span className="text-cream">{progress}%</span></div><ProgressBar value={progress} /></div><div className="mt-6 grid gap-4 lg:grid-cols-2"><section className="rounded-2xl border border-line bg-ink/40 p-4"><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-cream"><ListChecks size={16} className="text-moss" /> To-dos</h3><span className="text-xs text-muted">{todos.filter((todo) => todo.completed).length}/{todos.length}</span></div><div className="mt-4 space-y-2">{todos.length ? todos.map((todo) => <div key={todo.id} className="flex items-center gap-2"><button type="button" onClick={() => onToggleTodo(todo.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm" aria-label={`${todo.completed ? 'Reopen' : 'Complete'} ${todo.title}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${todo.completed ? 'border-moss bg-moss text-ink' : 'border-line text-transparent'}`}>{todo.completed ? <Check size={13} /> : <Circle size={9} />}</span><span className={todo.completed ? 'text-muted line-through' : 'text-cream'}>{todo.title}</span></button><button type="button" onClick={() => onRemoveTodo(todo.id)} className="rounded-md p-1.5 text-muted hover:bg-rose/10 hover:text-rose" aria-label={`Remove ${todo.title}`}><Trash2 size={13} /></button></div>) : <p className="text-xs leading-5 text-muted">Add the small actions that will move this plan forward.</p>}</div><div className="mt-4 flex gap-2"><input value={draft} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onAddTodo(); } }} className="field min-w-0 py-2.5 text-xs" placeholder="Add a next action…" /><button type="button" onClick={onAddTodo} className="button-secondary shrink-0 px-3" aria-label="Add to-do"><Plus size={15} /></button></div></section><section className="space-y-4"><div className="rounded-2xl border border-line bg-ink/40 p-4"><h3 className="flex items-center gap-2 text-sm font-semibold text-cream"><Target size={16} className="text-amber" /> How to complete it</h3><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{plan.data?.wayToComplete || 'Edit this plan and add the path, milestones, or routine that will make completion realistic.'}</p></div><div className="rounded-2xl border border-line bg-ink/40 p-4"><h3 className="flex items-center gap-2 text-sm font-semibold text-cream"><FileText size={16} className="text-moss" /> Notes</h3><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{plan.data?.notes || 'Keep useful context, reminders, and ideas for later.'}</p></div></section></div></div></article>;
}

function FuturePlanModal({ form, editing, saving, onChange, onDataChange, onClose, onSubmit }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-line bg-[#101813] p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{editing ? 'Edit future plan' : 'New future plan'}</p><h2 className="mt-2 font-display text-2xl font-semibold text-cream">Make the future concrete.</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-muted hover:bg-panel hover:text-cream" aria-label="Close form"><X size={18} /></button></div><form onSubmit={onSubmit} className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="Plan title" value={form.title} onChange={(value) => onChange('title', value)} placeholder="Launch my portfolio" wide /><Field label="Description" value={form.description} onChange={(value) => onChange('description', value)} placeholder="What does this future plan make possible?" textarea wide /><Field label="Area" value={form.category} onChange={(value) => onChange('category', value)} placeholder="Career, study, health…" /><SelectField label="Priority" value={form.priority} onChange={(value) => onChange('priority', value)} options={['low', 'medium', 'high', 'critical']} /><SelectField label="Status" value={form.status} onChange={(value) => onChange('status', value)} options={['planned', 'active', 'paused', 'completed']} /><Field label="Starting progress %" type="number" value={form.currentProgress} onChange={(value) => onChange('currentProgress', Number(value))} /><Field label="Start date" type="date" value={form.startDate} onChange={(value) => onChange('startDate', value)} /><Field label="Target date" type="date" value={form.endDate} onChange={(value) => onChange('endDate', value)} /><Field label="How will you complete this plan?" value={form.data.wayToComplete} onChange={(value) => onDataChange('wayToComplete', value)} placeholder="Break it into milestones, routines, and a definition of done…" textarea wide /><Field label="Notes" value={form.data.notes} onChange={(value) => onDataChange('notes', value)} placeholder="Keep context and reminders for your future self…" textarea wide /><div className="mt-2 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="button-secondary">Cancel</button><button disabled={saving} className="button-primary">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create future plan'}<Plus size={16} /></button></div></form></div></div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', textarea, wide }) { return <label className={`block ${wide ? 'sm:col-span-2' : ''}`}><span className="mb-2 block text-xs font-medium text-muted">{label}</span>{textarea ? <textarea rows="4" value={value || ''} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} /> : <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder={placeholder} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 100 : undefined} />}</label>; }

function SelectField({ label, value, onChange, options }) { return <label className="block"><span className="mb-2 block text-xs font-medium text-muted">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
