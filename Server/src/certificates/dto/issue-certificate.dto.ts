import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}
