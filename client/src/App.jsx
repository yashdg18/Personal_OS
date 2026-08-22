import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/ui/LoadingScreen';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ModulePage, { moduleConfigs } from './pages/app/ModulePage';
import { AppAccessProvider, useAppAccess } from './context/AppAccessContext';
import PrivacyGate from './components/auth/PrivacyGate';
import { NotificationProvider } from './context/NotificationContext';

const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const TodayPage = lazy(() => import('./pages/app/TodayPage'));
const ProgressTrackerPage = lazy(() => import('./pages/app/ProgressTrackerPage'));
const PendingPage = lazy(() => import('./pages/app/PendingPage'));
const PlannerPage = lazy(() => import('./pages/app/PlannerPage'));
const FuturePlanPage = lazy(() => import('./pages/app/FuturePlanPage'));
const FocusPage = lazy(() => import('./pages/app/FocusPage'));
const AnalyticsPage = lazy(() => import('./pages/app/AnalyticsPage'));
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));
const VaultPage = lazy(() => import('./pages/app/VaultPage'));
const MusicPage = lazy(() => import('./pages/app/MusicPage'));
const RemindersPage = lazy(() => import('./pages/app/RemindersPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute() { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <LoadingScreen />; return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />; }
function GuestRoute() { const { user, loading } = useAuth(); if (loading) return <LoadingScreen />; return user ? <Navigate to="/dashboard" replace /> : <Outlet />; }

function Module({ type, ...props }) { return <ModulePage config={moduleConfigs[type]} {...props} />; }
function LazyRoute({ component: Component, ...props }) { return <Suspense fallback={<LoadingScreen />}><Component {...props} /></Suspense>; }

function AppRoutes() {
  return <Routes>
    <Route element={<GuestRoute />}><Route element={<AuthLayout />}><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /></Route></Route>
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<LazyRoute component={DashboardPage} />} />
      <Route path="/goals" element={<Module type="goal" />} />
      <Route path="/goals/pending" element={<LazyRoute component={PendingPage} />} />
      <Route path="/goals/custom" element={<LazyRoute component={ProgressTrackerPage} initialMode="custom" />} />
      <Route path="/today" element={<LazyRoute component={TodayPage} />} />
      <Route path="/planner/monthly" element={<LazyRoute component={ProgressTrackerPage} />} />
      <Route path="/planner/weekly" element={<LazyRoute component={PlannerPage} horizon="weekly" />} />
      <Route path="/planner/daily" element={<LazyRoute component={PlannerPage} horizon="daily" />} />
      <Route path="/planner/future" element={<LazyRoute component={FuturePlanPage} />} />
      <Route path="/career" element={<Module type="careerGoal" />} />
      <Route path="/career/projects" element={<Module type="careerProject" />} />
      <Route path="/career/applications" element={<Module type="application" />} />
      <Route path="/career/skills" element={<Module type="skill" />} />
      <Route path="/career/future-skills" element={<Module type="futureSkill" />} />
      <Route path="/career/exams" element={<Module type="exam" />} />
      <Route path="/focus" element={<LazyRoute component={FocusPage} />} />
      <Route path="/analytics" element={<LazyRoute component={AnalyticsPage} />} />
      <Route path="/books" element={<Module type="book" />} />
      <Route path="/notes" element={<Module type="note" />} />
      <Route path="/meditation" element={<LazyRoute component={MusicPage} />} />
      <Route path="/music" element={<Navigate to="/meditation" replace />} />
      <Route path="/reminders" element={<LazyRoute component={RemindersPage} />} />
      <Route path="/knowledge" element={<Navigate to="/books" replace />} />
      <Route path="/gallery" element={<Module type="gallery" />} />
      <Route path="/vault" element={<LazyRoute component={VaultPage} />} />
      <Route path="/documents" element={<Module type="document" />} />
      <Route path="/profile" element={<LazyRoute component={ProfilePage} />} />
      <Route path="/settings" element={<LazyRoute component={SettingsPage} />} />
    </Route></Route>
    <Route path="*" element={<LazyRoute component={NotFoundPage} />} />
  </Routes>;
}

function AppAccessBoundary() {
  const { loading, unlocked } = useAppAccess();
  if (loading) return <PrivacyGate />;
  return unlocked ? <NotificationProvider><AppRoutes /></NotificationProvider> : <PrivacyGate />;
}

export default function App() {
  return <AppAccessProvider><AuthProvider><AppAccessBoundary /></AuthProvider></AppAccessProvider>;
}
