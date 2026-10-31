import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus } from '@prisma/client';
import type { AuthUser } from '../common/types/auth.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePathDto, UpdatePathDto } from './dto/path.dto.js';

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(slug: string, orgSlug?: string) {
    const path = await this.prisma.learningPath.findFirst({
      where: {
        slug,
        ...(orgSlug
          ? { organization: { slug: orgSlug.toLowerCase() } }
          : {}),
      },
    });
    if (!path) throw new NotFoundException('Path not found');

    const courses = await this.prisma.course.findMany({
      where: {
        id: { in: path.courseIds },
        status: CourseStatus.PUBLISHED,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        coverUrl: true,
        durationMins: true,
        level: true,
      },
    });
    const byId = new Map(courses.map((c) => [c.id, c]));
    return {
      ...path,
      courses: path.courseIds.map((id) => byId.get(id)).filter(Boolean),
    };
  }

  listStudio(user: AuthUser) {
    return this.prisma.learningPath.findMany({
      where: { organizationId: user.orgId },
      orderBy: { title: 'asc' },
    });
  }

  create(user: AuthUser, dto: CreatePathDto) {
    return this.prisma.learningPath.create({
      data: {
        organizationId: user.orgId,
        title: dto.title,
        slug: dto.slug,
        descriptionMd: dto.descriptionMd,
        coverUrl: dto.coverUrl,
        courseIds: dto.courseIds,
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdatePathDto) {
    const existing = await this.prisma.learningPath.findFirst({
      where: { id, organizationId: user.orgId },
    });
    if (!existing) throw new NotFoundException('Path not found');
    return this.prisma.learningPath.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.prisma.learningPath.findFirst({
      where: { id, organizationId: user.orgId },
    });
    if (!existing) throw new NotFoundException('Path not found');
    await this.prisma.learningPath.delete({ where: { id } });
    return { deleted: true };
  }
}
