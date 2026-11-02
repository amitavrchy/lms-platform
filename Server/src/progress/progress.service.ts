import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import {
  EngagementService,
  XP_LESSON_COMPLETE,
} from '../engagement/engagement.service.js';
import { CertificatesService } from '../certificates/certificates.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly engagement: EngagementService,
    private readonly certificates: CertificatesService,
  ) {}

  async get(user: AuthUser, lessonId: string) {
    await this.access.assertLessonAccess(user, lessonId);
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { lessonId_userId: { lessonId, userId: user.id } },
    });
    return (
      progress ?? {
        lessonId,
        userId: user.id,
        completed: false,
        positionSec: 0,
        completedAt: null,
      }
    );
  }

  async update(user: AuthUser, lessonId: string, dto: UpdateProgressDto) {
    const lesson = await this.access.assertLessonAccess(user, lessonId);
    if (dto.completed && lesson.quiz) {
      const passed = await this.prisma.quizAttempt.findFirst({
        where: { quizId: lesson.quiz.id, userId: user.id, passed: true },
        select: { id: true },
      });
      if (!passed)
        throw new ForbiddenException(
          'Pass the checkpoint quiz before completing this lesson',
        );
    }
    const existing = await this.prisma.lessonProgress.findUnique({
      where: { lessonId_userId: { lessonId, userId: user.id } },
    });

    const becomingComplete = dto.completed === true && !existing?.completed;

    const progress = await this.prisma.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId: user.id } },
      create: {
        lessonId,
        userId: user.id,
        positionSec: dto.positionSec ?? 0,
        completed: dto.completed ?? false,
        completedAt: dto.completed ? new Date() : null,
      },
      update: {
        ...(dto.positionSec !== undefined
          ? { positionSec: dto.positionSec }
          : {}),
        ...(dto.completed !== undefined
          ? {
              completed: dto.completed,
              completedAt: dto.completed
                ? (existing?.completedAt ?? new Date())
                : null,
            }
          : {}),
      },
    });

    let xp = null;
    let certificate = null;

    if (becomingComplete) {
      xp = await this.engagement.awardXp(
        user.id,
        XP_LESSON_COMPLETE,
        'lesson_complete',
      );
      certificate = await this.certificates.issueIfComplete(
        user.id,
        lesson.module.courseId,
      );
    }

    return { progress, xp, certificate };
  }
}
