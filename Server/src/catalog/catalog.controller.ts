import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { CatalogService } from './catalog.service.js';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('courses')
  @ApiQuery({ name: 'org', required: false })
  listCourses(@Query('org') org?: string) {
    return this.catalog.listCourses(org);
  }

  @Get('courses/:slug')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiQuery({ name: 'org', required: false })
  getCourse(
    @Param('slug') slug: string,
    @Query('org') org?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.catalog.getCourseBySlug(slug, org, user ?? undefined);
  }

  @Get('lessons/:lessonId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.getLesson(lessonId, user);
  }

  @Get('paths')
  @ApiQuery({ name: 'org', required: false })
  listPaths(@Query('org') org?: string) {
    return this.catalog.listPaths(org);
  }
}
