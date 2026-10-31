import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrgRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import {
  CreateQuestionDto,
  CreateQuizDto,
  SubmitAttemptDto,
  UpdateQuizDto,
} from './dto/quiz.dto.js';
import { QuizzesService } from './quizzes.service.js';

@ApiTags('quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateQuizDto) {
    return this.quizzes.create(user, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Patch('questions/:questionId')
  updateQuestion(
    @CurrentUser() user: AuthUser,
    @Param('questionId') questionId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzes.updateQuestion(user, questionId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Delete('questions/:questionId')
  removeQuestion(
    @CurrentUser() user: AuthUser,
    @Param('questionId') questionId: string,
  ) {
    return this.quizzes.removeQuestion(user, questionId);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Get(':id/studio')
  studioGet(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.quizzes.getStudio(user, id);
  }

  @Post(':id/attempts')
  attempt(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.quizzes.submitAttempt(user, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Post(':id/questions')
  addQuestion(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzes.addQuestion(user, id, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.quizzes.getForLearner(user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR, OrgRole.TA)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzes.update(user, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.quizzes.remove(user, id);
  }
}
