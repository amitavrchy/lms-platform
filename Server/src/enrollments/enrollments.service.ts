import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus } from '@prisma/client';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot enroll in unpublished course');
    }

    try {
      return await this.prisma.enrollment.create({
        data: {
          courseId,
          userId: user.id,
          status: EnrollmentStatus.ACTIVE,
        },
        include: {
          course: {
            select: { id: true, slug: true, title: true, coverUrl: true },
          },
        },
      });
    } catch {
      throw new BadRequestException('Already enrolled');
    }
  }

  async listMine(user: AuthUser) {
    const rows = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: { not: EnrollmentStatus.REVOKED },
        course: { organizationId: user.orgId },
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            coverUrl: true,
            status: true,
            durationMins: true,
            modules: {
              orderBy: { sortOrder: 'asc' },
              select: {
                lessons: {
                  orderBy: { sortOrder: 'asc' },
                  select: { id: true, title: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return Promise.all(
      rows.map(async (row) => {
        const lessons = row.course.modules.flatMap((m) => m.lessons);
        const lessonIds = lessons.map((l) => l.id);
        const completed = lessonIds.length
          ? await this.prisma.lessonProgress.findMany({
              where: {
                userId: user.id,
                completed: true,
                lessonId: { in: lessonIds },
              },
              select: { lessonId: true },
            })
          : [];
        const done = new Set(completed.map((c) => c.lessonId));
        const continueLesson = lessons.find((l) => !done.has(l.id)) ?? null;
        const progressPercent = lessonIds.length
          ? Math.round((done.size / lessonIds.length) * 100)
          : 0;
        const { modules: _modules, ...course } = row.course;
        return {
          ...row,
          course,
          progressPercent,
          continueLesson,
        };
      }),
    );
  }
}
