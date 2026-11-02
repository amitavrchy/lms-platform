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
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto.js';
import { AnnouncementsService } from './announcements.service.js';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get('announcements')
  list(@CurrentUser() user: AuthUser) {
    return this.announcements.listForLearner(user);
  }

  @Post('announcements/:id/read')
  read(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.announcements.markRead(user, id);
  }

  @Get('studio/announcements')
  listStudio(@CurrentUser() user: AuthUser) {
    return this.announcements.listStudio(user);
  }

  @Get('studio/announcements/:id')
  getStudio(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.announcements.getStudio(user, id);
  }

  @Post('studio/announcements')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcements.create(user, dto);
  }

  @Patch('studio/announcements/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcements.update(user, id, dto);
  }

  @Delete('studio/announcements/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.announcements.remove(user, id);
  }
}
