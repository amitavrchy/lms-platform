import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrgRole, Prisma, QuestionType } from '@prisma/client';
import { AccessService } from '../common/services/access.service.js';
import type { AuthUser } from '../common/types/auth.types.js';
import {
  EngagementService,
  XP_QUIZ_PASS,
} from '../engagement/engagement.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateQuestionDto,
  CreateQuizDto,
  SubmitAttemptDto,
  UpdateQuizDto,
} from './dto/quiz.dto.js';

type Option = { id: string; text: string; correct?: boolean };

function stripCorrect(options: unknown): { id: string; text: string }[] {
  const list = (options as Option[]) ?? [];
  return list.map(({ id, text }) => ({ id, text }));
}

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly engagement: EngagementService,
  ) {}

  private assertStudio(user: AuthUser) {
    const allowed: OrgRole[] = [
      OrgRole.OWNER,
      OrgRole.ADMIN,
      OrgRole.INSTRUCTOR,
      OrgRole.TA,
    ];
    if (!allowed.includes(user.role)) {
      throw new ForbiddenException('Studio access required');
    }
  }

  async getForLearner(user: AuthUser, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    await this.access.assertLessonAccess(user, quiz.lessonId);

    return {
      id: quiz.id,
      title: quiz.title,
      passScore: quiz.passScore,
      lessonId: quiz.lessonId,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        promptMd: q.promptMd,
        sortOrder: q.sortOrder,
        options: stripCorrect(q.optionsJson),
      })),
    };
  }

  async submitAttempt(user: AuthUser, quizId: string, dto: SubmitAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        lesson: { include: { module: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.access.assertLessonAccess(user, quiz.lessonId);

    if (!dto.answers || typeof dto.answers !== 'object') {
      throw new BadRequestException('answers required');
    }

    let correctCount = 0;
    const breakdown: {
      questionId: string;
      correct: boolean;
      explanationMd: string | null;
    }[] = [];

    for (const q of quiz.questions) {
      const options = (q.optionsJson as Option[]) ?? [];
      const correctIds = options.filter((o) => o.correct).map((o) => o.id);
      const raw = dto.answers[q.id];
      const given = Array.isArray(raw) ? raw : raw ? [raw] : [];

      let isCorrect = false;
      if (q.type === QuestionType.MULTI) {
        isCorrect =
          correctIds.length === given.length &&
          correctIds.every((id) => given.includes(id));
      } else {
        isCorrect = given.length === 1 && correctIds.includes(given[0]!);
      }

      if (isCorrect) correctCount += 1;
      breakdown.push({
        questionId: q.id,
        correct: isCorrect,
        explanationMd: q.explanationMd,
      });
    }

    const total = quiz.questions.length || 1;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= quiz.passScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score,
        passed,
        answersJson: dto.answers,
      },
    });

    let xp = null;
    if (passed) {
      xp = await this.engagement.awardXp(user.id, XP_QUIZ_PASS, 'quiz_pass');
    }

    return { attempt, score, passed, breakdown, xp };
  }

  async create(user: AuthUser, dto: CreateQuizDto) {
    this.assertStudio(user);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { module: { include: { course: true } }, quiz: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.module.course.organizationId !== user.orgId) {
      throw new ForbiddenException('Cross-org access denied');
    }
    if (lesson.quiz) throw new BadRequestException('Lesson already has a quiz');

    return this.prisma.quiz.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        passScore: dto.passScore ?? 70,
        questions: dto.questions?.length
          ? {
              create: dto.questions.map((q, i) => ({
                type: q.type ?? QuestionType.SINGLE,
                promptMd: q.promptMd,
                optionsJson: q.options as unknown as Prisma.InputJsonValue,
                sortOrder: q.sortOrder ?? i,
                explanationMd: q.explanationMd,
              })),
            }
          : undefined,
      },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async update(user: AuthUser, quizId: string, dto: UpdateQuizDto) {
    this.assertStudio(user);
    const quiz = await this.getStudioQuiz(user, quizId);
    return this.prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.passScore !== undefined ? { passScore: dto.passScore } : {}),
      },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(user: AuthUser, quizId: string) {
    this.assertStudio(user);
    await this.getStudioQuiz(user, quizId);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { deleted: true };
  }

  async addQuestion(user: AuthUser, quizId: string, dto: CreateQuestionDto) {
    this.assertStudio(user);
    await this.getStudioQuiz(user, quizId);
    return this.prisma.question.create({
      data: {
        quizId,
        type: dto.type ?? QuestionType.SINGLE,
        promptMd: dto.promptMd,
        optionsJson: dto.options as unknown as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
        explanationMd: dto.explanationMd,
      },
    });
  }

  async updateQuestion(
    user: AuthUser,
    questionId: string,
    dto: CreateQuestionDto,
  ) {
    this.assertStudio(user);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: { include: { module: { include: { course: true } } } },
          },
        },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (
      question.quiz.lesson.module.course.organizationId !== user.orgId
    ) {
      throw new ForbiddenException('Cross-org access denied');
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        type: dto.type ?? question.type,
        promptMd: dto.promptMd,
        optionsJson: dto.options as unknown as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? question.sortOrder,
        explanationMd: dto.explanationMd,
      },
    });
  }

  async removeQuestion(user: AuthUser, questionId: string) {
    this.assertStudio(user);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: { include: { module: { include: { course: true } } } },
          },
        },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (
      question.quiz.lesson.module.course.organizationId !== user.orgId
    ) {
      throw new ForbiddenException('Cross-org access denied');
    }
    await this.prisma.question.delete({ where: { id: questionId } });
    return { deleted: true };
  }

  async getStudio(user: AuthUser, quizId: string) {
    this.assertStudio(user);
    return this.getStudioQuiz(user, quizId);
  }

  private async getStudioQuiz(user: AuthUser, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.lesson.module.course.organizationId !== user.orgId) {
      throw new ForbiddenException('Cross-org access denied');
    }
    return quiz;
  }
}
