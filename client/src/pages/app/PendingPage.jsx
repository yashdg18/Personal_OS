import { useMemo } from 'react';
import ModulePage, { moduleConfigs } from './ModulePage';

export default function PendingPage() {
  const config = useMemo(() => ({ ...moduleConfigs.goal, title: 'See what still needs you.', description: 'A focused view of planned, active, and overdue goals. Choose one next move and make it visible.' }), []);
  return <ModulePage config={config} filterItems={(item) => item.status !== 'completed' && item.status !== 'cancelled'} />;
}
