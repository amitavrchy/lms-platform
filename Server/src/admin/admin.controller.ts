import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrgRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { AdminService } from './admin.service.js';
import {
  AssignEnrollmentsDto,
  UpdateMemberRoleDto,
} from './dto/admin.dto.js';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(OrgRole.OWNER, OrgRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('members')
  members(@CurrentUser() user: AuthUser) {
    return this.admin.listMembers(user);
  }

  @Patch('members/:membershipId/role')
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.admin.updateRole(user, membershipId, dto.role);
  }

  @Post('enrollments/assign')
  assign(
    @CurrentUser() user: AuthUser,
    @Body() dto: AssignEnrollmentsDto,
  ) {
    return this.admin.assignEnrollments(user, dto.courseId, dto.userIds);
  }

  @Get('reports')
  reports(@CurrentUser() user: AuthUser) {
    return this.admin.reports(user);
  }
}
