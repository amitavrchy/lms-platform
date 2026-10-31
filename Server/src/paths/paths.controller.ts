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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrgRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { CreatePathDto, UpdatePathDto } from './dto/path.dto.js';
import { PathsService } from './paths.service.js';

@ApiTags('paths')
@Controller()
export class PathsController {
  constructor(private readonly paths: PathsService) {}

  @Get('paths/:slug')
  @ApiQuery({ name: 'org', required: false })
  getPublic(@Param('slug') slug: string, @Query('org') org?: string) {
    return this.paths.getPublic(slug, org);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Get('studio/paths')
  listStudio(@CurrentUser() user: AuthUser) {
    return this.paths.listStudio(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Post('studio/paths')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePathDto) {
    return this.paths.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Patch('studio/paths/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePathDto,
  ) {
    return this.paths.update(user, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(OrgRole.OWNER, OrgRole.ADMIN, OrgRole.INSTRUCTOR)
  @Delete('studio/paths/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.paths.remove(user, id);
  }
}
