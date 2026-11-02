import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { OrgRole } from '@prisma/client';
import { CertificatesService } from '../src/certificates/certificates.service.js';
import { ProgressService } from '../src/progress/progress.service.js';

describe('assessment completion requirements', () => {
  it('rejects marking a quiz lesson complete without a passing attempt', async () => {
    const prisma = {
      quizAttempt: { findFirst: vi.fn().mockResolvedValue(null) },
      lessonProgress: { upsert: vi.fn() },
    };
    const access = {
      assertLessonAccess: vi.fn().mockResolvedValue({ quiz: { id: 'quiz' } }),
    };
    const service = new ProgressService(
      prisma as never,
      access as never,
      {} as never,
      {} as never,
    );
    await expect(
      service.update(
        {
          id: 'learner',
          orgId: 'org',
          email: 'learner@test.dev',
          name: 'Learner',
          role: OrgRole.LEARNER,
        },
        'lesson',
        { completed: true },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it('withholds a certificate when lessons are complete but an assessment is not passed', async () => {
    const prisma = {
      lesson: { findMany: vi.fn().mockResolvedValue([{ id: 'lesson' }]) },
      lessonProgress: { count: vi.fn().mockResolvedValue(1) },
      quiz: { findMany: vi.fn().mockResolvedValue([{ id: 'quiz' }]) },
      quizAttempt: { findMany: vi.fn().mockResolvedValue([]) },
      certificate: { create: vi.fn() },
    };
    const service = new CertificatesService(prisma as never);
    expect(await service.issueIfComplete('learner', 'course')).toBeNull();
    expect(prisma.certificate.create).not.toHaveBeenCalled();
  });
});
