import WorkspaceItem from '../models/WorkspaceItem.js';

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date) {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export async function getAnalyticsOverview(req, res) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 13);
  const [tasks, goals, focusSessions, skills, books] = await Promise.all([
    WorkspaceItem.find({ userId: req.user._id, type: 'task', taskDate: { $gte: start } }).lean(),
    WorkspaceItem.find({ userId: req.user._id, type: 'goal' }).lean(),
    WorkspaceItem.find({ userId: req.user._id, type: 'focus', createdAt: { $gte: start } }).lean(),
    WorkspaceItem.find({ userId: req.user._id, type: 'skill' }).lean(),
    WorkspaceItem.find({ userId: req.user._id, type: 'book' }).lean(),
  ]);
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = dayKey(date);
    const dayTasks = tasks.filter((task) => task.taskDate && dayKey(new Date(task.taskDate)) === key);
    return { date: key, label: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), total: dayTasks.length, completed: dayTasks.filter((task) => task.completed).length, percentage: dayTasks.length ? Math.round((dayTasks.filter((task) => task.completed).length / dayTasks.length) * 100) : 0 };
  });
  const focusMinutes = focusSessions.reduce((sum, item) => sum + Number(item.data?.minutes || item.estimatedMinutes || 0), 0);
  const goalCompletion = goals.length ? Math.round(goals.reduce((sum, goal) => sum + Math.min(100, Number(goal.currentProgress || 0)), 0) / goals.length) : 0;
  const skillProgress = skills.length ? Math.round(skills.reduce((sum, skill) => sum + Number(skill.data?.proficiency || skill.currentProgress || 0), 0) / skills.length) : 0;
  const bookProgress = books.length ? Math.round(books.reduce((sum, book) => sum + Number(book.data?.progress || book.currentProgress || 0), 0) / books.length) : 0;
  res.json({ success: true, data: { daily, summary: { goalCompletion, focusMinutes, focusHours: Math.round((focusMinutes / 60) * 10) / 10, skillProgress, bookProgress, tasks: tasks.length, completedTasks: tasks.filter((task) => task.completed).length }, breakdown: { goals: goals.length, skills: skills.length, books: books.length, focusSessions: focusSessions.length } } });
}
