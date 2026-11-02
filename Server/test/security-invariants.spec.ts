import { ForbiddenException } from '@nestjs/common';
import {
  CourseStatus,
  EnrollmentStatus,
  OrgRole,
  QuestionType,
} from '@prisma/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnnouncementsService } from '../src/announcements/announcements.service.js';
import { AccessService } from '../src/common/services/access.service.js';
import { CommerceService } from '../src/commerce/commerce.service.js';
import { DiscussionsService } from '../src/discussions/discussions.service.js';
import { EngagementService } from '../src/engagement/engagement.service.js';
import { QuizzesService } from '../src/quizzes/quizzes.service.js';

const learner = {
  id: 'learner-1',
  email: 'learner@example.test',
  name: 'Learner',
  orgId: 'org-a',
  role: OrgRole.LEARNER,
};

describe('learner quiz security', () => {
  it('strips answer keys from learner quiz payloads', async () => {
    const prisma = {
      quiz: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'quiz-1',
          title: 'Secure quiz',
          passScore: 70,
          lessonId: 'lesson-1',
          questions: [
            {
              id: 'question-1',
              type: QuestionType.SINGLE,
              promptMd: 'Choose one',
              sortOrder: 0,
              optionsJson: [
                { id: 'a', text: 'Answer A', correct: true },
                { id: 'b', text: 'Answer B', correct: false },
              ],
            },
          ],
        }),
      },
    };
    const access = { assertLessonAccess: vi.fn().mockResolvedValue({}) };
    const service = new QuizzesService(prisma as never, access as never, {} as never);

    const response = await service.getForLearner(learner, 'quiz-1');

    expect(access.assertLessonAccess).toHaveBeenCalledWith(learner, 'lesson-1');
    expect(response.questions[0]?.options).toEqual([
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ]);
    expect(JSON.stringify(response)).not.toContain('correct');
  });

  it('grades attempts from persisted correct answers, not learner input', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'attempt-1' });
    const prisma = {
      quiz: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'quiz-1',
          lessonId: 'lesson-1',
          passScore: 70,
          questions: [
            {
              id: 'question-1',
              type: QuestionType.SINGLE,
              explanationMd: null,
              optionsJson: [
                { id: 'a', text: 'Correct', correct: true },
                { id: 'b', text: 'Incorrect', correct: false },
              ],
            },
          ],
        }),
      },
      quizAttempt: { create },
    };
    const access = { assertLessonAccess: vi.fn().mockResolvedValue({}) };
    const engagement = { awardXp: vi.fn() };
    const service = new QuizzesService(
      prisma as never,
      access as never,
      engagement as never,
    );

    const response = await service.submitAttempt(learner, 'quiz-1', {
      answers: { 'question-1': 'b' },
    });

    expect(response).toMatchObject({ score: 0, passed: false });
    expect(response.breakdown).toEqual([
      { questionId: 'question-1', correct: false, explanationMd: null },
    ]);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ score: 0, passed: false }),
      }),
    );
    expect(engagement.awardXp).not.toHaveBeenCalled();
  });
});

describe('lesson access boundaries', () => {
  const lesson = (organizationId: string, status: CourseStatus) => ({
    id: 'lesson-1',
    module: { course: { id: 'course-1', organizationId, status } },
    quiz: null,
  });

  it('forbids cross-organization lesson access before enrollment checks', async () => {
    const prisma = {
      lesson: { findUnique: vi.fn().mockResolvedValue(lesson('org-b', CourseStatus.PUBLISHED)) },
      enrollment: { findUnique: vi.fn() },
    };
    const service = new AccessService(prisma as never);

    await expect(service.assertLessonAccess(learner, 'lesson-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
  });

  it('forbids learners from unpublished courses and unenrolled published courses', async () => {
    const prisma = {
      lesson: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce(lesson('org-a', CourseStatus.DRAFT))
          .mockResolvedValueOnce(lesson('org-a', CourseStatus.PUBLISHED)),
      },
      enrollment: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new AccessService(prisma as never);

    await expect(service.assertLessonAccess(learner, 'lesson-1')).rejects.toThrow(
      'Course is not published',
    );
    await expect(service.assertLessonAccess(learner, 'lesson-1')).rejects.toThrow(
      'Enrollment required',
    );
    expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
      where: { courseId_userId: { courseId: 'course-1', userId: learner.id } },
    });
  });

  it('rejects revoked enrollment even when the course is published', async () => {
    const prisma = {
      lesson: { findUnique: vi.fn().mockResolvedValue(lesson('org-a', CourseStatus.PUBLISHED)) },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue({ status: EnrollmentStatus.REVOKED }),
      },
    };

    await expect(
      new AccessService(prisma as never).assertLessonAccess(learner, 'lesson-1'),
    ).rejects.toThrow('Enrollment required');
  });
});

