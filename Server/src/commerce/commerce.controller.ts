import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalUser } from '../common/decorators/optional-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import type { AuthUser } from '../common/types/auth.types.js';
import { CommerceService } from './commerce.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';

type StripeRequest = Request & { rawBody?: Buffer };

@ApiTags('commerce')
@Controller()
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  @Get('commerce/courses/:courseId/status')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  courseStatus(
    @Param('courseId') courseId: string,
    @OptionalUser() user?: AuthUser,
  ) {
    return this.commerce.getCourseStatus(courseId, user);
  }

  @Post('commerce/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.commerce.createCheckout(user, dto);
  }

  @Post('commerce/webhook')
  @HttpCode(200)
  webhook(
    @Req() request: StripeRequest,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.commerce.handleWebhook(request.rawBody, signature);
  }

  @Post('commerce/portal')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  portal(@CurrentUser() user: AuthUser) {
    return this.commerce.createPortalSession(user);
  }

  @Get('me/entitlements')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  entitlements(@CurrentUser() user: AuthUser) {
    return this.commerce.listEntitlements(user);
  }
}
