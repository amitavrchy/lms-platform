import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { ProgressService } from './progress.service.js';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get(':lessonId')
  get(@CurrentUser() user: AuthUser, @Param('lessonId') lessonId: string) {
    return this.progress.get(user, lessonId);
  }

  @Patch(':lessonId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.progress.update(user, lessonId, dto);
  }
}
