import { useState } from 'react';
import { ArrowRight, BellRing, CircleUserRound, Fingerprint, LogOut, LockKeyhole, Save, Send, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppAccess } from '../../context/AppAccessContext';
import { useNotifications } from '../../context/NotificationContext';
import api, { getApiError as getRequestError } from '../../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { registerBiometric, biometricSupported, passkeyConfigured, getApiError } = useAppAccess();
  const { supported: notificationsSupported, permission, preferences, updatePreferences, enableNotifications, sendTestNotification } = useNotifications();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [biometricSaving, setBiometricSaving] = useState(false);

  async function changePassword(event) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try { await api.patch('/auth/password', { currentPassword, newPassword }); setMessage('Password updated.'); setCurrentPassword(''); setNewPassword(''); }
    catch (requestError) { setError(getRequestError(requestError, 'Could not update your password.')); }
    finally { setSaving(false); }
  }

  async function saveTimezone(event) {
    event.preventDefault(); setMessage(''); setError('');
    try { await api.patch('/users/me', { timezone }); setMessage('Workspace preferences saved.'); }
    catch (requestError) { setError(getRequestError(requestError, 'Could not save preferences.')); }
  }

  async function registerDevice() {
    setBiometricSaving(true); setMessage(''); setError('');
    try { await registerBiometric(); setMessage('Biometric unlock is ready on this device.'); }
    catch (requestError) { setError(getApiError(requestError, 'Could not set up biometric unlock.')); }
    finally { setBiometricSaving(false); }
  }

  async function allowNotifications() {
    setMessage(''); setError('');
    try {
      const result = await enableNotifications();
      if (result === 'granted') setMessage('Goal notifications are enabled.');
      else if (result === 'denied') setError('Notifications are blocked. Allow them in your browser site settings.');
      else setError('This browser does not support website notifications.');
    } catch (requestError) { setError(getRequestError(requestError, 'Could not enable notifications.')); }
  }

   async function sendTest() {
    setMessage(''); setError('');
    const result = await sendTestNotification();
    if (result.ok) setMessage('Test notification sent.');
    else setError(`Notification failed: ${result.reason}`);
  }
  return <div className="animate-page space-y-7">
    <section><p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Settings</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">Tune your workspace.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Small controls that keep the rest of your Personal OS dependable.</p></section>
    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-moss/20 bg-moss/5 p-6 shadow-glow sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-moss"><CircleUserRound size={18} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Your profile</h2><p className="mt-1 text-sm text-muted">{user?.name || 'Yash'} · {user?.email}</p><p className="mt-1 text-xs text-muted">Add or update your personal details and profile photo.</p></div></div><Link to="/profile" className="button-secondary self-start sm:self-auto">Edit profile <ArrowRight size={16} /></Link></section>
    {(message || error) && <p className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose/20 bg-rose/10 text-rose' : 'border-moss/20 bg-moss/10 text-moss'}`}>{error || message}</p>}
    <section className="grid gap-5 xl:grid-cols-2">
      <form onSubmit={saveTimezone} className="rounded-2xl border border-line bg-panel p-6 shadow-glow"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-moss"><Save size={17} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Workspace preferences</h2><p className="mt-1 text-xs text-muted">Used for dates and future reminders.</p></div></div><label className="mt-7 block"><span className="mb-2 block text-xs font-medium text-muted">Timezone</span><select className="field" value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Singapore</option></select></label><button className="button-primary mt-5"><Save size={16} /> Save preferences</button></form>
      <form onSubmit={changePassword} className="rounded-2xl border border-line bg-panel p-6 shadow-glow"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-amber"><LockKeyhole size={17} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Change password</h2><p className="mt-1 text-xs text-muted">Your password is hashed before it is stored.</p></div></div><div className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Current password</span><input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="field" /></label><label className="block"><span className="mb-2 block text-xs font-medium text-muted">New password</span><input required minLength="8" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="field" /></label></div><button disabled={saving} className="button-primary mt-5"><ShieldCheck size={16} /> {saving ? 'Updating…' : 'Update password'}</button></form>
    </section>
    <NotificationSettings supported={notificationsSupported} permission={permission} preferences={preferences} onEnable={allowNotifications} onChange={updatePreferences} onTest={sendTest} />
    <section className="rounded-2xl border border-moss/20 bg-moss/5 p-6 shadow-glow"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-moss"><Fingerprint size={18} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Biometric app unlock</h2><p className="mt-1 max-w-xl text-sm leading-6 text-muted">Use fingerprint, Face ID, Windows Hello, or your device passkey at the private start screen. Your biometric data stays on your device.</p></div></div>{biometricSupported ? <button type="button" disabled={biometricSaving} onClick={registerDevice} className="button-primary shrink-0"><Fingerprint size={16} />{biometricSaving ? 'Setting up…' : passkeyConfigured ? 'Register another device' : 'Set up device unlock'}</button> : <span className="text-sm text-muted">Not available in this browser</span>}</div></section>
    <section className="rounded-2xl border border-rose/20 bg-rose/5 p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-xl font-semibold text-cream">Sign out of this workspace</h2><p className="mt-1 text-sm text-muted">You can return any time with {user?.email}.</p></div><button type="button" onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose/30 px-4 py-3 text-sm font-medium text-rose transition hover:bg-rose/10"><LogOut size={16} /> Sign out</button></div></section>
  </div>;
}

