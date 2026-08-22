import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login(form); navigate(location.state?.from?.pathname || '/dashboard', { replace: true }); }
    catch (submitError) { setError(getApiError(submitError, 'We could not sign you in.')); }
    finally { setSubmitting(false); }
  }

  return <div><p className="text-sm font-medium text-moss">Welcome back</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Return to your rhythm.</h1><p className="mt-3 text-sm leading-6 text-muted">Sign in to pick up where you left off.</p><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Email address</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field" placeholder="you@example.com" /></label><label className="block"><span className="mb-2 block text-xs font-medium text-muted">Password</span><span className="relative block"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field pr-11" placeholder="Your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>{error && <p className="rounded-xl border border-rose/20 bg-rose/10 px-3 py-2.5 text-sm text-rose">{error}</p>}<button disabled={submitting} className="button-primary w-full">{submitting ? 'Signing in…' : 'Sign in'}<ArrowRight size={16} /></button></form><p className="mt-7 text-center text-sm text-muted">New here? <Link to="/register" className="font-medium text-moss hover:text-cream">Create your workspace</Link></p></div>;
}

