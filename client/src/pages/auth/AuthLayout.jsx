import { Outlet } from 'react-router-dom';
import { ArrowUpRight, Check, LockKeyhole, Sparkles, Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-ink text-cream lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-line lg:block">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-moss/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-amber/5 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-20">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss text-ink"><Zap size={20} fill="currentColor" /></span><span className="font-display text-xl font-semibold">personal<span className="text-moss">OS</span></span></div>
          <div className="max-w-xl"><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss/5 px-3 py-1.5 text-xs text-moss"><Sparkles size={13} /> A calmer operating system for your life</p><h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">Make room for the work that <span className="text-moss">matters.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-muted">One private space for your goals, daily momentum, career growth, and the things you want to remember.</p><div className="mt-10 grid max-w-md grid-cols-2 gap-3 text-sm"><div className="rounded-2xl border border-line bg-panel/70 p-4"><Check size={16} className="mb-7 text-moss" /><p className="text-muted">Plan with intention</p></div><div className="rounded-2xl border border-line bg-panel/70 p-4"><LockKeyhole size={16} className="mb-7 text-amber" /><p className="text-muted">Keep it private</p></div></div></div>
          <div className="flex items-center gap-2 text-xs text-muted">Built for one person, one life, and the next right step <ArrowUpRight size={13} /></div>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"><div className="w-full max-w-[430px]"><div className="mb-10 flex items-center gap-3 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-ink"><Zap size={18} fill="currentColor" /></span><span className="font-display text-lg font-semibold">personal<span className="text-moss">OS</span></span></div><Outlet /></div></section>
    </div>
  );
}

