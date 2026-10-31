import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { EnrollDto } from './dto/enroll.dto.js';
import { EnrollmentsService } from './enrollments.service.js';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Post()
  enroll(@CurrentUser() user: AuthUser, @Body() dto: EnrollDto) {
    return this.enrollments.enroll(user, dto.courseId);
  }

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.enrollments.listMine(user);
  }
}
