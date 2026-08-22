import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, BriefcaseBusiness, CalendarDays, ChevronDown, CircleUserRound,
  FileText, GalleryHorizontalEnd, Goal, LayoutDashboard, LockKeyhole, PanelsTopLeft, Settings,
  BellRing, Music2, Timer, X, Zap,
} from 'lucide-react';
import { formatDisplayName } from '../../utils/displayName';
import { useAppAccess } from '../../context/AppAccessContext';

const groups = [
  {
    label: 'Workspace',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }],
    sections: [
      { label: 'Goals', icon: Goal, children: [{ label: "Today's Goals", to: '/today' }, { label: 'All Goals', to: '/goals' }, { label: 'Pending Goals', to: '/goals/pending' }, { label: 'Custom Goal Progress', to: '/goals/custom' }] },
      { label: 'Planner', icon: CalendarDays, children: [{ label: 'Monthly Plan', to: '/planner/monthly' }, { label: 'Weekly Plan', to: '/planner/weekly' }, { label: 'Daily Plan', to: '/planner/daily' }, { label: 'Future Plan', to: '/planner/future' }] },
    ],
  },
  {
    label: 'Growth',
    sections: [
      { label: 'Career', icon: BriefcaseBusiness, children: [{ label: 'Career Goals', to: '/career' }, { label: 'Projects', to: '/career/projects' }, { label: 'Applications', to: '/career/applications' }, { label: 'Current Skills', to: '/career/skills' }, { label: 'Future Skills', to: '/career/future-skills' }, { label: 'Exams', to: '/career/exams' }] },
    ],
  },
  {
    label: 'Personal',
    sections: [
      { label: 'Focus', icon: Timer, children: [{ label: 'Focus Mode', to: '/focus' }, { label: 'Focus Analytics', to: '/analytics' }] },
      { label: 'Reminders', icon: BellRing, children: [{ label: 'Manage reminders', to: '/reminders' }] },
    ],
    items: [{ label: 'Books', to: '/books', icon: BookOpen }, { label: 'Notes', to: '/notes', icon: FileText }, { label: 'Gallery', to: '/gallery', icon: GalleryHorizontalEnd }, { label: 'Meditation', to: '/meditation', icon: Music2 }],
  },
  { label: 'Private', items: [{ label: 'Secret Vault', to: '/vault', icon: LockKeyhole }, { label: 'Documents', to: '/documents', icon: FileText }, { label: 'Profile', to: '/profile', icon: CircleUserRound }] },
];

export default function Sidebar({ user, open, onClose }) {
  const navigate = useNavigate();
  const { lockApp } = useAppAccess();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState({ Reminders: true });

  function toggleSection(label) {
    setExpanded((current) => ({ ...current, [label]: !current[label] }));
  }

  async function closePrivateWorkspace() {
    onClose?.();
    await lockApp();
    navigate('/', { replace: true });
  }

  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-ink/70 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-full w-[258px] min-h-0 flex-col overflow-y-auto border-r border-line bg-[#0e1511] px-4 py-5 scrollbar-none transition-transform duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-[82px]' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2`}>
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-ink"><Zap size={19} fill="currentColor" /></span>
            {!collapsed && <span className="font-display text-lg font-semibold tracking-tight text-cream">personal<span className="text-moss">OS</span></span>}
          </NavLink>
          {!collapsed && <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:text-cream lg:hidden"><X size={18} /></button>}
        </div>

        <div className="mt-9 space-y-4 overflow-visible">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">{group.label}</p>}
              <div className="space-y-1">
                {group.items?.map(({ label, to, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-moss/10 font-medium text-moss' : 'text-muted hover:bg-panel hover:text-cream'} ${collapsed ? 'justify-center' : ''}`}>
                    <Icon size={17} strokeWidth={1.8} />
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && label === 'Secret vault' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose" />}
                  </NavLink>
                ))}
                {group.sections?.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <div key={section.label}>
                      <button type="button" onClick={() => toggleSection(section.label)} title={collapsed ? section.label : undefined} aria-expanded={!collapsed && expanded[section.label]} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-panel hover:text-cream ${collapsed ? 'justify-center' : ''}`}>
                        <SectionIcon size={17} strokeWidth={1.8} />
                        {!collapsed && <><span className="flex-1 text-left">{section.label}</span><ChevronDown size={14} className={`transition-transform ${expanded[section.label] ? '' : '-rotate-90'}`} /></>}
                      </button>
                      {!collapsed && expanded[section.label] && <div className="ml-4 space-y-1 border-l border-line pl-3">{section.children.map((child) => <NavLink key={child.to} to={child.to} onClick={onClose} className={({ isActive }) => `block rounded-lg px-3 py-2 text-xs transition ${isActive ? 'bg-moss/10 font-medium text-moss' : 'text-muted hover:bg-panel hover:text-cream'}`}>{child.label}</NavLink>)}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-5 border-t border-line pt-4 ${collapsed ? 'flex justify-center' : ''}`}>
          <NavLink to="/settings" onClick={onClose} title={collapsed ? 'Settings' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-panel hover:text-cream ${collapsed ? 'justify-center' : ''}`}>
            <Settings size={17} strokeWidth={1.8} />{!collapsed && 'Settings'}
          </NavLink>
          {!collapsed && <div className="mt-4 flex items-center gap-3 rounded-xl bg-panel/70 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/20 text-xs font-semibold text-amber">{formatDisplayName(user?.name).slice(0, 1)}</span><div className="min-w-0"><p className="truncate text-xs font-medium text-cream">{formatDisplayName(user?.name)}</p><p className="truncate text-[11px] text-muted">Private workspace</p><button type="button" onClick={closePrivateWorkspace} className="mt-1 inline-flex items-center gap-1 text-[10px] leading-4 text-muted/70 transition hover:text-rose"><LockKeyhole size={10} /> Close private workspace</button></div></div>}
        </div>
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="absolute -right-3 top-24 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-panel text-muted lg:flex hover:text-cream" aria-label="Toggle sidebar width">
          {collapsed ? <PanelsTopLeft size={12} /> : <ChevronDown size={13} className="rotate-90" />}
        </button>
      </aside>
    </>
  );
}
