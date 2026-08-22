import { useMemo } from 'react';
import ModulePage, { moduleConfigs } from './ModulePage';

const labels = {
  monthly: ['Shape the month ahead.', 'Choose a few outcomes worth carrying through the month.'],
  weekly: ['Turn intention into a week.', 'Keep the week focused enough to finish and flexible enough to live.'],
  daily: ['Make the day actionable.', 'Break the plan down into small actions you can actually complete.'],
};

export default function PlannerPage({ horizon }) {
  const config = useMemo(() => ({ ...moduleConfigs.plan, title: labels[horizon][0], description: labels[horizon][1] }), [horizon]);
  return <ModulePage config={config} filterItems={(item) => item.data?.planType === horizon || !item.data?.planType} />;
}