function NotificationSettings({ supported, permission, preferences, onEnable, onChange, onTest }) {
  const enabled = permission === 'granted' && preferences.enabled;
  return <section className="rounded-2xl border border-amber/20 bg-amber/5 p-6 shadow-glow"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-amber"><BellRing size={18} /></span><div><h2 className="font-display text-xl font-semibold text-cream">Goal notifications</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Receive the day’s quote at 6:00 AM with a prompt to fill today’s goals, plus reminders when unfinished goals are still waiting. Clicking one opens the Today goal form.</p></div></div><span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${enabled ? 'border-moss/30 bg-moss/10 text-moss' : 'border-line text-muted'}`}>{!supported ? 'Not supported' : permission === 'denied' ? 'Blocked in browser' : enabled ? 'Enabled' : 'Not enabled'}</span></div>{!supported ? <p className="mt-5 text-sm text-muted">Use a browser that supports website notifications.</p> : permission !== 'granted' ? <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="button" onClick={onEnable} className="button-primary"><BellRing size={16} /> Allow notifications</button><p className="text-xs leading-5 text-muted">Your browser will ask for permission.</p></div> : <div className="mt-6 grid gap-4 lg:grid-cols-2"><label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-ink/40 px-4 py-3"><span><span className="block text-sm font-medium text-cream">Morning quote + goals</span><span className="mt-1 block text-xs text-muted">Send the day’s quote and ask you to fill today’s goals</span></span><span className="flex items-center gap-3"><input type="time" value={preferences.dailyPromptTime} onChange={(event) => onChange({ dailyPromptTime: event.target.value })} className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-cream" /><input type="checkbox" checked={preferences.dailyPromptEnabled} onChange={(event) => onChange({ dailyPromptEnabled: event.target.checked })} className="h-4 w-4 accent-[#9ed44b]" /></span></label><label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-ink/40 px-4 py-3"><span><span className="block text-sm font-medium text-cream">Open-goal reminder</span><span className="mt-1 block text-xs text-muted">Remind you about unfinished goals</span></span><span className="flex items-center gap-3"><input type="time" value={preferences.goalReminderTime} onChange={(event) => onChange({ goalReminderTime: event.target.value })} className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-cream" /><input type="checkbox" checked={preferences.goalReminderEnabled} onChange={(event) => onChange({ goalReminderEnabled: event.target.checked })} className="h-4 w-4 accent-[#9ed44b]" /></span></label><div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-2"><button type="button" onClick={() => onChange({ enabled: !enabled })} className="button-secondary">{enabled ? 'Pause notifications' : 'Resume notifications'}</button><button type="button" onClick={onTest} className="button-secondary"><Send size={15} /> Send test</button><p className="text-xs leading-5 text-muted">Notifications run while this website is open in the browser.</p></div></div>}</section>;
}
