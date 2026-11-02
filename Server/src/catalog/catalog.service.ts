import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus, EnrollmentStatus } from '@prisma/client';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  listCourses(orgSlug?: string) {
    return this.prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        ...(orgSlug ? { organization: { slug: orgSlug.toLowerCase() } } : {}),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        coverUrl: true,
        level: true,
        durationMins: true,
        organizationId: true,
        organization: { select: { slug: true, name: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCourseBySlug(slug: string, orgSlug?: string, user?: AuthUser) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        status: CourseStatus.PUBLISHED,
        ...(orgSlug ? { organization: { slug: orgSlug.toLowerCase() } } : {}),
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                durationSec: true,
                sortOrder: true,
                learningObjectives: true,
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (!user) {
      return { ...course, enrolled: false, progressPercent: 0 };
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId: user.id } },
      include: { cohort: { select: { startsAt: true } } },
    });
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completed = lessonIds.length
      ? await this.prisma.lessonProgress.count({
          where: {
            userId: user.id,
            completed: true,
            lessonId: { in: lessonIds },
          },
        })
      : 0;
    const doneIds = new Set(
      (
        await this.prisma.lessonProgress.findMany({
          where: {
            userId: user.id,
            completed: true,
            lessonId: { in: lessonIds },
          },
          select: { lessonId: true },
        })
      ).map((p) => p.lessonId),
    );

    return {
      ...course,
      enrolled: Boolean(
        enrollment && enrollment.status !== EnrollmentStatus.REVOKED,
      ),
      outcomes: course.modules
        .flatMap((m) => m.lessons.flatMap((l) => l.learningObjectives))
        .filter((value, index, all) => all.indexOf(value) === index)
        .slice(0, 6),
      progressPercent: lessonIds.length
        ? Math.round((completed / lessonIds.length) * 100)
        : 0,
      modules: course.modules.map((m) => ({
        ...m,
        availableAt: enrollment?.cohort
          ? new Date(
              enrollment.cohort.startsAt.getTime() +
                m.releaseOffsetDays * 86_400_000,
            ).toISOString()
          : null,
        locked:
          !this.access.isStaff(user.role) &&
          Boolean(
            enrollment?.cohort &&
            enrollment.cohort.startsAt.getTime() +
              m.releaseOffsetDays * 86_400_000 >
              Date.now(),
          ),
        lessons: m.lessons.map((l) => ({
          ...l,
          completed: doneIds.has(l.id),
        })),
      })),
    };
  }

  async getLesson(lessonId: string, user: AuthUser) {
    const lesson = await this.access.assertLessonAccess(user, lessonId);
    const siblings = await this.prisma.lesson.findMany({
      where: { module: { courseId: lesson.module.course.id } },
      orderBy: [{ module: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        sortOrder: true,
        slug: true,
        moduleId: true,
        module: { select: { releaseOffsetDays: true } },
      },
    });
    const enrollment = this.access.isStaff(user.role)
      ? null
      : await this.prisma.enrollment.findUnique({
          where: {
            courseId_userId: {
              courseId: lesson.module.course.id,
              userId: user.id,
            },
          },
          include: { cohort: { select: { startsAt: true } } },
        });
    const navigation = siblings.filter(
      (item) =>
        !enrollment?.cohort ||
        enrollment.cohort.startsAt.getTime() +
          item.module.releaseOffsetDays * 86_400_000 <=
          Date.now(),
    );
    return {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type,
      contentMd: lesson.contentMd,
      videoUrl: lesson.videoUrl,
      durationSec: lesson.durationSec,
      objectives: lesson.learningObjectives,
      transcript: lesson.transcriptMd,
      resources:
        lesson.resourceUrl && !lesson.resourceUrl.includes('learnora.example')
          ? [{ title: 'Lesson reference material', url: lesson.resourceUrl }]
          : [],
      navigation,
      quiz: lesson.quiz
        ? { id: lesson.quiz.id, title: lesson.quiz.title }
        : null,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        course: {
          id: lesson.module.course.id,
          slug: lesson.module.course.slug,
          title: lesson.module.course.title,
        },
        lessons: siblings.filter((item) => item.moduleId === lesson.moduleId),
      },
    };
  }

  listPaths(orgSlug?: string) {
    return this.prisma.learningPath.findMany({
      where: orgSlug ? { organization: { slug: orgSlug.toLowerCase() } } : {},
      orderBy: { title: 'asc' },
    });
  }
}
