import { useEffect, useMemo, useState } from 'react';
import {
  Archive, ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, Check, CircleCheck, Edit3,
  FileText, FolderOpen, Image as ImageIcon, ListChecks, Pin, Plus, Search, Target, Timer,
  Trash2, X, Zap,
} from 'lucide-react';
import api, { getApiError } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';

const inputClass = 'field';

export const moduleConfigs = {
  goal: {
    eyebrow: 'Goals', title: 'Give your energy a direction.', description: 'Turn intentions into visible progress with deadlines, priorities, and a pace you can sustain.', icon: Target, singular: 'goal', empty: 'Create the first goal for this season.', fields: [
      { name: 'title', label: 'Goal title', placeholder: 'Become a stronger full-stack engineer' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What does done look like?' },
      { name: 'category', label: 'Category', placeholder: 'Career, learning, personal…' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'status', label: 'Status', type: 'select', options: ['planned', 'active', 'paused', 'completed', 'cancelled'] },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'Deadline', type: 'date' },
      { name: 'target', label: 'Target value', type: 'number', placeholder: '100' },
      { name: 'currentProgress', label: 'Current progress', type: 'number', placeholder: '0' },
      { name: 'notes', label: 'Notes', dataKey: 'notes', type: 'textarea', placeholder: 'A note to your future self' },
    ], progress: (item) => item.target ? Math.min(100, Math.round((Number(item.currentProgress || 0) / Number(item.target)) * 100)) : 0, toggle: true,
  },
  task: {
    eyebrow: 'Today', title: 'Make today actionable.', description: 'A focused list of small, finishable actions. Completion is calculated automatically as you move through the day.', icon: ListChecks, singular: 'task', empty: 'Add one clear next action for today.', defaultStatus: 'planned', fields: [
      { name: 'title', label: 'Task title', placeholder: 'Solve 5 DSA problems' },
      { name: 'description', label: 'Details', type: 'textarea', placeholder: 'Add useful context or a definition of done' },
      { name: 'category', label: 'Category', placeholder: 'Study, career, personal…' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'taskDate', label: 'Task date', type: 'date' },
      { name: 'estimatedMinutes', label: 'Estimated minutes', type: 'number', placeholder: '30' },
      { name: 'notes', label: 'Notes', dataKey: 'notes', type: 'textarea', placeholder: 'Anything to remember' },
    ], toggle: true,
  },
  careerGoal: {
    eyebrow: 'Career', title: 'Build the career you want.', description: 'Keep the direction, milestones, and evidence of your growth in one place.', icon: BriefcaseBusiness, singular: 'career goal', empty: 'Add a career milestone to work toward.', fields: [
      { name: 'title', label: 'Career goal', placeholder: 'Become a strong full-stack engineer' },
      { name: 'description', label: 'Why it matters', type: 'textarea', placeholder: 'Describe the outcome you want' },
      { name: 'category', label: 'Area', placeholder: 'Role, portfolio, interview…' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'endDate', label: 'Target date', type: 'date' },
      { name: 'currentProgress', label: 'Progress %', type: 'number', placeholder: '0' },
    ], progress: (item) => Number(item.currentProgress || 0),
  },
  careerProject: {
    eyebrow: 'Career', title: 'Your proof of work.', description: 'Track the projects that turn learning into a visible portfolio.', icon: BriefcaseBusiness, singular: 'project', empty: 'Capture a project you are building.', fields: [
      { name: 'title', label: 'Project name', placeholder: 'Personal OS' },
      { name: 'description', label: 'Project notes', type: 'textarea', placeholder: 'What are you building and why?' },
      { name: 'category', label: 'Tech / area', placeholder: 'MERN, systems, design…' },
      { name: 'status', label: 'Status', type: 'select', options: ['planned', 'active', 'completed', 'paused'] },
      { name: 'endDate', label: 'Target date', type: 'date' },
      { name: 'currentProgress', label: 'Progress %', type: 'number', placeholder: '0' },
      { name: 'url', label: 'Project link', dataKey: 'url', placeholder: 'https://…' },
    ], progress: (item) => Number(item.currentProgress || 0),
  },
  application: {
    eyebrow: 'Career', title: 'Keep opportunities in motion.', description: 'A calm view of applications, conversations, and follow-ups.', icon: BriefcaseBusiness, singular: 'application', empty: 'Track an opportunity or follow-up.', fields: [
      { name: 'title', label: 'Company / role', placeholder: 'Frontend Engineer · Acme' },
      { name: 'description', label: 'Notes', type: 'textarea', placeholder: 'Contact, next step, preparation notes…' },
      { name: 'category', label: 'Stage', type: 'select', options: ['saved', 'applied', 'screening', 'interview', 'offer', 'closed'] },
      { name: 'endDate', label: 'Follow-up date', type: 'date' },
      { name: 'url', label: 'Job link', dataKey: 'url', placeholder: 'https://…' },
    ],
  },
  exam: {
    eyebrow: 'Exams', title: 'Prepare with a clear view.', description: 'Track exams, score targets, and the preparation work that moves the needle.', icon: CalendarDays, singular: 'exam', empty: 'Add an exam or certification target.', fields: [
      { name: 'title', label: 'Exam name', placeholder: 'GATE 2027' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Subjects, strategy, or constraints' },
      { name: 'category', label: 'Track', placeholder: 'Competitive exam, certification…' },
      { name: 'status', label: 'Status', type: 'select', options: ['planned', 'active', 'completed', 'paused'] },
      { name: 'endDate', label: 'Exam date', type: 'date' },
      { name: 'targetScore', label: 'Target score', dataKey: 'targetScore', type: 'number', placeholder: '100' },
      { name: 'currentScore', label: 'Current score', dataKey: 'currentScore', type: 'number', placeholder: '0' },
      { name: 'currentProgress', label: 'Preparation %', type: 'number', placeholder: '0' },
    ], progress: (item) => Number(item.currentProgress || 0),
  },
  skill: {
    eyebrow: 'Skills', title: 'Track what you can do.', description: 'Keep your current capabilities honest and easy to practice.', icon: Zap, singular: 'skill', empty: 'Add a skill you are actively developing.', fields: [
      { name: 'title', label: 'Skill name', placeholder: 'React' },
      { name: 'description', label: 'Practice notes', type: 'textarea', placeholder: 'What are you working on?' },
      { name: 'category', label: 'Category', placeholder: 'Frontend, backend, fundamentals…' },
      { name: 'proficiency', label: 'Proficiency %', dataKey: 'proficiency', type: 'number', placeholder: '70' },
      { name: 'lastPracticed', label: 'Last practiced', dataKey: 'lastPracticed', type: 'date' },
      { name: 'resources', label: 'Resources', dataKey: 'resources', type: 'textarea', placeholder: 'Courses, repos, books…' },
    ], progress: (item) => Number(item.data?.proficiency || 0),
  },
  futureSkill: {
    eyebrow: 'Future skills', title: 'Choose what to learn next.', description: 'Turn curiosity into a deliberate next chapter.', icon: Zap, singular: 'future skill', empty: 'Add the next skill worth learning.', fields: [
      { name: 'title', label: 'Skill name', placeholder: 'System design' },
      { name: 'description', label: 'Learning plan', type: 'textarea', placeholder: 'Why this skill, and how will you learn it?' },
      { name: 'category', label: 'Category', placeholder: 'Cloud, architecture, AI…' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'status', label: 'Status', type: 'select', options: ['planned', 'learning', 'paused', 'completed'] },
      { name: 'endDate', label: 'Target date', type: 'date' },
      { name: 'reason', label: 'Reason', dataKey: 'reason', type: 'textarea', placeholder: 'Why now?' },
    ],
  },
  book: {
    eyebrow: 'Books', title: 'Keep your reading visible.', description: 'A small, useful reading shelf for ideas you want to carry forward.', icon: BookOpen, singular: 'book', empty: 'Add a book to your reading shelf.', fields: [
      { name: 'title', label: 'Book title', placeholder: 'Designing Data-Intensive Applications' },
      { name: 'description', label: 'Notes', type: 'textarea', placeholder: 'What are you hoping to take from it?' },
      { name: 'category', label: 'Category', placeholder: 'Engineering, career, personal…' },
      { name: 'status', label: 'Status', type: 'select', options: ['wantToRead', 'reading', 'completed', 'paused', 'dropped'] },
      { name: 'author', label: 'Author', dataKey: 'author', placeholder: 'Author name' },
      { name: 'totalPages', label: 'Total pages', dataKey: 'totalPages', type: 'number', placeholder: '300' },
      { name: 'currentPage', label: 'Current page', dataKey: 'currentPage', type: 'number', placeholder: '0' },
      { name: 'endDate', label: 'Target date', type: 'date' },
    ], progress: (item) => item.data?.totalPages ? Math.min(100, Math.round((Number(item.data?.currentPage || 0) / Number(item.data.totalPages)) * 100)) : Number(item.data?.progress || 0),
  },
  note: {
    eyebrow: 'Notes', title: 'Capture what matters.', description: 'A low-friction place for ideas, study notes, and the things worth finding again.', icon: FileText, singular: 'note', empty: 'Write down the idea before it disappears.', fields: [
      { name: 'title', label: 'Note title', placeholder: 'A useful idea' },
      { name: 'description', label: 'Note content', type: 'textarea', rows: 7, placeholder: 'Start writing…' },
      { name: 'category', label: 'Category', type: 'select', options: ['Programming', 'Career', 'Study', 'Project', 'Personal', 'Ideas', 'Important'] },
      { name: 'pinned', label: 'Pin this note', type: 'checkbox' },
    ], pinned: true,
  },
  gallery: {
    eyebrow: 'Gallery', title: 'Your memories, privately held.', description: 'Keep a private index of images and memories with album context. Storage adapters can be connected for production uploads.', icon: ImageIcon, singular: 'memory', empty: 'Add a private memory or image link.', fields: [
      { name: 'title', label: 'Memory title', placeholder: 'A day worth keeping' },
      { name: 'description', label: 'Caption', type: 'textarea', placeholder: 'What should you remember?' },
      { name: 'category', label: 'Album', type: 'select', options: ['College', 'Friends', 'Travel', 'Projects', 'Personal'] },
      { name: 'url', label: 'Image URL', dataKey: 'url', placeholder: 'https://images.example.com/photo.jpg' },
      { name: 'uploadedAt', label: 'Date captured', dataKey: 'uploadedAt', type: 'date' },
    ], media: true,
  },
  document: {
    eyebrow: 'Documents', title: 'Important files, properly protected.', description: 'Track the private files you need without exposing them through a public route. Connect S3/Cloudinary credentials for uploads.', icon: FolderOpen, singular: 'document', empty: 'Add a document record to your private vault.', fields: [
      { name: 'title', label: 'Document name', placeholder: 'Resume · August 2026' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What is this file for?' },
      { name: 'category', label: 'Category', type: 'select', options: ['Identity', 'Education', 'Career', 'Personal', 'Other'] },
      { name: 'fileName', label: 'File name', dataKey: 'fileName', placeholder: 'resume.pdf' },
      { name: 'url', label: 'Private storage key / URL', dataKey: 'url', placeholder: 's3://private-bucket/…' },
      { name: 'fileType', label: 'File type', dataKey: 'fileType', placeholder: 'application/pdf' },
    ],
  },
  plan: {
    eyebrow: 'Planner', title: 'Shape the plan ahead.', description: 'Move from a monthly intention to a weekly focus and then to a practical day.', icon: CalendarDays, singular: 'plan', empty: 'Add a planning objective for this horizon.', fields: [
      { name: 'title', label: 'Objective', placeholder: 'Complete the next meaningful step' },
      { name: 'description', label: 'Plan details', type: 'textarea', placeholder: 'What will make this plan successful?' },
      { name: 'category', label: 'Area', placeholder: 'Career, study, personal…' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'planType', label: 'Horizon', dataKey: 'planType', type: 'select', options: ['monthly', 'weekly', 'daily'] },
      { name: 'currentProgress', label: 'Progress %', type: 'number', placeholder: '0' },
    ], progress: (item) => Number(item.currentProgress || 0),
  },
};

Object.entries(moduleConfigs).forEach(([type, config]) => { config.type = type; });

function todayString() { return new Date().toISOString().slice(0, 10); }

function makeDefaultForm(config) {
  return { title: '', description: '', category: 'Personal', priority: 'medium', status: config.defaultStatus || 'planned', startDate: '', endDate: '', taskDate: config.type === 'task' ? todayString() : '', target: 100, currentProgress: 0, estimatedMinutes: 30, pinned: false, data: {} };
}

function itemToForm(item, config) {
  return { ...makeDefaultForm(config), ...item, data: { ...(item.data || {}) } };
}

function getValue(form, field) { return field.dataKey ? form.data?.[field.dataKey] ?? '' : form[field.name] ?? ''; }

function setValue(form, field, value) {
  if (field.dataKey) return { ...form, data: { ...form.data, [field.dataKey]: value } };
  return { ...form, [field.name]: value };
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function ItemField({ field, form, onChange }) {
  const value = getValue(form, field);
  if (field.type === 'checkbox') return <label className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3.5 py-3 text-sm text-cream"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field, event.target.checked)} className="h-4 w-4 accent-[#9ed44b]" /> {field.label}</label>;
  if (field.type === 'textarea') return <label className="block"><span className="mb-2 block text-xs font-medium text-muted">{field.label}</span><textarea rows={field.rows || 3} value={value} onChange={(event) => onChange(field, event.target.value)} className={inputClass} placeholder={field.placeholder} /></label>;
  if (field.type === 'select') return <label className="block"><span className="mb-2 block text-xs font-medium text-muted">{field.label}</span><select value={value} onChange={(event) => onChange(field, event.target.value)} className={inputClass}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <label className="block"><span className="mb-2 block text-xs font-medium text-muted">{field.label}</span><input type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} value={value} onChange={(event) => onChange(field, field.type === 'number' ? Number(event.target.value) : event.target.value)} className={inputClass} placeholder={field.placeholder} /></label>;
}

function ItemCard({ item, config, onEdit, onDelete, onToggle }) {
  const Icon = config.icon || Archive;
  const progress = config.progress?.(item);
  const imageUrl = item.data?.url;
  return <article className="group overflow-hidden rounded-2xl border border-line bg-panel shadow-glow transition hover:-translate-y-0.5 hover:border-moss/40">
    {config.media && imageUrl && <div className="h-40 overflow-hidden bg-ink"><img src={imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div>}
    <div className="p-5"><div className="flex items-start justify-between gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-moss"><Icon size={17} /></span><div className="flex items-center gap-1"><button type="button" onClick={() => onEdit(item)} className="rounded-lg p-2 text-muted transition hover:bg-ink hover:text-cream" aria-label={`Edit ${item.title}`}><Edit3 size={15} /></button><button type="button" onClick={() => onDelete(item)} className="rounded-lg p-2 text-muted transition hover:bg-rose/10 hover:text-rose" aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div><div className="mt-4"><h3 className={`font-display text-lg font-semibold ${item.completed ? 'text-muted line-through' : 'text-cream'}`}>{item.title}</h3>{item.description && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted">{item.description}</p>}</div><div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">{item.category && <span className="rounded-full border border-line px-2 py-1">{item.category}</span>}{item.priority && <span className={`rounded-full border border-line px-2 py-1 ${item.priority === 'critical' || item.priority === 'high' ? 'text-rose' : item.priority === 'medium' ? 'text-amber' : ''}`}>{item.priority}</span>}{item.status && <span className="rounded-full border border-line px-2 py-1">{item.status}</span>}{item.endDate && <span className="rounded-full border border-line px-2 py-1">Due {formatDate(item.endDate)}</span>}</div>{progress !== undefined && <div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="text-muted">Progress</span><span className="text-cream">{progress}%</span></div><ProgressBar value={progress} tone={config.type === 'exam' ? 'amber' : 'moss'} /></div>}{config.type === 'book' && item.data?.author && <p className="mt-3 text-xs text-muted">by {item.data.author}{item.data.totalPages ? ` · ${item.data.currentPage || 0}/${item.data.totalPages} pages` : ''}</p>}{config.type === 'document' && item.data?.fileName && <p className="mt-3 truncate text-xs text-muted">{item.data.fileName} {item.data.fileType ? `· ${item.data.fileType}` : ''}</p>}{config.type === 'gallery' && imageUrl && <p className="mt-3 truncate text-xs text-muted">{imageUrl}</p>}{config.toggle && <button type="button" onClick={() => onToggle(item)} className={`mt-5 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition ${item.completed ? 'border-moss/30 bg-moss/10 text-moss' : 'border-line text-muted hover:border-moss/40 hover:text-cream'}`}>{item.completed ? <><span className="flex items-center gap-2"><CircleCheck size={14} /> Completed</span><span>Reopen</span></> : <><span className="flex items-center gap-2"><Check size={14} /> Mark complete</span><ArrowRight size={14} /></>}</button>}</div>
  </article>;
}

function ItemModal({ config, form, editing, saving, onChange, onClose, onSubmit }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-line bg-[#101813] p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{editing ? 'Edit' : 'New'} {config.singular}</p><h2 className="mt-2 font-display text-2xl font-semibold text-cream">{editing ? 'Refine the details.' : 'Make it concrete.'}</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-muted hover:bg-panel hover:text-cream" aria-label="Close form"><X size={18} /></button></div><form onSubmit={onSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">{config.fields.map((field) => <div key={field.name} className={field.type === 'textarea' || field.type === 'checkbox' ? 'sm:col-span-2' : ''}><ItemField field={field} form={form} onChange={onChange} /></div>)}<div className="mt-2 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="button-secondary">Cancel</button><button disabled={saving} className="button-primary">{saving ? 'Saving…' : editing ? 'Save changes' : `Add ${config.singular}`}<Plus size={16} /></button></div></form></div></div>;
}

export default function ModulePage({ config, query = {}, filterItems }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [queryText, setQueryText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(makeDefaultForm(config));
  const [saving, setSaving] = useState(false);
  const Icon = config.icon || Archive;
  const load = () => { setLoading(true); api.get(`/workspace/${config.type}`, { params: query }).then(({ data }) => setItems(data.data.items || [])).catch((requestError) => setError(getApiError(requestError, `Could not load ${config.singular}s.`))).finally(() => setLoading(false)); };
  useEffect(load, [config.type, JSON.stringify(query)]);
  const visibleItems = useMemo(() => { const base = filterItems ? items.filter(filterItems) : items; if (!queryText.trim()) return base; const needle = queryText.toLowerCase(); return base.filter((item) => `${item.title} ${item.description || ''} ${item.category || ''}`.toLowerCase().includes(needle)); }, [items, queryText, filterItems]);
  const completed = items.filter((item) => item.completed || item.status === 'completed').length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  function openNew() { setEditing(null); setForm(makeDefaultForm(config)); setModalOpen(true); }
  function openEdit(item) { setEditing(item); setForm(itemToForm(item, config)); setModalOpen(true); }
  async function submit(event) { event.preventDefault(); setSaving(true); setError(''); try { const payload = { ...form, data: form.data }; if (!payload.title?.trim()) throw new Error('A title is required.'); if (editing) { const { data } = await api.patch(`/workspace/${config.type}/${editing.id}`, payload); setItems((current) => current.map((item) => item.id === editing.id ? data.data.item : item)); } else { const { data } = await api.post(`/workspace/${config.type}`, payload); setItems((current) => [data.data.item, ...current]); } setModalOpen(false); } catch (requestError) { setError(getApiError(requestError, 'Could not save this item.')); } finally { setSaving(false); } }
  async function remove(item) { if (!window.confirm(`Delete “${item.title}”?`)) return; try { await api.delete(`/workspace/${config.type}/${item.id}`); setItems((current) => current.filter((entry) => entry.id !== item.id)); } catch (requestError) { setError(getApiError(requestError, 'Could not delete this item.')); } }
  async function toggle(item) { try { const { data } = await api.post(`/workspace/${config.type}/${item.id}/toggle`, { completed: !item.completed }); setItems((current) => current.map((entry) => entry.id === item.id ? data.data.item : entry)); } catch (requestError) { setError(getApiError(requestError, 'Could not update this item.')); } }
  return <div className="animate-page space-y-7"><section className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{config.eyebrow}</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">{config.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{config.description}</p></div><button type="button" onClick={openNew} className="button-primary self-start md:self-auto"><Plus size={16} /> Add {config.singular}</button></section>{error && <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}<section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-line bg-panel p-5"><p className="text-xs uppercase tracking-[0.14em] text-muted">Total</p><p className="mt-3 font-display text-3xl font-semibold text-cream">{items.length}</p><p className="mt-1 text-xs text-muted">Tracked {config.singular}s</p></div><div className="rounded-2xl border border-line bg-panel p-5"><p className="text-xs uppercase tracking-[0.14em] text-muted">Complete</p><p className="mt-3 font-display text-3xl font-semibold text-moss">{completed}</p><p className="mt-1 text-xs text-muted">{progress}% of this list</p></div><div className="rounded-2xl border border-line bg-panel p-5"><p className="text-xs uppercase tracking-[0.14em] text-muted">Next action</p><p className="mt-3 font-display text-xl font-semibold text-cream">{items.length - completed || 'Clear'}</p><p className="mt-1 text-xs text-muted">Items still in motion</p></div></section><section className="flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input value={queryText} onChange={(event) => setQueryText(event.target.value)} className="field pl-10" placeholder={`Search ${config.singular}s…`} /></div><button type="button" onClick={load} className="button-secondary"><Archive size={15} /> Refresh</button></section>{loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((number) => <div className="skeleton h-64 rounded-2xl" key={number} />)}</div> : visibleItems.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleItems.map((item) => <ItemCard key={item.id} item={item} config={config} onEdit={openEdit} onDelete={remove} onToggle={toggle} />)}</div> : <EmptyState icon={Icon} title={`No ${config.singular}s yet`} description={queryText ? 'Try a different search.' : config.empty} actionLabel={queryText ? undefined : `Add ${config.singular}`} onAction={openNew} />} {modalOpen && <ItemModal config={config} form={form} editing={editing} saving={saving} onChange={(field, value) => setForm((current) => setValue(current, field, value))} onClose={() => setModalOpen(false)} onSubmit={submit} />}</div>;
}
