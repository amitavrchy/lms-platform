import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, OrgRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthUser } from '../types/auth.types.js';

const STAFF: OrgRole[] = [
  OrgRole.OWNER,
  OrgRole.ADMIN,
  OrgRole.INSTRUCTOR,
  OrgRole.TA,
];

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  isStaff(role: OrgRole) {
    return STAFF.includes(role);
  }

  async requireEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment || enrollment.status === EnrollmentStatus.REVOKED) {
      throw new ForbiddenException('Enrollment required');
    }
    return enrollment;
  }

  async requireCourseInOrg(courseId: string, orgId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: orgId },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  /** Learner may access published enrolled courses; staff may access any in org. */
  async assertLessonAccess(user: AuthUser, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { include: { course: true } },
        quiz: true,
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const course = lesson.module.course;
    if (course.organizationId !== user.orgId) {
      throw new ForbiddenException('Cross-org access denied');
    }

    if (this.isStaff(user.role)) {
      return lesson;
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new ForbiddenException('Course is not published');
    }

    const enrollment = await this.requireEnrollment(user.id, course.id);
    if (enrollment.cohortId) {
      const cohort = await this.prisma.cohort.findFirst({
        where: {
          id: enrollment.cohortId,
          courseId: course.id,
          organizationId: user.orgId,
        },
        select: { startsAt: true },
      });
      if (cohort) {
        const releaseAt = new Date(cohort.startsAt);
        releaseAt.setUTCDate(
          releaseAt.getUTCDate() + lesson.module.releaseOffsetDays,
        );
        if (releaseAt > new Date()) {
          throw new ForbiddenException('Module content is not yet released');
        }
      }
    }
    return lesson;
  }
}
