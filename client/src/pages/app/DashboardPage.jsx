import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, BriefcaseBusiness, CalendarClock, Check, CheckCircle2,
  Flame, Goal, ListChecks, Plus, Quote as QuoteIcon, RefreshCw, Sparkles, Target, Timer,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { formatDisplayName } from '../../utils/displayName';
import { getQuoteOfDay } from '../../data/dailyQuotes';
import api, { getApiError } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import StatCard from '../../components/ui/StatCard';

function getDateLabel(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDeadline(dateString) {
  if (!dateString) return 'No date';
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(dateString));
}

function priorityClass(priority) {
  return priority === 'critical' || priority === 'high' ? 'text-rose' : priority === 'medium' ? 'text-amber' : 'text-muted';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
  const dailyQuote = getQuoteOfDay(today);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/dashboard/overview', { params: { date: today.toISOString().slice(0, 10) } })
      .then(({ data }) => { if (active) setOverview(data.data); })
      .catch((requestError) => { if (active) setError(getApiError(requestError, 'Dashboard data could not be loaded.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [today]);

  if (loading) {
    return <div className="space-y-7"><div className="skeleton h-8 w-56" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="skeleton h-40 rounded-2xl" />)}</div><div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><div className="skeleton h-80 rounded-2xl" /><div className="skeleton h-80 rounded-2xl" /></div></div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-rose/30 bg-rose/10 p-6"><p className="font-medium text-rose">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 text-sm text-cream hover:text-moss"><RefreshCw size={15} /> Try again</button></div>;
  }

  const summary = {
    tasksTotal: 0,
    tasksCompleted: 0,
    taskCompletionPercentage: 0,
    goalProgressPercentage: 0,
    activeGoalsCount: 0,
    totalGoalsCount: 0,
    overdueGoalsCount: 0,
    currentStreak: 0,
    focusMinutesToday: 0,
    ...overview.summary,
  };
  const tasks = overview.tasks || [];
  const goals = overview.goals || [];
  const upcomingDeadlines = overview.upcomingDeadlines || [];
  const weeklyActivity = overview.weeklyActivity || [];
  const modules = {
    career: { available: false },
    exams: { available: false },
    skills: { available: false },
    books: { available: false },
    ...overview.modules,
  };
  const firstName = formatDisplayName(user?.name).split(' ')[0] || 'there';
  const tasksRemaining = Math.max(0, summary.tasksTotal - summary.tasksCompleted);

  return <div className="animate-page space-y-7">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{getDateLabel(today)}</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">{getGreeting(today.getHours())}, {firstName}.</h1><p className="mt-3 text-sm leading-6 text-muted">A clear view of what matters today.</p></div><button type="button" onClick={() => navigate('/today')} className="button-secondary self-start sm:self-auto"><Plus size={16} /> Add something</button></section>

    <section className="rounded-2xl border border-moss/20 bg-moss/5 p-5 shadow-glow sm:p-6"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-moss"><QuoteIcon size={17} /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Quote of the day</p><p className="mt-3 max-w-4xl font-display text-base leading-7 tracking-[-0.01em] text-cream sm:text-lg">“{dailyQuote.text}”</p></div></div></section>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Today’s progress" value={`${summary.taskCompletionPercentage}%`} detail={`${summary.tasksCompleted}/${summary.tasksTotal} tasks complete`} icon={CheckCircle2} onClick={() => navigate('/today')} />
      <StatCard label="Goal progress" value={`${summary.goalProgressPercentage}%`} detail={`${summary.activeGoalsCount} active goals`} icon={Target} accent="amber" onClick={() => navigate('/goals')} />
      <StatCard label="Focus time" value={`${Math.floor(summary.focusMinutesToday / 60)}h ${summary.focusMinutesToday % 60}m`} detail="No focus sessions yet" icon={Timer} onClick={() => navigate('/focus')} />
      <StatCard label="Current streak" value={`${summary.currentStreak} days`} detail="Based on completed day history" icon={Flame} accent="rose" onClick={() => navigate('/today')} />
      <StatCard label="Active goals" value={summary.activeGoalsCount} detail={`${summary.totalGoalsCount} tracked goals`} icon={Goal} onClick={() => navigate('/goals')} />
      <StatCard label="Overdue goals" value={summary.overdueGoalsCount} detail={summary.overdueGoalsCount ? 'Needs your attention' : 'Nothing overdue'} icon={AlertTriangle} accent="rose" onClick={() => navigate('/goals/pending')} />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><div className="rounded-2xl border border-line bg-panel p-5 shadow-glow sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Weekly rhythm</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Consistency compounds.</h2></div><span className="rounded-lg bg-moss/10 p-2 text-moss"><Activity size={17} /></span></div><div className="mt-8 h-52"><ResponsiveContainer width="100%" height="100%"><LineChart data={weeklyActivity} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}><CartesianGrid vertical={false} stroke="rgba(115,129,120,0.16)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#738178', fontSize: 11 }} /><YAxis hide domain={[0, 100]} /><Tooltip cursor={{ stroke: 'rgba(158,212,75,0.25)', strokeWidth: 1 }} contentStyle={{ background: '#18231d', border: '1px solid #26352c', borderRadius: 12, color: '#f4f4e9', fontSize: 12 }} formatter={(value) => [`${value}%`, 'Completed']} /><Line type="monotone" dataKey="percentage" stroke="#9ed44b" strokeWidth={3} dot={{ r: 4, fill: '#9ed44b', stroke: '#0e1511', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#c4f477', stroke: '#0e1511', strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div><div className="mt-1 flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 rounded-full bg-moss" /> Daily completion based on tasks you’ve logged</div></div><div className="rounded-2xl border border-line bg-panel p-5 shadow-glow sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Today’s goals</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Make the next move.</h2></div><Goal size={18} className="text-amber" /></div><div className="mt-7 space-y-5"><div><div className="mb-2 flex justify-between text-xs"><span className="text-muted">Daily completion</span><span className="text-cream">{summary.taskCompletionPercentage}%</span></div><ProgressBar value={summary.taskCompletionPercentage} /><p className="mt-2 text-xs text-muted">{tasksRemaining ? `${tasksRemaining} task(s) left to finish today.` : 'Everything planned for today is complete.'}</p></div><div><div className="mb-2 flex justify-between text-xs"><span className="text-muted">Active goals</span><span className="text-cream">{summary.goalProgressPercentage}%</span></div><ProgressBar value={summary.goalProgressPercentage} tone="amber" /></div></div><button type="button" onClick={() => navigate('/today')} className="mt-8 flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-sm text-muted transition hover:border-moss/40 hover:text-cream">Open Today <ArrowRight size={16} /></button></div></section>

    <section className="rounded-2xl border border-line bg-panel p-5 shadow-glow sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Upcoming deadlines</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Keep the important dates close.</h2></div><CalendarClock size={18} className="text-amber" /></div>{summary.overdueGoalsCount > 0 && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose/20 bg-rose/10 px-3 py-2.5 text-xs text-rose"><AlertTriangle size={14} /> {summary.overdueGoalsCount} goal(s) are overdue and need a review.</div>}{upcomingDeadlines.length ? <div>{upcomingDeadlines.map((deadline) => <div key={deadline.id} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-cream">{deadline.title}</p><p className="mt-1 text-xs text-muted">{deadline.category} · <span className={priorityClass(deadline.priority)}>{deadline.priority} priority</span></p></div><span className="shrink-0 text-xs text-muted">{formatDeadline(deadline.endDate)}</span></div>)}</div> : <EmptyState icon={CalendarClock} title="No upcoming deadlines" description="Add dated goals to keep important commitments visible." actionLabel="Open Goals" onAction={() => navigate('/goals')} />}</section>

    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="rounded-2xl border border-line bg-panel p-5 shadow-glow sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Task queue</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">On your plate</h2></div><button type="button" onClick={() => navigate('/today')} className="text-xs font-medium text-moss hover:text-cream">View all <ArrowRight className="ml-1 inline" size={13} /></button></div>{tasks.length ? <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-xl bg-ink/50 px-3 py-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${task.completed ? 'border-moss/40 bg-moss/10 text-moss' : 'border-line text-muted'}`}>{task.completed ? <Check size={14} /> : <ListChecks size={14} />}</span><div className="min-w-0 flex-1"><p className={`truncate text-sm ${task.completed ? 'text-muted line-through' : 'text-cream'}`}>{task.title}</p><p className="mt-0.5 text-[11px] text-muted">{task.category} · {task.estimatedMinutes} min</p></div><span className={`text-[10px] font-medium uppercase tracking-wide ${priorityClass(task.priority)}`}>{task.priority}</span></div>)}</div> : <EmptyState icon={ListChecks} title="Your task queue is clear" description="Add a few actionable tasks to make today visible." actionLabel="Open Today" onAction={() => navigate('/today')} />}</div><div className="rounded-2xl border border-line bg-panel p-5 shadow-glow sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Active goals</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Long game</h2></div><Target size={18} className="text-moss" /></div>{goals.length ? <div className="space-y-4">{goals.slice(0, 4).map((goal) => <div key={goal.id}><div className="mb-2 flex items-center justify-between gap-3"><p className="truncate text-sm text-cream">{goal.title}</p><span className="shrink-0 text-xs text-muted">{goal.progressPercentage}%</span></div><ProgressBar value={goal.progressPercentage} /></div>)}</div> : <EmptyState icon={Target} title="No active goals yet" description="Give the season a direction with your first goal." actionLabel="Open Goals" onAction={() => navigate('/goals')} />}</div></section>

    <section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your operating system</p><h2 className="mt-2 font-display text-xl font-semibold text-cream">Keep the bigger picture close.</h2></div><span className="hidden text-xs text-muted sm:block">More modules unlock as you build</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ModuleCard icon={BriefcaseBusiness} label="Career" detail="Goals, projects & applications" available={modules.career.available} onClick={() => navigate('/career')} /><ModuleCard icon={BookOpen} label="Exams" detail="Subjects & study progress" available={modules.exams.available} onClick={() => navigate('/career/exams')} /><ModuleCard icon={Sparkles} label="Skills" detail="Practice what compounds" available={modules.skills.available} onClick={() => navigate('/career/skills')} /><ModuleCard icon={BookOpen} label="Books" detail="Reading, notes & ideas" available={modules.books.available} onClick={() => navigate('/books')} /></div></section>
  </div>;
}

function ModuleCard({ icon: Icon, label, detail, available, onClick }) {
  return <button type="button" onClick={onClick} className="group flex items-center gap-3 rounded-2xl border border-line bg-panel p-4 text-left transition hover:-translate-y-0.5 hover:border-moss/40"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-muted transition group-hover:text-moss"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-cream">{label}</span><span className="mt-1 block truncate text-xs text-muted">{detail}</span></span><ArrowRight size={15} className="text-muted transition group-hover:text-moss" /></button>;
}
