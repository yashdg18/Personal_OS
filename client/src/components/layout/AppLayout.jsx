import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="h-screen overflow-hidden bg-ink text-cream">
      <div className="flex h-full min-h-0">
        <Sidebar user={user} open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><Outlet /></div></main>
        </div>
      </div>
    </div>
  );
}
