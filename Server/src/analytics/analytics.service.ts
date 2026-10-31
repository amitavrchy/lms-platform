import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async courseAnalytics(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' }, include: { quiz: true } },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
    });
    const lessonIds = course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    const progress = await this.prisma.lessonProgress.findMany({
      where: { lessonId: { in: lessonIds }, completed: true },
    });

    const lessonCompletion = course.modules.flatMap((m) =>
      m.lessons.map((lesson) => {
        const completedCount = progress.filter(
          (p) => p.lessonId === lesson.id,
        ).length;
        return {
          lessonId: lesson.id,
          title: lesson.title,
          moduleTitle: m.title,
          completedCount,
          rate:
            enrollments.length === 0
              ? 0
              : completedCount / enrollments.length,
        };
      }),
    );

    const quizIds = course.modules
      .flatMap((m) => m.lessons)
      .map((l) => l.quiz?.id)
      .filter((id): id is string => !!id);

    const attempts = quizIds.length
      ? await this.prisma.quizAttempt.findMany({
          where: { quizId: { in: quizIds } },
        })
      : [];

    const quizStats = quizIds.map((quizId) => {
      const qa = attempts.filter((a) => a.quizId === quizId);
      const avg =
        qa.length === 0
          ? 0
          : qa.reduce((s, a) => s + a.score, 0) / qa.length;
      const passRate =
        qa.length === 0
          ? 0
          : qa.filter((a) => a.passed).length / qa.length;
      return { quizId, attempts: qa.length, avgScore: avg, passRate };
    });

    const completedEnrollments = enrollments.filter(
      (e) => e.completedAt != null,
    ).length;

    return {
      courseId,
      title: course.title,
      enrollments: enrollments.length,
      completions: completedEnrollments,
      completionRate:
        enrollments.length === 0
          ? 0
          : completedEnrollments / enrollments.length,
      lessonCompletion,
      quizStats,
    };
  }
}
