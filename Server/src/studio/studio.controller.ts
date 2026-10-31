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
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  ReorderDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateModuleDto,
} from './dto/studio.dto.js';
import { StudioService } from './studio.service.js';

const STUDIO_ROLES = [
  OrgRole.OWNER,
  OrgRole.ADMIN,
  OrgRole.INSTRUCTOR,
] as const;

@ApiTags('studio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STUDIO_ROLES)
@Controller('studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  @Get('courses')
  list(@CurrentUser() user: AuthUser) {
    return this.studio.listCourses(user);
  }

  @Post('courses')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCourseDto) {
    return this.studio.createCourse(user, dto);
  }

  @Get('courses/:id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studio.getCourse(user, id);
  }

  @Patch('courses/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.studio.updateCourse(user, id, dto);
  }

  @Post('courses/:id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studio.publishCourse(user, id);
  }

  @Delete('courses/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studio.deleteCourse(user, id);
  }

  @Post('courses/:id/modules')
  createModule(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.studio.createModule(user, id, dto);
  }

  @Post('courses/:id/modules/reorder')
  reorderModules(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.studio.reorderModules(user, id, dto.orderedIds);
  }

  @Patch('modules/:moduleId')
  updateModule(
    @CurrentUser() user: AuthUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.studio.updateModule(user, moduleId, dto);
  }

  @Delete('modules/:moduleId')
  deleteModule(
    @CurrentUser() user: AuthUser,
    @Param('moduleId') moduleId: string,
  ) {
    return this.studio.deleteModule(user, moduleId);
  }

  @Post('modules/:moduleId/lessons')
  createLesson(
    @CurrentUser() user: AuthUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.studio.createLesson(user, moduleId, dto);
  }

  @Post('modules/:moduleId/lessons/reorder')
  reorderLessons(
    @CurrentUser() user: AuthUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.studio.reorderLessons(user, moduleId, dto.orderedIds);
  }

  @Get('lessons/:lessonId')
  getLesson(
    @CurrentUser() user: AuthUser,
    @Param('lessonId') lessonId: string,
  ) {
    return this.studio.getLesson(user, lessonId);
  }

  @Patch('lessons/:lessonId')
  updateLesson(
    @CurrentUser() user: AuthUser,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.studio.updateLesson(user, lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  deleteLesson(
    @CurrentUser() user: AuthUser,
    @Param('lessonId') lessonId: string,
  ) {
    return this.studio.deleteLesson(user, lessonId);
  }
}
