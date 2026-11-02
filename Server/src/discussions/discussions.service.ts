import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscussionStatus, OrgRole } from '@prisma/client';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateDiscussionDto,
  CreateDiscussionReplyDto,
  ListDiscussionsDto,
  UpdateDiscussionDto,
} from './dto/discussion.dto.js';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  private async requireCourseAccess(user: AuthUser, courseId: string) {
    const course = await this.access.requireCourseInOrg(courseId, user.orgId);
    if (!this.access.isStaff(user.role)) {
      await this.access.requireEnrollment(user.id, courseId);
    }
    return course;
  }

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

  async list(user: AuthUser, query: ListDiscussionsDto) {
    await this.requireCourseAccess(user, query.courseId);
    if (query.lessonId) {
      await this.assertLessonInCourse(query.lessonId, query.courseId);
    }
    const where = { organizationId: user.orgId, courseId: query.courseId, ...(query.lessonId ? { lessonId: query.lessonId } : {}) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.discussionThread.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { replies: true } },
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.discussionThread.count({ where }),
    ]);
    return {
      items,
      metadata: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async create(user: AuthUser, dto: CreateDiscussionDto) {
    await this.requireCourseAccess(user, dto.courseId);
    if (dto.lessonId) await this.assertLessonInCourse(dto.lessonId, dto.courseId);
    return this.prisma.discussionThread.create({
      data: {
        organizationId: user.orgId,
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        authorId: user.id,
        title: dto.title,
        bodyMd: dto.bodyMd,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async get(user: AuthUser, threadId: string) {
    const thread = await this.threadForOrg(user, threadId);
    await this.requireCourseAccess(user, thread.courseId);
    return this.prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          where: this.access.isStaff(user.role) ? {} : { staffOnly: false },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async reply(user: AuthUser, threadId: string, dto: CreateDiscussionReplyDto) {
    const thread = await this.threadForOrg(user, threadId);
    await this.requireCourseAccess(user, thread.courseId);
    if (thread.status === DiscussionStatus.LOCKED) {
      throw new ForbiddenException('Discussion is locked');
    }
    if (dto.staffOnly && !this.access.isStaff(user.role)) {
      throw new ForbiddenException('Staff-only replies require a staff role');
    }
    return this.prisma.discussionReply.create({
      data: {
        threadId,
        authorId: user.id,
        bodyMd: dto.bodyMd,
        staffOnly: dto.staffOnly ?? false,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async update(user: AuthUser, threadId: string, dto: UpdateDiscussionDto) {
    this.requireStaff(user);
    await this.threadForOrg(user, threadId);
    return this.prisma.discussionThread.update({ where: { id: threadId }, data: dto });
  }

  async removeThread(user: AuthUser, threadId: string) {
    this.requireStaff(user);
    await this.threadForOrg(user, threadId);
    await this.prisma.discussionThread.delete({ where: { id: threadId } });
    return { deleted: true };
  }

  async removeReply(user: AuthUser, threadId: string, replyId: string) {
    this.requireStaff(user);
    await this.threadForOrg(user, threadId);
    const result = await this.prisma.discussionReply.deleteMany({
      where: { id: replyId, threadId },
    });
    if (!result.count) throw new NotFoundException('Discussion reply not found');
    return { deleted: true };
  }

  private async threadForOrg(user: AuthUser, threadId: string) {
    const thread = await this.prisma.discussionThread.findFirst({
      where: { id: threadId, organizationId: user.orgId },
    });
    if (!thread) throw new NotFoundException('Discussion not found');
    return thread;
  }

  private async assertLessonInCourse(lessonId: string, courseId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, module: { courseId } },
    });
    if (!lesson) throw new BadRequestException('Lesson does not belong to this course');
  }
}
