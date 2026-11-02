import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscussionStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class ListDiscussionsDto {
  @ApiProperty()
  @IsString()
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}

export class CreateDiscussionDto {
  @ApiProperty()
  @IsString()
  courseId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  bodyMd!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonId?: string;
}

export class CreateDiscussionReplyDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  bodyMd!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  staffOnly?: boolean;
}

export class UpdateDiscussionDto {
  @ApiPropertyOptional({ enum: DiscussionStatus })
  @IsOptional()
  @IsEnum(DiscussionStatus)
  status?: DiscussionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