describe('daily streak awards', () => {
  afterEach(() => vi.useRealTimers());

  it('awards the first-activity bonus only once per UTC day', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T23:55:00.000Z'));
    const streak = {
      userId: learner.id,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null as Date | null,
      xpTotal: 0,
      dailyGoalXp: 30,
      dailyXpEarned: 0,
      dailyGoalDate: null as Date | null,
    };
    const xpEvents: { userId: string; amount: number; reason: string }[] = [];
    const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      streak.currentStreak = data.currentStreak as number;
      streak.longestStreak = data.longestStreak as number;
      streak.lastActiveDate = data.lastActiveDate as Date;
      streak.dailyXpEarned = data.dailyXpEarned as number;
      streak.dailyGoalDate = data.dailyGoalDate as Date;
      streak.xpTotal += (data.xpTotal as { increment: number }).increment;
      return streak;
    });
    const tx = {
      xpEvent: {
        create: vi.fn(
          async ({
            data,
          }: {
            data: { userId: string; amount: number; reason: string };
          }) => {
          xpEvents.push(data);
          },
        ),
      },
      userStreak: { update },
    };
    const prisma = {
      userStreak: {
        upsert: vi.fn().mockResolvedValue(streak),
      },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const service = new EngagementService(prisma as never);

    const first = await service.awardXp(learner.id, 10, 'lesson_complete');
    const second = await service.awardXp(learner.id, 10, 'quiz_pass');

    expect(first).toMatchObject({ base: 10, firstActivityBonus: 5, awarded: 15 });
    expect(second).toMatchObject({ base: 10, firstActivityBonus: 0, awarded: 10 });
    expect(xpEvents.filter((event) => event.reason === 'daily_first_activity')).toEqual([
      { userId: learner.id, amount: 5, reason: 'daily_first_activity' },
    ]);
  });
});

describe('tenant-scoped community content', () => {
  it('limits learner announcements to the learner organization and enrolled courses', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      enrollment: {
        findMany: vi.fn().mockResolvedValue([{ courseId: 'course-1' }]),
      },
      announcement: { findMany },
    };

    await new AnnouncementsService(prisma as never).listForLearner(learner);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: learner.orgId,
          publishedAt: expect.objectContaining({ not: null }),
          OR: [{ courseId: null }, { courseId: { in: ['course-1'] } }],
        }),
      }),
    );
  });

  it('does not return cross-tenant discussion threads or staff-only replies to learners', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'thread-1',
      courseId: 'course-1',
      organizationId: learner.orgId,
    });
    const findUnique = vi.fn().mockResolvedValue({ id: 'thread-1', replies: [] });
    const prisma = {
      discussionThread: { findFirst, findUnique },
    };
    const access = {
      requireCourseInOrg: vi.fn().mockResolvedValue({ id: 'course-1' }),
      requireEnrollment: vi.fn().mockResolvedValue({}),
      isStaff: vi.fn().mockReturnValue(false),
    };
    const service = new DiscussionsService(prisma as never, access as never);

    await service.get(learner, 'thread-1');

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'thread-1', organizationId: learner.orgId },
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          replies: expect.objectContaining({ where: { staffOnly: false } }),
        }),
      }),
    );
  });
});

describe('commerce without Stripe credentials', () => {
  it('fails safely before any database or Stripe call', async () => {
    const prisma = {
      course: { findFirst: vi.fn() },
      courseEntitlement: { findFirst: vi.fn() },
    };
    const config = { get: vi.fn().mockReturnValue(undefined) };
    const service = new CommerceService(prisma as never, config as never);

    await expect(
      service.createCheckout(learner, { courseId: 'course-1' }),
    ).rejects.toThrow('Stripe integration is not configured');
    await expect(service.handleWebhook(Buffer.from('{}'), 'signature')).rejects.toThrow(
      'Stripe webhook integration is not configured',
    );
    expect(prisma.course.findFirst).not.toHaveBeenCalled();
    expect(prisma.courseEntitlement.findFirst).not.toHaveBeenCalled();
  });
});
