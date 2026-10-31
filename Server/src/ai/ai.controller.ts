import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrgRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { AiService } from './ai.service.js';
import { IngestDto, QuizGenerateDto, TutorDto } from './dto/ai.dto.js';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('ai/tutor')
  tutor(@CurrentUser() user: AuthUser, @Body() dto: TutorDto) {
    return this.ai.tutor(user, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Post('ai/quiz-generate')
  quizGenerate(@CurrentUser() user: AuthUser, @Body() dto: QuizGenerateDto) {
    return this.ai.quizGenerate(user, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Get('ai/insights/:courseId')
  insights(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
  ) {
    return this.ai.insights(user, courseId);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Post('studio/lessons/:id/ingest')
  ingest(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: IngestDto,
  ) {
    return this.ai.ingestLesson(user, id, dto);
  }
}
