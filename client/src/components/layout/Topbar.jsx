import { useState } from 'react';
import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDisplayName } from '../../utils/displayName';

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-line px-5 sm:px-8 lg:px-10">
      <button type="button" onClick={onMenu} className="rounded-lg p-2 text-muted hover:bg-panel hover:text-cream lg:hidden" aria-label="Open navigation"><Menu size={21} /></button>
      <div className="hidden items-center gap-2 text-sm text-muted sm:flex"><span className="h-2 w-2 rounded-full bg-moss" /> All systems calm</div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button type="button" className="hidden items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs text-muted transition hover:border-moss/50 hover:text-cream md:flex"><Search size={15} /> Search <span className="rounded border border-line px-1.5 py-0.5 text-[10px]">⌘ K</span></button>
        <div className="relative"><button type="button" onClick={() => setNotificationsOpen((current) => !current)} className="relative rounded-xl p-2 text-muted hover:bg-panel hover:text-cream" aria-label="Notifications" aria-expanded={notificationsOpen}><Bell size={18} /><span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${notifications.length ? 'bg-amber' : 'bg-muted/40'}`} /></button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-panel p-3 shadow-2xl"><div className="flex items-center justify-between px-2 pb-2"><p className="font-display text-lg font-semibold text-cream">Notifications</p><span className="text-[11px] text-muted">Today + missed</span></div>{notifications.length ? <div className="space-y-2">{notifications.map((notification) => <button type="button" key={notification.id} onClick={() => { setNotificationsOpen(false); window.location.assign(notification.target); }} className="block w-full rounded-xl border border-line bg-ink/50 p-3 text-left transition hover:border-moss/40">{notification.kind === 'missed' && <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose">Missed notification</p>}<p className="text-xs font-medium text-cream">{notification.title}</p><p className="mt-1 text-xs leading-5 text-muted">{notification.body}</p><p className="mt-2 text-[10px] uppercase tracking-wide text-moss">{notification.meta}</p></button>)}</div> : <p className="px-2 py-5 text-center text-xs text-muted">No notifications for today.</p>}</div>}</div>
        <div className="flex items-center gap-2 border-l border-line pl-3 sm:pl-4"><span className="hidden text-right sm:block"><span className="block text-xs font-medium text-cream">{formatDisplayName(user?.name)}</span><span className="block text-[11px] text-muted">Personal mode</span></span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss/15 text-xs font-semibold text-moss"><Sparkles size={15} /></span></div>
      </div>
    </header>
  );
}
