import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export const XP_LESSON_COMPLETE = 10;
export const XP_QUIZ_PASS = 25;
export const XP_DAILY_FIRST = 5;

function utcDayStart(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysBetweenUtc(a: Date, b: Date): number {
  const ms = utcDayStart(b).getTime() - utcDayStart(a).getTime();
  return Math.round(ms / 86_400_000);
}

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureStreak(userId: string) {
    return this.prisma.userStreak.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getStreak(userId: string) {
    const streak = await this.ensureStreak(userId);
    const today = utcDayStart();
    let dailyXpEarned = streak.dailyXpEarned;

    if (!streak.dailyGoalDate || utcDayStart(streak.dailyGoalDate).getTime() !== today.getTime()) {
      dailyXpEarned = 0;
      await this.prisma.userStreak.update({
        where: { userId },
        data: { dailyXpEarned: 0, dailyGoalDate: today },
      });
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      xpTotal: streak.xpTotal,
      dailyGoalXp: streak.dailyGoalXp,
      dailyXpEarned,
      dailyGoalDate: today,
      dailyGoalProgress: Math.min(1, dailyXpEarned / Math.max(1, streak.dailyGoalXp)),
      dailyGoalMet: dailyXpEarned >= streak.dailyGoalXp,
    };
  }

  /** Update streak calendar and award +5 on first activity of a new UTC day. */
  private async applyStreakAndDailyBonus(userId: string) {
    const today = utcDayStart();
    const streak = await this.ensureStreak(userId);

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;
    let firstActivityBonus = 0;
    let dailyXpEarned = streak.dailyXpEarned;
    const last = streak.lastActiveDate ? utcDayStart(streak.lastActiveDate) : null;
    const goalDate = streak.dailyGoalDate ? utcDayStart(streak.dailyGoalDate) : null;

    if (!goalDate || goalDate.getTime() !== today.getTime()) {
      dailyXpEarned = 0;
    }

    if (!last) {
      currentStreak = 1;
      firstActivityBonus = XP_DAILY_FIRST;
    } else {
      const gap = daysBetweenUtc(last, today);
      if (gap === 1) {
        currentStreak += 1;
        firstActivityBonus = XP_DAILY_FIRST;
      } else if (gap > 1) {
        currentStreak = 1;
        firstActivityBonus = XP_DAILY_FIRST;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      today,
      currentStreak,
      longestStreak,
      firstActivityBonus,
      dailyXpEarned,
    };
  }

  async awardXp(userId: string, amount: number, reason: string) {
    const state = await this.applyStreakAndDailyBonus(userId);
    const totalAward = amount + state.firstActivityBonus;
    const dailyXpEarned = state.dailyXpEarned + totalAward;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (amount > 0) {
        await tx.xpEvent.create({ data: { userId, amount, reason } });
      }
      if (state.firstActivityBonus > 0) {
        await tx.xpEvent.create({
          data: {
            userId,
            amount: state.firstActivityBonus,
            reason: 'daily_first_activity',
          },
        });
      }
      return tx.userStreak.update({
        where: { userId },
        data: {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          lastActiveDate: state.today,
          xpTotal: { increment: totalAward },
          dailyXpEarned,
          dailyGoalDate: state.today,
        },
      });
    });

    return {
      awarded: totalAward,
      base: amount,
      firstActivityBonus: state.firstActivityBonus,
      streak: updated,
    };
  }
}
