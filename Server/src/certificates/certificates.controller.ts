import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { CertificatesService } from './certificates.service.js';
import { IssueCertificateDto } from './dto/issue-certificate.dto.js';

@ApiTags('certificates')
@Controller()
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('certificates/issue')
  issue(@CurrentUser() user: AuthUser, @Body() dto: IssueCertificateDto) {
    return this.certificates.issueManual(user, dto.courseId, dto.userId);
  }

  @Get('certificates/:code')
  verify(@Param('code') code: string) {
    return this.certificates.verify(code);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/certificates')
  mine(@CurrentUser() user: AuthUser) {
    return this.certificates.listMine(user);
  }
}
