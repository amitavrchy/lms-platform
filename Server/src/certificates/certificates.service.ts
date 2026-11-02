import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  private makeCode() {
    return `LRN-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
  }

  async issueIfComplete(userId: string, courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    });
    if (lessons.length === 0) return null;

    const completed = await this.prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        lessonId: { in: lessons.map((l) => l.id) },
      },
    });
    if (completed < lessons.length) return null;

    const quizzes = await this.prisma.quiz.findMany({
      where: { lesson: { module: { courseId } } },
      select: { id: true },
    });
    if (quizzes.length) {
      const passed = await this.prisma.quizAttempt.findMany({
        where: {
          userId,
          passed: true,
          quizId: { in: quizzes.map((quiz) => quiz.id) },
        },
        distinct: ['quizId'],
        select: { quizId: true },
      });
      if (passed.length < quizzes.length) return null;
    }

    const existing = await this.prisma.certificate.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (existing) return existing;

    const cert = await this.prisma.certificate.create({
      data: {
        courseId,
        userId,
        code: this.makeCode(),
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.enrollment.updateMany({
      where: { courseId, userId },
      data: {
        status: EnrollmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return cert;
  }

  async issueManual(user: AuthUser, courseId: string, targetUserId?: string) {
    const uid = targetUserId ?? user.id;
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const cert = await this.issueIfComplete(uid, courseId);
    if (!cert) {
      throw new ForbiddenException('Course not fully completed');
    }
    return cert;
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { code },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            organization: { select: { name: true, slug: true } },
          },
        },
        user: { select: { name: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      valid: true,
      code: cert.code,
      issuedAt: cert.issuedAt,
      learner: cert.user.name,
      course: cert.course.title,
      organization: cert.course.organization.name,
    };
  }

  listMine(user: AuthUser) {
    return this.prisma.certificate.findMany({
      where: {
        userId: user.id,
        course: { organizationId: user.orgId },
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true, coverUrl: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
