import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, OrgRole } from '@prisma/client';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateCohortDto,
  CreateCohortSessionDto,
  EnrollCohortLearnerDto,
  UpdateCohortDto,
  UpdateCohortSessionDto,
} from './dto/cohort.dto.js';

@Injectable()
export class CohortsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  private requireInstructor(user: AuthUser) {
    const instructorRoles = new Set<OrgRole>([
      OrgRole.OWNER,
      OrgRole.ADMIN,
      OrgRole.INSTRUCTOR,
    ]);
    if (!instructorRoles.has(user.role)) {
      throw new ForbiddenException('Instructor role required');
    }
  }

  private requireStaff(user: AuthUser) {
    if (!this.access.isStaff(user.role)) {
      throw new ForbiddenException('Staff role required');
    }
  }

  private async cohortForOrg(user: AuthUser, cohortId: string) {
    const cohort = await this.prisma.cohort.findFirst({
      where: { id: cohortId, organizationId: user.orgId },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async listMine(user: AuthUser) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: { not: EnrollmentStatus.REVOKED },
        cohortId: { not: null },
        course: { organizationId: user.orgId },
      },
      include: {
        cohort: {
          include: {
            sessions: { orderBy: { startsAt: 'asc' } },
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
                modules: {
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    releaseOffsetDays: true,
                    lessons: {
                      orderBy: { sortOrder: 'asc' },
                      select: { id: true, title: true, slug: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const now = new Date();
    return enrollments
      .filter((enrollment) => enrollment.cohort !== null)
      .map((enrollment) => {
        const cohort = enrollment.cohort!;
        return {
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          cohort: {
            ...cohort,
            course: {
              ...cohort.course,
              modules: cohort.course.modules.map((module) => {
                const releaseAt = new Date(cohort.startsAt);
                releaseAt.setUTCDate(
                  releaseAt.getUTCDate() + module.releaseOffsetDays,
                );
                return {
                  ...module,
                  releaseAt,
                  released: releaseAt <= now,
                };
              }),
            },
          },
        };
      });
  }

  listStudio(user: AuthUser) {
    this.requireStaff(user);
    return this.prisma.cohort.findMany({
      where: { organizationId: user.orgId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        sessions: { orderBy: { startsAt: 'asc' } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  async getStudio(user: AuthUser, cohortId: string) {
    this.requireStaff(user);
    const cohort = await this.prisma.cohort.findFirst({
      where: { id: cohortId, organizationId: user.orgId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        sessions: { orderBy: { startsAt: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async create(user: AuthUser, dto: CreateCohortDto) {
    this.requireInstructor(user);
    await this.access.requireCourseInOrg(dto.courseId, user.orgId);
    return this.prisma.cohort.create({
      data: { organizationId: user.orgId, ...dto },
    });
  }

  async update(user: AuthUser, cohortId: string, dto: UpdateCohortDto) {
    this.requireInstructor(user);
    await this.cohortForOrg(user, cohortId);
    return this.prisma.cohort.update({ where: { id: cohortId }, data: dto });
  }

  async remove(user: AuthUser, cohortId: string) {
    this.requireInstructor(user);
    await this.cohortForOrg(user, cohortId);
    await this.prisma.cohort.delete({ where: { id: cohortId } });
    return { deleted: true };
  }

  async createSession(
    user: AuthUser,
    cohortId: string,
    dto: CreateCohortSessionDto,
  ) {
    this.requireInstructor(user);
    await this.cohortForOrg(user, cohortId);
    return this.prisma.cohortSession.create({ data: { cohortId, ...dto } });
  }

  async updateSession(
    user: AuthUser,
    cohortId: string,
    sessionId: string,
    dto: UpdateCohortSessionDto,
  ) {
    this.requireInstructor(user);
    await this.cohortForOrg(user, cohortId);
    const session = await this.prisma.cohortSession.findFirst({
      where: { id: sessionId, cohortId },
    });
    if (!session) throw new NotFoundException('Cohort session not found');
    return this.prisma.cohortSession.update({ where: { id: sessionId }, data: dto });
  }

  async removeSession(user: AuthUser, cohortId: string, sessionId: string) {
    this.requireInstructor(user);
    await this.cohortForOrg(user, cohortId);
    const result = await this.prisma.cohortSession.deleteMany({
      where: { id: sessionId, cohortId },
    });
    if (!result.count) throw new NotFoundException('Cohort session not found');
    return { deleted: true };
  }

  async enrollLearner(
    user: AuthUser,
    cohortId: string,
    dto: EnrollCohortLearnerDto,
  ) {
    this.requireInstructor(user);
    const cohort = await this.cohortForOrg(user, cohortId);
    const membership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: user.orgId,
          userId: dto.userId,
        },
      },
    });
    if (!membership) throw new BadRequestException('Learner must belong to this organization');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: cohort.courseId, userId: dto.userId } },
    });
    if (!enrollment) {
      throw new BadRequestException('Learner must be enrolled in the cohort course');
    }
    if (enrollment.status === EnrollmentStatus.REVOKED) {
      throw new BadRequestException('Learner enrollment is revoked');
    }
    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { cohortId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async roster(user: AuthUser, cohortId: string) {
    this.requireStaff(user);
    const cohort = await this.cohortForOrg(user, cohortId);
    return this.prisma.enrollment.findMany({
      where: { cohortId, courseId: cohort.courseId, status: { not: EnrollmentStatus.REVOKED } },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { enrolledAt: 'asc' },
    });
  }
}
