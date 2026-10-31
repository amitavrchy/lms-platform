import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, OrgRole } from '@prisma/client';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listMembers(user: AuthUser) {
    return this.prisma.membership.findMany({
      where: { organizationId: user.orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { role: 'asc' },
    });
  }

  async updateRole(user: AuthUser, membershipId: string, role: OrgRole) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, organizationId: user.orgId },
    });
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === OrgRole.OWNER && role !== OrgRole.OWNER) {
      throw new BadRequestException('Cannot demote the OWNER via this endpoint');
    }
    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async assignEnrollments(
    user: AuthUser,
    courseId: string,
    userIds: string[],
  ) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status === CourseStatus.ARCHIVED) {
      throw new BadRequestException('Course is archived');
    }

    const members = await this.prisma.membership.findMany({
      where: {
        organizationId: user.orgId,
        userId: { in: userIds },
      },
    });
    const allowed = new Set(members.map((m) => m.userId));

    const results = [];
    for (const uid of userIds) {
      if (!allowed.has(uid)) {
        results.push({ userId: uid, ok: false, reason: 'not_in_org' });
        continue;
      }
      const enrollment = await this.prisma.enrollment.upsert({
        where: { courseId_userId: { courseId, userId: uid } },
        create: {
          courseId,
          userId: uid,
          status: EnrollmentStatus.ACTIVE,
        },
        update: { status: EnrollmentStatus.ACTIVE },
      });
      results.push({ userId: uid, ok: true, enrollmentId: enrollment.id });
    }
    return { courseId, results };
  }

  async reports(user: AuthUser) {
    const [members, courses, enrollments, published] = await Promise.all([
      this.prisma.membership.count({
        where: { organizationId: user.orgId },
      }),
      this.prisma.course.count({ where: { organizationId: user.orgId } }),
      this.prisma.enrollment.count({
        where: { course: { organizationId: user.orgId } },
      }),
      this.prisma.course.count({
        where: {
          organizationId: user.orgId,
          status: CourseStatus.PUBLISHED,
        },
      }),
    ]);

    const completed = await this.prisma.enrollment.count({
      where: {
        course: { organizationId: user.orgId },
        status: EnrollmentStatus.COMPLETED,
      },
    });

    return {
      seatsUsed: members,
      coursesTotal: courses,
      coursesPublished: published,
      enrollments,
      completions: completed,
    };
  }
}
