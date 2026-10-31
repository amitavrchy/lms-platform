import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrgRole } from '@prisma/client';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IngestDto, QuizGenerateDto, TutorDto } from './dto/ai.dto.js';

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly analytics: AnalyticsService,
  ) {}

  private baseUrl() {
    return (
      this.config.get<string>('AI_SERVICE_URL')?.replace(/\/$/, '') ??
      'http://127.0.0.1:8002'
    );
  }

  private async proxy<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl()}${path}`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new ServiceUnavailableException(
        'AI service unreachable. Is AI_SERVICE_URL running?',
      );
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new BadGatewayException(
        `AI service error ${res.status}: ${text.slice(0, 300)}`,
      );
    }
    return (await res.json()) as T;
  }

  async tutor(user: AuthUser, dto: TutorDto) {
    const lesson = await this.access.assertLessonAccess(user, dto.lessonId);
    return this.proxy('/v1/tutor/chat', {
      orgId: user.orgId,
      lessonId: dto.lessonId,
      courseId: lesson.module.courseId,
      message: dto.message,
      history: dto.history ?? [],
    });
  }

  async quizGenerate(user: AuthUser, dto: QuizGenerateDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || lesson.module.course.organizationId !== user.orgId) {
      throw new NotFoundException('Lesson not found in org');
    }
    const canGenerate: OrgRole[] = [
      OrgRole.OWNER,
      OrgRole.ADMIN,
      OrgRole.INSTRUCTOR,
    ];
    if (!canGenerate.includes(user.role)) {
      throw new ForbiddenException('Instructor role required');
    }

    const lessonText =
      lesson.contentMd ??
      `${lesson.title}\n${lesson.videoUrl ?? ''}`.trim();

    return this.proxy('/v1/quiz/generate', {
      lessonText,
      count: dto.count ?? 5,
      difficulty: dto.difficulty ?? 'medium',
      lessonId: lesson.id,
      orgId: user.orgId,
    });
  }

  async insights(user: AuthUser, courseId: string) {
    const courseStats = await this.analytics.courseAnalytics(user, courseId);
    return this.proxy('/v1/insights/progress', { courseStats });
  }

  async ingestLesson(user: AuthUser, lessonId: string, dto: IngestDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });
    if (!lesson || lesson.module.course.organizationId !== user.orgId) {
      throw new NotFoundException('Lesson not found in org');
    }
    const canIngest: OrgRole[] = [
      OrgRole.OWNER,
      OrgRole.ADMIN,
      OrgRole.INSTRUCTOR,
    ];
    if (!canIngest.includes(user.role)) {
      throw new ForbiddenException('Instructor role required');
    }

    const text = dto.text ?? lesson.contentMd ?? lesson.title;
    const result = await this.proxy<{ chromaId?: string; ids?: string[] }>(
      '/v1/content/ingest',
      {
        orgId: user.orgId,
        courseId: lesson.module.courseId,
        lessonId: lesson.id,
        text,
      },
    );

    const chromaId =
      result.chromaId ??
      result.ids?.[0] ??
      `lesson_${lesson.id}_${Date.now()}`;

    await this.prisma.contentChunkMeta.create({
      data: {
        organizationId: user.orgId,
        courseId: lesson.module.courseId,
        lessonId: lesson.id,
        chromaId,
      },
    });

    return { ok: true, chromaId, ai: result };
  }
}
