import { useEffect, useMemo, useState } from 'react';
import { BellRing, CalendarDays, Clock3, Plus, Repeat2, Trash2 } from 'lucide-react';
import api, { getApiError } from '../../services/api';

const initialForm = { title: '', kind: 'Birthday', date: '', repeat: 'yearly', notes: '' };

function reminderDate(item) {
  return item?.data?.date || item?.endDate || '';
}

function formatDate(value) {
  const dateText = String(value || '').slice(0, 10);
  if (!dateText) return 'No date';
  const date = new Date(`${dateText}T12:00:00`);
  return Number.isNaN(date.getTime()) ? 'No date' : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadReminders() {
    setLoading(true);
    try {
      const { data } = await api.get('/workspace/reminder');
      setReminders(data.data.items || []);
      setError('');
    } catch (requestError) {
      setError(getApiError(requestError, 'Reminders could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReminders(); }, []);

  const sortedReminders = useMemo(() => [...reminders].sort((first, second) => String(reminderDate(first)).localeCompare(String(reminderDate(second)))), [reminders]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const payload = { title: form.title, description: form.notes, category: form.kind, status: 'planned', endDate: form.date, data: { kind: form.kind, date: form.date, repeat: form.repeat, notes: form.notes } };
      const { data } = await api.post('/workspace/reminder', payload);
      setReminders((current) => [data.data.item, ...current]);
      setForm(initialForm);
      setMessage('Reminder saved. It will appear in your morning notification when it is due.');
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not save this reminder.'));
    } finally {
      setSaving(false);
    }
  }

  async function removeReminder(item) {
    try {
      await api.delete(`/workspace/reminder/${item.id}`);
      setReminders((current) => current.filter((reminder) => reminder.id !== item.id));
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not remove this reminder.'));
    }
  }

  return <div className="animate-page space-y-7"><section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Personal · Reminders</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">Remember the moments that matter.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Save birthdays and important events. Due reminders are included in your morning notification.</p></div><div className="flex items-center gap-2 rounded-full border border-moss/20 bg-moss/5 px-3 py-2 text-xs text-moss"><BellRing size={14} /> Morning alerts</div></section>{(error || message) && <p className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose/20 bg-rose/10 text-rose' : 'border-moss/20 bg-moss/10 text-moss'}`}>{error || message}</p>}<section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><form onSubmit={submit} className="rounded-2xl border border-moss/20 bg-moss/5 p-6 shadow-glow"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-moss"><Plus size={18} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Add a reminder</h2><p className="mt-1 text-xs text-muted">The 6:00 AM setting in Notifications controls the morning alert time.</p></div></div><div className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-medium text-muted">What should Yash remember?</span><input required maxLength={180} value={form.title} onChange={(event) => updateForm('title', event.target.value)} className="field" placeholder="Mom’s birthday, exam form deadline…" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Reminder type</span><select value={form.kind} onChange={(event) => updateForm('kind', event.target.value)} className="field"><option>Birthday</option><option>Event</option><option>Appointment</option><option>Other</option></select></label><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Date</span><input required type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className="field" /></label></div><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Repeat</span><select value={form.repeat} onChange={(event) => updateForm('repeat', event.target.value)} className="field"><option value="yearly">Every year</option><option value="once">Once only</option></select></label><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Notes</span><textarea rows="4" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} className="field" placeholder="Add a helpful detail…" /></label></div><button disabled={saving} className="button-primary mt-6 w-full"><Plus size={16} /> {saving ? 'Saving…' : 'Save reminder'}</button></form><section className="rounded-2xl border border-line bg-panel p-6 shadow-glow"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Saved reminders</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Your important dates.</h2></div><span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{reminders.length}</span></div>{loading ? <div className="mt-6 space-y-3"><div className="skeleton h-20 rounded-xl" /><div className="skeleton h-20 rounded-xl" /></div> : sortedReminders.length ? <div className="mt-6 space-y-3">{sortedReminders.map((item) => <article key={item.id} className="rounded-xl border border-line bg-ink/50 p-4"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss/10 text-moss">{item.data?.kind === 'Birthday' ? <BellRing size={16} /> : <CalendarDays size={16} />}</span><div className="min-w-0"><h3 className="truncate text-sm font-medium text-cream">{item.title}</h3><p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted"><span>{item.data?.kind || item.category}</span><span>·</span><span className="flex items-center gap-1"><Clock3 size={12} /> {formatDate(reminderDate(item))}</span><span>·</span><span className="flex items-center gap-1"><Repeat2 size={12} /> {item.data?.repeat === 'yearly' ? 'Every year' : 'Once'}</span></p>{item.description && <p className="mt-2 text-xs leading-5 text-muted">{item.description}</p>}</div></div><button type="button" onClick={() => removeReminder(item)} className="rounded-lg p-2 text-muted transition hover:bg-rose/10 hover:text-rose" aria-label={`Remove ${item.title}`}><Trash2 size={15} /></button></div></article>)}</div> : <div className="mt-6 rounded-xl border border-dashed border-line p-8 text-center"><CalendarDays className="mx-auto text-muted" size={24} /><p className="mt-3 text-sm font-medium text-cream">No reminders yet</p><p className="mt-1 text-xs leading-5 text-muted">Add a birthday or event and it will appear here.</p></div>}</section></section></div>;
}
