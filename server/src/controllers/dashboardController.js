import WorkspaceItem from '../models/WorkspaceItem.js';

function dayBounds(dateString) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString || '') ? dateString : new Date().toISOString().slice(0, 10);
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  return { date, start, end };
}

function progressPercentage(current, target = 100) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Number(current || 0) / Number(target)) * 100));
}

async function getWeeklyActivity(userId, endDate) {
  return Promise.all(Array.from({ length: 7 }, (_, index) => {
    const end = new Date(endDate);
    end.setUTCDate(end.getUTCDate() - (6 - index));
    const start = new Date(end);
    start.setUTCHours(0, 0, 0, 0);
    const finish = new Date(start);
    finish.setUTCHours(23, 59, 59, 999);
    return WorkspaceItem.countDocuments({ userId, type: 'task', taskDate: { $gte: start, $lte: finish } }).then(async (total) => {
      const completed = await WorkspaceItem.countDocuments({ userId, type: 'task', taskDate: { $gte: start, $lte: finish }, completed: true });
      return { date: start.toISOString().slice(0, 10), label: start.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
    });
  }));
}

async function getCurrentStreak(userId, endDate) {
  const cursor = new Date(endDate);
  cursor.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  for (let index = 0; index <= 30; index += 1) {
    const start = new Date(cursor);
    const finish = new Date(cursor);
    finish.setUTCHours(23, 59, 59, 999);
    const total = await WorkspaceItem.countDocuments({ userId, type: 'task', taskDate: { $gte: start, $lte: finish } });
    const completed = await WorkspaceItem.countDocuments({ userId, type: 'task', taskDate: { $gte: start, $lte: finish }, completed: true });
    if (!total || completed < total) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function mapTask(task) {
  return { id: task._id.toString(), title: task.title, category: task.category, priority: task.priority, estimatedMinutes: task.estimatedMinutes, completed: task.completed };
}

function mapGoal(goal) {
  return { id: goal._id.toString(), title: goal.title, category: goal.category, priority: goal.priority, endDate: goal.endDate, status: goal.status, progressPercentage: progressPercentage(goal.currentProgress, goal.target) };
}

export async function getOverview(req, res) {
  const { date, start, end } = dayBounds(req.query.date);
  const [tasks, goals, weeklyActivity, currentStreak, focusSessions, careerCount, examCount, skillCount, bookCount] = await Promise.all([
    WorkspaceItem.find({ userId: req.user._id, type: 'task', taskDate: { $gte: start, $lte: end } }).sort({ completed: 1, priority: -1, createdAt: 1 }).lean(),
    WorkspaceItem.find({ userId: req.user._id, type: 'goal', status: { $nin: ['completed', 'cancelled'] } }).sort({ endDate: 1, priority: -1 }).limit(6).lean(),
    getWeeklyActivity(req.user._id, end),
    getCurrentStreak(req.user._id, end),
    WorkspaceItem.find({ userId: req.user._id, type: 'focus', createdAt: { $gte: start, $lte: end } }).lean(),
    WorkspaceItem.countDocuments({ userId: req.user._id, type: { $in: ['careerGoal', 'careerProject', 'application'] } }),
    WorkspaceItem.countDocuments({ userId: req.user._id, type: 'exam' }),
    WorkspaceItem.countDocuments({ userId: req.user._id, type: { $in: ['skill', 'futureSkill'] } }),
    WorkspaceItem.countDocuments({ userId: req.user._id, type: 'book' }),
  ]);
  const allGoals = await WorkspaceItem.find({ userId: req.user._id, type: 'goal' }).lean();
  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeGoals = allGoals.filter((goal) => ['planned', 'active'].includes(goal.status));
  const overdueGoals = activeGoals.filter((goal) => goal.endDate && new Date(goal.endDate) < start);
  const goalProgress = activeGoals.length ? Math.round(activeGoals.reduce((sum, goal) => sum + progressPercentage(goal.currentProgress, goal.target), 0) / activeGoals.length) : 0;
  const focusMinutesToday = focusSessions.reduce((sum, item) => sum + Number(item.data?.minutes || 0), 0);
  const upcomingDeadlines = activeGoals.filter((goal) => goal.endDate && new Date(goal.endDate) >= start).sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 5);

  res.json({ success: true, data: {
    date,
    summary: {
      tasksTotal: tasks.length,
      tasksCompleted: completedTasks,
      taskCompletionPercentage: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
      goalProgressPercentage: goalProgress,
      activeGoalsCount: activeGoals.length,
      totalGoalsCount: allGoals.filter((goal) => goal.status !== 'cancelled').length,
      overdueGoalsCount: overdueGoals.length,
      currentStreak,
      focusMinutesToday,
      focusMinutesThisWeek: 0,
    },
    tasks: tasks.map(mapTask),
    goals: goals.map(mapGoal),
    upcomingDeadlines: upcomingDeadlines.map((goal) => ({ id: goal._id.toString(), title: goal.title, category: goal.category, priority: goal.priority, endDate: goal.endDate })),
    weeklyActivity,
    modules: {
      career: { available: careerCount > 0, count: careerCount },
      exams: { available: examCount > 0, count: examCount },
      skills: { available: skillCount > 0, count: skillCount },
      books: { available: bookCount > 0, count: bookCount },
    },
  } });
}
