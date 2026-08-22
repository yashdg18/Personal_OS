export const DAILY_QUOTES = [
  { text: "You don't need motivation every day. You need discipline every day.", category: 'Discipline' },
  { text: 'Your future is created by what you do today, not what you plan to do tomorrow.', category: 'Discipline' },
  { text: 'Every hour you waste today is an hour your future self will wish you had used.', category: 'Discipline' },
  { text: 'Distraction is the enemy of the life you say you want.', category: 'Discipline' },
  { text: 'Stop checking what everyone else is doing. Start building what you want to become.', category: 'Discipline' },
  { text: 'You will never become extraordinary by living an ordinary routine.', category: 'Discipline' },
  { text: "Don't just learn to code. Learn to solve problems.", category: 'Software developer journey' },
  { text: 'One more problem solved. One more concept understood. One step closer.', category: 'Software developer journey' },
  { text: 'The developer you want to become is built one line of code at a time.', category: 'Software developer journey' },
  { text: "You don't need to know everything. You need to keep learning.", category: 'Software developer journey' },
  { text: 'Build projects. Break them. Debug them. Learn. Repeat.', category: 'Software developer journey' },
  { text: 'Your GitHub today is a preview of the engineer you will become tomorrow.', category: 'Software developer journey' },
  { text: "Don't study because the exam is coming. Study because your future is coming.", category: 'GATE & learning' },
  { text: 'A difficult subject today can become your strength tomorrow.', category: 'GATE & learning' },
  { text: 'Consistency beats intelligence when intelligence refuses to work consistently.', category: 'GATE & learning' },
  { text: 'One chapter. One concept. One problem. One day at a time.', category: 'GATE & learning' },
  { text: "You don't have to finish everything today. You just have to refuse to stop.", category: 'GATE & learning' },
  { text: "Think big, but work small: today's task, today's problem, today's improvement.", category: 'Big career dreams' },
  { text: 'The distance between you and your dream is measured in consistent days of work.', category: 'Big career dreams' },
  { text: 'Your college name does not define your ceiling. Your skills, persistence, and work do.', category: 'Big career dreams' },
  { text: 'Don’t chase the title of engineer. Become the engineer companies cannot ignore.', category: 'Big career dreams' },
  { text: 'You don’t need to be the best today. You need to be better than yesterday.', category: 'Big career dreams' },
  { text: 'When you feel like quitting, remember why you started.', category: 'When you feel like giving up' },
  { text: 'Hard days are not proof that you are failing. They are part of becoming stronger.', category: 'When you feel like giving up' },
  { text: 'You are allowed to struggle. You are not allowed to surrender.', category: 'When you feel like giving up' },
  { text: 'The version of you who gets the dream job is created by the version of you who refuses to quit today.', category: 'When you feel like giving up' },
  { text: 'Nobody will come to build your future for you. Build it yourself.', category: 'When you feel like giving up' },
  { text: 'Be so focused on your mission that distractions become boring.', category: 'Ultimate mindset' },
  { text: 'Three years of serious focus can change the next thirty years of your life.', category: 'Ultimate mindset' },
  { text: 'I will not waste my potential. I will learn, build, fail, improve, and keep moving until I become the person I know I can be.', category: 'Ultimate mindset' },
];

const ROTATION_START = new Date('2026-08-22T00:00:00');

export function getQuoteOfDay(date = new Date()) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(ROTATION_START.getFullYear(), ROTATION_START.getMonth(), ROTATION_START.getDate());
  const daysSinceStart = Math.floor((current.getTime() - start.getTime()) / 86400000);
  const index = ((daysSinceStart % DAILY_QUOTES.length) + DAILY_QUOTES.length) % DAILY_QUOTES.length;
  return { ...DAILY_QUOTES[index], number: index + 1 };
}
