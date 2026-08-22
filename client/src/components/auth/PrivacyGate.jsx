import { useState } from 'react';
import { ArrowRight, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useAppAccess } from '../../context/AppAccessContext';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning, Yash.';
  if (hour >= 12 && hour < 17) return 'Good afternoon, Yash.';
  if (hour >= 17 && hour < 21) return 'Good evening, Yash.';
  return 'Good night, Yash.';
}

export default function PrivacyGate() {
  const { unlockWithPassword, unlockWithBiometric, biometricSupported, passkeyConfigured, getApiError } = useAppAccess();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [biometricSubmitting, setBiometricSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await unlockWithPassword(password);
      setPassword('');
    } catch (requestError) {
      setError(getApiError(requestError, 'The private passcode could not be verified.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function useBiometric() {
    setError('');
    setBiometricSubmitting(true);
    try {
      await unlockWithBiometric();
    } catch (requestError) {
      setError(getApiError(requestError, 'Biometric unlock was cancelled or could not be verified.'));
    } finally {
      setBiometricSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-10 text-cream sm:px-8">
      <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-moss/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber/5 blur-3xl" />
      <section className="relative w-full max-w-[460px] animate-page">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-moss text-ink shadow-[0_0_28px_rgba(158,212,75,0.22)]"><Zap size={21} fill="currentColor" /></span>
          <span className="font-display text-xl font-semibold">personal<span className="text-moss">OS</span></span>
        </div>
        <div className="rounded-[2rem] border border-line bg-panel/95 p-6 shadow-glow backdrop-blur sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss/5 px-3 py-1.5 text-xs font-medium text-moss"><Sparkles size={13} /> Private workspace</p>
              <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{getTimeGreeting()}</h1>
              <p className="mt-3 max-w-sm font-display text-base leading-7 tracking-[-0.01em] text-muted">Welcome to your own private world. Enter your passcode to continue.</p>
            </div>
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-moss sm:flex"><LockKeyhole size={19} /></span>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block"><span className="mb-2 block text-xs font-medium text-muted">Private passcode</span><input autoFocus required type="password" inputMode="text" value={password} onChange={(event) => setPassword(event.target.value)} className="field" placeholder="Enter your passcode" /></label>
            {error && <p role="alert" className="rounded-xl border border-rose/20 bg-rose/10 px-3 py-2.5 text-sm leading-5 text-rose">{error}</p>}
            <button disabled={submitting || biometricSubmitting} className="button-primary w-full">{submitting ? 'Checking passcode…' : 'Open my personal OS'}<ArrowRight size={16} /></button>
          </form>

          {biometricSupported && passkeyConfigured && <>
            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
            <button type="button" disabled={submitting || biometricSubmitting} onClick={useBiometric} className="button-secondary w-full"><Fingerprint size={17} />{biometricSubmitting ? 'Waiting for device verification…' : 'Unlock with fingerprint / device'}</button>
          </>}

          <div className="mt-7 flex gap-3 rounded-2xl border border-line bg-ink/50 p-4"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-moss" /><p className="text-xs leading-5 text-muted">This application OS is private and intended only for Yash. Please do not open or use it without authorization.</p></div>
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-muted">One private space for your goals, momentum, and next right step.</p>
      </section>
    </main>
  );
}
