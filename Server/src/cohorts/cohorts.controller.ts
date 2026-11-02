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
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import {
  CreateCohortDto,
  CreateCohortSessionDto,
  EnrollCohortLearnerDto,
  UpdateCohortDto,
  UpdateCohortSessionDto,
} from './dto/cohort.dto.js';
import { CohortsService } from './cohorts.service.js';

@ApiTags('cohorts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CohortsController {
  constructor(private readonly cohorts: CohortsService) {}

  @Get('cohorts/me')
  mine(@CurrentUser() user: AuthUser) {
    return this.cohorts.listMine(user);
  }

  @Get('studio/cohorts')
  list(@CurrentUser() user: AuthUser) {
    return this.cohorts.listStudio(user);
  }

  @Post('studio/cohorts')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCohortDto) {
    return this.cohorts.create(user, dto);
  }

  @Get('studio/cohorts/:id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cohorts.getStudio(user, id);
  }

  @Patch('studio/cohorts/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCohortDto,
  ) {
    return this.cohorts.update(user, id, dto);
  }

  @Delete('studio/cohorts/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cohorts.remove(user, id);
  }

  @Post('studio/cohorts/:id/sessions')
  createSession(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateCohortSessionDto,
  ) {
    return this.cohorts.createSession(user, id, dto);
  }

  @Patch('studio/cohorts/:id/sessions/:sessionId')
  updateSession(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateCohortSessionDto,
  ) {
    return this.cohorts.updateSession(user, id, sessionId, dto);
  }

  @Delete('studio/cohorts/:id/sessions/:sessionId')
  removeSession(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.cohorts.removeSession(user, id, sessionId);
  }

  @Post('studio/cohorts/:id/enrollments')
  enroll(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: EnrollCohortLearnerDto,
  ) {
    return this.cohorts.enrollLearner(user, id, dto);
  }

  @Get('studio/cohorts/:id/roster')
  roster(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cohorts.roster(user, id);
  }
}
