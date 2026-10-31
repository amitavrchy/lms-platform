import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { EngagementService } from './engagement.service.js';

@ApiTags('engagement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EngagementController {
  constructor(private readonly engagement: EngagementService) {}

  @Get('me/streak')
  getStreak(@CurrentUser() user: AuthUser) {
    return this.engagement.getStreak(user.id);
  }
}
