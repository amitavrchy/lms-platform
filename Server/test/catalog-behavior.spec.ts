import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnrollmentStatus, OrgRole } from '@prisma/client';
import { CatalogService } from '../src/catalog/catalog.service.js';

const user = {
  id: 'learner',
  orgId: 'academy',
  email: 'learner@test.dev',
  name: 'Learner',
  role: OrgRole.LEARNER,
};
afterEach(() => vi.useRealTimers());

describe('catalog learning state', () => {
  function outline(status = EnrollmentStatus.ACTIVE) {
    const prisma = {
      course: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'course',
          modules: [
            {
              id: 'week-1',
              releaseOffsetDays: 0,
              lessons: [
                { id: 'intro', learningObjectives: ['Explain the core idea'] },
              ],
            },
            {
              id: 'week-2',
              releaseOffsetDays: 7,
              lessons: [
                { id: 'practice', learningObjectives: ['Apply the idea'] },
              ],
            },
          ],
        }),
      },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue({
          status,
          cohort: { startsAt: new Date('2026-11-01T00:00:00Z') },
        }),
      },
      lessonProgress: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([{ lessonId: 'intro' }]),
      },
    };
    return new CatalogService(
      prisma as never,
      { isStaff: () => false } as never,
    );
  }

  it('shows completed lessons and the same cohort release schedule used by lesson access', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
    const result = await outline().getCourseBySlug('course', undefined, user);
    expect(result).toMatchObject({ enrolled: true, progressPercent: 50 });
    expect(result.modules[0]).toMatchObject({
      locked: false,
      lessons: [{ completed: true }],
    });
    expect(result.modules[1]).toMatchObject({
      locked: true,
      availableAt: '2026-11-08T00:00:00.000Z',
    });
  });

  it('does not present a revoked enrollment as active course access', async () => {
    const result = await outline(EnrollmentStatus.REVOKED).getCourseBySlug(
      'course',
      undefined,
      user,
    );
    expect(result.enrolled).toBe(false);
  });

  it('returns authored resources and navigation across available modules without exposing unreleased lessons', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
    const lesson = {
      id: 'intro',
      moduleId: 'one',
      learningObjectives: ['Use retrieval practice'],
      transcriptMd: 'An actual transcript',
      resourceUrl: 'https://academy.test/notes',
      module: { id: 'one', course: { id: 'course' } },
    };
    const prisma = {
      lesson: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'intro', moduleId: 'one', module: { releaseOffsetDays: 0 } },
          {
            id: 'next-module',
            moduleId: 'two',
            module: { releaseOffsetDays: 1 },
          },
          { id: 'future', moduleId: 'three', module: { releaseOffsetDays: 7 } },
        ]),
      },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue({
          cohort: { startsAt: new Date('2026-11-01T00:00:00Z') },
        }),
      },
    };
    const service = new CatalogService(
      prisma as never,
      {
        assertLessonAccess: vi.fn().mockResolvedValue(lesson),
        isStaff: () => false,
      } as never,
    );
    const result = await service.getLesson('intro', user);
    expect(result.objectives).toEqual(lesson.learningObjectives);
    expect(result.transcript).toBe(lesson.transcriptMd);
    expect(result.resources).toEqual([
      { title: 'Lesson reference material', url: lesson.resourceUrl },
    ]);
    expect(result.navigation.map((item) => item.id)).toEqual([
      'intro',
      'next-module',
    ]);
    expect(result.module.lessons.map((item) => item.id)).toEqual(['intro']);
  });
});
