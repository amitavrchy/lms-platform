import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import {
  CreateDiscussionDto,
  CreateDiscussionReplyDto,
  ListDiscussionsDto,
  UpdateDiscussionDto,
} from './dto/discussion.dto.js';
import { DiscussionsService } from './discussions.service.js';

@ApiTags('discussions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DiscussionsController {
  constructor(private readonly discussions: DiscussionsService) {}

  @Get('discussions')
  list(@CurrentUser() user: AuthUser, @Query() query: ListDiscussionsDto) {
    return this.discussions.list(user, query);
  }

  @Post('discussions')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDiscussionDto) {
    return this.discussions.create(user, dto);
  }

  @Get('discussions/:id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.discussions.get(user, id);
  }

  @Post('discussions/:id/replies')
  reply(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateDiscussionReplyDto,
  ) {
    return this.discussions.reply(user, id, dto);
  }

  @Patch('studio/discussions/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDiscussionDto,
  ) {
    return this.discussions.update(user, id, dto);
  }

  @Delete('studio/discussions/:id')
  removeThread(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.discussions.removeThread(user, id);
  }

  @Delete('studio/discussions/:id/replies/:replyId')
  removeReply(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('replyId') replyId: string,
  ) {
    return this.discussions.removeReply(user, id, replyId);
  }
}
