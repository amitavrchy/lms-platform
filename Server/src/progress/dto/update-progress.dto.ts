import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  positionSec?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
