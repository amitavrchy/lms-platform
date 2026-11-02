import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, OrgRole } from '@prisma/client';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto.js';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  private requireStaff(user: AuthUser) {
    const staffRoles = new Set<OrgRole>([
      OrgRole.OWNER,
      OrgRole.ADMIN,
      OrgRole.INSTRUCTOR,
      OrgRole.TA,
    ]);
    if (!staffRoles.has(user.role)) {
      throw new ForbiddenException('Staff role required');
    }
  }

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

  async listForLearner(user: AuthUser) {
    const enrolledCourses = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: { not: EnrollmentStatus.REVOKED },
        course: { organizationId: user.orgId },
      },
      select: { courseId: true },
    });
    return this.prisma.announcement.findMany({
      where: {
        organizationId: user.orgId,
        publishedAt: { not: null, lte: new Date() },
        OR: [
          { courseId: null },
          { courseId: { in: enrolledCourses.map((enrollment) => enrollment.courseId) } },
        ],
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        reads: { where: { userId: user.id }, select: { readAt: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async markRead(user: AuthUser, announcementId: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: {
        id: announcementId,
        organizationId: user.orgId,
        publishedAt: { not: null, lte: new Date() },
      },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    if (announcement.courseId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          courseId_userId: { courseId: announcement.courseId, userId: user.id },
        },
      });
      if (!enrollment || enrollment.status === EnrollmentStatus.REVOKED) {
        throw new ForbiddenException('Enrollment required');
      }
    }
    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_userId: { announcementId, userId: user.id },
      },
      create: { announcementId, userId: user.id },
      update: { readAt: new Date() },
    });
  }

  async listStudio(user: AuthUser) {
    this.requireStaff(user);
    return this.prisma.announcement.findMany({
      where: { organizationId: user.orgId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        _count: { select: { reads: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getStudio(user: AuthUser, announcementId: string) {
    this.requireStaff(user);
    const announcement = await this.prisma.announcement.findFirst({
      where: { id: announcementId, organizationId: user.orgId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        _count: { select: { reads: true } },
      },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async create(user: AuthUser, dto: CreateAnnouncementDto) {
    this.requireInstructor(user);
    if (dto.courseId) await this.assertCourse(user, dto.courseId);
    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : dto.publish
        ? new Date()
        : undefined;
    return this.prisma.announcement.create({
      data: {
        organizationId: user.orgId,
        authorId: user.id,
        title: dto.title,
        bodyMd: dto.bodyMd,
        courseId: dto.courseId,
        publishedAt,
      },
    });
  }

  async update(user: AuthUser, announcementId: string, dto: UpdateAnnouncementDto) {
    this.requireInstructor(user);
    await this.announcementForOrg(user, announcementId);
    if (dto.courseId) await this.assertCourse(user, dto.courseId);
    const { publish, publishedAt, ...data } = dto;
    return this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...data,
        ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
        ...(publish ? { publishedAt: new Date() } : {}),
      },
    });
  }

  async remove(user: AuthUser, announcementId: string) {
    this.requireInstructor(user);
    await this.announcementForOrg(user, announcementId);
    await this.prisma.announcement.delete({ where: { id: announcementId } });
    return { deleted: true };
  }

  private async assertCourse(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
    });
    if (!course) throw new NotFoundException('Course not found');
  }

  private async announcementForOrg(user: AuthUser, announcementId: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id: announcementId, organizationId: user.orgId },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }
}
