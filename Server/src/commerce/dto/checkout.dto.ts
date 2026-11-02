import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  courseId!: string;

  @ApiPropertyOptional({
    description:
      'Stripe Price ID. Falls back to STRIPE_PRICE_ID when it is configured.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  priceId?: string;
}
