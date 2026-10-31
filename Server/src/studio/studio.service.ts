import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus } from '@prisma/client';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateModuleDto,
} from './dto/studio.dto.js';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCourseOrThrow(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  listCourses(user: AuthUser) {
    return this.prisma.course.findMany({
      where: { organizationId: user.orgId },
      include: {
        _count: { select: { modules: true, enrollments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCourse(user: AuthUser, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId: user.orgId },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              include: { quiz: { select: { id: true, title: true } } },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  createCourse(user: AuthUser, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        organizationId: user.orgId,
        title: dto.title,
        slug: dto.slug,
        subtitle: dto.subtitle,
        descriptionMd: dto.descriptionMd,
        coverUrl: dto.coverUrl,
        level: dto.level,
        durationMins: dto.durationMins ?? 0,
        status: CourseStatus.DRAFT,
      },
    });
  }

  async updateCourse(user: AuthUser, courseId: string, dto: UpdateCourseDto) {
    await this.getCourseOrThrow(user, courseId);
    return this.prisma.course.update({
      where: { id: courseId },
      data: { ...dto },
    });
  }

  async publishCourse(user: AuthUser, courseId: string) {
    await this.getCourseOrThrow(user, courseId);
    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.PUBLISHED },
    });
  }

  async deleteCourse(user: AuthUser, courseId: string) {
    await this.getCourseOrThrow(user, courseId);
    await this.prisma.course.delete({ where: { id: courseId } });
    return { deleted: true };
  }

  async createModule(user: AuthUser, courseId: string, dto: CreateModuleDto) {
    await this.getCourseOrThrow(user, courseId);
    const max = await this.prisma.module.aggregate({
      where: { courseId },
      _max: { sortOrder: true },
    });
    return this.prisma.module.create({
      data: {
        courseId,
        title: dto.title,
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateModule(user: AuthUser, moduleId: string, dto: UpdateModuleDto) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod || mod.course.organizationId !== user.orgId) {
      throw new NotFoundException('Module not found');
    }
    return this.prisma.module.update({
      where: { id: moduleId },
      data: { ...dto },
    });
  }

  async deleteModule(user: AuthUser, moduleId: string) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod || mod.course.organizationId !== user.orgId) {
      throw new NotFoundException('Module not found');
    }
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { deleted: true };
  }

  async reorderModules(user: AuthUser, courseId: string, orderedIds: string[]) {
    await this.getCourseOrThrow(user, courseId);
    await this.prisma.$transaction(
      orderedIds.map((id, sortOrder) =>
        this.prisma.module.updateMany({
          where: { id, courseId },
          data: { sortOrder },
        }),
      ),
    );
    return this.getCourse(user, courseId);
  }

  async createLesson(user: AuthUser, moduleId: string, dto: CreateLessonDto) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod || mod.course.organizationId !== user.orgId) {
      throw new NotFoundException('Module not found');
    }
    const max = await this.prisma.lesson.aggregate({
      where: { moduleId },
      _max: { sortOrder: true },
    });
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        slug: dto.slug,
        type: dto.type,
        contentMd: dto.contentMd,
        videoUrl: dto.videoUrl,
        durationSec: dto.durationSec ?? 0,
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateLesson(user: AuthUser, lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || lesson.module.course.organizationId !== user.orgId) {
      throw new NotFoundException('Lesson not found');
    }
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { ...dto },
    });
  }

  async deleteLesson(user: AuthUser, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || lesson.module.course.organizationId !== user.orgId) {
      throw new NotFoundException('Lesson not found');
    }
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { deleted: true };
  }

  async reorderLessons(
    user: AuthUser,
    moduleId: string,
    orderedIds: string[],
  ) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod || mod.course.organizationId !== user.orgId) {
      throw new NotFoundException('Module not found');
    }
    await this.prisma.$transaction(
      orderedIds.map((id, sortOrder) =>
        this.prisma.lesson.updateMany({
          where: { id, moduleId },
          data: { sortOrder },
        }),
      ),
    );
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getLesson(user: AuthUser, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: true,
        module: { include: { course: true } },
      },
    });
    if (!lesson || lesson.module.course.organizationId !== user.orgId) {
      throw new ForbiddenException('Lesson not found');
    }
    return lesson;
  }
}
