export const XP = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 25,
  DAILY_FIRST: 5,
} as const;

export function dailyGoalProgress(earned: number, goal: number) {
  if (goal <= 0) return 1;
  return Math.min(1, earned / goal);
}
